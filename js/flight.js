import { aabb } from "./physics.js";

/**
 * Stufe-2 Flug-Simulation: Spawner, Hazards, Feindflugkörper, Schüsse.
 */
export class FlightSim {
  constructor(level) {
    this.level = level;
    this.bullets = [];
    this.hazards = [];
    this.crafts = [];
    this.pickups = [];
    this.timer = 0;
    this.profile = level.hazardProfile || {};
  }

  reset(level) {
    this.level = level;
    this.bullets = [];
    this.hazards = [];
    this.crafts = [];
    this.pickups = level.flightPickups ? level.flightPickups.map((p) => ({ ...p })) : [];
    this.timer = 0;
    this.profile = level.hazardProfile || {};
  }

  _randY() {
    const c = this.level.corridor;
    return c.top + 20 + Math.random() * (c.bottom - c.top - 60);
  }

  _spawnAhead(shipX) {
    const p = this.profile;
    const baseX = shipX + 700 + Math.random() * 200;

    const roll = (rate) => Math.random() < (rate || 0);

    if (roll(p.meteor)) {
      this.hazards.push({
        kind: "meteor",
        x: baseX + Math.random() * 120,
        y: this.level.corridor.top - 20,
        w: 22,
        h: 22,
        vx: -1.5 - Math.random(),
        vy: 3.2 + Math.random() * 2.5,
        damage: 2,
        rot: Math.random() * 6,
      });
    }
    if (roll(p.lavaBall)) {
      this.hazards.push({
        kind: "lavaBall",
        x: baseX,
        y: this._randY(),
        w: 20,
        h: 20,
        vx: -2.5 - Math.random(),
        vy: Math.sin(this.timer * 0.05) * 0.5,
        damage: 2,
        bob: Math.random() * 10,
      });
    }
    if (roll(p.whirl)) {
      this.hazards.push({
        kind: "whirl",
        x: baseX,
        y: this._randY(),
        w: 48,
        h: 48,
        vx: -1.2,
        vy: 0,
        damage: 1,
        pull: 0.35,
        spin: 0,
      });
    }
    if (roll(p.lightning)) {
      const y = this._randY();
      this.hazards.push({
        kind: "lightning",
        x: baseX,
        y,
        w: 14,
        h: 90,
        vx: -4,
        vy: 0,
        damage: 2,
        life: 40 + Math.floor(Math.random() * 30),
        flash: 0,
      });
    }
    if (roll(p.ice)) {
      this.hazards.push({
        kind: "ice",
        x: baseX,
        y: this._randY(),
        w: 18,
        h: 14,
        vx: -5,
        vy: (Math.random() - 0.5) * 1.5,
        damage: 1,
      });
    }
    if (roll(p.acid)) {
      this.hazards.push({
        kind: "acid",
        x: baseX,
        y: this._randY(),
        w: 36,
        h: 28,
        vx: -2,
        vy: Math.sin(this.timer * 0.08) * 0.8,
        damage: 2,
      });
    }
    if (roll(p.scrap)) {
      this.hazards.push({
        kind: "scrap",
        x: baseX,
        y: this._randY(),
        w: 16 + Math.random() * 20,
        h: 12 + Math.random() * 16,
        vx: -3 - Math.random() * 2,
        vy: (Math.random() - 0.5) * 2,
        damage: 1,
        rot: Math.random() * 6,
      });
    }
    if (roll(p.enemyCraft)) {
      this.crafts.push({
        x: baseX + 40,
        y: this._randY(),
        w: 44,
        h: 22,
        vx: -2.2 - Math.random(),
        vy: 0,
        hp: p.craftHp || 2,
        maxHp: p.craftHp || 2,
        shootCd: 40 + Math.floor(Math.random() * 50),
        alive: true,
        kind: p.craftKind || "drone",
        anim: 0,
      });
    }
  }

  update(ship) {
    this.timer += 1;
    const dens = this.profile.density || 1;
    if (this.timer % Math.max(8, Math.floor(18 / dens)) === 0) {
      this._spawnAhead(ship.x);
    }

    // Spieler-Schüsse
    for (const b of this.bullets) {
      b.x += b.vx;
      b.y += b.vy;
      b.life -= 1;
    }
    this.bullets = this.bullets.filter((b) => b.life > 0 && b.x < ship.x + 900);

    // Hazards
    for (const h of this.hazards) {
      if (h.kind === "whirl") {
        h.spin += 0.2;
        h.x += h.vx;
        // leichter Sog
        const dx = h.x + h.w / 2 - (ship.x + ship.w / 2);
        const dy = h.y + h.h / 2 - (ship.y + ship.h / 2);
        const dist = Math.hypot(dx, dy) || 1;
        if (dist < 120) {
          ship.x += (dx / dist) * h.pull;
          ship.y += (dy / dist) * h.pull;
          const top = this.level.corridor.top;
          const bot = this.level.corridor.bottom - ship.h;
          if (ship.y < top) ship.y = top;
          if (ship.y > bot) ship.y = bot;
        }
      } else if (h.kind === "lavaBall") {
        h.bob += 0.12;
        h.x += h.vx;
        h.y += Math.sin(h.bob) * 1.2;
      } else if (h.kind === "lightning") {
        h.x += h.vx;
        h.flash += 1;
        h.life -= 1;
      } else {
        h.x += h.vx;
        h.y += h.vy || 0;
        if (h.rot != null) h.rot += 0.08;
      }
    }
    this.hazards = this.hazards.filter((h) => {
      if (h.kind === "lightning" && h.life <= 0) return false;
      return h.x > ship.x - 200 && h.y < this.level.height + 40;
    });

    // Feindflugkörper
    for (const c of this.crafts) {
      if (!c.alive) continue;
      c.anim += 1;
      c.x += c.vx;
      // leichtes Auf/Ab
      c.y += Math.sin(c.anim * 0.08) * 0.6;
      const top = this.level.corridor.top;
      const bot = this.level.corridor.bottom - c.h;
      if (c.y < top) c.y = top;
      if (c.y > bot) c.y = bot;

      c.shootCd -= 1;
      if (c.shootCd <= 0 && c.x - ship.x < 520) {
        c.shootCd = 55 + Math.floor(Math.random() * 40);
        this.bullets.push({
          x: c.x - 8,
          y: c.y + c.h / 2 - 3,
          w: 12,
          h: 5,
          vx: -7,
          vy: (ship.y - c.y) * 0.02,
          damage: 1,
          life: 80,
          from: "enemy",
        });
      }
    }
    this.crafts = this.crafts.filter((c) => c.alive && c.x > ship.x - 150);

    // Schüsse treffen Crafts
    for (const b of this.bullets) {
      if (b.from !== "player" || b.hit) continue;
      for (const c of this.crafts) {
        if (!c.alive) continue;
        if (aabb(b, c)) {
          b.hit = true;
          b.life = 0;
          c.hp -= b.damage;
          if (c.hp <= 0) c.alive = false;
        }
      }
      for (const h of this.hazards) {
        if (h.kind === "meteor" || h.kind === "lavaBall" || h.kind === "scrap") {
          if (aabb(b, h)) {
            b.hit = true;
            b.life = 0;
            h.x = -9999;
          }
        }
      }
    }
    this.hazards = this.hazards.filter((h) => h.x > -500);

    // Kollisionen mit Schiff
    if (ship.alive && ship.invuln <= 0) {
      for (const h of this.hazards) {
        if (aabb(ship.hurtbox, h)) {
          ship.takeDamage(h.damage || 1);
          if (h.kind !== "whirl" && h.kind !== "acid") h.x = -9999;
          break;
        }
      }
    }
    if (ship.alive && ship.invuln <= 0) {
      for (const c of this.crafts) {
        if (!c.alive) continue;
        if (aabb(ship.hurtbox, c)) {
          ship.takeDamage(1);
          c.hp -= 1;
          if (c.hp <= 0) c.alive = false;
          break;
        }
      }
    }
    if (ship.alive && ship.invuln <= 0) {
      for (const b of this.bullets) {
        if (b.from !== "enemy" || b.hit) continue;
        if (aabb(ship.hurtbox, b)) {
          b.hit = true;
          b.life = 0;
          ship.takeDamage(b.damage || 1);
          break;
        }
      }
    }

    for (const p of this.pickups) {
      if (p.taken) continue;
      if (aabb(ship.hurtbox, p)) {
        p.taken = true;
        if (p.kind === "heart") ship.heal(p.value || 2);
        if (p.kind === "sword") ship.hasSword = true;
      }
    }
  }
}
