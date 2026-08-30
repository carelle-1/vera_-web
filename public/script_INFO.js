/* Affiche les informations/annonces créées dans l'admin sous forme de modal fixe
   dans les interfaces chercheur d'emploi. Les informations actives (dateDebut <= aujourd'hui <= dateFin)
   sont lues depuis Firebase (ref "informations"). L'utilisateur peut fermer le modal. */
(function () {
  "use strict";

  function escapeHtml(text) {
    if (text === null || text === undefined) return "";
    return String(text).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // Informations fermées pendant la session (persistées via sessionStorage pour ne pas réapparaître
  // lors de la navigation entre onglets ; réinitialisé quand l'onglet/fenêtre est fermé(e)).
  var STORAGE_KEY = "vera_info_modal_dismissed";

  function loadDismissed() {
    try {
      return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "{}") || {};
    } catch (e) {
      return {};
    }
  }

  var dismissedKeys = loadDismissed();

  function markDismissed(keys) {
    keys.forEach(function (k) {
      dismissedKeys[k] = true;
    });
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(dismissedKeys));
    } catch (e) {}
  }

  function render(items) {
    var overlay = document.getElementById("infoModalOverlay");
    var body = document.getElementById("infoModalBody");
    if (!overlay || !body) return;
    if (!items.length) {
      overlay.classList.remove("show");
      document.body.classList.remove("info-modal-open");
      return;
    }

    body.innerHTML = items.map(function (it) {
      var img = it.imageURL
        ? '<img class="info-item-img" src="' + escapeHtml(it.imageURL) + '" alt="">'
        : "";
      var period = (it.dateDebut || it.dateFin)
        ? '<div class="info-item-period">Période : ' + escapeHtml(it.dateDebut || "—") + ' <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 7l5 5-5 5"/></svg> ' + escapeHtml(it.dateFin || "—") + "</div>"
        : "";
      return '<div class="info-item" data-info-key="' + escapeHtml(it._key) + '">' +
        img +
        '<div class="info-item-content">' +
          '<h3 class="info-item-title">' + escapeHtml(it.titre || "Information") + "</h3>" +
          '<p class="info-item-desc">' + escapeHtml(it.description || "") + "</p>" +
          period +
        "</div></div>";
    }).join("");

    overlay.classList.add("show");
    document.body.classList.add("info-modal-open");
  }

  function loadInformations() {
    if (typeof firebase === "undefined" || !firebase.database) return;
    firebase.database().ref("informations").once("value").then(function (snap) {
      var list = [];
      snap.forEach(function (c) {
        var d = c.val() || {};
        d._key = c.key;
        list.push(d);
      });

      var now = new Date();
      now.setHours(0, 0, 0, 0);

      var active = list.filter(function (it) {
        var start = it.dateDebut ? new Date(it.dateDebut + "T00:00:00") : null;
        var end = it.dateFin ? new Date(it.dateFin + "T23:59:59") : null;
        if (start && now < start) return false;
        if (end && now > end) return false;
        return true;
      });

      var visible = active.filter(function (it) {
        return !dismissedKeys[it._key];
      });

      render(visible);
    }).catch(function (err) {
      console.error("[INFO-MODAL] lecture échouée:", err);
    });
  }

  function closeModal() {
    var overlay = document.getElementById("infoModalOverlay");
    if (!overlay) return;
    overlay.classList.remove("show");
    document.body.classList.remove("info-modal-open");
    var keys = Array.prototype.slice
      .call(document.querySelectorAll(".info-item[data-info-key]"))
      .map(function (el) { return el.getAttribute("data-info-key"); });
    if (keys.length) markDismissed(keys);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var closeBtn = document.getElementById("infoModalCloseBtn");
    var okBtn = document.getElementById("infoModalOkBtn");
    var overlay = document.getElementById("infoModalOverlay");

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (okBtn) okBtn.addEventListener("click", closeModal);
    if (overlay) {
      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) closeModal();
      });
    }

    loadInformations();
  });
})();
