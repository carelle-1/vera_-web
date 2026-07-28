<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Kreait\Firebase\Auth;
use Kreait\Firebase\Database;

class CoachController extends Controller
{
    private function verifyFirebaseToken(Request $request): ?string
    {
        $authHeader = $request->header('Authorization');
        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            \Log::warning('[COACH] missing auth header');
            return null;
        }

        $idToken = substr($authHeader, 7);
        try {
            /** @var Auth $auth */
            $auth = app('firebase.auth');
            $verifiedIdToken = $auth->verifyIdToken($idToken);
            return $verifiedIdToken->claims()->get('sub');
        } catch (\Throwable $e) {
            \Log::warning('[COACH] token verify failed', ['message' => $e->getMessage()]);
            return null;
        }
    }

    private function getUserObjective(string $uid): ?array
    { 
        try {
            /** @var Database $db */
            $db = app('firebase.database');
            $snapshot = $db->getReference('users/' . $uid . '/objectives')->getSnapshot();

            if (!$snapshot->hasChildren()) {
                \Log::info('[COACH] no objectives node', ['uid' => $uid]);
                return null;
            }

            $objectives = $snapshot->getValue() ?: [];
            $first = array_values($objectives)[0] ?? null;

            if (!$first) {
                \Log::info('[COACH] empty objectives', ['uid' => $uid]);
                return null;
            }

            return [
                'title' => (string) ($first['title'] ?? ''),
                'category' => (string) ($first['category'] ?? ''),
                'targetDate' => (string) ($first['targetDate'] ?? ''),
                'description' => (string) ($first['description'] ?? ''),
            ];
        } catch (\Throwable $e) {
            \Log::error('[COACH] Firebase read error', ['message' => $e->getMessage()]);
            return null;
        }
    }

    private function buildMessages(string $section, ?array $objective): array
    {
        $objectiveText = $objective
            ? "Objectif : {$objective['title']} (catégorie : {$objective['category']}, échéance : {$objective['targetDate']}). Description : {$objective['description']}."
            : 'Aucun objectif de carrière défini.';

        $system = "Tu es VERA, assistant carrière officiel de VERA (Real Opportunities, Smart Jobs). "
            . "Tu ne t'appelles pas Léa. Tu es VERA. "
            . "Tu parles français. Tu es concret, structuré, encourageant et professionnel. "
            . "Tu réponds en français.";

        $userPrompts = [
            'plan' => "À partir de mon objectif de carrière, donne un plan de carrière étape par étape pour l'atteindre avant la date cible. Structure la réponse avec des phases : Phase 1, Phase 2, etc., les actions clés et les jalons.",
            'skills' => "Pour atteindre mon objectif de carrière, liste les compétences techniques et soft skills à développer, avec pour chaque compétence une courte explication de son importance.",
            'insights' => "Donne des insights marché pertinents pour mon objectif de carrière : tendances du secteur, salaires moyens, opportunités et risques, entreprises cibles.",
            'conseils' => "Donne 5 conseils actionables pour maintenir la motivation, progresser et atteindre mon objectif de carrière dans les délais.",
            'overview' => "Fais une synthèse complète de mon objectif et donne les actions prioritaires à mettre en œuvre maintenant pour l'atteindre, en reprenant les axes plan, compétences, insights et conseils.",
        ];

        $userPrompt = ($userPrompts[$section] ?? '') . "\n\n" . $objectiveText;

        return [
            ['role' => 'system', 'content' => $system],
            ['role' => 'user', 'content' => $userPrompt],
        ];
    }

    private function getOllamaReply(array $messages): string
    {
        $url = rtrim((string) env('OLLAMA_URL', 'http://127.0.0.1:11434'), '/') . '/api/chat';
        $model = (string) env('OLLAMA_MODEL', 'llama3.2:1b');

        \Log::info('[COACH] Ollama PHP request', ['url' => $url, 'model' => $model]);

        $payload = [
            'model' => $model,
            'stream' => false,
            'options' => [
                'temperature' => 0.7,
                'top_p' => 0.9,
                'max_tokens' => 150,
            ],
            'messages' => $messages,
        ];

        $json = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        $context = stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => "Content-Type: application/json\r\n"
                    . "Content-Length: " . strlen($json) . "\r\n",
                'content' => $json,
                'timeout' => 120,
            ],
        ]);

        $start = microtime(true);

        $response = @file_get_contents($url, false, $context);

        $elapsed = microtime(true) - $start;
        \Log::info('[COACH] Ollama response', ['elapsed_sec' => round($elapsed, 2), 'raw_len' => $response ? strlen($response) : 0]);

        if ($response === false) {
            throw new \RuntimeException('Ollama request failed or timed out');
        }

        $data = json_decode($response, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            \Log::error('[COACH] JSON decode error', ['raw' => substr($response, 0, 200)]);
            throw new \RuntimeException('Ollama invalid JSON: ' . json_last_error_msg());
        }

        $reply = trim((string) ($data['message']['content'] ?? $data['response'] ?? ''));
        if ($reply === '') {
            $reply = trim((string) ($data['response'] ?? ''));
        }

        if ($reply !== '') {
            return $reply;
        }

        throw new \RuntimeException('Ollama empty reply');
    }

    public function advice(Request $request)
    {
        try {
            set_time_limit(120);
            ignore_user_abort(true);

            $offline = (bool) $request->headers->get('X-Offline-Mode');
            $uid = null;

            if (!$offline) {
                $uid = $this->verifyFirebaseToken($request);
                if (!$uid) {
                    return response()->json(['success' => false, 'message' => 'Non autorisé'], 401);
                }
            }

            $request->validate([
                'section' => 'required|string|in:plan,skills,insights,conseils,overview',
            ]);

            $section = (string) $request->input('section');

            \Log::info('[COACH] advice request', ['section' => $section, 'uid' => $uid, 'offline' => $offline]);

            $objective = null;

            if ($offline) {
                $objective = [
                    'title' => (string) $request->input('objective.title', ''),
                    'category' => (string) $request->input('objective.category', ''),
                    'targetDate' => (string) $request->input('objective.targetDate', ''),
                    'description' => (string) $request->input('objective.description', ''),
                ];
            } else {
                $objective = $this->getUserObjective($uid);
            }

            if ($section !== 'objectifs' && !$objective) {
                \Log::info('[COACH] no objective', ['section' => $section]);
                return response()->json([
                    'success' => false,
                    'message' => 'Ajoutez votre objectif de carrière dans l\'onglet Objectifs pour débloquer les conseils personnalisés.',
                    'section' => $section,
                    'reply' => '',
                    'objective' => null,
                ]);
            }

            $messages = $this->buildMessages($section, $objective);

            \Log::info('[COACH] calling Ollama', ['section' => $section]);
            $reply = $this->getOllamaReply($messages);
            \Log::info('[COACH] Ollama success', ['section' => $section, 'reply_len' => strlen($reply)]);

            if ($reply === '') {
                $reply = "Je n'ai pas pu générer de contenu pour cette section. Réessayez dans quelques instants.";
            }

            return response()->json([
                'success' => true,
                'section' => $section,
                'reply' => $reply,
                'objective' => $objective,
            ]);
        } catch (\Throwable $e) {
            \Log::error('[COACH] advice error', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Je n\'arrive pas à contacter le coach IA pour le moment.',
                'error' => $e->getMessage(),
                'section' => (string) $request->input('section', ''),
                'reply' => '',
                'objective' => null,
            ], 500);
        }
    }
}
