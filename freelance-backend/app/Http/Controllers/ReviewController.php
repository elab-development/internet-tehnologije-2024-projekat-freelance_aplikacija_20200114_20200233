<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Http\Resources\ReviewResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    /**
     * Kreira recenziju za zahtev.
     */
    public function store(Request $request, $requestId)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'review' => 'required|string',
        ]);

        $review = Review::create([
            'request_id' => $requestId,
            'rating' => $validated['rating'],
            'review' => $validated['review'],
        ]);

        return response()->json([
            'message' => 'Recenzija uspešno kreirana.',
            'review' => new ReviewResource($review),
        ]);
    }

    /**
     * Ažurira recenziju.
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();
        $review = Review::find($id);

        $validated = $request->validate([
            'rating' => 'integer|min:1|max:5',
            'review' => 'string',
        ]);

        $review->update($validated);

        return response()->json([
            'message' => 'Recenzija uspešno ažurirana.',
            'review' => new ReviewResource($review),
        ]);
    }

    /**
     * Briše recenziju.
     */
    public function destroy($id)
    {
        $user = Auth::user();
        $review = Review::find($id);

        $review->delete();

        return response()->json(['message' => 'Recenzija uspešno obrisana.']);
    }
}
