<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\ApplyMail;
use Kreait\Firebase\Auth;

class ApplyEmailController extends Controller
{
    protected $auth;

    public function __construct()
    {
        $credentialsPath = base_path('storage/app/firebase/vera-firebase.json');

        if (!file_exists($credentialsPath)) {
            \Log::error("Firebase credentials file not found at: " . $credentialsPath);
            throw new \Exception("Firebase credentials file not found at: " . $credentialsPath);
        }

        $databaseUrl = env('FIREBASE_DATABASE_URL');
        $storageBucket = env('FIREBASE_STORAGE_DEFAULT_BUCKET');

        if (!$databaseUrl || !$storageBucket) {
            \Log::error("Firebase configuration missing. Check FIREBASE_DATABASE_URL and FIREBASE_STORAGE_DEFAULT_BUCKET in .env");
            throw new \Exception("Firebase configuration missing. Check FIREBASE_DATABASE_URL and FIREBASE_STORAGE_DEFAULT_BUCKET in .env");
        }

        try {
            $firebase = (new \Kreait\Firebase\Factory)
                ->withServiceAccount($credentialsPath)
                ->withDatabaseUri($databaseUrl)
                ->withProjectId('vera-1bd37');

            $this->auth = $firebase->createAuth();
        } catch (\Exception $e) {
            \Log::error("Firebase initialization error: " . $e->getMessage());
            throw $e;
        }
    }

    public function send(Request $request)
    {
        $request->validate([
            'apply_email' => 'required|email',
            'cv_file' => 'required|string',
            'cover_letter_file' => 'required|string',
            'cv_file_name' => 'required|string',
            'cover_letter_file_name' => 'required|string',
            'user_name' => 'required|string|max:255',
            'job_title' => 'required|string|max:255',
            'company' => 'nullable|string|max:255',
            'user_id' => 'nullable|string|max:255',
        ]);

        $cvPath = null;
        $letterPath = null;

        try {
            $cvBase64 = $this->extractBase64($request->input('cv_file'));
            $letterBase64 = $this->extractBase64($request->input('cover_letter_file'));

            $uploadsDir = storage_path('app/tmp/applications');
            if (!is_dir($uploadsDir)) {
                @mkdir($uploadsDir, 0755, true);
            }

            $cvPath = $uploadsDir . '/' . basename($request->input('cv_file_name'));
            $letterPath = $uploadsDir . '/' . basename($request->input('cover_letter_file_name'));

            file_put_contents($cvPath, base64_decode($cvBase64));
            file_put_contents($letterPath, base64_decode($letterBase64));

            Mail::to($request->input('apply_email'))
                ->send(new ApplyMail(
                    $request->input('user_name'),
                    $request->input('job_title'),
                    $request->input('company', ''),
                    $request->input('apply_email'),
                    $cvPath,
                    $letterPath
                ));

            @unlink($cvPath);
            @unlink($letterPath);

            $uid = $request->input('user_id');
            if ($uid) {
                $this->createApplicationNotification($uid, $request->input('job_title'), $request->input('company', ''));
            }

            return response()->json([
                'success' => true,
                'message' => 'Candidature envoyée avec succès.',
            ]);
        } catch (\Exception $e) {
            \Log::error('Send application email failed', [
                'error' => $e->getMessage(),
            ]);

            if ($cvPath && file_exists($cvPath)) {
                @unlink($cvPath);
            }
            if ($letterPath && file_exists($letterPath)) {
                @unlink($letterPath);
            }

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'envoi de la candidature: ' . $e->getMessage(),
            ], 500);
        }
    }

    private function createApplicationNotification(string $uid, string $jobTitle, string $company): void
    {
        try {
            $db = app('firebase.database');
            
            $now = new \DateTime();
            $timeStr = $now->format('H:i');
            $dateStr = $now->format('Y-m-d\TH:i:s');

            $db->getReference('users/' . $uid . '/notifications')->push([
                'group' => 'Candidatures',
                'type' => 'candidatures',
                'unread' => true,
                'icon' => '📄',
                'iconBg' => '#10b981',
                'tag' => 'Candidature',
                'tagClass' => 'green',
                'title' => 'Candidature envoyée',
                'desc' => 'Vous avez postulé à ' . $jobTitle . ($company ? ' chez ' . $company : '') . '.',
                'chips' => ['Postulé', $company ?: 'Offre'],
                'time' => $timeStr,
                'createdAt' => $dateStr,
            ]);
            
            \Log::info('[NOTIFICATIONS] notification created', [
                'uid' => $uid,
                'jobTitle' => $jobTitle,
                'company' => $company,
            ]);
        } catch (\Exception $e) {
            \Log::warning('[NOTIFICATIONS] create notification failed', [
                'error' => $e->getMessage(),
                'uid' => $uid,
            ]);
        }
    }

    private function extractBase64(?string $dataUrl): ?string
    {
        if (!$dataUrl) return null;
        if (preg_match('#^data:[^;]+;base64,(.+)$#', $dataUrl, $matches)) {
            return $matches[1];
        }
        return $dataUrl;
    }

    private function verifyFirebaseToken(Request $request): ?string
    {
        $authHeader = $request->header('Authorization');
        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return null;
        }

        $idToken = substr($authHeader, 7);
        try {
            $verifiedToken = $this->auth->verifyIdToken($idToken);
            return $verifiedToken->claims()->get('sub');
        } catch (\Exception $e) {
            return null;
        }
    }
}
