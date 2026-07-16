@extends('layouts.app')
@section('title', 'VERA - Besoin d'aide ?')
@section('styles')
<link rel="stylesheet" href="style_A.css">
@endsection

@section('content')
<div class="scroll-area">

      <!-- PAGE HEAD -->
      <div class="page-head">
        <h1>🎧 Besoin d'aide ?</h1>
        <p>Nous sommes là pour vous accompagner à chaque étape de votre parcours avec VERA.</p>
      </div>

      <!-- LAYOUT -->
      <div class="layout">

        <!-- LEFT COLUMN -->
        <div class="col-left">

          <!-- SEARCH CARD -->
          <section class="card search-card">
            <div class="search-title">Comment pouvons-nous vous aider aujourd'hui ?</div>
            <div class="help-search">
              <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
              <input type="text" id="helpSearchInput" placeholder="Posez votre question ici (ex: comment postuler à une offre?)">
              <button class="btn-primary" id="helpSearchBtn">🔍 Rechercher</button>
            </div>
            <div class="faq-chips">
              <span>Questions fréquentes :</span>
              <button class="chip">Postuler à une offre</button>
              <button class="chip">Problème de connexion</button>
              <button class="chip">Abonnement Premium</button>
              <button class="chip">Modifier mon CV</button>
            </div>
          </section>

          <!-- CATEGORIES -->
          <section class="section-block">
            <h2>Parcourir par catégorie</h2>
            <div class="categories-grid" id="categoriesGrid"></div>
          </section>

          <!-- BANNER -->
          <section class="support-banner">
            <div class="banner-icon">💬</div>
            <div class="banner-text">
              <div class="banner-title">Vous ne trouvez pas ce que vous cherchez ?</div>
              <div class="banner-sub">Notre équipe support est disponible pour vous aider personnellement.</div>
            </div>
            <button class="btn-primary" id="openChatBtn">💬 Discuter avec le support</button>
          </section>

          <!-- RESSOURCES -->
          <section class="section-block">
            <h2>Ressources utiles</h2>
            <div class="resources-grid" id="resourcesGrid"></div>
          </section>

        </div>

        <!-- RIGHT COLUMN -->
        <aside class="col-right">

          <div class="card">
            <div class="card-head-row">Choisissez votre mode de contact</div>
            <div class="contact-option">
              <div class="contact-icon blue">💬</div>
              <div class="contact-text"><div class="contact-title">Discuter avec le support</div><div class="contact-sub">Réponse en temps réel par chat</div></div>
              <span class="status-badge online">En ligne</span>
              <span class="chev-right">›</span>
            </div>
            <div class="contact-option">
              <div class="contact-icon purple">✉</div>
              <div class="contact-text"><div class="contact-title">Envoyer un message</div><div class="contact-sub">Nous répondrons par email</div></div>
              <span class="status-badge neutral">Réponse sous 24h</span>
              <span class="chev-right">›</span>
            </div>
            <div class="contact-option">
              <div class="contact-icon green">📞</div>
              <div class="contact-text"><div class="contact-title">Appel téléphonique</div><div class="contact-sub">Parlez directement avec un conseiller</div></div>
              <span class="status-badge neutral">Lun - Ven, 9h - 18h</span>
              <span class="chev-right">›</span>
            </div>
          </div>

          <!-- CHAT WIDGET -->
          <div class="card chat-widget">
            <div class="chat-widget-header">
              <div>
                <div class="chat-widget-title">Discuter avec notre support</div>
                <div class="chat-widget-status"><span class="dot-online"></span>En ligne</div>
              </div>
              <div class="chat-widget-avatars">🧑‍💻👩‍💻🧑‍💼</div>
              <button class="chat-widget-more">⋯</button>
            </div>

            <div class="chat-widget-messages" id="chatMessages"></div>

            <div class="chat-widget-input">
              <input type="text" id="chatInput" placeholder="Écrivez votre message...">
              <button class="input-icon">📎</button>
              <button class="input-icon">😊</button>
            </div>
            <div class="chat-widget-footer">Réponse moyenne : 2 min</div>
          </div>

        </aside>

      </div>
    </div>
@endsection
@section('scripts')
<script src="script_A.js"></script>
@endsection
