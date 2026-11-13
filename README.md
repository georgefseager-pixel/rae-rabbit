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
| `js/world.js` | The building toolbox: boxes, walls with doorways, windows, lights |
| `js/house.js` | **The house itself**: one build function per room |
| `js/player.js` | Rae's controls, hopping, stairs and collision (tweak speed/hop here) |
| `js/main.js` | Starts everything and runs the game loop |

## The house (follows the real floorplan, at about 2x size)
- **Bedroom**: king-sized bed (run underneath, bounce on top), two bedside tables (reach them from the bed), the wide white table opposite (big bounce off the foot of the bed), a stool under it, two windows above the bed.
  - Breakables: a lamp and a glass on each bedside table, five cans on the white table, six little clothes piles on the floor (one kicked under the bed).
  - Carrots: above the bed, under the bed, on the white table.
- **Corridor**: from the bedroom door to the living room, with the (closed) fire exit.
- **Bathroom** (off the corridor): hollow bath you can hop into, toilet (seat → cistern makes a little climb), pedestal sink with mirror.
  - Carrots: one in the bath, one in the sink (hop from the bath's end onto the sink).
- **Living room**: chimney breast with fireplace and a mantelpiece, window, and the doorway to the stairs.
- **Stairs**: six steps down to the kitchen level (1.2m lower). Rae walks up and down them; no hopping needed.
- **Office** (the small bedroom on the plan): at the bottom of the stairs, door facing the stairs, window.
- **Kitchen**: L-shape wrapping round the office. Tall counters along two walls with a sink, hob and windows; a (closed) back door.
- **Doors**: every doorway has a door that smashes to pieces when Rae touches it.

## Rae's first-time thoughts
| When | She says |
|------|----------|
| First bounce on the bed | Bounce! Bounce! BOUNCE! |
| First carrot | Yummers mode! |
| First door smashed | Coming through! |
| First time in the bath | My fur is wet! |

New ones go in `js/main.js` (look for "Rae's first-time thoughts").

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

// ready-made breakables (x, height of the surface, z): see js/props.js
w.add(makeCan(1, 0, 1, COLORS.canMint));
w.add(makeGlass(1.2, 0, 1));
w.add(makeLamp(1.4, 0, 1));

// another carrot
w.add(new Carrot(3, 0.35, 3));
```
