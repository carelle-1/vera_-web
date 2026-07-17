<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>@yield('title', 'VERA')</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css" />
@yield('styles')
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
      <a class="nav-item" href="/tableau-de-bord">
        <svg viewBox="0 0 24 24"><path d="M4 11L12 4l8 7"/><path d="M6 10v9h5v-6h2v6h5v-9"/></svg>
        Tableau de bord
      </a>
      <a class="nav-item" href="/opportunites">
        <svg viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        Opportunités
      </a>
      <a class="nav-item" href="/candidatures">
        <svg viewBox="0 0 24 24"><path d="M6 3h9l3 3v15H6z"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>
        Candidatures
      </a>
      <a class="nav-item {{ request()->is('profil') ? 'active' : '' }}" href="/profil">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>
        Profil
        <span class="pill" id="profilePill">0%</span>
      </a>
      <a class="nav-item" href="/coaching">
        <svg viewBox="0 0 24 24"><path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"/></svg>
        Coaching &amp; Carrière
      </a>
      <a class="nav-item" href="/formations">
        <svg viewBox="0 0 24 24"><path d="M2 8l10-5 10 5-10 5z"/><path d="M6 10.5V16c0 1.5 2.5 3 6 3s6-1.5 6-3v-5.5"/></svg>
        Formations
      </a>
      <a class="nav-item" href="/messages">
        <svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>
        Messages
        <span class="pill blue">12</span>
      </a>
      <a class="nav-item" href="/notifications">
        <svg viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>
        Notifications
        <span class="pill red">8</span>
      </a>
      <a class="nav-item" href="/favoris">
        <svg viewBox="0 0 24 24"><path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z"/></svg>
        Favoris
      </a>
      <a class="nav-item" href="/parametres">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9V9a1.7 1.7 0 0 0 1.6 1H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.6 1z"/></svg>
        Paramètres
      </a>
      <a class="nav-item" href="/admin" id="adminNavItem" style="display:none;">
        <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        Administration
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
            <div class="user-avatar-wrap">
              <img id="userAvatar" src="https://i.pravatar.cc/64?img=13" alt="avatar">
              <div id="userInitial" class="user-initial" style="display:none;"></div>
            </div>
            <div class="user-text">
              <div id="userGreeting"></div>
              <!-- <div class="verified">Profil vérifié ✓</div> -->
            </div>
            <span class="chev">⌄</span>
          </div>
          <button id="logoutBtn" style="margin-left:12px;background:none;border:1px solid var(--border);color:var(--text);padding:8px 14px;border-radius:10px;cursor:pointer;font-size:13px;font-weight:600;">Déconnexion</button>
        </div>
    </header>

    @yield('content')

  </main>
</div>

<!-- ============== FIREBASE JS SDK + GARDE DE SESSION ============== -->
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-database-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-storage-compat.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
<script src="firebase-init.js"></script>
<script src="salutation.js"></script>
<script src="avatar.js"></script>
<script>
  firebase.auth().onAuthStateChanged((user) => {
    if (!user) return;
    firebase.database().ref("users/" + user.uid).once("value").then((snap) => {
      const data = snap.val() || {};
      const role = (data.role || "").toString().toLowerCase();
      const adminNav = document.getElementById("adminNavItem");
      if (adminNav) {
        adminNav.style.display = role === "admin" ? "flex" : "none";
      }
    });
  });
</script>
@yield('scripts')
</body>
</html>
