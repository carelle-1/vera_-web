@extends('layouts.app')
@section('title', 'VERA - Mes messages')
@section('styles')
<link rel="stylesheet" href="style_M.css">
@endsection

@section('content')
    <!-- PAGE HEAD -->
    <div class="page-head">
      <div>
        <h1>Messages <span class="cap">💬</span></h1>
        <p>&Eacute;changez avec l'assistant VERA et notre &eacute;quipe. Nous sommes là pour vous accompagner.</p>
      </div>
      <button class="btn-primary" id="newMsgBtn">✉ Nouveau message</button>
    </div>

    <!-- TABS -->
    <div class="tabs" id="msgTabs">
      <button class="tab active" data-filter="all">Toutes <span id="tabCountAll">0</span></button>
      <button class="tab" data-filter="vera">VERA (IA)</button>
      <button class="tab" data-filter="admin">Admins</button>
      <button class="tab" data-filter="unread">Non lues <span id="tabCountUnread">0</span></button>
      <button class="tab" data-filter="archived">Archiv&eacute;es</button>
    </div>

    <!-- MESSAGING LAYOUT -->
    <div class="messaging-layout">

      <!-- USERS LIST -->
      <section class="conv-panel">
        <div class="conv-search">
          <div class="search small">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
            <input type="text" id="userSearchInput" placeholder="Rechercher un utilisateur...">
          </div>
        </div>
        <div class="conv-list" id="usersList"></div>
      </section>

      <!-- CHAT WINDOW -->
      <section class="chat-panel">
        <div class="chat-header">
          <div class="chat-header-left">
            <div class="chat-avatar" id="chatAvatar">🤖</div>
            <div>
              <div class="chat-name">VERA (Assistant IA) <span class="ia-badge">IA</span></div>
              <div class="chat-status"><span class="dot-online"></span>En ligne</div>
            </div>
          </div>
          <div class="chat-header-actions">
            <button class="icon-btn-round">ⓘ</button>
            <button class="icon-btn-round">⋯</button>
          </div>
        </div>

        <div class="chat-messages" id="chatMessages"></div>

        <div class="chat-input">
          <button class="input-icon" id="attachImageBtn" title="Ajouter une image">🖼️</button>
          <button class="input-icon" id="attachFileBtn" title="Ajouter un fichier">📎</button>
          <button class="input-icon">😊</button>
          <input type="file" id="imageInput" accept="image/*" style="display:none;">
          <input type="file" id="fileInput" style="display:none;">
          <input type="text" id="chatInput" placeholder="Écrivez votre message...">
          <button class="send-btn" id="sendBtn">➤</button>
        </div>
        <div id="previewArea" style="display:none; padding: 10px 18px; background: #fff; border-top: 1px solid var(--border);">
          <div id="previewContent" style="display: flex; gap: 10px; align-items: center;"></div>
          <div style="display: flex; gap: 8px; margin-top: 8px;">
            <button class="btn-outline-sm" id="cancelAttachment">Annuler</button>
            <button class="btn-primary-sm" id="sendAttachment">Envoyer</button>
          </div>
        </div>
      </section>

      <!-- CONTACT INFO -->
      <aside class="contact-panel">
        <div class="card contact-card">
          <div class="contact-avatar">🤖</div>
          <div class="contact-name">VERA (Assistant IA) <span class="ia-badge">IA</span></div>
          <div class="contact-status"><span class="dot-online"></span>En ligne</div>
          <p>Votre assistant carrière intelligent. VERA vous aide à trouver des opportunités, postuler automatiquement et booster votre carrière.</p>
          <button class="btn-outline full">Voir le profil de VERA</button>
        </div>

        <div class="card">
          <div class="card-head-row"><span>Actions rapides</span></div>
          <div class="quick-action">
            <div class="quick-icon blue">🔍</div>
            <div><div class="quick-title">Découvrir des opportunités</div><div class="quick-sub">VERA recherche pour vous</div></div>
          </div>
          <div class="quick-action">
            <div class="quick-icon purple">📈</div>
            <div><div class="quick-title">Améliorer mon profil</div><div class="quick-sub">Conseils personnalisés</div></div>
          </div>
          <div class="quick-action">
            <div class="quick-icon green">📤</div>
            <div><div class="quick-title">Postuler automatiquement</div><div class="quick-sub">VERA postule pour vous</div></div>
          </div>
          <div class="quick-action">
            <div class="quick-icon orange">🎯</div>
            <div><div class="quick-title">Mes recommandations</div><div class="quick-sub">Formations &amp; conseils</div></div>
          </div>
        </div>

        <div class="card">
          <div class="card-head-row"><span>Informations</span></div>
          <div class="info-row"><span>Type</span><strong>Assistant IA</strong></div>
          <div class="info-row"><span>Réponses moyennes</span><strong>Instantanées</strong></div>
          <div class="info-row"><span>Disponibilité</span><strong>24/7</strong></div>
          <div class="info-row"><span>Langue</span><strong>Français</strong></div>
        </div>

        <div class="card">
          <div class="card-head-row"><span>Fichiers et ressources partagés</span></div>
          <div class="file-item">
            <div class="file-icon">📄</div>
            <div class="file-info">
              <div class="file-name">Guide_Optimisation_Profil.pdf</div>
              <div class="file-meta">PDF · 1.2 MB · 02 mai 2024</div>
            </div>
            <button class="file-download">⬇</button>
          </div>
          <div class="file-item">
            <div class="file-icon">📄</div>
            <div class="file-info">
              <div class="file-name">Top_Competences_2024.pdf</div>
              <div class="file-meta">PDF · 892 KB · 28 avr 2024</div>
            </div>
            <button class="file-download">⬇</button>
          </div>
          <a href="#" class="see-all">Voir tous les fichiers →</a>
        </div>
      </aside>

    </div>
@endsection
@section('scripts')
<script src="script_M.js"></script>
@endsection
