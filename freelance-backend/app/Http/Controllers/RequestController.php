<?php

namespace App\Http\Controllers;

use App\Models\Request as ServiceRequest;
use App\Http\Resources\RequestResource;
use Illuminate\Http\Request as HttpRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\Project;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;

class RequestController extends Controller
{
    /**
     * Kreira novi zahtev za određeni projekat.
     */
    public function store(HttpRequest $request, $projectId)
    {
        $user = Auth::user();
        if ($user->role !== 'kupac') {
            return response()->json(['error' => 'Samo kupac može napraviti zahtev.'], 403);
        }

        $project = Project::findOrFail($projectId);
        if ($project->is_locked) {
            return response()->json(['error' => 'Ovaj projekat je zaključan (već ima odobren zahtev).'], 422);
        }

        $data = $request->validate([
            'message'     => ['required', 'string', 'max:2000'],
            'price_offer' => ['required', 'numeric', 'min:0'],
        ]);

        $minBudget = (float) $project->budget;
        if ((float)$data['price_offer'] < $minBudget) {
            return response()->json([
                'error' => "Ponuda mora biti jednaka ili veća od budžeta ({$minBudget})."
            ], 422);
        }

        $created = ServiceRequest::create([
            'service_buyer_id' => $user->id,
            'project_id'       => $project->id,
            'message'          => $data['message'],
            'price_offer'      => $data['price_offer'],
            'status'           => 'obrada',
        ]);

        return response()->json(['data' => $created->fresh()], 201);
    }
    /**
     * Ažurira sve informacije o zahtevu osim `service_buyer_id`.
     */
    public function update(HttpRequest $request, $id)
    {
        $user = Auth::user();
        $req = ServiceRequest::find($id);

        if (!$req || $req->service_buyer_id !== $user->id) {
            return response()->json(['error' => 'Nemate dozvolu da ažurirate ovaj zahtev.'], 403);
        }

        $validated = $request->validate([
            'message' => 'string',
        ]);

        $req->update($validated);
        $req->load('review'); // Load the review relationship

        return response()->json([
            'message' => 'Zahtev uspešno ažuriran.',
            'request' => new RequestResource($req),
        ]);
    }

    /**
     * Ažurira samo status zahteva.
     */
    public function updateStatus(HttpRequest $request, $id)
    {
        $user = Auth::user();
        if ($user->role !== 'ponudjac') {
            return response()->json(['error' => 'Samo ponuđač može menjati status.'], 403);
        }

        $data = $request->validate([
            'status' => ['required', 'in:odobren,odbijen'],
        ]);

        $req = ServiceRequest::with('project')->findOrFail($id);
        $project = $req->project;

        if ($project->service_seller_id !== $user->id) {
            return response()->json(['error' => 'Nemate pravo na ovaj projekat.'], 403);
        }

        // If already locked and trying to approve another, block:
        if ($project->is_locked && $data['status'] === 'odobren' && $req->status !== 'odobren') {
            return response()->json(['error' => 'Projekat je već zaključan drugim odobrenim zahtevom.'], 422);
        }

        DB::transaction(function() use ($data, $req, $project) {
            if ($data['status'] === 'odobren') {
                // Approve this one
                $req->update(['status' => 'odobren', 'decided_at' => now()]);
                // Reject others
                ServiceRequest::where('project_id', $project->id)
                    ->where('id', '!=', $req->id)
                    ->where('status', '!=', 'odbijen')
                    ->update(['status' => 'odbijen', 'decided_at' => now()]);
                // Lock project
                $project->update(['is_locked' => true, 'locked_at' => now()]);
            } else {
                // Just reject this one
                $req->update(['status' => 'odbijen', 'decided_at' => now()]);
            }
        });

        return response()->json(['data' => $req->fresh('project')]);
    }

    /**
     * Briše zahtev.
     */
    public function destroy($id)
    {
        $user = Auth::user();
        $req = ServiceRequest::find($id);

        if (!$req || $req->service_buyer_id !== $user->id) {
            return response()->json(['error' => 'Nemate dozvolu da obrišete ovaj zahtev.'], 403);
        }

        $req->delete();

        return response()->json(['message' => 'Zahtev uspešno obrisan.']);
    }

    public function indexForSeller(HttpRequest $request)
    {
        $user = Auth::user();
        if ($user->role !== 'ponudjac') {
            return response()->json(['error' => 'Samo ponuđač ima uvid.'], 403);
        }

        $query = ServiceRequest::query()
            ->with([
                'project:id,title,service_seller_id,budget,is_locked',
                'serviceBuyer:id,name'
            ])
            ->whereHas('project', fn($q) => $q->where('service_seller_id', $user->id))
            ->latest('id');

        if ($request->filled('project_id')) {
            $query->where('project_id', $request->integer('project_id'));
        }

        return response()->json(['data' => $query->get()]);
    }

    /**
     * Return all requests for a given project, ordered by highest offer first,
     * plus meta with highest bid and bidder.
     *
     * GET /api/kupac/projekti/{project}/requests
     */
    public function indexForProject(Project $project)
    {
        // Optional role check (keep if you only want buyers to hit this)
        $user = Auth::user();
        if ($user && $user->role !== 'kupac') {
            // You can also allow both roles by removing this block.
            // For now, buyers only:
            return response()->json(['error' => 'Samo kupac može videti licitacije.'], 403);
        }

        // Load requests with buyer name + a bit of project info needed on FE
        $requests = ServiceRequest::query()
            ->with([
                'serviceBuyer:id,name',
                'project:id,title,budget,is_locked',
            ])
            ->where('project_id', $project->id)
            ->orderByDesc('price_offer')
            ->get([
                'id',
                'service_buyer_id',
                'project_id',
                'message',
                'price_offer',
                'status',
                'created_at',
            ]);

        if ($requests->isEmpty()) {
            // 204 No Content is fine; FE already handles this
            return response()->noContent();
        }

        $top = $requests->first(); // ordered desc by price_offer

        return response()->json([
            'data' => $requests->map(function ($r) {
                return [
                    'id'             => $r->id,
                    'project_id'     => $r->project_id,
                    'message'        => $r->message,
                    'price_offer'    => (float) $r->price_offer,
                    'status'         => $r->status,
                    'created_at'     => optional($r->created_at)->toDateTimeString(),
                    'service_buyer'  => [
                        'id'   => $r->service_buyer_id,
                        'name' => optional($r->serviceBuyer)->name,
                    ],
                    'project' => [
                        'id'       => $r->project->id ?? null,
                        'title'    => $r->project->title ?? null,
                        'budget'   => isset($r->project->budget) ? (float) $r->project->budget : null,
                        'is_locked'=> (bool) ($r->project->is_locked ?? false),
                    ],
                ];
            }),
            'meta' => [
                'count'          => $requests->count(),
                'highest_bid'    => (float) $top->price_offer,
                'highest_bidder' => [
                    'id'   => $top->service_buyer_id,
                    'name' => optional($top->serviceBuyer)->name,
                ],
            ],
        ]);
    }

    public function indexForBuyer(HttpRequest $request)
    {
        $user = Auth::user();
        if ($user->role !== 'kupac') {
            return response()->json(['error' => 'Samo kupac ima uvid u svoje zahteve.'], 403);
        }

        $requests = ServiceRequest::query()
            ->with([
                'project:id,title,budget,is_locked',
                'review:id,request_id,rating,review,created_at', // <-- include review
            ])
            ->where('service_buyer_id', $user->id)
            ->latest('id')
            ->get([
                'id','service_buyer_id','project_id','message','price_offer','status','created_at',
            ]);

        return response()->json([
            'data' => $requests->map(function ($r) {
                return [
                    'id'          => $r->id,
                    'project_id'  => $r->project_id,
                    'message'     => $r->message,
                    'price_offer' => (float) $r->price_offer,
                    'status'      => $r->status,
                    'created_at'  => optional($r->created_at)->toDateTimeString(),
                    'project'     => [
                        'id'        => $r->project->id ?? null,
                        'title'     => $r->project->title ?? null,
                        'budget'    => isset($r->project->budget) ? (float) $r->project->budget : null,
                        'is_locked' => (bool) ($r->project->is_locked ?? false),
                    ],
                    'review' => $r->review ? [
                        'id'         => $r->review->id,
                        'rating'     => (int) $r->review->rating,
                        'review'     => $r->review->review,
                        'created_at' => optional($r->review->created_at)->toDateTimeString(),
                    ] : null,
                ];
            }),
        ]);
    }

    /**
     * Statistika zahteva za ulogovanog ponuđača.
     * Query parametri (opciono):
     * - group_by: "day" | "month" (default: day)
     * - days: int (default: 30)  // koristi se ako date_from nije zadat
     * - date_from: Y-m-d
     * - date_to:   Y-m-d
     * - project_id: int (filter po projektu)
     *
     * Response:
     * {
     *   data: {
     *     series: [{ bucket, ukupno, obrada, odobren, odbijen, avg_offer, avg_budget }, ...],
     *     by_project: [{ project_id, title, ukupno, obrada, odobren, odbijen }, ...]
     *   },
     *   meta: { date_from, date_to, group_by, total, approved, approval_rate }
     * }
     */
    public function statsForSeller(HttpRequest $request)
    {
        $user = Auth::user();
        if ($user->role !== 'ponudjac') {
            return response()->json(['error' => 'Samo ponuđač ima uvid u statistiku.'], 403);
        }

        $groupBy   = $request->query('group_by', 'day');
        $projectId = $request->integer('project_id');
        $days      = (int) $request->query('days', 30);

        $dateTo   = $request->query('date_to')   ? Carbon::parse($request->query('date_to'))->endOfDay() : Carbon::now()->endOfDay();
        $dateFrom = $request->query('date_from') ? Carbon::parse($request->query('date_from'))->startOfDay() : (clone $dateTo)->subDays(max($days,1)-1)->startOfDay();

        // Osnovni upit (samo projekti ovog ponuđača)
        $base = ServiceRequest::query()
            ->whereBetween('requests.created_at', [$dateFrom, $dateTo])
            ->whereHas('project', fn($q) => $q->where('service_seller_id', $user->id));

        if ($projectId) {
            $base->where('project_id', $projectId);
        }

        // Grupisanje po danu/mesecu
        $bucketExpr = $groupBy === 'month'
            ? "DATE_FORMAT(requests.created_at, '%Y-%m-01')" // MySQL
            : "DATE(requests.created_at)";                   // dnevno

        // Serije za grafik
        $series = (clone $base)
            ->leftJoin('projects', 'requests.project_id', '=', 'projects.id')
            ->selectRaw("$bucketExpr as bucket")
            ->selectRaw("COUNT(*) as ukupno")
            ->selectRaw("SUM(CASE WHEN requests.status = 'obrada' THEN 1 ELSE 0 END) as obrada")
            ->selectRaw("SUM(CASE WHEN requests.status = 'odobren' THEN 1 ELSE 0 END) as odobren")
            ->selectRaw("SUM(CASE WHEN requests.status = 'odbijen' THEN 1 ELSE 0 END) as odbijen")
            ->selectRaw("AVG(requests.price_offer) as avg_offer")
            ->selectRaw("AVG(projects.budget) as avg_budget")
            ->groupBy('bucket')
            ->orderBy('bucket')
            ->get();

        // Rezime po projektu
        $byProject = (clone $base)
            ->leftJoin('projects', 'requests.project_id', '=', 'projects.id')
            ->selectRaw('requests.project_id, projects.title')
            ->selectRaw('COUNT(*) as ukupno')
            ->selectRaw("SUM(CASE WHEN requests.status = 'obrada' THEN 1 ELSE 0 END) as obrada")
            ->selectRaw("SUM(CASE WHEN requests.status = 'odobren' THEN 1 ELSE 0 END) as odobren")
            ->selectRaw("SUM(CASE WHEN requests.status = 'odbijen' THEN 1 ELSE 0 END) as odbijen")
            ->groupBy('requests.project_id', 'projects.title')
            ->orderByDesc('ukupno')
            ->get();

        // Meta
        $total    = (clone $base)->count();
        $approved = (clone $base)->where('status', 'odobren')->count();
        $approvalRate = $total > 0 ? round($approved * 100 / $total, 2) : 0.0;

        return response()->json([
            'data' => [
                'series' => $series->map(fn($r) => [
                    'bucket'     => $r->bucket,
                    'ukupno'     => (int) $r->ukupno,
                    'obrada'     => (int) $r->obrada,
                    'odobren'    => (int) $r->odobren,
                    'odbijen'    => (int) $r->odbijen,
                    'avg_offer'  => $r->avg_offer !== null  ? round((float)$r->avg_offer, 2)  : null,
                    'avg_budget' => $r->avg_budget !== null ? round((float)$r->avg_budget, 2) : null,
                ]),
                'by_project' => $byProject->map(fn($r) => [
                    'project_id' => (int) $r->project_id,
                    'title'      => $r->title,
                    'ukupno'     => (int) $r->ukupno,
                    'obrada'     => (int) $r->obrada,
                    'odobren'    => (int) $r->odobren,
                    'odbijen'    => (int) $r->odbijen,
                ]),
            ],
            'meta' => [
                'date_from'     => $dateFrom->toDateString(),
                'date_to'       => $dateTo->toDateString(),
                'group_by'      => $groupBy,
                'total'         => $total,
                'approved'      => $approved,
                'approval_rate' => $approvalRate,
                'project_id'    => $projectId,
            ],
        ]);
    }

    /**
     * Export all seller's requests to PDF.
     * Optional query params: ?status=obrada|odobren|odbijen&date_from=YYYY-MM-DD&date_to=YYYY-MM-DD
     */
    public function exportPdf(HttpRequest $request)
    {
        $user = Auth::user();
        if ($user->role !== 'ponudjac') {
            return response()->json(['error' => 'Samo ponuđač može izvesti zahteve.'], 403);
        }

        $status    = $request->query('status'); // optional
        $dateFrom  = $request->query('date_from') ? Carbon::parse($request->query('date_from'))->startOfDay() : null;
        $dateTo    = $request->query('date_to')   ? Carbon::parse($request->query('date_to'))->endOfDay()   : null;

        $rows = ServiceRequest::query()
            ->with([
                'project:id,title,budget,service_seller_id',
                'serviceBuyer:id,name',
            ])
            ->whereHas('project', fn($q) => $q->where('service_seller_id', $user->id))
            ->when($status, fn($q) => $q->where('status', $status))
            ->when($dateFrom && $dateTo, fn($q) => $q->whereBetween('created_at', [$dateFrom, $dateTo]))
            ->orderByDesc('id')
            ->get([
                'id','project_id','service_buyer_id','message','price_offer','status','created_at'
            ]);

        $period = $dateFrom && $dateTo
            ? $dateFrom->toDateString() . ' – ' . $dateTo->toDateString()
            : 'Svi zapisi';

        $pdf = Pdf::loadView('pdf.requests', [
            'rows'   => $rows,
            'seller' => $user,
            'period' => $period,
        ])->setPaper('a4', 'landscape');

        // download filename:
        $filename = 'zahtevi_' . now()->format('Ymd_His') . '.pdf';
        return $pdf->download($filename);
    }

}
