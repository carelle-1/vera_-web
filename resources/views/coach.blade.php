@extends('layouts.app')
@section('title', 'VERA - Coaching & Carrière')
@section('styles')
<link rel="stylesheet" href="style_CO.css">
@endsection

@section('content')
<div class="scroll-area">

      <!-- PAGE HEAD -->
      <div class="page-head">
        <div>
          <h1>Coaching &amp; Carrière <span class="cap">&#127891;</span></h1>
          <p>Développez vos compétences, atteignez vos objectifs et construisez la carrière que vous méritez.</p>
        </div>
        <button class="btn-primary" id="coachBtn">&#10024; Discuter avec coach IA</button>
      </div>

      <!-- TABS -->
      <div class="tabs" id="pageTabs">
        <button class="tab active" data-tab="overview">Vue d'ensemble</button>
        <button class="tab" data-tab="plan">Plan de carrière</button>
        <button class="tab" data-tab="skills">Compétences</button>
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
              <div class="score-title">Score de carrière <span class="info">&#9405;</span></div>
              <div class="score-ring">
                <svg viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" class="ring-bg"></circle>
                  <circle cx="60" cy="60" r="52" class="ring-fg" id="careerRing"></circle>
                </svg>
                <div class="score-num">78<span>/100</span></div>
              </div>
            </div>

            <div class="score-mid">
              <div class="mid-title">Bien joué Junior !</div>
              <p>Vous êtes sur la bonne voie. Continuez à développer vos compétences clés pour atteindre le niveau Expert.</p>
              <button class="btn-white-outline">Voir le détail du score</button>
            </div>

            <div class="score-progress">
              <div class="progress-title">Progression globale <span class="info">&#9405;</span></div>
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
              <span class="level-badge orange">Intermédiaire</span>
              <div class="level-title">Prochain niveau</div>
              <span class="level-badge blue">Avancé</span>
              <p class="level-note">Il vous manque 22 points pour atteindre le niveau Avancé</p>
            </div>

            <div class="score-hero-bar"><div class="score-hero-fill" style="width:78%"></div></div>
          </section>

          <!-- COMPETENCES A RENFORCER -->
          <section class="section-block">
            <div class="section-head">
              <div>
                <h2>Compétences à renforcer</h2>
                <p>Basé sur votre profil et les tendances du marché</p>
              </div>
              <a href="#" class="see-all">Voir toutes les compétences &rarr;</a>
            </div>

            <div class="skills-grid" id="skillsGrid"></div>
          </section>

          <!-- FORMATIONS RECOMMANDEES -->
          <section class="section-block">
            <div class="section-head">
              <div>
                <h2>Formations recommandées pour vous</h2>
                <p>Sélectionnées spécialement pour atteindre vos objectifs</p>
              </div>
              <a href="#" class="see-all">Voir toutes les formations &rarr;</a>
            </div>

            <div class="formations-grid" id="formationsGrid"></div>
          </section>

          <!-- OBJECTIFS -->
          <section class="section-block">
            <div class="section-head">
              <div>
                <h2>Vos objectifs</h2>
                <p>Suivez vos objectifs et restez motivé</p>
              </div>
              <a href="#" class="see-all">Voir tous mes objectifs &rarr;</a>
            </div>

            <div class="objectifs-grid" id="objectifsGrid"></div>
          </section>

        </div>

        <!-- RIGHT COLUMN -->
        <div class="col-right">

          <div class="card plan-card">
            <div class="card-head-row"><span>Plan de carrière</span><a href="#" class="see-all">Voir tout &rarr;</a></div>
            <div class="plan-goal">
              <div class="plan-goal-icon">&#127891;</div>
              <div>
                <div class="plan-goal-label">Objectif professionnel</div>
                <div class="plan-goal-value">Devenir Product Designer Senior</div>
              </div>
            </div>

            <ul class="timeline" id="timelineList"></ul>

            <button class="btn-outline full">Modifier mon plan</button>
          </div>

          <div class="card advice-card">
            <div class="card-head-row"><span>Conseils de votre coach IA &#10024;</span></div>
            <p>Pour atteindre le niveau Avancé plus rapidement, je vous recommande de vous concentrer sur le Design System et le Prototyping avancé.</p>
            <div class="robot-mini">&#129302;</div>
            <button class="btn-white-outline full">Voir mes recommandations personnalisées &rarr;</button>
          </div>

          <div class="card insights-card">
            <div class="card-head-row"><span>Insights du marché</span><a href="#" class="see-all">Voir plus &rarr;</a></div>
            <div class="insight-item">
              <div class="insight-icon blue">&#128203;</div>
              <div class="insight-text">
                <div class="insight-title">Product Designer <span class="tag-demand">En forte demande</span></div>
                <div class="insight-sub">+32% d'offres ce mois-ci</div>
              </div>
              <svg class="insight-spark" viewBox="0 0 60 30" preserveAspectRatio="none"><polyline points="0,24 15,18 30,20 45,8 60,4"></polyline></svg>
            </div>
            <div class="insight-item">
              <div class="insight-icon green">&#128178;</div>
              <div class="insight-text">
                <div class="insight-title">Salaire moyen</div>
                <div class="insight-sub">1 800 &ndash; 3 500 $ <span class="up-sub">+18% vs l'année dernière</span></div>
              </div>
              <svg class="insight-spark" viewBox="0 0 60 30" preserveAspectRatio="none"><polyline points="0,20 15,22 30,14 45,16 60,4"></polyline></svg>
            </div>
            <div class="insight-item">
              <div class="insight-icon orange">&#127919;</div>
              <div class="insight-text">
                <div class="insight-title">Compétence la plus recherchée</div>
                <div class="insight-sub">Design System <span class="up-sub">Dans 78% des offres</span></div>
              </div>
              <svg class="insight-spark" viewBox="0 0 60 30" preserveAspectRatio="none"><polyline points="0,10 15,18 30,8 45,20 60,6"></polyline></svg>
            </div>
          </div>

        </div>

      </div>

      <!-- LAYOUT: OBJECTIFS -->
      <div class="layout" id="objectivesLayout" style="display:none;">
        <div class="col-full">
          <div class="exp-toolbar">
            <button class="exp-search-toggle" id="objSearchToggle" type="button" title="Rechercher">
              <img src="/image/3917754.png" alt="Rechercher">
            </button>
            <div class="exp-search" id="objSearchWrap" style="display:none;">
              <span>&#128269;</span>
              <input type="text" id="objSearch" placeholder="Rechercher un objectif...">
            </div>
            <button class="btn-primary-sm" id="objAddBtn" type="button">+ Ajouter un objectif</button>
          </div>
          <div class="card exp-card">
            <div id="objList" class="exp-list"></div>
            <div id="objEmpty" class="exp-empty" style="display:none;">
              <div class="exp-empty-icon">&#127919;</div>
              <p>Aucun objectif pour le moment.</p>
              <span>Cliquez sur « + Ajouter un objectif » pour commencer.</span>
            </div>
          </div>
        </div>
      </div>

    </div>
@endsection
@section('scripts')
<script src="script_CO.js"></script>
@endsection
