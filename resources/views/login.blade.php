<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>VERA - Connexion / Inscription</title>
<link rel="stylesheet" href="style_L.css">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css" />
</head>
<body>

<div class="auth-app">

  <!-- LEFT PANEL -->
  <aside class="brand-panel">
    <div class="brand-panel-content">
      <div class="brand">
        <div class="brand-logo">V</div>
        <div>
          <div class="brand-name">VERA</div>
          <div class="brand-tag">Real Opportunities, Smart Jobs</div>
        </div>
      </div>

      <h1>Ta prochaine opportunité<br>commence ici.</h1>
      <p>VERA analyse ton profil 24h/24 et te connecte aux meilleures opportunités, formations et coachs pour booster ta carrière.</p>

      <ul class="feature-list">
        <li><span class="feature-icon">🎯</span> Des offres qui correspondent vraiment à ton profil</li>
        <li><span class="feature-icon">🚀</span> Candidatures automatiques boostées par l'IA</li>
        <li><span class="feature-icon">📈</span> Un coaching carrière personnalisé</li>
      </ul>

      <div class="stats-row">
        <div class="stat-block"><strong>120K+</strong><span>Membres actifs</span></div>
        <div class="stat-block"><strong>8 500+</strong><span>Entreprises partenaires</span></div>
        <div class="stat-block"><strong>92%</strong><span>Taux de satisfaction</span></div>
      </div>
    </div>

    <div class="blob blob-1"></div>
    <div class="blob blob-2"></div>
    <div class="floating-robot">🤖</div>
  </aside>

  <!-- RIGHT PANEL -->
  <main class="form-panel">
    <div class="form-wrap">

      <div class="mobile-brand">
        <div class="brand-logo">V</div>
        <div class="brand-name">VERA</div>
      </div>

      <div class="auth-tabs">
        <button class="auth-tab active" data-form="login">Connexion</button>
        <button class="auth-tab" data-form="signup">Inscription</button>
        <span class="auth-tab-indicator" id="tabIndicator"></span>
      </div>

      <!-- LOGIN FORM -->
      <form class="auth-form active" id="loginForm" novalidate>
        <h2>Content de te revoir 👋</h2>
        <p class="form-sub">Connecte-toi pour retrouver tes opportunités.</p>

        <div class="social-row">
          <button type="button" class="social-btn">
            <svg viewBox="0 0 48 48" width="18" height="18"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.4 26.7 36 24 36c-5.2 0-9.6-3.1-11.3-7.6l-6.5 5C9.6 39.6 16.3 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2C39.8 36.6 44 31 44 24c0-1.3-.1-2.7-.4-3.5z"/></svg>
            Google
          </button>
          <button type="button" class="social-btn">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="#0A66C2"><path d="M20.45 20.45h-3.56v-5.58c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.68H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.61 0 4.28 2.38 4.28 5.47v6.27zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.56V9h3.56v11.45z"/></svg>
            LinkedIn
          </button>
        </div>

        <div class="divider"><span>ou avec ton email</span></div>

        <div class="field-group">
          <label>Adresse email</label>
          <div class="input-wrap">
            <span class="input-icon"><i class="ph ph-envelope-simple"></i></span>
            <input type="email" id="loginEmail" placeholder="toi@exemple.com" autocomplete="email">
          </div>
          <span class="field-error" id="loginEmailError"></span>
        </div>

        <div class="field-group">
          <label>Mot de passe</label>
          <div class="input-wrap">
            <span class="input-icon"><i class="ph ph-lock-key"></i></span>
            <input type="password" id="loginPassword" placeholder="••••••••" autocomplete="current-password">
            <button type="button" class="toggle-pass" data-target="loginPassword"><i class="ph ph-eye"></i></button>
          </div>
          <span class="field-error" id="loginPasswordError"></span>
        </div>

        <div class="form-row">
          <label class="remember">
            <input type="checkbox"> Se souvenir de moi
          </label>
          <a href="#" class="link-forgot">Mot de passe oublié ?</a>
        </div>

        <button type="submit" class="btn-submit">Se connecter</button>

        <p class="switch-line">Pas encore de compte ? <button type="button" class="link-switch" data-form="signup">Créer un compte</button></p>
      </form>

      <!-- SIGNUP FORM -->
      <form class="auth-form" id="signupForm" novalidate>
        <h2>Crée ton compte 🚀</h2>
        <p class="form-sub">Rejoins VERA et laisse l'IA travailler pour toi.</p>

        <div class="social-row">
          <button type="button" class="social-btn">
            <svg viewBox="0 0 48 48" width="18" height="18"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.4 26.7 36 24 36c-5.2 0-9.6-3.1-11.3-7.6l-6.5 5C9.6 39.6 16.3 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2C39.8 36.6 44 31 44 24c0-1.3-.1-2.7-.4-3.5z"/></svg>
            Google
          </button>
          <button type="button" class="social-btn">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="#0A66C2"><path d="M20.45 20.45h-3.56v-5.58c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.68H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.61 0 4.28 2.38 4.28 5.47v6.27zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.56V9h3.56v11.45z"/></svg>
            LinkedIn
          </button>
        </div>

        <div class="divider"><span>ou avec ton email</span></div>

        <div class="field-row">
          <div class="field-group">
            <label>Prénom</label>
            <input type="text" id="signupFirstName" placeholder="Junior">
            <span class="field-error" id="signupFirstNameError"></span>
          </div>
          <div class="field-group">
            <label>Nom</label>
            <input type="text" id="signupLastName" placeholder="Tchouaka">
            <span class="field-error" id="signupLastNameError"></span>
          </div>
        </div>

        <div class="field-group">
          <label>Adresse email</label>
          <div class="input-wrap">
            <span class="input-icon"><i class="ph ph-envelope-simple"></i></span>
            <input type="email" id="signupEmail" placeholder="toi@exemple.com">
          </div>
          <span class="field-error" id="signupEmailError"></span>
        </div>

        <div class="field-group">
          <label>Mot de passe</label>
          <div class="input-wrap">
            <span class="input-icon"><i class="ph ph-lock-key"></i></span>
            <input type="password" id="signupPassword" placeholder="6 caractères minimum">
            <button type="button" class="toggle-pass" data-target="signupPassword"><i class="ph ph-eye"></i></button>
          </div>
          <div class="strength-bar"><span id="strengthFill"></span></div>
          <span class="field-hint" id="strengthLabel">Force du mot de passe</span>
          <span class="field-error" id="signupPasswordError"></span>
        </div>

        <div class="field-group">
          <label>Confirmer le mot de passe</label>
          <div class="input-wrap">
            <span class="input-icon"><i class="ph ph-lock-key"></i></span>
            <input type="password" id="signupConfirm" placeholder="••••••••">
            <button type="button" class="toggle-pass" data-target="signupConfirm"><i class="ph ph-eye"></i></button>
          </div>
          <span class="field-error" id="signupConfirmError"></span>
        </div>

        <label class="remember terms">
          <input type="checkbox" id="termsCheckbox">
          J'accepte les <a href="#">Conditions d'utilisation</a> et la <a href="#">Politique de confidentialité</a>
        </label>
        <span class="field-error" id="termsError"></span>

        <button type="submit" class="btn-submit">Créer mon compte</button>

        <p class="switch-line">Déjà un compte ? <button type="button" class="link-switch" data-form="login">Se connecter</button></p>
      </form>

      <!-- SUCCESS MESSAGE -->
      <div class="success-box" id="successBox">
        <div class="success-icon">✓</div>
        <h2 id="successTitle">C'est fait !</h2>
        <p id="successText">Ton compte a bien été créé.</p>
        <button class="btn-submit" id="successBtn">Continuer</button>
      </div>

    </div>
  </main>
</div>

<!-- ============== FIREBASE JS SDK ============== -->
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-database-compat.js"></script>
<script>
  // ============================================================
  // REMPLACE les valeurs ci-dessous par la config de ton app WEB "veraWEB"
  // Firebase console > ⚙️ Paramètres du projet > Tes applications > veraWEB
  // Clique sur "Configuration SDK" et copie l'objet firebaseConfig ici.
  // ============================================================
  const firebaseConfig = {
    apiKey: "AIzaSyBO5-S2_H3A0thQKcHUoJcNuV8NTyFvJ2E",
    authDomain: "vera-1bd37.firebaseapp.com",
    databaseURL: "https://vera-1bd37-default-rtdb.firebaseio.com",
    projectId: "vera-1bd37",
    storageBucket: "vera-1bd37.firebasestorage.app",
    messagingSenderId: "888356143778",
    appId: "1:888356143778:web:00d6715acc2be2f8b04dfb",
    measurementId: "G-G7307XNQM5"
  };
  firebase.initializeApp(firebaseConfig);
</script>

<script src="script_L.js"></script>
</body>
</html>
