// enemies.js: enemy stats, encounter groups and bosses (rpg_design.md §5).
'use strict';
G.ENEMIES = {
  // Whisperwood Forest
  shade_wisp:     { name: 'Shade Wisp',     sprite: 'wisp',  hp: 18, atk: 7,  def: 3, spd: 12, exp: 6,  gold: 5,  hollow: true, ai: 'wisp',  drops: [{ item: 'Ether', chance: 0.10 }] },
  thornback_boar: { name: 'Thornback Boar', sprite: 'boar',  hp: 30, atk: 10, def: 6, spd: 7,  exp: 9,  gold: 8,  ai: 'boar',  drops: [{ item: 'Boar Hide', chance: 0.50 }] },
  hollow_wolf:    { name: 'Hollow Wolf',    sprite: 'wolf',  hp: 26, atk: 11, def: 4, spd: 14, exp: 10, gold: 7,  hollow: true, ai: 'wolf',  drops: [{ item: 'Potion', chance: 0.15 }] },
  // Ashen Ruins
  cinder_bat:     { name: 'Cinder Bat',     sprite: 'bat',    hp: 22, atk: 9,  def: 3,  spd: 16, exp: 9,  gold: 6,  ai: 'bat',    drops: [{ item: 'Potion', chance: 0.15 }] },
  ash_knight:     { name: 'Ash Knight',     sprite: 'knight', hp: 48, atk: 14, def: 13, spd: 7,  exp: 16, gold: 14, ai: 'knight', drops: [{ item: 'Hi-Potion', chance: 0.10 }] },
  hollow_shade:   { name: 'Hollow Shade',   sprite: 'shade',  hp: 38, atk: 12, def: 6,  spd: 11, exp: 14, gold: 10, hollow: true, ai: 'shade', drops: [{ item: 'Ether', chance: 0.15 }] },
  // Bosses. Tuned up from the design doc to hit its "8-12 turns" target
  // (design values in comments). actions = moves per round; stunResist halves Hammer Blow's stun.
  // Simulated: Gloomcap vs Lv 3-4 party = 6-8 rounds; Morvane vs Lv 7-8 party = 6-14 rounds (avg ~9.5).
  gloomcap: {
    name: 'Gloomcap Giant', sprite: 'gloomcap', boss: true, ai: 'gloomcap',
    hp: 340, atk: 16, def: 8, spd: 5, exp: 60, gold: 50,     // design: hp 140, atk 12
    actions: 1, stunResist: 0.5,
    moves: { spore: 5, regrow: 40 },                         // design: spore 4/turn, regrow 20
    drops: [{ item: 'Moonleaf Charm', chance: 1 }],
  },
  morvane: {
    name: 'Morvane', sprite: 'morvane', boss: true, ai: 'morvane',
    hp: 720, atk: 22, def: 10, spd: 11, exp: 200, gold: 150, // design: hp 280, atk 15
    actions: 2, stunResist: 0.5,                             // design: 1 move per round
    moves: { cinderRain: 16, hollowGrasp: 28, shadowTide: 20, drainLight: 60 }, // design: 10, 20, 14, 25
    drops: [],
    // At half HP he merges with the Hollow.
    // design: below 140, atk 18
    phase2: { below: 360, atk: 26, spd: 13, hollow: true, sprite: 'morvane_hollow', name: 'Morvane (Hollow Form)', scene: 'Morvane_Phase2' },
  },
};

// Random encounter groups per area (1–3 enemies).
G.ENCOUNTERS = {
  forest: {
    bg: 'forest', steps: [14, 26],
    groups: [
      ['shade_wisp'], ['thornback_boar'], ['hollow_wolf'],
      ['shade_wisp', 'shade_wisp'], ['thornback_boar', 'shade_wisp'], ['hollow_wolf', 'shade_wisp'],
      ['thornback_boar', 'thornback_boar'], ['shade_wisp', 'thornback_boar', 'shade_wisp'], ['hollow_wolf', 'hollow_wolf'],
    ],
  },
  ruins: {
    bg: 'ruins', steps: [14, 24],
    groups: [
      ['cinder_bat'], ['ash_knight'], ['hollow_shade'],
      ['cinder_bat', 'cinder_bat'], ['ash_knight', 'cinder_bat'], ['hollow_shade', 'cinder_bat'],
      ['cinder_bat', 'hollow_shade', 'cinder_bat'], ['ash_knight', 'hollow_shade'], ['cinder_bat', 'cinder_bat', 'cinder_bat'],
    ],
  },
};

// Names used by the BATTLE: script command.
G.BOSSES = {
  Gloomcap_Giant: { group: ['gloomcap'], bg: 'glade' },
  Morvane: { group: ['morvane'], bg: 'hall' },
};
