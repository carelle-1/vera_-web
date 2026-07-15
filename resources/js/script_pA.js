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
    if (key !== "profil") {
      // Pour cette démo, seul le panneau "Profil et compte" a un contenu complet.
      // Les autres affichent une info visuelle temporaire.
      showToast(`Section "${panelLabels[key]}" — contenu à venir.`);
    }
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
document.getElementById("editProfileBtn").addEventListener("click", () => {
  showToast("Ouverture de l'édition du profil...");
});

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

// ============== SELECTS PREFERENCES ==============
document.querySelectorAll(".pref-select").forEach(select => {
  select.addEventListener("change", () => {
    showToast(`Préférence mise à jour : ${select.value}`);
  });
});
