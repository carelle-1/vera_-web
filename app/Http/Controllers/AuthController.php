<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Kreait\Firebase\Contract\Auth;
use Kreait\Firebase\Contract\Database;
use Illuminate\Support\Facades\Auth as LaravelAuth;
use App\Models\User;

class AuthController extends Controller
{
    /**
     * Synchronise l'authentification Firebase avec Laravel
     */
    public function syncFirebaseAuth(Request $request)
    {
        try {
            $idToken = $request->input('idToken');

            if (!$idToken) {
                return response()->json(['error' => 'Token requis'], 400);
            }

            /** @var Auth $auth */
            $auth = app('firebase.auth');
            $verifiedIdToken = $auth->verifyIdToken($idToken);
            
            $uid = $verifiedIdToken->claims()->get('sub');
            $email = $verifiedIdToken->claims()->get('email');

            /** @var Database $database */
            $database = app('firebase.database');
            $userRef = $database->getReference('users/' . $uid);
            $userData = $userRef->getSnapshot()->getValue();

            if (!$userData) {
                $userRef = $database->getReference('users/users/' . $uid);
                $userData = $userRef->getSnapshot()->getValue();
            }

            if (!$userData) {
                return response()->json(['error' => 'Utilisateur non trouvé'], 404);
            }

            $role = strtolower($userData['role'] ?? 'chercheur_emploi');
            $name = trim(($userData['fullName'] ?? ($userData['firstName'] ?? '') . ' ' . ($userData['lastName'] ?? '')));

            // Synchronise ou crée l'utilisateur dans la BD Laravel
            $user = User::updateOrCreate(
                ['email' => $email],
                [
                    'name' => $name ?: $email,
                    'password' => bcrypt(uniqid()), // Mot de passe aléatoire car utilisateur Firebase
                    'role' => $role,
                ]
            );

            // Crée une session Laravel
            LaravelAuth::login($user, remember: true);

            return response()->json([
                'success' => true,
                'role' => $role,
                'redirect' => $role === 'admin' ? '/admin' : '/tableau-de-bord'
            ]);
        } catch (\Exception $e) {
            \Log::error('Firebase sync error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Déconnexion
     */
    public function logout()
    {
        LaravelAuth::logout();
        return redirect('/');
    }
}
