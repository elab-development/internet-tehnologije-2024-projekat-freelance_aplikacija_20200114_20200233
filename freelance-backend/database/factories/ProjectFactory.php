<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

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
        // Define titles for each category
        $titles = [
            'SEO Optimization' => [
                'Boost Your Website Rankings',
                'Complete SEO Audit Service',
                'Keyword Research Mastery',
                'On-Page Optimization Plan',
                'Advanced Backlink Strategies',
            ],
            'Social Media Marketing' => [
                'Instagram Growth Strategy',
                'Facebook Engagement Campaigns',
                'TikTok Content Calendar',
                'Social Media Ads That Convert',
                'Multi-Platform Social Growth Plan',
            ],
            'Email Marketing' => [
                'Custom Email Funnel Creation',
                'Re-Engagement Campaign Design',
                'Automated Email Marketing Setup',
                'Newsletter Growth Strategies',
                'Email Campaign Optimization',
            ],
            'PPC Campaigns (Google Ads, Facebook Ads)' => [
                'Maximize ROI with Google Ads',
                'Facebook Ads That Convert Leads',
                'Advanced PPC Strategies',
                'Budget Optimization for PPC',
                'Custom Retargeting Campaigns',
            ],
            'Content Marketing Strategies' => [
                'Content Strategy for Branding',
                'SEO-Driven Blog Writing Service',
                'Content Calendar Development',
                'Viral Content Marketing Tactics',
                'High-Impact Article Writing',
            ],
            'Affiliate Marketing' => [
                'Affiliate Network Management',
                'Influencer Partnership Strategies',
                'Growth Through Affiliate Campaigns',
                'Tracking and Attribution Setup',
                'Revenue Maximization with Affiliates',
            ],
            'Influencer Marketing' => [
                'Connect with Top Influencers',
                'Brand Awareness Campaigns',
                'Influencer Collaboration Tactics',
                'Boost Sales with Influencer Content',
                'Authentic Social Media Partnerships',
            ],
        ];

        $category = Category::inRandomOrder()->first();

        $categoryName = $category->name;
        $randomTitle = $this->faker->randomElement($titles[$categoryName] ?? ['General Project Title']);

        return [
            'service_seller_id' => User::factory(),
            'category_id' => $category->id,
            'title' => $randomTitle,
            'description' => $this->faker->paragraph(3),
            'budget' => $this->faker->randomFloat(2, 100, 10000),
            'deadline' => $this->faker->dateTimeBetween('now', '+6 months')->format('Y-m-d'),
            'priority' => $this->faker->randomElement(['low', 'medium', 'high']),
        ];
    }
}
