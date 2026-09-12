<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="icon" href="/image/vera1.png">
<meta name="csrf-token" content="{{ csrf_token() }}">
<title>VERA - Connexion / Inscription</title>
<link rel="stylesheet" href="/style_L.css?v=10">
<link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script>
    window.onRecaptchaSuccess = function(token) {
      var btn = document.getElementById('signupSubmitBtn');
      var errorEl = document.getElementById('recaptchaError');
      var tokenInput = document.getElementById('recaptchaToken');
      if (btn) btn.disabled = false;
      if (errorEl) errorEl.textContent = '';
      if (tokenInput) tokenInput.value = token;
    };
    window.onRecaptchaExpired = function() {
      var btn = document.getElementById('signupSubmitBtn');
      var errorEl = document.getElementById('recaptchaError');
      if (btn) btn.disabled = true;
      if (errorEl) errorEl.textContent = 'reCAPTCHA expiré. Veuillez réessayer.';
    };
  </script>
  @if(config('services.recaptcha.enabled'))
    <script src="https://www.google.com/recaptcha/api.js" async defer></script>
  @endif
  </head>
<body>

<div class="auth-app">

  <!-- LEFT PANEL -->
  <aside class="brand-panel">
    <div class="brand-panel-content">
        <!-- <div class="brand" style="flex-direction:column;align-items:center;text-align:center;">
        <div class="brand-logo" style="background:none;border:none;border-radius:0;backdrop-filter:none;width:224px;height:140px; margin: 0 10px -100px -27px;"><img src="/image/veras1.png" alt="VERA" style="width:100%;height:100%;object-fit:contain;"></div>
        <div>
          <img class="brand-name-img" src="/image/veras2.png" alt="VERA">
          <div class="brand-tag">Real Opportunities, Smart Jobs</div>
        </div>
      </div> -->

      <h1 data-home-text="hero_title">Trouvez votre prochaine opportunité.</h1>
      <p data-home-text="hero_subtitle">VERA analyse ton profil et trouve les opportunités adaptées à ton profil pour booster ta carrière 24h/24, 7j/7 .</p>

      <ul class="feature-list">
        <li><span class="feature-icon"><span class="feature-glyph" style="-webkit-mask-image:url(/image/mission.png);mask-image:url(/image/mission.png);"></span></span> <span data-home-text="feature_1">Des offres qui correspondent vraiment à ton profil</span></li>
        <li><span class="feature-icon"><span class="feature-glyph" style="-webkit-mask-image:url(/image/3914260.png);mask-image:url(/image/3914260.png);"></span></span> <span data-home-text="feature_2">Les offres d'emploi boostées automatiquement par l'IA</span></li>
        <li><span class="feature-icon"><span class="feature-glyph" style="-webkit-mask-image:url(/image/3916740.png);mask-image:url(/image/3916740.png);"></span></span> <span data-home-text="feature_3">Un coaching carrière personnalisé</span></li>
      </ul>

      <div class="stats-row">
        <div class="stat-block"><strong id="statMembers">0</strong><span>Membres actifs</span></div>
        <div class="stat-block"><strong id="statCompanies">0</strong><span>Entreprises partenaires</span></div>
        <div class="stat-block"><strong id="statSatisfaction">0%</strong><span>Taux de satisfaction</span></div>
      </div>
    </div>

    <div class="blob blob-1"></div>
    <div class="blob blob-2"></div>
  </aside>

  <!-- RIGHT PANEL -->
  <main class="form-panel">
     <div class="form-wrap">

      <div class="form-brand-header">
        <img class="brand-name-img" src="/image/vera.png" alt="VERA">
      </div>

      <div class="auth-tabs">
        <button class="auth-tab active" data-form="login">Connexion</button>
        <button class="auth-tab" data-form="signup">Inscription</button>
        <span class="auth-tab-indicator" id="tabIndicator"></span>
      </div>

      <!-- LOGIN FORM -->
      <form class="auth-form active" id="loginForm" novalidate>
        <!-- <h2>Content de te revoir</h2> -->
        <p class="form-sub">Connecte-toi pour retrouver tes opportunités.</p>

        <div class="social-row">
          <button type="button" class="social-btn">
            <svg viewBox="0 0 48 48" width="18" height="18"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.4 26.7 36 24 36c-5.2 0-9.6-3.1-11.3-7.6l-6.5 5C9.6 39.6 16.3 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2C39.8 36.6 44 31 44 24c0-1.3-.1-2.7-.4-3.5z"/></svg>
            Google
          </button>
        </div>

        <div class="divider"><span>ou avec ton email</span></div>

        <div class="field-group">
          <label>Adresse email</label>
          <div class="input-wrap">
            <span class="input-icon"><img src="/image/3916651.png" alt="" style="width:16px;height:16px;object-fit:contain;"></span>
            <input type="email" id="loginEmail" placeholder="toi@exemple.com" autocomplete="email">
          </div>
          <span class="field-error" id="loginEmailError"></span>
        </div>

        <div class="field-group">
          <label>Mot de passe</label>
          <div class="input-wrap">
            <span class="input-icon"><img src="/image/3917606.png" alt="" style="width:16px;height:16px;object-fit:contain;"></span>
            <input type="password" id="loginPassword" placeholder="••••••••" autocomplete="current-password">
            <button type="button" class="toggle-pass" data-target="loginPassword"><i class="ph ph-eye"></i></button>
          </div>
          <span class="field-error" id="loginPasswordError"></span>
        </div>

        <div class="form-row">
          <label class="remember">
            <input type="checkbox"> Se souvenir de moi
          </label>
          <a href="#" class="link-forgot" id="forgotLink">Mot de passe oublié ?</a>
        </div>

        <button type="submit" class="btn-submit">Se connecter</button>

        <p class="switch-line">Pas encore de compte ? <button type="button" class="link-switch" data-form="signup">Créer un compte</button></p>

        <div class="store-badges">
          <a href="https://play.google.com/store/apps/details?id=veras.com&pcampaignid=web_share" target="_blank" rel="noopener" class="store-badge-link">
            <img src="{{ asset('image/google-play.png') }}" alt="Télécharger sur Google Play" class="store-badge store-badge-google">
          </a>
          <a href="https://apps.apple.com/" target="_blank" rel="noopener" class="store-badge-link">
            <img src="{{ asset('image/App-Store.png') }}" alt="Télécharger sur l'App Store" class="store-badge store-badge-apple">
          </a>
        </div>
      </form>

      <!-- SIGNUP FORM -->
      <form class="auth-form" id="signupForm" novalidate>
        <h2>Crée ton compte</h2>
        <p class="form-sub">Rejoins VERA et laisse l'IA travailler pour toi.</p>

        <div class="social-row">
          <button type="button" class="social-btn">
            <svg viewBox="0 0 48 48" width="18" height="18"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.4 26.7 36 24 36c-5.2 0-9.6-3.1-11.3-7.6l-6.5 5C9.6 39.6 16.3 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2C39.8 36.6 44 31 44 24c0-1.3-.1-2.7-.4-3.5z"/></svg>
            Google
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
            <span class="input-icon"><img src="/image/3916651.png" alt="" style="width:16px;height:16px;object-fit:contain;"></span>
            <input type="email" id="signupEmail" placeholder="toi@exemple.com">
          </div>
          <span class="field-error" id="signupEmailError"></span>
        </div>

        <div class="field-group">
          <label>Mot de passe</label>
          <div class="input-wrap">
            <span class="input-icon"><img src="/image/3917606.png" alt="" style="width:16px;height:16px;object-fit:contain;"></span>
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
              <span class="input-icon"><img src="/image/3917606.png" alt="" style="width:16px;height:16px;object-fit:contain;"></span>
              <input type="password" id="signupConfirm" placeholder="••••••••">
              <button type="button" class="toggle-pass" data-target="signupConfirm"><i class="ph ph-eye"></i></button>
            </div>
            <span class="field-error" id="signupConfirmError"></span>
            </div>

            <div class="company-toggle-section">
              <div class="toggle-switch-wrap" id="companyToggleWrap">
                <span class="toggle-switch-label">
                  <span class="toggle-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
                  </span>
                  Compte entreprise
                </span>
                <button type="button" class="toggle-switch" id="signupIsCompany" role="switch" aria-checked="false" aria-label="Activer le compte entreprise">
                  <span class="toggle-switch-knob" id="companyToggleKnob">—</span>
                </button>
              </div>

              <div class="company-doc-section" id="companyDocGroup">
                <div class="company-doc-card">
                  <div class="company-doc-header">
                    <div class="company-doc-icon">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    </div>
                    <div class="company-doc-header-text">
                      <span class="company-doc-title">Ajouter un justificatif</span>
                      <span class="company-doc-sub">KBIS, attestation ou document officiel</span>
                    </div>
                  </div>
                  <div class="company-doc-drop" id="companyDocDrop" tabindex="0" role="button">
                    <input type="file" id="signupCompanyDoc" accept=".pdf,.jpg,.jpeg,.png" hidden>
                    <div class="company-doc-drop-content">
                      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="var(--muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      <span class="company-doc-drop-text"><strong>Cliquez pour importer</strong> ou glissez-déposez</span>
                      <span class="company-doc-drop-formats">PDF, JPG, PNG — Max 5 Mo</span>
                    </div>
                    <div class="company-doc-file-info" id="companyDocFileInfo" style="display:none;">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      <span id="companyDocFileName"></span>
                      <button type="button" class="company-doc-remove" id="companyDocRemove" aria-label="Supprimer le fichier">&times;</button>
                    </div>
                  </div>
                  <span class="field-error" id="signupCompanyDocError"></span>
                </div>
              </div>
            </div>

<label class="remember terms">
            <input type="checkbox" id="termsCheckbox">
            J'accepte les <a href="#">Conditions d'utilisation</a> et la <a href="#">Politique de confidentialité</a>
          </label>
          <span class="field-error" id="termsError"></span>

          <div class="field-group">
            <div class="g-recaptcha" data-sitekey="{{ config('services.recaptcha.site_key') }}" data-callback="onRecaptchaSuccess" data-expired-callback="onRecaptchaExpired"></div>
            <span class="field-error" id="recaptchaError"></span>
          </div>

          <input type="hidden" id="recaptchaToken" name="g-recaptcha-response">

          <button type="button" class="btn-submit" id="signupSubmitBtn" disabled>
          <span class="btn-state-icon" id="signupBtnIcon">—</span>
          <span class="btn-label">Créer mon compte</span>
        </button>

        <p class="switch-line">Déjà un compte ? <button type="button" class="link-switch" data-form="login">Se connecter</button></p>
      </form>

      <!-- FORGOT PASSWORD FORM -->
      <form class="auth-form" id="forgotForm" novalidate>
        <h2>Mot de passe oublié ?</h2>
        <p class="form-sub">Saisis ton adresse email : nous t'enverrons un lien pour réinitialiser ton mot de passe.</p>

        <div id="forgotFields">
          <div class="field-group">
            <label>Adresse email</label>
            <div class="input-wrap">
              <span class="input-icon"><img src="/image/3916651.png" alt="" style="width:16px;height:16px;object-fit:contain;"></span>
              <input type="email" id="forgotEmail" placeholder="toi@exemple.com">
            </div>
            <span class="field-error" id="forgotEmailError"></span>
          </div>

          <button type="submit" class="btn-submit">Envoyer le lien</button>

          <p class="switch-line"><button type="button" class="link-switch" data-form="login">Retour à la connexion</button></p>
        </div>

        <div id="forgotDone" style="display:none; text-align:center;">
          <div class="success-icon">✓</div>
          <h2>Email envoyé ✉</h2>
          <p class="form-sub">Un lien de réinitialisation a été envoyé à <strong id="forgotEmailShown"></strong>.</p>
          <button type="button" class="btn-submit" id="forgotBackBtn">Retour à la connexion</button>
        </div>
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
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-storage-compat.js"></script>
<script src="firebase-init.js"></script>

<script src="script_L.js?v=2"></script>
<script>
  // Affiche les valeurs par défaut immédiatement
    (function() {
      var m = document.getElementById('statMembers');
      var s = document.getElementById('statSatisfaction');
      var c = document.getElementById('statCompanies');
      if(m) m.textContent = '—';
      if(s) s.textContent = '—';
      if(c) c.textContent = '—';
    })();

  function formatStat(value) {
    return value >= 1000 ? Math.round(value / 1000) + 'K+' : value + '+';
  }

  function loadRealtimeStats() {
    if (typeof firebase === 'undefined' || !firebase.database) return;

    Promise.all([
      firebase.database().ref('users').once('value'),
      firebase.database().ref('ratings').once('value')
    ]).then(function(snapshots) {
      var users = snapshots[0].val() || {};
      var ratings = snapshots[1].val() || {};
      var members = Object.keys(users).length;
      var companies = Object.keys(users).reduce(function(total, id) {
        return total + ((users[id].role || '').toString().toLowerCase() === 'entreprise' ? 1 : 0);
      }, 0);
      var scores = Object.keys(ratings).map(function(id) {
        return Number(ratings[id].score);
      }).filter(function(score) {
        return Number.isFinite(score);
      });
      var satisfaction = null;
      if (scores.length) {
        var average = scores.reduce(function(sum, score) { return sum + score; }, 0) / scores.length;
        satisfaction = Math.round(average <= 5 ? average * 20 : average);
      }

      document.getElementById('statMembers').textContent = formatStat(members);
      document.getElementById('statCompanies').textContent = formatStat(companies);
      document.getElementById('statSatisfaction').textContent = satisfaction === null ? '—' : satisfaction + '%';
    }).catch(function(error) {
      console.warn('Lecture des statistiques Firebase impossible :', error);
    });
  }

  loadRealtimeStats();

  fetch('/api/home-texts', { signal: AbortSignal.timeout(5000) })
    .then(function(r){return r.json();})
    .then(function(texts){
      Object.keys(texts || {}).forEach(function(key){
        var els = document.querySelectorAll('[data-home-text="' + key + '"]');
        els.forEach(function(el){ el.textContent = texts[key]; });
      });
    })
    .catch(function(err){
      console.warn('Home texts fallback active:', err);
    });

  // Nombre réel de comptes entreprise présents dans Firebase (users avec role = entreprise)
  // Signup form validation with reCAPTCHA
  (function() {
    var signupBtn = document.getElementById('signupSubmitBtn');
    var signupForm = document.getElementById('signupForm');
    var recaptchaError = document.getElementById('recaptchaError');

    // Prevent any native form submission
    signupForm.addEventListener('submit', function(e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    });

    // Prevent Enter key from submitting the form
    ['signupFirstName', 'signupLastName', 'signupEmail', 'signupPassword', 'signupConfirm'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) {
        el.addEventListener('keydown', function(e) {
          if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
          }
        });
      }
    });

    function validateForm() {
      var firstName = document.getElementById('signupFirstName').value.trim();
      var lastName = document.getElementById('signupLastName').value.trim();
      var email = document.getElementById('signupEmail').value.trim();
      var password = document.getElementById('signupPassword').value;
      var confirm = document.getElementById('signupConfirm').value;
      var terms = document.getElementById('termsCheckbox').checked;

      if (!firstName) return 'Veuillez entrer votre prénom';
      if (!lastName) return 'Veuillez entrer votre nom';
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Email invalide';
      if (password.length < 6) return 'Mot de passe trop court (min 6 caractères)';
      if (password !== confirm) return 'Les mots de passe ne correspondent pas';
      if (!terms) return 'Vous devez accepter les conditions';
      return null;
    }

    // Prevent any native form submission
    signupForm.addEventListener('submit', function(e) {
      e.preventDefault();
      e.stopPropagation();
    });

    // Intercept submit button click
    signupBtn.addEventListener('click', function(e) {
      // If reCAPTCHA not validated, button is disabled and click won't reach here
      // But we add a check for safety
      if (this.disabled) {
        recaptchaError.textContent = 'Veuillez valider le reCAPTCHA.';
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      var validationError = validateForm();
      if (validationError) {
        recaptchaError.textContent = validationError;
        return;
      }

      recaptchaError.textContent = '';

      // Show loading state
      var btn = signupForm.querySelector('.btn-submit');
      var original = btn.textContent;
      btn.textContent = "Création du compte...";
      btn.classList.add("loading");

      // Get form data
      var firstName = document.getElementById('signupFirstName').value.trim();
      var lastName = document.getElementById('signupLastName').value.trim();
      var email = document.getElementById('signupEmail').value.trim();
      var password = document.getElementById('signupPassword').value;
      var isCompany = document.getElementById('signupIsCompany') ? document.getElementById('signupIsCompany').getAttribute('aria-checked') === 'true' : false;
      var companyDocInput = document.getElementById('signupCompanyDoc');
      var role = isCompany ? 'entreprise' : 'chercheur_emploi';
      var fullName = (firstName + ' ' + lastName).trim();

      // Create Firebase user
      firebase.auth().createUserWithEmailAndPassword(email, password)
          .then(function(userCredential) {
            var user = userCredential.user;

            var userData = {
              firstName: firstName,
              lastName: lastName,
              fullName: fullName,
              email: email,
              role: role,
              createdAt: firebase.database.ServerValue.TIMESTAMP
            };

            if (isCompany && companyDocInput && companyDocInput.files.length > 0) {
              var file = companyDocInput.files[0];
              return user.getIdToken().then(function(idToken) {
                return uploadCompanyDocToCloudinary(file, idToken).then(function(cloudinaryResult) {
                  if (cloudinaryResult && cloudinaryResult.success) {
                    userData.companyDocUrl = cloudinaryResult.url || '';
                    userData.companyDocName = cloudinaryResult.name || file.name;
                    userData.companyDocPublicId = cloudinaryResult.publicId || '';
                  } else {
                    userData.companyDocUrl = '';
                    userData.companyDocName = file.name;
                  }
                  return firebase.database().ref('users/' + user.uid).set(userData);
                });
              });
            }

            return firebase.database().ref('users/' + user.uid).set(userData);
          })
          .then(function() {
            if (firebase.auth().currentUser) {
              firebase.auth().currentUser.updateProfile({ displayName: fullName });
            }
            btn.textContent = original;
            btn.classList.remove('loading');
            window.location.href = isCompany ? '/entreprise' : '/tableau-de-bord';
          })
          .catch(function(error) {
            btn.textContent = original;
            btn.classList.remove('loading');
            recaptchaError.textContent = firebaseAuthError(error);
          });
    });

    // Helper: upload company doc to Cloudinary
    function getCsrfToken() {
      var meta = document.querySelector('meta[name="csrf-token"]');
      return meta ? meta.getAttribute('content') : '';
    }
    function uploadCompanyDocToCloudinary(file, idToken) {
      var formData = new FormData();
      formData.append('file', file);
      formData.append('_token', getCsrfToken());
      return fetch('/upload-company-doc', {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': getCsrfToken(),
          'Authorization': 'Bearer ' + (idToken || '')
        },
        body: formData
      }).then(function(response) {
        return response.json().then(function(data) {
          if (!response.ok) {
            var error = new Error(data.message || 'Erreur upload Cloudinary');
            error.response = response;
            error.data = data;
            throw error;
          }
          return data;
        });
      });
    }
  })();
</script>
</body>
</html>
