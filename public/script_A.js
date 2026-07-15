// ============== DONNÉES CATEGORIES ==============
const categories = [
  { icon: "👤", bg: "#e7effe", title: "Compte & Profil", desc: "Gérez votre compte, vos informations personnelles et vos préférences." },
  { icon: "💼", bg: "#e6f7ec", title: "Candidatures", desc: "Tout savoir sur vos candidatures et le processus de recrutement." },
  { icon: "👛", bg: "#f3ecff", title: "Offres d'emploi", desc: "Rechercher, filtrer et postuler aux meilleures opportunités." },
  { icon: "🏦", bg: "#fdf1de", title: "Paiements & Abonnement", desc: "Gérez votre abonnement Premium et vos paiements." },
  { icon: "🎓", bg: "#fce7f3", title: "Formations & Compétences", desc: "Explorez les formations recommandées et développez vos compétences." },
  { icon: "🧑‍🏫", bg: "#e0f6ff", title: "Coaching & Carrière", desc: "Bénéficiez de conseils personnalisés pour booster votre carrière." },
  { icon: "🛡", bg: "#e7effe", title: "Sécurité & Confidentialité", desc: "Vos données, votre sécurité et la confidentialité sur VERA." },
  { icon: "⚏", bg: "#f1f5f9", title: "Autres sujets", desc: "Découvrez d'autres sujets d'aide et ressources utiles." }
];

const resources = [
  { icon: "📖", title: "Centre d'aide", desc: "Consultez tous nos articles et guides." },
  { icon: "🧭", title: "Guides pratiques", desc: "Des guides étape par étape pour vous aider." },
  { icon: "🎬", title: "Vidéos tutoriels", desc: "Apprenez à utiliser VERA en vidéo." },
  { icon: "📣", title: "Actualités", desc: "Nouveautés et mises à jour de la plateforme." }
];

function renderCategories() {
  document.getElementById("categoriesGrid").innerHTML = categories.map(c => `
    <div class="category-card">
      <div class="category-icon" style="background:${c.bg}">${c.icon}</div>
      <div class="category-title">${c.title}</div>
      <div class="category-desc">${c.desc}</div>
      <div class="category-link">Voir les articles →</div>
    </div>
  `).join("");
}

function renderResources() {
  document.getElementById("resourcesGrid").innerHTML = resources.map(r => `
    <div class="resource-card">
      <div class="resource-icon">${r.icon}</div>
      <div class="resource-title">${r.title}</div>
      <div class="resource-desc">${r.desc}</div>
      <div class="resource-arrow">→</div>
    </div>
  `).join("");
}

// ============== FAQ CHIPS -> remplissent la recherche ==============
document.querySelectorAll(".chip").forEach(chip => {
  chip.addEventListener("click", () => {
    document.getElementById("helpSearchInput").value = chip.textContent;
  });
});

// ============== RECHERCHE ==============
document.getElementById("helpSearchBtn").addEventListener("click", () => {
  const val = document.getElementById("helpSearchInput").value.trim();
  const btn = document.getElementById("helpSearchBtn");
  const original = btn.textContent;
  btn.textContent = "🔍 Recherche...";
  setTimeout(() => {
    btn.textContent = val ? "✓ Résultats trouvés" : original;
    setTimeout(() => { btn.textContent = original; }, 1200);
  }, 600);
});

// ============== CHAT SUPPORT ==============
const initialChat = [
  { from: "support", text: "Bonjour Junior 👋 Comment pouvons-nous vous aider aujourd'hui ?", time: "10:30" },
  { from: "user", text: "J'ai un problème pour postuler à une offre d'emploi.", time: "10:31" },
  { from: "support", text: "Pas de souci, je vais vous aider. Pouvez-vous me donner plus de détails sur le problème que vous rencontrez ?", time: "10:31" }
];
let chatMessages = [...initialChat];

function renderChat() {
  const container = document.getElementById("chatMessages");
  container.innerHTML = chatMessages.map(m => `
    <div class="cw-msg ${m.from === "user" ? "user" : ""}">
      ${m.from === "support" ? `<div class="cw-avatar">V</div>` : ""}
      <div>
        <div class="cw-bubble">${m.text}</div>
        <span class="cw-time">${m.time}${m.from === "user" ? " ✓" : ""}</span>
      </div>
    </div>
  `).join("");
  container.scrollTop = container.scrollHeight;
}

function currentTime() {
  const d = new Date();
  return d.getHours().toString().padStart(2, "0") + ":" + d.getMinutes().toString().padStart(2, "0");
}

function sendChatMessage() {
  const input = document.getElementById("chatInput");
  const text = input.value.trim();
  if (!text) return;
  chatMessages.push({ from: "user", text, time: currentTime() });
  renderChat();
  input.value = "";

  setTimeout(() => {
    chatMessages.push({
      from: "support",
      text: "Merci pour ces précisions. Un membre de notre équipe support va analyser votre demande et revenir vers vous très rapidement.",
      time: currentTime()
    });
    renderChat();
  }, 1000);
}

document.getElementById("chatInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendChatMessage();
});

// ============== BOUTON "DISCUTER AVEC LE SUPPORT" (bannière) ==============
document.getElementById("openChatBtn").addEventListener("click", () => {
  document.querySelector(".chat-widget").scrollIntoView({ behavior: "smooth", block: "center" });
  document.getElementById("chatInput").focus();
});

// ============== INIT ==============
renderCategories();
renderResources();
renderChat();
