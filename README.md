# 🐰 Rae Rabbit's Cosy Home

A little 3D first-person game: hop around as Rae Rabbit, collect carrots and smash things.

## How to play it
Double-click `index.html` to open it in your web browser (needs internet the first time, to load Three.js).
Pick a game mode from the main menu:

- **🥕 Carrotventure**: explore the house, find carrots, smash things, dress up at the Flopsy Shop.
  Eat all 20 carrots and... "Uh oh - too many carrots!" Get Rae to the toilet (hop onto the seat)
  for the **YOU WIN!** screen.
- **🐸 Frogpocalypse**: frogs pour in from all over the house, more and more as time goes on. Both
  wardrobe shops are boarded up and Willow has fled. The HUD shows frogs stomped and how
  long you've survived; every door starts smashed (nowhere to hide), frogs pop up even right in view.
  - **Willow's parcels**: early on, Willow (keeping in touch from afar) hints that popping lots of
    frogs will earn armaments. After **15 frogs** she has a parcel delivered to a random room (a
    cardboard box with a ribbon and a beam of light): walk into it for the **Pokey Stick**. After
    **15 more**, a second parcel brings the **'Rae' Gun**.
  - **Flopsy power-up**: Flopsy hides in a random room. Bonk her ("Ouch this Flopsy!!!") and Rae
    feels stronger: hearts refill and Rae gets **one more heart**. Flopsy then hops off to hide in
    another room. Up to 3 times (3 → 6 hearts), then she's all bonked out and goes for a nap.
  - **Boss 1**: survive **3 minutes** and **Jiggle Jaggle** (giant, with a crown) appears in the
    living room. He takes **5 hits**.
  - **Boss 2**: beating him isn't the end! **Fraggle Friggle**, a black frog with glowing red eyes
    and a comically EVIL streak, appears in the bedroom. Normal size but fast and zig-zagging like a
    mini frog, he always knows where Rae is, leaps up onto beds, tables and worktops after her, and
    pops up nearby if she gets away. He takes **5 hits**.
  - **Boss 3 (final)**: **Tiggle Taggle**, Fraggle's tiny green little brother, appears in the
    kitchen, determined to make his big brother proud. Just **1 heart**, but he's very quick and
    hops out of the way when Rae tries to land on him (jump again straight away, before he can
    dodge twice!). Beat him for the **YOU WIN!** screen.
  - While a boss is out, frogs appear about half as often (`BOSS_FROGS`).
  - So many frogs would mean non-stop chatter, so ordinary frogs only speak now and then here
    (`FROGPOCALYPSE_CHATTER` and `FROGPOCALYPSE_QUIET` at the bottom of `js/frog.js`).
  Spawn rates, the frog limit, the boss time and the parcel count are at the top of
  `js/frogpocalypse.js`; the bosses' health, speed and lines are in `BOSSES` at the top of `js/frog.js`.
- **☁️ Flopsy Mode** (`js/flopsymode.js`): play as tiny Flopsy. Everything feels huge: her eyes are
  low, her hops are small (about 0.6 m, Rae's are 1.2 m) and she walks slower. The goal is the same
  as Carrotventure (all 20 carrots, then the toilet), but she can't do Rae's usual jumps, so **fluffy
  cloud platforms** float all over the house, in little staircases up to every high-up carrot, the
  toilet, the bath (and back out again), the living room window and around the garden tree. Flopsy
  can't smash things (they're solid to her; the doors start open) and can't hurt frogs (landing on
  one just bounces her off it), so there are only 4 frogs. Both shops are shut. Most cloud
  staircases are worked out automatically when the mode starts (`Clouds.TARGETS`: what each one
  leads to); a few are placed by hand (`Clouds.HAND_PLACED`: the tree, the fridge, the way out of
  the bath). If you move furniture, the automatic ones adjust themselves.

- **W A S D**: move
- **Mouse**: look around (or hold the button and drag, if the browser won't capture the mouse)
- **Space**: hop (press it just as you land on the bed for a big bounce)
- **G**: dance! Nearby frogs stop and dance along (not in the Frogpocalypse). Moving stops the dance.
- **Click**: punch! Smashes breakables and pops frogs just in front of Rae (tweak `PUNCH_REACH` and
  `PUNCH_RADIUS` in `js/main.js`)
- **Esc**: pause. The pause screen has a **↺ Restart** button (press it twice) that takes you back to
  the main menu to pick a game mode (controller: **Y** twice)

**With a controller** (Xbox layout; just press a button and the on-screen prompts switch over):
left stick move, right stick look, **A** hop, **X** / **RB** / **RT** punch, **Y** dance, **Menu (☰)** pause.
In the Flopsy Shop: D-pad or left stick to choose, **A** to wear, **B** to leave.
Settings (dead zone, look speed) are at the top of `js/gamepad.js`.

## Where things live
| File | What it does |
|------|--------------|
| `index.html` | The page: canvas, start screen, loads the scripts |
| `style.css` | Look of the start screen, counter and dialogue bubble |
| `js/audio.js` | Sound effects made in code (boing, spring, chime, crunch, babble) |
| `js/dialogue.js` | Rae's thought bubble (top left). `Dialogue.sayOnce("id", "Text!")` |
| `js/props.js` | The `Prop` class (every object), colours, carrots, cans, glasses, lamps |
| `js/debris.js` | The flying pieces when something breaks |
| `js/rae.js` | Rae's body & animations (seen in mirrors) and her first-person paws |
| `js/mirror.js` | Real reflecting mirrors |
| `js/frogpocalypse.js` | The Frogpocalypse mode: frog spawner, survival timer, boss, boarding up both shops |
| `js/flopsymode.js` | Flopsy Mode: playing as Flopsy, and the cloud platforms |
| `js/mice.js` | The secret fireplace mice: their model, peek and dance |
| `js/achievements.js` | The achievements list, saving them, the popup and the Achievements screen |
| `js/weapons.js` | Weapon stats (paws, Pokey Stick, 'Rae' Gun) and the gun's green balls |
| `js/gamepad.js` | Controller support and switching between keyboard and Xbox button prompts |
| `js/shop.js` | Both shops: outfits and weapons & unlocks, the dancing stage, the menu; Flopsy and Willow |
| `js/frog.js` | The frogs: model, animations, spotting & chasing Rae, popping, respawning. Their lines are at the top |
| `js/world.js` | The building toolbox: boxes, walls with doorways, windows, lights |
| `js/house.js` | **The house itself**: one build function per room |
| `js/garden.js` | The garden outside the open windows, and the climbing tree |
| `js/kitchen.js` | The kitchen furniture, the high-shelf parkour route, bottles and plant pots |
| `js/player.js` | Rae's controls, hopping, stairs and collision (tweak speed/hop here) |
| `js/main.js` | Starts everything and runs the game loop |

## The house (follows the real floorplan, at about 2x size)
- **Bedroom**: king-sized bed (run underneath, bounce on top), two bedside tables (reach them from the bed), the wide white table opposite (big bounce off the foot of the bed; an open drawer sticking out makes a handy ledge) with an oval vanity mirror above it (hop up to see Rae!), a stool under it, two windows above the bed.
  - Breakables: a lamp and a glass on each bedside table, five cans on the white table, six little clothes piles on the floor (one kicked under the bed).
  - Carrots: above the bed, under the bed, on the white table, hidden in the wardrobe.
  - Built-in wardrobe in the wall to the left of the vanity mirror: three sliding doors. The left one is
    open (walk in: shelf with boxes, hanging shirts, a clothes pile), the middle one is a full-length
    mirror, the right one is plain white. Its insides run behind the other doors.
- **Corridor**: from the bedroom door to the living room. The unused side door has a full-length mirror on it.
- **Bathroom** (off the corridor): hollow bath you can hop into, toilet (seat → cistern makes a little climb), pedestal sink with a real mirror above it (hop onto the sink to see Rae).
  - Carrots: one in the bath, one in the sink (hop from the bath's end onto the sink).
- **Living room**: chimney breast with fireplace and a mantelpiece, window, and the doorway to the stairs.
  - Furniture (from photos): big white sofa with a black side table in the corner, black coffee table on a
    grey-green rug, TV on a white table in the corner by the window, desk with computer and office chair,
    bookshelf by the door (Rae can sit on the shelves), chest of drawers. The sofa cushions are bouncy.
  - Breakables: the TV, books (shelves and a floor stack), three bowls, the plant and pot on the drawers,
    laptop, phone and cracker on the coffee table, photo frames, a vase and plant pot on the mantelpiece,
    a jar and notebook on the side table, mug and speaker on the desk.
  - Clutter for looks: posters, blankets on the sofa, a desk mat, remote, little mirror, backpack.
  - Carrots: high above the sofa (big bounce), on the TV table, under the coffee table (on its shelf),
    on the desk (hop onto the chair seat from the side, then onto the desk).
- **Stairs**: six steps down to the kitchen level (1.2m lower). Rae walks up and down them; no hopping needed.
- **Office** (the small bedroom on the plan): at the bottom of the stairs, door facing the stairs. Grey carpet; desk under the window (computer, books, drink, cat mouse mat, high-backed chair, poster and plant on the sill); pine shoe racks full of shoes opposite the door, more shoes on the floor; a pile of backpacks in the corner. Shoes, backpacks, books, the bottle, poster, plant and computer are all breakable. Carrots: on the desk (via the chair seat) and on top of the tall shoe rack (via the low one).
- **Kitchen** (from photos, built in `js/kitchen.js`): L-shape wrapping round the office. The long counter (oak cupboards, dark worktop) has bottles, chopping boards, a pestle & mortar, a bag of oranges, the hob with a frying pan, the sink, the microwave and the washing machine (its round door left wide open: hop into the drum!), with windows all along. Across the aisle, tall wall cupboards: their top is the **high shelf**, with a carrot on it. Parkour route: step stool -> breakfast bar -> along to the worktop -> microwave -> running leap across the aisle (jump right at the edge of the microwave). Round the corner, the breakfast bar with stools, a bin, the step stool (tucked partly under it) and lots of plants; the mini fridge sits in the corner. Carrots: on the worktop, on the high shelf, on top of the fridge, under the bar, and the 20th and last one hiding in the washing machine drum (Rae has to climb right inside). Almost everything on the counters is breakable.
- **Doors**: every doorway has a door that smashes to pieces when Rae touches it.

## The Flopsy Shop
Inside the wardrobe, behind the mirror door, is a tiny door with a scrappy hand-written FLOPSY SHOP
sign. Flopsy (a little pale-brown bunny) stands beside it and waves hello when Rae comes in.
Walk up to the door: the screen fades to black and the shop opens, with Rae dancing on a little stage
in whichever outfit you click. "Wear it!" and she steps back out in it, with something to say.

| Outfit | How to unlock |
|--------|---------------|
| Just fur, Favourite shirt | Always |
| Pink dress | Collect 3 carrots |
| Frog face shirt | Stomp 5 frogs (frogs then wave at Rae instead of chasing her, but touching still hurts) |
| Navy suit | Smash 20 things |
| Clown face & nose | Collect 8 carrots |

Flopsy calls out when something new unlocks. Change outfits, lines and unlock rules in the `OUTFITS`
list at the top of `js/shop.js`; how each one looks is `setOutfit` in `js/rae.js`.

## Willow's Weapon Mart
On the wardrobe's other inner wall is a smart dark-wood door with a brass knob and a typewritten
plaque: WILLOW'S WEAPON MART. Willow, a grey bunny with a gold monocle, waits beside it. She waves
when Rae comes in and speaks in a very erudite way (typewriter letters in her speech bubbles).
Punch her and she objects in long words. Walk up to the door to open the shop: the same menu as the
Flopsy Shop, dressed formally, with Rae trying out each weapon on the stage.

| Weapon | How to unlock | What it does |
|--------|---------------|--------------|
| Paws | Always | Quick punches, short reach |
| Pokey Stick | Stomp 4 frogs | Pokes much further, but slower between pokes |
| 'Rae' Gun | Stomp 12 frogs | Shoots slow, bright green balls that zap frogs far away (and smash breakables) |

Click (or **X** / **RB** / **RT**) uses whatever Rae is holding. Willow calls out when a weapon unlocks.
Change unlock rules and lines in the `WEAPONS` list in `js/shop.js`; reach, cooldowns and ball speed
are at the top of `js/weapons.js`. Both shops close in the Frogpocalypse, so it's paws only there.

## Achievements
Click **🏆 Achievements** on the main menu (or press **Y** on a controller) to see them. There's
room for 9; eight exist so far:

| Achievement | How to earn it |
|-------------|----------------|
| 🚽 Just in Time! | Beat Carrotventure (all 20 carrots, then the toilet) |
| 👑 Frog Slayer | Beat Frogpocalypse (defeat Jiggle Jaggle, Fraggle Friggle and Tiggle Taggle) |
| 🕊️ Pacifist | Beat Carrotventure without popping a single frog (no stomps, punches, pokes or zaps) |
| 🎯 Friendly Fire | Zap a frog with the 'Rae' Gun while it's waving at Rae in her frog face shirt |
| 🫧 Spin Cycle | Stay in the washing machine drum for 10 seconds (the door slams shut!) |
| 🦈 Snack Time | Stay in the bath water for 10 seconds (Ducky gets hungry...) |
| ☁️ Tiny but Mighty | Beat Flopsy Mode |
| 🐭 Scrumbly Secret | See the fireplace mice dance (wait by the mouse hole...) |

A gold popup appears when you earn one. They're remembered on that computer and browser. Add more
in `ACHIEVEMENTS` at the top of `js/achievements.js`, and call `Achievements.unlock("their-id")`
wherever they're earned.

## Don't stay too long...
- **The washing machine** (kitchen): after 5 seconds in the drum Rae says she should get out. After
  10 the door slams shut, the screen goes blue and it's game over: "Rae got washed! Poor Rae!"
- **The bath**: Ducky (a toy shark who thinks he's a duck, with an orange bill to prove it) floats
  in the bath and turns to watch Rae. After 5 seconds in the water he says he smells food. After 10
  he lunges, the screen goes red, and it's game over: "Rae got eaten by Ducky! Poor Rae!"

Hopping out resets the timer. The times and lines are in the "Traps" part of `js/main.js`.

## The fireplace mice (`js/mice.js`)
The living room fireplace is a little sooty nook Rae can walk into, with a tiny black mouse hole at
the back ("Ooh, that looks like a mouse hole!"). Stay there for 5 seconds and a little white mouse
pokes its head out for a look, then ducks back in. Wait 10 seconds more and two mice scurry out
and do a little dance (that's the 🐭 **Scrumbly Secret** achievement). Hit them while they're
dancing and they both go POP (for good). Otherwise they scurry home afterwards, and will come out
again if you wait. The timings are at the top of `Mice` in `js/mice.js`.

## Frogs
Seven plush frogs, each a different colour: bedroom, bathroom, living room (two), office, kitchen (two).
When one spots Rae it says one of its lines in red (the list is at the top of `js/frog.js`) and hops
slowly after her. Land on its head to pop it (silly squeak, and Rae bounces off). Touch one any other way
and Rae loses a heart. Wander about 16m away from where a frog lives and it comes back, good as new,
in a new random colour.

**Mini frogs:** each time a frog spawns there's a small chance (6%, `MINI_FROG_CHANCE` in `js/frog.js`)
it's a mini frog: 60% of the size (harder to land on), about twice as fast, hops much higher, spots Rae
from further away, zig-zags while chasing, and shouts in a squeaky voice.

## Hearts
Rae has 3 hearts (top right). Carrots heal a heart, in every mode. Getting hurt loses one, flashes the screen red and knocks her back; then
she's safe for 1.5 seconds (her paws blink). Out of hearts: a summary screen ("Rae needs a nap!") shows
carrots collected, things smashed and frogs stomped, with a "Play again" button that restarts the game.
Tweak `MAX_HEARTS` and `HURT_COOLDOWN` in `js/main.js`.
Add more in `js/house.js`: `w.addFrog(x, y, z, FROG_COLORS.pink);`

## Rae's first-time thoughts
Each plays only the first time it happens. They're all listed together in `RAE_LINES` in `js/main.js`:
change the words there. Some examples:

| When | She says |
|------|----------|
| First bounce on the bed / sofa | Bounce! Bounce! BOUNCE! / Sofa, so good! |
| First carrot / all carrots | Yummers mode! / All the carrots! Best day ever! |
| First smash of a door, book, bowl, glass, lamp, can, clothes, plant | Coming through! / Who needs books anyway? / Oopsie! Butterpaws! / ... |
| First frog spots her / first frog popped | Eep! A frog! / Pop goes the frog! Rabbits rule! |
| First hurt / down to one heart | Ouch! Frogs are slimy! / Uh oh, I need a carrot... |
| First time in the bath, on the mirror table, living room, office, kitchen | My fur is wet! / Who's that cute bunny?! / ... |

For a new smashable thing, add a `"smash-<its name>"` line. For a new place, add a zone in `js/house.js`
(`w.addZone("name", x1, x2, y1, y2, z1, z2)`) and a `"zone-<name>"` line.

## Adding things
In `js/house.js`, inside a room's build function (`w` is the world). Ground floor is y = 0, the kitchen level is y = -1.2.

```js
// solid box you can hop onto, giving its edges: from x1 to x2, y1 to y2, z1 to z2
w.addSpan("cushion", 1.6, 2.4, 0, 0.3, 0.6, 1.4, COLORS.lilac);

// something springy, like the bed
w.addSpan("beanbag", -2.5, -1.5, 0, 0.5, 1.5, 2.5, COLORS.butter, { bouncy: true, bouncePower: 5 });

// decoration only (Rae passes through it)
w.addDeco("poster", 3.97, 4, 1.2, 2.2, 1, 2, COLORS.canPink);

// a wall with a doorway in it (gets a breakable door automatically; add door: false for an open doorway)
w.addWall("wall", -4, 4, 0, 3, 10, 10.5, COLORS.livingWall, [{ from: -1, to: 0.2, top: 2.1 }]);

// any small breakable thing, built from simple parts (see makeThing in js/props.js)
w.add(makeThing("mug", 1, 0, 1, [["cyl", [0.06, 0.055, 0.13], [0, 0.065, 0], COLORS.book1]]));

// ready-made breakables (x, height of the surface, z): see js/props.js
w.add(makeCan(1, 0, 1, COLORS.canMint));
w.add(makeGlass(1.2, 0, 1));
w.add(makeLamp(1.4, 0, 1));

// another carrot
w.add(new Carrot(3, 0.35, 3));

// an oval mirror: centre x, y, z, width, height, which way it faces
w.addOvalMirror(0, 1.8, -3.97, 0.9, 1.1, "+z");

// a rectangular (full-length) mirror
w.addRectMirror(0, 1.3, -3.97, 1.2, 2.4, "+z");
```

## Screen size (TVs)
All the on-screen bits are scaled up for bigger screens and kept away from the edges. To make
everything bigger or smaller, change `--ui` (in-game bits) and `--ui-card` (menus, shop, end
screens) in the "UI SIZE" section at the bottom of `style.css`.

## Dialogue
Every line has at least three variations, picked at random, so each playthrough sounds a bit
different. Rae's are in `RAE_LINES` (`js/main.js`), Flopsy's and the outfits' in `js/shop.js`,
the frogs' and Jiggle Jaggle's at the top of `js/frog.js`. Punch Flopsy and she jumps and squeaks.

## Mirrors
Real reflecting mirrors (Rae's body only shows up in these): the oval vanity mirror over the white
table, the wardrobe's mirror door, the full-length mirror on the corridor's side door, the mirror over
the bathroom sink, and a small one standing on the black side table by the sofa, leaning against the wall (hop onto the table from the sofa arm).

**Graphics setting (for slower computers):** the main menu and pause screen have a 🖥️ Graphics switch
(controller: X cycles through them). "Detailed" has sharp mirrors that update every frame; "Faster"
uses tiny, softer reflections that update every third frame; "Fastest" turns reflections off
completely (mirrors become plain glazed glass). Faster and Fastest also draw the game at normal
resolution on sharp (high-DPI) laptop screens. The choice is remembered on that computer.

**What else keeps it running smoothly** (in case you add things):
- Only the 4 room lamps nearest Rae are switched on (`World.LAMPS` in `js/world.js`); lights are the
  most expensive thing to draw.
- Mirrors never redraw each other, and mirrors more than 9 m away keep their last picture (`Mirror.FAR`).
- Walls, floors and furniture of the same colour share one material (`sharedPastel` in `js/props.js`),
  and things that never move are "frozen" after the house is built (`world.freezeStatic()`). If you
  add something that moves, make it a `Prop` subclass (like `Carrot`) or add its name to `MOVING`.
- Rae and the frogs only check for bumping into things near them (`world.solidsNear`).

## The garden and the climbing tree (`js/garden.js`)
The living room window (by the TV) and the office window (above the desk) are open. Climb out onto the
tree that stands between them: low branch -> middle branch -> the big fork round the trunk -> the high
branch, or hop across to the side branch with the bird's nest, then down the branch to the other window.
Three carrots up there (the fork, the high branch, the nest). The garden below is just scenery: fall
off and Rae loses a heart and pops back in through the window she climbed out of.
