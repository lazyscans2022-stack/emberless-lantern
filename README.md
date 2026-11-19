# The Emberless Lantern

A short turn-based fantasy RPG that runs in the browser. For three hundred years the Sky Lantern has kept the shadowy Hollow away from the village of Willowmere. One morning it goes dark: its Ember Heart has been stolen. Rowan, Brann and Mira follow the thief through Whisperwood Forest to the Ashen Ruins to bring it back.

About 30 minutes long, with three areas, three party members, a mini-boss, a final boss and two endings.

## Play

- **Online:** open the GitHub Pages link for this repository.
- **On your computer:** download the repository and double-click `index.html`. No install needed.

## Controls

| Key | Action |
|---|---|
| Arrow keys / WASD | Move |
| Z / Enter / Space | Talk, inspect, confirm |
| X / Esc | Open the menu, go back |

The game needs a keyboard; there are no touch controls yet.

## Project layout

| Path | What's there |
|---|---|
| `index.html` | The game |
| `js/` | Engine: world, battles, dialogue, menus |
| `js/data/` | Game content: scripts, maps, items, characters, enemies, art paths |
| `css/` | Interface styles |
| `assets/` | Processed art (maps, sprites, portraits, backgrounds, enemies, icons) |
| `tools/` | Scripts that turn raw art into game-ready pixel art (Windows PowerShell) |
| `rpg_design.md` | Story, characters, dialogue and balance |

## Credits

Story, design and art direction by the author. Art generated with Gemini and processed into pixel art with the scripts in `tools/`. Code written with Claude Code.
