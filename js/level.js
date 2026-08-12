import { Enemy, KIND } from "./enemy.js";

export const TOTAL_LEVELS = 12;
const T = 32;

function groundStrip(x, w, groundY) {
  return { x: x * T, y: groundY, w: w * T, h: 4 * T, type: "ground" };
}

function plat(x, up, w, groundY) {
  return { x: x * T, y: groundY - up * T, w: w * T, h: T, type: "stone" };
}

function block(x, up, w, h, groundY) {
  return { x: x * T, y: groundY - up * T, w: w * T, h: h * T, type: "stone" };
}

function hazard(kind, x, w, groundY, damage) {
  return { x: x * T, y: groundY + 8, w: w * T, h: 3 * T, kind, damage };
}

function lava(x, w, groundY, damage = 4) {
  return hazard("lava", x, w, groundY, damage);
}

function water(x, w, groundY, damage = 2) {
  return hazard("water", x, w, groundY, damage);
}

function heart(x, up, groundY, value = 2) {
  return {
    x: x * T + 8,
    y: groundY - up * T - 28,
    w: 20,
    h: 18,
    kind: "heart",
    value,
    taken: false,
  };
}

function sword(x, up, groundY) {
  return {
    x: x * T + 8,
    y: groundY - up * T - 32,
    w: 24,
    h: 24,
    kind: "sword",
    taken: false,
  };
}

function foe(x, up, groundY, hp, kind, patrol = 60, title = "") {
  const h = (KIND[kind] || KIND.grunt).h;
  return new Enemy({
    x: x * T,
    y: groundY - up * T - h,
    hp,
    kind,
    patrol,
    title,
  });
}

function make(def) {
  const groundY = 14 * T;
  // Level etwas länger
  const pad = 28;
  const baseW = def.widthTiles || 78;
  const widthTiles = baseW + pad;
  const goalX = (def.goalX ?? baseW - 4) + pad;
  const goalUp = def.goalUp ?? 2;
  const solids = def.solids(groundY);
  // Boden unter Verlängerung + Tor
  solids.push(groundStrip(Math.max(0, baseW - 6), pad + 10, groundY));

  return {
    id: def.id,
    name: def.name,
    story: def.story,
    theme: def.theme || "meadow",
    solids,
    hazards: (def.hazards && def.hazards(groundY)) || [],
    pickups: (def.pickups && def.pickups(groundY)) || [],
    enemies: (def.enemies && def.enemies(groundY)) || [],
    goal: {
      x: goalX * T,
      y: groundY - goalUp * T - 110,
      w: 36,
      h: 110,
    },
    spawn: { x: 2 * T, y: groundY - 70 },
    width: widthTiles * T,
    height: 18 * T,
    groundY,
    bossLevel: !!def.bossLevel,
    requireBoss: !!def.requireBoss || !!def.requireRedeem,
    requireRedeem: !!def.requireRedeem,
    bossTitle: def.bossTitle || "",
  };
}

/**
 * Themes: meadow, forest, water, desert, castle, spaceship, lava
 * Schwierigkeit steigt mit Level-ID. Lava nur Level 12.
 */
const DEFS = [
  // 1 — Wiese, sehr leicht (durchgehender Boden, keine Todesgruben)
  {
    id: 1,
    name: "Sunny Meadow",
    theme: "meadow",
    story: "Sanfte Wiesen. Lerne Laufen, Springen und STOP.",
    widthTiles: 52,
    goalX: 48,
    goalUp: 1,
    solids: (g) => [
      groundStrip(0, 52, g),
      plat(14, 2, 3, g),
      plat(28, 2, 3, g),
      plat(38, 2, 2, g),
    ],
    hazards: () => [],
    pickups: (g) => [heart(10, 0, g, 2), heart(16, 3, g, 2), heart(30, 3, g, 3)],
    enemies: (g) => [foe(18, 0, g, 1, "scout", 40), foe(34, 0, g, 1, "scout", 50)],
  },

  // 2 — Forest, leicht (durchgehender Boden + optionale Hochpfade)
  {
    id: 2,
    name: "Green Forest",
    theme: "forest",
    story: "Erste Wurzeln — der Boden bleibt sicher, oben gibt’s Abkürzungen.",
    widthTiles: 64,
    goalX: 60,
    goalUp: 2,
    solids: (g) => [
      groundStrip(0, 64, g),
      plat(12, 2, 3, g),
      plat(17, 3, 2, g),
      plat(34, 2, 2, g),
      plat(38, 3, 3, g),
      plat(52, 2, 3, g),
    ],
    hazards: () => [],
    pickups: (g) => [heart(13, 3, g, 2), sword(39, 4, g), heart(53, 3, g, 2)],
    enemies: (g) => [
      foe(8, 0, g, 1, "scout", 50),
      foe(26, 0, g, 1, "scout", 60),
      foe(38, 3, g, 3, "grunt", 30),
      foe(48, 0, g, 1, "scout", 40),
    ],
  },

  // 3 — Forest + Boss Beast Man (sicherer Weg bis zur Arena)
  {
    id: 3,
    name: "Deep Forest",
    theme: "forest",
    story: "Endkampf: Beast Man im dunklen Hain.",
    widthTiles: 88,
    goalX: 84,
    goalUp: 2,
    bossLevel: true,
    requireBoss: true,
    bossTitle: "BEAST MAN",
    solids: (g) => [
      groundStrip(0, 88, g),
      plat(10, 2, 2, g),
      plat(14, 3, 2, g),
      plat(18, 2, 3, g),
      plat(34, 3, 2, g),
      plat(38, 4, 3, g),
      plat(56, 2, 2, g),
      plat(60, 2, 2, g),
    ],
    hazards: () => [],
    pickups: (g) => [
      heart(11, 3, g, 2),
      sword(39, 5, g),
      heart(48, 0, g, 3),
      heart(68, 0, g, 3),
    ],
    enemies: (g) => [
      foe(6, 0, g, 1, "scout", 40),
      foe(28, 0, g, 3, "grunt", 50),
      foe(38, 4, g, 3, "grunt", 25),
      foe(50, 0, g, 3, "grunt", 60),
      foe(74, 0, g, 8, "beast", 150, "Beast Man"),
    ],
  },

  // 4 — Wasser
  {
    id: 4,
    name: "River Crossing",
    theme: "water",
    story: "Spring über die Fluten — Wasser zieht Kraft.",
    widthTiles: 78,
    goalX: 74,
    goalUp: 2,
    solids: (g) => [
      groundStrip(0, 10, g),
      plat(12, 2, 2, g),
      plat(16, 3, 2, g),
      plat(20, 2, 3, g),
      groundStrip(26, 8, g),
      plat(36, 2, 2, g),
      plat(40, 3, 2, g),
      plat(44, 4, 3, g),
      plat(49, 2, 2, g),
      groundStrip(54, 10, g),
      plat(66, 2, 3, g),
      groundStrip(70, 8, g),
    ],
    hazards: (g) => [water(10, 16, g, 2), water(34, 20, g, 2)],
    pickups: (g) => [heart(13, 3, g, 2), sword(45, 5, g), heart(56, 0, g, 3)],
    enemies: (g) => [
      foe(5, 0, g, 1, "scout", 40),
      foe(28, 0, g, 3, "grunt", 50),
      foe(44, 4, g, 3, "grunt", 30),
      foe(58, 0, g, 3, "grunt", 60),
      foe(72, 0, g, 5, "brute", 40),
    ],
  },

  // 5 — Wüste
  {
    id: 5,
    name: "Sand Dunes",
    theme: "desert",
    story: "Heiße Dünen und weite Sprünge.",
    widthTiles: 84,
    goalX: 80,
    goalUp: 2,
    solids: (g) => [
      groundStrip(0, 12, g),
      plat(10, 2, 2, g),
      plat(14, 3, 2, g),
      plat(18, 4, 2, g),
      plat(22, 3, 3, g),
      groundStrip(28, 8, g),
      plat(38, 2, 2, g),
      plat(42, 3, 2, g),
      plat(46, 4, 3, g),
      groundStrip(52, 10, g),
      plat(64, 2, 2, g),
      plat(68, 3, 2, g),
      groundStrip(74, 10, g),
    ],
    hazards: () => [],
    pickups: (g) => [heart(15, 4, g, 2), sword(47, 5, g), heart(55, 0, g, 2), heart(70, 4, g, 3)],
    enemies: (g) => [
      foe(6, 0, g, 1, "scout", 50),
      foe(22, 3, g, 3, "grunt", 30),
      foe(32, 0, g, 3, "grunt", 60),
      foe(46, 4, g, 5, "brute", 30),
      foe(58, 0, g, 3, "grunt", 50),
      foe(76, 0, g, 5, "brute", 45),
    ],
  },

  // 6 — Wüste + Trap Jaw
  {
    id: 6,
    name: "Lost Kings Desert",
    theme: "desert",
    story: "Endkampf: Trap Jaw in den Ruinen.",
    widthTiles: 98,
    goalX: 94,
    goalUp: 2,
    bossLevel: true,
    requireBoss: true,
    bossTitle: "TRAP JAW",
    solids: (g) => [
      groundStrip(0, 14, g),
      plat(12, 2, 2, g),
      plat(16, 3, 3, g),
      groundStrip(22, 8, g),
      plat(32, 2, 2, g),
      plat(36, 3, 2, g),
      plat(40, 4, 3, g),
      groundStrip(46, 10, g),
      plat(58, 2, 2, g),
      plat(62, 3, 2, g),
      groundStrip(68, 8, g),
      plat(78, 2, 2, g),
      groundStrip(82, 16, g),
    ],
    hazards: () => [],
    pickups: (g) => [
      heart(13, 3, g, 2),
      sword(41, 5, g),
      heart(50, 0, g, 3),
      heart(70, 0, g, 2),
      heart(84, 0, g, 3),
    ],
    enemies: (g) => [
      foe(7, 0, g, 3, "grunt", 50),
      foe(26, 0, g, 3, "grunt", 50),
      foe(40, 4, g, 5, "brute", 30),
      foe(52, 0, g, 5, "brute", 60),
      foe(72, 0, g, 3, "grunt", 40),
      foe(88, 0, g, 10, "trapjaw", 170, "Trap Jaw"),
    ],
  },

  // 7 — Burg
  {
    id: 7,
    name: "Castle Ramparts",
    theme: "castle",
    story: "Zinnenzinnen und steinerne Stufen zur Burg.",
    widthTiles: 90,
    goalX: 86,
    goalUp: 3,
    solids: (g) => [
      groundStrip(0, 12, g),
      block(10, 1, 3, 1, g),
      block(12, 2, 3, 2, g),
      block(14, 3, 3, 3, g),
      groundStrip(20, 8, g),
      plat(30, 2, 2, g),
      plat(34, 3, 2, g),
      plat(38, 4, 3, g),
      groundStrip(44, 10, g),
      block(56, 1, 3, 1, g),
      block(58, 2, 3, 2, g),
      block(60, 3, 4, 3, g),
      plat(66, 4, 2, g),
      groundStrip(72, 10, g),
      block(80, 2, 4, 2, g),
      groundStrip(84, 6, g),
    ],
    hazards: () => [],
    pickups: (g) => [sword(39, 5, g), heart(48, 0, g, 3), heart(62, 4, g, 2), heart(82, 3, g, 2)],
    enemies: (g) => [
      foe(6, 0, g, 3, "grunt", 40),
      foe(24, 0, g, 3, "grunt", 50),
      foe(38, 4, g, 5, "brute", 30),
      foe(50, 0, g, 5, "brute", 55),
      foe(64, 3, g, 5, "brute", 35),
      foe(76, 0, g, 5, "brute", 40),
    ],
  },

  // 8 — Spaceship
  {
    id: 8,
    name: "Starship Hangar",
    theme: "spaceship",
    story: "Schwebende Plattformen im Hangar der Horde.",
    widthTiles: 94,
    goalX: 90,
    goalUp: 2,
    solids: (g) => [
      groundStrip(0, 8, g),
      plat(10, 2, 2, g),
      plat(14, 3, 2, g),
      plat(18, 4, 2, g),
      plat(22, 3, 2, g),
      plat(26, 2, 3, g),
      plat(31, 3, 2, g),
      plat(35, 4, 2, g),
      plat(39, 3, 2, g),
      groundStrip(44, 6, g),
      plat(52, 2, 2, g),
      plat(56, 3, 2, g),
      plat(60, 4, 2, g),
      plat(64, 3, 2, g),
      plat(68, 2, 2, g),
      groundStrip(74, 8, g),
      plat(84, 2, 3, g),
      groundStrip(88, 6, g),
    ],
    hazards: () => [],
    pickups: (g) => [heart(11, 3, g, 2), sword(27, 3, g), heart(46, 0, g, 3), heart(61, 5, g, 2)],
    enemies: (g) => [
      foe(4, 0, g, 3, "grunt", 30),
      foe(26, 2, g, 5, "brute", 25),
      foe(39, 3, g, 5, "brute", 20),
      foe(48, 0, g, 5, "brute", 40),
      foe(64, 3, g, 5, "brute", 20),
      foe(78, 0, g, 5, "brute", 50),
      foe(90, 0, g, 5, "brute", 35),
    ],
  },

  // 9 — Burg/Space Boss Tri-Klops
  {
    id: 9,
    name: "Orbital Keep",
    theme: "spaceship",
    story: "Endkampf: Tri-Klops auf der Orbitalfestung.",
    widthTiles: 104,
    goalX: 100,
    goalUp: 2,
    bossLevel: true,
    requireBoss: true,
    bossTitle: "TRI-KLOPS",
    solids: (g) => [
      groundStrip(0, 12, g),
      plat(10, 2, 2, g),
      plat(14, 3, 2, g),
      plat(18, 4, 3, g),
      groundStrip(24, 8, g),
      plat(34, 2, 2, g),
      plat(38, 3, 2, g),
      plat(42, 4, 2, g),
      plat(46, 5, 3, g),
      groundStrip(52, 10, g),
      plat(64, 2, 2, g),
      plat(68, 3, 2, g),
      plat(72, 2, 2, g),
      groundStrip(78, 8, g),
      groundStrip(88, 16, g),
    ],
    hazards: () => [],
    pickups: (g) => [
      sword(19, 5, g),
      heart(28, 0, g, 3),
      heart(47, 6, g, 2),
      heart(56, 0, g, 3),
      heart(90, 0, g, 3),
    ],
    enemies: (g) => [
      foe(6, 0, g, 3, "grunt", 40),
      foe(28, 0, g, 5, "brute", 50),
      foe(46, 5, g, 5, "brute", 25),
      foe(58, 0, g, 5, "brute", 55),
      foe(74, 0, g, 5, "brute", 40),
      foe(94, 0, g, 12, "triklops", 190, "Tri-Klops"),
    ],
  },

  // 10 — Spaceship schwer
  {
    id: 10,
    name: "Void Corridors",
    theme: "spaceship",
    story: "Enge Korridore — ein Fehltritt in die Leere.",
    widthTiles: 100,
    goalX: 96,
    goalUp: 2,
    solids: (g) => [
      groundStrip(0, 8, g),
      plat(10, 2, 2, g),
      plat(14, 3, 2, g),
      plat(18, 4, 2, g),
      plat(22, 5, 2, g),
      plat(26, 3, 2, g),
      groundStrip(32, 6, g),
      plat(40, 2, 2, g),
      plat(44, 3, 2, g),
      plat(48, 4, 2, g),
      plat(52, 5, 2, g),
      plat(56, 3, 3, g),
      groundStrip(62, 6, g),
      plat(70, 2, 2, g),
      plat(74, 3, 2, g),
      plat(78, 4, 3, g),
      groundStrip(84, 8, g),
      plat(92, 2, 2, g),
      groundStrip(96, 4, g),
    ],
    hazards: () => [],
    pickups: (g) => [sword(23, 6, g), heart(34, 0, g, 3), heart(53, 6, g, 2), heart(80, 5, g, 3)],
    enemies: (g) => [
      foe(5, 0, g, 3, "grunt", 30),
      foe(22, 5, g, 5, "brute", 20),
      foe(36, 0, g, 5, "brute", 40),
      foe(52, 5, g, 5, "brute", 20),
      foe(66, 0, g, 5, "brute", 40),
      foe(78, 4, g, 5, "brute", 25),
      foe(88, 0, g, 5, "brute", 45),
    ],
  },

  // 11 — Wasser schwer
  {
    id: 11,
    name: "Storm Coast",
    theme: "water",
    story: "Stürmische Küste vor Snake Mountain.",
    widthTiles: 102,
    goalX: 98,
    goalUp: 2,
    solids: (g) => [
      groundStrip(0, 10, g),
      plat(12, 2, 2, g),
      plat(16, 3, 2, g),
      plat(20, 4, 2, g),
      plat(24, 3, 2, g),
      groundStrip(30, 6, g),
      plat(38, 2, 2, g),
      plat(42, 3, 2, g),
      plat(46, 4, 2, g),
      plat(50, 5, 3, g),
      plat(55, 3, 2, g),
      groundStrip(60, 8, g),
      plat(70, 2, 2, g),
      plat(74, 3, 2, g),
      plat(78, 4, 2, g),
      groundStrip(84, 10, g),
      plat(94, 2, 2, g),
      groundStrip(98, 4, g),
    ],
    hazards: (g) => [water(10, 20, g, 3), water(36, 24, g, 3), water(68, 16, g, 3)],
    pickups: (g) => [
      sword(21, 5, g),
      heart(32, 0, g, 3),
      heart(51, 6, g, 3),
      heart(62, 0, g, 2),
      heart(86, 0, g, 3),
    ],
    enemies: (g) => [
      foe(6, 0, g, 3, "grunt", 40),
      foe(24, 3, g, 5, "brute", 25),
      foe(34, 0, g, 5, "brute", 40),
      foe(50, 5, g, 5, "brute", 25),
      foe(64, 0, g, 5, "brute", 50),
      foe(78, 4, g, 5, "brute", 20),
      foe(90, 0, g, 5, "brute", 50),
      foe(96, 0, g, 5, "brute", 30),
    ],
  },

  // 12 — LAVA + Skeletor
  {
    id: 12,
    name: "Snake Mountain Lava",
    theme: "lava",
    story: "Lava-Endkampf: Skeletor — erlöse ihn zum guten Hero.",
    widthTiles: 86,
    goalX: 82,
    goalUp: 2,
    bossLevel: true,
    requireBoss: true,
    requireRedeem: true,
    bossTitle: "SKELETOR",
    solids: (g) => [
      groundStrip(0, 12, g),
      plat(10, 2, 2, g),
      plat(14, 3, 2, g),
      plat(18, 2, 2, g),
      groundStrip(24, 6, g),
      plat(32, 2, 2, g),
      plat(36, 3, 2, g),
      plat(40, 4, 3, g),
      groundStrip(46, 8, g),
      plat(56, 2, 2, g),
      groundStrip(62, 24, g),
    ],
    hazards: (g) => [
      lava(12, 12, g, 5),
      lava(30, 16, g, 5),
      lava(54, 8, g, 5),
    ],
    pickups: (g) => [
      heart(6, 0, g, 3),
      sword(19, 3, g),
      heart(26, 0, g, 3),
      heart(41, 5, g, 3),
      heart(48, 0, g, 3),
      heart(64, 0, g, 3),
    ],
    enemies: (g) => [
      foe(8, 0, g, 5, "brute", 40),
      foe(28, 0, g, 5, "brute", 40),
      foe(40, 4, g, 5, "brute", 25),
      foe(50, 0, g, 5, "brute", 50),
      foe(70, 0, g, 14, "skeletor", 120, "Skeletor"),
    ],
  },
];

export function createLevel(id = 1) {
  const n = Math.max(1, Math.min(TOTAL_LEVELS, id | 0));
  const def = DEFS.find((d) => d.id === n) || DEFS[0];
  return make(def);
}

export function createLevel1() {
  return createLevel(1);
}
