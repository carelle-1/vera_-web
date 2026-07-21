// ============== DONNÉES ==============
let jobs = [];
let filteredJobs = [];
let selectedJobId = null;
let currentSort = "pertinence";
let oppCurrentPage = 1;
const OPP_JOBS_PER_PAGE = 5;

function getDaysSince(timestamp) {
  const now = new Date();
  const created = new Date(timestamp);
  const diffMs = now - created;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "aujourd'hui";
  if (diffDays === 1) return "1 jour";
  return `${diffDays} jours`;
}

function normalize(text) {
  return (text || "").toString().trim().toLowerCase();
}

function userSkillNames(skills) {
  if (!skills || typeof skills !== "object") return [];
  return Object.values(skills)
    .map((s) => normalize(s && s.name ? s.name : ""))
    .filter(Boolean);
}

function jobSkillNames(job) {
  const raw = job && job.skills ? job.skills : "";
  return raw.split(",").map((s) => normalize(s)).filter(Boolean);
}

function textContainsAny(text, keywords) {
  const hay = normalize(text);
  return keywords.some((k) => hay.includes(k));
}

function calculateJobCompatibility(userData, job) {
  const userSkills = userSkillNames(userData.skills);
  const requiredSkills = jobSkillNames(job);
  if (!requiredSkills.length) return 100;

  let matchCount = 0;
  requiredSkills.forEach((req) => {
    if (userSkills.some((us) => us === req || us.includes(req) || req.includes(us))) {
      matchCount++;
    }
  });

  const skillsPct = Math.round((matchCount / requiredSkills.length) * 100);

  const experiences = Array.isArray(userData.experiences) ? userData.experiences : [];
  const formations = Array.isArray(userData.formations) ? userData.formations : [];
  const certifications = Array.isArray(userData.certifications) ? userData.certifications : [];

  const experienceText = [
    userData.jobTitle,
    userData.about,
    ...experiences.map((e) => [e.title, e.company, e.description].join(" "))
  ].join(" ");

  const formationText = [
    ...formations.map((f) => [f.diploma, f.school, f.description].join(" "))
  ].join(" ");

  const certificationText = [
    ...certifications.map((c) => [c.title, c.issuer, c.description].join(" "))
  ].join(" ");

  let bonus = 0;
  if (textContainsAny(experienceText, requiredSkills)) bonus += 5;
  if (textContainsAny(formationText, requiredSkills)) bonus += 5;
  if (textContainsAny(certificationText, requiredSkills)) bonus += 5;

  let score = skillsPct + bonus;
  if (score > 100) score = 100;
  if (score < 0) score = 0;
  return score;
}

function loadJobsFromFirebase() {
  return firebase.database().ref("jobs").once("value").then((snapshot) => {
    const data = snapshot.val() || {};
    jobs = Object.keys(data).map((id) => ({ id, ...data[id] }));
    filteredJobs = [...jobs];
    console.log("[OPPO] jobs chargés:", jobs.length);
    if (jobs.length > 0 && !selectedJobId) {
      selectedJobId = jobs[0].id;
    }
    if (jobs.length === 0) {
      jobs = getDemoJobs();
      filteredJobs = [...jobs];
      if (!selectedJobId && jobs.length > 0) {
        selectedJobId = jobs[0].id;
      }
    }
    return jobs;
  }).catch((err) => {
    console.error("[OPPO] erreur chargement jobs:", err);
    jobs = getDemoJobs();
    filteredJobs = [...jobs];
    if (!selectedJobId && jobs.length > 0) {
      selectedJobId = jobs[0].id;
    }
    return jobs;
  });
}

function getDemoJobs() {
  return [
    {
      id: "demo1",
      logo: "N",
      logoBg: "#000000",
      title: "Product Designer UI/UX",
      company: "Notion Labs",
      location: "Remote",
      country: "Remote",
      contractType: "CDI",
      salary: "4 000 – 6 000 $",
      salaryMin: 4000,
      salaryMax: 6000,
      period: "par mois",
      skills: "Figma,Design System,Prototypage",
      createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
      match: 96,
      matchReasons: [
        "Tes compétences Figma correspondent à 95% aux besoins",
        "Ton expérience en Design System est directement recherchée",
        "Ta disponibilité correspond au mode de travail Remote"
      ]
    },
    {
      id: "demo2",
      logo: "∞",
      logoBg: "#0866ff",
      title: "Développeur Full Stack",
      company: "Meta",
      location: "Remote",
      country: "Remote",
      contractType: "CDI",
      salary: "5 500 – 8 000 $",
      salaryMin: 5500,
      salaryMax: 8000,
      period: "par mois",
      skills: "React,Node.js,TypeScript",
      createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
      match: 92,
      matchReasons: [
        "Ta stack React / Node.js correspond exactement à l'offre",
        "Ton niveau d'expérience correspond au poste",
        "Le mode Remote correspond à ta préférence"
      ]
    },
    {
      id: "demo3",
      logo: "S",
      logoBg: "#22c55e",
      title: "Chef de Projet Digital",
      company: "ShopMax",
      location: "Hybride",
      country: "Hybride",
      contractType: "CDD",
      salary: "3 500 – 5 000 $",
      salaryMin: 3500,
      salaryMax: 5000,
      period: "par mois",
      skills: "Agile,Scrum,Gestion de projet",
      createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
      match: 88,
      matchReasons: [
        "Ton expérience en gestion Agile correspond au besoin",
        "Ta localisation permet le mode Hybride",
        "Ton profil correspond au niveau intermédiaire requis"
      ]
    },
    {
      id: "demo4",
      logo: "H",
      logoBg: "#ff7a59",
      title: "Digital Marketing Specialist",
      company: "HubSpot",
      location: "Sur site",
      country: "Sur site",
      contractType: "Stage",
      salary: "3 000 – 4 500 $",
      salaryMin: 3000,
      salaryMax: 4500,
      period: "par mois",
      skills: "SEO,Google Ads,Analytics",
      createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
      match: 81,
      matchReasons: [
        "Tes compétences SEO correspondent à la mission",
        "Ton expérience en Google Ads est un atout apprécié",
        "Le salaire correspond à tes attentes"
      ]
    }
  ];
}

// ============== RENDU LISTE ==============
function renderJobs() {
  const list = document.getElementById("jobList");
  if (!list) return;
  list.innerHTML = "";

  const jobsToRender = filteredJobs.length > 0 ? filteredJobs : jobs;

  if (jobsToRender.length === 0) {
    list.innerHTML = `<div style="text-align:center;padding:40px;color:var(--muted);">Aucune offre pour le moment.</div>`;
    const resultCount = document.getElementById("resultCount");
    if (resultCount) resultCount.textContent = "0 offre trouvée";
    updatePagination(0);
    return;
  }

  let sorted = [...jobsToRender];
  if (currentSort === "recent") {
    sorted.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } else if (currentSort === "salaire") {
    sorted.sort((a, b) => {
      const salaryA = extractSalaryNumber(b.salary);
      const salaryB = extractSalaryNumber(a.salary);
      return salaryA - salaryB;
    });
  } else {
    sorted.sort((a, b) => (b.compatibility || b.match || 0) - (a.compatibility || a.match || 0));
  }

  const totalPages = Math.max(1, Math.ceil(sorted.length / OPP_JOBS_PER_PAGE));
  if (oppCurrentPage > totalPages) oppCurrentPage = totalPages;
  const start = (oppCurrentPage - 1) * OPP_JOBS_PER_PAGE;
  const pageJobs = sorted.slice(start, start + OPP_JOBS_PER_PAGE);

  pageJobs.forEach(job => {
    const el = document.createElement("article");
    el.className = "job" + (job.id === selectedJobId ? " selected" : "");
    el.dataset.id = job.id;

    const match = job.compatibility || job.match || 0;
    const circumference = 2 * Math.PI * 16;
    const offset = circumference - (match / 100) * circumference;

    const company = job.company || "—";
    const logoText = job.logo || (job.company || "?").charAt(0).toUpperCase();
    const logoBg = job.logoBg || "#e5e7eb";
    const title = job.title || "Sans titre";
    const location = job.location || job.country || "—";
    const locationTag = job.contractType || job.status || location;
    const salaryText = job.salary || "—";
    const salaryMin = job.salaryMin || 0;
    const salaryMax = job.salaryMax || 0;
    const period = job.period || "par mois";
    const tags = (job.skills || "").split(",").map((s) => s.trim()).filter(Boolean).slice(0, 3);
    const posted = job.createdAt ? getDaysSince(job.createdAt) : "—";

    const logoUrl = job.logoURL || "";
    const logoHtml = logoUrl
      ? `<img src="${logoUrl}" alt="${company}" style="width:100%;height:100%;object-fit:contain;">`
      : `<span style="font-weight:800;font-size:18px;color:#fff;">${logoText}</span>`;
    const logoStyle = logoUrl ? "" : `style="background:${logoBg}"`;

    el.innerHTML = `
      <div class="job-logo" ${logoStyle}>${logoHtml}</div>
      <div class="job-info">
        <div class="job-title">${title}</div>
        <div class="job-sub">${company} · <span class="tag">${locationTag}</span></div>
        <div class="job-tags">${tags.map(t => `<span>${t}</span>`).join("")}</div>
      </div>
      <div class="job-right">
        <div class="job-match" title="${match}% compatible">
          <svg viewBox="0 0 36 36">
            <circle class="job-match-bg" cx="18" cy="18" r="16"></circle>
            <circle class="job-match-fg" cx="18" cy="18" r="16"
              stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"></circle>
          </svg>
          <div class="job-match-num">${match}%</div>
        </div>
        <div class="job-price">${salaryMin > 0 && salaryMax > 0 ? salaryMin.toLocaleString("fr-FR") + " – " + salaryMax.toLocaleString("fr-FR") + " $" : salaryText}<span>${period}</span></div>
        <div class="job-meta">🕐 il y a ${posted}</div>
      </div>
    `;
    el.addEventListener("click", () => {
      selectedJobId = job.id;
      renderJobs();
      renderDetail();
    });
    list.appendChild(el);
  });

  const resultCount = document.getElementById("resultCount");
  if (resultCount) resultCount.textContent = `${sorted.length} offre${sorted.length > 1 ? 's' : ''} trouvée${sorted.length > 1 ? 's' : ''}`;

  updatePagination(totalPages);
}

function extractSalaryNumber(salaryText) {
  if (!salaryText) return 0;
  const numbers = salaryText.match(/[\d]+/g);
  if (!numbers || numbers.length === 0) return 0;
  const max = Math.max(...numbers.map(Number));
  return max;
}

// ============== RENDU PANNEAU DÉTAIL ==============
function renderDetail() {
  const job = jobs.find(j => j.id === selectedJobId);
  const panel = document.getElementById("detailPanel");
  if (!panel) return;

  if (!job) {
    panel.innerHTML = `<div style="text-align:center;padding:40px;color:var(--muted);">Sélectionnez une offre pour voir les détails.</div>`;
    return;
  }

  const match = job.compatibility || job.match || 0;
  const logoText = job.logo || (job.company || "?").charAt(0).toUpperCase();
  const logoBg = job.logoBg || "#e5e7eb";
  const company = job.company || "—";
  const title = job.title || "Sans titre";
  const location = job.location || job.country || "—";
  const salaryText = job.salary || "—";
  const salaryMin = job.salaryMin || 0;
  const salaryMax = job.salaryMax || 0;
  const period = job.period || "par mois";
  const matchReasons = job.matchReasons || [];
  const skills = typeof job.skills === "string" ? job.skills.split(",").map((s) => s.trim()).filter(Boolean) : (Array.isArray(job.skills) ? job.skills : []);

  const logoUrl = job.logoURL || "";
  const logoHtml = logoUrl
    ? `<img src="${logoUrl}" alt="${company}" style="width:100%;height:100%;object-fit:contain;">`
    : `<span style="font-weight:800;font-size:18px;color:#fff;">${logoText}</span>`;
  const logoStyle = logoUrl ? "" : `style="background:${logoBg}"`;

  panel.innerHTML = `
    <div class="detail-match">${match}% Compatible</div>
    <div class="detail-logo" ${logoStyle}>${logoHtml}</div>
    <div class="detail-title">${title}</div>
    <div class="detail-sub">${company} · ${location}</div>
    <div class="detail-price">${salaryMin > 0 && salaryMax > 0 ? salaryMin.toLocaleString("fr-FR") + " – " + salaryMax.toLocaleString("fr-FR") + " $" : salaryText}<span>${period}</span></div>

    <div class="detail-actions">
      <button class="btn-primary">Voir détails</button>
      <button class="btn-icon-outline">🔖</button>
    </div>

    <div class="detail-section">
      <div class="detail-section-title">Pourquoi cette offre te correspond</div>
      <ul class="match-list">
        ${matchReasons.map(r => `<li>${r}</li>`).join("")}
      </ul>
    </div>

    <div class="detail-section">
      <div class="detail-section-title">Compétences à améliorer</div>
      ${skills.map(s => `
        <div class="skill-row">
          <div class="skill-label"><span>${s.name || s}</span><span>${s.value || 0}%</span></div>
          <div class="skill-bar"><div class="skill-bar-fill" style="width:${s.value || 0}%"></div></div>
        </div>
      `).join("")}
    </div>
  `;
}

// ============== TABS ==============
document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    const key = tab.dataset.tab;
    if (key === "toutes") {
      document.querySelectorAll(".filters-panel input[type=checkbox]").forEach(cb => cb.checked = false);
      document.querySelectorAll(".filters-panel input[type=text]").forEach(inp => inp.value = "");
      const salaryRange = document.getElementById("salaryRange");
      if (salaryRange) salaryRange.value = 0;
      const salaryValue = document.getElementById("salaryValue");
      if (salaryValue) salaryValue.textContent = "0 $";
      filteredJobs = [...jobs];
      renderJobs();
    } else if (key === "filtres") {
      const filtersPanel = document.querySelector(".filters-panel");
      if (filtersPanel) filtersPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (key === "reco") {
      const recoSection = document.getElementById("panelReco");
      if (recoSection) recoSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

function renderRecommendedJobs() {
  const recoList = document.getElementById("recoList");
  if (!recoList) {
    console.warn("[OPPO] recoList introuvable");
    return;
  }

  console.log("[OPPO] renderRecommendedJobs, jobs.length:", jobs.length);

  const recommended = [...jobs]
    .sort((a, b) => (b.compatibility || b.match || 0) - (a.compatibility || a.match || 0))
    .slice(0, 6);

  console.log("[OPPO] recommended.length:", recommended.length);

  if (recommended.length === 0) {
    recoList.innerHTML = `<div style="text-align:center;padding:40px;color:var(--muted);">Aucune recommandation pour le moment.</div>`;
    return;
  }

  recoList.innerHTML = recommended.map(job => {
    const match = job.compatibility || job.match || 0;
    const company = job.company || "—";
    const title = job.title || "Sans titre";
    const location = job.location || job.country || "—";
    const salaryText = job.salary || "—";
    const tags = (job.skills || "").split(",").map((s) => s.trim()).filter(Boolean).slice(0, 3);
    const logoText = job.logo || (job.company || "?").charAt(0).toUpperCase();
    const logoBg = job.logoBg || "#e5e7eb";

    const logoUrl = job.logoURL || "";
    const logoHtml = logoUrl
      ? `<img src="${logoUrl}" alt="${company}" style="width:100%;height:100%;object-fit:contain;">`
      : `<span style="font-weight:800;font-size:18px;color:#fff;">${logoText}</span>`;
    const logoStyle = logoUrl ? "" : `style="background:${logoBg}"`;

    return `
      <div class="job" data-id="${job.id}">
        <div class="job-logo" ${logoStyle}>${logoHtml}</div>
        <div class="job-info">
          <div class="job-title">${title}</div>
          <div class="job-sub">${company} · <span class="tag">${location}</span></div>
          <div class="job-tags">${tags.map(t => `<span>${t}</span>`).join("")}</div>
        </div>
        <div class="job-right">
          <div class="job-match" title="${match}% compatible">
            <svg viewBox="0 0 36 36">
              <circle class="job-match-bg" cx="18" cy="18" r="16"></circle>
              <circle class="job-match-fg" cx="18" cy="18" r="16"
                stroke-dasharray="${2 * Math.PI * 16}" stroke-dashoffset="${2 * Math.PI * 16 - (match / 100) * 2 * Math.PI * 16}"></circle>
            </svg>
            <div class="job-match-num">${match}%</div>
          </div>
          <div class="job-price">${salaryText}</div>
        </div>
      </div>
    `;
  }).join("");
}

// ============== TRI ==============
const sortSelect = document.getElementById("sortSelect");
if (sortSelect) {
  sortSelect.addEventListener("change", (e) => {
    console.log("[OPPO] sort changed:", e.target.value);
    currentSort = e.target.value;
    oppCurrentPage = 1;
    renderJobs();
  });
} else {
  console.warn("[OPPO] sortSelect introuvable");
}

// ============== FILTRES ==============
function getFilters() {
  const contractChecks = document.querySelectorAll('.filters-panel input[data-filter="contract"]:checked');
  const contracts = Array.from(contractChecks).map(cb => cb.value);

  const locationChecks = document.querySelectorAll('.filters-panel input[data-filter="location"]:checked');
  const locations = Array.from(locationChecks).map(cb => cb.value);

  const levelChecks = document.querySelectorAll('.filters-panel input[data-filter="level"]:checked');
  const levels = Array.from(levelChecks).map(cb => cb.value);

  const locationText = document.querySelector('.filter-input')?.value?.trim()?.toLowerCase() || "";

  const salaryMin = parseInt(document.getElementById("salaryRange")?.value || 0);

  return { contracts, locations, levels, locationText, salaryMin };
}

function matchesFilters(job, filters) {
  const jobContract = (job.contractType || job.status || "").toString().toLowerCase();
  if (filters.contracts.length > 0 && !filters.contracts.some(c => jobContract.includes(c.toLowerCase()))) {
    return false;
  }

  const jobLocation = (job.location || job.country || "").toString().toLowerCase();
  if (filters.locations.length > 0 && !filters.locations.some(l => jobLocation.includes(l.toLowerCase()))) {
    return false;
  }

  const jobLevel = (job.level || "").toString().toLowerCase();
  if (filters.levels.length > 0 && !filters.levels.some(l => jobLevel.includes(l.toLowerCase()))) {
    return false;
  }

  if (filters.locationText && !jobLocation.includes(filters.locationText)) {
    return false;
  }

  const jobSalary = parseInt(job.salary || job.salaryMax || 0);
  if (jobSalary < filters.salaryMin) {
    return false;
  }

  return true;
}

function applyFilters() {
  const filters = getFilters();
  console.log("[OPPO] applyFilters", filters);
  filteredJobs = jobs.filter(job => matchesFilters(job, filters));
  console.log("[OPPO] filteredJobs.length:", filteredJobs.length);
  oppCurrentPage = 1;

  const list = document.getElementById("jobList");
  if (!list) return;

  if (filteredJobs.length === 0) {
    list.innerHTML = `<div style="text-align:center;padding:40px;color:var(--muted);">Aucune offre ne correspond à vos critères.</div>`;
    const resultCount = document.getElementById("resultCount");
    if (resultCount) resultCount.textContent = "0 offre trouvée";
    updatePagination(0);
    return;
  }

  selectedJobId = filteredJobs[0]?.id || null;
  renderJobs();
  renderDetail();
}

document.querySelectorAll(".filters-panel input[type=checkbox]").forEach(cb => {
  cb.addEventListener("change", () => {
    console.log("[OPPO] checkbox changed:", cb.value, cb.checked);
    applyFilters();
  });
});

document.querySelector(".filter-input")?.addEventListener("input", (e) => {
  console.log("[OPPO] location text changed:", e.target.value);
  applyFilters();
});

document.getElementById("salaryRange")?.addEventListener("input", (e) => {
  document.getElementById("salaryValue").textContent = `${parseInt(e.target.value).toLocaleString("fr-FR")} $`;
  applyFilters();
});

document.getElementById("resetFilters")?.addEventListener("click", () => {
  document.querySelectorAll(".filters-panel input[type=checkbox]").forEach(cb => cb.checked = false);
  document.querySelector(".filter-input") ? document.querySelector(".filter-input").value = "" : null;
  const salaryRange = document.getElementById("salaryRange");
  const salaryValue = document.getElementById("salaryValue");
  if (salaryRange) salaryRange.value = 0;
  if (salaryValue) salaryValue.textContent = "0 $";
  applyFilters();
});

// ============== PAGINATION ==============
function updatePagination(totalPages) {
  const paginationEl = document.getElementById("pagination");
  if (!paginationEl) return;

  if (totalPages <= 1) {
    paginationEl.innerHTML = "";
    return;
  }

  let html = "";
  html += `<button class="page-arrow" data-page="prev" ${oppCurrentPage === 1 ? 'disabled' : ''}>‹</button>`;
  
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= oppCurrentPage - 1 && i <= oppCurrentPage + 1)) {
      html += `<button class="page-num ${i === oppCurrentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    } else if (i === oppCurrentPage - 2 || i === oppCurrentPage + 2) {
      html += `<span class="page-dots">...</span>`;
    }
  }
  
  html += `<button class="page-arrow" data-page="next" ${oppCurrentPage === totalPages ? 'disabled' : ''}>›</button>`;
  
  paginationEl.innerHTML = html;

  paginationEl.querySelectorAll(".page-num, .page-arrow").forEach((btn) => {
    btn.addEventListener("click", () => {
      const page = btn.getAttribute("data-page");
      if (page === "prev" && oppCurrentPage > 1) {
        oppCurrentPage--;
      } else if (page === "next" && oppCurrentPage < totalPages) {
        oppCurrentPage++;
      } else if (page !== "prev" && page !== "next") {
        oppCurrentPage = parseInt(page);
      }
      renderJobs();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

// ============== RAFRAÎCHIR ==============
document.getElementById("refreshBtn").addEventListener("click", () => {
  const btn = document.getElementById("refreshBtn");
  btn.textContent = "⟳ Actualisation...";
  loadJobsFromFirebase().then(() => {
    const user = firebase.auth().currentUser;
    if (user) {
      return firebase.database().ref("users/" + user.uid).once("value").then((userSnap) => {
        const userData = userSnap.val() || {};
        const skillsPromise = firebase.database().ref("users/" + user.uid + "/skills").once("value");
        const expPromise = firebase.database().ref("users/" + user.uid + "/experiences").once("value");
        const formPromise = firebase.database().ref("users/" + user.uid + "/formations").once("value");
        const certPromise = firebase.database().ref("users/" + user.uid + "/certifications").once("value");

        return Promise.all([skillsPromise, expPromise, formPromise, certPromise]).then(([skillsSnap, expSnap, formSnap, certSnap]) => {
          const enrichedUser = {
            ...userData,
            skills: skillsSnap.val() || {},
            experiences: Object.keys(expSnap.val() || {}).map(id => ({ id, ...(expSnap.val() || {})[id] })),
            formations: Object.keys(formSnap.val() || {}).map(id => ({ id, ...(formSnap.val() || {})[id] })),
            certifications: Object.keys(certSnap.val() || {}).map(id => ({ id, ...(certSnap.val() || {})[id] }))
          };

          jobs.forEach((job) => {
            job.compatibility = calculateJobCompatibility(enrichedUser, job);
          });
          filteredJobs = [...jobs];
        });
      }).catch((err) => {
        console.error("[OPPO] erreur chargement profil:", err);
        jobs.forEach((job) => { job.compatibility = job.match || 0; });
        filteredJobs = [...jobs];
      });
    }
  }).then(() => {
    btn.textContent = "🔄 Rafraîchir les offres";
    renderJobs();
    renderDetail();
  });
});

// ============== INIT ==============
loadJobsFromFirebase().then(() => {
  const user = firebase.auth().currentUser;
  if (user) {
    return firebase.database().ref("users/" + user.uid).once("value").then((userSnap) => {
      const userData = userSnap.val() || {};
      const skillsPromise = firebase.database().ref("users/" + user.uid + "/skills").once("value");
      const expPromise = firebase.database().ref("users/" + user.uid + "/experiences").once("value");
      const formPromise = firebase.database().ref("users/" + user.uid + "/formations").once("value");
      const certPromise = firebase.database().ref("users/" + user.uid + "/certifications").once("value");

      return Promise.all([skillsPromise, expPromise, formPromise, certPromise]).then(([skillsSnap, expSnap, formSnap, certSnap]) => {
        const enrichedUser = {
          ...userData,
          skills: skillsSnap.val() || {},
          experiences: Object.keys(expSnap.val() || {}).map(id => ({ id, ...(expSnap.val() || {})[id] })),
          formations: Object.keys(formSnap.val() || {}).map(id => ({ id, ...(formSnap.val() || {})[id] })),
          certifications: Object.keys(certSnap.val() || {}).map(id => ({ id, ...(certSnap.val() || {})[id] }))
        };

        jobs.forEach((job) => {
          job.compatibility = calculateJobCompatibility(enrichedUser, job);
        });
        console.log("[OPPO] compatibilités calculées:", jobs.slice(0, 3).map(j => ({ id: j.id, title: j.title, compatibility: j.compatibility })));
        filteredJobs = [...jobs];
      });
    }).catch((err) => {
      console.error("[OPPO] erreur chargement profil:", err);
      jobs.forEach((job) => { job.compatibility = job.match || 0; });
      filteredJobs = [...jobs];
    });
  }
  }).then(() => {
  renderJobs();
  renderDetail();
  renderRecommendedJobs();
  
  triggerAutoScrape();
});

function triggerAutoScrape() {
  let lastScrape = null;
  try {
    lastScrape = localStorage.getItem('lastScrapeTimestamp');
  } catch (e) {
    console.warn("[OPPO] localStorage inaccessible:", e.message);
  }

  const now = Date.now();
  const oneHour = 60 * 60 * 1000;

  if (lastScrape && (now - parseInt(lastScrape)) < oneHour) {
    console.log("[OPPO] scrape ignoré (dernier scrape il y a moins d'1h)");
    return;
  }

  fetch('/scrape-jobs', {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    }
  })
  .then(response => response.json())
  .then(data => {
    console.log("[OPPO] scrape auto résultat:", data);
    if (data.success) {
      try {
        localStorage.setItem('lastScrapeTimestamp', Date.now().toString());
      } catch (e) {
        console.warn("[OPPO] impossible de sauvegarder le timestamp:", e.message);
      }
      if (data.scraped > 0) {
        return loadJobsFromFirebase();
      }
    }
  })
  .catch(err => {
    console.error("[OPPO] erreur scrape auto:", err);
  });
}

function handleScrapeClick() {
  const btn = document.getElementById("scrapeBtn");
  const statusEl = document.getElementById("scrapeStatus");
  if (!btn) return;

  btn.textContent = "🕷 Scraping en cours...";
  btn.disabled = true;
  if (statusEl) {
    statusEl.textContent = "Scraping en cours, veuillez patienter...";
    statusEl.style.display = "block";
  }

  fetch('/scrape-jobs', {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error("Erreur HTTP: " + response.status);
    }
    return response.json();
  })
  .then(data => {
    console.log("[OPPO] scrape manuel résultat:", data);
    btn.textContent = "🕷 Scraper les sites";
    btn.disabled = false;

    if (data.success) {
      if (statusEl) {
        statusEl.textContent = data.message || (data.scraped > 0 ? `${data.scraped} offre(s) scrapée(s).` : "Scraping terminé, aucune nouvelle offre.");
        setTimeout(() => { if (statusEl) statusEl.style.display = "none"; }, 4000);
      }
      try {
        localStorage.setItem('lastScrapeTimestamp', Date.now().toString());
      } catch (e) {
        console.warn("[OPPO] impossible de sauvegarder le timestamp:", e.message);
      }
      return loadJobsFromFirebase();
    } else {
      const msg = data.error || data.message || "Erreur inconnue lors du scraping";
      if (statusEl) {
        statusEl.textContent = "Échec du scraping: " + msg;
        statusEl.style.color = "var(--red)";
        setTimeout(() => { if (statusEl) { statusEl.style.display = "none"; statusEl.style.color = ""; } }, 5000);
      }
      alert("Échec du scraping: " + msg);
    }
  })
  .then(() => {
    renderJobs();
    renderDetail();
    renderRecommendedJobs();
  })
  .catch(err => {
    console.error("[OPPO] erreur scrape manuel:", err);
    const btn2 = document.getElementById("scrapeBtn");
    if (btn2) {
      btn2.textContent = "🕷 Scraper les sites";
      btn2.disabled = false;
    }
    const statusEl2 = document.getElementById("scrapeStatus");
    if (statusEl2) {
      statusEl2.textContent = "Erreur réseau: " + err.message;
      statusEl2.style.color = "var(--red)";
      setTimeout(() => { if (statusEl2) { statusEl2.style.display = "none"; statusEl2.style.color = ""; } }, 5000);
    }
    alert("Erreur lors du scraping: " + err.message);
  });
}

const scrapeBtn = document.getElementById("scrapeBtn");
if (scrapeBtn) {
  scrapeBtn.addEventListener("click", handleScrapeClick);
}
