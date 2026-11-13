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
| `js/props.js` | The `Prop` class (every object), colours, the `Carrot` collectible |
| `js/world.js` | Builds the rooms and lights |
| `js/player.js` | Rae's controls, hopping and collision (tweak speed/hop here) |
| `js/main.js` | Starts everything and runs the game loop |

## Adding a prop
In `js/world.js`, inside a build function:

```js
// solid box you can hop onto: name, x, y, z (centre), width, height, depth, colour
this.addBox("cushion", 2, 0.15, 1, 0.8, 0.3, 0.8, COLORS.lilac);

// mark it breakable (breaking comes in a later step)
this.addBox("vase", -2, 0.2, 1, 0.3, 0.4, 0.3, COLORS.butter, { breakable: true });

// another collectible carrot
this.add(new Carrot(3, 0.35, 3));
```
