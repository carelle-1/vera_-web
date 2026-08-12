<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Session;
use App\Models\User;
use Kreait\Firebase\Contract\Database;

class VeraContextService
{
    private const SESSION_PROFILE_KEY = 'vera_user_profile';
    private const SESSION_MEMORY_KEY = 'vera_interview_memory';

    private array $defaultProfile = [
        'nom' => null,
        'statut' => null,
        'age' => null,
        'formation' => null,
        'niveau_etude' => null,
        'ecole' => null,
        'domaine' => null,
        'poste_recherche' => null,
        'competences' => [],
        'technologies' => [],
        'experiences' => [],
        'stages' => [],
        'projets' => [],
        'certifications' => [],
        'motivations' => [],
        'forces' => [],
        'faiblesses' => [],
        'objectifs' => [],
        'valeurs' => [],
        'informations_supplementaires' => []
    ];

    private array $defaultMemory = [
        'questions' => [],
        'current_question_index' => 0,
        'started_at' => null,
    ];

    private array $criteriaKeywords = [
        'formation' => ['formation', 'diplôme', 'école', 'étudiant', 'bac', 'master', 'licence', 'but', 'bts', 'doctorat'],
        'expérience' => ['expérience', 'ans', 'années', 'travaillé', 'poste', 'stage', 'professionnel', 'emploi'],
        'compétences' => ['compétence', 'savoir-faire', 'maîtrise', 'capacité', 'qualité', 'travaille avec', 'utilise', 'connaît', 'développe'],
        'poste' => ['poste', 'emploi', 'recruté', 'embauche', 'contrat', 'cdi', 'cdd', 'freelance', 'cherche', 'recherche un poste', 'poste de'],
        'domaine' => ['domaine', 'secteur', 'industrie', 'informatique', 'marketing', 'finance', 'santé', 'éducation', 'ingénierie', 'design', 'communication', 'ressources humaines', 'logistique'],
        'passion' => ['passion', 'passionné', 'motivé', 'motivation', 'intéressé', 'intérêt', 'aime'],
        'profil' => ['profil', 'parcours', 'personnalité', 'atouts', 'présentation', 'je suis'],
        'mission' => ['mission', 'objectif', 'but', 'valeur', 'impact', 'raison'],
        'entreprise' => ['entreprise', 'société', 'startup', 'groupe', 'organisation', 'boîte'],
        'impact' => ['impact', 'résultat', 'changer', 'améliorer', 'contribuer', 'apporter'],
        'valeur' => ['valeur', 'principes', 'éthique', 'culture', 'conviction'],
        'croissance' => ['croissance', 'progresser', 'développer', 'apprendre', 'évolution', 'monter'],
        'équipe' => ['équipe', 'collaborer', 'collaboration', 'groupe', 'collectif', 'ensemble'],
        'projet' => ['projet', 'projets', 'initiative', 'mission', 'réalisé'],
        'rigueur' => ['rigueur', 'minutieux', 'organisé', 'ponctuel', 'structuré', 'méthodique', 'sérieux'],
        'communication' => ['communication', 'communiquer', 'écouter', 'exprimer', 'présenter', 'oral'],
        'leadership' => ['leadership', 'leader', 'manager', 'encadrer', 'piloter', 'diriger'],
        'technique' => ['technique', 'code', 'développement', 'algorithmes', 'hard'],
        'analyse' => ['analyse', 'analyser', 'data', 'données', 'étudier', 'comprendre'],
        'créativité' => ['créativité', 'créatif', 'innovant', 'imagination', 'original', 'nouvelle'],
        'autonomie' => ['autonomie', 'autonome', 'indépendant', 'initiative', 'seul'],
        'esprit d\'équipe' => ['équipe', 'collectif', 'groupe', 'collaborer', 'ensemble', 'solidarité'],
        'situation' => ['situation', 'contexte', 'moment', 'problème', 'difficulté'],
        'tâche' => ['tâche', 'mission', 'responsabilité', 'objectif', 'mission'],
        'action' => ['action', 'fait', 'mis en place', 'décidé', 'proposé', 'organisé', 'réalisé', 'géré'],
        'résultat' => ['résultat', 'abouti', 'livré', 'atteint', 'obtenu', 'réussi', 'terminé'],
        'résultat quantifiable' => ['%', 'pourcent', 'fois', 'mois', 'années', 'nombre', 'chiffre', 'réduit', 'augmenté', 'amélioré de'],
        'apprentissage' => ['appris', 'apprentissage', 'tiré', 'leçon', 'retour', 'progressé', 'retenu'],
        'améliorer' => ['améliorer', 'faiblesse', 'faible', 'progrès', 'développer', 'travailler sur'],
        'développer' => ['développer', 'améliorer', 'progresser', 'apprendre', 'monter'],
        'apprendre' => ['apprendre', 'formation', 'cours', 'certification', 'nouveau'],
        'travailler' => ['travailler', 'effort', 'investi', 'fournir'],
        'progresser' => ['progresser', 'évolution', 'améliorer', 'grandir', 'avancer'],
        'gérer' => ['gérer', 'gestion', 'organiser', 'planifier', 'coordonner'],
        'demander' => ['demander', 'aide', 'conseil', 'accompagnement', 'feedback'],
        'aide' => ['aide', 'accompagnement', 'soutien', 'conseil', 'appui'],
    ];

    private array $technologyKeywords = [
        'flutter', 'dart', 'django', 'laravel', 'react', 'node.js', 'nodejs', 'postgresql', 'mysql',
        'mongodb', 'vue.js', 'angular', 'python', 'java', 'javascript', 'typescript', 'php', 'c#',
        'c++', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'android', 'ios', 'flutter', 'react native',
        'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'git', 'figma', 'photoshop', 'illustrator',
        'excel', 'word', 'powerpoint', 'salesforce', 'sap', 'crm', 'erp'
    ];

    public function __construct()
    {
    }

    public function getUserProfile(User $user): array
    {
        try {
            /** @var Database $database */
            $database = app('firebase.database');
            $snapshot = $database->getReference('users/' . $user->uid)->getSnapshot();

            if (!$snapshot->hasChildren()) {
                return $this->defaultProfile;
            }

            $data = $snapshot->getValue() ?: [];
            if (!is_array($data)) {
                return $this->defaultProfile;
            }

            $profile = $this->defaultProfile;

            $profile['nom'] = trim(((string) ($data['firstName'] ?? '') . ' ' . (string) ($data['lastName'] ?? ''))) ?: null;
            $profile['statut'] = $data['jobTitle'] ?: ($data['availability'] ?: null);
            $profile['age'] = $data['birthDate'] ?: null;
            $profile['formation'] = $this->extractPrimaryFormationFromFirebase($data['formations'] ?? []);
            $profile['niveau_etude'] = $this->extractNiveauEtudeFromFirebase($data['formations'] ?? []);
            $profile['ecole'] = $this->extractEcoleFromFirebase($data['formations'] ?? []);
            $profile['domaine'] = $this->extractDomaineFromProfile($data);
            $profile['poste_recherche'] = $data['jobTitle'] ?: null;
            $profile['competences'] = $this->extractSkills($data['skills'] ?? []);
            $profile['technologies'] = $this->extractTechnologiesFromProfile($data);
            $profile['experiences'] = $this->extractExperiencesFromFirebase($data['experiences'] ?? []);
            $profile['stages'] = [];
            $profile['projets'] = $this->extractProjetsFromFirebase($data['projects'] ?? [], $data['experiences'] ?? []);
            $profile['certifications'] = $this->extractCertificationsFromFirebase($data['certifications'] ?? []);
            $profile['motivations'] = $this->extractMotivationsFromProfile($data);
            $profile['forces'] = [];
            $profile['faiblesses'] = [];
            $profile['objectifs'] = $this->extractObjectifsFromFirebase($data['preferences'] ?? []);
            $profile['valeurs'] = [];
            $profile['informations_supplementaires'] = [
                'residence' => $data['residence'] ?? null,
                'availability' => $data['availability'] ?? null,
                'contractType' => $data['contractType'] ?? null,
                'workLocation' => $data['workLocation'] ?? null,
                'salary' => $data['salary'] ?? null,
                'about' => $data['about'] ?? null,
                'experienceYears' => $data['experienceYears'] ?? null,
                'projectsCount' => $data['projectsCount'] ?? null,
                'clientsCount' => $data['clientsCount'] ?? null,
                'linkedin' => $data['linkedin'] ?? null,
                'whatsapp' => $data['whatsapp'] ?? null,
                'mainLanguage' => $data['mainLanguage'] ?? null,
                'nationality' => $data['nationality'] ?? null,
                'maritalStatus' => $data['maritalStatus'] ?? null,
            ];

            return $profile;
        } catch (\Throwable $e) {
            \Log::warning('Firebase profile read failed: ' . $e->getMessage());
            return $this->defaultProfile;
        }
    }

    public function saveUserProfile(User $user, array $profile): void
    {
        Session::put(self::SESSION_PROFILE_KEY, $profile);
    }

    private function extractPrimaryFormationFromFirebase(array $formations): ?string
    {
        if (empty($formations)) {
            return null;
        }

        $levels = [
            'doctorat' => 5,
            'master' => 4,
            'master 2' => 4,
            'master 1' => 3.5,
            'licence' => 3,
            'but' => 2.5,
            'bts' => 2,
            'bac' => 1,
            'baccalaureat' => 1,
        ];

        usort($formations, function ($a, $b) use ($levels) {
            $levelA = 0;
            $levelB = 0;
            foreach ($levels as $keyword => $score) {
                if (isset($a['title']) && stripos($a['title'], $keyword) !== false) {
                    $levelA = max($levelA, $score);
                }
                if (isset($b['title']) && stripos($b['title'], $keyword) !== false) {
                    $levelB = max($levelB, $score);
                }
            }
            return $levelB <=> $levelA;
        });

        $first = $formations[0];
        return trim((string) ($first['title'] ?? ''));
    }

    private function extractNiveauEtudeFromFirebase(array $formations): ?string
    {
        if (empty($formations)) {
            return null;
        }

        $keywords = ['doctorat', 'master 2', 'master 1', 'master', 'licence', 'but', 'bts', 'bac', 'baccalaureat'];
        foreach ($formations as $formation) {
            $title = strtolower((string) ($formation['title'] ?? ''));
            foreach ($keywords as $keyword) {
                if (str_contains($title, $keyword)) {
                    return $keyword;
                }
            }
        }

        return null;
    }

    private function extractEcoleFromFirebase(array $formations): ?string
    {
        if (empty($formations)) {
            return null;
        }

        foreach ($formations as $formation) {
            $school = trim((string) ($formation['school'] ?? ''));
            if ($school !== '') {
                return $school;
            }
        }

        return null;
    }

    private function extractDomaineFromProfile(array $data): ?string
    {
        $about = strtolower((string) ($data['about'] ?? ''));
        $jobTitle = strtolower((string) ($data['jobTitle'] ?? ''));

        $combined = $about . ' ' . $jobTitle;

        $domainKeywords = [
            'informatique' => 'informatique',
            'développement web' => 'développement web',
            'web' => 'développement web',
            'mobile' => 'développement mobile',
            'flutter' => 'développement mobile',
            'django' => 'développement web',
            'laravel' => 'développement web',
            'react' => 'développement web',
            'node.js' => 'développement web',
            'marketing' => 'marketing',
            'finance' => 'finance',
            'santé' => 'santé',
            'éducation' => 'éducation',
            'ingénierie' => 'ingénierie',
            'ingénieur' => 'ingénierie',
            'design' => 'design',
            'communication' => 'communication',
            'ressources humaines' => 'ressources humaines',
            'logistique' => 'logistique',
            'architecture' => 'architecture',
            'mécanique' => 'mécanique',
            'électricité' => 'électricité',
        ];

        foreach ($domainKeywords as $keyword => $domain) {
            if (str_contains($combined, $keyword)) {
                return $domain;
            }
        }

        return null;
    }

    private function extractSkills(array $skills): array
    {
        if (empty($skills) || !is_array($skills)) {
            return [];
        }

        $result = [];
        foreach ($skills as $skill) {
            if (is_array($skill)) {
                $name = trim((string) ($skill['name'] ?? $skill['title'] ?? ''));
            } elseif (is_string($skill)) {
                $name = trim($skill);
            } else {
                continue;
            }

            if ($name !== '') {
                $result[] = $name;
            }
        }

        return array_values(array_unique($result));
    }

    private function extractTechnologiesFromProfile(array $data): array
    {
        $text = strtolower((string) ($data['about'] ?? '') . ' ' . (string) ($data['jobTitle'] ?? ''));

        $found = [];
        foreach ($this->technologyKeywords as $tech) {
            if (str_contains($text, $tech)) {
                $found[] = $tech;
            }
        }

        if (!empty($data['skills']) && is_array($data['skills'])) {
            foreach ($data['skills'] as $skill) {
                $name = strtolower((string) (is_array($skill) ? ($skill['name'] ?? $skill['title'] ?? '') : $skill));
                foreach ($this->technologyKeywords as $tech) {
                    if (str_contains($name, $tech) && !in_array($tech, $found, true)) {
                        $found[] = $tech;
                    }
                }
            }
        }

        return array_values(array_unique($found));
    }

    private function extractExperiencesFromFirebase(array $experiences): array
    {
        if (empty($experiences) || !is_array($experiences)) {
            return [];
        }

        $result = [];
        foreach ($experiences as $exp) {
            if (!is_array($exp)) {
                continue;
            }
            $title = trim((string) ($exp['title'] ?? $exp['poste'] ?? ''));
            $company = trim((string) ($exp['company'] ?? $exp['entreprise'] ?? ''));
            if ($title === '' && $company === '') {
                continue;
            }
            $result[] = $title . ($company !== '' ? ' chez ' . $company : '');
        }

        return array_values(array_unique($result));
    }

    private function extractProjetsFromFirebase(array $projects, array $experiences): array
    {
        $result = [];

        if (!empty($projects) && is_array($projects)) {
            foreach ($projects as $project) {
                if (!is_array($project)) {
                    continue;
                }
                $name = trim((string) ($project['name'] ?? $project['title'] ?? ''));
                if ($name !== '') {
                    $result[] = $name;
                }
            }
        }

        foreach ($experiences as $exp) {
            if (!is_array($exp)) {
                continue;
            }
            $type = strtolower((string) ($exp['type'] ?? ''));
            $title = trim((string) ($exp['title'] ?? ''));
            if ($title !== '' && (str_contains($type, 'projet') || str_contains($type, 'project'))) {
                if (!in_array($title, $result, true)) {
                    $result[] = $title;
                }
            }
        }

        return array_values(array_unique($result));
    }

    private function extractCertificationsFromFirebase(array $certifications): array
    {
        if (empty($certifications) || !is_array($certifications)) {
            return [];
        }

        $result = [];
        foreach ($certifications as $cert) {
            if (is_array($cert)) {
                $name = trim((string) ($cert['name'] ?? $cert['title'] ?? ''));
            } elseif (is_string($cert)) {
                $name = trim($cert);
            } else {
                continue;
            }
            if ($name !== '') {
                $result[] = $name;
            }
        }

        return array_values(array_unique($result));
    }

    private function extractMotivationsFromProfile(array $data): array
    {
        $about = strtolower((string) ($data['about'] ?? ''));
        $prefs = $data['preferences'] ?? [];
        if (!is_array($prefs)) {
            $prefs = [];
        }

        $found = [];
        $motivationKeywords = ['motivé', 'motivation', 'passion', 'passionné', 'impact', 'social', 'utile', 'apprendre', 'progresser'];

        foreach ($motivationKeywords as $keyword) {
            if (str_contains($about, $keyword)) {
                $found[] = $keyword;
            }
        }

        if (!empty($prefs)) {
            foreach ($prefs as $pref) {
                if (is_array($pref)) {
                    $value = trim((string) ($pref['value'] ?? $pref['name'] ?? ''));
                } elseif (is_string($pref)) {
                    $value = trim($pref);
                } else {
                    continue;
                }
                if ($value !== '' && !in_array($value, $found, true)) {
                    $found[] = $value;
                }
            }
        }

        return array_values(array_unique($found));
    }

    private function extractObjectifsFromFirebase(array $preferences): array
    {
        if (empty($preferences) || !is_array($preferences)) {
            return [];
        }

        $result = [];
        foreach ($preferences as $pref) {
            if (is_array($pref)) {
                $value = trim((string) ($pref['value'] ?? $pref['name'] ?? ''));
            } elseif (is_string($pref)) {
                $value = trim($pref);
            } else {
                continue;
            }
            if ($value !== '') {
                $result[] = $value;
            }
        }

        return array_values(array_unique($result));
    }

    public function getInterviewMemory(User $user): array
    {
        return Session::get(self::SESSION_MEMORY_KEY, $this->defaultMemory);
    }

    public function saveInterviewMemory(User $user, array $memory): void
    {
        Session::put(self::SESSION_MEMORY_KEY, $memory);
    }

    public function analyzeResponse(string $message, array $criteria, array $userProfile, array $interviewMemory): array
    {
        $text = mb_strtolower($message, 'UTF-8');
        $criteriaResults = [];
        $presentCount = 0;

        foreach ($criteria as $criterion) {
            $present = $this->isCriterionPresent($text, $criterion, $userProfile, $interviewMemory);
            $criteriaResults[$criterion] = [
                'present' => $present,
                'comment' => $present ? 'Présent dans la réponse.' : 'Absent de la réponse.',
            ];
            if ($present) $presentCount++;
        }

        $score = count($criteria) > 0 ? (int) round(($presentCount / count($criteria)) * 100) : 0;

        if ($score >= 80) {
            $status = 'complete';
        } elseif ($score >= 50) {
            $status = 'partial';
        } elseif ($score >= 1) {
            $status = 'vague';
        } else {
            $status = 'off_topic';
        }

        $extracted = $this->extractContextFromMessage($message, $userProfile);

        return [
            'status' => $status,
            'score' => $score,
            'criteria' => $criteriaResults,
            'extracted_context' => $extracted,
        ];
    }

    private function isCriterionPresent(string $text, string $criterion, array $userProfile, array $interviewMemory): bool
    {
        $keywords = $this->criteriaKeywords[$criterion] ?? [$criterion];
        foreach ($keywords as $keyword) {
            if (str_contains($text, $keyword)) {
                return true;
            }
        }

        $lowerProfile = mb_strtolower(print_r($userProfile, true), 'UTF-8');
        $lowerMemory = '';
        foreach ($interviewMemory['questions'] ?? [] as $q) {
            $lowerMemory .= ' ' . mb_strtolower($q['answer'] ?? '', 'UTF-8');
        }
        $combined = $lowerProfile . ' ' . $lowerMemory;

        foreach ($keywords as $keyword) {
            if (str_contains($combined, $keyword)) {
                return true;
            }
        }

        return false;
    }

    private function extractContextFromMessage(string $message, array $userProfile): array
    {
        $text = $message;
        $lower = mb_strtolower($message, 'UTF-8');

        $context = [
            'nom' => $this->extractName($text),
            'statut' => $this->extractStatut($lower),
            'age' => $this->extractAge($lower),
            'formation' => $this->extractFormation($lower),
            'niveau_etude' => $this->extractNiveauEtude($lower),
            'ecole' => $this->extractEcole($text),
            'domaine' => $this->extractDomaine($lower),
            'poste_recherche' => $this->extractPosteRecherche($lower),
            'competences' => $this->extractCompetences($lower),
            'technologies' => $this->extractTechnologies($lower),
            'experiences' => $this->extractExperiences($text),
            'stages' => $this->extractStages($text),
            'projets' => $this->extractProjets($text),
            'certifications' => $this->extractCertifications($text),
            'motivations' => $this->extractMotivations($lower),
            'forces' => $this->extractForces($lower),
            'faiblesses' => $this->extractFaiblesses($lower),
            'objectifs' => $this->extractObjectifs($lower),
            'valeurs' => $this->extractValeurs($lower),
            'informations_supplementaires' => [],
        ];

        $filtered = [];
        foreach ($context as $key => $value) {
            if ($value === null || $value === '' || $value === []) {
                continue;
            }
            $filtered[$key] = $value;
        }

        return $filtered;
    }

    private function extractName(string $text): ?string
    {
        $patterns = [
            '/je\s+m\'?appelle\s+([a-zA-ZÀ-ÖØ-öø-ÿ\-\'\s]+?)(?:\s*[,.!]|\s+je\s+suis|\s+je\s+travaille|\s+je\s+cherche|\s+je\s+suis\s+passionné|$)/iu',
            '/moi,\s+c\'?est\s+([a-zA-ZÀ-ÖØ-öø-ÿ\-\'\s]+?)(?:\s*[,.!]|\s+je\s+travaille|\s+je\s+cherche|$)/iu',
            '/c\'?est\s+([a-zA-ZÀ-ÖØ-öø-ÿ\-\'\s]+?)(?:\s*[,.!]|\s+je\s+travaille|\s+je\s+cherche|$)/iu',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $text, $matches)) {
                $name = trim($matches[1]);
                $name = preg_replace('/\s+et\s*$/', '', $name);
                $name = trim($name);
                if (mb_strlen($name) >= 2) {
                    return $name;
                }
            }
        }
        return null;
    }

    private function extractStatut(string $lower): ?string
    {
        $statuts = [
            'étudiant' => 'étudiant',
            'salarié' => 'salarié',
            'en poste' => 'salarié',
            'freelance' => 'freelance',
            'indépendant' => 'indépendant',
            'demandeur d\'emploi' => 'demandeur d\'emploi',
            'chercheur d\'emploi' => 'chercheur d\'emploi',
            'stagiaire' => 'stagiaire',
            'alternant' => 'alternant',
        ];
        foreach ($statuts as $keyword => $label) {
            if (str_contains($lower, $keyword)) {
                return $label;
            }
        }
        return null;
    }

    private function extractAge(string $lower): ?string
    {
        if (preg_match('/(\d{1,2})\s*ans/', $lower, $matches)) {
            return $matches[1] . ' ans';
        }
        return null;
    }

    private function extractFormation(string $lower): ?string
    {
        $formations = [
            'bac' => 'Bac',
            'baccalaureat' => 'Baccalauréat',
            'licence' => 'Licence',
            'master' => 'Master',
            'doctorat' => 'Doctorat',
            'but' => 'BUT',
            'bts' => 'BTS',
            'diplôme' => 'Diplôme',
            'diplome' => 'Diplôme',
        ];
        foreach ($formations as $keyword => $label) {
            if (str_contains($lower, $keyword)) {
                return $label;
            }
        }
        return null;
    }

    private function extractNiveauEtude(string $lower): ?string
    {
        if (preg_match('/bac\s*\+?\s*(\d)/i', $lower, $matches)) {
            return 'Bac +' . $matches[1];
        }
        if (str_contains($lower, 'master')) return 'Master';
        if (str_contains($lower, 'licence')) return 'Licence';
        if (str_contains($lower, 'doctorat')) return 'Doctorat';
        if (str_contains($lower, 'but')) return 'BUT';
        if (str_contains($lower, 'bts')) return 'BTS';
        return null;
    }

    private function extractEcole(string $text): ?string
    {
        if (preg_match('/école\s+([a-zA-ZÀ-ÖØ-öø-ÿ\-\'\s]+?)(?:\s*[,.!]|\s+je\s+suis|\s+je\s+travaille|$)/iu', $text, $matches)) {
            return trim($matches[1]);
        }
        if (preg_match('/ecole\s+([a-zA-ZÀ-ÖØ-öø-ÿ\-\'\s]+?)(?:\s*[,.!]|\s+je\s+suis|\s+je\s+travaille|$)/iu', $text, $matches)) {
            return trim($matches[1]);
        }
        return null;
    }

    private function extractDomaine(string $lower): ?string
    {
        $domaines = [
            'informatique' => 'informatique',
            'développement web' => 'développement web',
            'développement mobile' => 'développement mobile',
            'marketing' => 'marketing',
            'finance' => 'finance',
            'commerce' => 'commerce',
            'droit' => 'droit',
            'santé' => 'santé',
            'éducation' => 'éducation',
            'ingénierie' => 'ingénierie',
            'design' => 'design',
            'communication' => 'communication',
            'ressources humaines' => 'ressources humaines',
            'logistique' => 'logistique',
        ];
        foreach ($domaines as $keyword => $label) {
            if (str_contains($lower, $keyword)) {
                return $label;
            }
        }
        return null;
    }

    private function extractPosteRecherche(string $lower): ?string
    {
        $postes = [
            'développeur' => 'développeur',
            'developpeur' => 'développeur',
            'ingénieur' => 'ingénieur',
            'ingenieur' => 'ingénieur',
            'chef de projet' => 'chef de projet',
            'project manager' => 'chef de projet',
            'data scientist' => 'data scientist',
            'analyste' => 'analyste',
            'consultant' => 'consultant',
            'designer' => 'designer',
            'ux designer' => 'UX designer',
            'responsable' => 'responsable',
            'manager' => 'manager',
            'technicien' => 'technicien',
            'commercial' => 'commercial',
            'marketeur' => 'marketeur',
            'chargé de communication' => 'chargé de communication',
        ];
        foreach ($postes as $keyword => $label) {
            if (str_contains($lower, $keyword)) {
                return $label;
            }
        }
        return null;
    }

    private function extractCompetences(string $lower): array
    {
        $keywords = [
            'communication', 'rigueur', 'leadership', 'autonomie', 'créativité',
            'analyse', 'esprit d\'équipe', 'travail en équipe', 'organisation',
            'adaptabilité', 'gestion de projet', 'résolution de problèmes',
            'prise de parole', 'négociation', 'empathie', 'curiosité',
        ];
        $found = [];
        foreach ($keywords as $keyword) {
            if (str_contains($lower, $keyword)) {
                $found[] = $keyword;
            }
        }
        return array_values(array_unique($found));
    }

    private function extractTechnologies(string $lower): array
    {
        $words = preg_split('/\s+/', $lower, -1, PREG_SPLIT_NO_EMPTY);
        $words = array_map(fn($w) => trim($w, ".,;:!?()[]{}'\""), $words);
        $found = [];
        foreach ($this->technologyKeywords as $tech) {
            $techLower = mb_strtolower($tech, 'UTF-8');
            if (in_array($techLower, $words, true)) {
                $found[] = $tech;
            }
        }
        return array_values(array_unique($found));
    }

    private function extractExperiences(string $text): array
    {
        $found = [];
        if (preg_match_all('/(\d+)\s*ans?\s+d\'expérience/i', $text, $matches)) {
            foreach ($matches[0] as $match) {
                $found[] = $match;
            }
        }
        if (preg_match_all('/travaillé\s+([a-zA-ZÀ-ÖØ-öø-ÿ\-\'\s]+?)(?:\s+pendant|\s+pour|\s+comme|$)/iu', $text, $matches)) {
            foreach ($matches[1] as $match) {
                $found[] = trim($match);
            }
        }
        return array_values(array_unique($found));
    }

    private function extractStages(string $text): array
    {
        $found = [];
        if (preg_match_all('/stage\s+de\s+(\d+\s*mois?)\s+chez\s+([a-zA-ZÀ-ÖØ-öø-ÿ\-\'\s]+?)(?:\s*[,.!]|\s+et\s+|\s*$)/iu', $text, $matches, PREG_SET_ORDER)) {
            foreach ($matches as $match) {
                $found[] = trim($match[0]);
            }
        }
        if (preg_match_all('/stage\s+chez\s+([a-zA-ZÀ-ÖØ-öø-ÿ\-\'\s]+?)(?:\s*[,.!]|\s+et\s+|\s*$)/iu', $text, $matches, PREG_SET_ORDER)) {
            foreach ($matches as $match) {
                $found[] = trim($match[0]);
            }
        }
        $found = array_map(fn($s) => rtrim($s, ' et'), $found);
        return array_values(array_unique($found));
    }

    private function extractProjets(string $text): array
    {
        $found = [];
        if (preg_match_all('/projet\s+([a-zA-ZÀ-ÖØ-öø-ÿ\-\'\s]+)/iu', $text, $matches)) {
            foreach ($matches[1] as $match) {
                $found[] = trim($match);
            }
        }
        if (preg_match_all('/développé\s+([a-zA-ZÀ-ÖØ-öø-ÿ\-\'\s]+)/iu', $text, $matches)) {
            foreach ($matches[1] as $match) {
                $found[] = trim($match);
            }
        }
        return array_values(array_unique($found));
    }

    private function extractCertifications(string $text): array
    {
        $found = [];
        if (preg_match_all('/certification\s+([a-zA-ZÀ-ÖØ-öø-ÿ\-\'\s]+)/iu', $text, $matches)) {
            foreach ($matches[1] as $match) {
                $found[] = trim($match);
            }
        }
        return array_values(array_unique($found));
    }

    private function extractMotivations(string $lower): array
    {
        $found = [];
        $keywords = ['motivé', 'motivation', 'intéressé', 'intérêt', 'attire', 'pourquoi', 'ambition', 'objectif'];
        foreach ($keywords as $keyword) {
            if (str_contains($lower, $keyword)) {
                $found[] = $keyword;
            }
        }
        return array_values(array_unique($found));
    }

    private function extractForces(string $lower): array
    {
        $found = [];
        $keywords = ['rigueur', 'communication', 'leadership', 'technique', 'analyse', 'créativité', 'autonomie', 'esprit d\'équipe', 'sérieux', 'ponctuel', 'organisé'];
        foreach ($keywords as $keyword) {
            if (str_contains($lower, $keyword)) {
                $found[] = $keyword;
            }
        }
        return array_values(array_unique($found));
    }

    private function extractFaiblesses(string $lower): array
    {
        $found = [];
        $keywords = ['faiblesse', 'améliorer', 'difficulté', 'problème', 'manque', 'faible', 'corriger'];
        foreach ($keywords as $keyword) {
            if (str_contains($lower, $keyword)) {
                $found[] = $keyword;
            }
        }
        return array_values(array_unique($found));
    }

    private function extractObjectifs(string $lower): array
    {
        $found = [];
        $keywords = ['objectif', 'but', 'projet', 'avenir', 'devenir', 'aspiration', 'souhait'];
        foreach ($keywords as $keyword) {
            if (str_contains($lower, $keyword)) {
                $found[] = $keyword;
            }
        }
        return array_values(array_unique($found));
    }

    private function extractValeurs(string $lower): array
    {
        $found = [];
        $keywords = ['valeur', 'principes', 'éthique', 'culture', 'conviction', 'important', 'essentiel'];
        foreach ($keywords as $keyword) {
            if (str_contains($lower, $keyword)) {
                $found[] = $keyword;
            }
        }
        return array_values(array_unique($found));
    }

    public function generateInterviewReply(array $analysis, string $question, array $userProfile, array $interviewMemory, string $userAnswer): string
    {
        $status = $analysis['status'] ?? 'partial';
        $score = $analysis['score'] ?? 50;
        $criteria = $analysis['criteria'] ?? [];
        $missing = array_keys(array_filter($criteria, fn($c) => !$c['present']));
        $present = array_keys(array_filter($criteria, fn($c) => $c['present']));

        $reply = '';

        if ($status === 'complete') {
            $reply .= "📝 Feedback : Très bonne réponse. Vous présentez clairement votre parcours, vos compétences et votre domaine. La réponse est structurée et permet au recruteur de comprendre rapidement votre profil.";
        } elseif ($status === 'partial') {
            $reply .= "📝 Feedback : Votre réponse est pertinente car vous présentez " . implode(', ', $present) . ". Cependant, elle reste incomplète pour une présentation professionnelle. Il manque notamment " . implode(', ', $missing) . ".";
        } elseif ($status === 'off_topic') {
            $reply .= "📝 Feedback : Votre réponse présente votre profil, mais elle ne répond pas directement à la question. Le recruteur cherche ici à comprendre " . $this->getQuestionIntent($question) . ".";
        } elseif ($status === 'vague') {
            $reply .= "📝 Feedback : Vous avez identifié un élément intéressant, mais la réponse reste trop générale. Pour convaincre un recruteur, vous devriez ajouter un exemple concret.";
        } else {
            $reply .= "📝 Feedback : Votre réponse a été enregistrée.";
        }

        $example = $this->generateExampleWithOllama($analysis, $question, $userProfile, $userAnswer);
        if ($example === '') {
            $example = $this->buildExampleAnswer($analysis, $question, $userProfile, $userAnswer);
        }
        if ($example) {
            if ($status === 'complete') {
                $reply .= "\n\n💡 Réponse améliorée :\n" . $example;
            } else {
                $reply .= "\n\n💡 Exemple de réponse :\n" . $example;
            }
        }

        $nextQuestion = $this->getNextQuestionText($question);
        if ($status === 'off_topic' || $status === 'vague') {
            $reply .= "\n\n🔄 Essayez maintenant de répondre à nouveau à la question :\n\"" . $question . "\"";
        } elseif ($nextQuestion) {
            $reply .= "\n\n❓ Question suivante : " . $nextQuestion;
        }

        return $reply;
    }

    private function generateExampleWithOllama(array $analysis, string $question, array $userProfile, string $userAnswer): string
    {
        $url = rtrim((string) env('OLLAMA_URL', 'http://localhost:11434'), '/');
        $model = (string) env('OLLAMA_MODEL', 'llama3.2:1b');

        $profileJson = json_encode($userProfile, JSON_UNESCAPED_UNICODE);
        $criteriaJson = json_encode($analysis['criteria'] ?? [], JSON_UNESCAPED_UNICODE);

        $systemPrompt = "Tu es VERA. Génère uniquement un exemple de réponse clair et professionnel pour un entretien. "
            . "Règles : 1) NE INVENTE JAMAIS d'information. 2) Utilise UNIQUEMENT les informations présentes dans la réponse du candidat et le profil connu. "
            . "3) Ne mélange pas des champs incompatibles. 4) Si une information manque, utilise une formulation générique sans inventer. "
            . "5) Formate la réponse exactement ainsi : 📝 Feedback : ...\n\n💡 Exemple de réponse : ...\n\n❓ Question suivante : ...\n\n";

        $userPrompt = "Question : " . $question . "\n"
            . "Réponse du candidat : " . $userAnswer . "\n"
            . "Profil connu : " . ($profileJson !== '[]' ? $profileJson : 'aucune information connue') . "\n"
            . "Critères attendus : " . ($criteriaJson !== '[]' ? $criteriaJson : 'aucun critère') . "\n\n"
            . "Génère un exemple de réponse personnalisé basé UNIQUEMENT sur ces informations. "
            . "Ne renvoie pas de texte en dehors des sections demandées.";

        try {
            $response = Http::timeout(15)
                ->post($url . '/api/chat', [
                    'model' => $model,
                    'stream' => false,
                    'options' => [
                        'temperature' => 0.7,
                        'top_p' => 0.9,
                        'max_tokens' => 400,
                    ],
                    'messages' => [
                        ['role' => 'system', 'content' => $systemPrompt],
                        ['role' => 'user', 'content' => $userPrompt],
                    ],
                ]);

            if ($response->successful() || $response->status() === 200) {
                $data = $response->json();
                $reply = trim((string) ($data['message']['content'] ?? $data['response'] ?? ''));

                if ($reply !== '') {
                    return $reply;
                }
            }
        } catch (\Throwable $e) {
            \Log::warning('Ollama example reply failed: ' . $e->getMessage());
        }

        return '';
    }

    private function getQuestionIntent(string $question): string
    {
        $intents = [
            'Parlez-moi de vous.' => 'votre parcours, vos compétences et votre projet professionnel',
            'Quelles sont vos motivations pour ce poste ?' => 'ce qui vous attire dans cette mission et cette entreprise',
            'Quelles sont vos forces ?' => 'vos qualités adaptées au poste',
            'Quelles sont vos faiblesses ?' => 'vos axes d\'amélioration et votre progression',
            'Racontez-moi une situation difficile que vous avez gérée.' => 'votre capacité à résoudre des problèmes',
        ];
        return $intents[$question] ?? 'la réponse attendue';
    }

    private function getNextQuestionText(string $question): ?string
    {
        $map = [
            'Parlez-moi de vous.' => 'Quelles sont vos motivations pour ce poste ?',
            'Quelles sont vos motivations pour ce poste ?' => 'Quelles sont vos forces ?',
            'Quelles sont vos forces ?' => 'Quelles sont vos faiblesses ?',
            'Quelles sont vos faiblesses ?' => 'Racontez-moi une situation difficile que vous avez gérée.',
            'Racontez-moi une situation difficile que vous avez gérée.' => null,
        ];
        return $map[$question] ?? null;
    }

    private function buildExampleAnswer(array $analysis, string $question, array $userProfile, string $userAnswer): string
    {
        $answer = trim($userAnswer);
        if ($answer === '') {
            return '';
        }

        if ($question === 'Parlez-moi de vous.') {
            $text = $answer;

            if (!empty($userProfile['nom']) && !str_contains(mb_strtolower($text), mb_strtolower($userProfile['nom']))) {
                $text = "Je m'appelle " . $userProfile['nom'] . ". " . $text;
            }

            if (!empty($userProfile['formation']) && !str_contains(mb_strtolower($text), mb_strtolower($userProfile['formation']))) {
                $text .= " Je suis diplômé(e) en " . $userProfile['formation'] . ".";
            }

            if (!empty($userProfile['statut']) && !str_contains(mb_strtolower($text), mb_strtolower($userProfile['statut']))) {
                $text = $userProfile['statut'] . ". " . $text;
            }

            if (!empty($userProfile['stages'])) {
                $stageText = "J'ai effectué " . implode(' et ', $userProfile['stages']) . ".";
                if (!str_contains(mb_strtolower($text), mb_strtolower($stageText))) {
                    $text .= " " . $stageText;
                }
            }

            if (!empty($userProfile['technologies'])) {
                $techText = "Je maîtrise notamment " . implode(', ', $userProfile['technologies']) . ".";
                if (!str_contains(mb_strtolower($text), mb_strtolower($techText))) {
                    $text .= " " . $techText;
                }
            }

            if (!empty($userProfile['experiences'])) {
                $expText = "J'ai " . implode(', ', $userProfile['experiences']) . ".";
                if (!str_contains(mb_strtolower($text), mb_strtolower($expText))) {
                    $text .= " " . $expText;
                }
            }

            if (!empty($userProfile['projets'])) {
                $projText = "J'ai réalisé " . implode(', ', $userProfile['projets']) . ".";
                if (!str_contains(mb_strtolower($text), mb_strtolower($projText))) {
                    $text .= " " . $projText;
                }
            }

            $text = trim($text);
            if ($text !== '') {
                $text = mb_strtoupper(mb_substr($text, 0, 1)) . mb_substr($text, 1);
                $text = preg_replace('/\s*\.\s*/', '. ', $text);
                $text = preg_replace('/\s+/', ' ', $text);
                if (!str_ends_with($text, '.')) {
                    $text .= '.';
                }
            }

            if (mb_strlen($text) > 300) {
                $text = mb_substr($text, 0, 300) . '...';
            }

            return $text !== '' ? $text : $answer;
        }

        if ($question === 'Quelles sont vos motivations pour ce poste ?') {
            $parts = [];
            if (!empty($userProfile['valeurs'])) $parts[] = "Je suis motivé par des valeurs comme " . implode(', ', $userProfile['valeurs']);
            if (!empty($userProfile['objectifs'])) $parts[] = "Je souhaite " . implode(', ', $userProfile['objectifs']);

            if ($parts) {
                return implode(', ', $parts) . ".";
            }

            $firstSentence = $answer;
            if (mb_strlen($firstSentence) > 200) {
                $firstSentence = mb_substr($firstSentence, 0, 200) . '...';
            }
            return $firstSentence;
        }

        if ($question === 'Quelles sont vos forces ?') {
            $parts = [];
            if (!empty($userProfile['forces'])) $parts[] = "Mes forces sont : " . implode(', ', $userProfile['forces']);
            if (!empty($userProfile['stages'])) $parts[] = "Par exemple, lors de " . $userProfile['stages'][0] . ", j'ai pu mettre en œuvre ces qualités.";

            if ($parts) {
                return implode('. ', $parts) . ".";
            }

            $firstSentence = $answer;
            if (mb_strlen($firstSentence) > 200) {
                $firstSentence = mb_substr($firstSentence, 0, 200) . '...';
            }
            return $firstSentence;
        }

        if ($question === 'Quelles sont vos faiblesses ?') {
            $parts = [];
            if (!empty($userProfile['faiblesses'])) $parts[] = "Je peux encore améliorer " . implode(', ', $userProfile['faiblesses']);
            if (!empty($userProfile['objectifs'])) $parts[] = "Pour progresser, je " . implode(', ', $userProfile['objectifs']);

            if ($parts) {
                return implode('. ', $parts) . ".";
            }

            $firstSentence = $answer;
            if (mb_strlen($firstSentence) > 200) {
                $firstSentence = mb_substr($firstSentence, 0, 200) . '...';
            }
            return $firstSentence;
        }

        if ($question === 'Racontez-moi une situation difficile que vous avez gérée.') {
            $situation = $userProfile['stages'][0] ?? $userProfile['experiences'][0] ?? $userProfile['projets'][0] ?? null;
            if ($situation) {
                return "Situation : lors de " . $situation . ", j'ai rencontré une difficulté. "
                    . "Tâche : je devais trouver une solution rapide. "
                    . "Action : j'ai analysé le problème et proposé une amélioration. "
                    . "Résultat : la situation a été résolue et j'ai appris l'importance de la communication et de la planification.";
            }

            $firstSentence = $answer;
            if (mb_strlen($firstSentence) > 200) {
                $firstSentence = mb_substr($firstSentence, 0, 200) . '...';
            }
            return $firstSentence;
        }

        $firstSentence = $answer;
        if (mb_strlen($firstSentence) > 200) {
            $firstSentence = mb_substr($firstSentence, 0, 200) . '...';
        }
        return $firstSentence;
    }

    public function summarizeProfile(array $profile): string
    {
        $parts = [];
        if (!empty($profile['nom'])) $parts[] = "nom : " . $profile['nom'];
        if (!empty($profile['statut'])) $parts[] = "statut : " . $profile['statut'];
        if (!empty($profile['formation'])) $parts[] = "formation : " . $profile['formation'];
        if (!empty($profile['niveau_etude'])) $parts[] = "niveau d'étude : " . $profile['niveau_etude'];
        if (!empty($profile['ecole'])) $parts[] = "école : " . $profile['ecole'];
        if (!empty($profile['domaine'])) $parts[] = "domaine : " . $profile['domaine'];
        if (!empty($profile['poste_recherche'])) $parts[] = "poste recherché : " . $profile['poste_recherche'];
        if (!empty($profile['technologies'])) $parts[] = "technologies : " . implode(', ', $profile['technologies']);
        if (!empty($profile['experiences'])) $parts[] = "expériences : " . implode(', ', $profile['experiences']);
        if (!empty($profile['stages'])) $parts[] = "stages : " . implode(', ', $profile['stages']);
        if (!empty($profile['projets'])) $parts[] = "projets : " . implode(', ', $profile['projets']);
        if (!empty($profile['competences'])) $parts[] = "compétences : " . implode(', ', $profile['competences']);

        return $parts ? implode('; ', $parts) : 'aucune information connue pour le moment';
    }

    public function mergeExtractedContext(array $profile, array $extracted): array
    {
        foreach ($extracted as $key => $value) {
            if ($value === null || $value === '' || $value === []) {
                continue;
            }
            if (is_array($value)) {
                if (!isset($profile[$key]) || !is_array($profile[$key])) {
                    $profile[$key] = [];
                }
                foreach ($value as $item) {
                    if (is_string($item) && !in_array($item, $profile[$key], true)) {
                        $profile[$key][] = $item;
                    }
                }
            } else {
                $profile[$key] = $value;
            }
        }
        return $profile;
    }
}
