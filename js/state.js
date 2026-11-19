// state.js: the save-able game state (flags, gold, inventory, party) and helpers.
'use strict';
const SAVE_KEY = 'emberless_lantern_save_v2';   // v2: painted maps, positions in pixels

G.makeMember = (id, level) => {
  const def = G.CHARS[id];
  const m = { id, level: level || def.joinLevel || 1, exp: 0, equip: { weapon: def.start.weapon, armor: def.start.armor, accessory: null }, hp: 1, mp: 1 };
  const st = G.stats(m);
  m.hp = st.maxHp; m.mp = st.maxMp;
  return m;
};

// Final stats = base + growth per level (rounded down) + equipment.
G.stats = (m) => {
  const def = G.CHARS[m.id];
  const lv = m.level - 1;
  const s = {
    maxHp: Math.floor(def.base.hp + def.growth.hp * lv),
    maxMp: Math.floor(def.base.mp + def.growth.mp * lv),
    atk: Math.floor(def.base.atk + def.growth.atk * lv),
    def: Math.floor(def.base.def + def.growth.def * lv),
    spd: Math.floor(def.base.spd + def.growth.spd * lv),
    spark: 0, mend: 0, regen: 0,
  };
  for (const slot of ['weapon', 'armor', 'accessory']) {
    const it = G.ITEMS[m.equip[slot]];
    if (!it) continue;
    s.atk += it.atk || 0; s.def += it.def || 0; s.spd += it.spd || 0;
    s.maxHp += it.hp || 0; s.spark += it.spark || 0; s.mend += it.mend || 0; s.regen += it.regen || 0;
  }
  return s;
};

G.knownSkills = (m) => G.CHARS[m.id].skills
  .filter((sk) => (sk.flag ? G.flag(sk.flag) : m.level >= sk.level))
  .map((sk) => sk.id);

G.newGame = () => {
  G.S = {
    flags: {},
    gold: 50,
    inv: {},
    party: [G.makeMember('rowan', 1)],
    map: 'rowan_house', x: 140, y: 100, dir: 'down',   // the story starts in Rowan's room
    time: 0,
  };
};

// ---- flags & conditions
G.flag = (f) => !!(G.S && G.S.flags[f]);
G.setFlag = (f, v = true) => { G.S.flags[f] = v; };
// IF conditions are flags, except "has_N_item_name" which checks the inventory.
G.check = (cond) => {
  const m = /^has_(\d+)_(.+)$/.exec(cond);
  if (m) {
    const want = +m[1];
    const words = m[2].replace(/_/g, ' ').toLowerCase();
    const name = Object.keys(G.ITEMS).find((n) => {
      const low = n.toLowerCase();
      return low === words || low + 's' === words || low + 'es' === words;
    });
    return name ? G.count(name) >= want : false;
  }
  return G.flag(cond);
};

// ---- inventory
G.count = (name) => G.S.inv[name] || 0;
G.addItem = (name, n = 1) => {
  if (!G.ITEMS[name]) console.warn('Unknown item:', name);
  G.S.inv[name] = G.count(name) + n;
};
G.removeItem = (name, n = 1) => {
  const left = G.count(name) - n;
  if (left > 0) G.S.inv[name] = left; else delete G.S.inv[name];
};

// ---- party
G.memberById = (id) => G.S.party.find((m) => m.id === id);
G.joinParty = (id) => {
  if (G.memberById(id)) return;
  G.S.party.push(G.makeMember(id));
};
G.healParty = () => {
  for (const m of G.S.party) { const s = G.stats(m); m.hp = s.maxHp; m.mp = s.maxMp; }
};
G.canEquip = (m, name) => {
  const it = G.ITEMS[name];
  if (!it || !['weapon', 'armor', 'accessory'].includes(it.type)) return false;
  return !it.who || it.who.includes(m.id);
};
G.equip = (m, slot, name) => {
  const old = m.equip[slot];
  if (old) G.addItem(old);
  m.equip[slot] = name || null;
  if (name) G.removeItem(name);
  const s = G.stats(m);
  m.hp = Math.min(m.hp, s.maxHp); m.mp = Math.min(m.mp, s.maxMp);
};

// ---- save / load (browser storage; may be unavailable in private windows)
G.save = () => {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(G.S)); return true; } catch (e) { return false; }
};
G.hasSave = () => { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } };
G.load = () => {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (!s || !s.party) return false;
    G.S = s; return true;
  } catch (e) { return false; }
};
