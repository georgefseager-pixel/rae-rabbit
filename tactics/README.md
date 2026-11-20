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
| `src/js/26-data-gacha.js` | Recruitment: rarity rates, pity, and each army's banners and pull currency |
| `src/js/30-save.js` | Save data, army records, chapter unlock rules |
| `src/js/35-gacha.js` | Recruitment rules: pulls, duplicates (Bond), trading, releasing |
| `src/js/40-battle.js` | Battle engine: movement, combat, battle scenes, enemy AI, objectives |
| `src/js/45-render.js` | Drawing the quilted map and the tokens |
| `src/js/50-dialogue.js` | Story dialogue and level-up cards |
| `src/js/60-screens.js` | Campaign hub, army and armoury, battle prep, results |
| `src/js/62-gacha-ui.js` | Recruit tab and the pull reveal |
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

Chapter One of each side is written and the two lock together at the mines: Rae's
assault on Rhubarb's Tower (R1-4) waits for Tiggle Taggle's army to reach the ridge
(F1-3), and Tiggle's recapture of the mines (F1-4) waits for Rae's escape (R1-4).

## Recruitment (gacha)

Each army recruits from its own banners with its own pull currency: the rabbits spend
Whispers, the frogs spend Writs. Both are earned by clearing stages (`reward.tokens`,
5 by default) or traded for money in the Recruit tab. Banners are listed per army in
`GACHA_ARMY`; a banner with `after: 'R1-2'` opens once that stage is cleared, and
`featured` units get a rate-up. Common and Uncommon pulls are generic soldiers; Rare
pulls are the `stars: 3` characters in `CHARACTERS`, which are all placeholders for now.
Duplicate rares raise Bond (small stat boosts). Recruits can be released for currency.

## Adding art

Drop transparent PNGs into `art/` named `<character>-portrait.png` (front-facing) and
`<character>-battle.png` (side-on, facing right), then rebuild. Character keys are the
ones in `CHARACTERS` (`rae`, `willow`, `fraggle`, `tiggle`, ...). Anyone without art
uses their drawn plush placeholder.
