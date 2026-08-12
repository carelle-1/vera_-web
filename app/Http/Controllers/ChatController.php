<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Kreait\Firebase\Auth;
use App\Services\VeraContextService;
use Illuminate\Support\Facades\Auth as LaravelAuth;

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

    public function __construct(private VeraContextService $veraContext)
    {
    }

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

            $user = LaravelAuth::user();
            $profile = $user ? $this->veraContext->getUserProfile($user) : [];

            if ($interviewMode) {
                $replyData = $this->getInterviewReply($message, $interviewStep, $profile);
                $nextStep = $replyData['nextStep'] ?? $interviewStep;

                return response()->json([
                    'success' => true,
                    'reply' => $replyData['reply'],
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

    private function getInterviewReply(string $message, int $step, array $profile = []): array
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

        $adaptive = $this->getAdaptiveInterviewReply($message, $question, $profile);

        return [
            'reply' => $adaptive,
            'nextStep' => $step,
        ];
    }

    private function getAdaptiveInterviewReply(string $message, array $question, array $profile = []): string
    {
        $url = rtrim((string) env('OLLAMA_URL', 'http://localhost:11434'), '/');
        $model = (string) env('OLLAMA_MODEL', 'llama3.2:1b');

        $profileSummary = $this->veraContext->summarizeProfile($profile);
        $systemPrompt = "Tu es VERA, coach d'entretien d'embauche. "
            . "Tu guides un candidat sur la question : \"" . $question['question'] . "\". "
            . "Voici sa réponse brute : \"" . $message . "\". "
            . ($profileSummary !== '' ? "Profil connu : " . $profileSummary . ". " : "")
            . "Ta mission : "
            . "1) Donne un Feedback court et bienveillant sur ce qui manque dans sa réponse. "
            . "2) Construis une Réponse modèle UNIQUEMENT à partir des éléments qu'il a donnés dans sa réponse et de son profil connu, en les complétant intelligemment sans inventer un profil différent. "
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
                    $minimumSafeReply = $this->personalizeInterviewReply($reply, $message);
                    if ($this->isUserMessageEcho($message, $minimumSafeReply)) {
                        $minimumSafeReply = '';
                    }

                    if ($minimumSafeReply !== '') {
                        $reply = $minimumSafeReply;
                        $feedback = $this->extractSection($reply, 'Feedback');
                        $modelAnswer = $this->extractSection($reply, 'Réponse modèle');
                        $nextQuestionText = $this->extractSection($reply, 'Question suivante');

                        $personalizedModel = $this->buildPersonalizedModelAnswer($message, $question, $profile);
                        $modelAnswer = "💡 Réponse modèle : " . $personalizedModel;

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
            }
        } catch (\Throwable $e) {
            \Log::warning('Ollama interview reply failed: ' . $e->getMessage());
        }

        $nextQuestion = $this->interviewQuestions[$this->getNextQuestionIndex($question['id'])] ?? null;
        $nextQuestionText = $nextQuestion ? "❓ Question suivante : " . $nextQuestion['question'] : "";

        $personalizedModel = $this->buildPersonalizedModelAnswer($message, $question, $profile);

        return "📝 Feedback : La réponse manque de détails. Utilisez la méthode STAR pour structurer votre réponse avec une situation, tâche, action et résultat. Reliez votre parcours à vos compétences techniques et expériences pertinentes pour le poste.\n\n"
            . "💡 Réponse modèle : " . $personalizedModel
            . ($nextQuestionText ? "\n\n" . $nextQuestionText : "");
    }

    private function buildPersonalizedModelAnswer(string $message, array $question, array $profile = []): string
    {
        $text = trim($message);
        $lower = mb_strtolower($text, 'UTF-8');

        \Log::info('[MODEL ANSWER] message=' . $text);
        \Log::info('[MODEL ANSWER] profile=' . json_encode($profile, JSON_UNESCAPED_UNICODE));

        $userName = $profile['nom'] ?? null;
        if (!$userName) {
            $patterns = [
                '/je\s+m[\'’]?appelle\s+([a-zA-ZÀ-ÖØ-öø-ÿ\-\'\s]+?)(?:\s*[,.!]|\s+je\s+suis|\s+je\s+travaille|\s+je\s+cherche|\s+je\s+suis\s+passionné|$)/iu',
                '/je\s+suis\s+([a-zA-ZÀ-ÖØ-öø-ÿ\-\'\s]+?)(?:\s*[,.!]|\s+je\s+travaille|\s+je\s+cherche|\s+je\s+suis\s+passionné|$)/iu',
                '/moi,\s+c[\'’]?est\s+([a-zA-ZÀ-ÖØ-öø-ÿ\-\'\s]+?)(?:\s*[,.!]|\s+je\s+travaille|\s+je\s+cherche|$)/iu',
                '/c[\'’]?est\s+([a-zA-ZÀ-ÖØ-öø-ÿ\-\'\s]+?)(?:\s*[,.!]|\s+je\s+travaille|\s+je\s+cherche|$)/iu',
            ];

            foreach ($patterns as $pattern) {
                if (preg_match($pattern, $text, $matches)) {
                    $userName = trim($matches[1]);
                    break;
                }
            }
        }

        $normalizedName = $userName ? ucfirst(mb_strtolower($userName, 'UTF-8')) : '[Prénom]';

        $statut = $profile['statut'] ?? null;
        $formation = $profile['formation'] ?? null;
        $niveauEtude = $profile['niveau_etude'] ?? null;
        $ecole = $profile['ecole'] ?? null;
        $domaine = $profile['domaine'] ?? null;
        $poste = $profile['poste_recherche'] ?? null;
        $competences = $profile['competences'] ?? [];
        $technologies = $profile['technologies'] ?? [];
        $experiences = $profile['experiences'] ?? [];
        $stages = $profile['stages'] ?? [];
        $projets = $profile['projets'] ?? [];
        $certifications = $profile['certifications'] ?? [];
        $motivations = $profile['motivations'] ?? [];
        $forces = $profile['forces'] ?? [];
        $valeurs = $profile['valeurs'] ?? [];
        $objectifs = $profile['objectifs'] ?? [];

        if ($question['id'] === 'intro') {
            $hasProfileData = $statut || $formation || $niveauEtude || $ecole || $domaine || $poste || !empty($stages) || !empty($experiences) || !empty($technologies) || !empty($competences) || !empty($projets) || !empty($certifications) || !empty($motivations);

            if ($hasProfileData) {
                $parts = [];

                if ($normalizedName && $normalizedName !== '[Prénom]') {
                    $parts[] = "Je m'appelle " . $normalizedName;
                }

                $descriptor = [];
                if ($statut) $descriptor[] = $statut;
                if ($formation) $descriptor[] = "diplômé(e) en " . $formation;
                if ($niveauEtude && !$formation) $descriptor[] = $niveauEtude;
                if ($ecole) $descriptor[] = "de " . $ecole;
                if ($domaine) $descriptor[] = "dans le domaine de " . $domaine;
                if ($poste) $descriptor[] = "et je souhaite devenir " . $poste;
                if ($descriptor) {
                    $parts[] = implode(', ', $descriptor) . ".";
                }

                $details = [];
                if ($stages) $details[] = "J'ai effectué " . implode(' et ', $stages);
                if ($experiences) $details[] = "J'ai " . implode(', ', $experiences);
                if ($technologies) $details[] = "Je maîtrise notamment " . implode(', ', $technologies);
                if ($competences) $details[] = "Mes compétences clés sont : " . implode(', ', $competences);
                if ($projets) $details[] = "J'ai réalisé " . implode(', ', $projets);
                if ($certifications) $details[] = "Je suis certifié(e) en " . implode(', ', $certifications);
                if ($motivations) $details[] = "Je suis motivé(e) par " . implode(', ', $motivations);
                if ($details) {
                    $parts[] = implode('. ', $details) . ".";
                }

                if ($parts) {
                    return implode('. ', $parts) . ".";
                }
            }

            if ($text !== '') {
                $domain = $domaine ?: 'le développement';
                $technologiesCsv = $technologies ? implode(', ', $technologies) : $this->extractTechnologiesFromText($text);
                $experience = $this->extractExperienceFromText($text);
                $lead = $experience ? "J'ai " . $experience . " d'expérience" : "J'ai une expérience pratique solide";

                return "Je suis " . $domain . " motivé(e) par la création de solutions utiles et je mets en avant ma rigueur, mon autonomie et ma capacité à apprendre rapidement. " . $lead . ", notamment avec " . $technologiesCsv . ", et je souhaite contribuer à des projets à fort impact.";
            }

            return "Je m'appelle " . $normalizedName . ". Je suis motivé(e) et je souhaite mettre mes compétences au service d'une entreprise qui partage mes valeurs.";
        }

        if ($question['id'] === 'values') {
            $parts = [];
            if ($domaine) $parts[] = "Je suis motivé(e) par le domaine de " . $domaine;
            if ($poste) $parts[] = "et je souhaite rejoindre une équipe en tant que " . $poste;
            if ($valeurs) $parts[] = "Mes valeurs sont : " . implode(', ', $valeurs);
            if ($objectifs) $parts[] = "Je souhaite " . implode(', ', $objectifs);
            if ($motivations) $parts[] = "Ce qui me motive : " . implode(', ', $motivations);

            if ($parts) {
                return implode(', ', $parts) . ".";
            }

            if ($text !== '') {
                $domain = $domaine ?: 'ce poste';
                $motivationsCsv = $motivations ? implode(', ', $motivations) : 'l’impact, l’apprentissage et la collaboration';

                return "Je suis motivé(e) par " . $domain . " car il me permet d'apprendre, de contribuer à des projets utiles et de grandir au sein d'une équipe qui valorise " . $motivationsCsv . ".";
            }

            return "Je suis motivé(e) par ce poste car il correspond à mes valeurs et me permet de continuer à apprendre.";
        }

        if ($question['id'] === 'strengths') {
            $parts = [];
            if ($forces) $parts[] = "Mes forces sont : " . implode(', ', $forces);
            if ($technologies) $parts[] = "Sur le plan technique, je maîtrise " . implode(', ', $technologies);
            if ($stages) $parts[] = "Par exemple, lors de " . $stages[0] . ", j'ai pu mettre en œuvre ces qualités.";

            if ($parts) {
                return implode('. ', $parts) . ".";
            }

            if ($text !== '') {
                $strengthsCsv = $forces ? implode(', ', $forces) : 'ma rigueur, mon autonomie et mon esprit d’équipe';
                $techs = $technologies ? implode(', ', $technologies) : 'des outils modernes';

                return "Mes forces sont notamment " . $strengthsCsv . ". Je suis également à l'aise avec " . $techs . " et j'aime résoudre des problèmes de manière structurée.";
            }

            return "Mes forces sont ma rigueur, ma capacité d'adaptation et mon esprit d'équipe.";
        }

        if ($question['id'] === 'weaknesses') {
            $parts = [];
            if ($profile['faiblesses']) $parts[] = "Je peux encore améliorer " . implode(', ', $profile['faiblesses']);
            if ($objectifs) $parts[] = "Pour progresser, je " . implode(', ', $objectifs);

            if ($parts) {
                return implode('. ', $parts) . ".";
            }

            if ($text !== '') {
                $weakness = $profile['faiblesses'] ? implode(', ', $profile['faiblesses']) : 'ma gestion du stress face à des situations complexes';
                $goals = $objectifs ? implode(', ', $objectifs) : 'mieux organiser mon travail et solliciter de l’aide quand j’en ai besoin';

                return "Je peux encore améliorer " . $weakness . ". Pour progresser, je " . $goals . ", afin de mieux appréhender les situations et renforcer mes compétences.";
            }

            return "Je peux encore améliorer ma prise de parole en public. Pour progresser, je participe à des ateliers et je présente mes projets en équipe.";
        }

        if ($question['id'] === 'scenario') {
            $situation = $stages[0] ?? $experiences[0] ?? $projets[0] ?? null;
            if ($situation) {
                return "Situation : lors de " . $situation . ", j'ai rencontré une difficulté. "
                    . "Tâche : je devais trouver une solution rapide. "
                    . "Action : j'ai analysé le problème et proposé une amélioration. "
                    . "Résultat : la situation a été résolue et j'ai appris l'importance de la communication et de la planification.";
            }

            if ($text !== '') {
                $firstSentence = $text;
                if (mb_strlen($firstSentence) > 200) {
                    $firstSentence = mb_substr($firstSentence, 0, 200) . '...';
                }
                return $firstSentence;
            }

            return "J'ai déjà fait face à une situation difficile que j'ai gérée en analysant le problème, en proposant une solution et en obtenant un résultat positif.";
        }

        if ($text !== '') {
            $role = $profile['poste_recherche'] ?? 'un poste qui correspond à mes compétences';
            $domain = $domaine ?: 'dans le domaine informatique';
            $techs = $technologies ? implode(', ', $technologies) : $this->extractTechnologiesFromText($text);

            $experience = $this->extractExperienceFromText($text);
            $lead = $experience ? "J'ai " . $experience . " d'expérience" : "J'ai une solide expérience pratique";

            return "Je suis motivé(e) par " . $domain . " et je souhaite évoluer dans " . $role . ". " . $lead . ", notamment avec " . $techs . ", afin de créer des solutions utiles, fiables et bien pensées.";
        }

        return "Je m'appelle " . $normalizedName . ". Je suis motivé(e) et je souhaite mettre mes compétences au service d'une entreprise qui partage mes valeurs.";
    }

    private function extractTechnologiesFromText(string $text): string
    {
        $known = [
            'Laravel', 'React', 'Vue.js', 'Node.js', 'Flutter', 'Django', 'PHP', 'JavaScript', 'TypeScript',
            'PostgreSQL', 'MySQL', 'MongoDB', 'Docker', 'Git', 'Python', 'Java', 'C#', 'Symfony', 'WordPress'
        ];

        $found = [];
        foreach ($known as $tech) {
            if (stripos($text, $tech) !== false && !in_array($tech, $found, true)) {
                $found[] = $tech;
            }
        }

        return $found ? implode(', ', $found) : 'des outils modernes';
    }

    private function extractExperienceFromText(string $text): string
    {
        if (preg_match('/(\d+)\s*ans?/', $text, $matches)) {
            return $matches[1] . ' ans';
        }

        if (preg_match('/(\d+)\s*mois?/', $text, $matches)) {
            return $matches[1] . ' mois';
        }

        return '';
    }

    private function isUserMessageEcho(string $userMessage, string $reply): bool
    {
        $user = $this->normalizeInterviewText($userMessage);
        $candidate = $this->normalizeInterviewText($reply);

        if ($user === '' || $candidate === '') {
            return false;
        }

        if ($candidate === $user) {
            return true;
        }

        if (str_contains($candidate, $user) || str_contains($user, $candidate)) {
            return true;
        }

        similar_text($user, $candidate, $percent);

        return $percent >= 85;
    }

    private function normalizeInterviewText(string $text): string
    {
        $normalized = trim($text);
        $normalized = preg_replace('/\s+/u', ' ', $normalized);
        $normalized = preg_replace('/^(?:📝\s*Feedback\s*:|💡\s*Réponse\s*modèle\s*:|❓\s*Question\s*suivante\s*:)/iu', '', $normalized);
        $normalized = preg_replace('/\s*[\r\n]+\s*/u', ' ', $normalized);
        $normalized = preg_replace('/[^\p{L}\p{N}\s\-\'\"\.,;:!?]/u', '', $normalized);
        $normalized = mb_strtolower($normalized, 'UTF-8');

        return trim((string) $normalized);
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