# 🔧 Gérer les rôles Admin

## ⚡ Commandes Artisan rapides

### Rendre un utilisateur admin
```bash
php artisan user:make-admin email@example.com
```

### Révoquer le rôle admin
```bash
php artisan user:remove-admin email@example.com
```

### Créer un utilisateur admin de test
```bash
php artisan db:seed --class=AdminUserSeeder
```
**Login:** `admin@vera.local` | **Mdp:** `admin12345`

---

## 🔐 Flux de connexion

1. **L'utilisateur se connecte via Firebase** (email/mdp ou Google)
2. **Le script JavaScript récupère le token Firebase**
3. **Appel à `/sync-firebase-auth` avec le token**
4. **Laravel vérifie le token et crée une session**
5. **Redirection automatique selon le rôle:**
   - Admin → `/admin` ✅
   - Chercheur d'emploi → `/tableau-de-bord` ✅

---

## ✅ Solutions déployées

| Problème | Solution |
|----------|----------|
| Pas de synchronisation Firebase ↔ Laravel | Endpoint `/sync-firebase-auth` + AuthController |
| Route `/admin` accessible à tous | Middlewares `auth` + `is.admin` |
| Pas de champ role dans BD Laravel | Migration ajoutant colonne `role` |
| Sécurité insuffisante | Vérification CSRF + Token Firebase |
| Redirection incorrecte | Script JS synchronise avant redirection |

---

## 📋 Fichiers importants

- **Contrôleur:** [`app/Http/Controllers/AuthController.php`](app/Http/Controllers/AuthController.php)
- **Middleware:** [`app/Http/Middleware/IsAdmin.php`](app/Http/Middleware/IsAdmin.php)
- **Routes:** [`routes/web.php`](routes/web.php)
- **Script JS:** [`public/script_L.js`](public/script_L.js)
- **Interface Admin:** [`resources/views/admin.blade.php`](resources/views/admin.blade.php)

---

## 🧪 Tests

### Test 1: Admin Firebase
1. Définir `role: "admin"` dans Firebase Realtime DB pour un utilisateur
2. Se connecter avec cet email
3. ✅ Devrait afficher `/admin`

### Test 2: Admin Laravel
```bash
php artisan db:seed --class=AdminUserSeeder
# Ou: php artisan user:make-admin email@example.com
```
1. Se connecter directement (session Laravel)
2. ✅ Accès à `/admin`

### Test 3: Non-admin
1. Se connecter en tant que chercheur d'emploi
2. Accéder à `/admin`
3. ✅ Redirigé vers `/tableau-de-bord` avec erreur

---

## 🐛 Dépannage

| Symptôme | Solution |
|----------|----------|
| "Accès refusé" en allant à `/admin` | Vérifier que `role = 'admin'` dans BD |
| Redirection infinite | Vérifier les logs: `tail -f storage/logs/laravel.log` |
| Token Firebase invalide | Vérifier la config Firebase dans `config/firebase.php` |
| 419 CSRF error | Vérifier que `<meta name="csrf-token">` existe dans `login.blade.php` |

---

## 📚 Documentation complète

Voir: [`SOLUTION_ADMIN_ACCESS.md`](SOLUTION_ADMIN_ACCESS.md)
