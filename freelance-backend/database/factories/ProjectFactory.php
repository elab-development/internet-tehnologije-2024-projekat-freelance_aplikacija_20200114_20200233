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
        $titles = [
            'SEO Optimizacija' => [
                'Poboljšajte rangiranje na pretraživačima',
                'Kompletna SEO analiza',
                'Majstorstvo istraživanja ključnih reči',
                'Plan za optimizaciju na stranici',
                'Napredne strategije za povratne linkove',
            ],
            'Marketing na društvenim mrežama' => [
                'Strategija rasta na Instagramu',
                'Kampanje za angažovanje na Facebooku',
                'Kalendar sadržaja za TikTok',
                'Oglasi na društvenim mrežama koji konvertuju',
                'Plan za rast na više platformi',
            ],
            'Email marketing' => [
                'Prilagođeno kreiranje email toka',
                'Dizajn kampanje za ponovno angažovanje',
                'Automatizacija email marketinga',
                'Strategije rasta biltena',
                'Optimizacija email kampanja',
            ],
            'PPC kampanje (Google Ads, Facebook Ads)' => [
                'Maksimizujte ROI uz Google oglase',
                'Facebook oglasi koji konvertuju',
                'Napredne PPC strategije',
                'Optimizacija budžeta za PPC',
                'Prilagođene kampanje za remarketing',
            ],
            'Strategije content marketinga' => [
                'Strategija sadržaja za brendiranje',
                'Pisanje blogova usmerenih na SEO',
                'Razvoj kalendara sadržaja',
                'Taktike za viralni marketing sadržaja',
                'Pisanje članaka visokog uticaja',
            ],
            'Affiliate marketing' => [
                'Upravljanje mrežom partnera',
                'Strategije partnerstva sa influenserima',
                'Rast kroz affiliate kampanje',
                'Postavljanje praćenja i atribucije',
                'Maksimizacija prihoda uz affiliate',
            ],
            'Influencer marketing' => [
                'Povezivanje sa vrhunskim influenserima',
                'Kampanje za podizanje svesti o brendu',
                'Taktike saradnje sa influenserima',
                'Povećajte prodaju uz sadržaj influensera',
                'Autentična partnerstva na društvenim mrežama',
            ],
        ];

        $category = Category::inRandomOrder()->first();

        $categoryName = $category->name;
        $randomTitle = $this->faker->randomElement($titles[$categoryName] ?? ['Opšti naziv projekta']);

        return [
            'service_seller_id' => User::factory(),
            'category_id' => $category->id,
            'title' => $randomTitle,
            'description' => $this->faker->paragraph(3),
            'budget' => $this->faker->randomFloat(2, 100, 10000),
            'deadline' => $this->faker->dateTimeBetween('now', '+6 months')->format('Y-m-d'),
            'priority' => $this->faker->randomElement(['niski', 'srednji', 'visoki']),
        ];
    }
}
