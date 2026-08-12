import { Input } from "./input.js";
import { Player } from "./player.js";
import { createLevel1 } from "./level.js";
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
    this.state = "title"; // title | playing | dead | won
    this.loadLevel();
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
    requestAnimationFrame((t) => this.loop(t));
  }

  loadLevel() {
    this.level = createLevel1();
    this.player = new Player(this.level.spawn.x, this.level.spawn.y);
    this.renderer.camX = 0;
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
    if (this.state === "title" || this.state === "dead" || this.state === "won") {
      this.loadLevel();
      this.state = "playing";
      this.hideOverlay();
    }
  }

  update() {
    if (this.input.restart()) {
      this.loadLevel();
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

    // Combat — hitIds liegt auf player.attack (nicht neu erzeugen)
    const hitbox = player.getHitbox();
    if (hitbox && player.attack) {
      for (const e of level.enemies) {
        if (!e.alive) continue;
        if (player.attack.hitIds.has(e.id)) continue;
        if (aabb(hitbox, e.hurtbox)) {
          player.attack.hitIds.add(e.id);
          e.takeHit(hitbox.damage);
        }
      }
    }

    // Enemy contact damage
    for (const e of level.enemies) {
      if (!e.alive) continue;
      if (aabb(player.hurtbox, e.hurtbox)) {
        player.takeDamage(1);
      }
    }

    // Pickups
    for (const p of level.pickups) {
      if (p.taken) continue;
      if (!aabb(player.hurtbox, p)) continue;
      p.taken = true;
      if (p.kind === "heart") player.heal(p.value || 1);
      if (p.kind === "sword") player.hasSword = true;
    }

    // Goal
    if (aabb(player.hurtbox, level.goal)) {
      this.state = "won";
      this.showOverlay(
        "Level 1 geschafft!",
        "Tor erreicht. Später: 12 Level — und Skeletor wird zum guten Hero. Tippe START oder R."
      );
    }

    // Fall death
    if (player.y > level.height + 80) {
      player.hearts = 0;
      player.alive = false;
    }

    if (!player.alive && this.state === "playing") {
      this.state = "dead";
      this.showOverlay(
        "He-Man ist gefallen…",
        "Die Macht von Grayskull wartet. Tippe START oder R für einen neuen Versuch."
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

    // Edge-Inputs erst nach mindestens einem Update verwerfen
    if (steps > 0) this.input.endFrame();

    this.renderer.draw(this);
    requestAnimationFrame((t) => this.loop(t));
  }
}
