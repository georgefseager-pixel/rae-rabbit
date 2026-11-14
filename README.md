# 🐰 Rae Rabbit's Cosy Home

A little 3D first-person game: hop around as Rae Rabbit, collect carrots and smash things.

## How to play it
Double-click `index.html` to open it in your web browser (needs internet the first time, to load Three.js).
Pick a game mode from the main menu:

- **🥕 Carrotventure**: explore the house, find carrots, smash things, dress up at the Flopsy Shop.
  Eat all 20 carrots and... "Uh oh - too many carrots!" Get Rae to the toilet (hop onto the seat)
  for the **YOU WIN!** screen.
- **🐸 Frogpocalypse**: frogs pour in from all over the house, more and more as time goes on. The Flopsy
  Shop is boarded up and Flopsy has fled. The HUD shows frogs stomped and how long you've survived;
  every door starts smashed (nowhere to hide), frogs pop up even right in view. Survive **3 minutes** and **Boss Frog Jiggle Jaggle** (giant, with a crown)
  appears in the living room. He takes 3 hits (stomps or punches). Beat him for the **YOU WIN!** screen.
  Spawn rates, the frog limit and the boss time are at the top of `js/frogpocalypse.js`.

- **W A S D**: move
- **Mouse**: look around (or hold the button and drag, if the browser won't capture the mouse)
- **Space**: hop (press it just as you land on the bed for a big bounce)
- **G**: dance! Nearby frogs stop and dance along (not in the Frogpocalypse). Moving stops the dance.
- **Click**: punch! Smashes breakables and pops frogs just in front of Rae (tweak `PUNCH_REACH` and
  `PUNCH_RADIUS` in `js/main.js`)
- **Esc**: pause

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

**Mirror quality (for slower computers):** the main menu and pause screen have a 🪞 Mirrors switch
(controller: X). "Detailed" is sharp and updates every frame; "Faster" uses tiny, softer reflections
that update every third frame, which roughly doubles the frame rate near mirrors. The choice is
remembered on that computer.

## The garden and the climbing tree (`js/garden.js`)
The living room window (by the TV) and the office window (above the desk) are open. Climb out onto the
tree that stands between them: low branch -> middle branch -> the big fork round the trunk -> the high
branch, or hop across to the side branch with the bird's nest, then down the branch to the other window.
Three carrots up there (the fork, the high branch, the nest). The garden below is just scenery: fall
off and Rae loses a heart and pops back in through the window she climbed out of.
