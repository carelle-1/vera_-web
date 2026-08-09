// ============== DONNÉES KPI ==============
const kpis = [
  { icon: "💼", iconBg: "#eaf8ff", label: "Offres actives", value: "6", trend: "+2", up: true,
    spark: [3,4,3,5,4,5,6], color: "#0ea5e9" },
  { icon: "📄", iconBg: "#ecfdf5", label: "Candidatures reçues", value: "18", trend: "+34%", up: true,
    spark: [4,6,5,8,10,14,18], color: "#22c55e" },
  { icon: "👁", iconBg: "#f3ecff", label: "Vues du profil entreprise", value: "1 240", trend: "+12%", up: true,
    spark: [800,850,900,980,1050,1150,1240], color: "#8b5cf6" },
  { icon: "⚡", iconBg: "#fdf1de", label: "Taux de réponse", value: "76%", trend: "-4%", up: false,
    spark: [85,83,80,79,78,77,76], color: "#f59e0b" }
];

function renderKPIs() {
  const grid = document.getElementById("kpiGrid");
  grid.innerHTML = kpis.map(k => {
    const max = Math.max(...k.spark), min = Math.min(...k.spark);
    const points = k.spark.map((v, i) => {
      const x = (i / (k.spark.length - 1)) * 100;
      const y = 30 - ((v - min) / (max - min || 1)) * 28;
      return `${x},${y}`;
    }).join(" ");
    return `
      <div class="kpi-card">
        <div class="kpi-top">
          <div class="kpi-icon" style="background:${k.iconBg}">${k.icon}</div>
          <span class="kpi-trend ${k.up ? "up" : "down"}">${k.up ? "↗" : "↘"} ${k.trend}</span>
        </div>
        <div class="kpi-value">${k.value}</div>
        <div class="kpi-label">${k.label}</div>
        <svg class="kpi-spark" viewBox="0 0 100 32" preserveAspectRatio="none">
          <polyline points="${points}" stroke="${k.color}"></polyline>
        </svg>
      </div>
    `;
  }).join("");
}

// ============== GRAPHIQUE CANDIDATURES ==============
const appsData = {
  labels: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
  applications: [2, 4, 3, 6, 5, 8, 18],
  views: [40, 55, 48, 70, 65, 90, 120]
};

function renderAppsChart() {
  const svg = document.getElementById("appsChart");
  const w = 640, h = 200, pad = 20;
  const maxVal = Math.max(...appsData.views);

  function toPoints(arr) {
    return arr.map((v, i) => {
      const x = pad + (i / (arr.length - 1)) * (w - pad * 2);
      const y = h - pad - (v / maxVal) * (h - pad * 2);
      return `${x},${y}`;
    }).join(" ");
  }

  const appPoints = toPoints(appsData.applications.map(v => v * 6)); // scale for visibility
  const viewPoints = toPoints(appsData.views);

  let gridLines = "";
  for (let i = 0; i <= 4; i++) {
    const y = pad + (i / 4) * (h - pad * 2);
    gridLines += `<line x1="${pad}" y1="${y}" x2="${w - pad}" y2="${y}" stroke="#eef4f5" stroke-width="1"/>`;
  }

  svg.innerHTML = `
    ${gridLines}
    <polyline points="${viewPoints}" fill="none" stroke="#22c55e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <polyline points="${appPoints}" fill="none" stroke="#0ea5e9" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <polygon points="${pad},${h-pad} ${appPoints} ${w-pad},${h-pad}" fill="#0ea5e9" opacity="0.12"/>
  `;

  document.getElementById("appsLabels").innerHTML = appsData.labels.map(l => `<span>${l}</span>`).join("");
}

// ============== DONUT SOURCES ==============
const sourceData = [
  { label: "Recherche VERA", color: "#0ea5e9", value: 8 },
  { label: "Recommandé par IA", color: "#22c55e", value: 5 },
  { label: "Candidature directe", color: "#8b5cf6", value: 3 },
  { label: "Réseau / Partage", color: "#f59e0b", value: 2 }
];

function renderSourceDonut() {
  const svg = document.getElementById("sourceDonut");
  const legend = document.getElementById("sourceLegend");
  const total = sourceData.reduce((s, d) => s + d.value, 0);
  document.getElementById("donutTotalSource").textContent = total;

  const radius = 50, circumference = 2 * Math.PI * radius;
  let offsetAcc = 0;
  svg.innerHTML = `<circle cx="60" cy="60" r="${radius}" fill="none" stroke="#eef4f5" stroke-width="14"></circle>`;
  sourceData.forEach(d => {
    const dash = (d.value / total) * circumference;
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", "60"); circle.setAttribute("cy", "60"); circle.setAttribute("r", radius);
    circle.setAttribute("fill", "none"); circle.setAttribute("stroke", d.color); circle.setAttribute("stroke-width", "14");
    circle.setAttribute("stroke-dasharray", `${dash} ${circumference - dash}`);
    circle.setAttribute("stroke-dashoffset", -offsetAcc);
    svg.appendChild(circle);
    offsetAcc += dash;
  });

  legend.innerHTML = sourceData.map(d => `
    <li><span class="dot" style="background:${d.color}"></span>${d.label}<span class="count">${d.value}</span></li>
  `).join("");
}

// ============== OFFRES PUBLIEES ==============
const jobs = [
  { title: "Product Designer UI/UX", sub: "Design · Remote", status: "active", views: 342, apps: 8, match: "92%", date: "05 Jul 2026" },
  { title: "Développeur Full Stack", sub: "Engineering · Hybride", status: "active", views: 210, apps: 5, match: "88%", date: "02 Jul 2026" },
  { title: "Chef de Projet Digital", sub: "Produit · Sur site", status: "paused", views: 98, apps: 2, match: "80%", date: "28 Jun 2026" },
  { title: "Digital Marketing Specialist", sub: "Marketing · Remote", status: "active", views: 156, apps: 3, match: "85%", date: "24 Jun 2026" },
  { title: "Ingénieur Backend", sub: "Engineering · Hybride", status: "closed", views: 420, apps: 12, match: "90%", date: "10 Jun 2026" }
];

function renderJobsTable() {
  const tbody = document.getElementById("jobsTableBody");
  const statusLabels = { active: "Active", paused: "En pause", closed: "Clôturée" };

  tbody.innerHTML = jobs.map((j, i) => `
    <tr>
      <td><div class="job-title-cell">${j.title}</div><div class="job-sub-cell">${j.sub}</div></td>
      <td><button class="status-toggle ${j.status}" data-index="${i}">${statusLabels[j.status]}</button></td>
      <td>${j.views}</td>
      <td>${j.apps}</td>
      <td><span class="match-pill">${j.match}</span></td>
      <td>${j.date}</td>
      <td><button class="job-action-btn">⋮</button></td>
    </tr>
  `).join("");

  tbody.querySelectorAll(".status-toggle").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.index);
      const order = ["active", "paused", "closed"];
      const next = order[(order.indexOf(jobs[idx].status) + 1) % order.length];
      jobs[idx].status = next;
      renderJobsTable();
    });
  });
}

// ============== CANDIDATS RECENTS ==============
const candidates = [
  { name: "Sarah Mensah", role: "UI/UX Designer", job: "Product Designer UI/UX", avatar: "https://i.pravatar.cc/64?img=5", match: "96%" },
  { name: "Kevin Assamoi", role: "Développeur Full Stack", job: "Développeur Full Stack", avatar: "https://i.pravatar.cc/64?img=8", match: "91%" },
  { name: "Fatou Diallo", role: "Chef de Projet", job: "Chef de Projet Digital", avatar: "https://i.pravatar.cc/64?img=9", match: "84%" },
  { name: "Junior Tchouaka", role: "Product Designer", job: "Product Designer UI/UX", avatar: "https://i.pravatar.cc/64?img=13", match: "89%" }
];

function renderCandidates() {
  document.getElementById("candidatesList").innerHTML = candidates.map((c, i) => `
    <div class="candidate-item" data-index="${i}">
      <img src="${c.avatar}" alt="${c.name}">
      <div class="candidate-info">
        <div class="candidate-name">${c.name}</div>
        <div class="candidate-role">${c.role}</div>
        <div class="candidate-job">Postule à : ${c.job}</div>
      </div>
      <span class="candidate-match">${c.match}</span>
      <div class="candidate-actions">
        <button class="cand-btn accept" data-action="accept" data-index="${i}" title="Accepter">✓</button>
        <button class="cand-btn reject" data-action="reject" data-index="${i}" title="Refuser">✕</button>
      </div>
    </div>
  `).join("");

  document.querySelectorAll(".cand-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.index);
      const item = btn.closest(".candidate-item");
      item.style.opacity = "0.4";
      setTimeout(() => {
        candidates.splice(idx, 1);
        renderCandidates();
      }, 300);
    });
  });
}

// ============== TALENTS RECOMMANDÉS ==============
const talents = [
  { name: "Aïcha Traoré", role: "Senior Product Designer", avatar: "https://i.pravatar.cc/64?img=20", match: "95%" },
  { name: "Marc Ouedraogo", role: "Full Stack Engineer", avatar: "https://i.pravatar.cc/64?img=17", match: "91%" },
  { name: "Léa Fontaine", role: "UX Researcher", avatar: "https://i.pravatar.cc/64?img=25", match: "88%" }
];

function renderTalents() {
  document.getElementById("talentsList").innerHTML = talents.map(t => `
    <div class="talent-item">
      <img src="${t.avatar}" alt="${t.name}">
      <div>
        <div class="talent-name">${t.name}</div>
        <div class="talent-role">${t.role}</div>
      </div>
      <span class="talent-match">${t.match}</span>
    </div>
  `).join("");
}

// ============== ENTRETIENS ==============
const interviews = [
  { day: "14", month: "Jul", name: "Sarah Mensah", role: "Product Designer UI/UX", time: "10:00 - Visio" },
  { day: "15", month: "Jul", name: "Kevin Assamoi", role: "Développeur Full Stack", time: "14:30 - Bureau" },
  { day: "17", month: "Jul", name: "Fatou Diallo", role: "Chef de Projet Digital", time: "09:00 - Visio" }
];

function renderInterviews() {
  document.getElementById("interviewsList").innerHTML = interviews.map(i => `
    <div class="interview-item">
      <div class="interview-date"><div class="day">${i.day}</div><div class="month">${i.month}</div></div>
      <div class="interview-info">
        <div class="interview-name">${i.name}</div>
        <div class="interview-role">${i.role}</div>
        <div class="interview-time">🕐 ${i.time}</div>
      </div>
    </div>
  `).join("");
}

// ============== NAVIGATION SIDEBAR ==============
const panelTitles = {
  offres: "Gestion des offres publiées",
  candidatures: "Toutes les candidatures",
  talents: "Talents recommandés par VERA",
  entretiens: "Planning des entretiens",
  messages: "Messagerie",
  statistiques: "Statistiques détaillées",
  facturation: "Facturation & abonnement",
  parametres: "Paramètres de l'entreprise"
};

function goToPanel(panel) {
  document.querySelectorAll(".nav-item").forEach(i => i.classList.toggle("active", i.dataset.panel === panel));
  document.getElementById("panel-dashboard").classList.toggle("active", panel === "dashboard");
  document.getElementById("panel-placeholder").classList.toggle("active", panel !== "dashboard");
  if (panel !== "dashboard") {
    document.getElementById("placeholderTitle").textContent = panelTitles[panel] || "Section en construction";
  }
}

document.querySelectorAll(".nav-item").forEach(item => {
  item.addEventListener("click", () => goToPanel(item.dataset.panel));
});
document.querySelectorAll("[data-panel-link]").forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    goToPanel(link.dataset.panelLink);
  });
});

// ============== MODAL PUBLIER OFFRE ==============
const modalOverlay = document.getElementById("modalOverlay");
document.getElementById("publishBtn").addEventListener("click", () => {
  modalOverlay.classList.add("open");
});
document.getElementById("modalClose").addEventListener("click", () => {
  modalOverlay.classList.remove("open");
});
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) modalOverlay.classList.remove("open");
});

document.getElementById("publishForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const title = document.getElementById("jobTitleInput").value.trim() || "Nouvelle offre";
  jobs.unshift({ title, sub: "Nouveau · Remote", status: "active", views: 0, apps: 0, match: "—", date: "Aujourd'hui" });
  renderJobsTable();
  modalOverlay.classList.remove("open");
  document.getElementById("publishForm").reset();
});

// ============== INIT ==============
renderKPIs();
renderAppsChart();
renderSourceDonut();
renderJobsTable();
renderCandidates();
renderTalents();
renderInterviews();
