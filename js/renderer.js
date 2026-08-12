function drawPixelRect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function drawHeMan(ctx, p) {
  const { x, y, w, h, facing, anim, animTimer, invuln, hasSword, attack } = p;
  if (invuln > 0 && Math.floor(invuln / 3) % 2 === 0) return;

  ctx.save();
  ctx.translate(Math.round(x + w / 2), Math.round(y));
  ctx.scale(facing, 1);

  const bob =
    anim === "walk" || anim === "run"
      ? Math.sin(animTimer * (anim === "run" ? 0.45 : 0.3)) * 2
      : 0;

  // Legs
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

  // Torso / fur shorts
  drawPixelRect(ctx, -10, 16 + bob, 20, 14, "#e8d5a3");
  drawPixelRect(ctx, -11, 26 + bob, 22, 8, "#8b5a2b");
  drawPixelRect(ctx, -9, 18 + bob, 18, 3, "#c9a227"); // harness
  drawPixelRect(ctx, -2, 18 + bob, 4, 10, "#c9a227");

  // Arms
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

  // Head + blonde hair
  drawPixelRect(ctx, -8, 2 + bob, 16, 14, "#e8d5a3");
  drawPixelRect(ctx, -9, 0 + bob, 18, 6, "#f5d76e");
  drawPixelRect(ctx, -10, 4 + bob, 4, 10, "#f5d76e");
  drawPixelRect(ctx, 6, 4 + bob, 4, 10, "#f5d76e");
  drawPixelRect(ctx, -4, 7 + bob, 3, 3, "#1a1a1a");
  drawPixelRect(ctx, 2, 7 + bob, 3, 3, "#1a1a1a");

  ctx.restore();
}

function drawEnemy(ctx, e) {
  if (!e.alive) return;
  const flash = e.hitFlash > 0;
  const body =
    e.kind === "brute" ? (flash ? "#fff" : "#6b2d8b") : e.kind === "scout" ? (flash ? "#fff" : "#3d8b5a") : flash ? "#fff" : "#8b3a3a";
  const accent = e.kind === "brute" ? "#c9a227" : "#222";

  drawPixelRect(ctx, e.x, e.y + 8, e.w, e.h - 8, body);
  drawPixelRect(ctx, e.x + 4, e.y, e.w - 8, 12, body);
  drawPixelRect(ctx, e.x + 6, e.y + 4, 4, 4, "#ffef9a");
  drawPixelRect(ctx, e.x + e.w - 12, e.y + 4, 4, 4, "#ffef9a");
  drawPixelRect(ctx, e.x + 2, e.y + e.h - 6, e.w - 4, 6, accent);

  // HP pips
  for (let i = 0; i < e.maxHp; i++) {
    drawPixelRect(
      ctx,
      e.x + i * 6,
      e.y - 8,
      5,
      4,
      i < e.hp ? "#e74c3c" : "#333"
    );
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
    this.time += 1;
    this.follow(player, level);

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Sky
    const grd = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grd.addColorStop(0, "#1a2748");
    grd.addColorStop(0.55, "#3a5c9a");
    grd.addColorStop(1, "#6a4a2a");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(-Math.round(this.camX), 0);

    // Distant mountains
    ctx.fillStyle = "#2a3d66";
    for (let i = 0; i < 12; i++) {
      const mx = i * 220;
      ctx.beginPath();
      ctx.moveTo(mx, level.groundY);
      ctx.lineTo(mx + 110, level.groundY - 90 - (i % 3) * 20);
      ctx.lineTo(mx + 220, level.groundY);
      ctx.fill();
    }

    // Castle silhouette near goal
    ctx.fillStyle = "#1c2438";
    ctx.fillRect(level.goal.x - 40, level.goal.y - 40, 100, 140);
    ctx.fillRect(level.goal.x - 50, level.goal.y - 70, 24, 40);
    ctx.fillRect(level.goal.x + 60, level.goal.y - 70, 24, 40);

    // Hazards (lava)
    for (const hz of level.hazards) {
      if (hz.kind !== "lava") continue;
      const pulse = 0.5 + Math.sin(this.time * 0.15 + hz.x) * 0.15;
      ctx.fillStyle = `rgba(255, 70, 20, ${0.85})`;
      ctx.fillRect(hz.x, hz.y, hz.w, hz.h);
      ctx.fillStyle = `rgba(255, 200, 40, ${pulse})`;
      for (let i = 0; i < hz.w; i += 16) {
        const wave = Math.sin(this.time * 0.2 + i * 0.1) * 4;
        ctx.fillRect(hz.x + i, hz.y + wave, 10, 8);
      }
    }

    // Solids
    for (const s of level.solids) {
      if (s.type === "ground") {
        drawPixelRect(ctx, s.x, s.y, s.w, s.h, "#5a3a1e");
        drawPixelRect(ctx, s.x, s.y, s.w, 8, "#3d8b3d");
        for (let i = 0; i < s.w; i += 32) {
          drawPixelRect(ctx, s.x + i, s.y + 10, 28, 4, "#6b4524");
        }
      } else {
        drawPixelRect(ctx, s.x, s.y, s.w, s.h, "#7a6a55");
        drawPixelRect(ctx, s.x, s.y, s.w, 4, "#a09078");
        drawPixelRect(ctx, s.x, s.y + s.h - 4, s.w, 4, "#4a4035");
      }
    }

    // Pickups
    for (const p of level.pickups) {
      if (p.taken) continue;
      if (p.kind === "heart") drawHeart(ctx, p.x, p.y + Math.sin(this.time * 0.1 + p.x) * 2);
      if (p.kind === "sword") drawSwordPickup(ctx, p.x, p.y, this.time);
    }

    // Goal banner
    drawPixelRect(ctx, level.goal.x + 10, level.goal.y, 6, level.goal.h, "#c9a227");
    drawPixelRect(ctx, level.goal.x + 16, level.goal.y + 8, 28, 18, "#9b2226");
    ctx.fillStyle = "#f0c14b";
    ctx.font = "8px 'Press Start 2P'";
    ctx.fillText("TOR", level.goal.x + 18, level.goal.y + 20);

    for (const e of level.enemies) drawEnemy(ctx, e);
    drawHeMan(ctx, player);

    // Attack flash
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

    if (state === "won") {
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  drawHud(game) {
    const { ctx, canvas } = this;
    const { player, level } = game;

    drawPixelRect(ctx, 0, 0, canvas.width, 40, "rgba(10,14,28,0.72)");
    ctx.fillStyle = "#f0c14b";
    ctx.font = "10px 'Press Start 2P'";
    ctx.fillText(`LVL ${level.id}`, 12, 24);
    ctx.fillStyle = "#9aa6c3";
    ctx.font = "8px 'Press Start 2P'";
    ctx.fillText(level.name, 70, 24);

    // Hearts
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
    ctx.fillText(
      player.hasSword ? "SCHWERT" : "FAUST",
      canvas.width / 2 - 30,
      24
    );
  }
}
