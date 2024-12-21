<?php

namespace Database\Seeders;

use App\Models\Review;
use App\Models\Request;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all requests
        $requests = Request::all();

        // Assign reviews to a subset of the requests
        $requests->each(function ($request) {
            if (rand(0, 1)) { // Randomly decide whether to assign a review
                Review::factory()->create([
                    'request_id' => $request->id,
                ]);
            }
        });
    }
}
