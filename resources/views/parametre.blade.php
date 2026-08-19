@extends('layouts.app')
@section('title', 'VERA - Param&eacute;tres')
@section('styles')
<link rel="stylesheet" href="style_PA.css?v=2">
@endsection

@section('content')
<div class="scroll-area">

      <!-- PAGE HEAD -->
      <div class="page-head">
        <h1 style="color: #12b3c9;">Param&eacute;tres <img src="/image/3917317.png" alt="" style="width:20px;height:20px;object-fit:contain;vertical-align:middle;"></h1>
        <p>G&eacute;rez votre compte, vos pr&eacute;f&eacute;rences et optimisez votre exp&eacute;rience sur VERA.</p>
      </div>

      <!-- LAYOUT -->
      <div class="layout">

        <!-- SETTINGS NAV -->
        <aside class="settings-nav">
          <div class="settings-nav-item active" data-panel="profil">
            <span class="settings-icon"><img src="/image/users.png" alt="" style="width:20px;height:20px;object-fit:contain;"></span>
            <div><div class="settings-title">Profil et compte</div><div class="settings-sub">Informations personnelles</div></div>
          </div>
          <div class="settings-nav-item" data-panel="prefs">
            <span class="settings-icon"><img src="/image/3917317.png" alt="" style="width:20px;height:20px;object-fit:contain;"></span>
            <div><div class="settings-title">Pr&eacute;f&eacute;rences</div><div class="settings-sub">Notifications, langue, devise</div></div>
          </div>
          <div class="settings-nav-item" data-panel="confidentialite">
            <span class="settings-icon"><img src="/image/3917293.png" alt="" style="width:20px;height:20px;object-fit:contain;"></span>
            <div><div class="settings-title">Confidentialit&eacute;</div><div class="settings-sub">Donn&eacute;es et s&eacute;curit&eacute;</div></div>
          </div>
          <div class="settings-nav-item" data-panel="candidatures">
            <span class="settings-icon"><img src="/image/3917505.png" alt="" style="width:20px;height:20px;object-fit:contain;"></span>
            <div><div class="settings-title">Candidatures</div><div class="settings-sub">CV, lettres de motivation</div></div>
          </div>
          <div class="settings-nav-item" data-panel="alertes">
            <span class="settings-icon"><img src="/image/3917508.png" alt="" style="width:20px;height:20px;object-fit:contain;"></span>
            <div><div class="settings-title">Alertes emploi</div><div class="settings-sub">Vos recherches et alertes</div></div>
          </div>
          <div class="settings-nav-item" data-panel="paiements">
            <span class="settings-icon"><img src="/image/3917293.png" alt="" style="width:20px;height:20px;object-fit:contain;"></span>
            <div><div class="settings-title">Paiements</div><div class="settings-sub">Facturation et abonnements</div></div>
          </div>
          <div class="settings-nav-item" data-panel="integrations">
            <span class="settings-icon"><img src="/image/3916670.png" alt="" style="width:20px;height:20px;object-fit:contain;"></span>
            <div><div class="settings-title">Int&eacute;grations</div><div class="settings-sub">Connecter vos outils</div></div>
          </div>
          <div class="settings-nav-item" data-panel="accessibilite">
            <span class="settings-icon"><img src="/image/3916670.png" alt="" style="width:20px;height:20px;object-fit:contain;"></span>
            <div><div class="settings-title">Accessibilit&eacute;</div><div class="settings-sub">Accessibilit&eacute; et affichage</div></div>
          </div>

          <div class="help-box">
            <div class="help-box-title"><img src="/image/3917317.png" alt="" style="width:14px;height:14px;object-fit:contain;vertical-align:middle;margin-right:4px;">Besoin d'aide ?</div>
            <p>Consultez notre centre d'aide ou contactez notre &eacute;quipe support.</p>
            <button class="btn-outline full"><img src="/image/contact.png" alt="" style="width:14px;height:14px;object-fit:contain;vertical-align:middle;margin-right:4px;">Centre d'aide</button>
          </div>
        </aside>

        <!-- MAIN CONTENT -->
        <section class="content-col">

          <!-- PANEL: PROFIL -->
          <div class="settings-panel active" id="panelProfil">
            <div class="card">
              <div class="card-head-row">
                <div>
                  <div class="card-title">Informations personnelles</div>
                  <div class="card-sub">Mettez &agrave; jour vos informations de profil et vos coordonn&eacute;es.</div>
                </div>
                <button class="btn-outline" id="editProfileBtn">Modifier le profil</button>
              </div>

              <div class="profile-info-row">
                <img class="profile-avatar" id="settingsProfileAvatar" src="" alt="avatar">
                <div class="profile-fields">
                  <div class="field">
                    <div class="field-label">Nom complet</div>
                    <div class="field-value" data-field="fullName" data-input-type="text">Bonjour, Junior</div>
                  </div>
                  <div class="field">
                    <div class="field-label">T&eacute;l&eacute;phone</div>
                    <div class="field-value" data-field="phone" data-input-type="tel">+225 07 12 34 56 78 <span class="verified-tag"><img src="/image/3917505.png" alt="" style="width:14px;height:14px;object-fit:contain;vertical-align:middle;margin-right:4px;">V&eacute;rifi&eacute;</span></div>
                  </div>
                  <div class="field">
                    <div class="field-label">Email</div>
                    <div class="field-value" data-field="email" data-input-type="email">junior.bonjour@email.com <span class="verified-tag"><img src="/image/3917505.png" alt="" style="width:14px;height:14px;object-fit:contain;vertical-align:middle;margin-right:4px;">V&eacute;rifi&eacute;</span></div>
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
                <div class="pref-icon"><img src="/image/3916880.png" alt="" style="width:20px;height:20px;object-fit:contain;"></div>
                <div class="pref-text"><div class="pref-title">Langue</div><div class="pref-sub">Choisissez votre langue pr&eacute;f&eacute;r&eacute;e</div></div>
                <select class="pref-select" id="settingsLanguage">
                  <option>Fran&ccedil;ais</option>
                  <option>English</option>
                  <option>Espa&ntilde;ol</option>
                </select>
              </div>
              <div class="pref-row">
                <div class="pref-icon"><img src="/image/7928164.png" alt="" style="width:20px;height:20px;object-fit:contain;"></div>
                <div class="pref-text"><div class="pref-title">Devise</div><div class="pref-sub">Pour vos salaires et paiements</div></div>
                <select class="pref-select" id="settingsCurrency">
                  <option>XOF (Franc CFA)</option>
                  <option>EUR (Euro)</option>
                  <option>USD (Dollar)</option>
                </select>
              </div>
              <div class="pref-row">
                <div class="pref-icon"><img src="/image/3917292.png" alt="" style="width:20px;height:20px;object-fit:contain;"></div>
                <div class="pref-text"><div class="pref-title">Fuseau horaire</div><div class="pref-sub">Pour l'affichage des horaires</div></div>
                <select class="pref-select" id="settingsTimezone">
                  <option>(GMT+0) Abidjan</option>
                  <option>(GMT+1) Paris</option>
                  <option>(GMT-5) New York</option>
                </select>
              </div>
              <div class="pref-row">
                <div class="pref-icon"><img src="/image/7602640.png" alt="" style="width:20px;height:20px;object-fit:contain;"></div>
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
                <div class="pref-icon"><img src="/image/mission.png" alt="" style="width:20px;height:20px;object-fit:contain;"></div>
                <div class="pref-text"><div class="pref-title">Nouvelles opportunit&eacute;s</div><div class="pref-sub">Recevoir des alertes pour les nouvelles offres</div></div>
                <label class="switch"><input type="checkbox" checked data-notif="newOpportunities"><span class="slider"></span></label>
              </div>
              <div class="toggle-row">
                <div class="pref-icon"><img src="/image/mail.png" alt="" style="width:20px;height:20px;object-fit:contain;"></div>
                <div class="pref-text"><div class="pref-title">Messages</div><div class="pref-sub">&Ecirc;tre notifi&eacute; des nouveaux messages</div></div>
                <label class="switch"><input type="checkbox" checked data-notif="messages"><span class="slider"></span></label>
              </div>
              <div class="toggle-row">
                <div class="pref-icon"><img src="/image/3917505.png" alt="" style="width:20px;height:20px;object-fit:contain;"></div>
                <div class="pref-text"><div class="pref-title">Statut des candidatures</div><div class="pref-sub">Suivre l'&eacute;volution de vos candidatures</div></div>
                <label class="switch"><input type="checkbox" checked data-notif="applicationStatus"><span class="slider"></span></label>
              </div>
              <div class="toggle-row">
                <div class="pref-icon"><img src="/image/formation.png" alt="" style="width:20px;height:20px;object-fit:contain;"></div>
                <div class="pref-text"><div class="pref-title">Formations et conseils</div><div class="pref-sub">Nouveaux contenus et recommandations</div></div>
                <label class="switch"><input type="checkbox" checked data-notif="trainings"><span class="slider"></span></label>
              </div>
              <a href="#" class="see-all">G&eacute;rer toutes les notifications <img src="/image/3917508.png" alt="" style="width:14px;height:14px;object-fit:contain;vertical-align:middle;margin-left:4px;"></a>
            </div>
          </div>

          <!-- PANEL: PR&Eacute;F&Eacute;RENCES -->
          <div class="settings-panel" id="panelPrefs" style="display:none;">
            <div class="card">
              <div class="card-title">Pr&eacute;f&eacute;rences g&eacute;n&eacute;rales</div>
              <div class="card-sub">Langue, devise, fuseau horaire et format d'affichage.</div>

              <div class="pref-row">
                <div class="pref-icon"><img src="/image/3916880.png" alt="" style="width:20px;height:20px;object-fit:contain;"></div>
                <div class="pref-text"><div class="pref-title">Langue</div><div class="pref-sub">Choisissez votre langue pr&eacute;f&eacute;r&eacute;e</div></div>
                <select class="pref-select" id="prefsLanguage">
                  <option>Fran&ccedil;ais</option>
                  <option>English</option>
                  <option>Espa&ntilde;ol</option>
                </select>
              </div>
              <div class="pref-row">
                <div class="pref-icon"><img src="/image/7928164.png" alt="" style="width:20px;height:20px;object-fit:contain;"></div>
                <div class="pref-text"><div class="pref-title">Devise</div><div class="pref-sub">Pour vos salaires et paiements</div></div>
                <select class="pref-select" id="prefsCurrency">
                  <option>XOF (Franc CFA)</option>
                  <option>EUR (Euro)</option>
                  <option>USD (Dollar)</option>
                </select>
              </div>
              <div class="pref-row">
                <div class="pref-icon"><img src="/image/3917292.png" alt="" style="width:20px;height:20px;object-fit:contain;"></div>
                <div class="pref-text"><div class="pref-title">Fuseau horaire</div><div class="pref-sub">Pour l'affichage des horaires</div></div>
                <select class="pref-select" id="prefsTimezone">
                  <option>(GMT+0) Abidjan</option>
                  <option>(GMT+1) Paris</option>
                  <option>(GMT-5) New York</option>
                </select>
              </div>
              <div class="pref-row">
                <div class="pref-icon"><img src="/image/7602640.png" alt="" style="width:20px;height:20px;object-fit:contain;"></div>
                <div class="pref-text"><div class="pref-title">Format de salaire</div><div class="pref-sub">Comment les salaires sont affich&eacute;s</div></div>
                <select class="pref-select" id="prefsSalaryFormat">
                  <option>Mensuel</option>
                  <option>Annuel</option>
                  <option>Horaire</option>
                </select>
              </div>
            </div>
          </div>

          <!-- PANEL: CONFIDENTIALIT&Eacute; -->
          <div class="settings-panel" id="panelConfidentialite" style="display:none;">
            <div class="card">
              <div class="card-title">Confidentialit&eacute;</div>
              <div class="card-sub">G&eacute;rez la visibilit&eacute; de votre profil et vos donn&eacute;es.</div>

              <div class="toggle-row">
                <div class="pref-icon"><img src="/image/oeil.png" alt="" style="width:20px;height:20px;object-fit:contain;"></div>
                <div class="pref-text"><div class="pref-title">Profil public</div><div class="pref-sub">Rendre mon profil visible aux recruteurs</div></div>
                <label class="switch"><input type="checkbox" checked data-privacy="publicProfile"><span class="slider"></span></label>
              </div>
              <div class="toggle-row">
                <div class="pref-icon"><img src="/image/3917754.png" alt="" style="width:20px;height:20px;object-fit:contain;"></div>
                <div class="pref-text"><div class="pref-title">Visible par les recruteurs</div><div class="pref-sub">Autoriser les recruteurs &agrave; me trouver</div></div>
                <label class="switch"><input type="checkbox" checked data-privacy="visibleByRecruiters"><span class="slider"></span></label>
              </div>
              <div class="toggle-row">
                <div class="pref-icon"><img src="/image/7653263.png" alt="" style="width:20px;height:20px;object-fit:contain;"></div>
                <div class="pref-text"><div class="pref-title">Donn&eacute;es analytiques</div><div class="pref-sub">Aider &agrave; am&eacute;liorer VERA</div></div>
                <label class="switch"><input type="checkbox" data-privacy="analytics"><span class="slider"></span></label>
              </div>
              <div class="pref-row" style="border-top:1px solid var(--border);padding-top:16px;margin-top:8px;">
                <div class="pref-icon"><img src="/image/download.png" alt="" style="width:20px;height:20px;object-fit:contain;"></div>
                <div class="pref-text"><div class="pref-title">T&eacute;l&eacute;chargement de donn&eacute;es</div><div class="pref-sub">T&eacute;l&eacute;charger vos donn&eacute;es personnelles</div></div>
                <button class="link-btn" id="downloadDataBtn">T&eacute;l&eacute;charger</button>
              </div>
            </div>
          </div>

            <!-- PANEL: CANDIDATURES -->
          <div class="settings-panel" id="panelCandidatures" style="display:none;">
            <div class="card">
              <div class="card-title">CV et lettres de motivation</div>
              <div class="card-sub">G&eacute;rez vos documents de candidature.</div>

              <div class="pref-row" id="cvRow">
                <div class="pref-icon"><img src="/image/3917505.png" alt="" style="width:20px;height:20px;object-fit:contain;"></div>
                <div class="pref-text">
                  <div class="pref-title">CV principal</div>
                  <div class="pref-sub" id="cvSub">Aucun CV t&eacute;l&eacute;charg&eacute;</div>
                  <div class="pref-edit" id="cvEdit" style="display:none;margin-top:8px;">
                    <input type="file" id="cvFileInput" accept=".pdf,.doc,.docx" style="font-size:12px;">
                  </div>
                  <div id="cvView" style="display:none;margin-top:8px;">
                    <a id="cvLink" href="#" target="_blank" class="btn-outline view-link-btn">Voir</a>
                  </div>
                </div>
                <div class="pref-actions" id="cvActions">
                  <button class="link-btn" id="cvAddBtn" style="display:none;">Ajouter</button>
                  <button class="link-btn" id="cvReplaceBtn">Remplacer</button>
                  <button class="link-btn" id="cvDeleteBtn" style="color:var(--red);display:none;">Supprimer</button>
                </div>
              </div>

              <div class="pref-row" id="coverLetterRow">
                <div class="pref-icon"><img src="/image/edit.png" alt="" style="width:20px;height:20px;object-fit:contain;"></div>
                <div class="pref-text">
                  <div class="pref-title">Lettre de motivation</div>
                  <div class="pref-sub" id="coverLetterSub">Aucune lettre enregistr&eacute;e</div>
                  <div class="pref-edit" id="coverLetterEdit" style="display:none;margin-top:8px;">
                    <input type="file" id="coverLetterFileInput" accept=".pdf,.doc,.docx" style="font-size:12px;">
                  </div>
                  <div id="coverLetterView" style="display:none;margin-top:8px;">
                    <a id="coverLetterLink" href="#" target="_blank" class="btn-outline view-link-btn">Voir</a>
                  </div>
                </div>
                <div class="pref-actions" id="coverLetterActions">
                  <button class="link-btn" id="coverLetterAddBtn">Ajouter</button>
                  <button class="link-btn" id="coverLetterSaveBtn" style="display:none;">Enregistrer</button>
                  <button class="link-btn" id="coverLetterDeleteBtn" style="color:var(--red);display:none;">Supprimer</button>
                  <button class="link-btn" id="coverLetterCancelBtn" style="display:none;">Annuler</button>
                </div>
              </div>

              <div class="pref-row" id="portfolioRow">
                <div class="pref-icon"><img src="/image/3917361.png" alt="" style="width:20px;height:20px;object-fit:contain;"></div>
                <div class="pref-text">
                  <div class="pref-title">Portfolio</div>
                  <div class="pref-sub" id="portfolioSub">Lien vers votre portfolio</div>
                  <div class="pref-edit" id="portfolioEdit" style="display:none;margin-top:8px;">
                    <input type="url" id="portfolioInput" placeholder="https://..." style="width:100%;max-width:400px;padding:8px;border:1px solid var(--border);border-radius:8px;font-size:12px;">
                  </div>
                </div>
                <div class="pref-actions" id="portfolioActions">
                  <button class="link-btn" id="portfolioAddBtn">Ajouter</button>
                  <button class="link-btn" id="portfolioSaveBtn" style="display:none;">Enregistrer</button>
                  <button class="link-btn" id="portfolioDeleteBtn" style="color:var(--red);display:none;">Supprimer</button>
                  <button class="link-btn" id="portfolioCancelBtn" style="display:none;">Annuler</button>
                </div>
              </div>
            </div>

            <div class="card">
              <div class="card-title">Pr&eacute;f&eacute;rences de candidature</div>
              <div class="card-sub">D&eacute;finissez vos pr&eacute;f&eacute;rences par d&eacute;faut.</div>

              <div class="pref-row">
                <div class="pref-icon"><img src="/image/mission.png" alt="" style="width:20px;height:20px;object-fit:contain;"></div>
                <div class="pref-text"><div class="pref-title">Candidature automatique</div><div class="pref-sub">Postuler automatiquement aux offres correspondantes</div></div>
                <label class="switch"><input type="checkbox" data-app="autoApply"><span class="slider"></span></label>
              </div>
              <div class="pref-row">
                <div class="pref-icon"><img src="/image/discussion.png" alt="" style="width:20px;height:20px;object-fit:contain;"></div>
                <div class="pref-text"><div class="pref-title">Relances automatiques</div><div class="pref-sub">Envoyer une relance apr&egrave;s 7 jours sans r&eacute;ponse</div></div>
                <label class="switch"><input type="checkbox" data-app="autoFollowUp"><span class="slider"></span></label>
              </div>
            </div>
          </div>

          <!-- PANEL: ALERTES -->
          <div class="settings-panel" id="panelAlertes" style="display:none;">
            <div class="card">
              <div class="card-title">Alertes emploi</div>
              <div class="card-sub">Configurez vos recherches et alertes personnalis&eacute;es.</div>

              <div class="pref-row">
                <div class="pref-icon"><img src="/image/3917754.png" alt="" style="width:20px;height:20px;object-fit:contain;"></div>
                <div class="pref-text"><div class="pref-title">Mots-cl&eacute;s</div><div class="pref-sub">UI/UX Designer, Product Designer</div></div>
                <button class="link-btn">Modifier</button>
              </div>
              <div class="pref-row">
                <div class="pref-icon">&#x1F4CD;</div>
                <div class="pref-text"><div class="pref-title">Localisation</div><div class="pref-sub">Abidjan, Remote, Paris</div></div>
                <button class="link-btn">Modifier</button>
              </div>
              <div class="pref-row">
                <div class="pref-icon"><img src="/image/7928164.png" alt="" style="width:20px;height:20px;object-fit:contain;"></div>
                <div class="pref-text"><div class="pref-title">Salaire minimum</div><div class="pref-sub">2 000 $ / mois</div></div>
                <button class="link-btn">Modifier</button>
              </div>
              <div class="pref-row">
                <div class="pref-icon"><img src="/image/3917292.png" alt="" style="width:20px;height:20px;object-fit:contain;"></div>
                <div class="pref-text"><div class="pref-title">Fr&eacute;quence</div><div class="pref-sub">Alertes quotidiennes</div></div>
                <select class="pref-select" id="alertFrequency">
                  <option>Quotidienne</option>
                  <option>Hebdomadaire</option>
                  <option>Instantann&eacute;e</option>
                </select>
              </div>
            </div>
          </div>

          <!-- PANEL: PAIEMENTS -->
          <div class="settings-panel" id="panelPaiements" style="display:none;">
            <div class="card">
              <div class="card-title">Abonnements</div>
              <div class="card-sub">G&eacute;rez votre abonnement VERA.</div>

              <div class="pref-row">
                <div class="pref-icon"><img src="/image/3917293.png" alt="" style="width:20px;height:20px;object-fit:contain;"></div>
                <div class="pref-text"><div class="pref-title">Plan actuel</div><div class="pref-sub">Gratuit</div></div>
                <button class="link-btn">Upgrade</button>
              </div>
              <div class="pref-row">
                <div class="pref-icon"><img src="/image/7928164.png" alt="" style="width:20px;height:20px;object-fit:contain;"></div>
                <div class="pref-text"><div class="pref-title">Facturation</div><div class="pref-sub">Aucune carte enregistr&eacute;e</div></div>
                <button class="link-btn">Ajouter</button>
              </div>
              <div class="pref-row">
                <div class="pref-icon"><img src="/image/3917505.png" alt="" style="width:20px;height:20px;object-fit:contain;"></div>
                <div class="pref-text"><div class="pref-title">Historique</div><div class="pref-sub">Aucune transaction</div></div>
                <button class="link-btn">Voir</button>
              </div>
            </div>
          </div>

          <!-- PANEL: INT&Eacute;GRATIONS -->
          <div class="settings-panel" id="panelIntegrations" style="display:none;">
            <div class="card">
              <div class="card-title">Int&eacute;grations</div>
              <div class="card-sub">Connectez VERA avec vos outils pr&eacute;f&eacute;r&eacute;s.</div>

              <div class="pref-row">
                <div class="pref-icon"><img src="/image/3916670.png" alt="" style="width:20px;height:20px;object-fit:contain;"></div>
                <div class="pref-text"><div class="pref-title">LinkedIn</div><div class="pref-sub">Non connect&eacute;</div></div>
                <button class="link-btn">Connecter</button>
              </div>
              <div class="pref-row">
                <div class="pref-icon"><img src="/image/1_nobg.png" alt="" style="width:20px;height:20px;object-fit:contain;"></div>
                <div class="pref-text"><div class="pref-title">GitHub</div><div class="pref-sub">Non connect&eacute;</div></div>
                <button class="link-btn">Connecter</button>
              </div>
              <div class="pref-row">
                <div class="pref-icon"><img src="/image/mail.png" alt="" style="width:20px;height:20px;object-fit:contain;"></div>
                <div class="pref-text"><div class="pref-title">Gmail</div><div class="pref-sub">Non connect&eacute;</div></div>
                <button class="link-btn">Connecter</button>
              </div>
              <div class="pref-row">
                <div class="pref-icon"><img src="/image/3917293.png" alt="" style="width:20px;height:20px;object-fit:contain;"></div>
                <div class="pref-text"><div class="pref-title">Google Calendar</div><div class="pref-sub">Non connect&eacute;</div></div>
                <button class="link-btn">Connecter</button>
              </div>
            </div>
          </div>

          <!-- PANEL: ACCESSIBILIT&Eacute; -->
          <div class="settings-panel" id="panelAccessibilite" style="display:none;">
            <div class="card">
              <div class="card-title">Accessibilit&eacute; et affichage</div>
              <div class="card-sub">Adaptez l'interface &agrave; vos besoins.</div>

              <div class="pref-row">
                <div class="pref-icon"><img src="/image/3917754.png" alt="" style="width:20px;height:20px;object-fit:contain;"></div>
                <div class="pref-text"><div class="pref-title">Taille du texte</div><div class="pref-sub">Taille normale</div></div>
                <select class="pref-select" id="textSize">
                  <option>Petite</option>
                  <option selected>Normale</option>
                  <option>Grande</option>
                  <option>Tr&egrave;s grande</option>
                </select>
              </div>
              <div class="pref-row">
                <div class="pref-icon"><img src="/image/3917361.png" alt="" style="width:20px;height:20px;object-fit:contain;"></div>
                <div class="pref-text"><div class="pref-title">Contraste &eacute;lev&eacute;</div><div class="pref-sub">Am&eacute;liorer le contraste des couleurs</div></div>
                <label class="switch"><input type="checkbox" data-a11y="highContrast"><span class="slider"></span></label>
              </div>
              <div class="pref-row">
                <div class="pref-icon"><img src="/image/contact.png" alt="" style="width:20px;height:20px;object-fit:contain;"></div>
                <div class="pref-text"><div class="pref-title">Lecteur d'&eacute;cran</div><div class="pref-sub">Optimiser pour les lecteurs d'&eacute;cran</div></div>
                <label class="switch"><input type="checkbox" data-a11y="screenReader"><span class="slider"></span></label>
              </div>
              <div class="pref-row">
                <div class="pref-icon"><img src="/image/3917385.png" alt="" style="width:20px;height:20px;object-fit:contain;">&#x200D;&#x2642;&#xFE0F;</div>
                <div class="pref-text"><div class="pref-title">R&eacute;duire les animations</div><div class="pref-sub">Minimiser les effets visuels anim&eacute;s</div></div>
                <label class="switch"><input type="checkbox" data-a11y="reduceMotion"><span class="slider"></span></label>
              </div>
            </div>
          </div>

        </section>

        <!-- RIGHT COLUMN -->
        <aside class="side-col">

           <div class="card">
             <div class="card-title-row"><span class="shield-icon purple"><img src="/image/3916880.png" alt="" style="width:20px;height:20px;object-fit:contain;"></span><div><div class="card-title">Confidentialit&eacute;</div><div class="card-sub">G&eacute;rez vos donn&eacute;es et votre visibilit&eacute;.</div></div></div>

             <div class="sec-row">
               <div class="pref-icon"><img src="/image/oeil.png" alt="" style="width:20px;height:20px;object-fit:contain;"></div>
               <div class="pref-text"><div class="pref-title">Profil public</div><div class="pref-sub">Rendre mon profil visible aux recruteurs</div></div>
               <label class="switch"><input type="checkbox" checked data-privacy="publicProfile"><span class="slider"></span></label>
             </div>
             <div class="sec-row">
               <div class="pref-icon"><img src="/image/3917754.png" alt="" style="width:20px;height:20px;object-fit:contain;"></div>
               <div class="pref-text"><div class="pref-title">Visible par les recruteurs</div><div class="pref-sub">Autoriser les recruteurs &agrave; me trouver</div></div>
               <label class="switch"><input type="checkbox" checked data-privacy="visibleByRecruiters"><span class="slider"></span></label>
             </div>
             <div class="sec-row">
               <div class="pref-icon"><img src="/image/7653263.png" alt="" style="width:20px;height:20px;object-fit:contain;"></div>
               <div class="pref-text"><div class="pref-title">Donn&eacute;es analytiques</div><div class="pref-sub">Aider &agrave; am&eacute;liorer VERA</div></div>
               <label class="switch"><input type="checkbox" data-privacy="analytics"><span class="slider"></span></label>
             </div>
             <div class="sec-row">
               <div class="pref-icon"><img src="/image/download.png" alt="" style="width:20px;height:20px;object-fit:contain;"></div>
               <div class="pref-text"><div class="pref-title">T&eacute;l&eacute;chargement de donn&eacute;es</div><div class="pref-sub">T&eacute;l&eacute;charger vos donn&eacute;es personnelles</div></div>
               <button class="link-btn" id="downloadDataBtn">T&eacute;l&eacute;charger</button>
             </div>
           </div>

           <div class="card">
             <div class="card-title-row"><span class="shield-icon green"><img src="/image/3917385.png" alt="" style="width:20px;height:20px;object-fit:contain;"></span><div><div class="card-title">S&eacute;curit&eacute; du compte</div><div class="card-sub">Prot&eacute;gez votre compte et vos donn&eacute;es.</div></div></div>

             <div class="sec-row">
               <div class="pref-icon"><img src="/image/3917505.png" alt="" style="width:20px;height:20px;object-fit:contain;"></div>
               <div class="pref-text">
                 <div class="pref-title">Mot de passe actuel</div>
                 <div class="pref-sub" id="passwordDisplay">••••••••</div>
                 <input type="password" id="passwordInput" class="profile-edit-input" style="display:none;margin-top:6px;max-width:260px;" placeholder="Nouveau mot de passe" autocomplete="new-password">
               </div>
               <button type="button" class="link-btn" id="changePasswordBtn">Modifier</button>
             </div>
             <div class="sec-row">
               <div class="pref-icon"><img src="/image/3917293.png" alt="" style="width:20px;height:20px;object-fit:contain;"></div>
               <div class="pref-text"><div class="pref-title">Authentification &agrave; deux facteurs</div><div class="pref-sub">Recommand&eacute; pour plus de s&eacute;curit&eacute;</div></div>
               <label class="switch"><input type="checkbox" checked data-security="twoFactor"><span class="slider"></span></label>
             </div>
             <div class="sec-row">
               <div class="pref-icon"><img src="/image/3917293.png" alt="" style="width:20px;height:20px;object-fit:contain;"></div>
               <div class="pref-text"><div class="pref-title">Sessions actives</div><div class="pref-sub">3 sessions actives</div></div>
               <button class="link-btn" id="viewSessionsBtn">Voir</button>
             </div>
             <div class="sec-row">
               <div class="pref-icon"><img src="/image/3917505.png" alt="" style="width:20px;height:20px;object-fit:contain;"></div>
               <div class="pref-text"><div class="pref-title">D&eacute;connexion de tous les appareils</div><div class="pref-sub">S&eacute;curiser votre compte</div></div>
               <button class="link-btn" id="logoutAllBtn">D&eacute;connecter</button>
             </div>
           </div>

           <div class="card danger-card">
             <div class="card-title danger">Suppression du compte</div>
             <p class="danger-text">Cette action est irr&eacute;versible et supprimera d&eacute;finitivement toutes vos donn&eacute;es.</p>
             <button class="btn-danger" id="deleteAccountBtn"><img src="/image/delete.png" alt="" style="width:14px;height:14px;object-fit:contain;vertical-align:middle;margin-right:6px;">Supprimer mon compte</button>
           </div>

         </aside>

      </div>
    </div>
@endsection
@section('scripts')
<script src="script_PA.js"></script>
@endsection
