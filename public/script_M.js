let allUsers = [];
let activeUserId = null;
let currentFilter = "all";

function getInitials(firstName, lastName) {
  const first = (firstName || "").trim().charAt(0).toUpperCase();
  const last = (lastName || "").trim().charAt(0).toUpperCase();
  return first || last || "?";
}

function getAvatarColor(name) {
  const colors = ["#3b6bf5", "#16a34a", "#8b5cf6", "#0ea5e9", "#f59e0b", "#ef4444"];
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function getUserType(role) {
  const r = (role || "").toLowerCase();
  if (r.includes("admin")) return "admin";
  if (r.includes("entreprise") || r.includes("company") || r.includes("recrut")) return "entreprises";
  return "user";
}

function isAdminRole(role) {
  const r = String(role || "").toLowerCase();
  return r === "admin" || r === "administrateur" || r.includes("admin");
}

function updateTabCounts() {
  const allCount = allUsers.length;
  const unreadCount = allUsers.filter(u => u.unread > 0).length;
  const allTab = document.getElementById("tabCountAll");
  const unreadTab = document.getElementById("tabCountUnread");
  if (allTab) allTab.textContent = allCount > 0 ? " " + allCount : "";
  if (unreadTab) unreadTab.textContent = unreadCount > 0 ? " " + unreadCount : "";
}

function loadUsersFromFirebase() {
  const user = firebase.auth().currentUser;
  if (!user) {
    firebase.auth().onAuthStateChanged((u) => {
      if (u) loadUsersFromFirebase();
    });
    return;
  }

  firebase.database().ref("users").once("value").then((snapshot) => {
    const rawData = snapshot.val();
    console.log("[MESSAGES] raw users snapshot:", rawData);
    console.log("[MESSAGES] snapshot exists:", snapshot.exists());

    const data = rawData || {};
    const adminUsers = [];
    const debugRoles = [];

    Object.keys(data).forEach((uid) => {
      console.log("[MESSAGES] processing uid:", uid, "currentUser:", user.uid);
      if (uid === user.uid) {
        console.log("[MESSAGES] skipping current user");
        return;
      }
      const u = data[uid];
      const fullName = (u.fullName || u.firstName || "").trim();
      const email = (u.email || "").trim();
      const displayName = fullName || email || "Utilisateur";
      console.log("[MESSAGES] user data:", { uid, fullName, email, role: u.role, jobTitle: u.jobTitle });
      
      if (!displayName || displayName === "Utilisateur") {
        console.log("[MESSAGES] skipping - no displayName");
        return;
      }

      const roleField = u.role || u.jobTitle || "";
      debugRoles.push({ uid, fullName: displayName, roleField });

      const role = String(roleField).toLowerCase();
      console.log("[MESSAGES] role check:", role, "isAdmin:", isAdminRole(role));
      
      if (!isAdminRole(role)) {
        console.log("[MESSAGES] skipping - not admin");
        return;
      }

      const firstName = fullName || email || "Utilisateur";
      const lastName = "";
      const initials = getInitials(firstName, lastName);
      const color = getAvatarColor(displayName);

      adminUsers.push({
        id: uid,
        type: "admin",
        name: displayName,
        role: roleField || "Admin",
        avatar: initials,
        avatarBg: color,
        status: u.online !== false ? "en ligne" : "hors ligne",
        unread: 0
      });
    });

    console.log("[MESSAGES] users roles:", debugRoles);
    console.log("[MESSAGES] admins found:", adminUsers.length);

    const veraUser = {
      id: "vera",
      type: "vera",
      name: "VERA (Assistant IA)",
      role: "Assistant IA",
      avatar: "🤖",
      avatarBg: "linear-gradient(135deg,#5b8bff,#1e40c9)",
      status: "en ligne",
      unread: 2
    };

    allUsers = [veraUser, ...adminUsers];
    if (!activeUserId && allUsers.length > 0) activeUserId = allUsers[0].id;
    updateTabCounts();
    renderUsersList();
    if (activeUserId) updateChatHeader(allUsers.find(u => u.id === activeUserId) || allUsers[0]);
  }).catch((err) => {
    console.error("Erreur chargement utilisateurs:", err);
  });
}

// ============== RENDU LISTE UTILISATEURS ==============
function renderUsersList() {
  const list = document.getElementById("usersList");
  const search = document.getElementById("userSearchInput").value.toLowerCase();

  const filtered = allUsers.filter(u => {
    const typeOk =
      currentFilter === "all" ? true :
      currentFilter === "unread" ? u.unread > 0 :
      currentFilter === "archived" ? false :
      u.type === currentFilter;
    const searchOk = (u.name + " " + u.role).toLowerCase().includes(search);
    return typeOk && searchOk;
  });

  list.innerHTML = filtered.map(u => `
    <div class="conv-item ${u.id === activeUserId ? 'active' : ''}" data-id="${u.id}">
      <div class="conv-avatar" style="background:${u.avatarBg}">${u.avatar}</div>
      <div class="conv-body">
        <div class="conv-top">
          <span class="conv-name">${u.name}</span>
        </div>
        <div class="conv-sub">${u.role}</div>
        <div class="conv-preview" style="color:${u.status === 'en ligne' ? 'var(--green)' : 'var(--muted)'}">
          ${u.status === 'en ligne' ? '● En ligne' : '● Hors ligne'}
        </div>
      </div>
      ${u.unread > 0 ? `<span class="conv-unread">${u.unread}</span>` : ""}
    </div>
  `).join("");

  list.querySelectorAll(".conv-item").forEach(item => {
    item.addEventListener("click", () => {
      activeUserId = item.dataset.id;
      const user = allUsers.find(u => u.id === activeUserId);
      if (user) {
        user.unread = 0;
        updateChatHeader(user);
      }
      renderUsersList();
    });
  });
}

function updateChatHeader(user) {
  document.getElementById("chatAvatar").textContent = user.avatar;
  document.getElementById("chatAvatar").style.background = user.avatarBg;
  document.querySelector(".chat-name").innerHTML = user.name + (user.role === "Assistant IA" ? ' <span class="ia-badge">IA</span>' : "");
}

// ============== FILTRES / TABS ==============
document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    currentFilter = tab.dataset.filter;
    renderUsersList();
  });
});

// ============== RECHERCHE UTILISATEURS ==============
document.getElementById("userSearchInput").addEventListener("input", renderUsersList);

// ============== INITIALISATION ==============
loadUsersFromFirebase();

// ============== CHAT MESSAGES (conversation VERA initiale) ==============
const initialMessages = [
  { day: true, text: "Aujourd'hui" },
  {
    from: "vera",
    text: "Bonne nouvelle, Junior ! 🎉 Nous avons trouvé 3 nouvelles opportunités qui correspondent parfaitement à votre profil de Product Designer. Souhaitez-vous les découvrir ?",
    time: "10:30",
    actions: ["Voir les opportunités", "Plus tard"]
  },
  { from: "user", text: "Oui, montre-les moi s'il te plait !", time: "10:32" },
  {
    from: "vera",
    text: "Parfait ! Voici les 3 opportunités sélectionnées pour vous :",
    time: "10:33",
    jobs: [
      { logo: "T", bg: "#0ea5e9", title: "Product Designer Senior", sub: "TechNova Solutions · Lyon, France · CDI", match: "Match 95%" },
      { logo: "I", bg: "#16a34a", title: "UX/UI Designer", sub: "Innovatech Group · Paris, France · CDI", match: "Match 89%" },
      { logo: "S", bg: "#8b5cf6", title: "Lead Product Designer", sub: "StartUp Studio · Télétravail · CDI", match: "Match 82%" }
    ],
    link: "Voir toutes les opportunités →"
  },
  { from: "user", text: "Merci VERA, je vais regarder ça.", time: "10:34", read: true },
  {
    from: "vera",
    text: "Avec plaisir ! 😊 N'hésitez pas si vous avez des questions ou si vous souhaitez que je postule pour vous.",
    time: "10:34"
  }
];

function renderMessages(messages) {
  const container = document.getElementById("chatMessages");
  container.innerHTML = messages.map(m => {
    if (m.day) return `<div class="day-divider">${m.text}</div>`;

    const isUser = m.from === "user";
    let jobsHtml = "";
    if (m.jobs) {
      jobsHtml = `<div class="job-suggestion-list">` + m.jobs.map(j => `
        <div class="job-suggestion">
          <div class="job-sug-logo" style="background:${j.bg}">${j.logo}</div>
          <div class="job-sug-info">
            <div class="job-sug-title">${j.title}</div>
            <div class="job-sug-sub">${j.sub}</div>
          </div>
          <div class="job-sug-match">${j.match}</div>
        </div>
      `).join("") + `</div>` + (m.link ? `<a href="#" class="job-sug-link">${m.link}</a>` : "");
    }

    let actionsHtml = "";
    if (m.actions) {
      actionsHtml = `<div class="msg-actions">` + m.actions.map(a => `<button class="msg-btn">${a}</button>`).join("") + `</div>`;
    }

    return `
      <div class="msg-row ${isUser ? "user" : ""}">
        ${!isUser ? `<div class="msg-avatar-sm">🤖</div>` : ""}
        <div class="msg-bubble">
          ${m.text}
          ${jobsHtml}
          ${actionsHtml}
          <span class="msg-time">${m.time}${m.read ? " ✓✓" : ""}</span>
        </div>
      </div>
    `;
  }).join("");

  container.scrollTop = container.scrollHeight;
}

let currentMessages = [...initialMessages];

// ============== ENVOI DE MESSAGE ==============
function sendMessage() {
  const input = document.getElementById("chatInput");
  const text = input.value.trim();
  if (!text) return;

  currentMessages.push({ from: "user", text: text, time: currentTime() });
  renderMessages(currentMessages);
  input.value = "";

  // Réponse automatique simulée de VERA
  setTimeout(() => {
    currentMessages.push({
      from: "vera",
      text: "Merci pour votre message ! Je traite votre demande et reviens vers vous très rapidement.",
      time: currentTime()
    });
    renderMessages(currentMessages);
  }, 900);
}

function currentTime() {
  const d = new Date();
  return d.getHours().toString().padStart(2, "0") + ":" + d.getMinutes().toString().padStart(2, "0");
}

document.getElementById("sendBtn").addEventListener("click", sendMessage);
document.getElementById("chatInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

// ============== BOUTONS ACTIONS DANS LES MESSAGES ==============
document.getElementById("chatMessages").addEventListener("click", (e) => {
  if (e.target.matches(".msg-btn")) {
    const original = e.target.textContent;
    e.target.textContent = "✓ " + original;
    e.target.disabled = true;
  }
});

// ============== NOUVEAU MESSAGE ==============
document.getElementById("newMsgBtn").addEventListener("click", () => {
  const btn = document.getElementById("newMsgBtn");
  const original = btn.textContent;
  btn.textContent = "✓ Fonctionnalité à venir";
  setTimeout(() => { btn.textContent = original; }, 1500);
});

// ============== TELECHARGEMENT FICHIERS ==============
document.querySelectorAll(".file-download").forEach(btn => {
  btn.addEventListener("click", () => {
    const original = btn.textContent;
    btn.textContent = "✓";
    setTimeout(() => { btn.textContent = original; }, 1200);
  });
});

// ============== INIT ==============
loadUsersFromFirebase();
renderMessages(currentMessages);
