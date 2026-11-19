// maps.js: areas built on the painted maps in assets/maps/ (rpg_design.md §7).
// All coordinates are game pixels on the processed map image (outdoor maps 688x384, rooms 267x199).
//   blocks  [x,y,w,h]   not walkable (buildings, trees, water, rocks, walls, furniture...)
//   walk    [x,y,w,h]   if present, ONLY these are walkable (minus blocks): used for forests and ruins
//   fg      [x,y,w,h]   parts of the map drawn over characters (roofs, tree tops, towers)
//   water   [x,y,w,h,colour]  gently animated
//   triggers {x,y,w,h, run}  fire when the player's feet step in
//   objects  {x,y,w,h, onTalk, solid, draw}  things to inspect (chests, levers, the stump...)
//   entries  {name: {x,y,dir}} where the player appears
'use strict';
G.MAPS = {};

const LIT = () => G.flag('lantern_lit');
const say = (t) => async () => G.ui.notice(t);
// A treasure chest that remembers it was opened (flag chest_<id>). draw = true draws a small chest sprite.
function chest(id, x, y, w, h, loot, draw) {
  const f = 'chest_' + id;
  return {
    x, y, w, h, solid: true,
    draw: draw ? (ctx) => { const im = G.art.prop('chest', G.flag(f) ? 'open' : 'closed'); ctx.drawImage(im, x + (w - 16) / 2, y + h - 16); } : null,
    onTalk: async () => {
      if (G.flag(f)) { await G.ui.notice('(Empty.)'); return; }
      G.setFlag(f);
      if (loot.gold) { G.S.gold += loot.gold; G.sfx.coin(); await G.ui.notice(`Found ${loot.gold} gold!`); }
      else { G.addItem(loot.item); G.sfx.item(); await G.ui.notice(`Found ${loot.item}!`); }
    },
  };
}
// A painted wooden door for buildings whose art doesn't show one (drawn under the characters).
const door = (x, y, w, h) => ({ x, y, w, h, draw: (ctx) => ctx.drawImage(G.art.door(w, h), x, y) });
const lamp = (x, y, r = 30) => ({ x, y, r, color: 'rgba(255,190,110,0.42)', flicker: 3 });
const fire = (x, y, r = 34) => ({ x, y, r, color: 'rgba(255,140,50,0.5)', flicker: 7 });

// ------------------------------------------------------------ Willowmere Village
G.MAPS.village = () => ({
  id: 'village', name: 'Willowmere Village', w: 688, h: 384,
  image: G.ART.map('map_village'),
  imageLit: { src: G.ART.map('map_village_lit'), when: LIT },   // warm, golden version after the ending
  tint: () => (LIT() ? '#fff0d8' : '#8b93bd'),
  particles: 'dust',
  blocks: [
    [0, 0, 345, 40], [400, 0, 288, 30], [0, 40, 64, 180], [0, 220, 20, 90], [64, 40, 150, 40], [180, 40, 34, 20],
    [320, 30, 25, 50], [415, 20, 60, 72], [470, 0, 40, 20], [640, 20, 48, 96], [600, 96, 88, 26],
    [52, 138, 142, 60], [192, 108, 22, 26], [192, 146, 20, 32], [34, 162, 18, 20],      // forge, barrel, workbench
    [212, 86, 108, 50], [234, 184, 12, 12], [352, 150, 12, 12],                          // Hesta's house, lamps
    [480, 160, 208, 66], [462, 196, 18, 22], [538, 216, 52, 22], [556, 92, 86, 30],      // potion shop, rocks
    [336, 232, 42, 32], [22, 292, 130, 92], [0, 300, 22, 84],                            // well, pond
    [180, 280, 122, 104], [310, 346, 14, 14], [404, 296, 134, 80], [372, 346, 14, 14],   // cottages, lamps
    [584, 318, 20, 28], [598, 280, 90, 90],                                              // pump, Rowan's house
    [504, 270, 38, 24], [578, 270, 20, 24], [664, 204, 24, 20],                          // fences
  ],
  dynamic: [{ x: 470, y: 70, w: 90, h: 40, when: () => !G.flag('morvane_defeated') }],  // Lantern Hill path
  fg: [   // traced roof outlines (forge, Hesta, two cottages), rectangles where the roof is square
    { poly: [[124, 74], [134, 74], [156, 88], [194, 94], [194, 142], [66, 142], [66, 96], [104, 92]] },
    { poly: [[258, 0], [278, 0], [324, 52], [324, 88], [208, 88], [208, 52]] },
    { poly: [[230, 216], [236, 216], [276, 258], [276, 288], [190, 288], [190, 256], [200, 246], [202, 228], [220, 228], [224, 222]] },
    { poly: [[472, 246], [482, 246], [520, 286], [520, 300], [418, 300], [418, 294], [436, 284]] },
    { poly: [[480, 112], [602, 112], [640, 148], [640, 166], [480, 166]] },   // potion shop + lean-to
    [598, 250, 90, 46], [336, 196, 42, 34],
  ],
  water: [[24, 296, 124, 86, 'rgba(225,245,255,0.25)']],
  lights: [lamp(240, 152), lamp(356, 104), lamp(478, 292), lamp(378, 300), lamp(566, 302),
    { x: 344, y: 34, r: 90, color: 'rgba(255,200,120,0.35)', when: LIT }],
  npcs: [
    { id: 'TILLY', sprite: 'tilly', x: 322, y: 268, dir: 'down', scene: 'Tilly_Doll' },
    { id: 'VILLAGER_A', sprite: 'villager_a', x: 120, y: 272, dir: 'down', scene: 'Villager_Lines', only: 'VILLAGER_A', idle: true },
    { id: 'VILLAGER_B', sprite: 'villager_b', x: 618, y: 262, dir: 'down', scene: 'Villager_Lines', only: 'VILLAGER_B', idle: true },
  ],
  objects: [
    door(124, 166, 28, 32),    // smithy door (over the forge opening, where the stone path leads)
    // Rowan's front: the map cuts his cottage off at the edge, so the right end is redrawn
    // as a tidy timber-framed wall with a proper doorway
    { x: 646, y: 312, w: 42, h: 64, draw: (ctx) => { ctx.drawImage(G.art.cottagePanel(14, 64), 646, 312); ctx.drawImage(G.art.cottageDoorWall(28, 64), 660, 312); } },
    { x: 470, y: 70, w: 90, h: 40, onTalk: say("(Hesta's guard fence. The path up Lantern Hill is closed until the Ember Heart comes home.)"), show: () => !G.flag('morvane_defeated'),
      draw: (ctx) => ctx.drawImage(G.art.barrier(58, 16), 468, 94) },   // visible fence across the path; gone after Morvane
    { x: 336, y: 232, w: 42, h: 32, onTalk: say('(The old well. The water looks very dark today.)') },
    // the two cottages nobody visits in the story
    { x: 196, y: 326, w: 76, h: 14, onTalk: say("(Locked. Someone inside is humming nervously.)") },
    { x: 420, y: 362, w: 112, h: 14, onTalk: say('(Locked. A cow moos from somewhere behind it.)') },
  ],
  triggers: [
    { x: 345, y: 0, w: 55, h: 8, run: async (W) => {   // path at top centre -> Whisperwood
        if (!G.flag('brann_joined')) { await G.runScene('Village_Exit_Block'); await W.forceStep('down', 16); return; }
        await W.changeMap('forest', 'south');
      } },
    { x: 256, y: 134, w: 24, h: 10, run: (W) => W.changeMap('hesta_hut', 'door') },         // blue door
    { x: 662, y: 370, w: 26, h: 14, run: (W) => W.changeMap('rowan_house', 'door') },        // Rowan's cottage
    { x: 500, y: 226, w: 28, h: 10, run: (W) => W.changeMap('pip_shop', 'door') },     // potion shop door
    { x: 128, y: 196, w: 44, h: 12, run: (W) => W.changeMap('smithy', 'door') },       // forge
    { x: 470, y: 104, w: 90, h: 10, run: async () => {   // Lantern Hill, after Morvane
        if (G.flag('morvane_defeated') && G.count('Ember Heart') > 0 && !LIT()) await G.runScene('Lantern_Relit');
      } },
  ],
  entries: {
    north: { x: 372, y: 16, dir: 'down' }, hesta: { x: 268, y: 152, dir: 'down' },
    forge: { x: 150, y: 218, dir: 'down' }, shop: { x: 514, y: 244, dir: 'down' },
    rowan: { x: 675, y: 380, dir: 'left' }, start: { x: 675, y: 380, dir: 'left' },
  },
});

// ------------------------------------------------------------ Whisperwood Forest
G.MAPS.forest = () => ({
  id: 'forest', name: 'Whisperwood Forest', w: 688, h: 384,
  image: G.ART.map('map_forest'),
  battles: 'forest',
  tint: () => (LIT() ? '#d8e0d0' : '#98a0c4'),
  particles: 'wisps',
  walk: [
    [326, 0, 44, 384],                       // main path, bottom to the glade
    [0, 222, 330, 46], [30, 200, 200, 26],   // road west and Mira's yard
    [50, 266, 280, 14], [186, 266, 110, 30], // grass beside the pools
    [326, 230, 96, 32],                      // plank bridge (the only way over the river)
    [416, 222, 172, 46], [420, 200, 180, 24], [416, 266, 54, 24],   // east road and the stump
    [282, 70, 50, 152], [290, 0, 80, 96],    // glade
  ],
  blocks: [
    [230, 145, 92, 72], [52, 272, 140, 70], [196, 292, 70, 44], [420, 158, 72, 58], [465, 272, 92, 60],   // purple pools
    [370, 0, 46, 230], [370, 262, 46, 122],                                         // river (bridge stays open)
    [520, 160, 56, 54], [236, 270, 16, 22], [254, 270, 16, 20],                     // stump, barrel, sign
    [282, 0, 46, 66], [290, 60, 18, 14],                                            // giant mushrooms
    [80, 150, 120, 62], [48, 146, 30, 76], [200, 150, 26, 74],                      // cottage and fences
  ],
  dynamic: [{ x: 326, y: 18, w: 44, h: 46, when: () => !G.flag('gloomcap_defeated') }],   // the Gloomcap blocks the path
  fg: [   // pine tops by the road and Mira's thatched roof, traced so the road beside them stays clear
    { poly: [[296, 250], [312, 272], [322, 300], [322, 334], [272, 334], [272, 300], [282, 272]] },
    { poly: [[440, 274], [456, 300], [468, 330], [468, 352], [414, 352], [414, 330], [426, 300]] },
    { poly: [[134, 88], [142, 88], [198, 140], [198, 164], [80, 164], [80, 140]] },
  ],
  water: [[372, 0, 42, 384, 'rgba(200,230,255,0.2)'], [232, 148, 88, 66, 'rgba(200,140,255,0.16)'], [54, 276, 136, 64, 'rgba(200,140,255,0.16)'],
    [198, 296, 66, 38, 'rgba(200,140,255,0.16)'], [422, 162, 68, 52, 'rgba(200,140,255,0.16)'], [467, 276, 88, 52, 'rgba(200,140,255,0.16)']],
  lights: [{ x: 320, y: 36, r: 64, color: 'rgba(90,230,220,0.35)', flicker: 1.5 }, { x: 110, y: 196, r: 22, color: 'rgba(255,190,110,0.4)' }, { x: 172, y: 196, r: 22, color: 'rgba(255,190,110,0.4)' }],
  safe: (x, y) => x < 240 || y < 100 || y > 350,
  npcs: [
    { id: 'MIRA', sprite: 'mira', x: 168, y: 230, dir: 'down', show: () => !G.flag('mira_joined'), scene: 'Mira_Cottage' },
  ],
  objects: [
    { x: 330, y: 20, w: 36, h: 44, show: () => !G.flag('gloomcap_defeated'), onTalk: say('(The giant mushroom glares at you.)'),
      draw: (ctx, t) => { const im = G.img.get(G.ART.enemies.gloomcap); if (im) { const s = 0.5, w = im.width * s, h = im.height * s; ctx.drawImage(im, 348 - w / 2, 64 - h + Math.sin(t * 2) * 1, w, h); } } },
    { x: 522, y: 162, w: 52, h: 52, onTalk: async () => {
        if (G.flag('doll_quest_started') && !G.flag('doll_found')) await G.runScene('Doll_Found');
        else await G.ui.notice(G.flag('doll_found') ? '(An empty hollow stump.)' : '(An old hollow stump. It smells of moss.)');
      } },
    chest('forest_potion', 594, 228, 16, 12, { item: 'Potion' }, true),
    chest('forest_ether', 440, 268, 16, 12, { item: 'Ether' }, true),
    chest('forest_gold', 196, 266, 16, 12, { gold: 30 }, true),
  ],
  triggers: [
    { x: 326, y: 378, w: 44, h: 6, run: (W) => W.changeMap('village', 'north') },
    { x: 326, y: 0, w: 44, h: 6, run: (W) => W.changeMap('ruins', 'south') },
    { x: 128, y: 206, w: 24, h: 8, run: (W) => W.changeMap('mira_cottage', 'door') },
    { x: 196, y: 222, w: 10, h: 46, run: async () => { if (!G.flag('mira_joined')) await G.runScene('Mira_Cottage'); } },
    { x: 326, y: 72, w: 44, h: 8, run: async (W) => {
        if (G.flag('gloomcap_defeated')) return;
        if (!G.flag('mira_joined')) {
          await G.ui.notice('(A mushroom the size of a house blocks the path north. You need more help before taking it on.)');
          await W.forceStep('down', 16); return;
        }
        await G.runScene('Gloomcap_Battle');
      } },
  ],
  onEnter: async () => { if (!G.flag('seen_forest')) { G.setFlag('seen_forest'); await G.runScene('Forest_Enter'); } },
  entries: { south: { x: 348, y: 370, dir: 'up' }, north: { x: 348, y: 14, dir: 'down' }, cottage: { x: 140, y: 226, dir: 'down' } },
});

// ------------------------------------------------------------ Ashen Ruins
G.MAPS.ruins = () => ({
  id: 'ruins', name: 'Ashen Ruins', w: 688, h: 384,
  image: G.ART.map('map_ruins'),
  battles: 'ruins',
  tint: () => (G.flag('morvane_defeated') ? '#d6d0d4' : '#9ea4c0'),
  particles: 'ash',
  walk: [[52, 200, 588, 130], [200, 100, 260, 100], [68, 120, 122, 80], [470, 120, 146, 80], [326, 300, 34, 84],
    [186, 172, 18, 28], [456, 176, 24, 24]],   // the open gaps in each side room's inner wall
  blocks: [
    [52, 200, 63, 62], [160, 200, 46, 62], [480, 192, 20, 70], [575, 200, 60, 62],            // room walls
    [228, 112, 18, 30], [275, 135, 16, 30], [410, 70, 16, 50], [410, 130, 16, 36], [420, 140, 40, 26],
    [275, 245, 16, 22], [395, 205, 16, 56], [440, 240, 30, 26], [215, 230, 45, 35], [300, 225, 40, 20],   // pillars, rubble
    [268, 98, 22, 28], [403, 98, 20, 26], [240, 96, 50, 14], [384, 96, 66, 14],              // braziers, towers
    [124, 105, 22, 40], [75, 135, 40, 30], [75, 165, 22, 28],                                 // west room
    [546, 108, 20, 38], [516, 160, 30, 26], [590, 165, 22, 30],                               // east room: lever, rubble pile (left), brazier
    [476, 108, 22, 68],                                                                       // east room's inner wall above its gap
    [332, 108, 24, 24],                                                                       // crystal pedestal
  ],
  fg: [[240, 0, 50, 96], [384, 0, 66, 96], [300, 284, 86, 20]],
  lights: [fire(279, 108), fire(413, 108), fire(85, 176), fire(600, 178), fire(282, 352), fire(402, 360),
    { x: 343, y: 110, r: 40, color: 'rgba(90,170,255,0.5)', flicker: 1.2 },
    { x: 348, y: 70, r: 40, color: 'rgba(255,140,50,0.35)', when: () => !G.flag('morvane_defeated') }],
  safe: (x, y) => y < 140 || y > 340,
  objects: [
    { x: 122, y: 103, w: 26, h: 44, onTalk: () => G.runScene('Lever_West') },
    { x: 544, y: 104, w: 26, h: 44, onTalk: () => G.runScene('Lever_East') },
    chest('ruins_phoenix', 165, 125, 20, 25, { item: 'Phoenix Feather' }),
    chest('ruins_hipotion', 588, 125, 22, 25, { item: 'Hi-Potion' }),
    chest('ruins_ether', 545, 215, 20, 20, { item: 'Ether' }),
    { x: 332, y: 96, w: 24, h: 36, onTalk: () => G.runScene('Save_Point_Ruins') },
  ],
  triggers: [
    { x: 326, y: 378, w: 34, h: 6, run: (W) => W.changeMap('forest', 'north') },
    { x: 300, y: 100, w: 80, h: 6, run: async (W) => {
        if (G.flag('hall_open')) { await W.changeMap('ruins_hall', 'door'); return; }
        await G.ui.notice('(A huge double door, sealed tight. Orange light leaks through the crack.)');
        await W.forceStep('down', 10);
      } },
  ],
  onEnter: async () => { if (!G.flag('seen_ruins')) { G.setFlag('seen_ruins'); await G.runScene('Ruins_Enter'); } },
  entries: { south: { x: 343, y: 368, dir: 'up' }, door: { x: 314, y: 122, dir: 'down' } },
});

// ------------------------------------------------------------ interiors (plain black around each room)
const ROOM_TINT = () => (LIT() ? '#fff4e4' : '#d9d2d6');
G.MAPS.rowan_house = () => ({
  id: 'rowan_house', name: "Rowan's House", w: 267, h: 199, banner: false,
  image: G.ART.map('map_rowan_house'), tint: ROOM_TINT, particles: 'motes',
  walk: [[54, 62, 158, 104], [118, 160, 28, 26]],
  blocks: [[54, 40, 48, 38], [102, 46, 20, 18], [170, 24, 32, 44], [186, 44, 26, 64], [192, 104, 20, 24], [54, 94, 26, 40], [80, 100, 12, 26], [54, 86, 12, 18], [54, 144, 12, 22]],
  lights: [{ x: 68, y: 108, r: 26, color: 'rgba(255,190,110,0.45)', flicker: 6 }, { x: 92, y: 40, r: 36, color: 'rgba(170,200,255,0.25)' }],
  objects: [chest('rowan_potion', 102, 46, 20, 18, { item: 'Potion' })],   // the gold chest
  triggers: [{ x: 118, y: 180, w: 28, h: 6, run: (W) => W.changeMap('village', 'rowan') }],
  entries: { start: { x: 140, y: 100, dir: 'down' }, door: { x: 132, y: 172, dir: 'up' } },
});
G.MAPS.hesta_hut = () => ({
  id: 'hesta_hut', name: "Elder Hesta's Hut", w: 267, h: 199, banner: false,
  image: G.ART.map('map_hesta_hut'), tint: ROOM_TINT, particles: 'motes',
  walk: [[54, 80, 160, 80], [114, 156, 38, 30]],
  blocks: [[112, 18, 46, 66], [52, 30, 32, 64], [84, 58, 36, 44], [54, 84, 18, 16], [154, 54, 12, 30]],
  lights: [{ x: 135, y: 70, r: 56, color: 'rgba(255,140,50,0.5)', flicker: 7 }, { x: 120, y: 50, r: 18, color: 'rgba(255,210,140,0.4)' }],
  npcs: [{ id: 'HESTA', sprite: 'hesta', x: 156, y: 112, dir: 'down', scene: 'Elder_Quest', show: () => !G.flag('morvane_defeated') }],
  triggers: [{ x: 114, y: 180, w: 38, h: 6, run: (W) => W.changeMap('village', 'hesta') }],
  entries: { door: { x: 133, y: 170, dir: 'up' } },
});
G.MAPS.smithy = () => ({
  id: 'smithy', name: "Garrow's Smithy", w: 267, h: 199, banner: false,
  image: G.ART.map('map_smithy'), tint: ROOM_TINT, particles: 'motes',
  walk: [[38, 62, 188, 104], [118, 160, 30, 40]],
  blocks: [[38, 18, 54, 70], [94, 54, 14, 20], [38, 84, 16, 18], [112, 42, 24, 22], [114, 90, 40, 30], [196, 86, 30, 40], [198, 128, 28, 38]],
  lights: [{ x: 64, y: 66, r: 64, color: 'rgba(255,120,40,0.5)', flicker: 6 }, { x: 134, y: 98, r: 20, color: 'rgba(255,90,40,0.45)', flicker: 4 }],
  npcs: [
    { id: 'GARROW', sprite: 'garrow', x: 172, y: 112, dir: 'down', scene: 'Smithy_Brann' },
    { id: 'BRANN', sprite: 'brann', x: 90, y: 132, dir: 'down', scene: 'Smithy_Brann', show: () => !G.flag('brann_joined') },
  ],
  triggers: [{ x: 118, y: 190, w: 30, h: 9, run: (W) => W.changeMap('village', 'forge') }],
  entries: { door: { x: 133, y: 176, dir: 'up' } },
});
G.MAPS.pip_shop = () => ({
  id: 'pip_shop', name: "Pip's Potions", w: 267, h: 199, banner: false,
  image: G.ART.map('map_pip_shop'), tint: ROOM_TINT, particles: 'motes',
  walk: [
    [34, 92, 198, 74], [118, 160, 28, 40],   // shop floor and door
    [52, 56, 28, 40], [66, 48, 120, 20],     // passage past the crates, and behind the counter
    [200, 36, 32, 58],                       // the empty corner right of the counter
  ],
  blocks: [[34, 28, 32, 44], [64, 40, 18, 18], [34, 74, 18, 40], [215, 96, 17, 30], [222, 36, 10, 26]],
  lights: [{ x: 134, y: 52, r: 56, color: 'rgba(255,200,110,0.45)', flicker: 3 }],
  // Pip stands behind his counter; talk to him across it
  npcs: [{ id: 'PIP', sprite: 'pip', x: 140, y: 64, dir: 'down', scene: 'Shop_Pip', reach: 40 }],
  triggers: [{ x: 118, y: 190, w: 28, h: 9, run: (W) => W.changeMap('village', 'shop') }],
  entries: { door: { x: 132, y: 176, dir: 'up' } },
});
G.MAPS.mira_cottage = () => ({
  id: 'mira_cottage', name: "Mira's Cottage", w: 267, h: 199, banner: false,
  image: G.ART.map('map_mira_cottage'), tint: ROOM_TINT, particles: 'motes',
  walk: [[66, 62, 120, 104], [122, 160, 22, 26]],
  blocks: [[116, 24, 30, 44], [58, 84, 56, 24], [68, 106, 14, 16], [92, 104, 22, 20], [148, 28, 40, 38], [102, 148, 20, 18]],
  lights: [{ x: 131, y: 52, r: 50, color: 'rgba(120,255,140,0.4)', flicker: 3 }, { x: 104, y: 92, r: 20, color: 'rgba(255,200,120,0.4)', flicker: 6 }],
  triggers: [{ x: 122, y: 180, w: 22, h: 6, run: (W) => W.changeMap('forest', 'cottage') }],
  entries: { door: { x: 133, y: 172, dir: 'up' } },
});
G.MAPS.ruins_hall = () => ({
  id: 'ruins_hall', name: 'The Inner Hall', w: 400, h: 299,
  image: G.ART.map('map_ruins_hall'), tint: () => '#b8a8c4', particles: 'ash',
  walk: [[82, 92, 218, 188], [182, 276, 34, 24]],
  blocks: [[88, 80, 18, 18], [246, 80, 18, 18], [106, 238, 36, 26], [268, 238, 34, 26], [268, 152, 34, 18]],
  fg: [[150, 0, 100, 40]],
  lights: [fire(96, 90), fire(256, 90), fire(58, 152), fire(312, 152), fire(58, 242), fire(312, 242),
    { x: 200, y: 52, r: 90, color: 'rgba(170,80,255,0.45)', flicker: 1.3, when: () => !G.flag('morvane_defeated') }],
  npcs: [{ id: 'MORVANE', sprite: 'morvane', x: 200, y: 124, dir: 'down', show: () => !G.flag('morvane_defeated') }],
  triggers: [
    { x: 182, y: 292, w: 34, h: 7, run: (W) => W.changeMap('ruins', 'door') },
    { x: 82, y: 200, w: 218, h: 8, run: async () => {
        if (G.flag('morvane_defeated')) return;
        await G.runScene('Morvane_Confront');
        if (G.battle.lastResult === 'win') await G.runScene('Morvane_Defeated');
      } },
  ],
  entries: { door: { x: 198, y: 284, dir: 'up' } },
});
