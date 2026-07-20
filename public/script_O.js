// ============== DONNÉES ==============
const jobs = [
  {
    id: 1,
    logo: "N", logoBg: "#000000",
    title: "Product Designer UI/UX",
    company: "Notion Labs",
    location: "Remote",
    locationTag: "Remote",
    posted: "2j",
    salaryMin: 4000, salaryMax: 6000, period: "par mois",
    tags: ["Figma", "Design System", "+2"],
    match: 96,
    matchReasons: [
      "Tes compétences Figma correspondent à 95% aux besoins",
      "Ton expérience en Design System est directement recherchée",
      "Ta disponibilité correspond au mode de travail Remote"
    ],
    skills: [{ name: "Design System", value: 72 }]
  },
  {
    id: 2,
    logo: "∞", logoBg: "#0866ff",
    title: "Développeur Full Stack",
    company: "Meta",
    location: "Remote",
    locationTag: "Remote",
    posted: "1j",
    salaryMin: 5500, salaryMax: 8000, period: "par mois",
    tags: ["React", "Node.js", "+3"],
    match: 92,
    matchReasons: [
      "Ta stack React / Node.js correspond exactement à l'offre",
      "Ton niveau d'expérience correspond au poste",
      "Le mode Remote correspond à ta préférence"
    ],
    skills: [{ name: "TypeScript", value: 58 }]
  },
  {
    id: 3,
    logo: "🛒", logoBg: "#22c55e",
    title: "Chef de Projet Digital",
    company: "ShopMax",
    location: "Hybride",
    locationTag: "Hybride",
    posted: "3j",
    salaryMin: 3500, salaryMax: 5000, period: "par mois",
    tags: ["Agile", "Scrum", "+1"],
    match: 88,
    matchReasons: [
      "Ton expérience en gestion Agile correspond au besoin",
      "Ta localisation permet le mode Hybride",
      "Ton profil correspond au niveau intermédiaire requis"
    ],
    skills: [{ name: "Scrum Master", value: 64 }]
  },
  {
    id: 4,
    logo: "H", logoBg: "#ff7a59",
    title: "Digital Marketing Specialist",
    company: "HubSpot",
    location: "Sur site",
    locationTag: "Sur site",
    posted: "5j",
    salaryMin: 3000, salaryMax: 4500, period: "par mois",
    tags: ["SEO", "Google Ads", "+2"],
    match: 81,
    matchReasons: [
      "Tes compétences SEO correspondent à la mission",
      "Ton expérience en Google Ads est un atout apprécié",
      "Le salaire correspond à tes attentes"
    ],
    skills: [{ name: "Analytics avancé", value: 45 }]
  }
];

let selectedJobId = jobs[0].id;
let currentSort = "pertinence";

// ============== RENDU LISTE ==============
function renderJobs() {
  const list = document.getElementById("jobList");
  list.innerHTML = "";

  let sorted = [...jobs];
  if (currentSort === "recent") {
    sorted.sort((a, b) => parseInt(a.posted) - parseInt(b.posted));
  } else if (currentSort === "salaire") {
    sorted.sort((a, b) => b.salaryMax - a.salaryMax);
  } else {
    sorted.sort((a, b) => b.match - a.match);
  }

  sorted.forEach(job => {
    const el = document.createElement("article");
    el.className = "job" + (job.id === selectedJobId ? " selected" : "");
    el.dataset.id = job.id;

    const circumference = 2 * Math.PI * 16;
    const offset = circumference - (job.match / 100) * circumference;

    el.innerHTML = `
      <div class="job-logo" style="background:${job.logoBg}">${job.logo}</div>
      <div class="job-info">
        <div class="job-title">${job.title}</div>
        <div class="job-sub">${job.company} · <span class="tag">${job.locationTag}</span></div>
        <div class="job-tags">${job.tags.map(t => `<span>${t}</span>`).join("")}</div>
      </div>
      <div class="job-right">
        <div class="job-match" title="${job.match}% compatible">
          <svg viewBox="0 0 36 36">
            <circle class="job-match-bg" cx="18" cy="18" r="16"></circle>
            <circle class="job-match-fg" cx="18" cy="18" r="16"
              stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"></circle>
          </svg>
          <div class="job-match-num">${job.match}%</div>
        </div>
        <div class="job-price">${job.salaryMin.toLocaleString("fr-FR")} – ${job.salaryMax.toLocaleString("fr-FR")} $<span>${job.period}</span></div>
        <div class="job-meta">🕐 il y a ${job.posted}</div>
      </div>
    `;
    el.addEventListener("click", () => {
      selectedJobId = job.id;
      renderJobs();
      renderDetail();
    });
    list.appendChild(el);
  });

  document.getElementById("resultCount").textContent = `${sorted.length === jobs.length ? "247" : sorted.length} offres trouvées`;
}

// ============== RENDU PANNEAU DÉTAIL ==============
function renderDetail() {
  const job = jobs.find(j => j.id === selectedJobId);
  const panel = document.getElementById("detailPanel");
  if (!job) { panel.innerHTML = ""; return; }

  panel.innerHTML = `
    <div class="detail-match">${job.match}% Compatible</div>
    <div class="detail-logo" style="background:${job.logoBg}">${job.logo}</div>
    <div class="detail-title">${job.title}</div>
    <div class="detail-sub">${job.company} · ${job.location}</div>
    <div class="detail-price">${job.salaryMin.toLocaleString("fr-FR")} – ${job.salaryMax.toLocaleString("fr-FR")} $<span>${job.period}</span></div>

    <div class="detail-actions">
      <button class="btn-primary">Voir détails</button>
      <button class="btn-icon-outline">🔖</button>
    </div>

    <div class="detail-section">
      <div class="detail-section-title">Pourquoi cette offre te correspond</div>
      <ul class="match-list">
        ${job.matchReasons.map(r => `<li>${r}</li>`).join("")}
      </ul>
    </div>

    <div class="detail-section">
      <div class="detail-section-title">Compétences à améliorer</div>
      ${job.skills.map(s => `
        <div class="skill-row">
          <div class="skill-label"><span>${s.name}</span><span>${s.value}%</span></div>
          <div class="skill-bar"><div class="skill-bar-fill" style="width:${s.value}%"></div></div>
        </div>
      `).join("")}
    </div>
  `;
}

// ============== TABS ==============
const switchablePanels = {
  filtres: document.getElementById("panelFiltres"),
  toutes: document.getElementById("panelToutes"),
  entreprises: document.getElementById("panelEntreprises"),
  reco: document.getElementById("panelReco")
};
const oppLayout = document.querySelector(".opp-layout");

document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    const key = tab.dataset.tab;
    if (!key || !switchablePanels[key]) return;

    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    Object.keys(switchablePanels).forEach(k => {
      if (switchablePanels[k]) {
        if (k === key) {
          switchablePanels[k].classList.add("active");
        } else {
          switchablePanels[k].classList.remove("active");
        }
      }
    });

    if (oppLayout) {
      if (key === "filtres") {
        oppLayout.classList.add("with-filters");
      } else {
        oppLayout.classList.remove("with-filters");
      }
    }
  });
});

// ============== TRI ==============
document.getElementById("sortSelect").addEventListener("change", (e) => {
  currentSort = e.target.value;
  renderJobs();
});

// ============== FILTRES ==============
document.getElementById("resetFilters").addEventListener("click", () => {
  document.querySelectorAll(".filters-panel input[type=checkbox]").forEach(cb => cb.checked = false);
  document.querySelectorAll(".filters-panel input[type=text]").forEach(inp => inp.value = "");
  document.getElementById("salaryRange").value = 0;
  document.getElementById("salaryValue").textContent = "0 $";
});

const salaryRange = document.getElementById("salaryRange");
salaryRange.addEventListener("input", (e) => {
  document.getElementById("salaryValue").textContent = `${parseInt(e.target.value).toLocaleString("fr-FR")} $`;
});

// ============== PAGINATION ==============
document.getElementById("pagination").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  if (btn.classList.contains("page-num")) {
    document.querySelectorAll(".page-num").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelector(".job-list-panel").scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

// ============== RAFRAÎCHIR ==============
document.getElementById("refreshBtn").addEventListener("click", () => {
  const btn = document.getElementById("refreshBtn");
  btn.textContent = "⟳ Actualisation...";
  setTimeout(() => {
    btn.textContent = "⟳ Rafraîchir les offres";
    renderJobs();
  }, 700);
});

// ============== INIT ==============
if (oppLayout) {
  const activeTab = document.querySelector(".tab.active");
  if (activeTab && activeTab.dataset.tab === "filtres") {
    oppLayout.classList.add("with-filters");
  }
}

renderJobs();
renderDetail();
