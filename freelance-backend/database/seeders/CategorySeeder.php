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
            ['name' => 'SEO Optimizacija', 'description' => 'Optimizujte svoj sajt za pretraživače.'],
            ['name' => 'Marketing na društvenim mrežama', 'description' => 'Povećajte prisustvo na društvenim mrežama.'],
            ['name' => 'Email marketing', 'description' => 'Dizajnirajte i isporučite efikasne email kampanje.'],
            ['name' => 'PPC kampanje (Google Ads, Facebook Ads)', 'description' => 'Upravljajte PPC reklamnim kampanjama.'],
            ['name' => 'Strategije content marketinga', 'description' => 'Razvijte strategije sadržaja za jačanje brenda.'],
            ['name' => 'Affiliate marketing', 'description' => 'Postavite i optimizujte affiliate programe.'],
            ['name' => 'Influencer marketing', 'description' => 'Iskoristite influensere za promociju vašeg brenda.'],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                ['name' => $category['name']],
                ['description' => $category['description']]
            );
        }
    }
}

