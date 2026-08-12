import { Input } from "./input.js";
import { Player } from "./player.js";
import { createLevel, TOTAL_LEVELS } from "./level.js";
import { Renderer } from "./renderer.js";
import { aabb } from "./physics.js";

export class Game {
  constructor(canvas, overlay) {
    this.canvas = canvas;
    this.overlay = overlay;
    this.overlayTitle = document.getElementById("overlay-title");
    this.overlayText = document.getElementById("overlay-text");
    this.input = new Input();
    this.renderer = new Renderer(canvas);
    this.state = "title"; // title | playing | dead | levelclear | campaign
    this.levelId = 1;
    this.carry = { hasSword: false, hearts: null };
    this.loadLevel(this.levelId, true);
    this._boundClick = (e) => {
      e.preventDefault();
      this.tryStart();
    };
    overlay.addEventListener("pointerup", this._boundClick);
    this.last = 0;
    this.acc = 0;
    this.step = 1000 / 60;
    this.maxSteps = 5;
    this.running = true;
    this._redeemShown = false;
    requestAnimationFrame((t) => this.loop(t));
  }

  loadLevel(id, freshRun = false) {
    this.levelId = id;
    this.level = createLevel(id);
    this.player = new Player(this.level.spawn.x, this.level.spawn.y);
    if (!freshRun && this.carry.hearts != null) {
      this.player.hearts = this.carry.hearts;
      this.player.hasSword = this.carry.hasSword;
    } else if (!freshRun && this.carry.hasSword) {
      this.player.hasSword = true;
    }
    this.renderer.camX = 0;
    this._redeemShown = false;
    this.updateTagline();
  }

  updateTagline() {
    const el = document.querySelector(".tagline");
    if (el) el.textContent = `Run & Fight · Level ${this.levelId} / ${TOTAL_LEVELS}`;
  }

  showOverlay(title, text) {
    this.overlayTitle.textContent = title;
    this.overlayText.textContent = text;
    this.overlay.classList.remove("hidden");
  }

  hideOverlay() {
    this.overlay.classList.add("hidden");
  }

  tryStart() {
    if (this.state === "title") {
      this.levelId = 1;
      this.carry = { hasSword: false, hearts: null };
      this.loadLevel(1, true);
      this.state = "playing";
      this.hideOverlay();
      return;
    }
    if (this.state === "dead") {
      this.loadLevel(this.levelId, false);
      this.state = "playing";
      this.hideOverlay();
      return;
    }
    if (this.state === "levelclear") {
      const next = this.levelId + 1;
      this.carry = {
        hasSword: this.player.hasSword,
        hearts: this.player.hearts,
      };
      this.loadLevel(next, false);
      this.state = "playing";
      this.hideOverlay();
      return;
    }
    if (this.state === "campaign") {
      this.levelId = 1;
      this.carry = { hasSword: false, hearts: null };
      this.loadLevel(1, true);
      this.state = "playing";
      this.hideOverlay();
    }
  }

  skeletorRedeemed() {
    return this.level.enemies.some((e) => e.redeemed || e.kind === "heroSkeletor");
  }

  /** Endkampf gewonnen: alle Bosse besiegt / Skeletor erlöst */
  bossCleared() {
    const bosses = this.level.enemies.filter((e) => e.isBoss);
    if (!bosses.length) return true;
    return bosses.every((e) => !e.alive || e.redeemed || e.kind === "heroSkeletor");
  }

  activeBoss() {
    return this.level.enemies.find(
      (e) => e.isBoss && e.alive && !e.redeemed && e.kind !== "heroSkeletor"
    );
  }

  update() {
    if (this.input.restart()) {
      if (this.state === "campaign") {
        this.levelId = 1;
        this.carry = { hasSword: false, hearts: null };
        this.loadLevel(1, true);
      } else {
        this.loadLevel(this.levelId, false);
      }
      this.state = "playing";
      this.hideOverlay();
      return;
    }

    if (this.state !== "playing") {
      if (this.input.start()) this.tryStart();
      return;
    }

    const { player, level } = this;
    player.update(this.input, level.solids, level.hazards);

    for (const e of level.enemies) e.update(level.solids);

    const hitbox = player.getHitbox();
    if (hitbox && player.attack) {
      for (const e of level.enemies) {
        if (!e.alive || e.redeemed) continue;
        if (player.attack.hitIds.has(e.id)) continue;
        if (aabb(hitbox, e.hurtbox)) {
          player.attack.hitIds.add(e.id);
          e.takeHit(hitbox.damage);
        }
      }
    }

    for (const e of level.enemies) {
      if (!e.alive || e.redeemed) continue;
      if (!aabb(player.hurtbox, e.hurtbox)) continue;

      const feet = player.y + player.h;
      const headZone = e.y + e.h * 0.35;
      const stomping = player.vy > 0 && feet <= headZone + 6;

      if (stomping) {
        e.takeHit(1);
        player.y = e.y - player.h;
        player.vy = -9.5;
        player.onGround = false;
        player.invuln = Math.max(player.invuln, 8);
      } else if (player.invuln <= 0) {
        player.takeDamage(1);
      }
    }

    for (const p of level.pickups) {
      if (p.taken) continue;
      if (!aabb(player.hurtbox, p)) continue;
      p.taken = true;
      if (p.kind === "heart") player.heal(p.value || 1);
      if (p.kind === "sword") player.hasSword = true;
    }

    const canFinish = !level.requireBoss || this.bossCleared();

    if (canFinish && aabb(player.hurtbox, level.goal)) {
      if (this.levelId >= TOTAL_LEVELS) {
        this.state = "campaign";
        this.showOverlay(
          "Skeletor ist ein Hero!",
          "Durch deine Stärke fand er das Licht. Alle 12 Level + Endkämpfe geschafft. Tippe START."
        );
      } else {
        const bossNote = level.bossLevel
          ? ` Endkampf gegen ${level.bossTitle || "den Boss"} gewonnen!`
          : "";
        this.state = "levelclear";
        this.showOverlay(
          `Level ${this.levelId} geschafft!`,
          `${level.name}.${bossNote} Weiter zu Level ${this.levelId + 1}. Tippe START.`
        );
      }
    }

    if (player.y > level.height + 80) {
      player.hearts = 0;
      player.alive = false;
    }

    if (!player.alive && this.state === "playing") {
      this.state = "dead";
      this.showOverlay(
        "He-Man ist gefallen…",
        `Level ${this.levelId}: ${level.name}. Tippe START oder R für einen neuen Versuch.`
      );
    }
  }

  loop(now) {
    if (!this.running) return;
    if (!this.last) {
      this.last = now;
      this.renderer.draw(this);
      requestAnimationFrame((t) => this.loop(t));
      return;
    }

    let frame = now - this.last;
    this.last = now;
    if (frame > 100) frame = this.step;
    this.acc += frame;

    let steps = 0;
    while (this.acc >= this.step && steps < this.maxSteps) {
      this.update();
      this.acc -= this.step;
      steps += 1;
    }
    if (steps === this.maxSteps) this.acc = 0;
    if (steps > 0) this.input.endFrame();

    this.renderer.draw(this);
    requestAnimationFrame((t) => this.loop(t));
  }
}
