function showToast(message) {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.cssText = "position:fixed;bottom:20px;right:20px;background:#1f2937;color:#fff;padding:10px 18px;border-radius:8px;font-size:12px;font-weight:600;z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,0.18);opacity:0;transition:opacity .2s ease;";
  document.body.appendChild(toast);
  requestAnimationFrame(() => { toast.style.opacity = "1"; });
  setTimeout(() => { toast.style.opacity = "0"; setTimeout(() => toast.remove(), 200); }, 2500);
}

let allUsers = [];
let activeUserId = null;
let currentFilter = "all";
let pendingAttachment = null;
let currentConversationId = null;

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

function getFirebaseIdToken() {
  return new Promise((resolve, reject) => {
    const user = firebase.auth().currentUser;
    if (!user) return reject("Utilisateur non connecté");
    user.getIdToken().then(token => resolve(token)).catch(reject);
  });
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
    if (activeUserId) {
      updateChatHeader(allUsers.find(u => u.id === activeUserId) || allUsers[0]);
      loadConversationMessages(activeUserId);
    }
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
          <span class="msg-time">${m.time} <span class="msg-status">${getMessageStatusIcon(m, isUser)}</span></span>
        </div>
      </div>
    `;
  }).join("");

  container.scrollTop = container.scrollHeight;
}

let currentMessages = [...initialMessages];

// ============== GESTION DES PIÈCES JOINTES ==============
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

// ============== UPLOAD VERS CLOUDINARY ==============
function uploadToCloudinary(file, type) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "vera2026");
  formData.append("folder", type === "image" ? "messages/images" : "messages/files");

  return fetch("https://api.cloudinary.com/v1_1/demjpkcfj/upload", {
    method: "POST",
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    if (data.secure_url) {
      return { url: data.secure_url, publicId: data.public_id };
    }
    throw new Error(data.error?.message || "Upload Cloudinary échoué");
  });
}

// ============== SAUVEGARDE MESSAGE DANS FIREBASE ==============
function saveMessageToFirebase(recipientId, messageData) {
  const user = firebase.auth().currentUser;
  if (!user) return Promise.reject("Utilisateur non connecté");

  const conversationId = getConversationId(user.uid, recipientId);
  const messageRef = firebase.database().ref("messages/" + conversationId).push();
  const messageWithId = {
    ...messageData,
    id: messageRef.key,
    senderUid: user.uid,
    timestamp: Date.now(),
    read: false
  };

  return messageRef.set(messageWithId)
    .then(() => {
      if (recipientId === "vera") {
        return firebase.database().ref("conversations/" + user.uid + "/vera").update({
          lastMessage: messageData.text || (messageData.type === "image" ? "📷 Photo" : messageData.fileName || "Fichier"),
          lastTimestamp: messageWithId.timestamp,
          recipientId: recipientId,
          unread: false
        });
      }
      return firebase.database().ref("conversations/" + user.uid + "/" + recipientId).update({
        lastMessage: messageData.text || (messageData.type === "image" ? "📷 Photo" : messageData.fileName || "Fichier"),
        lastTimestamp: messageWithId.timestamp,
        recipientId: recipientId
      });
    })
    .then(() => {
      if (recipientId === "vera") {
        return Promise.resolve();
      }
      return firebase.database().ref("conversations/" + recipientId + "/" + user.uid).update({
        lastMessage: messageData.text || (messageData.type === "image" ? "📷 Photo" : messageData.fileName || "Fichier"),
        lastTimestamp: messageWithId.timestamp,
        recipientId: user.uid,
        unread: true
      });
    });
}

function getConversationId(uid1, uid2) {
  return [uid1, uid2].sort().join("_");
}

// ============== CHARGEMENT CONVERSATIONS ==============
function loadConversationMessages(recipientId) {
  const user = firebase.auth().currentUser;
  if (!user) return;

  currentConversationId = getConversationId(user.uid, recipientId);
  const container = document.getElementById("chatMessages");
  container.innerHTML = '<div class="day-divider">Chargement...</div>';

  firebase.database().ref("messages/" + currentConversationId)
    .orderByChild("timestamp")
    .once("value")
    .then(snapshot => {
      const data = snapshot.val() || {};
      const messages = Object.keys(data).map(key => ({ id: key, ...data[key] }));
      messages.sort((a, b) => a.timestamp - b.timestamp);
      renderConversationMessages(messages);
    })
    .catch(err => {
      container.innerHTML = '<div class="day-divider">Erreur de chargement</div>';
      console.error(err);
    });
}

function renderConversationMessages(messages) {
  const container = document.getElementById("chatMessages");
  container.innerHTML = messages.map(m => {
    const isUser = m.senderUid === (firebase.auth().currentUser?.uid);
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

    const rowClass = isUser ? "user" : "vera";
    const bubbleStyle = isUser 
      ? 'background:#7dd3fc;color:#0f1730;border-color:#38bdf8;' 
      : 'background:#86efac;color:#0f1730;border-color:#22c55e;';

    return `
      <div class="msg-row ${rowClass}">
        ${!isUser ? `<div class="msg-avatar-sm">${getAvatarForRecipient()}</div>` : ""}
        <div class="msg-bubble" style="${bubbleStyle}">
          ${contentHtml}
          <span class="msg-time" style="color:${isUser ? '#0c4a6e' : '#14532d'}">${formatTime(m.timestamp)} <span class="msg-status">${getMessageStatusIcon(m, isUser)}</span></span>
        </div>
      </div>
    `;
  }).join("");

  container.scrollTop = container.scrollHeight;
}

function appendUserMessageToChat(messageData) {
  const container = document.getElementById("chatMessages");
  if (!container) return;
  const typing = document.getElementById("typingIndicator");
  if (typing) typing.remove();

  const messageHtml = `
    <div class="msg-row user">
      <div class="msg-bubble" style="background:#7dd3fc;color:#0f1730;border-color:#38bdf8;">
        ${escapeHtml(messageData.text || "")}
        <span class="msg-time" style="color:#0c4a6e;">${formatTime(Date.now())} <span class="msg-status">${getMessageStatusIcon({read:false}, true)}</span></span>
      </div>
    </div>
  `;
  container.insertAdjacentHTML("beforeend", messageHtml);
  container.scrollTop = container.scrollHeight;
}

function appendVeraMessageToChat(messageData) {
  const container = document.getElementById("chatMessages");
  if (!container) return;
  const typing = document.getElementById("typingIndicator");
  if (typing) typing.remove();

  const messageHtml = `
    <div class="msg-row vera">
      <div class="msg-avatar-sm">${getAvatarForRecipient()}</div>
      <div class="msg-bubble" style="background:#86efac;color:#0f1730;border-color:#22c55e;">
        ${escapeHtml(messageData.text || "")}
        <span class="msg-time" style="color:#14532d;">${formatTime(Date.now())}</span>
      </div>
    </div>
  `;
  container.insertAdjacentHTML("beforeend", messageHtml);
  container.scrollTop = container.scrollHeight;
}

function showTypingIndicator() {
  const container = document.getElementById("chatMessages");
  if (!container) return;
  hideTypingIndicator();
  const typingHtml = `
    <div class="msg-row vera" id="typingIndicator">
      <div class="msg-avatar-sm">${getAvatarForRecipient()}</div>
      <div class="typing-indicator" style="background:#86efac;border-color:#22c55e;color:#14532d;">
        <div class="typing-dots"><span></span><span></span><span></span></div>
        <span>VERA est en train d'écrire...</span>
      </div>
    </div>
  `;
  container.insertAdjacentHTML("beforeend", typingHtml);
  container.scrollTop = container.scrollHeight;
  console.log("[VERA] typing indicator shown");
}

function hideTypingIndicator() {
  const indicator = document.getElementById("typingIndicator");
  if (indicator) indicator.remove();
}

function getAvatarForRecipient() {
  const user = allUsers.find(u => u.id === activeUserId);
  return user ? user.avatar : "🤖";
}

function formatTime(timestamp) {
  const d = new Date(timestamp);
  return d.getHours().toString().padStart(2, "0") + ":" + d.getMinutes().toString().padStart(2, "0");
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function getMessageStatusIcon(message, isUser) {
  if (!isUser) return "";
  if (message.read) return '<span class="status-read">✓✓</span>';
  return '<span class="status-sent">✓</span>';
}

// ============== ENVOI DE MESSAGE ==============
function sendMessage() {
  const input = document.getElementById("chatInput");
  const text = input.value.trim();
  const recipientId = activeUserId;

  if (!recipientId) {
    showToast("Veuillez sélectionner un destinataire");
    return;
  }

  if (!text && !pendingAttachment) return;

  const processMessage = (fileUrl = null, resourceType = "text") => {
    const messageData = {
      text: text || "",
      type: pendingAttachment ? pendingAttachment.type : (resourceType === "image" ? "image" : resourceType === "raw" && pendingAttachment?.type === "file" ? "file" : "text")
    };

    if (pendingAttachment) {
      messageData.fileUrl = fileUrl || pendingAttachment.url;
      messageData.fileName = pendingAttachment.fileName || "";
      messageData.fileSize = pendingAttachment.fileSize || "";
    } else if (fileUrl) {
      messageData.fileUrl = fileUrl;
      messageData.fileName = "";
      messageData.fileSize = "";
    }

    saveMessageToFirebase(recipientId, messageData)
      .then(() => {
        input.value = "";
        clearPreview();
        loadConversationMessages(recipientId);
        showToast("Message envoyé");
      })
      .catch(err => {
        console.error("Erreur envoi message:", err);
        showToast("Erreur lors de l'envoi");
      });
  };

  if (pendingAttachment) {
    const formData = new FormData();
    formData.append("file", pendingAttachment.file);

    getFirebaseIdToken().then(idToken => {
      return fetch("/messages/upload", {
        method: "POST",
        body: formData,
        headers: {
          "Authorization": "Bearer " + idToken
        }
      });
    })
    .then(res => res.json())
    .then(data => {
      if (data.success && data.url) {
        processMessage(data.url, data.resourceType || "auto");
      } else {
        throw new Error(data.message || "Upload échoué");
      }
    })
    .catch(err => {
      console.error("Erreur upload pièce jointe:", err);
      showToast("Erreur lors de l'upload du fichier");
    });
  } else if (recipientId === "vera") {
    const userMessage = {
      text: text || "",
      type: "text"
    };

    saveMessageToFirebase(recipientId, userMessage)
      .then(() => {
        clearPreview();
        input.value = "";
        appendUserMessageToChat(userMessage);
        showTypingIndicator();
        return getFirebaseIdToken();
      })
      .then(idToken => {
        return fetch("/messages/send", {
          method: "POST",
          headers: {
            "Authorization": "Bearer " + idToken,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ message: text, recipientId: recipientId })
        });
      })
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => {
            throw new Error(data.message || "Erreur HTTP " + res.status);
          });
        }
        return res.json();
      })
      .then(data => {
        hideTypingIndicator();
        if (data.success && data.reply) {
          const replyData = {
            text: data.reply,
            type: "text"
          };
          return saveMessageToFirebase(recipientId, replyData).then(() => replyData);
        }
        throw new Error("Réponse VERA vide");
      })
      .then(replyData => {
        if (replyData) {
          appendVeraMessageToChat(replyData);
        }
      })
      .catch(err => {
        hideTypingIndicator();
        console.error("Erreur chat VERA:", err);
        showToast("Erreur lors de l'envoi");
      });
  } else {
    processMessage();
  }
}

// ============== GESTION DES PIÈCES JOINTES ==============
function handleImageSelect(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    pendingAttachment = {
      type: "image",
      file: file,
      url: event.target.result,
      fileName: file.name,
      fileSize: (file.size / 1024).toFixed(1) + " KB"
    };
    showPreview(pendingAttachment);
  };
  reader.readAsDataURL(file);
}

function handleFileSelect(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    pendingAttachment = {
      type: "file",
      file: file,
      url: event.target.result,
      fileName: file.name,
      fileSize: (file.size / 1024).toFixed(1) + " KB"
    };
    showPreview(pendingAttachment);
  };
  reader.readAsDataURL(file);
}

function showPreview(attachment) {
  const previewArea = document.getElementById("previewArea");
  const previewContent = document.getElementById("previewContent");
  previewArea.style.display = "block";

  if (attachment.type === "image") {
    previewContent.innerHTML = `
      <div class="preview-item">
        <img src="${attachment.url}" alt="aperçu">
        <button class="preview-remove" onclick="clearPreview()">×</button>
      </div>
      <div style="font-size:11px;color:var(--muted);">${escapeHtml(attachment.fileName)} (${attachment.fileSize})</div>
    `;
  } else {
    previewContent.innerHTML = `
      <div class="preview-item">
        <div class="preview-file">
          <span>📄</span>
          <span class="file-name">${escapeHtml(attachment.fileName)}</span>
          <span style="color:var(--muted);">${attachment.fileSize}</span>
        </div>
        <button class="preview-remove" onclick="clearPreview()">×</button>
      </div>
    `;
  }
}

function clearPreview() {
  pendingAttachment = null;
  document.getElementById("previewArea").style.display = "none";
  document.getElementById("previewContent").innerHTML = "";
  document.getElementById("imageInput").value = "";
  document.getElementById("fileInput").value = "";
}

// ============== INITIALISATION DES BOUTONS ==============
document.getElementById("attachImageBtn")?.addEventListener("click", () => {
  document.getElementById("imageInput").click();
});

document.getElementById("attachFileBtn")?.addEventListener("click", () => {
  document.getElementById("fileInput").click();
});

document.getElementById("imageInput")?.addEventListener("change", handleImageSelect);
document.getElementById("fileInput")?.addEventListener("change", handleFileSelect);

document.getElementById("sendAttachment")?.addEventListener("click", () => {
  sendMessage();
});

document.getElementById("cancelAttachment")?.addEventListener("click", () => {
  clearPreview();
});

document.getElementById("sendBtn").addEventListener("click", sendMessage);
document.getElementById("chatInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

// ============== CLIC SUR UTILISATEUR ==============
document.getElementById("usersList").addEventListener("click", (e) => {
  const item = e.target.closest(".conv-item");
  if (!item) return;
  const userId = item.dataset.id;
  const user = allUsers.find(u => u.id === userId);
  if (!user) return;
  activeUserId = userId;
  user.unread = 0;
  updateChatHeader(user);
  loadConversationMessages(user.id);
  renderUsersList();
});

// ============== INIT ==============
loadUsersFromFirebase();
