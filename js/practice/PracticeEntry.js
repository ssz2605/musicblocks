import { PracticeUI } from "./PracticeUI.js";

function addPracticeTopButton() {
  const menuBtn = document.getElementById("toggleAuxBtn");
  if (!menuBtn) {
    console.warn("Practice: toggleAuxBtn not found yet");
    return;
  }

  // Prevent duplicates
  if (document.getElementById("practice-top-btn")) return;

  const menuLi = menuBtn.closest("li");
  if (!menuLi) return;

  const ul = menuLi.parentElement;

  const li = document.createElement("li");
  const btn = document.createElement("a");

  btn.id = "practice-top-btn";
  btn.className = "tooltipped";
  btn.setAttribute("data-position", "bottom");
  btn.setAttribute("data-tooltip", "Practice Mode");
  btn.style.cursor = "pointer";

  btn.innerHTML = `<i class="material-icons md-48">extension</i>`;

  btn.onclick = () => {
    console.log("🧩 Practice Mode clicked");
    PracticeUI.open();
  };

  li.appendChild(btn);
  ul.insertBefore(li, menuLi.nextSibling);

  // Re-init Materialize tooltip
  if (window.M && M.Tooltip) {
    M.Tooltip.init(btn);
  }

  console.log("✅ Practice toolbar button added");
}

// Make globally accessible if needed later
window.startPracticeMode = () => PracticeUI.open();

// Wait until DOM + toolbar are ready
document.addEventListener("DOMContentLoaded", () => {
  // Toolbar sometimes loads late
  const wait = setInterval(() => {
    if (document.getElementById("toggleAuxBtn")) {
      clearInterval(wait);
      addPracticeTopButton();
    }
  }, 300);
});