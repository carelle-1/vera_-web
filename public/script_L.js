// ============== TABS SWITCH ==============
const tabs = document.querySelectorAll(".auth-tab");
const forms = document.querySelectorAll(".auth-form");
const indicator = document.getElementById("tabIndicator");
const successBox = document.getElementById("successBox");

function switchTo(formName) {
  tabs.forEach(t => t.classList.toggle("active", t.dataset.form === formName));
  forms.forEach(f => f.classList.toggle("active", f.id === formName + "Form"));
  indicator.style.transform = formName === "signup" ? "translateX(100%)" : "translateX(0)";
  successBox.classList.remove("active");
  forms.forEach(f => { if (f.id === formName + "Form") f.style.display = "flex"; });
}

function showForm(formId) {
  tabs.forEach(t => t.classList.remove("active"));
  forms.forEach(f => { f.classList.remove("active"); f.style.display = "none"; });
  successBox.classList.remove("active");
  const f = document.getElementById(formId);
  if (f) { f.classList.add("active"); f.style.display = "flex"; }
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
  return map[error.code] || (error.message || "Une erreur est survenue.");
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
      firebase.database().ref("users/" + user.uid).once("value")
        .then((snapshot) => {
          const data = snapshot.val() || {};
          const role = data.role || "chercheur_emploi";
          if (role === "chercheur_emploi") {
            window.location.href = "/tableau-de-bord";
          } else {
            alert("Accès réservé aux chercheurs d'emploi pour le moment.");
            firebase.auth().signOut();
            window.location.href = "/";
          }
        })
        .catch(() => {
          window.location.href = "/tableau-de-bord";
        });
    })
    .catch((error) => {
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

// ============== SIGNUP FORM ==============
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

  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      const fullName = (firstName + " " + lastName).trim();

      // Enregistre le profil dans la Realtime Database (Firebase)
      return firebase.database().ref("users/" + user.uid).set({
        firstName: firstName,
        lastName: lastName,
        fullName: fullName,
        email: email,
        role: "chercheur_emploi",
        createdAt: firebase.database.ServerValue.TIMESTAMP
      }).then(() => {
        if (user) {
          user.updateProfile({ displayName: fullName });
        }
        btn.textContent = original;
        btn.classList.remove("loading");
        window.location.href = "/tableau-de-bord";
      });
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
  forms.forEach(f => f.style.display = "none");
  successBox.classList.add("active");
}

document.getElementById("successBtn").addEventListener("click", () => {
  successBox.classList.remove("active");
  const activeTab = document.querySelector(".auth-tab.active").dataset.form;
  document.getElementById(activeTab + "Form").style.display = "flex";
  loginForm.reset();
  signupForm.reset();
  strengthFill.style.width = "0%";
  strengthLabel.textContent = "Force du mot de passe";
});
