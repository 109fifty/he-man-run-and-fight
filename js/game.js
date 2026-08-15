import { Input } from "./input.js";
import { Player } from "./player.js";
import { createLevel, TOTAL_LEVELS, LEVELS_PER_STAGE } from "./level.js";
import { createFlightLevel, STAGE2_LEVELS } from "./stage2.js";
import { Ship } from "./ship.js";
import { FlightSim } from "./flight.js";
import { Renderer } from "./renderer.js";
import { aabb } from "./physics.js";
import { FullscreenUI } from "./fullscreen.js";
import { DIFFICULTIES, loadDifficulty, saveDifficulty } from "./difficulty.js";

const LS_STAGE2 = "heman-stage2";

export class Game {
  constructor(canvas, overlay) {
    this.canvas = canvas;
    this.overlay = overlay;
    this.overlayTitle = document.getElementById("overlay-title");
    this.overlayText = document.getElementById("overlay-text");
    this.input = new Input();
    this.renderer = new Renderer(canvas);
    this.fs = new FullscreenUI();
    this.state = "title"; // title | playing | dead | levelclear | campaign | stageclear
    this.stage = 1;
    this.levelId = 1;
    this.mode = "run"; // run | flight | arena
    this.ship = null;
    this.flight = null;
    this.carry = { hasSword: false, hearts: null };
    this.pendingStage = 1;
    this.difficulty = loadDifficulty();
    try {
      if (new URLSearchParams(location.search).has("stage2")) this.unlockStage2();
    } catch (_) {
      /* ignore */
    }
    this.loadLevel(this.levelId, true);
    this._boundClick = (e) => {
      if (e.target?.closest?.("[data-stage]") || e.target?.closest?.("[data-diff]")) return;
      e.preventDefault();
      this.tryStart();
    };
    overlay.addEventListener("pointerup", this._boundClick);
    this._bindStageButtons();
    this._bindDiffButtons();
    this._refreshTitleUi();
    this._syncMenuChrome();
    this.last = 0;
    this.acc = 0;
    this.step = 1000 / 60;
    this.maxSteps = 5;
    this.running = true;
    requestAnimationFrame((t) => this.loop(t));
  }

  stage2Unlocked() {
    // Beide Stufen immer wählbar (iPad/PWA ohne Query-Param)
    return true;
  }

  unlockStage2() {
    try {
      localStorage.setItem(LS_STAGE2, "1");
    } catch (_) {
      /* ignore */
    }
    this._refreshTitleUi();
  }

  _bindStageButtons() {
    document.querySelectorAll("[data-stage]").forEach((btn) => {
      btn.addEventListener("pointerup", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const s = Number(btn.dataset.stage) || 1;
        this.pendingStage = s;
        if (this.state === "title" || this.state === "campaign" || this.state === "stageclear") {
          this.startStage(s);
        }
      });
    });
  }

  _bindDiffButtons() {
    document.querySelectorAll("[data-diff]").forEach((btn) => {
      btn.addEventListener("pointerup", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = btn.dataset.diff;
        if (!DIFFICULTIES[id]) return;
        this.difficulty = saveDifficulty(id);
        this._refreshTitleUi();
      });
    });
  }

  _refreshTitleUi() {
    document.body.classList.add("stage2-unlocked");
    const b2 = document.getElementById("btn-stage2");
    if (b2) b2.hidden = false;
    document.body.classList.toggle("mode-flight", this.mode === "flight");
    document.body.classList.toggle("mode-run", this.mode !== "flight");
    document.querySelectorAll("[data-diff]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.diff === this.difficulty.id);
    });
  }

  diffOpts() {
    return this.difficulty;
  }

  setMode(mode) {
    if (this.mode !== mode) this.input.releaseAll();
    this.mode = mode;
    this._refreshTitleUi();
  }

  loadLevel(id, freshRun = false, opts = {}) {
    this.levelId = id;
    const d = this.diffOpts();
    if (this.stage === 2) {
      this.level = createFlightLevel(id);
      this.setMode("flight");
      this.ship = new Ship(this.level.spawn.x, this.level.spawn.y, this.level.corridor, d);
      this.flight = new FlightSim(this.level);
      this.flight.reset(this.level);
      this.player = new Player(this.level.spawn.x, this.level.spawn.y, d);
      const keepSword = !!(opts.keepSword || (!freshRun && this.carry.hasSword));
      if (opts.fullHearts) {
        this.ship.refillHearts();
        this.player.refillHearts();
        this.ship.hasSword = keepSword;
        this.player.hasSword = keepSword;
      } else if (!freshRun && this.carry.hearts != null) {
        this.ship.hearts = Math.min(this.carry.hearts, this.ship.maxHearts);
        this.ship.hasSword = this.carry.hasSword;
        this.player.hearts = Math.min(this.carry.hearts, this.player.maxHearts);
        this.player.hasSword = this.carry.hasSword;
      } else if (keepSword) {
        this.ship.hasSword = true;
        this.player.hasSword = true;
      }
    } else {
      this.level = createLevel(id);
      this.setMode("run");
      this.ship = null;
      this.flight = null;
      this.player = new Player(this.level.spawn.x, this.level.spawn.y, d);
      const keepSword = !!(opts.keepSword || (!freshRun && this.carry.hasSword));
      if (opts.fullHearts) {
        this.player.refillHearts();
        this.player.hasSword = keepSword;
      } else if (!freshRun && this.carry.hearts != null) {
        this.player.hearts = Math.min(this.carry.hearts, this.player.maxHearts);
        this.player.hasSword = this.carry.hasSword;
      } else if (keepSword) {
        this.player.hasSword = true;
      }
    }
    this.renderer.camX = 0;
    this.updateTagline();
  }

  enterArena() {
    const arena = this.level.arena;
    if (!arena) return;
    // Drop flight holds before SCHUSS/▲/▼ hide (lost pointerup → stuck fire/climb)
    this.input.releaseAll();
    const hearts = this.ship ? this.ship.hearts : this.player.hearts;
    const sword = this.ship ? this.ship.hasSword : this.player.hasSword;
    if (!hearts || hearts <= 0) {
      this.state = "dead";
      this.showOverlay(
        "Schiff abgeschossen…",
        `Stufe 2 · Level ${this.levelId}: ${this.level.name}. Tippe START oder R.`
      );
      return;
    }
    const d = this.diffOpts();
    this.level = {
      ...this.level,
      mode: "arena",
      solids: arena.solids,
      hazards: arena.hazards,
      pickups: arena.pickups,
      enemies: arena.enemies,
      goal: arena.goal,
      spawn: arena.spawn,
      width: arena.width,
      height: arena.height,
      groundY: arena.groundY,
    };
    this.setMode("arena");
    this.player = new Player(arena.spawn.x, arena.spawn.y, d);
    this.player.hearts = Math.min(hearts, this.player.maxHearts);
    this.player.hasSword = sword;
    this.ship = null;
    this.flight = null;
    this.renderer.camX = 0;
  }

  updateTagline() {
    const el = document.querySelector(".tagline");
    const max = this.stage === 2 ? STAGE2_LEVELS : TOTAL_LEVELS;
    const diff = this.difficulty.short || "ANF";
    if (el) {
      el.textContent =
        this.stage === 2
          ? `Stufe 2 · ${diff} · Level ${this.levelId}/${max}`
          : `Stufe 1 · ${diff} · Level ${this.levelId}/${max}`;
    }
  }

  showOverlay(title, text) {
    this.overlayTitle.textContent = title;
    this.overlayText.textContent = text;
    this.overlay.classList.remove("hidden");
    this._syncMenuChrome();
  }

  hideOverlay() {
    this.overlay.classList.add("hidden");
    this._syncMenuChrome();
  }

  _syncMenuChrome() {
    const menu =
      this.state === "title" || this.state === "campaign" || this.state === "stageclear";
    document.body.classList.toggle("overlay-menu", menu && !this.overlay.classList.contains("hidden"));
    document.body.classList.toggle("overlay-open", !this.overlay.classList.contains("hidden"));
    this.fs?._syncEnterBtn?.();
  }

  async startStage(stage) {
    this.stage = stage;
    this.levelId = 1;
    this.carry = { hasSword: false, hearts: null };
    this.loadLevel(1, true);
    this.state = "playing";
    this.hideOverlay();
    await this.fs.enter();
  }

  async tryStart() {
    if (this.state === "title") {
      this.input.endFrame();
      await this.startStage(this.pendingStage || 1);
      return;
    }
    if (this.state === "dead") {
      this.input.endFrame();
      const sword =
        this.player?.hasSword || this.ship?.hasSword || this.carry.hasSword;
      this.carry.hasSword = sword;
      this.loadLevel(this.levelId, false, { fullHearts: true, keepSword: sword });
      this.state = "playing";
      this.hideOverlay();
      await this.fs.enter();
      return;
    }
    if (this.state === "levelclear") {
      this.input.endFrame();
      const next = this.levelId + 1;
      const actor = this.mode === "flight" ? this.ship : this.player;
      this.carry = {
        hasSword: actor?.hasSword || false,
        hearts: actor?.hearts ?? null,
      };
      this.loadLevel(next, false);
      this.state = "playing";
      this.hideOverlay();
      await this.fs.enter();
      return;
    }
    if (this.state === "stageclear") {
      this.input.endFrame();
      this.unlockStage2();
      await this.startStage(2);
      return;
    }
    if (this.state === "campaign") {
      this.input.endFrame();
      this.pendingStage = 1;
      await this.startStage(1);
    }
  }

  skeletorRedeemed() {
    return this.level.enemies.some((e) => e.redeemed || e.kind === "heroSkeletor");
  }

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

  canEnterGoal() {
    if (this.level.requireBoss) {
      if (!this.bossCleared()) return false;
      return !this.player.onGround;
    }
    return true;
  }

  clearLevel() {
    // Space is jump+start: clear edge so multi-step frames don't auto-advance
    this.input.endFrame();
    const max = this.stage === 2 ? STAGE2_LEVELS : LEVELS_PER_STAGE;
    if (this.levelId >= max) {
      if (this.stage === 1) {
        this.unlockStage2();
        this.state = "stageclear";
        this.showOverlay(
          "Stufe 1 geschafft!",
          "Skeletor fand das Licht. Tippe START für Stufe 2: Flugkampf im Raumluftfahrzeug!"
        );
      } else {
        this.state = "campaign";
        this.showOverlay(
          "Eternia ist frei!",
          "Stufe 1 + Stufe 2 komplett — alle Welten und Endkämpfe besiegt. Tippe START für Stufe 1."
        );
      }
    } else {
      const bossNote = this.level.bossLevel
        ? ` Endkampf gegen ${this.level.bossTitle || "den Boss"} gewonnen!`
        : "";
      this.state = "levelclear";
      this.showOverlay(
        `Stufe ${this.stage} · Level ${this.levelId} geschafft!`,
        `${this.level.name}.${bossNote} Weiter zu Level ${this.levelId + 1}. Tippe START.`
      );
    }
  }

  updateFlight() {
    const { ship, flight, level } = this;
    if (!ship || !flight) return;

    if (ship.alive) {
      ship.update(this.input, flight);
      flight.update(ship);
    }

    if (!ship.alive && this.state === "playing") {
      this.state = "dead";
      this.showOverlay(
        "Schiff abgeschossen…",
        `Stufe 2 · Level ${this.levelId}: ${level.name}. Tippe START oder R.`
      );
      return;
    }

    if (level.bossTrigger && ship.alive && ship.hearts > 0 && ship.x >= level.bossTrigger) {
      this.enterArena();
      return;
    }

    if (!level.bossLevel && ship.alive && aabb(ship.hurtbox, level.goal)) {
      this.clearLevel();
    }
  }

  updateGround() {
    const { player, level } = this;
    const bossSlow = !!(level.requireBoss && this.activeBoss());
    player.update(this.input, level.solids, level.hazards, { bossSlow });

    for (const e of level.enemies) e.update(level.solids, player);

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
      const eh = e.getHitbox();
      if (!eh || e.attack?.hit) continue;
      if (aabb(eh, player.hurtbox) && player.invuln <= 0) {
        if (e.attack) e.attack.hit = true;
        player.takeDamage(eh.damage || 1);
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
        player.invuln = Math.max(player.invuln, 10);
      } else if (player.invuln <= 0 && !e.attack) {
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

    if (this.canEnterGoal() && aabb(player.hurtbox, level.goal)) {
      this.clearLevel();
    }

    if (player.y > level.height + 80) {
      player.hearts = 0;
      player.alive = false;
    }

    if (!player.alive && this.state === "playing") {
      this.state = "dead";
      this.showOverlay(
        "He-Man ist gefallen…",
        `Stufe ${this.stage} · Level ${this.levelId}: ${level.name}. Tippe START oder R.`
      );
    }
  }

  update() {
    if (this.input.restart()) {
      if (this.state === "campaign" || this.state === "title" || this.state === "stageclear") {
        this.startStage(this.pendingStage || this.stage || 1);
      } else {
        const sword =
          this.player?.hasSword || this.ship?.hasSword || this.carry.hasSword;
        this.carry.hasSword = sword;
        this.loadLevel(this.levelId, false, { fullHearts: true, keepSword: sword });
        this.state = "playing";
        this.hideOverlay();
        this.fs.enter();
      }
      return;
    }

    if (this.state !== "playing") {
      if (this.input.start()) this.tryStart();
      return;
    }

    if (this.mode === "flight") this.updateFlight();
    else this.updateGround();
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
    this.fs.tick(frame);

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
