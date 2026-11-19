// art.js: where every image file lives. Lists are tried in order and the first file that exists wins,
// so to swap art just drop the new file in place (e.g. assets/ui/title_bg.png) and reload.
// Raw Gemini originals are in assets/source/; tools/process_art.ps1 makes these game-ready copies.
'use strict';
G.ART = {
  screens: {
    title:    ['assets/ui/title_bg.png', 'assets/ui/title_bg_placeholder.png'],
    gameover: ['assets/ui/gameover_bg.png', 'assets/ui/gameover_bg_placeholder.png'],
    menu:     ['assets/ui/ui_menu_bg.png'],                 // behind Items / Skills / Equip / Status
    // PLACEHOLDER until ui_shop_bg.png exists: shops show over their own scene art (bg_pip_shop / bg_smithy)
    shop:     ['assets/ui/ui_shop_bg.png'],
  },
  // battle background per area key (enemies.js: ENCOUNTERS[..].bg and BOSSES[..].bg)
  battle: {
    forest: 'assets/battle/battle_forest.png',
    glade:  'assets/battle/battle_glade.png',
    ruins:  'assets/battle/battle_ruins.png',
    hall:   'assets/battle/battle_boss_hall.png',
  },
  // enemy sprite key (enemies.js `sprite`) -> image
  enemies: {
    wisp:   'assets/enemies/enemy_shade_wisp.png',
    boar:   'assets/enemies/enemy_thornback_boar.png',
    wolf:   'assets/enemies/enemy_hollow_wolf.png',
    bat:    'assets/enemies/enemy_cinder_bat.png',
    knight: 'assets/enemies/enemy_ash_knight.png',
    shade:  'assets/enemies/enemy_hollow_shade.png',
    gloomcap: 'assets/enemies/enemy_gloomcap_giant.png',
    morvane:  'assets/enemies/enemy_morvane.png',
    morvane_hollow: 'assets/enemies/enemy_morvane_hollow.png',
  },
  sprite: (key) => `assets/sprites/${key}_sheet.png`,          // 3x4 walking sheet (tools/process_art.ps1)
  spriteDetail: 2,     // sheets are drawn at 2x detail ($SPRITE_DETAIL in process_art.ps1)
  canvasDetail: 2,     // the game canvas is 2x the 320x240 game resolution so that detail shows
  face: (name) => `assets/portraits_pixel/${name}_face.png`,   // small face crops for menus
  map: (name) => `assets/maps/${name}.png`,
  portrait: (name) => `assets/portraits_pixel/${name}_pixel.png`,   // painted versions: assets/portraits/
  background: (name) => `assets/backgrounds/${name}.png`,
  // item name -> icon: "Smith's Hammer" -> assets/icons/icon_smiths_hammer.png
  icon: (item) => `assets/icons/icon_${item.toLowerCase().replace(/'/g, '').replace(/[^a-z0-9]+/g, '_')}.png`,
};

// Small image loader with a cache. G.img.get(src) returns the loaded <img> or null (not loaded / missing).
G.img = (() => {
  const cache = new Map();
  function load(src) {
    if (!cache.has(src)) {
      const e = { im: new Image(), ok: null };
      e.done = new Promise((res) => {
        e.im.onload = () => { e.ok = true; res(true); };
        e.im.onerror = () => { e.ok = false; res(false); };
      });
      e.im.src = src;
      cache.set(src, e);
    }
    return cache.get(src);
  }
  return {
    load,
    get: (src) => { const e = load(src); return e.ok ? e.im : null; },
    // First source in the list that loads, or null.
    first: async (list) => { for (const s of list) if (await load(s).done) return s; return null; },
  };
})();

// Preload everything used in battles and menus so it's ready when needed.
Object.values(G.ART.battle).forEach(G.img.load);
Object.values(G.ART.enemies).forEach(G.img.load);
Object.values(G.ART.screens).forEach((l) => G.img.first(l));
