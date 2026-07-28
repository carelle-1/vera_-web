<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Kreait\Firebase\Auth;
use Kreait\Firebase\Database;

class FormationsController extends Controller
{
    private function verifyFirebaseToken(Request $request): ?string
    {
        $authHeader = $request->header('Authorization');
        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            \Log::warning('[FORMATIONS] missing auth header');
            return null;
        }

        $idToken = substr($authHeader, 7);
        try {
            /** @var Auth $auth */
            $auth = app('firebase.auth');
            $verifiedIdToken = $auth->verifyIdToken($idToken);
            return $verifiedIdToken->claims()->get('sub');
        } catch (\Throwable $e) {
            \Log::warning('[FORMATIONS] token verify failed', ['message' => $e->getMessage()]);
            return null;
        }
    }

    public function data(Request $request)
    {
        try {
            $offline = (bool) $request->headers->get('X-Offline-Mode');
            $uid = null;

            if (!$offline) {
                $uid = $this->verifyFirebaseToken($request);
                if (!$uid) {
                    return response()->json(['success' => false, 'message' => 'Non autorisé'], 401);
                }
            }

            /** @var Database $db */
            $db = app('firebase.database');

            $formationsRef = $db->getReference('formations');
            $formationsSnapshot = $formationsRef->getSnapshot();
            $allFormations = $formationsSnapshot->hasChildren() ? $formationsSnapshot->getValue() : [];

            $userFormations = [];
            $userData = [];
            $objectives = [];
            $skills = [];

            if ($uid) {
                $userFormationsSnapshot = $db->getReference('users/' . $uid . '/formations')->getSnapshot();
                $userFormations = $userFormationsSnapshot->hasChildren() ? $userFormationsSnapshot->getValue() : [];

                $userSnapshot = $db->getReference('users/' . $uid)->getSnapshot();
                $userData = $userSnapshot->hasChildren() ? $userSnapshot->getValue() : [];

                $objectivesSnapshot = $db->getReference('users/' . $uid . '/objectives')->getSnapshot();
                $objectives = $objectivesSnapshot->hasChildren() ? $objectivesSnapshot->getValue() : [];

                $skillsSnapshot = $db->getReference('users/' . $uid . '/skills')->getSnapshot();
                $skills = $skillsSnapshot->hasChildren() ? $skillsSnapshot->getValue() : [];
            }

            $objective = null;
            if (!empty($objectives)) {
                $first = array_values($objectives)[0] ?? null;
                if ($first) {
                    $objective = [
                        'title' => (string) ($first['title'] ?? ''),
                        'category' => (string) ($first['category'] ?? ''),
                        'targetDate' => (string) ($first['targetDate'] ?? ''),
                        'description' => (string) ($first['description'] ?? ''),
                    ];
                }
            }

            $categoryCounts = [];
            if (!empty($allFormations)) {
                foreach ($allFormations as $formation) {
                    $cat = (string) ($formation['category'] ?? 'Général');
                    if (!isset($categoryCounts[$cat])) {
                        $categoryCounts[$cat] = 0;
                    }
                    $categoryCounts[$cat]++;
                }
            }

            $recoFormations = [];
            if (!empty($allFormations)) {
                $items = array_values($allFormations);

                if ($objective && !empty($objective['category'])) {
                    $targetCategory = strtolower($objective['category']);
                    $categoryMatches = array_filter($items, function ($f) use ($targetCategory) {
                        return stripos((string) ($f['category'] ?? ''), $targetCategory) !== false;
                    });

                    $categoryMatches = array_values($categoryMatches);

                    if (count($categoryMatches) >= 3) {
                        $recoFormations = array_slice($categoryMatches, 0, 4);
                    } else {
                        $remaining = 4 - count($categoryMatches);
                        $others = array_filter($items, function ($f) use ($targetCategory) {
                            return stripos((string) ($f['category'] ?? ''), $targetCategory) === false;
                        });
                        $others = array_values($others);
                        shuffle($others);
                        $recoFormations = array_merge($categoryMatches, array_slice($others, 0, $remaining));
                    }
                } else {
                    shuffle($items);
                    $recoFormations = array_slice($items, 0, 4);
                }
            }

            $continueFormations = [];
            if (!empty($userFormations)) {
                foreach ($userFormations as $formation) {
                    $hasProgressFields = isset($formation['progress']) || isset($formation['remaining']) || isset($formation['value']);

                    if ($hasProgressFields) {
                        $continueFormations[] = [
                            'id' => (string) ($formation['id'] ?? ''),
                            'icon' => (string) ($formation['icon'] ?? '🎓'),
                            'bg' => (string) ($formation['bg'] ?? '#3b6bf5'),
                            'title' => (string) ($formation['title'] ?? 'Formation'),
                            'level' => (string) ($formation['level'] ?? 'Intermédiaire'),
                            'levelClass' => in_array(strtolower($formation['level'] ?? ''), ['débutant', 'debutant']) ? 'beginner' : 'intermediate',
                            'value' => (int) ($formation['progress'] ?? $formation['value'] ?? 0),
                            'remaining' => (string) ($formation['remaining'] ?? 'En cours'),
                        ];
                    } else {
                        $diploma = (string) ($formation['diploma'] ?? $formation['title'] ?? 'Formation');
                        $school = (string) ($formation['school'] ?? '');
                        $endYear = (string) ($formation['endYear'] ?? '');
                        $title = $school ? $diploma . ' — ' . $school : $diploma;

                        $level = 'Intermédiaire';
                        $levelClass = 'intermediate';
                        if (!empty($formation['level'])) {
                            $level = (string) $formation['level'];
                            $levelClass = in_array(strtolower($formation['level']), ['débutant', 'debutant']) ? 'beginner' : 'intermediate';
                        }

                        $progress = 50;
                        if ($endYear === 'Présent' || $endYear === '') {
                            $progress = 50;
                            $remaining = 'En cours';
                        } else {
                            $remaining = 'Terminée';
                            $progress = 100;
                            $levelClass = 'intermediate';
                        }

                        $continueFormations[] = [
                            'id' => (string) ($formation['id'] ?? ''),
                            'icon' => '🎓',
                            'bg' => '#3b6bf5',
                            'title' => $title,
                            'level' => $level,
                            'levelClass' => $levelClass,
                            'value' => $progress,
                            'remaining' => $remaining,
                        ];
                    }
                }
            }

            $firstName = '';
            $learningStreak = 0;
            if (!empty($userData)) {
                $firstName = trim((string) ($userData['firstName'] ?? ($userData['fullName'] ?? '')));
                if ($firstName === '') {
                    $parts = explode(' ', (string) ($userData['fullName'] ?? ''));
                    $firstName = $parts[0] ?? '';
                }
                $stats = $userData['stats'] ?? [];
                $learningStreak = isset($stats['learningStreak']) ? (int) $stats['learningStreak'] : 0;
            }

            $categories = [];
            if (!empty($categoryCounts)) {
                $icons = ["🎨", "💻", "💼", "📣", "📊", "🤝", "🎓", "📱", "☁️", "🔐"];
                $i = 0;
                foreach ($categoryCounts as $name => $count) {
                    $categories[] = [
                        'icon' => $icons[$i % count($icons)],
                        'title' => $name,
                        'count' => $count . ' formation' . ($count > 1 ? 's' : ''),
                    ];
                    $i++;
                }
                usort($categories, function ($a, $b) {
                    return $b['count'] <=> $a['count'];
                });
            }

            $globalProgress = 0;
            if (!empty($continueFormations)) {
                $total = array_reduce($continueFormations, function ($sum, $f) {
                    return $sum + (int) ($f['value'] ?? 0);
                }, 0);
                $globalProgress = (int) round($total / count($continueFormations));
            }

            return response()->json([
                'success' => true,
                'objective' => $objective,
                'continueFormations' => $continueFormations,
                'recoFormations' => array_values($recoFormations),
                'categories' => $categories,
                'hero' => [
                    'firstName' => $firstName,
                    'globalProgress' => $globalProgress,
                    'learningStreak' => $learningStreak,
                ],
            ]);
        } catch (\Throwable $e) {
            \Log::error('[FORMATIONS] data error', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement des formations.',
            ], 500);
        }
    }
}
