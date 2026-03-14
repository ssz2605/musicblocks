import { PracticeProblems } from "./PracticeProblems.js";
import { PracticeManager } from "./PracticeManager.js";
import { PracticeValidator } from "./PracticeValidator.js";

export const PracticeUI = {
  open() {
    if (document.getElementById("practice-panel")) return;

    const panel = document.createElement("div");
    panel.id = "practice-panel";

    panel.innerHTML = `
      <div class="practice-menu-header">
        <h3>Practice</h3>
        <button id="close-practice">✕</button>
      </div>

      <div id="practice-content"></div>
    `;

    document.body.appendChild(panel);

    document.getElementById("close-practice").onclick = () => {
      panel.remove();
    };

    this.renderLevelMenu();
  },

  loadStarterBlocks(level) {

    if (level !== 1) return;

    const activity =
      typeof globalActivity !== "undefined"
        ? globalActivity
        : window.activity;

    if (!activity?.blocks) return;

    fetch("js/practice_projects/hcb_level1.tb")
      .then(res => res.text())
      .then(data => {
        const projectData = JSON.parse(data);
        console.log("Loaded project:", projectData);
        activity.sendAllToTrash(false, true);
        activity.blocks.loadNewBlocks(projectData);
        activity.blocks.adjustDocks();
        activity.refreshCanvas();

      })
      .catch(err => {
        console.error("Failed to load practice project", err);
      });
  },

  renderLevelMenu() {
    const container = document.getElementById("practice-content");

    container.innerHTML = `
      ${PracticeProblems.map(p => `
        <button 
          class="level-btn ${PracticeManager.isLevelComplete(p.level) ? "done" : ""}"
          data-level="${p.level}">
          Level ${p.level}
        </button>
      `).join("")}
    `;

    container.querySelectorAll(".level-btn").forEach(btn => {
      btn.onclick = () => {
        const level = Number(btn.dataset.level);
        this.renderLevel(level);
      };
    });
  },

  renderLevel(level) {
    const problem = PracticeProblems.find(p => p.level === level);
    const container = document.getElementById("practice-content");
    
    container.innerHTML = `
    <button id="back-to-levels">← Back</button>
    
      <h2>Level ${problem.level}</h2>
      <h4>${problem.title}</h4>
      <p>${problem.description}</p>

      <button id="check-level">Check My Work</button>
    `;
    this.loadStarterBlocks(level);
    
    document.getElementById("back-to-levels").onclick = () => {
      this.renderLevelMenu();
    };

    document.getElementById("check-level").onclick = () => {
      console.log("🟢 CHECK BUTTON CLICKED");
      console.log("Problem object:", problem);

      const result = PracticeValidator.validate(problem);
      console.log("🔎 Validator returned:", result);

      if (result) {
        PracticeManager.completeLevel(problem);
        alert("✅ Level completed!");

        // Update button state
        const btn = document.querySelector(
          `.level-btn[data-level="${problem.level}"]`
        );
        if (btn) btn.classList.add("done");
      } else {
        alert("❌ Not quite yet. Compare with the reference image.");
      }
    };
  }
};
