// ============== DONNÉES ==============
const skills = [
  { icon: "🎨", title: "Design System", priority: "high", priorityLabel: "Priorité : Haute", value: 40 },
  { icon: "🧩", title: "Prototyping avancé", priority: "high", priorityLabel: "Priorité : Haute", value: 35 },
  { icon: "🔍", title: "User Research", priority: "medium", priorityLabel: "Priorité : Moyenne", value: 60 },
  { icon: "🧑‍🤝‍🧑", title: "Leadership", priority: "low", priorityLabel: "Priorité : Basse", value: 25 }
];

const formations = [
  { icon: "🎨", bg: "#f24e1e", title: "Design System avec Figma", level: "Intermédiaire", duration: "8h", rating: "4.8", reviews: 72 },
  { icon: "🧩", bg: "#6d28d9", title: "Prototyping avancé", level: "Intermédiaire", duration: "6h", rating: "4.7", reviews: 65 },
  { icon: "🔍", bg: "#0ea5e9", title: "User Research Méthodes", level: "Débutant", duration: "5h", rating: "4.6", reviews: 74 },
  { icon: "🧑‍🤝‍🧑", bg: "#16a34a", title: "Leadership & Soft Skills", level: "Débutant", duration: "4h", rating: "4.5", reviews: 63 }
];

const objectifs = [
  { icon: "🎯", bg: "#3b6bf5", title: "Obtenir un poste de Product Designer", date: "Échéance : Déc 2024", value: 35 },
  { icon: "💲", bg: "#16a34a", title: "Augmenter mon salaire de 30%", date: "Échéance : Mars 2025", value: 60 },
  { icon: "🎨", bg: "#8b5cf6", title: "Maîtriser Figma avancé", date: "Échéance : Jan 2025", value: 80 }
];

const timeline = [
  { title: "Product Designer Junior", status: "done", statusLabel: "Terminé", date: "Mai 2024" },
  { title: "Product Designer", status: "current", statusLabel: "En cours", date: "Déc 2024" },
  { title: "Product Designer Senior", status: "upcoming", statusLabel: "À venir", date: "Déc 2025" },
  { title: "Lead Product Designer", status: "upcoming", statusLabel: "À venir", date: "Déc 2026" }
];

function escapeHtml(str) {
  return (str || "").toString()
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// ============== RENDU SCORE RING ==============
function renderCareerRing() {
  const ring = document.getElementById("careerRing");
  const score = 78;
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  ring.style.strokeDasharray = circumference;
  ring.style.strokeDashoffset = circumference;
  requestAnimationFrame(() => {
    setTimeout(() => {
      ring.style.transition = "stroke-dashoffset 1.2s ease";
      ring.style.strokeDashoffset = circumference - (score / 100) * circumference;
    }, 150);
  });
}

// ============== RENDU COMPETENCES ==============
function renderSkills() {
  const grid = document.getElementById("skillsGrid");
  grid.innerHTML = skills.map((s, i) => `
    <div class="skill-card">
      <div class="skill-card-head">
        <div class="skill-card-icon">${s.icon}</div>
        <div>
          <div class="skill-card-title">${s.title}</div>
          <span class="skill-priority ${s.priority}">${s.priorityLabel}</span>
        </div>
      </div>
      <div class="skill-card-level">Votre niveau actuel</div>
      <div class="skill-card-bar"><div class="skill-card-fill" id="skillFill${i}"></div></div>
      <button class="btn-improve">Améliorer</button>
    </div>
  `).join("");

  requestAnimationFrame(() => {
    setTimeout(() => {
      skills.forEach((s, i) => {
        document.getElementById(`skillFill${i}`).style.width = s.value + "%";
      });
    }, 150);
  });
}

// ============== RENDU FORMATIONS ==============
function renderFormations() {
  const grid = document.getElementById("formationsGrid");
  grid.innerHTML = formations.map(f => `
    <div class="formation-card">
      <div class="formation-icon" style="background:${f.bg}">${f.icon}</div>
      <div class="formation-title">${f.title}</div>
      <span class="formation-level">${f.level}</span>
      <div class="formation-meta">${f.duration} · ⭐ ${f.rating} (${f.reviews})</div>
      <button class="btn-formation">Voir la formation</button>
    </div>
  `).join("");
}

// ============== RENDU OBJECTIFS ==============
function renderObjectifs() {
  const grid = document.getElementById("objectifsGrid");
  const radius = 18;
  const circumference = 2 * Math.PI * radius;

  grid.innerHTML = objectifs.map((o, i) => {
    const offset = circumference - (o.value / 100) * circumference;
    return `
      <div class="objectif-card">
        <div style="display:flex;align-items:center;gap:12px;min-width:0;">
          <div class="objectif-icon" style="background:${o.bg}">${o.icon}</div>
          <div style="min-width:0;">
            <div class="objectif-title">${o.title}</div>
            <div class="objectif-date">${o.date}</div>
          </div>
        </div>
        <div class="objectif-ring">
          <svg viewBox="0 0 44 44">
            <circle class="objectif-ring-bg" cx="22" cy="22" r="${radius}"></circle>
            <circle class="objectif-ring-fg" cx="22" cy="22" r="${radius}"
              stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"></circle>
          </svg>
          <div class="objectif-ring-num">${o.value}%</div>
        </div>
      </div>
    `;
  }).join("") + `
    <div class="add-objectif">
      <span class="plus">+</span>
      Ajouter un objectif
    </div>
  `;
}

// ============== RENDU TIMELINE ==============
function renderTimeline() {
  const list = document.getElementById("timelineList");
  list.innerHTML = timeline.map(t => `
    <li>
      <div class="timeline-dot ${t.status}">${t.status === "done" ? "✓" : ""}</div>
      <div class="timeline-content">
        <div class="timeline-title">${t.title}</div>
        <div class="timeline-row">
          <span class="timeline-status ${t.status}">${t.statusLabel}</span>
          <span class="timeline-date">${t.date}</span>
        </div>
      </div>
    </li>
  `).join("");
}

// ============== TABS ==============
const tabLabels = {
  plan: "Plan de carrière",
  skills: "Compétences",
  objectifs: "Objectifs",
  insights: "Analyses & Insights",
  conseils: "Conseils IA"
};

const sectionLayouts = {
  overview: "overviewLayout",
  plan: "planLayout",
  skills: "skillsLayout",
  insights: "insightsLayout",
  conseils: "conseilsLayout",
  objectifs: "objectivesLayout",
  overview_full: "overviewFullLayout"
};

function hideAllLayouts() {
  Object.values(sectionLayouts).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });
  const placeholder = document.getElementById("tabPlaceholder");
  if (placeholder) placeholder.style.display = "none";
}

document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    const key = tab.dataset.tab;
    hideAllLayouts();

    if (key === "overview") {
      const el = document.getElementById(sectionLayouts.overview);
      if (el) el.style.display = "grid";
      loadOverviewHighlights();
    } else if (key === "objectifs") {
      const el = document.getElementById(sectionLayouts.objectifs);
      if (el) el.style.display = "block";
      if (typeof renderObjectives === "function") renderObjectives();
    } else {
      const el = document.getElementById(sectionLayouts[key]);
      if (el) el.style.display = "block";
      const fullMap = {
        plan: "plan",
        skills: "skills",
        insights: "insights",
        conseils: "conseils"
      };
      if (fullMap[key]) {
        loadAiSection(fullMap[key]);
      }
    }
  });
});

async function getFirebaseIdToken() {
  try {
    const user = firebase.auth().currentUser;
    if (!user) return null;
    return await user.getIdToken();
  } catch (e) {
    return null;
  }
}

function getCachedObjective() {
  try {
    const raw = localStorage.getItem("vera_objective");
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || !data.title) return null;
    return data;
  } catch (e) {
    return null;
  }
}

function cacheObjective(objective) {
  try {
    if (!objective) return;
    localStorage.setItem("vera_objective", JSON.stringify(objective));
  } catch (e) {}
}

function isFirebaseNetworkError(e) {
  if (!e) return false;
  const msg = (e.message || "").toString().toLowerCase();
  return msg.includes("failed to fetch") || msg.includes("network") || msg.includes("fetch") || msg.includes("cordova") || msg.includes("firebase");
}

async function loadAiSection(section) {
  const map = {
    plan: "planFullContent",
    skills: "skillsFullContent",
    insights: "insightsFullContent",
    conseils: "conseilsFullContent",
    overview: "overviewFullContent"
  };
  const el = document.getElementById(map[section]);
  if (!el) return;
  el.innerHTML = '<span style="opacity:0.6;">Génération en cours...</span>';

  try {
    const token = await getFirebaseIdToken();
    const cachedObjective = getCachedObjective();

    if (!token && !cachedObjective) {
      el.textContent = "Vous devez être connecté ou avoir déjà créé un objectif.";
      return;
    }

    const headers = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Cache-Control": "no-cache"
    };

    if (token) {
      headers["Authorization"] = "Bearer " + token;
    } else if (cachedObjective) {
      headers["X-Offline-Mode"] = "true";
    }

    const body = { section };
    if (!token && cachedObjective) {
      body.objective = cachedObjective;
    }

    const response = await fetch("/coaching/advice?t=" + Date.now(), {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });

    const rawText = await response.text();
    let data = {};
    try { data = JSON.parse(rawText); } catch (e) { data = { raw: rawText }; }

    console.log("[COACH] section=" + section + " status=" + response.status, data);

    if (data.success && data.reply) {
      el.innerHTML = formatAiReply(data.reply);
      const goalEl = document.getElementById("planGoalValue");
      if (goalEl && data.objective && data.objective.title) {
        goalEl.textContent = data.objective.title;
      }
    } else if (response.status === 0 || response.type === "opaque" || response.type === "error") {
      el.textContent = "Réseau indisponible : vérifiez votre connexion Internet.";
    } else if (!token && cachedObjective) {
      el.textContent = "Connexion au coach impossible hors-ligne pour le moment.";
    } else {
      el.textContent = data.message || "Erreur lors de la génération.";
    }
  } catch (e) {
    console.error("[COACH] fetch error", e);
    el.textContent = "Erreur réseau lors de la génération du contenu.";
  }
}

function formatAiReply(text) {
  if (!text) return "";
  return escapeHtml(text)
    .split('\n')
    .map(line => {
      const trimmed = line.trim();
      if (trimmed === "") return "";
      if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
        return "<div style=\"margin:4px 0 4px 12px;\">" + trimmed + "</div>";
      }
      if (/^\d+\./.test(trimmed)) {
        return "<div style=\"margin:4px 0 4px 12px;\">" + trimmed + "</div>";
      }
      if (trimmed.endsWith(":")) {
        return "<strong style=\"display:block;margin:10px 0 4px;\">" + trimmed + "</strong>";
      }
      return "<p style=\"margin:0 0 8px;line-height:1.6;\">" + trimmed + "</p>";
    })
    .join("");
}

async function loadOverviewHighlights() {
  const skillsEl = document.getElementById("skillsAiContent");
  const adviceEl = document.getElementById("adviceAiContent");
  const insightsEl = document.getElementById("insightsAiContent");

  if (!skillsEl && !adviceEl && !insightsEl) return;

  try {
    const token = await getFirebaseIdToken();
    if (!token) return;

    const sections = ["skills", "conseils", "insights"];
    for (const section of sections) {
      const response = await fetch("/coaching/advice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify({ section: section })
      });

      const rawText = await response.text();
      let data = {};
      try { data = JSON.parse(rawText); } catch (e) { data = { raw: rawText }; }

      console.log("[COACH][overview] section=" + section + " status=" + response.status, data);
      if (!data.success) continue;

      if (section === "skills" && skillsEl) {
        skillsEl.innerHTML = formatAiReply(data.reply);
      } else if (section === "conseils" && adviceEl) {
        adviceEl.innerHTML = formatAiReply(data.reply);
      } else if (section === "insights" && insightsEl) {
        insightsEl.innerHTML = formatAiReply(data.reply);
      }
    }
  } catch (e) {
    console.error("[COACH][overview] error", e);
  }
}

// ============== BOUTON COACH IA ==============
document.getElementById("coachBtn").addEventListener("click", () => {
  const btn = document.getElementById("coachBtn");
  const original = btn.textContent;
  btn.textContent = "Connexion au coach...";
  setTimeout(() => { btn.textContent = original; }, 1200);
});

// ============== BOUTONS INTERACTIFS (démo) ==============
document.addEventListener("click", (e) => {
  if (e.target.matches(".btn-improve, .btn-formation")) {
    const original = e.target.textContent;
    e.target.textContent = "✓ Ajouté";
    setTimeout(() => { e.target.textContent = original; }, 1200);
  }
});

// ============== OBJECTIFS (CRUD Firebase) ==============
function objRef() {
  const user = firebase.auth().currentUser;
  return user ? firebase.database().ref("users/" + user.uid + "/objectives") : null;
}

function objMatches(obj, q) {
  if (!q) return true;
  const hay = [obj.title, obj.category, obj.description, obj.targetDate].join(" ").toLowerCase();
  return hay.includes(q.toLowerCase());
}

function renderObjectives() {
  const list = document.getElementById("objList");
  const empty = document.getElementById("objEmpty");
  const search = document.getElementById("objSearch");
  if (!list) return;
  const ref = objRef();
  if (!ref) {
    if (list) list.innerHTML = '<div class="exp-empty"><p>Connectez-vous pour voir vos objectifs.</p></div>';
    return;
  }

  const q = search ? search.value.trim() : "";

  ref.once("value").then((snapshot) => {
    const data = snapshot.val() || {};
    const items = Object.keys(data).map((id) => ({ id, ...data[id] }));

    if (items.length > 0) {
      cacheObjective(items[0]);
    }

    const addBtn = document.getElementById("objAddBtn");
    if (addBtn) addBtn.style.display = items.length >= 1 ? "none" : "";

    const filtered = items.filter((o) => objMatches(o, q));

    list.innerHTML = "";
    if (filtered.length === 0) {
      empty.style.display = "block";
      empty.querySelector("p").textContent = q
        ? "Aucun objectif ne correspond à votre recherche."
        : "Aucun objectif pour le moment.";
      return;
    }
    empty.style.display = "none";

    let rows = "";
    filtered.forEach((o) => {
      const category = escapeHtml(o.category || "Général");
      const title = escapeHtml(o.title || "Objectif");
      const target = escapeHtml(o.targetDate || "—");
      const desc = escapeHtml(o.description || "—");
      rows += `
        <tr>
          <td><button class="exp-cell-title obj-title-edit" data-id="${o.id}" title="Cliquer pour modifier">${title}</button></td>
          <td>${category}</td>
          <td>${target}</td>
          <td class="exp-desc-cell">${desc}</td>
          <td class="exp-action-cell">
            <button class="exp-delete-btn" data-id="${o.id}" title="Supprimer">
              <img src="/image/delete.png" alt="Supprimer">
            </button>
          </td>
        </tr>`;
    });

    list.innerHTML = `
      <table class="exp-table">
        <thead>
          <tr>
            <th>Titre</th>
            <th>Catégorie</th>
            <th>Date cible</th>
            <th>Description</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;

    list.querySelectorAll(".obj-title-edit").forEach((b) => b.addEventListener("click", () => openObjModal(b.dataset.id)));
    list.querySelectorAll(".exp-delete-btn").forEach((b) => b.addEventListener("click", () => deleteObjective(b.dataset.id)));
  }).catch((err) => {
    if (list) list.innerHTML = '<div class="exp-empty"><p>Impossible de charger les objectifs.</p><span>' + (err && (err.message || err.code) || "") + '</span></div>';
  });
}

function deleteObjective(id) {
  if (!confirm("Supprimer cet objectif ?")) return;
  const ref = objRef();
  if (!ref) return;
  ref.child(id).remove()
    .then(() => { localStorage.removeItem("vera_objective"); renderObjectives(); })
    .catch((err) => alert("Échec de la suppression : " + (err.message || err.code)));
}

let objModal, objFormEl, objModalTitle, objEditId;

function buildObjModal() {
  if (document.getElementById("objModal")) return;
  const overlay = document.createElement("div");
  overlay.className = "exp-modal-overlay";
  overlay.id = "objModal";
  overlay.innerHTML = `
    <div class="exp-modal">
      <div class="exp-modal-head">
        <h3 id="objModalTitle">Ajouter un objectif</h3>
        <button class="exp-modal-close" id="objModalClose" type="button">×</button>
      </div>
      <form id="objForm" class="exp-form">
        <label>Titre de l'objectif<input type="text" name="title" required placeholder="Ex. Devenir Lead Designer"></label>
        <label>Catégorie
          <select name="category">
            <option value="Carrière">Carrière</option>
            <option value="Compétences">Compétences</option>
            <option value="Salaire">Salaire</option>
            <option value="Formation">Formation</option>
            <option value="Autre">Autre</option>
          </select>
        </label>
        <label>Date cible<input type="text" name="targetDate" placeholder="Ex. Décembre 2026"></label>
        <label>Description<input type="text" name="description" placeholder="Détails de votre objectif..."></label>
        <div class="exp-form-actions">
          <button type="button" class="btn-outline-sm" id="objCancel">Annuler</button>
          <button type="submit" class="btn-primary-sm">Enregistrer</button>
        </div>
      </form>
    </div>`;
  document.body.appendChild(overlay);

  objModal = overlay;
  objFormEl = overlay.querySelector("#objForm");
  objModalTitle = overlay.querySelector("#objModalTitle");
  objEditId = null;

  overlay.querySelector("#objModalClose").addEventListener("click", closeObjModal);
  overlay.querySelector("#objCancel").addEventListener("click", closeObjModal);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeObjModal(); });

  objFormEl.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = firebase.auth().currentUser;
    if (!user) return;
    const fd = new FormData(objFormEl);
    const payload = {
      title: (fd.get("title") || "").toString().trim(),
      category: (fd.get("category") || "Autre").toString().trim(),
      targetDate: (fd.get("targetDate") || "").toString().trim(),
      description: (fd.get("description") || "").toString().trim()
    };
    const ref = objRef();
    if (!ref) return;

    if (objEditId) {
      ref.child(objEditId).update(payload)
        .then(() => { cacheObjective(payload); closeObjModal(); renderObjectives(); })
        .catch((err) => alert("Échec de l'enregistrement : " + (err.message || err.code)));
    } else {
      ref.once("value").then((snap) => {
        const existing = snap.val() || {};
        if (Object.keys(existing).length >= 1) {
          alert("Vous ne pouvez ajouter qu'un seul objectif.");
          return;
        }
        ref.push(payload)
          .then(() => { cacheObjective(payload); closeObjModal(); renderObjectives(); })
          .catch((err) => alert("Échec de l'enregistrement : " + (err.message || err.code)));
      }).catch((err) => alert("Échec de la vérification : " + (err.message || err.code)));
    }
  });
}

function openObjModal(id) {
  buildObjModal();
  const ref = objRef();
  if (!ref) return;
  objFormEl.reset();
  if (id) {
    objEditId = id;
    objModalTitle.textContent = "Modifier l'objectif";
    ref.child(id).once("value").then((snap) => {
      const d = snap.val() || {};
      objFormEl.title.value = d.title || "";
      objFormEl.category.value = d.category || "Autre";
      objFormEl.targetDate.value = d.targetDate || "";
      objFormEl.description.value = d.description || "";
    });
  } else {
    objEditId = null;
    objModalTitle.textContent = "Ajouter un objectif";
  }
  objModal.classList.add("active");
}

function closeObjModal() {
  if (objModal) objModal.classList.remove("active");
  objEditId = null;
}

const objAddBtn = document.getElementById("objAddBtn");
if (objAddBtn) objAddBtn.addEventListener("click", () => openObjModal(null));

const objSearchEl = document.getElementById("objSearch");
if (objSearchEl) objSearchEl.addEventListener("input", renderObjectives);

const objSearchToggle = document.getElementById("objSearchToggle");
const objSearchWrap = document.getElementById("objSearchWrap");
if (objSearchToggle && objSearchWrap) {
  objSearchToggle.addEventListener("click", () => {
    const visible = objSearchWrap.style.display !== "none";
    if (visible) {
      objSearchWrap.style.display = "none";
      if (objSearchEl) { objSearchEl.value = ""; renderObjectives(); }
    } else {
      objSearchWrap.style.display = "flex";
      if (objSearchEl) objSearchEl.focus();
    }
  });
}

// ============== INIT ==============
renderCareerRing();
renderSkills();
renderFormations();
renderObjectifs();
renderTimeline();

const adviceCardBtn = document.getElementById("adviceCardBtn");
if (adviceCardBtn) {
  adviceCardBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const conseilsTab = document.querySelector('.tab[data-tab="conseils"]');
    if (conseilsTab) conseilsTab.click();
  });
}

const coachBtn = document.getElementById("coachBtn");
if (coachBtn) {
  coachBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const conseilsTab = document.querySelector('.tab[data-tab="conseils"]');
    if (conseilsTab) conseilsTab.click();
  });
}

// Load overview highlights on startup if objective exists
(function loadInitialHighlights() {
  const ref = objRef();
  if (!ref) return;
  ref.once("value").then(snap => {
    const data = snap.val() || {};
    if (Object.keys(data).length > 0) {
      loadOverviewHighlights();
      const skillsEl = document.getElementById("skillsAiSection");
      if (skillsEl) skillsEl.style.display = "";
    }
  });
})();
