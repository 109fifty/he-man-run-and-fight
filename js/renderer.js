function drawPixelRect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

/** HP-Pips für alle Gegner inkl. Bosse mit >12 HP */
function drawHpPips(ctx, e, yOff = -8) {
  const n = e.maxHp;
  const gap = n > 12 ? 4 : 5;
  const pipW = n > 12 ? 3 : 4;
  for (let i = 0; i < n; i++) {
    drawPixelRect(ctx, e.x + i * gap, e.y + yOff, pipW, 4, i < e.hp ? "#e74c3c" : "#333");
  }
}

const THEMES = {
  meadow: { top: "#87b7e8", mid: "#a8d48a", bot: "#6aaa3a", mount: "#7a9a50", grass: "#5dba3a", stone: "#8a9a6a" },
  forest: { top: "#0f2a1c", mid: "#1f5a38", bot: "#3a4a20", mount: "#164a30", grass: "#2ecc71", stone: "#4a6a40" },
  water: { top: "#0a3048", mid: "#1a6a9a", bot: "#2a8aba", mount: "#1a4a68", grass: "#3a9aaa", stone: "#4a7a8a" },
  desert: { top: "#3a2810", mid: "#c4922a", bot: "#e8c878", mount: "#a07030", grass: "#d4a84b", stone: "#c4a060" },
  castle: { top: "#141828", mid: "#3a4568", bot: "#5a4a3a", mount: "#222838", grass: "#6a7a55", stone: "#6a7080" },
  spaceship: { top: "#040812", mid: "#1a2848", bot: "#0a1830", mount: "#122040", grass: "#3a8ada", stone: "#5a6a8a" },
  lava: { top: "#1a0510", mid: "#5a1028", bot: "#3a1810", mount: "#3a0a18", grass: "#8b2222", stone: "#6a3a2a" },
};

function drawHeMan(ctx, p) {
  const { x, y, w, facing, anim, animTimer, invuln, hasSword, attack } = p;
  if (invuln > 0 && Math.floor(invuln / 3) % 2 === 0) return;

  ctx.save();
  ctx.translate(Math.round(x + w / 2), Math.round(y));
  // Basis-Sprite ~44px hoch → auf Spielerhöhe skalieren
  const s = (p.h || 64) / 44;
  ctx.scale(facing * s, s);

  const bob =
    anim === "walk" || anim === "run"
      ? Math.sin(animTimer * (anim === "run" ? 0.45 : 0.3)) * 2
      : 0;

  const legSwing =
    anim === "walk" || anim === "run"
      ? Math.sin(animTimer * (anim === "run" ? 0.45 : 0.3)) * (anim === "run" ? 7 : 5)
      : anim === "kick" && attack
        ? 10
        : 0;

  drawPixelRect(ctx, -8, 28 + bob, 7, 16, "#2b3a66");
  drawPixelRect(ctx, 1, 28 + bob, 7, 16, "#2b3a66");
  drawPixelRect(ctx, -8 + legSwing * 0.15, 40 + bob, 8, 4, "#c9a227");
  drawPixelRect(ctx, 1 - legSwing * 0.15, 40 + bob, 8, 4, "#c9a227");

  if (anim === "kick" && attack) {
    drawPixelRect(ctx, 6, 30, 16, 6, "#e8d5a3");
    drawPixelRect(ctx, 18, 30, 6, 7, "#c9a227");
  }

  drawPixelRect(ctx, -10, 16 + bob, 20, 14, "#e8d5a3");
  drawPixelRect(ctx, -11, 26 + bob, 22, 8, "#8b5a2b");
  drawPixelRect(ctx, -9, 18 + bob, 18, 3, "#c9a227");
  drawPixelRect(ctx, -2, 18 + bob, 4, 10, "#c9a227");

  if (anim === "punch" && attack) {
    drawPixelRect(ctx, 8, 18, 16, 6, "#e8d5a3");
    drawPixelRect(ctx, 20, 17, 6, 8, "#e8d5a3");
  } else if (anim === "sword" && attack) {
    drawPixelRect(ctx, 8, 14, 14, 6, "#e8d5a3");
    drawPixelRect(ctx, 18, 4, 4, 22, "#dfe7f5");
    drawPixelRect(ctx, 16, 2, 8, 5, "#f0c14b");
    drawPixelRect(ctx, 17, 24, 6, 4, "#8b5a2b");
  } else {
    drawPixelRect(ctx, -14, 18 + bob, 5, 12, "#e8d5a3");
    drawPixelRect(ctx, 9, 18 + bob, 5, 12, "#e8d5a3");
    if (hasSword && !attack) {
      drawPixelRect(ctx, -16, 20 + bob, 3, 14, "#dfe7f5");
      drawPixelRect(ctx, -17, 32 + bob, 5, 3, "#f0c14b");
    }
  }

  drawPixelRect(ctx, -8, 2 + bob, 16, 14, "#e8d5a3");
  drawPixelRect(ctx, -9, 0 + bob, 18, 6, "#f5d76e");
  drawPixelRect(ctx, -10, 4 + bob, 4, 10, "#f5d76e");
  drawPixelRect(ctx, 6, 4 + bob, 4, 10, "#f5d76e");
  drawPixelRect(ctx, -4, 7 + bob, 3, 3, "#1a1a1a");
  drawPixelRect(ctx, 2, 7 + bob, 3, 3, "#1a1a1a");

  ctx.restore();
}

function drawEnemy(ctx, e) {
  if (!e.alive && !e.redeemed) return;

  if (e.kind === "skeletor" || e.kind === "heroSkeletor") {
    drawSkeletor(ctx, e);
    return;
  }

  if (e.kind === "beast" || e.kind === "trapjaw" || e.kind === "triklops") {
    drawNamedBoss(ctx, e);
    return;
  }

  const flash = e.hitFlash > 0;
  const body =
    e.kind === "brute"
      ? flash
        ? "#fff"
        : "#6b2d8b"
      : e.kind === "scout"
        ? flash
          ? "#fff"
          : "#3d8b5a"
        : flash
          ? "#fff"
          : "#8b3a3a";
  const accent = e.kind === "brute" ? "#c9a227" : "#222";

  drawPixelRect(ctx, e.x, e.y + 8, e.w, e.h - 8, body);
  drawPixelRect(ctx, e.x + 4, e.y, e.w - 8, 12, body);
  drawPixelRect(ctx, e.x + 6, e.y + 4, 4, 4, "#ffef9a");
  drawPixelRect(ctx, e.x + e.w - 12, e.y + 4, 4, 4, "#ffef9a");
  drawPixelRect(ctx, e.x + 2, e.y + e.h - 6, e.w - 4, 6, accent);
  if (e.attack) {
    const ax = e.dir === 1 ? e.x + e.w - 2 : e.x - 14;
    drawPixelRect(ctx, ax, e.y + e.h * 0.35, 16, 8, flash ? "#fff" : "#222");
  }

  drawHpPips(ctx, e);
}

function drawNamedBoss(ctx, e) {
  const flash = e.hitFlash > 0;
  let body = "#888";
  let accent = "#222";
  let head = "#caa";
  if (e.kind === "beast") {
    body = flash ? "#fff" : "#8b4513";
    accent = "#5a2a0a";
    head = "#c48a4a";
  } else if (e.kind === "trapjaw") {
    body = flash ? "#fff" : "#5a6670";
    accent = "#c0392b";
    head = "#8a949c";
  } else if (e.kind === "triklops") {
    body = flash ? "#fff" : "#2d6b3a";
    accent = "#c9a227";
    head = "#3d8b4a";
  }

  drawPixelRect(ctx, e.x + 2, e.y + 12, e.w - 4, e.h - 14, body);
  drawPixelRect(ctx, e.x + 6, e.y, e.w - 12, 16, head);
  if (e.kind === "triklops") {
    drawPixelRect(ctx, e.x + e.w / 2 - 3, e.y + 5, 6, 6, "#e74c3c");
  } else {
    drawPixelRect(ctx, e.x + 10, e.y + 5, 4, 4, "#ffef9a");
    drawPixelRect(ctx, e.x + e.w - 14, e.y + 5, 4, 4, "#ffef9a");
  }
  if (e.kind === "trapjaw") {
    drawPixelRect(ctx, e.x + e.w - 8, e.y + 22, 14, 6, accent);
  }
  drawPixelRect(ctx, e.x + 2, e.y + e.h - 8, e.w - 4, 8, accent);
  if (e.attack) {
    const ax = e.dir === 1 ? e.x + e.w - 4 : e.x - 18;
    drawPixelRect(ctx, ax, e.y + e.h * 0.3, 22, 10, flash ? "#fff" : accent);
  }

  ctx.fillStyle = "#f0c14b";
  ctx.font = "7px 'Press Start 2P'";
  const label = (e.title || e.kind).toUpperCase();
  ctx.fillText(label, e.x, e.y - 14);

  drawHpPips(ctx, e);
}

function drawSkeletor(ctx, e) {
  const hero = e.kind === "heroSkeletor" || e.redeemed;
  const flash = e.hitFlash > 0;
  const robe = hero ? (flash ? "#fff" : "#3a6ea5") : flash ? "#fff" : "#5a1a8a";
  const bone = hero ? "#f0e6d0" : "#e8e0d0";

  drawPixelRect(ctx, e.x + 4, e.y + 14, e.w - 8, e.h - 18, robe);
  drawPixelRect(ctx, e.x + 8, e.y, e.w - 16, 16, bone);
  drawPixelRect(ctx, e.x + 12, e.y + 5, 4, 4, hero ? "#2a6" : "#111");
  drawPixelRect(ctx, e.x + e.w - 16, e.y + 5, 4, 4, hero ? "#2a6" : "#c22");
  drawPixelRect(ctx, e.x + 10, e.y + 12, e.w - 20, 3, "#333");
  if (hero) {
    drawPixelRect(ctx, e.x + e.w - 6, e.y + 18, 4, 20, "#dfe7f5");
    drawPixelRect(ctx, e.x + e.w - 8, e.y + 16, 8, 4, "#f0c14b");
  } else {
    drawPixelRect(ctx, e.x - 2, e.y + 20, 6, 22, "#6a3");
  }

  if (!hero) {
    drawHpPips(ctx, e, -10);
  } else {
    ctx.fillStyle = "#f0c14b";
    ctx.font = "7px 'Press Start 2P'";
    ctx.fillText("HERO", e.x, e.y - 6);
  }
}

function drawHeart(ctx, x, y) {
  drawPixelRect(ctx, x + 2, y + 2, 5, 5, "#e74c3c");
  drawPixelRect(ctx, x + 9, y + 2, 5, 5, "#e74c3c");
  drawPixelRect(ctx, x + 2, y + 6, 12, 6, "#e74c3c");
  drawPixelRect(ctx, x + 5, y + 11, 6, 3, "#e74c3c");
}

function drawSwordPickup(ctx, x, y, t) {
  const bob = Math.sin(t * 0.08) * 3;
  drawPixelRect(ctx, x + 9, y + bob, 4, 18, "#dfe7f5");
  drawPixelRect(ctx, x + 6, y + bob - 2, 10, 5, "#f0c14b");
  drawPixelRect(ctx, x + 7, y + bob + 16, 8, 4, "#8b5a2b");
}

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.camX = 0;
    this.time = 0;
  }

  follow(player, level) {
    const target = player.x - this.canvas.width * 0.35;
    this.camX += (target - this.camX) * 0.12;
    this.camX = Math.max(0, Math.min(level.width - this.canvas.width, this.camX));
  }

  draw(game) {
    const { ctx, canvas } = this;
    const { player, level, state } = game;
    const theme = THEMES[level.theme] || THEMES.meadow;
    this.time += 1;
    this.follow(player, level);

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const grd = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grd.addColorStop(0, theme.top);
    grd.addColorStop(0.55, theme.mid);
    grd.addColorStop(1, theme.bot);
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(-Math.round(this.camX), 0);

    ctx.fillStyle = theme.mount;
    for (let i = 0; i < 14; i++) {
      const mx = i * 220;
      ctx.beginPath();
      ctx.moveTo(mx, level.groundY);
      ctx.lineTo(mx + 110, level.groundY - 90 - (i % 3) * 20);
      ctx.lineTo(mx + 220, level.groundY);
      ctx.fill();
    }

    ctx.fillStyle = level.theme === "lava" ? "#3a1020" : level.theme === "spaceship" ? "#0a1528" : "#1c2438";
    ctx.fillRect(level.goal.x - 40, level.goal.y - 40, 100, 140);
    ctx.fillRect(level.goal.x - 50, level.goal.y - 70, 24, 40);
    ctx.fillRect(level.goal.x + 60, level.goal.y - 70, 24, 40);

    for (const hz of level.hazards) {
      const pulse = 0.5 + Math.sin(this.time * 0.15 + hz.x) * 0.15;
      if (hz.kind === "lava") {
        ctx.fillStyle = `rgba(255, 70, 20, ${0.85})`;
        ctx.fillRect(hz.x, hz.y, hz.w, hz.h);
        ctx.fillStyle = `rgba(255, 200, 40, ${pulse})`;
        for (let i = 0; i < hz.w; i += 16) {
          const wave = Math.sin(this.time * 0.2 + i * 0.1) * 4;
          ctx.fillRect(hz.x + i, hz.y + wave, 10, 8);
        }
      } else if (hz.kind === "water") {
        ctx.fillStyle = `rgba(40, 120, 200, ${0.75})`;
        ctx.fillRect(hz.x, hz.y, hz.w, hz.h);
        ctx.fillStyle = `rgba(120, 200, 255, ${pulse})`;
        for (let i = 0; i < hz.w; i += 18) {
          const wave = Math.sin(this.time * 0.18 + i * 0.12) * 3;
          ctx.fillRect(hz.x + i, hz.y + wave, 12, 6);
        }
      }
    }

    for (const s of level.solids) {
      if (s.type === "ground") {
        const dirt =
          level.theme === "spaceship"
            ? "#2a3548"
            : level.theme === "desert"
              ? "#a88440"
              : level.theme === "water"
                ? "#3a5a48"
                : "#5a3a1e";
        drawPixelRect(ctx, s.x, s.y, s.w, s.h, dirt);
        drawPixelRect(ctx, s.x, s.y, s.w, 8, theme.grass);
        for (let i = 0; i < s.w; i += 32) {
          drawPixelRect(ctx, s.x + i, s.y + 10, 28, 4, dirt === "#2a3548" ? "#3a4a68" : "#6b4524");
        }
      } else {
        const stone = theme.stone || "#7a6a55";
        drawPixelRect(ctx, s.x, s.y, s.w, s.h, stone);
        drawPixelRect(ctx, s.x, s.y, s.w, 4, "#a09078");
        drawPixelRect(ctx, s.x, s.y + s.h - 4, s.w, 4, "#4a4035");
        if (level.theme === "spaceship") {
          drawPixelRect(ctx, s.x + 4, s.y + 6, 6, 4, "#6ad");
        }
      }
    }

    for (const p of level.pickups) {
      if (p.taken) continue;
      if (p.kind === "heart") drawHeart(ctx, p.x, p.y + Math.sin(this.time * 0.1 + p.x) * 2);
      if (p.kind === "sword") drawSwordPickup(ctx, p.x, p.y, this.time);
    }

    const locked = level.requireBoss && !game.bossCleared();
    drawPixelRect(ctx, level.goal.x + 10, level.goal.y, 6, level.goal.h, locked ? "#666" : "#c9a227");
    drawPixelRect(
      ctx,
      level.goal.x + 16,
      level.goal.y + 8,
      28,
      18,
      locked ? "#444" : "#9b2226"
    );
    ctx.fillStyle = locked ? "#aaa" : "#f0c14b";
    ctx.font = "8px 'Press Start 2P'";
    ctx.fillText(locked ? "BOSS" : "TOR", level.goal.x + 18, level.goal.y + 20);
    if (!locked && level.requireBoss && game.bossCleared()) {
      ctx.fillStyle = "#9fe";
      ctx.font = "7px 'Press Start 2P'";
      ctx.fillText("JUMP!", level.goal.x + 14, level.goal.y + 36);
    }

    for (const e of level.enemies) {
      drawEnemy(ctx, e);
      const eh = e.getHitbox?.();
      if (eh) {
        ctx.fillStyle = "rgba(220,60,60,0.4)";
        ctx.fillRect(eh.x, eh.y, eh.w, eh.h);
      }
    }
    drawHeMan(ctx, player);

    const hb = player.getHitbox();
    if (hb) {
      ctx.fillStyle =
        hb.type === "sword"
          ? "rgba(240,193,75,0.45)"
          : hb.type === "kick"
            ? "rgba(100,180,255,0.35)"
            : "rgba(255,255,255,0.35)";
      ctx.fillRect(hb.x, hb.y, hb.w, hb.h);
    }

    ctx.restore();

    this.drawHud(game);

    if (state === "levelclear" || state === "campaign") {
      ctx.fillStyle = "rgba(0,0,0,0.28)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  drawHud(game) {
    const { ctx, canvas } = this;
    const { player, level } = game;

    drawPixelRect(ctx, 0, 0, canvas.width, 40, "rgba(10,14,28,0.72)");
    ctx.fillStyle = "#f0c14b";
    ctx.font = "10px 'Press Start 2P'";
    ctx.fillText(`LVL ${level.id}/12`, 12, 24);
    ctx.fillStyle = "#9aa6c3";
    ctx.font = "8px 'Press Start 2P'";
    const name = level.name.length > 18 ? level.name.slice(0, 16) + "…" : level.name;
    ctx.fillText(name, 100, 24);

    const startX = canvas.width - 16 - player.maxHearts * 12;
    for (let i = 0; i < player.maxHearts; i++) {
      const hx = startX + i * 12;
      const on = i < player.hearts;
      drawPixelRect(ctx, hx, 10, 4, 4, on ? "#e74c3c" : "#333");
      drawPixelRect(ctx, hx + 4, 10, 4, 4, on ? "#e74c3c" : "#333");
      drawPixelRect(ctx, hx, 13, 8, 5, on ? "#e74c3c" : "#333");
      drawPixelRect(ctx, hx + 2, 17, 4, 3, on ? "#c0392b" : "#222");
    }

    ctx.fillStyle = "#f0c14b";
    ctx.font = "8px 'Press Start 2P'";
    ctx.fillText(player.hasSword ? "SCHWERT" : "FAUST", canvas.width / 2 - 30, 24);

    if (level.requireBoss && !game.bossCleared()) {
      const boss = game.activeBoss();
      const name = (boss && (boss.title || level.bossTitle)) || level.bossTitle || "BOSS";
      ctx.fillStyle = "#e74c3c";
      ctx.font = "7px 'Press Start 2P'";
      ctx.fillText(`ENDKAMPF: ${String(name).toUpperCase()}`, canvas.width / 2 - 100, 52);
      if (boss) {
        const barW = 200;
        const bx = canvas.width / 2 - barW / 2;
        drawPixelRect(ctx, bx, 58, barW, 8, "#333");
        drawPixelRect(ctx, bx, 58, Math.max(0, (boss.hp / boss.maxHp) * barW), 8, "#e74c3c");
      }
    } else if (level.requireRedeem && game.skeletorRedeemed()) {
      ctx.fillStyle = "#f0c14b";
      ctx.font = "7px 'Press Start 2P'";
      ctx.fillText("SKELETOR IST EIN HERO!", canvas.width / 2 - 90, 52);
    } else if (level.requireBoss && game.bossCleared()) {
      ctx.fillStyle = "#f0c14b";
      ctx.font = "7px 'Press Start 2P'";
      ctx.fillText("BOSS BESIEGT — IN TOR SPRINGEN", canvas.width / 2 - 110, 52);
    }
    if (level.requireBoss && game.activeBoss()) {
      ctx.fillStyle = "#9aa6c3";
      ctx.font = "6px 'Press Start 2P'";
      ctx.fillText("ENDKAMPF: LANGSAMER", 12, 52);
    }
  }
}
