// ============== GARDE DE SESSION (ADMIN) ==============
let adminAuthFirstCall = true;

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

firebase.auth().onAuthStateChanged((user) => {
  console.log("[ADMIN] onAuthStateChanged firstCall=", adminAuthFirstCall, "user=", user ? user.uid : "null");

  if (adminAuthFirstCall) {
    adminAuthFirstCall = false;
    if (!user) {
      console.log("[ADMIN] premier appel sans user, j'attends la restauration Firebase...");
      return;
    }
    console.log("[ADMIN] premier appel avec user, je continue");
  } else if (!user) {
    console.log("[ADMIN] user null hors premier appel, redirection vers /");
    window.location.replace("/");
    return;
  }

  firebase.database().ref("users/" + user.uid).once("value").then((snapshot) => {
    const data = snapshot.val() || {};
    const role = (data.role || "").toString().toLowerCase();
    console.log("[ADMIN] rôle lu dans Firebase:", role, "données:", data);

    if (role !== "admin") {
      console.log("[ADMIN] rôle non admin, redirection vers /tableau-de-bord");
      window.location.replace("/tableau-de-bord");
      return;
    }

    console.log("[ADMIN] accès admin autorisé, initialisation du panel");
    initAdminPanel(data);
  }).catch((error) => {
    console.log("[ADMIN] erreur lors de la lecture Firebase:", error);
    window.location.replace("/tableau-de-bord");
  });
});

function initAdminPanel(data) {
  renderAdminKPIs();
  renderAdminUsers();
  renderAdminCharts();
}

function renderAdminKPIs() {
  const kpis = [
    { label: "Utilisateurs", value: "4 218", sub: "+12% ce mois", icon: "👥", color: "blue" },
    { label: "Offres publiées", value: "1 546", sub: "+8% ce mois", icon: "💼", color: "mint" },
    { label: "Candidatures", value: "8 932", sub: "+15% ce mois", icon: "📄", color: "purple" },
    { label: "Revenus", value: "124 500 €", sub: "+22% ce mois", icon: "💳", color: "green" }
  ];

  const grid = document.getElementById("kpiGrid");
  if (!grid) return;

  grid.innerHTML = kpis.map(kpi => `
    <div class="kpi-card">
      <div class="kpi-icon ${kpi.color}">${kpi.icon}</div>
      <div>
        <div class="kpi-value">${kpi.value}</div>
        <div class="kpi-label">${kpi.label}</div>
        <div class="kpi-sub">${kpi.sub}</div>
      </div>
    </div>
  `).join("");
}

function renderAdminUsers() {
  const users = [
    { name: "Marie Dupont", role: "Candidat", date: "12 Jan 2026", status: "actif" },
    { name: "Jean Koffi", role: "Recruteur", date: "10 Jan 2026", status: "actif" },
    { name: "Sophie Martin", role: "Candidat", date: "08 Jan 2026", status: "attente" },
    { name: "Luc Adeyemi", role: "Candidat", date: "05 Jan 2026", status: "actif" },
    { name: "Emma Bernard", role: "Recruteur", date: "03 Jan 2026", status: "suspendu" },
    { name: "Thomas Kouassi", role: "Candidat", date: "01 Jan 2026", status: "actif" }
  ];

  const tbody = document.getElementById("userTableBody");
  if (!tbody) return;

  const statusMap = {
    actif: '<span class="status-badge success">Actif</span>',
    attente: '<span class="status-badge warning">En attente</span>',
    suspendu: '<span class="status-badge danger">Suspendu</span>'
  };

  tbody.innerHTML = users.map(user => `
    <tr>
      <td>
        <div class="user-cell">
          <div class="user-avatar-sm">${user.name.charAt(0)}</div>
          <span>${user.name}</span>
        </div>
      </td>
      <td>${user.role}</td>
      <td>${user.date}</td>
      <td>${statusMap[user.status] || user.status}</td>
      <td>
        <button class="table-action-btn">⋯</button>
      </td>
    </tr>
  `).join("");
}

function renderAdminCharts() {
  const growthChart = document.getElementById("growthChart");
  if (growthChart) {
    const points = "0,180 40,160 80,140 120,150 160,100 200,90 240,80 280,85 320,50 360,40 400,60 440,30 480,25 520,35 560,20 600,15";
    growthChart.innerHTML = `
      <polyline fill="none" stroke="#3b6bf5" stroke-width="3" points="${points}" />
      <polyline fill="none" stroke="#12b3c9" stroke-width="3" points="${points.replace(/180/g, "200").replace(/160/g, "180").replace(/140/g, "160").replace(/150/g, "170").replace(/100/g, "120").replace(/90/g, "110").replace(/80/g, "100").replace(/85/g, "105").replace(/50/g, "70").replace(/40/g, "60").replace(/60/g, "80").replace(/30/g, "50").replace(/25/g, "45").replace(/35/g, "55").replace(/20/g, "40").replace(/15/g, "35")}" />
    `;
  }

  const donut = document.getElementById("categoryDonut");
  if (donut) {
    const segments = [
      { percent: 35, color: "#3b6bf5", label: "Tech" },
      { percent: 25, color: "#12b3c9", label: "Marketing" },
      { percent: 20, color: "#f59e0b", label: "Finance" },
      { percent: 20, color: "#10b981", label: "Autre" }
    ];

    let currentAngle = -90;
    let paths = "";
    const radius = 50;
    const innerRadius = 35;

    segments.forEach(seg => {
      const angle = (seg.percent / 100) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle = endAngle;

      const x1 = 60 + radius * Math.cos((startAngle * Math.PI) / 180);
      const y1 = 60 + radius * Math.sin((startAngle * Math.PI) / 180);
      const x2 = 60 + radius * Math.cos((endAngle * Math.PI) / 180);
      const y2 = 60 + radius * Math.sin((endAngle * Math.PI) / 180);
      const x3 = 60 + innerRadius * Math.cos((endAngle * Math.PI) / 180);
      const y3 = 60 + innerRadius * Math.sin((endAngle * Math.PI) / 180);
      const x4 = 60 + innerRadius * Math.cos((startAngle * Math.PI) / 180);
      const y4 = 60 + innerRadius * Math.sin((startAngle * Math.PI) / 180);

      const largeArc = angle > 180 ? 1 : 0;
      const pathData = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;

      paths += `<path d="${pathData}" fill="${seg.color}" stroke="#fff" stroke-width="2"/>`;
    });

    donut.innerHTML = paths;
  }

  const legend = document.getElementById("categoryLegend");
  if (legend) {
    const categories = [
      { label: "Tech", count: 542, color: "#3b6bf5" },
      { label: "Marketing", count: 386, color: "#12b3c9" },
      { label: "Finance", count: 309, color: "#f59e0b" },
      { label: "Autre", count: 309, color: "#10b981" }
    ];

    legend.innerHTML = categories.map(cat => `
      <li class="legend-item">
        <span class="legend-dot" style="background:${cat.color}"></span>
        <span>${cat.label}</span>
        <span class="legend-count">${cat.count}</span>
      </li>
    `).join("");
  }
}

document.querySelectorAll(".nav-item").forEach(item => {
  item.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));
    item.classList.add("active");

    const panel = item.getAttribute("data-panel");
    if (panel) {
      document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
      const target = document.getElementById("panel-" + panel);
      if (target) target.classList.add("active");

      if (panel === "offres") {
        setTimeout(() => renderJobs(), 50);
      }
    }
  });
});

// ============== CRUD OFFRES D'EMPLOI ==============
function jobRef() {
  const user = firebase.auth().currentUser;
  if (!user) {
    console.warn("[JOBS] aucun utilisateur Firebase connecté");
  }
  return user ? firebase.database().ref("jobs") : null;
}

function renderJobs() {
  const tbody = document.getElementById("jobTableBody");
  const countEl = document.getElementById("jobTableCount");
  const search = document.getElementById("jobSearch");
  const filter = document.getElementById("jobFilter");
  if (!tbody) {
    console.warn("[JOBS] jobTableBody introuvable");
    return;
  }

  const ref = jobRef();
  if (!ref) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:30px;color:#ef4444;">Vous devez être connecté pour voir les offres.</td></tr>`;
    return;
  }

  console.log("[JOBS] renderJobs lancé");
  const q = search ? search.value.trim().toLowerCase() : "";
  const statusFilter = filter ? filter.value : "all";

  ref.once("value").then((snapshot) => {
    const data = snapshot.val() || {};
    const items = Object.keys(data).map((id) => ({ id, ...data[id] }))
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

    tbody.innerHTML = "";
    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:30px;color:#6b7280;">Aucune offre trouvée.</td></tr>`;
      if (countEl) countEl.textContent = "Affichage de 0 offre";
      return;
    }

    if (countEl) countEl.textContent = `Affichage de ${filtered.length} offre${filtered.length > 1 ? "s" : ""}`;

    const statusMap = {
      active: '<span class="status-badge success">Active</span>',
      inactive: '<span class="status-badge danger">Inactive</span>'
    };

    filtered.forEach((job) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
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
  }).catch((err) => {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:30px;color:#ef4444;">Erreur de chargement: ${err.message || err.code}</td></tr>`;
  });
}

function deleteJob(id) {
  if (!confirm("Supprimer cette offre d'emploi ?")) return;
  const ref = jobRef();
  if (!ref) return;
  ref.child(id).remove()
    .then(() => renderJobs())
    .catch((err) => alert("Échec de la suppression : " + (err.message || err.code)));
}

let jobEditId;

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
    status: (fd.get("status") || "active").toString().trim()
  };

  const logoFile = e.target.querySelector('input[name="logo"]').files[0];
  const ref = jobRef();
  if (!ref) {
    alert("Vous devez être connecté pour enregistrer une offre.");
    return;
  }

  const saveRef = jobEditId ? ref.child(jobEditId) : ref.push();
  console.log("[JOBS] sauvegarde dans Firebase:", jobEditId ? "update" : "create", "key:", saveRef.key, "payload:", payload);

  let task = saveRef.set(payload).catch((err) => {
    console.error("[JOBS] erreur set:", err);
    alert("Échec de l'enregistrement : " + (err.message || err.code));
    throw err;
  });

  if (logoFile) {
    const user = firebase.auth().currentUser;
    if (user) {
      const storageRef = firebase.storage().ref("job-logos/" + user.uid + "/" + saveRef.key);
      storageRef.put(logoFile).then((snap) => snap.ref.getDownloadURL()).then((url) => {
        console.log("[JOBS] logo uploadé:", url);
        return saveRef.update({ logoURL: url });
      }).catch((err) => {
        console.warn("[JOBS] upload logo ignoré:", err.message || err.code);
      });
    }
  }

  saveRef.set(payload).then(() => {
    console.log("[JOBS] enregistrement OK");
    closeJobForm();
    renderJobs();
  }).catch((err) => {
    console.error("[JOBS] erreur finale:", err);
    alert("Échec de l'enregistrement : " + (err.message || err.code));
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
