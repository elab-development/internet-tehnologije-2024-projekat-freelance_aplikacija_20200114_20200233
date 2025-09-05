<?php

namespace Database\Seeders;

use App\Models\Request as ServiceRequest;
use Illuminate\Support\Facades\DB;
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
        $buyers = User::where('role','kupac')->get();
        $projects = Project::with('serviceSeller')->get();

        foreach ($buyers as $buyer) {
            // Pick some projects not owned by this buyer (buyer != seller)
            $sample = $projects->where('service_seller_id', '!=', $buyer->id)->random(min(3, $projects->count()));

            foreach ($sample as $project) {
                $min = (float) $project->budget;
                $offer = fake()->randomFloat(2, $min, $min * 1.5); // ensure ≥ budget

                ServiceRequest::create([
                    'service_buyer_id' => $buyer->id,
                    'project_id'       => $project->id,
                    'message'          => fake()->sentence(12),
                    'price_offer'      => $offer,
                    'status'           => 'obrada',
                ]);
            }
        }

        // Optionally mark a few projects as approved to test locking:
        Project::inRandomOrder()->take(3)->each(function(Project $p){
            $req = ServiceRequest::where('project_id', $p->id)->inRandomOrder()->first();
            if (!$req) return;

            DB::transaction(function () use ($req, $p) {
                $req->update(['status' => 'odobren', 'decided_at' => now()]);
                ServiceRequest::where('project_id', $p->id)
                    ->where('id', '!=', $req->id)
                    ->where('status', '!=', 'odbijen')
                    ->update(['status' => 'odbijen', 'decided_at' => now()]);
                $p->update(['is_locked' => true, 'locked_at' => now()]);
            });
        });
    }

}
