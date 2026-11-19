# Gemini Image Prompts — The Emberless Lantern

Paste one prompt at a time into Gemini. Use **the same style block every time** so all images look like one game.

**Tips**
- Generate Rowan first. When you have a portrait you like, **upload it with every later portrait prompt** and add: *"Match the art style of the attached image exactly."*
- For a character's second image (expressions, Morvane's Hollow form), upload that character's first image and add: *"Same character, same outfit, same art style."*
- Save files with these names so Claude Code can wire them in automatically: `rowan.png`, `bg_pip_shop.png`, etc.
- Gemini makes "pixel-look" images, not true pixel art. Claude Code will snap the backgrounds to a clean pixel grid afterwards.
- Don't paste the file name (like `rowan.png`) into the prompt. It's only for saving.
- Leave Gemini's style presets (Light beams, Soft portrait and so on) unselected.

## Aspect ratio for every image

Set this in Gemini's **Aspect ratio** menu before sending each prompt.

| Part | Images | Aspect ratio |
|---|---|---|
| 1. Character portraits | rowan, brann, mira, morvane, morvane_hollow, hesta, garrow, pip, tilly (and any extra expressions) | **3:4** |
| 2. Dialogue backgrounds | all `bg_...` images | **16:9** |
| 3. Outdoor maps | map_village, map_village_lit, map_forest, map_ruins | **16:9** |
| 3. Indoor maps | map_rowan_house, map_hesta_hut, map_pip_shop, map_smithy, map_mira_cottage, map_ruins_hall | **4:3** |
| 3b. Walking sprite sheets | all `sprite_...` images | **1:1** |
| 4. Enemies | all `enemy_...` images | **1:1** |
| 5. Item icons | icon sheets (Option A) | **16:9** |
| 5. Item icons | single icons (Option B) | **1:1** |
| 6. Battle backgrounds | all `battle_...` images | **16:9** |
| 7. Menu and title screens | ui_menu_bg, ui_shop_bg, title_bg, gameover_bg | **16:9** |

---

## Part 1: Character portraits (high-resolution) · aspect ratio 3:4

**Style block (put at the start of every portrait prompt):**
> High-resolution anime-style JRPG dialogue portrait, waist-up bust, character facing slightly to the left, clean line art, soft cel shading, warm fantasy colours, plain pure white background, no text, no frame, single character only.

| File | Prompt (after the style block) |
|---|---|
| `rowan.png` | A kind young man, a farmhand turned hero. Messy brown hair, green eyes, green tunic with brown leather belt, bright red scarf around his neck. Slightly nervous but determined smile. Holding the hilt of an old iron sword at his side. |
| `brann.png` | A big, broad, cheerful young man, a blacksmith's son. Short red hair, short thick red beard, freckles, huge grin. Leather apron over a chainmail shirt, carrying a heavy smith's hammer on his shoulder. |
| `mira.png` | A clever young woman herbalist. Long silver-white hair in a single braid over her shoulder, blue eyes, one eyebrow raised in a sarcastic smirk. Dark green hooded cloak with a gold clasp, small satchel of herbs, wooden staff topped with a glowing green crystal. |
| `morvane.png` | A tall, thin, tired man in his thirties, the villain. Pale face, dark hair, sad and bitter eyes with dark circles. Grey hooded robe with torn gold trim. His hands glow orange like burning coals. Quiet, sorrowful expression, not cruel. |
| `morvane_hollow.png` | *(Upload morvane.png)* Same character, same pose and art style, now corrupted by shadow magic: robe turned black, trim glowing purple, eyes glowing purple, faint purple cracks on his skin, purple shadow mist around his hands. Angry, desperate expression. |
| `hesta.png` | A wise, kind old woman, village elder. White hair in a neat bun, gentle wrinkled face, soft blue eyes. Blue woollen shawl over a lavender dress, holding a wooden walking stick. Calm, warm smile with a hint of sadness. |
| `garrow.png` | A gruff, muscular older blacksmith. Bald head, grey beard, thick arms, soot smudges on his face. Leather work apron over a rolled-up shirt. Stern frown but caring eyes, arms crossed. |
| `pip.png` | A short, round, cheerful shopkeeper. Short brown hair parted to the side, round spectacles, rosy cheeks, big friendly grin. Bright yellow vest over a white shirt, holding a small potion bottle up proudly. |
| `tilly.png` | A small village girl. Orange-brown hair in two pigtails with pink ribbons, big blue eyes, pink dress with a white collar. Sad expression with a small tear, hugging nothing (her doll is lost). Cute, wholesome, child-friendly. |

**Optional extra expressions** (upload the character's portrait first): *"Same character, same outfit, same art style, now [happy / surprised / angry / sad]."* Save as `rowan_happy.png` etc.

---

## Part 2: Dialogue backgrounds (pixel art) · aspect ratio 16:9

**Style block (put at the start of every background prompt):**
> 16-bit pixel art scene in the style of a classic SNES-era JRPG, detailed and rich, limited colour palette, crisp visible pixels, 16:9 wide format, front-facing interior/exterior view like a stage backdrop, no characters, no people, no text, no UI.

| File | Prompt (after the style block) |
|---|---|
| `bg_rowan_room.png` | A small cosy wooden bedroom in a farming village, early gloomy morning. Single bed with a green blanket, small table with a lit candle, a shelf of books, a rug. Through the window: a grey-blue sky and a dark hill with an unlit lantern tower on top. Mood: quiet and uneasy. |
| `bg_pip_shop.png` | A cosy fantasy potion shop interior. Brick walls, wooden shelves crowded with colourful potion bottles, a framed flower painting, a hanging warm lamp, a sunny window with curtains and flowers. A wooden counter in the foreground with brass scales, herb bundles and a pile of gold coins. |
| `bg_hesta_hut.png` | The interior of a village elder's stone cottage at dusk. A crackling fireplace in the centre, a mantel with candles and a small model of a lantern tower, a tall bookcase, dried herbs hanging from a beam, a window with blue curtains, a round blue rug, a walking stick leaning by the fire. Warm firelight. |
| `bg_smithy.png` | A village blacksmith's forge interior. Stone walls, a glowing forge with orange coals and a chimney hood, an anvil with a red-hot blade on it, a rack of swords and hammers, a round shield on the wall, a water barrel, tongs. Strong orange firelight, smoky atmosphere. |
| `bg_mira_clearing.png` | A small thatched-roof herbalist's cottage in a forest clearing at twilight. Round wooden door, warm glowing windows, a chimney, rows of herbs and flowers in a garden, a wooden fence, tall pine trees behind. Creeping purple shadow patches on the grass and a few floating purple wisps. |
| `bg_forest.png` | A deep enchanted pine forest path at dusk. Thick tree trunks framing both sides, a winding dirt path into the distance, ferns and small glowing mushrooms, faint light rays through the canopy. Unnatural purple shadow pools on the ground and floating purple wisps. Eerie but beautiful. |
| `bg_gloomcap_glade.png` | A dark forest glade at night filled with purple fog. Giant glowing purple and pink mushrooms, a fairy ring of small mushrooms on the ground, floating glowing spores, dark pine silhouettes behind. An open space in the centre for a monster. Mysterious and slightly ominous. |
| `bg_ruins_hall.png` | The great inner hall of ancient fortress ruins. Grey crumbling stone walls, tall broken pillars, burning braziers on each side, ash and rubble on the floor. In the centre, a huge stone archway containing a swirling purple magical portal with sparkles. Dramatic purple and orange lighting. |
| `bg_lantern_hill_dark.png` | Night view of a grassy hill with a tall stone lantern tower on top, its lamp dark and unlit. A starry night sky with a crescent moon, rolling hills, a tiny farming village with a few lights far below on the left. Purple shadow mist creeping over the grass. Lonely, ominous mood. |
| `bg_lantern_hill_lit.png` | *(Upload bg_lantern_hill_dark.png)* The same scene and composition, but the lantern on top of the tower now blazes with brilliant warm golden light, rays shining out across the valley, the sky turning to a warm sunrise of orange and purple, the village below glowing with lights, the shadows gone. Hopeful, triumphant mood. |

---

## Part 3: Walkable maps · outdoor 16:9 / indoor 4:3 · resolution 2K

These replace the plain tile maps you walk around on. Claude Code marks walls, buildings, water and trees as non-walkable afterwards.

**How to use this part**
1. `map_village.png` is the **master reference**. For **every other map**, attach `map_village.png` (and any extra image listed) before sending.
2. Paste the **style block**, then the map's prompt from the tables below, as one message.
3. Set the aspect ratio (16:9 outdoor, 4:3 indoor) and resolution **2K**.

**Style block (put at the start of every map prompt):**
> Top-down 2D RPG map in rich, detailed modern pixel art, like a polished RPG Maker MZ town, viewed straight on from above at a 3/4 angle (not isometric, not diagonal), warm atmospheric lighting with soft shadows, textured cobblestone, grass and wood, lots of small props (barrels, crates, flower boxes, lamp posts, signs), crisp pixels, consistent scale where a doorway is about one and a half times the height of a person, all paths and doorways wide, paths only turn at right angles, no characters, no people, no animals, no text, no UI.

**Reference line (add after the style block for every map except the village):**
> Match the camera angle, scale, art style and level of detail of the attached village map exactly: straight top-down 3/4 view, same size of doors, trees, walls and props.

### Outdoor maps (16:9)

| File | Attach | Prompt (after style block + reference line) |
|---|---|---|
| `map_village.png` | — | A cosy farming village under a gloomy grey-blue misty morning tint. Dirt and cobblestone paths, a town square with a stone well in the centre, the elder's stone hut with a blue door at the top centre, a potion shop with a bottle sign on the right of the square, a blacksmith's forge with an anvil and glowing chimney on the left, three more cottages with flower boxes, a small pond with reeds at the bottom left, wooden fences, lamp posts, a path leading up a hill at the top right, and an exit path at the top leading into a forest. *(Done ✓)* |
| `map_village_lit.png` | map_village.png | The exact same map and layout, every building and prop in the same place, but in warm golden sunrise light with brighter, more saturated colours, the mist gone, and soft glowing light falling from the top right where the lantern hill is. |
| `map_forest.png` | map_village.png | Same misty green palette as the attached map but darker and gloomier. A dense pine forest. A wide dirt path, at least as wide as the village paths, entering from the bottom centre and running mostly straight up to a glade with giant glowing purple and blue mushrooms at the top. Halfway up, the path crosses a stream on a straight wooden plank bridge running north to south. A side path goes left to a small thatched cottage with an herb garden and a fence, and another side path goes right to an old hollow tree stump at a dead end. Ferns, rocks, small mushrooms, and creeping purple shadow pools on the ground. |
| `map_ruins.png` | map_village.png | Ancient crumbling fortress ruins at dusk, grey stone and ash, a cold blue-grey palette with warm orange light from braziers. A broken stone gate at the bottom centre, with a wide path leading up into a large central courtyard of cracked flagstones covered in ash and rubble. On the left, a west wing: a ruined stone room open to the courtyard with an old iron lever on its back wall and a small wooden chest. On the right, an east wing that mirrors it, with a lever and a chest. At the top centre, a large sealed stone double door set into a tall wall, with a glowing blue save stone on a small pedestal in front of it. Broken pillars, fallen blocks, braziers with orange fire, and creeping purple shadow patches on the ground. |

### Indoor maps (4:3)

**Indoor line (add after the reference line for every indoor map):**
> A strict RPG Maker MZ tile-style interior: orthographic, no vanishing point, every object drawn from exactly the same front-top angle so you see its top and front only, never its sides. Everything aligned to a square 48×48 tile grid. The top wall is a short band only 2 tiles tall. The left and right walls are thin flat strips seen from above, with no thickness or shading. A compact, cosy room with furniture lined up neatly against the walls on the grid, at the same scale as the attached village map. Horizontal floor planks or flat stone tiles with even lighting, no gradient. The room is one rectangle surrounded by plain black, with a door gap in the middle of the bottom wall. Lots of small cosy details, with clear walkways between the furniture.

| File | Attach | Prompt (after style block + reference line + indoor line) |
|---|---|---|
| `map_rowan_house.png` | map_village.png | A small, cosy wooden farmhouse. Wooden plank walls with a small window on the top wall letting in grey-blue morning light. A single bed with a green blanket and white pillow in the top left, a bookshelf with a few books in the top right, a wood stove with a pipe against the right wall, a small wooden table with one chair and a lit candle on the left, a round red woven rug in the centre. Wide plank floor. Warm candle glow mixed with cool morning light. |
| `map_hesta_hut.png` | map_village.png | An old village elder's stone cottage at dusk. Grey stone walls. A crackling fireplace in the centre of the top wall, with a mantel holding candles and a small model of a lantern tower. A tall bookcase in the top left, bundles of dried herbs hanging along the top wall, a cushioned armchair beside the fire, a round blue rug in the centre, a small window with blue curtains in the top right, a walking stick leaning by the fireplace. Stone and wood floor. Warm orange firelight. |
| `map_pip_shop.png` | map_village.png | A cosy potion shop. Brick walls. A long wooden counter across the upper middle with brass scales, herb bundles and a pile of gold coins on it, and shelves crowded with colourful potion bottles along the top wall behind the counter. Barrels and crates in the corners, a small display table of potions near the left wall, a hanging warm lamp, a window with flowers in the top right. Wooden floor. Warm, inviting light. |
| `map_smithy.png` | map_village.png | A blacksmith's forge. Stone walls. A large glowing forge with orange coals and a chimney hood in the top left, an anvil with a red-hot blade on it in the middle, a rack of swords and hammers along the top right wall, a water barrel, a workbench with tongs and tools on the right, a round shield hanging on the wall. Stone floor with soot marks. Strong orange firelight. |
| `map_mira_cottage.png` | map_village.png | A small herbalist's cottage. Wooden walls. A bubbling cauldron over a small fire in the top centre, shelves of jars and dried herbs along the top wall, a small bed with a green quilt in the top right, a table with a mortar and pestle and scattered leaves on the left, potted plants everywhere, a round green rug. Wooden floor. Soft green and warm candle light. |
| `map_ruins_hall.png` | map_village.png + map_ruins.png | The great inner hall of the ruins, matching the stone and colours of the attached ruins map. A large stone room with broken pillars down both sides, braziers with orange fire, ash and rubble on the floor. At the top centre, a huge stone archway containing a swirling purple magical portal. Dramatic purple and orange lighting. Lots of open floor in the middle for a boss fight. |

### Quick fixes (reply in the same chat if a map comes out wrong)

| Problem | Reply with |
|---|---|
| Diagonal or isometric angle | *"Redraw it straight top-down like the attached village map, with paths running straight up, down, left and right."* |
| Too cluttered to walk | *"Clear more open floor and widen all paths to at least the width of the village paths."* |
| Wrong scale (everything tiny) | *"Zoom in so doors, trees and props are the same size as in the attached village map. Show less area."* |
| Colours don't match | *"Use the same colour palette and lighting as the attached village map."* |
| Room fills the whole image (indoor) | *"Shrink the room so it is surrounded by plain black, with the door gap at the bottom centre."* |
| Still has perspective, objects angled (indoor) | *"Redraw in strict RPG Maker MZ tile style: orthographic, no vanishing point, every object seen from the same front-top angle (top and front only, never sides), aligned to a 48×48 grid, top wall only 2 tiles tall, side walls as thin flat strips, horizontal floor planks, even lighting."* |
| Dollhouse look, slanted walls (indoor) | *"Redraw as a flat RPG Maker-style interior with no perspective: straight vertical side walls, floor seen directly from above, only the top wall shown as a flat face."* |
| Room too big and empty (indoor) | *"Make the room about half this size so the furniture fills it, make the furniture larger to match the village map, and add more small cosy details."* |

---

## Part 3b: Walking sprites (experimental) · aspect ratio 1:1

Gemini isn't great at animation, but this sometimes works well enough for Claude Code to clean up. If it doesn't, use the fallback at the end.

**Style block:**
> A pixel art RPG character walking sprite sheet in the style of RPG Maker MZ: a 3 by 4 grid, 3 walking frames per row, rows facing down, left, right and up in that order, the same character in every frame with identical size and proportions, small chibi body about 2 heads tall, crisp pixels, dark outline, plain pure white background, evenly spaced cells, no text.

| File | Prompt (after the style block) — upload the matching portrait each time |
|---|---|
| `sprite_rowan.png` | *(Upload rowan.png)* The character in the attached portrait: messy brown hair, green tunic, brown belt, red scarf, sword at his side. |
| `sprite_brann.png` | *(Upload brann.png)* The character in the attached portrait: red hair and beard, leather apron over chainmail, hammer on his back. |
| `sprite_mira.png` | *(Upload mira.png)* The character in the attached portrait: silver braid, dark green cloak, wooden staff. |
| `sprite_hesta.png`, `sprite_garrow.png`, `sprite_pip.png`, `sprite_tilly.png`, `sprite_morvane.png` | Same idea: upload each portrait and describe their outfit in one line. |

**Fallback:** if the sheets come out messy, tell Claude Code: *"Use the closest characters from the free Ninja Adventure pack (or PixelLab if I set it up), recoloured to match each portrait, as the walking sprites."*

---

## Part 4: Enemy battle images (pixel art) · aspect ratio 1:1

**Style block (put at the start of every enemy prompt):**
> 16-bit pixel art enemy battle sprite in the style of a classic SNES-era JRPG, single creature, facing the viewer at a slight angle (3/4 view, turned slightly to the left), full body visible, crisp visible pixels, limited palette, bold dark outline, plain pure white background, no shadow on the ground, no text, no other objects.

**Tip:** generate the Shade Wisp first, then upload it with every later enemy prompt and add *"Match the pixel art style of the attached image exactly."*

| File | Prompt (after the style block) |
|---|---|
| `enemy_shade_wisp.png` | A small floating purple flame spirit with two glowing white eyes and a wispy trailing tail. Mischievous, slightly creepy. Small creature. |
| `enemy_thornback_boar.png` | A stocky brown wild boar with green thorny spikes growing along its back, small tusks, angry red eyes, pawing the ground ready to charge. |
| `enemy_hollow_wolf.png` | A lean wolf made of black shadow, glowing purple eyes, wisps of purple smoke trailing from its fur, snarling with bared fangs. |
| `enemy_gloomcap_giant.png` | A huge grey-purple mushroom monster the size of a house, with an angry face on its stem, stubby legs, white spots on its cap, purple spore clouds puffing from under the cap. Mini-boss, large and imposing. |
| `enemy_cinder_bat.png` | A bat with glowing orange ember wings and a dark body, small flames flickering at the wing tips, sharp little fangs. |
| `enemy_ash_knight.png` | An empty suit of grey ash-covered plate armour with no one inside, a glowing orange slit in the helmet visor, holding a chipped greatsword and a cracked shield. |
| `enemy_hollow_shade.png` | A tall thin shadow-person with no face, long arms, made of black mist with purple edges, a faint purple glow where its heart should be. |
| `enemy_morvane.png` | *(Upload morvane.png)* The same character as the attached portrait, as a full-body pixel art battle sprite: tall thin man in a grey hooded robe with torn gold trim, hands raised glowing with orange fire magic. Boss, larger than normal enemies. |
| `enemy_morvane_hollow.png` | *(Upload enemy_morvane.png)* The same sprite, same pose and style, corrupted by shadow: black robe, purple glowing eyes and trim, purple shadow tendrils rising from his body, hands glowing purple. |

---

## Part 5: Item icons (pixel art) · sheets 16:9, single icons 1:1

**Option A: one sheet at a time (saves your daily image allowance).** Gemini may not keep a perfect grid. If it doesn't, use Option B.

> A 16-bit pixel art icon sheet for a fantasy RPG inventory, arranged in a neat grid of 4 columns and 2 rows with even spacing, each icon centred in its own cell, crisp pixels, limited palette, dark outline, plain pure white background, no text, no labels. The icons are: [list from below]

- **Sheet 1, consumables** (`icons_consumables.png`): red potion in a round glass bottle, large glowing red potion in a fancy bottle, blue mana potion in a tall bottle, green antidote vial, a glowing orange-gold phoenix feather, a small pile of gold coins, a brown boar hide, a small cloth doll with one button eye.
- **Sheet 2, weapons** (`icons_weapons.png`): a wooden practice sword, a plain iron sword, a shiny steel sword with a blue gem in the hilt, a simple blacksmith's hammer, a heavy war hammer, an oak wood staff, a moonwood staff with a glowing white crystal, a glowing orange fiery gem (the Ember Heart).
- **Sheet 3, armour and accessories** (`icons_armour.png`): a plain cloth tunic, a brown leather vest, a chainmail shirt, a silver ring with a small blue gem, a green leaf-shaped charm on a string, a wooden shield, a brown leather boot, a rolled paper scroll.

**Option B: one icon per prompt (most reliable):**
> 16-bit pixel art RPG inventory icon of [item], single object centred, crisp pixels, limited palette, dark outline, plain pure white background, no text.

Name them `icon_potion.png`, `icon_iron_sword.png`, and so on.

**Claude Code instruction for icons:** *"Cut the icon sheets in assets/icons/ into separate icons, remove the white background, resize to 32×32 pixels, and use them in the inventory, shop and equipment menus."*

---

## Part 6: Battle backgrounds (pixel art) · aspect ratio 16:9

Shown behind enemies during fights. They need open ground in the lower middle where enemies stand.

**Style block:**
> 16-bit pixel art JRPG battle background in the style of a classic SNES turn-based RPG, wide view of the ground stretching into the distance with an open flat area in the lower-middle for monsters to stand on, detailed scenery around the edges and in the background, limited palette, crisp pixels, 16:9, no characters, no monsters, no text, no UI.

| File | Prompt (after the style block) |
|---|---|
| `battle_forest.png` | A clearing on a dusky pine forest path, ferns and small mushrooms at the edges, tall trees framing the sides, faint purple shadow pools on the ground and a few floating purple wisps. |
| `battle_glade.png` | A dark forest glade at night with purple fog, giant glowing mushrooms in the background, glowing spores in the air. Ominous mini-boss arena. |
| `battle_ruins.png` | The courtyard of ancient crumbling fortress ruins, grey stone floor covered in ash, broken pillars and fallen rubble at the sides, an orange glow from distant braziers. |
| `battle_boss_hall.png` | *(Upload bg_ruins_hall.png)* The same great ruined hall, seen from the floor level, with the swirling purple portal behind the open fighting area, braziers burning on both sides. Dramatic final boss arena. |

---

## Part 7: Menu and title screens · aspect ratio 16:9

**Inventory / menu background**, `ui_menu_bg.png` (16:9):
> A 16-bit pixel art background texture for a fantasy RPG inventory menu: an aged parchment page laid on dark worn leather, subtle stitching around the edges, faint decorative corner ornaments in gold, mostly plain in the centre so text and icons can sit on top, crisp pixels, limited warm brown and cream palette, no text, no icons, no UI elements.

**Shop screen background**, `ui_shop_bg.png` (16:9):
> *(Upload bg_pip_shop.png)* The same potion shop interior, softly blurred and darkened, so it can sit behind a shop menu. No characters, no text.

**Title screen**, `title_bg.png` (16:9):
> 16-bit pixel art title screen for a fantasy JRPG: a tall stone lantern tower on a grassy hill at night, its lamp glowing with a faint warm ember light, a small farming village below with a few warm windows, a starry sky, a dark forest on one side and distant ruins silhouetted on the other. Leave clear empty sky in the upper half for the game's title. No text.

**Game over screen**, `gameover_bg.png` (16:9):
> 16-bit pixel art game over screen for a fantasy JRPG: the lantern tower on the hill completely dark, the sky black and purple, shadow mist swallowing the village below. Bleak and quiet. Leave empty space in the centre for text. No text.

**Note:** for the dialogue box frame, menu borders, buttons and the game's title text, it's better to let Claude Code draw them in code. They come out with perfectly clean edges and readable text, which Gemini struggles with.

---

## Not covered by Gemini: walking sprites

Gemini can't keep animation frames consistent, so for characters walking around the maps use a sprite pack (Ninja Adventure, free) or a sprite generator like PixelLab, and tell Claude Code to recolour the closest sprites to match each character's colours.

---

## Putting it in the game

1. Portraits → `assets/portraits/`, backgrounds → `assets/backgrounds/`, maps → `assets/maps/`, enemies → `assets/enemies/`, icons → `assets/icons/`, battle backgrounds → `assets/battle/`, menu and title screens → `assets/ui/`, walking sprites → `assets/sprites/`.
2. Tell Claude Code:
   > I've added new art from Gemini. Remove the white background from every portrait, enemy and icon. Resize portraits to fit above the dialogue box, show enemies on the battle screen, and cut the icon sheets into 32×32 icons for the menus. Use the battle backgrounds behind fights in each area (battle_boss_hall for Morvane), ui_menu_bg behind the inventory and equipment menus, ui_shop_bg behind shop menus, title_bg on the title screen with the game's title drawn on top in code, and gameover_bg on the game over screen. Draw the dialogue box frame, menu borders and buttons in code to match. Snap all backgrounds and pixel-art images to a clean pixel grid with a limited palette. Then use them in the game, replacing the old ones.
