<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="icon" href="/image/vera1.png">
<title>VERA Admin - Tableau de bord</title>
<link rel="stylesheet" href="{{ asset('styleAD.css') }}?v=2">
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
        <img class="nav-icon" src="/image/home.png" alt="Tableau de bord"> Tableau de bord
      </a>
      <a class="nav-item" data-panel="utilisateurs">
        <img class="nav-icon" src="/image/users.png" alt="Utilisateurs"> Utilisateurs <span class="nav-count" data-count-path="users">0</span>
      </a>
      <a class="nav-item" data-panel="entreprises">
        <img class="nav-icon" src="/image/3914425.png" alt="Entreprises"> Entreprises <span class="nav-count" data-count-path="companies">0</span>
      </a>
      <a class="nav-item" data-panel="offres">
        <img class="nav-icon" src="/image/3916670.png" alt="Offres d'emploi"> Offres d'emploi <span class="nav-count" data-count-path="jobs">0</span>
      </a>
      <a class="nav-item" data-panel="sites">
        <img class="nav-icon" src="/image/3917561.png" alt="Sites"> Sites <span class="nav-count" data-count-path="sites">0</span>
      </a>

      <div class="nav-label">Contenu</div>
      <a class="nav-item" data-panel="candidatures">
        <img class="nav-icon" src="/image/3917505.png" alt="informations"> informations
      </a>
      <a class="nav-item" data-panel="formations">
        <img class="nav-icon" src="/image/3914133.png" alt="Formations"> Administration
      </a>
      <a class="nav-item" data-panel="moderation">
        <img class="nav-icon" src="/image/3917385.png" alt="Modération"> Modération <span class="nav-count alert" data-count-path="moderation">0</span>
      </a>

      <div class="nav-label">Gestion</div>
      <a class="nav-item" data-panel="paiements">
        <img class="nav-icon" src="/image/7928164.png" alt="Paiements"> Paiements
      </a>
      <a class="nav-item" data-panel="rapports">
        <img class="nav-icon" src="/image/3917512.png" alt="Rapports"> Rapports
      </a>
      <a class="nav-item" data-panel="parametres">
        <img class="nav-icon" src="/image/3917058.png" alt="Paramètres"> Paramètres
      </a>
    </nav>

    <div class="sidebar-footer">
      <div class="admin-profile">
        <img src="https://i.pravatar.cc/64?img=32" alt="admin">
        <div>
          <div class="admin-name">{{ auth()->user()->name ?? 'Admin' }}</div>
          <div class="admin-role">{{ optional(auth()->user())->role === 'admin' ? 'Administrateur' : 'Utilisateur' }}</div>
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
      <!-- <button class="hamburger">☰</button> -->
      <div class="search">
        <svg viewBox="0 0 24 24" width="16" height="16"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M21 21l-4.3-4.3" stroke="currentColor" stroke-width="2"/></svg>
        <input type="text" placeholder="Rechercher un utilisateur, une entreprise, une offre...">
      </div>
      <div class="top-actions">
         <button class="icon-btn"><img class="icon-dark" src="/image/3917270.png" alt="Notifications"><span class="badge">5</span></button>
         <button class="icon-btn"><img class="icon-dark" src="/image/discussion.png" alt="Messages"><span class="badge green">3</span></button>
        <div class="env-tag">Production</div>
        <div class="user">
           <img src="https://i.pravatar.cc/64?img=32" alt="admin">
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
            <svg class="line-chart" id="growthChart" viewBox="0 0 720 260" preserveAspectRatio="none"></svg>
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

            <!-- <div class="card quick-card">
              <div class="card-title">Actions rapides</div>
              <button class="quick-action-btn">➕ Ajouter un administrateur</button>
              <button class="quick-action-btn">📢 Envoyer une annonce</button>
              <button class="quick-action-btn">🛡 Voir la file de modération</button>
              <button class="quick-action-btn">📤 Exporter les données</button>
            </div> -->
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
                    <th style="width:40px;"><input type="checkbox" id="selectAllJobs"></th>
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
                <div style="display:flex;gap:10px;align-items:center;">
                  <button class="btn-outline-sm" id="bulkDeleteBtn" style="display:none;color:var(--red);border-color:var(--red);">🗑 Supprimer la sélection</button>
                  <div class="pagination" id="jobPagination"></div>
                </div>
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
                <div class="exp-form-section-title">Sélecteurs CSS pour le scraping</div>
                <label>Sélecteur titre<input type="text" name="selectorTitle" placeholder="Ex. h2.job-title, .offer-title"></label>
                <label>Sélecteur entreprise<input type="text" name="selectorCompany" placeholder="Ex. .company-name, span.employer"></label>
                <label>Sélecteur lieu<input type="text" name="selectorLocation" placeholder="Ex. .location, span.city"></label>
                <label>Sélecteur salaire<input type="text" name="selectorSalary" placeholder="Ex. .salary, span.wage"></label>
                <label>Sélecteur lien offre<input type="text" name="selectorLink" placeholder="Ex. a.job-link, .offer-url"></label>
                <label>Sélecteur description<input type="text" name="selectorDescription" placeholder="Ex. .job-description, .offer-details"></label>
                <label>Sélecteur email entreprise<input type="text" name="selectorCompanyEmail" placeholder="Ex. .company-email, a.recruitment-email"></label>
                <div class="exp-form-actions">
                  <button type="button" class="btn-outline-sm" id="siteCancel">Annuler</button>
                  <button type="submit" class="btn-primary-sm">Enregistrer</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- ADMINISTRATION PANEL (gestion des administrateurs + privilèges) -->
      <div class="panel" id="panel-formations">
        <div class="page-head">
          <div>
            <h1>Administration</h1>
            <p>Ajoutez des administrateurs et attribuez-leur des privilèges d'accès à chaque section de la console.</p>
          </div>
          <div class="page-actions">
            <button class="btn-primary" id="addAdminBtn">+ Ajouter un administrateur</button>
          </div>
        </div>

        <div class="offres-layout">
          <div class="offres-table-wrapper">
            <div class="card table-card">
              <div class="card-head-row">
                <div class="card-title">Liste des administrateurs</div>
                <div class="table-tools">
                  <input type="text" id="adminMgmtSearch" placeholder="Rechercher un admin...">
                </div>
              </div>

              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Administrateur</th>
                    <th>Rôle</th>
                    <th>Privilèges</th>
                    <th>Statut</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody id="adminMgmtTableBody"></tbody>
              </table>
              <div class="table-footer">
                <span id="adminMgmtCount">Affichage de 0 administrateur</span>
              </div>
            </div>
          </div>

          <div class="offres-form-wrapper" id="adminMgmtFormWrapper">
            <div class="card">
              <div class="card-head-row">
                <div class="card-title" id="adminMgmtModalTitle">Ajouter un administrateur</div>
                <button class="exp-modal-close" id="adminMgmtClose" type="button">×</button>
              </div>
              <form id="adminMgmtForm" class="exp-form">
                <label>Email de l'utilisateur <span style="color:var(--red)">*</span>
                  <input type="email" name="email" required placeholder="Ex. admin@vera.com">
                </label>
                <p class="form-hint" id="adminEmailHint">Si un compte existe avec cet email, il sera promu administrateur. Sinon, un nouveau compte sera créé (le mot de passe est alors requis).</p>

                <label>Nom complet
                  <input type="text" name="name" placeholder="Ex. Jean Dupont">
                </label>

                <label>Mot de passe <span class="optional-tag">(création de compte uniquement)</span>
                  <input type="password" name="password" placeholder="6 caractères minimum">
                </label>

                <label>Statut
                  <select name="status">
                    <option value="actif">Actif</option>
                    <option value="suspendu">Suspendu</option>
                  </select>
                </label>

                <label class="switch-row">
                  <span>
                    <span class="switch-title">Super administrateur</span>
                    <span class="switch-sub">Accès total à toutes les sections, ignore les privilèges ci-dessous.</span>
                  </span>
                  <input type="checkbox" name="super" class="admin-super-toggle">
                </label>

                <div class="exp-form-section-title">Privilèges par section</div>
                <div class="privileges-grid" id="privilegesGrid"></div>

                <div class="exp-form-actions">
                  <button type="button" class="btn-outline-sm" id="adminMgmtCancel">Annuler</button>
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

      <!-- UTILISATEURS PANEL -->
      <div class="panel" id="panel-utilisateurs">
        <div class="page-head">
          <div>
            <h1>Utilisateurs</h1>
            <p>Liste de tous les utilisateurs inscrits sur la plateforme.</p>
          </div>
          <div class="page-actions">
            <div class="filter-wrap">
              <span class="filter-label">Filtrer par rôle</span>
              <select id="adminUserFilter" class="filter-select">
                <option value="all">Tous les rôles</option>
                <option value="chercheur_emploi">Chercheur d'emploi</option>
                <option value="recruteur">Recruteur</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        </div>

        <div class="bottom-row bottom-row--full" style="padding:0 26px 40px;">
          <section class="card table-card">
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
              <tbody id="adminUsersTableBody"></tbody>
            </table>
            <div class="table-footer">
              <span id="adminUserTableCount">Affichage de 0 utilisateur</span>
              <div class="pagination" id="adminUserPagination"></div>
            </div>
          </section>
        </div>
      </div>

      <!-- ENTREPRISES PANEL -->
      <div class="panel" id="panel-entreprises">
        <div class="page-head">
          <div>
            <h1>Entreprises</h1>
            <p>Liste de toutes les entreprises enregistrées sur la plateforme.</p>
          </div>
          <div class="page-actions">
            <div class="filter-wrap">
              <span class="filter-label">Rechercher</span>
              <input type="text" id="companySearch" placeholder="Rechercher une entreprise..." style="padding:8px 12px;border:1px solid var(--border);border-radius:8px;font-size:12.5px;width:220px;">
            </div>
          </div>
        </div>

        <div class="bottom-row bottom-row--full" style="padding:0 26px 40px;">
          <section class="card table-card">
            <table class="admin-table">
              <thead>
                <tr>
                  <th style="width:50px;">Avatar</th>
                  <th>Utilisateur</th>
                  <th>Email</th>
                  <th>Site web</th>
                  <th></th>
                </tr>
              </thead>
              <tbody id="companyTableBody"></tbody>
            </table>
            <div class="table-footer">
              <span id="companyTableCount">Affichage de 0 entreprise</span>
            </div>
          </section>
        </div>
      </div>

      <!-- INFORMATIONS PANEL -->
      <div class="panel" id="panel-candidatures">
        <div class="page-head">
          <div>
            <h1>Informations</h1>
            <p>Gérez les messages et annonces affichés aux utilisateurs (titre, description, période d'affichage et image).</p>
          </div>
          <div class="page-actions">
            <button class="btn-primary" id="addInformationBtn">+ Ajouter une information</button>
          </div>
        </div>

        <div class="offres-layout">
          <div class="offres-table-wrapper">
            <div class="card table-card">
              <div class="card-head-row">
                <div class="card-title">Liste des informations</div>
                <div class="table-tools">
                  <input type="text" id="infoSearch" placeholder="Rechercher une information...">
                  <select id="infoFilter">
                    <option value="all">Toutes</option>
                    <option value="active">En cours</option>
                    <option value="attente">À venir</option>
                    <option value="inactive">Terminé</option>
                  </select>
                </div>
              </div>

              <table class="admin-table">
                <thead>
                  <tr>
                    <th style="width:40px;"><input type="checkbox" id="selectAllInfos"></th>
                    <th>Image</th>
                    <th>Titre</th>
                    <th>Description</th>
                    <th>Période d'affichage</th>
                    <th>Statut</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody id="infoTableBody"></tbody>
              </table>
              <div class="table-footer">
                <span id="infoTableCount">Affichage de 0 information</span>
                <div style="display:flex;gap:10px;align-items:center;">
                  <button class="btn-outline-sm" id="bulkDeleteInfoBtn" style="display:none;color:var(--red);border-color:var(--red);">🗑 Supprimer la sélection</button>
                  <div class="pagination" id="infoPagination"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="offres-form-wrapper" id="informationsFormWrapper">
            <div class="card">
              <div class="card-head-row">
                <div class="card-title" id="infoModalTitle">Ajouter une information</div>
                <button class="exp-modal-close" id="infoModalClose" type="button">×</button>
              </div>
              <form id="informationForm" class="exp-form">
                <label>Titre
                  <input type="text" name="titre" required placeholder="Ex. Maintenance planifiée">
                </label>
                <label>Description
                  <textarea name="description" rows="4" required placeholder="Décrivez l'information à communiquer..."></textarea>
                </label>
                <div class="exp-form-row">
                  <label>Date de début
                    <input type="date" name="dateDebut" required>
                  </label>
                  <label>Date de fin
                    <input type="date" name="dateFin" required>
                  </label>
                </div>
                <label>Image (affichée pendant la période)
                  <input type="file" name="logo" accept="image/*">
                </label>
                <div class="exp-form-actions">
                  <button type="button" class="btn-outline-sm" id="infoCancel">Annuler</button>
                  <button type="submit" class="btn-primary-sm">Enregistrer</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

    </div>
  </main>
</div>

<!-- ============== MODAL DÉTAILS ENTREPRISE ============== -->
<div class="modal-overlay" id="companyDetailOverlay">
  <div class="modal-card company-detail-modal" id="companyDetailModal">
    <div class="modal-head">
      <div class="modal-title" id="companyDetailTitle">Détails de l'entreprise</div>
      <button class="modal-close" id="companyDetailClose" type="button">&#215;</button>
    </div>
    <div class="modal-body" id="companyDetailBody"></div>
  </div>
</div>

<!-- ============== FIREBASE JS SDK + GARDE DE SESSION ============== -->
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-database-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-storage-compat.js"></script>
<script src="{{ asset('firebase-init.js') }}"></script>
<script src="{{ asset('scriptAD.js') }}?v=15"></script>
</body>
</html>
