# 🐰 Rae Rabbit's Cosy Home

A little 3D first-person game: hop around as Rae Rabbit, collect carrots and smash things.

## How to play it
Double-click `index.html` to open it in your web browser (needs internet the first time, to load Three.js).

- **W A S D**: move
- **Mouse**: look around (or hold the button and drag, if the browser won't capture the mouse)
- **Space**: hop (press it just as you land on the bed for a big bounce)
- **Esc**: pause

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
| `js/frog.js` | The frogs: model, animations, spotting & chasing Rae, popping, respawning. Their lines are at the top |
| `js/world.js` | The building toolbox: boxes, walls with doorways, windows, lights |
| `js/house.js` | **The house itself**: one build function per room |
| `js/player.js` | Rae's controls, hopping, stairs and collision (tweak speed/hop here) |
| `js/main.js` | Starts everything and runs the game loop |

## The house (follows the real floorplan, at about 2x size)
- **Bedroom**: king-sized bed (run underneath, bounce on top), two bedside tables (reach them from the bed), the wide white table opposite (big bounce off the foot of the bed) with an oval vanity mirror above it (hop up to see Rae!), a stool under it, two windows above the bed.
  - Breakables: a lamp and a glass on each bedside table, five cans on the white table, six little clothes piles on the floor (one kicked under the bed).
  - Carrots: above the bed, under the bed, on the white table.
- **Corridor**: from the bedroom door to the living room, with the (closed) fire exit.
- **Bathroom** (off the corridor): hollow bath you can hop into, toilet (seat → cistern makes a little climb), pedestal sink with mirror.
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
- **Office** (the small bedroom on the plan): at the bottom of the stairs, door facing the stairs, window.
- **Kitchen**: L-shape wrapping round the office. Tall counters along two walls with a sink, hob and windows; a (closed) back door.
- **Doors**: every doorway has a door that smashes to pieces when Rae touches it.

## Frogs
Seven plush frogs, each a different colour: bedroom, bathroom, living room (two), office, kitchen (two).
When one spots Rae it says one of its lines in red (the list is at the top of `js/frog.js`) and hops
slowly after her. Land on its head to pop it (silly squeak, and Rae bounces off). Touch one any other way
and Rae loses a heart. Wander about 16m away from where a frog lives and it comes back, good as new,
in a new random colour.

## Hearts
Rae has 3 hearts (top right). Getting hurt loses one, flashes the screen red and knocks her back; then
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
```
