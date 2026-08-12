const CRUISE = 3.1;
const BOOST = 5.4;
const BRAKE = 1.6;
const VERT = 3.6;
const MAX_HEARTS = 15;

/** 1-Mann-Raumluftfahrzeug für Stufe 2 */
export class Ship {
  constructor(x, y, corridor) {
    this.spawnX = x;
    this.spawnY = y;
    this.corridor = corridor || { top: 48, bottom: 420 };
    this.reset();
  }

  reset() {
    this.x = this.spawnX;
    this.y = this.spawnY;
    this.w = 56;
    this.h = 28;
    this.vx = CRUISE;
    this.vy = 0;
    this.hearts = MAX_HEARTS;
    this.maxHearts = MAX_HEARTS;
    this.hasSword = false;
    this.invuln = 0;
    this.shootCd = 0;
    this.animTimer = 0;
    this.alive = true;
    this.boosting = false;
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

    this.boosting = false;
    if (input.brake()) {
      this.vx += (BRAKE - this.vx) * 0.2;
    } else if (input.right() || input.run()) {
      this.vx += (BOOST - this.vx) * 0.18;
      this.boosting = true;
    } else {
      this.vx += (CRUISE - this.vx) * 0.12;
    }

    let vy = 0;
    if (input.up()) vy -= VERT;
    if (input.sink()) vy += VERT;
    this.vy = vy;

    this.x += this.vx;
    this.y += this.vy;

    const top = this.corridor.top;
    const bot = this.corridor.bottom - this.h;
    if (this.y < top) this.y = top;
    if (this.y > bot) this.y = bot;

    if ((input.punch() || input.shoot()) && this.shootCd <= 0) {
      this.shootCd = 12;
      flight.bullets.push({
        x: this.x + this.w - 4,
        y: this.y + this.h / 2 - 3,
        w: 16,
        h: 6,
        vx: 11,
        vy: 0,
        damage: 1,
        life: 70,
        from: "player",
      });
    }
  }
}
