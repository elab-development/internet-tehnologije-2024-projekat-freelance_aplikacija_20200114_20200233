<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Request as ServiceRequest;
use App\Models\Project;
use App\Http\Resources\ReviewResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    /**
     * List all reviews for a project (only requests with status 'odobren').
     * Returns data + meta.avg_rating (decimal).
     */
    public function indexForProject(Project $project)
    {
        $reviews = Review::query()
            ->with([
                'request.serviceBuyer:id,name', // buyer name
            ])
            ->whereHas('request', function ($q) use ($project) {
                $q->where('project_id', $project->id)
                  ->where('status', 'odobren');
            })
            ->latest('id')
            ->get();

        $avg = round((float) Review::whereHas('request', function ($q) use ($project) {
                    $q->where('project_id', $project->id)
                      ->where('status', 'odobren');
                })->avg('rating'), 2);

        return response()->json([
            'data' => $reviews->map(function ($r) {
                return [
                    'id'         => $r->id,
                    'request_id' => $r->request_id,
                    'rating'     => (int) $r->rating,
                    'review'     => $r->review,
                    'created_at' => optional($r->created_at)->toDateTimeString(),
                    'buyer'      => [
                        'id'   => optional($r->request)->service_buyer_id,
                        'name' => optional(optional($r->request)->serviceBuyer)->name,
                    ],
                ];
            }),
            'meta' => [
                'avg_rating' => $avg, // decimal ready
                'count'      => $reviews->count(),
            ],
        ]);
    }

    /**
     * Create a review for a request (only by the buyer; request must be 'odobren').
     */
    public function store(Request $request, $requestId)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'review' => 'required|string',
        ]);

        $req = ServiceRequest::with('review')->findOrFail($requestId);

        // Only the buyer who owns the request
        if ($req->service_buyer_id !== $user->id) {
            return response()->json(['error' => 'Nemate dozvolu za ovu recenziju.'], 403);
        }

        // Request must be approved
        if ($req->status !== 'odobren') {
            return response()->json(['error' => 'Recenzije su dozvoljene samo za odobrene zahteve.'], 422);
        }

        // Only one review per request
        if ($req->review) {
            return response()->json(['error' => 'Recenzija već postoji za ovaj zahtev.'], 422);
        }

        $review = Review::create([
            'request_id' => $req->id,
            'rating'     => $validated['rating'],
            'review'     => $validated['review'],
        ]);

        return response()->json([
            'message' => 'Recenzija uspešno kreirana.',
            'review'  => new ReviewResource($review),
        ], 201);
    }

    /**
     * Update a review (only the buyer who owns the underlying request).
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();
        $review = Review::with('request')->findOrFail($id);

        if (optional($review->request)->service_buyer_id !== $user->id) {
            return response()->json(['error' => 'Nemate dozvolu za ovu recenziju.'], 403);
        }

        $validated = $request->validate([
            'rating' => 'integer|min:1|max:5',
            'review' => 'string',
        ]);

        $review->update($validated);

        return response()->json([
            'message' => 'Recenzija uspešno ažurirana.',
            'review'  => new ReviewResource($review),
        ]);
    }

    /**
     * Delete a review (only the buyer who owns the underlying request).
     */
    public function destroy($id)
    {
        $user = Auth::user();
        $review = Review::with('request')->findOrFail($id);

        if (optional($review->request)->service_buyer_id !== $user->id) {
            return response()->json(['error' => 'Nemate dozvolu da obrišete ovu recenziju.'], 403);
        }

        $review->delete();

        return response()->json(['message' => 'Recenzija uspešno obrisana.']);
    }
}
