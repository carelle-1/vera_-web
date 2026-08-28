// ============== GARDE DE SESSION (ADMIN) ==============
let adminAuthFirstCall = true;

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

function updateNavCounts() {
  const countElements = document.querySelectorAll(".nav-count[data-count-path]");
  if (countElements.length === 0) return;

  const db = firebase.database();
  const promises = Array.from(countElements).map(el => {
    const path = el.getAttribute("data-count-path");
    if (!path) return Promise.resolve(null);
    
    return db.ref(path).once("value").then((snapshot) => {
      const data = snapshot.val();
      let count = 0;
      
      if (path === "jobs") {
        count = data ? Object.keys(data).length : 0;
      } else if (path === "users") {
        count = data ? Object.keys(data).length : 0;
      } else if (path === "companies") {
        count = data ? Object.keys(data).length : 0;
      } else if (path === "sites") {
        count = data ? Object.keys(data).length : 0;
      } else if (path === "moderation") {
        if (Array.isArray(data)) {
          count = data.filter(item => item && item.status === 'pending').length;
        } else if (typeof data === 'object' && data !== null) {
          count = Object.values(data).filter(item => item && item.status === 'pending').length;
        }
      }
      
      return { el, count };
    }).catch(() => {
      return { el, count: 0 };
    });
  });

  Promise.all(promises).then((results) => {
    results.forEach(({ el, count }) => {
      if (el && count !== null) {
        el.textContent = count.toLocaleString('fr-FR');
      }
    });
  });
}

// ============== PAGINATION OFFRES ==============
let jobCurrentPage = 1;
const JOBS_PER_PAGE = 10;
let allFilteredJobs = [];

firebase.auth().onAuthStateChanged((user) => {
  if (window.__creatingAdmin) return; // ne pas rediriger pendant la création d'un admin

  console.log("[ADMIN] onAuthStateChanged firstCall=", adminAuthFirstCall, "user=", user ? user.uid : "null");

  if (adminAuthFirstCall) {
    adminAuthFirstCall = false;
    if (!user) {
      console.log("[ADMIN] premier appel sans user, j'attends la restauration Firebase...");
      return;
    }
    console.log("[ADMIN] premier appel avec user, je continue");
  } else if (!user) {
    console.log("[ADMIN] user null hors premier appel, redirection vers /");
    window.location.replace("/");
    return;
  }

  firebase.database().ref("users/" + user.uid).once("value").then((snapshot) => {
    const data = snapshot.val() || {};
    const role = (data.role || "").toString().toLowerCase();
    console.log("[ADMIN] rôle lu dans Firebase:", role, "données:", data);

    if (role !== "admin") {
      console.log("[ADMIN] rôle non admin, redirection vers /tableau-de-bord");
      window.location.replace("/tableau-de-bord");
      return;
    }

    data.uid = user.uid;
    console.log("[ADMIN] accès admin autorisé, initialisation du panel");
    initAdminPanel(data);
  }).catch((error) => {
    console.log("[ADMIN] erreur lors de la lecture Firebase:", error);
    window.location.replace("/tableau-de-bord");
  });
});

// ============== PRIVILÈGES ADMIN ==============
let currentAdminData = null;

const ADMIN_SECTIONS = [
  ["dashboard", "Tableau de bord"],
  ["utilisateurs", "Utilisateurs"],
  ["entreprises", "Entreprises"],
  ["offres", "Offres d'emploi"],
  ["sites", "Sites"],
  ["candidatures", "Informations"],
  ["formations", "Administration (gestion admins)"],
  ["moderation", "Modération"],
  ["paiements", "Paiements"],
  ["rapports", "Rapports"],
  ["parametres", "Paramètres"]
];

function canAccessPanel(panel) {
  const d = currentAdminData;
  if (!d) return true;
  if (d.super === true) return true;
  if (!d.privileges || typeof d.privileges !== "object") return true; // compatibilité ascendante : accès total
  if (panel === "dashboard") return true; // le tableau de bord reste toujours accessible
  return !!d.privileges[panel];
}

function applyAdminPrivilegesToNav() {
  document.querySelectorAll(".nav-item").forEach(item => {
    const panel = item.getAttribute("data-panel");
    if (!panel) return;
    const lockEl = item.querySelector(".nav-lock");
    if (canAccessPanel(panel)) {
      item.classList.remove("locked");
      if (lockEl) lockEl.remove();
    } else {
      item.classList.add("locked");
      if (!lockEl) {
        const span = document.createElement("span");
        span.className = "nav-lock";
        span.textContent = "🔒";
        item.appendChild(span);
      }
    }
  });
}

async function initAdminPanel(data) {
  currentAdminData = data || {};
  renderAdminKPIs();
  renderDashboardUserTable();
  renderAllAdminUsers();
  await renderAdminCharts();
  updateNavCounts();
  buildPrivilegesGrid();
  applyAdminPrivilegesToNav();
}

async function renderAdminKPIs() {
  const grid = document.getElementById("kpiGrid");
  if (!grid) return;

  grid.innerHTML = `
    <div class="kpi-card">
      <div class="kpi-icon blue"><img class="kpi-icon-img" src="/image/users.png" alt="Utilisateurs"></div>
      <div><div class="kpi-value">…</div><div class="kpi-label">Chargement…</div></div>
    </div>
    <div class="kpi-card">
      <div class="kpi-icon mint"><img class="kpi-icon-img" src="/image/3916670.png" alt="Offres publiées"></div>
      <div><div class="kpi-value">…</div><div class="kpi-label">Chargement…</div></div>
    </div>
    <div class="kpi-card">
      <div class="kpi-icon purple"><img class="kpi-icon-img" src="/image/3917505.png" alt="Candidatures"></div>
      <div><div class="kpi-value">…</div><div class="kpi-label">Chargement…</div></div>
    </div>
    <div class="kpi-card">
      <div class="kpi-icon orange"><img class="kpi-icon-img" src="/image/mission.png" alt="Recrutements"></div>
      <div><div class="kpi-value">…</div><div class="kpi-label">Chargement…</div></div>
    </div>
    <div class="kpi-card">
      <div class="kpi-icon green"><img class="kpi-icon-img" src="/image/7928164.png" alt="Revenus"></div>
      <div><div class="kpi-value">…</div><div class="kpi-label">Chargement…</div></div>
    </div>
  `;

  try {
    const [usersSnap, jobsSnap, candsSnap] = await Promise.all([
      firebase.database().ref("users").once("value"),
      firebase.database().ref("jobs").once("value"),
      firebase.database().ref("candidatures").once("value")
    ]);

    const users = usersSnap.val() || {};
    const jobs = jobsSnap.val() || {};
    const cands = candsSnap.val() || {};

    const now = Date.now();
    const oneMonthMs = 30 * 24 * 60 * 60 * 1000;
    const monthStart = now - oneMonthMs;
    const prevMonthStart = monthStart - oneMonthMs;

    const userCount = Object.keys(users).length;
    const jobCount = Object.keys(jobs).length;
    const candCount = Object.keys(cands).length;
    const acceptedCount = Object.values(cands).filter(c => (c.status || "").toLowerCase() === "accepted").length;

    const usersThisMonth = Object.values(users).filter(u => (u.createdAt || 0) >= monthStart).length;
    const jobsThisMonth = Object.values(jobs).filter(j => (j.createdAt || 0) >= monthStart).length;
    const candsThisMonth = Object.values(cands).filter(c => (c.createdAt || 0) >= monthStart).length;
    const acceptedThisMonth = Object.values(cands).filter(c => (c.status || "").toLowerCase() === "accepted" && (c.createdAt || 0) >= monthStart).length;

    const usersPrevMonth = Object.values(users).filter(u => {
      const t = u.createdAt || 0;
      return t >= prevMonthStart && t < monthStart;
    }).length;
    const jobsPrevMonth = Object.values(jobs).filter(j => {
      const t = j.createdAt || 0;
      return t >= prevMonthStart && t < monthStart;
    }).length;
    const candsPrevMonth = Object.values(cands).filter(c => {
      const t = c.createdAt || 0;
      return t >= prevMonthStart && t < monthStart;
    }).length;
    const acceptedPrevMonth = Object.values(cands).filter(c => {
      const t = c.createdAt || 0;
      return (c.status || "").toLowerCase() === "accepted" && t >= prevMonthStart && t < monthStart;
    }).length;

    function growth(current, previous) {
      if (previous <= 0) return current > 0 ? "+100% ce mois" : "N/A";
      const pct = ((current - previous) / previous) * 100;
      return (pct >= 0 ? "+" : "") + pct.toFixed(0) + "% ce mois";
    }

    const kpis = [
      { label: "Utilisateurs", value: userCount.toLocaleString('fr-FR'), sub: growth(usersThisMonth, usersPrevMonth), icon: "/image/users.png", color: "blue" },
      { label: "Offres publiées", value: jobCount.toLocaleString('fr-FR'), sub: growth(jobsThisMonth, jobsPrevMonth), icon: "/image/3916670.png", color: "mint" },
      { label: "Candidatures", value: candCount.toLocaleString('fr-FR'), sub: growth(candsThisMonth, candsPrevMonth), icon: "/image/3917505.png", color: "purple" },
      { label: "Recrutements", value: acceptedCount.toLocaleString('fr-FR'), sub: growth(acceptedThisMonth, acceptedPrevMonth), icon: "/image/mission.png", color: "orange" },
      { label: "Revenus", value: "0 €", sub: "Aucune donnée", icon: "/image/7928164.png", color: "green" }
    ];

    grid.innerHTML = kpis.map(kpi => `
      <div class="kpi-card">
        <div class="kpi-icon ${kpi.color}"><img class="kpi-icon-img" src="${kpi.icon}" alt="${kpi.label}"></div>
        <div>
          <div class="kpi-value">${kpi.value}</div>
          <div class="kpi-label">${kpi.label}</div>
          <div class="kpi-sub">${kpi.sub}</div>
        </div>
      </div>
    `).join("");
  } catch (err) {
    console.error("[ADMIN] erreur chargement KPIs:", err);
    grid.innerHTML = `
      <div class="kpi-card">
        <div class="kpi-icon blue"><img class="kpi-icon-img" src="/image/users.png" alt="Utilisateurs"></div>
        <div><div class="kpi-value">—</div><div class="kpi-label">Utilisateurs</div><div class="kpi-sub">Erreur</div></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon mint"><img class="kpi-icon-img" src="/image/3916670.png" alt="Offres publiées"></div>
        <div><div class="kpi-value">—</div><div class="kpi-label">Offres publiées</div><div class="kpi-sub">Erreur</div></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon purple"><img class="kpi-icon-img" src="/image/3917505.png" alt="Candidatures"></div>
        <div><div class="kpi-value">—</div><div class="kpi-label">Candidatures</div><div class="kpi-sub">Erreur</div></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon orange"><img class="kpi-icon-img" src="/image/mission.png" alt="Recrutements"></div>
        <div><div class="kpi-value">—</div><div class="kpi-label">Recrutements</div><div class="kpi-sub">Erreur</div></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon green"><img class="kpi-icon-img" src="/image/7928164.png" alt="Revenus"></div>
        <div><div class="kpi-value">—</div><div class="kpi-label">Revenus</div><div class="kpi-sub">Erreur</div></div>
      </div>
    `;
  }
}

function renderDashboardUserTable() {
  const tbody = document.getElementById("userTableBody");
  const countEl = document.getElementById("tableCount");
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:24px;color:#6b7280;">Chargement des utilisateurs...</td></tr>`;

  firebase.database().ref("users").once("value").then((snapshot) => {
    const data = snapshot.val() || {};
    const users = Object.keys(data)
      .map((id) => ({ id, ...data[id] }))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      .slice(0, 6);

    const statusMap = {
      actif: '<span class="status-badge actif">Actif</span>',
      attente: '<span class="status-badge attente">En attente</span>',
      suspendu: '<span class="status-badge suspendu">Suspendu</span>'
    };

    if (users.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:24px;color:#6b7280;">Aucun utilisateur trouvé.</td></tr>`;
      if (countEl) countEl.textContent = "0 résultat";
      return;
    }

    tbody.innerHTML = users.map((user) => {
      const name = user.name || user.displayName || "Sans nom";
      const email = user.email || "—";
      const avatar = user.avatar || user.photoURL || `https://i.pravatar.cc/64?u=${encodeURIComponent(user.id || name)}`;
      const role = getAdminUserRoleLabel(user.role);
      const date = user.createdAt ? new Date(user.createdAt).toLocaleDateString("fr-FR") : "—";
      const status = user.status || "actif";

      return `
        <tr>
          <td>
            <div class="user-cell">
              <img src="${escapeHtml(avatar)}" alt="${escapeHtml(name)}">
              <div>
                <div class="user-cell-name">${escapeHtml(name)}</div>
                <div class="user-cell-email">${escapeHtml(email)}</div>
              </div>
            </div>
          </td>
          <td>${escapeHtml(role)}</td>
          <td>${escapeHtml(date)}</td>
          <td>${statusMap[status] ? statusMap[status] : escapeHtml(status)}</td>
          <td>
            <div class="row-menu">
              <button type="button" class="row-menu-btn" data-id="${escapeHtml(user.id)}">⋯</button>
              <div class="row-dropdown" id="dropdown-${escapeHtml(user.id)}">
                <button data-action="view" data-id="${escapeHtml(user.id)}">Voir le profil</button>
                <button data-action="toggle" data-id="${escapeHtml(user.id)}">${status === "suspendu" ? "Réactiver" : "Suspendre"}</button>
                <button data-action="delete" data-id="${escapeHtml(user.id)}" class="danger">Supprimer</button>
              </div>
            </div>
          </td>
        </tr>
      `;
    }).join("");

    if (countEl) countEl.textContent = `Affichage de ${users.length} sur ${Object.keys(data).length} utilisateurs`;
  }).catch((err) => {
    console.error("[ADMIN] Erreur chargement du tableau utilisateur:", err);
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:24px;color:#ef4444;">Erreur de chargement: ${err.message || err.code}</td></tr>`;
  });
}

function closeAllRowDropdowns() {
  document.querySelectorAll(".row-dropdown").forEach((item) => {
    item.classList.remove("open");
    item.style.display = "none";
    item.style.position = "";
    item.style.top = "";
    item.style.left = "";
    item.style.right = "";
    item.style.zIndex = "";
    item.style.minWidth = "";
    item.style.width = "";
    item.style.boxSizing = "";
  });
}

function attachRowMenuHandlers(container, users) {
  if (!container) return;

  container.onclick = (event) => {
    const menuBtn = event.target.closest(".row-menu-btn");
    if (menuBtn) {
      event.preventDefault();
      event.stopPropagation();
      let dropdown = document.getElementById(`dropdown-${menuBtn.dataset.id}`);
      if (!dropdown && menuBtn.parentElement && menuBtn.parentElement.classList.contains("row-menu")) {
        dropdown = menuBtn.parentElement.querySelector(".row-dropdown");
      }
      document.querySelectorAll(".row-dropdown").forEach((d) => {
        if (d !== dropdown) {
          d.classList.remove("open");
          d.style.display = "none";
          d.style.position = "";
          d.style.top = "";
          d.style.left = "";
          d.style.right = "";
          d.style.zIndex = "";
        }
      });
      if (dropdown) {
        dropdown.classList.toggle("open");
        if (dropdown.classList.contains("open")) {
          dropdown.style.display = "block";
          const rect = menuBtn.getBoundingClientRect();
          dropdown.style.position = "fixed";
          dropdown.style.top = (rect.bottom + window.scrollY) + "px";
          dropdown.style.left = (rect.left + window.scrollX) + "px";
          dropdown.style.right = "auto";
          dropdown.style.zIndex = "99999";
        } else {
          dropdown.style.display = "none";
          dropdown.style.position = "";
          dropdown.style.top = "";
          dropdown.style.left = "";
          dropdown.style.right = "";
          dropdown.style.zIndex = "";
        }
      }
      return;
    }

    const actionBtn = event.target.closest("[data-action]");
    if (actionBtn) {
      event.preventDefault();
      event.stopPropagation();
      const userId = actionBtn.dataset.id;
      const action = actionBtn.dataset.action;
      const userRef = firebase.database().ref("users/" + userId);
      const user = users.find((item) => item.id === userId);

      if (action === "view") {
        openAdminUserProfile(userId);
      } else if (action === "toggle") {
        userRef.once("value").then((snap) => {
          const currentUser = snap.val() || {};
          const current = currentUser.status || "actif";
          const next = current === "suspendu" ? "actif" : "suspendu";
          userRef.update({ status: next }).then(() => {
            renderDashboardUserTable();
            renderAllAdminUsers();
          });
        });
      } else if (action === "delete") {
        if (!confirm(user ? `Supprimer ${user.name || "cet utilisateur"} ? Cette action est irréversible.` : "Supprimer cet utilisateur ? Cette action est irréversible.")) return;
        userRef.remove().then(() => {
          renderDashboardUserTable();
          renderAllAdminUsers();
        }).catch(() => alert("Échec de la suppression"));
      }

      closeAllRowDropdowns();
      return;
    }

    if (!event.target.closest(".row-menu")) {
      closeAllRowDropdowns();
    }
  };
}

function renderAdminUsers() {
  const tbody = document.getElementById("adminUsersTableBody");
  const countEl = document.getElementById("adminUserTableCount");
  console.log("[ADMIN] renderAdminUsers tbody:", tbody ? "trouvé" : "INTROUVABLE", "countEl:", countEl ? "trouvé" : "INTROUVABLE");
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:30px;color:#6b7280;">Chargement des utilisateurs...</td></tr>`;

  firebase.database().ref("users").once("value").then((snapshot) => {
    const data = snapshot.val() || {};
    const allUsers = Object.keys(data).map((id) => ({ id, ...data[id] }));
    
    const users = allUsers.filter((u) => (u.role || "").toString().toLowerCase() === "chercheur_emploi");
    console.log("[ADMIN] renderAdminUsers users.length:", users.length);

    const statusMap = {
      actif: '<span class="status-badge success">Actif</span>',
      attente: '<span class="status-badge warning">En attente</span>',
      suspendu: '<span class="status-badge danger">Suspendu</span>'
    };

    if (users.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:30px;color:#6b7280;">Aucun chercheur d'emploi trouvé.</td></tr>`;
      if (countEl) countEl.textContent = "Affichage de 0 chercheur d'emploi";
      return;
    }

    tbody.innerHTML = users.map((user) => {
      const name = user.name || user.displayName || "Sans nom";
      const email = user.email || "—";
      const avatar = user.avatar || user.photoURL || `https://i.pravatar.cc/64?u=${encodeURIComponent(user.id || name)}`;
      const role = user.role === "chercheur_emploi" ? "Chercheur d'emploi" : ((user.role || "candidat").charAt(0).toUpperCase() + (user.role || "candidat").slice(1));
      const date = user.createdAt ? new Date(user.createdAt).toLocaleDateString("fr-FR") : "—";
      const status = user.status || "actif";

      return `
        <tr>
          <td>
            <div class="user-cell">
              <img src="${escapeHtml(avatar)}" alt="${escapeHtml(name)}">
              <div>
                <div class="user-cell-name">${escapeHtml(name)}</div>
                <div class="user-cell-email">${escapeHtml(email)}</div>
              </div>
            </div>
          </td>
          <td>${escapeHtml(role)}</td>
          <td>${escapeHtml(date)}</td>
          <td>${statusMap[status] ? statusMap[status] : escapeHtml(status)}</td>
          <td>
            <div class="row-menu">
              <button type="button" class="row-menu-btn" data-id="${escapeHtml(user.id)}">⋯</button>
              <div class="row-dropdown" id="dropdown-${escapeHtml(user.id)}">
                <button data-action="view" data-id="${escapeHtml(user.id)}">Voir le profil</button>
                <button data-action="toggle" data-id="${escapeHtml(user.id)}">${status === "suspendu" ? "Réactiver" : "Suspendre"}</button>
                <button data-action="delete" data-id="${escapeHtml(user.id)}" class="danger">Supprimer</button>
              </div>
            </div>
          </td>
        </tr>
      `;
    }).join("");

    console.log("[ADMIN] renderAdminUsers HTML injecté, rows:", tbody.querySelectorAll("tr").length);

    if (countEl) countEl.textContent = `Affichage de ${users.length} chercheur${users.length > 1 ? "s" : ""} d'emploi`;
  }).catch((err) => {
    console.error("[ADMIN] Erreur chargement utilisateurs:", err);
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:30px;color:#ef4444;">Erreur de chargement des utilisateurs: ${err.message || err.code}</td></tr>`;
  });
}

function getAdminUserRoleLabel(role) {
  const rawRole = (role || "candidat").toString();
  const labels = {
    chercheur_emploi: "Chercheur d'emploi",
    recruteur: "Recruteur",
    admin: "Admin",
    candidat: "Candidat"
  };
  return labels[rawRole.toLowerCase()] || (rawRole.charAt(0).toUpperCase() + rawRole.slice(1));
}

function ensureAdminUserModal() {
  let overlay = document.getElementById("adminUserDetailOverlay");
  if (overlay) return overlay;

  overlay = document.createElement("div");
  overlay.className = "admin-modal-overlay";
  overlay.id = "adminUserDetailOverlay";
  overlay.innerHTML = `
    <div class="admin-modal-card">
      <div class="admin-modal-head">
        <div class="admin-modal-title">Profil utilisateur</div>
        <button class="admin-modal-close" type="button" aria-label="Fermer">×</button>
      </div>
      <div class="admin-modal-body" id="adminUserDetailBody"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.querySelector(".admin-modal-close").addEventListener("click", () => {
    overlay.classList.remove("active");
  });
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) overlay.classList.remove("active");
  });

  return overlay;
}

function openAdminUserProfile(userId) {
  const overlay = ensureAdminUserModal();
  const body = document.getElementById("adminUserDetailBody");
  if (!body) return;

  body.innerHTML = `<div class="admin-modal-empty">Chargement du profil...</div>`;
  overlay.classList.add("active");

  firebase.database().ref("users/" + userId).once("value").then((snapshot) => {
    const user = snapshot.val() || {};
    const name = user.name || user.displayName || "Sans nom";
    const email = user.email || "—";
    const avatar = user.avatar || user.photoURL || `https://i.pravatar.cc/96?u=${encodeURIComponent(userId || name)}`;
    const role = getAdminUserRoleLabel(user.role);
    const status = user.status || "actif";
    const createdAt = user.createdAt ? new Date(user.createdAt).toLocaleString("fr-FR") : "—";
    const phone = user.phone || user.telephone || user.phoneNumber || "—";

    body.innerHTML = `
      <div class="admin-user-profile-head">
        <img src="${escapeHtml(avatar)}" alt="${escapeHtml(name)}">
        <div>
          <div class="admin-user-profile-name">${escapeHtml(name)}</div>
          <div class="admin-user-profile-email">${escapeHtml(email)}</div>
        </div>
      </div>
      <div class="admin-modal-row"><span>ID</span><strong>${escapeHtml(userId)}</strong></div>
      <div class="admin-modal-row"><span>Rôle</span><strong>${escapeHtml(role)}</strong></div>
      <div class="admin-modal-row"><span>Statut</span><strong>${escapeHtml(status)}</strong></div>
      <div class="admin-modal-row"><span>Téléphone</span><strong>${escapeHtml(phone)}</strong></div>
      <div class="admin-modal-row"><span>Inscrit le</span><strong>${escapeHtml(createdAt)}</strong></div>
    `;
  }).catch((err) => {
    body.innerHTML = `<div class="admin-modal-empty error">Impossible de charger le profil : ${escapeHtml(err.message || err.code)}</div>`;
  });
}

function handleAdminUserAction(action, userId) {
  const userRef = firebase.database().ref("users/" + userId);

  if (action === "view") {
    openAdminUserProfile(userId);
    return;
  }

  if (action === "toggle") {
    userRef.once("value").then((snapshot) => {
      const user = snapshot.val() || {};
      const current = user.status || "actif";
      const next = current === "suspendu" ? "actif" : "suspendu";
      return userRef.update({ status: next });
    }).then(() => renderAllAdminUsers());
    return;
  }

  if (action === "delete") {
    if (!confirm("Supprimer cet utilisateur ? Cette action est irréversible.")) return;
    userRef.remove()
      .then(() => renderAllAdminUsers())
      .catch(() => alert("Échec de la suppression"));
  }
}

function renderAllAdminUsers() {
  const tbody = document.getElementById("adminUsersTableBody");
  const countEl = document.getElementById("adminUserTableCount");
  const searchEl = document.getElementById("adminUserSearch");
  const filterEl = document.getElementById("adminUserFilter");
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:30px;color:#6b7280;">Chargement des utilisateurs...</td></tr>`;

  firebase.database().ref("users").once("value").then((snapshot) => {
    const data = snapshot.val() || {};
    const search = searchEl ? searchEl.value.trim().toLowerCase() : "";
    const roleFilter = filterEl ? filterEl.value : "all";
    const users = Object.keys(data).map((id) => ({ id, ...data[id] }))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      .filter((user) => {
        const role = (user.role || "candidat").toString().toLowerCase();
        const name = (user.name || user.displayName || "").toString().toLowerCase();
        const email = (user.email || "").toString().toLowerCase();
        const matchesSearch = !search || name.includes(search) || email.includes(search) || role.includes(search);
        const matchesRole = roleFilter === "all" || role === roleFilter;
        return matchesSearch && matchesRole;
      });

    const statusMap = {
      actif: '<span class="status-badge success">Actif</span>',
      attente: '<span class="status-badge warning">En attente</span>',
      suspendu: '<span class="status-badge danger">Suspendu</span>'
    };

    if (users.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:30px;color:#6b7280;">Aucun utilisateur trouvé.</td></tr>`;
      if (countEl) countEl.textContent = "Affichage de 0 utilisateur";
      return;
    }

    tbody.innerHTML = users.map((user) => {
      const name = user.name || user.displayName || "Sans nom";
      const email = user.email || "—";
      const avatar = user.avatar || user.photoURL || `https://i.pravatar.cc/64?u=${encodeURIComponent(user.id || name)}`;
      const role = getAdminUserRoleLabel(user.role);
      const date = user.createdAt ? new Date(user.createdAt).toLocaleDateString("fr-FR") : "—";
      const status = user.status || "actif";

      return `
        <tr>
          <td>
            <div class="user-cell">
              <img src="${escapeHtml(avatar)}" alt="${escapeHtml(name)}">
              <div>
                <div class="user-cell-name">${escapeHtml(name)}</div>
                <div class="user-cell-email">${escapeHtml(email)}</div>
              </div>
            </div>
          </td>
          <td>${escapeHtml(role)}</td>
          <td>${escapeHtml(date)}</td>
          <td>${statusMap[status] ? statusMap[status] : escapeHtml(status)}</td>
          <td>
            <div class="row-menu">
              <button type="button" class="row-menu-btn" data-id="${escapeHtml(user.id)}">⋯</button>
              <div class="row-dropdown" id="dropdown-${escapeHtml(user.id)}">
                <button data-action="view" data-id="${escapeHtml(user.id)}">Voir le profil</button>
                <button data-action="toggle" data-id="${escapeHtml(user.id)}">${status === "suspendu" ? "Réactiver" : "Suspendre"}</button>
                <button data-action="delete" data-id="${escapeHtml(user.id)}" class="danger">Supprimer</button>
              </div>
            </div>
          </td>
        </tr>
      `;
    }).join("");

    if (countEl) countEl.textContent = `Affichage de ${users.length} utilisateur${users.length > 1 ? "s" : ""}`;
  }).catch((err) => {
    console.error("[ADMIN] Erreur chargement utilisateurs:", err);
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:30px;color:#ef4444;">Erreur de chargement des utilisateurs: ${err.message || err.code}</td></tr>`;
  });
}

function renderCompanies() {
  const tbody = document.getElementById("companyTableBody");
  const countEl = document.getElementById("companyTableCount");
  const searchEl = document.getElementById("companySearch");
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:30px;color:#6b7280;">Chargement des entreprises...</td></tr>`;

  firebase.database().ref("users").once("value").then((snapshot) => {
    const data = snapshot.val() || {};
    const search = searchEl ? searchEl.value.trim().toLowerCase() : "";
    const companies = Object.keys(data)
      .map((id) => ({ id, ...data[id] }))
      .filter((u) => (u.role || "").toString().toLowerCase() === "entreprise")
      .filter((c) => {
        const name = (c.name || c.displayName || c.email || "").toString().toLowerCase();
        const matchesSearch = !search || name.includes(search);
        return matchesSearch;
      })
      .sort((a, b) => (a.name || a.displayName || a.email || "").localeCompare(b.name || b.displayName || b.email || ""));

    if (companies.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:30px;color:#6b7280;">Aucune entreprise trouvée.</td></tr>`;
      if (countEl) countEl.textContent = "Affichage de 0 entreprise";
      return;
    }

    tbody.innerHTML = companies.map((c) => {
      const name = c.name || c.displayName || c.email || "Sans nom";
      const email = c.email || "—";
      const avatar = c.avatar || c.photoURL || `https://i.pravatar.cc/64?u=${encodeURIComponent(c.id || name)}`;

      return `
        <tr>
          <td style="text-align:center;vertical-align:middle;"><img src="${escapeHtml(avatar)}" alt="${escapeHtml(name)}" style="width:40px;height:40px;border-radius:8px;object-fit:cover;"></td>
          <td><div class="user-cell"><div><div class="user-cell-name">${escapeHtml(name)}</div><div class="user-cell-email">${escapeHtml(email)}</div></div></div></td>
          <td>${escapeHtml(c.role || "entreprise")}</td>
          <td>${c.website ? `<a href="${escapeHtml(c.website)}" target="_blank" rel="noopener">${escapeHtml(c.website)}</a>` : "—"}</td>
          <td class="exp-action-cell">
            <button class="row-menu-btn" data-id="${escapeHtml(c.id)}" title="Actions">⋯</button>
          </td>
        </tr>
      `;
    }).join("");

    if (countEl) countEl.textContent = `Affichage de ${companies.length} entreprise${companies.length > 1 ? "s" : ""}`;
  }).catch((err) => {
    console.error("[ADMIN] Erreur chargement entreprises:", err);
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:30px;color:#ef4444;">Erreur de chargement: ${err.message || err.code}</td></tr>`;
  });
}

let adminActiveDiscussionUid = null;
let adminMsgListener = null;
let adminActiveConversationId = null;
let adminActiveCounterparty = null;
let adminConvListener = null;
let adminActiveUserAvatar = null;

function getAvatarColor(name) {
  const colors = ["#3b6bf5", "#16a34a", "#8b5cf6", "#0ea5e9", "#f59e0b", "#ef4444"];
  let hash = 0;
  const s = name || "";
  for (let i = 0; i < s.length; i++) hash = s.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

// Choisit le bon fil de conversation à afficher pour un utilisateur :
// priorité au fil direct avec l'admin connecté, sinon le fil VERA, sinon le plus récent.
function pickCounterparty(userConvs, adminUid) {
  if (!userConvs) return null;
  const keys = Object.keys(userConvs).filter((k) => userConvs[k] && (userConvs[k].lastTimestamp || userConvs[k].lastMessage));
  if (keys.length === 0) return null;
  if (adminUid && userConvs[adminUid]) return adminUid;
  if (userConvs["vera"]) return "vera";
  return keys.sort((a, b) => (userConvs[b].lastTimestamp || 0) - (userConvs[a].lastTimestamp || 0))[0];
}

function renderAdminConversations() {
  const list = document.getElementById("adminUsersList");
  const countEl = document.getElementById("adminConvTableCount");
  const searchEl = document.getElementById("adminConvSearch");
  if (!list) return;

  list.innerHTML = `<div class="conv-empty">Chargement des conversations...</div>`;

  const adminUid = firebase.auth().currentUser?.uid;

  firebase.database().ref("users").once("value").then((snapshot) => {
    const usersData = snapshot.val() || {};
    const search = searchEl ? searchEl.value.trim().toLowerCase() : "";
    const users = Object.keys(usersData)
      .map((id) => ({ id, ...usersData[id] }))
      .filter((u) => (u.role || "").toString().toLowerCase() !== "admin")
      .filter((u) => {
        const name = (u.name || u.displayName || u.email || "").toString().toLowerCase();
        return !search || name.includes(search);
      })
      .sort((a, b) => (a.name || a.displayName || a.email || "").localeCompare(b.name || b.displayName || b.email || ""));

    const convPromises = users.map((u) =>
      firebase.database().ref("conversations/" + u.id).once("value").then((snap) => {
        const all = snap.val() || null;
        const counterparty = pickCounterparty(all, adminUid);
        const conv = counterparty ? all[counterparty] : null;
        return { user: u, conv, counterparty };
      })
    );

    return Promise.all(convPromises).then((results) => {
      const withConv = results.filter((r) => r.conv !== null).sort((a, b) => (b.conv.lastTimestamp || 0) - (a.conv.lastTimestamp || 0));

      if (withConv.length === 0) {
        list.innerHTML = `<div class="conv-empty">Aucune conversation trouvée.</div>`;
        if (countEl) countEl.textContent = "Affichage de 0 conversation";
        return;
      }

      list.innerHTML = withConv.map(({ user, conv, counterparty }) => {
        const name = user.name || user.displayName || user.email || "Utilisateur";
        const avatar = user.avatar || user.photoURL || "";
        const initial = (name.charAt(0) || "?").toUpperCase();
        const avatarBg = user.avatarBg || getAvatarColor(name);
        const lastMessage = conv.lastMessage || "";
        const time = conv.lastTimestamp ? new Date(conv.lastTimestamp).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "";
        const unread = conv.unread ? 1 : 0;
        const youPrefix = conv.lastSenderUid === adminUid ? "Vous : " : "";
        const avatarHtml = avatar
          ? `<img src="${escapeHtml(avatar)}" alt="${escapeHtml(name)}" class="conv-avatar-img">`
          : escapeHtml(initial);

        return `
          <div class="conv-item ${adminActiveDiscussionUid === user.id ? "active" : ""}" data-uid="${escapeHtml(user.id)}" data-counterparty="${escapeHtml(counterparty)}">
            <div class="conv-avatar" style="background:${avatarBg}">${avatarHtml}</div>
            <div class="conv-body">
              <div class="conv-top">
                <span class="conv-name">${escapeHtml(name)}</span>
                <span class="conv-time">${escapeHtml(time)}</span>
              </div>
              <div class="conv-sub">${escapeHtml(user.email || "")}</div>
              <div class="conv-preview">${escapeHtml(youPrefix + lastMessage)}</div>
            </div>
            ${unread ? `<span class="conv-unread"></span>` : ""}
          </div>
        `;
      }).join("");

      list.querySelectorAll(".conv-item").forEach((item) => {
        item.addEventListener("click", () => {
          const uid = item.dataset.uid;
          const cp = item.dataset.counterparty;
          if (uid) openAdminConversation(uid, cp);
        });
      });

      if (countEl) countEl.textContent = `Affichage de ${withConv.length} conversation${withConv.length > 1 ? "s" : ""}`;
    });
  }).catch((err) => {
    console.error("[ADMIN] Erreur chargement conversations:", err);
    list.innerHTML = `<div class="conv-empty" style="color:var(--red);">Erreur de chargement</div>`;
  });
}

function openAdminConversation(userId, counterparty) {
  adminActiveDiscussionUid = userId;
  adminActiveCounterparty = counterparty || "vera";

  const list = document.getElementById("adminUsersList");
  if (list) list.querySelectorAll(".conv-item").forEach((i) => i.classList.toggle("active", i.dataset.uid === userId));

  const emptyEl = document.getElementById("adminChatEmpty");
  const windowEl = document.getElementById("adminChatWindow");
  const container = document.getElementById("adminChatMessages");
  if (emptyEl) emptyEl.style.display = "none";
  if (windowEl) windowEl.style.display = "flex";
  if (container) container.innerHTML = `<div class="msg-loading">Chargement...</div>`;

  firebase.database().ref("users/" + userId).once("value").then((snap) => {
    const user = snap.val() || {};
    const name = user.name || user.displayName || user.email || "Utilisateur";
    const avatar = user.avatar || user.photoURL || "";
    const initial = (name.charAt(0) || "?").toUpperCase();
    const avatarBg = user.avatarBg || getAvatarColor(name);
    adminActiveUserAvatar = avatar;

    const nameEl = document.getElementById("adminChatName");
    const avatarEl = document.getElementById("adminChatAvatar");
    const statusEl = document.getElementById("adminChatStatus");
    if (nameEl) nameEl.textContent = name;
    if (avatarEl) {
      avatarEl.style.background = avatarBg;
      avatarEl.innerHTML = avatar
        ? `<img src="${escapeHtml(avatar)}" alt="" class="conv-avatar-img">`
        : escapeHtml(initial);
    }
    if (statusEl) statusEl.innerHTML = `<span class="dot-online"></span>En ligne`;

    renderAdminContactCard(user, name, avatar, avatarBg);

    const conversationId = [userId, adminActiveCounterparty].sort().join("_");
    adminActiveConversationId = conversationId;

    if (adminMsgListener) {
      adminMsgListener.off();
      adminMsgListener = null;
    }
    adminMsgListener = firebase.database().ref("messages/" + conversationId).orderByChild("timestamp");
    adminMsgListener.on("value", (snapshot) => {
      const data = snapshot.val() || {};
      const messages = Object.keys(data).map((key) => ({ id: key, ...data[key] }));
      messages.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
      renderAdminConversationMessages(messages, document.getElementById("adminChatMessages"));
    });

    // Marquer comme lu des deux côtés
    firebase.database().ref("conversations/" + userId + "/" + adminActiveCounterparty).update({ unread: false }).catch(() => {});
    firebase.database().ref("conversations/" + adminActiveCounterparty + "/" + userId).update({ unread: false }).catch(() => {});
    if (list) list.querySelectorAll(".conv-item").forEach((i) => {
      if (i.dataset.uid === userId) {
        const badge = i.querySelector(".conv-unread");
        if (badge) badge.remove();
      }
    });
  });
}

function renderAdminContactCard(user, name, avatar, avatarBg) {
  const avatarEl = document.getElementById("adminContactAvatar");
  const nameEl = document.getElementById("adminContactName");
  const statusEl = document.getElementById("adminContactStatus");
  const descEl = document.getElementById("adminContactDesc");
  const roleEl = document.getElementById("adminContactRole");
  const emailEl = document.getElementById("adminContactEmail");
  const lastEl = document.getElementById("adminContactLast");
  const stateEl = document.getElementById("adminContactState");

  if (avatarEl) {
    avatarEl.style.background = avatarBg;
    avatarEl.innerHTML = avatar
      ? `<img src="${escapeHtml(avatar)}" alt="" class="conv-avatar-img">`
      : escapeHtml((name.charAt(0) || "?").toUpperCase());
  }
  if (nameEl) nameEl.textContent = name;
  if (statusEl) statusEl.innerHTML = `<span class="dot-online"></span>En ligne`;
  if (descEl) descEl.textContent = "Membre de la plateforme VERA. Consultez l'historique de la conversation sur la gauche.";
  if (roleEl) roleEl.textContent = user.role || "Utilisateur";
  if (emailEl) emailEl.textContent = user.email || "—";
  if (lastEl) lastEl.textContent = user.lastActive ? new Date(user.lastActive).toLocaleString("fr-FR") : "—";
  if (stateEl) stateEl.textContent = "En ligne";
}

function renderAdminConversationMessages(messages, container) {
  if (!container) return;
  if (!messages || messages.length === 0) {
    container.innerHTML = `<div class="msg-loading">Aucun message pour le moment. Commencez la conversation.</div>`;
    return;
  }
  container.innerHTML = messages.map((m) => {
    const isAdmin = m.senderUid === firebase.auth().currentUser?.uid;
    const rowClass = isAdmin ? "user" : "vera";
    const bubbleStyle = isAdmin
      ? 'background:#7dd3fc;color:#0f1730;border-color:#38bdf8;'
      : 'background:#a5d6a7;color:#0f1730;border-color:#15a55c;';

    let contentHtml = "";
    if (m.type === "text") {
      contentHtml = escapeHtml(m.text || "");
    } else if (m.type === "image" && m.fileUrl) {
      contentHtml = `<img src="${m.fileUrl}" class="msg-image" onclick="window.open('${m.fileUrl}', '_blank')">`;
      if (m.text) contentHtml += `<div>${escapeHtml(m.text)}</div>`;
    } else if (m.type === "file" && m.fileUrl) {
      contentHtml = `<a href="${m.fileUrl}" target="_blank" class="msg-file">📄 ${escapeHtml(m.fileName || "Fichier")}</a>`;
      if (m.text) contentHtml += `<div>${escapeHtml(m.text)}</div>`;
    }

    return `
      <div class="msg-row ${rowClass}">
        ${!isAdmin ? `<div class="msg-avatar-sm">${getAvatarForRecipient()}</div>` : ""}
        <div class="msg-bubble" style="${bubbleStyle}">
          ${contentHtml}
          <span class="msg-time" style="color:${isAdmin ? '#0c4a6e' : '#14532d'}">${formatTime(m.timestamp)} <span class="msg-status">${getMessageStatusIcon(m, isAdmin)}</span></span>
        </div>
      </div>
    `;
  }).join("");
  container.scrollTop = container.scrollHeight;
}

function sendAdminMessage() {
  const input = document.getElementById("adminChatInput");
  const text = input ? input.value.trim() : "";
  if (!text || !adminActiveDiscussionUid) return;

  const adminUid = firebase.auth().currentUser?.uid;
  const userId = adminActiveDiscussionUid;
  const counterparty = adminActiveCounterparty || "vera";
  const conversationId = [userId, counterparty].sort().join("_");

  const messageRef = firebase.database().ref("messages/" + conversationId).push();
  const messageWithId = {
    text,
    type: "text",
    id: messageRef.key,
    senderUid: adminUid,
    timestamp: Date.now(),
    read: false
  };

  messageRef.set(messageWithId)
    .then(() => firebase.database().ref("conversations/" + userId + "/" + counterparty).update({
      lastMessage: text,
      lastTimestamp: messageWithId.timestamp,
      recipientId: counterparty,
      lastSenderUid: adminUid,
      unread: false
    }))
    .then(() => firebase.database().ref("conversations/" + counterparty + "/" + userId).update({
      lastMessage: text,
      lastTimestamp: messageWithId.timestamp,
      recipientId: userId,
      lastSenderUid: adminUid,
      unread: true
    }))
    .then(() => { if (input) input.value = ""; })
    .then(() => { if (adminConvListener) renderAdminConversations(); })
    .catch((err) => {
      console.error("[ADMIN] Erreur envoi message:", err);
      alert("Erreur lors de l'envoi du message");
    });
}

function getAvatarForRecipient() {
  const avatar = adminActiveUserAvatar || "";
  const initial = "?";
  return avatar
    ? `<img src="${escapeHtml(avatar)}" alt="" style="width:20px;height:20px;object-fit:contain;">`
    : `<div style="width:20px;height:20px;border-radius:50%;background:var(--mint-dark);color:#fff;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;">${escapeHtml(initial)}</div>`;
}

function formatTime(timestamp) {
  if (!timestamp) return "";
  const d = new Date(timestamp);
  return d.getHours().toString().padStart(2, "0") + ":" + d.getMinutes().toString().padStart(2, "0");
}

function getMessageStatusIcon(message, isUser) {
  return '<span class="status-sent">✓</span>';
}

async function renderAdminCharts() {
  const growthChart = document.getElementById("growthChart");
  if (growthChart) {
    const width = 720;
    const height = 260;
    const padding = { top: 24, right: 24, bottom: 32, left: 52 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    growthChart.setAttribute("viewBox", `0 0 ${width} ${height}`);
    growthChart.innerHTML = `<text x="360" y="130" text-anchor="middle" font-size="14" fill="#6b7280">Chargement du graphique...</text>`;

    try {
      const [usersSnap, jobsSnap] = await Promise.all([
        firebase.database().ref("users").once("value"),
        firebase.database().ref("jobs").once("value")
      ]);

      const users = usersSnap.val() || {};
      const jobs = jobsSnap.val() || {};

      const now = new Date();
      const monthLabels = [];
      const monthEnds = [];

      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        monthLabels.push(["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"][d.getMonth()]);
        const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
        monthEnds.push(endOfMonth.getTime());
      }

      const userCounts = [];
      const jobCounts = [];

      monthEnds.forEach((endTs, idx) => {
        const isCurrentMonth = idx === monthEnds.length - 1;
        const uCount = Object.values(users).filter(u => {
          const t = typeof u.createdAt === 'number' ? u.createdAt : (isCurrentMonth ? Date.now() : 0);
          return t <= endTs;
        }).length;
        const jCount = Object.values(jobs).filter(j => {
          const t = typeof j.createdAt === 'number' ? j.createdAt : (isCurrentMonth ? Date.now() : 0);
          return t <= endTs;
        }).length;
        userCounts.push(uCount);
        jobCounts.push(jCount);
      });

      const labels = monthLabels;
      const userCountsArr = userCounts;
      const offerCountsArr = jobCounts;
      const maxVal = Math.max(...userCountsArr, ...offerCountsArr, 1);

      const xStep = chartW / labels.length;
      const groupWidth = xStep * 0.55;
      const barWidth = groupWidth / 2;

      let gridLines = "";
      for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartH / 4) * i;
        const val = Math.round(maxVal - (maxVal / 4) * i);
        gridLines += `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="#e5e7eb" stroke-width="1"/>`;
        gridLines += `<text x="${padding.left - 10}" y="${y + 4}" text-anchor="end" font-size="10" fill="#6b7280">${val}</text>`;
      }

      let bars = "";
      userCountsArr.forEach((val, i) => {
        const x = padding.left + i * xStep + (xStep - groupWidth) / 2;
        const h = (val / maxVal) * chartH;
        const y = padding.top + chartH - h;
        bars += `<rect x="${x}" y="${y}" width="${barWidth}" height="${h}" rx="6" fill="#00BCD4" opacity="0.9"/>`;
        bars += `<text x="${x + barWidth / 2}" y="${y - 6}" text-anchor="middle" font-size="9" fill="#00BCD4" font-weight="700">${val}</text>`;
      });

      offerCountsArr.forEach((val, i) => {
        const x = padding.left + i * xStep + (xStep - groupWidth) / 2 + barWidth;
        const h = (val / maxVal) * chartH;
        const y = padding.top + chartH - h;
        bars += `<rect x="${x}" y="${y}" width="${barWidth}" height="${h}" rx="6" fill="#15a55c" opacity="0.9"/>`;
        bars += `<text x="${x + barWidth / 2}" y="${y - 6}" text-anchor="middle" font-size="9" fill="#15a55c" font-weight="700">${val}</text>`;
      });

      let xLabels = "";
      labels.forEach((label, i) => {
        const x = padding.left + i * xStep + xStep / 2;
        xLabels += `<text x="${x}" y="${height - 10}" text-anchor="middle" font-size="10" fill="#6b7280">${label}</text>`;
      });

      growthChart.setAttribute("viewBox", `0 0 ${width} ${height}`);
      growthChart.innerHTML = `
        ${gridLines}
        ${bars}
        ${xLabels}
      `;
    } catch (err) {
      console.error("[ADMIN] Erreur chargement graphique croissance:", err);
      growthChart.innerHTML = `<text x="360" y="130" text-anchor="middle" font-size="14" fill="#ef4444">Erreur de chargement</text>`;
    }
  }

  try {
    const jobsSnap = await firebase.database().ref("jobs").once("value");
    const jobs = jobsSnap.val() || {};

    const counts = {};
    Object.values(jobs).forEach(j => {
      const raw = (j.contractType || j.status || "Autre").toString().trim();
      const cat = raw ? raw : "Autre";
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    const total = sorted.reduce((sum, [, count]) => sum + count, 0) || 1;
    const palette = ["#00BCD4", "#15a55c", "#f59e0b", "#8b5cf6"];
    const segments = sorted.map(([label], idx) => ({
      percent: Math.round((counts[label] / total) * 100),
      color: palette[idx],
      label,
      count: counts[label]
    }));

    const donut = document.getElementById("categoryDonut");
    if (donut) {
      let currentAngle = -90;
      let paths = "";
      const radius = 50;
      const innerRadius = 35;

      segments.forEach(seg => {
        const angle = (seg.percent / 100) * 360;
        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;
        currentAngle = endAngle;

        const x1 = 60 + radius * Math.cos((startAngle * Math.PI) / 180);
        const y1 = 60 + radius * Math.sin((startAngle * Math.PI) / 180);
        const x2 = 60 + radius * Math.cos((endAngle * Math.PI) / 180);
        const y2 = 60 + radius * Math.sin((endAngle * Math.PI) / 180);
        const x3 = 60 + innerRadius * Math.cos((endAngle * Math.PI) / 180);
        const y3 = 60 + innerRadius * Math.sin((endAngle * Math.PI) / 180);
        const x4 = 60 + innerRadius * Math.cos((startAngle * Math.PI) / 180);
        const y4 = 60 + innerRadius * Math.sin((startAngle * Math.PI) / 180);

        const largeArc = angle > 180 ? 1 : 0;
        const pathData = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;

        paths += `<path d="${pathData}" fill="${seg.color}" stroke="#fff" stroke-width="2"/>`;
      });

      donut.innerHTML = paths;
    }

    const donutTotal = document.getElementById("donutTotalCat");
    if (donutTotal) donutTotal.textContent = total.toLocaleString("fr-FR");

    const legend = document.getElementById("categoryLegend");
    if (legend) {
      legend.innerHTML = segments.map(cat => `
        <li class="legend-item">
          <span class="dot" style="background:${cat.color}"></span>
          <span>${cat.label}</span>
          <span class="count">${cat.count}</span>
        </li>
      `).join("");
    }
  } catch (err) {
    console.error("[ADMIN] Erreur chargement donut:", err);
  }
}

document.querySelectorAll(".nav-item").forEach(item => {
  item.addEventListener("click", () => {
    const panel = item.getAttribute("data-panel");

    if (panel && !canAccessPanel(panel)) {
      alert("Accès refusé : vous ne disposez pas du privilège pour accéder à la section \"" + (item.textContent || panel).trim() + "\".");
      return;
    }

    document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));
    item.classList.add("active");

    if (adminMsgListener) { adminMsgListener.off(); adminMsgListener = null; }
    if (adminConvListener) { adminConvListener.off(); adminConvListener = null; }

    if (panel) {
      document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
      const target = document.getElementById("panel-" + panel);
      if (target) target.classList.add("active");

      if (panel === "offres") {
        setTimeout(() => {
          renderJobs();
          updateNavCounts();
        }, 50);
      } else if (panel === "sites") {
        setTimeout(() => {
          renderSites();
          updateNavCounts();
        }, 50);
      } else if (panel === "candidatures") {
        setTimeout(() => {
          renderInformations();
          updateNavCounts();
        }, 50);
      } else if (panel === "utilisateurs") {
        console.log("[ADMIN] Clic sur Utilisateurs, panel:", panel);
        setTimeout(() => {
          console.log("[ADMIN] Lancement renderAdminUsers pour panel utilisateurs");
          renderAllAdminUsers();
          updateNavCounts();
        }, 50);
      } else if (panel === "entreprises") {
        setTimeout(() => {
          renderCompanies();
          updateNavCounts();
        }, 50);
      } else if (panel === "formations") {
        setTimeout(() => {
          renderAdmins();
          updateNavCounts();
        }, 50);
      } else if (panel === "discussions") {
        setTimeout(() => {
          adminActiveDiscussionUid = null;
          adminActiveCounterparty = null;
          adminActiveUserAvatar = null;
          if (adminMsgListener) { adminMsgListener.off(); adminMsgListener = null; }
          if (adminConvListener) { adminConvListener.off(); adminConvListener = null; }
          renderAdminConversations();
          if (!adminConvListener) {
            adminConvListener = firebase.database().ref("conversations");
            adminConvListener.on("value", () => renderAdminConversations());
          }
          updateNavCounts();
        }, 50);
      } else {
        setTimeout(() => updateNavCounts(), 50);
      }
    }
  });
});

document.getElementById("adminConvSearch")?.addEventListener("input", () => {
  renderAdminConversations();
});

// ============== DISCUSSIONS : actions de la fenêtre de chat ==============
document.getElementById("adminSendBtn")?.addEventListener("click", () => {
  sendAdminMessage();
});

document.getElementById("adminChatInput")?.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendAdminMessage();
});

document.getElementById("adminConvRefresh")?.addEventListener("click", () => {
  if (adminActiveDiscussionUid) openAdminConversation(adminActiveDiscussionUid, adminActiveCounterparty);
});

document.getElementById("adminMarkReadBtn")?.addEventListener("click", () => {
  if (!adminActiveDiscussionUid) return;
  const cp = adminActiveCounterparty || "vera";
  firebase.database().ref("conversations/" + adminActiveDiscussionUid + "/" + cp).update({ unread: false })
    .then(() => renderAdminConversations())
    .catch((err) => console.error("[ADMIN] Erreur marquage lu:", err));
});

document.getElementById("adminClearConvBtn")?.addEventListener("click", () => {
  if (!adminActiveConversationId) return;
  if (!confirm("Effacer tous les messages de cette conversation ?")) return;
  firebase.database().ref("messages/" + adminActiveConversationId).remove()
    .then(() => {
      const c = document.getElementById("adminChatMessages");
      if (c) c.innerHTML = `<div class="msg-loading">Aucun message pour le moment. Commencez la conversation.</div>`;
    })
    .catch((err) => console.error("[ADMIN] Erreur suppression conversation:", err));
});

// ============== CRUD OFFRES D'EMPLOI ==============
function jobRef() {
  const user = firebase.auth().currentUser;
  if (!user) {
    console.warn("[JOBS] aucun utilisateur Firebase connecté");
  }
  return user ? firebase.database().ref("jobs") : null;
}

function renderJobs(resetPage) {
  const tbody = document.getElementById("jobTableBody");
  const countEl = document.getElementById("jobTableCount");
  const search = document.getElementById("jobSearch");
  const filter = document.getElementById("jobFilter");
  if (!tbody) {
    console.warn("[JOBS] jobTableBody introuvable");
    return;
  }

  const ref = jobRef();
  if (!ref) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:30px;color:#ef4444;">Vous devez être connecté pour voir les offres.</td></tr>`;
    return;
  }

  console.log("[JOBS] renderJobs lancé");
  const q = search ? search.value.trim().toLowerCase() : "";
  const statusFilter = filter ? filter.value : "all";

  ref.once("value").then((snapshot) => {
    const data = snapshot.val() || {};
    const items = Object.keys(data).map((id) => ({ id, ...data[id] }))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    console.log("[JOBS] items chargés:", items.length, items.map(i => ({ id: i.id, logoURL: i.logoURL })));

    let filtered = items;
    if (q) {
      filtered = filtered.filter(job =>
        (job.title || "").toLowerCase().includes(q) ||
        (job.company || "").toLowerCase().includes(q) ||
        (job.location || "").toLowerCase().includes(q) ||
        (job.country || "").toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter(job => (job.status || "active") === statusFilter);
    }

    allFilteredJobs = filtered;
    if (resetPage !== false) jobCurrentPage = 1;

    tbody.innerHTML = "";
    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:30px;color:#6b7280;">Aucune offre trouvée.</td></tr>`;
      if (countEl) countEl.textContent = "Affichage de 0 offre";
      renderJobPagination(0);
      return;
    }

    const totalPages = Math.max(1, Math.ceil(filtered.length / JOBS_PER_PAGE));
    if (jobCurrentPage > totalPages) jobCurrentPage = totalPages;
    const start = (jobCurrentPage - 1) * JOBS_PER_PAGE;
    const end = Math.min(start + JOBS_PER_PAGE, filtered.length);
    const pageJobs = filtered.slice(start, end);

    if (countEl) countEl.textContent = `Affichage de ${start + 1} à ${end} sur ${filtered.length} offre${filtered.length > 1 ? "s" : ""}`;

    const statusMap = {
      active: '<span class="status-badge success">Active</span>',
      inactive: '<span class="status-badge danger">Inactive</span>'
    };

    pageJobs.forEach((job) => {
      const tr = document.createElement("tr");
      const logoUrl = job.logoURL || "";
      const logoHtml = logoUrl
        ? `<img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(job.company || 'logo')}" style="width:40px;height:40px;border-radius:8px;object-fit:cover;">`
        : `<div class="job-logo-placeholder">${escapeHtml((job.company || "?").charAt(0).toUpperCase())}</div>`;

      tr.innerHTML = `
        <td style="text-align:center;vertical-align:middle;"><input type="checkbox" class="job-select-checkbox" data-id="${job.id}" style="cursor:pointer;width:16px;height:16px;"></td>
        <td style="text-align:center;vertical-align:middle;">${logoHtml}</td>
        <td><button class="job-title-edit" data-id="${job.id}" style="background:none;border:none;color:inherit;font:inherit;cursor:pointer;text-align:left;padding:0;font-weight:700;">${escapeHtml(job.title || "Sans titre")}</button></td>
        <td>${escapeHtml(job.company || "—")}</td>
        <td>${escapeHtml(job.location || "—")}${job.country ? ", " + escapeHtml(job.country) : ""}</td>
        <td>${statusMap[job.status] || job.status || "—"}</td>
        <td>${job.deadline ? escapeHtml(job.deadline) : "—"}</td>
        <td class="exp-action-cell">
          <button class="exp-delete-btn" data-id="${job.id}" title="Supprimer">
            <img src="/image/delete.png" alt="Supprimer" style="width:16px;height:16px;object-fit:contain;">
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll(".job-title-edit").forEach((btn) => {
      btn.addEventListener("click", () => openJobForm(btn.dataset.id));
    });
    tbody.querySelectorAll(".exp-delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => deleteJob(btn.dataset.id));
    });
    tbody.querySelectorAll(".job-select-checkbox").forEach((checkbox) => {
      checkbox.addEventListener("change", updateBulkDeleteButton);
    });

    updateBulkDeleteButton();
    renderJobPagination(filtered.length);
  }).catch((err) => {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:30px;color:#ef4444;">Erreur de chargement: ${err.message || err.code}</td></tr>`;
  });
}

function renderJobPagination(totalItems) {
  const container = document.getElementById("jobPagination");
  if (!container) return;

  const totalPages = totalItems === 0 ? 0 : Math.max(1, Math.ceil(totalItems / JOBS_PER_PAGE));
  if (totalPages <= 1) {
    container.innerHTML = "";
    return;
  }

  let html = `<button class="page-arrow" data-page="prev" ${jobCurrentPage === 1 ? 'disabled' : ''}>‹</button>`;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= jobCurrentPage - 1 && i <= jobCurrentPage + 1)) {
      html += `<button class="page-num ${i === jobCurrentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    } else if (i === jobCurrentPage - 2 || i === jobCurrentPage + 2) {
      html += `<span class="page-dots">...</span>`;
    }
  }

  html += `<button class="page-arrow" data-page="next" ${jobCurrentPage === totalPages ? 'disabled' : ''}>›</button>`;
  container.innerHTML = html;

  container.querySelectorAll(".page-num, .page-arrow").forEach((btn) => {
    btn.addEventListener("click", () => {
      const page = btn.dataset.page;
      if (!page) return;

      if (page === "prev" && jobCurrentPage > 1) {
        jobCurrentPage--;
      } else if (page === "next" && jobCurrentPage < totalPages) {
        jobCurrentPage++;
      } else if (page !== "prev" && page !== "next") {
        jobCurrentPage = parseInt(page);
      }

      renderJobs(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

function deleteJob(id) {
  if (!confirm("Supprimer cette offre d'emploi ?")) return;
  const ref = jobRef();
  if (!ref) return;
  ref.child(id).remove()
    .then(() => {
      renderJobs();
      updateNavCounts();
    })
    .catch((err) => alert("Échec de la suppression : " + (err.message || err.code)));
}

function updateBulkDeleteButton() {
  const checkboxes = document.querySelectorAll(".job-select-checkbox:checked");
  const bulkBtn = document.getElementById("bulkDeleteBtn");
  if (bulkBtn) {
    bulkBtn.style.display = checkboxes.length > 0 ? "inline-block" : "none";
    bulkBtn.textContent = checkboxes.length > 0 ? `🗑 Supprimer la sélection (${checkboxes.length})` : "🗑 Supprimer la sélection";
  }
}

function deleteSelectedJobs() {
  const checkboxes = document.querySelectorAll(".job-select-checkbox:checked");
  if (checkboxes.length === 0) return;

  const ids = Array.from(checkboxes).map(cb => cb.dataset.id);
  if (!confirm(`Supprimer ${ids.length} offre(s) d'emploi ?`)) return;

  const ref = jobRef();
  if (!ref) return;

  const deletions = ids.map(id => ref.child(id).remove());
  Promise.all(deletions)
    .then(() => {
      renderJobs();
      updateNavCounts();
      const selectAll = document.getElementById("selectAllJobs");
      if (selectAll) selectAll.checked = false;
    })
    .catch((err) => alert("Échec de la suppression : " + (err.message || err.code)));
}

let jobEditId;

function openJobForm(id) {
  const wrapper = document.getElementById("offresFormWrapper");
  const titleEl = document.getElementById("jobModalTitle");
  const form = document.getElementById("jobForm");
  if (!wrapper || !form || !titleEl) return;

  form.reset();
  if (id) {
    jobEditId = id;
    titleEl.textContent = "Modifier l'offre";
    const ref = jobRef();
    if (ref) {
      ref.child(id).once("value").then((snap) => {
        const d = snap.val() || {};
        form.title.value = d.title || "";
        form.company.value = d.company || "";
        form.applyEmail.value = d.applyEmail || "";
        form.location.value = d.location || "";
        form.country.value = d.country || "";
        form.description.value = d.description || "";
        form.salary.value = d.salary || "";
        form.contractType.value = d.contractType || "";
        form.skills.value = d.skills || "";
        form.deadline.value = d.deadline || "";
        form.status.value = d.status || "active";
      });
    }
  } else {
    jobEditId = null;
    titleEl.textContent = "Ajouter une offre";
  }

  wrapper.classList.add("active");
}

function closeJobForm() {
  const wrapper = document.getElementById("offresFormWrapper");
  if (wrapper) wrapper.classList.remove("active");
  jobEditId = null;
}

function handleJobSubmit(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const payload = {
    title: (fd.get("title") || "").toString().trim(),
    company: (fd.get("company") || "").toString().trim(),
    applyEmail: (fd.get("applyEmail") || "").toString().trim(),
    location: (fd.get("location") || "").toString().trim(),
    country: (fd.get("country") || "").toString().trim(),
    description: (fd.get("description") || "").toString().trim(),
    salary: (fd.get("salary") || "").toString().trim(),
    contractType: (fd.get("contractType") || "").toString().trim(),
    skills: (fd.get("skills") || "").toString().trim(),
    deadline: (fd.get("deadline") || "").toString().trim(),
    status: (fd.get("status") || "active").toString().trim(),
    createdAt: Date.now()
  };

  const logoFile = e.target.querySelector('input[name="logo"]').files[0];
  console.log("[JOBS] logoFile:", logoFile ? logoFile.name : "aucun");

  const ref = jobRef();
  if (!ref) {
    alert("Vous devez être connecté pour enregistrer une offre.");
    return;
  }

  const saveRef = jobEditId ? ref.child(jobEditId) : ref.push();
  console.log("[JOBS] sauvegarde dans Firebase:", jobEditId ? "update" : "create", "key:", saveRef.key, "payload:", payload);

  const finish = () => {
    closeJobForm();
    renderJobs();
    updateNavCounts();
  };

  if (jobEditId) {
    saveRef.update(payload).then(() => {
      console.log("[JOBS] modification OK");
      return handleLogoUpload(saveRef, logoFile);
    }).then(() => {
      finish();
    }).catch((err) => {
      console.error("[JOBS] erreur modification:", err);
      alert("Échec de la modification : " + (err.message || err.code));
    });
  } else {
    saveRef.set(payload).then(() => {
      console.log("[JOBS] création OK");
      return handleLogoUpload(saveRef, logoFile);
    }).then(() => {
      finish();
    }).catch((err) => {
      console.error("[JOBS] erreur création:", err);
      alert("Échec de la création : " + (err.message || err.code));
    });
  }
}

function handleLogoUpload(saveRef, logoFile) {
  if (!logoFile) {
    return null;
  }

  const formData = new FormData();
  formData.append('logo', logoFile);

  console.log("[JOBS] upload local vers /upload-logo.php");

  return fetch('/upload-logo.php', {
    method: 'POST',
    body: formData
  }).then((response) => {
    if (!response.ok) {
      return response.json().then((err) => {
        throw new Error(err.error || 'Erreur upload local');
      });
    }
    return response.json();
  }).then((data) => {
    if (!data.success || !data.url) {
      throw new Error('URL du logo non retournée');
    }
    console.log("[JOBS] logo uploadé localement:", data.url);
    return saveRef.update({ logoURL: data.url });
  }).catch((err) => {
    console.error("[JOBS] erreur upload local:", err);
    alert("Échec de l'upload du logo : " + err.message);
    throw err;
  });
}

const addJobBtn = document.getElementById("addJobBtn");
if (addJobBtn) {
  addJobBtn.addEventListener("click", () => openJobForm(null));
}

const jobCloseBtn = document.getElementById("jobModalClose");
if (jobCloseBtn) {
  jobCloseBtn.addEventListener("click", closeJobForm);
}

const jobCancelBtn = document.getElementById("jobCancel");
if (jobCancelBtn) {
  jobCancelBtn.addEventListener("click", closeJobForm);
}

const jobForm = document.getElementById("jobForm");
if (jobForm) {
  jobForm.addEventListener("submit", handleJobSubmit);
}

const jobSearchEl = document.getElementById("jobSearch");
if (jobSearchEl) jobSearchEl.addEventListener("input", renderJobs);

const jobFilterEl = document.getElementById("jobFilter");
if (jobFilterEl) jobFilterEl.addEventListener("change", renderJobs);

const selectAllJobs = document.getElementById("selectAllJobs");
if (selectAllJobs) {
  selectAllJobs.addEventListener("change", () => {
    document.querySelectorAll(".job-select-checkbox").forEach(cb => cb.checked = selectAllJobs.checked);
    updateBulkDeleteButton();
  });
}

const bulkDeleteBtn = document.getElementById("bulkDeleteBtn");
if (bulkDeleteBtn) {
  bulkDeleteBtn.addEventListener("click", deleteSelectedJobs);
}

const adminUserSearchEl = document.getElementById("adminUserSearch");
if (adminUserSearchEl) adminUserSearchEl.addEventListener("input", renderAllAdminUsers);

const adminUserFilterEl = document.getElementById("adminUserFilter");
if (adminUserFilterEl) adminUserFilterEl.addEventListener("change", renderAllAdminUsers);

document.addEventListener("click", (e) => {
  const menuBtn = e.target.closest(".row-menu-btn");
  if (menuBtn) {
    let dropdown = null;
    if (menuBtn.nextElementSibling && menuBtn.nextElementSibling.classList.contains("row-dropdown")) {
      dropdown = menuBtn.nextElementSibling;
    }
    if (!dropdown && menuBtn.parentElement && menuBtn.parentElement.classList.contains("row-menu")) {
      dropdown = menuBtn.parentElement.querySelector(".row-dropdown");
    }
    if (!dropdown) {
      dropdown = document.getElementById(`dropdown-${menuBtn.dataset.id}`);
    }
    if (!dropdown) return;

    document.querySelectorAll(".row-dropdown").forEach((d) => {
      if (d !== dropdown) {
        d.classList.remove("open");
        d.style.display = "none";
        d.style.position = "";
        d.style.top = "";
        d.style.left = "";
        d.style.right = "";
        d.style.zIndex = "";
        d.style.minWidth = "";
        d.style.width = "";
      }
    });
    if (dropdown.classList.contains("open")) {
      dropdown.classList.remove("open");
      dropdown.style.display = "none";
      dropdown.style.position = "";
      dropdown.style.top = "";
      dropdown.style.left = "";
      dropdown.style.right = "";
      dropdown.style.zIndex = "";
      dropdown.style.minWidth = "";
      dropdown.style.width = "";
    } else {
      dropdown.classList.add("open");
      dropdown.style.display = "block";
      dropdown.style.position = "fixed";
      dropdown.style.zIndex = "99999";
      dropdown.style.minWidth = "160px";
      dropdown.style.width = "160px";
      const rect = menuBtn.getBoundingClientRect();
      dropdown.style.top = (rect.bottom + window.scrollY) + "px";
      dropdown.style.left = (rect.left + window.scrollX) + "px";
      dropdown.style.right = "auto";
    }
    return;
  }

  const actionBtn = e.target.closest("[data-action]");
  if (actionBtn) {
    const userId = actionBtn.dataset.id;
    const action = actionBtn.dataset.action;
    closeAllRowDropdowns();
    if (action === "view") {
      openAdminUserProfile(userId);
    } else if (action === "toggle") {
      const userRef = firebase.database().ref("users/" + userId);
      userRef.once("value").then((snap) => {
        const user = snap.val() || {};
        const current = user.status || "actif";
        const next = current === "suspendu" ? "actif" : "suspendu";
        userRef.update({ status: next }).then(() => {
          renderDashboardUserTable();
          renderAllAdminUsers();
        });
      });
    } else if (action === "delete") {
      if (confirm("Supprimer cet utilisateur ? Cette action est irréversible.")) {
        firebase.database().ref("users/" + userId).remove().then(() => {
          renderDashboardUserTable();
          renderAllAdminUsers();
        }).catch(() => alert("Échec de la suppression"));
      }
    }
    return;
  }

  if (!e.target.closest(".row-menu")) {
    closeAllRowDropdowns();
  }
});

// ============== SITES ==============
let siteCurrentPage = 1;
const SITES_PER_PAGE = 10;

function siteRef() {
  const user = firebase.auth().currentUser;
  return user ? firebase.database().ref("sites") : null;
}

function renderSites() {
  const tbody = document.getElementById("siteTableBody");
  const countEl = document.getElementById("siteTableCount");
  const search = document.getElementById("siteSearch");
  if (!tbody) return;

  const ref = siteRef();
  if (!ref) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:30px;color:#ef4444;">Vous devez être connecté pour voir les sites.</td></tr>`;
    return;
  }

  ref.once("value").then((snapshot) => {
    const data = snapshot.val() || {};
    const items = Object.keys(data).map((id) => ({ id, ...data[id] }))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    let filtered = items;
    const q = search ? search.value.trim().toLowerCase() : "";
    if (q) {
      filtered = filtered.filter(site =>
        (site.name || "").toLowerCase().includes(q) ||
        (site.url || "").toLowerCase().includes(q)
      );
    }

    tbody.innerHTML = "";
    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:30px;color:#6b7280;">Aucun site trouvé.</td></tr>`;
      if (countEl) countEl.textContent = "Affichage de 0 site";
      renderSitePagination(0);
      return;
    }

    const totalPages = Math.max(1, Math.ceil(filtered.length / SITES_PER_PAGE));
    if (siteCurrentPage > totalPages) siteCurrentPage = totalPages;
    const start = (siteCurrentPage - 1) * SITES_PER_PAGE;
    const end = Math.min(start + SITES_PER_PAGE, filtered.length);
    const pageItems = filtered.slice(start, end);

    if (countEl) countEl.textContent = `Affichage de ${start + 1} à ${end} sur ${filtered.length} site${filtered.length > 1 ? "s" : ""}`;

    const statusMap = {
      active: '<span class="status-badge success">Active</span>',
      inactive: '<span class="status-badge danger">Inactive</span>'
    };

    pageItems.forEach((site) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><button class="site-name-edit" data-id="${site.id}" style="background:none;border:none;color:inherit;font:inherit;cursor:pointer;text-align:left;padding:0;font-weight:700;">${escapeHtml(site.name || "—")}</button></td>
        <td><a href="${escapeHtml(site.url || "#")}" target="_blank" rel="noopener noreferrer">${escapeHtml(site.url || "—")}</a></td>
        <td>${statusMap[site.status] || site.status || "—"}</td>
        <td class="exp-action-cell">
          <button class="exp-delete-btn site-delete-btn" data-id="${site.id}" title="Supprimer">
            <img src="/image/delete.png" alt="Supprimer" style="width:16px;height:16px;object-fit:contain;">
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll(".site-name-edit").forEach((btn) => {
      btn.addEventListener("click", () => openSiteForm(btn.dataset.id));
    });
    tbody.querySelectorAll(".site-delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => deleteSite(btn.dataset.id));
    });

    renderSitePagination(filtered.length);
  }).catch((err) => {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:30px;color:#ef4444;">Erreur de chargement: ${err.message || err.code}</td></tr>`;
  });
}

function renderSitePagination(totalItems) {
  const container = document.getElementById("sitePagination");
  if (!container) return;

  const totalPages = totalItems === 0 ? 0 : Math.max(1, Math.ceil(totalItems / SITES_PER_PAGE));
  if (totalPages <= 1) {
    container.innerHTML = "";
    return;
  }

  let html = `<button class="page-arrow" data-page="prev" ${siteCurrentPage === 1 ? 'disabled' : ''}>‹</button>`;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= siteCurrentPage - 1 && i <= siteCurrentPage + 1)) {
      html += `<button class="page-num ${i === siteCurrentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    } else if (i === siteCurrentPage - 2 || i === siteCurrentPage + 2) {
      html += `<span class="page-dots">...</span>`;
    }
  }

  html += `<button class="page-arrow" data-page="next" ${siteCurrentPage === totalPages ? 'disabled' : ''}>›</button>`;
  container.innerHTML = html;

  container.querySelectorAll(".page-num, .page-arrow").forEach((btn) => {
    btn.addEventListener("click", () => {
      const page = btn.dataset.page;
      if (!page) return;

      if (page === "prev" && siteCurrentPage > 1) {
        siteCurrentPage--;
      } else if (page === "next" && siteCurrentPage < totalPages) {
        siteCurrentPage++;
      } else if (page !== "prev" && page !== "next") {
        siteCurrentPage = parseInt(page);
      }

      renderSites();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

function deleteSite(id) {
  if (!confirm("Supprimer ce site ?")) return;
  const ref = siteRef();
  if (!ref) return;
  ref.child(id).remove()
    .then(() => {
      renderSites();
      updateNavCounts();
    })
    .catch((err) => alert("Échec de la suppression : " + (err.message || err.code)));
}

let siteEditId;

function openSiteForm(id) {
  const wrapper = document.getElementById("sitesFormWrapper");
  const titleEl = document.getElementById("siteModalTitle");
  const form = document.getElementById("siteForm");
  if (!wrapper || !form || !titleEl) return;

  form.reset();
  if (id) {
    siteEditId = id;
    titleEl.textContent = "Modifier le site";
    const ref = siteRef();
    if (ref) {
      ref.child(id).once("value").then((snap) => {
        const d = snap.val() || {};
        form.name.value = d.name || "";
        form.url.value = d.url || "";
        form.status.value = d.status || "active";
        form.selectorTitle.value = d.selectorTitle || "";
        form.selectorCompany.value = d.selectorCompany || "";
        form.selectorLocation.value = d.selectorLocation || "";
        form.selectorSalary.value = d.selectorSalary || "";
        form.selectorLink.value = d.selectorLink || "";
        form.selectorDescription.value = d.selectorDescription || "";
        form.selectorCompanyEmail.value = d.selectorCompanyEmail || "";
      });
    }
  } else {
    siteEditId = null;
    titleEl.textContent = "Ajouter un site";
  }

  wrapper.classList.add("active");
}

function closeSiteForm() {
  const wrapper = document.getElementById("sitesFormWrapper");
  if (wrapper) wrapper.classList.remove("active");
  siteEditId = null;
}

function handleSiteSubmit(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const payload = {
    name: (fd.get("name") || "").toString().trim(),
    url: (fd.get("url") || "").toString().trim(),
    status: (fd.get("status") || "active").toString().trim(),
    selectorTitle: (fd.get("selectorTitle") || "").toString().trim(),
    selectorCompany: (fd.get("selectorCompany") || "").toString().trim(),
    selectorLocation: (fd.get("selectorLocation") || "").toString().trim(),
    selectorSalary: (fd.get("selectorSalary") || "").toString().trim(),
    selectorLink: (fd.get("selectorLink") || "").toString().trim(),
    selectorDescription: (fd.get("selectorDescription") || "").toString().trim(),
    selectorCompanyEmail: (fd.get("selectorCompanyEmail") || "").toString().trim(),
    createdAt: Date.now()
  };

  const ref = siteRef();
  if (!ref) {
    alert("Vous devez être connecté pour enregistrer un site.");
    return;
  }

  const saveRef = siteEditId ? ref.child(siteEditId) : ref.push();
  const finish = () => {
    closeSiteForm();
    renderSites();
    updateNavCounts();
  };

  if (siteEditId) {
    saveRef.update(payload).then(() => {
      finish();
    }).catch((err) => {
      alert("Échec de la modification : " + (err.message || err.code));
    });
  } else {
    saveRef.set(payload).then(() => {
      finish();
    }).catch((err) => {
      alert("Échec de la création : " + (err.message || err.code));
    });
  }
}

const addSiteBtn = document.getElementById("addSiteBtn");
if (addSiteBtn) {
  addSiteBtn.addEventListener("click", () => openSiteForm(null));
}

const siteCloseBtn = document.getElementById("siteModalClose");
if (siteCloseBtn) {
  siteCloseBtn.addEventListener("click", closeSiteForm);
}

const siteCancelBtn = document.getElementById("siteCancel");
if (siteCancelBtn) {
  siteCancelBtn.addEventListener("click", closeSiteForm);
}

const siteForm = document.getElementById("siteForm");
if (siteForm) {
  siteForm.addEventListener("submit", handleSiteSubmit);
}

const siteSearchEl = document.getElementById("siteSearch");
if (siteSearchEl) siteSearchEl.addEventListener("input", renderSites);

// ============== CRUD INFORMATIONS / ANNONCES ==============
let infoEditId = null;

function infoRef() {
  const user = firebase.auth().currentUser;
  return user ? firebase.database().ref("informations") : null;
}

function infoStatusOf(item, now) {
  const start = item.dateDebut ? new Date(item.dateDebut + "T00:00:00").getTime() : null;
  const end = item.dateFin ? new Date(item.dateFin + "T23:59:59").getTime() : null;
  if (start && now < start) return "attente";
  if (end && now > end) return "inactive";
  return "active";
}

function renderInformations() {
  const tbody = document.getElementById("infoTableBody");
  const countEl = document.getElementById("infoTableCount");
  const search = document.getElementById("infoSearch");
  const filter = document.getElementById("infoFilter");
  if (!tbody) return;

  const ref = infoRef();
  if (!ref) return;

  tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:30px;color:#6b7280;">Chargement des informations...</td></tr>`;

  ref.once("value").then((snapshot) => {
    const list = [];
    snapshot.forEach((child) => {
      const d = child.val() || {};
      d._key = child.key;
      list.push(d);
    });

    const now = Date.now();
    list.forEach((it) => { it._status = infoStatusOf(it, now); });

    const q = (search && search.value || "").toString().toLowerCase().trim();
    const f = (filter && filter.value) || "all";
    let filtered = list;
    if (q) {
      filtered = filtered.filter((it) =>
        (it.titre || "").toLowerCase().includes(q) ||
        (it.description || "").toLowerCase().includes(q)
      );
    }
    if (f !== "all") {
      filtered = filtered.filter((it) => it._status === f);
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:30px;color:#6b7280;">Aucune information trouvée.</td></tr>`;
    } else {
      tbody.innerHTML = filtered.map((it) => {
        const period = (it.dateDebut || "—") + " → " + (it.dateFin || "—");
        const img = it.imageURL
          ? `<img src="${escapeHtml(it.imageURL)}" alt="" style="width:48px;height:48px;border-radius:8px;object-fit:cover;">`
          : `<span style="color:#94a3b8;font-size:11px;">Aucune</span>`;
        const desc = (it.description || "").length > 70 ? (it.description.substring(0, 70) + "…") : (it.description || "—");
        const statusLabel = it._status === "active" ? "En cours" : (it._status === "attente" ? "À venir" : "Terminé");
        return `
          <tr>
            <td><input type="checkbox" class="info-check" value="${escapeHtml(it._key)}"></td>
            <td>${img}</td>
            <td><div class="user-cell-name">${escapeHtml(it.titre || "Sans titre")}</div></td>
            <td>${escapeHtml(desc)}</td>
            <td>${escapeHtml(period)}</td>
            <td><span class="status-badge ${escapeHtml(it._status)}">${statusLabel}</span></td>
            <td>
              <div class="row-menu">
                <button type="button" class="row-menu-btn" data-id="${escapeHtml(it._key)}">⋯</button>
                <div class="row-dropdown" id="dropdown-${escapeHtml(it._key)}">
                  <button data-action="edit" data-id="${escapeHtml(it._key)}">✏ Modifier</button>
                  <button data-action="delete" data-id="${escapeHtml(it._key)}" class="danger">🗑 Supprimer</button>
                </div>
              </div>
            </td>
          </tr>`;
      }).join("");
    }

    if (countEl) {
      countEl.textContent = `Affichage de ${filtered.length} information${filtered.length > 1 ? "s" : ""}`;
    }

    tbody.onclick = (event) => {
      const menuBtn = event.target.closest(".row-menu-btn");
      if (menuBtn) {
        event.preventDefault();
        event.stopPropagation();
        const dropdown = document.getElementById("dropdown-" + menuBtn.dataset.id);
        if (dropdown) {
          const isOpen = dropdown.classList.contains("open");
          closeAllRowDropdowns();
          if (!isOpen) dropdown.classList.add("open");
        }
        return;
      }
      const actionBtn = event.target.closest("[data-action]");
      if (actionBtn) {
        event.preventDefault();
        event.stopPropagation();
        const key = actionBtn.getAttribute("data-id");
        const action = actionBtn.getAttribute("data-action");
        if (action === "edit") openInformationForm(key);
        else if (action === "delete") deleteInformation(key);
        closeAllRowDropdowns();
        return;
      }
      if (!event.target.closest(".row-menu")) closeAllRowDropdowns();
    };
    updateBulkInfoBtn();
  }).catch((err) => {
    console.error("[INFO] erreur lecture:", err);
    if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:24px;color:#ef4444;">Erreur de chargement: ${escapeHtml(err.message || err.code)}</td></tr>`;
  });
}

function openInformationForm(id) {
  const wrapper = document.getElementById("informationsFormWrapper");
  const titleEl = document.getElementById("infoModalTitle");
  const form = document.getElementById("informationForm");
  if (!wrapper || !form || !titleEl) return;

  form.reset();
  if (id) {
    infoEditId = id;
    titleEl.textContent = "Modifier l'information";
    const ref = infoRef();
    if (ref) {
      ref.child(id).once("value").then((snap) => {
        const d = snap.val() || {};
        form.titre.value = d.titre || "";
        form.description.value = d.description || "";
        form.dateDebut.value = d.dateDebut || "";
        form.dateFin.value = d.dateFin || "";
      });
    }
  } else {
    infoEditId = null;
    titleEl.textContent = "Ajouter une information";
  }

  wrapper.classList.add("active");
}

function closeInformationForm() {
  const wrapper = document.getElementById("informationsFormWrapper");
  if (wrapper) wrapper.classList.remove("active");
  infoEditId = null;
}

function handleInformationSubmit(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const payload = {
    titre: (fd.get("titre") || "").toString().trim(),
    description: (fd.get("description") || "").toString().trim(),
    dateDebut: (fd.get("dateDebut") || "").toString().trim(),
    dateFin: (fd.get("dateFin") || "").toString().trim(),
    updatedAt: Date.now()
  };

  if (!payload.titre || !payload.description || !payload.dateDebut || !payload.dateFin) {
    alert("Veuillez remplir le titre, la description, la date de début et la date de fin.");
    return;
  }

  const imageFile = e.target.querySelector('input[name="logo"]').files[0];
  const ref = infoRef();
  if (!ref) {
    alert("Vous devez être connecté pour enregistrer une information.");
    return;
  }

  const saveRef = infoEditId ? ref.child(infoEditId) : ref.push();

  const finish = () => {
    closeInformationForm();
    renderInformations();
    updateNavCounts();
  };

  const uploadImage = () => {
    if (!imageFile) return Promise.resolve();
    const formData = new FormData();
    formData.append("logo", imageFile);
    return fetch("/upload-logo.php", { method: "POST", body: formData })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Échec de l'upload")))
      .then((data) => {
        if (!data.success || !data.url) throw new Error("URL de l'image non retournée");
        return saveRef.update({ imageURL: data.url });
      })
      .catch((err) => {
        console.error("[INFO] upload image:", err);
        alert("L'information a été enregistrée mais l'image n'a pas pu être importée : " + err.message);
      });
  };

  if (infoEditId) {
    saveRef.update(payload).then(uploadImage).then(finish)
      .catch((err) => { console.error("[INFO] modification:", err); alert("Échec de la modification : " + (err.message || err.code)); });
  } else {
    payload.createdAt = Date.now();
    saveRef.set(payload).then(uploadImage).then(finish)
      .catch((err) => { console.error("[INFO] création:", err); alert("Échec de la création : " + (err.message || err.code)); });
  }
}

function deleteInformation(id) {
  if (!confirm("Supprimer cette information ? Cette action est irréversible.")) return;
  const ref = infoRef();
  if (!ref) return;
  ref.child(id).remove()
    .then(() => { renderInformations(); updateNavCounts(); })
    .catch((err) => { console.error("[INFO] suppression:", err); alert("Échec de la suppression : " + (err.message || err.code)); });
}

function updateBulkInfoBtn() {
  const checks = document.querySelectorAll(".info-check");
  const btn = document.getElementById("bulkDeleteInfoBtn");
  if (!btn) return;
  const anyChecked = Array.from(checks).some((c) => c.checked);
  btn.style.display = anyChecked ? "inline-block" : "none";
}

// Listeners
const addInformationBtn = document.getElementById("addInformationBtn");
if (addInformationBtn) addInformationBtn.addEventListener("click", () => openInformationForm(null));

const infoCloseBtn = document.getElementById("infoModalClose");
if (infoCloseBtn) infoCloseBtn.addEventListener("click", closeInformationForm);

const infoCancelBtn = document.getElementById("infoCancel");
if (infoCancelBtn) infoCancelBtn.addEventListener("click", closeInformationForm);

const informationForm = document.getElementById("informationForm");
if (informationForm) informationForm.addEventListener("submit", handleInformationSubmit);

const infoSearchEl2 = document.getElementById("infoSearch");
if (infoSearchEl2) infoSearchEl2.addEventListener("input", renderInformations);

const infoFilterEl = document.getElementById("infoFilter");
if (infoFilterEl) infoFilterEl.addEventListener("change", renderInformations);

const selectAllInfosEl = document.getElementById("selectAllInfos");
if (selectAllInfosEl) {
  selectAllInfosEl.addEventListener("change", () => {
    document.querySelectorAll(".info-check").forEach((c) => { c.checked = selectAllInfosEl.checked; });
    updateBulkInfoBtn();
  });
}

const bulkDeleteInfoBtn = document.getElementById("bulkDeleteInfoBtn");
if (bulkDeleteInfoBtn) {
  bulkDeleteInfoBtn.addEventListener("click", () => {
    const ids = Array.from(document.querySelectorAll(".info-check:checked")).map((c) => c.value);
    if (ids.length === 0) return;
    if (!confirm(`Supprimer ${ids.length} information(s) ? Cette action est irréversible.`)) return;
    const ref = infoRef();
    if (!ref) return;
    Promise.all(ids.map((id) => ref.child(id).remove()))
      .then(() => { renderInformations(); updateNavCounts(); })
      .catch((err) => { console.error("[INFO] suppression multiple:", err); alert("Échec de la suppression."); });
  });
}

document.addEventListener("change", (e) => {
  if (e.target && e.target.classList && e.target.classList.contains("info-check")) {
    updateBulkInfoBtn();
  }
});

// ============== GESTION DES ADMINISTRATEURS + PRIVILÈGES ==============
let adminEditId = null;
let adminEditData = null;

function usersRef() {
  return firebase.database().ref("users");
}

function buildPrivilegesGrid(privileges, superMode) {
  const grid = document.getElementById("privilegesGrid");
  if (!grid) return;
  const privs = privileges || {};
  grid.innerHTML = ADMIN_SECTIONS.map(([key, label]) => {
    const isDash = key === "dashboard";
    const checked = isDash ? true : (superMode ? true : !!privs[key]);
    const disabled = (isDash || superMode) ? "disabled" : "";
    return `<label class="priv-box ${disabled ? "disabled" : ""}">
      <input type="checkbox" class="priv-check" data-key="${key}" ${checked ? "checked" : ""} ${disabled}>
      <span>${label}</span>
    </label>`;
  }).join("");
}

function collectPrivileges() {
  const privileges = {};
  document.querySelectorAll("#privilegesGrid .priv-check").forEach((cb) => {
    if (cb.dataset.key === "dashboard") return; // toujours accordé
    privileges[cb.dataset.key] = cb.checked;
  });
  return privileges;
}

function openAdminForm(id) {
  const wrapper = document.getElementById("adminMgmtFormWrapper");
  const titleEl = document.getElementById("adminMgmtModalTitle");
  const form = document.getElementById("adminMgmtForm");
  const superToggle = form ? form.querySelector(".admin-super-toggle") : null;
  if (!wrapper || !form || !titleEl) return;

  form.reset();
  if (id) {
    adminEditId = id;
    adminEditData = null;
    titleEl.textContent = "Modifier l'administrateur";
    const ref = usersRef();
    ref.child(id).once("value").then((snap) => {
      const d = snap.val() || {};
      adminEditData = d;
      form.email.value = d.email || "";
      form.name.value = d.name || d.displayName || "";
      form.status.value = d.status === "suspendu" ? "suspendu" : "actif";
      const isSuper = d.super === true;
      if (superToggle) superToggle.checked = isSuper;
      buildPrivilegesGrid(d.privileges || {}, isSuper);
    }).catch((err) => {
      alert("Impossible de charger le profil : " + (err.message || err.code));
    });
  } else {
    adminEditId = null;
    adminEditData = null;
    titleEl.textContent = "Ajouter un administrateur";
    if (superToggle) superToggle.checked = false;
    buildPrivilegesGrid({}, false);
  }

  wrapper.classList.add("active");
}

function closeAdminForm() {
  const wrapper = document.getElementById("adminMgmtFormWrapper");
  if (wrapper) wrapper.classList.remove("active");
  adminEditId = null;
  adminEditData = null;
}

function renderAdmins() {
  const tbody = document.getElementById("adminMgmtTableBody");
  const countEl = document.getElementById("adminMgmtCount");
  const searchEl = document.getElementById("adminMgmtSearch");
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:30px;color:#6b7280;">Chargement des administrateurs...</td></tr>`;

  usersRef().once("value").then((snapshot) => {
    const data = snapshot.val() || {};
    const search = searchEl ? searchEl.value.trim().toLowerCase() : "";
    const admins = Object.keys(data)
      .map((id) => ({ id, ...data[id] }))
      .filter((u) => (u.role || "").toString().toLowerCase() === "admin")
      .sort((a, b) => (b.adminCreatedAt || b.createdAt || 0) - (a.adminCreatedAt || a.createdAt || 0))
      .filter((u) => {
        if (!search) return true;
        const name = (u.name || u.displayName || "").toLowerCase();
        const email = (u.email || "").toLowerCase();
        return name.includes(search) || email.includes(search);
      });

    if (admins.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:30px;color:#6b7280;">Aucun administrateur trouvé.</td></tr>`;
      if (countEl) countEl.textContent = "Affichage de 0 administrateur";
      return;
    }

    const statusMap = {
      actif: '<span class="status-badge success">Actif</span>',
      suspendu: '<span class="status-badge danger">Suspendu</span>'
    };

    tbody.innerHTML = admins.map((u) => {
      const name = u.name || u.displayName || "Sans nom";
      const email = u.email || "—";
      const avatar = u.avatar || u.photoURL || `https://i.pravatar.cc/64?u=${encodeURIComponent(u.id || name)}`;
      const isSuper = u.super === true;
      const privs = u.privileges || {};
      let summary;
      if (isSuper) {
        summary = '<span class="super-badge">Accès total (super)</span>';
      } else {
        const allowed = ADMIN_SECTIONS
          .filter(([key]) => key === "dashboard" || privs[key])
          .map(([, label]) => label);
        summary = allowed.length
          ? `<span class="priv-summary">${allowed.map((l) => escapeHtml(l)).join(", ")}</span>`
          : '<span class="priv-summary">Aucun privilège</span>';
      }

      const isCurrent = firebase.auth().currentUser && u.id === firebase.auth().currentUser.uid;

      return `
        <tr>
          <td>
            <div class="user-cell">
              <img src="${escapeHtml(avatar)}" alt="${escapeHtml(name)}">
              <div>
                <div class="user-cell-name">${escapeHtml(name)}${isCurrent ? ' <span style="font-size:10px;color:var(--mint-dark);font-weight:700;">(vous)</span>' : ''}</div>
                <div class="user-cell-email">${escapeHtml(email)}</div>
              </div>
            </div>
          </td>
          <td>${isSuper ? "Super admin" : "Admin"}</td>
          <td>${summary}</td>
          <td>${statusMap[u.status] || statusMap.actif}</td>
          <td>
            <div class="row-menu">
              <button type="button" class="row-menu-btn" data-id="${escapeHtml(u.id)}">⋯</button>
              <div class="row-dropdown" id="admindropdown-${escapeHtml(u.id)}">
                <button data-action="edit" data-id="${escapeHtml(u.id)}">✏ Modifier</button>
                ${isCurrent ? '' : '<button data-action="delete" data-id="' + escapeHtml(u.id) + '" class="danger">⤵ Rétrograder</button>'}
              </div>
            </div>
          </td>
        </tr>`;
    }).join("");

    if (countEl) countEl.textContent = `Affichage de ${admins.length} administrateur${admins.length > 1 ? "s" : ""}`;

    tbody.querySelectorAll(".row-menu-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const dropdown = document.getElementById("admindropdown-" + btn.dataset.id);
        if (dropdown) {
          const isOpen = dropdown.classList.contains("open");
          closeAllRowDropdowns();
          if (!isOpen) dropdown.classList.add("open");
        }
      });
    });
    tbody.querySelectorAll("[data-action]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = btn.dataset.id;
        const action = btn.dataset.action;
        closeAllRowDropdowns();
        if (action === "edit") openAdminForm(id);
        else if (action === "delete") demoteAdmin(id);
      });
    });
  }).catch((err) => {
    console.error("[ADMINS] erreur lecture:", err);
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:30px;color:#ef4444;">Erreur de chargement: ${escapeHtml(err.message || err.code)}</td></tr>`;
  });
}

function demoteAdmin(id) {
  if (!confirm("Rétrograder cet administrateur en utilisateur simple ? Ses privilèges seront supprimés.")) return;
  usersRef().child(id).once("value").then((snap) => {
    const d = snap.val() || {};
    const previousRole = d.previousRole || "chercheur_emploi";
    return usersRef().child(id).update({
      role: previousRole,
      super: false,
      privileges: null,
      adminCreatedAt: null
    });
  }).then(() => {
    renderAdmins();
    if (currentAdminData && currentAdminData.uid === id) {
      currentAdminData.role = "chercheur_emploi";
    }
  }).catch((err) => alert("Échec de la rétrogradation : " + (err.message || err.code)));
}

function findUserByEmail(email) {
  return usersRef().once("value").then((snapshot) => {
    const data = snapshot.val() || {};
    const keys = Object.keys(data);
    for (const id of keys) {
      if ((data[id].email || "").toString().toLowerCase() === email.toLowerCase()) {
        return { id, data: data[id] };
      }
    }
    return null;
  });
}

function handleAdminSubmit(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const email = (fd.get("email") || "").toString().trim().toLowerCase();
  const name = (fd.get("name") || "").toString().trim();
  const password = (fd.get("password") || "").toString();
  const status = (fd.get("status") || "actif").toString().trim();
  const superMode = e.target.querySelector(".admin-super-toggle")
    ? e.target.querySelector(".admin-super-toggle").checked
    : false;

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    alert("Veuillez saisir une adresse email valide.");
    return;
  }

  const privileges = superMode ? {} : collectPrivileges();

  const saveAdminData = (id) => {
    const payload = {
      role: "admin",
      email: email,
      super: superMode,
      privileges: superMode ? null : privileges,
      status: status,
      adminCreatedAt: adminEditId ? (adminEditData && adminEditData.adminCreatedAt) || Date.now() : Date.now(),
      updatedAt: Date.now()
    };
    if (name) payload.name = name;
    if (adminEditData && adminEditData.previousRole) payload.previousRole = adminEditData.previousRole;
    return usersRef().child(id).update(payload);
  };

  if (adminEditId) {
    // Modification d'un admin existant (pas de changement d'auth)
    saveAdminData(adminEditId)
      .then(() => {
        closeAdminForm();
        renderAdmins();
        if (currentAdminData && currentAdminData.uid === adminEditId) {
          currentAdminData.super = superMode;
          currentAdminData.privileges = superMode ? null : privileges;
          applyAdminPrivilegesToNav();
        }
      })
      .catch((err) => alert("Échec de la modification : " + (err.message || err.code)));
    return;
  }

  // Création / promotion
  findUserByEmail(email).then((existing) => {
    if (existing) {
      // Promotion d'un compte existant : on conserve son uid et ses données
      adminEditData = existing.data;
      if (!adminEditData.previousRole) adminEditData.previousRole = existing.data.role || "chercheur_emploi";
      saveAdminData(existing.id)
        .then(() => {
          closeAdminForm();
          renderAdmins();
          alert("L'utilisateur " + email + " a été promu administrateur.");
        })
        .catch((err) => alert("Échec de la promotion : " + (err.message || err.code)));
      return;
    }

    // Aucun compte : création d'un nouveau compte Firebase Auth + entrée users
    if (!password || password.length < 6) {
      alert("Le mot de passe est requis (6 caractères minimum) pour créer un nouveau compte.");
      return;
    }
    window.__creatingAdmin = true; // empêche la redirection de la garde pendant la création
    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then((cred) => {
        const uid = cred.user.uid;
        const payload = {
          uid: uid,
          email: email,
          name: name || email.split("@")[0],
          role: "admin",
          super: superMode,
          privileges: superMode ? null : privileges,
          status: status,
          adminCreatedAt: Date.now(),
          createdAt: Date.now(),
          previousRole: "chercheur_emploi"
        };
        return usersRef().child(uid).set(payload);
      })
      .then(() => {
        closeAdminForm();
        window.__creatingAdmin = false;
        alert("Compte administrateur créé. Rechargement de la console...");
        window.location.reload();
      })
      .catch((err) => {
        window.__creatingAdmin = false;
        alert("Échec de la création : " + (err.message || err.code));
      });
  }).catch((err) => alert("Erreur : " + (err.message || err.code)));
}

// Listeners
const addAdminBtn = document.getElementById("addAdminBtn");
if (addAdminBtn) addAdminBtn.addEventListener("click", () => openAdminForm(null));

const adminMgmtClose = document.getElementById("adminMgmtClose");
if (adminMgmtClose) adminMgmtClose.addEventListener("click", closeAdminForm);

const adminMgmtCancel = document.getElementById("adminMgmtCancel");
if (adminMgmtCancel) adminMgmtCancel.addEventListener("click", closeAdminForm);

const adminMgmtForm = document.getElementById("adminMgmtForm");
if (adminMgmtForm) adminMgmtForm.addEventListener("submit", handleAdminSubmit);

const adminMgmtSearch = document.getElementById("adminMgmtSearch");
if (adminMgmtSearch) adminMgmtSearch.addEventListener("input", renderAdmins);

const adminSuperToggle = document.querySelector(".admin-super-toggle");
if (adminSuperToggle) {
  adminSuperToggle.addEventListener("change", () => {
    const superOn = adminSuperToggle.checked;
    document.querySelectorAll("#privilegesGrid .priv-check").forEach((cb) => {
      if (cb.dataset.key === "dashboard") return;
      cb.checked = superOn;
      cb.disabled = superOn;
      cb.closest(".priv-box").classList.toggle("disabled", superOn);
    });
  });
}
