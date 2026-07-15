// ============== DONNÉES COMPÉTENCES ==============
const skills = [
  { name: "Figma", value: 95 },
  { name: "UX Research", value: 90 },
  { name: "Adobe XD", value: 90 },
  { name: "Prototyping", value: 85 },
  { name: "UI Design", value: 95 },
  { name: "Design System", value: 80 }
];

function renderSkills() {
  const grid = document.getElementById("skillsGrid");
  grid.innerHTML = skills.map((s, i) => `
    <div class="skill-row">
      <div class="skill-label"><span>${s.name}</span><span>${s.value}%</span></div>
      <div class="skill-bar"><div class="skill-bar-fill" data-value="${s.value}" id="skillFill${i}"></div></div>
    </div>
  `).join("");

  // Animation après le rendu
  requestAnimationFrame(() => {
    setTimeout(() => {
      skills.forEach((s, i) => {
        document.getElementById(`skillFill${i}`).style.width = s.value + "%";
      });
    }, 100);
  });
}

// ============== SCORE RING ==============
function renderScoreRing() {
  const ring = document.getElementById("scoreRing");
  const score = 92;
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  ring.style.strokeDasharray = circumference;
  ring.style.strokeDashoffset = circumference; // start empty

  requestAnimationFrame(() => {
    setTimeout(() => {
      const offset = circumference - (score / 100) * circumference;
      ring.style.transition = "stroke-dashoffset 1.2s ease";
      ring.style.strokeDashoffset = offset;
    }, 150);
  });
}

// ============== TABS ==============
const tabLabels = {
  info: "Informations",
  exp: "Expérience",
  formations: "Formations",
  certifs: "Certifications",
  langues: "Langues",
  prefs: "Préférences"
};

document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    const key = tab.dataset.tab;
    const overview = document.getElementById("overviewLayout");
    const placeholder = document.getElementById("tabPlaceholder");

    if (key === "overview") {
      overview.style.display = "grid";
      placeholder.style.display = "none";
    } else {
      overview.style.display = "none";
      placeholder.style.display = "block";
      placeholder.textContent = `Section "${tabLabels[key]}" — contenu à compléter prochainement.`;
    }
  });
});

// ============== BOUTONS "Modifier" (démo) ==============
document.querySelectorAll(".btn-outline-sm, .btn-primary-sm").forEach(btn => {
  btn.addEventListener("click", (e) => {
    const original = btn.textContent;
    if (original.includes("Modifier") || original.includes("Gérer")) {
      btn.textContent = "✓ Enregistré";
      setTimeout(() => { btn.textContent = original; }, 1200);
    }
  });
});

// ============== INIT ==============
renderSkills();
renderScoreRing();
