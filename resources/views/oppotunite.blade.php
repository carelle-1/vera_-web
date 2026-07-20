@extends('layouts.app')
@section('title', 'VERA - Opportunités')
@section('styles')
<link rel="stylesheet" href="style_O.css">
@endsection

@section('content')
<!-- PAGE HEADER -->
    <div class="page-head">
      <div>
        <h1>Opportunités</h1>
        <p>VERA trouve les meilleures opportunités qui correspondent à ton profil.</p>
      </div>
      <button class="btn-refresh" id="refreshBtn">🔄 Rafraîchir les offres</button>
    </div>

    <!-- TABS -->
    <div class="tabs">
      <button class="tab active" data-tab="filtres">Filtres</button>
      <button class="tab" data-tab="toutes">Toutes les offres</button>
      <button class="tab" data-tab="entreprises">Différentes entreprises</button>
      <button class="tab" data-tab="reco">Recommandées</button>
    </div>

    <!-- CONTENT GRID -->
    <div class="opp-layout">

      <!-- FILTERS PANEL -->
      <aside class="filters-panel active" id="panelFiltres">
        <div class="filters-head">
          <span>Filtres</span>
          <button id="resetFilters" class="reset-link">Réinitialiser</button>
        </div>

        <div class="filter-group">
          <div class="filter-title">Type de contrat</div>
          <label class="check"><input type="checkbox" checked data-filter="contract" value="CDI"> CDI</label>
          <label class="check"><input type="checkbox" data-filter="contract" value="CDD"> CDD</label>
          <label class="check"><input type="checkbox" data-filter="contract" value="Freelance"> Freelance</label>
          <label class="check"><input type="checkbox" data-filter="contract" value="Stage"> Stage</label>
        </div>

        <div class="filter-group">
          <div class="filter-title">Localisation</div>
          <input type="text" class="filter-input" placeholder="Ville, pays...">
          <label class="check"><input type="checkbox" data-filter="location" value="Remote" checked> Remote</label>
          <label class="check"><input type="checkbox" data-filter="location" value="Hybride"> Hybride</label>
          <label class="check"><input type="checkbox" data-filter="location" value="Sur site"> Sur site</label>
        </div>

        <div class="filter-group">
          <div class="filter-title">Salaire</div>
          <input type="range" min="0" max="10000" value="4000" step="500" class="filter-range" id="salaryRange">
          <div class="range-value"><span id="salaryValue">4 000 $</span> et plus</div>
        </div>

        <div class="filter-group">
          <div class="filter-title">Niveau d'expérience</div>
          <label class="check"><input type="checkbox" data-filter="level" value="Junior"> Junior</label>
          <label class="check"><input type="checkbox" data-filter="level" value="Intermédiaire" checked> Intermédiaire</label>
          <label class="check"><input type="checkbox" data-filter="level" value="Senior"> Senior</label>
        </div>
      </aside>

      <!-- JOB LIST -->
      <section class="job-list-panel active" id="panelToutes">
        <div class="list-head">
          <span id="resultCount">247 offres trouvées</span>
          <div class="sort-wrap">
            <span>Trier par :</span>
            <select id="sortSelect">
              <option value="pertinence">Pertinence</option>
              <option value="recent">Plus récentes</option>
              <option value="salaire">Salaire</option>
            </select>
          </div>
        </div>

        <div class="jobs" id="jobList"></div>

        <div class="pagination" id="pagination">
          <button class="page-arrow" data-page="prev">‹</button>
          <button class="page-num active" data-page="1">1</button>
          <button class="page-num" data-page="2">2</button>
          <button class="page-num" data-page="3">3</button>
          <span class="page-dots">...</span>
          <button class="page-num" data-page="12">12</button>
          <button class="page-arrow" data-page="next">›</button>
        </div>
      </section>

      <!-- DETAIL PANEL -->
      <aside class="detail-panel" id="detailPanel"></aside>

      <!-- EMPTY PANELS FOR OTHER TABS -->
      <section class="job-list-panel" id="panelEntreprises">
        <div class="list-head">
          <span id="resultCountEntreprises">Entreprises</span>
        </div>
        <div class="jobs" id="entrepriseList"></div>
      </section>

      <section class="job-list-panel" id="panelReco">
        <div class="list-head">
          <span id="resultCountReco">Offres recommandées</span>
        </div>
        <div class="jobs" id="recoList"></div>
      </section>

    </div>
@endsection
@section('scripts')
<script src="script_O.js"></script>
@endsection
