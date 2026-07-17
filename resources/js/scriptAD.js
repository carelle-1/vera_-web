// ============== DONNÉES KPI ==============
const kpis = [
  {
    icon: "👥", iconBg: "#eaf8ff", label: "Utilisateurs actifs", value: "4 218", trend: "+12.4%", up: true,
    spark: [40, 45, 42, 50, 55, 52, 60, 65, 62, 70, 75, 80], color: "#0ea5e9"
  },
  {
    icon: "🏢", iconBg: "#ecfdf5", label: "Entreprises partenaires", value: "312", trend: "+5.1%", up: true,
    spark: [30, 32, 31, 35, 34, 38, 40, 39, 42, 45, 44, 48], color: "#22c55e"
  },
  {
    icon: "💼", iconBg: "#f3ecff", label: "Offres publiées", value: "1 546", trend: "+8.7%", up: true,
    spark: [50, 48, 55, 60, 58, 65, 63, 70, 68, 75, 78, 82], color: "#8b5cf6"
  },
  {
    icon: "💰", iconBg: "#fdf1de", label: "Revenus (mois)", value: "48 200 $", trend: "-2.3%", up: false,
    spark: [70, 68, 72, 65, 60, 62, 58, 55, 57, 53, 50, 48], color: "#f59e0b"
  }
];

function renderKPIs() {
  const grid = document.getElementById("kpiGrid");
  grid.innerHTML = kpis.map(k => {
    const max = Math.max(...k.spark);
    const min = Math.min(...k.spark);
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

// ============== GRAPHIQUE DE CROISSANCE ==============
const growthData = {
  labels: ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul"],
  users: [1200, 1450, 1600, 2100, 2600, 3400, 4218],
  offers: [400, 520, 610, 780, 950, 1250, 1546]
};

function renderGrowthChart() {
  const svg = document.getElementById("growthChart");
  const w = 640, h = 220, pad = 20;
  const maxVal = Math.max(...growthData.users);

  function toPoints(arr) {
    return arr.map((v, i) => {
      const x = pad + (i / (arr.length - 1)) * (w - pad * 2);
      const y = h - pad - (v / maxVal) * (h - pad * 2);
      return `${x},${y}`;
    }).join(" ");
  }

  const userPoints = toPoints(growthData.users);
  const offerPoints = toPoints(growthData.offers);

  // Grid lines
  let gridLines = "";
  for (let i = 0; i <= 4; i++) {
    const y = pad + (i / 4) * (h - pad * 2);
    gridLines += `<line x1="${pad}" y1="${y}" x2="${w - pad}" y2="${y}" stroke="#eef4f5" stroke-width="1"/>`;
  }

  svg.innerHTML = `
    ${gridLines}
    <polyline points="${userPoints}" fill="none" stroke="#0ea5e9" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <polyline points="${offerPoints}" fill="none" stroke="#22c55e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <polygon points="${pad},${h-pad} ${userPoints} ${w-pad},${h-pad}" fill="url(#skyGradient)" opacity="0.15"/>
    <defs>
      <linearGradient id="skyGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0ea5e9"/>
        <stop offset="100%" stop-color="#0ea5e9" stop-opacity="0"/>
      </linearGradient>
    </defs>
  `;

  document.getElementById("growthLabels").innerHTML = growthData.labels.map(l => `<span>${l}</span>`).join("");
}

// ============== DONUT CATEGORIES ==============
const categoryData = [
  { label: "Tech & Dev", color: "#0ea5e9", value: 620 },
  { label: "Design & UX", color: "#22c55e", value: 340 },
  { label: "Marketing", color: "#8b5cf6", value: 280 },
  { label: "Business", color: "#f59e0b", value: 306 }
];

function renderCategoryDonut() {
  const svg = document.getElementById("categoryDonut");
  const legend = document.getElementById("categoryLegend");
  const total = categoryData.reduce((s, d) => s + d.value, 0);
  document.getElementById("donutTotalCat").textContent = total.toLocaleString("fr-FR");

  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  let offsetAcc = 0;

  svg.innerHTML = `<circle cx="60" cy="60" r="${radius}" fill="none" stroke="#eef4f5" stroke-width="14"></circle>`;
  categoryData.forEach(d => {
    const fraction = d.value / total;
    const dash = fraction * circumference;
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", "60");
    circle.setAttribute("cy", "60");
    circle.setAttribute("r", radius);
    circle.setAttribute("fill", "none");
    circle.setAttribute("stroke", d.color);
    circle.setAttribute("stroke-width", "14");
    circle.setAttribute("stroke-dasharray", `${dash} ${circumference - dash}`);
    circle.setAttribute("stroke-dashoffset", -offsetAcc);
    svg.appendChild(circle);
    offsetAcc += dash;
  });

  legend.innerHTML = categoryData.map(d => `
    <li><span class="dot" style="background:${d.color}"></span>${d.label}<span class="count">${d.value}</span></li>
  `).join("");
}

// ============== TABLE UTILISATEURS ==============
const users = [
  { name: "Sarah Mensah", email: "sarah.mensah@email.com", avatar: "https://i.pravatar.cc/64?img=5", role: "Candidat", roleClass: "", date: "12 Jul 2026", status: "actif" },
  { name: "Notion Labs", email: "contact@notionlabs.com", avatar: "https://i.pravatar.cc/64?img=15", role: "Entreprise", roleClass: "entreprise", date: "11 Jul 2026", status: "actif" },
  { name: "Kevin Assamoi", email: "kevin.assamoi@email.com", avatar: "https://i.pravatar.cc/64?img=8", role: "Candidat", roleClass: "", date: "11 Jul 2026", status: "attente" },
  { name: "TechNova Solutions", email: "rh@technova.com", avatar: "https://i.pravatar.cc/64?img=22", role: "Entreprise", roleClass: "entreprise", date: "10 Jul 2026", status: "actif" },
  { name: "Fatou Diallo", email: "fatou.diallo@email.com", avatar: "https://i.pravatar.cc/64?img=9", role: "Candidat", roleClass: "", date: "09 Jul 2026", status: "suspendu" },
  { name: "Junior Tchouaka", email: "junior.bonjour@email.com", avatar: "https://i.pravatar.cc/64?img=13", role: "Candidat", roleClass: "", date: "08 Jul 2026", status: "actif" }
];

let currentFilter = "all";
let currentSearch = "";

function renderUserTable() {
  const tbody = document.getElementById("userTableBody");

  const filtered = users.filter(u => {
    const statusOk = currentFilter === "all" || u.status === currentFilter;
    const searchOk = (u.name + " " + u.email).toLowerCase().includes(currentSearch.toLowerCase());
    return statusOk && searchOk;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:24px;">Aucun utilisateur trouvé.</td></tr>`;
    document.getElementById("tableCount").textContent = "0 résultat";
    return;
  }

  const statusLabels = { actif: "Actif", attente: "En attente", suspendu: "Suspendu" };

  tbody.innerHTML = filtered.map((u, i) => `
    <tr>
      <td>
        <div class="user-cell">
          <img src="${u.avatar}" alt="${u.name}">
          <div>
            <div class="user-cell-name">${u.name}</div>
            <div class="user-cell-email">${u.email}</div>
          </div>
        </div>
      </td>
      <td><span class="role-badge ${u.roleClass}">${u.role}</span></td>
      <td>${u.date}</td>
      <td><span class="status-badge ${u.status}">${statusLabels[u.status]}</span></td>
      <td>
        <div class="row-menu">
          <button class="row-menu-btn" data-index="${i}">⋮</button>
          <div class="row-dropdown" id="dropdown-${i}">
            <button data-action="view" data-index="${i}">Voir le profil</button>
            <button data-action="toggle" data-index="${i}">${u.status === "suspendu" ? "Réactiver" : "Suspendre"}</button>
            <button data-action="delete" data-index="${i}" class="danger">Supprimer</button>
          </div>
        </div>
      </td>
    </tr>
  `).join("");

  document.getElementById("tableCount").textContent = `Affichage de ${filtered.length} sur 4 218 utilisateurs`;

  // Dropdown toggles
  tbody.querySelectorAll(".row-menu-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const dropdown = document.getElementById(`dropdown-${btn.dataset.index}`);
      document.querySelectorAll(".row-dropdown").forEach(d => { if (d !== dropdown) d.classList.remove("open"); });
      dropdown.classList.toggle("open");
    });
  });

  tbody.querySelectorAll("[data-action]").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.index);
      const user = filtered[idx];
      const action = btn.dataset.action;
      if (action === "toggle") {
        const realUser = users.find(u => u.email === user.email);
        realUser.status = realUser.status === "suspendu" ? "actif" : "suspendu";
        renderUserTable();
      } else if (action === "delete") {
        if (confirm(`Supprimer ${user.name} ? Cette action est irréversible.`)) {
          const realIdx = users.findIndex(u => u.email === user.email);
          users.splice(realIdx, 1);
          renderUserTable();
        }
      } else {
        alert(`Affichage du profil de ${user.name} (démo).`);
      }
      document.querySelectorAll(".row-dropdown").forEach(d => d.classList.remove("open"));
    });
  });
}

document.addEventListener("click", () => {
  document.querySelectorAll(".row-dropdown").forEach(d => d.classList.remove("open"));
});

document.getElementById("userSearch").addEventListener("input", (e) => {
  currentSearch = e.target.value;
  renderUserTable();
});
document.getElementById("userFilter").addEventListener("change", (e) => {
  currentFilter = e.target.value;
  renderUserTable();
});

// ============== ACTIVITE RECENTE ==============
const activities = [
  { color: "#0ea5e9", text: "<strong>Sarah Mensah</strong> a créé un compte candidat.", time: "Il y a 12 min" },
  { color: "#22c55e", text: "<strong>Notion Labs</strong> a publié une nouvelle offre.", time: "Il y a 34 min" },
  { color: "#f59e0b", text: "<strong>7 signalements</strong> en attente de modération.", time: "Il y a 1h" },
  { color: "#8b5cf6", text: "<strong>TechNova Solutions</strong> a souscrit au plan Premium.", time: "Il y a 2h" },
  { color: "#ef4444", text: "<strong>Fatou Diallo</strong> a été suspendue (non-respect des règles).", time: "Il y a 3h" }
];

function renderActivity() {
  document.getElementById("activityList").innerHTML = activities.map(a => `
    <div class="activity-item">
      <span class="activity-dot" style="background:${a.color}"></span>
      <div>
        <div class="activity-text">${a.text}</div>
        <div class="activity-time">${a.time}</div>
      </div>
    </div>
  `).join("");
}

// ============== NAVIGATION SIDEBAR ==============
const panelTitles = {
  utilisateurs: "Gestion des utilisateurs",
  entreprises: "Gestion des entreprises",
  offres: "Gestion des offres d'emploi",
  candidatures: "Suivi des candidatures",
  formations: "Gestion des formations",
  moderation: "File de modération",
  paiements: "Paiements & abonnements",
  rapports: "Rapports & analyses",
  parametres: "Paramètres de la plateforme"
};

document.querySelectorAll(".nav-item").forEach(item => {
  item.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));
    item.classList.add("active");

    const panel = item.dataset.panel;
    document.getElementById("panel-dashboard").classList.toggle("active", panel === "dashboard");
    document.getElementById("panel-placeholder").classList.toggle("active", panel !== "dashboard");

    if (panel !== "dashboard") {
      document.getElementById("placeholderTitle").textContent = panelTitles[panel] || "Section en construction";
    }
  });
});

// ============== EXPORT ==============
document.querySelector(".btn-primary").addEventListener("click", function () {
  const original = this.textContent;
  this.textContent = "⬇ Génération...";
  setTimeout(() => {
    this.textContent = "✓ Rapport exporté";
    setTimeout(() => { this.textContent = original; }, 1200);
  }, 700);
});

// ============== INIT ==============
renderKPIs();
renderGrowthChart();
renderCategoryDonut();
renderUserTable();
renderActivity();
