// ============== AVATAR PARTAGÉ (HEADER + TOUTES LES PAGES) ==============
// Met à jour l'avatar du header (#userAvatar) et l'initiale de fallback (#userInitial)
// en temps réel à partir de la Realtime Database (users/{uid}/photoURL).

function applyHeaderAvatar(photoURL, fallbackLetter) {
  const img = document.getElementById("userAvatar");
  const initial = document.getElementById("userInitial");
  if (!img) return;

  if (photoURL) {
    img.onerror = () => {
      img.style.display = "none";
      if (initial) {
        initial.textContent = fallbackLetter || "?";
        initial.style.display = "flex";
      }
    };
    img.src = photoURL;
    img.style.display = "block";
    if (initial) initial.style.display = "none";
  } else {
    img.style.display = "none";
    if (initial) {
      initial.textContent = fallbackLetter || "?";
      initial.style.display = "flex";
    }
  }
}

function getFallbackLetter(user, data) {
  const firstName = (data && data.firstName)
    || (user.displayName ? user.displayName.split(" ")[0] : "")
    || (user.email ? user.email.split("@")[0] : "");
  return (firstName.trim().charAt(0) || "?").toUpperCase();
}

firebase.auth().onAuthStateChanged((user) => {
  if (!user) return;

  const ref = firebase.database().ref("users/" + user.uid);

  // Abonnement temps réel : se met à jour dès que la photo change (même depuis une autre page)
  ref.on("value", (snapshot) => {
    const data = snapshot.val() || {};
    if (data.photoURL) {
      applyHeaderAvatar(data.photoURL, getFallbackLetter(user, data));
    } else if (user.photoURL) {
      applyHeaderAvatar(user.photoURL, getFallbackLetter(user, data));
    } else {
      applyHeaderAvatar(null, getFallbackLetter(user, data));
    }
  });

  // Mise à jour immédiate quand la photo est changée sur la page profil (même onglet)
  window.addEventListener("profile-avatar-updated", (e) => {
    applyHeaderAvatar(e.detail, getFallbackLetter(user, {}));
  });
});
