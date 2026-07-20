<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>VERA - Tableau de bord</title>
<link rel="stylesheet" href="styleI.css">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css" />
</head>
<body>

<div class="app">

  <!-- SIDEBAR -->
  <aside class="sidebar">
    <div class="brand">
        <div class="brand-logo"><img src="/image/veras1.png" alt="VERA" style="width:100%;height:100%;object-fit:contain;border-radius:8px;"></div>
      <div>
        <div class="brand-name">VERA</div>
        <div class="brand-tag">Real Opportunities, Smart Jobs</div>
      </div>
    </div>

    <nav class="nav">
      <a class="nav-item active" href="#">
        <svg viewBox="0 0 24 24"><path d="M4 11L12 4l8 7"/><path d="M6 10v9h5v-6h2v6h5v-9"/></svg>
        Tableau de bord
      </a>
      <a class="nav-item" href="/oppotunite">
        <svg viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        Opportunités
      </a>
      <a class="nav-item" href="#">
        <svg viewBox="0 0 24 24"><path d="M6 3h9l3 3v15H6z"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>
        Candidatures
      </a>
      <a class="nav-item" href="/profil">
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
      <a class="nav-item" href="/favoris">
        <svg viewBox="0 0 24 24"><path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z"/></svg>
        Favoris
      </a>
      <a class="nav-item" href="/parametre">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0 1.6-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1-.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.6 1H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.6 1z"/></svg>
        Paramètres
      </a>
    </nav>

    <div class="premium-card">
      <div class="premium-crown">👑</div>
      <div class="premium-title">Passez à Premium</div>
      <div class="premium-text">Débloquez toutes les fonctionnalités et multipliez vos opportunités</div>
      <button class="premium-btn">Passer Premium ✨</button>
    </div>

    <div class="help">
      <div class="help-icon">🎧</div>
      <div>
        <div class="help-title">Besoin d'aide ?</div>
        <div class="help-sub">Chattez avec notre support</div>
      </div>
    </div>
  </aside>

  <!-- MAIN -->
  <main class="main">

    <!-- TOP BAR -->
    <header class="topbar">
      <button class="hamburger" onclick="document.querySelector('.sidebar').classList.toggle('collapsed')" aria-label="Menu">
        <img src="/image/list2.png" alt="Menu" style="width:22px;height:22px;object-fit:contain;">
      </button>
      <div class="search">
        <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
        <input type="text" placeholder="Rechercher un emploi, compétence, entreprise...">
      </div>
      <div class="top-actions">
          <button class="icon-btn">
            <img src="/image/3917270.png" alt="" style="width:20px;height:20px;object-fit:contain;">
            <span class="badge">8</span>
          </button>
          <div class="lang"><img src="/image/3917561.png" alt="" style="width:16px;height:16px;object-fit:contain;vertical-align:middle;"> FR ⌄</div>
          <div class="user">
            <img id="userAvatar" src="https://i.pravatar.cc/64?img=13" alt="avatar">
            <div class="user-text">
              <div id="userGreeting"></div>
              <!-- <div class="verified">Profil vérifié ✓</div> -->
            </div>
            <span class="chev">⌄</span>
          </div>
          <button id="logoutBtn" style="margin-left:12px;background:none;border:1px solid var(--border);color:var(--text);padding:8px 14px;border-radius:10px;cursor:pointer;font-size:13px;font-weight:600;">Déconnexion</button>
        </div>
    </header>

    <!-- CONTENT GRID -->
    <div class="content">

      <!-- LEFT COLUMN -->
      <div class="col-left">

        <!-- HERO -->
        <section class="hero">
          <div class="hero-text">
            <h1>VERA travaille pour toi 24h/24</h1>
            <p>Nous analysons ton profil et te connectons aux meilleures opportunités.</p>

            <div class="hero-stats">
              <div class="stat">
                <div class="stat-icon blue">💼</div>
                <div>
                  <div class="stat-label">Opportunités trouvées</div>
                  <div class="stat-value">128 <span class="up">↗ 23%</span></div>
                  <div class="stat-period">Cette semaine</div>
                </div>
              </div>
              <div class="stat">
                <div class="stat-icon teal">📨</div>
                <div>
                  <div class="stat-label">Candidatures envoyées</div>
                  <div class="stat-value">16 <span class="up">↗ 40%</span></div>
                  <div class="stat-period">Cette semaine</div>
                </div>
              </div>
              <div class="stat">
                <div class="stat-icon purple">👁</div>
                <div>
                  <div class="stat-label">Vues de ton profil</div>
                  <div class="stat-value">342 <span class="up">↗ 18%</span></div>
                  <div class="stat-period">Cette semaine</div>
                </div>
              </div>
            </div>
          </div>
          <div class="hero-robot" aria-hidden="true">
            <img src="/image/1.png" alt="" style="width:100%;height:100%;object-fit:contain;">
          </div>
        </section>

        <!-- RECOMMENDATIONS -->
        <section class="reco">
          <div class="reco-head">
            <h2>Opportunités recommandées pour toi ✨</h2>
            <a href="#" class="see-all">Voir toutes les offres →</a>
          </div>

          <div class="filters">
            <button class="chip active" data-filter="all">☰ Tout</button>
            <select class="chip contract-filter" id="contractFilter">
              <option value="">📄 Type de contrat</option>
              <option value="CDI">CDI</option>
              <option value="CDD">CDD</option>
              <option value="Freelance">Freelance</option>
              <option value="Stage">Stage</option>
              <option value="Alternance">Alternance</option>
              <option value="Remote">Remote</option>
            </select>
            <select class="chip country-filter" id="countryFilter">
              <option value="">📍 Tous pays</option>
            </select>
            <select class="chip company-filter" id="companyFilter">
              <option value="">🏢 Entreprise</option>
            </select>
          </div>

          <div class="jobs" id="jobsContainer">

          </div>

          <div class="pagination" id="jobsPagination"></div>
        </section>

      </div>

      <!-- RIGHT COLUMN -->
      <div class="col-right">

        <div class="card score-card">
          <div class="score-head">Score VERA <span class="info">ⓘ</span></div>
          <div class="score-ring">
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" class="ring-bg"></circle>
              <circle cx="60" cy="60" r="52" class="ring-fg" id="scoreRingIndex"></circle>
            </svg>
            <div class="score-num" id="scoreNumIndex">0<span>/100</span></div>
          </div>
          <div class="score-badge" id="scoreBadgeIndex">★ —</div>
          <div class="score-text" id="scoreTextIndex">—</div>
          <button class="btn-primary full" id="improveScoreBtn">↗ Améliorer encore</button>
        </div>

        <div class="card actions-card">
          <div class="card-head">🎯 Actions prioritaires</div>
          <div class="action-item" id="actionAddSkill">
            <div class="action-icon blue">📝</div>
            <div class="action-text">
              <div>Ajoute une nouvelle compétence clé</div>
              <div class="action-sub">+12% sur ton score</div>
            </div>
            <span class="chev">›</span>
          </div>
          <div class="action-item" id="actionValidateExp">
            <div class="action-icon orange">🏅</div>
            <div class="action-text">
              <div>Valide ton expérience actuelle</div>
              <div class="action-sub">+8% sur ton score</div>
            </div>
            <span class="chev">›</span>
          </div>
          <div class="action-item" id="actionFollowTraining">
            <div class="action-icon green">🎓</div>
            <div class="action-text">
              <div>Suis une formation recommandée</div>
              <div class="action-sub">+15% sur ton score</div>
            </div>
            <span class="chev">›</span>
          </div>
        </div>

        <div class="card coach-card">
          <div class="coach-head">
            <span>🤖 Coach IA VERA</span>
          </div>
          <p>Voici ce que je te recommande aujourd'hui :</p>
          <ul>
            <li>✔ Améliorer ton profil Linkedin</li>
            <li>✔ Développer la compétence Docker</li>
            <li>✔ Postuler à 5 nouvelles offres</li>
          </ul>
          <div class="coach-logo">V</div>
          <button class="btn-white full">Discuter avec VERA →</button>
        </div>

      </div>

    </div>
  </main>
</div>

<!-- ============== MODAL DÉTAILS OFFRE ============== -->
<div class="modal-overlay" id="jobDetailOverlay">
  <div class="modal-card" id="jobDetailModal">
    <div class="modal-head">
      <div class="modal-title" id="jobDetailTitle">Détails de l'offre</div>
      <button class="modal-close" id="jobDetailClose" type="button">×</button>
    </div>
    <div class="modal-body" id="jobDetailBody"></div>
  </div>
</div>

<!-- ============== FIREBASE JS SDK + GARDE DE SESSION ============== -->
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-database-compat.js"></script>
<script src="firebase-init.js"></script>
<script src="salutation.js"></script>
<script src="scriptI.js"></script>
</body>
</html>
