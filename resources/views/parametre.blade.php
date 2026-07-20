@extends('layouts.app')
@section('title', 'VERA - Paramètres')
@section('styles')
<link rel="stylesheet" href="style_PA.css">
@endsection

@section('content')
<div class="scroll-area">

      <!-- PAGE HEAD -->
      <div class="page-head">
        <h1>Paramètres <span class="gear">??</span></h1>
        <p>Gérez votre compte, vos préférences et optimisez votre expérience sur VERA.</p>
      </div>

      <!-- LAYOUT -->
      <div class="layout">

        <!-- SETTINGS NAV -->
        <aside class="settings-nav">
          <div class="settings-nav-item active" data-panel="profil">
            <span class="settings-icon">??</span>
            <div><div class="settings-title">Profil et compte</div><div class="settings-sub">Informations personnelles</div></div>
          </div>
          <div class="settings-nav-item" data-panel="prefs">
            <span class="settings-icon">??</span>
            <div><div class="settings-title">Préférences</div><div class="settings-sub">Notifications, langue, devise</div></div>
          </div>
          <div class="settings-nav-item" data-panel="confidentialite">
            <span class="settings-icon">??</span>
            <div><div class="settings-title">Confidentialité</div><div class="settings-sub">Données et sécurité</div></div>
          </div>
          <div class="settings-nav-item" data-panel="candidatures">
            <span class="settings-icon">??</span>
            <div><div class="settings-title">Candidatures</div><div class="settings-sub">CV, lettres de motivation</div></div>
          </div>
          <div class="settings-nav-item" data-panel="alertes">
            <span class="settings-icon">??</span>
            <div><div class="settings-title">Alertes emploi</div><div class="settings-sub">Vos recherches et alertes</div></div>
          </div>
          <div class="settings-nav-item" data-panel="paiements">
            <span class="settings-icon">??</span>
            <div><div class="settings-title">Paiements</div><div class="settings-sub">Facturation et abonnements</div></div>
          </div>
          <div class="settings-nav-item" data-panel="integrations">
            <span class="settings-icon">??</span>
            <div><div class="settings-title">Intégrations</div><div class="settings-sub">Connecter vos outils</div></div>
          </div>
          <div class="settings-nav-item" data-panel="accessibilite">
            <span class="settings-icon">?</span>
            <div><div class="settings-title">Accessibilité</div><div class="settings-sub">Accessibilité et affichage</div></div>
          </div>

          <div class="help-box">
            <div class="help-box-title">? Besoin d'aide ?</div>
            <p>Consultez notre centre d'aide ou contactez notre équipe support.</p>
            <button class="btn-outline full">Centre d'aide ?</button>
          </div>
        </aside>

        <!-- MAIN CONTENT -->
        <section class="content-col" id="panelProfil">

          <div class="card">
            <div class="card-head-row">
              <div>
                <div class="card-title">Informations personnelles</div>
                <div class="card-sub">Mettez à jour vos informations de profil et vos coordonnées.</div>
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
                  <div class="field-label">Téléphone</div>
                  <div class="field-value">+225 07 12 34 56 78 <span class="verified-tag">? Vérifié</span></div>
                </div>
                <div class="field">
                  <div class="field-label">Email</div>
                  <div class="field-value">junior.bonjour@email.com <span class="verified-tag">? Vérifié</span></div>
                </div>
                <div class="field">
                  <div class="field-label">Localisation</div>
                  <div class="field-value">Abidjan, Côte d'Ivoire</div>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-title">Préférences générales</div>
            <div class="card-sub">Personnalisez votre expérience sur la plateforme.</div>

            <div class="pref-row">
              <div class="pref-icon">??</div>
              <div class="pref-text"><div class="pref-title">Langue</div><div class="pref-sub">Choisissez votre langue préférée</div></div>
              <select class="pref-select">
                <option>Français</option>
                <option>English</option>
                <option>Español</option>
              </select>
            </div>
            <div class="pref-row">
              <div class="pref-icon">??</div>
              <div class="pref-text"><div class="pref-title">Devise</div><div class="pref-sub">Pour vos salaires et paiements</div></div>
              <select class="pref-select">
                <option>XOF (Franc CFA)</option>
                <option>EUR (Euro)</option>
                <option>USD (Dollar)</option>
              </select>
            </div>
            <div class="pref-row">
              <div class="pref-icon">??</div>
              <div class="pref-text"><div class="pref-title">Fuseau horaire</div><div class="pref-sub">Pour l'affichage des horaires</div></div>
              <select class="pref-select">
                <option>(GMT+0) Abidjan</option>
                <option>(GMT+1) Paris</option>
                <option>(GMT-5) New York</option>
              </select>
            </div>
            <div class="pref-row">
              <div class="pref-icon">??</div>
              <div class="pref-text"><div class="pref-title">Format de salaire</div><div class="pref-sub">Comment les salaires sont affichés</div></div>
              <select class="pref-select">
                <option>Mensuel</option>
                <option>Annuel</option>
                <option>Horaire</option>
              </select>
            </div>
          </div>

          <div class="card">
            <div class="card-title">Préférences de notifications</div>
            <div class="card-sub">Choisissez comment et quand vous souhaitez être notifié.</div>

            <div class="toggle-row">
              <div class="pref-icon">??</div>
              <div class="pref-text"><div class="pref-title">Nouvelles opportunités</div><div class="pref-sub">Recevoir des alertes pour les nouvelles offres</div></div>
              <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
            </div>
            <div class="toggle-row">
              <div class="pref-icon">??</div>
              <div class="pref-text"><div class="pref-title">Messages</div><div class="pref-sub">Être notifié des nouveaux messages</div></div>
              <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
            </div>
            <div class="toggle-row">
              <div class="pref-icon">??</div>
              <div class="pref-text"><div class="pref-title">Statut des candidatures</div><div class="pref-sub">Suivre l'évolution de vos candidatures</div></div>
              <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
            </div>
            <div class="toggle-row">
              <div class="pref-icon">??</div>
              <div class="pref-text"><div class="pref-title">Formations et conseils</div><div class="pref-sub">Nouveaux contenus et recommandations</div></div>
              <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
            </div>
            <a href="#" class="see-all">Gérer toutes les notifications ?</a>
          </div>

        </section>

        <!-- RIGHT COLUMN -->
        <aside class="side-col">

          <div class="card">
            <div class="card-title-row"><span class="shield-icon green">???</span><div><div class="card-title">Sécurité du compte</div><div class="card-sub">Protégez votre compte et vos données.</div></div></div>

            <div class="sec-row">
              <div class="pref-icon">??</div>
              <div class="pref-text"><div class="pref-title">Mot de passe</div><div class="pref-sub">••••••••</div></div>
              <button class="link-btn">Modifier</button>
            </div>
            <div class="sec-row">
              <div class="pref-icon">??</div>
              <div class="pref-text"><div class="pref-title">Authentification à deux facteurs</div><div class="pref-sub">Recommandé pour plus de sécurité</div></div>
              <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
            </div>
            <div class="sec-row">
              <div class="pref-icon">??</div>
              <div class="pref-text"><div class="pref-title">Sessions actives</div><div class="pref-sub">3 sessions actives</div></div>
              <button class="link-btn">Voir</button>
            </div>
            <div class="sec-row">
              <div class="pref-icon">??</div>
              <div class="pref-text"><div class="pref-title">Déconnexion de tous les appareils</div><div class="pref-sub">Sécuriser votre compte</div></div>
              <button class="link-btn">Déconnecter</button>
            </div>
          </div>

          <div class="card">
            <div class="card-title-row"><span class="shield-icon purple">??</span><div><div class="card-title">Confidentialité</div><div class="card-sub">Gérez vos données et votre visibilité.</div></div></div>

            <div class="sec-row">
              <div class="pref-icon">???</div>
              <div class="pref-text"><div class="pref-title">Profil public</div><div class="pref-sub">Rendre mon profil visible aux recruteurs</div></div>
              <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
            </div>
            <div class="sec-row">
              <div class="pref-icon">??</div>
              <div class="pref-text"><div class="pref-title">Visible par les recruteurs</div><div class="pref-sub">Autoriser les recruteurs à me trouver</div></div>
              <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
            </div>
            <div class="sec-row">
              <div class="pref-icon">??</div>
              <div class="pref-text"><div class="pref-title">Données analytiques</div><div class="pref-sub">Aider à améliorer VERA</div></div>
              <label class="switch"><input type="checkbox"><span class="slider"></span></label>
            </div>
            <div class="sec-row">
              <div class="pref-icon">??</div>
              <div class="pref-text"><div class="pref-title">Téléchargement de données</div><div class="pref-sub">Télécharger vos données personnelles</div></div>
              <button class="link-btn" id="downloadDataBtn">Télécharger</button>
            </div>
          </div>

          <div class="card danger-card">
            <div class="card-title danger">Suppression du compte</div>
            <p class="danger-text">Cette action est irréversible et supprimera définitivement toutes vos données.</p>
            <button class="btn-danger" id="deleteAccountBtn">??? Supprimer mon compte</button>
          </div>

        </aside>

      </div>
    </div>
@endsection
@section('scripts')
<script src="script_PA.js"></script>
@endsection
