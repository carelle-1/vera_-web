<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Log;

class StatsController extends Controller
{
    public function data()
    {
        try {
            // Utilise le client configuré dans config/firebase.php, notamment les
            // options SSL nécessaires à l'environnement XAMPP.
            $database = app('firebase.database');

            // Les inscriptions de la page de connexion sont stockées dans Firebase.
            $users = $database->getReference('users')->getValue();
            $users = is_array($users) ? $users : [];
            $companyCount = 0;

            foreach ($users as $user) {
                if (is_array($user) && strtolower((string) ($user['role'] ?? '')) === 'entreprise') {
                    $companyCount++;
                }
            }

            $ratings = $database->getReference('ratings')->getValue();
            $scores = [];
            foreach (is_array($ratings) ? $ratings : [] as $rating) {
                if (is_array($rating) && is_numeric($rating['score'] ?? null)) {
                    $scores[] = (float) $rating['score'];
                }
            }

            // Une note sur 5 devient un pourcentage ; une note sur 100 est conservée.
            $satisfactionRate = null;
            if ($scores !== []) {
                $average = array_sum($scores) / count($scores);
                $satisfactionRate = (int) round($average <= 5 ? $average * 20 : $average);
            }

            return response()->json([
                'members' => count($users),
                'companies' => $companyCount,
                'satisfaction' => $satisfactionRate,
            ]);
        } catch (\Throwable $e) {
            Log::error('StatsController: Firebase error: ' . $e->getMessage());

            return response()->json(['message' => 'Statistiques indisponibles.'], 503);
        }
    }
}
