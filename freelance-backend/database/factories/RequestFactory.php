<?php

namespace Database\Factories;

use App\Models\Request;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Request>
 */
class RequestFactory extends Factory
{
    protected $model = Request::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'service_buyer_id' => User::factory(), 
            'project_id' => Project::factory(),   
            'message' => $this->faker->paragraph(2), 
            'status' => $this->faker->randomElement(['obrada']), 
            'price_offer'      => $this->faker->randomFloat(2, 1000, 10000),
        ];
    }

    public function forProject(Project $project): static
    {
        return $this->state(function () use ($project) {
            $min = (float) $project->budget;
            $max = $min * 1.6;
            return [
                'project_id'  => $project->id,
                'price_offer' => $this->faker->randomFloat(2, $min, $max),
            ];
        });
    }
}
