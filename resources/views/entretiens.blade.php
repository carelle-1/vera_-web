@extends('layouts.app')
@section('title', 'VERA - Entretiens')
@section('styles')
<link rel="stylesheet" href="style_M.css">
<style>
  .messaging-layout {
    grid-template-columns: 1fr 300px !important;
  }
  .conv-panel {
    display: none !important;
  }
  .chat-avatar img, .contact-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
    display: block;
  }
  .chat-avatar, .contact-avatar {
    background: none !important;
    overflow: hidden;
    padding: 0 !important;
  }
</style>
@endsection

@section('content')
    <!-- PAGE HEAD -->
    <div class="page-head">
      <div>
        <h1 style="color: #12b3c9;">Entretiens <span class="cap"></span></h1>
        <p>Préparez vos entretiens et échangez avec l&rsquo;assistant VERA.</p>
      </div>
    </div>

    <!-- MESSAGING LAYOUT -->
    <div class="messaging-layout">

      <!-- CHAT WINDOW -->
      <section class="chat-panel">
        <div class="chat-header">
          <div class="chat-header-left">
            <div class="chat-avatar" id="chatAvatar"><img src="/image/1_nobg.png" alt="VERA"></div>
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
          <button class="input-icon" id="voiceInputBtn" title="Parler pour envoyer un message">🎙️</button>
          <button class="input-icon" id="voiceOutputBtn" title="Lire la réponse à voix haute">🔊</button>
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
          <div class="contact-avatar"><img src="/image/1_nobg.png" alt="VERA"></div>
          <div class="contact-name">VERA (Assistant IA) <span class="ia-badge">IA</span></div>
          <div class="contact-status"><span class="dot-online"></span>En ligne</div>
          <p>Votre assistant carrière intelligent. VERA vous aide à préparer vos entretiens et booster votre candidature.</p>
          <button class="btn-outline full">Voir le profil de VERA</button>
        </div>

        <div class="card">
          <div class="card-head-row"><span>Actions rapides</span></div>
          <div class="quick-action">
            <div class="quick-icon blue">🎙️</div>
            <div><div class="quick-title">Simuler un entretien</div><div class="quick-sub">Questions types &amp; conseils</div></div>
          </div>
          <div class="quick-action">
            <div class="quick-icon purple">📝</div>
            <div><div class="quick-title">Préparer mes réponses</div><div class="quick-sub">Feedback personnalisé</div></div>
          </div>
          <div class="quick-action">
            <div class="quick-icon green">🧠</div>
            <div><div class="quick-title">Coaching express</div><div class="quick-sub">Tips pour le jour J</div></div>
          </div>
        </div>

        <div class="card">
          <div class="card-head-row"><span>Informations</span></div>
          <div class="info-row"><span>Type</span><strong>Assistant IA</strong></div>
          <div class="info-row"><span>Réponses moyennes</span><strong>Instantanées</strong></div>
          <div class="info-row"><span>Disponibilité</span><strong>24/7</strong></div>
          <div class="info-row"><span>Langue</span><strong>Français</strong></div>
        </div>
      </aside>

    </div>
@endsection

@section('scripts')
<script src="script_ENT_ENTRETIENS.js?v=2"></script>
@endsection
