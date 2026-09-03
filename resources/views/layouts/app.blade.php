<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="icon" href="/image/vera1.png">
<title>@yield('title', 'VERA')</title>
  <link rel="stylesheet" href="/fonts/inter-local.css">
  <link rel="stylesheet" href="/style_INFO.css">
  <link rel="stylesheet" href="/styleI.css?v=3">
  @yield('styles')
</head>
<body>

<div class="app">

  <!-- SIDEBAR -->
  <aside class="sidebar">
    <div class="brand">
        <!-- <div class="brand-logo"><img src="/image/veras1.png" alt="VERA" style="width:100%;height:100%;object-fit:contain;border-radius:8px;"></div> -->
      <div>
        <img class="brand-name-img" src="/image/veras2.png" alt="VERA">
        <div class="brand-tag">Real Opportunities, Smart Jobs</div>
      </div>
    </div>

    <nav class="nav">
      <a class="nav-item" href="/tableau-de-bord">
        <img class="nav-icon" src="/image/home.png" alt="Tableau de bord">
        Tableau de bord
      </a>
      <a class="nav-item {{ request()->is('oppotunite') ? 'active' : '' }}" href="/oppotunite">
        <img class="nav-icon" src="/image/3916670.png" alt="Opportunités">
        Opportunités
      </a>
      <a class="nav-item {{ request()->is('candidatures') ? 'active' : '' }}" href="/candidatures">
        <img class="nav-icon" src="/image/3917512.png" alt="Candidatures">
        Candidatures
      </a>
      <a class="nav-item {{ request()->is('entretiens') ? 'active' : '' }}" href="/entretiens">
        <img class="nav-icon" src="/image/user.png" alt="Entretiens">
        Entretiens
      </a>
      <a class="nav-item {{ request()->is('profil') ? 'active' : '' }}" href="/profil">
        <img class="nav-icon" src="/image/user.png" alt="Profil">
        Profil
        <span class="pill" id="profilePill">0%</span>
      </a>
      <a class="nav-item {{ request()->is('coaching') ? 'active' : '' }}" href="/coaching">
        <img class="nav-icon" src="/image/3917385.png" alt="Coaching & Carrière">
        Coaching &amp; Carrière
      </a>
      <a class="nav-item" href="/formations">
        <img class="nav-icon" src="/image/3914133.png" alt="Formations">
        Formations
      </a>
      <a class="nav-item {{ request()->is('messages') ? 'active' : '' }}" href="/messages">
        <img class="nav-icon" src="/image/discussion.png" alt="Messages">
        Messages
        <span class="pill blue" id="navMsgUnread">0</span>
      </a>
      <a class="nav-item" href="/notifications">
        <img class="nav-icon" src="/image/3917270.png" alt="Notifications">
        Notifications
        <span class="pill red" id="navNotifUnread">8</span>
      </a>
      <a class="nav-item" href="/favoris">
        <img class="nav-icon" src="/image/3916579.png" alt="Favoris">
        Favoris
      </a>
      <a class="nav-item {{ request()->is('parametre') ? 'active' : '' }}" href="/parametre">
        <img class="nav-icon" src="/image/3917058.png" alt="Paramètres">
        Paramètres
      </a>
      <a class="nav-item" href="/admin" id="adminNavItem" style="display:none;">
        <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        Administration
      </a>
    </nav>

    <!-- <div class="premium-card">
      <div class="premium-crown">👑</div>
      <div class="premium-title">Passez à Premium</div>
      <div class="premium-text">Débloquez toutes les fonctionnalités et multipliez vos opportunités</div>
      <button class="premium-btn">Passer Premium ✨</button>
    </div> -->

    <div class="help">
      <div class="help-icon"><img src="/image/3917604.png" alt="Besoin d'aide" style="width:100%;height:100%;object-fit:contain;"></div>
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
      <button class="hamburger" id="sidebarToggle" aria-label="Menu">
        <img src="/image/list2.png" alt="Menu" style="width:22px;height:22px;object-fit:contain;">
      </button>
      <div class="sidebar-overlay" id="sidebarOverlay"></div>
      <div class="search">
        <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
        <input type="text" placeholder="Rechercher un emploi, compétence, entreprise...">
      </div>
      <div class="top-actions">
          <button class="icon-btn">
            <img src="/image/3917270.png" alt="" style="width:20px;height:20px;object-fit:contain;">
            <span class="badge" id="topNotifUnread">8</span>
          </button>
          <div class="user">
            <div class="user-avatar-wrap">
              <img id="userAvatar" src="https://i.pravatar.cc/64?img=13" alt="avatar">
              <div id="userInitial" class="user-initial" style="display:none;"></div>
            </div>
            <div class="user-text">
              <div id="userGreeting"></div>
              <!-- <div class="verified">Profil vérifié ✓</div> -->
            </div>
          </div>
          <button id="logoutBtn" style="margin-left:12px;background:#12b3c9;border:1px solid #12b3c9;color:#fff;padding:8px 14px;border-radius:10px;cursor:pointer;font-size:13px;font-weight:600;">Déconnexion</button>
        </div>
    </header>

    @yield('content')

  </main>
</div>

<!-- MODAL INFORMATIONS (annonces créées dans l'admin) -->
<div class="info-modal-overlay" id="infoModalOverlay" aria-hidden="true">
  <div class="info-modal-card" role="dialog" aria-modal="true" aria-labelledby="infoModalTitle">
    <button class="info-modal-close" id="infoModalCloseBtn" type="button" aria-label="Fermer">×</button>
    <div class="info-modal-body" id="infoModalBody"></div>
    <div class="info-modal-footer">
      <button class="info-modal-ok" id="infoModalOkBtn" type="button">Fermer</button>
    </div>
  </div>
</div>

<!-- ============== FIREBASE JS SDK + GARDE DE SESSION ============== -->
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-database-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-storage-compat.js"></script>
<script src="firebase-init.js"></script>
<script src="script_INFO.js"></script>
<script src="salutation.js"></script>
<script src="avatar.js"></script>
<script src="scriptI.js?v={{ time() }}"></script>
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

    const notifRef = firebase.database().ref("users/" + user.uid + "/notifications");
    notifRef.on("value", (snap) => {
      const raw = snap.val() || {};
      let unread = 0;
      Object.values(raw).forEach((n) => {
        if (n && n.unread) unread++;
      });
      const sidebarBadge = document.getElementById("navNotifUnread");
      const topBadge = document.getElementById("topNotifUnread");
      if (sidebarBadge) {
        sidebarBadge.textContent = unread > 0 ? unread : "0";
      }
      if (topBadge) {
        topBadge.textContent = unread > 0 ? unread : "0";
      }
    });

    const convRef = firebase.database().ref("conversations/" + user.uid);
    convRef.on("value", (snap) => {
      const convs = snap.val() || {};
      let msgUnread = 0;
      Object.values(convs).forEach((c) => {
        if (c && c.unread) msgUnread++;
      });
      const msgBadge = document.getElementById("navMsgUnread");
      if (msgBadge) {
        msgBadge.textContent = msgUnread > 0 ? msgUnread : "0";
      }
    });
  });

  (function setupSidebarToggle(){
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const toggle = document.getElementById('sidebarToggle');
    if (!sidebar || !toggle) return;

    function isMobile(){ return window.matchMedia('(max-width: 820px)').matches; }
    function closeSidebar(){
      document.body.classList.remove('sidebar-mobile-open');
      if (overlay) overlay.classList.remove('active');
    }
    function openSidebar(){
      document.body.classList.add('sidebar-mobile-open');
      if (overlay) overlay.classList.add('active');
    }

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (document.body.classList.contains('sidebar-mobile-open')) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });

    if (overlay) overlay.addEventListener('click', closeSidebar);

    sidebar.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => { if (isMobile()) closeSidebar(); });
    });

    window.addEventListener('resize', () => {
      if (!isMobile()) closeSidebar();
    });
  })();
</script>
@yield('scripts')
</body>
</html>
