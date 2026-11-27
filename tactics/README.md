# Toy Wars

A grid-based tactics game played with plush toys. The phone build is the single file
`index.html`. It is **generated**, so don't edit it by hand: change the files in `src/`
and run

    python3 tactics/tools/build.py

See `MECHANICS.md` for every battle mechanic, where each is used, and the recommended-level line.

## Layout

| Path | What it holds |
| --- | --- |
| `src/shell.html` | Page skeleton: battle screen, campaign screens, overlays |
| `src/style.css` | All styling |
| `src/js/05-audio.js` | Music and sound effects, synthesised with Web Audio (no sound files) |
| `src/js/10-data-units.js` | Factions, classes, weapon tiers, characters, plush looks |
| `src/js/20-data-maps.js` | Terrain types and battle maps (8 wide, any height) |
| `src/js/25-data-campaign.js` | Both campaigns: chapters, gates, enemies, story lines, rewards |
| `src/js/26-data-gacha.js` | Recruitment: rarity rates, pity, and each army's banners and pull currency |
| `src/js/27-data-supports.js` | Camp supports: ranks, costs, stat boosts, training, and each pairing's scenes |
| `src/js/30-save.js` | Save data, army records, chapter unlock rules |
| `src/js/35-gacha.js` | Recruitment rules: pulls, duplicates (Bond), trading, releasing |
| `src/js/40-battle.js` | Battle engine: movement, combat, battle scenes, enemy AI, objectives |
| `src/js/45-render.js` | Drawing the quilted map and the tokens |
| `src/js/50-dialogue.js` | Story dialogue and level-up cards |
| `src/js/60-screens.js` | Campaign hub, army roster, battle prep, results |
| `src/js/62-gacha-ui.js` | Recruit tab and the pull reveal |
| `src/js/64-camp.js` | The Camp: supports and training |
| `art/` | Character art, embedded into the page at build time |

## Campaigns, chapters and stages

The Raepublic and the Friggliarchy each have their own army, money and progress, and the
player can switch between them at any time. Each campaign is a list of chapters, and
each chapter holds stages (battles). All of it lives in `src/js/25-data-campaign.js`,
which starts with a guide to every field.

- **Story scenes** are the `pre` and `post` lists on a stage: title cards, backdrops (painted
  ones from `art/bg-<scene>.jpg` where they exist: mine, block, woods, court)
  (`yard`, `mine`, `quarters`, `block`, `woods`, `court`, `ridge`, `legend`), speakers, narration and
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
Duplicate rares raise Bond (small stat boosts). Common and Uncommon soldiers come from a
fixed company per army (two of each generic class at ★, one at ★★, so 15 named soldiers);
a soldier you already have gains a weaker Bond (★ up to 3, ★★ up to 4) and, once maxed,
refunds currency. There's no roster cap as such: it just can't hold more soldiers than the
banners can give. Recruits and spare weapons can be released for a little money (Thread / Crowns), never for pull currency.

## Adding art

Keep full-size PNG sources in `art/`; the build embeds them as WebP, capped at 720px tall
for portraits, 512px for battle sprites and 256px wide for map icons (masks stay lossless).


Drop transparent PNGs into `art/` named `<character>-portrait.png` (front-facing),
`<character>-battle.png` (side-on, facing right) and `<character>-token.png` (the head
icon used on the battle grid), then rebuild.

A character can also have outfits: alternate art named `<character><outfit>-<kind>.png`,
e.g. `raecamp-portrait.png`. A chapter sets who wears what with `outfits: {rae: 'camp'}`;
anything an outfit lacks (Rae's camp outfit has no token) falls back to the default art.
Rae and Little Sister (`sister`, art `sistercamp-*.png`) wear `camp` through Chapter One; Little Sister's `flora` outfit (`sisterflora-*.png`) is ready for Chapter Two, and her map icon (`sister-token.png`) is shared by both outfits. A chapter can rename story-only characters too (`rename: {sister: 'Flopsy Flora'}`). Story-only characters keep their outfit on the save. Rae Chapter Two should set `outfits: {rae: ''}` to put
her in the uniform. Character keys are the
ones in `CHARACTERS` (`rae`, `willow`, `fraggle`, `tiggle`, ...). Anyone without art
uses their drawn plush placeholder.


A second, bulkier mine-rabbit portrait (`art/minerbulk-portrait.png`, keep-mask
`minerbulkmask-portrait.png`) is used by generic rabbits of the classes in `BULKY_CLASSES`
(Diggers and Haulers); their battle sprite and map icon still come from the standard set.
An elderly portrait (`art/minerold-portrait.png`, keep-mask `mineroldmask-portrait.png`)
is used by characters marked `elderly: true` (Old Rabbit) and by about one in three non-bulky generic rabbits.
Every ranged rabbit (any bow-type class) uses the slinger battle pose
(`art/minersling-battle.png`, keep-mask `minerslingmask-battle.png`) in its own coat, so
portrait, battle sprite and icon always match. A character can be held to the first
generic look with `generic: 'standard'` (Tall Rabbit).

### Art still to come (Chapter Four)

Placeholders until their art arrives (each picks it up automatically once the files are in `art/`):

- **Characters** (`<key>-portrait.png`, `-battle.png`, `-token.png`): `princess` (Princess, a pink frog, tome). Ducky and Tilly have their art.
- **Pirates**: done. ★ pirate fish (`art/fish*-*.png`) and ★★ / named pirate sharks (`art/shark*-*.png`), each
  recoloured from their `*skin` masks.
- **Scene paintings**: done (`art/bg-shore.jpg`, `bg-arena.jpg`, `bg-ships.jpg`).

### Generic frog soldiers

`art/grunt-portrait.png`, `grunt-battle.png` and `grunt-token.png` are the shared art for
every frog without art of their own. Only the head is recoloured, into the skin colours in
`SKINS` (`src/js/10-data-units.js`); `art/gruntskin-*.png` marks the head (opaque = recolour),
so the armour, cloak, plume and banner stay as drawn. Characters can pick a colour with
`fur: 'olive'`; others get one from their id. ★★ (elite) frog soldiers wear red: the green
armour, cloak, plume and banner marked in `art/gruntarmour-*.png` and `gruntbowarmour-battle.png`
are turned red at load, before the skin colours.

### Generic mine rabbits

`art/miner-portrait.png`, `miner-battle.png` and `miner-token.png` are the shared art for
every rabbit without art of their own: recruits, enemy rabbits, and named characters who
are still waiting for art. At load the game recolours the fur into each coat in `FURS`
(`src/js/10-data-units.js`), keeping the loincloth, rope, ear linings, nose and eyes as drawn: those are marked in
`art/minermask-portrait.png`, `-battle.png` and `-token.png` (opaque = keep). How the
masks were made is recorded in `tools/miner-art/`; if the generic art is replaced, they
need redoing. A character can pick a coat with `fur: 'grey'`;
generic rabbits get one from their id, so each keeps the same coat. Once a character has
their own art, it replaces the generic art automatically.

## Playing on a phone (installable web app)

`python3 tactics/tools/build.py` writes two things:

- `tactics/index.html`: the whole game in one file (what the Claude artifact shows).
- `tactics/web/`: the same game as an installable web app, ready to put on any static website (GitHub Pages,
  Netlify, Cloudflare Pages). Upload the whole folder. It holds `index.html`, `manifest.webmanifest` (name, icon,
  full-screen), `icon-192.png` / `icon-512.png` (Rae's face, from `art/rae-token.png`), `sw.js` (keeps a copy for playing offline)
  and `version.json` (the newest build id).

It's published at **https://georgefseager-pixel.github.io/rae-rabbit/toy-wars/**, alongside the earlier Rae platformer
(which is the repository's main Pages site, served from the root of `main`). To publish an update, copy
`tactics/web/*` into the `toy-wars/` folder on `main` and push; GitHub Pages republishes `main` within a minute or two.
The app icon is Rae's face, made from `art/rae-token.png`.

On Android, open the site in Chrome and choose "Install app" (or "Add to Home screen"). To publish an update, rebuild
and upload `tactics/web/` again: the installed game checks `version.json` when it opens and shows "A new version is
ready. Tap to update." The save stays on the phone (and the game asks the browser to keep it safe); the title screen
has three save slots, and Back up / Restore for the last-played slot, which also moves a save between devices or websites. Keep the site's address the
same: saves belong to the address.
