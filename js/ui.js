// ui.js: dialogue box, choices, notices, and a reusable keyboard/mouse list menu.
'use strict';
G.ui = (() => {
  const root = document.getElementById('ui');
  const u = (n) => `calc(var(--s) * ${n}px)`;   // game pixels -> screen size

  function place(el, o) {
    for (const k of ['x', 'y', 'w', 'h', 'r', 'b']) {
      if (o[k] == null) continue;
      const prop = { x: 'left', y: 'top', w: 'width', h: 'height', r: 'right', b: 'bottom' }[k];
      el.style[prop] = u(o[k]);
    }
    return el;
  }
  function panel(o = {}) {
    const el = G.el('div', 'panel ' + (o.cls || ''), o.html || '');
    if (!o.inline) place(el, o);
    (o.parent || root).appendChild(el);
    return el;
  }

  // ------------------------------------------------------------ scene backgrounds
  const bgLayers = [...document.querySelectorAll('#scenebg > div')];
  let bgFront = 0, bgCur = null, bgOffTimer = null, bgWant = null;
  function setBg(src, now) {
    clearTimeout(bgOffTimer);
    bgWant = src || null;
    if (src === bgCur) return;
    if (!src) {
      // Wait a moment before clearing, so a scene that follows straight after doesn't flicker.
      const off = () => { bgCur = null; bgLayers.forEach((l) => l.classList.remove('on')); };
      if (now) off(); else bgOffTimer = setTimeout(off, 80);
      return;
    }
    bgCur = src;
    // cross-fade: load into the back layer, then swap
    bgFront = 1 - bgFront;
    bgLayers[bgFront].style.backgroundImage = `url("${src}")`;
    bgLayers[bgFront].classList.add('on');
    bgLayers[1 - bgFront].classList.remove('on');
  }

  // ------------------------------------------------------------ big portraits
  const slots = { left: null, right: null };   // { el, who }
  function showPortrait(who) {
    const src = G.portraitFor(who);
    if (!src) { dimPortraits(); return false; }
    const side = G.PORTRAIT_LEFT.includes(who) ? 'left' : 'right';
    let s = slots[side];
    if (!s) {
      const el = G.el('img', `pbig ${side}`);
      el.alt = '';
      root.insertBefore(el, root.firstChild);
      s = slots[side] = { el, who: null };
    }
    if (s.who !== who || !s.el.src.endsWith(src)) {
      s.el.src = src; s.who = who;
      s.el.classList.remove('pop'); void s.el.offsetWidth; s.el.classList.add('pop');
    }
    s.el.classList.remove('dim');
    const other = slots[side === 'left' ? 'right' : 'left'];
    if (other) other.el.classList.add('dim');
    return true;
  }
  function dimPortraits() { Object.values(slots).forEach((s) => s && s.el.classList.add('dim')); }
  function clearPortraits() {
    for (const k of ['left', 'right']) { if (slots[k]) slots[k].el.remove(); slots[k] = null; }
  }
  // Preload so portraits and backgrounds don't pop in late.
  G.PORTRAITS.forEach((n) => G.img.load(G.ART.portrait(n)));
  G.SCENE_BACKGROUNDS.forEach(([, b]) => [].concat(typeof b === 'function' ? ['bg_lantern_hill_dark', 'bg_lantern_hill_lit'] : b)
    .forEach((n) => G.img.load(G.ART.background(n))));

  // ------------------------------------------------------------ backdrops (menus, shops, title, game over)
  // mode 'cover' fills the screen like a scene; 'frame' stretches a framed panel (ui_menu_bg) to the edges.
  const backdropEl = document.getElementById('backdrop');
  const stage = document.getElementById('stage');
  function setBackdrop(src, mode = 'cover') {
    backdropEl.style.backgroundImage = src ? `url("${src}")` : '';
    backdropEl.className = src ? `on ${mode}` : '';
    stage.classList.toggle('on-parchment', !!src && mode === 'frame');
  }
  async function backdropFrom(list, mode) { const src = await G.img.first(list); setBackdrop(src, mode); return src; }
  // <img> tag for an item's icon (empty if the icon file is missing).
  G.iconHtml = (item) => `<img class="icon" src="${G.ART.icon(item)}" alt="" onerror="this.style.visibility='hidden'">`;

  // ------------------------------------------------------------ dialogue
  let dlg = null, hideTimer = null;
  function getDialog() {
    clearTimeout(hideTimer);
    if (!dlg) {
      dlg = G.el('div', 'panel', `<canvas class="portrait" width="48" height="48"></canvas><div class="body"><div class="name"></div><div class="text"></div></div><div class="more">▼</div>`);
      dlg.id = 'dialog';
      root.appendChild(dlg);
    }
    return dlg;
  }
  function hideDialogSoon() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      if (dlg) { dlg.remove(); dlg = null; }
      if (!G.sceneDepth) clearPortraits();   // inside a scene they stay until it ends
    }, 30);
  }
  function hideDialogNow() { clearTimeout(hideTimer); if (dlg) { dlg.remove(); dlg = null; } }

  function say(who, text) {
    const d = getDialog();
    const narr = !who;
    d.classList.toggle('narration', narr);
    const big = !narr && showPortrait(who);
    if (narr) dimPortraits();
    d.classList.toggle('bigp', big);
    d.classList.toggle('right-speaker', big && !G.PORTRAIT_LEFT.includes(who));   // nameplate follows the speaker
    const pc = d.querySelector('.portrait');
    pc.style.display = narr || big || !G.LOOKS[who] ? 'none' : '';
    if (!narr && !big) G.art.drawPortrait(pc, who);
    d.querySelector('.name').textContent = narr ? '' : G.speakerName(who);
    const tEl = d.querySelector('.text');
    const more = d.querySelector('.more');
    more.style.visibility = 'hidden';
    return new Promise((resolve) => {
      let i = 0, done = false;
      tEl.textContent = '';
      const timer = setInterval(() => {
        i += 1;
        tEl.textContent = text.slice(0, i);
        if (i % 3 === 0 && text[i - 1] !== ' ') G.sfx.blip();
        if (i >= text.length) finish();
      }, 22);
      function finish() { clearInterval(timer); tEl.textContent = text; done = true; more.style.visibility = 'visible'; }
      const h = G.input.push((act) => {
        if (act !== 'ok' && act !== 'cancel') return;
        if (!done) { finish(); return; }
        G.input.pop(h);
        d.onclick = null;
        hideDialogSoon();
        resolve();
      });
      d.onclick = () => h('ok');
    });
  }

  // ------------------------------------------------------------ list menu
  // items: [{label, right?, disabled?}] -> resolves to index, or -1 on cancel.
  function list(o) {
    const el = panel({ ...o, cls: (o.cls || '') + ' listpanel' });
    if (o.title) el.appendChild(G.el('h3', '', G.esc(o.title)));
    const box = G.el('div', 'list' + (o.maxH ? ' scroll' : ''));
    if (o.maxH) box.style.maxHeight = u(o.maxH);
    el.appendChild(box);
    let sel = G.clamp(o.start || 0, 0, Math.max(0, o.items.length - 1));
    const rows = o.items.map((it, i) => {
      const r = G.el('div', 'row' + (it.disabled ? ' disabled' : ''), `<span>${it.html || G.esc(it.label)}</span>${it.right != null ? `<span class="r">${it.right}</span>` : ''}`);
      r.onmouseenter = () => setSel(i, true);
      r.onclick = () => { setSel(i); choose(); };
      box.appendChild(r);
      return r;
    });
    if (!rows.length) box.appendChild(G.el('div', 'desc', o.empty || '(nothing)'));
    let resolveFn;
    function setSel(i, quiet) {
      if (!rows.length) return;
      if (i !== sel && !quiet) G.sfx.move();
      sel = i;
      rows.forEach((r, j) => r.classList.toggle('sel', j === sel));
      rows[sel].scrollIntoView({ block: 'nearest' });
      o.onMove && o.onMove(sel, o.items[sel]);
    }
    function close(v) {
      G.input.pop(h);
      if (!o.keep) el.remove();
      resolveFn(v);
    }
    function choose() {
      if (!rows.length) return;
      if (o.items[sel].disabled) { G.sfx.buzz(); return; }
      G.sfx.ok();
      close(sel);
    }
    const h = (act) => {
      const n = rows.length;
      if (act === 'up' && n) setSel((sel - 1 + n) % n);
      else if (act === 'down' && n) setSel((sel + 1) % n);
      else if (act === 'ok') choose();
      else if (act === 'cancel' && o.cancel !== false) { G.sfx.cancel(); close(-1); }
    };
    setSel(sel, true);
    return Object.assign(new Promise((r) => { resolveFn = r; G.input.push(h); }), { el });
  }

  // ------------------------------------------------------------ choice / notice
  async function choice(options) {
    getDialog();   // keep the question on screen
    const w = Math.max(...options.map((t) => t.length)) * 5.2 + 26;
    const i = await list({ items: options.map((label) => ({ label })), r: 8, b: 74, w: Math.min(220, w), cancel: false });
    hideDialogNow();
    return i;
  }

  function notice(text) {
    hideDialogNow();
    const el = panel({ cls: 'notice', html: G.esc(text).replace(/\n/g, '<br>') });
    return new Promise((resolve) => {
      let ready = false;
      setTimeout(() => (ready = true), 150);   // avoid skipping it by accident
      const h = G.input.push((act) => {
        if ((act === 'ok' || act === 'cancel') && ready) { G.input.pop(h); el.remove(); resolve(); }
      });
      el.onclick = () => h('ok');
    });
  }

  function fade(to) {
    const f = document.getElementById('fade');
    f.style.opacity = to;
    return G.sleep(360);
  }

  function clear() { hideDialogNow(); root.innerHTML = ''; }

  // Area name that fades in and out at the top of the screen.
  function banner(text) {
    if (!text) return;
    const el = G.el('div', 'banner', G.esc(text));
    root.appendChild(el);
    setTimeout(() => el.remove(), 2600);
  }

  return { root, u, place, panel, say, list, choice, notice, fade, clear, banner, setBg, clearPortraits, setBackdrop, backdropFrom, get bg() { return bgWant; } };
})();
