<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Kreait\Firebase\Auth;

class ChatController extends Controller
{
    public function send(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:2000',
            'recipientId' => 'nullable|string',
        ]);

        $uid = $this->verifyFirebaseToken($request);
        if (!$uid) {
            return response()->json(['success' => false, 'message' => 'Non autorisé'], 401);
        }

        $message = $request->input('message');
        $recipientId = $request->input('recipientId');

        if (!$recipientId) {
            return response()->json(['success' => false, 'message' => 'Destinataire manquant'], 400);
        }

        if ($recipientId === 'vera') {
            $reply = $this->getVeraReply($message);
        } else {
            $reply = "Merci pour votre message. Un administrateur vous répondra bientôt.";
        }

        return response()->json([
            'success' => true,
            'reply' => $reply,
        ]);
    }

    private function getVeraReply(string $message): string
    {
        $url = rtrim((string) env('OLLAMA_URL', 'http://localhost:11434'), '/');
        $model = (string) env('OLLAMA_MODEL', 'llama3.2:1b');

        $systemPrompt = "Tu es VERA, un assistant carrière bienveillant, humain et professionnel. "
            . "Tu parles français. Tu aides sur : les offres d'emploi, l'orientation professionnelle, "
            . "les objectifs de carrière, la préparation de CV, les lettres de motivation et les entretiens. "
            . "Réponds toujours en français, de manière concise, naturelle et encourageante. "
            . "Évite les réponses trop robotiques.";

        try {
            \Log::info('[VERA] Ollama request', ['url' => $url, 'model' => $model, 'message' => $message]);

            $response = Http::timeout(60)
                ->post($url . '/api/chat', [
                    'model' => $model,
                    'stream' => false,
                    'options' => [
                        'temperature' => 0.7,
                        'top_p' => 0.9,
                        'max_tokens' => 500,
                    ],
                    'messages' => [
                        ['role' => 'system', 'content' => $systemPrompt],
                        ['role' => 'user', 'content' => $message],
                    ],
                ]);

            \Log::info('[VERA] Ollama response', [
                'status' => $response->status(),
                'body' => substr($response->body(), 0, 500),
            ]);

            if ($response->successful() || $response->status() === 200) {
                $data = $response->json();
                $reply = trim((string) ($data['message']['content'] ?? $data['response'] ?? ''));

                if ($reply !== '') {
                    return $reply;
                }

                return trim((string) ($data['response'] ?? ''));
            }
        } catch (\Exception $e) {
            \Log::warning('Ollama request failed: ' . $e->getMessage());
        }

        return "Je suis désolé, je n'arrive pas à répondre pour le moment. "
            . "Veuillez réessayer dans quelques instants. "
            . "En attendant, je peux vous aider sur vos candidatures, votre carrière ou vos entretiens.";
    }

    private function verifyFirebaseToken(Request $request): ?string
    {
        $authHeader = $request->header('Authorization');
        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return null;
        }

        $idToken = substr($authHeader, 7);
        try {
            /** @var Auth $auth */
            $auth = app('firebase.auth');
            $verifiedIdToken = $auth->verifyIdToken($idToken);
            return $verifiedIdToken->claims()->get('sub');
        } catch (\Exception $e) {
            return null;
        }
    }
}
