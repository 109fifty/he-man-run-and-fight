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
    const baseX = shipX + 650 + Math.random() * 220;
    const dmg = (kind, fallback) => (p.dmg && p.dmg[kind]) || fallback;
    const pull = p.pull != null ? p.pull : 0.35;

    const roll = (rate) => Math.random() < (rate || 0);

    if (roll(p.meteor)) {
      this.hazards.push({
        kind: "meteor",
        x: baseX + Math.random() * 120,
        y: this.level.corridor.top - 20,
        w: 22,
        h: 22,
        vx: -2.2 - Math.random() * 1.5,
        vy: 3.5 + Math.random() * 3,
        damage: dmg("meteor", 2),
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
        vx: -3.2 - Math.random() * 1.5,
        vy: Math.sin(this.timer * 0.05) * 0.5,
        damage: dmg("lavaBall", 2),
        bob: Math.random() * 10,
      });
    }
    if (roll(p.whirl)) {
      this.hazards.push({
        kind: "whirl",
        x: baseX,
        y: this._randY(),
        w: 52,
        h: 52,
        vx: -1.8 - Math.random(),
        vy: 0,
        damage: dmg("whirl", 1),
        pull,
        spin: 0,
      });
    }
    if (roll(p.lightning)) {
      // oft 1–3 Blitze als Kette
      const n = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++) {
        this.hazards.push({
          kind: "lightning",
          x: baseX + i * 55,
          y: this._randY(),
          w: 14,
          h: 100,
          vx: -4.5 - Math.random(),
          vy: 0,
          damage: dmg("lightning", 3),
          life: 45 + Math.floor(Math.random() * 35),
          flash: 0,
        });
      }
    }
    if (roll(p.ice)) {
      // Eissturm: mehrere Splitter
      const n = 2 + Math.floor(Math.random() * 4);
      for (let i = 0; i < n; i++) {
        this.hazards.push({
          kind: "ice",
          x: baseX + i * 28,
          y: this._randY(),
          w: 18,
          h: 14,
          vx: -5.5 - Math.random() * 2,
          vy: (Math.random() - 0.5) * 2.5,
          damage: dmg("ice", 1),
        });
      }
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
        damage: dmg("acid", 2),
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
        damage: dmg("scrap", 1),
        rot: Math.random() * 6,
      });
    }
    if (roll(p.enemyCraft)) {
      const hp = p.craftHp || 2;
      this.crafts.push({
        x: baseX + 40,
        y: this._randY(),
        w: 44,
        h: 22,
        vx: -2.8 - Math.random() * 1.4,
        vy: 0,
        hp,
        maxHp: hp,
        shootCd: (p.craftShootMin || 40) + Math.floor(Math.random() * ((p.craftShootMax || 90) - (p.craftShootMin || 40))),
        shootMin: p.craftShootMin || 40,
        shootMax: p.craftShootMax || 90,
        bulletDmg: p.craftBulletDmg || 1,
        alive: true,
        kind: p.craftKind || "drone",
        anim: 0,
        aggro: true,
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
        if (ship.alive && dist < 120) {
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
      if (c.shootCd <= 0 && c.x - ship.x < 560) {
        const smin = c.shootMin || 40;
        const smax = c.shootMax || 90;
        c.shootCd = smin + Math.floor(Math.random() * Math.max(1, smax - smin));
        const dmg = c.bulletDmg || 1;
        // Gegenwehr: oft Doppel-/Streuschuss
        const pattern = c.aggro ? Math.floor(Math.random() * 3) : 0;
        const mk = (vy = 0) =>
          this.bullets.push({
            x: c.x - 8,
            y: c.y + c.h / 2 - 3,
            w: 12,
            h: 5,
            vx: -7.5 - Math.random(),
            vy: vy + (ship.y - c.y) * 0.025,
            damage: dmg,
            life: 85,
            from: "enemy",
          });
        if (pattern === 0) mk(0);
        else if (pattern === 1) {
          mk(-1.2);
          mk(1.2);
        } else {
          mk(-2);
          mk(0);
          mk(2);
        }
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
