@extends('layouts.app')
@section('title', 'VERA - ParamÃ¨tres')
@section('styles')
<link rel="stylesheet" href="style_PA.css">
@endsection

@section('content')
<div class="scroll-area">

      <!-- PAGE HEAD -->
      <div class="page-head">
        <h1>Param¨tres <span class="gear">âš™</span></h1>
        <p>G©rez votre compte, vos pr©f©rences et optimisez votre exp©rience sur VERA.</p>
      </div>

      <!-- LAYOUT -->
      <div class="layout">

        <!-- SETTINGS NAV -->
        <aside class="settings-nav">
          <div class="settings-nav-item active" data-panel="profil">
            <span class="settings-icon">ğŸ‘¤</span>
            <div><div class="settings-title">Profil et compte</div><div class="settings-sub">Informations personnelles</div></div>
          </div>
          <div class="settings-nav-item" data-panel="prefs">
            <span class="settings-icon">ğŸ””</span>
            <div><div class="settings-title">Pr©f©rences</div><div class="settings-sub">Notifications, langue, devise</div></div>
          </div>
          <div class="settings-nav-item" data-panel="confidentialite">
            <span class="settings-icon">ğŸ”’</span>
            <div><div class="settings-title">Confidentialit©</div><div class="settings-sub">Donn©es et s©curit©</div></div>
          </div>
          <div class="settings-nav-item" data-panel="candidatures">
            <span class="settings-icon">ğŸ“„</span>
            <div><div class="settings-title">Candidatures</div><div class="settings-sub">CV, lettres de motivation</div></div>
          </div>
          <div class="settings-nav-item" data-panel="alertes">
            <span class="settings-icon">ğŸ””</span>
            <div><div class="settings-title">Alertes emploi</div><div class="settings-sub">Vos recherches et alertes</div></div>
          </div>
          <div class="settings-nav-item" data-panel="paiements">
            <span class="settings-icon">ğŸ’³</span>
            <div><div class="settings-title">Paiements</div><div class="settings-sub">Facturation et abonnements</div></div>
          </div>
          <div class="settings-nav-item" data-panel="integrations">
            <span class="settings-icon">ğŸ”—</span>
            <div><div class="settings-title">Int©grations</div><div class="settings-sub">Connecter vos outils</div></div>
          </div>
          <div class="settings-nav-item" data-panel="accessibilite">
            <span class="settings-icon">â™¿</span>
            <div><div class="settings-title">Accessibilit©</div><div class="settings-sub">Accessibilit© et affichage</div></div>
          </div>

          <div class="help-box">
            <div class="help-box-title">â“ Besoin d'aide ?</div>
            <p>Consultez notre centre d'aide ou contactez notre ©quipe support.</p>
            <button class="btn-outline full">Centre d'aide â†’</button>
          </div>
        </aside>

        <!-- MAIN CONTENT -->
        <section class="content-col" id="panelProfil">

          <div class="card">
            <div class="card-head-row">
              <div>
                <div class="card-title">Informations personnelles</div>
                <div class="card-sub">Mettez   jour vos informations de profil et vos coordonn©es.</div>
              </div>
              <button class="btn-outline" id="editProfileBtn">Modifier le profil</button>
            </div>

            <div class="profile-info-row">
              <img class="profile-avatar" src="https://i.pravatar.cc/120?img=13" alt="avatar">
              <div class="profile-fields">
                <div class="field">
                  <div class="field-label">Nom complet</div>
                  <div class="field-value">Bonjour, Junior</div>
                </div>
                <div class="field">
                  <div class="field-label">T©l©phone</div>
                  <div class="field-value">+225 07 12 34 56 78 <span class="verified-tag">âœ“ V©rifi©</span></div>
                </div>
                <div class="field">
                  <div class="field-label">Email</div>
                  <div class="field-value">junior.bonjour@email.com <span class="verified-tag">âœ“ V©rifi©</span></div>
                </div>
                <div class="field">
                  <div class="field-label">Localisation</div>
                  <div class="field-value">Abidjan, C´te d'Ivoire</div>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-title">Pr©f©rences g©n©rales</div>
            <div class="card-sub">Personnalisez votre exp©rience sur la plateforme.</div>

            <div class="pref-row">
              <div class="pref-icon">ğŸŒ</div>
              <div class="pref-text"><div class="pref-title">Langue</div><div class="pref-sub">Choisissez votre langue pr©f©r©e</div></div>
              <select class="pref-select">
                <option>Fran§ais</option>
                <option>English</option>
                <option>Espa±ol</option>
              </select>
            </div>
            <div class="pref-row">
              <div class="pref-icon">ğŸ’°</div>
              <div class="pref-text"><div class="pref-title">Devise</div><div class="pref-sub">Pour vos salaires et paiements</div></div>
              <select class="pref-select">
                <option>XOF (Franc CFA)</option>
                <option>EUR (Euro)</option>
                <option>USD (Dollar)</option>
              </select>
            </div>
            <div class="pref-row">
              <div class="pref-icon">ğŸ•</div>
              <div class="pref-text"><div class="pref-title">Fuseau horaire</div><div class="pref-sub">Pour l'affichage des horaires</div></div>
              <select class="pref-select">
                <option>(GMT+0) Abidjan</option>
                <option>(GMT+1) Paris</option>
                <option>(GMT-5) New York</option>
              </select>
            </div>
            <div class="pref-row">
              <div class="pref-icon">ğŸ“Š</div>
              <div class="pref-text"><div class="pref-title">Format de salaire</div><div class="pref-sub">Comment les salaires sont affich©s</div></div>
              <select class="pref-select">
                <option>Mensuel</option>
                <option>Annuel</option>
                <option>Horaire</option>
              </select>
            </div>
          </div>

          <div class="card">
            <div class="card-title">Pr©f©rences de notifications</div>
            <div class="card-sub">Choisissez comment et quand vous souhaitez ªtre notifi©.</div>

            <div class="toggle-row">
              <div class="pref-icon">ğŸ’¼</div>
              <div class="pref-text"><div class="pref-title">Nouvelles opportunit©s</div><div class="pref-sub">Recevoir des alertes pour les nouvelles offres</div></div>
              <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
            </div>
            <div class="toggle-row">
              <div class="pref-icon">âœ‰</div>
              <div class="pref-text"><div class="pref-title">Messages</div><div class="pref-sub">Štre notifi© des nouveaux messages</div></div>
              <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
            </div>
            <div class="toggle-row">
              <div class="pref-icon">ğŸ“„</div>
              <div class="pref-text"><div class="pref-title">Statut des candidatures</div><div class="pref-sub">Suivre l'©volution de vos candidatures</div></div>
              <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
            </div>
            <div class="toggle-row">
              <div class="pref-icon">ğŸ“</div>
              <div class="pref-text"><div class="pref-title">Formations et conseils</div><div class="pref-sub">Nouveaux contenus et recommandations</div></div>
              <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
            </div>
            <a href="#" class="see-all">G©rer toutes les notifications â†’</a>
          </div>

        </section>

        <!-- RIGHT COLUMN -->
        <aside class="side-col">

          <div class="card">
            <div class="card-title-row"><span class="shield-icon green">ğŸ›¡</span><div><div class="card-title">S©curit© du compte</div><div class="card-sub">Prot©gez votre compte et vos donn©es.</div></div></div>

            <div class="sec-row">
              <div class="pref-icon">ğŸ”‘</div>
              <div class="pref-text"><div class="pref-title">Mot de passe</div><div class="pref-sub">â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢</div></div>
              <button class="link-btn">Modifier</button>
            </div>
            <div class="sec-row">
              <div class="pref-icon">ğŸ”</div>
              <div class="pref-text"><div class="pref-title">Authentification   deux facteurs</div><div class="pref-sub">Recommand© pour plus de s©curit©</div></div>
              <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
            </div>
            <div class="sec-row">
              <div class="pref-icon">ğŸ’»</div>
              <div class="pref-text"><div class="pref-title">Sessions actives</div><div class="pref-sub">3 sessions actives</div></div>
              <button class="link-btn">Voir</button>
            </div>
            <div class="sec-row">
              <div class="pref-icon">ğŸšª</div>
              <div class="pref-text"><div class="pref-title">D©connexion de tous les appareils</div><div class="pref-sub">S©curiser votre compte</div></div>
              <button class="link-btn">D©connecter</button>
            </div>
          </div>

          <div class="card">
            <div class="card-title-row"><span class="shield-icon purple">ğŸ”’</span><div><div class="card-title">Confidentialit©</div><div class="card-sub">G©rez vos donn©es et votre visibilit©.</div></div></div>

            <div class="sec-row">
              <div class="pref-icon">ğŸ‘</div>
              <div class="pref-text"><div class="pref-title">Profil public</div><div class="pref-sub">Rendre mon profil visible aux recruteurs</div></div>
              <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
            </div>
            <div class="sec-row">
              <div class="pref-icon">ğŸ”</div>
              <div class="pref-text"><div class="pref-title">Visible par les recruteurs</div><div class="pref-sub">Autoriser les recruteurs   me trouver</div></div>
              <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
            </div>
            <div class="sec-row">
              <div class="pref-icon">ğŸ“Š</div>
              <div class="pref-text"><div class="pref-title">Donn©es analytiques</div><div class="pref-sub">Aider   am©liorer VERA</div></div>
              <label class="switch"><input type="checkbox"><span class="slider"></span></label>
            </div>
            <div class="sec-row">
              <div class="pref-icon">â¬‡</div>
              <div class="pref-text"><div class="pref-title">T©l©chargement de donn©es</div><div class="pref-sub">T©l©charger vos donn©es personnelles</div></div>
              <button class="link-btn" id="downloadDataBtn">T©l©charger</button>
            </div>
          </div>

          <div class="card danger-card">
            <div class="card-title danger">Suppression du compte</div>
            <p class="danger-text">Cette action est irr©versible et supprimera d©finitivement toutes vos donn©es.</p>
            <button class="btn-danger" id="deleteAccountBtn">ğŸ—‘ Supprimer mon compte</button>
          </div>

        </aside>

      </div>
    </div>
@endsection
@section('scripts')
<script src="script_PA.js"></script>
@endsection
