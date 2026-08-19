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
  .score-summary {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 8px 0 12px;
  }
  .score-circle {
    padding: 4px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: linear-gradient(135deg, #12b3c9, #7dd3fc);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 14px;
    box-shadow: 0 8px 20px rgba(18,179,201,.25);
  }
  .score-meta {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .score-meta strong {
    font-size: 14px;
    color: #16a55b;
  }
  .score-meta small {
    color: var(--muted, #64748b);
    line-height: 1.4;
  }
  .criteria-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 8px;
  }
  .criterion-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .criterion-row {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: var(--text);
  }
  .criterion-bar {
    height: 8px;
    background: #e2e8f0;
    border-radius: 99px;
    overflow: hidden;
  }
  .criterion-bar span {
    display: block;
    height: 100%;
    border-radius: 99px;
    background: linear-gradient(90deg, #4ade80, #60a5fa);
  }
  .score-tips {
    margin-top: 14px;
    font-size: 12px;
    color: var(--muted, #64748b);
  }
  .score-tips ul {
    margin: 8px 0 0 18px;
    padding: 0;
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
              <div class="chat-name">VERA (Assistant IA) <span class="ia-badge"></span></div>
              <div class="chat-status"><span class="dot-online"></span>En ligne</div>
            </div>
          </div>
          <!-- <div class="chat-header-actions">
            <button class="icon-btn-round">ⓘ</button>
            <button class="icon-btn-round">⋯</button>
          </div> -->
        </div>

        <div class="chat-messages" id="chatMessages"></div>

        <div class="chat-input">
          <!-- <button class="input-icon" id="attachImageBtn" title="Ajouter une image">🖼️</button> -->
          <!-- <button class="input-icon" id="attachFileBtn" title="Ajouter un fichier">📎</button> -->
          <button class="input-icon" id="voiceInputBtn" title="Parler pour envoyer un message"><img src="/image/3917645.png" alt="" style="width:20px;height:20px;object-fit:contain;filter: invert(57%) sepia(95%) saturate(1350%) hue-rotate(145deg)
            brightness(90%) contrast(100%);"></button>
          <button class="input-icon" id="voiceOutputBtn" title="Lire la réponse à voix haute"><img src="/image/3917508.png" alt="" style="width:20px;height:20px;object-fit:contain;filter: invert(57%) sepia(95%) saturate(1350%) hue-rotate(145deg)
            brightness(90%) contrast(100%);"></button>
          <input type="file" id="imageInput" accept="image/*" style="display:none;">
          <input type="file" id="fileInput" style="display:none;">
          <input type="text" id="chatInput" placeholder="Écrivez votre message...">
          <button class="send-btn" id="sendBtn"><img src="/image/envoyez.png" alt="" style="width:20px;height:20px;object-fit:contain;filter: brightness(0) invert(1);"></button>
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
          <div class="contact-name">VERA (Assistant IA) <span class="ia-badge"></span></div>
          <div class="contact-status"><span class="dot-online"></span>En ligne</div>
          <p>Votre assistant carrière intelligent. VERA vous aide à préparer vos entretiens et booster votre candidature.</p>
          <button class="btn-outline full">Voir le profil de VERA</button>
        </div>

        <div class="card">
          <div class="card-head-row"><span>Actions rapides</span></div>
          <div class="quick-action" data-action="simulate" tabindex="0" role="button" aria-label="Simuler un entretien">
            <div class="quick-icon blue"><img src="/image/3917645.png" alt="" style="width:20px;height:20px;object-fit:contain;filter: invert(57%) sepia(95%) saturate(1350%) hue-rotate(145deg) brightness(90%) contrast(100%);"></div>
            <div><div class="quick-title">Simuler un entretien</div><div class="quick-sub">Questions types &amp; conseils</div></div>
          </div>
          <div class="quick-action" data-action="prepare" tabindex="0" role="button" aria-label="Préparer mes réponses">
            <div class="quick-icon purple"><img src="/image/3917361.png" alt="" style="width:20px;height:20px;object-fit:contain; filter: invert(57%) sepia(95%) saturate(1350%) hue-rotate(145deg) brightness(90%) contrast(100%);"></div>
            <div><div class="quick-title">Préparer mes réponses</div><div class="quick-sub">Feedback personnalisé</div></div>
          </div>
          <div class="quick-action" data-action="coaching" tabindex="0" role="button" aria-label="Coaching express">
            <div class="quick-icon green"><img src="/image/3917385.png" alt="" style="width:20px;height:20px;object-fit:contain;filter: invert(57%) sepia(95%) saturate(1350%) hue-rotate(145deg) brightness(90%) contrast(100%);"></div>
            <div><div class="quick-title">Coaching express</div><div class="quick-sub">Tips pour le jour J</div></div>
          </div>
        </div>

        <div class="card score-card">
          <div class="card-head-row"><span>Évaluation de la réponse</span></div>

          <div class="score-summary">
            <div class="score-circle" id="scoreValue">0/100</div>
            <div class="score-meta">
              <strong id="scoreLabel">En attente</strong>
              <small id="scoreSummaryText">Répondez à la question pour obtenir une note.</small>
            </div>
          </div>

          <div class="criteria-list" id="criteriaList">
            <div class="criterion-item">
              <div class="criterion-row"><span>Clarté</span><strong>0%</strong></div>
              <div class="criterion-bar"><span style="width: 0%"></span></div>
            </div>
            <div class="criterion-item">
              <div class="criterion-row"><span>Pertinence</span><strong>0%</strong></div>
              <div class="criterion-bar"><span style="width: 0%"></span></div>
            </div>
            <div class="criterion-item">
              <div class="criterion-row"><span>Adéquation poste</span><strong>0%</strong></div>
              <div class="criterion-bar"><span style="width: 0%"></span></div>
            </div>
          </div>

          <div class="score-tips" id="scoreTips">
            <strong>Conseils :</strong>
            <ul>
              <li>Utilisez la méthode STAR.</li>
              <li>Ajoutez un exemple concret.</li>
              <li>Reliez votre réponse au poste visé.</li>
            </ul>
          </div>
        </div>
      </aside>

    </div>
@endsection

@section('scripts')
<script src="script_ENT_ENTRETIENS.js?v=2"></script>
@endsection
