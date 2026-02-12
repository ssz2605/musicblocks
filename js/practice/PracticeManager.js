import { PracticeProblems } from "./PracticeProblems.js";
import { BadgeManager } from "../badges/BadgeManager.js";

const STORAGE_KEY = "mb_practice_levels";

export const PracticeManager = {
  progress: JSON.parse(localStorage.getItem(STORAGE_KEY)) || {},

  isLevelComplete(level) {
    return !!this.progress[level];
  },

  completeLevel(problem) {
    this.progress[problem.level] = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.progress));

    this.checkBadge(problem.badgeGroup);
  },

  checkBadge(group) {
    const completed = PracticeProblems.filter(
      p => p.badgeGroup === group && this.progress[p.level]
    );

    const total = PracticeProblems.filter(
      p => p.badgeGroup === group
    );

    if (completed.length === total.length) {
      BadgeManager.unlock(group);
    }
  }
};
