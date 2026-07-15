// ============== DONNÉES CONVERSATIONS ==============
const conversations = [
  {
    id: 1, type: "vera", name: "VERA (Assistant IA)", avatar: "🤖", avatarBg: "linear-gradient(135deg,#5b8bff,#1e40c9)",
    time: "10:30", preview: "Nous avons trouvé 3 nouvelles opportunités...", subtitle: "Bonne nouvelle ! 🎉", unread: 2
  },
  {
    id: 2, type: "entreprises", name: "TechNova Solutions", avatar: "T", avatarBg: "#0ea5e9",
    time: "09:15", preview: "Bonjour Junior, votre profil nous intéresse...", subtitle: "Marie Dubois", unread: 1
  },
  {
    id: 3, type: "vera", name: "VERA (Assistant IA)", avatar: "🤖", avatarBg: "linear-gradient(135deg,#5b8bff,#1e40c9)",
    time: "Hier", preview: "Je viens de postuler automatiquement pour...", subtitle: "Candidature envoyée ✅", unread: 1
  },
  {
    id: 4, type: "admin", name: "Admin VERA", avatar: "V", avatarBg: "#3b6bf5",
    time: "Hier", preview: "Nous avons mis à jour votre profil pour...", subtitle: "M. Patrice (Admin)", unread: 0
  },
  {
    id: 5, type: "entreprises", name: "AlphaTech Academy", avatar: "A", avatarBg: "#8b5cf6",
    time: "2 mai", preview: "Votre candidature au programme...", subtitle: "Équipe Recrutement", unread: 0
  },
  {
    id: 6, type: "vera", name: "VERA (Assistant IA)", avatar: "🤖", avatarBg: "linear-gradient(135deg,#5b8bff,#1e40c9)",
    time: "1 mai", preview: "Voici quelques conseils personnalisés pour...", subtitle: "Conseil carrière 💡", unread: 0
  },
  {
    id: 7, type: "entreprises", name: "Innovatech Group", avatar: "I", avatarBg: "#16a34a",
    time: "30 avr", preview: "Invitation à un entretien", subtitle: "Recruteur", unread: 0
  },
  {
    id: 8, type: "admin", name: "Admin VERA", avatar: "V", avatarBg: "#3b6bf5",
    time: "28 avr", preview: "Votre demande a été résolue", subtitle: "Support Utilisateur", unread: 0
  }
];

let activeConvId = 1;
let currentFilter = "all";

// ============== RENDU LISTE CONVERSATIONS ==============
function renderConvList() {
  const list = document.getElementById("convList");
  const search = document.getElementById("convSearchInput").value.toLowerCase();

  const filtered = conversations.filter(c => {
    const typeOk =
      currentFilter === "all" ? true :
      currentFilter === "unread" ? c.unread > 0 :
      currentFilter === "archived" ? false :
      c.type === currentFilter;
    const searchOk = (c.name + " " + c.subtitle).toLowerCase().includes(search);
    return typeOk && searchOk;
  });

  list.innerHTML = filtered.map(c => `
    <div class="conv-item ${c.id === activeConvId ? 'active' : ''}" data-id="${c.id}">
      <div class="conv-avatar" style="background:${c.avatarBg}">${c.avatar}</div>
      <div class="conv-body">
        <div class="conv-top">
          <span class="conv-name">${c.name}</span>
          <span class="conv-time">${c.time}</span>
        </div>
        <div class="conv-sub">${c.subtitle}</div>
        <div class="conv-preview">${c.preview}</div>
      </div>
      ${c.unread > 0 ? `<span class="conv-unread">${c.unread}</span>` : ""}
    </div>
  `).join("");

  list.querySelectorAll(".conv-item").forEach(item => {
    item.addEventListener("click", () => {
      activeConvId = parseInt(item.dataset.id);
      const conv = conversations.find(c => c.id === activeConvId);
      conv.unread = 0;
      renderConvList();
      updateChatHeader(conv);
    });
  });
}

function updateChatHeader(conv) {
  document.getElementById("chatAvatar").textContent = conv.avatar;
  document.getElementById("chatAvatar").style.background = conv.avatarBg;
  document.querySelector(".chat-name").innerHTML = conv.name + (conv.type === "vera" ? ' <span class="ia-badge">IA</span>' : "");
}

// ============== FILTRES / TABS ==============
document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    currentFilter = tab.dataset.filter;
    renderConvList();
  });
});

document.getElementById("convSearchInput").addEventListener("input", renderConvList);

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
renderConvList();
renderMessages(currentMessages);
