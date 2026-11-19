// battle-art.js: enemy sprites and battle backgrounds, drawn in code. Enemies face right (toward the party).
'use strict';
{
  const A = G.art;
  const cache = new Map();
  const cached = (k, fn) => { if (!cache.has(k)) cache.set(k, fn()); return cache.get(k); };
  const ctxOf = (c) => { const g = c.getContext('2d'); g.imageSmoothingEnabled = false; return g; };

  function ell(g, x, y, rx, ry, col) { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill(); }
  function poly(g, pts, col) { g.fillStyle = col; g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.closePath(); g.fill(); }
  function px(g, x, y, w, h, col) { g.fillStyle = col; g.fillRect(x, y, w, h); }
  // Snap anti-aliased edges to hard pixels so shapes read as pixel art.
  function crisp(c) {
    const g = c.getContext('2d');
    const d = g.getImageData(0, 0, c.width, c.height);
    for (let i = 3; i < d.data.length; i += 4) d.data[i] = d.data[i] > 110 ? 255 : 0;
    g.putImageData(d, 0, 0);
  }
  function finish(c, shadow = true) {
    crisp(c); A.outline(c);
    if (shadow) {
      const g = c.getContext('2d');
      g.globalCompositeOperation = 'destination-over';
      g.fillStyle = 'rgba(0,0,0,0.3)';
      g.beginPath(); g.ellipse(c.width / 2, c.height - 2, c.width / 2.6, 2.2, 0, 0, Math.PI * 2); g.fill();
    }
    return c;
  }

  const painters = {
    wisp(f) {
      const c = A.mk(26, 32), g = ctxOf(c);
      const sway = f ? 1 : -1;
      poly(g, [13 + sway * 2, 1, 21, 14, 22, 21, 13, 27, 4, 21, 5, 14], '#5a2f8f');
      ell(g, 13, 20, 9, 8, '#5a2f8f');
      poly(g, [13 + sway, 6, 18, 15, 13, 24, 8, 15], '#9b5fe0');
      ell(g, 13, 20, 6, 5, '#9b5fe0');
      ell(g, 13, 21, 3, 3, '#e2c6ff');
      px(g, 9, 17, 3, 3, '#fff'); px(g, 15, 17, 3, 3, '#fff');
      px(g, 11, 18, 1, 2, '#1a1020'); px(g, 17, 18, 1, 2, '#1a1020');
      // no ground shadow: it floats
      crisp(c); A.outline(c);
      return c;
    },
    boar() {
      const c = A.mk(44, 30), g = ctxOf(c);
      px(g, 9, 21, 4, 7, '#4a2c18'); px(g, 15, 22, 4, 6, '#4a2c18'); px(g, 25, 22, 4, 6, '#4a2c18'); px(g, 30, 21, 4, 7, '#4a2c18');
      ell(g, 20, 16, 15, 9, '#7a4a2a');
      ell(g, 20, 20, 12, 4, '#8f5c36');
      for (let i = 0; i < 5; i++) poly(g, [8 + i * 5, 10 - (i % 2), 11 + i * 5, 2 + (i % 2) * 2, 14 + i * 5, 9], i % 2 ? '#3f8f3a' : '#5ab04c');
      ell(g, 34, 17, 7, 6, '#6a3e22');
      ell(g, 40, 19, 3, 3, '#d49a7a');
      px(g, 40, 18, 1, 1, '#5a2a1a'); px(g, 41, 20, 1, 1, '#5a2a1a');
      poly(g, [37, 21, 39, 25, 36, 22], '#f3eedd');
      px(g, 34, 14, 2, 2, '#1a1020'); px(g, 34, 14, 1, 1, '#ff6b4a');
      poly(g, [30, 11, 33, 7, 34, 12], '#5a341c');
      return finish(c);
    },
    wolf() {
      const c = A.mk(44, 32), g = ctxOf(c);
      poly(g, [6, 14, 1, 7, 3, 16], '#24202e');
      px(g, 9, 21, 3, 9, '#1a1722'); px(g, 14, 22, 3, 8, '#1a1722'); px(g, 24, 22, 3, 8, '#1a1722'); px(g, 29, 21, 3, 9, '#1a1722');
      ell(g, 19, 17, 13, 7, '#2b2636');
      ell(g, 19, 14, 10, 4, '#363042');
      ell(g, 33, 13, 7, 6, '#2b2636');
      poly(g, [36, 12, 43, 15, 36, 17], '#2b2636');
      poly(g, [29, 9, 31, 2, 33, 8], '#2b2636'); poly(g, [33, 8, 36, 3, 36, 10], '#24202e');
      px(g, 34, 11, 3, 2, '#c37dff'); px(g, 35, 11, 1, 1, '#f4e3ff');
      px(g, 42, 15, 1, 1, '#000');
      poly(g, [37, 17, 41, 17, 39, 19], '#e8e0f0');
      for (let i = 0; i < 4; i++) px(g, 8 + i * 6, 23 + (i % 2), 2, 1, '#7a4fb8');
      return finish(c);
    },
    bat(f) {
      const c = A.mk(36, 26), g = ctxOf(c);
      const up = f === 1;
      const wing = up ? [18, 12, 2, 2, 6, 9, 1, 12, 9, 15] : [18, 12, 2, 20, 6, 16, 1, 13, 9, 13];
      poly(g, wing, '#d4682a');
      poly(g, wing.map((v, i) => (i % 2 === 0 ? 36 - v : v)), '#d4682a');
      poly(g, up ? [4, 4, 7, 9, 3, 9] : [4, 19, 8, 16, 3, 15], '#ffd04a');
      poly(g, up ? [32, 4, 29, 9, 33, 9] : [32, 19, 28, 16, 33, 15], '#ffd04a');
      ell(g, 18, 13, 6, 6, '#8a3d1e');
      poly(g, [14, 9, 15, 4, 17, 8], '#8a3d1e'); poly(g, [19, 8, 21, 4, 22, 9], '#8a3d1e');
      px(g, 15, 12, 2, 2, '#ffe36b'); px(g, 20, 12, 2, 2, '#ffe36b');
      px(g, 17, 16, 1, 2, '#fff'); px(g, 19, 16, 1, 2, '#fff');
      crisp(c); A.outline(c);
      return c;
    },
    knight() {
      const c = A.mk(32, 46), g = ctxOf(c);
      px(g, 10, 32, 5, 12, '#5d6068'); px(g, 17, 32, 5, 12, '#5d6068');
      px(g, 9, 42, 6, 3, '#43464e'); px(g, 17, 42, 6, 3, '#43464e');
      px(g, 8, 17, 16, 16, '#7d8088'); px(g, 8, 17, 16, 2, '#a3a7b0'); px(g, 15, 19, 2, 13, '#5d6068');
      px(g, 4, 16, 6, 6, '#8d9099'); px(g, 22, 16, 6, 6, '#8d9099');
      px(g, 4, 22, 4, 10, '#6d7078'); px(g, 24, 22, 4, 10, '#6d7078');
      px(g, 27, 12, 2, 24, '#b9bec7'); px(g, 25, 30, 6, 2, '#6b4a2b');
      px(g, 9, 4, 14, 13, '#8d9099'); px(g, 9, 4, 14, 2, '#b4b8c1'); px(g, 15, 1, 2, 4, '#a8452f');
      px(g, 10, 9, 12, 3, '#1a1622'); px(g, 12, 10, 8, 1, '#ff9a3c'); px(g, 15, 10, 2, 1, '#fff1b8');
      px(g, 11, 33, 10, 1, '#1a1622');
      return finish(c);
    },
    shade(f) {
      const c = A.mk(28, 50), g = ctxOf(c);
      const w = f ? 1 : 0;
      poly(g, [6, 18, 22, 18, 25, 44, 21, 40 + w, 18, 47, 14, 41, 10, 47 - w, 7, 40, 3, 44], '#1c1828');
      ell(g, 14, 12, 7, 9, '#1c1828');
      poly(g, [6, 20, 1, 34, 3, 36, 8, 26], '#1c1828'); poly(g, [22, 20, 27, 34, 25, 36, 20, 26], '#1c1828');
      px(g, 8, 8, 1, 10, '#4b3a6e'); px(g, 21, 18, 1, 20, '#4b3a6e'); px(g, 7, 20, 1, 16, '#4b3a6e');
      crisp(c); A.outline(c);
      const g2 = c.getContext('2d');
      g2.globalCompositeOperation = 'destination-over';
      g2.fillStyle = 'rgba(120,60,200,0.25)'; g2.fillRect(0, 46, 28, 4);
      return c;
    },
    gloomcap(f) {
      const c = A.mk(72, 70), g = ctxOf(c);
      const squash = f ? 1 : 0;
      px(g, 20, 58, 10, 8, '#bfb3a6'); px(g, 42, 58, 10, 8, '#bfb3a6');
      ell(g, 36, 48, 17, 15 - squash, '#ddd3c6');
      ell(g, 36, 52, 14, 8, '#cbbfb1');
      ell(g, 36, 26 + squash, 34, 20, '#6f5a8a');
      ell(g, 36, 22 + squash, 30, 14, '#8a74a6');
      [[18, 20, 5], [34, 12, 4], [52, 18, 5], [28, 28, 3], [46, 29, 3], [60, 26, 2]].forEach(([x, y, r]) => ell(g, x, y + squash, r, r * 0.8, '#c7b6de'));
      ell(g, 36, 40 + squash, 26, 4, '#4f3f66');
      px(g, 27, 45, 6, 5, '#fff'); px(g, 40, 45, 6, 5, '#fff');
      px(g, 30, 46, 3, 3, '#2a1030'); px(g, 41, 46, 3, 3, '#2a1030');
      poly(g, [25, 42, 34, 45, 34, 43], '#3a2a44'); poly(g, [48, 42, 39, 45, 39, 43], '#3a2a44');
      px(g, 31, 54, 11, 2, '#3a2a44'); px(g, 30, 55, 2, 2, '#3a2a44'); px(g, 41, 55, 2, 2, '#3a2a44');
      return finish(c);
    },
  };

  // People-as-enemies (Morvane) use the overworld sprite, scaled up in render.
  const PERSON_SPRITES = { morvane: 'MORVANE', morvane_hollow: 'MORVANE_HOLLOW' };

  G.art.enemy = (sprite, frame = 0) => {
    if (PERSON_SPRITES[sprite]) return { img: A.person(PERSON_SPRITES[sprite], 'right', frame ? 0 : 0), scale: 3 };
    const f = frame % 2;
    return { img: cached(`e:${sprite}:${f}`, () => painters[sprite](f)), scale: 1 };
  };

  // ------------------------------------------------------------ backgrounds (320x240)
  G.art.battleBg = (kind) => cached(`bg:${kind}`, () => {
    const c = A.mk(320, 240), g = ctxOf(c);
    const grad = (y0, y1, a, b) => { const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, a); gr.addColorStop(1, b); g.fillStyle = gr; g.fillRect(0, y0, 320, y1 - y0); };
    const rnd = (i, s) => G.hash(i, s, 77);
    if (kind === 'forest' || kind === 'glade') {
      const glade = kind === 'glade';
      grad(0, 110, glade ? '#24324a' : '#141c2c', glade ? '#3c4f5a' : '#25343a');
      for (let i = 0; i < 14; i++) { // far trees
        const x = rnd(i, 1) * 340 - 10, h = 50 + rnd(i, 2) * 40;
        ell(g, x, 110 - h, 18 + rnd(i, 3) * 10, h * 0.6, '#1b2a2a');
        px(g, x - 2, 110 - h * 0.5, 4, h * 0.5, '#151f20');
      }
      grad(104, 240, glade ? '#3d6a3a' : '#2d4f2f', '#1d3320');
      for (let i = 0; i < 9; i++) ell(g, rnd(i, 4) * 320, 120 + rnd(i, 5) * 40, 18 + rnd(i, 6) * 20, 4 + rnd(i, 7) * 3, 'rgba(110,60,170,0.35)');
      for (let i = 0; i < 60; i++) px(g, rnd(i, 8) * 320, 108 + rnd(i, 9) * 60, 1, 2, glade ? '#5d9a4f' : '#447a43');
      if (glade) [[30, 112], [290, 118], [250, 106], [12, 140]].forEach(([x, y], i) => { px(g, x - 1, y - 6, 3, 6, '#ddd3c6'); ell(g, x, y - 7, 5 + i % 2, 3, '#8a74a6'); });
      for (let i = 0; i < 4; i++) { // near tree trunks at the sides
        const x = i < 2 ? i * 22 - 8 : 300 + (i - 2) * 22;
        px(g, x, 0, 14, 120, '#20160f'); px(g, x + 2, 0, 3, 120, '#33241a');
        ell(g, x + 7, 6, 26, 22, '#12201a');
      }
    } else if (kind === 'ruins') {
      grad(0, 100, '#2a2026', '#4a3a36');
      for (let i = 0; i < 6; i++) { // broken arches
        const x = 10 + i * 56;
        px(g, x, 30 + (i % 2) * 10, 12, 70, '#5a5250'); px(g, x, 30 + (i % 2) * 10, 3, 70, '#6f6764');
        px(g, x + 12, 40, 32, 6, i % 3 ? '#524a48' : 'rgba(0,0,0,0)');
      }
      const glow = g.createRadialGradient(160, 80, 5, 160, 80, 140);
      glow.addColorStop(0, 'rgba(255,140,50,0.35)'); glow.addColorStop(1, 'rgba(255,140,50,0)');
      g.fillStyle = glow; g.fillRect(0, 0, 320, 240);
      grad(98, 240, '#5d5552', '#2f2a29');
      for (let y = 104; y < 240; y += 12) for (let x = (y / 12) % 2 ? 0 : 16; x < 320; x += 32) px(g, x, y, 30, 1, 'rgba(0,0,0,0.25)');
      for (let i = 0; i < 70; i++) px(g, rnd(i, 10) * 320, 102 + rnd(i, 11) * 80, 2, 1, '#8a827c');
    } else if (kind === 'hall') {
      grad(0, 240, '#120d1c', '#251b30');
      for (let i = 0; i < 4; i++) { const x = 20 + i * 90; px(g, x, 0, 16, 120, '#2e2638'); px(g, x, 0, 4, 120, '#3c3248'); }
      grad(104, 240, '#2c2434', '#16111c');
      for (let y = 108; y < 240; y += 14) px(g, 0, y, 320, 1, 'rgba(255,255,255,0.04)');
    } else {
      grad(0, 240, '#2d3a50', '#1a2230');
    }
    return c;
  });
}
