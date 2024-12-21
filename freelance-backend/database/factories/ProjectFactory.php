<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Project>
 */
class ProjectFactory extends Factory
{
    protected $model = Project::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'service_seller_id' => User::factory(), 
            'category_id' => Category::factory(),  
            'title' => $this->faker->sentence(5), 
            'description' => $this->faker->paragraph(3), 
            'budget' => $this->faker->randomFloat(2, 100, 10000), 
            'deadline' => $this->faker->dateTimeBetween('now', '+6 months')->format('Y-m-d'), 
            'priority' => $this->faker->randomElement(['low', 'medium', 'high']), 
        ];
    }
}
