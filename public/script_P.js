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

    if (key === "overview") {
      overview.style.display = "grid";
      placeholder.style.display = "none";
    } else {
      overview.style.display = "none";
      placeholder.style.display = "block";
      placeholder.textContent = `Section "${tabLabels[key]}" — contenu à compléter prochainement.`;
    }
  });
});

// ============== SECTIONS ÉDITABLES (Informations / Disponibilité) ==============
const profileFields = [
  "firstName", "lastName", "email", "birthDate", "maritalStatus", "nationality", "residence",
  "whatsapp", "mainLanguage", "availability", "contractType",
  "workLocation", "salary"
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
  const current = (el.dataset.display || el.textContent).trim();

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
    const card = btn.closest(".card");

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
          btn.textContent = "Modifier";
          btn.dataset.editing = "false";
          btn.disabled = false;
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

    // S'assure que chaque champ éditable est initialisé dans la DB (sinon on garde la valeur par défaut de la vue)
    const initialDefaults = {};
    profileFields.forEach((field) => {
      const el = document.querySelector(`[data-field="${field}"]`);
      if (!el) return;
      if (!data[field] || data[field] === "") {
        const def = el.textContent.trim();
        if (def) initialDefaults[field] = def;
      }
    });

    const saveDefault = (field, value) => {
      firebase.database().ref("users/" + user.uid + "/" + field).set(value)
        .catch((err) => console.warn("Init champ échouée:", field, err && (err.message || err.code)));
    };

    fillProfileFields(data);

    // Si la DB ne contient aucune de ces infos, on les y écrit une fois (depuis les valeurs par défaut de la vue)
    if (Object.keys(initialDefaults).length > 0) {
      firebase.database().ref("users/" + user.uid).update(initialDefaults)
        .catch((err) => console.warn("Initialisation profil échouée:", err && (err.message || err.code)));
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
