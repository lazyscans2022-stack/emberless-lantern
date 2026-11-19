// script.js: parses the dialogue scripts and runs scenes.
'use strict';

G.parseScripts = (text) => {
  const scenes = {};
  const errors = [];
  let sc = null;
  const COMMANDS = new Set(['GIVE', 'TAKE', 'GOLD', 'SET', 'JOIN', 'BATTLE', 'SHOP', 'CHOICE', 'IF']);
  text.split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim();
    const where = `line ${i + 1}`;
    if (!line || line === '---') return;
    let m;
    if ((m = /^SCENE:\s*(\S+)/.exec(line))) {
      sc = scenes[m[1]] = { name: m[1], location: '', trigger: '', ops: [], labels: {} };
      return;
    }
    if (!sc) { errors.push(`${where}: text before first SCENE`); return; }
    if ((m = /^LOCATION:\s*(.*)$/.exec(line))) { sc.location = m[1]; return; }
    if ((m = /^TRIGGER:\s*(.*)$/.exec(line))) { sc.trigger = m[1]; return; }
    if ((m = /^\[(\w+)\]$/.exec(line))) { sc.labels[m[1]] = sc.ops.length; return; }
    if ((m = /^goto\s+(\w+)$/i.exec(line))) { sc.ops.push({ op: 'goto', label: m[1] }); return; }
    if (line === 'END' || line === 'END_GAME' || line === 'HEAL_PARTY') { sc.ops.push({ op: line }); return; }

    if ((m = /^([A-Z][A-Z0-9_]*):\s*(.*)$/.exec(line))) {
      const [, key, arg] = m;
      if (!COMMANDS.has(key)) { sc.ops.push({ op: 'SAY', who: key, text: arg }); return; }
      if (key === 'CHOICE') {
        const options = arg.split('|').map((part) => {
          const o = /"(.*)"\s*->\s*goto\s+(\w+)/.exec(part.trim());
          if (!o) errors.push(`${where}: bad CHOICE option "${part.trim()}"`);
          return o ? { text: o[1], label: o[2] } : null;
        }).filter(Boolean);
        sc.ops.push({ op: 'CHOICE', options });
        return;
      }
      if (key === 'IF') {
        const c = /^(\S+)\s*->\s*goto\s+(\w+)$/.exec(arg);
        if (!c) { errors.push(`${where}: bad IF "${arg}"`); return; }
        sc.ops.push({ op: 'IF', cond: c[1], label: c[2] });
        return;
      }
      if (key === 'GOLD') { sc.ops.push({ op: 'GOLD', n: parseInt(arg.replace(/\s/g, ''), 10) || 0 }); return; }
      if (key === 'TAKE' || key === 'GIVE') {
        // Merge repeated lines (TAKE: Boar Hide x3) into one op with a count.
        const prev = sc.ops[sc.ops.length - 1];
        const labelHere = Object.values(sc.labels).includes(sc.ops.length);
        if (prev && prev.op === key && prev.item === arg && !labelHere) { prev.n++; return; }
        sc.ops.push({ op: key, item: arg, n: 1 });
        return;
      }
      sc.ops.push({ op: key, arg });
      return;
    }
    errors.push(`${where}: can't understand "${line}"`);
  });
  // Check every goto points at a real label.
  for (const s of Object.values(scenes)) {
    for (const op of s.ops) {
      const labels = op.op === 'CHOICE' ? op.options.map((o) => o.label) : op.label ? [op.label] : [];
      for (const l of labels) if (!(l in s.labels)) errors.push(`${s.name}: goto ${l}, but there is no [${l}]`);
    }
  }
  return { scenes, errors };
};

{
  const parsed = G.parseScripts(G.SCRIPT_TEXT);
  G.SCENES = parsed.scenes;
  G.SCRIPT_ERRORS = parsed.errors;
  if (parsed.errors.length) console.warn('Script problems:\n' + parsed.errors.join('\n'));
}

// Runs a scene. opts.only = speaker key: show only that speaker's lines
// (used for Villager_Lines, where each villager has one line).
G.runScene = async (name, opts = {}) => {
  const sc = G.SCENES[name];
  if (!sc) { console.warn('No scene', name); return; }
  G.busy = (G.busy || 0) + 1;
  G.sceneDepth = (G.sceneDepth || 0) + 1;
  const prevBg = G.ui.bg;
  try {
    let pc = 0, guard = 0;
    while (pc < sc.ops.length && guard++ < 2000) {
      const op = sc.ops[pc++];
      // Background from LOCATION; re-checked every step so Lantern Hill can switch to lit.
      if (op.op !== 'BATTLE') G.ui.setBg(G.sceneBackground(sc));
      switch (op.op) {
        case 'SAY':
          if (opts.only && op.who !== opts.only) break;
          await G.ui.say(op.who, op.text);
          break;
        case 'goto': pc = sc.labels[op.label]; break;
        case 'IF': if (G.check(op.cond)) pc = sc.labels[op.label]; break;
        case 'CHOICE': {
          const i = await G.ui.choice(op.options.map((o) => o.text));
          pc = sc.labels[op.options[i].label];
          break;
        }
        case 'SET': G.setFlag(op.arg); break;
        case 'GIVE':
          G.addItem(op.item, op.n);
          G.sfx.item();
          await G.ui.notice(`Received ${op.n > 1 ? op.n + '× ' : ''}${op.item}!`);
          break;
        case 'TAKE':
          G.removeItem(op.item, op.n);
          if (op.item === 'Ember Heart') G.setFlag('lantern_lit');   // the Lantern lights up
          await G.ui.notice(`Handed over ${op.n > 1 ? op.n + '× ' : ''}${op.item}.`);
          break;
        case 'GOLD':
          G.S.gold += op.n;
          G.sfx.coin();
          await G.ui.notice(`Received ${op.n} gold!`);
          break;
        case 'JOIN': {
          const id = op.arg.toLowerCase();
          G.joinParty(id);
          G.world && G.world.resetFollowers();
          G.sfx.join();
          await G.ui.notice(`${G.CHARS[id].name} joined the party!`);
          break;
        }
        case 'HEAL_PARTY':
          G.healParty();
          G.sfx.heal();
          await G.ui.notice("The party's HP and MP were fully restored.");
          break;
        case 'SHOP': await G.openShop(op.arg); break;
        case 'BATTLE': {
          const result = await G.battle.start(op.arg, { boss: true, noFlee: true });
          if (result !== 'win') return;   // a loss is handled by the battle (game over)
          break;
        }
        case 'END': return;
        case 'END_GAME': await G.endGame(); return;
      }
    }
  } finally {
    G.busy--;
    G.sceneDepth--;
    G.ui.setBg(prevBg);
    if (!G.sceneDepth) G.ui.clearPortraits();
  }
};
