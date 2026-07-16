firebase.auth().onAuthStateChanged((user) => {
  if (!user) return;
  firebase.database().ref("users/" + user.uid).once("value").then((snapshot) => {
    const data = snapshot.val() || {};
    const firstName = data.firstName
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
