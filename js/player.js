import { aabb, resolveSolid } from "./physics.js";

const GRAVITY = 0.58;
const WALK_SPEED = 2.5;
const RUN_SPEED = 4.4;
const WALK_JUMP = -11.2;
const RUN_JUMP = -14.2;
const AIR_CONTROL = 0.24;
const MAX_HEARTS = 15;

export class Player {
  constructor(x, y) {
    this.spawnX = x;
    this.spawnY = y;
    this.reset();
  }

  reset() {
    this.x = this.spawnX;
    this.y = this.spawnY;
    this.w = 40;
    this.h = 64;
    this.vx = 0;
    this.vy = 0;
    this.facing = 1;
    this.onGround = false;
    this.wasRunning = false;
    this.coyote = 0;
    this.hearts = MAX_HEARTS;
    this.maxHearts = MAX_HEARTS;
    this.hasSword = false;
    this.invuln = 0;
    this.attack = null;
    this.anim = "idle";
    this.animTimer = 0;
    this.alive = true;
    this.holdStill = false;
  }

  get hurtbox() {
    return { x: this.x + 4, y: this.y + 4, w: this.w - 8, h: this.h - 4 };
  }

  getHitbox() {
    if (!this.attack) return null;
    const reach = this.attack.type === "sword" ? 48 : this.attack.type === "kick" ? 38 : 30;
    const height = this.attack.type === "kick" ? 24 : 28;
    const yOff = this.attack.type === "kick" ? this.h - 30 : 16;
    const x =
      this.facing === 1 ? this.x + this.w - 4 : this.x - reach + 4;
    return {
      x,
      y: this.y + yOff,
      w: reach,
      h: height,
      damage: this.attack.damage,
      type: this.attack.type,
      hitIds: this.attack.hitIds,
    };
  }

  startAttack(kind) {
    if (this.attack || !this.alive) return;
    if (kind === "punch") {
      if (this.hasSword) {
        this.attack = { type: "sword", timer: 16, damage: 2, hitIds: new Set() };
        this.anim = "sword";
      } else {
        this.attack = { type: "punch", timer: 12, damage: 1, hitIds: new Set() };
        this.anim = "punch";
      }
    } else if (kind === "kick") {
      this.attack = { type: "kick", timer: 14, damage: 1, hitIds: new Set() };
      this.anim = "kick";
    }
    this.animTimer = 0;
  }

  takeDamage(amount) {
    if (this.invuln > 0 || !this.alive) return false;
    this.hearts = Math.max(0, this.hearts - amount);
    this.invuln = 70;
    this.vy = -6;
    this.vx = -this.facing * 3;
    this.attack = null;
    if (this.hearts <= 0) {
      this.alive = false;
      this.anim = "dead";
    }
    return true;
  }

  heal(amount) {
    this.hearts = Math.min(this.maxHearts, this.hearts + amount);
  }

  /**
   * @param {object} input
   * @param {object[]} solids
   * @param {object[]} hazards
   * @param {{ bossSlow?: boolean }} [opts] Endkampf: langsamer laufen
   */
  update(input, solids, hazards, opts = {}) {
    if (!this.alive) {
      this.vy += GRAVITY;
      this.y += this.vy;
      return;
    }

    if (this.invuln > 0) this.invuln -= 1;

    // Passiv: normales Laufen. Vorwärts-Taste (in Blickrichtung) = rennen.
    // Gegenrichtung = umdrehen. STOP = stehen. Shift/REN bleibt optional.
    this.holdStill = input.down();
    if (!this.holdStill) {
      if (this.facing === 1 && input.left() && !input.right()) this.facing = -1;
      else if (this.facing === -1 && input.right() && !input.left()) this.facing = 1;
    }
    const pressForward =
      (this.facing === 1 && input.right()) ||
      (this.facing === -1 && input.left());
    const wantRun = !this.holdStill && (pressForward || input.run());

    if (this.attack) {
      this.attack.timer -= 1;
      if (this.attack.timer <= 0) this.attack = null;
    }

    if (!this.attack) {
      if (input.punch()) this.startAttack("punch");
      else if (input.kick()) this.startAttack("kick");
    }

    // Endkampf: spürbar langsamer
    const slow = opts.bossSlow ? 0.62 : 1;
    const speed = (wantRun ? RUN_SPEED : WALK_SPEED) * slow;
    const canJump = this.onGround || this.coyote > 0;

    if (this.onGround) {
      this.coyote = 6;
      if (this.holdStill) {
        this.vx *= 0.55;
        if (Math.abs(this.vx) < 0.15) this.vx = 0;
        if (!this.attack) this.anim = "idle";
        this.wasRunning = false;
      } else {
        this.vx = this.facing * speed;
        this.wasRunning = wantRun;
        if (!this.attack) this.anim = wantRun ? "run" : "walk";
      }
    } else {
      if (this.coyote > 0) this.coyote -= 1;
      if (!this.holdStill) {
        const airSpeed = (wantRun || this.wasRunning ? RUN_SPEED : WALK_SPEED) * slow;
        const target = this.facing * airSpeed;
        this.vx += Math.sign(target - this.vx) * AIR_CONTROL;
        this.vx = Math.max(-airSpeed, Math.min(airSpeed, this.vx));
      }
      if (!this.attack) this.anim = this.vy < 0 ? "jump" : "fall";
    }

    if (canJump && input.jump()) {
      const runJump = this.wasRunning || wantRun;
      this.vy = (runJump ? RUN_JUMP : WALK_JUMP) * (opts.bossSlow ? 0.92 : 1);
      if (runJump) {
        this.vx = this.facing * Math.max(Math.abs(this.vx), RUN_SPEED * 0.95 * slow);
      } else if (!this.holdStill) {
        this.vx = this.facing * Math.max(Math.abs(this.vx), WALK_SPEED * slow);
      }
      this.onGround = false;
      this.coyote = 0;
      this.anim = "jump";
    }

    this.vy += GRAVITY;
    if (this.vy > 14) this.vy = 14;

    const hit = resolveSolid(this, solids);
    this.onGround = hit.ground;
    if (this.onGround) {
      this.coyote = 6;
      this.wasRunning = !this.holdStill && wantRun;
    }

    let hazardBounce = false;
    for (const hz of hazards) {
      if (!aabb(this.hurtbox, hz)) continue;
      this.takeDamage(hz.damage || 3);
      if (hz.kind === "lava" || hz.kind === "water") {
        this.vy = hz.kind === "lava" ? -10 : -8;
        this.y = Math.min(this.y, hz.y - this.h - 4);
        const mid = hz.x + hz.w / 2;
        this.vx = this.x + this.w / 2 < mid ? -3.5 : 3.5;
        hazardBounce = true;
      }
    }
    if (hazardBounce) {
      const hit2 = resolveSolid(this, solids);
      this.onGround = hit2.ground;
    }

    this.animTimer += 1;
  }
}
