@extends('layouts.app')
@section('title', 'VERA - Coaching & CarriÃ¨re')
@section('styles')
<link rel="stylesheet" href="style_CO.css">
@endsection

@section('content')
<div class="scroll-area">

      <!-- PAGE HEAD -->
      <div class="page-head">
        <div>
          <h1>Coaching &amp; Carri¨re <span class="cap">ðŸŽ“</span></h1>
          <p>D©veloppez vos comp©tences, atteignez vos objectifs et construisez la carri¨re que vous m©ritez.</p>
        </div>
        <button class="btn-primary" id="coachBtn">âœ¨ Discuter avec coach IA</button>
      </div>

      <!-- TABS -->
      <div class="tabs" id="pageTabs">
        <button class="tab active" data-tab="overview">Vue d'ensemble</button>
        <button class="tab" data-tab="plan">Plan de carri¨re</button>
        <button class="tab" data-tab="skills">Comp©tences</button>
        <button class="tab" data-tab="objectifs">Objectifs</button>
        <button class="tab" data-tab="insights">Analyses &amp; Insights</button>
        <button class="tab" data-tab="conseils">Conseils IA</button>
      </div>

      <div class="tab-placeholder" id="tabPlaceholder"></div>

      <!-- LAYOUT -->
      <div class="layout" id="overviewLayout">

        <!-- LEFT COLUMN -->
        <div class="col-left">

          <!-- SCORE HERO -->
          <section class="score-hero">
            <div class="score-block">
              <div class="score-title">Score de carri¨re <span class="info">â“˜</span></div>
              <div class="score-ring">
                <svg viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" class="ring-bg"></circle>
                  <circle cx="60" cy="60" r="52" class="ring-fg" id="careerRing"></circle>
                </svg>
                <div class="score-num">78<span>/100</span></div>
              </div>
            </div>

            <div class="score-mid">
              <div class="mid-title">Bien jou© Junior !</div>
              <p>Vous ªtes sur la bonne voie. Continuez   d©velopper vos comp©tences cl©s pour atteindre le niveau Expert.</p>
              <button class="btn-white-outline">Voir le d©tail du score</button>
            </div>

            <div class="score-progress">
              <div class="progress-title">Progression globale <span class="info">â“˜</span></div>
              <div class="progress-value">+28% <small>depuis le mois dernier</small></div>
              <svg class="mini-chart" viewBox="0 0 160 60" preserveAspectRatio="none">
                <polyline points="0,45 55,35 110,22 160,6"></polyline>
              </svg>
              <div class="mini-chart-labels">
                <span>Mars<br><strong>55%</strong></span>
                <span>Avr.<br><strong>62%</strong></span>
                <span>Mai<br><strong>78%</strong></span>
              </div>
            </div>

            <div class="score-level">
              <div class="level-title">Niveau actuel</div>
              <span class="level-badge orange">Interm©diaire</span>
              <div class="level-title">Prochain niveau</div>
              <span class="level-badge blue">Avanc©</span>
              <p class="level-note">Il vous manque 22 points pour atteindre le niveau Avanc©</p>
            </div>

            <div class="score-hero-bar"><div class="score-hero-fill" style="width:78%"></div></div>
          </section>

          <!-- COMPETENCES A RENFORCER -->
          <section class="section-block">
            <div class="section-head">
              <div>
                <h2>Comp©tences   renforcer</h2>
                <p>Bas© sur votre profil et les tendances du march©</p>
              </div>
              <a href="#" class="see-all">Voir toutes les comp©tences â†’</a>
            </div>

            <div class="skills-grid" id="skillsGrid"></div>
          </section>

          <!-- FORMATIONS RECOMMANDEES -->
          <section class="section-block">
            <div class="section-head">
              <div>
                <h2>Formations recommand©es pour vous</h2>
                <p>S©lectionn©es sp©cialement pour atteindre vos objectifs</p>
              </div>
              <a href="#" class="see-all">Voir toutes les formations â†’</a>
            </div>

            <div class="formations-grid" id="formationsGrid"></div>
          </section>

          <!-- OBJECTIFS -->
          <section class="section-block">
            <div class="section-head">
              <div>
                <h2>Vos objectifs</h2>
                <p>Suivez vos objectifs et restez motiv©</p>
              </div>
              <a href="#" class="see-all">Voir tous mes objectifs â†’</a>
            </div>

            <div class="objectifs-grid" id="objectifsGrid"></div>
          </section>

        </div>

        <!-- RIGHT COLUMN -->
        <div class="col-right">

          <div class="card plan-card">
            <div class="card-head-row"><span>Plan de carri¨re</span><a href="#" class="see-all">Voir tout â†’</a></div>
            <div class="plan-goal">
              <div class="plan-goal-icon">ðŸŽ“</div>
              <div>
                <div class="plan-goal-label">Objectif professionnel</div>
                <div class="plan-goal-value">Devenir Product Designer Senior</div>
              </div>
            </div>

            <ul class="timeline" id="timelineList"></ul>

            <button class="btn-outline full">Modifier mon plan</button>
          </div>

          <div class="card advice-card">
            <div class="card-head-row"><span>Conseils de votre coach IA âœ¨</span></div>
            <p>Pour atteindre le niveau Avanc© plus rapidement, je vous recommande de vous concentrer sur le Design System et le Prototyping avanc©.</p>
            <div class="robot-mini">ðŸ¤–</div>
            <button class="btn-white-outline full">Voir mes recommandations personnalis©es â†’</button>
          </div>

          <div class="card insights-card">
            <div class="card-head-row"><span>Insights du march©</span><a href="#" class="see-all">Voir plus â†’</a></div>
            <div class="insight-item">
              <div class="insight-icon blue">ðŸ“‹</div>
              <div class="insight-text">
                <div class="insight-title">Product Designer <span class="tag-demand">En forte demande</span></div>
                <div class="insight-sub">+32% d'offres ce mois-ci</div>
              </div>
              <svg class="insight-spark" viewBox="0 0 60 30" preserveAspectRatio="none"><polyline points="0,24 15,18 30,20 45,8 60,4"></polyline></svg>
            </div>
            <div class="insight-item">
              <div class="insight-icon green">ðŸ’²</div>
              <div class="insight-text">
                <div class="insight-title">Salaire moyen</div>
                <div class="insight-sub">1 800 â€“ 3 500 $ <span class="up-sub">+18% vs l'ann©e derni¨re</span></div>
              </div>
              <svg class="insight-spark" viewBox="0 0 60 30" preserveAspectRatio="none"><polyline points="0,20 15,22 30,14 45,16 60,4"></polyline></svg>
            </div>
            <div class="insight-item">
              <div class="insight-icon orange">ðŸŽ¯</div>
              <div class="insight-text">
                <div class="insight-title">Comp©tence la plus recherch©e</div>
                <div class="insight-sub">Design System <span class="up-sub">Dans 78% des offres</span></div>
              </div>
              <svg class="insight-spark" viewBox="0 0 60 30" preserveAspectRatio="none"><polyline points="0,10 15,18 30,8 45,20 60,6"></polyline></svg>
            </div>
          </div>

        </div>

      </div>
    </div>
@endsection
@section('scripts')
<script src="script_CO.js"></script>
@endsection
