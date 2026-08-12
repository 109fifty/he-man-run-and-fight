import { Enemy } from "./enemy.js";

/** Level 1 — Eternia Outskirts (prototype of 12 planned stages) */
export function createLevel1() {
  const TILE = 32;
  const groundY = 14 * TILE;

  const solids = [
    // Start plateau
    { x: 0, y: groundY, w: 18 * TILE, h: 4 * TILE, type: "ground" },
    // Steps up
    { x: 14 * TILE, y: groundY - TILE, w: 3 * TILE, h: TILE, type: "stone" },
    { x: 16 * TILE, y: groundY - 2 * TILE, w: 3 * TILE, h: 2 * TILE, type: "stone" },
    { x: 18 * TILE, y: groundY - 3 * TILE, w: 4 * TILE, h: 3 * TILE, type: "stone" },
    // Mid platforms over lava gap
    { x: 24 * TILE, y: groundY - 2 * TILE, w: 3 * TILE, h: TILE, type: "stone" },
    { x: 29 * TILE, y: groundY - 3 * TILE, w: 3 * TILE, h: TILE, type: "stone" },
    { x: 34 * TILE, y: groundY - 2 * TILE, w: 4 * TILE, h: TILE, type: "stone" },
    // Far ground — mit Lücke für Lava-Pit (56–60)
    { x: 40 * TILE, y: groundY, w: 16 * TILE, h: 4 * TILE, type: "ground" },
    { x: 60 * TILE, y: groundY, w: 6 * TILE, h: 4 * TILE, type: "ground" },
    // Floating parkour
    { x: 46 * TILE, y: groundY - 3 * TILE, w: 2 * TILE, h: TILE, type: "stone" },
    { x: 50 * TILE, y: groundY - 4 * TILE, w: 2 * TILE, h: TILE, type: "stone" },
    { x: 54 * TILE, y: groundY - 5 * TILE, w: 3 * TILE, h: TILE, type: "stone" },
    { x: 58 * TILE, y: groundY - 3 * TILE, w: 2 * TILE, h: TILE, type: "stone" },
    // Castle approach
    { x: 62 * TILE, y: groundY - TILE, w: 4 * TILE, h: TILE, type: "stone" },
    { x: 64 * TILE, y: groundY - 2 * TILE, w: 4 * TILE, h: 2 * TILE, type: "stone" },
    { x: 66 * TILE, y: groundY - 3 * TILE, w: 6 * TILE, h: 3 * TILE, type: "stone" },
  ];

  const hazards = [
    // Große Lava-Klippe
    {
      x: 22 * TILE,
      y: groundY + 8,
      w: 18 * TILE,
      h: 3 * TILE,
      kind: "lava",
      damage: 4,
    },
    // Lava-Pit in der Bodenlücke
    {
      x: 56 * TILE,
      y: groundY + 8,
      w: 4 * TILE,
      h: 3 * TILE,
      kind: "lava",
      damage: 3,
    },
  ];

  const pickups = [
    { x: 15 * TILE + 8, y: groundY - 2 * TILE - 24, w: 18, h: 16, kind: "heart", value: 2, taken: false },
    { x: 30 * TILE + 4, y: groundY - 4 * TILE - 24, w: 18, h: 16, kind: "heart", value: 3, taken: false },
    { x: 35 * TILE + 8, y: groundY - 3 * TILE - 28, w: 22, h: 22, kind: "sword", taken: false },
    { x: 51 * TILE + 4, y: groundY - 5 * TILE - 24, w: 18, h: 16, kind: "heart", value: 2, taken: false },
    { x: 55 * TILE + 8, y: groundY - 6 * TILE - 24, w: 18, h: 16, kind: "heart", value: 1, taken: false },
  ];

  const enemies = [
    new Enemy({ x: 10 * TILE, y: groundY - 40, hp: 1, kind: "scout", patrol: 70 }),
    new Enemy({ x: 19 * TILE, y: groundY - 3 * TILE - 40, hp: 3, kind: "grunt", patrol: 50 }),
    new Enemy({ x: 35 * TILE, y: groundY - 2 * TILE - 40, hp: 1, kind: "scout", patrol: 40 }),
    new Enemy({ x: 44 * TILE, y: groundY - 40, hp: 3, kind: "grunt", patrol: 90 }),
    new Enemy({ x: 48 * TILE, y: groundY - 40, hp: 1, kind: "scout", patrol: 60 }),
    new Enemy({ x: 54 * TILE + 8, y: groundY - 5 * TILE - 48, hp: 5, kind: "brute", patrol: 30 }),
    new Enemy({ x: 67 * TILE, y: groundY - 3 * TILE - 48, hp: 5, kind: "brute", patrol: 40 }),
  ];

  const goal = {
    x: 70 * TILE,
    y: groundY - 3 * TILE - 96,
    w: 28,
    h: 96,
  };

  const spawn = { x: 2 * TILE, y: groundY - 48 };
  const width = 74 * TILE;
  const height = 18 * TILE;

  return {
    id: 1,
    name: "Eternia Outskirts",
    story:
      "Level 1 von 12 — Am Ende wird Skeletor zum guten Hero. Jetzt: rette die Außenposten!",
    solids,
    hazards,
    pickups,
    enemies,
    goal,
    spawn,
    width,
    height,
    groundY,
  };
}
