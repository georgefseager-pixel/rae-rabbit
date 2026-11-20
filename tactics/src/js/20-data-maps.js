// ================= Terrain & maps =================
// Legend: . meadow  F felt thicket  M pillow hills  W satin river  B lolly-stick bridge  T block fort  X spool wall
const TER = {
  '.': {n:'Meadow Patch',       def:0, avo:0,  cost:1,  note:'Soft green felt, well trodden.'},
  'F': {n:'Felt Thicket',       def:1, avo:20, cost:2,  note:'Felt pines, hand-cut. Good cover.'},
  'M': {n:'Pillow Hills',       def:2, avo:30, cost:3,  note:'Stacked cushions. Hard going, harder to hit.'},
  'W': {n:'Satin River',        def:0, avo:0,  cost:99, note:'A ribbon of blue satin. No one swims in satin.'},
  'B': {n:'Lolly-Stick Bridge', def:0, avo:0,  cost:1,  note:'Lolly sticks and glue. It holds.'},
  'T': {n:'Block Fort',         def:2, avo:20, cost:1,  note:'Toy blocks, stacked high. Restores 20% HP at the start of each phase.', heal:true},
  'X': {n:'Spool Wall',         def:0, avo:0,  cost:99, note:'Cotton reels stacked to the rafters. Nothing gets through.'},
};
const MAPS = {
  stitchwater: [
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
    "F......M"],
  mills: [
    "X..X.T.X",
    "...X....",
    ".F.XX.F.",
    "........",
    "XX..XX.X",
    "...F....",
    ".X....X.",
    ".X.FF.X.",
    "........",
    "XXX..XXX",
    "..F.....",
    "....T..."],
  hollow: [
    "F.F..F.F",
    ".F..F...",
    "..F...F.",
    "F...M..F",
    ".F.MMM..",
    "F..MTM..",
    "..F...F.",
    "F......F",
    ".F.FF.F.",
    "..F..F..",
    "F.F..F.F",
    ".F....F."],
  lilyhaven: [
    "MM.TT.MM",
    "MX....XM",
    ".X.FF.X.",
    ".XX..XX.",
    "WWWBBWWW",
    "F......F",
    "..F..F..",
    ".M....M.",
    "...FF...",
    ".F....F.",
    "....T...",
    "F......F"],
  pantry: [
    "..X..X..",
    ".F.....F",
    "..XXXX..",
    "........",
    "F.X..X.F",
    "..X..X..",
    "........",
    ".XX..XX.",
    "........",
    "F...T..F",
    "........",
    "..F..F.."],
  reedwall: [
    "M..TT..M",
    "........",
    ".F....F.",
    "XX.XX.XX",
    "........",
    "F.F..F.F",
    "........",
    ".F.MM.F.",
    "........",
    "F..F...F",
    "..F..F..",
    "........"],
};
function validateMaps(){
  for (const [id, m] of Object.entries(MAPS)){
    m.forEach((row, y) => {
      if (row.length !== m[0].length) console.error(`map ${id} row ${y} has ${row.length} tiles, expected ${m[0].length}`);
      for (const ch of row) if (!TER[ch]) console.error(`map ${id} row ${y} has unknown terrain "${ch}"`);
    });
  }
}
