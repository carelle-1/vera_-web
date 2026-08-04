<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\User;

class StatsController extends Controller
{
    public function data()
    {
        $userCount = User::count();

        $companyCount = 0;
        $satisfactionRate = 92;

        try {
            $credentialsPath = base_path('storage/app/firebase/vera-firebase.json');
            $databaseUrl = env('FIREBASE_DATABASE_URL');
            $storageBucket = env('FIREBASE_STORAGE_DEFAULT_BUCKET');

            if (file_exists($credentialsPath) && $databaseUrl && $storageBucket) {
                $firebase = (new \Kreait\Firebase\Factory)
                    ->withServiceAccount($credentialsPath)
                    ->withDatabaseUri($databaseUrl)
                    ->withProjectId('vera-1bd37');

                $database = $firebase->createDatabase();

                $companiesSnapshot = $database->getReference('companies')->getValue();
                if (is_array($companiesSnapshot)) {
                    $companyCount = count($companiesSnapshot);
                }

                $ratingsSnapshot = $database->getReference('ratings')->getValue();
                if (is_array($ratingsSnapshot) && count($ratingsSnapshot) > 0) {
                    $total = 0;
                    $sum = 0;
                    foreach ($ratingsSnapshot as $rating) {
                        if (isset($rating['score'])) {
                            $sum += (int) $rating['score'];
                            $total++;
                        }
                    }
                    if ($total > 0) {
                        $satisfactionRate = round(($sum / $total) * 100);
                    }
                }
            }
        } catch (\Exception $e) {
            \Log::error('StatsController: Firebase error: ' . $e->getMessage());
        }

        return response()->json([
            'members' => $userCount,
            'companies' => $companyCount,
            'satisfaction' => $satisfactionRate,
        ]);
    }
}