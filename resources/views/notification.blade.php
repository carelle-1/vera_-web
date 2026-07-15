<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>VERA - Notifications</title>
<link rel="stylesheet" href="style_N.css">
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
      <a class="nav-item" href="#">
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
      <a class="nav-item active" href="#">
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
      <div class="premium-text">Accédez à des fonctionnalités avancées et multipliez vos opportunités.</div>
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
      <button class="hamburger" aria-label="Menu">
        <svg viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
      </button>
      <div class="search">
        <input type="text" placeholder="Rechercher un emploi, compétence, entreprise...">
        <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
      </div>
      <div class="top-actions">
        <button class="icon-btn">
          <svg viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>
          <span class="badge">8</span>
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
        <h1>🔔 Notifications <span class="sparkle">✨</span></h1>
        <p>Restez informé de tout ce qui compte pour votre carrière.</p>
      </div>

      <!-- TABS -->
      <div class="tabs" id="notifTabs">
        <button class="tab active" data-filter="all">Toutes <span>8</span></button>
        <button class="tab" data-filter="unread">Non lus <span>8</span></button>
        <button class="tab" data-filter="opportunites">Opportunités <span>4</span></button>
        <button class="tab" data-filter="candidatures">Candidatures <span>2</span></button>
        <button class="tab" data-filter="formations">Formations <span>1</span></button>
        <button class="tab" data-filter="systeme">Système <span>1</span></button>
      </div>

      <!-- LAYOUT -->
      <div class="layout">

        <!-- LEFT: LIST -->
        <section class="notif-panel">

          <div class="toolbar">
            <label class="check-all">
              <input type="checkbox" id="selectAll"> Tout sélectionner
            </label>
            <div class="toolbar-actions">
              <button class="link-btn" id="markAllRead">✉ Marquer tout comme lu</button>
              <button class="btn-filter">Filtres ⚙</button>
            </div>
          </div>

          <div id="notifGroups"></div>

          <div class="pagination">
            <button class="page-num active" data-page="1">1</button>
            <button class="page-num" data-page="2">2</button>
            <button class="page-num" data-page="3">3</button>
            <span class="page-dots">...</span>
            <button class="page-arrow">→</button>
          </div>
        </section>

        <!-- RIGHT COLUMN -->
        <aside class="side-panel">

          <div class="card">
            <div class="card-head-row"><span>Préférences de notifications</span></div>
            <div class="pref-item">
              <div class="pref-icon blue">💼</div>
              <div class="pref-text"><div class="pref-title">Opportunités d'emploi</div><div class="pref-sub">Nouvelles offres et recommandations</div></div>
              <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
            </div>
            <div class="pref-item">
              <div class="pref-icon blue">✉</div>
              <div class="pref-text"><div class="pref-title">Messages</div><div class="pref-sub">Messages des recruteurs et équipes VERA</div></div>
              <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
            </div>
            <div class="pref-item">
              <div class="pref-icon green">📄</div>
              <div class="pref-text"><div class="pref-title">Candidatures</div><div class="pref-sub">Statuts et mises à jour de vos candidatures</div></div>
              <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
            </div>
            <div class="pref-item">
              <div class="pref-icon green">🎓</div>
              <div class="pref-text"><div class="pref-title">Formations</div><div class="pref-sub">Recommandations et rappels de formation</div></div>
              <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
            </div>
            <div class="pref-item">
              <div class="pref-icon gray">🧭</div>
              <div class="pref-text"><div class="pref-title">Coaching &amp; Conseils</div><div class="pref-sub">Nouveaux conseils et contenus</div></div>
              <label class="switch"><input type="checkbox"><span class="slider"></span></label>
            </div>
            <div class="pref-item">
              <div class="pref-icon blue">⚙</div>
              <div class="pref-text"><div class="pref-title">Système</div><div class="pref-sub">Mises à jour et informations générales</div></div>
              <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
            </div>
            <a href="#" class="see-all">Gérer mes préférences →</a>
          </div>

          <div class="card">
            <div class="card-head-row"><span>Résumé</span></div>
            <div class="summary-grid">
              <div class="summary-item blue"><div class="summary-num">8</div><div class="summary-label">Non lus</div></div>
              <div class="summary-item green"><div class="summary-num">24</div><div class="summary-label">Cette semaine</div></div>
              <div class="summary-item blue"><div class="summary-num">96</div><div class="summary-label">Ce mois-ci</div></div>
              <div class="summary-item green"><div class="summary-num">320</div><div class="summary-label">Total</div></div>
            </div>
          </div>

          <div class="card">
            <div class="card-head-row"><span>Ne pas déranger</span></div>
            <p class="dnd-text">Désactivez temporairement les notifications.</p>
            <div class="dnd-toggle-row">
              <span>Activer le mode Ne pas déranger</span>
              <label class="switch"><input type="checkbox" id="dndToggle"><span class="slider"></span></label>
            </div>
            <div class="dnd-times">
              <div class="dnd-time-field">
                <label>De</label>
                <select><option>22:00</option><option>23:00</option><option>21:00</option></select>
              </div>
              <div class="dnd-time-field">
                <label>À</label>
                <select><option>07:00</option><option>08:00</option><option>06:00</option></select>
              </div>
            </div>
            <p class="dnd-note">Vous ne recevrez pas de notifications pendant cette période, sauf les messages importants.</p>
          </div>

        </aside>

      </div>
    </div>
  </main>
</div>

<script src="script_N.js"></script>
</body>
</html>
