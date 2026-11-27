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
| Weapon triangle | Two triangles. Melee: sword beats axe, axe beats lance, lance beats sword. Ranged: tome beats bow, bow beats hook, hook beats tome. A win is +1 damage, +15 hit. Shown as a diagram with `{show: 'triangle'}` |
| Weapon badges | every map token carries its weapon's badge, coloured by weapon (swords red, axes green, lances blue, bows gold, tomes purple, staves pale teal). Danger view covers each unit with a large badge, ringed red (enemies), gold (yours) or blue (allies) |
| Triangle arrows | with one of your units selected, each enemy shows a green ▲ (top left of its token) if your weapon beats theirs, a red ▼ if theirs beats yours (tomes over bows included) |
| Ranges | Bows (and whips) 2 only, so no counterattack up close. Tomes 1–2. Hooks 2 only. Staves heal an adjacent ally (8 + Atk/2) and can't attack |
| Hooks (Chapter Four on) | On a hit, the target is pulled one square closer (into the square beside the hook). No pull if that square is blocked by a unit or by ground the target can't stand on. A pulled melee fighter strikes back from beside the hook; a pulled ranged one (bow, tome, hook) can't. Reach is checked before every blow, so a pull can also cancel the hook's own follow-up. The forecast says what the pull will do. Used by the pirates' Grapplers (R4-4 on, DK-1) and Tilly Tealbottom (F4-3, then the Champions of the Lists banner). Enemy hooks plan their pulls: they favour readers (who can't strike back once pulled), targets on good cover, and landing squares next to their own allies, and they count a pulled melee fighter's counter; ★/★★ Grapplers on the Pirates of the Satin Sea banner. Fish and shark Grapplers have hook poses (`art/fishhook-battle.png`, `art/sharkhook-battle.png`). Willow reminds you of the rules before R4-4, the first fight with them |
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
| coastRoad (shore) | the sea `W` down the left edge, cliffs `X`, dune grass `F`, sea rocks `M`, a frog watch hut `T` | R4-1 |
| beachCamp (shore) | the settlement: two jetties `B` into the sea at the top (where pirates land), a driftwood fence `X` with gaps, huts `T` | R4-2, R4-4 |
| lighthouse (shore) | the lighthouse `T` on an island, reached by a causeway `B` two squares wide | R4-3 |
| tidePools (shore) | rock pools `W` dotted over the beach, longboats `T` | R4-5 |
| cove (shore) | cliffs `X` all round, the pirates' tents `T`, a pier `B` | R4-6 |
| gangplanks (ship) | three ships, rails `X`, masts `M`, barrels `F`; single-square gangplanks `B` over the sea between them; Ducky's quarterdeck `T` | R4-7 |
| grandArena (arena) | grandstands `M` round the edge, pennants `F`, the King's box `T` | F4-1, F4-6 |
| gauntlet (arena) | four tilt barriers `X`, each with a gap on alternating sides; the bell (exits) at the top | F4-2 |
| lists (arena) | open sand split by the tilt barrier `X` (with gaps); Tilly's pavilion `T` | F4-3 |
| royalPark (meadow) | lawns, topiary `F`, fountains `M`, hedges `X`; gates (exits) along the bottom | F4-4 |
| siegeGame (arena) | a mock fort of barriers `X` in the middle, gaps on every side, pavilions `T` inside | F4-5 |
| royalArena (arena) | grandstands, the champion's dais `T` in the middle | F4-7 |

## Movement types (a class's `mt`)

| Type | Forest `F` | Rocks `M` | Classes |
|---|---|---|---|
| foot | 2 | 3 | most |
| armor | 2 | can't enter | Lily Knight, Armoured Guard, Court Knight (Biggle: an armoured sword) |
| bog | 2 | 2 | Club Guard, Marsh Lord (frogs at home in the marsh) |
| climb | 1 | 3 | monkeys: Acrobat, Nut Thrower, Canopy Heir (Speshul, a bow). Trees and flowers are open ground to them |
| mounted | 3 | can't enter | Rose Knight (Biggle's attire), Hook Rider (Tilly Tealbottom: a hook on horseback, F4-3) |

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
| Rose Knight | Biggle | Court Knight → Rose Knight (mounted lance): −3 Def, +4 Spd, +1 Skl, +3 Mov | The Black Frog's Son banner |
| Monkeyland Militia | Rae | Captain → Militia Captain (lance, Militia Spear): +2 HP, +3 Def, −2 Spd | Across the Stream (after Chapter Three) |
| Arena Champion | Tiggle | Frog Prince → Arena Champion (axe, Victor's Axe): +3 HP, +2 Atk, −2 Spd | Champions of the Lists (after Chapter Four) |
| Powder Monkey | Speshul | Canopy Heir → Powder Monkey (hook, still climbs; Sunrise Hook): +2 HP, +2 Atk, +1 Def, −2 Spd | Pirates of the Satin Sea (after Chapter Four) |
| Simian Sorcerer | Flopsy Flora | Mender → Simian Sorcerer (tome, 1–2): +3 Atk, −1 Def, +1 Spd | Across the Stream (after Chapter Three) |
| Hoppy Xmas | Flopsy Flora | same class and needle: +2 Def, −1 Spd | A Sack Full of Rabbits (December) |
| Starlight Scholar | Willow | same class and tome: +2 Atk, +1 Skl, −1 Def | Wishes on the First Star (January) |
| Life of the Party | Tiggle | same class and sword: +2 Spd, +1 Skl, −1 Def | The Midnight Ball (January) |
| Gingerbiggle | Biggle | Court Knight → Gingerbread Knight (sword on foot, Candy Cane Rapier): −5 Def, +5 Spd, +2 Skl, +1 Mov | Gifts for the Capital (December) |

## Unique abilities (`14-data-abilities.js`)

One small, always-on ability per unique character (placeholders have none), shown as an icon on unit cards and in the
battle panel; tap it to read it. An attire that changes class or stats brings its own (`ATTIRES[id].ability`). They
work for any unit with that character's key, enemies included (e.g. the Executioner as a boss), except Light Fingers
and The Lesson, which only help the player.

| Character | Ability | Rule | Stage ideas |
|---|---|---|---|
| Rae (Monkeyland Militia) | Plant the Spear | if she moved at most 1 square on her turn, she strikes first when attacked until her next turn | holding a line, choke points |
| Rae | Next to Me | she and an adjacent ally: +1 damage dealt, −1 taken | formations |
| Flopsy Flora | Mended Seams | whoever she mends: +2 Def until her next turn | |
| Flopsy Flora (Simian Sorcerer) | Healing Verse | each time her spell hits, allies next to her recover 3 HP | |
| Flopsy Flora (Hoppy Xmas) | Stocking Filler | whoever she mends gets +3 damage in their next fight (attacking or defending) | |
| Willow | The Lesson | allies within 2 earn +20% EXP | |
| Willow (Starlight Scholar) | Shooting Star | each spell that hits also deals 2 to every other enemy next to the target (never below 1 HP): a small, safe splash | packed enemies, chokepoints |
| Tiggle (Life of the Party) | Pop the Cork | each enemy he defeats heals every ally within 2 of him for 4 | finishing blows in the thick of it |
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
| Chansey | Sanctuary | whoever she mends can't be chosen as a target by enemies until her next turn | protecting a wounded front-liner |
| Captain Cornelius | Guard Duty | once a turn, when an enemy attacks an ally next to him, he lunges at the attacker first if they're within 2 squares of him; also as an enemy boss | bodyguard formations; bosses with escorts |
| Speshul (Powder Monkey) | Lit Fuse | an enemy his hook pulls in gets a lit fuse: at the start of the next enemy turn, 5 damage to it and 2 to each of its allies beside it (it can unstitch) | pull enemies into their own crowd |
| Tandy & Maus | Two Pairs of Paws | after mending an ally they may scurry 1 more square (tap a blue square, or Stay) | mend the front line, then step back out of reach |
| Tiggle (Arena Champion) | Crowd Pleaser | every enemy he defeats gives him +1 damage for the rest of the battle (up to +3) | maps with many weak enemies; snowball a strong lord |
| Princess | Every Grievance Noted | anyone who damages her goes on her list: she deals them +3 damage for the rest of the battle (an enemy boss: F4-6, and Chapter Five) | spread the damage, or finish her fast |
| Tilly Tealbottom | Do Come Closer | an enemy her hook pulls in is Off Balance until its next turn: no terrain cover, −20 Avoid (also as the F4-3 boss) | pull a target into your allies, then pile in |
| Ducky | Blood in the Water | while any enemy is below half HP he gets +2 Mov; +2 damage against enemies below half HP (also as an enemy boss, R4-6, R4-7) | finishing wounded enemies, hit-and-run |
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
| Rout | `objective: {type: 'rout'}` | F2-1, F2-4 (after the twist), FD-1, F4-1 |
| Survive | `objective: {type: 'survive', turns}` | F1-3, R2-1, R2-3, R3-3, R4-4, F4-5 |
| Reinforcements | `reinforce` | R2-1, R2-2, R2-3, F1-3, FD-1, FD-3 |
| Twist (objective changes mid-battle) | `twist` | R2-1 (survive, then rout), F2-4 (duel, then the guard) |
| Solo start, team arrives later | `solo` + `twist: {on: 'boss', arrive: true}` | F2-4 |
| …or after surviving alone | `solo` + `objective: {type: 'survive', turns}` + `twist: {arrive: true, objective}` | R4-5 (Rae walks out to surrender; her friends arrive at the end of turn II) |
| Must-deploy character | `mustDeploy` | F2-4 (Biggle) |
| A usual unit fights against you | `ban` + the character as an enemy boss (`key`, so their ability works for the enemy) | F4-7 (Biggle Baggle; his Hold the Line stops your units) |
| Allies (act on their own phase) | `allies` | R2-2 (Patch is a `vip`), R2-2b, R2-3, R2-4, F2-2 (Fraggle's guard) |
| A character joins mid-battle | `events: [{turn, join}]` | R2-1 (Willow) |
| Convergence gate | `requires` | R1-4 / F1-4 pair, R2-2 / F2-2, F2-3 / R2-2, F2-3b / R2-4 |
| Someone else leads | `lead` | FD-1, FD-2, FD-3 (Flopsy) |
| Characters kept out | `ban` | WL-* (Willow), FD-* (Rae) |
| Training fight (no permanent losses, the boss yields) | `spar` | WL-1, WL-2, WL-3, CO-1 (taught: monkeys cross trees; keep to the open), R4-2 (rabbits and monkeys, mixed teams), every round of the tournament (F4-1 to F4-7) |
| Flashback (years ago: only the leader and ordinary soldiers) | `flashback` + `lead` | RH-1–3 (Rhubarb), FJ-1–3 (Fraggle Jr.), AU-2 (Aurora), CO-2 (Cornelius) |
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
| Intercept outside the event (no gifts; over when no runner is left) | `objective: {type: 'intercept', who, dest}` + enemy couriers | F3-3 (the grain runners), F4-4 (the Ribbon Hunt's squires) |
| Bells (hold ground: first to ring n) | `objective: {type: 'bells', n, turns}`: every fort square is a bell; at the end of each side's turn every bell it stands on rings once. First to `n` wins; after `turns`, more rings wins. Enemy `ai: 'bell'` heads for the nearest bell its side doesn't hold, then holds it. Event pay is by the margin | NY-R, NY-F (January) |
| Escape (win when the leader reaches an exit) | `objective: {type: 'escape', dest}` + `exits` | F3-5, CS-2, F4-2 (the Gauntlet's bell) |
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
| `catch` (n) | catch at least n runners (intercept) | F3-3, F4-4 |

## Side-story characters

Side stories never introduce a character that needs new art. Anyone new in them (a boss, an ally, a speaker) is drawn
with existing generic art: set `look` (and `fur`, `elite`) on the spawn, or a speaker's `look`/`fur`. E.g. Governess
Marigold (CO-2) is a gilded ★★ monkey in grey; Captain Mako is a pirate shark; Lady Tealbottom a frog soldier.

## Things the player has been taught (and where to reuse them)

| Lesson | Taught in | Good places to reuse it |
|---|---|---|
| Use cover; draw guards off rocks | WL-1 | any map with `M` held by `guard` enemies: ravine, thornHill, forestTrail |
| Lesson | Taught in | Good places to reuse it | stages that field one weapon type per flank or bridge; bosses with an obvious counter |
| The ranged triangle and hooks | mentioned by Willow in R2-1 ("unlikely to see one around here"); hooks shown in R4-4; on the Friggliarchy side, Biggle explains them before F4-3, where Tilly demonstrates (she waits mid-field with catchers around her) | pirate stages with Grapplers near your readers; pull enemies off forts and bridges |
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

Chapter Three (both routes): 4 · 5 · 5 · 6 · 6 · 7. Chapter Four: Raepublic 7 · 7 · 8 · 8 · 8 · 9 · 10; Friggliarchy 7 · 8 · 8 · 8 · 9 · 9 · 10. Side stories of Chapter Three's characters (Speshul, Aurora,
Cornelius, Chansey; `29b-data-sides-monkeys.js`): 6 · 7 · 8.

Keep new stages on this line: about +½ a level per stage, and +1 for a finale. Expected player levels (from the
experience rules) run roughly a level above it by late Chapter Two.

## Chapter Three: Monkeyland

Six stages a side (one more than Chapter Two), `enemyMods: {mhp: -1}`, deploy 7. Convergence gates: R3-3 needs F3-2,
F3-3 needs R3-3, F3-4 needs R3-4, R3-5 needs F3-4, F3-5 needs R3-5, R3-6 needs F3-5. Speshul joins the Raepublic in
R3-5 (a mid-battle `join` that must survive; R3-6 `mustDeploy`s him); Aurora joins the Friggliarchy after F3-6.
Abilities: Aurora, Bend, Not Break (once a battle, survive a killing blow on 1 HP); Speshul, We Can Fight! (+2 damage,
+10 Hit against higher-level enemies). Art: Monkeyland's soldiers (and Captain Cornelius, in dark fur) use `art/mk*-*.png` (★★ / `elite: true` monkeys use the
gilded, scarred `art/mkelite*-*.png`), a battle pose per weapon
(healers read from the book pose), fur recoloured from the `mk*skin` masks into `MONKEY_FURS` in the background just after
loading. Aurora has her own art (`art/aurora-*.png`); Speshul too (`art/speshul-*.png`; a bowman, Canopy Heir);
scenes `monkeyland`, `castlegate` and `castle` have their own paintings (`art/bg-*.jpg`). Your own units always stand on your side's coaster, whatever their faction.

## Chapter Four: The Shore / The Tournament

The two stories split up: no convergence gates. Seven stages a side (one more than Chapter Three), `enemyMods: {mhp: -1}`,
deploy 7. Chapter Five is a stub on both routes.

- **The Shore (Raepublic).** The frog army is recalled north (R4-1), the Raepublic settles the beach. Rabbits and monkeys
  argue over huts and settle it with a mixed-team training match (R4-2), take the old lighthouse (R4-3), then pirates
  arrive after the King's bounty on Rae (R4-4). Rae walks out alone to give herself up and her friends follow her (R4-5,
  a solo survive with a twist), the Raepublic attacks the pirates' cove (R4-6; Ducky escapes to sea), and boards
  Ducky's three ships (R4-7). The pirates surrender and offer to join.
- **The Tournament (Friggliarchy).** The King's fury at court; Biggle speaks up for Tiggle; the King orders the Royal
  Tournament. Seven rounds, all training fights (`spar`): the Grand Melee (rout), the Gauntlet (escape to the bell),
  Tilly Tealbottom in the lists (a mounted lance boss), the Ribbon Hunt (intercept), the Siege Game (survive in a mock
  fort), Princess in the semi-final (a tome boss) and Biggle Baggle in the final (`ban`, enemy boss with Hold the Line).
  Afterwards: the test of worthiness; the King has given the army to Princess, who marched it south while the final was
  being fought; and the brothers set out to take it from her (Princess returns as the enemy in Chapter Five).

New: the `pirate` faction (`FACTIONS.pirate`; Cutlass, Boarder, Harpooner, Cork Gunner, Shanty Singer, Sawbones and
Ducky's Pirate Captain class, a scimitar), the classes Lily Jouster (Tilly) and Royal Heiress (Princess), and the
map themes `shore`, `arena` and `ship` (drawn in `45-render.js`). Every Chapter Four character now has art (Princess: `art/princess-*.png`). The pirate crew are pirate fish (`art/fish*-*.png`): one portrait and map icon,
a battle pose for each weapon (sword, axe, lance, bow, book, staff), and the skin, fins and tail recoloured from the
`fish*skin` masks into `FISH_COLOURS` (blue as drawn, gold, orange, green, teal, purple, coral, silver) in the background
after loading. The felt is nearly grey, so these colours set the hue and saturation outright rather than shifting them.
★★ (elite) pirates are pirate sharks (`art/shark*-*.png`, the same six poses), recoloured from the `shark*skin` masks
into `SHARK_COLOURS` (grey as drawn, white, slate, tiger, lemon, mako, reef, nurse); so are the named pirates without art
of their own (Bosun Barnacle, slate; Captain Mako, mako; old Captain Gullet, white), through the `shark` look art. The
Pirates of the Satin Sea banner's soldiers (`troops: 'pirates'`) are ★ pirate fish and ★★ pirate sharks.

Ducky (`art/ducky-*.png`, a hammerhead with a scimitar, Pirate Captain class) joins the Raepublic in the story after R4-7
(`reward.joins`), with supports and side stories (`29c-data-sides-pirates.js`, recommended 9 · 11 · 11): DK-1 a rival
captain comes for Rae's bounty (Ducky leads, Rae away), DK-2 a flashback to his first voyage (alone, with the old crew as
allies, surviving until the Mary cuts loose), DK-3 an intercept of the King's tax clerks; it ends with his own scimitar,
Old Mary's Edge.
Scenes `shore`, `arena` and `ships` have their own paintings (`art/bg-*.jpg`); the capital's throne room reuses `court`.

Tandy & Maus (`art/tandy-*.png`, key `tandy`): Ducky's first mates, two white mice who are one unit, Ship's Surgeons
(staff). The Raepublic's ★★★ on Pirates of the Satin Sea. In the story they're glimpsed after R4-5, are enemy healers
who escape in R4-6 and R4-7, and come ashore with the crew. They speak separately as `tandyone` (Tandy) and `maus`
(Maus), both shown with the duo's portrait (speakers can borrow art with `artFrom`).
Their supports (with Rae) and side stories (`29c-data-sides-pirates.js`, recommended 9 · 11 · 11): TM-1 Sick Bay (they lead,
Rae away: survive five turns while Captain Sedge's raiders attack the fevered settlement), TM-2 Stowaways (a flashback:
alone, keeping a young Captain Ducky's crew alive as allies until the Mary cuts loose), TM-3 Saltwort (drive Captain Mako
off the rock pools holding the fever's cure); it ends with their own staff, the Tidewater Staff.

The tournament's generic fighters (F4-1 to F4-7, and Tilly's catchers in F4-3) are gladiator frogs (`art/glad*-*.png`): a
portrait, map icon and a battle pose per weapon including a hook, skin recoloured from the `glad*skin` masks into
`SKINS`. Classes: Gladiator (sword), Hastatus (lance), Arena Axe, Sagittarius (bow), Arena Herald (tome), Arena Medic
(staff) and Retiarius (hook). The Lily Court's armoured knights stay knights, and the Ribbon Hunt's squires stay scouts.
★★ (elite) gladiators wear the scarred champion's helm and cape (`art/gladelite*-*.png`, the same seven poses, recoloured
the same way); elite gladiator enemies use it too. Champions of the Lists gives ★ gladiators and ★★ champions
(`troops: 'gladiators'`, all seven classes).

Tilly Tealbottom (Champions of the Lists, Friggliarchy) has supports with Tiggle and side stories
(`29d-data-sides-tournament.js`, recommended 9 · 11 · 11): TL-1 The Garden Party (she leads, Tiggle away: Magpie's
bandits raid her mother's party), TL-2 Last Season (a flashback, only Tilly and ordinary soldiers: Captain Mako's
pirates raid the Tealbottom summer house, and she takes up a Grappler's hook), TL-3 Bess Tealbottom (her pirate
great-great-grandmother's tower, held by smugglers with hooks); it ends with Grandmama Bess, her own ★★★ hook.

## Progression and unlocks

| What | Opens |
|---|---|
| Recruiting | after each route's Chapter One finale (R1-4, F1-4) |
| Every banner after the first | after each route's Chapter Two finale (R2-4, F2-4) |
| The monkey banners (Across the Stream / The Loyal Court: monkey ★ and ★★ soldiers, ★★★: Rae's Monkeyland Militia and Flopsy's Simian Sorcerer attires; ★★★ Captain Cornelius and Chansey) | after each route's Chapter Three finale (R3-6, F3-6) |
| Pirates of the Satin Sea (Raepublic: ★★★ Tandy & Maus and Speshul's Powder Monkey attire; ★ pirate fish, ★★ pirate sharks) | after R4-7 |
| Champions of the Lists (Friggliarchy: ★★★ Tilly Tealbottom and Tiggle's Arena Champion attire; ★ gladiator frogs, ★★ gladiator champions) | after F4-7 |
| Camp (supports) and the Side Stories tab | after the first stage of Chapter Two (R2-1, F2-1), with one tutorial |
| A character's side stories | one each at Support C, B and A with them |
| Support S | after all three of that character's side stories |
| Training | after Support A |

## Seasonal events (`31-data-events.js`)

Events are open from early Chapter Two, so they only use characters, places and art every player has met by then (see CLAUDE.md).
An event runs for a calendar month (`EVENTS[id].month`) of the game's clock (`gameDate()`, which includes the debug menu's New
Day's skipped days). It only shows on a route once that route's Camp and Side Stories are open, and introduces itself
with a short tutorial once per season per route (flag `tut-event-<id>-<year>-<ck>`). While it's on:

- the hub shows a festive strip linking to the Side Stories tab, where the event's stories sit at the top in a festive card;
- event side stories (`event: id` in `CAMPAIGNS[ck].sides`) can be played **once a game day** (`SAVE.eventPlays`). Nobody is unstitched for good in them: anyone who falls is only knocked out. Each
  day's run is a fresh run (full money, no "replay" penalty), but the story scenes only play the first time;
- they pay the event's own currency by result: one gift per courier caught (XM-R) or kept safe (XM-F), up to 8. A defeat
  pays nothing and doesn't use up the day. Best result is kept in `SAVE.eventBest`;
- event banners (`event: id`, `currency: 'gifts'`, `festive: true` in `GACHA_ARMY[ck].banners`) appear, paid with that
  currency (`gachaState(ck).gifts`), using the usual rules (own ★★★ only). They have present-themed seals, card backs and
  an "unwrap" reveal. `bannerCur(ck, b)` says what a banner is paid with.

| Event | When | Raepublic | Friggliarchy | Currency |
|---|---|---|---|---|
| Ring in the New Year (`newyear`) | January | NY-R The Shift Bells (Rae, Flopsy and Willow ring the old mine watch-post bells, 3 bells; real battle) | NY-F The War Camp Bells (Tiggle's team against Biggle's, 4 bells; a training match, Biggle on the other side) | Rabbit Chimes / Frog Chimes. Raepublic banner "Wishes on the First Star" (attire Starlight Scholar for Willow, no new ★★★; Republic soldiers). Friggliarchy banner "The Midnight Ball" (attire Life of the Party for Tiggle, no new ★★★; the Court's frog soldiers) |
| The Festive Season (`december`) | December | XM-R How Rae Stole Christmas (intercept 8 couriers), banner "A Sack Full of Rabbits" (★★★ Ilc the Scout, a frog defector with a spear; attire Hoppy Xmas for Flopsy) | XM-F Froggy Festivities (escort 8 couriers for 6 turns), banner "Gifts for the Capital" (★★★ Chriggle Chraggle, tome Gift-Bringer; attire Gingerbiggle) | Rabbit Gifts / Frog Gifts |

Debug menu, Time section: "December on/off" and "January on/off" set a pretend month (`SAVE.debugMonth`; events follow `gameMonth()`); "New day" moves
the clock on a day, so the daily log-in and the once-a-day event stories come round again.

The Raepublic festive banner's soldiers (`troops: 'festive'`: Knitter, Log Splitter, Pole Bearer, Snowballer, Caroller)
are the Republic troop art in the usual uniform, with festive fur instead of the natural colours (`FESTIVE_FURS` in
`10-data-units.js`: berry red, holly green, gold, peppermint pink; ★★ keep the plumed helmet). Trial look: may be
replaced by their own art.
Festive art (these and the frog elves) is only dyed when needed: in December (or debug December), or once the army
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
screen, the Prepare screen and the defeat screen. Uses the game clock, so the debug menu's "New day" / "+1 hour" refill it;
its energy buttons (0, 1, full) set it directly.

## Economy

Pull currency (Whispers / Writs) comes from clearing stages (1 each, chapter finales 6), bonus stars (3), side stories
(2, 2, 3 per set, plus their stars), the daily log-in, or trading 400 money for one. Target: a typical chapter (most
stars, a few side stories, a week of log-ins) earns about two-thirds of a banner. Typical per side: Chapter One about 28,
Chapter Two about 45. Getting both ★★★ from a two-character banner costs about 60 on average (median 50–60, 3 in 4 by 80).
Releasing units or spare weapons pays a little money (15 / 40 / 100 by rarity), never pull currency.

Daily log-in (`66-login.js`): every new calendar day counts as one more log-in (not necessarily consecutive). Each
gives ONE currency, alternating: odd log-ins Whispers, even Writs. 2, 2, 3, 2, 3, 3, then the seventh is a milestone
with a reveal: log-in 7 Rae's Casual Wear (+5 Whispers), log-in 14 Tiggle's Formal Wear (+5 Writs), log-in 21 Flopsy's In a Carrot, log-in 28 Biggle's Big Bow (+5 Writs), log-in 35 Willow's Dr. Willow (+5 Whispers; all look only); after that the
second week repeats with 10 on every seventh. About 10 of each per week. "New day" in the debug menu makes
it claimable again.

Collection (`65-dex.js`, the hub's Collection button): a Pokédex of everyone who has ever been in either army, and every
costume owned (`SAVE.dex`, kept up to date on every save, so released recruits stay collected). Uncollected entries are
silhouettes (their map-icon heads) with how to get them. One entry per unique character, one per company and rarity
(all ★ Republic soldiers are one entry, all ★★ another; Tall/Burly/Old Rabbit count as ★ Mine Rabbits), one per costume.
Sections: each faction, Costumes, Daily log-in, and each seasonal event (its banners' characters, costumes and soldiers,
unless an ordinary banner has them too). New characters, costumes and banners are picked up automatically; a new
company (`troops` set) needs its names and blurb in `DEX_COMPANIES`.

## Debug menu (`src/js/69-debug.js`)

One "🔧 Debug" button on the campaign screen and in the battle menu. It asks for the password (`scrumbly`, any case);
once entered it stays unlocked until the page is reloaded (opening the game with `#debug` skips the password). "Lock"
closes it again. It acts on one army at a time (switch at the top). Sections fold away, and remember whether they're open:

- **This battle** (battle menu only): win, lose, defeat every enemy, heal my units, units can act again, skip to the
  objective turn (then End Turn to finish a survive/escort stage), boss to 1 HP, invincible (your units take no damage).
- **Story progress**: jump to any stage (everything before it counts as cleared, with the story choices that implies),
  clear the whole current chapter, unlock everything, reset this army's story; play / clear any side story, clear all.
- **Resources**: money, pull currency, event gifts, next pull is a guaranteed ★★★ on every banner, zero everything.
- **Army**: set everyone's level, recruit everyone, revive the fallen, every weapon, every costume, reset relationships,
  set every support (or one character's) to none/C/B/A/S.
- **Time, energy and events**: December / January on (pretend month), new day, claim every log-in reward (the rest of the 35-day track: currency and the five
  costumes, without using up today's log-in), +1 hour, energy 0 / 1 / full, December on/off, replay events, set the log-in day.
- **Tutorials and display**: replay tutorials, fast animations (4×), music off.
- **Save**: copy the save as text, paste one back, wipe everything.
