// ============== NAVIGATION SETTINGS ==============
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
    showPanel(key);
  });
});

function showPanel(key) {
  document.querySelectorAll(".settings-panel").forEach(p => p.style.display = "none");
  const panel = document.getElementById("panel" + key.charAt(0).toUpperCase() + key.slice(1));
  if (panel) {
    panel.style.display = "block";
  } else {
    const profilPanel = document.getElementById("panelProfil");
    if (profilPanel) profilPanel.style.display = "block";
  }
}

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

// ============== CHARGEMENT DES DONNÉES UTILISATEUR ==============
function loadSettingsFromFirebase() {
  const user = firebase.auth().currentUser;
  if (!user) return;

  firebase.database().ref("users/" + user.uid).once("value").then((snapshot) => {
    const data = snapshot.val() || {};

    const fullNameEl = document.querySelector('.field-value[data-field="fullName"]');
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

    const prefsLanguageEl = document.getElementById("prefsLanguage");
    if (prefsLanguageEl && data.language) {
      prefsLanguageEl.value = data.language;
    }

    const currencyEl = document.getElementById("settingsCurrency");
    if (currencyEl && data.currency) {
      currencyEl.value = data.currency;
    }

    const prefsCurrencyEl = document.getElementById("prefsCurrency");
    if (prefsCurrencyEl && data.currency) {
      prefsCurrencyEl.value = data.currency;
    }

    const timezoneEl = document.getElementById("settingsTimezone");
    if (timezoneEl && data.timezone) {
      timezoneEl.value = data.timezone;
    }

    const prefsTimezoneEl = document.getElementById("prefsTimezone");
    if (prefsTimezoneEl && data.timezone) {
      prefsTimezoneEl.value = data.timezone;
    }

    const salaryFormatEl = document.getElementById("settingsSalaryFormat");
    if (salaryFormatEl && data.salaryFormat) {
      salaryFormatEl.value = data.salaryFormat;
    }

    const prefsSalaryFormatEl = document.getElementById("prefsSalaryFormat");
    if (prefsSalaryFormatEl && data.salaryFormat) {
      prefsSalaryFormatEl.value = data.salaryFormat;
    }

    loadPrivacySettings(data);
    loadNotificationSettings(data);
    loadApplicationSettings(data);
    loadAccessibilitySettings(data);
  }).catch((err) => {
    console.error("[SETTINGS] erreur chargement:", err);
  });
}

// ============== PRIVACY SETTINGS ==============
function loadPrivacySettings(data) {
  document.querySelectorAll('[data-privacy="publicProfile"]').forEach(el => {
    el.checked = data.publicProfile !== false;
  });
  document.querySelectorAll('[data-privacy="visibleByRecruiters"]').forEach(el => {
    el.checked = data.visibleByRecruiters !== false;
  });
  document.querySelectorAll('[data-privacy="analytics"]').forEach(el => {
    el.checked = data.analytics === true;
  });
}

function savePrivacySettings() {
  const user = firebase.auth().currentUser;
  if (!user) return;

  const updates = {};
  document.querySelectorAll('[data-privacy]').forEach(el => {
    updates[el.dataset.privacy] = el.checked;
  });

  firebase.database().ref("users/" + user.uid).update(updates)
    .then(() => showToast("Paramètres de confidentialité enregistrés"))
    .catch(() => showToast("Erreur lors de l'enregistrement"));
}

document.querySelectorAll('[data-privacy]').forEach(el => {
  el.addEventListener("change", savePrivacySettings);
});

// ============== SECURITY SETTINGS ==============
function saveSecuritySettings() {
  const user = firebase.auth().currentUser;
  if (!user) return;

  const updates = {};
  document.querySelectorAll('[data-security]').forEach(el => {
    updates[el.dataset.security] = el.checked;
  });

  firebase.database().ref("users/" + user.uid).update(updates)
    .then(() => showToast("Paramètres de sécurité enregistrés"))
    .catch(() => showToast("Erreur lors de l'enregistrement"));
}

document.querySelectorAll('[data-security]').forEach(el => {
  el.addEventListener("change", saveSecuritySettings);
});

// ============== NOTIFICATION SETTINGS ==============
function loadNotificationSettings(data) {
  document.querySelectorAll('[data-notif="newOpportunities"]').forEach(el => {
    el.checked = data.notifNewOpportunities !== false;
  });
  document.querySelectorAll('[data-notif="messages"]').forEach(el => {
    el.checked = data.notifMessages !== false;
  });
  document.querySelectorAll('[data-notif="applicationStatus"]').forEach(el => {
    el.checked = data.notifApplicationStatus !== false;
  });
  document.querySelectorAll('[data-notif="trainings"]').forEach(el => {
    el.checked = data.notifTrainings !== false;
  });
}

function saveNotificationSettings() {
  const user = firebase.auth().currentUser;
  if (!user) return;

  const updates = {};
  document.querySelectorAll('[data-notif]').forEach(el => {
    updates[el.dataset.notif] = el.checked;
  });

  firebase.database().ref("users/" + user.uid).update(updates)
    .then(() => showToast("Préférences de notification enregistrées"))
    .catch(() => showToast("Erreur lors de l'enregistrement"));
}

document.querySelectorAll('[data-notif]').forEach(el => {
  el.addEventListener("change", saveNotificationSettings);
});

// ============== APPLICATION SETTINGS ==============
function loadApplicationSettings(data) {
  document.querySelectorAll('[data-app="autoApply"]').forEach(el => {
    el.checked = data.autoApply === true;
  });
  document.querySelectorAll('[data-app="autoFollowUp"]').forEach(el => {
    el.checked = data.autoFollowUp === true;
  });
}

function saveApplicationSettings() {
  const user = firebase.auth().currentUser;
  if (!user) return;

  const updates = {};
  document.querySelectorAll('[data-app]').forEach(el => {
    updates[el.dataset.app] = el.checked;
  });

  firebase.database().ref("users/" + user.uid).update(updates)
    .then(() => showToast("Préférences de candidature enregistrées"))
    .catch(() => showToast("Erreur lors de l'enregistrement"));
}

document.querySelectorAll('[data-app]').forEach(el => {
  el.addEventListener("change", saveApplicationSettings);
});

// ============== ACCESSIBILITY SETTINGS ==============
function loadAccessibilitySettings(data) {
  const textSizeEl = document.getElementById("textSize");
  if (textSizeEl && data.textSize) {
    textSizeEl.value = data.textSize;
  }

  document.querySelectorAll('[data-a11y="highContrast"]').forEach(el => {
    el.checked = data.highContrast === true;
  });
  document.querySelectorAll('[data-a11y="screenReader"]').forEach(el => {
    el.checked = data.screenReader === true;
  });
  document.querySelectorAll('[data-a11y="reduceMotion"]').forEach(el => {
    el.checked = data.reduceMotion === true;
  });
}

function saveAccessibilitySettings() {
  const user = firebase.auth().currentUser;
  if (!user) return;

  const updates = {};
  const textSizeEl = document.getElementById("textSize");
  if (textSizeEl) {
    updates.textSize = textSizeEl.value;
  }

  document.querySelectorAll('[data-a11y]').forEach(el => {
    updates[el.dataset.a11y] = el.checked;
  });

  firebase.database().ref("users/" + user.uid).update(updates)
    .then(() => showToast("Paramètres d'accessibilité enregistrés"))
    .catch(() => showToast("Erreur lors de l'enregistrement"));
}

document.querySelectorAll('[data-a11y]').forEach(el => {
  el.addEventListener("change", saveAccessibilitySettings);
});

const textSizeEl = document.getElementById("textSize");
if (textSizeEl) {
  textSizeEl.addEventListener("change", saveAccessibilitySettings);
}

// ============== SAUVEGARDE DES PR&Eacute;F&Eacute;RENCES ==============
document.querySelectorAll(".pref-select").forEach(select => {
  select.addEventListener("change", () => {
    const user = firebase.auth().currentUser;
    if (!user) return;

    const key = select.id;
    let field = "";

    if (key === "settingsLanguage" || key === "prefsLanguage") field = "language";
    else if (key === "settingsCurrency" || key === "prefsCurrency") field = "currency";
    else if (key === "settingsTimezone" || key === "prefsTimezone") field = "timezone";
    else if (key === "settingsSalaryFormat" || key === "prefsSalaryFormat") field = "salaryFormat";
    else if (key === "alertFrequency") field = "alertFrequency";
    else return;

    firebase.database().ref("users/" + user.uid).update({ [field]: select.value })
      .then(() => showToast(`Préférence mise à jour : ${select.value}`))
      .catch(() => showToast("Erreur lors de la sauvegarde"));
  });
});

// ============== TELECHARGER DONNEES ==============
document.getElementById("downloadDataBtn")?.addEventListener("click", function () {
  const original = this.textContent;
  this.textContent = "Préparation...";
  setTimeout(() => {
    this.textContent = "✓ Téléchargé";
    setTimeout(() => { this.textContent = original; }, 1500);
  }, 800);
});

// ============== SUPPRESSION DU COMPTE ==============
document.getElementById("deleteAccountBtn")?.addEventListener("click", function () {
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

// ============== CANDIDATURES: CV, LETTRE, PORTFOLIO ==============
const candidaturesData = {
  cvUrl: "",
  cvName: "",
  coverLetterUrl: "",
  coverLetterName: "",
  portfolio: ""
};

function loadCandidaturesFromFirebase() {
  const user = firebase.auth().currentUser;
  if (!user) return;
  firebase.database().ref("users/" + user.uid + "/candidatures").once("value").then((snap) => {
    const data = snap.val() || {};
    candidaturesData.cvUrl = data.cvUrl || "";
    candidaturesData.cvName = data.cvName || "";
    candidaturesData.cvPublicId = data.cvPublicId || "";
    candidaturesData.coverLetterUrl = data.coverLetterUrl || "";
    candidaturesData.coverLetterName = data.coverLetterName || "";
    candidaturesData.coverLetterPublicId = data.coverLetterPublicId || "";
    candidaturesData.portfolio = data.portfolio || "";
    renderCandidatures();
  });
}

function renderCandidatures() {
  const cvSub = document.getElementById("cvSub");
  const cvDeleteBtn = document.getElementById("cvDeleteBtn");
  const cvView = document.getElementById("cvView");
  const cvLink = document.getElementById("cvLink");
  if (cvSub) cvSub.textContent = candidaturesData.cvName || "Aucun CV t&eacute;l&eacute;charg&eacute;";
  if (cvDeleteBtn) cvDeleteBtn.style.display = candidaturesData.cvUrl ? "inline-block" : "none";
  if (cvView) cvView.style.display = candidaturesData.cvUrl ? "block" : "none";
  if (cvLink && candidaturesData.cvUrl) {
    cvLink.href = candidaturesData.cvUrl;
    cvLink.textContent = "&#x1F4C4; Voir le CV";
  }

  const coverLetterSub = document.getElementById("coverLetterSub");
  const coverLetterAddBtn = document.getElementById("coverLetterAddBtn");
  const coverLetterDeleteBtn = document.getElementById("coverLetterDeleteBtn");
  const coverLetterView = document.getElementById("coverLetterView");
  const coverLetterLink = document.getElementById("coverLetterLink");
  
  if (coverLetterSub) coverLetterSub.textContent = candidaturesData.coverLetterName || "Aucune lettre enregistr&eacute;e";
  if (coverLetterAddBtn) coverLetterAddBtn.style.display = candidaturesData.coverLetterUrl ? "none" : "inline-block";
  if (coverLetterDeleteBtn) coverLetterDeleteBtn.style.display = candidaturesData.coverLetterUrl ? "inline-block" : "none";
  if (coverLetterView) coverLetterView.style.display = candidaturesData.coverLetterUrl ? "block" : "none";
  if (coverLetterLink && candidaturesData.coverLetterUrl) {
    coverLetterLink.href = candidaturesData.coverLetterUrl;
    coverLetterLink.textContent = "&#x1F4C4; Voir le document";
  }

  const portfolioSub = document.getElementById("portfolioSub");
  const portfolioAddBtn = document.getElementById("portfolioAddBtn");
  const portfolioDeleteBtn = document.getElementById("portfolioDeleteBtn");
  if (portfolioSub) portfolioSub.textContent = candidaturesData.portfolio || "Aucun portfolio enregistr&eacute;";
  if (portfolioAddBtn) portfolioAddBtn.style.display = candidaturesData.portfolio ? "none" : "inline-block";
  if (portfolioDeleteBtn) portfolioDeleteBtn.style.display = candidaturesData.portfolio ? "inline-block" : "none";
}

// CV
document.getElementById("cvReplaceBtn")?.addEventListener("click", () => {
  const input = document.getElementById("cvFileInput");
  if (!input) return;
  input.click();
});

function getFirebaseIdToken() {
  const user = firebase.auth().currentUser;
  if (!user) return Promise.resolve(null);
  return user.getIdToken().catch(() => null);
}

function uploadFileToServer(endpoint, file) {
  return getFirebaseIdToken().then((idToken) => {
    if (!idToken) {
      return Promise.reject(new Error("Utilisateur non connecté"));
    }

    const formData = new FormData();
    formData.append('file', file);

    return fetch(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + idToken
      }
    }).then(response => {
      if (!response.ok) {
        return response.json().then(data => {
          throw new Error(data.message || 'Upload failed');
        });
      }
      return response.json();
    });
  });
}

document.getElementById("cvFileInput")?.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const user = firebase.auth().currentUser;
  if (!user) return;
  
  const btn = document.getElementById("cvReplaceBtn");
  btn.textContent = "Envoi...";
  btn.disabled = true;

  uploadFileToServer('/upload-cv', file)
    .then(data => {
      if (data.success) {
        return firebase.database().ref("users/" + user.uid + "/candidatures").update({
          cvUrl: data.url,
          cvName: data.name,
          cvPublicId: data.publicId
        });
      }
    })
    .then(() => {
      return firebase.database().ref("users/" + user.uid + "/candidatures").once("value");
    })
    .then((snap) => {
      const data = snap.val() || {};
      candidaturesData.cvUrl = data.cvUrl || "";
      candidaturesData.cvName = data.cvName || "";
      renderCandidatures();
      showToast("CV mis &agrave; jour");
    })
    .catch((err) => {
      console.error("[CAND] Erreur:", err);
      showToast("Erreur lors de la sauvegarde du CV");
    })
    .finally(() => {
      btn.textContent = "Remplacer";
      btn.disabled = false;
    });
});

document.getElementById("cvDeleteBtn")?.addEventListener("click", () => {
  const user = firebase.auth().currentUser;
  if (!user) return;
  const confirmed = confirm("&Ecirc;tes-vous s&ucirc;r de vouloir supprimer ce CV ?");
  if (!confirmed) return;

  const btn = document.getElementById("cvDeleteBtn");
  btn.textContent = "Suppression...";
  btn.disabled = true;

  const deleteFromDb = () => {
    return firebase.database().ref("users/" + user.uid + "/candidatures/cvUrl").remove()
      .then(() => {
        firebase.database().ref("users/" + user.uid + "/candidatures/cvName").remove();
      })
      .then(() => {
        return firebase.database().ref("users/" + user.uid + "/candidatures/cvPublicId").remove();
      });
  };

  const deleteFromServer = () => {
    if (!candidaturesData.cvPublicId) {
      return Promise.resolve();
    }
    return getFirebaseIdToken().then((idToken) => {
      const formData = new FormData();
      formData.append('publicId', candidaturesData.cvPublicId);
      return fetch('/delete-cv', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': 'Bearer ' + idToken
        }
      }).then(response => {
        if (!response.ok) {
          return response.json().then(data => {
            throw new Error(data.message || 'Delete failed');
          });
        }
        return response.json();
      }).catch(() => {});
    });
  };

  deleteFromServer().then(() => deleteFromDb()).then(() => {
    candidaturesData.cvUrl = "";
    candidaturesData.cvName = "";
    candidaturesData.cvPublicId = "";
    renderCandidatures();
    showToast("CV supprim&eacute;");
  }).catch(() => showToast("Erreur lors de la suppression")).finally(() => {
    btn.textContent = "Supprimer";
    btn.disabled = false;
  });
});

// Lettre de motivation
document.getElementById("coverLetterAddBtn")?.addEventListener("click", () => {
  document.getElementById("coverLetterSub").style.display = "none";
  document.getElementById("coverLetterEdit").style.display = "block";
  document.getElementById("coverLetterView").style.display = "none";
  document.getElementById("coverLetterAddBtn").style.display = "none";
  document.getElementById("coverLetterSaveBtn").style.display = "inline-block";
  document.getElementById("coverLetterCancelBtn").style.display = "inline-block";
  document.getElementById("coverLetterDeleteBtn").style.display = "none";
  const fileInput = document.getElementById("coverLetterFileInput");
  if (fileInput) fileInput.value = "";
});

document.getElementById("coverLetterSaveBtn")?.addEventListener("click", () => {
  const input = document.getElementById("coverLetterFileInput");
  const file = input.files[0];
  if (!file) {
    showToast("Veuillez s&eacute;lectionner un fichier PDF ou Word");
    return;
  }
  const user = firebase.auth().currentUser;
  if (!user) return;

  const btn = document.getElementById("coverLetterSaveBtn");
  btn.textContent = "Envoi...";
  btn.disabled = true;

  uploadFileToServer('/upload-cover-letter', file)
    .then(data => {
      if (data.success) {
        return firebase.database().ref("users/" + user.uid + "/candidatures").update({
          coverLetterUrl: data.url,
          coverLetterName: data.name,
          coverLetterPublicId: data.publicId
        });
      }
    })
    .then(() => {
      return firebase.database().ref("users/" + user.uid + "/candidatures").once("value");
    })
    .then((snap) => {
      const data = snap.val() || {};
      candidaturesData.coverLetterUrl = data.coverLetterUrl || "";
      candidaturesData.coverLetterName = data.coverLetterName || "";
      renderCandidatures();
      showToast("Lettre de motivation enregistr&eacute;e");
    })
    .catch((err) => {
      console.error("[CAND] Erreur:", err);
      showToast("Erreur lors de l'enregistrement");
    })
    .finally(() => {
      btn.textContent = "Enregistrer";
      btn.disabled = false;
    });
});

document.getElementById("coverLetterCancelBtn")?.addEventListener("click", () => {
  document.getElementById("coverLetterSub").style.display = "block";
  document.getElementById("coverLetterEdit").style.display = "none";
  document.getElementById("coverLetterView").style.display = candidaturesData.coverLetterUrl ? "block" : "none";
  document.getElementById("coverLetterAddBtn").style.display = candidaturesData.coverLetterUrl ? "none" : "inline-block";
  document.getElementById("coverLetterSaveBtn").style.display = "none";
  document.getElementById("coverLetterCancelBtn").style.display = "none";
  document.getElementById("coverLetterDeleteBtn").style.display = candidaturesData.coverLetterUrl ? "inline-block" : "none";
});

document.getElementById("coverLetterDeleteBtn")?.addEventListener("click", () => {
  const user = firebase.auth().currentUser;
  if (!user) return;
  const confirmed = confirm("&Ecirc;tes-vous s&ucirc;r de vouloir supprimer cette lettre de motivation ?");
  if (!confirmed) return;

  const btn = document.getElementById("coverLetterDeleteBtn");
  btn.textContent = "Suppression...";
  btn.disabled = true;

  const deleteFromDb = () => {
    return firebase.database().ref("users/" + user.uid + "/candidatures/coverLetterUrl").remove()
      .then(() => {
        firebase.database().ref("users/" + user.uid + "/candidatures/coverLetterName").remove();
      })
      .then(() => {
        return firebase.database().ref("users/" + user.uid + "/candidatures/coverLetterPublicId").remove();
      });
  };

  const deleteFromServer = () => {
    if (!candidaturesData.coverLetterPublicId) {
      return Promise.resolve();
    }
    return getFirebaseIdToken().then((idToken) => {
      const formData = new FormData();
      formData.append('publicId', candidaturesData.coverLetterPublicId);
      return fetch('/delete-cover-letter', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': 'Bearer ' + idToken
        }
      }).then(response => {
        if (!response.ok) {
          return response.json().then(data => {
            throw new Error(data.message || 'Delete failed');
          });
        }
        return response.json();
      }).catch(() => {});
    });
  };

  deleteFromServer().then(() => deleteFromDb()).then(() => {
    candidaturesData.coverLetterUrl = "";
    candidaturesData.coverLetterName = "";
    candidaturesData.coverLetterPublicId = "";
    renderCandidatures();
    showToast("Lettre de motivation supprim&eacute;e");
  }).catch(() => showToast("Erreur lors de la suppression")).finally(() => {
    btn.textContent = "Supprimer";
    btn.disabled = false;
  });
});

// Portfolio
document.getElementById("portfolioAddBtn")?.addEventListener("click", () => {
  document.getElementById("portfolioSub").style.display = "none";
  document.getElementById("portfolioEdit").style.display = "block";
  document.getElementById("portfolioAddBtn").style.display = "none";
  document.getElementById("portfolioSaveBtn").style.display = "inline-block";
  document.getElementById("portfolioCancelBtn").style.display = "inline-block";
  document.getElementById("portfolioDeleteBtn").style.display = "none";
  document.getElementById("portfolioInput").value = candidaturesData.portfolio || "";
});

document.getElementById("portfolioSaveBtn")?.addEventListener("click", () => {
  const input = document.getElementById("portfolioInput");
  const value = input.value.trim();
  const user = firebase.auth().currentUser;
  if (!user) return;
  firebase.database().ref("users/" + user.uid + "/candidatures/portfolio").set(value)
    .then(() => {
      candidaturesData.portfolio = value;
      renderCandidatures();
      showToast("Portfolio enregistr&eacute;");
    })
    .catch(() => showToast("Erreur lors de l'enregistrement"));
});

document.getElementById("portfolioCancelBtn")?.addEventListener("click", () => {
  document.getElementById("portfolioSub").style.display = "block";
  document.getElementById("portfolioEdit").style.display = "none";
  document.getElementById("portfolioAddBtn").style.display = candidaturesData.portfolio ? "none" : "inline-block";
  document.getElementById("portfolioSaveBtn").style.display = "none";
  document.getElementById("portfolioCancelBtn").style.display = "none";
  document.getElementById("portfolioDeleteBtn").style.display = candidaturesData.portfolio ? "inline-block" : "none";
});

document.getElementById("portfolioDeleteBtn")?.addEventListener("click", () => {
  const user = firebase.auth().currentUser;
  if (!user) return;
  firebase.database().ref("users/" + user.uid + "/candidatures/portfolio").remove()
    .then(() => {
      candidaturesData.portfolio = "";
      renderCandidatures();
      showToast("Portfolio supprim&eacute;");
    })
    .catch(() => showToast("Erreur lors de la suppression"));
});

// ============== BOUTONS LIENS (Modifier, Voir, Déconnecter) ==============
const candidatureBtnIds = new Set([
  "cvReplaceBtn", "cvDeleteBtn",
  "coverLetterAddBtn", "coverLetterSaveBtn", "coverLetterCancelBtn", "coverLetterDeleteBtn",
  "portfolioAddBtn", "portfolioSaveBtn", "portfolioCancelBtn", "portfolioDeleteBtn"
]);

document.querySelectorAll(".link-btn").forEach(btn => {
  if (btn.id === "downloadDataBtn") return;
  if (candidatureBtnIds.has(btn.id)) return;
  btn.addEventListener("click", () => {
    showToast(`Action "${btn.textContent}" déclenchée.`);
  });
});

// ============== INIT ==============
firebase.auth().onAuthStateChanged((user) => {
  if (!user) return;
  loadSettingsFromFirebase();
  loadCandidaturesFromFirebase();
  showPanel("profil");
});
