import { PracticeProblems } from "./PracticeProblems.js";
import { PracticeManager } from "./PracticeManager.js";
import { PracticeValidator } from "./PracticeValidator.js";

export const PracticeUI = {
    getActivity() {
        if (window.ActivityContext && typeof window.ActivityContext.getActivity === "function") {
            try {
                return window.ActivityContext.getActivity();
            } catch (e) {
                return null;
            }
        }

        return null;
    },

    loadProjectData(activity, projectData) {
        activity.sendAllToTrash(false, true);
        activity.blocks.loadNewBlocks(projectData);
        activity.blocks.adjustDocks();
        activity.refreshCanvas();
    },

    open() {
        if (document.getElementById("practice-panel")) return;

        const panel = document.createElement("div");
        panel.id = "practice-panel";

        panel.innerHTML = `
      <div class="practice-menu-header">
        <h3>Practice</h3>
        <button id="close-practice">X</button>
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
        const activity = this.getActivity();
        if (!activity?.blocks) return;

        const projectFiles = {
            1: "hcb_level1.tb",
            2: "sakura.tb",
            3: "rhythm_level3.tb"
        };

        const file = projectFiles[level];
        if (!file) return;

        fetch(`js/practice_projects/${file}`)
            .then(res => res.text())
            .then(data => {
                const projectData = JSON.parse(data);
                this.loadProjectData(activity, projectData);
            })
            .catch(err => {
                console.error("Failed to load practice project", err);
            });
    },

    renderLevelMenu() {
        const container = document.getElementById("practice-content");

        container.innerHTML = `
      ${PracticeProblems.map(
          p => `
        <button
          class="level-btn ${PracticeManager.isLevelComplete(p.level) ? "done" : ""}"
          data-level="${p.level}">
          Level ${p.level}
        </button>
      `
      ).join("")}
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
      <button id="back-to-levels">&larr; Back</button>

      <h2>Level ${problem.level}</h2>
      <h4>${problem.title}</h4>
      <div class="practice-description">${problem.description}</div>

      <button id="check-level">Check My Work</button>
    `;

        this.loadStarterBlocks(level);

        document.getElementById("back-to-levels").onclick = () => {
            this.renderLevelMenu();
        };

        document.getElementById("check-level").onclick = () => {
            const result = PracticeValidator.validate(problem);

            if (result) {
                PracticeManager.completeLevel(problem);
                alert("Level completed!");

                const btn = document.querySelector(`.level-btn[data-level="${problem.level}"]`);
                if (btn) btn.classList.add("done");
            } else {
                alert("Not complete yet. Try again.");
            }
        };
    }
};
