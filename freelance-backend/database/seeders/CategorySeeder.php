<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'SEO Optimization', 'description' => 'Optimize your website for search engines.'],
            ['name' => 'Social Media Marketing', 'description' => 'Grow your presence on social media platforms.'],
            ['name' => 'Email Marketing', 'description' => 'Design and deliver effective email campaigns.'],
            ['name' => 'PPC Campaigns (Google Ads, Facebook Ads)', 'description' => 'Manage pay-per-click advertising campaigns.'],
            ['name' => 'Content Marketing Strategies', 'description' => 'Develop content strategies to boost your brand.'],
            ['name' => 'Affiliate Marketing', 'description' => 'Set up and optimize affiliate marketing programs.'],
            ['name' => 'Influencer Marketing', 'description' => 'Leverage influencers to promote your brand.'],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                ['name' => $category['name']],
                ['description' => $category['description']]
            );
        }
    }
}
