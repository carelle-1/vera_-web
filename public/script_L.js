// ============== GARDE DE SESSION (CONNEXION) ==============
// La redirection est déjà gérée dans le handler de login ci-dessous.
// On ne garde pas de onAuthStateChanged global ici pour éviter
// une double redirection depuis la page de connexion.

// ============== TABS SWITCH ==============
const tabs = document.querySelectorAll(".auth-tab");
const forms = document.querySelectorAll(".auth-form");
const indicator = document.getElementById("tabIndicator");
const successBox = document.getElementById("successBox");

function switchTo(formName) {
  tabs.forEach(t => t.classList.toggle("active", t.dataset.form === formName));
  forms.forEach(f => {
    if (f.id === formName + "Form") {
      f.classList.add("active");
    } else {
      f.classList.remove("active");
    }
  });
  indicator.style.transform = formName === "signup" ? "translateX(100%)" : "translateX(0)";
  successBox.classList.remove("active");
  if (formName === "signup") {
    setTimeout(updateSignupButtonState, 0);
  }
}

function showForm(formId) {
  tabs.forEach(t => t.classList.remove("active"));
  forms.forEach(f => f.classList.remove("active"));
  successBox.classList.remove("active");
  const f = document.getElementById(formId);
  if (f) f.classList.add("active");
}

tabs.forEach(tab => {
  tab.addEventListener("click", () => switchTo(tab.dataset.form));
});

document.querySelectorAll(".link-switch").forEach(btn => {
  btn.addEventListener("click", () => switchTo(btn.dataset.form));
});

// ============== TOGGLE PASSWORD VISIBILITY ==============
document.querySelectorAll(".toggle-pass").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = document.getElementById(btn.dataset.target);
    const icon = btn.querySelector("i");
    if (target.type === "password") {
      target.type = "text";
      icon.classList.remove("ph-eye");
      icon.classList.add("ph-eye-slash");
    } else {
      target.type = "password";
      icon.classList.remove("ph-eye-slash");
      icon.classList.add("ph-eye");
    }
  });
});

// ============== HELPERS DE VALIDATION ==============
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function setError(inputId, errorId, message) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  if (message) {
    input.classList.add("invalid");
    error.textContent = message;
  } else {
    input.classList.remove("invalid");
    error.textContent = "";
  }
}

// ============== TRADUCTION DES ERREURS FIREBASE ==============
function firebaseAuthError(error) {
  const code = error && error.code ? error.code : '';
  const message = error && error.message ? error.message : 'Une erreur est survenue.';

  if (code) {
    const map = {
      "auth/invalid-email": "Adresse email invalide.",
      "auth/user-disabled": "Ce compte a été désactivé.",
      "auth/user-not-found": "Aucun compte ne correspond à cet email.",
      "auth/wrong-password": "Mot de passe incorrect.",
      "auth/invalid-credential": "Email ou mot de passe incorrect.",
      "auth/email-already-in-use": "Cet email est déjà utilisé.",
      "auth/weak-password": "Le mot de passe est trop faible (6 caractères min).",
      "auth/operation-not-allowed": "La création de compte par email/mot de passe n'est pas activée dans Firebase.",
      "auth/network-request-failed": "Problème de connexion réseau."
    };
    return map[code] || message;
  }

  if (typeof message === 'string' && message.indexOf('400') !== -1) {
    return "Erreur Firebase 400 : vérifie Email/Mot de passe dans Firebase Console > Authentication > Sign-in method, et ajoute 127.0.0.1 dans Authentication > Settings > Authorized domains.";
  }

  return message;
}

// ============== LOGIN FORM ==============
const loginForm = document.getElementById("loginForm");
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let valid = true;

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!email) {
    setError("loginEmail", "loginEmailError", "L'adresse email est requise.");
    valid = false;
  } else if (!isValidEmail(email)) {
    setError("loginEmail", "loginEmailError", "Adresse email invalide.");
    valid = false;
  } else {
    setError("loginEmail", "loginEmailError", "");
  }

  if (!password) {
    setError("loginPassword", "loginPasswordError", "Le mot de passe est requis.");
    valid = false;
  } else if (password.length < 6) {
    setError("loginPassword", "loginPasswordError", "6 caractères minimum.");
    valid = false;
  } else {
    setError("loginPassword", "loginPasswordError", "");
  }

  if (!valid) return;

  const btn = loginForm.querySelector(".btn-submit");
  const original = btn.textContent;
  btn.textContent = "Connexion...";
  btn.classList.add("loading");

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log("[LOGIN] connexion réussie, uid:", user.uid);
      // Récupère le token Firebase pour synchroniser avec Laravel
      return user.getIdToken();
    })
    .then((idToken) => {
      console.log("[LOGIN] synchronisation avec le serveur...");
      // Appelle l'endpoint Laravel pour synchroniser Firebase avec Laravel
      return fetch("/sync-firebase-auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        },
        body: JSON.stringify({ idToken: idToken })
      }).then(response => response.json());
    })
    .then((data) => {
      if (data.success) {
        console.log("[LOGIN] synchronisation réussie, redirection vers:", data.redirect);
        window.location.href = data.redirect;
      } else {
        throw new Error(data.error || "Erreur de synchronisation");
      }
    })
    .catch((error) => {
      console.log("[LOGIN] erreur après login:", error);
      btn.textContent = original;
      btn.classList.remove("loading");
      setError("loginPassword", "loginPasswordError", firebaseAuthError(error));
    });
});

// ============== PASSWORD STRENGTH (signup) ==============
const strengthFill = document.getElementById("strengthFill");
const strengthLabel = document.getElementById("strengthLabel");

document.getElementById("signupPassword").addEventListener("input", (e) => {
  const val = e.target.value;
  let score = 0;
  if (val.length >= 6) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;

  const levels = [
    { width: "0%", color: "var(--border)", label: "Force du mot de passe" },
    { width: "25%", color: "#ef4444", label: "Faible" },
    { width: "50%", color: "#f59e0b", label: "Moyen" },
    { width: "75%", color: "#38bdf8", label: "Bon" },
    { width: "100%", color: "#22c55e", label: "Excellent" }
  ];
  const level = levels[val.length === 0 ? 0 : score];
  strengthFill.style.width = level.width;
  strengthFill.style.background = level.color;
  strengthLabel.textContent = val.length === 0 ? "Force du mot de passe" : level.label;
});

// ============== COMPANY ACCOUNT TOGGLE ==============
const signupIsCompany = document.getElementById("signupIsCompany");
const companyDocSection = document.getElementById("companyDocGroup");
const companyDocDrop = document.getElementById("companyDocDrop");
const companyDocInput = document.getElementById("signupCompanyDoc");
const companyDocFileInfo = document.getElementById("companyDocFileInfo");
const companyDocFileName = document.getElementById("companyDocFileName");
const companyDocRemove = document.getElementById("companyDocRemove");
const companyToggleWrap = document.getElementById("companyToggleWrap");

function setCompanyDocEnabled(enabled) {
  if (companyDocInput) companyDocInput.disabled = !enabled;
  if (companyDocDrop) {
    companyDocDrop.classList.toggle("disabled", !enabled);
    companyDocDrop.style.pointerEvents = enabled ? "auto" : "none";
    companyDocDrop.style.opacity = enabled ? "1" : "0.5";
  }
  if (!enabled) {
    if (companyDocInput) companyDocInput.value = "";
    if (companyDocFileInfo) companyDocFileInfo.style.display = "none";
    if (companyDocDrop) companyDocDrop.classList.remove("drag-over");
  }
}

if (signupIsCompany && companyDocSection) {
  signupIsCompany.addEventListener("click", () => {
    const isChecked = signupIsCompany.getAttribute("aria-checked") === "true";
    const newState = !isChecked;
    signupIsCompany.setAttribute("aria-checked", String(newState));
    const knob = document.getElementById("companyToggleKnob");
    if (knob) {
      knob.textContent = newState ? "✓" : "—";
    }
    if (companyToggleWrap) {
      companyToggleWrap.classList.toggle("active", newState);
    }
    if (newState) {
      companyDocSection.style.display = "block";
      requestAnimationFrame(() => {
        companyDocSection.classList.add("visible");
      });
    } else {
      companyDocSection.classList.remove("visible");
      setTimeout(() => {
        companyDocSection.style.display = "none";
      }, 450);
    }
    setCompanyDocEnabled(newState);
  });
  setCompanyDocEnabled(false);
  companyDocSection.style.display = "none";
}

if (companyDocDrop && companyDocInput) {
  companyDocDrop.addEventListener("click", () => {
    if (companyDocInput.disabled) return;
    companyDocInput.click();
  });

  companyDocDrop.addEventListener("dragover", (e) => {
    e.preventDefault();
    if (companyDocInput.disabled) return;
    companyDocDrop.classList.add("drag-over");
  });

  companyDocDrop.addEventListener("dragleave", () => {
    companyDocDrop.classList.remove("drag-over");
  });

  companyDocDrop.addEventListener("drop", (e) => {
    e.preventDefault();
    companyDocDrop.classList.remove("drag-over");
    if (companyDocInput.disabled) return;
    if (e.dataTransfer.files.length > 0) {
      companyDocInput.files = e.dataTransfer.files;
      showCompanyDocFile(e.dataTransfer.files[0].name);
    }
  });

  companyDocInput.addEventListener("change", () => {
    if (companyDocInput.disabled) return;
    if (companyDocInput.files.length > 0) {
      showCompanyDocFile(companyDocInput.files[0].name);
    }
  });
}

function showCompanyDocFile(name) {
  if (companyDocFileInfo) {
    companyDocFileInfo.style.display = "flex";
  }
  if (companyDocFileName) {
    companyDocFileName.textContent = name;
  }
  if (companyDocDrop) {
    companyDocDrop.style.display = "none";
  }
}

if (companyDocRemove) {
  companyDocRemove.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (companyDocInput) companyDocInput.value = "";
    if (companyDocFileInfo) companyDocFileInfo.style.display = "none";
    if (companyDocDrop) companyDocDrop.style.display = "";
  });
}

// ============== SIGNUP FORM ==============
const signupBtnIcon = document.getElementById("signupBtnIcon");
const signupSubmitBtn = document.getElementById("signupSubmitBtn");

function updateSignupButtonState() {
  const firstName = document.getElementById("signupFirstName").value.trim();
  const lastName = document.getElementById("signupLastName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;
  const confirm = document.getElementById("signupConfirm").value;
  const terms = document.getElementById("termsCheckbox").checked;
  const isCompany = signupIsCompany ? signupIsCompany.getAttribute("aria-checked") === "true" : false;
  const companyDocInput = document.getElementById("signupCompanyDoc");

  const valid = firstName && lastName && email && isValidEmail(email) && password && password.length >= 6 && confirm && confirm === password && terms && (!isCompany || (companyDocInput && companyDocInput.files.length > 0));

  if (signupBtnIcon) {
    signupBtnIcon.textContent = valid ? "✓" : "—";
  }
}

const signupInputs = ["signupFirstName", "signupLastName", "signupEmail", "signupPassword", "signupConfirm"];
signupInputs.forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener("input", updateSignupButtonState);
});
const termsCheckbox = document.getElementById("termsCheckbox");
if (termsCheckbox) termsCheckbox.addEventListener("change", updateSignupButtonState);
if (companyDocInput) companyDocInput.addEventListener("change", updateSignupButtonState);
if (signupIsCompany) signupIsCompany.addEventListener("click", () => setTimeout(updateSignupButtonState, 50));

const signupForm = document.getElementById("signupForm");
signupForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let valid = true;

  const firstName = document.getElementById("signupFirstName").value.trim();
  const lastName = document.getElementById("signupLastName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;
  const confirm = document.getElementById("signupConfirm").value;
  const terms = document.getElementById("termsCheckbox").checked;
  const isCompany = signupIsCompany ? signupIsCompany.getAttribute("aria-checked") === "true" : false;
  const companyDocInput = document.getElementById("signupCompanyDoc");
  const companyDocError = document.getElementById("signupCompanyDocError");

  if (!firstName) {
    setError("signupFirstName", "signupFirstNameError", "Requis.");
    valid = false;
  } else {
    setError("signupFirstName", "signupFirstNameError", "");
  }

  if (!lastName) {
    setError("signupLastName", "signupLastNameError", "Requis.");
    valid = false;
  } else {
    setError("signupLastName", "signupLastNameError", "");
  }

  if (!email) {
    setError("signupEmail", "signupEmailError", "L'adresse email est requise.");
    valid = false;
  } else if (!isValidEmail(email)) {
    setError("signupEmail", "signupEmailError", "Adresse email invalide.");
    valid = false;
  } else {
    setError("signupEmail", "signupEmailError", "");
  }

  if (!password) {
    setError("signupPassword", "signupPasswordError", "Le mot de passe est requis.");
    valid = false;
  } else if (password.length < 6) {
    setError("signupPassword", "signupPasswordError", "6 caractères minimum.");
    valid = false;
  } else {
    setError("signupPassword", "signupPasswordError", "");
  }

  if (!confirm) {
    setError("signupConfirm", "signupConfirmError", "Merci de confirmer le mot de passe.");
    valid = false;
  } else if (confirm !== password) {
    setError("signupConfirm", "signupConfirmError", "Les mots de passe ne correspondent pas.");
    valid = false;
  } else {
    setError("signupConfirm", "signupConfirmError", "");
  }

  if (isCompany && companyDocInput && companyDocInput.files.length === 0) {
    if (companyDocError) companyDocError.textContent = "Le document d'entreprise est requis.";
    valid = false;
  } else {
    if (companyDocError) companyDocError.textContent = "";
  }

  const termsError = document.getElementById("termsError");
  if (!terms) {
    termsError.textContent = "Tu dois accepter les conditions pour continuer.";
    valid = false;
  } else {
    termsError.textContent = "";
  }

  if (!valid) return;

  const btn = signupForm.querySelector(".btn-submit");
  const original = btn.textContent;
  btn.textContent = "Création du compte...";
  btn.classList.add("loading");

  const role = isCompany ? "entreprise" : "chercheur_emploi";
  let user = null;
  let fullName = "";

  function getCsrfToken() {
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta ? meta.getAttribute('content') : '';
  }

  function uploadCompanyDocToCloudinary(file, idToken) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('_token', getCsrfToken());

    return fetch('/upload-company-doc', {
      method: 'POST',
      headers: {
        'X-CSRF-TOKEN': getCsrfToken(),
        'Authorization': 'Bearer ' + (idToken || '')
      },
      body: formData
    }).then(function(response) {
      return response.json().then(function(data) {
        if (!response.ok) {
          var error = new Error(data.message || 'Erreur upload Cloudinary');
          error.response = response;
          error.data = data;
          throw error;
        }
        return data;
      });
    });
  }

  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      user = userCredential.user;
      fullName = (firstName + " " + lastName).trim();

      const userData = {
        firstName: firstName,
        lastName: lastName,
        fullName: fullName,
        email: email,
        role: role,
        createdAt: firebase.database.ServerValue.TIMESTAMP
      };

      if (isCompany && companyDocInput && companyDocInput.files.length > 0) {
        const file = companyDocInput.files[0];
        return user.getIdToken().then((idToken) => {
          return uploadCompanyDocToCloudinary(file, idToken).then((cloudinaryResult) => {
            if (cloudinaryResult && cloudinaryResult.success) {
              userData.companyDocUrl = cloudinaryResult.url || '';
              userData.companyDocName = cloudinaryResult.name || file.name;
              userData.companyDocPublicId = cloudinaryResult.publicId || '';
              if (companyDocFileName) {
                companyDocFileName.textContent = cloudinaryResult.name || file.name;
              }
            } else {
              userData.companyDocUrl = '';
              userData.companyDocName = file.name;
              if (companyDocFileName) {
                companyDocFileName.textContent = file.name;
              }
            }
            return firebase.database().ref("users/" + user.uid).set(userData);
          });
        });
      }

      return firebase.database().ref("users/" + user.uid).set(userData);
    })
    .then(() => {
      if (user) {
        user.updateProfile({ displayName: fullName });
      }
      btn.textContent = original;
      btn.classList.remove("loading");
      window.location.href = isCompany ? "/entreprise" : "/tableau-de-bord";
    })
    .catch((error) => {
      btn.textContent = original;
      btn.classList.remove("loading");
      setError("signupEmail", "signupEmailError", firebaseAuthError(error));
    });
});

// ============== FORGOT PASSWORD ==============
const forgotLink = document.getElementById("forgotLink");
if (forgotLink) {
  forgotLink.addEventListener("click", (e) => {
    e.preventDefault();
    showForm("forgotForm");
  });
}

const forgotForm = document.getElementById("forgotForm");
if (forgotForm) {
  forgotForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let valid = true;
    const email = document.getElementById("forgotEmail").value.trim();

    if (!email) {
      setError("forgotEmail", "forgotEmailError", "L'adresse email est requise.");
      valid = false;
    } else if (!isValidEmail(email)) {
      setError("forgotEmail", "forgotEmailError", "Adresse email invalide.");
      valid = false;
    } else {
      setError("forgotEmail", "forgotEmailError", "");
    }

    if (!valid) return;

    const btn = forgotForm.querySelector(".btn-submit");
    const original = btn.textContent;
    btn.textContent = "Envoi...";
    btn.classList.add("loading");

    firebase.auth().sendPasswordResetEmail(email)
      .then(() => {
        btn.textContent = original;
        btn.classList.remove("loading");
        document.getElementById("forgotEmailShown").textContent = email;
        document.getElementById("forgotFields").style.display = "none";
        document.getElementById("forgotDone").style.display = "block";
      })
      .catch((error) => {
        btn.textContent = original;
        btn.classList.remove("loading");
        const map = {
          "auth/invalid-email": "Adresse email invalide.",
          "auth/user-not-found": "Aucun compte ne correspond à cet email.",
          "auth/missing-email": "L'adresse email est requise.",
          "auth/network-request-failed": "Problème de connexion réseau."
        };
        setError("forgotEmail", "forgotEmailError", map[error.code] || (error.message || "Une erreur est survenue."));
      });
  });
}

const forgotBackBtn = document.getElementById("forgotBackBtn");
if (forgotBackBtn) {
  forgotBackBtn.addEventListener("click", () => {
    document.getElementById("forgotFields").style.display = "block";
    document.getElementById("forgotDone").style.display = "none";
    forgotForm.reset();
    switchTo("login");
  });
}

// ============== SUCCESS BOX ==============
function showSuccess(title, text) {
  document.getElementById("successTitle").textContent = title;
  document.getElementById("successText").textContent = text;
  forms.forEach(f => f.classList.remove("active"));
  successBox.classList.add("active");
}

document.getElementById("successBtn").addEventListener("click", () => {
  successBox.classList.remove("active");
  const activeTab = document.querySelector(".auth-tab.active").dataset.form;
  document.getElementById(activeTab + "Form").classList.add("active");
  loginForm.reset();
  signupForm.reset();
  strengthFill.style.width = "0%";
  strengthLabel.textContent = "Force du mot de passe";
});

// ============== CONNEXION GOOGLE ==============
function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then((userCredential) => {
      const user = userCredential.user;
      const fullName = user.displayName || "";
      // Récupère le token Firebase
      return user.getIdToken().then(idToken => ({ user, fullName, idToken }));
    })
    .then(({ user, fullName, idToken }) => {
      // Synchronise avec Laravel
      return fetch("/sync-firebase-auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        },
        body: JSON.stringify({ idToken: idToken })
      }).then(response => response.json()).then(data => ({ user, fullName, data }));
    })
    .then(({ user, fullName, data }) => {
      if (data.success) {
        window.location.href = data.redirect;
      } else {
        throw new Error(data.error || "Erreur de synchronisation");
      }
    })
    .catch((error) => {
      alert("Connexion impossible : " + (error.message || error.code));
    });
}

document.querySelectorAll(".social-btn").forEach((btn) => {
  if (btn.textContent.trim() === "Google") {
    btn.addEventListener("click", signInWithGoogle);
  }
});
