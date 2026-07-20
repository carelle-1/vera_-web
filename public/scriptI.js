// ============== HELPERS ==============
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

let currentPage = 1;
const JOBS_PER_PAGE = 5;
let allFilteredJobs = [];

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

// ============== GARDE DE SESSION (TABLEAU DE BORD) ==============
// Si l'utilisateur n'est pas connecté, on le renvoie à la connexion.
firebase.auth().onAuthStateChanged((user) => {
  if (!user) {
    window.location.replace("/");
    return;
  }
  // Récupère le profil (photo + prénom) depuis la Realtime Database
  firebase.database().ref("users/" + user.uid).once("value").then((snapshot) => {
    const data = snapshot.val() || {};
    const firstName = data.firstName
      || (user.displayName ? user.displayName.split(" ")[0] : "")
      || (user.email ? user.email.split("@")[0] : "");

    // Photo de profil : depuis la base, sinon initiale du prénom
    const avatar = document.getElementById("userAvatar");
    if (avatar && avatar.isConnected) {
      if (data.photoURL) {
        avatar.src = data.photoURL;
      } else {
        const initial = (firstName || user.email || "?").charAt(0).toUpperCase();
        const div = document.createElement("div");
        div.style.cssText = "width:36px;height:36px;border-radius:50%;background:#12b3c9;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:15px;";
        div.textContent = initial;
        avatar.replaceWith(div);
      }
    }

    renderIndexScore(data);
    renderRecommendedJobs();
    loadUserFavorites().then(() => {
      updateFavoriteButtons();
    }).catch((err) => {
      console.error("[FAV] erreur chargement favoris:", err);
    });
  });
});

// ============== FAVORIS ==============
let userFavorites = new Set();

function getFavoritesRef() {
  const user = firebase.auth().currentUser;
  return user ? firebase.database().ref("favorites/" + user.uid) : null;
}

function loadUserFavorites() {
  const user = firebase.auth().currentUser;
  if (!user) return Promise.resolve();
  
  return firebase.database().ref("favorites/" + user.uid).once("value").then((snap) => {
    const data = snap.val() || {};
    userFavorites = new Set(Object.keys(data));
  }).catch((err) => {
    console.error("[FAV] erreur chargement favoris:", err);
    userFavorites = new Set();
  });
}

function updateFavoriteButtons() {
  document.querySelectorAll("[data-job-save]").forEach(btn => {
    const jobId = btn.getAttribute("data-job-save");
    if (!jobId) return;
    
    if (userFavorites.has(jobId)) {
      btn.classList.add("saved");
      btn.innerHTML = `<svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:var(--blue);"><path d="M5 3h14a2 2 0 0 1 2 2v16l-7-3-7 3V5a2 2 0 0 1 2-2z"/></svg>`;
    } else {
      btn.classList.remove("saved");
      btn.innerHTML = `<img src="/image/3916600.png" alt="Sauvegarder" style="width:18px;height:18px;object-fit:contain;">`;
    }
  });
}

function toggleFavorite(jobId) {
  const ref = getFavoritesRef();
  if (!ref) {
    alert("Vous devez être connecté pour sauvegarder des favoris.");
    return;
  }

  const favRef = ref.child(jobId);
  favRef.once("value").then((snap) => {
    const isFav = snap.exists();
    if (isFav) {
      return favRef.remove().then(() => {
        userFavorites.delete(jobId);
        return false;
      });
    } else {
      return favRef.set({ createdAt: Date.now() }).then(() => {
        userFavorites.add(jobId);
        return true;
      });
    }
  }).then(() => {
    updateFavoriteButtons();
  }).catch((err) => {
    console.error("[FAV] erreur:", err);
  });
}

function renderRecommendedJobs() {
  const container = document.getElementById("jobsContainer");
  if (!container) return;

  const user = firebase.auth().currentUser;
  if (!user) {
    container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--muted);">Connectez-vous pour voir les offres.</div>`;
    return;
  }

  firebase.database().ref("jobs").once("value").then((snapshot) => {
    const data = snapshot.val() || {};
    const jobs = Object.keys(data).map((id) => ({ id, ...data[id] }));

    jobs.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    });

    populateCountryFilter(jobs);
    populateCompanyFilter(jobs);

    const contractFilter = document.getElementById("contractFilter") ? document.getElementById("contractFilter").value : "";
    const countryFilter = document.getElementById("countryFilter") ? document.getElementById("countryFilter").value : "";
    const companyFilter = document.getElementById("companyFilter") ? document.getElementById("companyFilter").value : "";

    let filteredJobs = jobs;
    if (contractFilter) {
      filteredJobs = filteredJobs.filter((job) => {
        const contractType = (job.contractType || job.status || "").toString().toLowerCase();
        return contractType === contractFilter.toLowerCase();
      });
    }
    if (countryFilter) {
      filteredJobs = filteredJobs.filter((job) => {
        const country = (job.country || job.location || "").toString().toLowerCase();
        return country.includes(countryFilter.toLowerCase());
      });
    }
    if (companyFilter) {
      filteredJobs = filteredJobs.filter((job) => {
        const company = (job.company || "").toString().toLowerCase();
        return company.includes(companyFilter.toLowerCase());
      });
    }

    allFilteredJobs = filteredJobs;
    const totalPages = Math.max(1, Math.ceil(allFilteredJobs.length / JOBS_PER_PAGE));
    if (currentPage > totalPages) currentPage = totalPages;
    const start = (currentPage - 1) * JOBS_PER_PAGE;
    const topJobs = allFilteredJobs.slice(start, start + JOBS_PER_PAGE);

    const skillsPromise = firebase.database().ref("users/" + user.uid + "/skills").once("value");
    const expPromise = firebase.database().ref("users/" + user.uid + "/experiences").once("value");
    const formPromise = firebase.database().ref("users/" + user.uid + "/formations").once("value");
    const certPromise = firebase.database().ref("users/" + user.uid + "/certifications").once("value");
    const userPromise = firebase.database().ref("users/" + user.uid).once("value");

    Promise.all([userPromise, skillsPromise, expPromise, formPromise, certPromise]).then(([userSnap, skillsSnap, expSnap, formSnap, certSnap]) => {
      const userData = userSnap.val() || {};
      const enrichedUser = {
        ...userData,
        skills: skillsSnap.val() || {},
        experiences: Object.keys(expSnap.val() || {}).map(id => ({ id, ...(expSnap.val() || {})[id] })),
        formations: Object.keys(formSnap.val() || {}).map(id => ({ id, ...(formSnap.val() || {})[id] })),
        certifications: Object.keys(certSnap.val() || {}).map(id => ({ id, ...(certSnap.val() || {})[id] }))
      };
      renderJobsList(topJobs, enrichedUser);
      updateFavoriteButtons();
      renderPagination(allFilteredJobs.length);
    }).catch((err) => {
      console.error("[JOBS] erreur chargement profil:", err);
      renderJobsList(topJobs, {});
      updateFavoriteButtons();
      renderPagination(allFilteredJobs.length);
    });
  }).catch((err) => {
    container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--red);">Erreur de chargement des offres.</div>`;
    console.error("[JOBS] erreur chargement:", err);
  });
}

function populateCountryFilter(jobs) {
  const select = document.getElementById("countryFilter");
  if (!select) return;

  const countries = new Set();
  jobs.forEach((job) => {
    const country = (job.country || "").toString().trim();
    const location = (job.location || "").toString().trim();
    if (country) countries.add(country);
    else if (location) countries.add(location);
  });

  const currentValue = select.value;
  select.innerHTML = '<option value="">📍 Tous pays</option>';
  Array.from(countries).sort().forEach((country) => {
    const option = document.createElement("option");
    option.value = country;
    option.textContent = country;
    select.appendChild(option);
  });
  select.value = currentValue;
}

function populateCompanyFilter(jobs) {
  const select = document.getElementById("companyFilter");
  if (!select) return;

  const companies = new Set();
  jobs.forEach((job) => {
    const company = (job.company || "").toString().trim();
    if (company) companies.add(company);
  });

  const currentValue = select.value;
  select.innerHTML = '<option value="">🏢 Entreprise</option>';
  Array.from(companies).sort().forEach((company) => {
    const option = document.createElement("option");
    option.value = company;
    option.textContent = company;
    select.appendChild(option);
  });
  select.value = currentValue;
}

function renderJobsList(topJobs, enrichedUser) {
  const container = document.getElementById("jobsContainer");
  if (!container) return;

  container.innerHTML = topJobs.map((job) => {
    const compatibility = calculateJobCompatibility(enrichedUser, job);
    const logoUrl = job.logoURL || "";
    const logoHtml = logoUrl
      ? `<img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(job.company || 'logo')}" style="width:100%;height:100%;object-fit:contain;">`
      : `<div class="job-logo-text">${escapeHtml((job.company || "?").charAt(0).toUpperCase())}</div>`;

    const tags = (job.skills || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 3);
    const tagsHtml = tags.map((t) => `<span>${escapeHtml(t)}</span>`).join("");

    return `
      <article class="job">
        <div class="job-logo">${logoHtml}</div>
        <div class="job-info">
          <div class="job-compat">${compatibility}% Compatible</div>
          <div class="job-title">${escapeHtml(job.title || "Sans titre")} ${job.verified ? '<span class="verified-dot">✓</span>' : ""}</div>
          <div class="job-sub">${escapeHtml(job.company || "—")} · <span>${escapeHtml(job.location || "—")}</span> <span class="tag">${escapeHtml(job.contractType || job.status || "")}</span></div>
          <div class="job-tags">${tagsHtml}${tags.length >= 3 && (job.skills || "").split(",").map((s) => s.trim()).filter(Boolean).length > 3 ? `<span>+${(job.skills || "").split(",").map((s) => s.trim()).filter(Boolean).length - 3}</span>` : ""}</div>
        </div>
        <div class="job-side">
          <div class="job-price">${escapeHtml(job.salary || "—")}<span>par mois</span></div>
          <div class="job-actions">
            <button class="btn-primary" data-job-detail="${escapeHtml(job.id)}">Voir détails</button>
            <button class="btn-icon" data-job-save="${escapeHtml(job.id)}"></button>
          </div>
        </div>
      </article>
    `;
  }).join("");

  if (topJobs.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--muted);">Aucune opportunité pour le moment.</div>`;
  }
}

function renderIndexScore(data) {
  const scoreNum = document.getElementById("scoreNumIndex");
  const ring = document.getElementById("scoreRingIndex");
  if (!scoreNum || !ring) return;

  const required = [
    "firstName", "lastName", "email", "birthDate", "residence", "whatsapp"
  ];
  const optional = [
    "nationality", "maritalStatus", "mainLanguage", "linkedin",
    "jobTitle", "availability", "contractType", "workLocation", "salary", "about"
  ];
  const stats = ["experienceYears", "projectsCount", "clientsCount"];

  let score = 0;
  score += (required.filter(f => (data[f] || "").toString().trim() !== "").length / required.length) * 40;
  score += (optional.filter(f => (data[f] || "").toString().trim() !== "").length / optional.length) * 25;
  score += (stats.filter(f => data[f] !== undefined && data[f] !== null && data[f] !== "" && data[f] > 0).length / stats.length) * 10;

  const sections = ["experiences", "skills", "formations", "certifications", "languages", "preferences"];
  score += (sections.filter(s => {
    const sec = data[s];
    if (!sec || typeof sec !== "object") return false;
    return Object.keys(sec).length > 0;
  }).length / sections.length) * 25;

  const pct = Math.min(100, Math.max(0, Math.round(score)));
  scoreNum.innerHTML = `${pct}<span>/100</span>`;

  const badge = document.getElementById("scoreBadgeIndex");
  const text = document.getElementById("scoreTextIndex");
  if (badge) {
    if (pct >= 100) badge.textContent = "★ Parfait";
    else if (pct >= 75) badge.textContent = "★ Excellent";
    else if (pct >= 50) badge.textContent = "★ Très bon";
    else if (pct > 0) badge.textContent = "★ À améliorer";
    else badge.textContent = "★ Vide";
  }
  if (text) {
    if (pct >= 100) text.textContent = "Ton profil est parfait !";
    else if (pct >= 75) text.textContent = "Ton profil est très attractif pour les recruteurs !";
    else if (pct >= 50) text.textContent = "Ajoute encore quelques informations pour améliorer ton score.";
    else if (pct > 0) text.textContent = "Votre profil manque de détails pour être mis en avant.";
    else text.textContent = "Commencez par remplir vos informations pour obtenir un score.";
  }

  const improveBtn = document.getElementById("improveScoreBtn");
  if (improveBtn) {
    improveBtn.onclick = () => {
      window.location.href = "/profil";
    };
  }

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  ring.style.strokeDasharray = circumference;
  ring.style.strokeDashoffset = circumference;
  requestAnimationFrame(() => {
    setTimeout(() => {
      const offset = circumference - (pct / 100) * circumference;
      ring.style.transition = "stroke-dashoffset 1.2s ease";
      ring.style.strokeDashoffset = offset;
    }, 150);
  });
}

// Empêche le bouton "précédent" tant qu'on est connecté :
// on "re-pousse" la page courante dans l'historique à chaque tentative de retour.
history.pushState(null, null, location.href);
window.addEventListener("popstate", () => {
  history.pushState(null, null, location.href);
});

// ============== DÉCONNEXION ==============
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    firebase.auth().signOut()
      .then(() => { window.location.replace("/"); })
      .catch(() => { window.location.replace("/"); });
  });
}

// ============== PLI / DÉPLI DE LA SIDEBAR ==============
const hamburger = document.querySelector(".hamburger");
const sidebar = document.querySelector(".sidebar");
if (hamburger && sidebar) {
  hamburger.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
  });
}

// ============== REDIRECTION ACTIONS PRIORITAIRES ==============
const actionAddSkill = document.getElementById("actionAddSkill");
if (actionAddSkill) {
  actionAddSkill.addEventListener("click", () => {
    localStorage.setItem("veraOpenTab", "skills");
    window.location.href = "/profil";
  });
}

const actionValidateExp = document.getElementById("actionValidateExp");
if (actionValidateExp) {
  actionValidateExp.addEventListener("click", () => {
    localStorage.setItem("veraOpenTab", "exp");
    window.location.href = "/profil";
  });
}

const actionFollowTraining = document.getElementById("actionFollowTraining");
if (actionFollowTraining) {
  actionFollowTraining.addEventListener("click", () => {
    localStorage.setItem("veraOpenTab", "formations");
    window.location.href = "/profil";
  });
}

// ============== MODAL DÉTAILS OFFRE ==============
const jobDetailOverlay = document.getElementById("jobDetailOverlay");
const jobDetailModal = document.getElementById("jobDetailModal");
const jobDetailTitle = document.getElementById("jobDetailTitle");
const jobDetailBody = document.getElementById("jobDetailBody");
const jobDetailClose = document.getElementById("jobDetailClose");

function openJobDetailModal(job) {
  if (!jobDetailOverlay || !jobDetailBody || !jobDetailTitle) return;

  const logoUrl = job.logoURL || "";
  const logoHtml = logoUrl
    ? `<img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(job.company || 'logo')}" class="detail-logo">`
    : `<div class="detail-logo" style="display:flex;align-items:center;justify-content:center;font-weight:800;font-size:22px;background:linear-gradient(90deg,var(--mint-light),var(--sky));color:#052a2f;">${escapeHtml((job.company || "?").charAt(0).toUpperCase())}</div>`;

  const tags = (job.skills || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 6);
  const tagsHtml = tags.map((t) => `<span style="display:inline-block;padding:4px 10px;border-radius:20px;background:var(--bg);color:var(--text);font-size:12px;font-weight:600;margin:2px;">${escapeHtml(t)}</span>`).join("");

  jobDetailBody.innerHTML = `
    ${logoHtml}
    <div class="detail-company">${escapeHtml(job.company || "—")}</div>
    <div class="detail-sub">${escapeHtml(job.title || "Sans titre")} · ${escapeHtml(job.location || "—")} ${job.country ? "· " + escapeHtml(job.country) : ""}</div>
    <div class="detail-row"><span class="detail-label">Type de contrat</span><span class="detail-value">${escapeHtml(job.contractType || job.status || "—")}</span></div>
    <div class="detail-row"><span class="detail-label">Salaire</span><span class="detail-value">${escapeHtml(job.salary || "—")}</span></div>
    <div class="detail-row"><span class="detail-label">Description</span><span class="detail-value">${escapeHtml(job.description || "Aucune description.")}</span></div>
    <div class="detail-row"><span class="detail-label">Compétences</span><span class="detail-value">${tagsHtml || "—"}</span></div>
    <div class="detail-row"><span class="detail-label">Date limite</span><span class="detail-value">${escapeHtml(job.deadline || "—")}</span></div>
    <div class="detail-row"><span class="detail-label">Email de candidature</span><span class="detail-value">${escapeHtml(job.applyEmail || "—")}</span></div>
    <div class="detail-row"><span class="detail-label">Compatibilité</span><span class="detail-value" id="jobCompatibilityValue">Calcul...</span></div>
    ${job.verified ? '<div class="detail-row"><span class="detail-label">Vérifié</span><span class="detail-value">✓ Oui</span></div>' : ''}
    <div class="detail-actions">
      <button class="btn-primary apply-now-btn" data-job-apply="${escapeHtml(job.id)}" ${!job.applyEmail ? 'disabled' : ''}>Postuler maintenant</button>
    </div>
  `;

  jobDetailTitle.textContent = "Détails de l'offre";
  jobDetailOverlay.classList.add("active");

  const user = firebase.auth().currentUser;
  if (!user) {
    const compatEl = document.getElementById("jobCompatibilityValue");
    if (compatEl) compatEl.textContent = "—";
    return;
  }

  firebase.database().ref("users/" + user.uid).once("value").then((userSnap) => {
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
      const compatibility = calculateJobCompatibility(enrichedUser, job);
      const compatEl = document.getElementById("jobCompatibilityValue");
      if (compatEl) compatEl.textContent = compatibility + "%";
    });
  }).catch((err) => {
    console.error("[JOBS] erreur calcul compatibilité modal:", err);
    const compatEl = document.getElementById("jobCompatibilityValue");
    if (compatEl) compatEl.textContent = "—";
  });
}

function closeJobDetailModal() {
  if (jobDetailOverlay) jobDetailOverlay.classList.remove("active");
}

if (jobDetailClose) {
  jobDetailClose.addEventListener("click", closeJobDetailModal);
}

if (jobDetailOverlay) {
  jobDetailOverlay.addEventListener("click", (e) => {
    if (e.target === jobDetailOverlay) closeJobDetailModal();
  });
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-job-detail]");
  if (!btn) return;
  const jobId = btn.getAttribute("data-job-detail");
  if (!jobId) return;

  firebase.database().ref("jobs/" + jobId).once("value").then((snap) => {
    const job = snap.val();
    if (job) {
      job.id = jobId;
      openJobDetailModal(job);
    }
  }).catch((err) => {
    console.error("[JOBS] erreur chargement détail:", err);
  });
});

document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-job-save]");
  if (!btn) return;
  const jobId = btn.getAttribute("data-job-save");
  if (!jobId) return;
  e.preventDefault();
  toggleFavorite(jobId);
});

document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-job-apply]");
  if (!btn) return;
  e.preventDefault();
  const jobId = btn.getAttribute("data-job-apply");
  if (!jobId) return;

  firebase.database().ref("jobs/" + jobId).once("value").then((snap) => {
    const job = snap.val() || {};
    const email = (job.applyEmail || "").toString().trim();
    if (!email) {
      alert("Aucune adresse email de candidature disponible pour cette offre.");
      return;
    }
    window.location.href = "mailto:" + email;
  }).catch((err) => {
    console.error("[JOBS] erreur postuler:", err);
    alert("Impossible de traiter votre candidature pour le moment.");
  });
});

const contractFilter = document.getElementById("contractFilter");
if (contractFilter) {
  contractFilter.addEventListener("change", () => {
    currentPage = 1;
    renderRecommendedJobs();
  });
}

const countryFilterEl = document.getElementById("countryFilter");
if (countryFilterEl) {
  countryFilterEl.addEventListener("change", () => {
    currentPage = 1;
    renderRecommendedJobs();
  });
}

const companyFilterEl = document.getElementById("companyFilter");
if (companyFilterEl) {
  companyFilterEl.addEventListener("change", () => {
    currentPage = 1;
    renderRecommendedJobs();
  });
}

const allChip = document.querySelector('.chip[data-filter="all"]');
if (allChip) {
  allChip.addEventListener("click", () => {
    if (contractFilter) contractFilter.value = "";
    if (countryFilterEl) countryFilterEl.value = "";
    if (companyFilterEl) companyFilterEl.value = "";
    currentPage = 1;
    renderRecommendedJobs();
  });
}

function renderPagination(totalItems) {
  const paginationEl = document.getElementById("jobsPagination");
  if (!paginationEl) return;

  const totalPages = Math.max(1, Math.ceil(totalItems / JOBS_PER_PAGE));
  if (totalPages <= 1) {
    paginationEl.innerHTML = "";
    return;
  }

  let html = "";
  html += `<button class="page-arrow" data-page="prev" ${currentPage === 1 ? 'disabled' : ''}>←</button>`;
  
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      html += `<button class="page-num ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      html += `<span class="page-dots">...</span>`;
    }
  }
  
  html += `<button class="page-arrow" data-page="next" ${currentPage === totalPages ? 'disabled' : ''}>→</button>`;
  
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
      renderRecommendedJobs();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}
