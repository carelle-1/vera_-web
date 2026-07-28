// ============== HELPERS ==============
async function getFirebaseIdToken() {
  try {
    const user = firebase.auth().currentUser;
    if (!user) return null;
    return await user.getIdToken();
  } catch (e) {
    return null;
  }
}

function escapeHtml(str) {
  return (str || "").toString()
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// ============== DONNÉES ==============
let notifications = [];
let currentFilter = "all";

// ============== CHARGEMENT DYNAMIQUE ==============
async function loadNotificationsData() {
  try {
    const token = await getFirebaseIdToken();
    const headers = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Cache-Control": "no-cache"
    };

    if (token) {
      headers["Authorization"] = "Bearer " + token;
    }

    const response = await fetch("/notifications/data?t=" + Date.now(), {
      method: "GET",
      headers
    });

    const rawText = await response.text();
    let data = {};
    try { data = JSON.parse(rawText); } catch (e) { data = {}; }

    if (data.success) {
      notifications = data.notifications || [];
      updateCounts(data.counts || {});
      updateSummary(data.summary || {});
    } else {
      notifications = [];
    }
  } catch (e) {
    console.error("[NOTIFICATIONS] load error", e);
    notifications = [];
  }

  renderNotifications();
}

function updateCounts(counts) {
  const map = {
    all: "tabCountAll",
    unread: "tabCountUnread",
    opportunites: "tabCountOpportunites",
    candidatures: "tabCountCandidatures",
    formations: "tabCountFormations",
    systeme: "tabCountSysteme"
  };

  Object.entries(map).forEach(([key, id]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = (counts[key] || 0).toString();
  });
}

function updateSummary(summary) {
  const unreadEl = document.getElementById("summaryUnread");
  const weekEl = document.getElementById("summaryWeek");
  const monthEl = document.getElementById("summaryMonth");
  const totalEl = document.getElementById("summaryTotal");

  if (unreadEl) unreadEl.textContent = (summary.unread || 0).toString();
  if (weekEl) weekEl.textContent = (summary.week || 0).toString();
  if (monthEl) monthEl.textContent = (summary.month || 0).toString();
  if (totalEl) totalEl.textContent = (summary.total || 0).toString();
}

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
      <div class="date-group-label">${escapeHtml(groupName)}</div>
      ${items.map(n => `
        <div class="notif-item ${n.unread ? 'unread' : ''}" data-id="${n.id}">
          <input type="checkbox" class="notif-checkbox">
          <div class="notif-icon" style="background:${escapeHtml(n.iconBg)}">${escapeHtml(n.icon)}</div>
          <div class="notif-body">
            <span class="notif-tag ${escapeHtml(n.tagClass)}">${escapeHtml(n.tag)}</span>
            <div class="notif-title">${escapeHtml(n.title)}</div>
            <div class="notif-desc">${escapeHtml(n.desc)}</div>
            ${n.chips && n.chips.length ? `<div class="notif-chips">${n.chips.map(c => `<span>${escapeHtml(c)}</span>`).join("")}</div>` : ""}
          </div>
          <div class="notif-right">
            <span class="notif-time">${escapeHtml(n.time)}</span>
            ${n.unread ? `<span class="notif-dot"></span>` : ""}
          </div>
        </div>
      `).join("")}
    `;
  }).join("");

  container.querySelectorAll(".notif-item").forEach(item => {
    item.addEventListener("click", (e) => {
      if (e.target.classList.contains("notif-checkbox")) return;
      const id = item.dataset.id;
      const notif = notifications.find(n => n.id === id);
      if (notif) {
        notif.unread = false;
        renderNotifications();
        updateCountsFromData();
      }
    });
  });
}

function updateCountsFromData() {
  const counts = {
    all: notifications.length,
    unread: notifications.filter(n => n.unread).length,
    opportunites: notifications.filter(n => n.type === "opportunites").length,
    candidatures: notifications.filter(n => n.type === "candidatures").length,
    formations: notifications.filter(n => n.type === "formations").length,
    systeme: notifications.filter(n => n.type === "systeme").length,
  };
  updateCounts(counts);
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
  updateCountsFromData();
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
loadNotificationsData();
