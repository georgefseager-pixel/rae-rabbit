# Toy Wars: mechanics and stage-design notes

The working reference for everything a battle can use, and where each thing is already used. Check it when designing a
stage, so that mechanics introduced in one place (especially by Willow's Lessons) turn up again elsewhere. **Update it
whenever a mechanic is added or a stage starts using one.**

Field-level details live in the comments at the top of `src/js/25-data-campaign.js` (stages, scenes, spawns) and
`src/js/28-data-sides.js` (side stories).

## Combat rules

| Rule | Detail |
|---|---|
| Damage | Atk (+ weapon might) + triangle bonus − (Def + terrain Def) |
| Hit | 75 + Skl×2 + weapon hit + triangle×15 − (Spd×2 + terrain avoid) |
| Crit | Skl/2 + weapon crit − enemy Skl/4 |
| Double attack | Spd at least 4 higher than the enemy's |
| Weapon triangle | Sword beats axe, axe beats lance, lance beats sword; tomes beat bows. A win is +1 damage, +15 hit. Shown as a diagram with `{show: 'triangle'}` |
| Ranges | Bows (and whips) 2 only, so no counterattack up close. Tomes 1–2. Staves heal an adjacent ally (8 + Atk/2) and can't attack |
| Experience | Kill: 30 + 3 × level difference (+40 for a boss). Damage without a kill: 10 + level difference. Heal: 12. 100 per level |

## Terrain (same rules on every map; each theme and map just names it differently)

| Letter | Effect | Typical names | Notes |
|---|---|---|---|
| `.` | none | Meadow, Camp Yard, Tunnel Floor | open ground: the dangerous place to stand |
| `F` | +1 Def, +20 avoid, costs 2 | Felt Thicket, Crates, Rubble, Felt Trees, Last Flowers | light cover; mounted units pay 3 |
| `M` | +2 Def, +30 avoid, costs 3 | Pillow Hills, Ore Heap, Spoil Heap, Ridge Rocks, Mossy Rocks, Ravine Wall, Hill Rocks, Heaped Earth | heavy cover ("rocks"). Armoured units can't enter; bog-walkers (frogs: Club Guard, Marsh Lord) pay only 2; mounted can't enter |
| `W` | impassable | Satin River, Flooded Shaft, Drainage Ditch | water: forces fights onto bridges |
| `B` | none | Bridges, Plank Walk, Footbridge | the only way over water: a natural choke point |
| `T` | +2 Def, +20 avoid, heals 20% each phase | Block Fort, Guard Post, Watch Post, Command Tent, Scaffold, Stockade | a fort: whoever is nearest at the start owns it |
| `X` | impassable | Spool Wall, Palisade, Barricade, Rock Wall | walls: with gaps they make choke points |

### Terrain on each map

| Map | Has | Used by |
|---|---|---|
| lowerSeam (mine) | `. F M T X` | R1-1 |
| bunkhouses (camp) | `. F T X` | R1-2 |
| blockYard (camp) | scaffold fort | R1-3 |
| tower (camp) | overseer's tower fort | R1-4, F1-4 |
| outerCamp (camp) | `. F M T X` | F1-2 |
| ridge (meadow) | many `M` rocks, one fort | F1-3, **WL-1** (taught: holding rocks) |
| ford (meadow) | river `W`, two bridges `B`, forts | F1-1, **WL-2** (taught: weapon triangle at the bridges) |
| ravine | walls of `M`, forest | R2-2, F2-2 |
| forestTrail | forest, `M` rocks | R2-2b, FD-2 |
| republicCamp | palisade `X` with two gaps, forts | R2-3, F2-3, **WL-3** (taught: choke points and Danger) |
| thornHill | thicket, `M` rocks, Fraggle's fort | R2-4, F2-3b |
| hollow | roots, rocks | F2-4 |
| riverWoods | forest, rocks, river | R2-1, F2-1, FD-1 |
| flowerField | barricade `X` with two gaps, earth `M`, stockade fort | FD-3 |
| meadowEdge (blossom) | forest edge into flower meadows; exits on the bottom row in R3-1 | R3-1, F3-1 |
| blossomFields (blossom) | blossom trees `F`, hay bales `M`, the bell tower `T` at the top | R3-2, R3-3, F3-2, F3-3 |
| castleGate (castle) | moat `W` and drawbridge `B`, castle wall `X` with a gate gap, gatehouses `T` | R3-4, F3-4 |
| castleHall (castle) | walls down both sides, pillars `M`, throne dais `T`, doors at the bottom | R3-5, F3-5 |
| schismField (blossom) | a stream `W` with two bridges, forts `T` both sides | R3-6, F3-6 |
| snowWoods (snow) | snowy pines `F`, drifts `M`; road exits along the bottom row | XM-R, XM-F (December) |

## Movement types (a class's `mt`)

| Type | Forest `F` | Rocks `M` | Classes |
|---|---|---|---|
| foot | 2 | 3 | most |
| armor | 2 | can't enter | Lily Knight, Armoured Guard |
| bog | 2 | 2 | Club Guard, Marsh Lord (frogs at home in the marsh) |
| climb | 1 | 3 | monkeys: Acrobat, Nut Thrower, Canopy Heir (Speshul). Trees and flowers are open ground to them |
| mounted | 3 | can't enter | Rose Knight (Biggle's attire) |

Mounted units move far on open ground (Rose Knight: Mov 7) but are slowed by forest and blocked by rocks: good on
open maps and bridges (ford, riverWoods), awkward on rocky ones (ridge, thornHill, ravine).

## Attires

An attire can change a character's class (and so weapon, movement and growths) and stats while worn
(`13-data-attires.js`). Story scenes always show the story outfit. Attires come from the story (dialogue `{attire}`)
or from recruiting: a banner's `attires: [ids]` are featured ★★★ results alongside its characters; a duplicate, or
one whose character isn't in the army, becomes a ★★★ weapon instead. A carried weapon the attire's class can't use
waits in the Armoury (the class's basic weapon is used) and comes back when the attire comes off.

| Attire | Character | Change | From |
|---|---|---|---|
| Mine Rags, Camp Rags | Rae, Flopsy Flora | look only | story (R2-1) |
| Rose Knight | Biggle | Lily Knight → Rose Knight (mounted lance): −3 Def, +4 Spd, +1 Skl, +3 Mov | The Black Frog's Son banner |
| Hoppy Xmas | Flopsy Flora | same class and needle: +2 Def, −1 Spd | A Sack Full of Rabbits (December) |
| Gingerbiggle | Biggle | Lily Knight → Gingerbread Knight (sword on foot, Candy Cane Rapier): −5 Def, +5 Spd, +2 Skl, +1 Mov | Gifts for the Capital (December) |

## Unique abilities (`14-data-abilities.js`)

One small, always-on ability per unique character (placeholders have none), shown as an icon on unit cards and in the
battle panel; tap it to read it. An attire that changes class or stats brings its own (`ATTIRES[id].ability`). They
work for any unit with that character's key, enemies included (e.g. the Executioner as a boss), except Light Fingers
and The Lesson, which only help the player.

| Character | Ability | Rule | Stage ideas |
|---|---|---|---|
| Rae | Next to Me | she and an adjacent ally: +1 damage dealt, −1 taken | formations |
| Flopsy Flora | Mended Seams | whoever she mends: +2 Def until her next turn | |
| Flopsy Flora (Hoppy Xmas) | Stocking Filler | whoever she mends gets +3 damage in their next fight (attacking or defending) | |
| Willow | The Lesson | allies within 2 earn +20% EXP | |
| Brigand | Light Fingers | +25 spoils per enemy he defeats | |
| The Condemned | Walked Away | below half HP he strikes first when attacked (Vantage) | |
| Froggle | Draw Back | action: she steps back 1, an adjacent ally takes her square | rescues, escorts |
| Patch | Bait, By Choice | enemies that can reach him target him; −2 damage from the first hit each enemy turn | |
| Tiggle | They Listen | allies within 2: +10 Hit | |
| Biggle | Hold the Line | enemies stop when they reach a square next to him | choke points, bridges |
| Biggle (Rose Knight) | Lance Charge | +3 damage after moving 3+ squares that turn | open maps |
| Biggle (Gingerbiggle) | Can't Catch Me | after moving 3+ squares, enemies get −25 Hit against him until his next turn | open maps, hit-and-run |
| Rhubarb | Keep Them Digging | an enemy she hits moves only 1 square next turn | |
| The Executioner | One Stroke | +25 Crit vs enemies below half HP | |
| Fraggle Jr. | Nobody Comes | no ally within 2: +3 Atk, +3 Spd | flanks |
| Ilc the Scout | Guiding Nose | allies who start their move within 2 squares of him get +1 Mov | escorts, races, long marches |
| Chriggle Chraggle | Naughty List | an enemy he hits is marked (📜 on its token) and takes +2 damage from everyone for the rest of the battle | bosses, tanky foes |

## Unit behaviour (spawn `ai`)

| AI | Behaviour | Good for |
|---|---|---|
| `charge` (default) | heads for the player and attacks | pressure, ambushes |
| `guard` | waits until a player unit comes within its reach, then charges ("Waits for you") | defenders on rocks or forts; lets the player pull enemies out one at a time (**WL-1**, **WL-3**) |
| `hold` | never moves; attacks anything in range | bosses on forts, gate-keepers |
| `courier` (a boss) | as below, but a boss who reaches an exit has got away and the battle is LOST (`escapeFail` explains) | R3-2 (Lookout Pecan runs for the bell) |
| `courier` | never attacks; runs for the nearest of the stage's `exits` and leaves the map there (`escaped`, not a kill). Enemy AI goes for couriers first (+25 target score) | December event (XM-R as enemies, XM-F as allies) |

Spawn extras: `faction` (fight for another side; Monkeyland is its own faction, `monkey`), `defects` (changes sides at a `defect` event), `boss`, `elite` (★★ art and +stats), `flees` (escapes when beaten; "yields" in a training fight),
`talk` (lines the first time it's fought), `vip` (an ally that must survive), `key`, `name`, `look`, `bonus`.

## Stage-level mechanics

| Mechanic | Field | Used by |
|---|---|---|
| Defeat the commander | `objective: {type: 'boss'}` | most stages |
| …within a turn limit | `objective: {type: 'boss', limit: n}` | R1-3, R2-2b |
| Rout | `objective: {type: 'rout'}` | F2-1, F2-4 (after the twist), FD-1 |
| Survive | `objective: {type: 'survive', turns}` | F1-3, R2-1, R2-3 |
| Reinforcements | `reinforce` | R2-1, R2-2, R2-3, F1-3, FD-1, FD-3 |
| Twist (objective changes mid-battle) | `twist` | R2-1 (survive, then rout), F2-4 (duel, then the guard) |
| Solo start, team arrives later | `solo` + `twist: {on: 'boss', arrive: true}` | F2-4 |
| Must-deploy character | `mustDeploy` | F2-4 (Biggle) |
| Allies (act on their own phase) | `allies` | R2-2 (Patch is a `vip`), R2-2b, R2-3, R2-4, F2-2 (Fraggle's guard) |
| A character joins mid-battle | `events: [{turn, join}]` | R2-1 (Willow) |
| Convergence gate | `requires` | R1-4 / F1-4 pair, R2-2 / F2-2, F2-3 / R2-2, F2-3b / R2-4 |
| Someone else leads | `lead` | FD-1, FD-2, FD-3 (Flopsy) |
| Characters kept out | `ban` | WL-* (Willow), FD-* (Rae) |
| Training fight (no permanent losses, the boss yields) | `spar` | WL-1, WL-2, WL-3 |
| Flashback (years ago: only the leader and ordinary soldiers) | `flashback` + `lead` | RH-1–3 (Rhubarb), FJ-1–3 (Fraggle Jr.) |
| Boss surrenders ("Yields!") instead of fleeing | `yields` + a `flees` boss | EX-1, EX-3 |
| Enemies from another side (mixed factions) | spawn `faction` | BR-2 (Magpie's gang with the reeve's frogs) |
| Lone leader (deploy 1) | `maxDeploy: 1` | FJ-1 |
| Twist when the boss falls, bringing more enemies | `twist: {on: 'boss', units}` | RH-3 (the help arrives too late) |
| Captive ally who must survive | `allies` + `vip` (+ `bonus` to keep them alive) | FG-2 (Twelve), BG-3 (Tiggle) |
| Difficulty | `enemyMods` on a chapter or a stage | Ch. 1 (heavy), Ch. 2 (light), R1-3/R1-4/F1-3/F1-4 (eased), side stories `{}` |
| Enemy banner text | `enemyLine` | F2-4, WL-* |
| Prepare-screen note | `prepNote` | F2-4, all side stories |
| Intercept (catch fleeing couriers; over when none are left on the map or still to come) | `objective: {type: 'intercept'}` + `exits` | XM-R |
| Escort (protect couriers until the turn limit, or until they're all delivered or lost) | `objective: {type: 'survive', turns, escort: true}` + `escort: true` + `exits` | XM-F |
| Exit squares (gold, ⬇) where couriers leave | `exits: [[x,y],…]` | XM-R, XM-F, R3-1, R3-2, F3-3, F3-5 |
| Escort outside the event (refugees walk to the exits on their own) | `objective: {type: 'survive', turns, escort: true, who, dest}` + allies with `ai: 'courier', courier: true` | R3-1 |
| Intercept outside the event (no gifts; over when no runner is left) | `objective: {type: 'intercept', who, dest}` + enemy couriers | F3-3 (the grain runners) |
| Escape (win when the leader reaches an exit) | `objective: {type: 'escape', dest}` + `exits` | F3-5 |
| Units change sides mid-battle | `events: [{turn, defect: true, popup, talk}]` + spawns with `defects: true`: enemies become allies, allies become enemies. Happens on replays too | R3-5 (Speshul's guards join you), F3-5 (the hall guard betray Tiggle) |

### Bonus stars (`star.type`)

| Type | Meaning | Used by |
|---|---|---|
| `noLosses` | no player unit unstitched (knocked out, in training) | many |
| `turns` (n) | win by the end of turn n | R1-2, F2-1, WL-1 |
| `unhurt` | the leader is never hit (with `lead`, that leader) | R1-1, F1-3, WL-3 (Rae), FD-2 (Flopsy) |
| `bossBy` (key) | that character lands the blow on the boss | R1-3, R2-4, F1-1, F2-3 |
| `fewer` (n) | deploy at most n | F1-4 |
| `allies` | no ally falls (allies who leave by an exit are safe) | R2-2, R3-1, R3-6, F3-2 |
| `catch` (n) | catch at least n runners (intercept) | F3-3 |

## Things the player has been taught (and where to reuse them)

| Lesson | Taught in | Good places to reuse it |
|---|---|---|
| Use cover; draw guards off rocks | WL-1 | any map with `M` held by `guard` enemies: ravine, thornHill, forestTrail |
| Weapon triangle | WL-2 | stages that field one weapon type per flank or bridge; bosses with an obvious counter |
| Danger view, choke points, moving together | WL-3 | walls with gaps (republicCamp, flowerField), bridges (ford, riverWoods) |
| Protect a fragile leader | FD-1 to FD-3 | escort or VIP stages |
| Choke points at a bridge | BR-3, PT-3 | riverWoods, ford |

## Recommended level

`recommendedLevel(stage)` in `25-data-campaign.js` works it out: the average enemy level (an elite +1, a boss +2),
+0.25 for each enemy beyond twice the deployment, minus the enemyMods converted to levels (about 2.3 stat points
per level, HP counted at half). The current line on both routes:

| | Ch. 1 | Ch. 2 | Each character's side stories |
|---|---|---|---|
| Recommended | 1 · 1 · 2 · 2 | 2 · 3 · 3 · 3 · 4 | 3 · 4 · 5 |

Chapter Three (both routes): 4 · 5 · 5 · 6 · 6 · 7.

Keep new stages on this line: about +½ a level per stage, and +1 for a finale. Expected player levels (from the
experience rules) run roughly a level above it by late Chapter Two.

## Chapter Three: Monkeyland

Six stages a side (one more than Chapter Two), `enemyMods: {mhp: -1}`, deploy 7. Convergence gates: R3-3 needs F3-2,
F3-3 needs R3-3, F3-4 needs R3-4, R3-5 needs F3-4, F3-5 needs R3-5, R3-6 needs F3-5. Speshul joins the Raepublic in
R3-5 (a mid-battle `join` that must survive; R3-6 `mustDeploy`s him); Aurora joins the Friggliarchy after F3-6.
Abilities: Aurora, Bend, Not Break (once a battle, survive a killing blow on 1 HP); Speshul, We Can Fight! (+2 damage,
+10 Hit against higher-level enemies). Art: Monkeyland's soldiers (and Captain Tamarind, in dark fur) use `art/mk*-*.png` (★★ / `elite: true` monkeys use the
gilded, scarred `art/mkelite*-*.png`), a battle pose per weapon
(healers read from the book pose), fur recoloured from the `mk*skin` masks into `MONKEY_FURS` in the background just after
loading. Aurora and Speshul are still felt plush (`LOOKS.aurora/speshul`);
scenes `monkeyland`, `castlegate` and `castle` have their own paintings (`art/bg-*.jpg`). Your own units always stand on your side's coaster, whatever their faction.

## Progression and unlocks

| What | Opens |
|---|---|
| Recruiting | after each route's Chapter One finale (R1-4, F1-4) |
| Every banner after the first | after each route's Chapter Two finale (R2-4, F2-4) |
| The monkey banners (Across the Stream / The Loyal Court: monkey ★ and ★★ soldiers, placeholder ★★★ Kumquat / Persimmon) | after each route's Chapter Three finale (R3-6, F3-6) |
| Camp (supports) and the Side Stories tab | after the first stage of Chapter Two (R2-1, F2-1), with one tutorial |
| A character's side stories | one each at Support C, B and A with them |
| Support S | after all three of that character's side stories |
| Training | after Support A |

## Seasonal events (`31-data-events.js`)

An event runs for a calendar month (`EVENTS[id].month`) of the game's clock (`gameDate()`, which includes Debug: New
Day's skipped days). It only shows on a route once that route's Camp and Side Stories are open, and introduces itself
with a short tutorial once per season per route (flag `tut-event-<id>-<year>-<ck>`). While it's on:

- the hub shows a festive strip linking to the Side Stories tab, where the event's stories sit at the top in a festive card;
- event side stories (`event: id` in `CAMPAIGNS[ck].sides`) can be played **once a game day** (`SAVE.eventPlays`). Each
  day's run is a fresh run (full money, no "replay" penalty), but the story scenes only play the first time;
- they pay the event's own currency by result: one gift per courier caught (XM-R) or kept safe (XM-F), up to 8. A defeat
  pays nothing and doesn't use up the day. Best result is kept in `SAVE.eventBest`;
- event banners (`event: id`, `currency: 'gifts'`, `festive: true` in `GACHA_ARMY[ck].banners`) appear, paid with that
  currency (`gachaState(ck).gifts`), using the usual rules (own ★★★ only). They have present-themed seals, card backs and
  an "unwrap" reveal. `bannerCur(ck, b)` says what a banner is paid with.

| Event | When | Raepublic | Friggliarchy | Currency |
|---|---|---|---|---|
| The Festive Season (`december`) | December | XM-R How Rae Stole Christmas (intercept 8 couriers), banner "A Sack Full of Rabbits" (★★★ Ilc the Scout, a frog defector with a spear; attire Hoppy Xmas for Flopsy) | XM-F Froggy Festivities (escort 8 couriers for 6 turns), banner "Gifts for the Capital" (★★★ Chriggle Chraggle, tome Gift-Bringer; attire Gingerbiggle) | Rabbit Gifts / Frog Gifts |

Debug (campaign screen): "Debug: December" / "Debug: Not December" toggles `SAVE.debugDecember`; "Debug: New Day" moves
the clock on a day, so the daily log-in and the once-a-day event stories come round again.

The Raepublic festive banner's soldiers (`troops: 'festive'`: Knitter, Log Splitter, Pole Bearer, Snowballer, Caroller)
are the Republic troop art in the usual uniform, with festive fur instead of the natural colours (`FESTIVE_FURS` in
`10-data-units.js`: berry red, holly green, gold, peppermint pink; ★★ keep the plumed helmet). Trial look: may be
replaced by their own art.
Festive art (these and the frog elves) is only dyed when needed: in December (or Debug: December), or once the army
has such soldiers. That keeps the rest of the year's loading screen shorter.

Art: the couriers and the Friggliarchy festive banner's soldiers are frog scouts in elf green (`art/elf*-*.png`, a
battle pose per weapon; skins recoloured from `elf*skin` masks). The banner's ★ soldiers (`troops: 'elves'`: Elf Guard,
Holly Axe, Pennant Elf, Elf Archer, Carol Scribe) wear the green; its ★★ wear Santa red, built at load from the
`elf*armour` masks. The story scenes and both festive banners use the snowy-woods backdrop (`art/bg-snow.jpg`, scene `snow`), and the
Frog Scout who speaks in them is an elf scout (`elfscout`). There are no festive costumes for Rae or Tiggle (the placeholders were dropped; old saves lose them); the festive
attires are Flopsy's Hoppy Xmas and Biggle's Gingerbiggle.

## Energy (`67-energy.js`)

Six energy, shared by both routes. Losing or retreating from any battle (story, side story, seasonal, training)
costs 1; winning costs nothing. One comes back per hour, from timestamps, so it refills while the game is closed. At 0,
the Prepare screen still opens but "Begin Battle" waits (it shows the countdown). The meter is on the campaign
screen, the Prepare screen and the defeat screen. Uses the game clock, so "Debug: New Day" refills it;
"Debug: Empty Energy" / "Debug: Refill Energy" sets it directly.

## Economy

Pull currency (Whispers / Writs) comes from clearing stages (1 each, chapter finales 6), bonus stars (3), side stories
(2, 2, 3 per set, plus their stars), the daily log-in, or trading 400 money for one. Target: a typical chapter (most
stars, a few side stories, a week of log-ins) earns about two-thirds of a banner. Typical per side: Chapter One about 28,
Chapter Two about 45. Getting both ★★★ from a two-character banner costs about 60 on average (median 50–60, 3 in 4 by 80).
Releasing units or spare weapons pays a little money (15 / 40 / 100 by rarity), never pull currency.

Daily log-in (`66-login.js`): every new calendar day counts as one more log-in (not necessarily consecutive). Each
gives ONE currency, alternating: odd log-ins Whispers, even Writs. 2, 2, 3, 2, 3, 3, then the seventh is a milestone
with a reveal: log-in 7 Rae's Casual Wear (+5 Whispers), log-in 14 Tiggle's Formal Wear (+5 Writs); after that the
second week repeats with 10 on every seventh. About 10 of each per week. "Debug: New Day" on the campaign screen makes
it claimable again.
