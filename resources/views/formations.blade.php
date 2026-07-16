@extends('layouts.app')
@section('title', 'VERA - Formations')
@section('styles')
<link rel="stylesheet" href="style_F.css">
@endsection

@section('content')
<div class="scroll-area">

      <!-- PAGE HEAD -->
      <div class="page-head">
        <div>
          <h1>Formations <span class="cap">🎓</span></h1>
          <p>Développez vos compétences et boostez votre carrière avec des formations adaptées à vos objectifs.</p>
        </div>
        <button class="btn-primary" id="coachSearchBtn">✨ Rechercher avec coach IA</button>
      </div>

      <!-- TABS -->
      <div class="tabs" id="pageTabs">
        <button class="tab active" data-tab="overview">Vue d'ensemble</button>
        <button class="tab" data-tab="mesformations">Mes formations</button>
        <button class="tab" data-tab="catalogue">Parcourir le catalogue</button>
        <button class="tab" data-tab="certifs">Certifications</button>
        <button class="tab" data-tab="reco">Recommandées pour vous</button>
        <button class="tab" data-tab="favoris">Mes favoris</button>
      </div>

      <div class="tab-placeholder" id="tabPlaceholder"></div>

      <!-- LAYOUT -->
      <div class="layout" id="overviewLayout">

        <!-- LEFT COLUMN -->
        <div class="col-left">

          <!-- HERO -->
          <section class="hero">
            <div class="hero-left">
              <h2>Continuez votre apprentissage, Junior !</h2>
              <p>Chaque compétence acquise vous rapproche de vos objectifs. Ne vous arrêtez pas maintenant.</p>
              <div class="hero-progress">
                <div class="hero-progress-row"><span>Progression globale</span><span class="hero-progress-value">68%</span></div>
                <div class="hero-bar"><div class="hero-fill" style="width:68%"></div></div>
              </div>
            </div>
            <div class="hero-streak">
              <div class="streak-trophy">🏆</div>
              <div class="streak-label">Série d'apprentissage</div>
              <div class="streak-value">7 jours 🔥</div>
              <div class="streak-sub">Continuez ainsi !</div>
            </div>
          </section>

          <!-- REPRENDRE MES FORMATIONS -->
          <section class="section-block">
            <div class="section-head">
              <div>
                <h2>Reprendre mes formations</h2>
                <p>Continuez là où vous vous êtes arrêté</p>
              </div>
              <a href="#" class="see-all">Voir toutes mes formations →</a>
            </div>
            <div class="courses-grid" id="continueGrid"></div>
          </section>

          <!-- RECOMMANDEES -->
          <section class="section-block">
            <div class="section-head">
              <div>
                <h2>Recommandées pour vous</h2>
                <p>Basées sur votre profil et vos objectifs</p>
              </div>
              <a href="#" class="see-all">Voir plus de recommandations →</a>
            </div>
            <div class="reco-grid" id="recoGrid"></div>
          </section>

          <!-- CATEGORIES -->
          <section class="section-block">
            <div class="section-head">
              <div>
                <h2>Catégories populaires</h2>
                <p>Explorez nos thématiques les plus demandées</p>
              </div>
              <a href="#" class="see-all">Voir toutes les catégories →</a>
            </div>
            <div class="categories-grid" id="categoriesGrid"></div>
          </section>

        </div>

        <!-- RIGHT COLUMN -->
        <div class="col-right">

          <div class="card coach-card">
            <div class="robot-icon">🤖</div>
            <div class="coach-title">Coach IA</div>
            <p>Je vous recommande de suivre "Design System avec Figma" pour renforcer votre profil de Product Designer.</p>
            <a href="#" class="see-all">Voir la recommandation →</a>
          </div>

          <div class="card">
            <div class="card-head-row"><span>Mes objectifs d'apprentissage</span><a href="#" class="see-all">Voir tout →</a></div>
            <div class="goals-list" id="goalsList"></div>
            <button class="add-goal-btn">+ Ajouter un objectif</button>
          </div>

          <div class="card">
            <div class="card-head-row">
              <span>Statistiques d'apprentissage</span>
              <select class="period-select">
                <option>Ce mois-ci</option>
                <option>Cette semaine</option>
                <option>Cette année</option>
              </select>
            </div>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-icon">⏱</div>
                <div class="stat-label">Temps d'apprentissage</div>
                <div class="stat-value">24h 30m</div>
                <div class="stat-diff up">+18% vs le mois dernier</div>
              </div>
              <div class="stat-item">
                <div class="stat-icon">🎓</div>
                <div class="stat-label">Formations complétées</div>
                <div class="stat-value">3</div>
                <div class="stat-diff up">+2 vs le mois dernier</div>
              </div>
              <div class="stat-item">
                <div class="stat-icon">📜</div>
                <div class="stat-label">Certificats obtenus</div>
                <div class="stat-value">1</div>
                <div class="stat-diff up">+1 vs le mois dernier</div>
              </div>
              <div class="stat-item">
                <div class="stat-icon">🔥</div>
                <div class="stat-label">Série actuelle</div>
                <div class="stat-value">7 jours</div>
                <div class="stat-diff neutral">Continuez ainsi !</div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-head-row"><span>Certifications récentes</span><a href="#" class="see-all">Voir tout →</a></div>
            <div class="cert-item">
              <div class="cert-icon">🎨</div>
              <div class="cert-info">
                <div class="cert-title">Certificat Figma Avancé</div>
                <div class="cert-date">Obtenu le 15 Mai 2024</div>
              </div>
              <button class="cert-download">⬇ Télécharger</button>
            </div>
          </div>

        </div>

      </div>
    </div>
@endsection
@section('scripts')
<script src="script_F.js"></script>
@endsection
