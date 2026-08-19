// ============== DONNÉES DE SECOURS ==============
const defaultContinueCourses = [
  { icon: "/image/3917361.png", bg: "#f24e1e", title: "Design System avec Figma", level: "Intermédiaire", levelClass: "intermediate", value: 75, remaining: "2h 15m restantes" },
  { icon: "/image/3917361.png", bg: "#6d28d9", title: "Prototyping avancé", level: "Intermédiaire", levelClass: "intermediate", value: 60, remaining: "1h 30m restantes" },
  { icon: "/image/3917754.png", bg: "#0ea5e9", title: "User Research Méthodes", level: "Intermédiaire", levelClass: "intermediate", value: 40, remaining: "1h restantes" },
  { icon: "/image/3917361.png", bg: "#16a34a", title: "Leadership & Soft Skills", level: "Débutant", levelClass: "beginner", value: 25, remaining: "45m restantes" }
];

const defaultRecoCourses = [
  { icon: "/image/edit.png", bg: "#f59e0b", title: "UX Writing", level: "Intermédiaire", duration: "6h", rating: "4.7", reviews: 89, category: "Design" },
  { icon: "/image/7653263.png", bg: "#ef4444", title: "Data Visualization", level: "Intermédiaire", duration: "8h", rating: "4.6", reviews: 74, category: "Data" },
  { icon: "/image/3917505.png", bg: "#3b6bf5", title: "Gestion de projet Agile", level: "Intermédiaire", duration: "10h", rating: "4.8", reviews: 126, category: "Business" },
  { icon: "/image/7653263.png", bg: "#16a34a", title: "SEO Avancé", level: "Intermédiaire", duration: "7h", rating: "4.5", reviews: 63, category: "Marketing" }
];

const defaultCategories = [
  { icon: "/image/3917361.png", title: "Design & UX", count: "24 formations" },
  { icon: "/image/3916670.png", title: "Développement", count: "36 formations" },
  { icon: "/image/mission.png", title: "Business", count: "28 formations" },
  { icon: "/image/discussion.png", title: "Marketing", count: "22 formations" },
  { icon: "/image/7653263.png", title: "Data & IA", count: "18 formations" },
  { icon: "/image/3917361.png", title: "Soft Skills", count: "16 formations" }
];

const defaultGoals = [
  { color: "#3b6bf5", title: "Devenir Product Designer Senior", value: 60 },
  { color: "#8b5cf6", title: "Maîtriser Figma avancé", value: 80 },
  { color: "#0ea5e9", title: "Améliorer mes compétences en UX Research", value: 40 }
];

// ============== HELPERS ==============
async function getFirebaseIdToken() {
  try {
    const user = firebase.auth().currentUser;
    if (!user) return null;
    return await user.getIdToken();
  } catch (e) {
    return null;
  }
}

function getUserRef() {
  const user = firebase.auth().currentUser;
  return user ? firebase.database().ref("users/" + user.uid) : null;
}

function getUserFormationsRef() {
  const user = firebase.auth().currentUser;
  return user ? firebase.database().ref("users/" + user.uid + "/formations") : null;
}

function mapLevelToClass(level) {
  const l = (level || "").toLowerCase();
  if (l === "débutant" || l === "debutant") return "beginner";
  return "intermediate";
}

// ============== RENDU REPRENDRE MES FORMATIONS ==============
function renderContinueCourses(courses) {
  const grid = document.getElementById("continueGrid");
  if (!grid) return;

  if (!courses || courses.length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1;color:var(--muted);padding:12px 0;">Vous n\'avez pas encore commencé de formation.</div>';
    return;
  }

  grid.innerHTML = courses.map((c, i) => `
    <div class="course-card">
      <div class="course-icon" style="background:${c.bg}"><img src="${c.icon}" alt="" style="width:20px;height:20px;object-fit:contain;"></div>
      <div class="course-title">${c.title}</div>
      <span class="course-level ${c.levelClass}">${c.level}</span>
      <div class="course-bar"><div class="course-fill" id="courseFill${i}"></div></div>
      <div class="course-percent">${c.value}%</div>
      <div class="course-remain"><img src="/image/3917292.png" alt="" style="width:14px;height:14px;object-fit:contain;vertical-align:middle;margin-right:4px;">${c.remaining}</div>
      <button class="btn-continue">Continuer</button>
    </div>
  `).join("");

  requestAnimationFrame(() => {
    setTimeout(() => {
      courses.forEach((c, i) => {
        const el = document.getElementById(`courseFill${i}`);
        if (el) el.style.width = c.value + "%";
      });
    }, 150);
  });
}

// ============== RENDU RECOMMANDEES ==============
function renderRecoCourses(courses) {
  const grid = document.getElementById("recoGrid");
  if (!grid) return;

  if (!courses || courses.length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1;color:var(--muted);padding:12px 0;">Aucune recommandation pour le moment.</div>';
    return;
  }

  grid.innerHTML = courses.map(c => `
    <div class="reco-card">
      <div class="reco-icon" style="background:${c.bg}"><img src="${c.icon}" alt="" style="width:20px;height:20px;object-fit:contain;"></div>
      <div class="reco-title">${c.title}</div>
      <span class="reco-level">${c.level}</span>
      <div class="reco-meta">${c.duration || ''} · Certificat · <img src="/image/3914133.png" alt="" style="width:14px;height:14px;object-fit:contain;vertical-align:middle;"> ${c.rating || '—'} (${c.reviews || '—'})</div>
      <button class="btn-reco">Voir la formation</button>
    </div>
  `).join("");
}

// ============== RENDU CATEGORIES ==============
function renderCategories(categories) {
  const grid = document.getElementById("categoriesGrid");
  if (!grid) return;

  if (!categories || categories.length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1;color:var(--muted);padding:12px 0;">Aucune catégorie disponible.</div>';
    return;
  }

  grid.innerHTML = categories.map(c => `
    <div class="category-card">
      <div class="category-icon"><img src="${c.icon}" alt="" style="width:20px;height:20px;object-fit:contain;"></div>
      <div class="category-title">${c.title}</div>
      <div class="category-count">${c.count}</div>
    </div>
  `).join("");
}

// ============== RENDU OBJECTIFS ==============
function renderGoals(goals) {
  const list = document.getElementById("goalsList");
  if (!list) return;

  if (!goals || goals.length === 0) {
    list.innerHTML = '<div style="color:var(--muted);padding:8px 0;">Ajoutez un objectif d\'apprentissage pour suivre votre progression.</div>';
    return;
  }

  list.innerHTML = goals.map((g, i) => `
    <div class="goal-item">
      <div class="goal-row">
        <span class="goal-icon" style="background:${g.color}"></span>
        <span>${g.title}</span>
        <span class="goal-percent">${g.value}%</span>
      </div>
      <div class="goal-bar"><div class="goal-fill" id="goalFill${i}"></div></div>
    </div>
  `).join("");

  requestAnimationFrame(() => {
    setTimeout(() => {
      goals.forEach((g, i) => {
        const el = document.getElementById(`goalFill${i}`);
        if (el) el.style.width = g.value + "%";
      });
    }, 150);
  });
}

// ============== HERO DYNAMIQUE ==============
async function loadHeroData(serverHero) {
  const titleEl = document.getElementById("heroTitle");
  const subtitleEl = document.getElementById("heroSubtitle");
  const progressValueEl = document.getElementById("heroProgressValue");
  const progressFillEl = document.getElementById("heroProgressFill");
  const streakValueEl = document.getElementById("heroStreakValue");
  const streakSubEl = document.getElementById("heroStreakSub");

  const user = firebase.auth().currentUser;
  const authName = user
    ? (user.displayName ? user.displayName.split(" ")[0] : (user.email ? user.email.split("@")[0] : ""))
    : "";

  let firstName = serverHero && serverHero.firstName ? serverHero.firstName : authName;

  if (titleEl) {
    titleEl.textContent = firstName
      ? "Continuez votre apprentissage, " + firstName + " !"
      : "Continuez votre apprentissage !";
  }

  if (!serverHero) {
    try {
      const formationsRef = getUserFormationsRef();
      if (formationsRef) {
        const snap = await formationsRef.once("value");
        const data = snap.val() || {};
        const items = Object.keys(data).map((id) => ({ id, ...data[id] }));

        let globalProgress = 0;
        if (items.length > 0) {
          const total = items.reduce((sum, item) => {
            const progress = parseInt(item.progress || item.value || 0, 10);
            return sum + (isNaN(progress) ? 0 : progress);
          }, 0);
          globalProgress = Math.round(total / items.length);
        }

        if (progressValueEl) progressValueEl.textContent = globalProgress + "%";
        if (progressFillEl) progressFillEl.style.width = globalProgress + "%";

        if (subtitleEl) {
          subtitleEl.textContent = items.length > 0
            ? "Vous avez " + items.length + " formation" + (items.length > 1 ? "s" : "") + " en cours. Continuez à développer vos compétences."
            : "Ajoutez votre première formation pour commencer à suivre votre progression.";
        }
      }

      const userRef = getUserRef();
      if (userRef) {
        const userSnap = await userRef.once("value");
        const userData = userSnap.val() || {};
        const stats = userData.stats || {};
        const streak = parseInt(stats.learningStreak || 0, 10);
        const safeStreak = isNaN(streak) ? 0 : streak;

        if (streakValueEl) {
           streakValueEl.textContent = safeStreak + " jour" + (safeStreak > 1 ? "s" : "") + " <img src='/image/3914133.png' alt='' style='width:14px;height:14px;object-fit:contain;vertical-align:middle;'>";
        }
        if (streakSubEl) {
          streakSubEl.textContent = safeStreak > 0 ? "Continuez ainsi !" : "Commencez votre série !";
        }
      }
    } catch (e) {
      console.error("[FORMATIONS] hero load error", e);
    }
  } else {
    const globalProgress = Math.max(0, Math.min(100, parseInt(serverHero.globalProgress || 0, 10)));
    const streak = Math.max(0, parseInt(serverHero.learningStreak || 0, 10));

    if (progressValueEl) progressValueEl.textContent = globalProgress + "%";
    if (progressFillEl) progressFillEl.style.width = globalProgress + "%";

    if (streakValueEl) {
      streakValueEl.textContent = streak + " jour" + (streak > 1 ? "s" : "") + " <img src='/image/3914133.png' alt='' style='width:14px;height:14px;object-fit:contain;vertical-align:middle;'>";
    }
    if (streakSubEl) {
      streakSubEl.textContent = streak > 0 ? "Continuez ainsi !" : "Commencez votre série !";
    }
  }
}

// ============== CHARGEMENT DYNAMIQUE ==============
async function loadFormationsData() {
  try {
    const token = await getFirebaseIdToken();
    const headers = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Cache-Control": "no-cache"
    };

    if (token) {
      headers["Authorization"] = "Bearer " + token;
    }

    const response = await fetch("/formations/data?t=" + Date.now(), {
      method: "GET",
      headers
    });

    const rawText = await response.text();
    let data = {};
    try { data = JSON.parse(rawText); } catch (e) { data = {}; }

    if (data.success) {
      const continueCourses = (data.continueFormations || []).map(f => ({
        ...f,
        levelClass: mapLevelToClass(f.level)
      }));
      const recoCourses = (data.recoFormations || []).map(f => ({
        icon: f.icon || "/image/formation.png",
        bg: f.bg || "#3b6bf5",
        title: f.title || "Formation",
        level: f.level || "Intermédiaire",
        duration: f.duration || "",
        rating: f.rating || "—",
        reviews: f.reviews || "—"
      }));
      const categories = data.categories || [];
      const goals = data.objective ? [
        { color: "#3b6bf5", title: data.objective.title || "Objectif", value: 60 }
      ] : defaultGoals;

      renderContinueCourses(continueCourses.length > 0 ? continueCourses : defaultContinueCourses);
      renderRecoCourses(recoCourses.length > 0 ? recoCourses : defaultRecoCourses);
      renderCategories(categories.length > 0 ? categories : defaultCategories);
      renderGoals(goals);
    } else {
      renderWithDefaults();
    }

    loadHeroData(data && data.hero ? data.hero : null);
  } catch (e) {
    console.error("[FORMATIONS] load error", e);
    renderWithDefaults();
    loadHeroData(null);
  }
}

function renderWithDefaults() {
  renderContinueCourses(defaultContinueCourses);
  renderRecoCourses(defaultRecoCourses);
  renderCategories(defaultCategories);
  renderGoals(defaultGoals);
}

// ============== TABS ==============
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      const key = tab.dataset.tab;
      const overview = document.getElementById("overviewLayout");
      const placeholder = document.getElementById("tabPlaceholder");

      if (key === "overview") {
        if (overview) overview.style.display = "grid";
        if (placeholder) placeholder.style.display = "none";
      } else {
        if (overview) overview.style.display = "none";
        if (placeholder) {
          placeholder.style.display = "block";
          placeholder.textContent =
            "Section \"" +
            {
              mesformations: "Mes formations",
              catalogue: "Parcourir le catalogue",
              certifs: "Certifications",
              reco: "Recommandées pour vous",
              favoris: "Mes favoris"
            }[key] +
            "\" — contenu à compléter prochainement.";
        }
      }
    });
  });

  const coachSearchBtn = document.getElementById("coachSearchBtn");
  if (coachSearchBtn) {
    coachSearchBtn.addEventListener("click", () => {
      const original = coachSearchBtn.textContent;
      coachSearchBtn.textContent = "Recherche en cours...";
      setTimeout(() => { coachSearchBtn.textContent = original; }, 1200);
    });
  }

  const addGoalBtn = document.querySelector(".add-goal-btn");
  if (addGoalBtn) {
    addGoalBtn.addEventListener("click", function () {
      const original = this.textContent;
      this.innerHTML = '<img src="/image/3917505.png" alt="" style="width:14px;height:14px;object-fit:contain;vertical-align:middle;margin-right:6px;">Objectif ajouté';
      setTimeout(() => { this.textContent = original; }, 1200);
    });
  }

  document.addEventListener("click", (e) => {
    if (e.target.matches(".btn-continue, .btn-reco")) {
      const original = e.target.textContent;
      e.target.textContent = "Chargement...";
      setTimeout(() => { e.target.textContent = original; }, 1000);
    }
  });

  const certDownload = document.querySelector(".cert-download");
  if (certDownload) {
    certDownload.addEventListener("click", function () {
      const original = this.textContent;
      this.innerHTML = '<img src="/image/3917505.png" alt="" style="width:14px;height:14px;object-fit:contain;vertical-align:middle;margin-right:6px;">Téléchargé';
      setTimeout(() => { this.textContent = original; }, 1200);
    });
  }

  loadFormationsData();
});
