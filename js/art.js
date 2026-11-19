// art.js: all graphics are drawn in code as small pixel-art canvases, then cached.
'use strict';
G.art = (() => {
  const cache = new Map();
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const cached = (key, fn) => { if (!cache.has(key)) cache.set(key, fn()); return cache.get(key); };
  const OUTLINE = [26, 18, 32];

  // Adds a 1px dark outline around every opaque shape on a canvas.
  function outline(c) {
    const g = c.getContext('2d');
    const d = g.getImageData(0, 0, c.width, c.height);
    const a = d.data, w = c.width, h = c.height;
    const solid = (x, y) => x >= 0 && y >= 0 && x < w && y < h && a[(y * w + x) * 4 + 3] > 200;
    const mark = [];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (a[(y * w + x) * 4 + 3] > 0) continue;
      if (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1)) mark.push((y * w + x) * 4);
    }
    for (const i of mark) { a[i] = OUTLINE[0]; a[i + 1] = OUTLINE[1]; a[i + 2] = OUTLINE[2]; a[i + 3] = 255; }
    g.putImageData(d, 0, 0);
  }
  function flipX(src) {
    const c = mk(src.width, src.height), g = c.getContext('2d');
    g.translate(src.width, 0); g.scale(-1, 1); g.drawImage(src, 0, 0);
    return c;
  }
  function shade(hex, amt) { // amt -1..1
    const n = parseInt(hex.slice(1), 16);
    let r = n >> 16, gg = (n >> 8) & 255, b = n & 255;
    const f = (v) => Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt);
    return '#' + ((1 << 24) | (f(r) << 16) | (f(gg) << 8) | f(b)).toString(16).slice(1);
  }

  // ------------------------------------------------------------- people
  // A look is a plain object from data/characters.js (G.LOOKS).
  // Sprites are 16x20; feet sit at the bottom so they overhang the tile above.
  function drawPerson(L, dir, frame) {
    const c = mk(16, 20), g = c.getContext('2d');
    const p = (x, y, w, h, col) => { if (!col) return; g.fillStyle = col; g.fillRect(x, y, w, h); };
    const side = dir === 'left';
    const back = dir === 'up';
    const dy = L.small ? 2 : 0;
    const wd = L.wide ? 1 : 0;
    const tx = 5 - wd, tw = 6 + wd * 2;
    const skin = L.skin || '#f2c49b';
    const sleeve = L.sleeve || L.shirt;
    const hands = L.glowHands ? '#ffa23a' : skin;
    const eye = L.eye || '#2a1d1a';
    const tool = () => {
      if (!L.tool) return;
      const x = side ? 4 : 12;
      if (L.tool === 'staff') { p(x, 6 + dy, 1, 12, '#8a5a2e'); p(x - 1, 5 + dy, 3, 2, L.toolTip || '#7fc96b'); }
      if (L.tool === 'stick') { p(x, 11 + dy, 1, 7, '#7a5230'); p(x, 10 + dy, 2, 1, '#7a5230'); }
      if (L.tool === 'hammer') { p(x, 11 + dy, 1, 6, '#6b4a2b'); p(x - 1, 9 + dy, 3, 3, '#8d939e'); p(x - 1, 9 + dy, 3, 1, '#b9bec7'); }
    };
    if (back) tool();

    // legs / robe
    const ly = 15 + dy;
    if (L.robe) {
      p(tx - (L.small ? 0 : 1), 11 + dy, tw + (L.small ? 0 : 2), 6 - dy, L.robe);
      p(tx - 1, 16, tw + 2, 1, shade(L.robe, -0.25));
      const step = frame === 1 ? -1 : frame === 2 ? 1 : 0;
      p(6 + step, 17, 2, 1, L.boots || '#3a2a20'); p(8 - step, 17, 2, 1, L.boots || '#3a2a20');
    } else {
      const lh = L.small ? 1 : 2;
      let lx = 6, rx = 8, lu = 0, ru = 0;
      if (side) { if (frame === 1) { lx = 5; rx = 9; } else if (frame === 2) { lx = 6; rx = 8; lu = -1; } else { lx = 6; rx = 8; } }
      else { if (frame === 1) lu = -1; if (frame === 2) ru = -1; }
      p(lx, ly + lu, 2, lh, L.pants); p(rx, ly + ru, 2, lh, L.pants);
      p(lx, 17 + lu, 2, 1, L.boots); p(rx, 17 + ru, 2, 1, L.boots);
    }

    // torso & arms
    const th = L.small ? 3 : 4;
    p(tx, 11 + dy, tw, th, L.shirt);
    if (L.dress) p(tx - 1, 13 + dy, tw + 2, 2, L.shirt);
    if (L.cloak) {
      if (back) p(tx - 1, 11 + dy, tw + 2, 6 - dy, L.cloak);
      else if (!side) { p(tx - 1, 11 + dy, 1, 6 - dy, L.cloak); p(tx + tw, 11 + dy, 1, 6 - dy, L.cloak); }
      else p(tx + tw - 2, 11 + dy, 3, 6 - dy, L.cloak);
    }
    if (L.vest && !back) { p(tx, 11 + dy, 2, th, L.vest); p(tx + tw - 2, 11 + dy, 2, th, L.vest); }
    if (L.apron && !back) p(6, 12 + dy, 4, 4 - (L.small ? 1 : 0), L.apron);
    if (side) {
      const sw = frame === 1 ? -1 : frame === 2 ? 1 : 0;
      p(7 + sw, 11 + dy, 2, th - 1, sleeve); p(7 + sw, 10 + th + dy, 2, 1, hands);
    } else {
      p(tx - 1, 11 + dy, 1, th - 1, sleeve); p(tx + tw, 11 + dy, 1, th - 1, sleeve);
      p(tx - 1, 10 + th + dy, 1, 1, hands); p(tx + tw, 10 + th + dy, 1, 1, hands);
    }
    if (L.shawl) p(tx - 1, 11 + dy, tw + 2, 2, L.shawl);
    if (L.scarf) {
      p(tx, 11 + dy, tw, 1, L.scarf);
      if (back) p(7, 12 + dy, 2, 3, L.scarf); else if (!side) p(9, 12 + dy, 1, 2, L.scarf); else p(9, 12 + dy, 2, 2, L.scarf);
    }

    // head
    p(5, 5 + dy, 6, 6, skin);
    if (!back) {
      if (side) p(5, 8 + dy, 1, 2, eye);
      else { p(6, 8 + dy, 1, 2, eye); p(9, 8 + dy, 1, 2, eye); }
      if (L.blush && !side) { p(5, 10 + dy, 1, 1, '#f0a0a0'); p(10, 10 + dy, 1, 1, '#f0a0a0'); }
    }
    if (L.glasses && !back) { if (side) p(5, 8 + dy, 2, 1, '#d9e2ef'); else { p(5, 8 + dy, 2, 1, '#d9e2ef'); p(9, 8 + dy, 2, 1, '#d9e2ef'); p(7, 8 + dy, 2, 1, '#8b8b8b'); } }
    if (L.beard && !back) { if (side) p(5, 9 + dy, 4, 3, L.beard); else { p(5, 9 + dy, 6, 3, L.beard); p(7, 10 + dy, 2, 1, shade(L.beard, -0.3)); } }

    // hair / headwear
    const H = L.hair, st = L.hairStyle || 'short';
    const topHair = () => p(4, 3 + dy, 8, 3, H);
    if (st === 'hood') {
      const hc = L.hood;
      p(4, 3 + dy, 8, 3, hc);
      if (back) p(4, 3 + dy, 8, 9, hc);
      else if (side) { p(7, 5 + dy, 5, 7, hc); p(4, 6 + dy, 1, 4, hc); }
      else { p(4, 6 + dy, 1, 6, hc); p(11, 6 + dy, 1, 6, hc); p(5, 6 + dy, 6, 1, shade(skin, -0.35)); }
    } else if (st === 'hat') {
      if (back) p(4, 5 + dy, 8, 5, H); else if (side) p(8, 6 + dy, 3, 3, H); else { p(4, 6 + dy, 1, 2, H); p(11, 6 + dy, 1, 2, H); }
      p(3, 4 + dy, 10, 1, L.hat); p(5, 2 + dy, 6, 2, L.hat); p(5, 3 + dy, 6, 1, L.hatBand || '#a0552c');
    } else if (st === 'bald') {
      p(5, 4 + dy, 6, 1, skin);
      if (!back) { p(4, 6 + dy, 1, 3, H); if (!side) p(11, 6 + dy, 1, 3, H); else p(9, 6 + dy, 2, 3, H); }
      else p(4, 6 + dy, 8, 3, H);
    } else {
      topHair();
      if (back) p(4, 3 + dy, 8, 7, H);
      else if (side) p(8, 5 + dy, 4, 4, H);
      else { p(4, 6 + dy, 1, 2, H); p(11, 6 + dy, 1, 2, H); p(5, 6 + dy, 2, 1, H); }
      if (st === 'messy') { p(5, 2 + dy, 1, 1, H); p(8, 2 + dy, 2, 1, H); p(11, 4 + dy, 1, 1, H); if (!back && !side) p(9, 6 + dy, 1, 1, H); }
      if (st === 'bun') p(7, 1 + dy, 2, 2, H);
      if (st === 'braid') {
        if (back) p(7, 10 + dy, 2, 6, H);
        else if (side) p(10, 8 + dy, 1, 4, H);
        else { p(4, 6 + dy, 1, 5, H); p(11, 6 + dy, 1, 5, H); }
      }
      if (st === 'pigtails') { if (!side) { p(2, 5 + dy, 2, 3, H); p(12, 5 + dy, 2, 3, H); } else p(11, 5 + dy, 2, 3, H); }
      if (st === 'headscarf') { p(4, 3 + dy, 8, 3, L.scarfHead); if (back) p(4, 3 + dy, 8, 5, L.scarfHead); p(10, 6 + dy, 2, 2, L.scarfHead); }
    }
    if (!back) tool();
    outline(c);
    // shadow underneath
    g.globalCompositeOperation = 'destination-over';
    g.fillStyle = 'rgba(0,0,0,0.28)';
    g.beginPath(); g.ellipse(8, 18.5, 5, 1.6, 0, 0, Math.PI * 2); g.fill();
    return c;
  }

  function person(key, dir = 'down', frame = 0) {
    return cached(`p:${key}:${dir}:${frame}`, () => {
      const L = G.LOOKS[key];
      if (!L) throw new Error('No look for ' + key);
      if (dir === 'right') return flipX(drawPerson(L, 'left', frame));
      return drawPerson(L, dir, frame);
    });
  }
  // 12x12 head-and-shoulders crop, for dialogue portraits and menu cards.
  function drawPortrait(target, key) {
    const g = target.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.clearRect(0, 0, target.width, target.height);
    if (!key || !G.LOOKS[key]) return;
    const s = person(key, 'down', 0);
    const L = G.LOOKS[key];
    const top = L.small ? 3 : 1;
    g.drawImage(s, 2, top, 12, 12, 0, 0, target.width, target.height);
  }

  // ------------------------------------------------------------- tiles
  const PAL = {
    grass: '#6aae47', grassD: '#4f8f36', grassL: '#8ccc5e',
    hill: '#84c25a', hillD: '#68a447', hillL: '#a3d978',
    path: '#cfa56c', pathD: '#b18752', pathL: '#e2bf88',
    water: '#3f86c9', waterD: '#2f6aa8', waterL: '#8fc7f0',
    cliff: '#8b6a4b', cliffD: '#6a4e36', cliffL: '#a8865f',
    stone: '#a9a196', stoneD: '#857d72', stoneL: '#c9c2b6',
    wood: '#9a6a3a', woodD: '#6e4a26', woodL: '#bf8a52',
  };
  G.PAL = PAL;

  function speckle(g, base, dark, light, seed, n = 7) {
    g.fillStyle = base; g.fillRect(0, 0, 16, 16);
    for (let i = 0; i < n; i++) {
      const x = Math.floor(G.hash(i, seed, 1) * 16), y = Math.floor(G.hash(seed, i, 2) * 16);
      g.fillStyle = G.hash(i, i, seed) > 0.5 ? dark : light;
      g.fillRect(x, y, 1, 1);
      if (G.hash(x, y, seed) > 0.6) g.fillRect(x + 1, y - 1, 1, 1);
    }
  }
  function grass(v, kind = 'grass') {
    return cached(`t:${kind}:${v}`, () => {
      const c = mk(16, 16), g = c.getContext('2d');
      speckle(g, PAL[kind], PAL[kind + 'D'], PAL[kind + 'L'], v * 13 + (kind === 'hill' ? 500 : 0), 9);
      if (v % 4 === 0) { // a little tuft
        g.fillStyle = PAL[kind + 'D'];
        const x = 3 + (v * 5) % 9, y = 5 + (v * 7) % 7;
        g.fillRect(x, y, 1, 2); g.fillRect(x + 2, y, 1, 2); g.fillRect(x + 1, y - 1, 1, 3);
      }
      return c;
    });
  }
  function flowers(v) {
    return cached(`t:flowers:${v}`, () => {
      const c = mk(16, 16), g = c.getContext('2d');
      const cols = ['#ffffff', '#ffd84a', '#ff8fb1', '#b58cff'];
      for (let i = 0; i < 3; i++) {
        const x = 2 + Math.floor(G.hash(v, i, 9) * 11), y = 2 + Math.floor(G.hash(i, v, 8) * 11);
        g.fillStyle = cols[(v + i) % cols.length];
        g.fillRect(x, y, 1, 1); g.fillRect(x - 1, y + 1, 1, 1); g.fillRect(x + 1, y + 1, 1, 1); g.fillRect(x, y + 2, 1, 1);
        g.fillStyle = '#ffe36b'; g.fillRect(x, y + 1, 1, 1);
      }
      return c;
    });
  }
  // mask bits: 1=N 2=E 4=S 8=W neighbour is *different* (draw an edge)
  function pathTile(v, mask) {
    return cached(`t:path:${v}:${mask}`, () => {
      const c = mk(16, 16), g = c.getContext('2d');
      speckle(g, PAL.path, PAL.pathD, PAL.pathL, v * 7 + 77, 6);
      g.fillStyle = PAL.grassD;
      if (mask & 1) g.fillRect(0, 0, 16, 1);
      if (mask & 2) g.fillRect(15, 0, 1, 16);
      if (mask & 4) g.fillRect(0, 15, 16, 1);
      if (mask & 8) g.fillRect(0, 0, 1, 16);
      g.fillStyle = 'rgba(120,80,40,0.25)';
      if (mask & 1) g.fillRect(0, 1, 16, 1);
      if (mask & 8) g.fillRect(1, 0, 1, 16);
      return c;
    });
  }
  function waterTile(frame, mask) {
    return cached(`t:water:${frame}:${mask}`, () => {
      const c = mk(16, 16), g = c.getContext('2d');
      g.fillStyle = PAL.water; g.fillRect(0, 0, 16, 16);
      g.fillStyle = PAL.waterD; g.fillRect(0, 12, 16, 4);
      g.fillStyle = PAL.waterL;
      const o = frame ? 4 : 0;
      g.fillRect((2 + o) % 16, 4, 4, 1); g.fillRect((10 + o) % 16, 9, 3, 1); g.fillRect((6 + o) % 16, 13, 3, 1);
      g.fillStyle = '#d9efff';
      if (mask & 1) g.fillRect(0, 0, 16, 2);
      if (mask & 2) g.fillRect(14, 0, 2, 16);
      if (mask & 4) g.fillRect(0, 14, 16, 2);
      if (mask & 8) g.fillRect(0, 0, 2, 16);
      return c;
    });
  }
  function cliffTile(v) {
    return cached(`t:cliff:${v}`, () => {
      const c = mk(16, 16), g = c.getContext('2d');
      g.fillStyle = PAL.cliff; g.fillRect(0, 0, 16, 16);
      g.fillStyle = PAL.cliffD;
      g.fillRect(0, 5, 16, 1); g.fillRect(0, 11, 16, 1);
      g.fillRect((v * 5) % 14, 1, 1, 4); g.fillRect((v * 3 + 7) % 14, 6, 1, 5); g.fillRect((v * 7 + 2) % 14, 12, 1, 4);
      g.fillStyle = PAL.cliffL; g.fillRect(0, 0, 16, 1); g.fillRect((v * 9) % 12, 7, 3, 1);
      return c;
    });
  }
  function stairsTile() {
    return cached('t:stairs', () => {
      const c = mk(16, 16), g = c.getContext('2d');
      g.fillStyle = PAL.cliffD; g.fillRect(0, 0, 16, 16);
      for (let i = 0; i < 4; i++) {
        g.fillStyle = PAL.stoneL; g.fillRect(2, i * 4, 12, 2);
        g.fillStyle = PAL.stone; g.fillRect(2, i * 4 + 2, 12, 2);
      }
      return c;
    });
  }
  function fenceTile(kind = 'fence') {
    return cached(`t:${kind}`, () => {
      const c = mk(16, 16), g = c.getContext('2d');
      const p = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
      if (kind === 'gateOpen') { p(0, 6, 3, 2, PAL.woodD); p(0, 3, 2, 11, PAL.wood); p(14, 3, 2, 11, PAL.wood); return c; }
      p(0, 5, 16, 2, PAL.wood); p(0, 10, 16, 2, PAL.wood);
      p(0, 7, 16, 1, PAL.woodD); p(0, 12, 16, 1, PAL.woodD);
      p(1, 2, 3, 13, PAL.woodL); p(12, 2, 3, 13, PAL.woodL);
      p(1, 2, 3, 1, '#d9a76a'); p(12, 2, 3, 1, '#d9a76a');
      if (kind === 'gate') { p(4, 4, 8, 10, PAL.wood); for (let x = 5; x < 12; x += 2) p(x, 4, 1, 10, PAL.woodD); p(4, 8, 8, 1, PAL.woodD); }
      outline(c);
      return c;
    });
  }
  function tree(v) {
    return cached(`o:tree:${v % 3}`, () => {
      const c = mk(20, 26), g = c.getContext('2d');
      const greens = [['#3f8a3a', '#2d6b2c', '#5aab4a'], ['#4a9640', '#336f2f', '#6cbd55'], ['#357d3b', '#245c2c', '#4f9e4c']][v % 3];
      g.fillStyle = '#6b4526'; g.fillRect(8, 16, 4, 8);
      g.fillStyle = '#54351c'; g.fillRect(8, 16, 1, 8);
      const blob = (x, y, r, col) => { g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); };
      blob(10, 11, 8, greens[1]); blob(7, 9, 6, greens[0]); blob(13, 9, 6, greens[0]); blob(10, 6, 6, greens[0]);
      blob(8, 6, 3, greens[2]); blob(12, 9, 2, greens[2]);
      outline(c);
      g.globalCompositeOperation = 'destination-over';
      g.fillStyle = 'rgba(0,0,0,0.25)'; g.beginPath(); g.ellipse(10, 24, 7, 2, 0, 0, Math.PI * 2); g.fill();
      return c;
    });
  }

  // ------------------------------------------------------------- buildings & props
  function building(b) {
    const key = `b:${b.w}:${b.h}:${b.roof}:${b.wall}:${b.door}:${b.doorColor}:${b.sign || ''}:${b.chimney ? 1 : 0}:${b.stone ? 1 : 0}`;
    return cached(key, () => {
      const W = b.w * 16, Hh = b.h * 16 + 6;   // +6 px of roof above the footprint
      const c = mk(W, Hh), g = c.getContext('2d');
      const p = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
      const wallH = b.h >= 4 ? 24 : 19;
      const wallY = Hh - wallH;
      // walls
      p(1, wallY, W - 2, wallH, b.wall);
      if (b.stone) {
        for (let y = wallY + 3; y < Hh; y += 5) for (let x = 1 + ((y / 5) % 2) * 4; x < W - 2; x += 8) p(x, y, 6, 1, shade(b.wall, -0.18));
      } else {
        for (let y = wallY + 4; y < Hh; y += 5) p(1, y, W - 2, 1, shade(b.wall, -0.15));
      }
      p(1, wallY, W - 2, 2, 'rgba(0,0,0,0.25)');
      // windows
      const doorX = b.door * 16 + 4;
      const winY = wallY + 5;
      for (let col = 0; col < b.w; col++) {
        if (col === b.door || (b.sign && col === b.signCol)) continue;
        if ((col + b.w) % 2 === 1 || b.w <= 4) {
          const x = col * 16 + 4;
          if (x + 8 > W - 2) continue;
          p(x, winY, 8, 7, '#3b2a1a'); p(x + 1, winY + 1, 6, 5, '#ffe7a3'); p(x + 1, winY + 1, 6, 2, '#fff6d6');
          p(x + 4, winY + 1, 1, 5, '#3b2a1a'); p(x + 1, winY + 3, 6, 1, '#3b2a1a');
          p(x - 1, winY + 7, 10, 1, shade(b.wall, -0.35));
        }
      }
      // door
      p(doorX - 1, Hh - 14, 10, 14, shade(b.wall, -0.4));
      p(doorX, Hh - 13, 8, 13, b.doorColor || '#6b4224');
      p(doorX + 1, Hh - 12, 2, 11, shade(b.doorColor || '#6b4224', 0.15));
      p(doorX + 6, Hh - 7, 1, 1, '#ffd36b');
      // roof
      const roofH = wallY + 2;
      p(0, 2, W, roofH - 2, b.roof);
      for (let y = 5; y < roofH - 1; y += 4) {
        p(0, y, W, 1, shade(b.roof, -0.2));
        for (let x = ((y / 4) % 2) * 4; x < W; x += 8) p(x, y - 3, 1, 3, shade(b.roof, -0.12));
      }
      p(0, 2, W, 2, shade(b.roof, 0.18));
      p(0, roofH - 2, W, 2, shade(b.roof, -0.35));
      if (b.chimney) { const cx = W - 14; p(cx, 0, 6, 8, '#7d6f66'); p(cx, 0, 6, 2, '#5b504a'); p(cx + 1, 2, 4, 1, '#91857c'); }
      // sign
      if (b.sign) {
        const sx = b.signCol * 16 + 2, sy = wallY + 3;
        p(sx + 5, sy - 2, 1, 2, '#3b2a1a');
        p(sx, sy, 12, 9, '#e8d3a2'); p(sx, sy, 12, 1, '#fff0c8'); p(sx, sy + 8, 12, 1, '#a88b58');
        if (b.sign === 'potion') { p(sx + 5, sy + 1, 2, 2, '#a7d8ff'); p(sx + 3, sy + 3, 6, 5, '#d8405a'); p(sx + 4, sy + 4, 2, 1, '#ff9cab'); }
        if (b.sign === 'anvil') { p(sx + 2, sy + 2, 8, 2, '#4a4f5a'); p(sx + 4, sy + 4, 4, 2, '#4a4f5a'); p(sx + 3, sy + 6, 6, 2, '#4a4f5a'); }
      }
      outline(c);
      return c;
    });
  }

  function prop(type, state) {
    return cached(`o:${type}:${state || ''}`, () => {
      let c, g;
      const p = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
      switch (type) {
        case 'well':
          c = mk(16, 26); g = c.getContext('2d');
          p(2, 4, 1, 14, PAL.woodD); p(13, 4, 1, 14, PAL.woodD);
          p(0, 2, 16, 3, '#a8452f'); p(1, 1, 14, 1, '#c95b3f');
          p(7, 5, 2, 1, '#555'); p(7, 6, 1, 6, '#888');
          p(1, 15, 14, 10, PAL.stone); p(1, 15, 14, 2, PAL.stoneL);
          p(3, 16, 10, 1, '#2e5f8f');
          for (let x = 2; x < 15; x += 4) p(x, 19, 3, 1, PAL.stoneD), p(x + 2, 22, 3, 1, PAL.stoneD);
          break;
        case 'anvil':
          c = mk(16, 16); g = c.getContext('2d');
          p(4, 10, 8, 6, PAL.woodD); p(4, 10, 8, 1, PAL.wood);
          p(2, 5, 12, 3, '#4b505b'); p(1, 5, 2, 2, '#4b505b'); p(5, 8, 6, 2, '#3c4049'); p(2, 5, 12, 1, '#7d8491');
          break;
        case 'barrel':
          c = mk(16, 16); g = c.getContext('2d');
          p(3, 2, 10, 13, PAL.wood); p(3, 4, 10, 1, '#555'); p(3, 11, 10, 1, '#555'); p(4, 2, 8, 2, PAL.woodL); p(5, 3, 6, 1, PAL.woodD);
          break;
        case 'crate':
          c = mk(16, 16); g = c.getContext('2d');
          p(2, 3, 12, 12, PAL.woodL); p(2, 3, 12, 1, '#e0b07a'); p(2, 8, 12, 1, PAL.woodD); p(7, 3, 1, 12, PAL.woodD);
          break;
        case 'sign':
          c = mk(16, 16); g = c.getContext('2d');
          p(7, 8, 2, 8, PAL.woodD); p(2, 2, 12, 7, PAL.woodL); p(2, 2, 12, 1, '#e0b07a'); p(4, 4, 8, 1, PAL.woodD); p(4, 6, 6, 1, PAL.woodD);
          break;
        case 'lantern': {
          c = mk(20, 44); g = c.getContext('2d');
          const lit = state === 'lit';
          p(5, 18, 10, 24, PAL.stone); p(5, 18, 2, 24, PAL.stoneL); p(13, 18, 2, 24, PAL.stoneD);
          p(3, 38, 14, 6, PAL.stoneD); p(3, 38, 14, 1, PAL.stone);
          p(3, 15, 14, 3, '#5b4a3a');
          p(4, 5, 12, 10, '#3a2e26');
          p(6, 6, 8, 8, lit ? '#ffb43b' : '#3c4660');
          if (lit) { p(8, 7, 4, 6, '#fff1a8'); p(9, 8, 2, 3, '#ffffff'); }
          else { p(7, 7, 2, 2, '#56627f'); }
          p(3, 2, 14, 3, '#5b4a3a'); p(6, 0, 8, 2, '#5b4a3a'); p(9, 0, 2, 1, '#c9a45c');
          break;
        }
        default:
          c = mk(16, 16); g = c.getContext('2d'); p(0, 0, 16, 16, '#f0f');
      }
      outline(c);
      if (type !== 'lantern') {
        g.globalCompositeOperation = 'destination-over';
        g.fillStyle = 'rgba(0,0,0,0.22)'; g.beginPath(); g.ellipse(c.width / 2, c.height - 1.5, c.width / 2 - 1, 2, 0, 0, Math.PI * 2); g.fill();
      }
      return c;
    });
  }

  return { person, drawPortrait, grass, flowers, pathTile, waterTile, cliffTile, stairsTile, fenceTile, tree, building, prop, shade, mk, outline };
})();
