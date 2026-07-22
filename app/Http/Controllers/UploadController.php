<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Kreait\Firebase\Auth;

class UploadController extends Controller
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

    private function cloudName(): string
    {
        return (string) env('CLOUDINARY_CLOUD_NAME', '');
    }

    private function uploadPreset(): string
    {
        return (string) env('CLOUDINARY_UPLOAD_PRESET', '');
    }

    public function uploadCv(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:5120|mimetypes:application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ]);

        try {
            $uid = $this->verifyFirebaseToken($request);
            if (!$uid) {
                return response()->json(['success' => false, 'message' => 'Non autorisé'], 401);
            }

            $file = $request->file('file');
            $filename = time() . '_' . $file->getClientOriginalName();
            $folder = 'cvs/' . $uid;

            $response = Http::asMultipart()
                ->attach(
                    name: 'file',
                    contents: fopen($file->getRealPath(), 'r'),
                    filename: $filename,
                )
                ->post("https://api.cloudinary.com/v1_1/{$this->cloudName()}/upload", [
                    'upload_preset' => $this->uploadPreset(),
                    'folder' => $folder,
                ]);

            if (!$response->successful()) {
                \Log::error('Cloudinary upload failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur lors de l\'upload: ' . $response->body(),
                ], 500);
            }

            $result = $response->json();
            $publicId = $result['public_id'] ?? '';
            $fileUrl = $result['secure_url'] ?? $result['url'] ?? '';

            return response()->json([
                'success' => true,
                'url' => $fileUrl,
                'name' => $filename,
                'path' => $folder . '/' . $filename,
                'publicId' => $publicId,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'upload: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function uploadCoverLetter(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:5120|mimetypes:application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ]);

        try {
            $uid = $this->verifyFirebaseToken($request);
            if (!$uid) {
                return response()->json(['success' => false, 'message' => 'Non autorisé'], 401);
            }

            $file = $request->file('file');
            $filename = time() . '_' . $file->getClientOriginalName();
            $folder = 'cover-letters/' . $uid;

            $response = Http::asMultipart()
                ->attach(
                    name: 'file',
                    contents: fopen($file->getRealPath(), 'r'),
                    filename: $filename,
                )
                ->post("https://api.cloudinary.com/v1_1/{$this->cloudName()}/upload", [
                    'upload_preset' => $this->uploadPreset(),
                    'folder' => $folder,
                ]);

            if (!$response->successful()) {
                \Log::error('Cloudinary upload failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur lors de l\'upload: ' . $response->body(),
                ], 500);
            }

            $result = $response->json();
            $publicId = $result['public_id'] ?? '';
            $fileUrl = $result['secure_url'] ?? $result['url'] ?? '';

            return response()->json([
                'success' => true,
                'url' => $fileUrl,
                'name' => $filename,
                'path' => $folder . '/' . $filename,
                'publicId' => $publicId,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'upload: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function deleteCv(Request $request)
    {
        $request->validate([
            'publicId' => 'required|string'
        ]);

        try {
            $uid = $this->verifyFirebaseToken($request);
            if (!$uid) {
                return response()->json(['success' => false, 'message' => 'Non autorisé'], 401);
            }

            $publicId = $request->input('publicId');
            $this->deleteFromCloudinary($publicId);

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression: ' . $e->getMessage()
            ], 500);
        }
    }

    public function deleteCoverLetter(Request $request)
    {
        $request->validate([
            'publicId' => 'required|string'
        ]);

        try {
            $uid = $this->verifyFirebaseToken($request);
            if (!$uid) {
                return response()->json(['success' => false, 'message' => 'Non autorisé'], 401);
            }

            $publicId = $request->input('publicId');
            $this->deleteFromCloudinary($publicId);

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression: ' . $e->getMessage()
            ], 500);
        }
    }

    private function deleteFromCloudinary(string $publicId): void
    {
        $apiKey = env('CLOUDINARY_API_KEY');
        $apiSecret = env('CLOUDINARY_API_SECRET');

        if (!$apiKey || !$apiSecret) {
            \Log::warning('Cloudinary API credentials not configured, skipping file deletion for: ' . $publicId);
            return;
        }

        $response = Http::withBasicAuth($apiKey, $apiSecret)
            ->acceptJson()
            ->post("https://api.cloudinary.com/v1_1/{$this->cloudName()}/destroy", [
                'public_id' => $publicId,
            ]);

        if (!$response->successful()) {
            \Log::error('Cloudinary delete failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
        }
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
