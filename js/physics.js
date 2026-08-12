export function aabb(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function overlapAmount(entity, solid) {
  const overlapX =
    Math.min(entity.x + entity.w, solid.x + solid.w) - Math.max(entity.x, solid.x);
  const overlapY =
    Math.min(entity.y + entity.h, solid.y + solid.h) - Math.max(entity.y, solid.y);
  return { overlapX, overlapY };
}

export function resolveSolid(entity, solids) {
  const hit = { ground: false, ceiling: false, wall: false };

  entity.x += entity.vx;
  for (const s of solids) {
    if (!aabb(entity, s)) continue;
    if (entity.vx > 0) {
      entity.x = s.x - entity.w;
      hit.wall = true;
    } else if (entity.vx < 0) {
      entity.x = s.x + s.w;
      hit.wall = true;
    } else {
      // steckt ohne Horizontalgeschwindigkeit in der Wand
      const { overlapX } = overlapAmount(entity, s);
      const entCx = entity.x + entity.w / 2;
      const solCx = s.x + s.w / 2;
      entity.x += entCx < solCx ? -overlapX : overlapX;
      hit.wall = true;
    }
    entity.vx = 0;
  }

  entity.y += entity.vy;
  for (const s of solids) {
    if (!aabb(entity, s)) continue;
    if (entity.vy > 0) {
      entity.y = s.y - entity.h;
      entity.vy = 0;
      hit.ground = true;
    } else if (entity.vy < 0) {
      entity.y = s.y + s.h;
      entity.vy = 0;
      hit.ceiling = true;
    } else {
      const { overlapY } = overlapAmount(entity, s);
      const entCy = entity.y + entity.h / 2;
      const solCy = s.y + s.h / 2;
      if (entCy < solCy) {
        entity.y -= overlapY;
        hit.ground = true;
      } else {
        entity.y += overlapY;
        hit.ceiling = true;
      }
      entity.vy = 0;
    }
  }

  return hit;
}

export function rectCenter(r) {
  return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
}
