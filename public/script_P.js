// ============== DONNÉES COMPÉTENCES ==============
const skills = [
  { name: "Figma", value: 95 },
  { name: "UX Research", value: 90 },
  { name: "Adobe XD", value: 90 },
  { name: "Prototyping", value: 85 },
  { name: "UI Design", value: 95 },
  { name: "Design System", value: 80 }
];

function renderSkills() {
  const grid = document.getElementById("skillsGrid");
  grid.innerHTML = skills.map((s, i) => `
    <div class="skill-row">
      <div class="skill-label"><span>${s.name}</span><span>${s.value}%</span></div>
      <div class="skill-bar"><div class="skill-bar-fill" data-value="${s.value}" id="skillFill${i}"></div></div>
    </div>
  `).join("");

  requestAnimationFrame(() => {
    setTimeout(() => {
      skills.forEach((s, i) => {
        document.getElementById(`skillFill${i}`).style.width = s.value + "%";
      });
    }, 100);
  });
}

function renderKeySkills() {
  const user = firebase.auth().currentUser;
  if (!user) return;
  const grid = document.getElementById("skillsGrid");
  const seeAllLink = document.getElementById("seeAllSkillsLink");
  if (!grid) return;

  firebase.database().ref("users/" + user.uid + "/skills").once("value").then((snap) => {
    const data = snap.val() || {};
    const items = Object.keys(data).map((id) => ({ id, ...data[id] }));
    const total = items.length;

    if (seeAllLink) {
      seeAllLink.textContent = `Voir toutes mes compétences (${total}) →`;
    }

    const latest = items.slice(-6).reverse();
    if (latest.length === 0) {
      grid.innerHTML = `<div class="exp-empty" style="padding:20px;"><p>Aucune compétence pour le moment.</p></div>`;
      return;
    }

    grid.innerHTML = latest.map((s) => `
      <div class="skill-row">
        <div class="skill-label"><span>${escapeHtml(s.name || "Compétence")}</span><span>${escapeHtml(s.level || "—")}</span></div>
        <div class="skill-bar"><div class="skill-bar-fill" style="width:0%"></div></div>
      </div>
    `).join("");

    requestAnimationFrame(() => {
      setTimeout(() => {
        grid.querySelectorAll(".skill-bar-fill").forEach((fill, i) => {
          const level = latest[i] && latest[i].level;
          const width = level === "Expert" ? "100%" : level === "Avancé" ? "80%" : level === "Intermédiaire" ? "60%" : level === "Débutant" ? "40%" : "20%";
          fill.style.width = width;
        });
      }, 100);
    });
  }).catch(() => {
    if (grid) grid.innerHTML = `<div class="exp-empty" style="padding:20px;"><p>Impossible de charger les compétences.</p></div>`;
  });
}

// ============== SCORE RING ==============
function renderScoreRing(score = 92) {
  const ring = document.getElementById("scoreRing");
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  ring.style.strokeDasharray = circumference;
  ring.style.strokeDashoffset = circumference;

  requestAnimationFrame(() => {
    setTimeout(() => {
      const offset = circumference - (score / 100) * circumference;
      ring.style.transition = "stroke-dashoffset 1.2s ease";
      ring.style.strokeDashoffset = offset;
    }, 150);
  });
}

// ============== TABS ==============
const tabLabels = {
  info: "Informations",
  exp: "Expérience",
  formations: "Formations",
  certifs: "Certifications",
  langues: "Langues",
  prefs: "Préférences"
};

document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    const key = tab.dataset.tab;
    const overview = document.getElementById("overviewLayout");
    const placeholder = document.getElementById("tabPlaceholder");
    const infoLayout = document.getElementById("infoLayout");
    const expLayout = document.getElementById("expLayout");
    const skillsLayout = document.getElementById("skillsLayout");
    const formLayout = document.getElementById("formLayout");
    const certifLayout = document.getElementById("certifLayout");
    const langLayout = document.getElementById("langLayout");
    const objectivesLayout = document.getElementById("objectivesLayout");
    const prefLayout = document.getElementById("prefLayout");

    overview.style.display = "none";
    placeholder.style.display = "none";
    if (infoLayout) infoLayout.style.display = "none";
    if (expLayout) expLayout.style.display = "none";
    if (skillsLayout) skillsLayout.style.display = "none";
    if (formLayout) formLayout.style.display = "none";
    if (certifLayout) certifLayout.style.display = "none";
    if (langLayout) langLayout.style.display = "none";
    if (objectivesLayout) objectivesLayout.style.display = "none";
    if (prefLayout) prefLayout.style.display = "none";

    if (key === "overview") {
      overview.style.display = "grid";
    } else if (key === "info") {
      if (infoLayout) infoLayout.style.display = "block";
    } else if (key === "exp") {
      if (expLayout) expLayout.style.display = "block";
      if (typeof renderExperiences === "function") renderExperiences();
    } else if (key === "skills") {
      if (skillsLayout) skillsLayout.style.display = "block";
      if (typeof renderSkillsManage === "function") renderSkillsManage();
      if (typeof renderKeySkills === "function") renderKeySkills();
    } else if (key === "formations") {
      if (formLayout) formLayout.style.display = "block";
      if (typeof renderFormations === "function") renderFormations();
    } else if (key === "certifs") {
      if (certifLayout) certifLayout.style.display = "block";
      if (typeof renderCertifications === "function") renderCertifications();
    } else if (key === "langues") {
      if (langLayout) langLayout.style.display = "block";
      if (typeof renderLanguages === "function") renderLanguages();
    } else if (key === "prefs") {
      if (prefLayout) prefLayout.style.display = "block";
      if (typeof renderPreferences === "function") renderPreferences();
    } else {
      placeholder.style.display = "block";
      placeholder.textContent = `Section "${tabLabels[key]}" — contenu à compléter prochainement.`;
    }
  });
});

// ============== SECTIONS ÉDITABLES (Informations / Disponibilité) ==============
const profileFields = [
  "firstName", "lastName", "email", "birthDate", "maritalStatus", "nationality", "residence",
  "whatsapp", "mainLanguage", "availability", "contractType",
  "workLocation", "salary", "jobTitle", "linkedin", "about",
  "experienceYears", "projectsCount", "clientsCount"
];

// Formate une date ISO (YYYY-MM-DD) en texte lisible (ex. 12 Mars 1997)
function formatDateFr(iso) {
  if (!iso) return "";
  const months = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
  const parts = iso.split("-");
  if (parts.length !== 3) return iso;
  const [y, m, d] = parts;
  return `${parseInt(d, 10)} ${months[parseInt(m, 10) - 1]} ${y}`;
}

function parseDateFr(fr) {
  if (!fr) return "";
  const months = {"janvier":1,"février":2,"mars":3,"avril":4,"mai":5,"juin":6,"juillet":7,"août":8,"septembre":9,"octobre":10,"novembre":11,"décembre":12};
  const m = fr.toLowerCase().match(/(\d{1,2})\s+([a-zéû]+)\s+(\d{4})/);
  if (!m) return "";
  const day = m[1].padStart(2, "0");
  const month = String(months[m[2]]).padStart(2, "0");
  return `${m[3]}-${month}-${day}`;
}

const SALARY_CURRENCIES = ["$", "€", "FCFA", "£", "¥"];

// Parse "2 000 – 3 000 $ / mois" -> { range: "2 000 – 3 000", currency: "$", period: "mois" }
function parseSalary(text) {
  const result = { range: "", currency: "$", period: "mois" };
  if (!text) return result;
  const cur = SALARY_CURRENCIES.find((c) => text.includes(c));
  if (cur) result.currency = cur;
  const nums = text.match(/[\d\s–-]+/);
  if (nums) result.range = nums[0].trim().replace(/\s*[-–]\s*/g, " – ");
  const per = text.match(/\/\s*(\w+)/);
  if (per) result.period = per[1];
  return result;
}

function formatLastUpdated(timestamp) {
  if (!timestamp) return "—";
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return "—";
  const months = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} à ${h}:${m}`;
}

function updateLastModified() {
  const user = firebase.auth().currentUser;
  if (!user) return Promise.resolve();
  return firebase.database().ref("users/" + user.uid + "/lastUpdated").set(firebase.database.ServerValue.TIMESTAMP);
}

function renderLastUpdated() {
  const user = firebase.auth().currentUser;
  if (!user) return;
  firebase.database().ref("users/" + user.uid + "/lastUpdated").once("value").then((snap) => {
    const el = document.getElementById("lastUpdatedDate");
    if (!el) return;
    const ts = snap.val();
    const text = ts ? formatLastUpdated(ts) : "—";
    el.textContent = `Dernière mise à jour : ${text}`;
  }).catch(() => {});
}

function renderCompletion() {
  const user = firebase.auth().currentUser;
  if (!user) return;
  firebase.database().ref("users/" + user.uid).once("value").then((snap) => {
    const data = snap.val() || {};
    const valueEl = document.getElementById("completionValue");
    const fillEl = document.getElementById("completionFill");
    const textEl = document.getElementById("completionText");
    if (!valueEl || !fillEl || !textEl) return;

    let score = 0;
    const maxScore = 100;

    const required = [
      "firstName", "lastName", "email", "birthDate", "residence", "whatsapp"
    ];
    const optional = [
      "nationality", "maritalStatus", "mainLanguage", "linkedin",
      "jobTitle", "availability", "contractType", "workLocation", "salary", "about"
    ];
    const stats = ["experienceYears", "projectsCount", "clientsCount"];

    const reqFilled = required.filter(f => (data[f] || "").toString().trim() !== "").length;
    score += (reqFilled / required.length) * 40;

    const optFilled = optional.filter(f => (data[f] || "").toString().trim() !== "").length;
    score += (optFilled / optional.length) * 25;

    const statsFilled = stats.filter(f => data[f] !== undefined && data[f] !== null && data[f] !== "" && data[f] > 0).length;
    score += (statsFilled / stats.length) * 10;

    const sections = ["experiences", "skills", "formations", "certifications", "languages", "preferences"];
    const sectionsFilled = sections.filter(s => {
      const sec = data[s];
      if (!sec || typeof sec !== "object") return false;
      const keys = Object.keys(sec);
      return keys.length > 0;
    }).length;
    score += (sectionsFilled / sections.length) * 25;

    const pct = Math.min(100, Math.max(0, Math.round(score)));
    valueEl.textContent = pct + "%";
    fillEl.style.width = pct + "%";

    const scoreNum = document.getElementById("scoreNum");
    const scoreBadge = document.getElementById("scoreBadge");
    const scoreText = document.getElementById("scoreText");
    if (scoreNum) scoreNum.innerHTML = `${pct}<span>/100</span>`;
    if (scoreBadge) {
      if (pct >= 90) scoreBadge.textContent = "🏆 Excellent";
      else if (pct >= 75) scoreBadge.textContent = "Très bon";
      else if (pct >= 50) scoreBadge.textContent = "👍 Bon début";
      else if (pct > 0) scoreBadge.textContent = "📝 À compléter";
      else scoreBadge.textContent = "😶 Vide";
    }
    if (scoreText) {
      if (pct >= 90) scoreText.textContent = "Ton profil est très attractif pour les recruteurs !";
      else if (pct >= 75) scoreText.textContent = "Continuez comme ça, vous êtes sur la bonne voie.";
      else if (pct >= 50) scoreText.textContent = "Ajoutez encore quelques informations pour améliorer votre score.";
      else if (pct > 0) scoreText.textContent = "Votre profil manque de détails pour être mis en avant.";
      else scoreText.textContent = "Commencez par remplir vos informations pour obtenir un score.";
    }

    renderScoreRing(pct);

    const profilePill = document.getElementById("profilePill");
    if (profilePill) profilePill.textContent = pct + "%";
  }).catch(() => {});
}

function displayValue(el, value) {
  const type = el.dataset.input;
  if (type === "date") return formatDateFr(value);
  return value;
}

function fillProfileFields(data) {
  profileFields.forEach((field) => {
    const el = document.querySelector(`[data-field="${field}"]`);
    if (!el) return;
    const value = data[field];
    if (value !== undefined && value !== null && value !== "") {
      el.dataset.value = value; // valeur brute (ex. ISO pour les dates)
      el.textContent = displayValue(el, value);
    }
  });
}

function fillInfoLayout(data) {
  const infoLayout = document.getElementById("infoLayout");
  if (!infoLayout) return;
  profileFields.forEach((field) => {
    const el = infoLayout.querySelector(`[data-field="${field}"]`);
    if (!el) return;
    const value = data[field];
    if (value !== undefined && value !== null && value !== "") {
      el.dataset.value = value;
      el.textContent = displayValue(el, value);
    }
  });
}

// Construit le contrôle d'édition selon le type (text, date, select, tags)
function buildEditor(el) {
  const type = el.dataset.input || "text";
  // Pour "Fonction de l'utilisateur", on démarre vide en édition (et non "Non renseigné")
  const current = el.dataset.field === "jobTitle"
    ? (el.dataset.value || "").trim()
    : (el.dataset.display || el.textContent).trim();

  if (type === "date") {
    const input = document.createElement("input");
    input.type = "date";
    input.className = "info-input";
    // Priorité à la valeur brute ISO stockée, sinon on parse le texte lisible
    input.value = el.dataset.value || parseDateFr(current) || "";
    return input;
  }

  if (type === "select") {
    const select = document.createElement("select");
    select.className = "info-input";
    const options = (el.dataset.options || "").split("|").filter(Boolean);
    options.forEach((opt) => {
      const o = document.createElement("option");
      o.value = opt;
      o.textContent = opt;
      if (opt === current) o.selected = true;
      select.appendChild(o);
    });
    return select;
  }

  if (type === "email") {
    const input = document.createElement("input");
    input.type = "email";
    input.className = "info-input";
    input.value = current;
    return input;
  }

  if (type === "tags") {
    const wrap = document.createElement("div");
    wrap.className = "tags-edit";
    const list = document.createElement("div");
    list.className = "tags-list";
    const input = document.createElement("input");
    input.type = "text";
    input.className = "info-input tags-input";
    input.placeholder = "Ajouter une langue...";

    const langs = current ? current.split(",").map((s) => s.trim()).filter(Boolean) : [];
    langs.forEach((lang) => list.appendChild(makeTag(lang, list)));

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        addTagFromInput(input, list);
      }
    });
    wrap.appendChild(list);
    wrap.appendChild(input);
    return wrap;
  }

  if (type === "salary") {
    const parsed = parseSalary(el.dataset.value || current);
    const wrap = document.createElement("div");
    wrap.className = "salary-edit";
    const amount = document.createElement("input");
    amount.type = "text";
    amount.className = "info-input salary-amount";
    amount.placeholder = "Montant (ex. 2 000 – 3 000)";
    amount.value = parsed.range;
    const currency = document.createElement("select");
    currency.className = "info-input salary-currency";
    SALARY_CURRENCIES.forEach((c) => {
      const o = document.createElement("option");
      o.value = c;
      o.textContent = c;
      if (c === parsed.currency) o.selected = true;
      currency.appendChild(o);
    });
    const period = document.createElement("select");
    period.className = "info-input salary-period";
    ["mois", "an", "jour"].forEach((p) => {
      const o = document.createElement("option");
      o.value = p;
      o.textContent = "/ " + p;
      if (p === parsed.period) o.selected = true;
      period.appendChild(o);
    });
    wrap.appendChild(amount);
    wrap.appendChild(currency);
    wrap.appendChild(period);
    return wrap;
  }

  const input = document.createElement("input");
  input.type = "text";
  input.className = "info-input";
  input.value = current;
  return input;
}

function makeTag(text, list) {
  const tag = document.createElement("span");
  tag.className = "tag-chip";
  tag.textContent = text;
  const close = document.createElement("button");
  close.type = "button";
  close.className = "tag-remove";
  close.textContent = "×";
  close.addEventListener("click", () => tag.remove());
  tag.appendChild(close);
  return tag;
}

function addTagFromInput(input, list) {
  const val = input.value.trim().replace(/,$/, "");
  if (val) {
    list.appendChild(makeTag(val, list));
    input.value = "";
  }
}

function readEditorValue(el) {
  const type = el.dataset.input || "text";
  if (type === "tags") {
    const tags = [...el.querySelectorAll(".tag-chip")].map((t) => t.firstChild.textContent.trim());
    return tags.join(", ");
  }
  if (type === "salary") {
    const amount = el.querySelector(".salary-amount");
    const currency = el.querySelector(".salary-currency");
    const period = el.querySelector(".salary-period");
    const range = amount && amount.value.trim() ? amount.value.trim() : "—";
    const cur = currency ? currency.value : "$";
    const per = period ? period.value : "mois";
    return `${range} ${cur} / ${per}`;
  }
  const ctrl = el.querySelector("input, select");
  return ctrl ? ctrl.value.trim() : el.textContent.trim();
}

function setSectionEditing(card, editing) {
  const values = card.querySelectorAll(".info-value");
  values.forEach((el) => {
    const current = el.textContent.trim();
    if (editing) {
      el.dataset.display = current;
      const editor = buildEditor(el);
      el.textContent = "";
      el.appendChild(editor);
      if (editor.focus) editor.focus();
    } else {
      const value = readEditorValue(el);
      el.textContent = value || current;
    }
  });
}

function collectSectionData(card) {
  const result = {};
  card.querySelectorAll(".info-value").forEach((el) => {
    result[el.dataset.field] = readEditorValue(el);
  });
  return result;
}

document.querySelectorAll(".btn-edit-section").forEach((btn) => {
  btn.addEventListener("click", () => {
    // Résout la carte cible (le bouton peut être hors de la carte via data-target)
    const card = btn.dataset.target
      ? document.querySelector(`.card[data-section="${btn.dataset.target}"]`)
      : btn.closest(".card");
    if (!card) return;

    if (btn.dataset.editing === "true") {
      // Enregistrer
      const user = firebase.auth().currentUser;
      if (!user) return;
      const updates = collectSectionData(card);

      // Reconstruit le nom complet à partir de prénom + nom
      const firstName = (updates.firstName || "").trim();
      const lastName = (updates.lastName || "").trim();
      updates.fullName = (firstName + " " + lastName).trim();
      const newEmail = (updates.email || "").trim().toLowerCase();

      btn.textContent = "Enregistrement...";
      btn.disabled = true;

      const tasks = [];
      // Mise à jour de l'email Firebase Auth (si modifié)
      if (newEmail && newEmail !== (user.email || "").toLowerCase()) {
        tasks.push(user.updateEmail(newEmail).catch((err) => {
          alert("Email non mis à jour (réauthentification requise) : " + (err.message || err.code));
        }));
      }
      // Mise à jour du displayName + email dans le profil auth
      tasks.push(user.updateProfile({
        displayName: updates.fullName,
        email: newEmail || user.email
      }).catch(() => {}));

      Promise.all(tasks)
        .then(() => firebase.database().ref("users/" + user.uid).update(updates))
        .then(() => {
          // Rafraîchit le nom complet affiché en haut du profil
          const nameEl = document.getElementById("profileFullName");
          if (nameEl) nameEl.textContent = updates.fullName || "Utilisateur";
          setSectionEditing(card, false);
          btn.textContent = "✓ Enregistré";
          btn.dataset.editing = "false";
          btn.disabled = false;
          setTimeout(() => { btn.textContent = "Modifier"; }, 1500);
          updateLastModified();
          renderCompletion();
        })
        .catch((error) => {
          btn.textContent = "Modifier";
          btn.dataset.editing = "false";
          btn.disabled = false;
          alert("Échec de l'enregistrement : " + (error.message || error.code));
        });
    } else {
      // Passer en mode édition
      setSectionEditing(card, true);
      btn.textContent = "Enregistrer";
      btn.dataset.editing = "true";
    }
  });
});

// ============== SECTION "À PROPOS DE MOI" (éditable) ==============
const aboutBtn = document.querySelector(".btn-edit-about");
const aboutEl = document.querySelector('[data-field="about"]');

if (aboutBtn && aboutEl) {
  aboutBtn.addEventListener("click", () => {
    const user = firebase.auth().currentUser;
    if (!user) return;

    if (aboutBtn.dataset.editing === "true") {
      const ta = aboutEl.querySelector("textarea");
      const value = ta ? ta.value.trim() : aboutEl.textContent.trim();
      aboutBtn.textContent = "Enregistrement...";
      aboutBtn.disabled = true;
      firebase.database().ref("users/" + user.uid).update({ about: value })
        .then(() => {
          aboutEl.textContent = value || "Non renseigné";
          aboutBtn.textContent = "✓ Enregistré";
          aboutBtn.dataset.editing = "false";
          aboutBtn.disabled = false;
          setTimeout(() => { aboutBtn.textContent = "Modifier"; }, 1500);
          updateLastModified();
          renderCompletion();
        })
        .catch((err) => {
          aboutBtn.textContent = "Modifier";
          aboutBtn.dataset.editing = "false";
          aboutBtn.disabled = false;
          alert("Échec de l'enregistrement : " + (err.message || err.code));
        });
    } else {
      const current = aboutEl.textContent.trim() === "Non renseigné" ? "" : aboutEl.textContent.trim();
      aboutEl.textContent = "";
      const ta = document.createElement("textarea");
      ta.className = "about-input";
      ta.rows = 4;
      ta.value = current;
      aboutEl.appendChild(ta);
      ta.focus();
      aboutBtn.textContent = "Enregistrer";
      aboutBtn.dataset.editing = "true";
    }
  });
}

// ============== STATISTIQUES (édition + Enregistrer sur Entrée) ==============
document.querySelectorAll(".stat-input").forEach((input) => {
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      input.blur();
    }
  });
  input.addEventListener("blur", () => {
    const user = firebase.auth().currentUser;
    if (!user) return;
    const field = input.dataset.stat;
    const value = parseInt(input.value, 10);
    const clean = isNaN(value) || value < 0 ? 0 : value;
    input.value = clean;
    firebase.database().ref("users/" + user.uid).update({ [field]: clean })
      .then(() => updateLastModified())
      .catch((err) => console.warn("Sauvegarde stat échouée:", field, err && (err.message || err.code)));
  });
});

// ============== INIT ==============
renderSkills();
renderKeySkills();
renderScoreRing();

const goToSkillsBtn = document.getElementById("goToSkillsBtn");
const seeAllSkillsLink = document.getElementById("seeAllSkillsLink");
const skillsTabBtn = document.querySelector('.tab[data-tab="skills"]');

function navigateToSkills() {
  if (skillsTabBtn) skillsTabBtn.click();
}

if (goToSkillsBtn) goToSkillsBtn.addEventListener("click", navigateToSkills);
if (seeAllSkillsLink) {
  seeAllSkillsLink.addEventListener("click", (e) => {
    e.preventDefault();
    navigateToSkills();
  });
}

// ============== PHOTO DE PROFIL (Firebase Storage + Realtime DB) ==============
const avatarImg = document.getElementById("profileAvatar");
const avatarInitial = document.getElementById("profileInitial");
const avatarEditBtn = document.getElementById("avatarEditBtn");
const avatarInput = document.getElementById("avatarInput");
const avatarSpinner = document.getElementById("avatarSpinner");
const avatarError = document.getElementById("avatarError");

function showInitial(firstName, lastName) {
  const letter = (firstName || lastName || "?").trim().charAt(0) || "?";
  avatarInitial.textContent = letter;
  avatarInitial.style.display = "flex";
  avatarImg.style.display = "none";
}

function showAvatar(url) {
  if (url) {
    avatarImg.onerror = () => {
      avatarImg.style.display = "none";
      avatarInitial.style.display = "flex";
    };
    avatarImg.src = url;
    avatarImg.style.display = "block";
    avatarInitial.style.display = "none";
  }
}

function loadProfile(user) {
  console.log("[PROFIL] loadProfile appelé pour uid:", user.uid);
  firebase.database().ref("users/" + user.uid).once("value").then((snapshot) => {
    const data = snapshot.val() || {};
    console.log("[PROFIL] données reçues:", data);
    const firstName = data.firstName
      || (user.displayName ? user.displayName.split(" ")[0] : "")
      || (user.email ? user.email.split("@")[0] : "");
    const lastName = data.lastName
      || (user.displayName ? user.displayName.split(" ").slice(1).join(" ") : "");

    const fullName = (data.fullName
      || ((firstName + " " + lastName).trim())
      || user.displayName || "").trim();
    const nameEl = document.getElementById("profileFullName");
    if (nameEl) nameEl.textContent = fullName || "Utilisateur";

    const initialDefaults = {};
    profileFields.forEach((field) => {
      if (field === "jobTitle") return;
      const el = document.querySelector(`[data-field="${field}"]`);
      if (!el) return;
      if (!data[field] || data[field] === "") {
        const def = el.textContent.trim();
        if (def) initialDefaults[field] = def;
      }
    });

    fillProfileFields(data);
    fillInfoLayout(data);

    const jobTitleEl = document.querySelector('[data-field="jobTitle"]');
    if (jobTitleEl) {
      const jobTitleVal = (data.jobTitle || "").trim();
      jobTitleEl.textContent = jobTitleVal || "Non renseigné";
    }

    const aboutEl = document.querySelector('[data-field="about"]');
    if (aboutEl) {
      aboutEl.textContent = (data.about || "").trim() || "Non renseigné";
    }

    document.querySelectorAll(".stat-input").forEach((input) => {
      const field = input.dataset.stat;
      const val = data[field];
      input.value = (val !== undefined && val !== null && val !== "") ? val : input.value;
    });

    if (Object.keys(initialDefaults).length > 0) {
      firebase.database().ref("users/" + user.uid).update(initialDefaults)
        .catch((err) => console.warn("Initialisation profil échouée:", err && (err.message || err.code)));
    }

    const setText = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = (value || "").trim() || "Non renseigné";
    };
    setText("profileRole", data.jobTitle);
    setText("profileResidence", data.residence);
    setText("profileAvailability", data.availability);
    setText("profileWhatsapp", data.whatsapp);
    setText("profileEmail", data.email);
    setText("profileLinkedin", data.linkedin);

    const infoName = document.getElementById("infoFullName");
    if (infoName) infoName.textContent = fullName || "Utilisateur";
    const infoJob = document.getElementById("infoJob");
    if (infoJob) infoJob.textContent = (data.jobTitle || "").trim() || "Non renseigné";
    const infoAvatarImg = document.getElementById("infoAvatar");
    const infoInitialEl = document.getElementById("infoInitial");
    if (infoAvatarImg && infoInitialEl) {
      if (data.photoURL) {
        infoAvatarImg.onerror = () => { infoAvatarImg.style.display = "none"; infoInitialEl.style.display = "flex"; };
        infoAvatarImg.src = data.photoURL;
        infoAvatarImg.style.display = "block";
        infoInitialEl.style.display = "none";
      } else if (user.photoURL) {
        infoAvatarImg.src = user.photoURL;
        infoAvatarImg.style.display = "block";
        infoInitialEl.style.display = "none";
      } else {
        infoInitialEl.textContent = (firstName || lastName || "?").trim().charAt(0).toUpperCase() || "?";
        infoAvatarImg.style.display = "none";
        infoInitialEl.style.display = "flex";
      }
    }

    if (data.photoURL) {
      showAvatar(data.photoURL);
    } else if (user.photoURL) {
      showAvatar(user.photoURL);
    } else {
      showInitial(firstName, lastName);
    }

    renderLastUpdated();
    renderCompletion();
    renderKeySkills();

    const veraOpenTab = localStorage.getItem("veraOpenTab");
    if (veraOpenTab) {
      localStorage.removeItem("veraOpenTab");
      const targetTab = document.querySelector(`.tab[data-tab="${veraOpenTab}"]`);
      if (targetTab) {
        targetTab.click();
      }
    }
  }).catch((err) => {
    console.error("[PROFIL] Erreur chargement données :", err && (err.message || err.code));
  });
}

function generateCV() {
  const user = firebase.auth().currentUser;
  if (!user) return;

  firebase.database().ref("users/" + user.uid + "/experiences").once("value").then((expSnap) => {
    const experiences = expSnap.val() || {};
    return firebase.database().ref("users/" + user.uid + "/formations").once("value").then((formSnap) => {
      const formations = formSnap.val() || {};
      return firebase.database().ref("users/" + user.uid + "/certifications").once("value").then((certSnap) => {
        const certifications = certSnap.val() || {};
        return firebase.database().ref("users/" + user.uid + "/skills").once("value").then((skillsSnap) => {
          const skills = skillsSnap.val() || {};
          return firebase.database().ref("users/" + user.uid + "/languages").once("value").then((langSnap) => {
            const languages = langSnap.val() || {};
            return firebase.database().ref("users/" + user.uid).once("value").then((snap) => {
              const data = snap.val() || {};
              return { data, experiences, formations, certifications, skills, languages };
            });
          });
        });
      });
    });
  }).then(({ data, experiences, formations, certifications, skills, languages }) => {
    const photoURL = data.photoURL || user.photoURL || "";
    const fullName = (data.fullName || ((data.firstName || "") + " " + (data.lastName || "")).trim() || user.displayName || "Utilisateur").trim();
    const firstName = data.firstName || "";
    const lastName = data.lastName || "";
    const email = data.email || "";
    const whatsapp = data.whatsapp || "";
    const linkedin = data.linkedin || "";
    const residence = data.residence || "";
    const birthDate = data.birthDate || "";
    const nationality = data.nationality || "";
    const maritalStatus = data.maritalStatus || "";
    const mainLanguage = data.mainLanguage || "";
    const jobTitle = data.jobTitle || "";
    const availability = data.availability || "";
    const contractType = data.contractType || "";
    const workLocation = data.workLocation || "";
    const salary = data.salary || "";
    const about = data.about || "";

    const expItems = Object.keys(experiences).map(id => ({ id, ...experiences[id] })).sort((a, b) => (b.startYear || 0) - (a.startYear || 0));
    const formItems = Object.keys(formations).map(id => ({ id, ...formations[id] })).sort((a, b) => (b.startYear || 0) - (a.startYear || 0));
    const certItems = Object.keys(certifications).map(id => ({ id, ...certifications[id] }));
    const skillItems = Object.keys(skills).map(id => ({ id, ...skills[id] }));
    const langItems = Object.keys(languages).map(id => ({ id, ...languages[id] }));

    let projectItems = [];
    if (data.projects && typeof data.projects === "object") {
      projectItems = Object.keys(data.projects).map(id => ({ id, ...data.projects[id] }));
    }

    const cvContent = document.createElement("div");
    cvContent.style.cssText = "font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #111827; max-width: 210mm; margin: 0 auto; background: #ffffff;";

    const accent = "#2563eb";
    const textPrimary = "#111827";
    const textSecondary = "#6b7280";
    const textMuted = "#9ca3af";
    const bgSidebar = "#f8fafc";
    const border = "#e5e7eb";

    let html = "";

    html += `<div style="display: flex; flex-direction: column; height: 297mm; box-shadow: 0 20px 60px rgba(0,0,0,0.18);">`;

    // ===== HEADER =====
    html += `<div style="background: #ffffff; border-bottom: 3px solid ${accent}; padding: 28px 32px 22px;">`;
    html += `<div style="display: flex; align-items: center; gap: 20px;">`;

    if (photoURL) {
      html += `<img src="${escapeHtml(photoURL)}" style="width: 88px; height: 88px; border-radius: 50%; object-fit: cover; border: 3px solid ${accent}; flex-shrink: 0;">`;
    }

    html += `<div style="flex: 1; min-width: 0;">`;
    html += `<h1 style="font-size: 22px; font-weight: 800; color: ${textPrimary}; margin: 0 0 4px; letter-spacing: -0.3px;">${escapeHtml(fullName)}</h1>`;
    if (jobTitle) {
      html += `<p style="font-size: 13px; font-weight: 600; color: ${accent}; margin: 0 0 10px;">${escapeHtml(jobTitle)}</p>`;
    }
    html += `<div style="display: flex; flex-wrap: wrap; gap: 14px; font-size: 10.5px; color: ${textSecondary}; line-height: 1.5;">`;
    if (email) html += `<span>${escapeHtml(email)}</span>`;
    if (whatsapp) html += `<span>${escapeHtml(whatsapp)}</span>`;
    if (residence) html += `<span>${escapeHtml(residence)}</span>`;
    if (linkedin) html += `<span>${escapeHtml(linkedin)}</span>`;
    html += `</div>`;
    html += `</div>`;
    html += `</div>`;
    html += `</div>`;

    // ===== BODY =====
    html += `<div style="display: flex; flex: 1; min-height: 0;">`;

    // ===== COLONNE PRINCIPALE =====
    html += `<div style="flex: 1; padding: 24px 28px; min-width: 0;">`;

    if (about) {
      html += `<section style="margin-bottom: 22px;">`;
      html += `<h2 style="font-size: 11px; font-weight: 800; color: ${accent}; text-transform: uppercase; letter-spacing: 1.2px; margin: 0 0 8px; padding-bottom: 5px; border-bottom: 1px solid ${border};">Profil professionnel</h2>`;
      html += `<p style="font-size: 11.5px; color: ${textSecondary}; line-height: 1.6; margin: 0; text-align: justify;">${escapeHtml(about)}</p>`;
      html += `</section>`;
    }

    if (expItems.length > 0) {
      html += `<section style="margin-bottom: 22px;">`;
      html += `<h2 style="font-size: 11px; font-weight: 800; color: ${accent}; text-transform: uppercase; letter-spacing: 1.2px; margin: 0 0 12px; padding-bottom: 5px; border-bottom: 1px solid ${border};">Expériences professionnelles</h2>`;
      expItems.forEach(exp => {
        html += `<div style="margin-bottom: 14px; padding-left: 12px; border-left: 3px solid ${accent};">`;
        html += `<div style="font-weight: 700; font-size: 13px; color: ${textPrimary}; margin-bottom: 2px;">${escapeHtml(exp.title || "Poste")}</div>`;
        html += `<div style="font-size: 11.5px; color: ${textSecondary}; margin-bottom: 2px;">${escapeHtml(exp.company || "")}${exp.location ? " · " + escapeHtml(exp.location) : ""}</div>`;
        html += `<div style="font-size: 10.5px; color: ${textMuted}; margin-bottom: 4px;">${exp.startYear || ""}${exp.endYear && exp.endYear !== "Présent" ? " - " + exp.endYear : exp.endYear === "Présent" ? " - Présent" : ""}</div>`;
        if (exp.description) {
          html += `<p style="font-size: 11.5px; color: ${textSecondary}; line-height: 1.5; margin: 0;">${escapeHtml(exp.description)}</p>`;
        }
        html += `</div>`;
      });
      html += `</section>`;
    }

    if (formItems.length > 0) {
      html += `<section style="margin-bottom: 22px;">`;
      html += `<h2 style="font-size: 11px; font-weight: 800; color: ${accent}; text-transform: uppercase; letter-spacing: 1.2px; margin: 0 0 12px; padding-bottom: 5px; border-bottom: 1px solid ${border};">Formations</h2>`;
      formItems.forEach(form => {
        html += `<div style="margin-bottom: 12px; padding-left: 12px; border-left: 3px solid ${accent};">`;
        html += `<div style="font-weight: 700; font-size: 13px; color: ${textPrimary}; margin-bottom: 2px;">${escapeHtml(form.diploma || "Diplôme")}</div>`;
        html += `<div style="font-size: 11.5px; color: ${textSecondary}; margin-bottom: 2px;">${escapeHtml(form.school || "")}${form.location ? " · " + escapeHtml(form.location) : ""}</div>`;
        html += `<div style="font-size: 10.5px; color: ${textMuted};">${form.startYear || ""}${form.endYear && form.endYear !== "Présent" ? " - " + form.endYear : form.endYear === "Présent" ? " - Présent" : ""}</div>`;
        html += `</div>`;
      });
      html += `</section>`;
    }

    if (projectItems.length > 0) {
      html += `<section style="margin-bottom: 22px;">`;
      html += `<h2 style="font-size: 11px; font-weight: 800; color: ${accent}; text-transform: uppercase; letter-spacing: 1.2px; margin: 0 0 12px; padding-bottom: 5px; border-bottom: 1px solid ${border};">Projets</h2>`;
      projectItems.forEach(project => {
        html += `<div style="margin-bottom: 12px; padding-left: 12px; border-left: 3px solid ${accent};">`;
        html += `<div style="font-weight: 700; font-size: 13px; color: ${textPrimary}; margin-bottom: 2px;">${escapeHtml(project.title || project.name || "Projet")}</div>`;
        if (project.description) {
          html += `<p style="font-size: 11.5px; color: ${textSecondary}; line-height: 1.5; margin: 0 0 4px;">${escapeHtml(project.description)}</p>`;
        }
        if (project.technologies || project.tags || project.skills) {
          const techs = [project.technologies, project.tags, project.skills].filter(Boolean).join(", ");
          html += `<div style="font-size: 10.5px; color: ${accent}; font-weight: 600;">${escapeHtml(techs)}</div>`;
        }
        html += `</div>`;
      });
      html += `</section>`;
    }

    if (certItems.length > 0) {
      html += `<section style="margin-bottom: 22px;">`;
      html += `<h2 style="font-size: 11px; font-weight: 800; color: ${accent}; text-transform: uppercase; letter-spacing: 1.2px; margin: 0 0 12px; padding-bottom: 5px; border-bottom: 1px solid ${border};">Certifications</h2>`;
      certItems.forEach(cert => {
        html += `<div style="margin-bottom: 10px; padding-left: 12px; border-left: 3px solid ${accent};">`;
        html += `<div style="font-weight: 700; font-size: 13px; color: ${textPrimary}; margin-bottom: 2px;">${escapeHtml(cert.name || "Certification")}</div>`;
        html += `<div style="font-size: 11.5px; color: ${textSecondary};">${escapeHtml(cert.issuer || "")}${cert.date ? " · " + escapeHtml(cert.date) : ""}${cert.expiryDate ? " - " + escapeHtml(cert.expiryDate) : ""}</div>`;
        html += `</div>`;
      });
      html += `</section>`;
    }

    html += `</div>`;

    // ===== COLONNE GAUCHE / SIDEBAR =====
    html += `<div style="width: 32%; background: ${bgSidebar}; border-left: 1px solid ${border}; padding: 24px 20px; flex-shrink: 0;">`;

    if (skillItems.length > 0) {
      html += `<section style="margin-bottom: 20px;">`;
      html += `<h2 style="font-size: 11px; font-weight: 800; color: ${accent}; text-transform: uppercase; letter-spacing: 1.2px; margin: 0 0 10px; padding-bottom: 5px; border-bottom: 1px solid ${border};">Compétences</h2>`;
      html += `<div style="display: flex; flex-wrap: wrap; gap: 6px;">`;
      skillItems.forEach(skill => {
        html += `<span style="background: #ffffff; color: ${accent}; border: 1px solid ${border}; padding: 4px 10px; border-radius: 6px; font-size: 10.5px; font-weight: 600;">${escapeHtml(skill.name || "")}${skill.level ? " (" + escapeHtml(skill.level) + ")" : ""}</span>`;
      });
      html += `</div>`;
      html += `</section>`;
    }

    if (langItems.length > 0) {
      html += `<section style="margin-bottom: 20px;">`;
      html += `<h2 style="font-size: 11px; font-weight: 800; color: ${accent}; text-transform: uppercase; letter-spacing: 1.2px; margin: 0 0 10px; padding-bottom: 5px; border-bottom: 1px solid ${border};">Langues</h2>`;
      langItems.forEach(lang => {
        html += `<div style="margin-bottom: 6px; font-size: 11.5px; color: ${textSecondary};">`;
        html += `<strong style="color: ${textPrimary};">${escapeHtml(lang.name || "")}</strong>`;
        if (lang.level) html += ` · ${escapeHtml(lang.level)}`;
        html += `</div>`;
      });
      html += `</section>`;
    }

    html += `<section style="margin-bottom: 20px;">`;
    html += `<h2 style="font-size: 11px; font-weight: 800; color: ${accent}; text-transform: uppercase; letter-spacing: 1.2px; margin: 0 0 10px; padding-bottom: 5px; border-bottom: 1px solid ${border};">Informations</h2>`;
    html += `<div style="font-size: 10.5px; color: ${textSecondary}; line-height: 1.7;">`;
    if (nationality) html += `<div><strong style="color: ${textPrimary};">Nationalité:</strong> ${escapeHtml(nationality)}</div>`;
    if (birthDate) html += `<div><strong style="color: ${textPrimary};">Naissance:</strong> ${escapeHtml(birthDate)}</div>`;
    if (maritalStatus) html += `<div><strong style="color: ${textPrimary};">Situation:</strong> ${escapeHtml(maritalStatus)}</div>`;
    if (availability) html += `<div><strong style="color: ${textPrimary};">Disponibilité:</strong> ${escapeHtml(availability)}</div>`;
    if (contractType) html += `<div><strong style="color: ${textPrimary};">Contrat:</strong> ${escapeHtml(contractType)}</div>`;
    if (workLocation) html += `<div><strong style="color: ${textPrimary};">Lieu de travail:</strong> ${escapeHtml(workLocation)}</div>`;
    if (salary) html += `<div><strong style="color: ${textPrimary};">Salaire:</strong> ${escapeHtml(salary)}</div>`;
    html += `</div>`;
    html += `</section>`;

    html += `<div style="margin-top: auto; padding-top: 16px; border-top: 1px solid ${border}; font-size: 10px; color: ${textMuted}; text-align: center;">`;
    html += `Généré depuis VERA · ${new Date().getFullYear()}`;
    html += `</div>`;

    html += `</div>`;
    html += `</div>`;
    html += `</div>`;

    cvContent.innerHTML = html;

    const opt = {
      margin: 0,
      filename: (fullName.replace(/\s+/g, "_") || "CV") + ".pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    };

    html2pdf().set(opt).from(cvContent).save().catch(err => alert("Échec de la génération du PDF : " + (err.message || err.code)));
  }).catch(err => alert("Échec de la génération du CV : " + (err.message || err.code)));
}

function generateCoverLetter(job) {
  const user = firebase.auth().currentUser;
  if (!user) return;

  firebase.database().ref("users/" + user.uid).once("value").then((snap) => {
    const data = snap.val() || {};
    const fullName = (data.fullName || ((data.firstName || "") + " " + (data.lastName || "")).trim() || user.displayName || "Candidat").trim();
    const email = data.email || user.email || "";
    const whatsapp = data.whatsapp || "";
    const linkedin = data.linkedin || "";
    const residence = data.residence || "";
    const jobTitle = (job && job.title) ? job.title : "le poste";
    const company = (job && job.company) ? job.company : "";
    const location = (job && job.location) ? job.location : "";

    const today = new Date();
    const options = { year: "numeric", month: "long", day: "numeric" };
    const dateStr = today.toLocaleDateString("fr-FR", options);

    const recipient = company ? `Direction des Ressources Humaines\n${company}` : "Direction des Ressources Humaines";
    const subject = `Candidature au poste de ${jobTitle}`;

    let body = "";
    body += `<p>Madame, Monsieur,</p>`;
    body += `<p>Je vous adresse ma candidature pour le poste de <strong>${escapeHtml(jobTitle)}</strong>`;
    if (company) body += ` au sein de <strong>${escapeHtml(company)}</strong>`;
    body += `.</p>`;
    body += `<p>Fort(e) de mes compétences et de mon expérience, je suis convaincu(e) de pouvoir apporter une valeur ajoutée à votre équipe. Mon parcours et ma motivation sont en parfaite adéquation avec les exigences de ce poste.</p>`;
    body += `<p>Je me tiens à votre disposition pour un entretien afin de vous exposer plus en détail mes motivations et mes réalisations.</p>`;
    body += `<p>Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.</p>`;

    const letterContent = document.createElement("div");
    letterContent.style.cssText = "font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #111827; max-width: 210mm; margin: 0 auto; background: #ffffff;";

    let html = `<div style="display: flex; flex-direction: column; height: 297mm; box-shadow: 0 20px 60px rgba(0,0,0,0.18);">`;

    // En-tête de la lettre
    html += `<div style="padding: 32px 36px 20px; border-bottom: 1px solid #e5e7eb;">`;
    html += `<div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 24px;">`;
    html += `<div style="flex: 1;">`;
    html += `<h1 style="font-size: 20px; font-weight: 800; color: #111827; margin: 0 0 6px;">${escapeHtml(fullName)}</h1>`;
    if (email) html += `<p style="font-size: 11px; color: #6b7280; margin: 0 0 2px;">${escapeHtml(email)}</p>`;
    if (whatsapp) html += `<p style="font-size: 11px; color: #6b7280; margin: 0 0 2px;">${escapeHtml(whatsapp)}</p>`;
    if (linkedin) html += `<p style="font-size: 11px; color: #6b7280; margin: 0 0 2px;">${escapeHtml(linkedin)}</p>`;
    if (residence) html += `<p style="font-size: 11px; color: #6b7280; margin: 0;">${escapeHtml(residence)}</p>`;
    html += `</div>`;
    html += `<div style="text-align: right;">`;
    html += `<p style="font-size: 11px; color: #6b7280; margin: 0;">${escapeHtml(dateStr)}</p>`;
    html += `</div>`;
    html += `</div>`;
    html += `</div>`;

    // Destinataire
    html += `<div style="padding: 24px 36px 0;">`;
    html += `<p style="font-size: 12px; font-weight: 700; color: #111827; margin: 0 0 16px; white-space: pre-line;">${escapeHtml(recipient)}</p>`;
    html += `<p style="font-size: 12px; font-weight: 600; color: #111827; margin: 0 0 20px;">Objet : ${escapeHtml(subject)}</p>`;
    html += `</div>`;

    // Corps de la lettre
    html += `<div style="padding: 0 36px 32px; flex: 1;">`;
    html += `<div style="font-size: 12px; color: #374151; line-height: 1.7; text-align: justify;">`;
    html += body;
    html += `</div>`;
    html += `</div>`;

    // Pied de page
    html += `<div style="padding: 14px 36px; border-top: 1px solid #e5e7eb; text-align: center;">`;
    html += `<p style="font-size: 10px; color: #9ca3af; margin: 0;">Lettre générée depuis VERA · ${today.getFullYear()}</p>`;
    html += `</div>`;

    html += `</div>`;

    letterContent.innerHTML = html;

    const opt = {
      margin: 0,
      filename: (fullName.replace(/\s+/g, "_") || "Candidat") + "_Lettre_Motivation.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    };

    html2pdf().set(opt).from(letterContent).save().catch(err => alert("Échec de la génération de la lettre : " + (err.message || err.code)));
  }).catch(err => alert("Échec de la génération de la lettre : " + (err.message || err.code)));
}

const generateCvBtn = document.getElementById("generateCvBtn");
if (generateCvBtn) {
  generateCvBtn.addEventListener("click", (e) => {
    e.preventDefault();
    generateCV();
  });
}

firebase.auth().onAuthStateChanged((user) => {
  console.log("[PROFIL] onAuthStateChanged:", user ? "connecté (" + user.uid + ")" : "déconnecté");
  if (!user) return;
  loadProfile(user);
});

if (avatarEditBtn && avatarInput) {
  avatarEditBtn.addEventListener("click", () => avatarInput.click());
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

if (avatarInput) {
  avatarInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  avatarError.style.display = "none";
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    avatarError.textContent = "Veuillez choisir un fichier image.";
    avatarError.style.display = "block";
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    avatarError.textContent = "L'image ne doit pas dépasser 2 Mo.";
    avatarError.style.display = "block";
    return;
  }

  const user = firebase.auth().currentUser;
  if (!user) return;

  avatarSpinner.classList.add("active");

  fileToBase64(file)
    .then((base64) => {
      // Stocke la photo (base64) directement dans la Realtime Database users/{uid}
      return firebase.database().ref("users/" + user.uid).update({ photoURL: base64 });
    })
    .then(() => {
      // Relecture pour garantir l'affichage avec la valeur fraîchement enregistrée
      return firebase.database().ref("users/" + user.uid).once("value");
    })
    .then((snapshot) => {
      const data = snapshot.val() || {};
      showAvatar(data.photoURL);
      avatarSpinner.classList.remove("active");
      avatarInput.value = "";
      updateLastModified();
          renderCompletion();
      window.dispatchEvent(new CustomEvent("profile-avatar-updated", { detail: data.photoURL }));
    })
    .catch((error) => {
      avatarSpinner.classList.remove("active");
      avatarError.textContent = "Échec de l'envoi : " + (error.message || error.code);
      avatarError.style.display = "block";
    });
  });
}

// ============== EXPÉRIENCES PROFESSIONNELLES ==============
function expRef() {
  const user = firebase.auth().currentUser;
  return user ? firebase.database().ref("users/" + user.uid + "/experiences") : null;
}

function escapeHtml(str) {
  return (str || "").toString()
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function expMatches(exp, q) {
  if (!q) return true;
  const hay = [exp.title, exp.company, exp.location, exp.description].join(" ").toLowerCase();
  return hay.includes(q.toLowerCase());
}

function renderExperiences() {
  const list = document.getElementById("expList");
  const empty = document.getElementById("expEmpty");
  const search = document.getElementById("expSearch");
  if (!list) return;
  const ref = expRef();
  if (!ref) return;

  const q = search ? search.value.trim() : "";

  ref.once("value").then((snapshot) => {
    const data = snapshot.val() || {};
    const items = Object.keys(data).map((id) => ({ id, ...data[id] }))
      .sort((a, b) => (b.startYear || 0) - (a.startYear || 0));

    const filtered = items.filter((exp) => expMatches(exp, q));

    list.innerHTML = "";
    if (filtered.length === 0) {
      empty.style.display = "block";
      empty.querySelector("p").textContent = q
        ? "Aucune expérience ne correspond à votre recherche."
        : "Aucune expérience pour le moment.";
      return;
    }
    empty.style.display = "none";

    let rows = "";
    filtered.forEach((exp) => {
      const start = exp.startYear || "—";
      const end = (exp.endYear && exp.endYear !== "Présent") ? exp.endYear : (exp.endYear === "Présent" ? "Présent" : "—");
      rows += `
        <tr>
          <td><button class="exp-cell-title exp-title-edit" data-id="${exp.id}" title="Cliquer pour modifier">${escapeHtml(exp.title || "Poste")}</button></td>
          <td>${escapeHtml(exp.company || "—")}</td>
          <td>${escapeHtml(exp.location || "—")}</td>
          <td>${escapeHtml(start)}</td>
          <td>${escapeHtml(end)}</td>
          <td class="exp-desc-cell">${escapeHtml(exp.description || "—")}</td>
          <td class="exp-action-cell">
            <button class="exp-delete-btn" data-id="${exp.id}" title="Supprimer">
              <img src="/image/delete.png" alt="Supprimer">
            </button>
          </td>
        </tr>`;
    });

    list.innerHTML = `
      <table class="exp-table">
        <thead>
          <tr>
            <th>Intitulé du poste</th>
            <th>Entreprise</th>
            <th>Lieu</th>
            <th>Année de début</th>
            <th>Année de fin</th>
            <th>Description</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;

    list.querySelectorAll(".exp-title-edit").forEach((b) => b.addEventListener("click", () => openExpModal(b.dataset.id)));
    list.querySelectorAll(".exp-delete-btn").forEach((b) => b.addEventListener("click", () => deleteExperience(b.dataset.id)));
  }).catch((err) => {
    if (list) list.innerHTML = `<div class="exp-empty"><p>Impossible de charger les expériences.</p><span>${(err && (err.message || err.code)) || ""}</span></div>`;
  });
}

function deleteExperience(id) {
  if (!confirm("Supprimer cette expérience ?")) return;
  const ref = expRef();
  if (!ref) return;
  ref.child(id).remove()
    .then(() => renderExperiences())
    .catch((err) => alert("Échec de la suppression : " + (err.message || err.code)));
}

// ---- Modale d'ajout / modification ----
let expModal, expForm, expModalTitle, expEditId;

function buildExpModal() {
  if (document.getElementById("expModal")) return;
  const overlay = document.createElement("div");
  overlay.className = "exp-modal-overlay";
  overlay.id = "expModal";
  overlay.innerHTML = `
    <div class="exp-modal">
      <div class="exp-modal-head">
        <h3 id="expModalTitle">Ajouter une expérience</h3>
        <button class="exp-modal-close" id="expModalClose" type="button">×</button>
      </div>
      <form id="expForm" class="exp-form">
        <label>Intitulé du poste<input type="text" name="title" required placeholder="Ex. Product Designer"></label>
        <label>Entreprise<input type="text" name="company" placeholder="Ex. VERA"></label>
        <label>Lieu<input type="text" name="location" placeholder="Ex. Douala, Cameroun"></label>
        <div class="exp-form-row">
          <label>Année de début<input type="number" name="startYear" min="1950" max="2100" required placeholder="2021"></label>
          <label>Année de fin
            <input type="text" name="endYear" placeholder="Présent">
            <small>Laissez vide ou « Présent » si en cours</small>
          </label>
        </div>
        <label>Description<input type="text" name="description" placeholder="Vos missions en quelques mots..."></label>
        <div class="exp-form-actions">
          <button type="button" class="btn-outline-sm" id="expCancel">Annuler</button>
          <button type="submit" class="btn-primary-sm">Enregistrer</button>
        </div>
      </form>
    </div>`;
  document.body.appendChild(overlay);

  expModal = overlay;
  expForm = overlay.querySelector("#expForm");
  expModalTitle = overlay.querySelector("#expModalTitle");
  expEditId = null;

  overlay.querySelector("#expModalClose").addEventListener("click", closeExpModal);
  overlay.querySelector("#expCancel").addEventListener("click", closeExpModal);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeExpModal(); });

  expForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = firebase.auth().currentUser;
    if (!user) return;
    const fd = new FormData(expForm);
    const endRaw = (fd.get("endYear") || "").toString().trim();
    const payload = {
      title: (fd.get("title") || "").toString().trim(),
      company: (fd.get("company") || "").toString().trim(),
      location: (fd.get("location") || "").toString().trim(),
      startYear: parseInt(fd.get("startYear"), 10) || new Date().getFullYear(),
      endYear: endRaw === "" ? "Présent" : endRaw,
      description: (fd.get("description") || "").toString().trim()
    };
    const ref = expRef();
    if (!ref) return;
    const task = expEditId ? ref.child(expEditId).update(payload) : ref.push(payload);
    task.then(() => { updateLastModified();
          renderCompletion(); closeExpModal(); renderExperiences(); })
        .catch((err) => alert("Échec de l'enregistrement : " + (err.message || err.code)));
  });
}

function openExpModal(id) {
  buildExpModal();
  const ref = expRef();
  if (!ref) return;
  expForm.reset();
  if (id) {
    expEditId = id;
    expModalTitle.textContent = "Modifier l'expérience";
    ref.child(id).once("value").then((snap) => {
      const d = snap.val() || {};
      expForm.title.value = d.title || "";
      expForm.company.value = d.company || "";
      expForm.location.value = d.location || "";
      expForm.startYear.value = d.startYear || "";
      expForm.endYear.value = (d.endYear === "Présent" ? "" : d.endYear) || "";
      expForm.description.value = d.description || "";
    });
  } else {
    expEditId = null;
    expModalTitle.textContent = "Ajouter une expérience";
  }
  expModal.classList.add("active");
}

function closeExpModal() {
  if (expModal) expModal.classList.remove("active");
  expEditId = null;
}

const expAddBtn = document.getElementById("expAddBtn");
if (expAddBtn) expAddBtn.addEventListener("click", () => openExpModal(null));

const expSearchEl = document.getElementById("expSearch");
if (expSearchEl) expSearchEl.addEventListener("input", renderExperiences);

const expSearchToggle = document.getElementById("expSearchToggle");
const expSearchWrap = document.getElementById("expSearchWrap");
if (expSearchToggle && expSearchWrap) {
  expSearchToggle.addEventListener("click", () => {
    const visible = expSearchWrap.style.display !== "none";
    if (visible) {
      expSearchWrap.style.display = "none";
      if (expSearchEl) { expSearchEl.value = ""; renderExperiences(); }
    } else {
      expSearchWrap.style.display = "flex";
      if (expSearchEl) expSearchEl.focus();
    }
  });
}

// ============== COMPÉTENCES (CRUD) ==============
function skillsRef() {
  const user = firebase.auth().currentUser;
  return user ? firebase.database().ref("users/" + user.uid + "/skills") : null;
}

function renderSkillsManage() {
  const list = document.getElementById("skillsList");
  const empty = document.getElementById("skillsEmpty");
  const search = document.getElementById("skillSearch");
  if (!list) return;
  const ref = skillsRef();
  if (!ref) return;

  const q = search ? search.value.trim().toLowerCase() : "";

  ref.once("value").then((snapshot) => {
    const data = snapshot.val() || {};
    let items = Object.keys(data).map((id) => ({ id, ...data[id] }));
    if (q) items = items.filter((sk) => (sk.name || "").toLowerCase().includes(q) || (sk.level || "").toLowerCase().includes(q));

    list.innerHTML = "";
    if (items.length === 0) {
      empty.style.display = "block";
      empty.querySelector("p").textContent = q
        ? "Aucune compétence ne correspond à votre recherche."
        : "Aucune compétence pour le moment.";
      return;
    }
    empty.style.display = "none";

    let rows = "";
    items.forEach((sk) => {
      rows += `
        <tr>
          <td><button class="exp-cell-title skill-name-edit" data-id="${sk.id}" title="Cliquer pour modifier">${escapeHtml(sk.name || "Compétence")}</button></td>
          <td>${escapeHtml(sk.level || "—")}</td>
          <td class="exp-action-cell">
            <button class="exp-delete-btn" data-id="${sk.id}" title="Supprimer">
              <img src="/image/delete.png" alt="Supprimer">
            </button>
          </td>
        </tr>`;
    });

    list.innerHTML = `
      <table class="exp-table">
        <thead>
          <tr>
            <th>Compétence</th>
            <th>Niveau</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;

    list.querySelectorAll(".skill-name-edit").forEach((b) => b.addEventListener("click", () => openSkillModal(b.dataset.id)));
    list.querySelectorAll(".exp-delete-btn").forEach((b) => b.addEventListener("click", () => deleteSkill(b.dataset.id)));
  }).catch((err) => {
    if (list) list.innerHTML = `<div class="exp-empty"><p>Impossible de charger les compétences.</p><span>${(err && (err.message || err.code)) || ""}</span></div>`;
  });
}

function deleteSkill(id) {
  if (!confirm("Supprimer cette compétence ?")) return;
  const ref = skillsRef();
  if (!ref) return;
  ref.child(id).remove()
    .then(() => { renderSkillsManage(); renderKeySkills(); })
    .catch((err) => alert("Échec de la suppression : " + (err.message || err.code)));
}

let skillModal, skillForm, skillModalTitle, skillEditId;

function buildSkillModal() {
  if (document.getElementById("skillModal")) return;
  const overlay = document.createElement("div");
  overlay.className = "exp-modal-overlay";
  overlay.id = "skillModal";
  overlay.innerHTML = `
    <div class="exp-modal">
      <div class="exp-modal-head">
        <h3 id="skillModalTitle">Ajouter une compétence</h3>
        <button class="exp-modal-close" id="skillModalClose" type="button">×</button>
      </div>
      <form id="skillForm" class="exp-form">
        <label>Nom de la compétence<input type="text" name="name" required placeholder="Ex. Figma"></label>
        <label>Niveau
          <select name="level">
            <option value="">Non précisé</option>
            <option value="Débutant">Débutant</option>
            <option value="Intermédiaire">Intermédiaire</option>
            <option value="Avancé">Avancé</option>
            <option value="Expert">Expert</option>
          </select>
        </label>
        <div class="exp-form-actions">
          <button type="button" class="btn-outline-sm" id="skillCancel">Annuler</button>
          <button type="submit" class="btn-primary-sm">Enregistrer</button>
        </div>
      </form>
    </div>`;
  document.body.appendChild(overlay);

  skillModal = overlay;
  skillForm = overlay.querySelector("#skillForm");
  skillModalTitle = overlay.querySelector("#skillModalTitle");
  skillEditId = null;

  overlay.querySelector("#skillModalClose").addEventListener("click", closeSkillModal);
  overlay.querySelector("#skillCancel").addEventListener("click", closeSkillModal);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeSkillModal(); });

  skillForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = firebase.auth().currentUser;
    if (!user) return;
    const fd = new FormData(skillForm);
    const payload = {
      name: (fd.get("name") || "").toString().trim(),
      level: (fd.get("level") || "").toString().trim()
    };
    const ref = skillsRef();
    if (!ref) return;
    const task = skillEditId ? ref.child(skillEditId).update(payload) : ref.push(payload);
    task.then(() => { updateLastModified();
          renderCompletion(); closeSkillModal(); renderSkillsManage(); renderKeySkills(); })
        .catch((err) => alert("Échec de l'enregistrement : " + (err.message || err.code)));
  });
}

function openSkillModal(id) {
  buildSkillModal();
  const ref = skillsRef();
  if (!ref) return;
  skillForm.reset();
  if (id) {
    skillEditId = id;
    skillModalTitle.textContent = "Modifier la compétence";
    ref.child(id).once("value").then((snap) => {
      const d = snap.val() || {};
      skillForm.name.value = d.name || "";
      skillForm.level.value = d.level || "";
    });
  } else {
    skillEditId = null;
    skillModalTitle.textContent = "Ajouter une compétence";
  }
  skillModal.classList.add("active");
}

function closeSkillModal() {
  if (skillModal) skillModal.classList.remove("active");
  skillEditId = null;
}

const skillAddBtn = document.getElementById("skillAddBtn");
if (skillAddBtn) skillAddBtn.addEventListener("click", () => openSkillModal(null));

const skillSearchEl = document.getElementById("skillSearch");
if (skillSearchEl) skillSearchEl.addEventListener("input", renderSkillsManage);

const skillSearchToggle = document.getElementById("skillSearchToggle");
const skillSearchWrap = document.getElementById("skillSearchWrap");
if (skillSearchToggle && skillSearchWrap) {
  skillSearchToggle.addEventListener("click", () => {
    const visible = skillSearchWrap.style.display !== "none";
    if (visible) {
      skillSearchWrap.style.display = "none";
      if (skillSearchEl) { skillSearchEl.value = ""; renderSkillsManage(); renderKeySkills(); }
    } else {
      skillSearchWrap.style.display = "flex";
      if (skillSearchEl) skillSearchEl.focus();
    }
  });
}

// ============== FORMATIONS (CRUD, même structure qu'Expérience) ==============
function formRef() {
  const user = firebase.auth().currentUser;
  return user ? firebase.database().ref("users/" + user.uid + "/formations") : null;
}

function formMatches(f, q) {
  if (!q) return true;
  const hay = [f.diploma, f.school, f.location, f.description].join(" ").toLowerCase();
  return hay.includes(q.toLowerCase());
}

function renderFormations() {
  const list = document.getElementById("formList");
  const empty = document.getElementById("formEmpty");
  const search = document.getElementById("formSearch");
  if (!list) return;
  const ref = formRef();
  if (!ref) return;

  const q = search ? search.value.trim() : "";

  ref.once("value").then((snapshot) => {
    const data = snapshot.val() || {};
    const items = Object.keys(data).map((id) => ({ id, ...data[id] }))
      .sort((a, b) => (b.startYear || 0) - (a.startYear || 0));

    const filtered = items.filter((f) => formMatches(f, q));

    list.innerHTML = "";
    if (filtered.length === 0) {
      empty.style.display = "block";
      empty.querySelector("p").textContent = q
        ? "Aucune formation ne correspond à votre recherche."
        : "Aucune formation pour le moment.";
      return;
    }
    empty.style.display = "none";

    let rows = "";
    filtered.forEach((f) => {
      const start = f.startYear || "—";
      const end = (f.endYear && f.endYear !== "Présent") ? f.endYear : (f.endYear === "Présent" ? "Présent" : "—");
      rows += `
        <tr>
          <td><button class="exp-cell-title form-title-edit" data-id="${f.id}" title="Cliquer pour modifier">${escapeHtml(f.diploma || "Diplôme")}</button></td>
          <td>${escapeHtml(f.school || "—")}</td>
          <td>${escapeHtml(f.location || "—")}</td>
          <td>${escapeHtml(start)}</td>
          <td>${escapeHtml(end)}</td>
          <td class="exp-desc-cell">${escapeHtml(f.description || "—")}</td>
          <td class="exp-action-cell">
            <button class="exp-delete-btn" data-id="${f.id}" title="Supprimer">
              <img src="/image/delete.png" alt="Supprimer">
            </button>
          </td>
        </tr>`;
    });

    list.innerHTML = `
      <table class="exp-table">
        <thead>
          <tr>
            <th>Diplôme</th>
            <th>Établissement</th>
            <th>Lieu</th>
            <th>Année de début</th>
            <th>Année de fin</th>
            <th>Description</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;

    list.querySelectorAll(".form-title-edit").forEach((b) => b.addEventListener("click", () => openFormModal(b.dataset.id)));
    list.querySelectorAll(".exp-delete-btn").forEach((b) => b.addEventListener("click", () => deleteFormation(b.dataset.id)));
  }).catch((err) => {
    if (list) list.innerHTML = `<div class="exp-empty"><p>Impossible de charger les formations.</p><span>${(err && (err.message || err.code)) || ""}</span></div>`;
  });
}

function deleteFormation(id) {
  if (!confirm("Supprimer cette formation ?")) return;
  const ref = formRef();
  if (!ref) return;
  ref.child(id).remove()
    .then(() => renderFormations())
    .catch((err) => alert("Échec de la suppression : " + (err.message || err.code)));
}

let formModal, formFormEl, formModalTitle, formEditId;

function buildFormModal() {
  if (document.getElementById("formModal")) return;
  const overlay = document.createElement("div");
  overlay.className = "exp-modal-overlay";
  overlay.id = "formModal";
  overlay.innerHTML = `
    <div class="exp-modal">
      <div class="exp-modal-head">
        <h3 id="formModalTitle">Ajouter une formation</h3>
        <button class="exp-modal-close" id="formModalClose" type="button">×</button>
      </div>
      <form id="formForm" class="exp-form">
        <label>Diplôme / Intitulé<input type="text" name="diploma" required placeholder="Ex. Licence en Informatique"></label>
        <label>Établissement<input type="text" name="school" placeholder="Ex. Université de Yaoundé"></label>
        <label>Lieu<input type="text" name="location" placeholder="Ex. Yaoundé, Cameroun"></label>
        <div class="exp-form-row">
          <label>Année de début<input type="number" name="startYear" min="1950" max="2100" required placeholder="2018"></label>
          <label>Année de fin
            <input type="text" name="endYear" placeholder="Présent">
            <small>Laissez vide ou « Présent » si en cours</small>
          </label>
        </div>
        <label>Description<input type="text" name="description" placeholder="Votre spécialité en quelques mots..."></label>
        <div class="exp-form-actions">
          <button type="button" class="btn-outline-sm" id="formCancel">Annuler</button>
          <button type="submit" class="btn-primary-sm">Enregistrer</button>
        </div>
      </form>
    </div>`;
  document.body.appendChild(overlay);

  formModal = overlay;
  formFormEl = overlay.querySelector("#formForm");
  formModalTitle = overlay.querySelector("#formModalTitle");
  formEditId = null;

  overlay.querySelector("#formModalClose").addEventListener("click", closeFormModal);
  overlay.querySelector("#formCancel").addEventListener("click", closeFormModal);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeFormModal(); });

  formFormEl.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = firebase.auth().currentUser;
    if (!user) return;
    const fd = new FormData(formFormEl);
    const endRaw = (fd.get("endYear") || "").toString().trim();
    const payload = {
      diploma: (fd.get("diploma") || "").toString().trim(),
      school: (fd.get("school") || "").toString().trim(),
      location: (fd.get("location") || "").toString().trim(),
      startYear: parseInt(fd.get("startYear"), 10) || new Date().getFullYear(),
      endYear: endRaw === "" ? "Présent" : endRaw,
      description: (fd.get("description") || "").toString().trim()
    };
    const ref = formRef();
    if (!ref) return;
    const task = formEditId ? ref.child(formEditId).update(payload) : ref.push(payload);
    task.then(() => { updateLastModified();
          renderCompletion(); closeFormModal(); renderFormations(); })
        .catch((err) => alert("Échec de l'enregistrement : " + (err.message || err.code)));
  });
}

function openFormModal(id) {
  buildFormModal();
  const ref = formRef();
  if (!ref) return;
  formFormEl.reset();
  if (id) {
    formEditId = id;
    formModalTitle.textContent = "Modifier la formation";
    ref.child(id).once("value").then((snap) => {
      const d = snap.val() || {};
      formFormEl.diploma.value = d.diploma || "";
      formFormEl.school.value = d.school || "";
      formFormEl.location.value = d.location || "";
      formFormEl.startYear.value = d.startYear || "";
      formFormEl.endYear.value = (d.endYear === "Présent" ? "" : d.endYear) || "";
      formFormEl.description.value = d.description || "";
    });
  } else {
    formEditId = null;
    formModalTitle.textContent = "Ajouter une formation";
  }
  formModal.classList.add("active");
}

function closeFormModal() {
  if (formModal) formModal.classList.remove("active");
  formEditId = null;
}

const formAddBtn = document.getElementById("formAddBtn");
if (formAddBtn) formAddBtn.addEventListener("click", () => openFormModal(null));

const formSearchEl = document.getElementById("formSearch");
if (formSearchEl) formSearchEl.addEventListener("input", renderFormations);

const formSearchToggle = document.getElementById("formSearchToggle");
const formSearchWrap = document.getElementById("formSearchWrap");
if (formSearchToggle && formSearchWrap) {
  formSearchToggle.addEventListener("click", () => {
    const visible = formSearchWrap.style.display !== "none";
    if (visible) {
      formSearchWrap.style.display = "none";
      if (formSearchEl) { formSearchEl.value = ""; renderFormations(); }
    } else {
      formSearchWrap.style.display = "flex";
      if (formSearchEl) formSearchEl.focus();
    }
  });
}

// ============== CERTIFICATIONS (CRUD, même structure qu'Expérience) ==============
function certifRef() {
  const user = firebase.auth().currentUser;
  return user ? firebase.database().ref("users/" + user.uid + "/certifications") : null;
}

function certifMatches(cert, q) {
  if (!q) return true;
  const hay = [cert.name, cert.issuer, cert.date, cert.expiryDate, cert.description].join(" ").toLowerCase();
  return hay.includes(q.toLowerCase());
}

function renderCertifications() {
  const list = document.getElementById("certifList");
  const empty = document.getElementById("certifEmpty");
  const search = document.getElementById("certifSearch");
  if (!list) return;
  const ref = certifRef();
  if (!ref) return;

  const q = search ? search.value.trim() : "";

  ref.once("value").then((snapshot) => {
    const data = snapshot.val() || {};
    const items = Object.keys(data).map((id) => ({ id, ...data[id] }))
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""));

    const filtered = items.filter((cert) => certifMatches(cert, q));

    list.innerHTML = "";
    if (filtered.length === 0) {
      empty.style.display = "block";
      empty.querySelector("p").textContent = q
        ? "Aucune certification ne correspond à votre recherche."
        : "Aucune certification pour le moment.";
      return;
    }
    empty.style.display = "none";

    let rows = "";
    filtered.forEach((cert) => {
      rows += `
        <tr>
          <td><button class="exp-cell-title certif-title-edit" data-id="${cert.id}" title="Cliquer pour modifier">${escapeHtml(cert.name || "Certification")}</button></td>
          <td>${escapeHtml(cert.issuer || "—")}</td>
          <td>${escapeHtml(cert.date || "—")}</td>
          <td>${escapeHtml(cert.expiryDate || "—")}</td>
          <td class="exp-desc-cell">${escapeHtml(cert.description || "—")}</td>
          <td class="exp-action-cell">
            <button class="exp-delete-btn" data-id="${cert.id}" title="Supprimer">
              <img src="/image/delete.png" alt="Supprimer">
            </button>
          </td>
        </tr>`;
    });

    list.innerHTML = `
      <table class="exp-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Organisme</th>
            <th>Date d'obtention</th>
            <th>Date d'expiration</th>
            <th>Description</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;

    list.querySelectorAll(".certif-title-edit").forEach((b) => b.addEventListener("click", () => openCertifModal(b.dataset.id)));
    list.querySelectorAll(".exp-delete-btn").forEach((b) => b.addEventListener("click", () => deleteCertification(b.dataset.id)));
  }).catch((err) => {
    if (list) list.innerHTML = `<div class="exp-empty"><p>Impossible de charger les certifications.</p><span>${(err && (err.message || err.code)) || ""}</span></div>`;
  });
}

function deleteCertification(id) {
  if (!confirm("Supprimer cette certification ?")) return;
  const ref = certifRef();
  if (!ref) return;
  ref.child(id).remove()
    .then(() => renderCertifications())
    .catch((err) => alert("Échec de la suppression : " + (err.message || err.code)));
}

let certifModal, certifFormEl, certifModalTitle, certifEditId;

function buildCertifModal() {
  if (document.getElementById("certifModal")) return;
  const overlay = document.createElement("div");
  overlay.className = "exp-modal-overlay";
  overlay.id = "certifModal";
  overlay.innerHTML = `
    <div class="exp-modal">
      <div class="exp-modal-head">
        <h3 id="certifModalTitle">Ajouter une certification</h3>
        <button class="exp-modal-close" id="certifModalClose" type="button">×</button>
      </div>
      <form id="certifForm" class="exp-form">
        <label>Nom de la certification<input type="text" name="name" required placeholder="Ex. AWS Certified Solutions Architect"></label>
        <label>Organisme<input type="text" name="issuer" placeholder="Ex. Amazon Web Services"></label>
        <div class="exp-form-row">
          <label>Date d'obtention<input type="date" name="date" required placeholder="YYYY-MM-DD"></label>
          <label>Date d'expiration<input type="date" name="expiryDate" placeholder="YYYY-MM-DD"></label>
        </div>
        <label>Description<input type="text" name="description" placeholder="Détails sur la certification..."></label>
        <div class="exp-form-actions">
          <button type="button" class="btn-outline-sm" id="certifCancel">Annuler</button>
          <button type="submit" class="btn-primary-sm">Enregistrer</button>
        </div>
      </form>
    </div>`;
  document.body.appendChild(overlay);

  certifModal = overlay;
  certifFormEl = overlay.querySelector("#certifForm");
  certifModalTitle = overlay.querySelector("#certifModalTitle");
  certifEditId = null;

  overlay.querySelector("#certifModalClose").addEventListener("click", closeCertifModal);
  overlay.querySelector("#certifCancel").addEventListener("click", closeCertifModal);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeCertifModal(); });

  certifFormEl.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = firebase.auth().currentUser;
    if (!user) return;
    const fd = new FormData(certifFormEl);
    const payload = {
      name: (fd.get("name") || "").toString().trim(),
      issuer: (fd.get("issuer") || "").toString().trim(),
      date: (fd.get("date") || "").toString().trim(),
      expiryDate: (fd.get("expiryDate") || "").toString().trim(),
      description: (fd.get("description") || "").toString().trim()
    };
    const ref = certifRef();
    if (!ref) return;
    const task = certifEditId ? ref.child(certifEditId).update(payload) : ref.push(payload);
    task.then(() => { updateLastModified();
          renderCompletion(); closeCertifModal(); renderCertifications(); })
        .catch((err) => alert("Échec de l'enregistrement : " + (err.message || err.code)));
  });
}

function openCertifModal(id) {
  buildCertifModal();
  const ref = certifRef();
  if (!ref) return;
  certifFormEl.reset();
  if (id) {
    certifEditId = id;
    certifModalTitle.textContent = "Modifier la certification";
    ref.child(id).once("value").then((snap) => {
      const d = snap.val() || {};
      certifFormEl.name.value = d.name || "";
      certifFormEl.issuer.value = d.issuer || "";
      certifFormEl.date.value = d.date || "";
      certifFormEl.expiryDate.value = d.expiryDate || "";
      certifFormEl.description.value = d.description || "";
    });
  } else {
    certifEditId = null;
    certifModalTitle.textContent = "Ajouter une certification";
  }
  certifModal.classList.add("active");
}

function closeCertifModal() {
  if (certifModal) certifModal.classList.remove("active");
  certifEditId = null;
}

const certifAddBtn = document.getElementById("certifAddBtn");
if (certifAddBtn) certifAddBtn.addEventListener("click", () => openCertifModal(null));

const certifSearchEl = document.getElementById("certifSearch");
if (certifSearchEl) certifSearchEl.addEventListener("input", renderCertifications);

const certifSearchToggle = document.getElementById("certifSearchToggle");
const certifSearchWrap = document.getElementById("certifSearchWrap");
if (certifSearchToggle && certifSearchWrap) {
  certifSearchToggle.addEventListener("click", () => {
    const visible = certifSearchWrap.style.display !== "none";
    if (visible) {
      certifSearchWrap.style.display = "none";
      if (certifSearchEl) { certifSearchEl.value = ""; renderCertifications(); }
    } else {
      certifSearchWrap.style.display = "flex";
      if (certifSearchEl) certifSearchEl.focus();
    }
  });
}

// ============== LANGUES (CRUD, même structure qu'Expérience) ==============
function langRef() {
  const user = firebase.auth().currentUser;
  return user ? firebase.database().ref("users/" + user.uid + "/languages") : null;
}

function langMatches(lang, q) {
  if (!q) return true;
  const hay = [lang.name, lang.level, lang.description].join(" ").toLowerCase();
  return hay.includes(q.toLowerCase());
}

function renderLanguages() {
  const list = document.getElementById("langList");
  const empty = document.getElementById("langEmpty");
  const search = document.getElementById("langSearch");
  if (!list) return;
  const ref = langRef();
  if (!ref) return;

  const q = search ? search.value.trim() : "";

  ref.once("value").then((snapshot) => {
    const data = snapshot.val() || {};
    const items = Object.keys(data).map((id) => ({ id, ...data[id] }));

    const filtered = items.filter((lang) => langMatches(lang, q));

    list.innerHTML = "";
    if (filtered.length === 0) {
      empty.style.display = "block";
      empty.querySelector("p").textContent = q
        ? "Aucune langue ne correspond à votre recherche."
        : "Aucune langue pour le moment.";
      return;
    }
    empty.style.display = "none";

    let rows = "";
    filtered.forEach((lang) => {
      rows += `
        <tr>
          <td><button class="exp-cell-title lang-title-edit" data-id="${lang.id}" title="Cliquer pour modifier">${escapeHtml(lang.name || "Langue")}</button></td>
          <td>${escapeHtml(lang.level || "—")}</td>
          <td class="exp-desc-cell">${escapeHtml(lang.description || "—")}</td>
          <td class="exp-action-cell">
            <button class="exp-delete-btn" data-id="${lang.id}" title="Supprimer">
              <img src="/image/delete.png" alt="Supprimer">
            </button>
          </td>
        </tr>`;
    });

    list.innerHTML = `
      <table class="exp-table">
        <thead>
          <tr>
            <th>Langue</th>
            <th>Niveau</th>
            <th>Description</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;

    list.querySelectorAll(".lang-title-edit").forEach((b) => b.addEventListener("click", () => openLangModal(b.dataset.id)));
    list.querySelectorAll(".exp-delete-btn").forEach((b) => b.addEventListener("click", () => deleteLanguage(b.dataset.id)));
  }).catch((err) => {
    if (list) list.innerHTML = `<div class="exp-empty"><p>Impossible de charger les langues.</p><span>${(err && (err.message || err.code)) || ""}</span></div>`;
  });
}

function deleteLanguage(id) {
  if (!confirm("Supprimer cette langue ?")) return;
  const ref = langRef();
  if (!ref) return;
  ref.child(id).remove()
    .then(() => renderLanguages())
    .catch((err) => alert("Échec de la suppression : " + (err.message || err.code)));
}

let langModal, langFormEl, langModalTitle, langEditId;

function buildLangModal() {
  if (document.getElementById("langModal")) return;
  const overlay = document.createElement("div");
  overlay.className = "exp-modal-overlay";
  overlay.id = "langModal";
  overlay.innerHTML = `
    <div class="exp-modal">
      <div class="exp-modal-head">
        <h3 id="langModalTitle">Ajouter une langue</h3>
        <button class="exp-modal-close" id="langModalClose" type="button">×</button>
      </div>
      <form id="langForm" class="exp-form">
        <label>Langue<input type="text" name="name" required placeholder="Ex. Anglais"></label>
        <label>Niveau
          <select name="level">
            <option value="Débutant">Débutant</option>
            <option value="Intermédiaire">Intermédiaire</option>
            <option value="Avancé">Avancé</option>
            <option value="Bilingue">Bilingue</option>
            <option value="Langue maternelle">Langue maternelle</option>
          </select>
        </label>
        <label>Description<input type="text" name="description" placeholder="Ex. Parlé couramment, lu et écrit..."></label>
        <div class="exp-form-actions">
          <button type="button" class="btn-outline-sm" id="langCancel">Annuler</button>
          <button type="submit" class="btn-primary-sm">Enregistrer</button>
        </div>
      </form>
    </div>`;
  document.body.appendChild(overlay);

  langModal = overlay;
  langFormEl = overlay.querySelector("#langForm");
  langModalTitle = overlay.querySelector("#langModalTitle");
  langEditId = null;

  overlay.querySelector("#langModalClose").addEventListener("click", closeLangModal);
  overlay.querySelector("#langCancel").addEventListener("click", closeLangModal);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeLangModal(); });

  langFormEl.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = firebase.auth().currentUser;
    if (!user) return;
    const fd = new FormData(langFormEl);
    const payload = {
      name: (fd.get("name") || "").toString().trim(),
      level: (fd.get("level") || "").toString().trim(),
      description: (fd.get("description") || "").toString().trim()
    };
    const ref = langRef();
    if (!ref) return;
    const task = langEditId ? ref.child(langEditId).update(payload) : ref.push(payload);
    task.then(() => { updateLastModified();
          renderCompletion(); closeLangModal(); renderLanguages(); })
        .catch((err) => alert("Échec de l'enregistrement : " + (err.message || err.code)));
  });
}

function openLangModal(id) {
  buildLangModal();
  const ref = langRef();
  if (!ref) return;
  langFormEl.reset();
  if (id) {
    langEditId = id;
    langModalTitle.textContent = "Modifier la langue";
    ref.child(id).once("value").then((snap) => {
      const d = snap.val() || {};
      langFormEl.name.value = d.name || "";
      langFormEl.level.value = d.level || "";
      langFormEl.description.value = d.description || "";
    });
  } else {
    langEditId = null;
    langModalTitle.textContent = "Ajouter une langue";
  }
  langModal.classList.add("active");
}

function closeLangModal() {
  if (langModal) langModal.classList.remove("active");
  langEditId = null;
}

const langAddBtn = document.getElementById("langAddBtn");
if (langAddBtn) langAddBtn.addEventListener("click", () => openLangModal(null));

const langSearchEl = document.getElementById("langSearch");
if (langSearchEl) langSearchEl.addEventListener("input", renderLanguages);

const langSearchToggle = document.getElementById("langSearchToggle");
const langSearchWrap = document.getElementById("langSearchWrap");
if (langSearchToggle && langSearchWrap) {
  langSearchToggle.addEventListener("click", () => {
    const visible = langSearchWrap.style.display !== "none";
    if (visible) {
      langSearchWrap.style.display = "none";
      if (langSearchEl) { langSearchEl.value = ""; renderLanguages(); }
    } else {
      langSearchWrap.style.display = "flex";
      if (langSearchEl) langSearchEl.focus();
    }
  });
}

// ============== PRÉFÉRENCES (CRUD, même structure qu'Expérience) ==============
function prefRef() {
  const user = firebase.auth().currentUser;
  return user ? firebase.database().ref("users/" + user.uid + "/preferences") : null;
}

function prefMatches(pref, q) {
  if (!q) return true;
  const hay = [pref.type, pref.value, pref.description].join(" ").toLowerCase();
  return hay.includes(q.toLowerCase());
}

function renderPreferences() {
  const list = document.getElementById("prefList");
  const empty = document.getElementById("prefEmpty");
  const search = document.getElementById("prefSearch");
  if (!list) return;
  const ref = prefRef();
  if (!ref) return;

  const q = search ? search.value.trim() : "";

  ref.once("value").then((snapshot) => {
    const data = snapshot.val() || {};
    const items = Object.keys(data).map((id) => ({ id, ...data[id] }));

    const filtered = items.filter((pref) => prefMatches(pref, q));

    list.innerHTML = "";
    if (filtered.length === 0) {
      empty.style.display = "block";
      empty.querySelector("p").textContent = q
        ? "Aucune préférence ne correspond à votre recherche."
        : "Aucune préférence pour le moment.";
      return;
    }
    empty.style.display = "none";

    let rows = "";
    filtered.forEach((pref) => {
      rows += `
        <tr>
          <td><button class="exp-cell-title pref-title-edit" data-id="${pref.id}" title="Cliquer pour modifier">${escapeHtml(pref.type || "Préférence")}</button></td>
          <td>${escapeHtml(pref.value || "—")}</td>
          <td class="exp-desc-cell">${escapeHtml(pref.description || "—")}</td>
          <td class="exp-action-cell">
            <button class="exp-delete-btn" data-id="${pref.id}" title="Supprimer">
              <img src="/image/delete.png" alt="Supprimer">
            </button>
          </td>
        </tr>`;
    });

    list.innerHTML = `
      <table class="exp-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Valeur</th>
            <th>Description</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;

    list.querySelectorAll(".pref-title-edit").forEach((b) => b.addEventListener("click", () => openPrefModal(b.dataset.id)));
    list.querySelectorAll(".exp-delete-btn").forEach((b) => b.addEventListener("click", () => deletePreference(b.dataset.id)));
  }).catch((err) => {
    if (list) list.innerHTML = `<div class="exp-empty"><p>Impossible de charger les préférences.</p><span>${(err && (err.message || err.code)) || ""}</span></div>`;
  });
}

function deletePreference(id) {
  if (!confirm("Supprimer cette préférence ?")) return;
  const ref = prefRef();
  if (!ref) return;
  ref.child(id).remove()
    .then(() => renderPreferences())
    .catch((err) => alert("Échec de la suppression : " + (err.message || err.code)));
}

let prefModal, prefFormEl, prefModalTitle, prefEditId;

function buildPrefModal() {
  if (document.getElementById("prefModal")) return;
  const overlay = document.createElement("div");
  overlay.className = "exp-modal-overlay";
  overlay.id = "prefModal";
  overlay.innerHTML = `
    <div class="exp-modal">
      <div class="exp-modal-head">
        <h3 id="prefModalTitle">Ajouter une préférence</h3>
        <button class="exp-modal-close" id="prefModalClose" type="button">×</button>
      </div>
      <form id="prefForm" class="exp-form">
        <label>Type de préférence<input type="text" name="type" required placeholder="Ex. Environnement de travail"></label>
        <label>Valeur<input type="text" name="value" placeholder="Ex. Open space, calme..."></label>
        <label>Description<input type="text" name="description" placeholder="Détails supplémentaires..."></label>
        <div class="exp-form-actions">
          <button type="button" class="btn-outline-sm" id="prefCancel">Annuler</button>
          <button type="submit" class="btn-primary-sm">Enregistrer</button>
        </div>
      </form>
    </div>`;
  document.body.appendChild(overlay);

  prefModal = overlay;
  prefFormEl = overlay.querySelector("#prefForm");
  prefModalTitle = overlay.querySelector("#prefModalTitle");
  prefEditId = null;

  overlay.querySelector("#prefModalClose").addEventListener("click", closePrefModal);
  overlay.querySelector("#prefCancel").addEventListener("click", closePrefModal);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closePrefModal(); });

  prefFormEl.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = firebase.auth().currentUser;
    if (!user) return;
    const fd = new FormData(prefFormEl);
    const payload = {
      type: (fd.get("type") || "").toString().trim(),
      value: (fd.get("value") || "").toString().trim(),
      description: (fd.get("description") || "").toString().trim()
    };
    const ref = prefRef();
    if (!ref) return;
    const task = prefEditId ? ref.child(prefEditId).update(payload) : ref.push(payload);
    task.then(() => { updateLastModified();
          renderCompletion(); closePrefModal(); renderPreferences(); })
        .catch((err) => alert("Échec de l'enregistrement : " + (err.message || err.code)));
  });
}

function openPrefModal(id) {
  buildPrefModal();
  const ref = prefRef();
  if (!ref) return;
  prefFormEl.reset();
  if (id) {
    prefEditId = id;
    prefModalTitle.textContent = "Modifier la préférence";
    ref.child(id).once("value").then((snap) => {
      const d = snap.val() || {};
      prefFormEl.type.value = d.type || "";
      prefFormEl.value.value = d.value || "";
      prefFormEl.description.value = d.description || "";
    });
  } else {
    prefEditId = null;
    prefModalTitle.textContent = "Ajouter une préférence";
  }
  prefModal.classList.add("active");
}

function closePrefModal() {
  if (prefModal) prefModal.classList.remove("active");
  prefEditId = null;
}

const prefAddBtn = document.getElementById("prefAddBtn");
if (prefAddBtn) prefAddBtn.addEventListener("click", () => openPrefModal(null));

const prefSearchEl = document.getElementById("prefSearch");
if (prefSearchEl) prefSearchEl.addEventListener("input", renderPreferences);

const prefSearchToggle = document.getElementById("prefSearchToggle");
const prefSearchWrap = document.getElementById("prefSearchWrap");
if (prefSearchToggle && prefSearchWrap) {
  prefSearchToggle.addEventListener("click", () => {
    const visible = prefSearchWrap.style.display !== "none";
    if (visible) {
      prefSearchWrap.style.display = "none";
      if (prefSearchEl) { prefSearchEl.value = ""; renderPreferences(); }
    } else {
      prefSearchWrap.style.display = "flex";
      if (prefSearchEl) prefSearchEl.focus();
    }
  });
}

// ============== CV MODAL ==============
const cvEditModal = document.getElementById("cvEditModal");
const cvModalClose = document.getElementById("cvModalClose");
const cvModalCancel = document.getElementById("cvModalCancel");
const cvModalSave = document.getElementById("cvModalSave");
const cvModalTabs = document.getElementById("cvModalTabs");
const cvModalBody = document.getElementById("cvModalBody");
const cvGenerateBtn = document.getElementById("cvGenerateBtn");
const cvDownloadBtn = document.getElementById("cvDownloadBtn");
const cvEditBtn = document.getElementById("cvEditBtn");
const cvStatusText = document.getElementById("cvStatusText");

function openCvModal() {
  if (!cvEditModal) return;
  cvEditModal.classList.add("active");
  refreshCvLists();
}

function closeCvModal() {
  if (!cvEditModal) return;
  cvEditModal.classList.remove("active");
}

function refreshCvLists() {
  renderCvExpList();
  renderCvFormList();
  renderCvCertList();
  renderCvSkillList();
}

function getCvListItemHtml(type, item) {
  let title = "";
  let sub = "";

  if (type === "exp") {
    title = item.title || "Poste";
    sub = [item.company, item.location, item.startYear, item.endYear].filter(Boolean).join(" | ");
  } else if (type === "form") {
    title = item.diploma || "Diplôme";
    sub = [item.school, item.location, item.startYear, item.endYear].filter(Boolean).join(" | ");
  } else if (type === "cert") {
    title = item.name || "Certification";
    sub = [item.issuer, item.date].filter(Boolean).join(" | ");
  } else if (type === "skill") {
    title = item.name || "Compétence";
    sub = item.level || "";
  }

  return `<div class="cv-item" data-id="${item.id}">
    <div class="cv-item-body">
      <div class="cv-item-title">${escapeHtml(title)}</div>
      ${sub ? `<div class="cv-item-sub">${escapeHtml(sub)}</div>` : ""}
    </div>
    <button class="cv-item-remove" data-id="${item.id}" data-type="${type}" type="button">×</button>
  </div>`;
}

function renderCvExpList() {
  const list = document.getElementById("cvExpList");
  if (!list) return;
  const user = firebase.auth().currentUser;
  if (!user) return;
  firebase.database().ref("users/" + user.uid + "/experiences").once("value").then((snap) => {
    const data = snap.val() || {};
    const items = Object.keys(data).map((id) => ({ id, ...data[id] }));
    if (items.length === 0) {
      list.innerHTML = '<div class="cv-modal-empty"><p>Aucune expérience ajoutée</p><span>Utilisez le formulaire ci-dessous pour ajouter votre première expérience.</span></div>';
      return;
    }
    list.innerHTML = items.map((item) => getCvListItemHtml("exp", item)).join("");
    list.querySelectorAll(".cv-item-remove").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const type = btn.getAttribute("data-type");
        if (!id || !type || !user) return;
        firebase.database().ref("users/" + user.uid + "/experiences/" + id).remove().then(() => renderCvExpList());
      });
    });
  });
}

function renderCvFormList() {
  const list = document.getElementById("cvFormList");
  if (!list) return;
  const user = firebase.auth().currentUser;
  if (!user) return;
  firebase.database().ref("users/" + user.uid + "/formations").once("value").then((snap) => {
    const data = snap.val() || {};
    const items = Object.keys(data).map((id) => ({ id, ...data[id] }));
    if (items.length === 0) {
      list.innerHTML = '<div class="cv-modal-empty"><p>Aucune formation ajoutée</p><span>Utilisez le formulaire ci-dessous pour ajouter votre première formation.</span></div>';
      return;
    }
    list.innerHTML = items.map((item) => getCvListItemHtml("form", item)).join("");
    list.querySelectorAll(".cv-item-remove").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const type = btn.getAttribute("data-type");
        if (!id || !type || !user) return;
        firebase.database().ref("users/" + user.uid + "/formations/" + id).remove().then(() => renderCvFormList());
      });
    });
  });
}

function renderCvCertList() {
  const list = document.getElementById("cvCertList");
  if (!list) return;
  const user = firebase.auth().currentUser;
  if (!user) return;
  firebase.database().ref("users/" + user.uid + "/certifications").once("value").then((snap) => {
    const data = snap.val() || {};
    const items = Object.keys(data).map((id) => ({ id, ...data[id] }));
    if (items.length === 0) {
      list.innerHTML = '<div class="cv-modal-empty"><p>Aucune certification ajoutée</p><span>Utilisez le formulaire ci-dessous pour ajouter votre première certification.</span></div>';
      return;
    }
    list.innerHTML = items.map((item) => getCvListItemHtml("cert", item)).join("");
    list.querySelectorAll(".cv-item-remove").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const type = btn.getAttribute("data-type");
        if (!id || !type || !user) return;
        firebase.database().ref("users/" + user.uid + "/certifications/" + id).remove().then(() => renderCvCertList());
      });
    });
  });
}

function renderCvSkillList() {
  const list = document.getElementById("cvSkillList");
  if (!list) return;
  const user = firebase.auth().currentUser;
  if (!user) return;
  firebase.database().ref("users/" + user.uid + "/skills").once("value").then((snap) => {
    const data = snap.val() || {};
    const items = Object.keys(data).map((id) => ({ id, ...data[id] }));
    if (items.length === 0) {
      list.innerHTML = '<div class="cv-modal-empty"><p>Aucune compétence ajoutée</p><span>Utilisez le formulaire ci-dessous pour ajouter votre première compétence.</span></div>';
      return;
    }
    list.innerHTML = items.map((item) => getCvListItemHtml("skill", item)).join("");
    list.querySelectorAll(".cv-item-remove").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const type = btn.getAttribute("data-type");
        if (!id || !type || !user) return;
        firebase.database().ref("users/" + user.uid + "/skills/" + id).remove().then(() => renderCvSkillList());
      });
    });
  });
}

function addCvItem(type) {
  const user = firebase.auth().currentUser;
  if (!user) return;

  if (type === "exp") {
    const title = document.getElementById("cvExpTitle").value.trim();
    const company = document.getElementById("cvExpCompany").value.trim();
    const year = document.getElementById("cvExpYear").value.trim();
    if (!title && !company) return;
    const ref = firebase.database().ref("users/" + user.uid + "/experiences").push();
    ref.set({ title, company, location: year, startYear: year, endYear: year }).then(() => {
      document.getElementById("cvExpTitle").value = "";
      document.getElementById("cvExpCompany").value = "";
      document.getElementById("cvExpYear").value = "";
      renderCvExpList();
    });
  } else if (type === "form") {
    const diploma = document.getElementById("cvFormDiploma").value.trim();
    const school = document.getElementById("cvFormSchool").value.trim();
    const year = document.getElementById("cvFormYear").value.trim();
    if (!diploma && !school) return;
    const ref = firebase.database().ref("users/" + user.uid + "/formations").push();
    ref.set({ diploma, school, location: year, startYear: year, endYear: year }).then(() => {
      document.getElementById("cvFormDiploma").value = "";
      document.getElementById("cvFormSchool").value = "";
      document.getElementById("cvFormYear").value = "";
      renderCvFormList();
    });
  } else if (type === "cert") {
    const name = document.getElementById("cvCertName").value.trim();
    const issuer = document.getElementById("cvCertIssuer").value.trim();
    const date = document.getElementById("cvCertDate").value.trim();
    if (!name) return;
    const ref = firebase.database().ref("users/" + user.uid + "/certifications").push();
    ref.set({ name, issuer, date, expiryDate: date }).then(() => {
      document.getElementById("cvCertName").value = "";
      document.getElementById("cvCertIssuer").value = "";
      document.getElementById("cvCertDate").value = "";
      renderCvCertList();
    });
  } else if (type === "skill") {
    const name = document.getElementById("cvSkillName").value.trim();
    const level = document.getElementById("cvSkillLevel").value.trim();
    if (!name) return;
    const ref = firebase.database().ref("users/" + user.uid + "/skills").push();
    ref.set({ name, level }).then(() => {
      document.getElementById("cvSkillName").value = "";
      document.getElementById("cvSkillLevel").value = "";
      renderCvSkillList();
    });
  }
}

if (cvModalClose) cvModalClose.addEventListener("click", closeCvModal);
if (cvModalCancel) cvModalCancel.addEventListener("click", closeCvModal);
if (cvEditBtn) cvEditBtn.addEventListener("click", openCvModal);
if (cvModalSave) cvModalSave.addEventListener("click", closeCvModal);

if (cvGenerateBtn) {
  cvGenerateBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (typeof generateCV === "function") {
      generateCV();
      if (cvStatusText) cvStatusText.textContent = "CV généré et téléchargé";
    }
  });
}

if (cvDownloadBtn) {
  cvDownloadBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (typeof generateCV === "function") {
      generateCV();
      if (cvStatusText) cvStatusText.textContent = "CV téléchargé";
    }
  });
}

if (cvModalTabs) {
  cvModalTabs.addEventListener("click", (e) => {
    const tab = e.target.closest(".cv-modal-tab");
    if (!tab) return;
    const key = tab.dataset.tab;
    cvModalTabs.querySelectorAll(".cv-modal-tab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    cvModalBody.querySelectorAll(".cv-section").forEach((s) => {
      s.style.display = s.dataset.section === key ? "block" : "none";
    });
  });
}

if (document.getElementById("cvExpAddBtn")) {
  document.getElementById("cvExpAddBtn").addEventListener("click", () => addCvItem("exp"));
}
if (document.getElementById("cvFormAddBtn")) {
  document.getElementById("cvFormAddBtn").addEventListener("click", () => addCvItem("form"));
}
if (document.getElementById("cvCertAddBtn")) {
  document.getElementById("cvCertAddBtn").addEventListener("click", () => addCvItem("cert"));
}
if (document.getElementById("cvSkillAddBtn")) {
  document.getElementById("cvSkillAddBtn").addEventListener("click", () => addCvItem("skill"));
}

if (cvEditModal) {
  cvEditModal.addEventListener("click", (e) => {
    if (e.target === cvEditModal) closeCvModal();
  });
}

