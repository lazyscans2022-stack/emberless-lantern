// main.js: boot, screen scaling, game loop, title flow.
'use strict';
(() => {
  const stage = document.getElementById('stage');
  const canvas = document.getElementById('world');
  const ctx = canvas.getContext('2d');

  function resize() {
    const fit = Math.min(window.innerWidth / G.VIEW_W, window.innerHeight / G.VIEW_H);
    const s = fit >= 2 ? Math.floor(fit) : Math.max(1, fit);
    stage.style.width = G.VIEW_W * s + 'px';
    stage.style.height = G.VIEW_H * s + 'px';
    document.documentElement.style.setProperty('--s', s);
    // Portraits are 240 px tall, shown 120 game px tall. Keep hard pixels when that maps to whole screen
    // pixels; otherwise smooth them slightly so the pixels don't come out uneven.
    const ratio = (s * 120 * (window.devicePixelRatio || 1)) / 240;
    document.documentElement.classList.toggle('smooth-portraits', Math.abs(ratio - Math.round(ratio)) > 0.01);
  }
  window.addEventListener('resize', resize);
  resize();

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    G.battle.update(dt);
    if (G.battle.active) G.battle.render(ctx);
    else { G.world.update(dt); G.world.render(ctx); }
    if (G.S) G.S.time += dt;
    G.input.endFrame();
    requestAnimationFrame(frame);
  }

  async function start() {
    // The village (dark) shows behind the title screen.
    G.newGame();
    G.world.load('village', 'start');
    requestAnimationFrame(frame);
    const choice = await G.titleScreen();
    if (choice === 'test') {
      await G.battleTest();
    } else if (choice === 'continue' && G.load()) {
      G.world.load(G.S.map);
      await G.ui.fade(0);
    } else {
      G.newGame();
      G.world.load('rowan_house', 'start');
      await G.img.load(G.ART.map('map_rowan_house')).done;
      await G.ui.fade(0);
      await G.runScene('Village_Intro');
    }
  }
  if (G.SCRIPT_ERRORS.length) console.warn(G.SCRIPT_ERRORS);
  start();
})();
