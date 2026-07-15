<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>VERA - Mon Profil</title>
<link rel="stylesheet" href="style_P.css">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css" />
</head>
<body>

<div class="app">

  <!-- SIDEBAR -->
  <aside class="sidebar">
    <div class="brand">
      <div class="brand-logo">V</div>
      <div>
        <div class="brand-name">VERA</div>
        <div class="brand-tag">Real Opportunities, Smart Jobs</div>
      </div>
    </div>

    <nav class="nav">
      <a class="nav-item" href="#">
        <svg viewBox="0 0 24 24"><path d="M4 11L12 4l8 7"/><path d="M6 10v9h5v-6h2v6h5v-9"/></svg>
        Tableau de bord
      </a>
      <a class="nav-item" href="#">
        <svg viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        Opportunités
      </a>
      <a class="nav-item" href="#">
        <svg viewBox="0 0 24 24"><path d="M6 3h9l3 3v15H6z"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>
        Candidatures
      </a>
      <a class="nav-item active" href="#">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>
        Profil
        <span class="pill">100%</span>
      </a>
      <a class="nav-item" href="#">
        <svg viewBox="0 0 24 24"><path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"/></svg>
        Coaching &amp; Carrière
      </a>
      <a class="nav-item" href="#">
        <svg viewBox="0 0 24 24"><path d="M2 8l10-5 10 5-10 5z"/><path d="M6 10.5V16c0 1.5 2.5 3 6 3s6-1.5 6-3v-5.5"/></svg>
        Formations
      </a>
      <a class="nav-item" href="#">
        <svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>
        Messages
        <span class="pill blue">12</span>
      </a>
      <a class="nav-item" href="#">
        <svg viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>
        Notifications
        <span class="pill red">8</span>
      </a>
      <a class="nav-item" href="#">
        <svg viewBox="0 0 24 24"><path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z"/></svg>
        Favoris
      </a>
      <a class="nav-item" href="#">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.6 1H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.6 1z"/></svg>
        Paramètres
      </a>
    </nav>

    <div class="premium-card">
      <div class="premium-crown">👑</div>
      <div class="premium-title">Passez à Premium</div>
      <div class="premium-text">Débloquez toutes les fonctionnalités avancées et multipliez vos opportunités.</div>
      <button class="premium-btn">Passer Premium →</button>
    </div>

    <div class="help">
      <div class="help-icon">🎧</div>
      <div>
        <div class="help-title">Besoin d'aide ?</div>
        <div class="help-sub">Discutez avec notre support</div>
      </div>
    </div>
  </aside>

  <!-- MAIN -->
  <main class="main">

    <!-- TOP BAR -->
    <header class="topbar">
      <button class="hamburger" aria-label="Menu">
        <svg viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
      </button>
      <div class="search">
        <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
        <input type="text" placeholder="Rechercher un emploi, compétence, entreprise...">
        <span class="kbd">⌘K</span>
      </div>
      <div class="top-actions">
        <button class="icon-btn">
          <svg viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>
          <span class="badge">8</span>
        </button>
        <button class="icon-btn">
          <svg viewBox="0 0 24 24"><path d="M21 11.5a8.4 8.4 0 0 1-8.9 8.4 8.5 8.5 0 0 1-3.8-.9L3 20l1-4.6a8.4 8.4 0 0 1 15-9V11.5z"/></svg>
          <span class="badge">12</span>
        </button>
        <div class="lang">🌐 FR ⌄</div>
        <div class="user">
          <img src="https://i.pravatar.cc/64?img=13" alt="avatar">
          <div class="user-text">
            <div>Bonjour, Junior 👋</div>
            <div class="verified">Profil vérifié ✓</div>
          </div>
          <span class="chev">⌄</span>
        </div>
      </div>
    </header>

    <div class="scroll-area">

      <!-- PAGE HEAD -->
      <div class="page-head">
        <div>
          <h1>Mon Profil <span class="verif-badge">✓</span></h1>
          <p>Gérez vos informations et améliorez votre profil pour plus d'opportunités.</p>
        </div>
        <button class="btn-outline">👁 Voir mon profil public</button>
      </div>

      <!-- PROFILE CARD -->
      <section class="profile-card">
        <div class="avatar-wrap">
          <img src="https://i.pravatar.cc/160?img=13" alt="Junior Tchouaka">
          <button class="avatar-edit">📷</button>
        </div>
        <div class="profile-info">
          <div class="profile-name-row">
            <h2>Junior Tchouaka</h2>
            <button class="btn-primary-sm">Modifier le profil</button>
          </div>
          <div class="profile-role">Product Designer UI/UX</div>
          <div class="profile-meta">
            <span>📍 Douala, Cameroun</span>
            <span class="dot-sep">•</span>
            <span class="avail-dot"></span>
            <span>Disponible immédiatement</span>
          </div>
          <div class="profile-contacts">
            <span>💬 +237 6 12 34 56 78</span>
            <span>✉ junior.tchouaka@gmail.com</span>
            <span>🔗 linkedin.com/in/juniortchouaka</span>
          </div>
        </div>
        <div class="profile-completion">
          <div class="completion-label">Complétude du profil</div>
          <div class="completion-value">100%</div>
          <div class="completion-bar"><div class="completion-fill" style="width:100%"></div></div>
          <div class="completion-text">Excellent ! Votre profil est complet</div>
          <div class="completion-date">Dernière mise à jour : 20 Mai 2024</div>
        </div>
      </section>

      <!-- TABS -->
      <div class="tabs" id="profileTabs">
        <button class="tab active" data-tab="overview">Vue d'ensemble</button>
        <button class="tab" data-tab="info">Informations</button>
        <button class="tab" data-tab="exp">Expérience</button>
        <button class="tab" data-tab="skills">Compétences</button>
        <button class="tab" data-tab="formations">Formations</button>
        <button class="tab" data-tab="certifs">Certifications</button>
        <button class="tab" data-tab="langues">Langues</button>
        <button class="tab" data-tab="prefs">Préférences</button>
      </div>

      <!-- TAB CONTENT: OTHER (placeholder) -->
      <div class="tab-placeholder" id="tabPlaceholder"></div>

      <!-- LAYOUT -->
      <div class="profile-layout" id="overviewLayout">

        <!-- LEFT COLUMN -->
        <div class="col-left">

          <!-- SCORE VERA -->
          <div class="card score-card">
            <div class="score-head">Score VERA <span class="info">ⓘ</span></div>
            <div class="score-ring">
              <svg viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" class="ring-bg"></circle>
                <circle cx="60" cy="60" r="52" class="ring-fg" id="scoreRing"></circle>
              </svg>
              <div class="score-num">92<span>/100</span></div>
            </div>
            <div class="score-badge">🏆 Excellent</div>
            <div class="score-text">Ton profil est très attractif pour les recruteurs !</div>
            <button class="btn-primary full">↗ Améliorer encore</button>
          </div>

          <!-- ANALYSE IA -->
          <div class="card ai-card">
            <div class="card-head-row"><span>✨ Analyse IA de mon profil</span></div>

            <div class="ai-grid">
              <div class="ai-col">
                <div class="ai-col-title">Forces</div>
                <ul class="ai-list good">
                  <li>Excellentes compétences en UI/UX</li>
                  <li>Bonne expérience professionnelle</li>
                  <li>Portfolio solide</li>
                  <li>Maîtrise des outils design</li>
                </ul>
              </div>
              <div class="ai-col">
                <div class="ai-col-title">Points à améliorer</div>
                <ul class="ai-list warn">
                  <li>Ajouter des certifications</li>
                  <li>Plus de projets quantifiés</li>
                  <li>Compétences en gestion de projet</li>
                </ul>
              </div>
              <div class="ai-col">
                <div class="ai-col-title">Métiers recommandés</div>
                <ul class="job-match-list">
                  <li>
                    <span class="job-dot blue"></span>
                    <div><div>Product Designer Senior</div><small>92% compatible</small></div>
                  </li>
                  <li>
                    <span class="job-dot purple"></span>
                    <div><div>UX Researcher</div><small>89% compatible</small></div>
                  </li>
                  <li>
                    <span class="job-dot orange"></span>
                    <div><div>UI/UX Designer</div><small>86% compatible</small></div>
                  </li>
                </ul>
                <a href="#" class="see-more">Voir plus de métiers →</a>
              </div>
            </div>

            <div class="ai-suggestion">
              <span>💡 Suggestion IA : Ajoute une certification en Design System pour augmenter ton score de 5%</span>
              <button class="btn-primary-sm">Voir les formations</button>
            </div>
          </div>

          <!-- A PROPOS -->
          <div class="card about-card">
            <div class="card-head-row">
              <span>À propos de moi</span>
              <button class="btn-outline-sm">Modifier</button>
            </div>
            <p class="about-text">Designer passionné avec 4 ans d'expérience en création d'interfaces intuitives et centrées utilisateur. J'aime résoudre des problèmes complexes et créer des expériences qui font la différence.</p>
            <div class="about-stats">
              <div><strong>4+</strong><span>Années d'expérience</span></div>
              <div><strong>25+</strong><span>Projets réalisés</span></div>
              <div><strong>15+</strong><span>Clients satisfaits</span></div>
            </div>
          </div>

          <!-- COMPETENCES -->
          <div class="card skills-card">
            <div class="card-head-row">
              <span>Mes compétences clés</span>
              <button class="btn-outline-sm">Gérer mes compétences</button>
            </div>
            <div class="skills-grid" id="skillsGrid"></div>
            <a href="#" class="see-more">Voir toutes mes compétences (18) →</a>
          </div>

        </div>

        <!-- RIGHT COLUMN -->
        <div class="col-right">

          <div class="card">
            <div class="card-head-row"><span>Informations personnelles</span><button class="btn-outline-sm">Modifier</button></div>
            <ul class="info-list">
              <li><span class="info-icon">🎂</span><span class="info-label">Date de naissance</span><span class="info-value">12 Mars 1997</span></li>
              <li><span class="info-icon">💍</span><span class="info-label">Situation matrimoniale</span><span class="info-value">Célibataire</span></li>
              <li><span class="info-icon">🌍</span><span class="info-label">Nationalité</span><span class="info-value">Camerounaise</span></li>
              <li><span class="info-icon">📍</span><span class="info-label">Lieu de résidence</span><span class="info-value">Douala, Cameroun</span></li>
              <li><span class="info-icon">📱</span><span class="info-label">Numéro WhatsApp</span><span class="info-value">+237 6 12 34 56 78</span></li>
              <li><span class="info-icon">🗣</span><span class="info-label">Langue principale</span><span class="info-value">Français</span></li>
            </ul>
          </div>

          <div class="card">
            <div class="card-head-row"><span>Disponibilité &amp; Préférences</span><button class="btn-outline-sm">Modifier</button></div>
            <ul class="info-list">
              <li><span class="info-icon">🕐</span><span class="info-label">Disponibilité</span><span class="info-value">Immédiatement</span></li>
              <li><span class="info-icon">📄</span><span class="info-label">Type de contrat souhaité</span><span class="info-value">CDI, Remote</span></li>
              <li><span class="info-icon">🌐</span><span class="info-label">Lieu de travail préféré</span><span class="info-value">Remote / Monde entier</span></li>
              <li><span class="info-icon">💰</span><span class="info-label">Salaire souhaité</span><span class="info-value">2 000 – 3 000 $ / mois</span></li>
            </ul>
          </div>

          <div class="card">
            <div class="card-head-row"><span>Documents &amp; Vérifications</span><span class="verified-pill">✓ Vérifié</span></div>
            <ul class="doc-list">
              <li><span class="info-icon">🪪</span><span class="info-label">Pièce d'identité</span><span class="doc-status ok">Vérifié ✓</span></li>
              <li><span class="info-icon">🎓</span><span class="info-label">Diplômes</span><span class="doc-status ok">Vérifiés ✓</span></li>
              <li><span class="info-icon">📜</span><span class="info-label">Certifications</span><span class="doc-status ok">Vérifiés ✓</span></li>
              <li><span class="info-icon">🛡</span><span class="info-label">Badge Bleu</span><span class="doc-status ok">Actif ✓</span></li>
            </ul>
          </div>

          <div class="card cv-card">
            <div class="card-head-row"><span>Mon CV</span><button class="btn-outline-sm">Modifier</button></div>
            <div class="cv-file">
              <div class="cv-icon">📄</div>
              <div class="cv-info">
                <div class="cv-name">CV_Junior_Tchouaka.pdf</div>
                <div class="cv-date">Mis à jour le 20 Mai 2024</div>
              </div>
              <button class="cv-download">⬇</button>
            </div>
            <a href="#" class="see-more">✨ Générer un nouveau CV avec l'IA</a>
          </div>

        </div>
      </div>

    </div>
  </main>
</div>

<script src="script_P.js"></script>
</body>
</html>
