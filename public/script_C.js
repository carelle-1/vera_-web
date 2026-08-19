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
let candCurrentPage = 1;
const CAND_PER_PAGE = 5;

function escapeHtml(value) {
  return (value ?? "").toString().replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

function normalizeSkills(skills) {
  if (Array.isArray(skills)) return skills.map((skill) => (skill && skill.name) ? skill.name : skill).filter(Boolean);
  if (typeof skills === "string") return skills.split(",").map((skill) => skill.trim()).filter(Boolean);
  if (skills && typeof skills === "object") return Object.values(skills).map((skill) => (skill && skill.name) ? skill.name : skill).filter(Boolean);
  return [];
}

function renderDetailRow(label, value) {
  return `<div class="detail-row"><span class="detail-label">${escapeHtml(label)}</span><span class="detail-value">${value ? escapeHtml(value) : "\u2014"}</span></div>`;
}

function loadLinkedJob(candidature) {
  if (!candidature || !candidature.jobId) return Promise.resolve(null);
  return firebase.database().ref("jobs/" + candidature.jobId).once("value").then((snapshot) => {
    if (!snapshot.exists()) return null;
    return { id: candidature.jobId, ...snapshot.val() };
  }).catch((err) => {
    console.error("[CAND] erreur chargement offre liee:", err);
    return null;
  });
}

// ============== FIREBASE ==============
function loadCandidaturesFromFirebase(user) {
  if (!user || !user.uid) {
    console.warn("[CAND] utilisateur non connecté");
    candidatures = [];
    allCandidatures = [];
    return Promise.resolve([]);
  }
  const uid = user.uid;
  return firebase.database().ref("candidatures").orderByChild("userId").equalTo(uid).once("value").then((snapshot) => {
    const data = snapshot.val() || {};

    allCandidatures = Object.keys(data).map((id) => {
      const c = data[id];
      return {
        id,
        ...c,
        createdAt: typeof c.createdAt === "number" ? c.createdAt : Date.now()
      };
    });

    allCandidatures.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    candidatures = [...allCandidatures];
    console.log("[CAND] candidatures chargées:", candidatures.length, "pour userId:", uid);
    return candidatures;
  }).catch((err) => {
    console.error("[CAND] erreur chargement query:", err);
    console.log("[CAND] tentative fallback: chargement complet");
    return firebase.database().ref("candidatures").once("value").then((snapshot) => {
      const data = snapshot.val() || {};
      allCandidatures = Object.keys(data).map((id) => {
        const c = data[id];
        return {
          id,
          ...c,
          createdAt: typeof c.createdAt === "number" ? c.createdAt : Date.now()
        };
      });
      allCandidatures = allCandidatures.filter(c => c.userId === uid);
      allCandidatures.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      candidatures = [...allCandidatures];
      console.log("[CAND] candidatures (fallback):", candidatures.length);
      return candidatures;
    }).catch((err2) => {
      console.error("[CAND] erreur fallback:", err2);
      allCandidatures = [];
      candidatures = [];
      return [];
    });
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
  if (candCurrentPage > totalPages) candCurrentPage = totalPages;
  const start = (candCurrentPage - 1) * CAND_PER_PAGE;
  const pageItems = filtered.slice(start, start + CAND_PER_PAGE);

  pageItems.forEach(c => {
    const row = document.createElement("article");
    row.className = "cand-row";
    const isLogoUrl = c.logo && (c.logo.startsWith("http://") || c.logo.startsWith("https://"));
    const logoHtml = isLogoUrl
      ? `<img src="${c.logo}" alt="${c.company || "logo"}" style="width:100%;height:100%;object-fit:contain;border-radius:8px;">`
      : (c.logo || (c.company || "?").charAt(0).toUpperCase());
    row.innerHTML = `
      <div class="cand-logo" style="background:${c.logoBg || "#e5e7eb"}">${logoHtml}</div>
      <div class="cand-info">
        <div class="cand-title">${c.title || "Sans titre"}</div>
        <div class="cand-company">${c.company || "\u2014"}</div>
      </div>
      <span class="cand-status ${statusClass[c.status] || "status-pending"}">${c.statusLabel || c.status || ""}</span>
      <span class="cand-date">${c.date || "\u2014"}</span>
      <button class="btn-primary-sm cand-detail-btn" data-cand-id="${c.id}">Voir détails</button>
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
  html += `<button class="page-arrow" data-page="prev" ${candCurrentPage === 1 ? 'disabled' : ''}>‹</button>`;
  
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= candCurrentPage - 1 && i <= candCurrentPage + 1)) {
      html += `<button class="page-num ${i === candCurrentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    } else if (i === candCurrentPage - 2 || i === candCurrentPage + 2) {
      html += `<span class="page-dots">...</span>`;
    }
  }
  
  html += `<button class="page-arrow" data-page="next" ${candCurrentPage === totalPages ? 'disabled' : ''}>›</button>`;
  
  paginationEl.innerHTML = html;

  paginationEl.querySelectorAll(".page-num, .page-arrow").forEach((btn) => {
    btn.addEventListener("click", () => {
      const page = btn.getAttribute("data-page");
      if (page === "prev" && candCurrentPage > 1) {
        candCurrentPage--;
      } else if (page === "next" && candCurrentPage < totalPages) {
        candCurrentPage++;
      } else if (page !== "prev" && page !== "next") {
        candCurrentPage = parseInt(page);
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
    candCurrentPage = 1;
    renderList();
  });
});

// ============== RECHERCHE ==============
document.getElementById("searchInput")?.addEventListener("input", (e) => {
  currentSearch = e.target.value;
  candCurrentPage = 1;
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
    { label: "Entretiens", color: "#16a34c", value: candidatures.filter(c => c.status === "interview").length },
    { label: "Réponses", color: "#16a34c", value: candidatures.filter(c => c.status === "response").length },
    { label: "Envoyées", color: "#16a34c", value: candidatures.filter(c => c.status === "sent").length },
    { label: "En attente", color: "#16a34c", value: candidatures.filter(c => c.status === "pending").length }
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

// ============== MODAL DÉTAILS CANDIDATURE ==============
function openCandidatureModal(candidature) {
  const overlay = document.getElementById("candDetailOverlay");
  const body = document.getElementById("candDetailBody");
  const title = document.getElementById("candDetailTitle");
  if (!overlay || !body || !title) return;

  const isLogoUrl = candidature.logo && (candidature.logo.startsWith("http://") || candidature.logo.startsWith("https://"));
  const logoHtml = isLogoUrl
    ? `<img src="${candidature.logo}" alt="${candidature.company || "logo"}" class="detail-logo">`
    : `<div class="detail-logo" style="display:flex;align-items:center;justify-content:center;font-weight:800;font-size:22px;background:${candidature.logoBg || "#e5e7eb"};color:#fff;">${candidature.logo || (candidature.company || "?").charAt(0).toUpperCase()}</div>`;

  body.innerHTML = `
    ${logoHtml}
    <div class="detail-company">${candidature.company || "\u2014"}</div>
    <div class="detail-sub">${candidature.title || "Sans titre"}</div>
    <div class="detail-row"><span class="detail-label">Statut</span><span class="detail-value"><span class="cand-status ${statusClass[candidature.status] || "status-pending"}">${candidature.statusLabel || candidature.status || ""}</span></span></div>
    <div class="detail-row"><span class="detail-label">Date de candidature</span><span class="detail-value">${candidature.date || "\u2014"}</span></div>
    <div class="detail-row"><span class="detail-label">Offre ciblée</span><span class="detail-value">${candidature.jobId || "\u2014"}</span></div>
    ${candidature.sourceUrl ? `<div class="detail-row"><span class="detail-label">Source</span><span class="detail-value"><a href="${candidature.sourceUrl}" target="_blank" rel="noopener">${candidature.sourceName || candidature.sourceUrl}</a></span></div>` : ""}
    <div class="detail-actions" style="display:none;"></div>
  `;

  title.textContent = "Détails de la candidature";
  overlay.classList.add("active");
}

function closeCandidatureModal() {
  const overlay = document.getElementById("candDetailOverlay");
  if (overlay) overlay.classList.remove("active");
}

function openOfferDetailModal(candidature) {
  const overlay = document.getElementById("candDetailOverlay");
  const body = document.getElementById("candDetailBody");
  const title = document.getElementById("candDetailTitle");
  if (!overlay || !body || !title) return;

  title.textContent = "Détails de l'offre";
  body.innerHTML = `<div class="empty-state">Chargement des détails de l'offre...</div>`;
  overlay.classList.add("active");

  loadLinkedJob(candidature).then((job) => {
    const detail = { ...candidature, ...(job || {}) };
    const logoValue = detail.logoURL || detail.logo || "";
    const isLogoUrl = logoValue && (logoValue.startsWith("http://") || logoValue.startsWith("https://"));
    const logoHtml = isLogoUrl
      ? `<img src="${escapeHtml(logoValue)}" alt="${escapeHtml(detail.company || "logo")}" class="detail-logo">`
      : `<div class="detail-logo" style="display:flex;align-items:center;justify-content:center;font-weight:800;font-size:22px;background:${escapeHtml(detail.logoBg || "#e5e7eb")};color:#fff;">${escapeHtml(detail.logo || (detail.company || "?").charAt(0).toUpperCase())}</div>`;

    const skills = normalizeSkills(detail.skills).slice(0, 8);
    const skillsHtml = skills.length
      ? skills.map((skill) => `<span class="detail-tag">${escapeHtml(skill)}</span>`).join("")
      : "\u2014";
    const sourceUrl = (detail.sourceUrl || "").toString().trim();

    body.innerHTML = `
      ${logoHtml}
      <div class="detail-company">${escapeHtml(detail.company || "\u2014")}</div>
      <div class="detail-sub">${escapeHtml(detail.title || "Sans titre")} · ${escapeHtml(detail.location || detail.country || "\u2014")}</div>
      <div class="detail-row"><span class="detail-label">Statut candidature</span><span class="detail-value"><span class="cand-status ${statusClass[candidature.status] || "status-pending"}">${escapeHtml(candidature.statusLabel || candidature.status || "")}</span></span></div>
      ${renderDetailRow("Date de candidature", candidature.date)}
      ${renderDetailRow("Type de contrat", detail.contractType || detail.type || detail.status)}
      ${renderDetailRow("Salaire", detail.salary)}
      ${renderDetailRow("Date limite", detail.deadline)}
      ${renderDetailRow("Email de candidature", detail.applyEmail)}
      <div class="detail-row"><span class="detail-label">Description</span><span class="detail-value">${escapeHtml(detail.description || "Aucune description disponible.")}</span></div>
      <div class="detail-row"><span class="detail-label">Compétences</span><span class="detail-value detail-tags">${skillsHtml}</span></div>
      ${sourceUrl ? `<div class="detail-row"><span class="detail-label">Source</span><span class="detail-value"><a href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener">${escapeHtml(detail.sourceName || sourceUrl)}</a></span></div>` : ""}
      ${!job ? `<div class="detail-note">L'offre complète n'a pas été retrouvée dans la base. Les informations affichées viennent de la candidature enregistrée.</div>` : ""}
    `;
  });
}

document.getElementById("candList").addEventListener("click", (e) => {
  const btn = e.target.closest(".cand-detail-btn");
  if (!btn) return;
  const id = btn.getAttribute("data-cand-id");
  const candidature = allCandidatures.find(c => c.id === id);
  if (candidature) {
    openOfferDetailModal(candidature);
  }
});

const candDetailClose = document.getElementById("candDetailClose");
if (candDetailClose) {
  candDetailClose.addEventListener("click", closeCandidatureModal);
}

const candDetailOverlay = document.getElementById("candDetailOverlay");
if (candDetailOverlay) {
  candDetailOverlay.addEventListener("click", (e) => {
    if (e.target === candDetailOverlay) closeCandidatureModal();
  });
}

// ============== INIT ==============
firebase.auth().onAuthStateChanged((user) => {
  if (!user) {
    window.location.replace("/");
    return;
  }
  loadCandidaturesFromFirebase(user).then(() => {
    renderList();
    renderDonut();
    updateHeroStats();
    const jobId = new URLSearchParams(window.location.search).get("jobId");
    if (jobId) {
      const candidature = allCandidatures.find((c) => c.jobId === jobId);
      if (candidature) openOfferDetailModal(candidature);
    }
  });
});
