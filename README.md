# 🐰 Rae Rabbit's Cosy Home

A little 3D first-person game: hop around as Rae Rabbit and collect things.

## How to play it
Double-click `index.html` to open it in your web browser (needs internet the first time, to load Three.js).

- **W A S D**: move
- **Mouse**: look around
- **Space**: hop
- **Esc**: pause

## Where things live
| File | What it does |
|------|--------------|
| `index.html` | The page: canvas, start screen, loads the scripts |
| `style.css` | Look of the start screen and counter |
| `js/audio.js` | Sound effects made in code (boing, chime, crunch) |
| `js/dialogue.js` | Rae's thought bubble (top left). `Dialogue.sayOnce("id", "Text!")` |
| `js/props.js` | The `Prop` class (every object), colours, the `Carrot` collectible |
| `js/world.js` | Builds the rooms and lights |
| `js/player.js` | Rae's controls, hopping and collision (tweak speed/hop here) |
| `js/main.js` | Starts everything and runs the game loop |

## Rooms so far
- **Bedroom**: king-sized bed against the front wall (Rae can run underneath, and bounces on top; press Space as you land for a big bounce), doorway to the corridor on the right of the back wall (as you face it).
  - Two brown bedside tables either side of the bed, 1.35m tall: too high to hop onto from the floor, so bounce over from the bed.
  - A wide white table against the back wall, opposite the bed. Only reachable by a big bounce off the foot of the bed (press Space as you land, then run at it).

## Rae's first-time thoughts
| When | She says |
|------|----------|
| First bounce on the bed | Bounce! Bounce! BOUNCE! |
| First carrot | Yummers mode! |

New ones go in `js/main.js` (look for "Rae's first-time thoughts").

## Adding a prop
In `js/world.js`, inside a build function. Floor is y = 0; the front wall is negative z.

```js
// solid box you can hop onto: name, x, y, z (centre), width, height, depth, colour
this.addBox("cushion", 2, 0.15, 1, 0.8, 0.3, 0.8, COLORS.lilac);

// same thing, but giving edges instead: from x1 to x2, y1 to y2, z1 to z2
this.addSpan("cushion", 1.6, 2.4, 0, 0.3, 0.6, 1.4, COLORS.lilac);

// something springy, like the bed
this.addBox("beanbag", -2, 0.25, 2, 1, 0.5, 1, COLORS.butter, { bouncy: true, bouncePower: 5 });

// mark it breakable (breaking comes in a later step)
this.addBox("vase", -2, 0.2, 1, 0.3, 0.4, 0.3, COLORS.butter, { breakable: true });

// another collectible carrot
this.add(new Carrot(3, 0.35, 3));
```
