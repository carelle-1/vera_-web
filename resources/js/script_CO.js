// ============== DONNÉES ==============
const skills = [
  { icon: "🎨", title: "Design System", priority: "high", priorityLabel: "Priorité : Haute", value: 40 },
  { icon: "🧩", title: "Prototyping avancé", priority: "high", priorityLabel: "Priorité : Haute", value: 35 },
  { icon: "🔍", title: "User Research", priority: "medium", priorityLabel: "Priorité : Moyenne", value: 60 },
  { icon: "🧑‍🤝‍🧑", title: "Leadership", priority: "low", priorityLabel: "Priorité : Basse", value: 25 }
];

const formations = [
  { icon: "🎨", bg: "#f24e1e", title: "Design System avec Figma", level: "Intermédiaire", duration: "8h", rating: "4.8", reviews: 72 },
  { icon: "🧩", bg: "#6d28d9", title: "Prototyping avancé", level: "Intermédiaire", duration: "6h", rating: "4.7", reviews: 65 },
  { icon: "🔍", bg: "#0ea5e9", title: "User Research Méthodes", level: "Débutant", duration: "5h", rating: "4.6", reviews: 74 },
  { icon: "🧑‍🤝‍🧑", bg: "#16a34a", title: "Leadership & Soft Skills", level: "Débutant", duration: "4h", rating: "4.5", reviews: 63 }
];

const objectifs = [
  { icon: "🎯", bg: "#3b6bf5", title: "Obtenir un poste de Product Designer", date: "Échéance : Déc 2024", value: 35 },
  { icon: "💲", bg: "#16a34a", title: "Augmenter mon salaire de 30%", date: "Échéance : Mars 2025", value: 60 },
  { icon: "🎨", bg: "#8b5cf6", title: "Maîtriser Figma avancé", date: "Échéance : Jan 2025", value: 80 }
];

const timeline = [
  { title: "Product Designer Junior", status: "done", statusLabel: "Terminé", date: "Mai 2024" },
  { title: "Product Designer", status: "current", statusLabel: "En cours", date: "Déc 2024" },
  { title: "Product Designer Senior", status: "upcoming", statusLabel: "À venir", date: "Déc 2025" },
  { title: "Lead Product Designer", status: "upcoming", statusLabel: "À venir", date: "Déc 2026" }
];

// ============== RENDU SCORE RING ==============
function renderCareerRing() {
  const ring = document.getElementById("careerRing");
  const score = 78;
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  ring.style.strokeDasharray = circumference;
  ring.style.strokeDashoffset = circumference;
  requestAnimationFrame(() => {
    setTimeout(() => {
      ring.style.transition = "stroke-dashoffset 1.2s ease";
      ring.style.strokeDashoffset = circumference - (score / 100) * circumference;
    }, 150);
  });
}

// ============== RENDU COMPETENCES ==============
function renderSkills() {
  const grid = document.getElementById("skillsGrid");
  grid.innerHTML = skills.map((s, i) => `
    <div class="skill-card">
      <div class="skill-card-head">
        <div class="skill-card-icon">${s.icon}</div>
        <div>
          <div class="skill-card-title">${s.title}</div>
          <span class="skill-priority ${s.priority}">${s.priorityLabel}</span>
        </div>
      </div>
      <div class="skill-card-level">Votre niveau actuel</div>
      <div class="skill-card-bar"><div class="skill-card-fill" id="skillFill${i}"></div></div>
      <button class="btn-improve">Améliorer</button>
    </div>
  `).join("");

  requestAnimationFrame(() => {
    setTimeout(() => {
      skills.forEach((s, i) => {
        document.getElementById(`skillFill${i}`).style.width = s.value + "%";
      });
    }, 150);
  });
}

// ============== RENDU FORMATIONS ==============
function renderFormations() {
  const grid = document.getElementById("formationsGrid");
  grid.innerHTML = formations.map(f => `
    <div class="formation-card">
      <div class="formation-icon" style="background:${f.bg}">${f.icon}</div>
      <div class="formation-title">${f.title}</div>
      <span class="formation-level">${f.level}</span>
      <div class="formation-meta">${f.duration} · ⭐ ${f.rating} (${f.reviews})</div>
      <button class="btn-formation">Voir la formation</button>
    </div>
  `).join("");
}

// ============== RENDU OBJECTIFS ==============
function renderObjectifs() {
  const grid = document.getElementById("objectifsGrid");
  const radius = 18;
  const circumference = 2 * Math.PI * radius;

  grid.innerHTML = objectifs.map((o, i) => {
    const offset = circumference - (o.value / 100) * circumference;
    return `
      <div class="objectif-card">
        <div style="display:flex;align-items:center;gap:12px;min-width:0;">
          <div class="objectif-icon" style="background:${o.bg}">${o.icon}</div>
          <div style="min-width:0;">
            <div class="objectif-title">${o.title}</div>
            <div class="objectif-date">${o.date}</div>
          </div>
        </div>
        <div class="objectif-ring">
          <svg viewBox="0 0 44 44">
            <circle class="objectif-ring-bg" cx="22" cy="22" r="${radius}"></circle>
            <circle class="objectif-ring-fg" cx="22" cy="22" r="${radius}"
              stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"></circle>
          </svg>
          <div class="objectif-ring-num">${o.value}%</div>
        </div>
      </div>
    `;
  }).join("") + `
    <div class="add-objectif">
      <span class="plus">+</span>
      Ajouter un objectif
    </div>
  `;
}

// ============== RENDU TIMELINE ==============
function renderTimeline() {
  const list = document.getElementById("timelineList");
  list.innerHTML = timeline.map(t => `
    <li>
      <div class="timeline-dot ${t.status}">${t.status === "done" ? "✓" : ""}</div>
      <div class="timeline-content">
        <div class="timeline-title">${t.title}</div>
        <div class="timeline-row">
          <span class="timeline-status ${t.status}">${t.statusLabel}</span>
          <span class="timeline-date">${t.date}</span>
        </div>
      </div>
    </li>
  `).join("");
}

// ============== TABS ==============
const tabLabels = {
  plan: "Plan de carrière",
  skills: "Compétences",
  objectifs: "Objectifs",
  insights: "Analyses & Insights",
  conseils: "Conseils IA"
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
document.getElementById("coachBtn").addEventListener("click", () => {
  const btn = document.getElementById("coachBtn");
  const original = btn.textContent;
  btn.textContent = "Connexion au coach...";
  setTimeout(() => { btn.textContent = original; }, 1200);
});

// ============== BOUTONS INTERACTIFS (démo) ==============
document.addEventListener("click", (e) => {
  if (e.target.matches(".btn-improve, .btn-formation")) {
    const original = e.target.textContent;
    e.target.textContent = "✓ Ajouté";
    setTimeout(() => { e.target.textContent = original; }, 1200);
  }
});

// ============== INIT ==============
renderCareerRing();
renderSkills();
renderFormations();
renderObjectifs();
renderTimeline();
