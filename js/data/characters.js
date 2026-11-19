// characters.js: party stats, skills, and how every character looks (rpg_design.md §3).
'use strict';

G.CHARS = {
  rowan: {
    name: 'Rowan', look: 'ROWAN', cls: 'Swordsman', joinLevel: 1,
    base:   { hp: 60, mp: 15, atk: 12, def: 8, spd: 10 },
    growth: { hp: 8,  mp: 2,  atk: 2,  def: 1, spd: 1 },
    start:  { weapon: 'Wooden Sword', armor: 'Cloth Tunic' },
    skills: [
      { id: 'twin_slash', level: 1 },
      { id: 'rally', level: 3 },
      { id: 'ember_strike', flag: 'ember_strike_learned' },
    ],
  },
  brann: {
    name: 'Brann', look: 'BRANN', cls: 'Guardian', joinLevel: 1,
    base:   { hp: 85, mp: 10, atk: 10, def: 14, spd: 6 },
    growth: { hp: 11, mp: 1,  atk: 2,  def: 2,  spd: 0.5 },
    start:  { weapon: "Smith's Hammer", armor: 'Cloth Tunic' },
    skills: [
      { id: 'hammer_blow', level: 1 },
      { id: 'taunt', level: 1 },
      { id: 'shield_wall', level: 4 },
    ],
  },
  mira: {
    name: 'Mira', look: 'MIRA', cls: 'Herbalist', joinLevel: 3,
    // Design gives her Lv 3 stats directly, so base here is back-calculated to Lv 1.
    base:   { hp: 38, mp: 30, atk: 5, def: 4, spd: 11 },
    growth: { hp: 5,  mp: 4,  atk: 1, def: 1, spd: 1 },
    start:  { weapon: 'Oak Staff', armor: 'Cloth Tunic' },
    skills: [
      { id: 'mend', level: 1 },
      { id: 'spark', level: 1 },
      { id: 'thornbind', level: 1 },
      { id: 'moonleaf', level: 5 },
    ],
  },
};
G.LEVEL_CAP = 10;
G.expToNext = (level) => 20 * level;

G.SKILLS = {
  twin_slash:   { name: 'Twin Slash',   mp: 3, target: 'enemy', desc: 'Hit one enemy twice at 70% damage.' },
  rally:        { name: 'Rally',        mp: 5, target: 'party', desc: 'Party ATK +20% for 3 turns.' },
  ember_strike: { name: 'Ember Strike', mp: 6, target: 'enemy', desc: 'Fire attack, 1.8x damage. Double vs Hollow.' },
  hammer_blow:  { name: 'Hammer Blow',  mp: 4, target: 'enemy', desc: '1.5x damage, 30% chance to stun.' },
  taunt:        { name: 'Taunt',        mp: 3, target: 'self',  desc: 'Enemies target Brann for 2 turns.' },
  shield_wall:  { name: 'Shield Wall',  mp: 5, target: 'party', desc: 'Party DEF +50% for 2 turns.' },
  mend:         { name: 'Mend',         mp: 4, target: 'ally',  field: true, desc: 'Restore 30 HP to one ally.' },
  spark:        { name: 'Spark',        mp: 3, target: 'enemy', desc: 'Magic damage (14 + 2/level), ignores DEF.' },
  thornbind:    { name: 'Thornbind',    mp: 4, target: 'enemy', desc: 'Enemy SPD -50% for 2 turns.' },
  moonleaf:     { name: 'Moonleaf',     mp: 8, target: 'party', field: true, desc: 'Restore 20 HP to the whole party.' },
};

// ---- Dialogue art (files in assets/)
// Portraits: assets/portraits/<name>.png (see G.ART in art.js). Speakers without one keep the small sprite.
G.PORTRAITS = ['rowan', 'brann', 'mira', 'hesta', 'garrow', 'pip', 'tilly', 'morvane', 'morvane_hollow'];
G.PORTRAIT_LEFT = ['ROWAN', 'BRANN', 'MIRA'];   // party on the left, everyone else on the right
G.portraitFor = (who) => {
  if (!who) return null;
  let name = who.toLowerCase();
  // Hollow form from his phase 2 onward; once spared, the Hollow lets go of him.
  if (name === 'morvane' && G.flag('morvane_hollow') && !G.flag('ending_spare')) name = 'morvane_hollow';
  return G.PORTRAITS.includes(name) ? G.ART.portrait(name) : null;
};

// Backgrounds: assets/backgrounds/<name>.png, picked from the scene's LOCATION (first match wins).
G.SCENE_BACKGROUNDS = [
  ["Rowan's House", 'bg_rowan_room'],
  ["Pip's Shop", 'bg_pip_shop'],
  ["Elder's Hut", 'bg_hesta_hut'],
  ['Smithy', 'bg_smithy'],
  ["Mira's Clearing", 'bg_mira_clearing'],
  ['Gloomcap Glade', 'bg_gloomcap_glade'],
  ['Whisperwood Forest', 'bg_forest'],
  ['– Inner Hall', 'bg_ruins_hall'],   // the dash keeps "Before Inner Hall" (save stone) out
  ['Lantern Hill', () => (G.flag('lantern_lit') ? 'bg_lantern_hill_lit' : 'bg_lantern_hill_dark')],
];
G.sceneBackground = (scene) => {
  const hit = G.SCENE_BACKGROUNDS.find(([match]) => scene.location.includes(match));
  if (!hit) return null;
  const bg = typeof hit[1] === 'function' ? hit[1]() : hit[1];
  return bg ? G.ART.background(bg) : null;
};

// How speaker keys in the scripts are shown in the dialogue box.
G.SPEAKER_NAMES = { VILLAGER_A: 'Farmer', VILLAGER_B: 'Washerwoman' };
G.speakerName = (key) => G.SPEAKER_NAMES[key] || (key.charAt(0) + key.slice(1).toLowerCase());

// Sprite looks. See art.js drawPerson() for what each field does.
G.LOOKS = {
  ROWAN: { hair: '#6b4226', hairStyle: 'messy', shirt: '#4f9a3c', pants: '#5a4632', boots: '#5b3a1e', scarf: '#d8362f' },
  BRANN: { wide: true, hair: '#c4542b', beard: '#c4542b', shirt: '#9097a3', sleeve: '#9097a3', apron: '#7a4a26', pants: '#4a3a2e', boots: '#3a2a20', tool: 'hammer' },
  MIRA:  { skin: '#f5d6bd', hair: '#e9e9f2', hairStyle: 'braid', shirt: '#2f6a3d', cloak: '#1f4a2b', pants: '#3d3a2f', boots: '#4a3420', tool: 'staff', toolTip: '#9fe07a' },
  MORVANE: { skin: '#e8ded2', hairStyle: 'hood', hood: '#7f7b84', robe: '#7f7b84', shirt: '#7f7b84', shawl: '#c9a45c', glowHands: true, boots: '#3a3440' },
  MORVANE_HOLLOW: { skin: '#cfc6d8', hairStyle: 'hood', hood: '#1d1a26', robe: '#1d1a26', shirt: '#1d1a26', shawl: '#5d3a8a', glowHands: true, eye: '#c37dff', boots: '#120f18' },
  HESTA: { skin: '#e9b994', hair: '#f2f2f2', hairStyle: 'bun', shirt: '#5b5a78', robe: '#5b5a78', shawl: '#3f63b8', tool: 'stick', boots: '#3a2a20' },
  GARROW:{ wide: true, skin: '#e0a882', hair: '#9a9a9a', hairStyle: 'bald', beard: '#a6a6a6', shirt: '#4d4a48', sleeve: '#e0a882', apron: '#5a3b22', pants: '#3a3230', boots: '#2a221c' },
  PIP:   { small: true, wide: true, hair: '#7a5230', glasses: true, shirt: '#f2efe2', vest: '#e8c13a', pants: '#4f6a8a', boots: '#3a2a20' },
  TILLY: { small: true, hair: '#d9a13b', hairStyle: 'pigtails', shirt: '#ef8fb4', dress: true, pants: '#f2c49b', boots: '#a8455a', blush: true },
  VILLAGER_A: { hair: '#6b4a2a', hairStyle: 'hat', hat: '#e3c66a', shirt: '#e2dccb', apron: '#3d5f9a', pants: '#3d5f9a', boots: '#4a3420' },
  VILLAGER_B: { hair: '#6b4226', hairStyle: 'headscarf', scarfHead: '#b5574a', shirt: '#8fa7c9', robe: '#6f87a9', apron: '#f0ece0', boots: '#3a2a20' },
};
