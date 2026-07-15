// ============== DONNÉES ==============
const jobs = [
  {
    id: 1, logo: "N", logoBg: "#000000", tag: "new", tagLabel: "Nouveau",
    title: "Product Designer UI/UX", verified: true,
    company: "Notion Labs", location: "Remote (Monde entier)",
    tags: ["Design", "Figma", "UI/UX", "Prototyping", "+2"],
    posted: "Publié il y a 2h",
    match: 92, salaryMin: 4000, salaryMax: 6000, currency: "$", period: "par mois",
    fav: true
  },
  {
    id: 2, logo: "🚗", logoBg: "#0a0a0a", tag: "new", tagLabel: "Nouveau",
    title: "Développeur Full Stack", verified: true,
    company: "BMW Group", location: "Munich, Allemagne · Remote",
    tags: ["React", "Node.js", "TypeScript", "MongoDB", "+2"],
    posted: "Publié il y a 4h",
    match: 88, salaryMin: 5500, salaryMax: 8000, currency: "€", period: "par mois",
    fav: true
  },
  {
    id: 3, logo: "🛍", logoBg: "#95c341", tag: "popular", tagLabel: "Populaire",
    title: "Chef de Projet Digital", verified: false,
    company: "Shopify", location: "Toronto, Canada · Hybride",
    tags: ["Gestion de projet", "Agile", "Scrum", "Jira", "+2"],
    posted: "Publié il y a 6h",
    match: 85, salaryMin: 3800, salaryMax: 6000, currency: "$", period: "par mois",
    fav: true
  },
  {
    id: 4, logo: "🧡", logoBg: "#ff7a59", tag: "new", tagLabel: "Nouveau",
    title: "Digital Marketing Specialist", verified: false,
    company: "HubSpot", location: "Dublin, Irlande · Remote",
    tags: ["SEO", "Google Ads", "Analytics", "Content Marketing", "+2"],
    posted: "Publié il y a 7h",
    match: 82, salaryMin: 3000, salaryMax: 4500, currency: "€", period: "par mois",
    fav: true
  },
  {
    id: 5, logo: "≡", logoBg: "#0ea5a4", tag: "", tagLabel: "",
    title: "Ingénieur Backend", verified: false,
    company: "Paystack", location: "Lagos, Nigeria · Hybride",
    tags: ["Python", "Django", "PostgreSQL", "AWS", "+2"],
    posted: "Publié il y a 1 jour",
    match: 78, salaryMin: 2500000, salaryMax: 3500000, currency: "₦", period: "par mois",
    fav: true
  }
];

let currentSort = "recentes";

// ============== RENDU LISTE ==============
function renderJobs() {
  const list = document.getElementById("jobList");

  let sorted = [...jobs];
  if (currentSort === "compat") {
    sorted.sort((a, b) => b.match - a.match);
  } else if (currentSort === "salaire") {
    sorted.sort((a, b) => b.salaryMax - a.salaryMax);
  }

  list.innerHTML = sorted.map(job => {
    const circumference = 2 * Math.PI * 18;
    const offset = circumference - (job.match / 100) * circumference;

    return `
      <div class="job" data-id="${job.id}">
        <div class="job-logo" style="background:${job.logoBg}">${job.logo}</div>
        <div class="job-info">
          ${job.tag ? `<span class="job-tag ${job.tag}">${job.tagLabel}</span>` : ""}
          <div class="job-title">${job.title} ${job.verified ? '<span class="verified-dot">✓</span>' : ""}</div>
          <div class="job-sub">${job.company} · 📍 ${job.location}</div>
          <div class="job-tags">${job.tags.map(t => `<span>${t}</span>`).join("")}</div>
          <div class="job-posted">🕐 ${job.posted}</div>
        </div>
        <div class="job-metrics">
          <div>
            <div class="job-match">
              <svg viewBox="0 0 44 44">
                <circle class="job-match-bg" cx="22" cy="22" r="18"></circle>
                <circle class="job-match-fg" cx="22" cy="22" r="18"
                  stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"></circle>
              </svg>
              <div class="job-match-num">${job.match}%</div>
            </div>
            <div class="job-match-label">Compatibilité</div>
          </div>
          <div class="job-price">${job.salaryMin.toLocaleString("fr-FR")} – ${job.salaryMax.toLocaleString("fr-FR")} ${job.currency}<span>${job.period}</span></div>
          <div class="job-actions">
            <button class="fav-heart ${job.fav ? "" : "unfav"}" data-id="${job.id}">${job.fav ? "♥" : "♡"}</button>
            <button class="job-menu">⋮</button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  document.querySelectorAll(".fav-heart").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      const job = jobs.find(j => j.id === id);
      job.fav = !job.fav;
      if (!job.fav) {
        // Retirer visuellement après un court délai
        const card = btn.closest(".job");
        card.style.opacity = "0.4";
        setTimeout(() => {
          jobs.splice(jobs.findIndex(j => j.id === id), 1);
          renderJobs();
          updateCount();
        }, 300);
      } else {
        renderJobs();
      }
    });
  });
}

function updateCount() {
  document.getElementById("resultCount").textContent = `${jobs.length} offres d'emploi`;
  const tabSpan = document.querySelector('.tab[data-tab="offres"] span');
  if (tabSpan) tabSpan.textContent = jobs.length;
}

// ============== TRI ==============
document.getElementById("sortSelect").addEventListener("change", (e) => {
  currentSort = e.target.value;
  renderJobs();
});

// ============== TABS ==============
document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
  });
});

// ============== EXPORT ==============
document.getElementById("exportBtn").addEventListener("click", () => {
  const btn = document.getElementById("exportBtn");
  const original = btn.textContent;
  btn.textContent = "⬆ Génération...";
  setTimeout(() => {
    btn.textContent = "✓ Exporté";
    setTimeout(() => { btn.textContent = original; }, 1200);
  }, 700);
});

// ============== CREER UNE LISTE ==============
document.getElementById("createListBtn").addEventListener("click", () => {
  const btn = document.getElementById("createListBtn");
  const original = btn.textContent;
  btn.textContent = "✓ Liste créée";
  setTimeout(() => { btn.textContent = original; }, 1200);
});

// ============== PAGINATION ==============
document.querySelectorAll(".page-num").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".page-num").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// ============== BOOST RING ==============
function renderBoostRing() {
  const ring = document.getElementById("boostRing");
  const value = 60;
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  ring.style.strokeDasharray = circumference;
  ring.style.strokeDashoffset = circumference;
  requestAnimationFrame(() => {
    setTimeout(() => {
      ring.style.transition = "stroke-dashoffset 1s ease";
      ring.style.strokeDashoffset = circumference - (value / 100) * circumference;
    }, 150);
  });
}

// ============== INIT ==============
renderJobs();
renderBoostRing();
