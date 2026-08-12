import { aabb, resolveSolid } from "./physics.js";

const GRAVITY = 0.55;

/** Größere Figuren (≈1.45×) */
export const KIND = {
  scout: { w: 34, h: 46, speed: 1.35 },
  grunt: { w: 42, h: 58, speed: 1.0 },
  brute: { w: 52, h: 70, speed: 0.75 },
  beast: { w: 68, h: 80, speed: 1.3 },
  trapjaw: { w: 64, h: 74, speed: 1.45 },
  triklops: { w: 70, h: 82, speed: 1.15 },
  skeletor: { w: 56, h: 80, speed: 1.15 },
  heroSkeletor: { w: 56, h: 80, speed: 0 },
};

export class Enemy {
  constructor({ x, y, hp, kind = "grunt", patrol = 80, isBoss = false, title = "" }) {
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
    this.isBoss =
      isBoss ||
      ["beast", "trapjaw", "triklops", "skeletor"].includes(kind);
    this.title = title;
    this.id = `${kind}-${x}-${y}-${Math.random().toString(36).slice(2, 7)}`;
  }

  get hurtbox() {
    return { x: this.x + 3, y: this.y + 3, w: this.w - 6, h: this.h - 3 };
  }

  takeHit(damage) {
    if (!this.alive || this.redeemed) return false;
    this.hp -= damage;
    this.hitFlash = 10;
    this.stun = this.isBoss ? 8 : 18;
    this.vx = 0;
    if (this.hp <= 0) {
      if (this.kind === "skeletor") {
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
    if (this.isBoss && this.hp <= this.maxHp * 0.5) return this.baseSpeed * 1.25;
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
      this.turnCooldown = this.isBoss ? 10 : 16;
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
