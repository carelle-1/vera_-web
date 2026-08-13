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
                    'score' => $replyData['score'] ?? null,
                    'criteria' => $replyData['criteria'] ?? [],
                    'summary' => $replyData['summary'] ?? null,
                    'tips' => $replyData['tips'] ?? [],
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
        $hasExpected = $this->isValidInterviewAnswer($message, $question);

        $nextStep = array_search($question['id'], array_column($this->interviewQuestions, 'id')) + 1;
        $nextQuestion = $this->interviewQuestions[$nextStep] ?? null;

        $scoreData = $this->buildInterviewScoreData($message, $question, $profile);

        if ($this->isHelpOrCoachingRequest($message)) {
            $adaptive = $this->getAdaptiveInterviewReply($message, $question, $scoreData, $profile);
            return [
                'reply' => $adaptive,
                'nextStep' => $step + 1,
                'score' => $scoreData['score'],
                'criteria' => $scoreData['criteria'],
                'summary' => $scoreData['summary'],
                'tips' => $scoreData['tips'],
            ];
        }

        $adaptive = $this->getAdaptiveInterviewReply($message, $question, $scoreData, $profile);

        return [
            'reply' => $adaptive,
            'nextStep' => $step + 1,
            'score' => $scoreData['score'],
            'criteria' => $scoreData['criteria'],
            'summary' => $scoreData['summary'],
            'tips' => $scoreData['tips'],
        ];
    }

    private function getAdaptiveInterviewReply(string $message, array $question, array $scoreData, array $profile = []): string
    {
        $url = $this->getOllamaBaseUrl();
        $model = $this->getOllamaModel();

        $profileSummary = $this->veraContext->summarizeProfile($profile);
        $systemPrompt = "Tu es VERA, un recruteur senior / manager d'entreprise qui mène un véritable entretien d'embauche. "
            . "Tu adoptes le ton professionnel, exigeant mais bienveillant, d'un DRH ou d'un chef d'entreprise face à un candidat. "
            . "Question active posée au candidat : \"" . $question['question'] . "\". "
            . "Réponse réelle du candidat : \"" . $message . "\". "
            . ($profileSummary !== '' ? "Profil connu : " . $profileSummary . ". " : "")
            . "Ta mission : "
            . "1) Lis ATTENTIVEMENT ce que le candidat a réellement écrit et réagis en fonction : félicite ce qui est correct, et pointe précisément ce qui manque ou manque de précision. "
            . "2) Le Feedback DOIT être différent à chaque réponse et faire référence au contenu précis du candidat (mots-clés utilisés, éléments absents, niveau de détail). Ne donne JAMAIS un feedback générique ou identique d'une réponse à l'autre. "
            . "3) Si l'utilisateur demande de l'aide, un exemple ou un coaching, donne quand même une réponse modèle concrète et utile adaptée à la question. "
            . "4) Construis une Réponse modèle UNIQUEMENT à partir des éléments donnés dans sa phrase ou de son profil connu, en les complétant sans inventer un profil différent. "
            . "5) Si l'utilisateur dit qu'il est étudiant, la réponse modèle doit être celle d'un étudiant ; si cadre, celle d'un cadre ; garde son vrai statut. "
            . "6) Si l'utilisateur mentionne une école, un stage, un projet, une techno précis, réutilise ces éléments exacts. "
            . "7) Ne remplace pas son profil par un autre et n'invente pas de domaine (n'impose pas 'développement web' si l'utilisateur parle d'autre chose). "
            . "Formate la réponse exactement ainsi :\n"
            . "📝 Feedback : ...\n\n"
            . "💡 Réponse modèle : ...\n\n"
            . "❓ Question suivante : ...\n\n"
            . "Règle d'or : la réponse modèle doit répondre directement à la question active et rester cohérente avec ce que l'utilisateur a dit, pas un exemple générique. "
            . "IMPORTANT : si l'utilisateur demande un exemple ou du coaching, réponds avec une réponse exemple adaptée à la vraie question, pas un message de type 'oui' ou 'bonne réponse'. "
            . "EXIGENCE STRICTE : La Réponse modèle doit reprendre EXACTEMENT les mots et les faits de l'utilisateur quand ils existent. "
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
                    $replyForEchoCheck = $this->extractSection($minimumSafeReply, 'Réponse modèle');
                    if ($replyForEchoCheck === '') {
                        $replyForEchoCheck = $minimumSafeReply;
                    }

                    if ($this->isUserMessageEcho($message, $replyForEchoCheck)) {
                        $minimumSafeReply = '';
                    }

                    if ($minimumSafeReply !== '') {
                        $reply = $minimumSafeReply;
                        $feedback = $this->extractSection($reply, 'Feedback');
                        $modelAnswerFromOllama = $this->extractSection($reply, 'Réponse modèle');
                        $nextQuestionText = $this->extractSection($reply, 'Question suivante');

                        $candidate = $modelAnswerFromOllama ?: '';
                        if ($candidate === '' || $this->isUserMessageEcho($message, $candidate) || mb_strlen(trim($candidate)) < 140) {
                            $candidate = $this->buildPersonalizedModelAnswer($message, $question, $profile);
                        }
                        $modelAnswer = "💡 Réponse modèle : " . $candidate;

                        if (!$feedback) {
                            $feedback = $this->buildAdaptiveFeedback($message, $question, $scoreData, $profile);
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

        $feedback = $this->buildAdaptiveFeedback($message, $question, $scoreData, $profile);

        return $feedback . "\n\n"
            . "💡 Réponse modèle : " . $personalizedModel
            . ($nextQuestionText ? "\n\n" . $nextQuestionText : "");
    }

    private function buildAdaptiveFeedback(string $message, array $question, array $scoreData, array $profile = []): string
    {
        $text = trim($message);
        $length = mb_strlen($text, 'UTF-8');
        $score = (int) ($scoreData['score'] ?? 50);

        if ($length < 40) {
            $expected = $question['expected'] ?? [];
            $missing = array_slice($expected, 0, 3);
            $focus = !empty($missing) ? implode(', ', $missing) : 'votre parcours et vos compétences';
            return "📝 Feedback : Votre réponse est un peu courte. En tant que recruteur, j'aimerais en savoir plus : précisez " . $focus . ". Illustrez avec un exemple concret tiré de votre expérience.";
        }

        $missingLabels = [];
        foreach (($scoreData['criteria'] ?? []) as $c) {
            if (($c['status'] ?? '') === 'À améliorer') {
                $missingLabels[] = $c['label'];
            }
        }

        if ($score >= 75) {
            return "📝 Feedback : Bonne réponse, vous allez à l'essentiel et restez cohérent(e) avec votre profil. Pour marquer encore plus les esprits, ajoutez un chiffre ou un résultat concret.";
        }

        if (!empty($missingLabels)) {
            $list = implode(', ', array_slice($missingLabels, 0, 3));
            return "📝 Feedback : Votre réponse est compréhensible, mais elle manque de précision sur : " . $list . ". Reformulez avec un exemple lié à votre propre parcours pour convaincre un manager.";
        }

        return "📝 Feedback : Réponse enregistrée. Structurez-la avec une idée claire, un exemple et une conclusion professionnelle.";
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
            $name = $this->extractUserNameFromText($text) ?: ($userName ?: null);
            $status = $this->extractStatusFromText($text);
            $textDomain = $this->extractDomainFromText($text);
            $effectiveDomain = $domaine ?? $textDomain;
            $goalField = $this->deriveGoalField($text, $effectiveDomain);
            $parts = [];

            // 1) Identité professionnelle
            $identity = '';
            if ($name) {
                $identity .= "Je m'appelle " . $name;
            }
            if ($status !== '') {
                $identity .= $identity !== '' ? ", je suis " . strtolower($status) : "Je suis " . strtolower($status);
            }
            if ($effectiveDomain) {
                $identity .= $identity !== '' ? " en " . $effectiveDomain : "Je travaille dans le domaine " . $effectiveDomain;
            } elseif ($formation) {
                    $identity .= $identity !== '' ? ", diplômé(e) en " . $formation : "Je suis diplômé(e) en " . $formation;
                } elseif ($niveauEtude) {
                    $identity .= $identity !== '' ? " (" . $niveauEtude . ")" : $niveauEtude;
                }
                if ($identity !== '') {
                    $parts[] = rtrim($identity, ' ,') . ".";
                }

                // 2) Formation pertinente
                $formationBits = [];
                if ($ecole) {
                    $formationBits[] = "issu(e) de " . $ecole;
                }
                if ($certifications) {
                    $formationBits[] = "certifié(e) en " . implode(', ', array_slice($certifications, 0, 2));
                }
                if ($formationBits) {
                    $parts[] = "Ma formation : " . implode(', ', $formationBits) . ".";
                }

                // 3 & 6) Expériences et réalisation concrète
                $realisation = $projets[0] ?? $stages[0] ?? $experiences[0] ?? null;
                if ($realisation) {
                    $parts[] = "J'ai notamment réalisé " . $realisation . ", ce qui m'a permis de mettre en pratique mes connaissances.";
                } elseif (!empty($stages) || !empty($experiences)) {
                    $expList = array_merge(array_slice($stages, 0, 2), array_slice($experiences, 0, 2));
                    $parts[] = "J'ai acquis de l'expérience via " . implode(' et ', $expList) . ".";
                }

                // 4) Compétences techniques
                $techList = !empty($technologies) ? implode(', ', $technologies) : $this->extractTechnologiesFromText($text);
                if ($techList !== '' && $techList !== 'des outils modernes') {
                    $parts[] = "Sur le plan technique, je maîtrise " . $techList . ".";
                } elseif ($domaine) {
                    $parts[] = "J'ai développé des compétences techniques solides dans le domaine " . $domaine . ".";
                }

                // 5) Qualités professionnelles
                $qualites = !empty($forces) ? array_slice($forces, 0, 2) : ['l\'esprit d\'équipe', 'la capacité d\'apprentissage'];
                $parts[] = "Mes qualités professionnelles : " . implode(' et ', $qualites) . ".";

                // 7) Motivation
                $motiv = $this->extractStatedMotivation($text);
                if ($motiv === '') {
                    $motiv = !empty($motivations) ? implode(', ', array_slice($motivations, 0, 2)) : "contribuer à des projets concrets et utiles";
                }
                $parts[] = "Je suis motivé(e) par " . $motiv . ".";

                // 8) Ce que je peux apporter
                $parts[] = "Je peux apporter à votre entreprise mes compétences en " . $goalField . ", ma rigueur et ma capacité à résoudre des problèmes.";

                // 9) Projet professionnel
                if (!empty($objectifs)) {
                    $parts[] = "À moyen terme, " . implode(', ', array_slice($objectifs, 0, 1)) . ".";
                } else {
                    $parts[] = "À moyen terme, je souhaite poursuivre mon développement en " . $goalField . " pour construire des solutions performantes.";
                }

                $introText = implode(' ', $parts);
                if ($introText !== '') {
                    return $introText;
                }
            }

            return "Je m'appelle " . $normalizedName . ". Je suis motivé(e) et je souhaite mettre mes compétences au service d'une entreprise qui partage mes valeurs.";
        }

        if ($question['id'] === 'values') {
            $parts = [];
            $statedMotivation = $this->extractStatedMotivation($text);

            if ($statedMotivation !== '') {
                $parts[] = "Ma motivation pour ce poste est " . $statedMotivation;
            }

            if ($domaine) $parts[] = "Je suis motivé(e) par le domaine de " . $domaine;
            if ($poste) $parts[] = "Je souhaite rejoindre une équipe en tant que " . $poste;
            if ($valeurs) $parts[] = "Mes valeurs sont : " . implode(', ', $valeurs);
            if ($objectifs) $parts[] = "Je souhaite " . implode(', ', $objectifs);
            if ($motivations) $parts[] = "Ce qui me motive : " . implode(', ', $motivations);

            if ($parts) {
                return implode('. ', $parts) . ".";
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

            $statedStrengths = $this->extractStatedStrengths($text);
            if ($statedStrengths !== '') {
                $parts[] = "Mes forces sont " . $statedStrengths;
            }

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

    private function extractUserNameFromText(string $text): ?string
    {
        $patterns = [
            '/je\s+m[\'’]?appelle\s+([a-zA-ZÀ-ÖØ-öø-ÿ\-\'\s]+?)(?:\s*[,.!]\s*|\s+je\s+suis|\s+je\s+travaille|\s+je\s+cherche|$)/iu',
            '/je\s+me\s+(?:nomme|norme|appelle)\s+([a-zA-ZÀ-ÖØ-öø-ÿ\-\'\s]+?)(?:\s*(?:je|et|dans|avec|option|spécialité)|\s*[,.!]|$)/iu',
            '/je\s+suis\s+([a-zA-ZÀ-ÖØ-öø-ÿ\-\'\s]+?)(?:\s*[,.!]\s*|\s+je\s+travaille|\s+je\s+cherche|$)/iu',
            '/moi,\s*c[\'’]?est\s+([a-zA-ZÀ-ÖØ-öø-ÿ\-\'\s]+?)(?:\s*[,.!]\s*|\s+je\s+travaille|\s+je\s+cherche|$)/iu',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $text, $matches)) {
                $name = trim($matches[1]);
                $name = preg_replace('/\s+(?:étudiant|étudiante|ingenieur|ingénieur|stagiaire|chercheur|développeur|developpeur|genie|génie|logiciel|informatique|option|spécialité|des\s+travaux|travaux|web|mobile|en|dans|avec).*$/iu', '', $name);
                $name = trim($name, " \t\n\r,.;!?");
                if ($name !== '' && !preg_match('/^(?:je|moi|cest|étudiant|étudiante|ingenieur|ingénieur|informatique|developpeur|développeur|genie|génie|logiciel|web|mobile)$/iu', $name)) {
                    return ucfirst(mb_strtolower($name, 'UTF-8'));
                }
            }
        }

        return null;
    }

    private function extractStatusFromText(string $text): string
    {
        if (preg_match('/\b(étudiante|étudiant)\b/i', $text)) {
            return 'étudiante';
        }

        if (preg_match('/\b(ingénieur(?:e)?|developeur(?:se)?|développeur(?:se)?|analyste|chef\s+de\s+projet|stagiaire)\b/i', $text, $matches)) {
            return strtolower($matches[1]);
        }

        return '';
    }

    private function extractDomainFromText(string $text): string
    {
        if (preg_match('/\b(informatique|développement\s+web|web|logiciel|data|cybersécurité|réseau|devops)\b/i', $text, $matches)) {
            return strtolower($matches[1]);
        }

        return '';
    }

    private function deriveGoalField(string $text, ?string $domaine): string
    {
        $lower = mb_strtolower($text, 'UTF-8');
        $map = [
            'génie logiciel' => 'génie logiciel',
            'genie logiciel' => 'génie logiciel',
            'informatique' => 'informatique',
            'développement web' => 'développement web',
            'web' => 'développement web',
            'mobile' => 'développement mobile',
            'réseau' => 'réseau',
            'cybersécurité' => 'cybersécurité',
            'data' => 'la data',
            'intelligence artificielle' => 'intelligence artificielle',
        ];

        foreach ($map as $keyword => $label) {
            if (str_contains($lower, $keyword)) {
                return $label;
            }
        }

        if ($domaine) {
            return $domaine;
        }

        return 'mon domaine d\'expertise';
    }

    private function extractStudyContextFromText(string $text): string
    {
        if (preg_match('/\b(?:en\s+)?(?:(?:option|spécialité)\s+)?(?:(?:génie|genie)\s+logiciel|informatique(?:\s+option\s+génie\s+logiciel)?|mathématiques|réseaux|cybersécurité)\b/i', $text, $matches)) {
            return 'je suis en ' . trim($matches[0]);
        }

        if (preg_match('/\b(?:je\s+suis\s+)?(étudiant(?:e)?\s+en\s+[^.,!?]+)/i', $text, $matches)) {
            return 'je suis ' . trim($matches[1]);
        }

        return '';
    }

    private function extractFocusFromText(string $text): string
    {
        if (preg_match('/\b(?:dév|développement|dev)\s+(?:web\s+)?(?:et\s+)?(?:mobile|backend|frontend|full\s*stack)?/i', $text, $matches)) {
            return strtolower(trim($matches[0]));
        }

        if (preg_match('/\b(?:web|mobile|logiciel|application)\b/i', $text)) {
            return 'développement web et mobile';
        }

        return 'développement web et mobile';
    }

    private function extractIntroRole(string $text): string
    {
        if (preg_match('/\bje\s+suis\s+([a-zA-ZÀ-ÖØ-öø-ÿ\-\'\s]+?)(?:\s*(?:avec|et|mais|donc|car|je|j\')|$)/iu', $text, $matches)) {
            $role = trim($matches[1]);
            $role = preg_replace('/\s*(?:avec|et|mais|donc|car)\b.*$/iu', '', $role);
            return trim($role, " \t\n\r,.;!?");
        }

        return '';
    }

    private function extractRoleFromText(string $text): string
    {
        if (preg_match('/\b(?:développeur|developpeur|ingénieur|ingenieur|étudiant|etudiante|analyste|stagiaire|chef\s+de\s+projet)\b/i', $text, $matches)) {
            return trim($matches[0]);
        }

        return '';
    }

    private function extractStatedMotivation(string $text): string
    {
        $cleaned = trim($text);
        if ($cleaned === '') {
            return '';
        }

        if (preg_match('/^(?:le\s+)?travail$/iu', $cleaned)) {
            return 'le travail';
        }

        $patterns = [
            '/(?:ma\s+motivation(?:\s+pour\s+ce\s+poste)?\s*(?:est|:)\s*)(.+?)(?:[.!?]|$)/iu',
            '/(?:je\s+suis\s+(?:également\s+)?motivé(?:e)?(?:\s+par)?\s*(?:pour|par)\s*)(.+?)(?:[.!?]|$)/iu',
            '/(?:je\s+suis\s+(?:également\s+)?motivé(?:e)?\s+par\s+(.+?))(?:[.!?]|$)/iu',
            '/(?:ce\s+qui\s+me\s+motivate\s*(?:est|:)\s*)(.+?)(?:[.!?]|$)/iu',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $cleaned, $matches)) {
                $motivation = trim($matches[1]);
                $motivation = preg_replace('/\s*(?:car|parce\s+que)\b.*$/iu', '', $motivation);
                $motivation = preg_replace('/\s*[;,]\s*/u', ' et ', $motivation);
                $motivation = preg_replace('/\s+/', ' ', $motivation);
                $motivation = trim($motivation, " .,:;!?\t\n\r");

                if ($motivation !== '') {
                    return ucfirst(mb_strtolower($motivation, 'UTF-8'));
                }
            }
        }

        if (preg_match('/\b(?:motivation|motivé|motivée|motivé|motivée)\b/i', $cleaned)) {
            return ucfirst(mb_strtolower($cleaned, 'UTF-8'));
        }

        return '';
    }

    private function isValidInterviewAnswer(string $message, array $question): bool
    {
        $text = trim($message);
        if ($text === '' || $this->isHelpOrCoachingRequest($text)) {
            return false;
        }

        $ollamaCheck = $this->evaluateAnswerWithOllama($message, $question['question'] ?? '');
        if ($ollamaCheck !== null) {
            return $ollamaCheck;
        }

        $lower = mb_strtolower($text, 'UTF-8');
        $questionId = $question['id'] ?? '';

        $patterns = [
            'intro' => ['je suis', 'je m\'appelle', 'j\'ai', 'mon parcours', 'formation', 'étudiant', 'expérience', 'compétences', 'domaine', 'objectif', 'projet'],
            'values' => ['motivation', 'motivé', 'pourquoi', 'objectif', 'poste', 'mission', 'apprendre', 'professionnel', 'défi', 'équipe', 'projets', 'car'],
            'strengths' => ['force', 'forces', 'rigueur', 'travail', 'attention', 'autonomie', 'communication', 'organisation', 'solide', 'analyse', 'esprit', 'dynamique'],
            'weaknesses' => ['faiblesse', 'améliorer', 'apprendre', 'progresser', 'développer', 'travail', 'gestion', 'organisation', 'difficulté'],
            'scenario' => ['situation', 'tâche', 'action', 'résultat', 'difficulté', 'géré', 'résolu', 'problème']
        ];

        $keywords = $patterns[$questionId] ?? ['je suis', 'je', 'motivation', 'équipe', 'poste'];
        foreach ($keywords as $keyword) {
            if (str_contains($lower, mb_strtolower($keyword, 'UTF-8'))) {
                return true;
            }
        }

        return false;
    }

    private function evaluateAnswerWithOllama(string $message, string $question): ?bool
    {
        $url = $this->getOllamaBaseUrl();
        $model = $this->getOllamaModel();

        try {
            $response = Http::timeout(12)
                ->post($url . '/api/chat', [
                    'model' => $model,
                    'stream' => false,
                    'messages' => [
                        ['role' => 'system', 'content' => 'Tu es un évaluateur d’entretien. Réponds uniquement en JSON valide: {"answeringQuestion": true|false, "reason": "..."}. Renvoie true si le texte répond réellement à la question. Ne réponds pas par un message normal.'],
                        ['role' => 'user', 'content' => "Question: " . $question . "\n\nRéponse: " . $message],
                    ],
                ]);

            if (!$response->successful()) {
                return null;
            }

            $payload = $response->json();
            $content = trim((string) ($payload['message']['content'] ?? $payload['response'] ?? ''));
            if ($content === '') {
                return null;
            }

            $json = json_decode($content, true);
            if (!is_array($json) || !array_key_exists('answeringQuestion', $json)) {
                return null;
            }

            return (bool) $json['answeringQuestion'];
        } catch (\Throwable $e) {
            \Log::warning('Ollama interview answer validation failed: ' . $e->getMessage());
            return null;
        }
    }

    private function isHelpOrCoachingRequest(string $message): bool
    {
        $text = mb_strtolower(trim($message), 'UTF-8');
        if ($text === '') {
            return false;
        }

        $patterns = [
            '/\b(aide|aider|assistant|coaching|conseils?|exemple|préparer|préparation|simuler|simulateur|structure|structuré|adapté|réponse claire|réponds?\s+à\s+la\s+question|donne[-\s]*moi|peux[-\s]*tu|je\s+veux)\b/i',
            '/\b(question|réponse|entretien|poste|cv|motivation|forces|faiblesses)\b.*\b(exemple|conseil|aide|coaching|préparer)\b/i',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $text)) {
                return true;
            }
        }

        return false;
    }

    private function extractStatedStrengths(string $text): string
    {
        $cleaned = trim($text);
        if ($cleaned === '') {
            return '';
        }

        $patterns = [
            '/(?:mes\s+forces\s+(?:sont|sont\s+les\s+suivants?|sont\s+les\s+suivantes?)\s*)(.+?)(?:[.!?]|$)/iu',
            '/(?:ma\s+force\s+(?:est|sont)?\s*)(.+?)(?:[.!?]|$)/iu',
            '/(?:je\s+suis\s+(?:très|assez|bien)?\s*(?:rigoureux|rigoureuse|organisé|organisée|autonome|patient|dynamique|discret|attentif|attentive|communicatif|communicative|travailleur|travailleuse|serieux|sérieuse)\b.*?)(?:[.!?]|$)/iu',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $cleaned, $matches)) {
                $strength = trim($matches[1]);
                $strength = preg_replace('/\s*(?:et|,|;|:|\.)\s*/u', ' et ', $strength);
                $strength = preg_replace('/\s+/', ' ', $strength);
                $strength = trim($strength, " .,:;!?\t\n\r");

                if ($strength !== '') {
                    return ucfirst(mb_strtolower($strength, 'UTF-8'));
                }
            }
        }

        return '';
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

        $userTokens = $this->tokenizeInterviewText($user);
        $candidateTokens = $this->tokenizeInterviewText($candidate);

        if (empty($userTokens) || empty($candidateTokens)) {
            return false;
        }

        $overlap = count(array_intersect($userTokens, $candidateTokens));
        $sharedRatio = $overlap / count($userTokens);
        $lengthRatio = count($candidateTokens) / count($userTokens);
        $extraCandidate = count(array_diff($candidateTokens, $userTokens));
        $extraUser = count(array_diff($userTokens, $candidateTokens));

        return $sharedRatio >= 0.9
            && $lengthRatio <= 1.2
            && $extraCandidate <= 2
            && $extraUser <= 2;
    }

    private function tokenizeInterviewText(string $text): array
    {
        $normalized = preg_replace('/[\p{P}\p{S}]+/u', ' ', $text);
        $normalized = mb_strtolower((string) $normalized, 'UTF-8');
        $tokens = preg_split('/\s+/u', trim((string) $normalized), -1, PREG_SPLIT_NO_EMPTY);

        if (!is_array($tokens)) {
            return [];
        }

        $skipWords = [
            'je', 'me', 'm', 'ma', 'mon', 'mes', 'est', 'suis', 'ai', 'dans', 'pour', 'avec', 'et', 'de', 'des', 'du', 'le', 'la', 'les', 'un', 'une', 'au', 'aux', 'sur', 'sous', 'que', 'qui', 'mais', 'donc', 'parce', 'car', 'cette', 'cest', 'cela', 'ce', 'ces', 'comme', 'très', 'plus', 'tres', 'je', 'mappelle', 'nomme', 'norme', 'appelle'
        ];

        $filtered = [];
        foreach ($tokens as $token) {
            $token = trim($token, "'\"");
            if ($token === '' || in_array($token, $skipWords, true)) {
                continue;
            }
            $filtered[] = $token;
        }

        return array_values(array_unique($filtered));
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

    private function buildInterviewScoreData(string $message, array $question, array $profile = []): array
    {
        $analysis = $this->veraContext->analyzeResponse($message, $question['expected'] ?? [], $profile, []);
        $criteria = [];

        foreach ($analysis['criteria'] ?? [] as $key => $value) {
            $criteria[] = [
                'label' => $this->formatCriterionLabel($key),
                'score' => $value['present'] ? 100 : 40,
                'status' => $value['present'] ? 'Présent' : 'À améliorer',
            ];
        }

        if (empty($criteria)) {
            $criteria = [
                ['label' => 'Clarté', 'score' => 60, 'status' => 'À améliorer'],
                ['label' => 'Pertinence', 'score' => 60, 'status' => 'À améliorer'],
                ['label' => 'Adéquation poste', 'score' => 60, 'status' => 'À améliorer'],
            ];
        }

        $score = (int) ($analysis['score'] ?? 60);
        if ($score >= 80) {
            $summary = 'Très bonne réponse : claire, pertinente et bien alignée avec le poste.';
        } elseif ($score >= 60) {
            $summary = 'Bonne réponse : elle contient les bases, mais il manque un peu de structure et d’exemples concrets.';
        } elseif ($score >= 40) {
            $summary = 'Réponse acceptable : elle est compréhensible, mais elle manque de précision et d’éléments convaincants.';
        } else {
            $summary = 'Réponse insuffisante : elle reste trop générale ou peu ciblée. Il faut renforcer votre message.';
        }

        $tips = [];
        if ($score < 70) {
            $tips[] = 'Ajoutez un exemple concret : situation, action et résultat.';
        }
        if ($score < 80) {
            $tips[] = 'Mettez en avant votre motivation, vos compétences et votre adéquation au poste.';
        }
        $tips[] = 'Structurez votre réponse avec une idée claire, un exemple et une conclusion professionnelle.';

        return [
            'score' => $score,
            'criteria' => $criteria,
            'summary' => $summary,
            'tips' => $tips,
        ];
    }

    private function formatCriterionLabel(string $criterion): string
    {
        $labels = [
            'formation' => 'Clarté du parcours',
            'expérience' => 'Expérience',
            'compétences' => 'Compétences',
            'poste' => 'Adéquation poste',
            'domaine' => 'Mise en contexte',
            'passion' => 'Motivation',
            'profil' => 'Profil',
            'mission' => 'Mission',
            'entreprise' => 'Alignement entreprise',
            'impact' => 'Impact',
            'valeur' => 'Valeurs',
            'croissance' => 'Croissance',
            'équipe' => 'Travail en équipe',
            'projet' => 'Projets',
            'rigueur' => 'Rigueur',
            'communication' => 'Communication',
            'leadership' => 'Leadership',
            'technique' => 'Approche technique',
            'analyse' => 'Analyse',
            'créativité' => 'Créativité',
            'autonomie' => 'Autonomie',
            'situation' => 'Situation',
            'tâche' => 'Tâche',
            'action' => 'Action',
            'résultat' => 'Résultat',
            'apprentissage' => 'Apprentissage',
            'améliorer' => 'Amélioration',
            'développer' => 'Développement',
            'apprendre' => 'Apprentissage',
            'travailler' => 'Engagement',
            'progresser' => 'Progression',
        ];

        return $labels[$criterion] ?? ucfirst(str_replace(['_', '-'], ' ', $criterion));
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
        $commonNames = ['Sarah', 'Jeanne', 'Marie', 'Thomas', 'Lucas', 'Sophie', 'Camille', 'Alexandre', 'Julie', 'Jean', 'Pierre', 'Paul', 'Claire', 'Lucie', 'Emma', 'Léa', 'Chloé', 'Manon', 'Ambre'];

        if ($userName && mb_strlen($userName) >= 2) {
            $normalizedName = ucfirst(mb_strtolower($userName, 'UTF-8'));
            foreach ($commonNames as $name) {
                $normalizedReply = preg_replace('/\b' . preg_quote($name, '/') . '\b/iu', $normalizedName, $normalizedReply);
            }
            $normalizedReply = preg_replace('/\b[Nn]om\s*:[^\\n]*/iu', "Nom : " . $normalizedName, $normalizedReply);
            $normalizedReply = preg_replace('/\bJe\s+m[\'’]?appelle\s+[a-zA-ZÀ-ÖØ-öø-ÿ\-\'\s]+/iu', "Je m'appelle " . $normalizedName, $normalizedReply);
        } else {
            $normalizedReply = preg_replace('/\b[Nn]om\s*:[^\\n]*/iu', '', $normalizedReply);
            foreach ($commonNames as $name) {
                $normalizedReply = preg_replace('/\b' . preg_quote($name, '/') . '\b/iu', '[Prénom]', $normalizedReply);
            }
        }

        return $normalizedReply;
    }

    private function getOllamaBaseUrl(): string
    {
        $url = trim((string) env('OLLAMA_URL', 'http://127.0.0.1:11434'));
        $url = rtrim($url, '/');

        return $url !== '' ? $url : 'http://127.0.0.1:11434';
    }

    private function getOllamaModel(): string
    {
        $model = trim((string) env('OLLAMA_MODEL', 'llama3.2:1b'));

        return $model !== '' ? $model : 'llama3.2:1b';
    }

    private function getNextQuestionIndex(string $currentId): int
    {
        $index = array_search($currentId, array_column($this->interviewQuestions, 'id'));
        return $index !== false ? $index + 1 : 0;
    }

    private function getVeraReply(string $message): string
    {
        $url = $this->getOllamaBaseUrl();
        $model = $this->getOllamaModel();

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