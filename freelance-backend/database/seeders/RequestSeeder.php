<?php

namespace Database\Seeders;

use App\Models\Request;
use App\Models\User;
use App\Models\Project;
use Illuminate\Database\Seeder;

class RequestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all users and projects
        $users = User::where('role', 'normal')->get();
        $projects = Project::all();

        // Assign each user to some requests on random projects
        $users->each(function ($user) use ($projects) {
            Request::factory()->count(3)->create([
                'service_buyer_id' => $user->id,
                'project_id' => $projects->random()->id,
            ]);
        });
    }
}
