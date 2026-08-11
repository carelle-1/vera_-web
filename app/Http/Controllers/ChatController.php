<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Kreait\Firebase\Auth;

class ChatController extends Controller
{
    private array $interviewQuestions = [
        [
            'id' => 'intro',
            'question' => 'Parlez-moi de vous.',
            'expected' => ['formation', 'expérience', 'compétences', 'poste', 'domaine', 'passion', 'profil'],
            'fallback' => "Je suis développeur Full Stack avec 3 ans d'expérience dans la conception d'applications web. J'ai travaillé sur des projets e-commerce et SaaS, et je maîtrise React, Node.js et PostgreSQL. Je suis passionné par les produits utiles et je souhaite rejoindre une startup innovante pour créer des solutions à fort impact utilisateur.",
            'next' => 'values',
        ],
        [
            'id' => 'values',
            'question' => 'Quelles sont vos motivations pour ce poste ?',
            'expected' => ['mission', 'entreprise', 'impact', 'valeur', 'croissance', 'équipe', 'projet'],
            'fallback' => "Je suis motivé(e) par la mission de rendre l'éducation plus accessible grâce au numérique. Je veux contribuer à des projets qui ont un impact social direct et évoluer dans une équipe produit qui valorise l'innovation et la collaboration. Ce poste correspond à mes valeurs d'inclusion, de rigueur et de progrès continu.",
            'next' => 'strengths',
        ],
        [
            'id' => 'strengths',
            'question' => 'Quelles sont vos forces ?',
            'expected' => ['rigueur', 'communication', 'leadership', 'technique', 'analyse', 'créativité', 'autonomie', 'esprit d\'équipe'],
            'fallback' => "Mes forces sont : la rigueur, la communication et l'esprit d'analyse. Exemple concret : j'ai mis en place une revue de code systématique qui a réduit de 30 % les bugs en production, et j'anime régulièrement des ateliers pour partager les bonnes pratiques avec l'équipe.",
            'next' => 'weaknesses',
        ],
        [
            'id' => 'weaknesses',
            'question' => 'Quelles sont vos faiblesses ?',
            'expected' => ['améliorer', 'développer', 'apprendre', 'travailler', 'progresser', 'gérer', 'demander', 'aide'],
            'fallback' => "Je peux encore améliorer ma prise de parole en public. Pour progresser, je participe à des ateliers de prise de parole et j'ai commencé à présenter mes projets en équipe. Par exemple, j'ai animé 3 présentations internes ces 6 derniers mois pour vulgariser des sujets techniques.",
            'next' => 'scenario',
        ],
        [
            'id' => 'scenario',
            'question' => 'Racontez-moi une situation difficile que vous avez gérée.',
            'expected' => ['situation', 'tâche', 'action', 'résultat', 'résultat quantifiable', 'apprentissage'],
            'fallback' => "Situation : nous devions livrer une nouvelle fonctionnalité sous 2 semaines. Tâche : coordonner 3 développeurs et garantir la qualité. Action : j'ai organisé des points journaliers, défini des tests automatiques et priorisé les tickets. Résultat : livraison à temps avec 95 % de tests couverts. Apprentissage : une communication claire et une planification anticipée sont essentielles.",
            'next' => null,
        ],
    ];

    public function send(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:2000',
            'recipientId' => 'nullable|string',
            'interviewMode' => 'nullable|bool',
            'interviewStep' => 'nullable|integer|min:0',
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
            $interviewMode = filter_var($request->input('interviewMode', false), FILTER_VALIDATE_BOOLEAN);
            $interviewStep = (int) $request->input('interviewStep', 0);

            if ($interviewMode) {
                $reply = $this->getInterviewReply($message, $interviewStep);
                $nextStep = $reply['nextStep'] ?? $interviewStep;

                return response()->json([
                    'success' => true,
                    'reply' => $reply['reply'],
                    'interviewStep' => $nextStep,
                ]);
            }

            $reply = $this->getVeraReply($message);
        } else {
            $reply = "Merci pour votre message. Un administrateur vous répondra bientôt.";
        }

        return response()->json([
            'success' => true,
            'reply' => $reply,
        ]);
    }

    private function getInterviewReply(string $message, int $step): array
    {
        $question = $this->interviewQuestions[$step] ?? null;

        if (!$question) {
            return [
                'reply' => "Entretien terminé. Bravo ! Tu peux relire cet échange pour t’améliorer.",
                'nextStep' => $step,
            ];
        }

        $text = mb_strtolower($message, 'UTF-8');
        $hasExpected = false;

        foreach ($question['expected'] as $keyword) {
            if (str_contains($text, $keyword)) {
                $hasExpected = true;
                break;
            }
        }

        $nextStep = array_search($question['id'], array_column($this->interviewQuestions, 'id')) + 1;
        $nextQuestion = $this->interviewQuestions[$nextStep] ?? null;

        if ($hasExpected) {
            $followUp = $nextQuestion ? "❓ Question suivante : " . $nextQuestion['question'] : "";
            return [
                'reply' => "✅ Bonne réponse." . ($followUp ? "\n\n" . $followUp : ""),
                'nextStep' => $nextStep,
            ];
        }

        $adaptive = $this->getAdaptiveInterviewReply($message, $question);

        return [
            'reply' => $adaptive,
            'nextStep' => $step,
        ];
    }

    private function getAdaptiveInterviewReply(string $message, array $question): string
    {
        $url = rtrim((string) env('OLLAMA_URL', 'http://localhost:11434'), '/');
        $model = (string) env('OLLAMA_MODEL', 'llama3.2:1b');

        $systemPrompt = "Tu es VERA, coach d'entretien d'embauche. "
            . "Tu guides un candidat sur la question : \"" . $question['question'] . "\". "
            . "Voici sa réponse brute : \"" . $message . "\". "
            . "Ta mission : "
            . "1) Donne un Feedback court et bienveillant sur ce qui manque dans sa réponse. "
            . "2) Construis une Réponse modèle UNIQUEMENT à partir des éléments qu'il a donnés, en les complétant intelligemment sans inventer un profil différent. "
            . "Si l'utilisateur dit qu'il est étudiant, la réponse modèle doit être celle d'un étudiant. "
            . "Si l'utilisateur parle de développement web, la réponse modèle doit rester dans le développement web. "
            . "Si l'utilisateur mentionne une école, un stage, un projet précis, réutilise ces éléments. "
            . "Ne remplace pas son profil par un autre. "
            . "Formate la réponse exactement ainsi :\n"
            . "📝 Feedback : ...\n\n"
            . "💡 Réponse modèle : ...\n\n"
            . "❓ Question suivante : ...\n\n"
            . "Règle d'or : la réponse modèle doit être cohérente avec ce que l'utilisateur a dit, pas un exemple générique d'un autre métier. "
            . "IMPORTANT : la réponse modèle doit être personnalisée avec les informations de l'utilisateur, pas un texte pré-écrit. "
            . "EXIGENCE STRICTE : La Réponse modèle doit reprendre EXACTEMENT les mots et les faits de l'utilisateur. "
            . "Si l'utilisateur dit 'j'ai réalisé une plateforme associative', la réponse modèle DOIT dire 'J'ai réalisé une plateforme associative' ou 'J'ai conçu une plateforme associative', pas 'une plateforme pour une association'. "
            . "Si l'utilisateur dit 'stage de 5 mois chez GHOSTROAR DIGITAL', la réponse modèle DOIT mentionner ce stage exact. "
            . "Si l'utilisateur dit 'Django, Flutter, Laravel', la réponse modèle DOIT citer ces technologies exactes. "
            . "Ne change PAS les noms, les durées, les entreprises, les projets, les technologies. "
            . "Réécris seulement pour améliorer la formulation, mais garde TOUS les faits. "
            . "INTERDICTION : n'utilise pas de nom générique comme Sarah, Jeanne, Marie, Thomas, Lucas, Sophie, Camille, Alexandre, Julie. "
            . "Si tu ne connais pas le nom de l'utilisateur, ne mets pas de nom du tout.";

        try {
            $response = Http::timeout(20)
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

            if ($response->successful() || $response->status() === 200) {
                $data = $response->json();
                $reply = trim((string) ($data['message']['content'] ?? $data['response'] ?? ''));

                if ($reply !== '') {
                    $reply = $this->personalizeInterviewReply($reply, $message);

                    $feedback = $this->extractSection($reply, 'Feedback');
                    $modelAnswer = $this->extractSection($reply, 'Réponse modèle');
                    $nextQuestionText = $this->extractSection($reply, 'Question suivante');

                    $isGenericModel = false;
                    if ($modelAnswer) {
                        $lowerModelAnswer = mb_strtolower($modelAnswer, 'UTF-8');
                        $isGenericModel = str_contains($lowerModelAnswer, 'développeur full stack')
                            || str_contains($lowerModelAnswer, 'développeuse full stack')
                            || str_contains($lowerModelAnswer, 'react, node.js et postgresql')
                            || str_contains($lowerModelAnswer, 'e-commerce et saas');
                    }

                    if ($isGenericModel) {
                        $personalizedModel = $this->buildPersonalizedModelAnswer($message, $question);
                        $modelAnswer = "💡 Réponse modèle : " . $personalizedModel;
                    } elseif (!$modelAnswer) {
                        $personalizedModel = $this->buildPersonalizedModelAnswer($message, $question);
                        $modelAnswer = "💡 Réponse modèle : " . $personalizedModel;
                    }

                    if (!$feedback) {
                        $feedback = "📝 Feedback : La réponse manque de détails. Utilisez la méthode STAR pour structurer votre réponse avec une situation, tâche, action et résultat. Reliez votre parcours à vos compétences techniques et expériences pertinentes pour le poste.";
                    }

                    if (!$nextQuestionText) {
                        $nextQuestion = $this->interviewQuestions[$this->getNextQuestionIndex($question['id'])] ?? null;
                        if ($nextQuestion) {
                            $nextQuestionText = "❓ Question suivante : " . $nextQuestion['question'];
                        }
                    }

                    $finalReply = $feedback;
                    if ($modelAnswer) $finalReply .= "\n\n" . $modelAnswer;
                    if ($nextQuestionText) $finalReply .= "\n\n" . $nextQuestionText;

                    return $finalReply;
                }
            }
        } catch (\Throwable $e) {
            \Log::warning('Ollama interview reply failed: ' . $e->getMessage());
        }

        $nextQuestion = $this->interviewQuestions[$this->getNextQuestionIndex($question['id'])] ?? null;
        $nextQuestionText = $nextQuestion ? "❓ Question suivante : " . $nextQuestion['question'] : "";

        $personalizedModel = $this->buildPersonalizedModelAnswer($message, $question);

        return "📝 Feedback : La réponse manque de détails. Utilisez la méthode STAR pour structurer votre réponse avec une situation, tâche, action et résultat. Reliez votre parcours à vos compétences techniques et expériences pertinentes pour le poste.\n\n"
            . "💡 Réponse modèle : " . $personalizedModel
            . ($nextQuestionText ? "\n\n" . $nextQuestionText : "");
    }

    private function buildPersonalizedModelAnswer(string $message, array $question): string
    {
        $text = mb_strtolower($message, 'UTF-8');
        $userName = null;
        $patterns = [
            '/je\s+m[\'’]?appelle\s+([a-zA-ZÀ-ÖØ-öø-ÿ\-\'\s]+?)(?:\s*[,.!]|\s+je\s+suis|\s+je\s+travaille|\s+je\s+cherche|\s+je\s+suis\s+passionné|$)/iu',
            '/je\s+suis\s+([a-zA-ZÀ-ÖØ-öø-ÿ\-\'\s]+?)(?:\s*[,.!]|\s+je\s+travaille|\s+je\s+cherche|\s+je\s+suis\s+passionné|$)/iu',
            '/moi,\s+c[\'’]?est\s+([a-zA-ZÀ-ÖØ-öø-ÿ\-\'\s]+?)(?:\s*[,.!]|\s+je\s+travaille|\s+je\s+cherche|$)/iu',
            '/c[\'’]?est\s+([a-zA-ZÀ-ÖØ-öø-ÿ\-\'\s]+?)(?:\s*[,.!]|\s+je\s+travaille|\s+je\s+cherche|$)/iu',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $message, $matches)) {
                $userName = trim($matches[1]);
                break;
            }
        }

        $normalizedName = $userName ? ucfirst(mb_strtolower($userName, 'UTF-8')) : '[Prénom]';

        $domainKeywords = [
            'agriculteur' => 'agriculture',
            'agriculture' => 'agriculture',
            'développement web' => 'développement web',
            'web' => 'développement web',
            'mobile' => 'développement mobile',
            'flutter' => 'développement mobile',
            'django' => 'développement web',
            'laravel' => 'développement web',
            'react' => 'développement web',
            'node.js' => 'développement web',
            'nodejs' => 'développement web',
            'postgresql' => 'bases de données',
            'saas' => 'produits SaaS',
            'e-commerce' => 'e-commerce',
            'boulanger' => 'boulangerie',
            'patissier' => 'pâtisserie',
            'médecin' => 'médecine',
            'infirmier' => 'soins infirmiers',
            'enseignant' => 'enseignement',
            'professeur' => 'enseignement',
            'comptable' => 'comptabilité',
            'ingénieur' => 'ingénierie',
            'marketing' => 'marketing',
            'design' => 'design',
            'graphiste' => 'design graphique',
            'photographe' => 'photographie',
            'journaliste' => 'journalisme',
            'avocat' => 'droit',
            'architecte' => 'architecture',
            'mécanique' => 'mécanique',
            'électricien' => 'électricité',
            'plombier' => 'plomberie',
            'cuisinier' => 'cuisine',
            'chef' => 'cuisine',
        ];

        $detectedDomain = 'mon domaine';
        foreach ($domainKeywords as $keyword => $domain) {
            if (str_contains($text, $keyword)) {
                $detectedDomain = $domain;
                break;
            }
        }

        $experienceKeywords = ['stage', 'expérience', 'ans', 'années', 'diplôme', 'formation', 'école'];
        $hasExperience = false;
        foreach ($experienceKeywords as $keyword) {
            if (str_contains($text, $keyword)) {
                $hasExperience = true;
                break;
            }
        }

        if ($hasExperience) {
            return "Je m'appelle " . $normalizedName . ". Je travaille dans le domaine de " . $detectedDomain . ", avec une expérience que je peux mettre à profit. Je souhaite contribuer à des projets concrets et continuer à progresser dans un environnement professionnel stimulant.";
        }

        return "Je m'appelle " . $normalizedName . ". Je suis intéressé(e) par le domaine de " . $detectedDomain . ". Je souhaite mettre mes compétences au service d'une entreprise qui partage mes valeurs et continuer à apprendre au quotidien.";
    }

    private function extractSection(string $reply, string $sectionName): string
    {
        $patterns = [
            '/📝\s*Feedback\s*:\s*(.*?)(?=\n\n💡|\n\n❓|$)/si',
            '/💡\s*Réponse\s*modèle\s*:\s*(.*?)(?=\n\n❓|$)/si',
            '/❓\s*Question\s*suivante\s*:\s*(.*?)$/si',
        ];

        $search = [
            'Feedback' => 0,
            'Réponse modèle' => 1,
            'Question suivante' => 2,
        ];

        $index = $search[$sectionName] ?? null;
        if ($index === null || !isset($patterns[$index])) {
            return '';
        }

        if (preg_match($patterns[$index], $reply, $matches)) {
            return trim($matches[1]);
        }

        return '';
    }

    private function personalizeInterviewReply(string $reply, string $userMessage): string
    {
        $userMessage = trim($userMessage);
        if ($userMessage === '') {
            return $reply;
        }

        $userName = null;
        $patterns = [
            '/je\s+m[\'’]?appelle\s+([a-zA-ZÀ-ÖØ-öø-ÿ\-\'\s]+?)(?:\s*[,.!]|\s+je\s+suis|\s+je\s+travaille|\s+je\s+cherche|\s+je\s+suis\s+passionné|$)/iu',
            '/je\s+suis\s+([a-zA-ZÀ-ÖØ-öø-ÿ\-\'\s]+?)(?:\s*[,.!]|\s+je\s+travaille|\s+je\s+cherche|\s+je\s+suis\s+passionné|$)/iu',
            '/moi,\s+c[\'’]?est\s+([a-zA-ZÀ-ÖØ-öø-ÿ\-\'\s]+?)(?:\s*[,.!]|\s+je\s+travaille|\s+je\s+cherche|$)/iu',
            '/c[\'’]?est\s+([a-zA-ZÀ-ÖØ-öø-ÿ\-\'\s]+?)(?:\s*[,.!]|\s+je\s+travaille|\s+je\s+cherche|$)/iu',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $userMessage, $matches)) {
                $userName = trim($matches[1]);
                break;
            }
        }

        $normalizedReply = $reply;

        if ($userName && mb_strlen($userName) >= 2) {
            $normalizedName = ucfirst(mb_strtolower($userName, 'UTF-8'));
            $commonNames = ['Sarah', 'Jeanne', 'Marie', 'Thomas', 'Lucas', 'Sophie', 'Camille', 'Alexandre', 'Julie', 'Jean', 'Pierre', 'Paul', 'Claire', 'Lucie', 'Emma', 'Léa', 'Chloé', 'Manon', 'Ambre'];
            foreach ($commonNames as $name) {
                $normalizedReply = preg_replace('/\b' . preg_quote($name, '/') . '\b/iu', $normalizedName, $normalizedReply);
            }
            $normalizedReply = preg_replace('/\b[Nn]om\s*:[^\\n]*/iu', "Nom : " . $normalizedName, $normalizedReply);
            $normalizedReply = preg_replace('/\bJe\s+m[\'’]?appelle\s+[a-zA-ZÀ-ÖØ-öø-ÿ\-\'\s]+/iu', "Je m'appelle " . $normalizedName, $normalizedReply);
        } else {
            $normalizedReply = preg_replace('/\b[Nn]om\s*:[^\\n]*/iu', '', $normalizedReply);
            $normalizedReply = preg_replace('/\bJe\s+m[\'’]?appelle\s+[a-zA-ZÀ-ÖØ-öø-ÿ\-\'\s]+/iu', '', $normalizedReply);
            $commonNames = ['Sarah', 'Jeanne', 'Marie', 'Thomas', 'Lucas', 'Sophie', 'Camille', 'Alexandre', 'Julie', 'Jean', 'Pierre', 'Paul', 'Claire', 'Lucie', 'Emma', 'Léa', 'Chloé', 'Manon', 'Ambre'];
            foreach ($commonNames as $name) {
                $normalizedReply = preg_replace('/\b' . preg_quote($name, '/') . '\b/iu', '[Prénom]', $normalizedReply);
            }
        }

        return $normalizedReply;
    }

    private function getNextQuestionIndex(string $currentId): int
    {
        $index = array_search($currentId, array_column($this->interviewQuestions, 'id'));
        return $index !== false ? $index + 1 : 0;
    }

    private function getVeraReply(string $message): string
    {
        $url = rtrim((string) env('OLLAMA_URL', 'http://localhost:11434'), '/');
        $model = (string) env('OLLAMA_MODEL', 'llama3.2:1b');

        $systemPrompt = "Tu es VERA, l'assistant IA officiel de VERA (Real Opportunities, Smart Jobs). "
            . "Tu ne t'appelles pas Léa. Tu es VERA, assistant carrière. "
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
