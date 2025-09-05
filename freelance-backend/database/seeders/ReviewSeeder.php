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
        $requests = Request::all();

        $requests->each(function ($request) {
            if (rand(0, 1)) { 
                Review::factory()->create([
                    'request_id' => $request->id,
                ]);
            }
        });
    }
}
