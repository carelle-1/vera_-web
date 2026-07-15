// ============== DONNÉES ==============
const notifications = [
  {
    id: 1, group: "Aujourd'hui", type: "opportunites", unread: true,
    icon: "N", iconBg: "#000000", tag: "Nouvelle opportunité", tagClass: "green",
    title: "Nouvelle opportunité : Product Designer UI/UX",
    desc: "Notion Labs a publié une offre qui correspond à votre profil.",
    chips: ["UI/UX", "Figma", "Remote"],
    time: "Il y a 15 min"
  },
  {
    id: 2, group: "Aujourd'hui", type: "candidatures", unread: true,
    icon: "💬", iconBg: "#8b5cf6", tag: "Message recruteur", tagClass: "blue",
    title: "Message de Sarah de Notion Labs",
    desc: "Bonjour Junior, votre profil nous a beaucoup intéressés...",
    time: "Il y a 1 heure"
  },
  {
    id: 3, group: "Aujourd'hui", type: "candidatures", unread: true,
    icon: "✓", iconBg: "#22c55e", tag: "Candidature mise à jour", tagClass: "orange",
    title: "Votre candidature a été consultée",
    desc: "Votre candidature pour Développeur Full Stack a été consultée par BMW Group.",
    time: "Il y a 2 heures"
  },
  {
    id: 4, group: "Hier", type: "formations", unread: true,
    icon: "🎓", iconBg: "#f59e0b", tag: "Formation recommandée", tagClass: "orange",
    title: "Nouvelle recommandation de formation",
    desc: "Améliorez vos compétences avec \"Design System avec Figma\".",
    time: "Hier à 14:30"
  },
  {
    id: 5, group: "Hier", type: "opportunites", unread: true,
    icon: "⭐", iconBg: "#0ea5e9", tag: "Alerte emploi", tagClass: "blue",
    title: "5 nouvelles opportunités correspondent à votre profil",
    desc: "Consultez les dernières offres sélectionnées pour vous.",
    time: "Hier à 09:15"
  },
  {
    id: 6, group: "21 Mai 2024", type: "opportunites", unread: true,
    icon: "🏆", iconBg: "#eab308", tag: "Félicitations", tagClass: "pink",
    title: "Vous faites partie du top 10%",
    desc: "Votre profil est très attractif ! Continuez comme ça.",
    time: "21 Mai à 16:45"
  },
  {
    id: 7, group: "21 Mai 2024", type: "systeme", unread: true,
    icon: "⚙", iconBg: "#94a3b8", tag: "Mise à jour système", tagClass: "gray",
    title: "VERA a été mis à jour",
    desc: "Découvrez les nouvelles fonctionnalités de la plateforme.",
    time: "21 Mai à 10:20"
  }
];

let currentFilter = "all";

// ============== RENDU ==============
function renderNotifications() {
  const container = document.getElementById("notifGroups");

  const filtered = notifications.filter(n => {
    if (currentFilter === "all") return true;
    if (currentFilter === "unread") return n.unread;
    return n.type === currentFilter;
  });

  const groups = [...new Set(filtered.map(n => n.group))];

  if (filtered.length === 0) {
    container.innerHTML = `<div class="empty-state">Aucune notification dans cette catégorie.</div>`;
    return;
  }

  container.innerHTML = groups.map(groupName => {
    const items = filtered.filter(n => n.group === groupName);
    return `
      <div class="date-group-label">${groupName}</div>
      ${items.map(n => `
        <div class="notif-item ${n.unread ? 'unread' : ''}" data-id="${n.id}">
          <input type="checkbox" class="notif-checkbox">
          <div class="notif-icon" style="background:${n.iconBg}">${n.icon}</div>
          <div class="notif-body">
            <span class="notif-tag ${n.tagClass}">${n.tag}</span>
            <div class="notif-title">${n.title}</div>
            <div class="notif-desc">${n.desc}</div>
            ${n.chips ? `<div class="notif-chips">${n.chips.map(c => `<span>${c}</span>`).join("")}</div>` : ""}
          </div>
          <div class="notif-right">
            <span class="notif-time">${n.time}</span>
            ${n.unread ? `<span class="notif-dot"></span>` : ""}
          </div>
        </div>
      `).join("")}
    `;
  }).join("");

  // Clic sur une notification = marquer comme lue
  container.querySelectorAll(".notif-item").forEach(item => {
    item.addEventListener("click", (e) => {
      if (e.target.classList.contains("notif-checkbox")) return;
      const id = parseInt(item.dataset.id);
      const notif = notifications.find(n => n.id === id);
      notif.unread = false;
      renderNotifications();
    });
  });
}

// ============== TABS / FILTRES ==============
document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    currentFilter = tab.dataset.filter;
    renderNotifications();
  });
});

// ============== TOUT SELECTIONNER ==============
document.getElementById("selectAll").addEventListener("change", (e) => {
  document.querySelectorAll(".notif-checkbox").forEach(cb => cb.checked = e.target.checked);
});

// ============== MARQUER TOUT COMME LU ==============
document.getElementById("markAllRead").addEventListener("click", () => {
  notifications.forEach(n => n.unread = false);
  renderNotifications();
});

// ============== PAGINATION ==============
document.querySelectorAll(".page-num").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".page-num").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// ============== DND TOGGLE (visuel uniquement) ==============
document.getElementById("dndToggle").addEventListener("change", function () {
  document.querySelectorAll(".dnd-time-field select").forEach(sel => {
    sel.disabled = !this.checked;
    sel.style.opacity = this.checked ? "1" : "0.5";
  });
});

// ============== INIT ==============
renderNotifications();
