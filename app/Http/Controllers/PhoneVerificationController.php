<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

// Register Twilio custom autoloader
require_once base_path('vendor/twilio/sdk/src/Twilio/autoload.php');

class PhoneVerificationController extends Controller
{
    /**
     * Envoie un code de vérification par WhatsApp
     */
    public function sendCode(Request $request)
    {
        $phone = $request->input('phone');
        
        if (!$phone) {
            return response()->json(['success' => false, 'message' => 'Numéro de téléphone requis'], 400);
        }

        // Nettoyer et valider le numéro
        $phone = $this->normalizePhone($phone);
        if (!$this->isValidCameroonPhone($phone)) {
            return response()->json(['success' => false, 'message' => 'Numéro camerounais invalide'], 400);
        }

        // Générer un code à 6 chiffres
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Stocker en cache avec expiration 30 minutes (pour test)
        Cache::put("whatsapp_code:{$phone}", $code, 1800);

        // Envoi via Twilio WhatsApp (désactivé en local - sandbox ne livre pas à l'international)
        $sent = $this->sendViaTwilio($phone, $code);
        
        // En dev, on considère que c'est "envoyé" pour tester le flux UI
        if (app()->environment('local')) {
            $sent = true;
        }
        
        if (!$sent) {
            Log::error("Échec envoi WhatsApp vers {$phone}");
            // Ne pas bloquer - en dev on permet le test via logs
            if (app()->environment('production')) {
                return response()->json(['success' => false, 'message' => 'Échec envoi WhatsApp'], 500);
            }
        }

        Log::info("Code WhatsApp pour {$phone}: {$code}");

        return response()->json([
            'success' => true,
            'message' => 'Code envoyé par WhatsApp'
        ]);
    }

    /**
     * Vérifie le code reçu par WhatsApp
     */
    public function verifyCode(Request $request)
    {
        $phone = $request->input('phone');
        $code = $request->input('code');

        if (!$phone || !$code) {
            return response()->json(['success' => false, 'message' => 'Numéro et code requis'], 400);
        }

        $phone = $this->normalizePhone($phone);

        $storedCode = Cache::get("whatsapp_code:{$phone}");

        if (!$storedCode) {
            return response()->json(['success' => false, 'message' => 'Code expiré ou invalide'], 400);
        }

        if ($storedCode !== $code) {
            return response()->json(['success' => false, 'message' => 'Code incorrect'], 400);
        }

        // Code valide - supprimer du cache
        Cache::forget("whatsapp_code:{$phone}");

        return response()->json([
            'success' => true,
            'message' => 'Numéro vérifié avec succès'
        ]);
    }

    private function sendViaTwilio(string $phone, string $code): bool
    {
        $sid = env('TWILIO_SID');
        $token = env('TWILIO_TOKEN');
        $from = env('TWILIO_WHATSAPP_FROM'); // ex: 'whatsapp:+14155238886'

        if (!$sid || !$token || !$from) {
            Log::warning('Twilio WhatsApp non configuré (variables d\'environnement manquantes)');
            return false;
        }

        try {
            $client = new \Twilio\Rest\Client($sid, $token);
            $client->messages->create(
                "whatsapp:{$phone}",
                ['from' => $from, 'body' => "Votre code VERA: {$code}"]
            );
            return true;
        } catch (\Exception $e) {
            Log::error('Erreur Twilio WhatsApp: ' . $e->getMessage());
            return false;
        }
    }

    private function normalizePhone(string $phone): string
    {
        $cleaned = preg_replace('/\D/', '', $phone);
        if (str_starts_with($cleaned, '237')) {
            $cleaned = substr($cleaned, 3);
        }
        if (strlen($cleaned) === 9) {
            return '+237' . $cleaned;
        }
        return $phone;
    }

    private function isValidCameroonPhone(string $phone): bool
    {
        // Format: +237XXXXXXXXX (9 chiffres après +237)
        return preg_match('/^\+237[26]\d{8}$/', $phone) === 1;
    }
}