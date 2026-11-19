// items.js: every item, weapon, armour and shop (from rpg_design.md §6).
'use strict';
G.ITEMS = {
  // consumables
  'Potion':          { type: 'consumable', price: 15,  heal: 30,  desc: 'Restore 30 HP to one ally.' },
  'Hi-Potion':       { type: 'consumable', price: 45,  heal: 80,  desc: 'Restore 80 HP to one ally.' },
  'Ether':           { type: 'consumable', price: 30,  mp: 15,    desc: 'Restore 15 MP to one ally.' },
  'Antidote':        { type: 'consumable', price: 10,  cure: true, battleOnly: true, desc: 'Cure poison and burn.' },
  'Phoenix Feather': { type: 'consumable', price: 100, revive: 0.5, desc: 'Revive a fallen ally with 50% HP.' },

  // weapons
  'Wooden Sword':    { type: 'weapon', who: ['rowan'], atk: 2, desc: 'A practice sword. ATK +2.' },
  'Iron Sword':      { type: 'weapon', who: ['rowan'], atk: 5, desc: "Hesta's old blade. ATK +5." },
  'Steel Sword':     { type: 'weapon', who: ['rowan'], atk: 9, price: 120, desc: 'A keen steel blade. ATK +9.' },
  "Smith's Hammer":  { type: 'weapon', who: ['brann'], atk: 4, desc: 'A sturdy forge hammer. ATK +4.' },
  'War Hammer':      { type: 'weapon', who: ['brann'], atk: 8, price: 120, desc: 'Heavy and loud. ATK +8.' },
  'Oak Staff':       { type: 'weapon', who: ['mira'], atk: 2, spark: 4, desc: 'ATK +2, Spark +4 damage.' },
  'Moonwood Staff':  { type: 'weapon', who: ['mira'], atk: 4, spark: 8, mend: 10, price: 110, desc: 'ATK +4, Spark +8, Mend +10.' },

  // armour
  'Cloth Tunic':     { type: 'armor', def: 1, desc: 'Plain clothes. DEF +1.' },
  'Leather Vest':    { type: 'armor', def: 3, price: 40, desc: 'Boiled leather. DEF +3.' },
  'Chain Mail':      { type: 'armor', who: ['rowan', 'brann'], def: 6, price: 100, desc: 'DEF +6. Rowan and Brann only.' },

  // accessories
  'Ward Ring':       { type: 'accessory', def: 2, spd: 2, desc: 'A lucky ring. DEF +2, SPD +2.' },
  'Moonleaf Charm':  { type: 'accessory', hp: 15, regen: 3, desc: 'Max HP +15. Restores 3 HP per turn in battle.' },

  // key items & materials
  'Mister Buttons':  { type: 'key', desc: "Tilly's doll. He has one button eye." },
  'Boar Hide':       { type: 'material', sell: 5, desc: 'Stinky. Pip wants three of these.' },
  'Ember Heart':     { type: 'key', desc: 'The magical flame of the Sky Lantern.' },
};

// Sell price: half the buy price, or an explicit `sell`. Key items and gifts can't be sold.
G.sellPrice = (name) => {
  const it = G.ITEMS[name];
  if (!it || it.type === 'key') return 0;
  if (it.sell) return it.sell;
  return it.price ? Math.floor(it.price / 2) : 0;
};

G.SHOPS = {
  Pip_Shop: {
    title: "Pip's Potions",
    keeper: 'PIP',
    stock: [
      { item: 'Potion' }, { item: 'Ether' }, { item: 'Antidote' },
      { item: 'Hi-Potion', flag: 'gloomcap_defeated' },
      { item: 'Phoenix Feather', flag: 'gloomcap_defeated' },
    ],
  },
  Smithy: {
    title: "Garrow's Smithy",
    keeper: 'GARROW',
    stock: [
      { item: 'Leather Vest' }, { item: 'Chain Mail' }, { item: 'Steel Sword' },
      { item: 'War Hammer' }, { item: 'Moonwood Staff' },
    ],
  },
};
