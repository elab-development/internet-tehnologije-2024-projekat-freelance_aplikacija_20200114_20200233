<?php

namespace App\Http\Controllers;

use App\Models\Request;
use App\Http\Resources\RequestResource;
use Illuminate\Http\Request as HttpRequest;
use Illuminate\Support\Facades\Auth;

class RequestController extends Controller
{
    /**
     * Kreira novi zahtev za određeni projekat.
     */
    public function store(HttpRequest $request, $projectId)
    {
        $user = Auth::user();

        if ($user->role !== 'kupac') {
            return response()->json(['error' => 'Samo kupci mogu da kreiraju zahteve.'], 403);
        }

        $validated = $request->validate([
            'message' => 'required|string',
        ]);

        $newRequest = Request::create([
            'service_buyer_id' => $user->id,
            'project_id' => $projectId,
            'message' => $validated['message'],
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Zahtev uspešno kreiran.',
            'request' => new RequestResource($newRequest),
        ]);
    }

    /**
     * Ažurira sve informacije o zahtevu osim `service_buyer_id`.
     */
    public function update(HttpRequest $request, $id)
    {
        $user = Auth::user();
        $req = Request::find($id);

        if (!$req || $req->service_buyer_id !== $user->id) {
            return response()->json(['error' => 'Nemate dozvolu da ažurirate ovaj zahtev.'], 403);
        }

        $validated = $request->validate([
            'message' => 'string',
            'status' => 'in:pending,approved,rejected',
        ]);

        $req->update($validated);

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
        $req = Request::find($id);

        if (!$req || $req->service_buyer_id !== $user->id) {
            return response()->json(['error' => 'Nemate dozvolu da ažurirate status ovog zahteva.'], 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:pending,approved,rejected',
        ]);

        $req->update(['status' => $validated['status']]);

        return response()->json([
            'message' => 'Status zahteva uspešno ažuriran.',
            'request' => new RequestResource($req),
        ]);
    }

    /**
     * Briše zahtev.
     */
    public function destroy($id)
    {
        $user = Auth::user();
        $req = Request::find($id);

        if (!$req || $req->service_buyer_id !== $user->id) {
            return response()->json(['error' => 'Nemate dozvolu da obrišete ovaj zahtev.'], 403);
        }

        $req->delete();

        return response()->json(['message' => 'Zahtev uspešno obrisan.']);
    }
}
