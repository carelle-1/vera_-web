@extends('layouts.app')
@section('title', 'VERA - Notifications')
@section('styles')
<link rel="stylesheet" href="style_N.css">
@endsection

@section('content')
<div class="scroll-area">

      <!-- PAGE HEAD -->
      <div class="page-head">
        <h1>🔔 Notifications <span class="sparkle">✨</span></h1>
        <p>Restez informé de tout ce qui compte pour votre carrière.</p>
      </div>

      <!-- TABS -->
      <div class="tabs" id="notifTabs">
        <button class="tab active" data-filter="all">Toutes <span>8</span></button>
        <button class="tab" data-filter="unread">Non lus <span>8</span></button>
        <button class="tab" data-filter="opportunites">Opportunités <span>4</span></button>
        <button class="tab" data-filter="candidatures">Candidatures <span>2</span></button>
        <button class="tab" data-filter="formations">Formations <span>1</span></button>
        <button class="tab" data-filter="systeme">Système <span>1</span></button>
      </div>

      <!-- LAYOUT -->
      <div class="layout">

        <!-- LEFT: LIST -->
        <section class="notif-panel">

          <div class="toolbar">
            <label class="check-all">
              <input type="checkbox" id="selectAll"> Tout sélectionner
            </label>
            <div class="toolbar-actions">
              <button class="link-btn" id="markAllRead">✉ Marquer tout comme lu</button>
              <button class="btn-filter">Filtres ⚙</button>
            </div>
          </div>

          <div id="notifGroups"></div>

          <div class="pagination">
            <button class="page-num active" data-page="1">1</button>
            <button class="page-num" data-page="2">2</button>
            <button class="page-num" data-page="3">3</button>
            <span class="page-dots">...</span>
            <button class="page-arrow">→</button>
          </div>
        </section>

        <!-- RIGHT COLUMN -->
        <aside class="side-panel">

          <div class="card">
            <div class="card-head-row"><span>Préférences de notifications</span></div>
            <div class="pref-item">
              <div class="pref-icon blue">💼</div>
              <div class="pref-text"><div class="pref-title">Opportunités d'emploi</div><div class="pref-sub">Nouvelles offres et recommandations</div></div>
              <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
            </div>
            <div class="pref-item">
              <div class="pref-icon blue">✉</div>
              <div class="pref-text"><div class="pref-title">Messages</div><div class="pref-sub">Messages des recruteurs et équipes VERA</div></div>
              <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
            </div>
            <div class="pref-item">
              <div class="pref-icon green">📄</div>
              <div class="pref-text"><div class="pref-title">Candidatures</div><div class="pref-sub">Statuts et mises à jour de vos candidatures</div></div>
              <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
            </div>
            <div class="pref-item">
              <div class="pref-icon green">🎓</div>
              <div class="pref-text"><div class="pref-title">Formations</div><div class="pref-sub">Recommandations et rappels de formation</div></div>
              <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
            </div>
            <div class="pref-item">
              <div class="pref-icon gray">🧭</div>
              <div class="pref-text"><div class="pref-title">Coaching &amp; Conseils</div><div class="pref-sub">Nouveaux conseils et contenus</div></div>
              <label class="switch"><input type="checkbox"><span class="slider"></span></label>
            </div>
            <div class="pref-item">
              <div class="pref-icon blue">⚙</div>
              <div class="pref-text"><div class="pref-title">Système</div><div class="pref-sub">Mises à jour et informations générales</div></div>
              <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
            </div>
            <a href="#" class="see-all">Gérer mes préférences →</a>
          </div>

          <div class="card">
            <div class="card-head-row"><span>Résumé</span></div>
            <div class="summary-grid">
              <div class="summary-item blue"><div class="summary-num">8</div><div class="summary-label">Non lus</div></div>
              <div class="summary-item green"><div class="summary-num">24</div><div class="summary-label">Cette semaine</div></div>
              <div class="summary-item blue"><div class="summary-num">96</div><div class="summary-label">Ce mois-ci</div></div>
              <div class="summary-item green"><div class="summary-num">320</div><div class="summary-label">Total</div></div>
            </div>
          </div>

          <div class="card">
            <div class="card-head-row"><span>Ne pas déranger</span></div>
            <p class="dnd-text">Désactivez temporairement les notifications.</p>
            <div class="dnd-toggle-row">
              <span>Activer le mode Ne pas déranger</span>
              <label class="switch"><input type="checkbox" id="dndToggle"><span class="slider"></span></label>
            </div>
            <div class="dnd-times">
              <div class="dnd-time-field">
                <label>De</label>
                <select><option>22:00</option><option>23:00</option><option>21:00</option></select>
              </div>
              <div class="dnd-time-field">
                <label>À</label>
                <select><option>07:00</option><option>08:00</option><option>06:00</option></select>
              </div>
            </div>
            <p class="dnd-note">Vous ne recevrez pas de notifications pendant cette période, sauf les messages importants.</p>
          </div>

        </aside>

      </div>
    </div>
@endsection
@section('scripts')
<script src="script_N.js"></script>
@endsection
