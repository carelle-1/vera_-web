<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="icon" href="/image/vera1.png">
<title>VERA - Tableau de bord</title>
<link rel="stylesheet" href="/styleI.css">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
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
      <a class="nav-item active" href="/tableau-de-bord">
        <img class="nav-icon" src="/image/home.png" alt="Tableau de bord">
        Tableau de bord
      </a>
      <a class="nav-item" href="/oppotunite">
        <img class="nav-icon" src="/image/3916670.png" alt="Opportunités">
        Opportunités
      </a>
      <a class="nav-item" href="/candidatures">
        <img class="nav-icon" src="/image/3917512.png" alt="Candidatures">
        Candidatures
      </a>
      <a class="nav-item" href="/profil">
        <img class="nav-icon" src="/image/user.png" alt="Profil">
        Profil
        <span class="pill">100%</span>
      </a>
      <a class="nav-item" href="/coaching">
        <img class="nav-icon" src="/image/3917385.png" alt="Coaching & Carrière">
        Coaching &amp; Carrière
      </a>
      <a class="nav-item" href="/formations">
        <img class="nav-icon" src="/image/3914133.png" alt="Formations">
        Formations
      </a>
      <a class="nav-item" href="/messages">
        <img class="nav-icon" src="/image/discussion.png" alt="Messages">
        Messages
        <span class="pill blue">12</span>
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
      <a class="nav-item" href="/parametre">
        <img class="nav-icon" src="/image/3917058.png" alt="Paramètres">
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
          <!-- <div class="lang"><img src="/image/3917561.png" alt="" style="width:16px;height:16px;object-fit:contain;vertical-align:middle;"> FR </div> -->
          <div class="user">
            <img id="userAvatar" src="https://i.pravatar.cc/64?img=13" alt="avatar">
            <div class="user-text">
              <div id="userGreeting"></div>
              <!-- <div class="verified">Profil vérifié ✓</div> -->
            </div>
            <span class="chev"></span>
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
                <div class="stat-icon blue"><img src="/image/3916670.png" alt="Opportunités"></div>
                <div>
                  <div class="stat-label">Opportunités trouvées</div>
                  <div class="stat-value">128 <span class="up">↗ 23%</span></div>
                  <div class="stat-period">Cette semaine</div>
                </div>
              </div>
              <div class="stat">
                <div class="stat-icon teal"><img src="/image/3917512.png" alt="Candidatures"></div>
                <div>
                  <div class="stat-label">Candidatures envoyées</div>
                  <div class="stat-value">16 <span class="up">↗ 40%</span></div>
                  <div class="stat-period">Cette semaine</div>
                </div>
              </div>
              <div class="stat">
                <div class="stat-icon purple"><img src="/image/oeil.png" alt="Vues"></div>
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
            <h2>Opportunités recommandées pour toi</h2>
            <a href="#" class="see-all">Voir toutes les offres →</a>
          </div>

          <div class="filters">
            <button class="chip active" data-filter="all"><img class="chip-icon" src="/image/list2.png" alt="Tout"> Tout</button>
            <select class="chip contract-filter" id="contractFilter" style="display:none;">
              <option value=""></option>
              <option value="CDI">CDI</option>
              <option value="CDD">CDD</option>
              <option value="Freelance">Freelance</option>
              <option value="Stage">Stage</option>
              <option value="Alternance">Alternance</option>
              <option value="Remote">Remote</option>
            </select>
            <div class="custom-select" id="contractFilterCustom" data-target="contractFilter">
              <div class="custom-select-trigger">
                <img class="chip-icon" src="/image/3917512.png" alt="Type de contrat"> <span class="custom-text">Type de contrat</span>
                <span class="chev">⌄</span>
              </div>
              <div class="custom-select-options">
                <div class="custom-select-option" data-value=""><img class="chip-icon" src="/image/3917512.png" alt="Type de contrat"> <span>Type de contrat</span></div>
                <div class="custom-select-option" data-value="CDI"><span>CDI</span></div>
                <div class="custom-select-option" data-value="CDD"><span>CDD</span></div>
                <div class="custom-select-option" data-value="Freelance"><span>Freelance</span></div>
                <div class="custom-select-option" data-value="Stage"><span>Stage</span></div>
                <div class="custom-select-option" data-value="Alternance"><span>Alternance</span></div>
                <div class="custom-select-option" data-value="Remote"><span>Remote</span></div>
              </div>
            </div>
            <select class="chip country-filter" id="countryFilter" style="display:none;">
              <option value=""></option>
            </select>
            <div class="custom-select" id="countryFilterCustom" data-target="countryFilter">
              <div class="custom-select-trigger">
                <img class="chip-icon" src="/image/3916880.png" alt="Tous pays"> <span class="custom-text">Tous pays</span>
                <span class="chev">⌄</span>
              </div>
              <div class="custom-select-options">
                <div class="custom-select-option" data-value=""><img class="chip-icon" src="/image/3916880.png" alt="Tous pays"> <span>Tous pays</span></div>
              </div>
            </div>
            <select class="chip company-filter" id="companyFilter" style="display:none;">
              <option value=""></option>
            </select>
            <div class="custom-select" id="companyFilterCustom" data-target="companyFilter">
              <div class="custom-select-trigger">
                <img class="chip-icon" src="/image/3914425.png" alt="Entreprise"> <span class="custom-text">Entreprise</span>
                <span class="chev">⌄</span>
              </div>
              <div class="custom-select-options">
                <div class="custom-select-option" data-value=""><img class="chip-icon" src="/image/3914425.png" alt="Entreprise"> <span>Entreprise</span></div>
              </div>
            </div>
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
          <div class="card-head"><img src="/image/mission.png" alt="Actions prioritaires" style="width:18px;height:18px;object-fit:contain;margin-right:6px;vertical-align:middle;"> Actions prioritaires</div>
          <div class="action-item" id="actionAddSkill">
            <div class="action-icon blue"><img src="/image/3917361.png" alt="Compétence" style="width:20px;height:20px;object-fit:contain;"></div>
            <div class="action-text">
              <div>Ajoute une nouvelle compétence clé</div>
              <div class="action-sub">+12% sur ton score</div>
            </div>
            <span class="chev">›</span>
          </div>
          <div class="action-item" id="actionValidateExp">
            <div class="action-icon orange"><img src="/image/3914133.png" alt="Formation" style="width:20px;height:20px;object-fit:contain;"></div>
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
