@extends('layouts.app')
@section('title', 'VERA - Opportunit√©s')
@section('styles')
<link rel="stylesheet" href="style_O.css">
@endsection

@section('content')
<!-- PAGE HEADER -->
    <div class="page-head">
      <div>
        <h1>Opportunit©s</h1>
        <p>VERA trouve les meilleures opportunit©s qui correspondent † ton profil.</p>
      </div>
      <button class="btn-refresh" id="refreshBtn">‚ü≥ RafraÆchir les offres</button>
    </div>

    <!-- TABS -->
    <div class="tabs">
      <button class="tab active" data-tab="filtres">Filtres</button>
      <button class="tab" data-tab="toutes">Toutes les offres</button>
      <button class="tab" data-tab="entreprises">Diff©rentes entreprises</button>
      <button class="tab" data-tab="reco">Recommand©es</button>
    </div>

    <!-- CONTENT GRID -->
    <div class="opp-layout">

      <!-- FILTERS PANEL -->
      <aside class="filters-panel">
        <div class="filters-head">
          <span>Filtres</span>
          <button id="resetFilters" class="reset-link">R©initialiser</button>
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
          <div class="filter-title">Niveau d'exp©rience</div>
          <label class="check"><input type="checkbox" data-filter="level" value="Junior"> Junior</label>
          <label class="check"><input type="checkbox" data-filter="level" value="Interm©diaire" checked> Interm©diaire</label>
          <label class="check"><input type="checkbox" data-filter="level" value="Senior"> Senior</label>
        </div>
      </aside>

      <!-- JOB LIST -->
      <section class="job-list-panel">
        <div class="list-head">
          <span id="resultCount">247 offres trouv©es</span>
          <div class="sort-wrap">
            <span>Trier par :</span>
            <select id="sortSelect">
              <option value="pertinence">Pertinence</option>
              <option value="recent">Plus r©centes</option>
              <option value="salaire">Salaire</option>
            </select>
          </div>
        </div>

        <div class="jobs" id="jobList"></div>

        <div class="pagination" id="pagination">
          <button class="page-arrow" data-page="prev">‚Äπ</button>
          <button class="page-num active" data-page="1">1</button>
          <button class="page-num" data-page="2">2</button>
          <button class="page-num" data-page="3">3</button>
          <span class="page-dots">...</span>
          <button class="page-num" data-page="12">12</button>
          <button class="page-arrow" data-page="next">‚Ä∫</button>
        </div>
      </section>

      <!-- DETAIL PANEL -->
      <aside class="detail-panel" id="detailPanel"></aside>

    </div>
@endsection
@section('scripts')
<script src="script_O.js"></script>
@endsection
