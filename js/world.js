// world.js: the overworld on painted map images.
// Smooth (pixel) movement, a collision mask built from each map's rectangles, foreground overlays the
// player walks behind, doors/triggers, NPCs and party followers drawn from 3x4 walking sprite sheets,
// plus lighting, particles and animated water.
'use strict';
G.world = (() => {
  const SPEED = 64;                  // px per second
  const STEP_PX = 16;                // distance that counts as one "step" for random encounters
  const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const OPP = { up: 'down', down: 'up', left: 'right', right: 'left' };
  const ROW = { down: 0, left: 1, right: 2, up: 3 };   // RPG Maker sheet order
  const WALK_COLS = [1, 0, 1, 2];                      // stand, step, stand, step

  let map = null, mask = null, npcs = [], followers = [], trail = [];
  let time = 0, bumpT = 0, stepDist = 0, insideTrig = new Set(), particles = [];
  const player = { x: 0, y: 0, dir: 'down', moving: false, anim: 0, sprite: 'rowan', forced: null };

  // ------------------------------------------------------------ sprites
  // Sheets: assets/sprites/<key>_sheet.png. Villagers without art reuse a sheet with a colour shift.
  const RECOLOR = {
    villager_a: { base: 'garrow', filter: 'hue-rotate(70deg) saturate(.8) brightness(1.08)' },
    villager_b: { base: 'hesta', filter: 'hue-rotate(150deg) saturate(1.1) brightness(1.05)' },
  };
  const sheetCache = {};
  function sheet(key) {
    if (sheetCache[key]) return sheetCache[key].ready ? sheetCache[key] : null;
    const rc = RECOLOR[key];
    const e = sheetCache[key] = { ready: false };
    const im = new Image();
    im.onload = () => {
      let src = im;
      if (rc) {
        const c = document.createElement('canvas'); c.width = im.width; c.height = im.height;
        const g = c.getContext('2d'); g.filter = rc.filter; g.drawImage(im, 0, 0); src = c;
      }
      Object.assign(e, { img: src, fw: im.width / 3, fh: im.height / 4, ready: true });
    };
    im.src = G.ART.sprite(rc ? rc.base : key);
    return null;
  }
  const spriteKey = (look) => (look || 'rowan').toLowerCase();
  ['rowan', 'brann', 'mira', 'hesta', 'garrow', 'pip', 'tilly', 'morvane', 'villager_a', 'villager_b'].forEach(sheet);

  // ------------------------------------------------------------ map loading
  function buildMask(m) {
    const w = m.w, h = m.h, k = new Uint8Array(w * h);
    const fill = (r, v) => {
      const [x, y, rw, rh] = r;
      for (let j = Math.max(0, y | 0); j < Math.min(h, (y + rh) | 0); j++)
        for (let i = Math.max(0, x | 0); i < Math.min(w, (x + rw) | 0); i++) k[j * w + i] = v;
    };
    if (m.walk) { k.fill(1); m.walk.forEach((r) => fill(r, 0)); }
    (m.blocks || []).forEach((r) => fill(r, 1));
    return k;
  }
  function load(id, entry) {
    map = G.MAPS[id]();
    G.S.map = id;
    mask = buildMask(map);
    npcs = (map.npcs || []).map((n) => ({ ...n, baseDir: n.dir, idleT: 1 + Math.random() * 3 }));
    if (entry && map.entries[entry]) Object.assign(G.S, map.entries[entry]);
    Object.assign(player, { x: G.S.x, y: G.S.y, dir: G.S.dir || 'down', moving: false, forced: null });
    insideTrig = new Set(map.triggers.filter((t) => inRect(player.x, player.y, t)).map((t) => t));
    particles = [];
    resetFollowers();
  }
  function resetFollowers() {
    trail = [];
    followers = G.S.party.slice(1).map((m) => ({ sprite: spriteKey(G.CHARS[m.id].look), x: player.x, y: player.y, dir: player.dir, moving: false }));
  }
  const inRect = (x, y, r) => x >= r.x && x < r.x + (r.w || 1) && y >= r.y && y < r.y + (r.h || 1);
  const shown = (o) => !o.show || o.show();

  // ------------------------------------------------------------ collision (feet box 10x5)
  function solidAt(x, y) {
    x |= 0; y |= 0;
    if (x < 0 || y < 0 || x >= map.w || y >= map.h) return true;
    if (mask[y * map.w + x]) return true;
    for (const d of map.dynamic || []) if (d.when() && inRect(x, y, d)) return true;
    for (const o of map.objects || []) if (o.solid && shown(o) && inRect(x, y, o)) return true;
    return false;
  }
  function blocked(x, y, self) {
    for (const [dx, dy] of [[-5, 0], [5, 0], [-5, -4], [5, -4], [0, -2]]) if (solidAt(x + dx, y + dy)) return true;
    for (const n of npcs) if (n !== self && shown(n) && Math.abs(n.x - x) < 11 && Math.abs(n.y - y) < 6) return true;
    return false;
  }

  // ------------------------------------------------------------ movement
  function heldDir() {
    const d = G.input.down;
    if (G.input.lastDir && d[G.input.lastDir]) return G.input.lastDir;
    return ['up', 'down', 'left', 'right'].find((k) => d[k]) || ['up', 'down', 'left', 'right'].find((k) => G.input.take(k));
  }
  function tryMove(dx, dy) {
    let moved = false;
    if (dx && !blocked(player.x + dx, player.y)) { player.x += dx; moved = true; }
    else if (dx) { // corner assist: slide around small corners
      for (const n of [1, -1, 2, -2, 3, -3]) if (!blocked(player.x + dx, player.y + n) && !blocked(player.x, player.y + n)) { player.y += Math.sign(n) * 0.5; moved = true; break; }
    }
    if (dy && !blocked(player.x, player.y + dy)) { player.y += dy; moved = true; }
    else if (dy) {
      for (const n of [1, -1, 2, -2, 3, -3]) if (!blocked(player.x + n, player.y + dy) && !blocked(player.x + n, player.y)) { player.x += Math.sign(n) * 0.5; moved = true; break; }
    }
    return moved;
  }
  // Walk the player a few pixels on their own (pushed back from an exit, etc.).
  function forceStep(dir, dist = 14) {
    return new Promise((resolve) => { player.forced = { dir, left: dist, resolve }; player.dir = dir; });
  }

  function recordTrail() {
    const last = trail[0];
    if (!last || Math.hypot(last.x - player.x, last.y - player.y) >= 1) trail.unshift({ x: player.x, y: player.y });
    if (trail.length > 200) trail.length = 200;
  }
  function updateFollowers(dt) {
    followers.forEach((f, i) => {
      const t = trail[Math.min(trail.length - 1, (i + 1) * 16)];
      if (!t) { f.moving = false; return; }
      const dx = t.x - f.x, dy = t.y - f.y;
      f.moving = Math.hypot(dx, dy) > 0.3;
      if (f.moving) {
        f.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
        f.x = t.x; f.y = t.y; f.anim = player.anim;
      }
    });
  }

  function act(fn) {
    G.busy = (G.busy || 0) + 1;
    return Promise.resolve().then(fn).catch((e) => console.error(e)).finally(() => { G.busy--; });
  }

  function checkTriggers() {
    for (const t of map.triggers) {
      const inside = inRect(player.x, player.y, t);
      if (inside && !insideTrig.has(t) && (!t.show || t.show())) { insideTrig.add(t); act(() => t.run(api)); return true; }
      if (!inside) insideTrig.delete(t);
    }
    return false;
  }

  function interact() {
    const [dx, dy] = DIRS[player.dir];
    const fx = player.x + dx * 13, fy = player.y - 4 + dy * 12;
    // reach: how far away you can talk to someone (Pip stands behind his counter)
    const n = npcs.find((o) => shown(o) && Math.abs(o.x - fx) < 11 && Math.abs(o.y - 4 - fy) < (o.reach || 16));
    if (n) {
      if (!n.scene && !n.onTalk) return;
      n.dir = OPP[player.dir];
      act(async () => { if (n.onTalk) await n.onTalk(); else await G.runScene(n.scene, { only: n.only }); n.idleT = 2; });
      return;
    }
    // a little slack around each object, so you don't have to line up to the exact pixel
    const o = (map.objects || []).find((ob) => ob.onTalk && shown(ob) && inRect(fx, fy, { x: ob.x - 7, y: ob.y - 6, w: ob.w + 14, h: ob.h + 12 }));
    if (o) act(o.onTalk);
  }

  function update(dt) {
    if (!map) return;
    time += dt; bumpT -= dt;
    let moved = false;
    if (player.forced) {
      const f = player.forced, d = Math.min(f.left, SPEED * dt);
      const [dx, dy] = DIRS[f.dir];
      player.x += dx * d; player.y += dy * d; f.left -= d; moved = true;
      if (f.left <= 0) { player.forced = null; f.resolve(); }
    } else if (!G.busy) {
      const d = heldDir();
      if (d) {
        player.dir = d;
        const [dx, dy] = DIRS[d];
        const s = SPEED * dt;
        moved = tryMove(dx * s, dy * s);
        if (!moved && bumpT <= 0) { G.sfx.bump(); bumpT = 0.4; }
      }
      if (!d || !moved) {
        if (G.input.take('ok')) interact();
        else if (G.input.take('cancel')) act(G.openMenu);
      }
    }
    player.moving = moved;
    if (moved) {
      player.anim += dt * 7;
      recordTrail();
      G.S.x = player.x; G.S.y = player.y; G.S.dir = player.dir;
      if (!player.forced) {
        if (!checkTriggers() && map.battles && !(map.safe && map.safe(player.x, player.y))) {
          stepDist += SPEED * dt;
          while (stepDist >= STEP_PX) {
            stepDist -= STEP_PX;
            const enc = G.battle.rollEncounter(map);
            if (enc) { act(() => G.battle.start(enc.group, { bg: enc.bg })); break; }
          }
        }
      }
    } else player.anim = 0;
    updateFollowers(dt);
    // idle NPCs look around
    for (const n of npcs) {
      if (!n.idle || G.busy) continue;
      n.idleT -= dt;
      if (n.idleT <= 0) { n.dir = ['down', 'left', 'right', 'down'][Math.floor(Math.random() * 4)]; n.idleT = 2 + Math.random() * 3; }
    }
    updateParticles(dt);
  }

  // ------------------------------------------------------------ atmosphere
  const PARTICLES = {
    dust:  { n: 26, col: () => 'rgba(255,240,210,', size: 1, vy: -3, vx: 4, life: 6, glow: false },
    wisps: { n: 22, col: () => 'rgba(190,120,255,', size: 2, vy: -6, vx: 3, life: 5, glow: true },
    ash:   { n: 40, col: () => 'rgba(210,205,205,', size: 1, vy: 9, vx: 5, life: 6, glow: false },
    motes: { n: 12, col: () => 'rgba(255,230,190,', size: 1, vy: -2, vx: 2, life: 7, glow: false },
  };
  function updateParticles(dt) {
    const kind = PARTICLES[map.particles];
    if (!kind) return;
    // rooms keep their particles inside the room; outdoor maps use the whole map
    const [ax, ay, aw, ah] = map.w <= G.VIEW_W && map.walk ? map.walk[0] : [0, 0, map.w, map.h];
    const spawn = (p) => { p.x = ax + Math.random() * aw; p.y = ay + Math.random() * ah; };
    while (particles.length < kind.n) {
      const p = { t: Math.random() * kind.life, life: kind.life * (0.6 + Math.random() * 0.8), ph: Math.random() * 6 };
      spawn(p); particles.push(p);
    }
    for (const p of particles) {
      p.t += dt;
      p.x += (Math.sin(time * 0.8 + p.ph) * kind.vx) * dt;
      p.y += kind.vy * dt;
      if (p.t > p.life) { spawn(p); p.t = 0; }
    }
  }
  function drawParticles(ctx) {
    const kind = PARTICLES[map.particles];
    if (!kind) return;
    if (kind.glow) ctx.globalCompositeOperation = 'lighter';
    for (const p of particles) {
      const a = Math.sin(Math.PI * Math.min(1, p.t / p.life)) * (kind.glow ? 0.8 : 0.55);
      ctx.fillStyle = kind.col() + a.toFixed(2) + ')';
      ctx.fillRect(Math.round(p.x), Math.round(p.y), kind.size, kind.size);
      if (kind.glow) { ctx.fillStyle = kind.col() + (a * 0.25).toFixed(2) + ')'; ctx.fillRect(Math.round(p.x) - 1, Math.round(p.y) - 1, kind.size + 2, kind.size + 2); }
    }
    ctx.globalCompositeOperation = 'source-over';
  }
  function drawWater(ctx) {
    for (const wr of map.water || []) {
      const [x, y, w, h, col] = wr;
      ctx.save();
      ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
      ctx.strokeStyle = col || 'rgba(220,240,255,0.22)';
      ctx.lineWidth = 1;
      for (let i = -h; i < w + h; i += 11) {
        const o = (time * 6 + i) % (w + h);
        const yy = y + ((i * 7) % h);
        const xx = x + o - h / 2;
        ctx.beginPath(); ctx.moveTo(Math.round(xx), Math.round(yy) + 0.5); ctx.lineTo(Math.round(xx + 4 + Math.sin(time * 2 + i) * 2), Math.round(yy) + 0.5); ctx.stroke();
      }
      ctx.restore();
    }
  }

  // ------------------------------------------------------------ rendering
  function camera() {
    const cx = map.w <= G.VIEW_W ? (map.w - G.VIEW_W) / 2 : G.clamp(player.x - G.VIEW_W / 2, 0, map.w - G.VIEW_W);
    const cy = map.h <= G.VIEW_H ? (map.h - G.VIEW_H) / 2 : G.clamp(player.y - 16 - G.VIEW_H / 2, 0, map.h - G.VIEW_H);
    return [Math.round(cx), Math.round(cy)];
  }
  function drawChar(ctx, e, sprite) {
    const s = sheet(sprite);
    if (!s) return;
    const col = e.moving ? WALK_COLS[Math.floor(e.anim || 0) % 4] : 1;
    const row = ROW[e.dir] ?? 0;
    // sheets hold extra detail; draw them back at game size (positions snap to the finer canvas grid)
    const k = 1 / (G.ART.spriteDetail || 1), w = s.fw * k, h = s.fh * k;
    const snap = (v) => Math.round(v * (G.ART.canvasDetail || 1)) / (G.ART.canvasDetail || 1);
    ctx.fillStyle = 'rgba(0,0,0,0.28)';   // soft shadow
    ctx.beginPath(); ctx.ellipse(snap(e.x), snap(e.y) - 1, w * 0.32, 2.2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.drawImage(s.img, col * s.fw, row * s.fh, s.fw, s.fh, snap(e.x - w / 2), snap(e.y - h + 1), w, h);
  }
  function mapImage() {
    const src = map.imageLit && map.imageLit.when() ? map.imageLit.src : map.image;
    return G.img.get(src);
  }

  function render(ctx) {
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, G.VIEW_W, G.VIEW_H);
    if (!map) return;
    const img = mapImage();
    const [cx, cy] = camera();
    ctx.save();
    ctx.translate(-cx, -cy);
    if (img) ctx.drawImage(img, 0, 0);
    drawWater(ctx);

    // y-sorted characters and props
    const spr = [];
    for (const o of map.objects || []) if (o.draw && shown(o)) spr.push({ z: o.y + o.h, draw: () => o.draw(ctx, time) });
    for (const n of npcs) if (shown(n)) spr.push({ z: n.y, draw: () => drawChar(ctx, n, n.sprite) });
    followers.forEach((f, i) => spr.push({ z: f.y - 0.1 * (i + 1), draw: () => drawChar(ctx, f, f.sprite) }));
    spr.push({ z: player.y, draw: () => drawChar(ctx, player, spriteKey(G.CHARS[G.S.party[0].id].look)) });
    spr.sort((a, b) => a.z - b.z).forEach((s) => s.draw());

    // foreground: roofs, tree tops and tall things the player walks behind.
    // Each entry is a rectangle [x,y,w,h] or an outline {poly: [[x,y], ...]} traced around the roof,
    // so nothing beside the building (road, grass) is ever drawn over the characters.
    if (img) for (const r of map.fg || []) {
      if (Array.isArray(r)) { ctx.drawImage(img, r[0], r[1], r[2], r[3], r[0], r[1], r[2], r[3]); continue; }
      const xs = r.poly.map((p) => p[0]), ys = r.poly.map((p) => p[1]);
      const x0 = Math.min(...xs), y0 = Math.min(...ys), w = Math.max(...xs) - x0, h = Math.max(...ys) - y0;
      ctx.save();
      ctx.beginPath(); r.poly.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.closePath(); ctx.clip();
      ctx.drawImage(img, x0, y0, w, h, x0, y0, w, h);
      ctx.restore();
    }
    drawParticles(ctx);
    ctx.restore();

    // lighting: a mood tint, then glowing lights on top
    const tint = map.tint ? map.tint() : null;
    if (tint) {
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = tint; ctx.fillRect(0, 0, G.VIEW_W, G.VIEW_H);
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.save(); ctx.translate(-cx, -cy);
    ctx.globalCompositeOperation = 'lighter';
    for (const l of map.lights || []) {
      if (l.when && !l.when()) continue;
      const r = l.r * (1 + Math.sin(time * (l.flicker || 2) + l.x) * 0.05);
      const g = ctx.createRadialGradient(l.x, l.y, 1, l.x, l.y, r);
      g.addColorStop(0, l.color); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(l.x - r, l.y - r, r * 2, r * 2);
    }
    ctx.restore();
    ctx.globalCompositeOperation = 'source-over';
    // gentle vignette
    const v = ctx.createRadialGradient(G.VIEW_W / 2, G.VIEW_H / 2, G.VIEW_H * 0.45, G.VIEW_W / 2, G.VIEW_H / 2, G.VIEW_H * 0.9);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.35)');
    ctx.fillStyle = v; ctx.fillRect(0, 0, G.VIEW_W, G.VIEW_H);
  }

  async function changeMap(id, entry) {
    G.busy = (G.busy || 0) + 1;
    try {
      G.sfx.door && G.sfx.door();
      await G.ui.fade(1);
      G.S.encSteps = null; stepDist = 0;
      load(id, entry);
      await G.img.load(map.image).done;
      await G.ui.fade(0);
      if (map.banner !== false) G.ui.banner(map.name);
      if (map.onEnter) await map.onEnter(api);
    } finally { G.busy--; }
  }

  const api = { sheet, load, resetFollowers, forceStep, changeMap, update, render, player, get map() { return map; }, get npcs() { return npcs; }, blocked, solidAt };
  return api;
})();
