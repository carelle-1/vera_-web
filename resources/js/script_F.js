// ============== DONNÉES ==============
const continueCourses = [
  { icon: "🎨", bg: "#f24e1e", title: "Design System avec Figma", level: "Intermédiaire", levelClass: "intermediate", value: 75, remaining: "2h 15m restantes" },
  { icon: "🧩", bg: "#6d28d9", title: "Prototyping avancé", level: "Intermédiaire", levelClass: "intermediate", value: 60, remaining: "1h 30m restantes" },
  { icon: "🔍", bg: "#0ea5e9", title: "User Research Méthodes", level: "Débutant", levelClass: "beginner", value: 40, remaining: "1h restantes" },
  { icon: "🧑‍🤝‍🧑", bg: "#16a34a", title: "Leadership & Soft Skills", level: "Débutant", levelClass: "beginner", value: 25, remaining: "45m restantes" }
];

const recoCourses = [
  { icon: "✍️", bg: "#f59e0b", title: "UX Writing", level: "Intermédiaire", duration: "6h", rating: "4.7", reviews: 89 },
  { icon: "📊", bg: "#ef4444", title: "Data Visualization", level: "Intermédiaire", duration: "8h", rating: "4.6", reviews: 74 },
  { icon: "🗂", bg: "#3b6bf5", title: "Gestion de projet Agile", level: "Intermédiaire", duration: "10h", rating: "4.8", reviews: 126 },
  { icon: "📈", bg: "#16a34a", title: "SEO Avancé", level: "Intermédiaire", duration: "7h", rating: "4.5", reviews: 63 }
];

const categories = [
  { icon: "🎨", title: "Design & UX", count: "24 formations" },
  { icon: "💻", title: "Développement", count: "36 formations" },
  { icon: "💼", title: "Business", count: "28 formations" },
  { icon: "📣", title: "Marketing", count: "22 formations" },
  { icon: "📊", title: "Data & IA", count: "18 formations" },
  { icon: "🤝", title: "Soft Skills", count: "16 formations" }
];

const goals = [
  { color: "#3b6bf5", title: "Devenir Product Designer Senior", value: 60 },
  { color: "#8b5cf6", title: "Maîtriser Figma avancé", value: 80 },
  { color: "#0ea5e9", title: "Améliorer mes compétences en UX Research", value: 40 }
];

// ============== RENDU REPRENDRE MES FORMATIONS ==============
function renderContinueCourses() {
  const grid = document.getElementById("continueGrid");
  grid.innerHTML = continueCourses.map((c, i) => `
    <div class="course-card">
      <div class="course-icon" style="background:${c.bg}">${c.icon}</div>
      <div class="course-title">${c.title}</div>
      <span class="course-level ${c.levelClass}">${c.level}</span>
      <div class="course-bar"><div class="course-fill" id="courseFill${i}"></div></div>
      <div class="course-percent">${c.value}%</div>
      <div class="course-remain">🕐 ${c.remaining}</div>
      <button class="btn-continue">Continuer</button>
    </div>
  `).join("");

  requestAnimationFrame(() => {
    setTimeout(() => {
      continueCourses.forEach((c, i) => {
        document.getElementById(`courseFill${i}`).style.width = c.value + "%";
      });
    }, 150);
  });
}

// ============== RENDU RECOMMANDEES ==============
function renderRecoCourses() {
  const grid = document.getElementById("recoGrid");
  grid.innerHTML = recoCourses.map(c => `
    <div class="reco-card">
      <div class="reco-icon" style="background:${c.bg}">${c.icon}</div>
      <div class="reco-title">${c.title}</div>
      <span class="reco-level">${c.level}</span>
      <div class="reco-meta">${c.duration} · Certificat · ⭐ ${c.rating} (${c.reviews})</div>
      <button class="btn-reco">Voir la formation</button>
    </div>
  `).join("");
}

// ============== RENDU CATEGORIES ==============
function renderCategories() {
  const grid = document.getElementById("categoriesGrid");
  grid.innerHTML = categories.map(c => `
    <div class="category-card">
      <div class="category-icon">${c.icon}</div>
      <div class="category-title">${c.title}</div>
      <div class="category-count">${c.count}</div>
    </div>
  `).join("");
}

// ============== RENDU OBJECTIFS ==============
function renderGoals() {
  const list = document.getElementById("goalsList");
  list.innerHTML = goals.map((g, i) => `
    <div class="goal-item">
      <div class="goal-row">
        <span class="goal-icon" style="background:${g.color}"></span>
        <span>${g.title}</span>
        <span class="goal-percent">${g.value}%</span>
      </div>
      <div class="goal-bar"><div class="goal-fill" id="goalFill${i}"></div></div>
    </div>
  `).join("");

  requestAnimationFrame(() => {
    setTimeout(() => {
      goals.forEach((g, i) => {
        document.getElementById(`goalFill${i}`).style.width = g.value + "%";
      });
    }, 150);
  });
}

// ============== TABS ==============
const tabLabels = {
  mesformations: "Mes formations",
  catalogue: "Parcourir le catalogue",
  certifs: "Certifications",
  reco: "Recommandées pour vous",
  favoris: "Mes favoris"
};

document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    const key = tab.dataset.tab;
    const overview = document.getElementById("overviewLayout");
    const placeholder = document.getElementById("tabPlaceholder");

    if (key === "overview") {
      overview.style.display = "grid";
      placeholder.style.display = "none";
    } else {
      overview.style.display = "none";
      placeholder.style.display = "block";
      placeholder.textContent = `Section "${tabLabels[key]}" — contenu à compléter prochainement.`;
    }
  });
});

// ============== BOUTON COACH IA ==============
document.getElementById("coachSearchBtn").addEventListener("click", () => {
  const btn = document.getElementById("coachSearchBtn");
  const original = btn.textContent;
  btn.textContent = "Recherche en cours...";
  setTimeout(() => { btn.textContent = original; }, 1200);
});

// ============== BOUTON AJOUTER OBJECTIF ==============
document.querySelector(".add-goal-btn").addEventListener("click", function () {
  const original = this.textContent;
  this.textContent = "✓ Objectif ajouté";
  setTimeout(() => { this.textContent = original; }, 1200);
});

// ============== BOUTONS CONTINUER / VOIR FORMATION (démo) ==============
document.addEventListener("click", (e) => {
  if (e.target.matches(".btn-continue, .btn-reco")) {
    const original = e.target.textContent;
    e.target.textContent = "Chargement...";
    setTimeout(() => { e.target.textContent = original; }, 1000);
  }
});

// ============== TELECHARGEMENT CERTIFICAT ==============
document.querySelector(".cert-download").addEventListener("click", function () {
  const original = this.textContent;
  this.textContent = "✓ Téléchargé";
  setTimeout(() => { this.textContent = original; }, 1200);
});

// ============== INIT ==============
renderContinueCourses();
renderRecoCourses();
renderCategories();
renderGoals();
