// ============== DONNÉES ==============
let candidatures = [];
let allCandidatures = [];

const statusClass = {
  recommended: "status-recommended",
  sent: "status-sent",
  interview: "status-interview",
  response: "status-response",
  pending: "status-pending"
};

let currentStatus = "all";
let currentSearch = "";
let currentPage = 1;
const CAND_PER_PAGE = 5;

// ============== FIREBASE ==============
function loadCandidaturesFromFirebase() {
  return firebase.database().ref("candidatures").once("value").then((snapshot) => {
    const data = snapshot.val() || {};
    const user = firebase.auth().currentUser;
    const uid = user ? user.uid : null;

    allCandidatures = Object.keys(data).map((id) => {
      const c = data[id];
      return {
        id,
        ...c,
        createdAt: typeof c.createdAt === "number" ? c.createdAt : Date.now()
      };
    });

    if (uid) {
      allCandidatures = allCandidatures.filter(c => c.userId === uid);
    }

    allCandidatures.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    candidatures = [...allCandidatures];
    console.log("[CAND] candidatures chargées:", candidatures.length);
    return candidatures;
  }).catch((err) => {
    console.error("[CAND] erreur chargement:", err);
    allCandidatures = [];
    candidatures = [];
    return [];
  });
}

// ============== RENDU LISTE ==============
function renderList() {
  const list = document.getElementById("candList");
  if (!list) return;
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
    updateCounts();
    const paginationEl = document.getElementById("pagination");
    if (paginationEl) paginationEl.innerHTML = "";
    return;
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / CAND_PER_PAGE));
  if (currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage - 1) * CAND_PER_PAGE;
  const pageItems = filtered.slice(start, start + CAND_PER_PAGE);

  pageItems.forEach(c => {
    const row = document.createElement("article");
    row.className = "cand-row";
    const logoText = c.logo || (c.company || "?").charAt(0).toUpperCase();
    row.innerHTML = `
      <div class="cand-logo" style="background:${c.logoBg || "#e5e7eb"}">${logoText}</div>
      <div class="cand-info">
        <div class="cand-title">${c.title || "Sans titre"}</div>
        <div class="cand-company">${c.company || "—"}</div>
      </div>
      <span class="cand-status ${statusClass[c.status] || "status-pending"}">${c.statusLabel || c.status || ""}</span>
      <span class="cand-date">${c.date || "—"}</span>
      <a class="btn-primary-sm" href="${c.sourceUrl || '#'}" target="_blank">Voir détails</a>
    `;
    list.appendChild(row);
  });

  updateCounts();
  renderPagination(totalPages);
}

function updateCounts() {
  const counts = {
    all: candidatures.length,
    new: candidatures.filter(c => c.status === "sent").length,
    response: candidatures.filter(c => c.status === "response").length,
    offer: candidatures.filter(c => c.status === "recommended").length,
    interview: candidatures.filter(c => c.status === "interview").length,
    confirmed: candidatures.filter(c => c.status === "pending").length
  };

  document.querySelectorAll(".tab").forEach(tab => {
    const status = tab.dataset.status;
    const span = tab.querySelector("span");
    if (span && counts[status] !== undefined) {
      span.textContent = counts[status];
    }
  });
}

function renderPagination(totalPages) {
  const paginationEl = document.getElementById("pagination");
  if (!paginationEl) return;

  if (totalPages <= 1) {
    paginationEl.innerHTML = "";
    return;
  }

  let html = "";
  html += `<button class="page-arrow" data-page="prev" ${currentPage === 1 ? 'disabled' : ''}>‹</button>`;
  
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      html += `<button class="page-num ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      html += `<span class="page-dots">...</span>`;
    }
  }
  
  html += `<button class="page-arrow" data-page="next" ${currentPage === totalPages ? 'disabled' : ''}>›</button>`;
  
  paginationEl.innerHTML = html;

  paginationEl.querySelectorAll(".page-num, .page-arrow").forEach((btn) => {
    btn.addEventListener("click", () => {
      const page = btn.getAttribute("data-page");
      if (page === "prev" && currentPage > 1) {
        currentPage--;
      } else if (page === "next" && currentPage < totalPages) {
        currentPage++;
      } else if (page !== "prev" && page !== "next") {
        currentPage = parseInt(page);
      }
      renderList();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

// ============== TABS ==============
document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    currentStatus = tab.dataset.status;
    currentPage = 1;
    renderList();
  });
});

// ============== RECHERCHE ==============
document.getElementById("searchInput")?.addEventListener("input", (e) => {
  currentSearch = e.target.value;
  currentPage = 1;
  renderList();
});

// ============== VUE LISTE / GRILLE ==============
document.querySelectorAll(".icon-square[data-view]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".icon-square[data-view]").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("candList")?.classList.toggle("grid-mode", btn.dataset.view === "grid");
  });
});

function updateHeroStats() {
  const sent = candidatures.filter(c => c.status === "sent").length;
  const interview = candidatures.filter(c => c.status === "interview").length;
  const response = candidatures.filter(c => c.status === "response").length;

  const statSent = document.getElementById("statSent");
  const statInterview = document.getElementById("statInterview");
  const statResponse = document.getElementById("statResponse");

  if (statSent) statSent.textContent = sent;
  if (statInterview) statInterview.textContent = interview;
  if (statResponse) statResponse.textContent = response;
}

// ============== EXPORT ==============
document.getElementById("exportBtn")?.addEventListener("click", () => {
  const btn = document.getElementById("exportBtn");
  const original = btn.textContent;
  btn.textContent = "⇩ Génération...";
  setTimeout(() => { btn.textContent = "✓ Rapport exporté"; setTimeout(() => btn.textContent = original, 1500); }, 800);
});

// ============== DONUT CHART ==============
function renderDonut() {
  const svg = document.getElementById("donutSvg");
  const legend = document.getElementById("legend");
  if (!svg || !legend) return;

  const legendData = [
    { label: "Entretiens", color: "#8b5cf6", value: candidatures.filter(c => c.status === "interview").length },
    { label: "Réponses", color: "#16a34a", value: candidatures.filter(c => c.status === "response").length },
    { label: "Envoyées", color: "#3b6bf5", value: candidatures.filter(c => c.status === "sent").length },
    { label: "En attente", color: "#f59e0b", value: candidatures.filter(c => c.status === "pending").length }
  ];

  const total = legendData.reduce((s, d) => s + d.value, 0);
  const donutTotal = document.getElementById("donutTotal");
  if (donutTotal) donutTotal.textContent = total;

  const totalSent = candidatures.filter(c => c.status === "sent").length;
  const totalResponse = candidatures.filter(c => c.status === "response").length;
  const rateValue = document.getElementById("rateValue");
  if (rateValue) {
    const rate = totalSent > 0 ? Math.round((totalResponse / totalSent) * 100) : 0;
    rateValue.textContent = rate + "%";
  }

  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  let offsetAcc = 0;

  svg.innerHTML = `<circle cx="60" cy="60" r="${radius}" fill="none" stroke="#eef1fb" stroke-width="14"></circle>`;

  legendData.forEach(d => {
    if (d.value === 0) return;
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

  legend.innerHTML = legendData.filter(d => d.value > 0).map(d => `
    <li><span class="dot" style="background:${d.color}"></span>${d.label}<span class="count">${d.value}</span></li>
  `).join("");
}

// ============== INIT ==============
loadCandidaturesFromFirebase().then(() => {
  renderList();
  renderDonut();
  updateHeroStats();
});
