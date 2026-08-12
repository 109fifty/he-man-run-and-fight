import { aabb, resolveSolid } from "./physics.js";

const GRAVITY = 0.55;

/** Größere Figuren — Bosse bewusst langsamer */
export const KIND = {
  scout: { w: 34, h: 46, speed: 1.35, atkReach: 28, atkDmg: 1, atkCd: 70 },
  grunt: { w: 42, h: 58, speed: 1.05, atkReach: 32, atkDmg: 1, atkCd: 60 },
  brute: { w: 52, h: 70, speed: 0.8, atkReach: 38, atkDmg: 2, atkCd: 55 },
  beast: { w: 68, h: 80, speed: 0.55, atkReach: 44, atkDmg: 2, atkCd: 70 },
  trapjaw: { w: 64, h: 74, speed: 0.6, atkReach: 48, atkDmg: 2, atkCd: 55 },
  triklops: { w: 70, h: 82, speed: 0.5, atkReach: 46, atkDmg: 2, atkCd: 65 },
  skeletor: { w: 56, h: 80, speed: 0.48, atkReach: 42, atkDmg: 2, atkCd: 50 },
  heroSkeletor: { w: 56, h: 80, speed: 0, atkReach: 0, atkDmg: 0, atkCd: 999 },
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
    this.atkReach = k.atkReach;
    this.atkDmg = k.atkDmg;
    this.atkCdMax = k.atkCd;
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
    this.attackTimer = 0;
    this.attackCd = 30 + Math.floor(Math.random() * 40);
    this.attack = null;
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

  getHitbox() {
    if (!this.attack) return null;
    const reach = this.atkReach;
    const x = this.dir === 1 ? this.x + this.w - 4 : this.x - reach + 4;
    return {
      x,
      y: this.y + this.h * 0.25,
      w: reach,
      h: this.h * 0.45,
      damage: this.atkDmg,
    };
  }

  takeHit(damage) {
    if (!this.alive || this.redeemed) return false;
    this.hp -= damage;
    this.hitFlash = 10;
    this.stun = this.isBoss ? 10 : 18;
    this.vx = 0;
    this.attack = null;
    if (this.hp <= 0) {
      if (this.kind === "skeletor") {
        this.redeemed = true;
        this.kind = "heroSkeletor";
        this.hp = 0;
        this.vx = 0;
        this.dir = 1;
        this.attack = null;
        return true;
      }
      this.alive = false;
      this.attack = null;
      return true;
    }
    return false;
  }

  speed() {
    // Bosse bleiben langsam; unter 40% HP etwas flinker, aber nie schnell
    if (this.isBoss) {
      return this.hp <= this.maxHp * 0.4 ? this.baseSpeed * 1.15 : this.baseSpeed;
    }
    return this.baseSpeed;
  }

  /** @param {object|null} player */
  update(solids, player) {
    if (!this.alive) return;
    this.animTimer += 1;
    if (this.hitFlash > 0) this.hitFlash -= 1;
    if (this.turnCooldown > 0) this.turnCooldown -= 1;
    if (this.stun > 0) this.stun -= 1;
    if (this.attackCd > 0) this.attackCd -= 1;

    if (this.attack) {
      this.attack.timer -= 1;
      if (this.attack.timer <= 0) this.attack = null;
    }

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
      this.turnCooldown = this.isBoss ? 14 : 16;
      this.originX = this.x;
    };

    // Spieler in Sicht → verfolgen / angreifen
    let chasing = false;
    if (player && player.alive && this.stun <= 0) {
      const dx = player.x + player.w / 2 - (this.x + this.w / 2);
      const dy = Math.abs(player.y + player.h / 2 - (this.y + this.h / 2));
      const dist = Math.abs(dx);
      const aggro = this.isBoss ? 280 : 160;

      if (dist < aggro && dy < 90) {
        chasing = true;
        this.dir = dx >= 0 ? 1 : -1;
        if (dist < this.atkReach + 8 && this.attackCd <= 0 && !this.attack) {
          this.attack = { timer: 16, hit: false };
          this.attackCd = this.atkCdMax;
          this.vx = 0;
        }
      }
    }

    if (this.stun > 0 || this.attack) {
      this.vx = 0;
    } else if (chasing) {
      this.vx = this.dir * this.speed() * (this.isBoss ? 1.05 : 1.15);
    } else {
      if (Math.abs(this.x - this.originX) > this.patrol) turn();
      this.vx = this.dir * this.speed();
    }

    this.vy += GRAVITY;
    if (this.vy > 12) this.vy = 12;

    const beforeX = this.x;
    const hit = resolveSolid(this, solids);

    if (this.stun <= 0 && !this.attack && hit.ground && !chasing) {
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
