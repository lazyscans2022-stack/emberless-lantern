// art-areas.js: tiles and props for Whisperwood Forest and the Ashen Ruins.
'use strict';
{
  const A = G.art;
  const cache = new Map();
  const cached = (k, fn) => { if (!cache.has(k)) cache.set(k, fn()); return cache.get(k); };
  const mk16 = () => { const c = A.mk(16, 16); return [c, c.getContext('2d')]; };
  const P = (g) => (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  Object.assign(G.PAL, { fgrass: '#3f7a3a', fgrassD: '#2f5f2c', fgrassL: '#559a4a' });

  const shadowSpot = (v) => cached('t:shadow:' + (v % 3), () => {
    const [c, g] = mk16();
    g.fillStyle = 'rgba(96,48,150,0.45)';
    g.beginPath(); g.ellipse(8 + (v % 3) - 1, 9, 7, 4 + (v % 2), 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(140,80,200,0.35)'; g.fillRect(5 + v % 4, 8, 3, 1);
    return c;
  });
  const bridge = () => cached('t:bridge', () => {
    const [c, g] = mk16(); const p = P(g);
    p(2, 0, 12, 16, '#7a5230'); p(2, 0, 2, 16, '#946538'); p(12, 0, 2, 16, '#5a3a1e');
    p(6, 3, 1, 4, '#5a3a1e'); p(9, 9, 1, 5, '#5a3a1e'); p(4, 12, 3, 1, '#a87a4a');
    return c;
  });
  const mushrooms = (v) => cached('t:mush:' + (v % 2), () => {
    const c = A.mk(16, 16), g = c.getContext('2d'); const p = P(g);
    const one = (x, y, s) => { p(x + 1, y + s, 2, 3, '#ddd3c6'); p(x - s + 1, y, 4 + s * 2 - 2, s + 1, '#8a74a6'); p(x, y, 2, 1, '#c7b6de'); };
    if (v % 2) { one(4, 6, 2); one(10, 9, 1); } else { one(9, 5, 2); one(3, 10, 1); }
    A.outline(c);
    return c;
  });
  const herbs = (v) => cached('t:herbs:' + (v % 2), () => {
    const [c, g] = mk16(); const p = P(g);
    p(1, 1, 14, 14, '#5a3e26'); p(1, 1, 14, 1, '#6e4e30');
    for (let i = 0; i < 4; i++) { const x = 3 + (i % 2) * 6, y = 3 + Math.floor(i / 2) * 6; p(x, y + 2, 3, 2, '#3f8f3a'); p(x + 1, y, 1, 4, '#5ab04c'); if ((i + v) % 3 === 0) p(x + 1, y, 1, 1, '#ffe36b'); }
    return c;
  });

  // ruins
  const floor = (v, ash) => cached(`t:floor:${v % 4}:${ash ? 1 : 0}`, () => {
    const [c, g] = mk16(); const p = P(g);
    p(0, 0, 16, 16, ash ? '#615956' : '#7a726d');
    p(0, 7, 16, 1, ash ? '#4f4846' : '#645d59'); p(v % 2 ? 6 : 10, 0, 1, 7, '#645d59'); p(v % 2 ? 11 : 3, 8, 1, 8, '#645d59');
    p(1, 0, 15, 1, '#8a827c');
    if (ash) for (let i = 0; i < 6; i++) p(Math.floor(G.hash(i, v, 4) * 15), Math.floor(G.hash(v, i, 5) * 15), 1, 1, '#9a928c');
    if (v % 4 === 0) { p(3, 11, 2, 1, '#544d4a'); p(4, 12, 2, 1, '#544d4a'); }
    return c;
  });
  const wallTop = (v) => cached('t:wtop:' + (v % 3), () => {
    const [c, g] = mk16(); const p = P(g);
    p(0, 0, 16, 16, '#3a3432');
    for (let y = 0; y < 16; y += 4) for (let x = ((y / 4) % 2) * 4; x < 16; x += 8) p(x, y, 7, 3, '#46403d');
    if (v % 3 === 0) p(5, 6, 4, 3, '#2c2726');
    return c;
  });
  const wallFace = (v) => cached('t:wface:' + (v % 3), () => {
    const [c, g] = mk16(); const p = P(g);
    p(0, 0, 16, 16, '#5a524e');
    for (let y = 2; y < 16; y += 5) { p(0, y, 16, 1, '#433c39'); for (let x = ((y / 5) % 2) * 5 + (v % 3); x < 16; x += 10) p(x, y, 1, 5, '#433c39'); }
    p(0, 0, 16, 2, '#6f6764'); p(0, 15, 16, 1, '#2c2726');
    if (v % 3 === 1) p(9, 7, 4, 3, '#4a6a3a');
    return c;
  });
  const rubble = (v) => cached('t:rubble:' + (v % 2), () => {
    const c = A.mk(16, 16), g = c.getContext('2d'); const p = P(g);
    p(2, 8, 6, 6, '#8a827c'); p(7, 5, 7, 8, '#9a928c'); p(4, 11, 9, 4, '#7a726d'); p(8, 5, 5, 2, '#b3aba4'); if (v % 2) p(2, 4, 4, 4, '#8a827c');
    A.outline(c);
    return c;
  });
  const door = (open) => cached('t:door:' + (open ? 1 : 0), () => {
    const [c, g] = mk16(); const p = P(g);
    if (open) { p(0, 0, 16, 16, '#1a1420'); p(0, 0, 16, 2, '#5a3a6a'); return c; }
    p(0, 0, 16, 16, '#6a625e'); p(0, 0, 16, 2, '#8a827c'); p(2, 3, 12, 13, '#55504c');
    p(7, 3, 2, 13, '#ff9a3c'); p(7, 6, 2, 3, '#fff1b8');
    return c;
  });

  // Extends the overworld tile painter (world.js calls this for codes it doesn't know).
  G.art.areaTile = (ctx, t, x, y, v, map, time) => {
    const X = x * 16, Y = y * 16;
    const below = y + 1 < map.h ? map.tiles[y + 1][x] : 'W';
    switch (t) {
      case 'x': ctx.drawImage(A.grass(v, 'fgrass'), X, Y); ctx.drawImage(shadowSpot(v), X, Y); return true;
      case 'b': ctx.drawImage(A.waterTile(Math.floor(time * 1.6) % 2, 0), X, Y); ctx.drawImage(bridge(), X, Y); return true;
      case 'm': ctx.drawImage(A.grass(v, 'fgrass'), X, Y); ctx.drawImage(mushrooms(v), X, Y); return true;
      case 'H': ctx.drawImage(A.grass(v, 'fgrass'), X, Y); ctx.drawImage(herbs(v), X, Y); return true;
      case 'r': ctx.drawImage(floor(v, false), X, Y); return true;
      case 'a': ctx.drawImage(floor(v, true), X, Y); return true;
      case 'u': ctx.drawImage(floor(v, true), X, Y); ctx.drawImage(rubble(v), X, Y); return true;
      case 'W': ctx.drawImage(below === 'W' || below === 'D' ? wallTop(v) : wallFace(v), X, Y); return true;
      case 'D': ctx.drawImage(door(G.flag('hall_open')), X, Y); return true;
    }
    return false;
  };

  // A wooden plank door drawn in pixel art, for buildings whose painted art has no clear door.
  A.door = (w, h) => cached(`door:${w}x${h}`, () => {
    const c = A.mk(w, h), g = c.getContext('2d'), p = P(g);
    p(0, 0, w, h, '#2b1a0d');                       // frame
    p(1, 2, w - 2, h - 3, '#5f3d22');               // planks
    for (let x = 1; x < w - 1; x += 4) { p(x, 2, 1, h - 3, '#74502d'); p(x + 3, 2, 1, h - 3, '#462b16'); }
    p(0, 0, w, 2, '#5a3a20'); p(0, 0, w, 1, '#3a2412');   // lintel
    for (const fy of [Math.round(h * 0.26), Math.round(h * 0.7)]) {   // iron bands with rivets
      p(1, fy, w - 2, 2, '#3b3b44'); p(1, fy, w - 2, 1, '#5a5a66');
      for (let x = 3; x < w - 2; x += 5) p(x, fy, 1, 1, '#a0a0aa');
    }
    p(w - 5, Math.round(h * 0.5), 2, 3, '#e0b860'); p(w - 5, Math.round(h * 0.5), 1, 1, '#fff0b0');   // handle
    p(0, h - 1, w, 1, '#1a0f07');
    return c;
  });

  // Timber-framed cottage wall section with a framed door, matching the village cottages.
  // Used to tidy the right end of Rowan's cottage, where the painted map cuts the house off.
  A.cottageDoorWall = (w, h) => cached(`cdw:${w}x${h}`, () => {
    const c = A.mk(w, h), g = c.getContext('2d'), p = P(g);
    const beam = '#3e2818', beamHi = '#5a3a24', plaster = '#ddd5c3', plasterSh = '#c4bba8';
    const foot = 5;                                   // stone foundation height
    p(0, 0, w, h - foot, plaster); p(2, 3, 1, h - foot - 3, plasterSh);
    // frame: top beam, corner posts
    p(0, 0, w, 3, beam); p(0, 1, w, 1, beamHi);
    p(0, 0, 2, h - foot, beam); p(w - 2, 0, 2, h - foot, beam);
    // cross brace above the door
    const doorW = w - 10, doorH = Math.round((h - foot) * 0.55), dx = 5, dy = h - foot - doorH;
    const braceH = dy - 6;
    for (let i = 0; i < braceH; i++) {
      const t = i / braceH;
      p(2 + Math.round(t * (w - 6)), 3 + i, 2, 1, beam);
      p(w - 4 - Math.round(t * (w - 6)), 3 + i, 2, 1, beam);
    }
    // lintel and the door itself
    p(dx - 2, dy - 3, doorW + 4, 3, beam); p(dx - 2, dy - 3, doorW + 4, 1, beamHi);
    g.drawImage(A.door(doorW, doorH), dx, dy);
    // stone foundation with a doorstep
    p(0, h - foot, w, foot, '#6f6a64');
    for (let x = 0; x < w; x += 6) p(x, h - foot + 2, 1, 2, '#57524d');
    p(0, h - foot, w, 1, '#8a847c');
    p(dx - 1, h - foot, doorW + 2, 2, '#9a948b');
    return c;
  });

  // Plain plaster panel in the same timber frame (fills the gap next to the doorway).
  A.cottagePanel = (w, h) => cached(`cpn:${w}x${h}`, () => {
    const c = A.mk(w, h), g = c.getContext('2d'), p = P(g);
    const beam = '#3e2818', foot = 5;
    p(0, 0, w, h - foot, '#ddd5c3'); p(0, 3, 1, h - foot - 3, '#c4bba8');
    p(0, 0, w, 3, beam); p(0, 1, w, 1, '#5a3a24');
    p(0, Math.round((h - foot) * 0.5), w, 2, beam);          // mid rail
    p(0, h - foot, w, foot, '#6f6a64'); p(0, h - foot, w, 1, '#8a847c');
    for (let x = 3; x < w; x += 6) p(x, h - foot + 2, 1, 2, '#57524d');
    return c;
  });

  // A rough wooden barrier with a warning board (Hesta's guard fence on the Lantern Hill path).
  A.barrier = (w, h) => cached(`bar:${w}x${h}`, () => {
    const c = A.mk(w, h), g = c.getContext('2d'), p = P(g);
    for (let x = 1; x < w - 2; x += 12) { p(x, 2, 3, h - 2, '#5a3a20'); p(x, 2, 1, h - 2, '#7a5230'); p(x, 1, 3, 1, '#8a6238'); }   // posts
    for (const ry of [5, h - 6]) { p(0, ry, w, 2, '#6b4526'); p(0, ry, w, 1, '#8a6238'); }                                          // rails
    const bx = Math.round(w / 2) - 7;                                                                                                // board
    p(bx, 0, 14, 8, '#c9a46a'); p(bx, 0, 14, 1, '#e3c48c'); p(bx, 7, 14, 1, '#8a6a3a');
    p(bx + 3, 3, 8, 1, '#7a2e12'); p(bx + 4, 5, 6, 1, '#7a2e12');
    A.outline(c);
    return c;
  });

  // props
  const baseProp = A.prop;
  A.prop = (type, state) => {
    const make = {
      stump: () => {
        const c = A.mk(16, 16), g = c.getContext('2d'), p = P(g);
        p(2, 6, 12, 9, '#6b4526'); p(2, 6, 12, 2, '#9a6a3a'); p(5, 7, 6, 1, '#c99a62'); p(6, 10, 4, 4, '#1e140c'); p(0, 13, 4, 2, '#6b4526'); p(12, 13, 4, 2, '#6b4526');
        p(3, 4, 2, 2, '#3f8f3a');
        return c;
      },
      chest: () => {
        const c = A.mk(16, 16), g = c.getContext('2d'), p = P(g);
        if (state === 'open') { p(2, 4, 12, 3, '#5a3a1e'); p(2, 7, 12, 8, '#8a5a2e'); p(3, 7, 10, 2, '#2a1a0e'); p(2, 10, 12, 1, '#c9a45c'); }
        else { p(2, 4, 12, 11, '#8a5a2e'); p(2, 4, 12, 4, '#a8703a'); p(2, 8, 12, 1, '#c9a45c'); p(7, 8, 2, 3, '#ffd36b'); p(2, 4, 1, 11, '#c9a45c'); p(13, 4, 1, 11, '#c9a45c'); }
        return c;
      },
      lever: () => {
        const c = A.mk(16, 16), g = c.getContext('2d'), p = P(g);
        p(3, 10, 10, 5, '#5a524e'); p(3, 10, 10, 1, '#7a726d');
        if (state === 'down') { p(9, 6, 2, 5, '#8d939e'); p(10, 4, 3, 3, '#a8452f'); }
        else { p(5, 4, 2, 7, '#8d939e'); p(3, 2, 3, 3, '#a8452f'); }
        return c;
      },
      stone: () => {
        const c = A.mk(16, 20), g = c.getContext('2d'), p = P(g);
        p(4, 4, 8, 15, '#8a8a96'); p(5, 2, 6, 3, '#9a9aa6'); p(4, 4, 2, 15, '#a6a6b2');
        p(7, 7, 2, 7, '#ffe9a0'); p(6, 9, 4, 2, '#ffe9a0'); p(7, 9, 2, 2, '#ffffff');
        return c;
      },
      pillar: () => {
        const c = A.mk(16, 28), g = c.getContext('2d'), p = P(g);
        p(3, 22, 10, 6, '#6a625e'); p(4, 6, 8, 16, '#8a827c'); p(4, 6, 2, 16, '#a39b94'); p(10, 6, 2, 16, '#6f6764');
        p(4, 4, 3, 2, '#8a827c'); p(8, 2, 4, 4, '#8a827c'); p(6, 12, 1, 5, '#5a524e');
        return c;
      },
    }[type];
    if (!make) return baseProp(type, state);
    return cached(`o:${type}:${state || ''}`, () => {
      const c = make(); A.outline(c);
      const g = c.getContext('2d');
      g.globalCompositeOperation = 'destination-over';
      g.fillStyle = 'rgba(0,0,0,0.25)'; g.beginPath(); g.ellipse(8, c.height - 1.5, 6, 2, 0, 0, Math.PI * 2); g.fill();
      return c;
    });
  };
}
