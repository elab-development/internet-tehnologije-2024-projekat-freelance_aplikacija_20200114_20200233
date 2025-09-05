<?php

namespace Database\Factories;

use App\Models\Request;
use App\Models\Review;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Review>
 */
class ReviewFactory extends Factory
{
    protected $model = Review::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'request_id' => Request::factory(), 
            'rating' => $this->faker->numberBetween(1, 5),
            'review' => $this->faker->paragraph(2), 
        ];
    }
}
