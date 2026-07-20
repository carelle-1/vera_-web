// ============== GARDE DE SESSION ==============
firebase.auth().onAuthStateChanged((user) => {
  if (!user) {
    window.location.replace("/");
    return;
  }
  loadFavorites(user.uid);
});

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

// ============== CHARGEMENT FAVORIS ==============
function loadFavorites(uid) {
  const list = document.getElementById("jobList");
  const resultCount = document.getElementById("resultCount");
  const tabSpan = document.querySelector('.tab[data-tab="offres"] span');

  if (!list) return;

  list.innerHTML = `<div style="text-align:center;padding:40px;color:var(--muted);">Chargement de vos favoris...</div>`;

  const favRef = firebase.database().ref("favorites/" + uid);
  favRef.once("value").then((snap) => {
    const favData = snap.val() || {};
    const favIds = Object.keys(favData);

    if (favIds.length === 0) {
      list.innerHTML = `<div style="text-align:center;padding:40px;color:var(--muted);">Aucun favori pour le moment. Retournez au tableau de bord pour en ajouter.</div>`;
      if (resultCount) resultCount.textContent = "0 offre d'emploi";
      if (tabSpan) tabSpan.textContent = "0";
      return;
    }

    const jobsRef = firebase.database().ref("jobs");
    const promises = favIds.map(id => jobsRef.child(id).once("value"));
    return Promise.all(promises).then((snapshots) => {
      const jobs = [];
      snapshots.forEach((snap) => {
        if (snap.exists()) {
          const data = snap.val();
          jobs.push({ id: snap.key, ...data });
        }
      });

      jobs.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });

      const skillsPromise = firebase.database().ref("users/" + uid + "/skills").once("value");
      const expPromise = firebase.database().ref("users/" + uid + "/experiences").once("value");
      const formPromise = firebase.database().ref("users/" + uid + "/formations").once("value");
      const certPromise = firebase.database().ref("users/" + uid + "/certifications").once("value");
      const userPromise = firebase.database().ref("users/" + uid).once("value");

      return Promise.all([userPromise, skillsPromise, expPromise, formPromise, certPromise]).then(([userSnap, skillsSnap, expSnap, formSnap, certSnap]) => {
        const userData = userSnap.val() || {};
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

        renderFavorites(jobs);

        if (resultCount) resultCount.textContent = `${jobs.length} offre${jobs.length > 1 ? 's' : ''} d'emploi`;
        if (tabSpan) tabSpan.textContent = jobs.length;
      });
    });
  }).catch((err) => {
    console.error("[FAV] erreur chargement:", err);
    list.innerHTML = `<div style="text-align:center;padding:40px;color:var(--red);">Erreur de chargement des favoris.</div>`;
  });
}

// ============== RENDU FAVORIS ==============
function renderFavorites(jobs) {
  const list = document.getElementById("jobList");
  if (!list) return;

  const currentSort = document.getElementById("sortSelect")?.value || "recentes";
  let sorted = [...jobs];

  if (currentSort === "compat") {
    sorted.sort((a, b) => (b.compatibility || 0) - (a.compatibility || 0));
  } else if (currentSort === "salaire") {
    sorted.sort((a, b) => {
      const salaryA = extractSalary(a.salary);
      const salaryB = extractSalary(b.salary);
      return salaryB - salaryA;
    });
  }

  list.innerHTML = sorted.map((job) => {
    const logoUrl = job.logoURL || "";
    const logoHtml = logoUrl
      ? `<img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(job.company || 'logo')}" style="width:100%;height:100%;object-fit:contain;">`
      : `<div class="job-logo-text">${escapeHtml((job.company || "?").charAt(0).toUpperCase())}</div>`;

    const tags = (job.skills || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 5);
    const tagsHtml = tags.map((t) => `<span>${escapeHtml(t)}</span>`).join("");

    const match = job.compatibility ? parseInt(job.compatibility) : 0;
    const circumference = 2 * Math.PI * 18;
    const offset = circumference - (match / 100) * circumference;

    const salaryText = job.salary || "—";

    return `
      <div class="job" data-id="${escapeHtml(job.id)}">
        <div class="job-logo">${logoHtml}</div>
        <div class="job-info">
          <div class="job-title">${escapeHtml(job.title || "Sans titre")} ${job.verified ? '<span class="verified-dot">✓</span>' : ""}</div>
          <div class="job-sub">${escapeHtml(job.company || "—")} · 📍 ${escapeHtml(job.location || "—")} ${job.country ? "· " + escapeHtml(job.country) : ""}</div>
          <div class="job-tags">${tagsHtml}</div>
        </div>
        <div class="job-metrics">
          <div>
            <div class="job-match">
              <svg viewBox="0 0 44 44">
                <circle class="job-match-bg" cx="22" cy="22" r="18"></circle>
                <circle class="job-match-fg" cx="22" cy="22" r="18"
                  stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"></circle>
              </svg>
              <div class="job-match-num">${match}%</div>
            </div>
            <div class="job-match-label">Compatibilité</div>
          </div>
          <div class="job-price">${escapeHtml(salaryText)}</div>
          <div class="job-actions">
            <button class="fav-heart saved" data-fav-id="${escapeHtml(job.id)}">♥</button>
            <button class="job-menu">⋮</button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  if (sorted.length === 0) {
    list.innerHTML = `<div style="text-align:center;padding:40px;color:var(--muted);">Aucun favori pour le moment.</div>`;
  }
}

function extractSalary(salary) {
  if (!salary) return 0;
  const numbers = salary.match(/[\d]+/g);
  if (!numbers || numbers.length === 0) return 0;
  const max = Math.max(...numbers.map(Number));
  return max;
}

// ============== TRI ==============
document.getElementById("sortSelect")?.addEventListener("change", () => {
  const user = firebase.auth().currentUser;
  if (user) loadFavorites(user.uid);
});

// ============== RETIRER FAVORI ==============
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-fav-id]");
  if (!btn) return;
  e.stopPropagation();
  const jobId = btn.getAttribute("data-fav-id");
  if (!jobId) return;

  const user = firebase.auth().currentUser;
  if (!user) return;

  const favRef = firebase.database().ref("favorites/" + user.uid + "/" + jobId);
  favRef.remove().then(() => {
    console.log("[FAV] retiré:", jobId);
    const card = btn.closest(".job");
    if (card) {
      card.style.opacity = "0.4";
      setTimeout(() => loadFavorites(user.uid), 300);
    }
  }).catch((err) => {
    console.error("[FAV] erreur suppression:", err);
  });
});

// ============== INIT ==============
const resultCount = document.getElementById("resultCount");
if (resultCount) resultCount.textContent = "Chargement...";

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    const main = document.querySelector(".main");
    if (main) {
      e.preventDefault();
      const scrollAmount = 80;
      if (e.key === "ArrowDown") {
        main.scrollTop += scrollAmount;
      } else {
        main.scrollTop -= scrollAmount;
      }
    }
  }
});
