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
  });
});

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
