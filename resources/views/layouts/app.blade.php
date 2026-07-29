<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="icon" href="/image/vera1.png">
<title>@yield('title', 'VERA')</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
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
        <span class="pill red">8</span>
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

    <div class="premium-card">
      <div class="premium-crown">👑</div>
      <div class="premium-title">Passez à Premium</div>
      <div class="premium-text">Débloquez toutes les fonctionnalités et multipliez vos opportunités</div>
      <button class="premium-btn">Passer Premium ✨</button>
    </div>

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
<script src="firebase-init.js"></script>
<script src="salutation.js"></script>
<script src="avatar.js"></script>
<script src="scriptI.js"></script>
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
