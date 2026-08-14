const CRUISE = 3.1;
const BOOST = 5.4;
const BRAKE = 1.6;
const VERT = 3.6;

/** 1-Mann-Raumluftfahrzeug für Stufe 2 */
export class Ship {
  /**
   * @param {number} x
   * @param {number} y
   * @param {{ top: number, bottom: number }} corridor
   * @param {{ hearts?: number, shipSpeed?: number }} [diff]
   */
  constructor(x, y, corridor, diff = {}) {
    this.spawnX = x;
    this.spawnY = y;
    this.corridor = corridor || { top: 48, bottom: 420 };
    this.diffHearts = diff.hearts ?? 15;
    this.speedMul = diff.shipSpeed ?? diff.speed ?? 1;
    this.reset();
  }

  reset() {
    this.x = this.spawnX;
    this.y = this.spawnY;
    this.w = 56;
    this.h = 28;
    this.vx = CRUISE * this.speedMul;
    this.vy = 0;
    this.maxHearts = this.diffHearts;
    this.hearts = this.diffHearts;
    this.hasSword = false;
    this.invuln = 0;
    this.shootCd = 0;
    this.animTimer = 0;
    this.alive = true;
    this.boosting = false;
    this.burst = 0;
  }

  applyDifficulty(diff) {
    this.diffHearts = diff.hearts ?? 15;
    this.speedMul = diff.shipSpeed ?? diff.speed ?? 1;
    this.maxHearts = this.diffHearts;
    this.hearts = Math.min(this.hearts, this.maxHearts);
  }

  refillHearts() {
    this.hearts = this.maxHearts;
  }

  get hurtbox() {
    return { x: this.x + 6, y: this.y + 4, w: this.w - 12, h: this.h - 8 };
  }

  takeDamage(n = 1) {
    if (this.invuln > 0 || !this.alive) return;
    this.hearts -= n;
    this.invuln = 55;
    if (this.hearts <= 0) {
      this.hearts = 0;
      this.alive = false;
    }
  }

  heal(n = 1) {
    this.hearts = Math.min(this.maxHearts, this.hearts + n);
  }

  /**
   * @param {import('./input.js').Input} input
   * @param {{ bullets: object[] }} flight
   */
  update(input, flight) {
    if (!this.alive) return;
    this.animTimer += 1;
    if (this.invuln > 0) this.invuln -= 1;
    if (this.shootCd > 0) this.shootCd -= 1;

    const cruise = CRUISE * this.speedMul;
    const boost = BOOST * this.speedMul;
    const brake = BRAKE * this.speedMul;
    const vert = VERT * Math.min(1.25, 0.85 + this.speedMul * 0.15);

    this.boosting = false;
    if (input.brake()) {
      this.vx += (brake - this.vx) * 0.2;
    } else if (input.right() || input.run()) {
      this.vx += (boost - this.vx) * 0.18;
      this.boosting = true;
    } else {
      this.vx += (cruise - this.vx) * 0.12;
    }

    let vy = 0;
    if (input.up()) vy -= vert;
    if (input.sink()) vy += vert;
    this.vy = vy;

    this.x += this.vx;
    this.y += this.vy;

    const top = this.corridor.top;
    const bot = this.corridor.bottom - this.h;
    if (this.y < top) this.y = top;
    if (this.y > bot) this.y = bot;

    if ((input.fireHeld?.() || input.punch() || input.shoot()) && this.shootCd <= 0) {
      this.shootCd = Math.max(6, Math.round(9 / Math.min(1.35, this.speedMul)));
      this.burst = (this.burst || 0) + 1;
      const pattern = this.burst % 3; // 0 Einzel · 1 Doppel · 2 Streu
      const base = {
        x: this.x + this.w - 4,
        y: this.y + this.h / 2 - 3,
        w: 16,
        h: 6,
        vx: 11 * Math.min(1.25, this.speedMul),
        damage: 1,
        life: 70,
        from: "player",
      };
      const push = (vy = 0, ox = 0, oy = 0) =>
        flight.bullets.push({ ...base, x: base.x + ox, y: base.y + oy, vy });
      if (pattern === 0) push(0);
      else if (pattern === 1) {
        push(-0.8, 0, -5);
        push(0.8, 0, 5);
      } else {
        push(-1.6, 0, -8);
        push(0);
        push(1.6, 0, 8);
      }
    }
  }
}
