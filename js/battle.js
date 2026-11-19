// battle.js: turn-based combat (rpg_design.md §1, §3, §5).
// Each round: choose commands for every party member, then everyone acts in SPD order.
'use strict';
G.battle = (() => {
  const ui = G.ui;
  const SLOTS = [[52, 116], [106, 146], [160, 118]];   // enemy feet positions
  const BOSS_SLOT = [104, 154];
  const PSLOTS = [[244, 98], [264, 124], [284, 150]];  // party feet positions
  const TIMED = ['atkUp', 'defUp', 'taunt', 'spdDown', 'atkDown', 'ward', 'guard', 'poison', 'burn'];
  const TAGS = { poison: 'PSN', burn: 'BRN', stun: 'STUN', atkUp: 'ATK↑', defUp: 'DEF↑', taunt: 'TAUNT', spdDown: 'SPD↓', atkDown: 'ATK↓', ward: 'DEF↑', guard: 'GUARD' };
  const FLOATERS = new Set(['wisp', 'bat', 'shade']);
  let B = null;
  let time = 0;

  // ------------------------------------------------------------ combatants
  function makeEnemy(id, slot, boss) {
    const d = G.ENEMIES[id];
    const [x, y] = boss ? BOSS_SLOT : SLOTS[slot];
    return {
      side: 'enemy', id, data: d, name: d.name, sprite: d.sprite, hp: d.hp, maxHp: d.hp,
      atk: d.atk, def: d.def, spd: d.spd, hollow: !!d.hollow, boss: !!d.boss,
      st: {}, slot, x, y, turns: 0, regrows: 0, drained: false, phase: 1, rest: 0,
      dead: false, fade: 1, flash: 0, lunge: 0,
    };
  }
  function makeMember(m, i) {
    const c = { side: 'party', m, name: G.CHARS[m.id].name, look: G.CHARS[m.id].look, st: {}, x: PSLOTS[i][0], y: PSLOTS[i][1], flash: 0, lunge: 0, defending: false };
    Object.defineProperties(c, {
      hp: { get: () => m.hp, set: (v) => { m.hp = v; } },
      mp: { get: () => m.mp, set: (v) => { m.mp = v; } },
      maxHp: { get: () => G.stats(m).maxHp },
      maxMp: { get: () => G.stats(m).maxMp },
    });
    return c;
  }
  const alive = (c) => c.hp > 0 && !c.dead;
  const living = (side) => (side === 'party' ? B.party : B.enemies).filter(alive);
  function nameEnemies() {
    const byName = {};
    B.enemies.forEach((e) => { (byName[e.data.name] = byName[e.data.name] || []).push(e); });
    Object.values(byName).forEach((list) => {
      if (list.length > 1) list.forEach((e, i) => { e.name = `${e.data.name} ${'ABC'[i] || i + 1}`; });
    });
  }

  // Effective stats including buffs and debuffs.
  function eff(c) {
    const b = c.side === 'party' ? G.stats(c.m) : { atk: c.atk, def: c.def, spd: c.spd };
    const s = c.st;
    return {
      atk: b.atk * (s.atkUp ? 1.2 : 1) * (s.atkDown ? 0.7 : 1),
      def: b.def * (s.defUp ? 1.5 : 1) * (s.ward ? 1.5 : 1) * (s.guard ? 2 : 1),
      spd: b.spd * (s.spdDown ? 0.5 : 1),
    };
  }
  // Physical damage: ATK × multiplier − DEF/2, ±10%.
  function physical(a, t, mult) {
    let d = eff(a).atk * mult - eff(t).def / 2;
    d *= 0.9 + Math.random() * 0.2;
    return Math.max(1, Math.round(d));
  }
  const guarded = (t, dmg) => Math.max(1, Math.round(t.defending ? dmg * 0.5 : dmg));

  // ------------------------------------------------------------ visuals
  const PARTY_SCALE = 1.5;   // walking-sheet sprites are ~30 px; shown a bit larger in battle
  function spriteOf(c) {
    if (c.side === 'party') {
      const s = G.world.sheet(c.look.toLowerCase());
      // left-facing frame from the 3x4 sheet (row 1); a stepping frame while lunging
      if (s) return { img: s.img, sx: (c.lunge > 0 ? 0 : 1) * s.fw, sy: s.fh, sw: s.fw, sh: s.fh, scale: PARTY_SCALE / (G.ART.spriteDetail || 1), width: s.fw, height: s.fh };
      return { img: G.art.person(c.look, 'left', c.lunge > 0 ? 1 : 0), scale: 2 };
    }
    const art = G.ART.enemies[c.sprite] && G.img.get(G.ART.enemies[c.sprite]);
    if (art) return { img: art, scale: 1 };
    const frame = Math.floor(time * 3 + c.slot) % 2;
    return G.art.enemy(c.sprite, frame);   // code-drawn fallback
  }
  const heightOf = (c) => { const s = spriteOf(c); return (s.height || s.img.height) * s.scale; };
  // draw a sprite (whole image, or a frame from a sheet when sx/sy are given)
  const blit = (ctx, s, x, y, w, h) => (s.sw ? ctx.drawImage(s.img, s.sx, s.sy, s.sw, s.sh, x, y, w, h) : ctx.drawImage(s.img, x, y, w, h));
  const centerOf = (c) => [c.x, c.y - heightOf(c) / 2];

  function popup(c, text, color) {
    const [x] = centerOf(c);
    const el = G.el('div', 'dmg', G.esc(String(text)));
    el.style.color = color || '#fff';
    ui.place(el, { x: x - 20, y: c.y - heightOf(c) - 2, w: 40 });
    ui.root.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }
  function burst(c, col, n = 14, up = false) {
    const [x, y] = centerOf(c);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, sp = 20 + Math.random() * 50;
      B.parts.push({ x: x + (Math.random() - 0.5) * 10, y: y + (Math.random() - 0.5) * 14, vx: up ? (Math.random() - 0.5) * 12 : Math.cos(a) * sp, vy: up ? -20 - Math.random() * 30 : Math.sin(a) * sp, life: 0, max: 0.5 + Math.random() * 0.4, col, size: 1 + Math.floor(Math.random() * 2) });
    }
  }
  function slash(c) { B.slashes.push({ c, t: 0 }); }

  // ------------------------------------------------------------ DOM panels
  function buildUI() {
    B.msgEl = ui.panel({ x: 6, y: 4, w: 308, cls: 'bmsg', html: '&nbsp;' });
    B.partyEl = ui.panel({ x: 104, y: 166, w: 210, h: 70, cls: 'bparty' });
    refreshParty();
  }
  function refreshParty() {
    if (!B || !B.partyEl) return;
    B.partyEl.innerHTML = B.party.map((c) => {
      const tags = Object.keys(c.st).filter((k) => TAGS[k]).map((k) => `<i class="tag ${k}">${TAGS[k]}</i>`).join('') + (c.defending ? '<i class="tag guard">DEF</i>' : '');
      return `<div class="brow ${B.activeC === c ? 'act' : ''} ${alive(c) ? '' : 'ko'}">
        <span class="nm">${c.name}</span>
        <span class="hp"><b>${c.hp}</b>/${c.maxHp}<span class="bar"><i style="width:${(100 * c.hp) / c.maxHp}%"></i></span></span>
        <span class="mp"><b>${c.mp}</b>/${c.maxMp}<span class="bar mp"><i style="width:${(100 * c.mp) / Math.max(1, c.maxMp)}%"></i></span></span>
        <span class="tags">${tags}</span></div>`;
    }).join('');
  }
  function setMsg(t) { if (B && B.msgEl) B.msgEl.innerHTML = G.esc(t) || '&nbsp;'; }
  // Show a message for a moment (action text).
  async function show(t, ms = 650) { setMsg(t); await G.sleep(ms); }
  // Show a message and wait for the player to press a key.
  function say(t) {
    setMsg(t);
    B.msgEl.insertAdjacentHTML('beforeend', '<span class="more">▼</span>');
    return new Promise((r) => {
      let ready = false; setTimeout(() => (ready = true), 200);
      const h = G.input.push((a) => { if ((a === 'ok' || a === 'cancel') && ready) { G.input.pop(h); r(); } });
      B.msgEl.onclick = () => h('ok');
    });
  }

  // ------------------------------------------------------------ hits
  async function hurt(t, dmg, col = '#fff') {
    t.hp = Math.max(0, t.hp - dmg);
    t.flash = 0.3;
    popup(t, dmg, col);
    G.sfx.hit();
    if (dmg >= t.maxHp * 0.2) B.shake = 0.25;
    refreshParty();
    if (t.side === 'enemy' && t.data.phase2 && t.phase === 1 && t.hp > 0 && t.hp < t.data.phase2.below) B.pendingPhase = t;
    if (t.hp <= 0) await ko(t);
  }
  function heal(t, n, mp = false) {
    if (mp) { const before = t.mp; t.mp = Math.min(t.maxMp, t.mp + n); popup(t, '+' + (t.mp - before) + ' MP', '#8fd0ff'); }
    else { const before = t.hp; t.hp = Math.min(t.maxHp, t.hp + n); popup(t, '+' + (t.hp - before), '#8be08b'); }
    burst(t, mp ? '#8fd0ff' : '#9df59a', 12, true);
    refreshParty();
  }
  async function ko(t) {
    t.st = {};
    if (t.side === 'enemy') {
      t.dead = true;
      G.sfx.ko();
      burst(t, '#c9b6ff', 20);
      await show(`${t.name} was defeated!`, 500);
    } else {
      t.defending = false;
      G.sfx.down();
      await show(`${t.name} has fallen!`, 700);
    }
    refreshParty();
  }
  async function lunge(c) { c.lunge = 0.28; await G.sleep(200); }

  function pickTarget() {
    const ps = living('party');
    const taunter = ps.find((c) => c.st.taunt);
    if (taunter) return taunter;
    return ps[Math.floor(Math.random() * ps.length)];
  }
  const retarget = (t) => (t && alive(t) ? t : living('enemy')[0]);

  // ------------------------------------------------------------ party actions
  async function partyAct(c, a) {
    if (a.type === 'defend') { await show(`${c.name} is defending.`, 450); return; }
    if (a.type === 'attack') {
      const t = retarget(a.target); if (!t) return;
      setMsg(`${c.name} attacks!`);
      await lunge(c); slash(t);
      await hurt(t, physical(c, t, 1));
      await G.sleep(250);
      return;
    }
    if (a.type === 'item') return useItem(c, a);
    if (a.type === 'skill') return useSkill(c, a);
  }

  async function useItem(c, a) {
    const it = G.ITEMS[a.item];
    let t = a.target;
    setMsg(`${c.name} uses ${a.item}!`);
    await G.sleep(300);
    if (it.revive) {
      if (alive(t)) { G.addItem(a.item); await show('It had no effect.'); return; }
      t.hp = Math.floor(t.maxHp * it.revive); popup(t, 'Revived!', '#ffe38a'); burst(t, '#ffe38a', 18, true); G.sfx.heal();
      refreshParty(); await G.sleep(500); return;
    }
    if (!alive(t)) { t = living('party').sort((x, y) => x.hp / x.maxHp - y.hp / y.maxHp)[0]; }
    if (it.heal) heal(t, it.heal);
    if (it.mp) heal(t, it.mp, true);
    if (it.cure) { delete t.st.poison; delete t.st.burn; popup(t, 'Cured', '#8be08b'); burst(t, '#d0ffd0', 10, true); refreshParty(); }
    G.sfx.heal();
    await G.sleep(500);
  }

  async function useSkill(c, a) {
    const sk = G.SKILLS[a.id];
    if (c.mp < sk.mp) { await show(`${c.name} doesn't have enough MP!`); return; }
    c.mp -= sk.mp; refreshParty();
    setMsg(`${c.name} uses ${sk.name}!`);
    const lv = c.m.level, st = G.stats(c.m);
    switch (a.id) {
      case 'twin_slash': {
        await lunge(c);
        for (let i = 0; i < 2; i++) {
          const t = retarget(a.target); if (!t) break;
          slash(t); await hurt(t, physical(c, t, 0.7)); await G.sleep(220);
        }
        break;
      }
      case 'ember_strike': {
        const t = retarget(a.target); if (!t) break;
        await lunge(c); burst(t, '#ff9a3c', 22); G.sfx.fire();
        let d = physical(c, t, 1.8);
        if (t.hollow) d *= 2;
        await hurt(t, d, '#ffb45a');
        if (t.hollow) await show('Super effective against the Hollow!', 600);
        break;
      }
      case 'hammer_blow': {
        const t = retarget(a.target); if (!t) break;
        await lunge(c); slash(t); B.shake = 0.3;
        await hurt(t, physical(c, t, 1.5));
        const stunChance = 0.3 * (1 - ((t.data && t.data.stunResist) || 0));
        if (alive(t) && Math.random() < stunChance) { t.st.stun = 1; popup(t, 'Stunned!', '#ffe38a'); await show(`${t.name} is stunned!`, 600); }
        break;
      }
      case 'spark': {
        const t = retarget(a.target); if (!t) break;
        burst(t, '#fff27a', 18); G.sfx.magic();
        await G.sleep(200);
        await hurt(t, 14 + 2 * lv + st.spark, '#fff27a');
        break;
      }
      case 'thornbind': {
        const t = retarget(a.target); if (!t) break;
        burst(t, '#6fcf5a', 14); G.sfx.magic();
        t.st.spdDown = 2; popup(t, 'SPD down', '#9fe07a'); refreshParty();
        await show(`${t.name} is tangled in thorns!`);
        break;
      }
      case 'rally':
        living('party').forEach((p) => { p.st.atkUp = 3; burst(p, '#ff8a6a', 8, true); });
        G.sfx.buff(); refreshParty();
        await show('The party feels fired up! ATK up!');
        break;
      case 'shield_wall':
        living('party').forEach((p) => { p.st.defUp = 2; burst(p, '#8fc0ff', 8, true); });
        G.sfx.buff(); refreshParty();
        await show('Brann raises a wall of steel! DEF up!');
        break;
      case 'taunt':
        c.st.taunt = 2; popup(c, 'Taunt!', '#ffd36b'); G.sfx.buff(); refreshParty();
        await show(`${c.name} bellows! "OI! OVER HERE!"`);
        break;
      case 'mend': {
        let t = a.target;
        if (!alive(t)) t = living('party').sort((x, y) => x.hp / x.maxHp - y.hp / y.maxHp)[0];
        G.sfx.heal(); heal(t, 30 + st.mend);
        await G.sleep(500);
        break;
      }
      case 'moonleaf':
        G.sfx.heal();
        living('party').forEach((p) => heal(p, 20));
        await G.sleep(600);
        break;
    }
  }

  // ------------------------------------------------------------ enemy AI
  async function enemyAct(e) {
    e.turns++;
    const r = Math.random();
    const mv = e.data.moves || {};
    const attack = async (mult = 1, label) => {
      const t = pickTarget(); if (!t) return;
      setMsg(label ? `${e.name} uses ${label}!` : `${e.name} attacks!`);
      await lunge(e); slash(t);
      await hurt(t, guarded(t, physical(e, t, mult)));
      await G.sleep(200);
      return t;
    };
    const magicHit = async (t, dmg, col, label) => {
      setMsg(`${e.name} uses ${label}!`);
      burst(t, col, 16); G.sfx.magic(); await G.sleep(250);
      await hurt(t, guarded(t, dmg), col);
    };
    const allHit = async (dmg, col, label) => {
      setMsg(`${e.name} uses ${label}!`); G.sfx.magic(); B.shake = 0.3;
      for (const t of living('party')) { burst(t, col, 10); await hurt(t, guarded(t, dmg), col); }
      await G.sleep(350);
    };
    switch (e.data.ai) {
      case 'wisp': {
        const t = pickTarget();
        if (r < 0.35 && t && t.mp > 0) {
          const n = Math.min(4, t.mp);
          setMsg(`${e.name} uses Drain!`); burst(t, '#b07aff', 12); G.sfx.magic();
          t.mp -= n; popup(t, `-${n} MP`, '#b07aff'); refreshParty(); await G.sleep(650);
        } else await attack();
        break;
      }
      case 'boar':
        if (r < 0.3) { await attack(1.5, 'Charge'); e.rest = 1; } else await attack();
        break;
      case 'wolf': {
        const wolves = B.enemies.filter((x) => alive(x) && x.id === 'hollow_wolf').length;
        const free = [0, 1, 2].find((s) => !B.enemies.some((x) => !x.dead && x.slot === s));
        if (r < 0.2 && wolves < 3 && free != null) {
          await show(`${e.name} howls!`, 500); G.sfx.howl();
          const w = makeEnemy('hollow_wolf', free);
          B.enemies.push(w); nameEnemies(); w.flash = 0.5;
          await show('Another Hollow Wolf appears!');
        } else await attack();
        break;
      }
      case 'bat': {
        const t = await attack(1, 'Burn Bite');
        if (t && alive(t) && Math.random() < 0.25) { t.st.burn = 2; popup(t, 'Burned!', '#ff9a3c'); refreshParty(); await show(`${t.name} is burned!`, 500); }
        break;
      }
      case 'knight':
        if (r < 0.25 && !e.st.guard) { e.st.guard = 1; setMsg(`${e.name} raises its guard!`); popup(e, 'DEF×2', '#8fc0ff'); G.sfx.buff(); await G.sleep(650); }
        else await attack();
        break;
      case 'shade':
        if (r < 0.35) await magicHit(pickTarget(), 16, '#b07aff', 'Dark Bolt');
        else await attack();
        break;
      case 'gloomcap':
        if (e.hp < e.maxHp * 0.4 && e.regrows < 2 && r < 0.6) {
          e.regrows++; setMsg(`${e.name} uses Regrow!`); G.sfx.heal();
          const n = mv.regrow || 20;
          e.hp = Math.min(e.maxHp, e.hp + n); popup(e, '+' + n, '#8be08b'); burst(e, '#9df59a', 14, true); await G.sleep(700);
        } else if (e.turns % 3 === 0) {
          setMsg(`${e.name} uses Spore Cloud!`); G.sfx.magic();
          for (const t of living('party')) { t.st.poison = 3; t.poisonDmg = mv.spore || 4; burst(t, '#a8e05a', 10); popup(t, 'Poisoned!', '#b8f06a'); }
          refreshParty(); await G.sleep(800);
        } else if (r < 0.45) await attack(1.3, 'Stomp');
        else await attack();
        break;
      case 'morvane':
        if (e.phase === 1) {
          if (r < 0.35) { const t = pickTarget(); setMsg(`${e.name} uses Ember Lash!`); burst(t, '#ff9a3c', 16); G.sfx.fire(); await lunge(e); await hurt(t, guarded(t, physical(e, t, 1.4)), '#ffb45a'); await G.sleep(250); }
          else if (r < 0.62) await allHit(mv.cinderRain || 10, '#ff9a3c', 'Cinder Rain');
          else if (r < 0.77 && !e.st.ward) { e.st.ward = 2; setMsg(`${e.name} uses Ward!`); popup(e, 'DEF up', '#8fc0ff'); burst(e, '#ffcf7a', 12, true); G.sfx.buff(); await G.sleep(700); }
          else await attack();
        } else {
          if (!e.drained && e.hp < e.maxHp * 0.3) {
            e.drained = true; setMsg(`${e.name} uses Drain Light!`); G.sfx.magic();
            const n = mv.drainLight || 25;
            e.hp = Math.min(e.maxHp, e.hp + n); popup(e, '+' + n, '#c37dff'); burst(e, '#c37dff', 18, true); await G.sleep(800);
          } else if (r < 0.38) {
            const t = pickTarget();
            await magicHit(t, mv.hollowGrasp || 20, '#b07aff', 'Hollow Grasp');
            if (alive(t)) { t.st.atkDown = 2; popup(t, 'ATK down', '#c37dff'); refreshParty(); await G.sleep(300); }
          } else if (r < 0.68) await allHit(mv.shadowTide || 14, '#b07aff', 'Shadow Tide');
          else await attack();
        }
        break;
      default: await attack();
    }
  }

  async function phase2(e) {
    B.pendingPhase = null;
    const p = e.data.phase2;
    setMsg('');
    B.partyEl.style.visibility = 'hidden';
    if (e.id === 'morvane') G.setFlag('morvane_hollow');   // his portrait switches to the Hollow form from here on
    await G.runScene(p.scene);
    G.ui.setBg(null, true); G.ui.clearPortraits();
    B.partyEl.style.visibility = '';
    G.sfx.howl(); B.shake = 0.6; e.flash = 0.8; burst(e, '#8a4fe0', 40);
    Object.assign(e, { phase: 2, atk: p.atk, spd: p.spd, hollow: true, sprite: p.sprite, name: p.name });
    e.st = {};
    await show(`${p.name.split(' (')[0]} takes on a Hollow Form!`, 1100);
  }

  // ------------------------------------------------------------ command input
  function pickEnemy() {
    const list = living('enemy').sort((a, b) => a.x - b.x);
    let i = 0;
    const upd = () => { B.cursor = list[i]; setMsg(list[i].name); };
    upd();
    return new Promise((res) => {
      const h = G.input.push((act) => {
        if (act === 'left' || act === 'up') { i = (i - 1 + list.length) % list.length; G.sfx.move(); upd(); }
        else if (act === 'right' || act === 'down') { i = (i + 1) % list.length; G.sfx.move(); upd(); }
        else if (act === 'ok') { G.input.pop(h); B.cursor = null; G.sfx.ok(); res(list[i]); }
        else if (act === 'cancel') { G.input.pop(h); B.cursor = null; G.sfx.cancel(); res(null); }
      });
    });
  }
  async function pickAlly(mode) { // mode: 'alive' | 'dead'
    const i = await ui.list({
      title: 'On whom?', x: 104, y: 106, w: 150,
      items: B.party.map((c) => ({ label: c.name, right: `${c.hp}/${c.maxHp}`, disabled: mode === 'dead' ? alive(c) : !alive(c) })),
    });
    return i === -1 ? null : B.party[i];
  }

  async function chooseCommand(c, canBack) {
    B.activeC = c; refreshParty();
    for (;;) {
      setMsg(`What will ${c.name} do?`);
      const skills = G.knownSkills(c.m);
      const k = await ui.list({
        x: 6, y: 166, w: 94, start: B.lastCmd[c.m.id] || 0, cancel: canBack,
        items: [{ label: 'Attack' }, { label: 'Skill', disabled: !skills.length }, { label: 'Item' }, { label: 'Defend' }, { label: 'Flee', disabled: !!B.opts.noFlee }],
      });
      if (k === -1) return 'back';
      B.lastCmd[c.m.id] = k;
      if (k === 0) { const t = await pickEnemy(); if (t) return { type: 'attack', actor: c, target: t }; }
      if (k === 1) {
        const desc = ui.panel({ x: 6, y: 130, w: 308, h: 30 });
        const showD = (i) => { desc.innerHTML = `<span class="desc">${G.SKILLS[skills[i]].desc}</span>`; };
        const pick = ui.list({
          title: 'Skills', x: 6, y: 28, w: 200, start: B.lastSkill[c.m.id] || 0, onMove: showD,
          items: skills.map((id) => ({ label: G.SKILLS[id].name, right: G.SKILLS[id].mp + ' MP', disabled: c.mp < G.SKILLS[id].mp })),
        });
        showD(Math.min(B.lastSkill[c.m.id] || 0, skills.length - 1));
        const si = await pick;
        desc.remove();
        if (si === -1) continue;
        B.lastSkill[c.m.id] = si;
        const id = skills[si], sk = G.SKILLS[id];
        let target = null;
        if (sk.target === 'enemy') { target = await pickEnemy(); if (!target) continue; }
        if (sk.target === 'ally') { target = await pickAlly('alive'); if (!target) continue; }
        return { type: 'skill', id, actor: c, target };
      }
      if (k === 2) {
        const names = Object.keys(G.S.inv).filter((n) => G.ITEMS[n].type === 'consumable');
        const desc = ui.panel({ x: 6, y: 130, w: 308, h: 30 });
        const showD = (i) => { desc.innerHTML = names[i] ? `<span class="desc">${G.ITEMS[names[i]].desc}</span>` : ''; };
        const pick = ui.list({ title: 'Items', x: 6, y: 28, w: 200, maxH: 90, onMove: showD, empty: 'No usable items.', items: names.map((n) => ({ html: G.iconHtml(n) + G.esc(n), right: '×' + G.count(n) })) });
        showD(0);
        const ii = await pick;
        desc.remove();
        if (ii === -1 || !names.length) continue;
        const item = names[ii];
        const target = await pickAlly(G.ITEMS[item].revive ? 'dead' : 'alive');
        if (!target) continue;
        G.removeItem(item);   // reserved now; refunded if the turn is undone
        return { type: 'item', item, actor: c, target };
      }
      if (k === 3) return { type: 'defend', actor: c };
      if (k === 4) return { type: 'flee', actor: c };
    }
  }
  const refund = (a) => { if (a && a.type === 'item') G.addItem(a.item); };

  // ------------------------------------------------------------ the fight
  function setup(group, opts) {
    teardown();
    const boss = group.length === 1 && G.ENEMIES[group[0]].boss;
    const slots = group.length === 1 ? [1] : group.length === 2 ? [0, 2] : [0, 1, 2];
    B = {
      opts, bg: opts.bg || 'forest', round: 0, parts: [], slashes: [], shake: 0,
      party: G.S.party.map(makeMember),
      enemies: group.map((id, i) => makeEnemy(id, slots[i], boss)),
      lastCmd: {}, lastSkill: {}, cursor: null, activeC: null, pendingPhase: null,
    };
    nameEnemies();
    buildUI();
  }
  function teardown() {
    if (!B) return;
    B.msgEl && B.msgEl.remove(); B.partyEl && B.partyEl.remove();
    document.querySelectorAll('.dmg').forEach((e) => e.remove());
    B = null;
  }
  const outcome = () => (!living('enemy').length ? 'win' : !living('party').length ? 'lose' : null);

  async function fight() {
    const names = B.enemies.map((e) => e.name);
    await show(B.enemies[0].boss ? `${B.enemies[0].name} attacks!` : `${names.join(', ')} appear${names.length > 1 ? '' : 's'}!`, 900);
    for (;;) {
      B.round++;
      B.party.forEach((c) => (c.defending = false));
      refreshParty();
      // 1) commands
      const acts = [];
      let i = 0;
      while (i < B.party.length) {
        const c = B.party[i];
        if (!alive(c)) { acts[i] = null; i++; continue; }
        if (c.st.stun) { acts[i] = { type: 'none', actor: c }; i++; continue; }
        const prev = acts.slice(0, i).some((a) => a && a.type !== 'none');
        const a = await chooseCommand(c, prev);
        if (a === 'back') {
          let j = i - 1;
          while (j >= 0 && (!acts[j] || acts[j].type === 'none')) j--;
          if (j >= 0) { refund(acts[j]); acts[j] = null; i = j; }
          continue;
        }
        acts[i] = a; i++;
      }
      B.activeC = null; refreshParty();
      const partyActs = acts.filter(Boolean);
      partyActs.forEach((a) => { if (a.type === 'defend') a.actor.defending = true; });
      refreshParty();
      // 2) flee attempt happens first
      const flee = partyActs.find((a) => a.type === 'flee');
      if (flee) {
        const avg = (l) => l.reduce((s, c) => s + eff(c).spd, 0) / l.length;
        const chance = G.clamp(0.5 + (avg(living('party')) - avg(living('enemy'))) * 0.03, 0.25, 0.9);
        await show(`${flee.actor.name} tries to run...`, 600);
        if (Math.random() < chance) { G.sfx.run(); await show('Got away safely!', 800); return 'flee'; }
        await show("Couldn't get away!", 700);
      }
      // 3) everyone acts in SPD order
      const order = partyActs.filter((a) => a.type !== 'flee')
        .concat(living('enemy').flatMap((e) => Array.from({ length: e.data.actions || 1 }, (_, k) => ({ type: 'enemy', actor: e, k }))))
        // a boss's extra moves come later in the round
        .map((a) => ({ a, s: eff(a.actor).spd + Math.random() * 4 - (a.k || 0) * 8 }))
        .sort((x, y) => y.s - x.s).map((x) => x.a);
      for (const a of order) {
        const c = a.actor;
        if (!alive(c)) { refund(a); continue; }
        if (c.st.stun) { delete c.st.stun; refreshParty(); await show(`${c.name} is stunned and can't move!`); continue; }
        if (c.rest) { c.rest = 0; await show(`${c.name} is catching its breath.`, 550); continue; }
        if (a.type === 'none') continue;
        if (c.side === 'party') await partyAct(c, a); else await enemyAct(c);
        if (B.pendingPhase) await phase2(B.pendingPhase);
        const o = outcome(); if (o) return o;
      }
      // 4) end of round: poison, burn, regen, buffs wear off
      for (const c of [...B.party, ...B.enemies]) {
        if (!alive(c)) continue;
        if (c.st.poison) { burst(c, '#a8e05a', 6); await hurt(c, c.poisonDmg || 4, '#b8f06a'); await G.sleep(250); }
        if (alive(c) && c.st.burn) { burst(c, '#ff9a3c', 6); await hurt(c, 3, '#ffb45a'); await G.sleep(250); }
        if (alive(c) && c.side === 'party') {
          const rg = G.stats(c.m).regen;
          if (rg && c.hp < c.maxHp) { heal(c, rg); await G.sleep(200); }
        }
      }
      for (const c of [...B.party, ...B.enemies]) {
        for (const k of TIMED) if (c.st[k]) { c.st[k]--; if (c.st[k] <= 0) delete c.st[k]; }
      }
      refreshParty();
      const o = outcome(); if (o) return o;
    }
  }

  async function victory() {
    G.sfx.victory();
    const foes = B.enemies;
    const exp = foes.reduce((s, e) => s + e.data.exp, 0);
    const gold = foes.reduce((s, e) => s + e.data.gold, 0);
    G.S.gold += gold;
    await say(`Victory! Got ${exp} EXP and ${gold} gold.`);
    for (const e of foes) for (const d of e.data.drops) {
      if (Math.random() < d.chance) { G.addItem(d.item); G.sfx.item(); await say(`The ${e.data.name} dropped ${d.item}!`); }
    }
    for (const c of B.party) {
      if (!alive(c)) continue;
      const m = c.m;
      m.exp += exp;
      while (m.level < G.LEVEL_CAP && m.exp >= G.expToNext(m.level)) {
        const before = G.stats(m), oldSkills = G.knownSkills(m);
        m.exp -= G.expToNext(m.level);
        m.level++;
        const after = G.stats(m);
        m.hp += after.maxHp - before.maxHp; m.mp += after.maxMp - before.maxMp;
        refreshParty(); G.sfx.levelup();
        await say(`${c.name} reached Lv ${m.level}!`);
        for (const id of G.knownSkills(m)) if (!oldSkills.includes(id)) await say(`${c.name} learned ${G.SKILLS[id].name}!`);
      }
      if (m.level >= G.LEVEL_CAP) m.exp = 0;
    }
    // Fallen members get back up with 1 HP after a win.
    B.party.forEach((c) => { if (c.hp <= 0) c.hp = 1; });
  }

  async function gameOver() {
    G.sfx.defeat();
    await say('The party has fallen...');
    await ui.fade(1);
    B.msgEl.style.visibility = B.partyEl.style.visibility = 'hidden';
    await ui.backdropFrom(G.ART.screens.gameover, 'cover');
    const scr = G.el('div', 'screen gameover', `<div class="title">Defeated</div><div class="sub">The Hollow close in...</div>`);
    ui.root.appendChild(scr);
    await ui.fade(0);
    const i = await ui.list({ parent: scr, inline: true, cancel: false, items: [{ label: 'Try Again' }, { label: 'Load Last Save', disabled: !G.hasSave() }, { label: 'Return to Title' }] });
    scr.remove();
    ui.setBackdrop(null);
    if (B) B.msgEl.style.visibility = B.partyEl.style.visibility = '';
    return ['retry', 'load', 'title'][i];
  }

  // ------------------------------------------------------------ public entry
  // arg: a boss name from G.BOSSES (used by BATTLE: in scripts) or an array of enemy ids.
  async function start(arg, opts = {}) {
    let group;
    if (typeof arg === 'string') {
      const spec = G.BOSSES[arg];
      if (!spec) { console.warn('Unknown battle', arg); return 'win'; }
      group = spec.group; opts = { ...opts, bg: spec.bg, noFlee: true };
    } else group = arg;
    G.busy = (G.busy || 0) + 1;
    const snapshot = JSON.stringify(G.S);
    try {
      for (;;) {
        G.sfx.encounter();
        await ui.fade(1);
        ui.setBg(null, true); ui.clearPortraits();   // scene art must not cover the battle
        setup(group, opts);
        await ui.fade(0);
        const result = await fight();
        if (result === 'win') await victory();
        G.battle.lastResult = result;
        if (result !== 'lose') {
          await ui.fade(1); teardown(); await ui.fade(0);
          return result;
        }
        const choice = await gameOver();
        G.battle.lastResult = 'lose';
        if (choice === 'retry') { G.S = JSON.parse(snapshot); G.world.resetFollowers(); continue; }
        await ui.fade(1); teardown();
        if (choice === 'load' && G.load()) { G.world.load(G.S.map); await ui.fade(0); return 'lose'; }
        location.reload();
        return 'lose';
      }
    } finally { G.busy--; }
  }

  // Called by the world after each step on a map with battles.
  function rollEncounter(map) {
    const enc = G.ENCOUNTERS[map.battles];
    if (!enc) return null;
    if (G.S.encSteps == null) G.S.encSteps = G.rand(enc.steps[0], enc.steps[1]);
    if (--G.S.encSteps > 0) return null;
    G.S.encSteps = G.rand(enc.steps[0], enc.steps[1]);
    return { group: enc.groups[Math.floor(Math.random() * enc.groups.length)], bg: enc.bg };
  }

  // ------------------------------------------------------------ loop
  function update(dt) {
    time += dt;
    if (!B) return;
    B.shake = Math.max(0, B.shake - dt);
    for (const c of [...B.party, ...B.enemies]) {
      c.flash = Math.max(0, c.flash - dt);
      c.lunge = Math.max(0, c.lunge - dt);
      if (c.dead && c.fade > 0) c.fade = Math.max(0, c.fade - dt * 2);
    }
    B.parts = B.parts.filter((p) => { p.life += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 30 * dt; return p.life < p.max; });
    B.slashes = B.slashes.filter((s) => (s.t += dt) < 0.22);
  }

  function drawSprite(ctx, c) {
    const s = spriteOf(c);
    const w = (s.width || s.img.width) * s.scale, h = (s.height || s.img.height) * s.scale;
    let ox = 0, oy = 0;
    const lungeK = c.lunge > 0 ? Math.sin((1 - c.lunge / 0.28) * Math.PI) : 0;
    if (c.side === 'party') {
      ox = -lungeK * 14 + (B.activeC === c ? -8 : 0);
      if (!alive(c)) {
        ctx.save(); ctx.globalAlpha = 0.7; ctx.filter = 'grayscale(1)';
        ctx.translate(c.x, c.y - 6); ctx.rotate(-Math.PI / 2);
        blit(ctx, s, -h / 2 + 4, -w / 2, w, h);
        ctx.restore();
        return;
      }
      // soft shadow under the party member
      ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(c.x + ox, c.y, w * 0.3, 3, 0, 0, Math.PI * 2); ctx.fill();
    } else {
      ox = lungeK * 14;
      if (FLOATERS.has(c.sprite)) oy = Math.sin(time * 3 + c.slot) * 2 - 6;
      if (c.dead) { if (c.fade <= 0) return; ctx.globalAlpha = c.fade; }
    }
    const x = Math.round(c.x - w / 2 + ox), y = Math.round(c.y - h + oy);
    blit(ctx, s, x, y, w, h);
    if (c.flash > 0 && Math.floor(c.flash * 20) % 2 === 0) {
      ctx.save(); ctx.filter = 'brightness(0) invert(1)'; ctx.globalAlpha = 0.85 * (c.fade ?? 1);
      blit(ctx, s, x, y, w, h); ctx.restore();
    }
    ctx.globalAlpha = 1;
    // small HP bar under enemies
    if (c.side === 'enemy' && !c.dead) {
      const bw = c.boss ? 60 : 26;
      ctx.fillStyle = '#000'; ctx.fillRect(c.x - bw / 2 - 1, c.y + 3, bw + 2, 4);
      ctx.fillStyle = c.hp / c.maxHp > 0.4 ? '#7ad35c' : c.hp / c.maxHp > 0.2 ? '#e8c13a' : '#e8553a';
      ctx.fillRect(c.x - bw / 2, c.y + 4, Math.ceil((bw * c.hp) / c.maxHp), 2);
    }
  }

  function render(ctx) {
    if (!B) return;
    ctx.save();
    if (B.shake > 0) ctx.translate(Math.round((Math.random() - 0.5) * 4), Math.round((Math.random() - 0.5) * 4));
    const bgArt = G.ART.battle[B.bg] && G.img.get(G.ART.battle[B.bg]);
    if (bgArt) { // 16:9 art: show the centre 4:3 slice
      const sw = bgArt.height * 4 / 3;
      ctx.drawImage(bgArt, (bgArt.width - sw) / 2, 0, sw, bgArt.height, 0, 0, 320, 240);
    } else ctx.drawImage(G.art.battleBg(B.bg), 0, 0);
    if (B.bg === 'hall' && !bgArt) { // the swirling doorway to the Hollow (code-drawn fallback)
      const cx = 100, cy = 70;
      for (let i = 0; i < 5; i++) {
        ctx.strokeStyle = `rgba(${140 + i * 20},${70 + i * 10},255,${0.5 - i * 0.07})`;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.ellipse(cx, cy, 30 - i * 5, 44 - i * 7, 0, time * (1 + i * 0.4), time * (1 + i * 0.4) + Math.PI * 1.4); ctx.stroke();
      }
    }
    const all = [...B.enemies, ...B.party].sort((a, b) => a.y - b.y);
    for (const c of all) drawSprite(ctx, c);
    for (const s of B.slashes) {
      const [x, y] = centerOf(s.c), k = s.t / 0.22;
      ctx.strokeStyle = `rgba(255,255,255,${1 - k})`; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x - 12 + k * 6, y - 12); ctx.lineTo(x + 12 + k * 6, y + 12); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - 6 + k * 6, y - 14); ctx.lineTo(x + 14 + k * 6, y + 6); ctx.stroke();
    }
    for (const p of B.parts) { ctx.globalAlpha = 1 - p.life / p.max; ctx.fillStyle = p.col; ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size); }
    ctx.globalAlpha = 1;
    if (B.cursor) {
      const c = B.cursor, top = c.y - heightOf(c) - 8 + Math.sin(time * 8) * 2 + (FLOATERS.has(c.sprite) ? -6 : 0);
      ctx.fillStyle = '#ffd36b';
      ctx.beginPath(); ctx.moveTo(c.x - 5, top - 6); ctx.lineTo(c.x + 5, top - 6); ctx.lineTo(c.x, top); ctx.fill();
      ctx.strokeStyle = '#5a3a10'; ctx.lineWidth = 1; ctx.stroke();
    }
    ctx.restore();
  }

  return { start, rollEncounter, update, render, get active() { return !!B; }, get state() { return B; } };
})();
