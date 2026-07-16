@extends('layouts.app')
@section('title', 'VERA - Mon Profil')
@section('styles')
<link rel="stylesheet" href="style_P.css">
@endsection

@section('content')
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
          <img id="profileAvatar" src="" alt="Photo de profil" style="display:none;">
          <div id="profileInitial" class="avatar-initial">?</div>
          <div id="avatarSpinner" class="avatar-spinner">⏳</div>
          <button class="avatar-edit" id="avatarEditBtn" title="Changer la photo">📷</button>
          <input type="file" id="avatarInput" accept="image/*" style="display:none;">
        </div>
        <div id="avatarError" class="avatar-input-error" style="display:none;"></div>
        <div class="profile-info">
          <div class="profile-name-row">
            <h2 id="profileFullName">...</h2>
            <!-- <button class="btn-primary-sm">Modifier le  profil</button> -->
          </div>
          <div class="profile-role" id="profileRole">Non renseigné</div>
          <div class="profile-meta">
            <span>📍 <span id="profileResidence">Non renseigné</span></span>
            <span class="dot-sep">•</span>
            <span class="avail-dot"></span>
            <span id="profileAvailability">Non renseigné</span>
          </div>
          <div class="profile-contacts">
            <span>💬 <span id="profileWhatsapp">Non renseigné</span></span>
            <span>✉ <span id="profileEmail">Non renseigné</span></span>
            <span>💻 <span id="profileLinkedin">Non renseigné</span></span>
          </div>
        </div>
        <div class="profile-completion">
          <div class="completion-label">Complétude du profil</div>
          <div class="completion-value" id="completionValue">0%</div>
          <div class="completion-bar"><div class="completion-fill" id="completionFill" style="width:0%"></div></div>
          <div class="completion-text" id="completionText">Profil incomplet</div>
          <div class="completion-date" id="lastUpdatedDate">Dernière mise à jour : —</div>
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
              <div class="score-num" id="scoreNum">0<span>/100</span></div>
            </div>
            <div class="score-badge" id="scoreBadge">🏆 —</div>
            <div class="score-text" id="scoreText">—</div>
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
              <button class="btn-outline-sm btn-edit-about" type="button">Modifier</button>
            </div>
            <p class="about-text" data-field="about">Non renseigné</p>
            <div class="about-stats">
              <div><input type="number" min="0" class="stat-input" data-stat="experienceYears" value="4"><span>Années d'expérience</span></div>
              <div><input type="number" min="0" class="stat-input" data-stat="projectsCount" value="25"><span>Projets réalisés</span></div>
              <div><input type="number" min="0" class="stat-input" data-stat="clientsCount" value="15"><span>Clients satisfaits</span></div>
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

          <div class="card" data-section="personal">
            <div class="card-head-row"><span>Informations personnelles</span><button class="btn-outline-sm btn-edit-section" type="button">Modifier</button></div>
            <ul class="info-list">
              <li><span class="info-icon">👤</span><span class="info-label">Prénom</span><span class="info-value" data-field="firstName">Junior</span></li>
              <li><span class="info-icon">👤</span><span class="info-label">Nom</span><span class="info-value" data-field="lastName">Tchouaka</span></li>
              <li><span class="info-icon">✉</span><span class="info-label">Adresse email</span><span class="info-value" data-field="email" data-input="email">junior.tchouaka@gmail.com</span></li>
              <li><span class="info-icon">🎂</span><span class="info-label">Date de naissance</span><span class="info-value" data-field="birthDate" data-input="date">12 Mars 1997</span></li>
              <li><span class="info-icon">💍</span><span class="info-label">Situation matrimoniale</span><span class="info-value" data-field="maritalStatus" data-input="select" data-options="Célibataire|Marié(e)|Divorcé(e)|Veuf(ve)|En concubinage">Célibataire</span></li>
              <li><span class="info-icon">🌍</span><span class="info-label">Nationalité</span><span class="info-value" data-field="nationality">Camerounaise</span></li>
              <li><span class="info-icon">📍</span><span class="info-label">Lieu de résidence</span><span class="info-value" data-field="residence">Douala, Cameroun</span></li>
              <li><span class="info-icon">📱</span><span class="info-label">Numéro WhatsApp</span><span class="info-value" data-field="whatsapp">+237 6 12 34 56 78</span></li>
              <li><span class="info-icon">🗣</span><span class="info-label">Langue principale</span><span class="info-value" data-field="mainLanguage" data-input="tags">Français</span></li>
              <li><span class="info-icon">💻</span><span class="info-label">Profil GitHub</span><span class="info-value" data-field="linkedin">github.com/...</span></li>
            </ul>
          </div>

          <div class="card" data-section="availability">
            <div class="card-head-row"><span>Disponibilité &amp; Préférences</span><button class="btn-outline-sm btn-edit-section" type="button">Modifier</button></div>
            <ul class="info-list">
              <li><span class="info-icon">💼</span><span class="info-label">Fonction de l'utilisateur</span><span class="info-value" data-field="jobTitle">Non renseigné</span></li>
              <li><span class="info-icon">🕐</span><span class="info-label">Disponibilité</span><span class="info-value" data-field="availability" data-input="select" data-options="Immédiatement|Dans 1 mois|Dans 3 mois|Dans 6 mois|Pas disponible">Immédiatement</span></li>
              <li><span class="info-icon">📄</span><span class="info-label">Type de contrat souhaité</span><span class="info-value" data-field="contractType" data-input="select" data-options="CDI|CDD|Freelance|Stage|Intérim|Remote|CDI, Remote">CDI, Remote</span></li>
              <li><span class="info-icon">🌐</span><span class="info-label">Lieu de travail préféré</span><span class="info-value" data-field="workLocation">Remote / Monde entier</span></li>
              <li><span class="info-icon">💰</span><span class="info-label">Salaire souhaité</span><span class="info-value" data-field="salary" data-input="salary">2 000 – 3 000 $ / mois</span></li>
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

      <!-- LAYOUT: INFORMATIONS -->
      <div class="profile-layout info-layout" id="infoLayout" style="display:none;">
        <div class="col-full">

          <div class="info-hero">
            <img id="infoAvatar" src="" alt="avatar" style="display:none;">
            <div id="infoInitial" class="info-hero-initial">?</div>
            <div class="info-hero-text">
              <h3 id="infoFullName">Carelle Djeuwou</h3>
              <span class="info-hero-role" id="infoJob">Non renseigné</span>
            </div>
            <button class="btn-outline-sm btn-edit-section" type="button" data-target="info-personal">Modifier</button>
          </div>

          <div class="card info-card" data-section="info-personal">
            <div class="card-head-row"><span>Informations personnelles</span></div>
            <ul class="info-grid">
              <li class="info-item">
                <span class="info-icon">👤</span>
                <div class="info-item-body">
                  <span class="info-label">Prénom</span>
                  <span class="info-value" data-field="firstName">Carelle</span>
                </div>
              </li>
              <li class="info-item">
                <span class="info-icon">👤</span>
                <div class="info-item-body">
                  <span class="info-label">Nom</span>
                  <span class="info-value" data-field="lastName">Djeuwou</span>
                </div>
              </li>
              <li class="info-item">
                <span class="info-icon">✉</span>
                <div class="info-item-body">
                  <span class="info-label">Adresse email</span>
                  <span class="info-value" data-field="email" data-input="email">carelledjeuwou@gmail.com</span>
                </div>
              </li>
              <li class="info-item">
                <span class="info-icon">🎂</span>
                <div class="info-item-body">
                  <span class="info-label">Date de naissance</span>
                  <span class="info-value" data-field="birthDate" data-input="date">10 Août 1999</span>
                </div>
              </li>
              <li class="info-item">
                <span class="info-icon">💍</span>
                <div class="info-item-body">
                  <span class="info-label">Situation matrimoniale</span>
                  <span class="info-value" data-field="maritalStatus" data-input="select" data-options="Célibataire|Marié(e)|Divorcé(e)|Veuf(ve)|En concubinage">Célibataire</span>
                </div>
              </li>
              <li class="info-item">
                <span class="info-icon">🌍</span>
                <div class="info-item-body">
                  <span class="info-label">Nationalité</span>
                  <span class="info-value" data-field="nationality">Camerounaise</span>
                </div>
              </li>
              <li class="info-item">
                <span class="info-icon">📍</span>
                <div class="info-item-body">
                  <span class="info-label">Lieu de résidence</span>
                  <span class="info-value" data-field="residence">yaoundé, Cameroun</span>
                </div>
              </li>
              <li class="info-item">
                <span class="info-icon">📱</span>
                <div class="info-item-body">
                  <span class="info-label">Numéro WhatsApp</span>
                  <span class="info-value" data-field="whatsapp">+237 6 93929597</span>
                </div>
              </li>
              <li class="info-item">
                <span class="info-icon">🗣</span>
                <div class="info-item-body">
                  <span class="info-label">Langue principale</span>
                  <span class="info-value" data-field="mainLanguage" data-input="tags">français, anglais, italie</span>
                </div>
              </li>
              <li class="info-item">
                <span class="info-icon">💻</span>
                <div class="info-item-body">
                  <span class="info-label">Profil GitHub</span>
                  <span class="info-value" data-field="linkedin">linkedin.com/in/...</span>
                </div>
              </li>
            </ul>
          </div>

        </div>
      </div>

      <!-- LAYOUT: EXPÉRIENCE -->
      <div class="profile-layout exp-layout" id="expLayout" style="display:none;">
        <div class="col-full">
          <div class="exp-toolbar">
            <button class="exp-search-toggle" id="expSearchToggle" type="button" title="Rechercher">
              <img src="/image/3917754.png" alt="Rechercher">
            </button>
            <div class="exp-search" id="expSearchWrap" style="display:none;">
              <span>🔎</span>
              <input type="text" id="expSearch" placeholder="Rechercher une expérience (poste, entreprise...)">
            </div>
            <button class="btn-primary-sm" id="expAddBtn" type="button">+ Ajouter une expérience</button>
          </div>

          <div class="card exp-card">
            <div id="expList" class="exp-list"></div>
            <div id="expEmpty" class="exp-empty" style="display:none;">
              <div class="exp-empty-icon">💼</div>
              <p>Aucune expérience pour le moment.</p>
              <span>Cliquez sur « + Ajouter une expérience » pour commencer.</span>
            </div>
          </div>
        </div>
      </div>

      <!-- LAYOUT: COMPÉTENCES -->
      <div class="profile-layout skills-layout" id="skillsLayout" style="display:none;">
        <div class="col-full">
          <div class="exp-toolbar">
            <button class="exp-search-toggle" id="skillSearchToggle" type="button" title="Rechercher">
              <img src="/image/3917754.png" alt="Rechercher">
            </button>
            <div class="exp-search" id="skillSearchWrap" style="display:none;">
              <span>🔎</span>
              <input type="text" id="skillSearch" placeholder="Rechercher une compétence...">
            </div>
            <button class="btn-primary-sm" id="skillAddBtn" type="button">+ Ajouter une compétence</button>
          </div>
          <div class="card exp-card">
            <div id="skillsList" class="skills-manage-list"></div>
            <div id="skillsEmpty" class="exp-empty" style="display:none;">
              <div class="exp-empty-icon">🛠</div>
              <p>Aucune compétence pour le moment.</p>
              <span>Cliquez sur « + Ajouter une compétence » pour commencer.</span>
            </div>
          </div>
        </div>
      </div>

      <!-- LAYOUT: FORMATIONS -->
      <div class="profile-layout form-layout" id="formLayout" style="display:none;">
        <div class="col-full">
          <div class="exp-toolbar">
            <button class="exp-search-toggle" id="formSearchToggle" type="button" title="Rechercher">
              <img src="/image/3917754.png" alt="Rechercher">
            </button>
            <div class="exp-search" id="formSearchWrap" style="display:none;">
              <span>🔎</span>
              <input type="text" id="formSearch" placeholder="Rechercher une formation (diplôme, établissement...)">
            </div>
            <button class="btn-primary-sm" id="formAddBtn" type="button">+ Ajouter une formation</button>
          </div>
          <div class="card exp-card">
            <div id="formList" class="exp-list"></div>
            <div id="formEmpty" class="exp-empty" style="display:none;">
              <div class="exp-empty-icon">🎓</div>
              <p>Aucune formation pour le moment.</p>
              <span>Cliquez sur « + Ajouter une formation » pour commencer.</span>
            </div>
          </div>
        </div>
      </div>

      <!-- LAYOUT: CERTIFICATIONS -->
      <div class="profile-layout certif-layout" id="certifLayout" style="display:none;">
        <div class="col-full">
          <div class="exp-toolbar">
            <button class="exp-search-toggle" id="certifSearchToggle" type="button" title="Rechercher">
              <img src="/image/3917754.png" alt="Rechercher">
            </button>
            <div class="exp-search" id="certifSearchWrap" style="display:none;">
              <span>🔎</span>
              <input type="text" id="certifSearch" placeholder="Rechercher une certification (nom, organisme...)">
            </div>
            <button class="btn-primary-sm" id="certifAddBtn" type="button">+ Ajouter une certification</button>
          </div>
          <div class="card exp-card">
            <div id="certifList" class="exp-list"></div>
            <div id="certifEmpty" class="exp-empty" style="display:none;">
              <div class="exp-empty-icon">🏆</div>
              <p>Aucune certification pour le moment.</p>
              <span>Cliquez sur « + Ajouter une certification » pour commencer.</span>
            </div>
          </div>
        </div>
      </div>

      <!-- LAYOUT: LANGUES -->
      <div class="profile-layout lang-layout" id="langLayout" style="display:none;">
        <div class="col-full">
          <div class="exp-toolbar">
            <button class="exp-search-toggle" id="langSearchToggle" type="button" title="Rechercher">
              <img src="/image/3917754.png" alt="Rechercher">
            </button>
            <div class="exp-search" id="langSearchWrap" style="display:none;">
              <span>🔎</span>
              <input type="text" id="langSearch" placeholder="Rechercher une langue...">
            </div>
            <button class="btn-primary-sm" id="langAddBtn" type="button">+ Ajouter une langue</button>
          </div>
          <div class="card exp-card">
            <div id="langList" class="exp-list"></div>
            <div id="langEmpty" class="exp-empty" style="display:none;">
              <div class="exp-empty-icon">🗣</div>
              <p>Aucune langue pour le moment.</p>
              <span>Cliquez sur « + Ajouter une langue » pour commencer.</span>
            </div>
          </div>
        </div>
      </div>

      <!-- LAYOUT: PRÉFÉRENCES -->
      <div class="profile-layout pref-layout" id="prefLayout" style="display:none;">
        <div class="col-full">
          <div class="exp-toolbar">
            <button class="exp-search-toggle" id="prefSearchToggle" type="button" title="Rechercher">
              <img src="/image/3917754.png" alt="Rechercher">
            </button>
            <div class="exp-search" id="prefSearchWrap" style="display:none;">
              <span>🔎</span>
              <input type="text" id="prefSearch" placeholder="Rechercher une préférence...">
            </div>
            <button class="btn-primary-sm" id="prefAddBtn" type="button">+ Ajouter une préférence</button>
          </div>
          <div class="card exp-card">
            <div id="prefList" class="exp-list"></div>
            <div id="prefEmpty" class="exp-empty" style="display:none;">
              <div class="exp-empty-icon">⚙️</div>
              <p>Aucune préférence pour le moment.</p>
              <span>Cliquez sur « + Ajouter une préférence » pour commencer.</span>
            </div>
          </div>
        </div>
      </div>

    </div>
@endsection
@section('scripts')
<script src="script_P.js"></script>
@endsection
