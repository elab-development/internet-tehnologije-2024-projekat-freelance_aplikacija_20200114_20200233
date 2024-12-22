<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::where('role', 'ponudjac')->get();

        $users->each(function ($user) {
            Project::factory()->count(2)->create([
                'service_seller_id' => $user->id, 
            ]);
        });
    }
}
