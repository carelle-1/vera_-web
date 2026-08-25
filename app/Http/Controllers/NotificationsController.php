<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Kreait\Firebase\Auth;
use Kreait\Firebase\Database;

class NotificationsController extends Controller
{
    private function verifyFirebaseToken(Request $request): ?string
    {
        $authHeader = $request->header('Authorization');
        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            \Log::warning('[NOTIFICATIONS] missing auth header');
            return null;
        }

        $idToken = substr($authHeader, 7);
        try {
            /** @var Auth $auth */
            $auth = app('firebase.auth');
            $verifiedIdToken = $auth->verifyIdToken($idToken);
            return $verifiedIdToken->claims()->get('sub');
        } catch (\Throwable $e) {
            \Log::warning('[NOTIFICATIONS] token verify failed', ['message' => $e->getMessage()]);
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

            $notifications = [];
            $summary = [
                'unread' => 0,
                'week' => 0,
                'month' => 0,
                'total' => 0,
            ];

            if ($uid) {
                $notifRef = $db->getReference('users/' . $uid . '/notifications');
                $notifSnapshot = $notifRef->getSnapshot();

                if ($notifSnapshot->hasChildren()) {
                    $raw = $notifSnapshot->getValue() ?: [];
                    $items = [];
                    foreach ($raw as $id => $notif) {
                        $items[] = [
                            'id' => (string) $id,
                            'group' => (string) ($notif['group'] ?? 'Autre'),
                            'type' => (string) ($notif['type'] ?? 'systeme'),
                            'unread' => (bool) ($notif['unread'] ?? true),
                            'icon' => (string) ($notif['icon'] ?? '🔔'),
                            'iconBg' => (string) ($notif['iconBg'] ?? '#94a3b8'),
                            'tag' => (string) ($notif['tag'] ?? 'Notification'),
                            'tagClass' => (string) ($notif['tagClass'] ?? 'gray'),
                            'title' => (string) ($notif['title'] ?? ''),
                            'desc' => (string) ($notif['desc'] ?? ''),
                            'chips' => is_array($notif['chips'] ?? null) ? $notif['chips'] : [],
                            'time' => (string) ($notif['time'] ?? ''),
                            'createdAt' => (string) ($notif['createdAt'] ?? ''),
                            'logoURL' => (string) ($notif['logoURL'] ?? ''),
                        ];
                    }

                    usort($items, function ($a, $b) {
                        return strcmp($b['createdAt'], $a['createdAt']);
                    });

                    $notifications = $items;

                    $now = new \DateTime();
                    $weekStart = (new \DateTime())->modify('-7 days');
                    $monthStart = (new \DateTime())->modify('-30 days');

                    foreach ($items as $notif) {
                        $summary['total']++;
                        if ($notif['unread']) {
                            $summary['unread']++;
                        }

                        $createdAt = $notif['createdAt'] ?? null;
                        if ($createdAt) {
                            try {
                                $date = new \DateTime($createdAt);
                                if ($date >= $weekStart) $summary['week']++;
                                if ($date >= $monthStart) $summary['month']++;
                            } catch (\Throwable $e) {
                            }
                        }
                    }
                }
            }

            $filteredByType = [
                'all' => count($notifications),
                'unread' => $summary['unread'],
                'opportunites' => count(array_filter($notifications, fn($n) => $n['type'] === 'opportunites')),
                'candidatures' => count(array_filter($notifications, fn($n) => $n['type'] === 'candidatures')),
                'formations' => count(array_filter($notifications, fn($n) => $n['type'] === 'formations')),
                'systeme' => count(array_filter($notifications, fn($n) => $n['type'] === 'systeme')),
            ];

            return response()->json([
                'success' => true,
                'notifications' => $notifications,
                'summary' => $summary,
                'counts' => $filteredByType,
            ]);
        } catch (\Throwable $e) {
            \Log::error('[NOTIFICATIONS] data error', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement des notifications.',
            ], 500);
        }
    }
}
