// ============== GARDE DE SESSION (TABLEAU DE BORD) ==============
// Si l'utilisateur n'est pas connecté, on le renvoie à la connexion.
firebase.auth().onAuthStateChanged((user) => {
  if (!user) {
    window.location.replace("/");
    return;
  }
  // Récupère le profil (photo + prénom) depuis la Realtime Database
  firebase.database().ref("users/" + user.uid).once("value").then((snapshot) => {
    const data = snapshot.val() || {};
    const firstName = data.firstName
      || (user.displayName ? user.displayName.split(" ")[0] : "")
      || (user.email ? user.email.split("@")[0] : "");

    // Photo de profil : depuis la base, sinon initiale du prénom
    const avatar = document.getElementById("userAvatar");
    if (avatar && avatar.isConnected) {
      if (data.photoURL) {
        avatar.src = data.photoURL;
      } else {
        const initial = (firstName || user.email || "?").charAt(0).toUpperCase();
        const div = document.createElement("div");
        div.style.cssText = "width:36px;height:36px;border-radius:50%;background:#12b3c9;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:15px;";
        div.textContent = initial;
        avatar.replaceWith(div);
      }
    }

    renderIndexScore(data);
  });
});

function renderIndexScore(data) {
  const scoreNum = document.getElementById("scoreNumIndex");
  const ring = document.getElementById("scoreRingIndex");
  if (!scoreNum || !ring) return;

  const required = [
    "firstName", "lastName", "email", "birthDate", "residence", "whatsapp"
  ];
  const optional = [
    "nationality", "maritalStatus", "mainLanguage", "linkedin",
    "jobTitle", "availability", "contractType", "workLocation", "salary", "about"
  ];
  const stats = ["experienceYears", "projectsCount", "clientsCount"];

  let score = 0;
  score += (required.filter(f => (data[f] || "").toString().trim() !== "").length / required.length) * 40;
  score += (optional.filter(f => (data[f] || "").toString().trim() !== "").length / optional.length) * 25;
  score += (stats.filter(f => data[f] !== undefined && data[f] !== null && data[f] !== "" && data[f] > 0).length / stats.length) * 10;

  const sections = ["experiences", "skills", "formations", "certifications", "languages", "preferences"];
  score += (sections.filter(s => {
    const sec = data[s];
    if (!sec || typeof sec !== "object") return false;
    return Object.keys(sec).length > 0;
  }).length / sections.length) * 25;

  const pct = Math.min(100, Math.max(0, Math.round(score)));
  scoreNum.innerHTML = `${pct}<span>/100</span>`;

  const badge = document.getElementById("scoreBadgeIndex");
  const text = document.getElementById("scoreTextIndex");
  if (badge) {
    if (pct >= 100) badge.textContent = "★ Parfait";
    else if (pct >= 75) badge.textContent = "★ Excellent";
    else if (pct >= 50) badge.textContent = "★ Très bon";
    else if (pct > 0) badge.textContent = "★ À améliorer";
    else badge.textContent = "★ Vide";
  }
  if (text) {
    if (pct >= 100) text.textContent = "Ton profil est parfait !";
    else if (pct >= 75) text.textContent = "Ton profil est très attractif pour les recruteurs !";
    else if (pct >= 50) text.textContent = "Ajoute encore quelques informations pour améliorer ton score.";
    else if (pct > 0) text.textContent = "Votre profil manque de détails pour être mis en avant.";
    else text.textContent = "Commencez par remplir vos informations pour obtenir un score.";
  }

  const improveBtn = document.getElementById("improveScoreBtn");
  if (improveBtn) {
    improveBtn.onclick = () => {
      window.location.href = "/profil";
    };
  }

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  ring.style.strokeDasharray = circumference;
  ring.style.strokeDashoffset = circumference;
  requestAnimationFrame(() => {
    setTimeout(() => {
      const offset = circumference - (pct / 100) * circumference;
      ring.style.transition = "stroke-dashoffset 1.2s ease";
      ring.style.strokeDashoffset = offset;
    }, 150);
  });
}

// Empêche le bouton "précédent" tant qu'on est connecté :
// on "re-pousse" la page courante dans l'historique à chaque tentative de retour.
history.pushState(null, null, location.href);
window.addEventListener("popstate", () => {
  history.pushState(null, null, location.href);
});

// ============== DÉCONNEXION ==============
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    firebase.auth().signOut()
      .then(() => { window.location.replace("/"); })
      .catch(() => { window.location.replace("/"); });
  });
}

// ============== PLI / DÉPLI DE LA SIDEBAR ==============
const hamburger = document.querySelector(".hamburger");
const sidebar = document.querySelector(".sidebar");
if (hamburger && sidebar) {
  hamburger.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
  });
}

// ============== REDIRECTION ACTIONS PRIORITAIRES ==============
const actionAddSkill = document.getElementById("actionAddSkill");
if (actionAddSkill) {
  actionAddSkill.addEventListener("click", () => {
    localStorage.setItem("veraOpenTab", "skills");
    window.location.href = "/profil";
  });
}

const actionValidateExp = document.getElementById("actionValidateExp");
if (actionValidateExp) {
  actionValidateExp.addEventListener("click", () => {
    localStorage.setItem("veraOpenTab", "exp");
    window.location.href = "/profil";
  });
}

const actionFollowTraining = document.getElementById("actionFollowTraining");
if (actionFollowTraining) {
  actionFollowTraining.addEventListener("click", () => {
    localStorage.setItem("veraOpenTab", "formations");
    window.location.href = "/profil";
  });
}
