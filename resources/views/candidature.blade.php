@extends('layouts.app')
@section('title', 'VERA - Mes candidatures')
@section('styles')
<link rel="stylesheet" href="style_C.css">
@endsection

@section('content')
<!-- PAGE HEAD -->
    <div class="page-head">
      <div>
        <h1>Mes candidatures</h1>
        <p>Suis toutes tes candidatures et découvre de nouvelles opportunités.</p>
      </div>
      <button class="btn-outline-dark" id="exportBtn">⇩ Exporter le rapport</button>
    </div>

    <!-- TABS -->
    <div class="tabs" id="tabs">
      <button class="tab active" data-status="all">Toutes <span>0</span></button>
      <button class="tab" data-status="new">Premières <span>0</span></button>
      <button class="tab" data-status="response">Réponses <span>0</span></button>
      <button class="tab" data-status="offer">Offres <span>0</span></button>
      <button class="tab" data-status="interview">Entretiens <span>0</span></button>
      <button class="tab" data-status="confirmed">Confirmées <span>0</span></button>
    </div>

    <!-- CONTENT GRID -->
    <div class="cand-layout">

      <!-- LIST -->
      <section class="list-panel">

        <div class="toolbar">
          <div class="search small">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
            <input type="text" id="searchInput" placeholder="Rechercher une candidature...">
          </div>
          <button class="icon-square">🔧</button>
          <button class="icon-square active" data-view="list">☰</button>
          <button class="icon-square" data-view="grid">▦</button>
        </div>

        <div class="cand-list" id="candList"></div>

        <div class="pagination" id="pagination">
          <button class="page-arrow" data-page="prev">‹</button>
          <button class="page-num active" data-page="1">1</button>
          <button class="page-num" data-page="2">2</button>
          <button class="page-num" data-page="3">3</button>
          <button class="page-arrow" data-page="next">›</button>
        </div>
      </section>

      <!-- SIDE PANEL -->
      <aside class="side-panel">

        <div class="card summary-card">
          <div class="card-head-row">
            <span>Résumé de mes candidatures</span>
            <a href="#" class="see-all">Voir tout</a>
          </div>
          <div class="donut-wrap">
            <svg viewBox="0 0 120 120" id="donutSvg"></svg>
            <div class="donut-center"><span id="donutTotal">0</span><small>Total</small></div>
          </div>
          <ul class="legend" id="legend"></ul>
        </div>

        <div class="card rate-card">
          <div class="card-head-row"><span>Taux de réponse</span></div>
          <div class="rate-value" id="rateValue">0% <span class="up">↗ 0%</span></div>
          <svg class="sparkline" viewBox="0 0 200 60" preserveAspectRatio="none">
            <polyline points="0,50 30,42 60,45 90,30 120,34 150,18 180,22 200,10" />
          </svg>
        </div>

        <div class="card reco-card">
          <div class="card-head-row"><span>Actions recommandées par VERA</span></div>
          <div class="reco-item">
            <div class="reco-icon blue">✉</div>
            <div class="reco-text">Envoie un message de relance</div>
          </div>
          <div class="reco-item">
            <div class="reco-icon orange">📅</div>
            <div class="reco-text">Prépare ton entretien</div>
          </div>
          <div class="reco-item">
            <div class="reco-icon green">🎯</div>
            <div class="reco-text">Postule à 3 offres suggérées</div>
          </div>
        </div>

        <div class="card autopilot-card">
          <div class="autopilot-head">🚀 Laisse VERA travailler pour toi</div>
          <p>Active l'auto-postulation pour ne rater aucune opportunité qui correspond à ton profil.</p>
          <button class="btn-white full">Activer l'auto-postulation</button>
        </div>

      </aside>

    </div>
@endsection
@section('scripts')
<script src="script_C.js"></script>
@endsection
