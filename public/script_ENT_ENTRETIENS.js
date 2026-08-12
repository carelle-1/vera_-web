function showToast(message) {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.cssText = "position:fixed;bottom:20px;right:20px;background:#1f2937;color:#fff;padding:10px 18px;border-radius:8px;font-size:12px;font-weight:600;z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,0.18);opacity:0;transition:opacity .2s ease;";
  document.body.appendChild(toast);
  requestAnimationFrame(() => { toast.style.opacity = "1"; });
  setTimeout(() => { toast.style.opacity = "0"; setTimeout(() => toast.remove(), 200); }, 2500);
}

let currentConversationId = null;
let pendingAttachment = null;
const recipientId = "vera";

let interviewMode = true;
let interviewStep = 0;
let waitingForUserAnswer = false;
let voiceOutputEnabled = true;
let recognition = null;
let isListening = false;

const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;

function initVoiceControls() {
  const voiceInputBtn = document.getElementById("voiceInputBtn");
  const voiceOutputBtn = document.getElementById("voiceOutputBtn");

  if (voiceInputBtn) {
    voiceInputBtn.addEventListener("click", toggleVoiceInput);
    voiceInputBtn.title = SpeechRecognitionCtor ? "Parler pour envoyer un message" : "La reconnaissance vocale n'est pas supportée par ce navigateur";
  }

  if (voiceOutputBtn) {
    voiceOutputBtn.addEventListener("click", () => {
      voiceOutputEnabled = !voiceOutputEnabled;
      voiceOutputBtn.style.opacity = voiceOutputEnabled ? "1" : "0.5";
      voiceOutputBtn.style.filter = voiceOutputEnabled ? "none" : "grayscale(1)";
      showToast(voiceOutputEnabled ? "Lecture vocale activée" : "Lecture vocale désactivée");
    });
  }
}

function toggleVoiceInput() {
  if (!SpeechRecognitionCtor) {
    showToast("La reconnaissance vocale n'est pas disponible dans ce navigateur.");
    return;
  }

  if (!recognition) {
    recognition = new SpeechRecognitionCtor();
    recognition.lang = 'fr-FR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim();
      if (transcript) {
        const input = document.getElementById("chatInput");
        if (input) {
          input.value = transcript;
          sendMessage();
        }
      }
    };

    recognition.onerror = () => {
      isListening = false;
      const voiceInputBtn = document.getElementById("voiceInputBtn");
      if (voiceInputBtn) {
        voiceInputBtn.style.background = "";
      }
      showToast("Erreur de reconnaissance vocale");
    };

    recognition.onend = () => {
      isListening = false;
      const voiceInputBtn = document.getElementById("voiceInputBtn");
      if (voiceInputBtn) {
        voiceInputBtn.style.background = "";
        voiceInputBtn.style.transform = "scale(1)";
      }
    };
  }

  if (isListening) {
    recognition.stop();
    isListening = false;
    return;
  }

  isListening = true;
  const voiceInputBtn = document.getElementById("voiceInputBtn");
  if (voiceInputBtn) {
    voiceInputBtn.style.background = "#d1fae5";
    voiceInputBtn.style.transform = "scale(1.05)";
  }
  recognition.start();
  showToast("Écoute en cours... parlez maintenant");
}

function speakText(text) {
  if (!voiceOutputEnabled || !text || !('speechSynthesis' in window)) {
    return;
  }

  const cleanText = String(text).replace(/\s+/g, ' ').trim();
  if (!cleanText) {
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'fr-FR';
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
}

const interviewQuestions = [
  {
    id: "intro",
    question: "Parlez-moi de vous.",
    expected: ["formation", "expérience", "compétences", "poste", "domaine", "passion", "profil"],
    fallback: "Pour bien répondre, tu peux présenter : ta formation, tes expériences principales, tes compétences clés et le poste ou le domaine qui t’intéresse. Exemple : “Je suis [prénom], diplômé en [formation], avec une expérience en [expériences], et je cherche un poste de [poste] dans [domaine].”",
    next: "values"
  },
  {
    id: "values",
    question: "Quelles sont vos motivations pour ce poste ?",
    expected: ["mission", "entreprise", "impact", "valeur", "croissance", "équipe", "projet"],
    fallback: "Une bonne réponse peut inclure : ce qui t’attire dans cette mission, l’entreprise, l’impact attendu ou tes valeurs. Exemple : “Je suis motivé par [mission], et je souhaite contribuer à [impact] au sein d’une équipe comme [entreprise/équipe].”",
    next: "strengths"
  },
  {
    id: "strengths",
    question: "Quelles sont vos forces ?",
    expected: ["rigueur", "communication", "leadership", "technique", "analyse", "créativité", "autonomie", "esprit d'équipe"],
    fallback: "Tu peux citer 2 à 3 forces adaptées au poste, avec un exemple. Exemple : “Je suis rigoureux, je communique bien et j’ai déjà mené [projet/résultat].”",
    next: "weaknesses"
  },
  {
    id: "weaknesses",
    question: "Quelles sont vos faiblesses ?",
    expected: ["améliorer", "développer", "apprendre", "travailler", "progresser", "gérer", "demander", "aide"],
    fallback: "Montre que tu es conscient de tes axes d’amélioration et que tu progresses. Exemple : “Je peux encore améliorer ma [point faible], et je travaille dessus en [action concrète].”",
    next: "scenario"
  },
  {
    id: "scenario",
    question: "Racontez-moi une situation difficile que vous avez gérée.",
    expected: ["situation", "tâche", "action", "résultat", "résultat quantifiable", "apprentissage"],
    fallback: "Utilise la méthode STAR : Situation, Tâche, Action, Résultat. Exemple : “Dans [situation], j’ai dû [action], ce qui a donné [résultat quantifiable].”",
    next: null
  }
];

function getFirebaseIdToken() {
  return new Promise((resolve, reject) => {
    if (typeof firebase === 'undefined' || !firebase.auth?.()?.currentUser) {
      return reject("Utilisateur non connecté");
    }
    firebase.auth().currentUser.getIdToken().then(token => resolve(token)).catch(reject);
  });
}

function saveMessageToFirebase(recipientId, messageData) {
  if (typeof firebase === 'undefined' || !firebase.database) {
    return Promise.reject("Firebase non initialisé");
  }

  const user = firebase.auth().currentUser;
  if (!user) return Promise.reject("Utilisateur non connecté");

  const conversationId = [user.uid, recipientId].sort().join("_") + "_interview";
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
      return firebase.database().ref("conversations/" + user.uid + "/" + recipientId).update({
        lastMessage: messageData.text || (messageData.type === "image" ? "📷 Photo" : messageData.fileName || "Fichier"),
        lastTimestamp: messageWithId.timestamp,
        recipientId: recipientId
      });
    })
    .then(() => {
      return firebase.database().ref("conversations/" + recipientId + "/" + user.uid).update({
        lastMessage: messageData.text || (messageData.type === "image" ? "📷 Photo" : messageData.fileName || "Fichier"),
        lastTimestamp: messageWithId.timestamp,
        recipientId: user.uid,
        unread: true
      });
    });
}

function loadConversationMessages(recipientId) {
  if (typeof firebase === 'undefined' || !firebase.database) {
    const container = document.getElementById("chatMessages");
    if (container) container.innerHTML = '<div class="day-divider">Firebase non disponible</div>';
    return;
  }

  const user = firebase.auth().currentUser;
  if (!user) return;

  currentConversationId = [user.uid, recipientId].sort().join("_") + "_interview";
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
    })
    .finally(() => {
      if (interviewMode && container.querySelectorAll('.msg-row').length === 0) {
        setTimeout(() => {
          const q = interviewQuestions[interviewStep] || { question: "Parlez-moi de vous." };
          const replyData = { text: q.question, type: "text" };
          appendVeraMessageToChat(replyData);
          saveMessageToFirebase(recipientId, replyData).catch(() => {});
        }, 600);
      }
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
        ${!isUser ? `<div class="msg-avatar-sm">🤖</div>` : ""}
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

  const text = messageData.text || "";
  const messageHtml = `
    <div class="msg-row vera">
      <div class="msg-avatar-sm">🤖</div>
      <div class="msg-bubble" style="background:#86efac;color:#0f1730;border-color:#22c55e;">
        ${escapeHtml(text).replace(/\n/g, '<br>')}
        <span class="msg-time" style="color:#14532d;">${formatTime(Date.now())}</span>
      </div>
    </div>
  `;
  container.insertAdjacentHTML("beforeend", messageHtml);
  container.scrollTop = container.scrollHeight;

  setTimeout(() => speakText(text), 250);
}

function showTypingIndicator() {
  const container = document.getElementById("chatMessages");
  if (!container) return;
  hideTypingIndicator();
  const typingHtml = `
    <div class="msg-row vera" id="typingIndicator">
      <div class="msg-avatar-sm">🤖</div>
      <div class="typing-indicator" style="background:#86efac;border-color:#22c55e;color:#14532d;">
        <div class="typing-dots"><span></span><span></span><span></span></div>
        <span>VERA est en train d'écrire...</span>
      </div>
    </div>
  `;
  container.insertAdjacentHTML("beforeend", typingHtml);
  container.scrollTop = container.scrollHeight;
}

function hideTypingIndicator() {
  const indicator = document.getElementById("typingIndicator");
  if (indicator) indicator.remove();
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

function sendMessage() {
  const input = document.getElementById("chatInput");
  const text = input.value.trim();

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
        appendUserMessageToChat(messageData);
        showTypingIndicator();
        return getFirebaseIdToken();
      })
      .then(idToken => {
        const payload = { message: text, recipientId };

        if (interviewMode) {
          payload.interviewMode = true;
          payload.interviewStep = interviewStep;
        }

        return fetch("/messages/send", {
          method: "POST",
          headers: {
            "Authorization": "Bearer " + idToken,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });
      })
      .then(res => {
        if (!res.ok) {
          return res.text().then(text => {
            throw new Error("Erreur HTTP " + res.status + ": " + text.slice(0, 200));
          });
        }
        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          return res.text().then(text => {
            throw new Error("Réponse invalide du serveur: " + text.slice(0, 200));
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

          if (data.interviewStep !== undefined) {
            interviewStep = data.interviewStep;
          }

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
    processMessage();
  } else {
    processMessage();
  }
}

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
  const previewArea = document.getElementById("previewArea");
  const previewContent = document.getElementById("previewContent");
  if (previewArea) previewArea.style.display = "none";
  if (previewContent) previewContent.innerHTML = "";
  const imageInput = document.getElementById("imageInput");
  const fileInput = document.getElementById("fileInput");
  if (imageInput) imageInput.value = "";
  if (fileInput) fileInput.value = "";
}

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

initVoiceControls();

loadConversationMessages(recipientId);

setTimeout(() => {
  const container = document.getElementById("chatMessages");
  if (!container) return;
  const isEmpty = container.querySelectorAll(".msg-row").length === 0;
  const noDivider = !container.querySelector(".day-divider");
  if (isEmpty && noDivider && interviewMode) {
    const q = interviewQuestions[interviewStep] || { question: "Parlez-moi de vous." };
    const replyData = { text: q.question, type: "text" };
    appendVeraMessageToChat(replyData);
    saveMessageToFirebase(recipientId, replyData).catch(() => {});
  }
}, 1500);
