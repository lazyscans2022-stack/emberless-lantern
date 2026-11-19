// core.js: global namespace, input, small helpers, sound effects.
'use strict';
const G = (window.G = {});

G.TILE = 16;
G.VIEW_W = 320;
G.VIEW_H = 240;

G.sleep = (ms) => new Promise((r) => setTimeout(r, ms));
G.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
G.rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
// Deterministic hash for tile decoration, so maps look the same every time.
G.hash = (x, y, s = 0) => {
  let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
G.el = (tag, cls, html) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
};
G.esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ---------------------------------------------------------------- input
// Keys map to actions. UI code pushes handlers on a stack; the top handler
// gets key presses. With an empty stack, presses go to the world.
const KEYMAP = {
  ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down',
  ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
  KeyZ: 'ok', Enter: 'ok', Space: 'ok', KeyE: 'ok',
  KeyX: 'cancel', Escape: 'cancel', Backspace: 'cancel', KeyQ: 'cancel',
};
G.input = {
  down: {},           // held actions
  pressed: {},        // world presses this frame
  stack: [],
  push(fn) { this.stack.push(fn); return fn; },
  pop(fn) { const i = this.stack.lastIndexOf(fn); if (i >= 0) this.stack.splice(i, 1); },
  take(act) { if (this.pressed[act]) { this.pressed[act] = false; return true; } return false; },
  endFrame() { this.pressed = {}; },
};
window.addEventListener('keydown', (e) => {
  const act = KEYMAP[e.code];
  if (!act) return;
  e.preventDefault();
  G.sfx.unlock();
  G.input.down[act] = true;
  const isDir = act === 'up' || act === 'down' || act === 'left' || act === 'right';
  if (isDir && !e.repeat) G.input.lastDir = act;
  if (e.repeat && !isDir) return;
  const top = G.input.stack[G.input.stack.length - 1];
  if (top) top(act, e.repeat);
  else if (!e.repeat) G.input.pressed[act] = true;
});
window.addEventListener('keyup', (e) => {
  const act = KEYMAP[e.code];
  if (act) G.input.down[act] = false;
});
window.addEventListener('blur', () => { G.input.down = {}; });

// ---------------------------------------------------------------- sound
G.sfx = {
  ctx: null, muted: false,
  unlock() {
    if (this.ctx) return;
    try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { this.ctx = null; }
  },
  tone(freq, dur = 0.06, type = 'square', vol = 0.05, slide = 0) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.linearRampToValueAtTime(freq + slide, t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.ctx.destination);
    o.start(t); o.stop(t + dur + 0.02);
  },
  blip() { this.tone(520 + Math.random() * 60, 0.03, 'square', 0.025); },
  move() { this.tone(660, 0.04, 'square', 0.03); },
  ok() { this.tone(880, 0.06, 'square', 0.04, 220); },
  cancel() { this.tone(440, 0.07, 'square', 0.035, -160); },
  buzz() { this.tone(140, 0.12, 'sawtooth', 0.04); },
  item() { [784, 988, 1175].forEach((f, i) => setTimeout(() => this.tone(f, 0.1, 'triangle', 0.06), i * 80)); },
  heal() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this.tone(f, 0.14, 'sine', 0.07), i * 90)); },
  join() { [392, 523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this.tone(f, 0.12, 'triangle', 0.06), i * 70)); },
  coin() { this.tone(988, 0.05, 'square', 0.04); setTimeout(() => this.tone(1319, 0.12, 'square', 0.04), 60); },
  bump() { this.tone(90, 0.05, 'square', 0.03); },
  seq(notes, step, type = 'square', vol = 0.05, dur = 0.12) { notes.forEach((f, i) => setTimeout(() => this.tone(f, dur, type, vol), i * step)); },
  noise(dur = 0.12, vol = 0.08, hi = 1200) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime, n = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = this.ctx.createBufferSource(), f = this.ctx.createBiquadFilter(), g = this.ctx.createGain();
    s.buffer = buf; f.type = 'lowpass'; f.frequency.value = hi; g.gain.value = vol;
    s.connect(f).connect(g).connect(this.ctx.destination); s.start(t);
  },
  hit() { this.noise(0.1, 0.12, 1800); this.tone(160, 0.08, 'square', 0.04, -80); },
  fire() { this.noise(0.35, 0.1, 900); this.tone(300, 0.25, 'sawtooth', 0.04, 400); },
  magic() { this.tone(1200, 0.18, 'sine', 0.05, -700); this.tone(900, 0.2, 'triangle', 0.04, 500); },
  buff() { this.seq([523, 784, 1047], 60, 'triangle', 0.05); },
  ko() { this.tone(400, 0.3, 'square', 0.05, -340); this.noise(0.25, 0.06, 600); },
  down() { this.seq([392, 330, 262], 110, 'triangle', 0.06, 0.2); },
  howl() { this.tone(300, 0.6, 'sawtooth', 0.04, 300); },
  run() { this.seq([660, 550, 440, 330], 50, 'square', 0.035, 0.06); },
  encounter() { this.seq([220, 330, 440, 660, 880], 45, 'square', 0.045, 0.08); },
  victory() { this.seq([523, 659, 784, 1047, 784, 1047], 110, 'square', 0.05, 0.16); },
  levelup() { this.seq([659, 784, 988, 1319], 80, 'triangle', 0.07, 0.15); },
  defeat() { this.seq([392, 349, 311, 262], 260, 'triangle', 0.07, 0.4); },
};
