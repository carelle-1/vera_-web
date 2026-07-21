// ============== NAVIGATION SETTINGS ==============
console.log("[SETTINGS] script_PA.js chargé");
const panelLabels = {
  profil: "Profil et compte",
  prefs: "Préférences",
  confidentialite: "Confidentialité",
  candidatures: "Candidatures",
  alertes: "Alertes emploi",
  paiements: "Paiements",
  integrations: "Intégrations",
  accessibilite: "Accessibilité"
};

document.querySelectorAll(".settings-nav-item").forEach(item => {
  item.addEventListener("click", () => {
    document.querySelectorAll(".settings-nav-item").forEach(i => i.classList.remove("active"));
    item.classList.add("active");

    const key = item.dataset.panel;
    if (key !== "profil") {
      showToast(`Section "${panelLabels[key]}" — contenu à venir.`);
    }
  });
});

// ============== CHARGEMENT DES DONNÉES UTILISATEUR ==============
function loadSettingsFromFirebase() {
  const user = firebase.auth().currentUser;
  console.log("[SETTINGS] loadSettingsFromFirebase - user:", user ? user.uid : "null");
  if (!user) return;

  firebase.database().ref("users/" + user.uid).once("value").then((snapshot) => {
    const data = snapshot.val() || {};
    console.log("[SETTINGS] données reçues:", data);

    const fullNameEl = document.querySelector('.field-value[data-field="fullName"]');
    console.log("[SETTINGS] settingsFullName trouvé:", !!fullNameEl, fullNameEl ? fullNameEl.textContent : "");
    if (fullNameEl) {
      const fullName = (data.fullName || data.firstName || user.displayName || "Utilisateur").trim();
      fullNameEl.textContent = fullName || "Utilisateur";
    }

    const phoneEl = document.querySelector('.field-value[data-field="phone"]');
    if (phoneEl) {
      const phone = (data.phone || data.whatsapp || "").trim();
      phoneEl.textContent = phone || "Non renseigné";
    }

    const emailEl = document.querySelector('.field-value[data-field="email"]');
    if (emailEl) {
      const email = (data.email || user.email || "").trim();
      emailEl.textContent = email || "Non renseigné";
    }

    const residenceEl = document.querySelector('.field-value[data-field="residence"]');
    if (residenceEl) {
      residenceEl.textContent = (data.residence || data.location || "Non renseigné").trim();
    }

    const languageEl = document.getElementById("settingsLanguage");
    if (languageEl && data.language) {
      languageEl.value = data.language;
    }

    const currencyEl = document.getElementById("settingsCurrency");
    if (currencyEl && data.currency) {
      currencyEl.value = data.currency;
    }

    const timezoneEl = document.getElementById("settingsTimezone");
    if (timezoneEl && data.timezone) {
      timezoneEl.value = data.timezone;
    }

    const salaryFormatEl = document.getElementById("settingsSalaryFormat");
    if (salaryFormatEl && data.salaryFormat) {
      salaryFormatEl.value = data.salaryFormat;
    }
  }).catch((err) => {
    console.error("[SETTINGS] erreur chargement:", err);
  });
}

// ============== SAUVEGARDE DES PRÉFÉRENCES ==============
document.querySelectorAll(".pref-select").forEach(select => {
  select.addEventListener("change", () => {
    const user = firebase.auth().currentUser;
    if (!user) return;

    const key = select.id;
    let field = "";
    let value = select.value;

    if (key === "settingsLanguage") field = "language";
    else if (key === "settingsCurrency") field = "currency";
    else if (key === "settingsTimezone") field = "timezone";
    else if (key === "settingsSalaryFormat") field = "salaryFormat";
    else return;

    firebase.database().ref("users/" + user.uid).update({ [field]: value })
      .then(() => showToast(`Préférence mise à jour : ${value}`))
      .catch((err) => showToast("Erreur lors de la sauvegarde"));
  });
});

// ============== TOAST SIMPLE ==============
function showToast(message) {
  let toast = document.getElementById("vera-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "vera-toast";
    toast.style.cssText = `
      position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
      background:#0f1730;color:#fff;padding:12px 20px;border-radius:10px;
      font-size:13px;font-weight:600;z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,0.2);
      opacity:0;transition:opacity .25s ease;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  requestAnimationFrame(() => { toast.style.opacity = "1"; });
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => { toast.style.opacity = "0"; }, 2200);
}

// ============== MODIFIER LE PROFIL ==============
let profileEditing = false;

document.getElementById("editProfileBtn").addEventListener("click", () => {
  const btn = document.getElementById("editProfileBtn");
  if (!profileEditing) {
    enableProfileEditMode();
    btn.textContent = "Enregistrer";
    profileEditing = true;
  } else {
    saveProfileChanges();
    btn.textContent = "Modifier le profil";
    profileEditing = false;
  }
});

function enableProfileEditMode() {
  document.querySelectorAll(".field-value[data-field]").forEach(el => {
    const field = el.dataset.field;
    const inputType = el.dataset.inputType || "text";
    const currentText = el.textContent.replace("✅ Vérifié", "").trim();

    el.innerHTML = "";
    const input = document.createElement("input");
    input.type = inputType;
    input.value = currentText;
    input.className = "profile-edit-input";
    input.dataset.field = field;
    el.appendChild(input);
    input.focus();
  });
}

function saveProfileChanges() {
  const user = firebase.auth().currentUser;
  if (!user) return;

  const updates = {};
  document.querySelectorAll(".field-value[data-field]").forEach(el => {
    const input = el.querySelector("input");
    if (input && input.dataset.field) {
      updates[input.dataset.field] = input.value.trim();
    }
  });

  const btn = document.getElementById("editProfileBtn");
  btn.textContent = "Enregistrement...";
  btn.disabled = true;

  firebase.database().ref("users/" + user.uid).update(updates)
    .then(() => {
      refreshProfileDisplay();
      showToast("Profil enregistré avec succès");
    })
    .catch((err) => {
      showToast("Erreur lors de l'enregistrement");
      console.error(err);
    })
    .finally(() => {
      btn.disabled = false;
    });
}

function refreshProfileDisplay() {
  const user = firebase.auth().currentUser;
  if (!user) return;

  firebase.database().ref("users/" + user.uid).once("value").then((snapshot) => {
    const data = snapshot.val() || {};

    document.querySelectorAll(".field-value[data-field]").forEach(el => {
      const field = el.dataset.field;
      const value = data[field] || "";

      if (value) {
        el.textContent = value;
      } else {
        el.textContent = "Non renseigné";
      }
    });
  });
}

// ============== TELECHARGER DONNEES ==============
document.getElementById("downloadDataBtn").addEventListener("click", function () {
  const original = this.textContent;
  this.textContent = "Préparation...";
  setTimeout(() => {
    this.textContent = "✓ Téléchargé";
    setTimeout(() => { this.textContent = original; }, 1500);
  }, 800);
});

// ============== SUPPRESSION DU COMPTE ==============
document.getElementById("deleteAccountBtn").addEventListener("click", function () {
  const confirmed = confirm(
    "Êtes-vous sûr de vouloir supprimer votre compte ?\n\nCette action est irréversible et supprimera définitivement toutes vos données."
  );
  if (confirmed) {
    this.textContent = "Suppression en cours...";
    this.disabled = true;
    setTimeout(() => {
      showToast("Compte supprimé (simulation).");
      this.textContent = "🗑 Supprimer mon compte";
      this.disabled = false;
    }, 1200);
  }
});

// ============== BOUTONS LIENS (Modifier, Voir, Déconnecter) ==============
document.querySelectorAll(".link-btn").forEach(btn => {
  if (btn.id === "downloadDataBtn") return;
  btn.addEventListener("click", () => {
    showToast(`Action "${btn.textContent}" déclenchée.`);
  });
});

// ============== INIT ==============
console.log("[SETTINGS] init - currentUser:", firebase.auth().currentUser ? firebase.auth().currentUser.uid : "null");

firebase.auth().onAuthStateChanged((user) => {
  console.log("[SETTINGS] onAuthStateChanged:", user ? user.uid : "null");
  if (!user) return;
  console.log("[SETTINGS] chargement des données pour:", user.uid);
  loadSettingsFromFirebase();
});
