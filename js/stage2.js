import { Enemy, KIND } from "./enemy.js";

export const STAGE2_LEVELS = 12;
const T = 32;
const H = 18 * T;

function groundStrip(x, w, groundY) {
  return { x: x * T, y: groundY, w: w * T, h: 4 * T, type: "ground" };
}

function plat(x, up, w, groundY) {
  return { x: x * T, y: groundY - up * T, w: w * T, h: T, type: "stone" };
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

function makeArena(def, groundY) {
  const solids = def.solids(groundY);
  solids.push(groundStrip(0, 36, groundY));
  return {
    solids,
    hazards: (def.hazards && def.hazards(groundY)) || [],
    pickups: (def.pickups && def.pickups(groundY)) || [],
    enemies: (def.enemies && def.enemies(groundY)) || [],
    goal: {
      x: 30 * T,
      y: groundY - 2 * T - 110,
      w: 36,
      h: 110,
    },
    spawn: { x: 3 * T, y: groundY - 70 },
    width: 36 * T,
    height: H,
    groundY,
  };
}

function flightPickup(x, y, kind = "heart", value = 2) {
  return { x, y, w: 20, h: 18, kind, value, taken: false };
}

/**
 * Themes Stufe 2: clouds, storm, crystal, sandsky, frost, neon,
 * acid, magmasky, shadowrift, meteorswarm, horde, snakeorbit
 */
const DEFS = [
  {
    id: 1,
    name: "Wolkenweide",
    story: "Sanfte Thermik über Eternia.",
    theme: "clouds",
    width: 4200,
    profile: { density: 0.7, meteor: 0.08, enemyCraft: 0.12, craftHp: 1, craftKind: "bird" },
    pickups: (shipY) => [
      flightPickup(900, shipY - 40),
      flightPickup(1800, shipY + 30),
      flightPickup(2800, shipY - 20),
    ],
  },
  {
    id: 2,
    name: "Sturmfront",
    story: "Blitze zerreißen den Himmel.",
    theme: "storm",
    width: 4500,
    profile: { density: 0.9, lightning: 0.18, whirl: 0.1, enemyCraft: 0.1, craftHp: 1 },
    pickups: (shipY) => [flightPickup(1200, shipY), flightPickup(2400, shipY - 50)],
  },
  {
    id: 3,
    name: "Kristall-Canyon",
    story: "Wirbel zwischen scharfen Spitzen.",
    theme: "crystal",
    width: 4800,
    bossLevel: true,
    requireBoss: true,
    bossTitle: "Sky-Beast",
    bossTrigger: 4000,
    profile: { density: 1, whirl: 0.2, scrap: 0.15, enemyCraft: 0.12, craftHp: 2 },
    arena: {
      solids: (g) => [groundStrip(0, 34, g), plat(12, 3, 4, g), plat(20, 5, 3, g)],
      pickups: (g) => [heart(8, 0, g, 3), sword(14, 3, g)],
      enemies: (g) => [foe(22, 0, g, 10, "beast", 90, "Sky-Beast")],
    },
  },
  {
    id: 4,
    name: "Sand-Thermik",
    story: "Heiße Aufwinde und Sandmeteore.",
    theme: "sandsky",
    width: 4600,
    profile: { density: 1, meteor: 0.22, whirl: 0.12, enemyCraft: 0.14, craftHp: 2 },
    pickups: (shipY) => [flightPickup(1000, shipY + 40), flightPickup(2200, shipY - 60, "heart", 3)],
  },
  {
    id: 5,
    name: "Frost-Jetstream",
    story: "5× länger: Eissturm, Blitze (3 Schaden), Lava-Bälle, Meteore, Wirbel — volle Gegenwehr.",
    theme: "frost",
    width: 23500,
    profile: {
      density: 2.4,
      ice: 0.48,
      lightning: 0.4,
      meteor: 0.36,
      lavaBall: 0.32,
      whirl: 0.34,
      enemyCraft: 0.42,
      craftHp: 5,
      craftKind: "frost",
      pull: 0.85,
      craftShootMin: 18,
      craftShootMax: 36,
      craftBulletDmg: 2,
      dmg: { meteor: 3, lavaBall: 3, whirl: 2, lightning: 3, ice: 2, scrap: 2 },
    },
    pickups: (shipY) => [
      flightPickup(1800, shipY, "heart", 3),
      flightPickup(4200, shipY - 40, "heart", 3),
      flightPickup(7000, shipY + 30, "heart", 3),
      flightPickup(10000, shipY - 20, "heart", 3),
      flightPickup(14000, shipY + 40, "heart", 3),
      flightPickup(18000, shipY, "heart", 3),
      flightPickup(21000, shipY - 30, "heart", 3),
    ],
  },
  {
    id: 6,
    name: "Neon-Orbit",
    story: "Schrottgürtel über dem Orbit.",
    theme: "neon",
    width: 5000,
    bossLevel: true,
    requireBoss: true,
    bossTitle: "Trap Jaw",
    bossTrigger: 4200,
    profile: { density: 1.1, scrap: 0.25, enemyCraft: 0.22, craftHp: 2, craftKind: "jet" },
    arena: {
      solids: (g) => [groundStrip(0, 34, g), plat(10, 4, 5, g), plat(18, 2, 4, g)],
      pickups: (g) => [heart(6, 0, g, 3), sword(11, 4, g), heart(24, 0, g, 2)],
      enemies: (g) => [foe(20, 0, g, 12, "trapjaw", 100, "Trap Jaw")],
    },
  },
  {
    id: 7,
    name: "Säure-Nebel",
    story: "Giftige Wolken und Spucker.",
    theme: "acid",
    width: 4800,
    profile: { density: 1.15, acid: 0.22, enemyCraft: 0.18, craftHp: 2, craftKind: "spitter" },
    pickups: (shipY) => [flightPickup(1100, shipY - 30), flightPickup(2600, shipY + 40, "heart", 3)],
  },
  {
    id: 8,
    name: "Magma-Himmel",
    story: "Lava-Bälle und Ascheregen.",
    theme: "magmasky",
    width: 4900,
    profile: { density: 1.2, lavaBall: 0.28, meteor: 0.15, enemyCraft: 0.14, craftHp: 3 },
    pickups: (shipY) => [flightPickup(1400, shipY), flightPickup(3200, shipY - 40)],
  },
  {
    id: 9,
    name: "Schatten-Riss",
    story: "Blitze aus dem Nichts.",
    theme: "shadowrift",
    width: 5100,
    bossLevel: true,
    requireBoss: true,
    bossTitle: "Tri-Klops",
    bossTrigger: 4300,
    profile: { density: 1.25, lightning: 0.22, acid: 0.1, enemyCraft: 0.2, craftHp: 3, craftKind: "shadow" },
    arena: {
      solids: (g) => [groundStrip(0, 34, g), plat(8, 3, 4, g), plat(16, 5, 3, g), plat(24, 2, 4, g)],
      pickups: (g) => [sword(9, 3, g), heart(14, 0, g, 3), heart(22, 2, g, 2)],
      enemies: (g) => [foe(21, 0, g, 14, "triklops", 110, "Tri-Klops")],
    },
  },
  {
    id: 10,
    name: "Meteoritenschwarm",
    story: "Der Himmel brennt.",
    theme: "meteorswarm",
    width: 5200,
    profile: { density: 1.4, meteor: 0.4, scrap: 0.15, enemyCraft: 0.12, craftHp: 2 },
    pickups: (shipY) => [
      flightPickup(900, shipY),
      flightPickup(2000, shipY - 50, "heart", 3),
      flightPickup(3500, shipY + 30, "heart", 3),
    ],
  },
  {
    id: 11,
    name: "Horde-Korridor",
    story: "Wellen feindlicher Flugkörper.",
    theme: "horde",
    width: 5400,
    profile: { density: 1.35, enemyCraft: 0.38, scrap: 0.12, lightning: 0.1, craftHp: 3, craftKind: "horde" },
    pickups: (shipY) => [flightPickup(1600, shipY), flightPickup(3000, shipY - 20, "heart", 3)],
  },
  {
    id: 12,
    name: "Snake-Mountain-Orbit",
    story: "Festungsanflug — dann der Endkampf.",
    theme: "snakeorbit",
    width: 5600,
    bossLevel: true,
    requireBoss: true,
    requireRedeem: true,
    bossTitle: "Skeletor",
    bossTrigger: 4700,
    profile: {
      density: 1.5,
      meteor: 0.2,
      lavaBall: 0.15,
      whirl: 0.1,
      lightning: 0.15,
      enemyCraft: 0.25,
      craftHp: 3,
      craftKind: "horde",
    },
    arena: {
      solids: (g) => [
        groundStrip(0, 34, g),
        plat(6, 3, 3, g),
        plat(14, 5, 4, g),
        plat(22, 3, 3, g),
      ],
      hazards: (g) => [{ x: 10 * T, y: g + 8, w: 4 * T, h: 3 * T, kind: "lava", damage: 4 }],
      pickups: (g) => [sword(7, 3, g), heart(12, 0, g, 3), heart(18, 5, g, 3), heart(26, 0, g, 3)],
      enemies: (g) => [foe(20, 0, g, 16, "skeletor", 120, "Skeletor")],
    },
  },
];

export function createFlightLevel(id = 1) {
  const n = Math.max(1, Math.min(STAGE2_LEVELS, id | 0));
  const def = DEFS.find((d) => d.id === n) || DEFS[0];
  const groundY = 14 * T;
  const corridor = { top: 56, bottom: 400 };
  const shipY = 200;
  const width = def.width || 4500;
  const bossTrigger = def.bossTrigger || null;

  let arena = null;
  if (def.arena) {
    arena = makeArena(def.arena, groundY);
  }

  // Flug-Ziel (nur Non-Boss): Portal am Ende
  const goalX = bossTrigger ? bossTrigger - 80 : width - 180;

  return {
    id: def.id,
    name: def.name,
    story: def.story,
    theme: def.theme || "clouds",
    stage: 2,
    mode: "flight",
    solids: [],
    hazards: [],
    pickups: [],
    enemies: [],
    flightPickups: (def.pickups && def.pickups(shipY)) || [],
    goal: {
      x: goalX,
      y: corridor.top + 40,
      w: 48,
      h: corridor.bottom - corridor.top - 80,
    },
    spawn: { x: 80, y: shipY },
    width,
    height: H,
    groundY,
    corridor,
    bossLevel: !!def.bossLevel,
    requireBoss: !!def.requireBoss || !!def.requireRedeem,
    requireRedeem: !!def.requireRedeem,
    bossTitle: def.bossTitle || "",
    bossTrigger,
    arena,
    hazardProfile: def.profile || {},
  };
}
