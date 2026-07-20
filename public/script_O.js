// ============== DONNÉES ==============
let jobs = [];
let filteredJobs = [];
let selectedJobId = null;
let currentSort = "pertinence";

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
    return jobs;
  }).catch((err) => {
    console.error("[OPPO] erreur chargement jobs:", err);
    jobs = [];
    filteredJobs = [];
    return [];
  });
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

  sorted.forEach(job => {
    const el = document.createElement("article");
    el.className = "job" + (job.id === selectedJobId ? " selected" : "");
    el.dataset.id = job.id;

    const match = job.compatibility || job.match || 0;
    const circumference = 2 * Math.PI * 16;
    const offset = circumference - (match / 100) * circumference;

    const logoText = job.logo || (job.company || "?").charAt(0).toUpperCase();
    const logoBg = job.logoBg || "#e5e7eb";
    const company = job.company || "—";
    const title = job.title || "Sans titre";
    const location = job.location || job.country || "—";
    const locationTag = job.contractType || job.status || location;
    const salaryText = job.salary || "—";
    const salaryMin = job.salaryMin || 0;
    const salaryMax = job.salaryMax || 0;
    const period = job.period || "par mois";
    const tags = (job.skills || "").split(",").map((s) => s.trim()).filter(Boolean).slice(0, 3);
    const posted = job.createdAt ? "Récent" : "—";

    el.innerHTML = `
      <div class="job-logo" style="background:${logoBg}">${logoText}</div>
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

  panel.innerHTML = `
    <div class="detail-match">${match}% Compatible</div>
    <div class="detail-logo" style="background:${logoBg}">${logoText}</div>
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
const switchablePanels = {
  filtres: document.getElementById("panelFiltres"),
  toutes: document.getElementById("panelToutes"),
  entreprises: document.getElementById("panelEntreprises"),
  reco: document.getElementById("panelReco")
};
const oppLayout = document.querySelector(".opp-layout");

document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    const key = tab.dataset.tab;
    if (!key || !switchablePanels[key]) return;

    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    Object.keys(switchablePanels).forEach(k => {
      if (switchablePanels[k]) {
        if (k === key) {
          switchablePanels[k].classList.add("active");
        } else {
          switchablePanels[k].classList.remove("active");
        }
      }
    });

    if (oppLayout) {
      if (key === "filtres") {
        oppLayout.classList.add("with-filters");
      } else {
        oppLayout.classList.remove("with-filters");
      }
    }

    if (key === "reco") {
      console.log("[OPPO] onglet Recommandées cliqué, jobs.length:", jobs.length);
      renderRecommendedJobs();
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
    const logoText = job.logo || (job.company || "?").charAt(0).toUpperCase();
    const logoBg = job.logoBg || "#e5e7eb";
    const company = job.company || "—";
    const title = job.title || "Sans titre";
    const location = job.location || job.country || "—";
    const salaryText = job.salary || "—";
    const tags = (job.skills || "").split(",").map((s) => s.trim()).filter(Boolean).slice(0, 3);

    return `
      <div class="job" data-id="${job.id}">
        <div class="job-logo" style="background:${logoBg}">${logoText}</div>
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
document.getElementById("sortSelect").addEventListener("change", (e) => {
  currentSort = e.target.value;
  renderJobs();
});

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

  const list = document.getElementById("jobList");
  if (!list) return;

  if (filteredJobs.length === 0) {
    list.innerHTML = `<div style="text-align:center;padding:40px;color:var(--muted);">Aucune offre ne correspond à vos critères.</div>`;
    const resultCount = document.getElementById("resultCount");
    if (resultCount) resultCount.textContent = "0 offre trouvée";
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
document.getElementById("pagination").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  if (btn.classList.contains("page-num")) {
    document.querySelectorAll(".page-num").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelector(".job-list-panel").scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

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
if (oppLayout) {
  const activeTab = document.querySelector(".tab.active");
  if (activeTab && activeTab.dataset.tab === "filtres") {
    oppLayout.classList.add("with-filters");
  }
}

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
});
