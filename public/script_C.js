// ============== DONNÉES ==============
const candidatures = [
  {
    id: 1, logo: "S", logoBg: "#1db954",
    title: "Product Designer UI/UX", company: "Spotify",
    status: "recommended", statusLabel: "VERA Recommandé",
    date: "Il y a 2j"
  },
  {
    id: 2, logo: "G", logoBg: "#4285f4",
    title: "UX Researcher", company: "Google",
    status: "sent", statusLabel: "Candidature envoyée",
    date: "Il y a 3j"
  },
  {
    id: 3, logo: "S", logoBg: "#00a1e0",
    title: "Product Marketing Manager", company: "Salesforce",
    status: "interview", statusLabel: "Entretien planifié",
    date: "Il y a 4j"
  },
  {
    id: 4, logo: "C", logoBg: "#7c3aed",
    title: "Digital Marketing Specialist", company: "Canva",
    status: "response", statusLabel: "Réponse reçue",
    date: "Il y a 5j"
  },
  {
    id: 5, logo: "N", logoBg: "#000000",
    title: "Content Writer", company: "Notion",
    status: "pending", statusLabel: "En attente",
    date: "Il y a 6j"
  },
  {
    id: 6, logo: "F", logoBg: "#0866ff",
    title: "Community Manager", company: "Meta",
    status: "sent", statusLabel: "Candidature envoyée",
    date: "Il y a 1sem"
  }
];

const statusClass = {
  recommended: "status-recommended",
  sent: "status-sent",
  interview: "status-interview",
  response: "status-response",
  pending: "status-pending"
};

const legendData = [
  { label: "Entretiens", color: "#8b5cf6", value: 4 },
  { label: "Réponses", color: "#16a34a", value: 3 },
  { label: "Envoyées", color: "#3b6bf5", value: 8 },
  { label: "En attente", color: "#f59e0b", value: 2 }
];

let currentStatus = "all";
let currentSearch = "";

// ============== RENDU LISTE ==============
function renderList() {
  const list = document.getElementById("candList");
  list.innerHTML = "";

  const statusMap = {
    all: null,
    new: "sent",
    response: "response",
    offer: "recommended",
    interview: "interview",
    confirmed: "pending"
  };

  let filtered = candidatures.filter(c => {
    const statusOk = currentStatus === "all" || c.status === statusMap[currentStatus];
    const searchOk = (c.title + " " + c.company).toLowerCase().includes(currentSearch.toLowerCase());
    return statusOk && searchOk;
  });

  if (filtered.length === 0) {
    list.innerHTML = `<div class="empty-state">Aucune candidature ne correspond à ta recherche.</div>`;
    return;
  }

  filtered.forEach(c => {
    const row = document.createElement("article");
    row.className = "cand-row";
    row.innerHTML = `
      <div class="cand-logo" style="background:${c.logoBg}">${c.logo}</div>
      <div class="cand-info">
        <div class="cand-title">${c.title}</div>
        <div class="cand-company">${c.company}</div>
      </div>
      <span class="cand-status ${statusClass[c.status]}">${c.statusLabel}</span>
      <span class="cand-date">${c.date}</span>
      <button class="btn-primary-sm">Voir détails</button>
    `;
    list.appendChild(row);
  });
}

// ============== TABS ==============
document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    currentStatus = tab.dataset.status;
    renderList();
  });
});

// ============== RECHERCHE ==============
document.getElementById("searchInput").addEventListener("input", (e) => {
  currentSearch = e.target.value;
  renderList();
});

// ============== VUE LISTE / GRILLE ==============
document.querySelectorAll(".icon-square[data-view]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".icon-square[data-view]").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("candList").classList.toggle("grid-mode", btn.dataset.view === "grid");
  });
});

// ============== PAGINATION ==============
document.getElementById("pagination").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn || !btn.classList.contains("page-num")) return;
  document.querySelectorAll(".page-num").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
});

// ============== EXPORT ==============
document.getElementById("exportBtn").addEventListener("click", () => {
  const btn = document.getElementById("exportBtn");
  const original = btn.textContent;
  btn.textContent = "⇩ Génération...";
  setTimeout(() => { btn.textContent = "✓ Rapport exporté"; setTimeout(() => btn.textContent = original, 1500); }, 800);
});

// ============== DONUT CHART ==============
function renderDonut() {
  const svg = document.getElementById("donutSvg");
  const legend = document.getElementById("legend");
  const total = legendData.reduce((s, d) => s + d.value, 0);
  document.getElementById("donutTotal").textContent = total;

  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  let offsetAcc = 0;

  svg.innerHTML = `<circle cx="60" cy="60" r="${radius}" fill="none" stroke="#eef1fb" stroke-width="14"></circle>`;

  legendData.forEach(d => {
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
    circle.setAttribute("stroke-linecap", "butt");
    svg.appendChild(circle);
    offsetAcc += dash;
  });

  legend.innerHTML = legendData.map(d => `
    <li><span class="dot" style="background:${d.color}"></span>${d.label}<span class="count">${d.value}</span></li>
  `).join("");
}

// ============== INIT ==============
renderList();
renderDonut();
