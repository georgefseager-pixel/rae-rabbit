// ================= Terrain & maps =================
// Legend: . open ground  F light cover  M heavy cover  W river  B bridge  T fort (heals)  X wall
// The rules for each letter are the same everywhere; a map's theme changes how it looks and what it is called.
const TER = {
  '.': {def:0, avo:0,  cost:1},
  'F': {def:1, avo:20, cost:2},
  'M': {def:2, avo:30, cost:3},
  'W': {def:0, avo:0,  cost:99},
  'B': {def:0, avo:0,  cost:1},
  'T': {def:2, avo:20, cost:1, heal:true},
  'X': {def:0, avo:0,  cost:99},
};
const THEMES = {
  meadow: {
    '.': ['Meadow Patch', 'Soft green felt, well trodden.'],
    'F': ['Felt Thicket', 'Felt pines, hand-cut. Good cover.'],
    'M': ['Pillow Hills', 'Stacked cushions. Hard going, harder to hit.'],
    'W': ['Satin River', 'A ribbon of blue satin. No one swims in satin.'],
    'B': ['Lolly-Stick Bridge', 'Lolly sticks and glue. It holds.'],
    'T': ['Block Fort', 'Toy blocks, stacked high. Restores 20% HP at the start of each phase.'],
    'X': ['Spool Wall', 'Cotton reels stacked high. Nothing gets through.'],
  },
  mine: {
    '.': ['Tunnel Floor', 'Packed earth, worn smooth by a thousand rabbit feet.'],
    'F': ['Rubble', 'Broken rock. Something to crouch behind.'],
    'M': ['Ore Heap', 'A day\'s digging, piled high. Hard to climb, harder to hit.'],
    'W': ['Flooded Shaft', 'Black water. Nobody goes in.'],
    'B': ['Plank Walk', 'Boards over the flooded shaft.'],
    'T': ['Guard Post', 'A frog post with water and bandages. Restores 20% HP at the start of each phase.'],
    'X': ['Rock Wall', 'Solid stone.'],
  },
  camp: {
    '.': ['Camp Yard', 'Bare dirt, stamped flat by roll calls.'],
    'F': ['Crates', 'Ore crates waiting for the carts. Good cover.'],
    'M': ['Spoil Heap', 'Waste rock from the mine. Hard going, harder to hit.'],
    'W': ['Drainage Ditch', 'Too deep and too foul to cross.'],
    'B': ['Footbridge', 'Planks over the ditch.'],
    'T': ['Watch Post', 'A raised frog post. Restores 20% HP at the start of each phase.'],
    'X': ['Palisade', 'Sharpened stakes, lashed tight.'],
  },
};
// Map: {theme, names?: per-letter name overrides, rows}
const MAPS = {
  lowerSeam: {theme: 'mine', rows: [
    "XXX..XXX",
    "X......X",
    "X.F..T.X",
    "X..XX..X",
    "...XX...",
    "X.....FX",
    "XX.M..XX",
    "X......X",
    "X.F..X.X",
    "X....X.X",
    "XX....XX",
    "XXX..XXX"]},
  bunkhouses: {theme: 'camp', rows: [
    "X..XX..X",
    "........",
    ".XX..XX.",
    ".XX..XX.",
    "...F....",
    "F......F",
    "..X..X..",
    "..X..X..",
    "........",
    ".F....F.",
    "...T....",
    "X......X"]},
  gallowsYard: {theme: 'camp', names: {'T': ['The Gallows', 'The platform where rabbits are unstitched. Restores 20% HP to whoever holds it.']}, rows: [
    "XX.TT.XX",
    "X......X",
    "..F..F..",
    "........",
    ".MM..MM.",
    "........",
    "F..XX..F",
    "........",
    "..F..F..",
    "X......X",
    "........",
    "XX....XX"]},
  tower: {theme: 'camp', names: {'T': ['Overseer\'s Tower', 'Rhubarb\'s tower above the gate. Restores 20% HP at the start of each phase.']}, rows: [
    "X.XTTX.X",
    "X......X",
    "XXX..XXX",
    "..F..F..",
    "........",
    "M......M",
    "..X..X..",
    "........",
    ".F....F.",
    "........",
    "..F..F..",
    "........"]},
  outerCamp: {theme: 'camp', rows: [
    "X......X",
    "..F..F..",
    ".XX..XX.",
    "........",
    "F..MM..F",
    "........",
    ".XX..XX.",
    ".XX..XX.",
    "........",
    "..F..F..",
    "...T....",
    "X......X"]},
  ridge: {theme: 'meadow', names: {'M': ['Ridge Rocks', 'Felt boulders on the ridge. Hard going, harder to hit.']}, rows: [
    "M.F..M.M",
    "..F...F.",
    "F..M....",
    "..MM.F..",
    "......MM",
    ".F..F...",
    "M...MM.F",
    "..F.....",
    ".M..F.M.",
    "...F....",
    "F..T...F",
    "M......M"]},
  ford: {theme: 'meadow', rows: [
    "MM.FT.MM",
    "M..F...M",
    "F...FF..",
    "..F....F",
    "WWBWWWBW",
    "F......F",
    ".FF..M..",
    "...F.MF.",
    "M......F",
    ".F..F...",
    "..T....F",
    "F......M"]},
};
let mapDef = null;   // the map being played (set by the battle engine)
const tileInfo = ch => (mapDef?.names?.[ch]) || THEMES[mapDef?.theme || 'meadow'][ch];
function validateMaps(){
  for (const [id, m] of Object.entries(MAPS)){
    if (!THEMES[m.theme]) console.error(`map ${id} has unknown theme ${m.theme}`);
    m.rows.forEach((row, y) => {
      if (row.length !== m.rows[0].length) console.error(`map ${id} row ${y} has ${row.length} tiles, expected ${m.rows[0].length}`);
      for (const ch of row) if (!TER[ch]) console.error(`map ${id} row ${y} has unknown terrain "${ch}"`);
    });
  }
}
