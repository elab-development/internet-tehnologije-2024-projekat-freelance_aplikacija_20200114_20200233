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
        $users = User::where('role', 'kupac')->get();
        $projects = Project::all();

        $users->each(function ($user) use ($projects) {
            Request::factory()->count(3)->create([
                'service_buyer_id' => $user->id,
                'project_id' => $projects->random()->id,
            ]);
        });
    }
}
