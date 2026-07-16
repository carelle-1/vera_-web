@extends('layouts.app')
@section('title', 'VERA - Favoris')
@section('styles')
<link rel="stylesheet" href="style_FA.css">
@endsection

@section('content')
<div class="scroll-area">

      <!-- PAGE HEAD -->
      <div class="page-head">
        <h1>Favoris <span class="heart">♡</span> <span class="sparkle">✨</span></h1>
        <p>Retrouvez tous les emplois, entreprises et formations que vous avez enregistrés.</p>
      </div>

      <!-- TABS -->
      <div class="tabs" id="favTabs">
        <button class="tab active" data-tab="offres">Offres d'emploi <span>16</span></button>
        <button class="tab" data-tab="entreprises">Entreprises <span>8</span></button>
        <button class="tab" data-tab="formations">Formations <span>6</span></button>
        <button class="tab" data-tab="recherches">Recherches <span>4</span></button>
      </div>

      <!-- LAYOUT -->
      <div class="layout">

        <!-- LEFT: LIST -->
        <section class="list-panel">

          <div class="toolbar">
            <span class="result-count" id="resultCount">16 offres d'emploi</span>
            <div class="toolbar-actions">
              <button class="btn-outline" id="exportBtn">⬆ Exporter</button>
              <div class="sort-wrap">
                <span>Trier par :</span>
                <select id="sortSelect">
                  <option value="recentes">Plus récentes</option>
                  <option value="compat">Compatibilité</option>
                  <option value="salaire">Salaire</option>
                </select>
              </div>
            </div>
          </div>

          <div class="jobs" id="jobList"></div>

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
            <div class="card-head-row"><span>Organisez vos favoris</span></div>
            <p class="side-text">Créez des listes pour mieux organiser vos favoris selon vos objectifs.</p>
            <button class="btn-outline full" id="createListBtn">+ Créer une liste</button>
          </div>

          <div class="card">
            <div class="card-head-row"><span>Mes listes</span></div>
            <div class="list-item">
              <span class="list-dot purple"></span>
              <span class="list-name">À postuler cette semaine</span>
              <span class="list-count">6</span>
            </div>
            <div class="list-item">
              <span class="list-dot blue"></span>
              <span class="list-name">Opportunités Remote</span>
              <span class="list-count">5</span>
            </div>
            <div class="list-item">
              <span class="list-dot pink"></span>
              <span class="list-name">Postes en Design</span>
              <span class="list-count">3</span>
            </div>
            <div class="list-item">
              <span class="list-dot green"></span>
              <span class="list-name">Startups</span>
              <span class="list-count">2</span>
            </div>
            <a href="#" class="see-all">Voir toutes mes listes →</a>
          </div>

          <div class="card">
            <div class="card-head-row"><span>Boostez vos chances</span></div>
            <p class="side-text">Les candidats qui postulent dans les 7 jours ont 2x plus de chances d'être contactés.</p>
            <div class="boost-row">
              <div class="boost-ring">
                <svg viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" class="boost-ring-bg"></circle>
                  <circle cx="40" cy="40" r="34" class="boost-ring-fg" id="boostRing"></circle>
                </svg>
                <div class="boost-num">60%</div>
              </div>
              <p class="boost-text">de vos favoris n'ont pas encore été consultés.</p>
            </div>
            <button class="btn-outline full">Voir mes favoris non consultés</button>
          </div>

          <div class="card advice-card">
            <div class="card-head-row"><span>Conseil VERA ✨</span></div>
            <p>Activez les alertes pour être informé en temps réel des nouvelles opportunités similaires.</p>
            <button class="btn-white-outline full">🔔 Créer une alerte</button>
          </div>

        </aside>

      </div>
    </div>
@endsection
@section('scripts')
<script src="script_FA.js"></script>
@endsection
