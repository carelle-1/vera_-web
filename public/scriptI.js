// ============== HELPERS ==============
function escapeHtml(text) {
  if (text === null || text === undefined) return "";
  const str = String(text);
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return str.replace(/[&<>"']/g, (m) => map[m]);
}

function generateCV(returnBlob) {
  const user = firebase.auth().currentUser;
  if (!user) return Promise.reject(new Error("Non connecté"));

  return firebase.database().ref("users/" + user.uid + "/experiences").once("value").then((expSnap) => {
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
    cvContent.style.cssText = "font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #111827; width: 210mm; min-height: 297mm; margin: 0 auto; background: #ffffff; box-sizing: border-box; padding: 28px 32px;";

    const accent = "#2563eb";
    const textPrimary = "#111827";
    const textSecondary = "#6b7280";
    const textMuted = "#9ca3af";
    const bgSidebar = "#f8fafc";
    const border = "#e5e7eb";

    let html = "";

    html += '<div style="width: 100%; border-bottom: 3px solid ' + accent + '; padding-bottom: 16px; margin-bottom: 20px;">';
    html += '<div style="display: flex; align-items: center; gap: 16px;">';
    if (photoURL) {
      html += '<img src="' + escapeHtml(photoURL) + '" style="width: 72px; height: 72px; border-radius: 50%; object-fit: cover; border: 2px solid ' + accent + '; flex-shrink: 0;">';
    }
    html += '<div style="flex: 1; min-width: 0;">';
    html += '<h1 style="font-size: 22px; font-weight: 800; color: ' + textPrimary + '; margin: 0 0 4px;">' + escapeHtml(fullName) + '</h1>';
    if (jobTitle) {
      html += '<p style="font-size: 13px; font-weight: 600; color: ' + accent + '; margin: 0 0 8px;">' + escapeHtml(jobTitle) + '</p>';
    }
    html += '<div style="display: flex; flex-wrap: wrap; gap: 10px; font-size: 10.5px; color: ' + textSecondary + '; line-height: 1.5;">';
    if (email) html += '<span>' + escapeHtml(email) + '</span>';
    if (whatsapp) html += '<span>' + escapeHtml(whatsapp) + '</span>';
    if (residence) html += '<span>' + escapeHtml(residence) + '</span>';
    if (linkedin) html += '<span>' + escapeHtml(linkedin) + '</span>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    html += '</div>';

    html += '<div style="display: flex; gap: 20px;">';

    html += '<div style="flex: 1; min-width: 0;">';

    if (about) {
      html += '<section style="margin-bottom: 18px;">';
      html += '<h2 style="font-size: 11px; font-weight: 800; color: ' + accent + '; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 6px; padding-bottom: 4px; border-bottom: 1px solid ' + border + ';">Profil professionnel</h2>';
      html += '<p style="font-size: 11px; color: ' + textSecondary + '; line-height: 1.6; margin: 0; text-align: justify;">' + escapeHtml(about) + '</p>';
      html += '</section>';
    }

    if (expItems.length > 0) {
      html += '<section style="margin-bottom: 18px;">';
      html += '<h2 style="font-size: 11px; font-weight: 800; color: ' + accent + '; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px; padding-bottom: 4px; border-bottom: 1px solid ' + border + ';">Expériences professionnelles</h2>';
      expItems.forEach(exp => {
        html += '<div style="margin-bottom: 10px; padding-left: 10px; border-left: 2px solid ' + accent + ';">';
        html += '<div style="font-weight: 700; font-size: 12px; color: ' + textPrimary + '; margin-bottom: 2px;">' + escapeHtml(exp.title || "Poste") + '</div>';
        html += '<div style="font-size: 11px; color: ' + textSecondary + '; margin-bottom: 2px;">' + escapeHtml(exp.company || "") + (exp.location ? " · " + escapeHtml(exp.location) : "") + '</div>';
        html += '<div style="font-size: 10px; color: ' + textMuted + '; margin-bottom: 3px;">' + (exp.startYear || "") + (exp.endYear && exp.endYear !== "Présent" ? " - " + exp.endYear : exp.endYear === "Présent" ? " - Présent" : "") + '</div>';
        if (exp.description) {
          html += '<p style="font-size: 11px; color: ' + textSecondary + '; line-height: 1.45; margin: 0;">' + escapeHtml(exp.description) + '</p>';
        }
        html += '</div>';
      });
      html += '</section>';
    }

    if (formItems.length > 0) {
      html += '<section style="margin-bottom: 18px;">';
      html += '<h2 style="font-size: 11px; font-weight: 800; color: ' + accent + '; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px; padding-bottom: 4px; border-bottom: 1px solid ' + border + ';">Formations</h2>';
      formItems.forEach(form => {
        html += '<div style="margin-bottom: 10px; padding-left: 10px; border-left: 2px solid ' + accent + ';">';
        html += '<div style="font-weight: 700; font-size: 12px; color: ' + textPrimary + '; margin-bottom: 2px;">' + escapeHtml(form.diploma || "Diplôme") + '</div>';
        html += '<div style="font-size: 11px; color: ' + textSecondary + '; margin-bottom: 2px;">' + escapeHtml(form.school || "") + (form.location ? " · " + escapeHtml(form.location) : "") + '</div>';
        html += '<div style="font-size: 10px; color: ' + textMuted + ';">' + (form.startYear || "") + (form.endYear && form.endYear !== "Présent" ? " - " + form.endYear : form.endYear === "Présent" ? " - Présent" : "") + '</div>';
        html += '</div>';
      });
      html += '</section>';
    }

    if (projectItems.length > 0) {
      html += '<section style="margin-bottom: 18px;">';
      html += '<h2 style="font-size: 11px; font-weight: 800; color: ' + accent + '; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px; padding-bottom: 4px; border-bottom: 1px solid ' + border + ';">Projets</h2>';
      projectItems.forEach(project => {
        html += '<div style="margin-bottom: 10px; padding-left: 10px; border-left: 2px solid ' + accent + ';">';
        html += '<div style="font-weight: 700; font-size: 12px; color: ' + textPrimary + '; margin-bottom: 2px;">' + escapeHtml(project.title || project.name || "Projet") + '</div>';
        if (project.description) {
          html += '<p style="font-size: 11px; color: ' + textSecondary + '; line-height: 1.45; margin: 0 0 3px;">' + escapeHtml(project.description) + '</p>';
        }
        if (project.technologies || project.tags || project.skills) {
          const techs = [project.technologies, project.tags, project.skills].filter(Boolean).join(", ");
          html += '<div style="font-size: 10px; color: ' + accent + '; font-weight: 600;">' + escapeHtml(techs) + '</div>';
        }
        html += '</div>';
      });
      html += '</section>';
    }

    if (certItems.length > 0) {
      html += '<section style="margin-bottom: 18px;">';
      html += '<h2 style="font-size: 11px; font-weight: 800; color: ' + accent + '; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px; padding-bottom: 4px; border-bottom: 1px solid ' + border + ';">Certifications</h2>';
      certItems.forEach(cert => {
        html += '<div style="margin-bottom: 8px; padding-left: 10px; border-left: 2px solid ' + accent + ';">';
        html += '<div style="font-weight: 700; font-size: 12px; color: ' + textPrimary + '; margin-bottom: 2px;">' + escapeHtml(cert.name || "Certification") + '</div>';
        html += '<div style="font-size: 11px; color: ' + textSecondary + ';">' + escapeHtml(cert.issuer || "") + (cert.date ? " · " + escapeHtml(cert.date) : "") + (cert.expiryDate ? " - " + escapeHtml(cert.expiryDate) : "") + '</div>';
        html += '</div>';
      });
      html += '</section>';
    }

    html += '</div>';

    html += '<div style="width: 32%; background: ' + bgSidebar + '; border-left: 1px solid ' + border + '; padding: 20px; flex-shrink: 0;">';

    if (skillItems.length > 0) {
      html += '<section style="margin-bottom: 18px;">';
      html += '<h2 style="font-size: 11px; font-weight: 800; color: ' + accent + '; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px; padding-bottom: 4px; border-bottom: 1px solid ' + border + ';">Compétences</h2>';
      html += '<div style="display: flex; flex-wrap: wrap; gap: 6px;">';
      skillItems.forEach(skill => {
        html += '<span style="background: #ffffff; color: ' + accent + '; border: 1px solid ' + border + '; padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 600;">' + escapeHtml(skill.name || "") + (skill.level ? " (" + escapeHtml(skill.level) + ")" : "") + '</span>';
      });
      html += '</div>';
      html += '</section>';
    }

    if (langItems.length > 0) {
      html += '<section style="margin-bottom: 18px;">';
      html += '<h2 style="font-size: 11px; font-weight: 800; color: ' + accent + '; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px; padding-bottom: 4px; border-bottom: 1px solid ' + border + ';">Langues</h2>';
      langItems.forEach(lang => {
        html += '<div style="margin-bottom: 5px; font-size: 11px; color: ' + textSecondary + ';">';
        html += '<strong style="color: ' + textPrimary + ';">' + escapeHtml(lang.name || "") + '</strong>';
        if (lang.level) html += ' · ' + escapeHtml(lang.level);
        html += '</div>';
      });
      html += '</section>';
    }

    html += '<section style="margin-bottom: 18px;">';
    html += '<h2 style="font-size: 11px; font-weight: 800; color: ' + accent + '; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px; padding-bottom: 4px; border-bottom: 1px solid ' + border + ';">Informations</h2>';
    html += '<div style="font-size: 10px; color: ' + textSecondary + '; line-height: 1.6;">';
    if (nationality) html += '<div><strong style="color: ' + textPrimary + ';">Nationalité:</strong> ' + escapeHtml(nationality) + '</div>';
    if (birthDate) html += '<div><strong style="color: ' + textPrimary + ';">Naissance:</strong> ' + escapeHtml(birthDate) + '</div>';
    if (maritalStatus) html += '<div><strong style="color: ' + textPrimary + ';">Situation:</strong> ' + escapeHtml(maritalStatus) + '</div>';
    if (availability) html += '<div><strong style="color: ' + textPrimary + ';">Disponibilité:</strong> ' + escapeHtml(availability) + '</div>';
    if (contractType) html += '<div><strong style="color: ' + textPrimary + ';">Contrat:</strong> ' + escapeHtml(contractType) + '</div>';
    if (workLocation) html += '<div><strong style="color: ' + textPrimary + ';">Lieu de travail:</strong> ' + escapeHtml(workLocation) + '</div>';
    if (salary) html += '<div><strong style="color: ' + textPrimary + ';">Salaire:</strong> ' + escapeHtml(salary) + '</div>';
    html += '</div>';
    html += '</section>';

    html += '<div style="margin-top: auto; padding-top: 12px; border-top: 1px solid ' + border + '; font-size: 9px; color: ' + textMuted + '; text-align: center;">';
    html += 'Généré depuis VERA · ' + new Date().getFullYear();
    html += '</div>';

    html += '</div>';
    html += '</div>';

    cvContent.innerHTML = html;

    const opt = {
      margin: 0,
      filename: (fullName.replace(/\s+/g, "_") || "CV") + ".pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    };

    const pdfPromise = (returnBlob ? html2pdf().set(opt).from(cvContent).output('blob') : html2pdf().set(opt).from(cvContent).save());
    return pdfPromise.catch(err => {
      alert("Échec de la génération du PDF : " + (err.message || err.code));
      throw err;
    });
  }).catch(err => {
    alert("Échec de la génération du CV : " + (err.message || err.code));
    throw err;
  });
}

function generateCoverLetter(job, returnBlob) {
  const user = firebase.auth().currentUser;
  if (!user) return Promise.reject(new Error("Non connecté"));

  return firebase.database().ref("users/" + user.uid).once("value").then((snap) => {
    const data = snap.val() || {};
    const fullName = (data.fullName || ((data.firstName || "") + " " + (data.lastName || "")).trim() || user.displayName || "Candidat").trim();
    const email = data.email || user.email || "";
    const whatsapp = data.whatsapp || "";
    const linkedin = data.linkedin || "";
    const residence = data.residence || "";
    const jobTitle = (job && job.title) ? job.title : "le poste";
    const company = (job && job.company) ? job.company : "";

    const today = new Date();
    const dateStr = today.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });

    const recipient = company ? "Direction des Ressources Humaines\n" + company : "Direction des Ressources Humaines";
    const subject = "Candidature au poste de " + jobTitle;

    const letterContent = document.createElement("div");
    letterContent.style.cssText = "font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #111827; width: 210mm; min-height: 297mm; margin: 0 auto; background: #ffffff; box-sizing: border-box; padding: 32px 36px;";

    let html = "";

    html += '<div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; margin-bottom: 24px;">';
    html += '<div style="flex: 1;">';
    html += '<h1 style="font-size: 20px; font-weight: 800; color: #111827; margin: 0 0 6px;">' + escapeHtml(fullName) + '</h1>';
    if (email) html += '<p style="font-size: 11px; color: #6b7280; margin: 0 0 2px;">' + escapeHtml(email) + '</p>';
    if (whatsapp) html += '<p style="font-size: 11px; color: #6b7280; margin: 0 0 2px;">' + escapeHtml(whatsapp) + '</p>';
    if (linkedin) html += '<p style="font-size: 11px; color: #6b7280; margin: 0 0 2px;">' + escapeHtml(linkedin) + '</p>';
    if (residence) html += '<p style="font-size: 11px; color: #6b7280; margin: 0;">' + escapeHtml(residence) + '</p>';
    html += '</div>';
    html += '<div style="text-align: right;">';
    if (residence) html += '<p style="font-size: 11px; color: #6b7280; margin: 0 0 4px;">' + escapeHtml(residence) + '</p>';
    html += '<p style="font-size: 11px; color: #6b7280; margin: 0;">' + escapeHtml(dateStr) + '</p>';
    html += '</div>';
    html += '</div>';

    html += '<div style="text-align: right; margin-bottom: 16px;">';
    html += '<p style="font-size: 12px; font-weight: 700; color: #111827; margin: 0; white-space: pre-line;">' + escapeHtml(recipient) + '</p>';
    html += '</div>';

    html += '<p style="font-size: 12px; font-weight: 600; color: #111827; margin: 0 0 18px;">Objet : ' + escapeHtml(subject) + '</p>';

    html += '<div style="font-size: 12px; color: #374151; line-height: 1.7; text-align: justify;">';
    html += '<p>Madame, Monsieur,</p>';
    html += '<p>Je vous adresse ma candidature pour le poste de <strong>' + escapeHtml(jobTitle) + '</strong>' + (company ? " au sein de <strong>" + escapeHtml(company) + "</strong>" : "") + ". Fort de mes compétences et de mon expérience, je suis convaincu de pouvoir apporter une valeur ajoutée à votre équipe. Mon parcours et ma motivation sont en parfaite adéquation avec les exigences de ce poste.</p>";
    html += '<p>Je me tiens à votre disposition pour un entretien afin de vous exposer plus en détail mes motivations et mes réalisations. Je vous prie d\'agréer, Madame, Monsieur, l\'expression de mes salutations distinguées.</p>';
    html += '</div>';

    html += '<div style="margin-top: auto; padding-top: 16px; text-align: right;">';
    html += '<p style="font-size: 10px; color: #9ca3af; margin: 0;">' + escapeHtml(fullName) + '</p>';
    html += '</div>';

    letterContent.innerHTML = html;

    const opt = {
      margin: 0,
      filename: (fullName.replace(/\s+/g, "_") || "Candidat") + "_Lettre_Motivation.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    };

    const pdfPromise = (returnBlob ? html2pdf().set(opt).from(letterContent).output('blob') : html2pdf().set(opt).from(letterContent).save());
    return pdfPromise.catch(err => {
      alert("Échec de la génération de la lettre : " + (err.message || err.code));
      throw err;
    });
  }).catch(err => {
    alert("Échec de la génération de la lettre : " + (err.message || err.code));
    throw err;
  });
}

let currentPage = 1;
const JOBS_PER_PAGE = 5;
let allFilteredJobs = [];

function normalize(text) {
  return (text || "").toString().trim().toLowerCase();
}

function userSkillNames(skills) {
  if (!skills || typeof skills !== "object") return [];
  return Object.values(skills)
    .map((s) => normalize(s && s.name ? s.name : ""))
    .filter(Boolean);
}

function jobSkillNames(job) {
  const raw = job && job.skills ? job.skills : "";
  return raw.split(",").map((s) => normalize(s)).filter(Boolean);
}

function textContainsAny(text, keywords) {
  const hay = normalize(text);
  return keywords.some((k) => hay.includes(k));
}

function calculateJobCompatibility(userData, job) {
  const userSkills = userSkillNames(userData.skills);
  const requiredSkills = jobSkillNames(job);
  if (!requiredSkills.length) return 100;

  let matchCount = 0;
  requiredSkills.forEach((req) => {
    if (userSkills.some((us) => us === req || us.includes(req) || req.includes(us))) {
      matchCount++;
    }
  });

  const skillsPct = Math.round((matchCount / requiredSkills.length) * 100);

  const experiences = Array.isArray(userData.experiences) ? userData.experiences : [];
  const formations = Array.isArray(userData.formations) ? userData.formations : [];
  const certifications = Array.isArray(userData.certifications) ? userData.certifications : [];

  const experienceText = [
    userData.jobTitle,
    userData.about,
    ...experiences.map((e) => [e.title, e.company, e.description].join(" "))
  ].join(" ");

  const formationText = [
    ...formations.map((f) => [f.diploma, f.school, f.description].join(" "))
  ].join(" ");

  const certificationText = [
    ...certifications.map((c) => [c.title, c.issuer, c.description].join(" "))
  ].join(" ");

  let bonus = 0;
  if (textContainsAny(experienceText, requiredSkills)) bonus += 5;
  if (textContainsAny(formationText, requiredSkills)) bonus += 5;
  if (textContainsAny(certificationText, requiredSkills)) bonus += 5;

  let score = skillsPct + bonus;
  if (score > 100) score = 100;
  if (score < 0) score = 0;
  return score;
}

// ============== GARDE DE SESSION (TABLEAU DE BORD) ==============
// Si l'utilisateur n'est pas connecté, on le renvoie Ã  la connexion.
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
    renderRecommendedJobs();
    loadUserFavorites().then(() => {
      updateFavoriteButtons();
    }).catch((err) => {
      console.error("[FAV] erreur chargement favoris:", err);
    });
  });
});

// ============== FAVORIS ==============
let userFavorites = new Set();

function getFavoritesRef() {
  const user = firebase.auth().currentUser;
  return user ? firebase.database().ref("favorites/" + user.uid) : null;
}

function loadUserFavorites() {
  const user = firebase.auth().currentUser;
  if (!user) return Promise.resolve();
  
  return firebase.database().ref("favorites/" + user.uid).once("value").then((snap) => {
    const data = snap.val() || {};
    userFavorites = new Set(Object.keys(data));
  }).catch((err) => {
    console.error("[FAV] erreur chargement favoris:", err);
    userFavorites = new Set();
  });
}

function updateFavoriteButtons() {
  document.querySelectorAll("[data-job-save]").forEach(btn => {
    const jobId = btn.getAttribute("data-job-save");
    if (!jobId) return;
    
    if (userFavorites.has(jobId)) {
      btn.classList.add("saved");
      btn.innerHTML = `<svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:var(--blue);"><path d="M5 3h14a2 2 0 0 1 2 2v16l-7-3-7 3V5a2 2 0 0 1 2-2z"/></svg>`;
    } else {
      btn.classList.remove("saved");
      btn.innerHTML = `<img src="/image/3916600.png" alt="Sauvegarder" style="width:18px;height:18px;object-fit:contain;">`;
    }
  });
}

function toggleFavorite(jobId) {
  const ref = getFavoritesRef();
  if (!ref) {
    alert("Vous devez être connecté pour sauvegarder des favoris.");
    return;
  }

  const favRef = ref.child(jobId);
  favRef.once("value").then((snap) => {
    const isFav = snap.exists();
    if (isFav) {
      return favRef.remove().then(() => {
        userFavorites.delete(jobId);
        return false;
      });
    } else {
      return favRef.set({ createdAt: Date.now() }).then(() => {
        userFavorites.add(jobId);
        return true;
      });
    }
  }).then(() => {
    updateFavoriteButtons();
  }).catch((err) => {
    console.error("[FAV] erreur:", err);
  });
}

function renderRecommendedJobs() {
  const container = document.getElementById("jobsContainer");
  if (!container) return;

  const user = firebase.auth().currentUser;
  if (!user) {
    container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--muted);">Connectez-vous pour voir les offres.</div>`;
    return;
  }

  firebase.database().ref("jobs").once("value").then((snapshot) => {
    const data = snapshot.val() || {};
    const jobs = Object.keys(data).map((id) => ({ id, ...data[id] }));

    jobs.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    });

    populateCountryFilter(jobs);
    populateCompanyFilter(jobs);

    const contractFilter = document.getElementById("contractFilter") ? document.getElementById("contractFilter").value : "";
    const countryFilter = document.getElementById("countryFilter") ? document.getElementById("countryFilter").value : "";
    const companyFilter = document.getElementById("companyFilter") ? document.getElementById("companyFilter").value : "";

    let filteredJobs = jobs;
    if (contractFilter) {
      filteredJobs = filteredJobs.filter((job) => {
        const contractType = (job.contractType || job.status || "").toString().toLowerCase();
        return contractType === contractFilter.toLowerCase();
      });
    }
    if (countryFilter) {
      filteredJobs = filteredJobs.filter((job) => {
        const country = (job.country || job.location || "").toString().toLowerCase();
        return country.includes(countryFilter.toLowerCase());
      });
    }
    if (companyFilter) {
      filteredJobs = filteredJobs.filter((job) => {
        const company = (job.company || "").toString().toLowerCase();
        return company.includes(companyFilter.toLowerCase());
      });
    }

    allFilteredJobs = filteredJobs;
    const totalPages = Math.max(1, Math.ceil(allFilteredJobs.length / JOBS_PER_PAGE));
    if (currentPage > totalPages) currentPage = totalPages;
    const start = (currentPage - 1) * JOBS_PER_PAGE;
    const topJobs = allFilteredJobs.slice(start, start + JOBS_PER_PAGE);

    const skillsPromise = firebase.database().ref("users/" + user.uid + "/skills").once("value");
    const expPromise = firebase.database().ref("users/" + user.uid + "/experiences").once("value");
    const formPromise = firebase.database().ref("users/" + user.uid + "/formations").once("value");
    const certPromise = firebase.database().ref("users/" + user.uid + "/certifications").once("value");
    const userPromise = firebase.database().ref("users/" + user.uid).once("value");

    Promise.all([userPromise, skillsPromise, expPromise, formPromise, certPromise]).then(([userSnap, skillsSnap, expSnap, formSnap, certSnap]) => {
      const userData = userSnap.val() || {};
      const enrichedUser = {
        ...userData,
        skills: skillsSnap.val() || {},
        experiences: Object.keys(expSnap.val() || {}).map(id => ({ id, ...(expSnap.val() || {})[id] })),
        formations: Object.keys(formSnap.val() || {}).map(id => ({ id, ...(formSnap.val() || {})[id] })),
        certifications: Object.keys(certSnap.val() || {}).map(id => ({ id, ...(certSnap.val() || {})[id] }))
      };
      renderJobsList(topJobs, enrichedUser);
      updateFavoriteButtons();
      renderPagination(allFilteredJobs.length);
    }).catch((err) => {
      console.error("[JOBS] erreur chargement profil:", err);
      renderJobsList(topJobs, {});
      updateFavoriteButtons();
      renderPagination(allFilteredJobs.length);
    });
  }).catch((err) => {
    container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--red);">Erreur de chargement des offres.</div>`;
    console.error("[JOBS] erreur chargement:", err);
  });
}

function populateCountryFilter(jobs) {
  const select = document.getElementById("countryFilter");
  if (!select) return;

  const countries = new Set();
  jobs.forEach((job) => {
    const country = (job.country || "").toString().trim();
    const location = (job.location || "").toString().trim();
    if (country) countries.add(country);
    else if (location) countries.add(location);
  });

  const currentValue = select.value;
  select.innerHTML = '<option value="">ðŸ“ Tous pays</option>';
  Array.from(countries).sort().forEach((country) => {
    const option = document.createElement("option");
    option.value = country;
    option.textContent = country;
    select.appendChild(option);
  });
  select.value = currentValue;

  const countryCustom = document.getElementById('countryFilterCustom');
  if (countryCustom) {
    const optionsContainer = countryCustom.querySelector('.custom-select-options');
    const firstOption = optionsContainer.querySelector('.custom-select-option');
    optionsContainer.innerHTML = '';
    if (firstOption) optionsContainer.appendChild(firstOption);
    Array.from(countries).sort().forEach((country) => {
      const div = document.createElement('div');
      div.className = 'custom-select-option';
      div.setAttribute('data-value', country);
      div.innerHTML = '<span>' + country + '</span>';
      optionsContainer.appendChild(div);
    });
  }
}

function populateCompanyFilter(jobs) {
  const select = document.getElementById("companyFilter");
  if (!select) return;

  const companies = new Set();
  jobs.forEach((job) => {
    const company = (job.company || "").toString().trim();
    if (company) companies.add(company);
  });

  const currentValue = select.value;
  select.innerHTML = '<option value="">ðŸ¢ Entreprise</option>';
  Array.from(companies).sort().forEach((company) => {
    const option = document.createElement("option");
    option.value = company;
    option.textContent = company;
    select.appendChild(option);
  });
  select.value = currentValue;

  const companyCustom = document.getElementById('companyFilterCustom');
  if (companyCustom) {
    const optionsContainer = companyCustom.querySelector('.custom-select-options');
    const firstOption = optionsContainer.querySelector('.custom-select-option');
    optionsContainer.innerHTML = '';
    if (firstOption) optionsContainer.appendChild(firstOption);
    Array.from(companies).sort().forEach((company) => {
      const div = document.createElement('div');
      div.className = 'custom-select-option';
      div.setAttribute('data-value', company);
      div.innerHTML = '<span>' + company + '</span>';
      optionsContainer.appendChild(div);
    });
  }
}

function renderJobsList(topJobs, enrichedUser) {
  const container = document.getElementById("jobsContainer");
  if (!container) return;

  container.innerHTML = topJobs.map((job) => {
    const compatibility = calculateJobCompatibility(enrichedUser, job);
    const logoUrl = job.logoURL || "";
    const logoHtml = logoUrl
      ? `<img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(job.company || 'logo')}" style="width:100%;height:100%;object-fit:contain;">`
      : `<div class="job-logo-text">${escapeHtml((job.company || "?").charAt(0).toUpperCase())}</div>`;

    const tags = (job.skills || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 3);
    const tagsHtml = tags.map((t) => `<span>${escapeHtml(t)}</span>`).join("");

    return `
      <article class="job">
        <div class="job-logo">${logoHtml}</div>
        <div class="job-info">
          <div class="job-compat">${compatibility}% Compatible</div>
          <div class="job-title">${escapeHtml(job.title || "Sans titre")} ${job.verified ? '<span class="verified-dot">âœ“</span>' : ""}</div>
          <div class="job-sub">${escapeHtml(job.company || "—")} · <span>${escapeHtml(job.location || "—")}</span> <span class="tag">${escapeHtml(job.contractType || job.status || "")}</span></div>
          <div class="job-tags">${tagsHtml}${tags.length >= 3 && (job.skills || "").split(",").map((s) => s.trim()).filter(Boolean).length > 3 ? `<span>+${(job.skills || "").split(",").map((s) => s.trim()).filter(Boolean).length - 3}</span>` : ""}</div>
        </div>
        <div class="job-side">
          <div class="job-price">${escapeHtml(job.salary || "—")}<span>par mois</span></div>
          <div class="job-actions">
            <button class="btn-primary" data-job-detail="${escapeHtml(job.id)}">Voir détails</button>
            <button class="btn-icon" data-job-save="${escapeHtml(job.id)}"></button>
          </div>
        </div>
      </article>
    `;
  }).join("");

  if (topJobs.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--muted);">Aucune opportunité pour le moment.</div>`;
  }
}

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
    if (pct >= 100) badge.textContent = "â˜… Parfait";
    else if (pct >= 75) badge.textContent = "â˜… Excellent";
    else if (pct >= 50) badge.textContent = "â˜… Très bon";
    else if (pct > 0) badge.textContent = "â˜… À améliorer";
    else badge.textContent = "â˜… Vide";
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
// on "re-pousse" la page courante dans l'historique Ã  chaque tentative de retour.
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

// ============== MODAL DÉTAILS OFFRE ==============
const jobDetailOverlay = document.getElementById("jobDetailOverlay");
const jobDetailModal = document.getElementById("jobDetailModal");
const jobDetailTitle = document.getElementById("jobDetailTitle");
const jobDetailBody = document.getElementById("jobDetailBody");
const jobDetailClose = document.getElementById("jobDetailClose");

function openJobDetailModal(job) {
  if (!jobDetailOverlay || !jobDetailBody || !jobDetailTitle) return;

  const logoUrl = job.logoURL || "";
  const logoHtml = logoUrl
    ? `<img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(job.company || 'logo')}" class="detail-logo">`
    : `<div class="detail-logo" style="display:flex;align-items:center;justify-content:center;font-weight:800;font-size:22px;background:linear-gradient(90deg,var(--mint-light),var(--sky));color:#052a2f;">${escapeHtml((job.company || "?").charAt(0).toUpperCase())}</div>`;

  const tags = (job.skills || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 6);
  const tagsHtml = tags.map((t) => `<span style="display:inline-block;padding:4px 10px;border-radius:20px;background:var(--bg);color:var(--text);font-size:12px;font-weight:600;margin:2px;">${escapeHtml(t)}</span>`).join("");

  jobDetailBody.innerHTML = `
    ${logoHtml}
    <div class="detail-company">${escapeHtml(job.company || "—")}</div>
    <div class="detail-sub">${escapeHtml(job.title || "Sans titre")} · ${escapeHtml(job.location || "—")} ${job.country ? "· " + escapeHtml(job.country) : ""}</div>
    <div class="detail-row"><span class="detail-label">Type de contrat</span><span class="detail-value">${escapeHtml(job.contractType || job.status || "—")}</span></div>
    <div class="detail-row"><span class="detail-label">Salaire</span><span class="detail-value">${escapeHtml(job.salary || "—")}</span></div>
    <div class="detail-row"><span class="detail-label">Description</span><span class="detail-value">${escapeHtml(job.description || "Aucune description.")}</span></div>
    <div class="detail-row"><span class="detail-label">Compétences</span><span class="detail-value">${tagsHtml || "\u2014"}</span></div>
    <div class="detail-row"><span class="detail-label">Date limite</span><span class="detail-value">${escapeHtml(job.deadline || "\u2014")}</span></div>
    <div class="detail-row"><span class="detail-label">Email de candidature</span><span class="detail-value">${escapeHtml(job.applyEmail || "\u2014")}</span></div>
    <div class="detail-row"><span class="detail-label">Compatibilité</span><span class="detail-value" id="jobCompatibilityValue">Calcul...</span></div>
    ${job.verified ? '<div class="detail-row"><span class="detail-label">Vérifié</span><span class="detail-value">✓ Oui</span></div>' : ''}
    <div class="detail-actions">
      <button class="btn-secondary download-docs-btn" data-job-id="${escapeHtml(job.id)}"><img class="btn-icon-small" src="/image/download.png" alt="Télécharger"> Télécharger les pièces</button>
      <button class="btn-primary apply-now-btn" data-job-apply="${escapeHtml(job.id)}" ${!job.applyEmail ? 'disabled' : ''}>Postuler maintenant</button>
    </div>
  `;

  jobDetailTitle.textContent = "Détails de l'offre";
  jobDetailOverlay.classList.add("active");

  const user = firebase.auth().currentUser;
  if (!user) {
    const compatEl = document.getElementById("jobCompatibilityValue");
    if (compatEl) compatEl.textContent = "\u2014";
    return;
  }

  firebase.database().ref("users/" + user.uid).once("value").then((userSnap) => {
    const userData = userSnap.val() || {};
    const skillsPromise = firebase.database().ref("users/" + user.uid + "/skills").once("value");
    const expPromise = firebase.database().ref("users/" + user.uid + "/experiences").once("value");
    const formPromise = firebase.database().ref("users/" + user.uid + "/formations").once("value");
    const certPromise = firebase.database().ref("users/" + user.uid + "/certifications").once("value");

    return Promise.all([skillsPromise, expPromise, formPromise, certPromise]).then(([skillsSnap, expSnap, formSnap, certSnap]) => {
      const enrichedUser = {
        ...userData,
        skills: skillsSnap.val() || {},
        experiences: Object.keys(expSnap.val() || {}).map(id => ({ id, ...(expSnap.val() || {})[id] })),
        formations: Object.keys(formSnap.val() || {}).map(id => ({ id, ...(formSnap.val() || {})[id] })),
        certifications: Object.keys(certSnap.val() || {}).map(id => ({ id, ...(certSnap.val() || {})[id] }))
      };
      const compatibility = calculateJobCompatibility(enrichedUser, job);
      const compatEl = document.getElementById("jobCompatibilityValue");
      if (compatEl) compatEl.textContent = compatibility + "%";
    });
  }).catch((err) => {
    console.error("[JOBS] erreur calcul compatibilité modal:", err);
    const compatEl = document.getElementById("jobCompatibilityValue");
    if (compatEl) compatEl.textContent = "—";
  });
}

function closeJobDetailModal() {
  if (jobDetailOverlay) jobDetailOverlay.classList.remove("active");
}

if (jobDetailClose) {
  jobDetailClose.addEventListener("click", closeJobDetailModal);
}

if (jobDetailOverlay) {
  jobDetailOverlay.addEventListener("click", (e) => {
    if (e.target === jobDetailOverlay) closeJobDetailModal();
  });
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-job-detail]");
  if (!btn) return;
  const jobId = btn.getAttribute("data-job-detail");
  if (!jobId) return;

  firebase.database().ref("jobs/" + jobId).once("value").then((snap) => {
    const job = snap.val();
    if (job) {
      job.id = jobId;
      openJobDetailModal(job);
    }
  }).catch((err) => {
    console.error("[JOBS] erreur chargement détail:", err);
  });
});

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".download-docs-btn");
  if (!btn) return;
  const jobId = btn.getAttribute("data-job-id");
  if (!jobId) return;

  btn.textContent = "Chargement...";
  btn.disabled = true;

  firebase.database().ref("jobs/" + jobId).once("value").then((snap) => {
    const job = snap.val() || {};
    const sourceUrl = (job.sourceUrl || "").toString().trim();
    const company = (job.company || "offre").toString().trim().replace(/[^a-z0-9_-]/gi, "_").substring(0, 50);

    if (sourceUrl) {
      const link = document.createElement("a");
      link.href = sourceUrl;
      link.download = company + ".pdf";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    if (typeof generateCV === "function") {
      generateCV();
    }

    if (typeof generateCoverLetter === "function") {
      generateCoverLetter(job);
    }

    btn.textContent = "✓ Téléchargement lancé";
    setTimeout(() => {
      btn.textContent = "📎 Télécharger les pièces";
      btn.disabled = false;
    }, 2000);
  }).catch((err) => {
    console.error("[JOBS] erreur téléchargement pièces:", err);
    alert("Impossible de lancer le téléchargement pour le moment.");
    btn.textContent = "ðŸ“Ž Télécharger les pièces";
    btn.disabled = false;
  });
});

document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-job-save]");
  if (!btn) return;
  const jobId = btn.getAttribute("data-job-save");
  if (!jobId) return;
  e.preventDefault();
  toggleFavorite(jobId);
});

document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-job-apply]");
  if (!btn) return;
  e.preventDefault();
  const jobId = btn.getAttribute("data-job-apply");
  if (!jobId) return;

  btn.textContent = "Préparation...";
  btn.disabled = true;

  firebase.database().ref("jobs/" + jobId).once("value").then((snap) => {
    const job = snap.val() || {};
    const email = (job.applyEmail || "").toString().trim();
    if (!email) {
      alert("Aucune adresse email de candidature disponible pour cette offre.");
      btn.textContent = "Postuler maintenant";
      btn.disabled = false;
      return;
    }

    const user = firebase.auth().currentUser;
    if (!user) {
      alert("Vous devez être connecté pour postuler.");
      btn.textContent = "Postuler maintenant";
      btn.disabled = false;
      return;
    }

    const fullName = (user.displayName || "Candidat").trim();
    const cvFileName = (fullName.replace(/\s+/g, "_") || "CV") + ".pdf";
    const letterFileName = (fullName.replace(/\s+/g, "_") || "Candidat") + "_Lettre_Motivation.pdf";

    btn.textContent = "Génération du CV...";
    return generateCV(true).then((cvBlob) => {
      btn.textContent = "Génération de la lettre...";
      return generateCoverLetter(job, true).then((letterBlob) => {
        btn.textContent = "Envoi en cours...";
        return Promise.all([
          blobToBase64(cvBlob),
          blobToBase64(letterBlob)
        ]).then(([cvB64, letterB64]) => {
          return sendApplicationEmailBase64(email, fullName, (job.title || "le poste"), (job.company || ""), cvB64, letterB64, cvFileName, letterFileName, (user ? user.uid : ""));
        });
      });
    });
  }).then(() => {
    const user = firebase.auth().currentUser;
    if (user) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
      const dateStr = now.toISOString();
      firebase.database().ref("users/" + user.uid + "/notifications").push({
        group: "Candidatures",
        type: "candidatures",
        unread: true,
        icon: "📄",
        iconBg: "#10b981",
        tag: "Candidature",
        tagClass: "green",
        title: "Candidature envoyée",
        desc: "Vous avez postulé à " + ((job && job.title) ? job.title : "cette offre") + (job.company ? " chez " + job.company : "") + ".",
        chips: ["Postulé", job.company || "Offre"],
        time: timeStr,
        createdAt: dateStr,
      }).catch((err) => {
        console.error("[JOBS] erreur notification:", err);
      });
    }

    btn.textContent = "✓ Candidature envoyée";
    setTimeout(() => {
      btn.textContent = "Postuler maintenant";
      btn.disabled = false;
    }, 3000);
  }).catch((err) => {
    console.error("[JOBS] erreur postuler:", err);
    btn.textContent = "Postuler maintenant";
    btn.disabled = false;
  });
});

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function sendApplicationEmailBase64(applyEmail, userName, jobTitle, company, cvBase64, coverLetterBase64, cvFileName, letterFileName, userId) {
  return fetch("/send-application-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({
      apply_email: applyEmail,
      user_name: userName,
      job_title: jobTitle,
      company: company,
      cv_file: cvBase64,
      cover_letter_file: coverLetterBase64,
      cv_file_name: cvFileName,
      cover_letter_file_name: letterFileName,
      user_id: userId || "",
    }),
  }).then((res) => {
    if (!res.ok) {
      return res.json().then((err) => { throw new Error(err.message || "Erreur serveur"); }).catch(() => { throw new Error("Erreur serveur"); });
    }
    return res.json();
  }).then((data) => {
    if (!data.success) throw new Error(data.message || "Échec de l'envoi");
  });
}

const contractFilter = document.getElementById("contractFilter");
if (contractFilter) {
  contractFilter.addEventListener("change", () => {
    currentPage = 1;
    renderRecommendedJobs();
  });
}

const countryFilterEl = document.getElementById("countryFilter");
if (countryFilterEl) {
  countryFilterEl.addEventListener("change", () => {
    currentPage = 1;
    renderRecommendedJobs();
  });
}

const companyFilterEl = document.getElementById("companyFilter");
if (companyFilterEl) {
  companyFilterEl.addEventListener("change", () => {
    currentPage = 1;
    renderRecommendedJobs();
  });
}

const allChip = document.querySelector('.chip[data-filter="all"]');
if (allChip) {
  allChip.addEventListener("click", () => {
    if (contractFilter) contractFilter.value = "";
    if (countryFilterEl) countryFilterEl.value = "";
    if (companyFilterEl) companyFilterEl.value = "";
    currentPage = 1;
    renderRecommendedJobs();

    document.querySelectorAll('.custom-select').forEach(cs => {
      const textEl = cs.querySelector('.custom-text');
      const imgEl = cs.querySelector('.custom-select-trigger img');
      const options = cs.querySelectorAll('.custom-select-option');
      const defaultOption = options.length ? options[0] : null;
      const defaultText = defaultOption ? (defaultOption.querySelector('span') ? defaultOption.querySelector('span').textContent.trim() : defaultOption.textContent.trim()) : '';
      const defaultImg = defaultOption ? defaultOption.querySelector('img') : null;

      if (textEl) textEl.textContent = defaultText;
      if (imgEl && defaultImg) {
        imgEl.src = defaultImg.src;
        imgEl.alt = defaultImg.alt || '';
      }
    });
  });
}

function renderPagination(totalItems) {
  const paginationEl = document.getElementById("jobsPagination");
  if (!paginationEl) return;

  const totalPages = Math.max(1, Math.ceil(totalItems / JOBS_PER_PAGE));
  if (totalPages <= 1) {
    paginationEl.innerHTML = "";
    return;
  }

  let html = "";
  html += `<button class="page-arrow" data-page="prev" ${currentPage === 1 ? 'disabled' : ''}>â†</button>`;
  
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      html += `<button class="page-num ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      html += `<span class="page-dots">...</span>`;
    }
  }
  
  html += `<button class="page-arrow" data-page="next" ${currentPage === totalPages ? 'disabled' : ''}>â†’</button>`;
  
  paginationEl.innerHTML = html;

  paginationEl.querySelectorAll(".page-num, .page-arrow").forEach((btn) => {
    btn.addEventListener("click", () => {
      const page = btn.getAttribute("data-page");
      if (page === "prev" && currentPage > 1) {
        currentPage--;
      } else if (page === "next" && currentPage < totalPages) {
        currentPage++;
      } else if (page !== "prev" && page !== "next") {
        currentPage = parseInt(page);
      }
      renderRecommendedJobs();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

(function initCustomSelects() {
  const customSelects = document.querySelectorAll('.custom-select');
  if (!customSelects.length) return;

  function openSelect(select) {
    customSelects.forEach(s => { if (s !== select) s.classList.remove('open'); });
    select.classList.add('open');
  }

  function closeAllSelects() {
    customSelects.forEach(s => s.classList.remove('open'));
  }

  customSelects.forEach(select => {
    const trigger = select.querySelector('.custom-select-trigger');
    const targetId = select.getAttribute('data-target');
    const hiddenSelect = document.getElementById(targetId);
    const optionsContainer = select.querySelector('.custom-select-options');

    if (!trigger || !hiddenSelect || !optionsContainer) return;

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = select.classList.contains('open');
      closeAllSelects();
      if (!isOpen) openSelect(select);
    });

    optionsContainer.addEventListener('click', (e) => {
      const optionEl = e.target.closest('.custom-select-option');
      if (!optionEl) return;

      const value = optionEl.getAttribute('data-value') || '';
      const textEl = select.querySelector('.custom-text');
      const imgEl = select.querySelector('.custom-select-trigger img');
      const optionImg = optionEl.querySelector('img');
      const optionText = optionEl.querySelector('span') ? optionEl.querySelector('span').textContent.trim() : optionEl.textContent.trim();

      hiddenSelect.value = value;
      if (textEl) textEl.textContent = optionText || hiddenSelect.options[0]?.textContent || '';
      if (imgEl && optionImg) {
        imgEl.src = optionImg.src;
        imgEl.alt = optionImg.alt || '';
      }

      closeAllSelects();
      const event = new Event('change', { bubbles: true });
      hiddenSelect.dispatchEvent(event);
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.custom-select')) {
      closeAllSelects();
    }
  });
})();






