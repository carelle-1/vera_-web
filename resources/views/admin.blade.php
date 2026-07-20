<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>VERA Admin - Tableau de bord</title>
<link rel="stylesheet" href="styleAD.css">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body>

<div class="app">

  <!-- SIDEBAR -->
  <aside class="sidebar">
    <div class="brand">
      <div class="brand-logo">V</div>
      <div>
        <div class="brand-name">VERA <span class="admin-tag">Admin</span></div>
        <div class="brand-sub">Console d'administration</div>
      </div>
    </div>

    <nav class="nav" id="sideNav">
      <div class="nav-label">Général</div>
      <a class="nav-item active" data-panel="dashboard">
        <span class="nav-icon">📊</span> Tableau de bord
      </a>
      <a class="nav-item" data-panel="utilisateurs">
        <span class="nav-icon">👥</span> Utilisateurs <span class="nav-count">4 218</span>
      </a>
      <a class="nav-item" data-panel="entreprises">
        <span class="nav-icon">🏢</span> Entreprises <span class="nav-count">312</span>
      </a>
      <a class="nav-item" data-panel="offres">
        <span class="nav-icon">💼</span> Offres d'emploi <span class="nav-count">1 546</span>
      </a>
      <a class="nav-item" data-panel="sites">
        <span class="nav-icon">🌐</span> Sites <span class="nav-count">0</span>
      </a>

      <div class="nav-label">Contenu</div>
      <a class="nav-item" data-panel="candidatures">
        <span class="nav-icon">📄</span> Candidatures
      </a>
      <a class="nav-item" data-panel="formations">
        <span class="nav-icon">🎓</span> Formations
      </a>
      <a class="nav-item" data-panel="moderation">
        <span class="nav-icon">🛡</span> Modération <span class="nav-count alert">7</span>
      </a>

      <div class="nav-label">Gestion</div>
      <a class="nav-item" data-panel="paiements">
        <span class="nav-icon">💳</span> Paiements
      </a>
      <a class="nav-item" data-panel="rapports">
        <span class="nav-icon">📈</span> Rapports
      </a>
      <a class="nav-item" data-panel="parametres">
        <span class="nav-icon">⚙</span> Paramètres
      </a>
    </nav>

    <div class="sidebar-footer">
      <div class="admin-profile">
        <img src="https://i.pravatar.cc/64?img=32" alt="admin">
        <div>
          <div class="admin-name">{{ auth()->user()->name ?? 'Admin' }}</div>
          <div class="admin-role">{{ auth()->user()->role === 'admin' ? 'Administrateur' : 'Utilisateur' }}</div>
        </div>
      </div>
      <form action="/logout" method="POST" style="margin-top: 10px;">
        @csrf
        <button type="submit" style="width: 100%; padding: 8px; background: #f3f4f6; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">Déconnexion</button>
      </form>
    </div>
  </aside>

  <!-- MAIN -->
  <main class="main">

    <!-- TOPBAR -->
    <header class="topbar">
      <button class="hamburger">☰</button>
      <div class="search">
        <svg viewBox="0 0 24 24" width="16" height="16"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M21 21l-4.3-4.3" stroke="currentColor" stroke-width="2"/></svg>
        <input type="text" placeholder="Rechercher un utilisateur, une entreprise, une offre...">
      </div>
      <div class="top-actions">
        <button class="icon-btn">🔔<span class="badge">5</span></button>
        <button class="icon-btn">✉<span class="badge green">3</span></button>
        <div class="env-tag">Production</div>
        <div class="user">
          <img src="https://i.pravatar.cc/64?img=32" alt="admin">
          <span class="chev">⌄</span>
        </div>
      </div>
    </header>

    <div class="scroll-area">

      <!-- DASHBOARD PANEL -->
      <div class="panel active" id="panel-dashboard">

        <div class="page-head">
          <div>
            <h1>Tableau de bord</h1>
            <p>Vue d'ensemble de l'activité de la plateforme VERA.</p>
          </div>
          <div class="page-actions">
            <select class="period-select" id="periodSelect">
              <option>7 derniers jours</option>
              <option selected>30 derniers jours</option>
              <option>90 derniers jours</option>
            </select>
            <button class="btn-primary">⬇ Exporter le rapport</button>
          </div>
        </div>

        <!-- KPI CARDS -->
        <div class="kpi-grid" id="kpiGrid"></div>

        <!-- CHARTS ROW -->
        <div class="charts-row">
          <div class="card chart-card">
            <div class="card-head-row">
              <div>
                <div class="card-title">Croissance de la plateforme</div>
                <div class="card-sub">Nouveaux utilisateurs et offres publiées</div>
              </div>
              <div class="legend-row">
                <span><i class="dot sky"></i>Utilisateurs</span>
                <span><i class="dot mint"></i>Offres</span>
              </div>
            </div>
            <svg class="line-chart" id="growthChart" viewBox="0 0 640 220" preserveAspectRatio="none"></svg>
            <div class="chart-labels" id="growthLabels"></div>
          </div>

          <div class="card">
            <div class="card-head-row"><div class="card-title">Répartition par catégorie</div></div>
            <div class="donut-wrap">
              <svg viewBox="0 0 120 120" id="categoryDonut"></svg>
              <div class="donut-center"><span id="donutTotalCat">1 546</span><small>Offres</small></div>
            </div>
            <ul class="legend-list" id="categoryLegend"></ul>
          </div>
        </div>

        <!-- TABLE + ACTIVITY -->
        <div class="bottom-row">
          <section class="card table-card">
            <div class="card-head-row">
              <div class="card-title">Derniers utilisateurs inscrits</div>
              <div class="table-tools">
                <input type="text" id="userSearch" placeholder="Rechercher...">
                <select id="userFilter">
                  <option value="all">Tous les statuts</option>
                  <option value="actif">Actif</option>
                  <option value="attente">En attente</option>
                  <option value="suspendu">Suspendu</option>
                </select>
              </div>
            </div>

            <table class="admin-table">
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Rôle</th>
                  <th>Inscrit le</th>
                  <th>Statut</th>
                  <th></th>
                </tr>
              </thead>
              <tbody id="userTableBody"></tbody>
            </table>
            <div class="table-footer">
              <span id="tableCount">Affichage de 6 sur 4 218 utilisateurs</span>
              <div class="pagination">
                <button class="page-arrow">‹</button>
                <button class="page-num active">1</button>
                <button class="page-num">2</button>
                <button class="page-num">3</button>
                <button class="page-arrow">›</button>
              </div>
            </div>
          </section>

          <aside class="side-col">
            <div class="card">
              <div class="card-title">Activité récente</div>
              <div class="activity-list" id="activityList"></div>
            </div>

            <div class="card quick-card">
              <div class="card-title">Actions rapides</div>
              <button class="quick-action-btn">➕ Ajouter un administrateur</button>
              <button class="quick-action-btn">📢 Envoyer une annonce</button>
              <button class="quick-action-btn">🛡 Voir la file de modération</button>
              <button class="quick-action-btn">📤 Exporter les données</button>
            </div>
          </aside>
        </div>

      </div>

      <!-- OFFEMPLOI PANEL -->
      <div class="panel" id="panel-offres">
        <div class="page-head">
          <div>
            <h1>Offres d'emploi</h1>
            <p>Gérer les offres d'emploi publiées sur la plateforme.</p>
          </div>
          <div class="page-actions">
            <button class="btn-primary" id="addJobBtn">+ Ajouter une offre</button>
          </div>
        </div>

        <div class="offres-layout">
          <div class="offres-table-wrapper">
            <div class="card table-card">
              <div class="card-head-row">
                <div class="card-title">Liste des offres</div>
                <div class="table-tools">
                  <input type="text" id="jobSearch" placeholder="Rechercher une offre...">
                  <select id="jobFilter">
                    <option value="all">Tous les statuts</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Logo</th>
                    <th>Offre</th>
                    <th>Entreprise</th>
                    <th>Lieu</th>
                    <th>Statut</th>
                    <th>Date limite</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody id="jobTableBody"></tbody>
              </table>
              <div class="table-footer">
                <span id="jobTableCount">Affichage de 0 offre</span>
                <div class="pagination" id="jobPagination"></div>
              </div>
            </div>
          </div>

          <div class="offres-form-wrapper" id="offresFormWrapper">
            <div class="card">
              <div class="card-head-row">
                <div class="card-title" id="jobModalTitle">Ajouter une offre</div>
                <button class="exp-modal-close" id="jobModalClose" type="button">×</button>
              </div>
              <form id="jobForm" class="exp-form">
                <label>Titre de l'offre<input type="text" name="title" required placeholder="Ex. Développeur Full Stack"></label>
                <label>Entreprise<input type="text" name="company" required placeholder="Ex. Meta"></label>
                <label>Email de candidature<input type="email" name="applyEmail" placeholder="Ex. recrutement@meta.com"></label>
                <div class="exp-form-row">
                  <label>Ville<input type="text" name="location" placeholder="Ex. Paris"></label>
                  <label>Pays<input type="text" name="country" placeholder="Ex. France"></label>
                </div>
                <label>Description<textarea name="description" rows="4" placeholder="Décrivez le poste, les missions, le profil recherché..."></textarea></label>
                <div class="exp-form-row">
                  <label>Salaire<input type="text" name="salary" placeholder="Ex. 2500 - 4000 €/mois"></label>
                  <label>Type de contrat
                    <select name="contractType">
                      <option value="">-- Choisir --</option>
                      <option value="CDI">CDI</option>
                      <option value="CDD">CDD</option>
                      <option value="Freelance">Freelance</option>
                      <option value="Stage">Stage</option>
                      <option value="Alternance">Alternance</option>
                      <option value="Remote">Remote</option>
                    </select>
                  </label>
                </div>
                <label>Compétences requises<input type="text" name="skills" placeholder="Ex. React, Node.js, TypeScript"></label>
                <div class="exp-form-row">
                  <label>Date limite<input type="date" name="deadline" required></label>
                  <label>Statut
                    <select name="status">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </label>
                </div>
                <label>Logo de l'entreprise<input type="file" name="logo" accept="image/*"></label>
                <div class="exp-form-actions">
                  <button type="button" class="btn-outline-sm" id="jobCancel">Annuler</button>
                  <button type="submit" class="btn-primary-sm">Enregistrer</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- SITES PANEL -->
      <div class="panel" id="panel-sites">
        <div class="page-head">
          <div>
            <h1>Sites</h1>
            <p>Gérer les sites partenaires et leurs liens.</p>
          </div>
          <div class="page-actions">
            <button class="btn-primary" id="addSiteBtn">+ Ajouter un site</button>
          </div>
        </div>

        <div class="sites-layout">
          <div class="sites-table-wrapper">
            <div class="card table-card">
              <div class="card-head-row">
                <div class="card-title">Liste des sites</div>
                <div class="table-tools">
                  <input type="text" id="siteSearch" placeholder="Rechercher un site...">
                </div>
              </div>

              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Lien</th>
                    <th>Statut</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody id="siteTableBody"></tbody>
              </table>
              <div class="table-footer">
                <span id="siteTableCount">Affichage de 0 site</span>
                <div class="pagination" id="sitePagination"></div>
              </div>
            </div>
          </div>

          <div class="sites-form-wrapper" id="sitesFormWrapper">
            <div class="card">
              <div class="card-head-row">
                <div class="card-title" id="siteModalTitle">Ajouter un site</div>
                <button class="exp-modal-close" id="siteModalClose" type="button">×</button>
              </div>
              <form id="siteForm" class="exp-form">
                <label>Nom du site<input type="text" name="name" required placeholder="Ex. Google"></label>
                <label>URL du site<input type="url" name="url" required placeholder="Ex. https://google.com"></label>
                <label>Statut
                  <select name="status">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </label>
                <div class="exp-form-actions">
                  <button type="button" class="btn-outline-sm" id="siteCancel">Annuler</button>
                  <button type="submit" class="btn-primary-sm">Enregistrer</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- AUTRES PANELS (placeholder) -->
      <div class="panel" id="panel-placeholder">
        <div class="placeholder-box">
          <div class="placeholder-icon">🚧</div>
          <h2 id="placeholderTitle">Section en construction</h2>
          <p>Cette section sera bientôt disponible dans la console d'administration.</p>
        </div>
      </div>

    </div>
  </main>
</div>

<!-- ============== FIREBASE JS SDK + GARDE DE SESSION ============== -->
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-database-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-storage-compat.js"></script>
<script src="firebase-init.js"></script>
<script src="scriptAD.js?v=2"></script>
</body>
</html>
