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

function showToast(message) {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.cssText = "position:fixed;bottom:20px;right:20px;background:#1f2937;color:#fff;padding:10px 18px;border-radius:8px;font-size:12px;font-weight:600;z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,0.18);opacity:0;transition:opacity .2s ease;";
  document.body.appendChild(toast);
  requestAnimationFrame(() => { toast.style.opacity = "1"; });
  setTimeout(() => { toast.style.opacity = "0"; setTimeout(() => toast.remove(), 200); }, 2500);
}

function saveMessageToFirebase(recipientId, messageData) {
  const user = firebase.auth().currentUser;
  if (!user) return Promise.reject("Utilisateur non connecté");

  const conversationId = [user.uid, recipientId].sort().join("_");
  const messageRef = firebase.database().ref("messages/" + conversationId).push();
  const messageWithId = {
    ...messageData,
    id: messageRef.key,
    senderUid: user.uid,
    timestamp: Date.now(),
    read: false
  };

  return messageRef.set(messageWithId)
    .then(() => {
      return firebase.database().ref("conversations/" + user.uid + "/" + recipientId).update({
        lastMessage: messageData.text || messageData.fileName || "Fichier",
        lastTimestamp: messageWithId.timestamp,
        recipientId: recipientId
      });
    })
    .then(() => {
      return firebase.database().ref("conversations/" + recipientId + "/" + user.uid).update({
        lastMessage: messageData.text || messageData.fileName || "Fichier",
        lastTimestamp: messageWithId.timestamp,
        recipientId: user.uid,
        unread: true
      });
    });
}

// ============== DONNÉES KPI ==============
const kpis = [
  { icon: '<img src="/image/mission.png" alt="Offres" class="kpi-img">', iconBg: "#eaf8ff", label: "Offres actives", value: "6", trend: "+2", up: true,
    spark: [3,4,3,5,4,5,6], color: "#0ea5e9" },
  { icon: '<img src="/image/3917512.png" alt="Candidatures" class="kpi-img">', iconBg: "#ecfdf5", label: "Candidatures reçues", value: "18", trend: "+34%", up: true,
    spark: [4,6,5,8,10,14,18], color: "#22c55e" },
  { icon: '<img src="/image/oeil.png" alt="Vues" class="kpi-img">', iconBg: "#f3ecff", label: "Vues du profil entreprise", value: "1 240", trend: "+12%", up: true,
    spark: [800,850,900,980,1050,1150,1240], color: "#8b5cf6" },
  { icon: '<img src="/image/3914260.png" alt="Réponse" class="kpi-img">', iconBg: "#fdf1de", label: "Taux de réponse", value: "76%", trend: "-4%", up: false,
    spark: [85,83,80,79,78,77,76], color: "#f59e0b" }
];

function renderKPIs() {
  const grid = document.getElementById("kpiGrid");
  grid.innerHTML = kpis.map(k => {
    const max = Math.max(...k.spark), min = Math.min(...k.spark);
    const range = max - min || 1;
    const points = k.spark.map((v, i) => {
      const x = (i / (k.spark.length - 1)) * 100;
      const y = 30 - ((v - min) / range) * 24;
      return `${x},${y}`;
    }).join(" ");
    const fillPoints = points + ` ${100},${30} 0,${30}`;
    return `
      <div class="kpi-card">
        <div class="kpi-top">
          <div class="kpi-icon" style="background:${k.iconBg}">${k.icon}</div>
          <span class="kpi-trend ${k.up ? "up" : "down"}">${k.up ? '<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>' : '<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>'} ${k.trend}</span>
        </div>
        <div class="kpi-value">${k.value}</div>
        <div class="kpi-label">${k.label}</div>
        <svg class="kpi-spark" viewBox="0 0 100 32" preserveAspectRatio="none">
          <polygon points="${fillPoints}" fill="${k.color}" opacity="0.12"/>
          <polyline points="${points}" stroke="${k.color}"></polyline>
        </svg>
      </div>
    `;
  }).join("");
}

// ============== GRAPHIQUE CANDIDATURES ==============
const appsData = {
  labels: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
  applications: [0, 0, 0, 0, 0, 0, 0],
  views: [0, 0, 0, 0, 0, 0, 0]
};

function renderAppsChart() {
  const svg = document.getElementById("appsChart");
  const w = 640, h = 200, pad = 20;

  const chartHeight = h - pad * 2;
  const chartWidth = w - pad * 2;

  const allVals = [...appsData.applications, ...appsData.views];
  const globalMin = Math.min(...allVals, 0);
  const globalMax = Math.max(...allVals, 1);
  const valRange = globalMax - globalMin || 1;

  function toPoints(arr) {
    return arr.map((v, i) => {
      const x = pad + (i / (arr.length - 1)) * chartWidth;
      const normalizedY = (v - globalMin) / valRange;
      const y = h - pad - normalizedY * chartHeight;
      return `${x},${y}`;
    }).join(" ");
  }

  const appPoints = toPoints(appsData.applications);
  const viewPoints = toPoints(appsData.views);

  let gridLines = "";
  for (let i = 0; i <= 4; i++) {
    const y = pad + (i / 4) * chartHeight;
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

function getDayLabel(d) {
  const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  return days[d.getDay()];
}

function getLast7Days() {
  const days = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push({
      date: new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(),
      label: getDayLabel(d)
    });
  }
  return days;
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
    bulkBtn.innerHTML = checkboxes.length > 0
      ? '<img src="/image/delete.png" alt="Supprimer" style="width:14px;height:14px;object-fit:contain;vertical-align:middle;margin-right:4px;"> Supprimer la sélection (' + checkboxes.length + ')'
      : '<img src="/image/delete.png" alt="Supprimer" style="width:14px;height:14px;object-fit:contain;vertical-align:middle;margin-right:4px;"> Supprimer la sélection';
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
        <button class="cand-btn accept" data-action="accept" data-index="${i}" title="Accepter"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></button>
        <button class="cand-btn reject" data-action="reject" data-index="${i}" title="Refuser"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
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
  const el = document.getElementById("talentsList");
  if (!el) return;
  el.innerHTML = talents.map(t => `
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
  const el = document.getElementById("interviewsList");
  if (!el) return;
  el.innerHTML = interviews.map(i => `
    <div class="interview-item">
      <div class="interview-date"><div class="day">${i.day}</div><div class="month">${i.month}</div></div>
      <div class="interview-info">
        <div class="interview-name">${i.name}</div>
        <div class="interview-role">${i.role}</div>
        <div class="interview-time"><img src="/image/3917292.png" alt="Heure" style="width:14px;height:14px;object-fit:contain;vertical-align:middle;margin-right:4px;"> ${i.time}</div>
      </div>
    </div>
  `).join("");
}

// ============== NAVIGATION SIDEBAR ==============
const panelTitles = {
  dashboard: "Tableau de bord",
  offres: "Gestion des offres publiées",
  candidatures: "Candidatures",
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
  const candidatures = document.getElementById("panel-candidatures");
  const messagesPanel = document.getElementById("panel-messages");
  const parametresPanel = document.getElementById("panel-parametres");
  const placeholder = document.getElementById("panel-placeholder");

  if (dashboard) dashboard.classList.toggle("active", panel === "dashboard");
  if (offres) offres.classList.toggle("active", panel === "offres");
  if (candidatures) candidatures.classList.toggle("active", panel === "candidatures");
  if (messagesPanel) messagesPanel.classList.toggle("active", panel === "messages");
  if (parametresPanel) {
    parametresPanel.classList.toggle("active", panel === "parametres");
    if (panel === "parametres") {
      loadEntrepriseSettings();
    }
  }
  if (placeholder) {
    placeholder.classList.toggle("active", panel !== "dashboard" && panel !== "offres" && panel !== "candidatures" && panel !== "messages" && panel !== "parametres");
    if (panel !== "dashboard" && panel !== "offres" && panel !== "candidatures" && panel !== "messages" && panel !== "parametres" && panelTitles[panel]) {
      document.getElementById("placeholderTitle").textContent = panelTitles[panel];
    }
  }

  const candListPanel = document.getElementById("candListPanel");
  if (candListPanel) {
    candListPanel.style.display = "none";
  }

  if (panel === "offres") {
    renderJobs();
  }
  if (panel === "candidatures") {
    candSelectedJobId = null;
    loadCandidatureJobs();
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

// ============== CANDIDATURES ==============
let candSelectedJobId = null;
let candCurrentPage = 1;
const CAND_PER_PAGE = 10;
let allCandidatures = [];
const userCache = {};

function getUserInfo(uid) {
  if (!uid) return Promise.resolve({ name: "Candidat", email: "", photoURL: "" });
  if (userCache[uid]) return Promise.resolve(userCache[uid]);

  return firebase.database().ref("users/" + uid).once("value").then((snap) => {
    const data = snap.val() || {};
    const info = {
      name: data.name || data.fullName || data.displayName || "Candidat",
      email: data.email || "",
      photoURL: data.photoURL || ""
    };
    userCache[uid] = info;
    return info;
  }).catch(() => {
    const info = { name: "Candidat #" + uid, email: "", photoURL: "" };
    userCache[uid] = info;
    return info;
  });
}

function getUserRef() {
  const user = firebase.auth().currentUser;
  return user ? firebase.database().ref("users/" + user.uid) : null;
}

function loadCurrentUserCompany() {
  const userRef = getUserRef();
  if (!userRef) return Promise.resolve(null);
  return userRef.once("value").then((snap) => snap.val() || null);
}

function candidatureJobsRef() {
  const user = firebase.auth().currentUser;
  if (!user) return null;
  return firebase.database().ref("jobs").orderByChild("createdBy").equalTo(user.uid);
}

function loadCandidatureJobs() {
  const tbody = document.getElementById("candJobTableBody");
  const countEl = document.getElementById("candJobTableCount");
  const searchEl = document.getElementById("candJobSearch");
  if (!tbody) return;

  const ref = candidatureJobsRef();
  if (!ref) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:30px;color:#ef4444;">Vous devez être connecté.</td></tr>`;
    return;
  }

  const q = searchEl ? searchEl.value.trim().toLowerCase() : "";

  ref.once("value").then((snapshot) => {
    const data = snapshot.val() || {};
    const jobs = Object.keys(data).map((id) => ({ id, ...data[id] }))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    let filtered = jobs;
    if (q) {
      filtered = filtered.filter(job =>
        (job.title || "").toLowerCase().includes(q) ||
        (job.company || "").toLowerCase().includes(q)
      );
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:30px;color:#6b7280;">Aucune offre trouvée.</td></tr>`;
      return;
    }

    const statusMap = {
      active: '<span class="status-badge success">Active</span>',
      inactive: '<span class="status-badge danger">Inactive</span>'
    };

    tbody.innerHTML = filtered.map((job) => {
      const logoUrl = job.logoURL || "";
      const logoHtml = logoUrl
        ? `<img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(job.company || 'logo')}" style="width:40px;height:40px;border-radius:8px;object-fit:cover;">`
        : `<div class="job-logo-placeholder">${escapeHtml((job.company || "?").charAt(0).toUpperCase())}</div>`;

      return `
        <tr>
          <td><button class="cand-view-btn" data-job-id="${job.id}">${escapeHtml(job.title || "Sans titre")}</button></td>
          <td>${escapeHtml(job.company || "—")}</td>
          <td>${statusMap[job.status] || job.status || "—"}</td>
          <td id="candCount-${job.id}">...</td>
          <td>${job.createdAt ? new Date(job.createdAt).toLocaleDateString("fr-FR") : "—"}</td>
          <td class="cand-action-cell">
            <button class="cand-action-btn accept" data-job-id="${job.id}" title="Voir candidats">Voir candidats</button>
          </td>
        </tr>
      `;
    }).join("");

    tbody.querySelectorAll(".cand-view-btn, .cand-action-btn.accept").forEach((btn) => {
      btn.addEventListener("click", () => openCandidaturesForJob(btn.dataset.jobId));
    });

    filtered.forEach((job) => {
      countCandidaturesForJob(job.id);
    });
  }).catch((err) => {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:30px;color:#ef4444;">Erreur de chargement: ${err.message || err.code}</td></tr>`;
  });
}

function countCandidaturesForJob(jobId) {
  const countEl = document.getElementById("candCount-" + jobId);
  if (!countEl) return;

  firebase.database().ref("candidatures").orderByChild("jobId").equalTo(jobId).once("value").then((snap) => {
    const data = snap.val() || {};
    const count = Object.keys(data).length;
    countEl.textContent = count + " candidat" + (count > 1 ? "s" : "");
  }).catch(() => {
    countEl.textContent = "—";
  });
}

function openCandidaturesForJob(jobId) {
  candSelectedJobId = jobId;
  candCurrentPage = 1;

  const jobsPanel = document.querySelector(".cand-jobs-panel");
  const listPanel = document.getElementById("candListPanel");
  const listTitle = document.getElementById("candListTitle");
  if (jobsPanel) jobsPanel.style.display = "none";
  if (listPanel) listPanel.style.display = "block";

  firebase.database().ref("jobs/" + jobId).once("value").then((snap) => {
    const job = snap.val() || {};
    if (listTitle) listTitle.textContent = "Candidats - " + (job.title || "Offre");
  });

  renderCandidatures();
}

function loadCandidaturesForJob(jobId) {
  return firebase.database().ref("candidatures").orderByChild("jobId").equalTo(jobId).once("value").then((snapshot) => {
    const data = snapshot.val() || {};
    return Object.keys(data).map((id) => ({ id, ...data[id] }))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  });
}

function renderCandidatures() {
  const tbody = document.getElementById("candTableBody");
  const countEl = document.getElementById("candTableCount");
  const searchEl = document.getElementById("candSearch");
  const filterEl = document.getElementById("candFilter");

  if (!tbody) return;
  if (!candSelectedJobId) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:30px;color:#6b7280;">Sélectionnez une offre pour voir les candidats.</td></tr>`;
    return;
  }

  const q = searchEl ? searchEl.value.trim().toLowerCase() : "";
  const statusFilter = filterEl ? filterEl.value : "all";

  loadCandidaturesForJob(candSelectedJobId).then((candidatures) => {
    allCandidatures = candidatures;

    let filtered = candidatures;
    if (q) {
      filtered = filtered.filter(c =>
        (c.userId || "").toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:30px;color:#6b7280;">Aucune candidature trouvée.</td></tr>`;
      if (countEl) countEl.textContent = "Affichage de 0 candidature";
      return;
    }

    const totalPages = Math.max(1, Math.ceil(filtered.length / CAND_PER_PAGE));
    if (candCurrentPage > totalPages) candCurrentPage = totalPages;
    const start = (candCurrentPage - 1) * CAND_PER_PAGE;
    const end = Math.min(start + CAND_PER_PAGE, filtered.length);
    const pageItems = filtered.slice(start, end);

    if (countEl) countEl.textContent = `Affichage de ${start + 1} à ${end} sur ${filtered.length} candidature${filtered.length > 1 ? "s" : ""}`;

    const statusMap = {
      sent: '<span class="status-badge success">Envoyée</span>',
      response: '<span class="status-badge success">Réponse</span>',
      interview: '<span class="status-badge warning">Entretien</span>',
      accepted: '<span class="status-badge success">Acceptée</span>',
      rejected: '<span class="status-badge danger">Rejetée</span>'
    };

    const userPromises = pageItems.map((c) => {
      if (!c.userId) return Promise.resolve({ ...c, candidateName: "Candidat #" + c.id, candidateEmail: "", photoURL: "" });
      return getUserInfo(c.userId).then((info) => ({ ...c, candidateName: info.name, candidateEmail: info.email, photoURL: info.photoURL }));
    });

    Promise.all(userPromises).then((enriched) => {
      tbody.innerHTML = enriched.map((c) => {
        const userId = c.userId || "";
        const avatarUrl = (c.photoURL && c.photoURL.trim())
          ? c.photoURL
          : "https://i.pravatar.cc/64?u=" + encodeURIComponent(userId || c.candidateName);

        return `
          <tr>
            <td>
              <div class="user-cell">
                <img src="${avatarUrl}" alt="${escapeHtml(c.candidateName)}">
                <div>
                  <div class="user-cell-name">${escapeHtml(c.candidateName)}</div>
                  <div class="user-cell-email">${escapeHtml(c.candidateEmail)}</div>
                </div>
              </div>
            </td>
            <td>${escapeHtml(c.title || "—")}</td>
            <td>${statusMap[c.status] || c.status || "—"}</td>
            <td>${c.date || "—"}</td>
            <td><a class="cand-view-btn" data-cand-id="${c.id}" data-action="view-cv">Voir CV</a></td>
            <td><a class="cand-view-btn" data-cand-id="${c.id}" data-action="view-letter">Voir lettre</a></td>
            <td class="cand-action-cell">
              ${c.status !== "accepted" ? `<button class="cand-action-btn accept" data-cand-id="${c.id}" data-action="accept" title="Accepter">Accepter</button>` : ""}
              ${c.status !== "rejected" ? `<button class="cand-action-btn reject" data-cand-id="${c.id}" data-action="reject" title="Rejeter">Rejeter</button>` : ""}
              ${c.status === "accepted" ? `<button class="cand-action-btn message" data-user-id="${userId}" data-action="message" title="Envoyer un message">Message</button>` : ""}
            </td>
          </tr>
        `;
      }).join("");

      tbody.querySelectorAll("[data-action='view-cv']").forEach((btn) => {
        btn.addEventListener("click", () => openCandDocument(btn.dataset.candId, "cv"));
      });
      tbody.querySelectorAll("[data-action='view-letter']").forEach((btn) => {
        btn.addEventListener("click", () => openCandDocument(btn.dataset.candId, "letter"));
      });
      tbody.querySelectorAll("[data-action='accept']").forEach((btn) => {
        btn.addEventListener("click", () => updateCandStatus(btn.dataset.candId, "accepted", "Acceptée"));
      });
      tbody.querySelectorAll("[data-action='reject']").forEach((btn) => {
        btn.addEventListener("click", () => updateCandStatus(btn.dataset.candId, "rejected", "Rejetée"));
      });
      tbody.querySelectorAll("[data-action='message']").forEach((btn) => {
        btn.addEventListener("click", () => openMessageModal(btn.dataset.userId));
      });
    });
  }).catch((err) => {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:30px;color:#ef4444;">Erreur de chargement: ${err.message || err.code}</td></tr>`;
  });
}

function openCandDocument(candId, type) {
  const cand = allCandidatures.find((c) => c.id === candId);
  if (!cand || !cand.userId) return;

  const overlay = document.getElementById("candDocOverlay");
  const body = document.getElementById("candDocBody");
  const title = document.getElementById("candDocTitle");
  if (!overlay || !body || !title) return;

  title.textContent = type === "cv" ? "CV du candidat" : "Lettre de motivation";
  body.innerHTML = `<div class="cand-empty">Chargement du document...</div>`;
  overlay.classList.add("active");

  const field = type === "cv" ? "cvUrl" : "coverLetterUrl";
  firebase.database().ref("users/" + cand.userId + "/candidatures/" + field).once("value").then((snap) => {
    const url = snap.val();
    if (!url) {
      body.innerHTML = `<div class="cand-empty">Aucun document disponible.</div>`;
      return;
    }
    if (url.match(/\.(pdf|jpg|jpeg|png|gif|webp)$/i)) {
      body.innerHTML = `<iframe src="${escapeHtml(url)}" style="width:100%;height:70vh;border:none;border-radius:12px;"></iframe>`;
    } else {
      body.innerHTML = `<a href="${escapeHtml(url)}" target="_blank" rel="noopener" class="btn-primary" style="display:inline-block;margin-top:12px;">Ouvrir le document</a>`;
    }
  }).catch(() => {
    body.innerHTML = `<div class="cand-empty">Impossible de charger le document.</div>`;
  });
}

function updateCandStatus(candId, status, statusLabel) {
  if (!confirm("Marquer cette candidature comme \"" + statusLabel + "\" ?")) return;

  firebase.database().ref("candidatures/" + candId).update({ status, statusLabel })
    .then(() => {
      renderCandidatures();
      showToast("Candidature " + statusLabel.toLowerCase());
      if (typeof loadUsersFromFirebase === 'function') {
        loadUsersFromFirebase();
      }
    })
    .catch((err) => alert("Échec de la mise à jour : " + (err.message || err.code)));
}

function openCandidatureDetail(candId) {
  const cand = allCandidatures.find((c) => c.id === candId);
  if (!cand) return;

  const overlay = document.getElementById("candDetailOverlay");
  const body = document.getElementById("candDetailBody");
  const title = document.getElementById("candDetailTitle");
  if (!overlay || !body || !title) return;

   title.textContent = "Détails de la candidature";
   body.innerHTML = `
     <div class="admin-user-profile-head">
       <img src="https://i.pravatar.cc/96?img=5" alt="${escapeHtml(cand.candidateName || "Candidat")}" id="candDetailAvatar">
       <div>
         <div class="admin-user-profile-name">${escapeHtml(cand.candidateName || "Chargement...")}</div>
         <div class="admin-user-profile-email">${escapeHtml(cand.candidateEmail || "")}</div>
       </div>
     </div>
    <div class="admin-modal-row"><span>Offre</span><strong>${escapeHtml(cand.title || "—")}</strong></div>
    <div class="admin-modal-row"><span>Entreprise</span><strong>${escapeHtml(cand.company || "—")}</strong></div>
    <div class="admin-modal-row"><span>Statut</span><strong>${escapeHtml(cand.statusLabel || cand.status || "—")}</strong></div>
    <div class="admin-modal-row"><span>Date</span><strong>${escapeHtml(cand.date || "—")}</strong></div>
    <div class="admin-modal-row"><span>ID Candidature</span><strong>${escapeHtml(cand.id || "—")}</strong></div>
    <div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap;">
      <button class="cand-action-btn accept" data-action="accept" data-cand-id="${cand.id}">Accepter</button>
      <button class="cand-action-btn reject" data-action="reject" data-cand-id="${cand.id}">Rejeter</button>
      ${cand.status === "accepted" ? `<button class="cand-action-btn message" data-action="message" data-user-id="${cand.userId}">Envoyer un message</button>` : ""}
    </div>
  `;

  overlay.classList.add("active");

   if (cand.userId) {
     getUserInfo(cand.userId).then((info) => {
       const avatarEl = body.querySelector("#candDetailAvatar");
       if (avatarEl && info.photoURL) {
         avatarEl.src = info.photoURL;
       }
       const nameEl = body.querySelector(".admin-user-profile-name");
       if (nameEl) nameEl.textContent = info.name;
       const emailEl = body.querySelector(".admin-user-profile-email");
       if (emailEl) emailEl.textContent = info.email;
     });
   }

  body.querySelectorAll("[data-action='accept']").forEach((btn) => {
    btn.addEventListener("click", () => {
      updateCandStatus(btn.dataset.candId, "accepted", "Acceptée");
      overlay.classList.remove("active");
    });
  });
  body.querySelectorAll("[data-action='reject']").forEach((btn) => {
    btn.addEventListener("click", () => {
      updateCandStatus(btn.dataset.candId, "rejected", "Rejetée");
      overlay.classList.remove("active");
    });
  });
  body.querySelectorAll("[data-action='message']").forEach((btn) => {
    btn.addEventListener("click", () => {
      overlay.classList.remove("active");
      openMessageModal(btn.dataset.userId);
    });
  });
}

function openMessageModal(userId) {
  if (!userId) return;

  const overlay = document.getElementById("candMessageOverlay");
  const form = document.getElementById("candMessageForm");
  if (!overlay || !form) return;

  overlay.classList.add("active");
  form.reset();

  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = "Envoi...";
  submitBtn.disabled = true;

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = (form.message.value || "").toString().trim();
    if (!text) return;

    const messageData = { text, type: "text" };

    saveMessageToFirebase(userId, messageData)
      .then(() => {
        showToast("Message envoyé");
        overlay.classList.remove("active");
      })
      .catch((err) => {
        console.error("Erreur envoi message:", err);
        showToast("Erreur lors de l'envoi");
      })
      .finally(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        form.removeEventListener("submit", handleSubmit);
      });
  };

  form.addEventListener("submit", handleSubmit);
}

const candDetailOverlay = document.getElementById("candDetailOverlay");
if (candDetailOverlay) {
  candDetailOverlay.addEventListener("click", (e) => {
    if (e.target === candDetailOverlay) candDetailOverlay.classList.remove("active");
  });
}

const candDetailClose = document.getElementById("candDetailClose");
if (candDetailClose) {
  candDetailClose.addEventListener("click", () => {
    const overlay = document.getElementById("candDetailOverlay");
    if (overlay) overlay.classList.remove("active");
  });
}

const candMessageOverlay = document.getElementById("candMessageOverlay");
if (candMessageOverlay) {
  candMessageOverlay.addEventListener("click", (e) => {
    if (e.target === candMessageOverlay) candMessageOverlay.classList.remove("active");
  });
}

const candMessageClose = document.getElementById("candMessageClose");
if (candMessageClose) {
  candMessageClose.addEventListener("click", () => {
    const overlay = document.getElementById("candMessageOverlay");
    if (overlay) overlay.classList.remove("active");
  });
}

const candMessageCancel = document.getElementById("candMessageCancel");
if (candMessageCancel) {
  candMessageCancel.addEventListener("click", () => {
    const overlay = document.getElementById("candMessageOverlay");
    if (overlay) overlay.classList.remove("active");
  });
}

const candDocClose = document.getElementById("candDocClose");
if (candDocClose) {
  candDocClose.addEventListener("click", () => {
    const overlay = document.getElementById("candDocOverlay");
    if (overlay) overlay.classList.remove("active");
  });
}

const candDocOverlay = document.getElementById("candDocOverlay");
if (candDocOverlay) {
  candDocOverlay.addEventListener("click", (e) => {
    if (e.target === candDocOverlay) candDocOverlay.classList.remove("active");
  });
}

const candJobSearchEl = document.getElementById("candJobSearch");
if (candJobSearchEl) candJobSearchEl.addEventListener("input", loadCandidatureJobs);

  const candBackBtn = document.getElementById("candBackBtn");
  if (candBackBtn) {
    candBackBtn.addEventListener("click", () => {
      candSelectedJobId = null;
      candCurrentPage = 1;
      const jobsPanel = document.querySelector(".cand-jobs-panel");
      const listPanel = document.getElementById("candListPanel");
      if (jobsPanel) jobsPanel.style.display = "block";
      if (listPanel) listPanel.style.display = "none";
    });
  }

const candSearchEl = document.getElementById("candSearch");
if (candSearchEl) candSearchEl.addEventListener("input", () => { candCurrentPage = 1; renderCandidatures(); });

const candFilterEl = document.getElementById("candFilter");
if (candFilterEl) candFilterEl.addEventListener("change", () => { candCurrentPage = 1; renderCandidatures(); });

const logoutForm = document.getElementById("logoutForm");
if (logoutForm) {
  logoutForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (firebase.auth().currentUser) {
      firebase.auth().signOut();
    }
    logoutForm.submit();
  });
}

// ============== CHARGEMENT DONNÉES DASHBOARD ==============
function computeDailyCounts(items, daysArr) {
  const counts = new Array(daysArr.length).fill(0);
  daysArr.forEach((d, idx) => {
    const next = idx + 1 < daysArr.length ? daysArr[idx + 1].date : d.date + 86400000;
    counts[idx] = items.filter(item => {
      const t = item.createdAt || 0;
      return t >= d.date && t < next;
    }).length;
  });
  return counts;
}

function loadDashboardData() {
  const user = firebase.auth().currentUser;
  if (!user) {
    renderKPIs();
    renderAppsChart();
    renderSourceDonut();
    return;
  }

  const db = firebase.database();
  const days = getLast7Days();

  db.ref("jobs").orderByChild("createdBy").equalTo(user.uid).once("value").then((jobSnap) => {
    const jobsData = jobSnap.val() || {};
    const jobs = Object.keys(jobsData).map(id => ({ id, ...jobsData[id] }));
    const jobIds = new Set(jobs.map(j => j.id));

    const activeJobs = jobs.filter(j => (j.status || "active") === "active");
    const totalViews = jobs.reduce((sum, j) => sum + (j.views || 0), 0);

    return db.ref("candidatures").once("value").then((candSnap) => {
      const candData = candSnap.val() || {};
      const candidatures = Object.keys(candData).map(id => ({ id, ...candData[id] }));
      const userCands = candidatures.filter(c => jobIds.has(c.jobId));

      const responded = userCands.filter(c => c.status === "accepted" || c.status === "rejected").length;
      const responseRate = userCands.length > 0
        ? Math.round((responded / userCands.length) * 100) : 0;

      const dailyApps = computeDailyCounts(userCands, days);

      const today = new Date();
      const dailyViewsArr = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        const dayEnd = dayStart + 86400000;
        const count = jobs.filter(j => {
          const t = j.createdAt || 0;
          return t >= dayStart && t < dayEnd;
        }).reduce((sum, j) => sum + (j.views || 0), 0);
        dailyViewsArr.push(count);
      }

      const prevApps = dailyApps[dailyApps.length - 2] || 0;
      const lastApps = dailyApps[dailyApps.length - 1] || 0;
      const appsTrendUp = lastApps >= prevApps;
      const appsTrendPct = prevApps > 0 ? Math.round(((lastApps - prevApps) / prevApps) * 100) : (lastApps > 0 ? 100 : 0);

      kpis[0].value = String(activeJobs.length);
      kpis[0].trend = `+${dailyApps[dailyApps.length - 1]}`;
      kpis[0].up = true;
      kpis[0].spark = dailyApps.map(v => Math.max(v, 1));

      kpis[1].value = String(userCands.length);
      kpis[1].trend = appsTrendPct > 0 ? `+${appsTrendPct}%` : `${appsTrendPct}%`;
      kpis[1].up = appsTrendUp;
      kpis[1].spark = dailyApps.map(v => Math.max(v, 1));

      kpis[2].value = totalViews > 0 ? String(totalViews) : "0";
      kpis[2].spark = dailyViewsArr.map(v => Math.max(v, 1));
      kpis[2].trend = `+${dailyViewsArr[dailyViewsArr.length - 1]}`;
      kpis[2].up = true;

      kpis[3].value = `${responseRate}%`;
      kpis[3].up = responseRate >= 50;
      kpis[3].trend = responseRate >= 50 ? `+${responseRate}%` : `${responseRate}%`;
      const dailyResponse = days.map((d, idx) => {
        const next = idx + 1 < days.length ? days[idx + 1].date : d.date + 86400000;
        const dayCands = userCands.filter(c => {
          const t = c.createdAt || 0;
          return t >= d.date && t < next;
        });
        const dayResponded = dayCands.filter(c => c.status === "accepted" || c.status === "rejected").length;
        return dayCands.length > 0 ? Math.round((dayResponded / dayCands.length) * 100) : 0;
      });
      kpis[3].spark = dailyResponse.map(v => Math.max(v, 1));
      kpis[3].sparkMin = Math.min(...dailyResponse, 1);
      kpis[3].sparkMax = Math.max(...dailyResponse, 100);

      appsData.labels = days.map(d => d.label);
      appsData.applications = dailyApps;
      appsData.views = dailyViewsArr;

      const sourceMap = {};
      userCands.forEach(c => {
        const job = jobs.find(j => j.id === c.jobId);
        if (job) {
          const src = (job.sourceName || "Candidature directe").trim();
          sourceMap[src] = (sourceMap[src] || 0) + 1;
        }
      });

      if (Object.keys(sourceMap).length > 0) {
        const colorMap = {
          "Recherche VERA": "#0ea5e9",
          "Recommandé par IA": "#22c55e",
          "Candidature directe": "#8b5cf6",
          "Réseau / Partage": "#f59e0b"
        };
        sourceData.length = 0;
        Object.entries(sourceMap).forEach(([label, value]) => {
          sourceData.push({
            label,
            color: colorMap[label] || "#6b7280",
            value
          });
        });
      }

      renderKPIs();
      renderAppsChart();
      renderSourceDonut();
    });
  }).catch((err) => {
    console.error("[ENTREPRISE] Erreur chargement dashboard:", err);
    renderKPIs();
    renderAppsChart();
    renderSourceDonut();
  });
}

// ============== PARAMETRES ENTREPRISE ==============
function loadEntrepriseSettings() {
  const user = firebase.auth().currentUser;
  if (!user) return;

  const ref = firebase.database().ref("users/" + user.uid);
  ref.once("value").then((snap) => {
    const d = snap.val() || {};
    const companyName = d.companyName || d.fullName || d.displayName || d.firstName || "";
    const sector = d.sector || "";
    const companySize = d.companySize || "";
    const website = d.website || "";
    const description = d.description || "";
    const address = d.address || "";
    const city = d.city || "";
    const photoURL = d.photoURL || "";

    if (document.getElementById("paramCompanyName")) document.getElementById("paramCompanyName").value = companyName;
    if (document.getElementById("paramSector")) document.getElementById("paramSector").value = sector;
    if (document.getElementById("paramCompanySize")) document.getElementById("paramCompanySize").value = companySize;
    if (document.getElementById("paramWebsite")) document.getElementById("paramWebsite").value = website;
    if (document.getElementById("paramDescription")) document.getElementById("paramDescription").value = description;
    if (document.getElementById("paramAddress")) document.getElementById("paramAddress").value = address;
    if (document.getElementById("paramCity")) document.getElementById("paramCity").value = city;

    if (photoURL) {
      const avatarImg = document.getElementById("entrepriseAvatarImg");
      const previewImg = document.getElementById("previewAvatarImg");
      const sidebarLogo = document.getElementById("sidebarCompanyLogo");
      const topbarImg = document.getElementById("topbarUserImg");
      if (avatarImg) avatarImg.src = photoURL;
      if (previewImg) previewImg.src = photoURL;
      if (sidebarLogo) sidebarLogo.src = photoURL;
      if (topbarImg) topbarImg.src = photoURL;
    }

    const sidebarName = document.getElementById("sidebarCompanyName");
    if (sidebarName) sidebarName.textContent = companyName || "Nom de l'entreprise";

    if (document.getElementById("previewName")) document.getElementById("previewName").textContent = companyName || "Nom de l'entreprise";
    if (document.getElementById("previewSector")) document.getElementById("previewSector").textContent = sector || "Secteur";
    if (document.getElementById("previewCity")) document.getElementById("previewCity").textContent = city || "Ville";
  }).catch((err) => console.error("[PARAMETRES] Erreur chargement:", err));
}

const entrepriseForm = document.getElementById("entrepriseForm");
if (entrepriseForm) {
  entrepriseForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = firebase.auth().currentUser;
    if (!user) return;

    const fd = new FormData(entrepriseForm);
    const payload = {
      companyName: (fd.get("companyName") || "").toString().trim(),
      sector: (fd.get("sector") || "").toString().trim(),
      companySize: (fd.get("companySize") || "").toString().trim(),
      website: (fd.get("website") || "").toString().trim(),
      description: (fd.get("description") || "").toString().trim(),
      address: (fd.get("address") || "").toString().trim(),
      city: (fd.get("city") || "").toString().trim(),
      fullName: (fd.get("companyName") || "").toString().trim(),
      updatedAt: Date.now()
    };

    firebase.database().ref("users/" + user.uid).update(payload)
      .then(() => {
        showToast("Informations mises à jour avec succès");
        if (document.getElementById("previewName")) document.getElementById("previewName").textContent = payload.companyName || "Nom de l'entreprise";
        if (document.getElementById("previewSector")) document.getElementById("previewSector").textContent = payload.sector || "Secteur";
        if (document.getElementById("previewCity")) document.getElementById("previewCity").textContent = payload.city || "Ville";
        const sidebarName = document.getElementById("sidebarCompanyName");
        if (sidebarName) sidebarName.textContent = payload.companyName || "Nom de l'entreprise";
      })
      .catch((err) => {
        console.error("[PARAMETRES] Erreur sauvegarde:", err);
        showToast("Erreur lors de la sauvegarde");
      });
  });
}

const paramCancel = document.getElementById("paramCancel");
if (paramCancel) {
  paramCancel.addEventListener("click", () => loadEntrepriseSettings());
}

const entrepriseLogoBtn = document.getElementById("entrepriseLogoBtn");
const entrepriseLogoInput = document.getElementById("entrepriseLogoInput");
if (entrepriseLogoBtn && entrepriseLogoInput) {
  entrepriseLogoBtn.addEventListener("click", () => entrepriseLogoInput.click());
  entrepriseLogoInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Le fichier est trop volumineux (max 2 Mo).");
      return;
    }
    const user = firebase.auth().currentUser;
    if (!user) return;

    const formData = new FormData();
    formData.append("logo", file);

    fetch("/upload-logo.php", { method: "POST", body: formData })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.url) {
          return firebase.database().ref("users/" + user.uid).update({ photoURL: data.url }).then(() => {
            const avatarImg = document.getElementById("entrepriseAvatarImg");
            const previewImg = document.getElementById("previewAvatarImg");
            const sidebarLogo = document.getElementById("sidebarCompanyLogo");
            const topbarImg = document.getElementById("topbarUserImg");
            if (avatarImg) avatarImg.src = data.url;
            if (previewImg) previewImg.src = data.url;
            if (sidebarLogo) sidebarLogo.src = data.url;
            if (topbarImg) topbarImg.src = data.url;
            showToast("Photo de profil mise à jour");
          });
        }
        throw new Error(data.error || "Erreur upload");
      })
      .catch((err) => {
        console.error("[PARAMETRES] Erreur upload logo:", err);
        showToast("Échec de l'upload : " + err.message);
      });
  });
}

const passwordForm = document.getElementById("passwordForm");
if (passwordForm) {
  passwordForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = firebase.auth().currentUser;
    if (!user) return;

    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (newPassword !== confirmPassword) {
      showToast("Les mots de passe ne correspondent pas");
      return;
    }
    if (newPassword.length < 6) {
      showToast("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);
    user.reauthenticateWithCredential(credential)
      .then(() => user.updatePassword(newPassword))
      .then(() => {
        showToast("Mot de passe mis à jour avec succès");
        passwordForm.reset();
      })
      .catch((err) => {
        console.error("[PARAMETRES] Erreur mot de passe:", err);
        if (err.code === "auth/wrong-password") {
          showToast("Mot de passe actuel incorrect");
        } else {
          showToast("Erreur : " + (err.message || err.code));
        }
      });
  });
}

const passwordCancel = document.getElementById("passwordCancel");
if (passwordCancel) {
  passwordCancel.addEventListener("click", () => {
    document.getElementById("currentPassword").value = "";
    document.getElementById("newPassword").value = "";
    document.getElementById("confirmPassword").value = "";
  });
}

// ============== INIT ==============
if (firebase.auth().currentUser) {
  loadDashboardData();
} else {
  firebase.auth().onAuthStateChanged(() => {
    setTimeout(loadDashboardData, 500);
  });
}
renderJobs();
renderCandidates();
renderTalents();
renderInterviews();
