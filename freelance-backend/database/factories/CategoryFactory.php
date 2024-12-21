<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
{
    protected $model = Category::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $categories = [
            'SEO Optimization',
            'Social Media Marketing',
            'Email Marketing',
            'PPC Campaigns (Google Ads, Facebook Ads)',
            'Content Marketing Strategies',
            'Affiliate Marketing',
            'Influencer Marketing',
        ];

        return [
            'name' => $this->faker->unique()->randomElement($categories), // Assign a random unique name from the array
            'description' => $this->faker->paragraph(2), // Generate a random description
        ];
    }
}
