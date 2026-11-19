# Claude Code Handoff — The Emberless Lantern art update

## 1. Folder setup (do this before sending the prompt)

Put everything in your RPG folder like this. Names must match exactly (all lowercase).

```
your-rpg-folder\
  rpg_design.md
  gemini_prompts.md
  claude_code_handoff.md        ← this file
  assets\
    portraits\          rowan.png, brann.png, mira.png, morvane.png, morvane_hollow.png,
                        hesta.png, garrow.png, pip.png, tilly.png   (high-res, kept as backup)
    portraits_pixel\    rowan_pixel.png, brann_pixel.png, ... tilly_pixel.png   (USED IN GAME)
    backgrounds\        bg_rowan_room.png, bg_pip_shop.png, bg_hesta_hut.png, bg_smithy.png,
                        bg_mira_clearing.png, bg_forest.png, bg_gloomcap_glade.png,
                        bg_ruins_hall.png, bg_lantern_hill_dark.png, bg_lantern_hill_lit.png
    maps\               map_village.png, map_forest.png, map_ruins.png,
                        map_rowan_house.png, map_hesta_hut.png, map_mira_cottage.png,
                        map_ruins_hall.png   (whichever interiors you've made)
    sprites\            rowan_poses.png, brann_poses.png, ... (3 standing poses each)
    enemies\            enemy_shade_wisp.png, enemy_thornback_boar.png, enemy_hollow_wolf.png,
                        enemy_gloomcap_giant.png, enemy_cinder_bat.png, enemy_ash_knight.png,
                        enemy_hollow_shade.png, enemy_morvane.png, enemy_morvane_hollow.png
    icons\              icons_consumables.png, icons_weapons.png, icons_armour.png (or single icon_*.png)
    battle\             battle_forest.png, battle_glade.png, battle_ruins.png, battle_boss_hall.png
    ui\                 ui_menu_bg.png, ui_shop_bg.png  (title_bg / gameover_bg optional, added later)
    old\                the three earlier maps and anything else you replaced
```

Missing a few files is fine. The prompt tells Claude Code to report them and use placeholders.

---

## 2. Prompt to send to Claude Code

Copy everything inside the box:

```
I've generated new art for the game. The design is in rpg_design.md, the art list and file names are in gemini_prompts.md, and the folder layout is in claude_code_handoff.md. Please integrate everything in stages and show me screenshots after each stage.

STAGE 0 — Check and back up
- Compare assets/ against the folder layout in claude_code_handoff.md. List anything missing or misnamed before changing anything.
- Copy all current game art into assets/old/ so nothing is lost.
- Ignore everything in assets/old/ from now on.
- For any missing file, use a clearly marked placeholder and tell me which ones.

STAGE 1 — Clean up all images
- Remove Gemini's sparkle logo from any image corners (crop slightly or cover with matching scenery).
- Remove white backgrounds from portraits, enemies, icons and sprite poses.
- Snap all pixel-art images (portraits_pixel, backgrounds, maps, enemies, icons, battle, ui, sprites) to a clean pixel grid with a limited palette so they look like true pixel art.
- Make all pixel portraits the same height and framing, even if some came out zoomed in more than others.
- Cut the icon sheets into separate 32x32 icons.

STAGE 2 — Dialogue
- When a character speaks, show their portrait from assets/portraits_pixel/ (name_pixel.png) above the dialogue box. Use morvane_hollow_pixel during and after his phase 2.
- Behind the portrait, show the background from assets/backgrounds/ chosen by the scene's LOCATION: Rowan's House → bg_rowan_room, Pip's Shop → bg_pip_shop, Elder's Hut → bg_hesta_hut, Smithy → bg_smithy, Mira's Clearing → bg_mira_clearing, other forest scenes → bg_forest, Gloomcap Glade → bg_gloomcap_glade, Inner Hall → bg_ruins_hall, Lantern Hill → bg_lantern_hill_dark (bg_lantern_hill_lit after the Ember Heart is placed). Other scenes show no background.
- Draw the dialogue box frame, name plate and choice menu in code, in a style that matches the art (dark wood/parchment with gold trim).

STAGE 3 — Maps and movement
- Replace the old tile maps with the images in assets/maps/. Use a scrolling camera zoomed in so the screen shows about a quarter of each outdoor map.
- On every map, mark buildings, trees, water, rocks, walls, pillars, furniture and rubble as non-walkable. Add an overlay so the player walks behind rooftops, tree tops and tall objects.
- Village: gloomy look before the ending, warm gold tint after. Blue-door stone house = Hesta's hut (enter → map_hesta_hut). Bottom-right cottage = Rowan's house and the start point (enter → map_rowan_house). Potion shop door → Pip's shop menu over bg_pip_shop. Forge door → Garrow's smithy menu over bg_smithy. Hill path at top right is blocked until the ending. Path at top centre leads to the forest.
- Forest: enter at the bottom of the main path. Plank bridge is the only way across the river. Purple pools and river are non-walkable. Thatched cottage = Mira's (enter → map_mira_cottage). Hollow stump on the right holds Mister Buttons. Mushroom glade at the top = Gloomcap fight; afterwards open an exit at the top to the ruins.
- Ruins: enter at the bottom gate. Lever in each side room works as in rpg_design.md. Chests next to them = Hi-Potion and Phoenix Feather; the extra chest in the east room = Ether. Blue crystal = save and heal stone. The big double door opens to the inner hall (map_ruins_hall) once both levers are pulled.
- Interiors: plain black around each room, the door gap at the bottom leads back outside. The gold chest in Rowan's house holds a Potion.
- Add atmosphere: soft lighting, drifting particles (dust in the village, purple wisps in the forest, ash in the ruins), gently animated water.

STAGE 4 — Walking sprites
- Each file in assets/sprites/ has 3 standing poses from left to right: facing down, a side view, and facing up. Check which way the side view faces (Rowan's faces left, Brann's faces right) and mirror it to make the other side.
- Straighten any side pose that is mid-step into a neutral stance.
- For each direction, create two stepping frames by moving the legs and arms and adding a 1-pixel bob, keeping the head identical.
- Export 3x4 sheets in RPG Maker order (down, left, right, up), all directions the same height, scaled so a doorway on the maps is about 1.5x the character's height.
- Use them for the player and for NPCs standing in the world. Party members follow the leader.

STAGE 5 — Battles and menus
- Battles: show enemies from assets/enemies/ over the battle backgrounds (battle_forest in the forest, battle_glade for Gloomcap, battle_ruins in the ruins, battle_boss_hall for Morvane). Use enemy_morvane_hollow in his phase 2.
- Inventory, equipment and status menus: ui_menu_bg behind them, with the new 32x32 icons.
- Shops: ui_shop_bg behind the shop menu.
- Title screen: keep the current one for now. Game over: use a darkened bg_lantern_hill_dark until I add gameover_bg.png. Make both easy to swap later.

When everything is done, play through the start of the game yourself and send me screenshots of: the village, a dialogue scene with a portrait, a battle, and the inventory.
```

---

## 3. Later additions

When you make more art, put it in the matching folder and tell Claude Code:

> I've added [file names] to assets/[folder]/. Clean them up the same way as before and swap them in.

Examples: `title_bg.png` / `gameover_bg.png` → `assets/ui/`, more interiors → `assets/maps/`, more sprite poses → `assets/sprites/`.
