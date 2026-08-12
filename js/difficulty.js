const LS_DIFF = "heman-difficulty";

/** @typedef {'easy'|'normal'|'hard'} DiffId */

export const DIFFICULTIES = {
  easy: {
    id: "easy",
    label: "ANFÄNGER",
    short: "ANF",
    hearts: 15,
    speed: 1,
    shipSpeed: 1,
  },
  normal: {
    id: "normal",
    label: "FORTGESCHRITTEN",
    short: "FORT",
    hearts: 10,
    speed: 1.22,
    shipSpeed: 1.2,
  },
  hard: {
    id: "hard",
    label: "PROFI",
    short: "PRO",
    hearts: 5,
    speed: 1.42,
    shipSpeed: 1.38,
  },
};

export function loadDifficulty() {
  try {
    const id = localStorage.getItem(LS_DIFF);
    if (id && DIFFICULTIES[id]) return DIFFICULTIES[id];
  } catch (_) {
    /* ignore */
  }
  return DIFFICULTIES.easy;
}

export function saveDifficulty(id) {
  const d = DIFFICULTIES[id] || DIFFICULTIES.easy;
  try {
    localStorage.setItem(LS_DIFF, d.id);
  } catch (_) {
    /* ignore */
  }
  return d;
}
