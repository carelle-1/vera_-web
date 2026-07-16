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

  // Animation après le rendu
  requestAnimationFrame(() => {
    setTimeout(() => {
      skills.forEach((s, i) => {
        document.getElementById(`skillFill${i}`).style.width = s.value + "%";
      });
    }, 100);
  });
}

// ============== SCORE RING ==============
function renderScoreRing() {
  const ring = document.getElementById("scoreRing");
  const score = 92;
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  ring.style.strokeDasharray = circumference;
  ring.style.strokeDashoffset = circumference; // start empty

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

    overview.style.display = "none";
    placeholder.style.display = "none";
    if (infoLayout) infoLayout.style.display = "none";
    if (expLayout) expLayout.style.display = "none";
    if (skillsLayout) skillsLayout.style.display = "none";

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
      .catch((err) => console.warn("Sauvegarde stat échouée:", field, err && (err.message || err.code)));
  });
});

// ============== INIT ==============
renderSkills();
renderScoreRing();

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
  firebase.database().ref("users/" + user.uid).once("value").then((snapshot) => {
    const data = snapshot.val() || {};
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

    // S'assure que chaque champ éditable est initialisé dans la DB (sauf jobTitle : on garde "Non renseigné" en vue sans écrire dans la DB)
    const initialDefaults = {};
    profileFields.forEach((field) => {
      if (field === "jobTitle") return; // non initialisé : reste vide dans la DB
      const el = document.querySelector(`[data-field="${field}"]`);
      if (!el) return;
      if (!data[field] || data[field] === "") {
        const def = el.textContent.trim();
        if (def) initialDefaults[field] = def;
      }
    });

    fillProfileFields(data);

    // Fonction de l'utilisateur : affiche la valeur DB si présente, sinon "Non renseigné"
    const jobTitleEl = document.querySelector('[data-field="jobTitle"]');
    if (jobTitleEl) {
      const jobTitleVal = (data.jobTitle || "").trim();
      jobTitleEl.textContent = jobTitleVal || "Non renseigné";
    }

    // À propos de moi : affiche la valeur DB si présente, sinon "Non renseigné"
    const aboutEl = document.querySelector('[data-field="about"]');
    if (aboutEl) {
      aboutEl.textContent = (data.about || "").trim() || "Non renseigné";
    }

    // Statistiques (années d'expérience, projets, clients) : valeurs DB ou valeurs par défaut
    document.querySelectorAll(".stat-input").forEach((input) => {
      const field = input.dataset.stat;
      const val = data[field];
      input.value = (val !== undefined && val !== null && val !== "") ? val : input.value;
    });

    // Si la DB ne contient aucune de ces infos, on les y écrit une fois (depuis les valeurs par défaut de la vue)
    if (Object.keys(initialDefaults).length > 0) {
      firebase.database().ref("users/" + user.uid).update(initialDefaults)
        .catch((err) => console.warn("Initialisation profil échouée:", err && (err.message || err.code)));
    }

    // Remplit l'en-tête du profil (rôle, lieu, dispo, contacts) depuis la DB
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

    // En-tête de l'onglet Informations (hero)
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
  });
}

firebase.auth().onAuthStateChanged((user) => {
  if (!user) return;
  loadProfile(user);
});

avatarEditBtn.addEventListener("click", () => avatarInput.click());

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

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
      // Notifie le header (même page) que la photo a changé
      window.dispatchEvent(new CustomEvent("profile-avatar-updated", { detail: data.photoURL }));
    })
    .catch((error) => {
      avatarSpinner.classList.remove("active");
      avatarError.textContent = "Échec de l'envoi : " + (error.message || error.code);
      avatarError.style.display = "block";
    });
});

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
    task.then(() => { closeExpModal(); renderExperiences(); })
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

    items.forEach((sk) => {
      const row = document.createElement("div");
      row.className = "skill-manage-row";
      row.innerHTML = `
        <div class="skill-manage-info">
          <span class="skill-manage-name">${escapeHtml(sk.name || "Compétence")}</span>
          <span class="skill-manage-level">${escapeHtml(sk.level || "")}</span>
        </div>
        <div class="skill-manage-actions">
          <button class="exp-btn skill-edit" data-id="${sk.id}">✏ Modifier</button>
          <button class="exp-btn exp-delete skill-delete" data-id="${sk.id}">🗑 Supprimer</button>
        </div>`;
      list.appendChild(row);
    });

    list.querySelectorAll(".skill-edit").forEach((b) => b.addEventListener("click", () => openSkillModal(b.dataset.id)));
    list.querySelectorAll(".skill-delete").forEach((b) => b.addEventListener("click", () => deleteSkill(b.dataset.id)));
  }).catch((err) => {
    if (list) list.innerHTML = `<div class="exp-empty"><p>Impossible de charger les compétences.</p><span>${(err && (err.message || err.code)) || ""}</span></div>`;
  });
}

function deleteSkill(id) {
  if (!confirm("Supprimer cette compétence ?")) return;
  const ref = skillsRef();
  if (!ref) return;
  ref.child(id).remove()
    .then(() => renderSkillsManage())
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
    task.then(() => { closeSkillModal(); renderSkillsManage(); })
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
      if (skillSearchEl) { skillSearchEl.value = ""; renderSkillsManage(); }
    } else {
      skillSearchWrap.style.display = "flex";
      if (skillSearchEl) skillSearchEl.focus();
    }
  });
}
