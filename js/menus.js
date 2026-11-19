// menus.js: pause menu (items, equip, status, save), shops, title and credits.
'use strict';
{
  const ui = G.ui;
  const SLOT_NAMES = { weapon: 'Weapon', armor: 'Armor', accessory: 'Accessory' };

  function portrait(key, size = 20) {
    const c = G.el('canvas'); c.width = size; c.height = size;
    G.art.drawPortrait(c, key);
    return c;
  }
  function partyCard(m) {
    const s = G.stats(m), def = G.CHARS[m.id];
    const card = G.el('div', 'card');
    card.appendChild(portrait(def.look));
    card.insertAdjacentHTML('beforeend', `
      <div><b>${def.name}</b> <span class="desc">Lv ${m.level} ${def.cls}</span></div>
      <div><div class="desc">HP ${m.hp}/${s.maxHp}</div><div class="bar"><i style="width:${(100 * m.hp) / s.maxHp}%"></i></div></div>
      <div><div class="desc">MP ${m.mp}/${s.maxMp}</div><div class="bar mp"><i style="width:${(100 * m.mp) / s.maxMp}%"></i></div></div>`);
    return card;
  }
  function partyPanel(o) {
    const p = ui.panel({ x: 92, y: 6, w: 222, ...o });
    G.S.party.forEach((m) => p.appendChild(partyCard(m)));
    return p;
  }
  function goldPanel(o) {
    return ui.panel({ x: 6, b: 6, w: 80, html: `${G.iconHtml('Gold')}<span class="goldtxt">${G.S.gold}</span> <span class="desc">gold</span>`, ...o });
  }
  const pickMember = (title, o = {}) => ui.list({
    title, x: o.x ?? 92, y: o.y ?? 6, w: o.w ?? 140, start: o.start,
    items: G.S.party.map((m) => {
      const s = G.stats(m);
      return { label: G.CHARS[m.id].name, right: o.hpmp ? `${m.hp}/${s.maxHp} · ${m.mp}/${s.maxMp}` : `Lv ${m.level}`, disabled: o.disable && o.disable(m) };
    }),
  });

  // ------------------------------------------------------------ pause menu
  G.openMenu = async () => {
    G.busy = (G.busy || 0) + 1;
    let cmd = 0;
    await ui.backdropFrom(G.ART.screens.menu, 'frame');
    try {
      for (;;) {
        const party = partyPanel();
        const gold = goldPanel();
        cmd = await ui.list({ x: 6, y: 6, w: 80, start: cmd, items: ['Items', 'Skills', 'Equip', 'Status', 'Save', 'Close'].map((label) => ({ label })) });
        party.remove(); gold.remove();
        if (cmd === -1 || cmd === 5) break;
        if (cmd === 0) await itemsMenu();
        if (cmd === 1) await skillsMenu();
        if (cmd === 2) await equipMenu();
        if (cmd === 3) await statusMenu();
        if (cmd === 4) await ui.notice(G.save() ? 'Game saved.' : "Couldn't save. Browser storage is blocked here.");
      }
    } finally { G.busy--; ui.setBackdrop(null); }
  };

  // Use an item outside battle. Returns true if it was used.
  function useItemOn(name, m) {
    const it = G.ITEMS[name], s = G.stats(m);
    if (it.revive) {
      if (m.hp > 0) return false;
      m.hp = Math.floor(s.maxHp * it.revive);
    } else {
      if (m.hp <= 0) return false;
      if (it.heal) { if (m.hp >= s.maxHp) return false; m.hp = Math.min(s.maxHp, m.hp + it.heal); }
      if (it.mp) { if (m.mp >= s.maxMp) return false; m.mp = Math.min(s.maxMp, m.mp + it.mp); }
    }
    G.removeItem(name);
    return true;
  }

  async function itemsMenu() {
    let sel = 0;
    for (;;) {
      const names = Object.keys(G.S.inv);
      const desc = ui.panel({ x: 6, b: 6, w: 308, h: 30, html: '' });
      const showDesc = (i) => { const n = names[i]; desc.innerHTML = n ? `<span class="desc">${G.esc(G.ITEMS[n]?.desc || '')}</span>` : ''; };
      const pick = ui.list({
        title: 'Items', x: 6, y: 6, w: 308, maxH: 150, start: sel, empty: 'Your bag is empty.',
        items: names.map((n) => ({ html: G.iconHtml(n) + G.esc(n), right: '×' + G.count(n), disabled: G.ITEMS[n]?.type !== 'consumable' })),
        onMove: showDesc,
      });
      showDesc(sel);
      sel = await pick;
      desc.remove();
      if (sel === -1) return;
      const name = names[sel];
      if (G.ITEMS[name].battleOnly) { await ui.notice('That can only be used in battle.'); continue; }
      const party = partyPanel({ x: 140, w: 174 });
      const who = await pickMember(`Use ${name} on…`, { x: 6, w: 130, hpmp: true });
      party.remove();
      if (who === -1) continue;
      if (useItemOn(name, G.S.party[who])) { G.sfx.heal(); await ui.notice(`Used ${name} on ${G.CHARS[G.S.party[who].id].name}.`); }
      else { G.sfx.buzz(); await ui.notice('It would have no effect.'); }
      sel = Math.min(sel, Object.keys(G.S.inv).length - 1);
    }
  }

  // Healing skills (Mend, Moonleaf) can be used outside battle.
  async function skillsMenu() {
    let mi = 0;
    for (;;) {
      const party = partyPanel({ x: 140, w: 174 });
      mi = await pickMember('Whose skills?', { x: 6, w: 130, start: mi });
      party.remove();
      if (mi === -1) return;
      const m = G.S.party[mi];
      const ids = G.knownSkills(m);
      const desc = ui.panel({ x: 6, b: 6, w: 308, h: 30 });
      const showD = (i) => { desc.innerHTML = ids[i] ? `<span class="desc">${G.SKILLS[ids[i]].desc}${G.SKILLS[ids[i]].field ? '' : ' (battle only)'}</span>` : ''; };
      const pick = ui.list({
        title: `${G.CHARS[m.id].name} · MP ${m.mp}/${G.stats(m).maxMp}`, x: 6, y: 6, w: 200, onMove: showD,
        items: ids.map((id) => ({ label: G.SKILLS[id].name, right: G.SKILLS[id].mp + ' MP', disabled: !G.SKILLS[id].field || m.mp < G.SKILLS[id].mp || m.hp <= 0 })),
      });
      showD(0);
      const si = await pick;
      desc.remove();
      if (si === -1) continue;
      const id = ids[si], sk = G.SKILLS[id];
      if (id === 'mend') {
        const party2 = partyPanel({ x: 140, w: 174 });
        const ti = await pickMember('Mend whom?', { x: 6, w: 130, hpmp: true, disable: (t) => t.hp <= 0 || t.hp >= G.stats(t).maxHp });
        party2.remove();
        if (ti === -1) continue;
        const t = G.S.party[ti];
        m.mp -= sk.mp;
        t.hp = Math.min(G.stats(t).maxHp, t.hp + 30 + G.stats(m).mend);
        G.sfx.heal();
        await ui.notice(`${G.CHARS[t.id].name} recovered HP.`);
      } else if (id === 'moonleaf') {
        m.mp -= sk.mp;
        G.S.party.forEach((t) => { if (t.hp > 0) t.hp = Math.min(G.stats(t).maxHp, t.hp + 20); });
        G.sfx.heal();
        await ui.notice('The party recovered HP.');
      }
    }
  }

  function statLine(label, a, b) {
    if (b == null || a === b) return `<span>${label}</span><span>${a}</span>`;
    return `<span>${label}</span><span>${a} → <span class="${b > a ? 'good' : 'bad'}">${b}</span></span>`;
  }

  async function equipMenu() {
    let mi = 0;
    for (;;) {
      mi = await pickMember('Equip whom?', { x: 6, w: 130, start: mi });
      if (mi === -1) return;
      const m = G.S.party[mi];
      let si = 0;
      for (;;) {
        const slots = ['weapon', 'armor', 'accessory'];
        const stats = ui.panel({ x: 6, y: 92, w: 130 });
        const showStats = (preview) => {
          const a = G.stats(m), b = preview ? G.stats(preview) : {};
          stats.innerHTML = `<h3>${G.CHARS[m.id].name}</h3><div class="statgrid">${statLine('Max HP', a.maxHp, b.maxHp)}${statLine('ATK', a.atk, b.atk)}${statLine('DEF', a.def, b.def)}${statLine('SPD', a.spd, b.spd)}</div>`;
        };
        showStats();
        si = await ui.list({
          title: 'Slot', x: 142, y: 6, w: 172, start: si,
          items: slots.map((s) => ({ label: SLOT_NAMES[s], right: m.equip[s] ? G.iconHtml(m.equip[s]) + G.esc(m.equip[s]) : '—' })),
        });
        if (si === -1) { stats.remove(); break; }
        const slot = slots[si];
        const options = Object.keys(G.S.inv).filter((n) => G.ITEMS[n].type === slot && G.canEquip(m, n));
        const items = options.map((n) => ({ html: G.iconHtml(n) + G.esc(n), right: '×' + G.count(n) }));
        if (slot === 'accessory' && m.equip.accessory) items.push({ label: '(Remove)' });
        const desc = ui.panel({ x: 6, b: 6, w: 308, h: 30 });
        const preview = (i) => {
          const n = options[i];
          desc.innerHTML = `<span class="desc">${n ? G.esc(G.ITEMS[n].desc) : i < items.length ? 'Take it off.' : ''}</span>`;
          const copy = JSON.parse(JSON.stringify(m));
          copy.equip[slot] = n || null;
          showStats(i < items.length ? copy : null);
        };
        const pick = ui.list({ title: SLOT_NAMES[slot], x: 142, y: 6, w: 172, maxH: 120, items, empty: 'Nothing to equip.', onMove: preview });
        if (items.length) preview(0);
        const c = await pick;
        desc.remove(); stats.remove();
        if (c === -1 || !items.length) continue;
        G.equip(m, slot, options[c] || null);
        G.sfx.item();
      }
    }
  }

  async function statusMenu() {
    let mi = 0;
    for (;;) {
      mi = await pickMember('Status', { x: 6, w: 100, start: mi });
      if (mi === -1) return;
      const m = G.S.party[mi], s = G.stats(m), def = G.CHARS[m.id];
      const skills = G.knownSkills(m).map((id) => `<div><b>${G.SKILLS[id].name}</b> <span class="goldtxt">${G.SKILLS[id].mp} MP</span><br><span class="desc">${G.SKILLS[id].desc}</span></div>`).join('');
      const next = m.level >= G.LEVEL_CAP ? 'MAX' : G.expToNext(m.level) - m.exp;
      const p = ui.panel({ x: 112, y: 6, w: 202, h: 228, html: `
        <h3>${def.name} · ${def.cls}</h3>
        <div class="statgrid">
          <span>Level</span><span>${m.level}</span><span>EXP to next</span><span>${next}</span>
          <span>HP</span><span>${m.hp}/${s.maxHp}</span><span>MP</span><span>${m.mp}/${s.maxMp}</span>
          <span>ATK</span><span>${s.atk}</span><span>DEF</span><span>${s.def}</span><span>SPD</span><span>${s.spd}</span>
        </div>
        <div class="desc" style="margin:.4em 0">${['weapon', 'armor', 'accessory'].map((k) => m.equip[k] || '—').join(' · ')}</div>
        <h3>Skills</h3>${skills}` });
      p.style.overflowY = 'auto';
      await new Promise((r) => { const h = G.input.push((a) => { if (a === 'ok' || a === 'cancel') { G.input.pop(h); r(); } }); });
      p.remove();
    }
  }

  // ------------------------------------------------------------ shops
  G.openShop = async (id) => {
    const shop = G.SHOPS[id];
    if (!shop) { console.warn('No shop', id); return; }
    G.busy = (G.busy || 0) + 1;
    await ui.backdropFrom(G.ART.screens.shop, 'frame');
    try {
      let cmd = 0;
      for (;;) {
        const head = ui.panel({ x: 6, y: 6, w: 308, html: `<h3>${shop.title}</h3><span class="desc">What'll it be?</span>` });
        const gold = goldPanel({ x: 234, b: undefined, y: 6 });
        cmd = await ui.list({ x: 6, y: 46, w: 90, start: cmd, items: [{ label: 'Buy' }, { label: 'Sell' }, { label: 'Leave' }] });
        head.remove(); gold.remove();
        if (cmd === -1 || cmd === 2) break;
        if (cmd === 0) await buyMenu(shop);
        if (cmd === 1) await sellMenu();
      }
    } finally { G.busy--; ui.setBackdrop(null); }
  };

  function equipCompare(name) {
    const it = G.ITEMS[name];
    if (!['weapon', 'armor', 'accessory'].includes(it.type)) return '';
    return G.S.party.map((m) => {
      if (!G.canEquip(m, name)) return '';
      const copy = JSON.parse(JSON.stringify(m)); copy.equip[it.type] = name;
      const a = G.stats(m), b = G.stats(copy);
      const key = it.type === 'weapon' ? 'atk' : 'def';
      const d = b[key] - a[key];
      return `${G.CHARS[m.id].name} ${key.toUpperCase()} ${a[key]}→<span class="${d >= 0 ? 'good' : 'bad'}">${b[key]}</span>`;
    }).filter(Boolean).join(' · ') || '<span class="bad">No one in the party can use this.</span>';
  }

  async function buyMenu(shop) {
    let sel = 0;
    for (;;) {
      const stock = shop.stock.filter((s) => !s.flag || G.flag(s.flag)).map((s) => s.item);
      const gold = goldPanel({ x: 234, y: 6, b: undefined });
      const desc = ui.panel({ x: 6, b: 6, w: 308, h: 40 });
      const show = (i) => {
        const n = stock[i]; if (!n) return;
        desc.innerHTML = `<div class="desc">${G.esc(G.ITEMS[n].desc)} <span style="float:right">Owned: ${G.count(n)}</span></div><div class="desc">${equipCompare(n)}</div>`;
      };
      const pick = ui.list({
        title: 'Buy', x: 6, y: 6, w: 222, maxH: 140, start: sel,
        items: stock.map((n) => ({ html: G.iconHtml(n) + G.esc(n), right: G.ITEMS[n].price + 'g', disabled: G.ITEMS[n].price > G.S.gold })),
        onMove: show,
      });
      show(sel);
      sel = await pick;
      gold.remove(); desc.remove();
      if (sel === -1) return;
      const n = stock[sel];
      G.S.gold -= G.ITEMS[n].price;
      G.addItem(n);
      G.sfx.coin();
    }
  }

  async function sellMenu() {
    let sel = 0;
    for (;;) {
      const names = Object.keys(G.S.inv);
      const gold = goldPanel({ x: 234, y: 6, b: undefined });
      const desc = ui.panel({ x: 6, b: 6, w: 308, h: 30 });
      const show = (i) => { const n = names[i]; if (n) desc.innerHTML = `<span class="desc">${G.esc(G.ITEMS[n].desc)}</span>`; };
      const pick = ui.list({
        title: 'Sell', x: 6, y: 6, w: 222, maxH: 150, start: sel, empty: 'Nothing to sell.',
        items: names.map((n) => ({ html: `${G.iconHtml(n)}${G.esc(n)} ×${G.count(n)}`, right: G.sellPrice(n) ? G.sellPrice(n) + 'g' : '—', disabled: !G.sellPrice(n) })),
        onMove: show,
      });
      show(sel);
      sel = await pick;
      gold.remove(); desc.remove();
      if (sel === -1) return;
      const n = names[sel];
      G.S.gold += G.sellPrice(n);
      G.removeItem(n);
      G.sfx.coin();
      sel = Math.min(sel, Object.keys(G.S.inv).length - 1);
    }
  }

  // ------------------------------------------------------------ title & credits
  G.titleScreen = async () => {
    G.busy = (G.busy || 0) + 1;
    await ui.backdropFrom(G.ART.screens.title, 'cover');
    const scr = G.el('div', 'screen titlescreen', `<div class="title"><span class="t1">The</span>Emberless Lantern</div><div class="rule"></div><div class="sub">A small tale of light and shadow</div><div class="hint">Arrows / WASD to move · Z / Enter to talk · X / Esc for menu</div>`);
    ui.root.appendChild(scr);
    const hasSave = G.hasSave();
    const items = [{ label: 'New Game' }, { label: 'Continue', disabled: !hasSave }];
    if (/[?&]test\b/.test(location.search)) items.push({ label: 'Battle Test' });   // open index.html?test
    const i = await ui.list({ parent: scr, inline: true, cancel: false, items, start: hasSave ? 1 : 0 });
    await ui.fade(1);
    scr.remove();
    ui.setBackdrop(null);
    G.busy--;
    return ['new', 'continue', 'test'][i];
  };

  // Developer tool: fight any encounter or boss with a party of any level.
  // (Handy while the forest and ruins are being built; remove before release.)
  G.battleTest = async () => {
    G.busy = (G.busy || 0) + 1;
    await ui.fade(0);
    const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 10];
    const label = (g) => g.map((id) => G.ENEMIES[id].name).join(' + ');
    const fights = [
      ...G.ENCOUNTERS.forest.groups.map((g) => ({ label: 'Forest: ' + label(g), arg: g, bg: 'forest' })),
      ...G.ENCOUNTERS.ruins.groups.map((g) => ({ label: 'Ruins: ' + label(g), arg: g, bg: 'ruins' })),
      { label: 'BOSS: Gloomcap Giant', arg: 'Gloomcap_Giant' },
      { label: 'BOSS: Morvane', arg: 'Morvane' },
    ];
    let li = 3, fi = 0;
    for (;;) {
      li = await ui.list({ title: 'Battle Test · party level', x: 6, y: 6, w: 120, start: li, items: LEVELS.map((l) => ({ label: 'Lv ' + l })) });
      if (li === -1) { location.reload(); return; }
      fi = await ui.list({ title: 'Fight what?', x: 132, y: 6, w: 182, maxH: 200, start: fi, items: fights.map((f) => ({ label: f.label })) });
      if (fi === -1) continue;
      const lv = LEVELS[li];
      G.newGame();
      G.S.party = ['rowan', 'brann', 'mira'].map((id) => G.makeMember(id, lv));
      const [r, b, m] = G.S.party;
      if (lv >= 2) r.equip.weapon = 'Iron Sword';
      if (lv >= 3) [r, b, m].forEach((p) => (p.equip.armor = 'Leather Vest'));
      if (lv >= 6) { r.equip.weapon = 'Steel Sword'; b.equip.weapon = 'War Hammer'; m.equip.weapon = 'Moonwood Staff'; r.equip.armor = b.equip.armor = 'Chain Mail'; }
      // Gear roughly matches the story: Lv 1-4 = before the Gloomcap, Lv 5+ = after it.
      if (lv >= 3) m.equip.accessory = 'Ward Ring';
      if (lv >= 5) { G.setFlag('ember_strike_learned'); G.setFlag('gloomcap_defeated'); r.equip.accessory = 'Moonleaf Charm'; }
      G.healParty();
      Object.assign(G.S.inv, lv >= 5
        ? { 'Potion': 5, 'Hi-Potion': 3, 'Ether': 3, 'Antidote': 2, 'Phoenix Feather': 1 }
        : { 'Potion': 5, 'Hi-Potion': 1, 'Ether': 2, 'Antidote': 3 });
      const f = fights[fi];
      const result = await G.battle.start(f.arg, { bg: f.bg });
      await ui.notice(`Result: ${result}`);
    }
  };

  G.endGame = async () => {
    await ui.fade(1);
    ui.clear();
    G.busy = (G.busy || 0) + 1;
    const spare = G.flag('ending_spare');
    const scr = G.el('div', 'screen credits');
    scr.innerHTML = `<div class="roll">
      <h2>The Emberless Lantern</h2>
      <p>The Sky Lantern burns again over Willowmere.</p>
      <p>${spare ? 'Morvane tends the flame beside Hesta,<br>still searching for a safe way to find Lira.' : 'Far away, a robed figure watches the light,<br>alone.'}</p>
      <h2>Starring</h2><p>Rowan, the farmhand</p><p>Brann, the blacksmith's son</p><p>Mira, NOT a witch</p>
      <h2>With</h2><p>Elder Hesta · Garrow · Pip · Tilly</p><p>Mister Buttons as himself</p>
      <h2>Thank you for playing!</h2><p class="desc">Press Z to return to the title.</p></div>`;
    ui.root.appendChild(scr);
    await ui.fade(0);
    const roll = scr.querySelector('.roll');
    const dist = roll.offsetHeight + scr.offsetHeight;
    roll.animate([{ transform: 'translateY(0)' }, { transform: `translateY(-${dist * 0.5 + roll.offsetHeight * 0.5}px)` }], { duration: 22000, fill: 'forwards', easing: 'linear' });
    await G.sleep(3000);
    await new Promise((r) => { const h = G.input.push((a) => { if (a === 'ok') { G.input.pop(h); r(); } }); });
    location.reload();
  };
}
