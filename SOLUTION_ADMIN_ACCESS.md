# Solution: Accès Admin Firebase → Laravel

## Problème identifié
Les utilisateurs admins ne pouvaient pas accéder à `/admin` même après authentification Firebase, car la route n'était pas synchronisée avec Laravel.

## Solution implémentée

### 1. **Ajout du champ `role` à la table users**
- Migration créée: `database/migrations/2025_01_17_000003_add_role_to_users_table.php`
- Ajoute une colonne `role` avec les valeurs: 'admin' ou 'job_seeker' (défaut)
- ✅ Migration exécutée: `php artisan migrate`

### 2. **Middleware d'authentification admin**
- Fichier: `app/Http/Middleware/IsAdmin.php`
- Vérifie que:
  - L'utilisateur est authentifié
  - L'utilisateur a le rôle 'admin'
- Redirige les non-admins vers `/tableau-de-bord` avec message d'erreur

### 3. **Contrôleur de synchronisation Firebase**
- Fichier: `app/Http/Controllers/AuthController.php`
- Endpoint: `POST /sync-firebase-auth`
- Reçoit le token Firebase du client
- Vérifie le token avec Firebase Admin SDK
- Récupère les données utilisateur (rôle) depuis Firebase Realtime Database
- Crée/met à jour l'utilisateur dans la BD Laravel
- Crée une session Laravel
- Retourne la redirection appropriée

### 4. **Modification des routes**
- Fichier: `routes/web.php`
- Route `/admin` protégée par middlewares: `['auth', 'is.admin']`
- Nouvelle route: `POST /sync-firebase-auth` pour la synchronisation
- Nouvelle route: `POST /logout` pour déconnexion

### 5. **Mise à jour du modèle User**
- Fichier: `app/Models/User.php`
- Ajout du champ `role` dans `$fillable`

### 6. **Synchronisation de l'authentification côté client**
- Fichier: `public/script_L.js`
- Après login/signup Firebase réussi:
  - Récupère le token Firebase
  - Appelle `/sync-firebase-auth` avec le token
  - Laravel vérifie et crée la session
  - Redirige vers `/admin` (si admin) ou `/tableau-de-bord` (si chercheur d'emploi)

### 7. **Ajout du CSRF token**
- Fichier: `resources/views/login.blade.php`
- Ajout de: `<meta name="csrf-token" content="{{ csrf_token() }}">`
- Permet les requêtes POST sécurisées

### 8. **Interface admin mise à jour**
- Fichier: `resources/views/admin.blade.php`
- Affiche le nom et rôle de l'utilisateur connecté
- Bouton de déconnexion

## Pour tester

### Option 1: Créer un admin Firebase manuel
1. Dans Firebase Console, créer/modifier un utilisateur Firebase
2. Dans Firebase Realtime Database: `users/{uid}/role` = "admin"
3. Se connecter avec cet email/mdp
4. ✅ Devrait afficher `/admin`

### Option 2: Utiliser le seeder Laravel (base de données locale)
```bash
php artisan db:seed --class=AdminUserSeeder
```
Crée un utilisateur admin local:
- Email: `admin@vera.local`
- Mot de passe: `admin12345`
- Rôle: `admin`

## Architecture du flux

```
Client (Firebase Login)
    ↓
Firebase Auth réussit
    ↓
Récupère token Firebase
    ↓
POST /sync-firebase-auth {idToken}
    ↓
AuthController@syncFirebaseAuth
    ├─ Vérifie le token (Firebase Admin SDK)
    ├─ Récupère le rôle (Firebase Realtime DB)
    ├─ Crée/met à jour User (Laravel DB)
    ├─ Crée session Laravel (Auth::login())
    └─ Retourne {redirect: '/admin' ou '/tableau-de-bord'}
    ↓
Redirection sécurisée
    ↓
GET /admin (middleware auth + is.admin)
    ├─ Vérifie session ✅
    ├─ Vérifie role === 'admin' ✅
    └─ Affiche admin.blade.php
```

## Fichiers modifiés/créés

✅ **Créés:**
- `app/Http/Controllers/AuthController.php`
- `app/Http/Middleware/IsAdmin.php`
- `database/migrations/2025_01_17_000003_add_role_to_users_table.php`
- `database/seeders/AdminUserSeeder.php`

✅ **Modifiés:**
- `app/Models/User.php` (ajout du champ role dans $fillable)
- `routes/web.php` (protection de /admin, nouvelle route /sync-firebase-auth)
- `bootstrap/app.php` (enregistrement du middleware is.admin)
- `public/script_L.js` (synchronisation Firebase → Laravel)
- `resources/views/login.blade.php` (ajout du CSRF token meta)
- `resources/views/admin.blade.php` (affichage utilisateur et bouton déconnexion)

## Notes importantes

1. **Firebase Admin SDK**: Le projet utilise déjà `kreait/laravel-firebase`, donc c'est compatible
2. **CSRF Protection**: La synchronisation est protégée par CSRF
3. **Sécurité**: Le rôle est toujours vérifié côté serveur, pas seulement côté client
4. **Synchronisation**: La première fois qu'un utilisateur Firebase se connecte, il est créé dans Laravel
5. **Mise à jour**: Si le rôle change dans Firebase, la prochaine connexion synchronisera automatiquement
