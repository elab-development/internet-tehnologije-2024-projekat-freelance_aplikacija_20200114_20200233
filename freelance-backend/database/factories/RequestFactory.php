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
            'status' => $this->faker->randomElement(['pending', 'approved', 'rejected']), 
        ];
    }
}
