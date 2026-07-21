@extends('layouts.app')
@section('title', 'VERA - Param&eacute;tres')
@section('styles')
<link rel="stylesheet" href="style_PA.css">
@endsection

@section('content')
<div class="scroll-area">

      <!-- PAGE HEAD -->
      <div class="page-head">
        <h1>Param&eacute;tres <span class="gear">&#x2699;</span></h1>
        <p>G&eacute;rez votre compte, vos pr&eacute;f&eacute;rences et optimisez votre exp&eacute;rience sur VERA.</p>
      </div>

      <!-- LAYOUT -->
      <div class="layout">

        <!-- SETTINGS NAV -->
        <aside class="settings-nav">
          <div class="settings-nav-item active" data-panel="profil">
            <span class="settings-icon">&#x1F464;</span>
            <div><div class="settings-title">Profil et compte</div><div class="settings-sub">Informations personnelles</div></div>
          </div>
          <div class="settings-nav-item" data-panel="prefs">
            <span class="settings-icon">&#x2699;</span>
            <div><div class="settings-title">Pr&eacute;f&eacute;rences</div><div class="settings-sub">Notifications, langue, devise</div></div>
          </div>
          <div class="settings-nav-item" data-panel="confidentialite">
            <span class="settings-icon">&#x1F512;</span>
            <div><div class="settings-title">Confidentialit&eacute;</div><div class="settings-sub">Donn&eacute;es et s&eacute;curit&eacute;</div></div>
          </div>
          <div class="settings-nav-item" data-panel="candidatures">
            <span class="settings-icon">&#x1F4C4;</span>
            <div><div class="settings-title">Candidatures</div><div class="settings-sub">CV, lettres de motivation</div></div>
          </div>
          <div class="settings-nav-item" data-panel="alertes">
            <span class="settings-icon">&#x1F514;</span>
            <div><div class="settings-title">Alertes emploi</div><div class="settings-sub">Vos recherches et alertes</div></div>
          </div>
          <div class="settings-nav-item" data-panel="paiements">
            <span class="settings-icon">&#x1F4B3;</span>
            <div><div class="settings-title">Paiements</div><div class="settings-sub">Facturation et abonnements</div></div>
          </div>
          <div class="settings-nav-item" data-panel="integrations">
            <span class="settings-icon">&#x1F50C;</span>
            <div><div class="settings-title">Int&eacute;grations</div><div class="settings-sub">Connecter vos outils</div></div>
          </div>
          <div class="settings-nav-item" data-panel="accessibilite">
            <span class="settings-icon">&#x267F;</span>
            <div><div class="settings-title">Accessibilit&eacute;</div><div class="settings-sub">Accessibilit&eacute; et affichage</div></div>
          </div>

          <div class="help-box">
            <div class="help-box-title">&#x2753; Besoin d'aide ?</div>
            <p>Consultez notre centre d'aide ou contactez notre &eacute;quipe support.</p>
            <button class="btn-outline full">Centre d'aide &#x1F4AC;</button>
          </div>
        </aside>

        <!-- MAIN CONTENT -->
        <section class="content-col" id="panelProfil">

          <div class="card">
            <div class="card-head-row">
              <div>
                <div class="card-title">Informations personnelles</div>
                <div class="card-sub">Mettez &agrave; jour vos informations de profil et vos coordonn&eacute;es.</div>
              </div>
              <button class="btn-outline" id="editProfileBtn">Modifier le profil</button>
            </div>

            <div class="profile-info-row">
              <img class="profile-avatar" src="https://i.pravatar.cc/120?img=13" alt="avatar">
              <div class="profile-fields">
                <div class="field">
                  <div class="field-label">Nom complet</div>
                  <div class="field-value" data-field="fullName" data-input-type="text">Bonjour, Junior</div>
                </div>
                <div class="field">
                  <div class="field-label">T&eacute;l&eacute;phone</div>
                  <div class="field-value" data-field="phone" data-input-type="tel">+225 07 12 34 56 78 <span class="verified-tag">&#x2705; V&eacute;rifi&eacute;</span></div>
                </div>
                <div class="field">
                  <div class="field-label">Email</div>
                  <div class="field-value" data-field="email" data-input-type="email">junior.bonjour@email.com <span class="verified-tag">&#x2705; V&eacute;rifi&eacute;</span></div>
                </div>
                <div class="field">
                  <div class="field-label">Localisation</div>
                  <div class="field-value" data-field="residence" data-input-type="text">Abidjan, C&ocirc;te d'Ivoire</div>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-title">Pr&eacute;f&eacute;rences g&eacute;n&eacute;rales</div>
            <div class="card-sub">Personnalisez votre exp&eacute;rience sur la plateforme.</div>

            <div class="pref-row">
              <div class="pref-icon">&#x1F30D;</div>
              <div class="pref-text"><div class="pref-title">Langue</div><div class="pref-sub">Choisissez votre langue pr&eacute;f&eacute;r&eacute;e</div></div>
              <select class="pref-select" id="settingsLanguage">
                <option>Fran&ccedil;ais</option>
                <option>English</option>
                <option>Espa&ntilde;ol</option>
              </select>
            </div>
            <div class="pref-row">
              <div class="pref-icon">&#x1F4B0;</div>
              <div class="pref-text"><div class="pref-title">Devise</div><div class="pref-sub">Pour vos salaires et paiements</div></div>
              <select class="pref-select" id="settingsCurrency">
                <option>XOF (Franc CFA)</option>
                <option>EUR (Euro)</option>
                <option>USD (Dollar)</option>
              </select>
            </div>
            <div class="pref-row">
              <div class="pref-icon">&#x1F552;</div>
              <div class="pref-text"><div class="pref-title">Fuseau horaire</div><div class="pref-sub">Pour l'affichage des horaires</div></div>
              <select class="pref-select" id="settingsTimezone">
                <option>(GMT+0) Abidjan</option>
                <option>(GMT+1) Paris</option>
                <option>(GMT-5) New York</option>
              </select>
            </div>
            <div class="pref-row">
              <div class="pref-icon">&#x1F4B5;</div>
              <div class="pref-text"><div class="pref-title">Format de salaire</div><div class="pref-sub">Comment les salaires sont affich&eacute;s</div></div>
              <select class="pref-select" id="settingsSalaryFormat">
                <option>Mensuel</option>
                <option>Annuel</option>
                <option>Horaire</option>
              </select>
            </div>
          </div>

          <div class="card">
            <div class="card-title">Pr&eacute;f&eacute;rences de notifications</div>
            <div class="card-sub">Choisissez comment et quand vous souhaitez &ecirc;tre notifi&eacute;.</div>

            <div class="toggle-row">
              <div class="pref-icon">&#x1F4BC;</div>
              <div class="pref-text"><div class="pref-title">Nouvelles opportunit&eacute;s</div><div class="pref-sub">Recevoir des alertes pour les nouvelles offres</div></div>
              <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
            </div>
            <div class="toggle-row">
              <div class="pref-icon">&#x1F4AC;</div>
              <div class="pref-text"><div class="pref-title">Messages</div><div class="pref-sub">&Ecirc;tre notifi&eacute; des nouveaux messages</div></div>
              <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
            </div>
            <div class="toggle-row">
              <div class="pref-icon">&#x1F4CB;</div>
              <div class="pref-text"><div class="pref-title">Statut des candidatures</div><div class="pref-sub">Suivre l'&eacute;volution de vos candidatures</div></div>
              <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
            </div>
            <div class="toggle-row">
              <div class="pref-icon">&#x1F393;</div>
              <div class="pref-text"><div class="pref-title">Formations et conseils</div><div class="pref-sub">Nouveaux contenus et recommandations</div></div>
              <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
            </div>
            <a href="#" class="see-all">G&eacute;rer toutes les notifications &#x1F514;</a>
          </div>

        </section>

        <!-- RIGHT COLUMN -->
        <aside class="side-col">

          <div class="card">
            <div class="card-title-row"><span class="shield-icon green">&#x1F6E1;</span><div><div class="card-title">S&eacute;curit&eacute; du compte</div><div class="card-sub">Prot&eacute;gez votre compte et vos donn&eacute;es.</div></div></div>

            <div class="sec-row">
              <div class="pref-icon">&#x1F511;</div>
              <div class="pref-text"><div class="pref-title">Mot de passe</div><div class="pref-sub">••••••••</div></div>
              <button class="link-btn">Modifier</button>
            </div>
            <div class="sec-row">
              <div class="pref-icon">&#x1F510;</div>
              <div class="pref-text"><div class="pref-title">Authentification &agrave; deux facteurs</div><div class="pref-sub">Recommand&eacute; pour plus de s&eacute;curit&eacute;</div></div>
              <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
            </div>
            <div class="sec-row">
              <div class="pref-icon">&#x1F4F1;</div>
              <div class="pref-text"><div class="pref-title">Sessions actives</div><div class="pref-sub">3 sessions actives</div></div>
              <button class="link-btn">Voir</button>
            </div>
            <div class="sec-row">
              <div class="pref-icon">&#x1F6AA;</div>
              <div class="pref-text"><div class="pref-title">D&eacute;connexion de tous les appareils</div><div class="pref-sub">S&eacute;curiser votre compte</div></div>
              <button class="link-btn">D&eacute;connecter</button>
            </div>
          </div>

          <div class="card">
            <div class="card-title-row"><span class="shield-icon purple">&#x1F50E;</span><div><div class="card-title">Confidentialit&eacute;</div><div class="card-sub">G&eacute;rez vos donn&eacute;es et votre visibilit&eacute;.</div></div></div>

            <div class="sec-row">
              <div class="pref-icon">&#x1F441;</div>
              <div class="pref-text"><div class="pref-title">Profil public</div><div class="pref-sub">Rendre mon profil visible aux recruteurs</div></div>
              <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
            </div>
            <div class="sec-row">
              <div class="pref-icon">&#x1F50D;</div>
              <div class="pref-text"><div class="pref-title">Visible par les recruteurs</div><div class="pref-sub">Autoriser les recruteurs &agrave; me trouver</div></div>
              <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
            </div>
            <div class="sec-row">
              <div class="pref-icon">&#x1F4CA;</div>
              <div class="pref-text"><div class="pref-title">Donn&eacute;es analytiques</div><div class="pref-sub">Aider &agrave; am&eacute;liorer VERA</div></div>
              <label class="switch"><input type="checkbox"><span class="slider"></span></label>
            </div>
            <div class="sec-row">
              <div class="pref-icon">&#x1F4E5;</div>
              <div class="pref-text"><div class="pref-title">T&eacute;l&eacute;chargement de donn&eacute;es</div><div class="pref-sub">T&eacute;l&eacute;charger vos donn&eacute;es personnelles</div></div>
              <button class="link-btn" id="downloadDataBtn">T&eacute;l&eacute;charger</button>
            </div>
          </div>

          <div class="card danger-card">
            <div class="card-title danger">Suppression du compte</div>
            <p class="danger-text">Cette action est irr&eacute;versible et supprimera d&eacute;finitivement toutes vos donn&eacute;es.</p>
            <button class="btn-danger" id="deleteAccountBtn">&#x1F5D1; Supprimer mon compte</button>
          </div>

        </aside>

      </div>
    </div>
@endsection
@section('scripts')
<script src="script_PA.js"></script>
@endsection
