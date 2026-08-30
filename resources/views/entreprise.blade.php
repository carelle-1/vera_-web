<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>VERA Entreprise - Tableau de bord</title>
<link rel="stylesheet" href="{{ asset('style_ENT.css') }}?v=6">
<link rel="stylesheet" href="/style_INFO.css?v=4">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body>
  

<div class="app">

  <!-- SIDEBAR -->
  <aside class="sidebar">
    <div class="brand">
      <img src="/image/veras1.png" alt="VERA" class="brand-logo">
      <div>
        <div class="brand-name">VERA <span class="biz-tag">Entreprise</span></div>
        <div class="brand-sub">Espace recruteur</div>
      </div>
    </div>

    <!-- <div class="company-card">
      <img src="https://i.pravatar.cc/64?img=15" alt="logo">
      <div>
        <div class="company-name">Notion Labs</div>
        <div class="company-plan"><img src="/image/3917385.png" alt="Plan" width="14" height="14" style="vertical-align:middle;margin-right:4px;"> Plan Business</div>
      </div>
    </div> -->

    <nav class="nav">
      <a class="nav-item active" data-panel="dashboard">
        <span class="nav-icon"><img src="/image/home.png" alt="Tableau de bord"></span> Tableau de bord
      </a>
      <a class="nav-item" data-panel="offres">
        <span class="nav-icon"><img src="/image/3916670.png" alt="Offres publiées"></span> Offres publiées <span class="nav-count">6</span>
      </a>
      <a class="nav-item" data-panel="candidatures">
        <span class="nav-icon"><img src="/image/3917512.png" alt="Candidatures"></span> Candidatures <span class="nav-count green">18</span>
      </a>
      <!-- <a class="nav-item" data-panel="talents">
        <span class="nav-icon"><img src="/image/3914260.png" alt="Talents" class="nav-icn"></span> Talents recommandés
      </a> -->
      <!-- <a class="nav-item" data-panel="entretiens">
        <span class="nav-icon"><img src="/image/3914425.png" alt="Entretiens"></span> Entretiens <span class="nav-count">3</span>
      </a> -->
      <a class="nav-item" data-panel="messages">
        <span class="nav-icon"><img src="/image/discussion.png" alt="Messages"></span> Messages <span class="nav-count">5</span>
      </a>
      <!-- <a class="nav-item" data-panel="statistiques">
        <span class="nav-icon"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg></span> Statistiques
      </a>
      <a class="nav-item" data-panel="facturation">
        <span class="nav-icon"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/><line x1="2" y1="16" x2="22" y2="16"/></svg></span> Facturation
      </a> -->
      <a class="nav-item" data-panel="parametres">
        <span class="nav-icon"><img src="/image/3917058.png" alt="Paramètres"></span> Paramètres
      </a>
    </nav>

     <div class="company-card">
      <img src="https://i.pravatar.cc/64?img=15" alt="logo">
      <div>
        <div class="company-name">Notion Labs</div>
        <div class="company-plan">Plan Business</div>
        <!-- <div class="company-plan"><img src="/image/3917385.png" alt="Plan" width="14" height="14" style="vertical-align:middle;margin-right:4px;"> Plan Business</div> -->
      </div>
    </div>

    <div style="padding:0 14px 14px;">
      <form id="logoutForm" action="/logout" method="POST" style="margin-top:0;">
        @csrf
        <button type="submit" style="width:100%;padding:9px;background:#f3f4f6;border:none;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;color:#374151;">Déconnexion</button>
      </form>
    </div>

    <!-- <div class="upgrade-card">
      <div class="upgrade-title"><img src="/image/3914260.png" alt="" width="18" height="18" style="vertical-align:middle;margin-right:6px;"> Boostez vos offres</div>
      <p>Mettez en avant vos annonces pour 3x plus de candidatures qualifiées.</p>
      <button class="upgrade-btn">Découvrir la mise en avant</button>
    </div> -->
  </aside>

  <!-- MAIN -->
  <main class="main">

    <!-- TOPBAR -->
    <header class="topbar">
       <button class="hamburger"><img src="/image/3917293.png" alt="Menu" width="20" height="20" style="object-fit:contain;"></button>
      <div class="search">
        <svg viewBox="0 0 24 24" width="16" height="16"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M21 21l-4.3-4.3" stroke="currentColor" stroke-width="2"/></svg>
        <input type="text" placeholder="Rechercher un candidat, une compétence...">
      </div>
      <div class="top-actions">
         <button class="icon-btn"><img src="/image/3917270.png" alt="Notifications"><span class="badge">5</span></button>
         <button class="icon-btn"><img src="/image/discussion.png" alt="Messages"><span class="badge green">5</span></button>
        <div class="user">
          <img src="https://i.pravatar.cc/64?img=15" alt="user">
          <div class="user-text">
             <div>Notion Labs</div>
             <div class="user-role">Recruteur</div>
           </div>
           <span class="chev"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg></span>
        </div>
      </div>
    </header>

    <div class="scroll-area">

      <!-- DASHBOARD PANEL -->
      <div class="panel active" id="panel-dashboard">

        <div class="page-head">
          <div>
            <h1>Tableau de bord</h1>
            <p>Gérez vos offres, suivez vos candidatures et trouvez les meilleurs talents.</p>
          </div>
          <button class="btn-primary" id="publishBtn"><img src="/image/envoyez.png" alt="" width="16" height="16" style="vertical-align:middle;margin-right:6px;"> Publier une offre</button>
        </div>

        <!-- KPI CARDS -->
        <div class="kpi-grid" id="kpiGrid"></div>

        <!-- CHARTS ROW -->
        <div class="charts-row">
          <div class="card chart-card">
            <div class="card-head-row">
              <div>
                <div class="card-title">Candidatures reçues</div>
                <div class="card-sub">Évolution sur les 7 derniers jours</div>
              </div>
              <div class="legend-row">
                <span><i class="dot sky"></i>Candidatures</span>
                <span><i class="dot mint"></i>Vues d'offres</span>
              </div>
            </div>
            <svg class="line-chart" id="appsChart" viewBox="0 0 640 200" preserveAspectRatio="none"></svg>
            <div class="chart-labels" id="appsLabels"></div>
          </div>

          <div class="card">
            <div class="card-head-row"><div class="card-title">Sources des candidatures</div></div>
            <div class="donut-wrap">
              <svg viewBox="0 0 120 120" id="sourceDonut"></svg>
              <div class="donut-center"><span id="donutTotalSource">18</span><small>Total</small></div>
            </div>
            <ul class="legend-list" id="sourceLegend"></ul>
          </div>
        </div>

        <!-- OFFRES PUBLIEES -->
        <section class="section-block">
          <div class="section-head">
            <div>
              <h2>Vos offres publiées</h2>
              <p>Performance de vos annonces actives</p>
            </div>
            <a href="#" class="see-all" data-panel-link="offres">Voir toutes les offres <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 7l5 5-5 5"/></svg></a>
          </div>

          <div class="jobs-table-wrap card">
            <table class="jobs-table">
              <thead>
                <tr>
                  <th>Offre</th>
                  <th>Statut</th>
                  <th>Vues</th>
                  <th>Candidatures</th>
                  <th>Match moyen</th>
                  <th>Publiée le</th>
                  <th></th>
                </tr>
              </thead>
              <tbody id="jobsTableBody"></tbody>
            </table>
          </div>
        </section>

        <!-- BOTTOM ROW -->
        <div class="bottom-row">
          <section class="card candidates-card">
            <div class="card-head-row">
              <div class="card-title">Dernières candidatures</div>
              <a href="#" class="see-all">Voir tout <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 7l5 5-5 5"/></svg></a>
            </div>
            <div class="candidates-list" id="candidatesList"></div>
          </section>

          <aside class="side-col">
            <!-- <div class="card talents-card">
              <div class="card-head-row">            <div class="card-title"><img src="/image/3914260.png" alt="Talents" width="18" height="18" style="vertical-align:middle;margin-right:6px;"> Talents recommandés par VERA</div></div>
              <div class="talents-list" id="talentsList"></div>
            </div> -->

            <div class="card interviews-card">
              <div class="card-head-row">            <div class="card-title"><img src="/image/3917292.png" alt="Entretiens" width="18" height="18" style="vertical-align:middle;margin-right:6px;"> Prochains entretiens</div></div>
              <div class="interviews-list" id="interviewsList"></div>
            </div>
          </aside>
        </div>

      </div>

      <!-- OFFRES PANEL -->
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
                  <button class="btn-outline-sm" id="bulkDeleteBtn" style="display:none;color:var(--red);border-color:var(--red);"><img src="/image/delete.png" alt="Supprimer" width="14" height="14" style="vertical-align:middle;margin-right:4px;"> Supprimer la sélection</button>
                  <div class="pagination" id="jobPagination"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="offres-form-wrapper" id="offresFormWrapper">
            <div class="card">
              <div class="card-head-row">
                <div class="card-title" id="jobModalTitle">Ajouter une offre</div>
                <button class="exp-modal-close" id="jobModalClose" type="button" aria-label="Fermer"><img src="/image/delete.png" alt="Fermer" width="14" height="14"></button>
              </div>
              <form id="jobForm" class="exp-form">
                <label>Titre de l'offre<input type="text" name="title" required placeholder="Ex. Développeur Full Stack"></label>
                <label>Entreprise<input type="text" name="company" required placeholder="Ex. Notion Labs"></label>
                <label>Email de candidature<input type="email" name="applyEmail" placeholder="Ex. recrutement@notionlabs.com"></label>
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

      <!-- CANDIDATURES PANEL -->
      <div class="panel" id="panel-candidatures">
        <div class="page-head">
          <div>
            <h1>Candidatures</h1>
            <p>Consultez les candidats pour vos offres et gérez les réponses.</p>
          </div>
        </div>

        <div class="cand-layout">
          <section class="cand-jobs-panel">
            <div class="card table-card">
              <div class="card-head-row">
                <div class="card-title">Vos offres</div>
                <div class="table-tools">
                  <input type="text" id="candJobSearch" placeholder="Rechercher une offre...">
                </div>
              </div>
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Offre</th>
                    <th>Entreprise</th>
                    <th>Statut</th>
                    <th>Candidatures</th>
                    <th>Publiée le</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody id="candJobTableBody"></tbody>
              </table>
            </div>
          </section>

          <section class="cand-list-panel" id="candListPanel">
            <div class="card table-card">
              <div class="card-head-row">
                <div style="display:flex;align-items:center;gap:10px;">
                  <button class="cand-back-btn" id="candBackBtn" type="button"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg> Retour</button>
                  <div class="card-title" id="candListTitle">Candidats</div>
                </div>
                <div class="table-tools">
                  <input type="text" id="candSearch" placeholder="Rechercher un candidat...">
                  <select id="candFilter">
                    <option value="all">Tous les statuts</option>
                    <option value="sent">Envoyée</option>
                    <option value="response">Réponse</option>
                    <option value="interview">Entretien</option>
                    <option value="accepted">Acceptée</option>
                    <option value="rejected">Rejetée</option>
                  </select>
                </div>
              </div>
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Candidat</th>
                    <th>Offre</th>
                    <th>Statut</th>
                    <th>Date</th>
                    <th>CV</th>
                    <th>Lettre</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody id="candTableBody"></tbody>
              </table>
              <div class="table-footer">
                <span id="candTableCount">Affichage de 0 candidature</span>
              </div>
            </div>
          </section>
        </div>

        <!-- MODAL DETAILS CANDIDAT -->
        <div class="admin-modal-overlay" id="candDetailOverlay">
          <div class="admin-modal-card">
            <div class="admin-modal-head">
              <div class="admin-modal-title" id="candDetailTitle">Détails du candidat</div>
              <button class="admin-modal-close" id="candDetailClose" type="button" aria-label="Fermer"><img src="/image/delete.png" alt="Fermer" width="14" height="14"></button>
            </div>
            <div class="admin-modal-body" id="candDetailBody"></div>
          </div>
        </div>

        <!-- MODAL DOCUMENT -->
        <div class="admin-modal-overlay" id="candDocOverlay">
          <div class="admin-modal-card">
            <div class="admin-modal-head">
              <div class="admin-modal-title" id="candDocTitle">Document</div>
              <button class="admin-modal-close" id="candDocClose" type="button" aria-label="Fermer"><img src="/image/delete.png" alt="Fermer" width="14" height="14"></button>
            </div>
            <div class="admin-modal-body" id="candDocBody"></div>
          </div>
        </div>

        <!-- MODAL MESSAGE -->
        <div class="admin-modal-overlay" id="candMessageOverlay">
          <div class="admin-modal-card">
            <div class="admin-modal-head">
              <div class="admin-modal-title">Envoyer un message au candidat</div>
              <button class="admin-modal-close" id="candMessageClose" type="button" aria-label="Fermer"><img src="/image/delete.png" alt="Fermer" width="14" height="14"></button>
            </div>
            <div class="admin-modal-body">
              <form id="candMessageForm" class="exp-form">
                <label>Message<textarea name="message" rows="5" placeholder="Écrivez votre message au candidat..." required></textarea></label>
                <div class="exp-form-actions">
                  <button type="button" class="btn-outline-sm" id="candMessageCancel">Annuler</button>
                  <button type="submit" class="btn-primary-sm">Envoyer</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- PLACEHOLDER PANEL -->
      <div class="panel" id="panel-placeholder">
        <div class="placeholder-box">
          <div class="placeholder-icon"><svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-8-5a2 2 0 0 0-2 0l-8 5a2 2 0 0 0-1 1.73v8a2 2 0 0 0 1 1.73l8 5a2 2 0 0 0 2 0l8-5a2 2 0 0 0 1-1.73z"/></svg></div>
          <h2 id="placeholderTitle">Section en construction</h2>
          <p>Cette section sera bientôt disponible dans votre espace entreprise.</p>
        </div>
      </div>

    </div>
  </main>
</div>

@include('partials.info-modal')

<!-- ============== FIREBASE JS SDK + GARDE DE SESSION ============== -->
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-database-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-storage-compat.js"></script>
<script src="{{ asset('firebase-init.js') }}"></script>
<script src="script_INFO.js?v=4"></script>
<script src="{{ asset('script_ENT.js') }}?v=8"></script>
</body>
</html>
