# Raepublic

A grid-based tactics game played with plush toys. The phone build is the single file
`index.html`. It is **generated**, so don't edit it by hand: change the files in `src/`
and run

    python3 tactics/tools/build.py

## Layout

| Path | What it holds |
| --- | --- |
| `src/shell.html` | Page skeleton: battle screen, campaign screens, overlays |
| `src/style.css` | All styling |
| `src/js/10-data-units.js` | Factions, classes, weapon tiers, characters, plush looks |
| `src/js/20-data-maps.js` | Terrain types and battle maps (8 wide, any height) |
| `src/js/25-data-campaign.js` | Both campaigns: chapters, gates, enemies, story lines, rewards |
| `src/js/30-save.js` | Save data, army records, recruits, chapter unlock rules |
| `src/js/40-battle.js` | Battle engine: movement, combat, battle scenes, enemy AI, objectives |
| `src/js/45-render.js` | Drawing the quilted map and the tokens |
| `src/js/50-dialogue.js` | Story dialogue and level-up cards |
| `src/js/60-screens.js` | Campaign hub, army and armoury, battle prep, results |
| `art/` | Character art, embedded into the page at build time |

## Campaigns, chapters and stages

The Raepublic and the Friggliarchy each have their own army, money and progress, and the
player can switch between them at any time. Each campaign is a list of chapters, and
each chapter holds stages (battles). All of it lives in `src/js/25-data-campaign.js`,
which starts with a guide to every field.

- **Story scenes** are the `pre` and `post` lists on a stage: title cards, backdrops
  (`yard`, `mine`, `quarters`, `gallows`, `woods`, `legend`), speakers, narration and
  inner thoughts. A speaker's name comes from the army roster, so when `rename` turns
  Rabbit into Rae Rabbit, every later scene uses the new name.
- **Convergence gates**: `requires: ['F1-2']` makes a stage (or a whole stub chapter)
  wait for a stage in the *other* campaign.
- **Shared flags**: rewards and bonus objectives can set flags, and either campaign's
  enemies, reinforcements or lines (`if: 'flag'`) can react to them.

The Friggliarchy side currently has two story-free placeholder battles, and the gate on
Raepublic Chapter Two points at them only to show how the link works.

## Adding art

Drop transparent PNGs into `art/` named `<character>-portrait.png` (front-facing) and
`<character>-battle.png` (side-on, facing right), then rebuild. Character keys are the
ones in `CHARACTERS` (`rae`, `willow`, `fraggle`, `tiggle`, ...). Anyone without art
uses their drawn plush placeholder.
