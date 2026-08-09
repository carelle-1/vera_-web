// ============== UTILS ==============
function escapeHtml(text) {
  if (text === null || text === undefined) return "";
  const str = String(text);
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return str.replace(/[&<>"']/g, (m) => map[m]);
}

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
    const min = Math.min(...arr);
    const max = Math.max(...arr);
    return arr.map((v, i) => {
      const x = pad + (i / (arr.length - 1)) * (w - pad * 2);
      const y = h - pad - ((v - min) / (max - min || 1)) * 28;
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

// ============== CRUD OFFRES D'EMPLOI ==============
let jobCurrentPage = 1;
const JOBS_PER_PAGE = 10;
let allFilteredJobs = [];
let jobEditId = null;

function jobRef() {
  const user = firebase.auth().currentUser;
  if (!user) {
    console.warn("[ENTREPRISE] aucun utilisateur Firebase connecté");
  }
  return user ? firebase.database().ref("jobs") : null;
}

function renderJobs(resetPage) {
  const tbody = document.getElementById("jobTableBody");
  const countEl = document.getElementById("jobTableCount");
  const search = document.getElementById("jobSearch");
  const filter = document.getElementById("jobFilter");
  if (!tbody) {
    console.warn("[ENTREPRISE] jobTableBody introuvable");
    return;
  }

  const ref = jobRef();
  if (!ref) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:30px;color:#ef4444;">Vous devez être connecté pour voir les offres.</td></tr>`;
    return;
  }

  const q = search ? search.value.trim().toLowerCase() : "";
  const statusFilter = filter ? filter.value : "all";

  ref.once("value").then((snapshot) => {
    const data = snapshot.val() || {};
    const currentUser = firebase.auth().currentUser;
    const items = Object.keys(data).map((id) => ({ id, ...data[id] }))
      .filter((job) => !currentUser || job.createdBy === currentUser.uid)
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    let filtered = items;
    if (q) {
      filtered = filtered.filter(job =>
        (job.title || "").toLowerCase().includes(q) ||
        (job.company || "").toLowerCase().includes(q) ||
        (job.location || "").toLowerCase().includes(q) ||
        (job.country || "").toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter(job => (job.status || "active") === statusFilter);
    }

    allFilteredJobs = filtered;
    if (resetPage !== false) jobCurrentPage = 1;

    tbody.innerHTML = "";
    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:30px;color:#6b7280;">Aucune offre trouvée.</td></tr>`;
      if (countEl) countEl.textContent = "Affichage de 0 offre";
      renderJobPagination(0);
      return;
    }

    const totalPages = Math.max(1, Math.ceil(filtered.length / JOBS_PER_PAGE));
    if (jobCurrentPage > totalPages) jobCurrentPage = totalPages;
    const start = (jobCurrentPage - 1) * JOBS_PER_PAGE;
    const end = Math.min(start + JOBS_PER_PAGE, filtered.length);
    const pageJobs = filtered.slice(start, end);

    if (countEl) countEl.textContent = `Affichage de ${start + 1} à ${end} sur ${filtered.length} offre${filtered.length > 1 ? "s" : ""}`;

    const statusMap = {
      active: '<span class="status-badge success">Active</span>',
      inactive: '<span class="status-badge danger">Inactive</span>'
    };

    pageJobs.forEach((job) => {
      const tr = document.createElement("tr");
      const logoUrl = job.logoURL || "";
      const logoHtml = logoUrl
        ? `<img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(job.company || 'logo')}" style="width:40px;height:40px;border-radius:8px;object-fit:cover;">`
        : `<div class="job-logo-placeholder">${escapeHtml((job.company || "?").charAt(0).toUpperCase())}</div>`;

      tr.innerHTML = `
        <td style="text-align:center;vertical-align:middle;"><input type="checkbox" class="job-select-checkbox" data-id="${job.id}" style="cursor:pointer;width:16px;height:16px;"></td>
        <td style="text-align:center;vertical-align:middle;">${logoHtml}</td>
        <td><button class="job-title-edit" data-id="${job.id}" style="background:none;border:none;color:inherit;font:inherit;cursor:pointer;text-align:left;padding:0;font-weight:700;">${escapeHtml(job.title || "Sans titre")}</button></td>
        <td>${escapeHtml(job.company || "—")}</td>
        <td>${escapeHtml(job.location || "—")}${job.country ? ", " + escapeHtml(job.country) : ""}</td>
        <td>${statusMap[job.status] || job.status || "—"}</td>
        <td>${job.deadline ? escapeHtml(job.deadline) : "—"}</td>
        <td class="exp-action-cell">
          <button class="exp-delete-btn" data-id="${job.id}" title="Supprimer">
            <img src="/image/delete.png" alt="Supprimer" style="width:16px;height:16px;object-fit:contain;">
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll(".job-title-edit").forEach((btn) => {
      btn.addEventListener("click", () => openJobForm(btn.dataset.id));
    });
    tbody.querySelectorAll(".exp-delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => deleteJob(btn.dataset.id));
    });
    tbody.querySelectorAll(".job-select-checkbox").forEach((checkbox) => {
      checkbox.addEventListener("change", updateBulkDeleteButton);
    });

    updateBulkDeleteButton();
    renderJobPagination(filtered.length);
  }).catch((err) => {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:30px;color:#ef4444;">Erreur de chargement: ${err.message || err.code}</td></tr>`;
  });
}

function renderJobPagination(totalItems) {
  const container = document.getElementById("jobPagination");
  if (!container) return;

  const totalPages = totalItems === 0 ? 0 : Math.max(1, Math.ceil(totalItems / JOBS_PER_PAGE));
  if (totalPages <= 1) {
    container.innerHTML = "";
    return;
  }

  let html = `<button class="page-arrow" data-page="prev" ${jobCurrentPage === 1 ? 'disabled' : ''}>‹</button>`;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= jobCurrentPage - 1 && i <= jobCurrentPage + 1)) {
      html += `<button class="page-num ${i === jobCurrentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    } else if (i === jobCurrentPage - 2 || i === jobCurrentPage + 2) {
      html += `<span class="page-dots">...</span>`;
    }
  }

  html += `<button class="page-arrow" data-page="next" ${jobCurrentPage === totalPages ? 'disabled' : ''}>›</button>`;
  container.innerHTML = html;

  container.querySelectorAll(".page-num, .page-arrow").forEach((btn) => {
    btn.addEventListener("click", () => {
      const page = btn.dataset.page;
      if (!page) return;

      if (page === "prev" && jobCurrentPage > 1) {
        jobCurrentPage--;
      } else if (page === "next" && jobCurrentPage < totalPages) {
        jobCurrentPage++;
      } else if (page !== "prev" && page !== "next") {
        jobCurrentPage = parseInt(page);
      }

      renderJobs(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

function deleteJob(id) {
  if (!confirm("Supprimer cette offre d'emploi ?")) return;
  const ref = jobRef();
  if (!ref) return;
  ref.child(id).remove()
    .then(() => {
      renderJobs();
    })
    .catch((err) => alert("Échec de la suppression : " + (err.message || err.code)));
}

function updateBulkDeleteButton() {
  const checkboxes = document.querySelectorAll(".job-select-checkbox:checked");
  const bulkBtn = document.getElementById("bulkDeleteBtn");
  if (bulkBtn) {
    bulkBtn.style.display = checkboxes.length > 0 ? "inline-block" : "none";
    bulkBtn.textContent = checkboxes.length > 0 ? `🗑 Supprimer la sélection (${checkboxes.length})` : "🗑 Supprimer la sélection";
  }
}

function deleteSelectedJobs() {
  const checkboxes = document.querySelectorAll(".job-select-checkbox:checked");
  if (checkboxes.length === 0) return;

  const ids = Array.from(checkboxes).map(cb => cb.dataset.id);
  if (!confirm(`Supprimer ${ids.length} offre(s) d'emploi ?`)) return;

  const ref = jobRef();
  if (!ref) return;

  const deletions = ids.map(id => ref.child(id).remove());
  Promise.all(deletions)
    .then(() => {
      renderJobs();
      const selectAll = document.getElementById("selectAllJobs");
      if (selectAll) selectAll.checked = false;
    })
    .catch((err) => alert("Échec de la suppression : " + (err.message || err.code)));
}

function openJobForm(id) {
  const wrapper = document.getElementById("offresFormWrapper");
  const titleEl = document.getElementById("jobModalTitle");
  const form = document.getElementById("jobForm");
  if (!wrapper || !form || !titleEl) return;

  form.reset();
  if (id) {
    jobEditId = id;
    titleEl.textContent = "Modifier l'offre";
    const ref = jobRef();
    if (ref) {
      ref.child(id).once("value").then((snap) => {
        const d = snap.val() || {};
        form.title.value = d.title || "";
        form.company.value = d.company || "";
        form.applyEmail.value = d.applyEmail || "";
        form.location.value = d.location || "";
        form.country.value = d.country || "";
        form.description.value = d.description || "";
        form.salary.value = d.salary || "";
        form.contractType.value = d.contractType || "";
        form.skills.value = d.skills || "";
        form.deadline.value = d.deadline || "";
        form.status.value = d.status || "active";
      });
    }
  } else {
    jobEditId = null;
    titleEl.textContent = "Ajouter une offre";
  }

  wrapper.classList.add("active");
}

function closeJobForm() {
  const wrapper = document.getElementById("offresFormWrapper");
  if (wrapper) wrapper.classList.remove("active");
  jobEditId = null;
}

function handleJobSubmit(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const payload = {
    title: (fd.get("title") || "").toString().trim(),
    company: (fd.get("company") || "").toString().trim(),
    applyEmail: (fd.get("applyEmail") || "").toString().trim(),
    location: (fd.get("location") || "").toString().trim(),
    country: (fd.get("country") || "").toString().trim(),
    description: (fd.get("description") || "").toString().trim(),
    salary: (fd.get("salary") || "").toString().trim(),
    contractType: (fd.get("contractType") || "").toString().trim(),
    skills: (fd.get("skills") || "").toString().trim(),
    deadline: (fd.get("deadline") || "").toString().trim(),
    status: (fd.get("status") || "active").toString().trim(),
    createdAt: Date.now()
  };

  const logoFile = e.target.querySelector('input[name="logo"]').files[0];

  const ref = jobRef();
  const currentUser = firebase.auth().currentUser;
  if (!ref || !currentUser) {
    alert("Vous devez être connecté pour enregistrer une offre.");
    return;
  }

  const saveRef = jobEditId ? ref.child(jobEditId) : ref.push();

  const finish = () => {
    closeJobForm();
    renderJobs();
  };

  if (jobEditId) {
    saveRef.update(payload).then(() => {
      return handleLogoUpload(saveRef, logoFile);
    }).then(() => {
      finish();
    }).catch((err) => {
      alert("Échec de la modification : " + (err.message || err.code));
    });
  } else {
    saveRef.set({ ...payload, createdBy: currentUser.uid }).then(() => {
      return handleLogoUpload(saveRef, logoFile);
    }).then(() => {
      finish();
    }).catch((err) => {
      alert("Échec de la création : " + (err.message || err.code));
    });
  }
}

function handleLogoUpload(saveRef, logoFile) {
  if (!logoFile) {
    return null;
  }

  const formData = new FormData();
  formData.append('logo', logoFile);

  return fetch('/upload-logo.php', {
    method: 'POST',
    body: formData
  }).then((response) => {
    if (!response.ok) {
      return response.json().then((err) => {
        throw new Error(err.error || 'Erreur upload local');
      });
    }
    return response.json();
  }).then((data) => {
    if (data.success && data.url) {
      return saveRef.update({ logoURL: data.url });
    }
    return null;
  }).catch((err) => {
    console.error("[ENTREPRISE] erreur upload logo:", err);
    alert("Échec de l'upload du logo : " + err.message);
    throw err;
  });
}

const addJobBtn = document.getElementById("addJobBtn");
if (addJobBtn) {
  addJobBtn.addEventListener("click", () => openJobForm(null));
}

const jobCloseBtn = document.getElementById("jobModalClose");
if (jobCloseBtn) {
  jobCloseBtn.addEventListener("click", closeJobForm);
}

const jobCancelBtn = document.getElementById("jobCancel");
if (jobCancelBtn) {
  jobCancelBtn.addEventListener("click", closeJobForm);
}

const jobForm = document.getElementById("jobForm");
if (jobForm) {
  jobForm.addEventListener("submit", handleJobSubmit);
}

const jobSearchEl = document.getElementById("jobSearch");
if (jobSearchEl) jobSearchEl.addEventListener("input", renderJobs);

const jobFilterEl = document.getElementById("jobFilter");
if (jobFilterEl) jobFilterEl.addEventListener("change", renderJobs);

const selectAllJobs = document.getElementById("selectAllJobs");
if (selectAllJobs) {
  selectAllJobs.addEventListener("change", () => {
    document.querySelectorAll(".job-select-checkbox").forEach(cb => cb.checked = selectAllJobs.checked);
    updateBulkDeleteButton();
  });
}

const bulkDeleteBtn = document.getElementById("bulkDeleteBtn");
if (bulkDeleteBtn) {
  bulkDeleteBtn.addEventListener("click", deleteSelectedJobs);
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
  dashboard: "Tableau de bord",
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
  const dashboard = document.getElementById("panel-dashboard");
  const offres = document.getElementById("panel-offres");
  const placeholder = document.getElementById("panel-placeholder");

  if (dashboard) dashboard.classList.toggle("active", panel === "dashboard");
  if (offres) offres.classList.toggle("active", panel === "offres");
  if (placeholder) {
    placeholder.classList.toggle("active", panel !== "dashboard" && panel !== "offres");
    if (panel !== "dashboard" && panel !== "offres" && panelTitles[panel]) {
      document.getElementById("placeholderTitle").textContent = panelTitles[panel];
    }
  }

  if (panel === "offres") {
    renderJobs();
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

// ============== INIT ==============
renderKPIs();
renderAppsChart();
renderSourceDonut();
renderJobs();
renderCandidates();
renderTalents();
renderInterviews();
