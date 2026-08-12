import { aabb, resolveSolid } from "./physics.js";

const GRAVITY = 0.55;

export class Enemy {
  constructor({ x, y, hp, kind = "grunt", patrol = 80 }) {
    this.x = x;
    this.y = y;
    this.w = kind === "brute" ? 36 : kind === "scout" ? 24 : 30;
    this.h = kind === "brute" ? 48 : kind === "scout" ? 32 : 40;
    this.hp = hp;
    this.maxHp = hp;
    this.kind = kind;
    this.vx = 0;
    this.vy = 0;
    this.dir = -1;
    this.originX = x;
    this.patrol = patrol;
    this.alive = true;
    this.hitFlash = 0;
    this.animTimer = 0;
    this.turnCooldown = 0;
    this.stun = 0;
    this.id = `${kind}-${x}-${y}-${Math.random().toString(36).slice(2, 7)}`;
  }

  get hurtbox() {
    return { x: this.x + 2, y: this.y + 2, w: this.w - 4, h: this.h - 2 };
  }

  takeHit(damage) {
    if (!this.alive) return false;
    this.hp -= damage;
    this.hitFlash = 10;
    this.stun = 18;
    this.vx = 0;
    if (this.hp <= 0) {
      this.alive = false;
      return true;
    }
    return false;
  }

  speed() {
    return this.kind === "scout" ? 1.4 : this.kind === "brute" ? 0.7 : 1.0;
  }

  update(solids) {
    if (!this.alive) return;
    this.animTimer += 1;
    if (this.hitFlash > 0) this.hitFlash -= 1;
    if (this.turnCooldown > 0) this.turnCooldown -= 1;
    if (this.stun > 0) this.stun -= 1;

    const turn = () => {
      if (this.turnCooldown > 0) return;
      this.dir *= -1;
      this.turnCooldown = 16;
      this.originX = this.x; // Patrol-Anker nach Wende, verhindert Zucken am Rand
    };

    if (this.stun > 0) {
      this.vx = 0;
    } else {
      if (Math.abs(this.x - this.originX) > this.patrol) turn();
      this.vx = this.dir * this.speed();
    }

    this.vy += GRAVITY;
    if (this.vy > 12) this.vy = 12;

    const beforeX = this.x;
    const hit = resolveSolid(this, solids);

    if (this.stun <= 0 && hit.ground) {
      if (hit.wall || Math.abs(this.x - beforeX) < 0.05) turn();
      const probe = {
        x: this.x + (this.dir > 0 ? this.w + 2 : -6),
        y: this.y + this.h + 2,
        w: 4,
        h: 8,
      };
      const onLedge = solids.some((s) => aabb(probe, s));
      if (!onLedge) turn();
    }

    // aus der Welt gefallen
    if (this.y > 2000) this.alive = false;
  }
}
