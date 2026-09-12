<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\HomeText;

class HomeTextSeeder extends Seeder
{
    public function run(): void
    {
        $texts = [
            'hero_title' => "Trouvez votre prochaine opportunité.",
            'hero_subtitle' => "VERA analyse ton profil et trouve les opportunités adaptées à ton profil pour booster ta carrière 24h/24, 7j/7 .",
            'feature_1' => "Des offres qui correspondent vraiment à ton profil",
            'feature_2' => "Les offres d'emploi boostées automatiquement par l'IA",
            'feature_3' => "Un coaching carrière personnalisé",
        ];

        foreach ($texts as $key => $value) {
            HomeText::updateOrCreate(['key' => $key], ['value' => $value]);
        }
    }
}
