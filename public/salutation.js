firebase.auth().onAuthStateChanged((user) => {
  if (!user) return;

  const ref = firebase.database().ref("users/" + user.uid);

  ref.on("value", (snapshot) => {
    const data = snapshot.val() || {};
    const firstName = data.firstName || data.fullName
      || (user.displayName ? user.displayName.split(" ")[0] : "")
      || (user.email ? user.email.split("@")[0] : "");
    const h = new Date().getHours();
    const greeting = h < 12 ? "Bonjour" : (h < 18 ? "Bon après-midi" : "Bonsoir");
    const el = document.getElementById("userGreeting");
    if (el && firstName) {
      el.textContent = greeting + ", " + firstName;
    }
  });
});
