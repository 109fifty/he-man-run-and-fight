import { aabb, resolveSolid } from "./physics.js";

const GRAVITY = 0.55;

const KIND = {
  scout: { w: 24, h: 32, speed: 1.4 },
  grunt: { w: 30, h: 40, speed: 1.0 },
  brute: { w: 36, h: 48, speed: 0.7 },
  skeletor: { w: 40, h: 56, speed: 1.1 },
  heroSkeletor: { w: 40, h: 56, speed: 0 },
};

export class Enemy {
  constructor({ x, y, hp, kind = "grunt", patrol = 80 }) {
    const k = KIND[kind] || KIND.grunt;
    this.x = x;
    this.y = y;
    this.w = k.w;
    this.h = k.h;
    this.hp = hp;
    this.maxHp = hp;
    this.kind = kind;
    this.baseSpeed = k.speed;
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
    this.redeemed = false;
    this.id = `${kind}-${x}-${y}-${Math.random().toString(36).slice(2, 7)}`;
  }

  get hurtbox() {
    return { x: this.x + 2, y: this.y + 2, w: this.w - 4, h: this.h - 2 };
  }

  takeHit(damage) {
    if (!this.alive || this.redeemed) return false;
    this.hp -= damage;
    this.hitFlash = 10;
    this.stun = this.kind === "skeletor" ? 10 : 18;
    this.vx = 0;
    if (this.hp <= 0) {
      if (this.kind === "skeletor") {
        // Wird zum guten Hero — bleibt stehen, nicht „tot“
        this.redeemed = true;
        this.kind = "heroSkeletor";
        this.hp = 0;
        this.vx = 0;
        this.dir = 1;
        return true;
      }
      this.alive = false;
      return true;
    }
    return false;
  }

  speed() {
    return this.baseSpeed;
  }

  update(solids) {
    if (!this.alive) return;
    this.animTimer += 1;
    if (this.hitFlash > 0) this.hitFlash -= 1;
    if (this.turnCooldown > 0) this.turnCooldown -= 1;
    if (this.stun > 0) this.stun -= 1;

    if (this.redeemed || this.kind === "heroSkeletor") {
      this.vx = 0;
      this.vy += GRAVITY;
      if (this.vy > 12) this.vy = 12;
      resolveSolid(this, solids);
      return;
    }

    const turn = () => {
      if (this.turnCooldown > 0) return;
      this.dir *= -1;
      this.turnCooldown = 16;
      this.originX = this.x;
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

    if (this.y > 2000) this.alive = false;
  }
}
