// ================= Factions =================
// Each campaign is played as one faction; any faction can also be the enemy.
const FACTIONS = {
  rae:   {name: 'Raepublic',    currency: 'Thread', playerLine: 'THE RAEPUBLIC MARCHES',     enemyLine: 'THE REBELS ADVANCE',
          band: '#a8281f', text: '#f3e7cb', sub: '#f0c98a', coaster: 'rgba(150,32,28,.75)', stitch: 'rgba(239,227,200,.7)',
          fort: ['#b5302a', '#2e3d66'], letter: 'R'},
  frog:  {name: 'Friggliarchy', currency: 'Crowns', playerLine: 'THE FRIGGLIARCHY COMMANDS', enemyLine: 'THE FRIGGLIARCHY STIRS',
          band: '#2c4419', text: '#dbeeaa', sub: '#b9d27a', coaster: 'rgba(30,48,16,.8)', stitch: 'rgba(220,235,150,.6)',
          fort: ['#4c6e2a', '#6b4a8a'], letter: 'F'},
  mouse: {name: 'Scrumbly Mischief', currency: 'Crumbs', playerLine: 'THE MISCHIEF SCURRIES', enemyLine: 'THE MISCHIEF SCURRIES',
          band: '#4a3c34', text: '#f1e2d0', sub: '#d7b9a0', coaster: 'rgba(70,56,48,.8)', stitch: 'rgba(240,220,200,.6)',
          fort: ['#8a6a50', '#d8c8b0'], letter: 'S'},
};

// ================= Classes =================
// base = level 1 stats; g = growth % per level. Generic units scale from base by expected growth.
const CLASSES = {
  // Rabbits: mine workers with whatever they can grab
  captain:   {name: 'Ringleader',     w: 'sword', rng: [1,1], mt: 'foot',    wname: 'Stolen Sword',      base: {mhp:20,atk:11,def:5, spd:8,skl:7,mov:5}, g: {mhp:70,atk:45,def:30,spd:50,skl:45}},
  digger:    {name: 'Digger',         w: 'axe',   rng: [1,1], mt: 'foot',    wname: 'Pickaxe',           base: {mhp:22,atk:11,def:4, spd:5,skl:4,mov:5}, g: {mhp:80,atk:50,def:25,spd:35,skl:35}},
  hauler:    {name: 'Hauler',         w: 'lance', rng: [1,1], mt: 'foot',    wname: 'Cart Prod',         base: {mhp:20,atk:10,def:6, spd:4,skl:5,mov:5}, g: {mhp:75,atk:40,def:45,spd:25,skl:35}},
  // Republic soldiers: trained troops in Republic armour (art/troop-*.png; the battle pose follows the weapon)
  rfencer:   {name: 'Fencer',         w: 'sword', rng: [1,1], mt: 'foot',    wname: 'Republic Sword',    base: {mhp:19,atk:10,def:5, spd:8,skl:8,mov:5}, g: {mhp:65,atk:40,def:30,spd:55,skl:50}},
  rfighter:  {name: 'Fighter',        w: 'axe',   rng: [1,1], mt: 'foot',    wname: 'Republic Axe',      base: {mhp:23,atk:12,def:5, spd:5,skl:4,mov:5}, g: {mhp:80,atk:50,def:30,spd:30,skl:35}},
  rlancer:   {name: 'Lancer',         w: 'lance', rng: [1,1], mt: 'foot',    wname: 'Republic Spear',    base: {mhp:21,atk:10,def:7, spd:5,skl:6,mov:5}, g: {mhp:75,atk:40,def:45,spd:30,skl:40}},
  rarcher:   {name: 'Bowrabbit',      w: 'bow',   rng: [2,2], mt: 'foot',    wname: 'Republic Bow',      base: {mhp:18,atk:10,def:4, spd:6,skl:8,mov:5}, g: {mhp:60,atk:45,def:25,spd:40,skl:55}},
  radept:    {name: 'Adept',          w: 'tome',  rng: [1,2], mt: 'foot',    wname: 'Republic Primer',   base: {mhp:16,atk:10,def:2, spd:6,skl:7,mov:5}, g: {mhp:45,atk:50,def:10,spd:40,skl:50}},
  pebbler:   {name: 'Slinger',        w: 'bow',   rng: [2,2], mt: 'foot',    wname: 'Pebble Sling',      base: {mhp:17,atk:9, def:3, spd:6,skl:7,mov:5}, g: {mhp:55,atk:45,def:20,spd:45,skl:55}},
  // The Raepublic festive banner's soldiers (December): Republic troops in green and red, with festive kit
  xfencer:   {name: 'Knitter',        w: 'sword', rng: [1,1], mt: 'foot',    wname: 'Knitting Needle',   base: {mhp:19,atk:10,def:5, spd:8,skl:8,mov:5}, g: {mhp:65,atk:40,def:30,spd:55,skl:50}},
  xfighter:  {name: 'Log Splitter',   w: 'axe',   rng: [1,1], mt: 'foot',    wname: 'Yule Hatchet',      base: {mhp:23,atk:12,def:5, spd:5,skl:4,mov:5}, g: {mhp:80,atk:50,def:30,spd:30,skl:35}},
  xlancer:   {name: 'Pole Bearer',    w: 'lance', rng: [1,1], mt: 'foot',    wname: 'Tinsel Pike',       base: {mhp:21,atk:10,def:7, spd:5,skl:6,mov:5}, g: {mhp:75,atk:40,def:45,spd:30,skl:40}},
  xarcher:   {name: 'Snowballer',     w: 'bow',   rng: [2,2], mt: 'foot',    wname: 'Snowball Bow',      base: {mhp:18,atk:10,def:4, spd:6,skl:8,mov:5}, g: {mhp:60,atk:45,def:25,spd:40,skl:55}},
  xadept:    {name: 'Caroller',       w: 'tome',  rng: [1,2], mt: 'foot',    wname: 'Carol Sheet',       base: {mhp:16,atk:10,def:2, spd:6,skl:7,mov:5}, g: {mhp:45,atk:50,def:10,spd:40,skl:50}},
  runner:    {name: 'Runner',         w: 'sword', rng: [1,1], mt: 'foot',    wname: 'Sharpened Shears',  base: {mhp:18,atk:9, def:3, spd:9,skl:7,mov:6}, g: {mhp:60,atk:40,def:20,spd:60,skl:50}},
  patcher:   {name: 'Patcher',        w: 'staff', rng: [1,1], mt: 'foot',    wname: 'Darning Needle',    base: {mhp:16,atk:4, def:2, spd:6,skl:5,mov:5}, g: {mhp:50,atk:45,def:20,spd:50,skl:40}},
  quarter:   {name: 'Archer',         w: 'bow',   rng: [2,2], mt: 'foot',    wname: 'Longbow',           base: {mhp:18,atk:10,def:3, spd:7,skl:8,mov:5}, g: {mhp:60,atk:45,def:25,spd:45,skl:55}},
  tribune:   {name: 'Tribune',        w: 'lance', rng: [1,1], mt: 'foot',    wname: 'Liberty Spear',     base: {mhp:21,atk:10,def:6, spd:7,skl:9,mov:5}, g: {mhp:70,atk:40,def:40,spd:45,skl:55}},   // Froggle
  scholar:   {name: 'Scholar',        w: 'tome',  rng: [1,2], mt: 'foot',    wname: 'Book of Names',     base: {mhp:17,atk:10,def:2, spd:7,skl:8,mov:5}, g: {mhp:45,atk:50,def:10,spd:45,skl:55}},   // magic: tomes reach 1–2 tiles; scholars are soft-stitched (low HP and Def), so keep them behind the line
  // Frogs
  prince:    {name: 'Frog Prince',    w: 'sword', rng: [1,1], mt: 'foot',    wname: 'Royal Blade',      base: {mhp:19,atk:11,def:5, spd:9,skl:8,mov:5}, g: {mhp:65,atk:45,def:30,spd:55,skl:50}},
  roseknight:{name: 'Rose Knight',    w: 'lance', rng: [1,1], mt: 'mounted', wname: 'Rose Lance',        base: {mhp:24,atk:12,def:8, spd:7,skl:7,mov:7}, g: {mhp:70,atk:45,def:35,spd:40,skl:40}},   // Biggle's Rose Knight attire: on horseback
  gingerknight:{name: 'Gingerbread Knight', w: 'sword', rng: [1,1], mt: 'foot', wname: 'Candy Cane Rapier', base: {mhp:24,atk:12,def:7, spd:8,skl:9,mov:5}, g: {mhp:70,atk:45,def:30,spd:45,skl:45}},   // Biggle's Gingerbiggle attire (December)
  runaway:   {name: 'Runaway Scout',  w: 'lance', rng: [1,1], mt: 'foot',    wname: 'Ribboned Spear',    base: {mhp:20,atk:11,def:5, spd:8,skl:7,mov:5}, g: {mhp:65,atk:45,def:30,spd:50,skl:45}},   // Ilc (Raepublic December banner)
  lilyknight:{name: 'Lily Knight',    w: 'lance', rng: [1,1], mt: 'armor',   wname: 'Royal Halberd',     base: {mhp:26,atk:13,def:11,spd:3,skl:6,mov:4}, g: {mhp:80,atk:45,def:50,spd:15,skl:35}},
  lily:      {name: 'Pike Guard',     w: 'lance', rng: [1,1], mt: 'foot',    wname: 'Pike',              base: {mhp:19,atk:10,def:5, spd:4,skl:4,mov:5}, g: {mhp:70,atk:40,def:40,spd:25,skl:35}},
  bruiser:   {name: 'Club Guard',     w: 'axe',   rng: [1,1], mt: 'bog',     wname: 'Cudgel',            base: {mhp:20,atk:11,def:3, spd:4,skl:3,mov:5}, g: {mhp:80,atk:50,def:20,spd:30,skl:30}},
  reed:      {name: 'Tower Archer',   w: 'bow',   rng: [2,2], mt: 'foot',    wname: 'Reedbow',           base: {mhp:17,atk:10,def:3, spd:5,skl:6,mov:5}, g: {mhp:55,atk:45,def:20,spd:40,skl:50}},
  blade:     {name: 'Duellist',       w: 'sword', rng: [1,1], mt: 'foot',    wname: 'Pondsword',         base: {mhp:19,atk:11,def:4, spd:9,skl:8,mov:6}, g: {mhp:60,atk:40,def:25,spd:55,skl:55}},
  toadknight:{name: 'Armoured Guard', w: 'lance', rng: [1,1], mt: 'armor',   wname: 'Halberd',           base: {mhp:25,atk:12,def:10,spd:2,skl:5,mov:4}, g: {mhp:85,atk:45,def:55,spd:15,skl:35}},
  croaker:   {name: 'Croaker',        w: 'staff', rng: [1,1], mt: 'foot',    wname: 'Silt Censer',       base: {mhp:16,atk:5, def:2, spd:5,skl:5,mov:5}, g: {mhp:50,atk:45,def:20,spd:40,skl:40}},
  headsman:  {name: 'Executioner',    w: 'axe',   rng: [1,1], mt: 'foot',    wname: 'Headsman\'s Axe',   base: {mhp:26,atk:13,def:5, spd:4,skl:5,mov:4}, g: {mhp:80,atk:50,def:30,spd:25,skl:35}},
  // Fraggle Friggle's Black Guard (art/black-*.png; the battle pose follows the weapon)
  gblade:    {name: 'Black Blade',    w: 'sword', rng: [1,1], mt: 'foot',    wname: 'Guard Sabre',       base: {mhp:19,atk:11,def:5, spd:8,skl:8,mov:5}, g: {mhp:60,atk:40,def:30,spd:50,skl:50}},
  gaxe:      {name: 'Black Axe',      w: 'axe',   rng: [1,1], mt: 'foot',    wname: 'Thorn Axe',         base: {mhp:22,atk:12,def:4, spd:5,skl:4,mov:5}, g: {mhp:80,atk:50,def:25,spd:30,skl:30}},
  gpike:     {name: 'Black Pike',     w: 'lance', rng: [1,1], mt: 'foot',    wname: 'Pennant Pike',      base: {mhp:20,atk:10,def:6, spd:5,skl:5,mov:5}, g: {mhp:70,atk:40,def:45,spd:25,skl:35}},
  gscribe:   {name: 'Black Scribe',   w: 'tome',  rng: [1,2], mt: 'foot',    wname: 'Book of Thorns',    base: {mhp:16,atk:10,def:2, spd:6,skl:7,mov:5}, g: {mhp:45,atk:50,def:10,spd:40,skl:50}},
  gchaplain: {name: 'Black Chaplain', w: 'staff', rng: [1,1], mt: 'foot',    wname: 'Thorn Sceptre',     base: {mhp:16,atk:5, def:2, spd:5,skl:5,mov:5}, g: {mhp:50,atk:45,def:20,spd:40,skl:40}},
  // The festive banner's soldiers (December): frog scouts in elf green (★) or Santa red (★★)
  xblade:    {name: 'Elf Guard',      w: 'sword', rng: [1,1], mt: 'foot',    wname: 'Candy Sabre',       base: {mhp:19,atk:11,def:5, spd:8,skl:8,mov:5}, g: {mhp:60,atk:40,def:30,spd:50,skl:50}},
  xaxe:      {name: 'Holly Axe',      w: 'axe',   rng: [1,1], mt: 'foot',    wname: 'Holly Hatchet',     base: {mhp:22,atk:12,def:4, spd:5,skl:4,mov:5}, g: {mhp:80,atk:50,def:25,spd:30,skl:30}},
  xpike:     {name: 'Pennant Elf',    w: 'lance', rng: [1,1], mt: 'foot',    wname: 'Yule Pennant',      base: {mhp:20,atk:10,def:6, spd:5,skl:5,mov:5}, g: {mhp:70,atk:40,def:45,spd:25,skl:35}},
  xbow:      {name: 'Elf Archer',     w: 'bow',   rng: [2,2], mt: 'foot',    wname: 'Mistletoe Bow',     base: {mhp:17,atk:10,def:3, spd:6,skl:7,mov:5}, g: {mhp:55,atk:45,def:20,spd:45,skl:50}},
  xscribe:   {name: 'Carol Scribe',   w: 'tome',  rng: [1,2], mt: 'foot',    wname: 'Book of Carols',    base: {mhp:16,atk:10,def:2, spd:6,skl:7,mov:5}, g: {mhp:45,atk:50,def:10,spd:40,skl:50}},
  courier:   {name: 'Gift Courier',   w: 'sword', rng: [1,1], mt: 'foot',    wname: 'Candy Cane',        base: {mhp:17,atk:5, def:3, spd:9,skl:5,mov:4}, g: {mhp:40,atk:20,def:20,spd:30,skl:20}},   // December event: carries presents, runs for the road
  giftgiver: {name: 'Gift-Bringer',   w: 'tome',  rng: [1,2], mt: 'foot',    wname: 'The Naughty List',  base: {mhp:20,atk:11,def:4, spd:6,skl:9,mov:5}, g: {mhp:60,atk:50,def:25,spd:35,skl:55}},   // Chriggle Chraggle (December banner)
  marshlord: {name: 'Marsh Lord',     w: 'axe',   rng: [1,1], mt: 'bog',     wname: 'Black Cleaver',     base: {mhp:26,atk:13,def:6, spd:6,skl:7,mov:5}, g: {mhp:80,atk:50,def:30,spd:30,skl:40}},   // Fraggle Friggle
  overseer:  {name: 'Overseer',       w: 'bow',   rng: [2,2], lash: true, mt: 'foot',    wname: 'Overseer\'s Whip',        base: {mhp:28,atk:14,def:6, spd:5,skl:6,mov:4}, g: {mhp:80,atk:50,def:35,spd:30,skl:40}},
};
const STAT_KEYS = ['mhp','atk','def','spd','skl'];
// A whip (lash: true) counts as a bow: it reaches 2 tiles and can't strike up close.
const WTYPE = {sword: 'Sword', lance: 'Lance', axe: 'Axe', bow: 'Bow', staff: 'Staff', tome: 'Tome', whip: 'Whip'};
// Mag instead of Atk: staves (mending) and tomes (offensive magic).
const isMagic = w => w === 'staff' || w === 'tome';
const BEATS = {sword: 'axe', axe: 'lance', lance: 'sword', tome: 'bow'};   // and tomes beat bows
const triangle = (a, b) => BEATS[a] === b ? 1 : BEATS[b] === a ? -1 : 0;

// Weapon upgrades bought in the Armoury: each tier adds might (or mending power for staves).
const WEAPON_TIERS = [
  {prefix: '',            bonus: 0, cost: 0},
  {prefix: 'Reinforced ', bonus: 2, cost: 250},
  {prefix: 'Masterwork ', bonus: 4, cost: 600},
];

// ================= Plush looks (placeholder art drawn in code) =================
// Used for tokens everywhere, and for portraits until real art exists in art/.
const LOOKS = {
  // art: 'troop' draws them with the Republic soldier art (recoloured to their fur) instead of the mine-rabbit art
  soldierxm: {sp:'bun', art:'troopxm', ears:'lop', fur:'#c8a27a', light:'#e2c4a0', dark:'#8a6a4a', scarf:'#2e7a3c', gear:'none'},   // December: festive colours
  soldier:   {sp:'bun', art:'troop', ears:'lop', fur:'#c8a27a', light:'#e2c4a0', dark:'#8a6a4a', scarf:'#2c3559', gear:'none'},
  // art: 'black' draws them with Fraggle's Black Guard art (recoloured to their skin)
  // art: 'elf' draws them as the December frog scouts in elf green (recoloured to their skin; ★★ in Santa red)
  courier:   {sp:'frog', art:'elf', skin:'#a8b85a', light:'#c6d47e', dark:'#56622a', belly:'#e4ecb0', gear:'none'},
  blackguard: {sp:'frog', art:'black', skin:'#8fae3c', light:'#b0cc62', dark:'#4a5e1a', belly:'#d6e49a', gear:'kettle'},
  // Rabbits
  rae:       {sp:'bun', ears:'lop', fur:'#e2c79c', light:'#f4e3c2', dark:'#9c8058', scarf:'#b5302a', gear:'fist'},
  sister:    {sp:'bun', ears:'lop', fur:'#efe0c4', light:'#fbf3e3', dark:'#a8987a', gear:'none', small:true},
  willow:    {sp:'bun', ears:'up',  fur:'#a9a8a6', light:'#cfcecb', dark:'#6c6b69', scarf:'#3f5a3a', gear:'monocle'},
  tall:      {sp:'bun', ears:'up',  fur:'#b9a58c', light:'#d6c5ae', dark:'#7c6a54', scarf:'#6b5a48', gear:'none'},
  burly:     {sp:'bun', ears:'up',  fur:'#7a5a42', light:'#9a7a60', dark:'#4a3424', gear:'bandana', band:'#5a4a3a', big:true},
  old:       {sp:'bun', ears:'lop', fur:'#a8a29a', light:'#c8c2ba', dark:'#6a645c', scarf:'#4a4038', gear:'none'},
  swift:     {sp:'bun', ears:'up',  fur:'#c9a06a', light:'#e3c094', dark:'#8a6a42', scarf:'#6b5a48', gear:'none', small:true},
  patched:   {sp:'bun', ears:'lop', fur:'#d8c8b0', light:'#efe4d2', dark:'#9a8a72', scarf:'#7a6a58', gear:'heart'},
  worker:    {sp:'bun', ears:'up',  fur:'#b08a64', light:'#cfae88', dark:'#755a3e', scarf:'#6b5a48', gear:'none'},
  workerLop: {sp:'bun', ears:'lop', fur:'#9c9a96', light:'#c4c2be', dark:'#62605c', scarf:'#5a4a3a', gear:'none'},
  workerBig: {sp:'bun', ears:'up',  fur:'#6e4a30', light:'#8e6a4c', dark:'#422c1a', gear:'bandana', band:'#5a4a3a'},
  workerMend:{sp:'bun', ears:'lop', fur:'#e4d4bc', light:'#f4ead8', dark:'#a8967c', scarf:'#7a6a58', gear:'heart'},
  thin:      {sp:'bun', ears:'lop', fur:'#cfc4b4', light:'#e6ddd0', dark:'#8a7e70', gear:'none', small:true},
  bandit:    {sp:'bun', ears:'up', fur:'#efe8de', light:'#fbf7f1', dark:'#a89c8c', scarf:'#b5302a', gear:'bandana', band:'#b5302a'},
  // Rare recruits (placeholders)
  lantern:   {sp:'bun', ears:'up',  fur:'#d8b070', light:'#f0d098', dark:'#94743a', scarf:'#e0a030', gear:'bandana', band:'#e0a030'},
  condemned: {sp:'bun', ears:'lop', fur:'#efe8de', light:'#fbf7f1', dark:'#a89c8c', scarf:'#3a3436', gear:'mask'},
  ironear:   {sp:'bun', ears:'up',  fur:'#8c8c90', light:'#b0b0b4', dark:'#55555a', scarf:'#3a4a66', gear:'helm', big:true},
  duckweed:  {sp:'frog', skin:'#4f8a5a', light:'#71ac7c', dark:'#24452c', belly:'#bcd8b0', gear:'kettle', big:true},
  glimmer:   {sp:'frog', skin:'#7aa84a', light:'#9cc86c', dark:'#3c5a20', belly:'#d6e8a8', gear:'reed'},
  bogsworth: {sp:'frog', skin:'#5a7a4a', light:'#7c9c6c', dark:'#2c3e22', belly:'#c0cc9c', gear:'hood', hood:'#6a4a2a'},
  // Frogs
  tiggle:    {sp:'frog', skin:'#7bc043', light:'#a6dc72', dark:'#3d6a1e', belly:'#dcf0a8', gear:'circlet', small:true},
  biggle:    {sp:'frog', skin:'#8cb860', light:'#a9d07c', dark:'#4a6a2c', belly:'#d6e8a8', gear:'bandana', band:'#c8506a'},
  king:      {sp:'frog', skin:'#8cb860', light:'#a9d07c', dark:'#4a6a2c', belly:'#d6e8a8', gear:'crown', big:true},
  scout:     {sp:'frog', skin:'#6a8f3a', light:'#8cad55', dark:'#33491b', belly:'#c5d58c', gear:'reed', small:true},
  // Placeholders (art:'none' draws the felt plush, not the generic soldier art) until their art arrives
  ilc:       {sp:'frog', skin:'#9cbc5a', light:'#bcd87e', dark:'#4e6628', belly:'#e4eeb8', gear:'none', small:true},   // art/ilc-*.png
  chriggle:  {sp:'frog', skin:'#2f7a68', light:'#55a08c', dark:'#16443a', belly:'#f2ead8', gear:'crown', big:true},   // art/chriggle-*.png
  froggle:   {sp:'frog', skin:'#6f9a52', light:'#93bc74', dark:'#38552a', belly:'#dfe8c0', gear:'bandana', band:'#b5302a'},
  fraggle:   {sp:'frog', skin:'#26262c', light:'#4a4a54', dark:'#0b0b0e', belly:'#5c5c66', gear:'circlet', eye:'#c41e2a', big:true},
  patch:     {sp:'bun', ears:'up', fur:'#d8742a', light:'#ee9a52', dark:'#8a4214', scarf:'#2c3559', gear:'eyepatch'},
  rhubarb:   {sp:'frog', skin:'#d9779a', light:'#f2a7c2', dark:'#7e3352', belly:'#f8d6e2', gear:'cap', big:true},
  headsman:  {sp:'frog', skin:'#46603a', light:'#647e52', dark:'#1f2c18', belly:'#a9b68c', gear:'hood', hood:'#151214', big:true},
  guard:     {sp:'frog', skin:'#5e8a3c', light:'#80aa5a', dark:'#2f4a1e', belly:'#bfd38a', gear:'kettle'},
  bruiser:   {sp:'frog', skin:'#4f7f33', light:'#6f9c48', dark:'#2a4519', belly:'#a9c46c', gear:'collar'},
  reed:      {sp:'frog', skin:'#6a8f3a', light:'#8cad55', dark:'#33491b', belly:'#c5d58c', gear:'reed'},
  duelist:   {sp:'frog', skin:'#66a83e', light:'#8cc862', dark:'#33591d', belly:'#d0e79a', gear:'bandana', band:'#2e5f9a'},
  toadknight:{sp:'frog', skin:'#557a36', light:'#76984f', dark:'#2a3f17', belly:'#b6c681', gear:'kettle', big:true},
  croaker:   {sp:'frog', skin:'#5d7e3e', light:'#7fa05c', dark:'#2d421b', belly:'#bccb8c', gear:'hood'},
};
const CLASS_LOOK = {
  xfencer:'soldierxm', xfighter:'soldierxm', xlancer:'soldierxm', xarcher:'soldierxm', xadept:'soldierxm',
  rfencer:'soldier', rfighter:'soldier', rlancer:'soldier', rarcher:'soldier', radept:'soldier',
  captain:'worker', digger:'workerBig', hauler:'worker', pebbler:'workerLop', runner:'worker', patcher:'workerMend', quarter:'workerLop',
  lily:'guard', bruiser:'bruiser', reed:'reed', blade:'duelist', toadknight:'toadknight', croaker:'croaker', headsman:'headsman', overseer:'rhubarb', marshlord:'fraggle', tribune:'froggle', roseknight:'biggle', gingerknight:'biggle', courier:'courier', giftgiver:'chriggle', runaway:'ilc', xblade:'courier', xaxe:'courier', xpike:'courier', xbow:'courier', xscribe:'courier',
  gblade:'blackguard', gaxe:'blackguard', gpike:'blackguard', gscribe:'blackguard', gchaplain:'blackguard',
};

// ================= Named characters =================
// Rabbits in the camps are not allowed names; the descriptors below are how the player tells them apart.
// rarity: stars for a named character who isn't ★★★ (the camp rabbits are ordinary ★ soldiers).
// crop: how front-portrait art is framed in the small panel and in dialogue.
const CHARACTERS = {
  // Raepublic
  rae:     {name:'Rabbit', faction:'rae', cls:'captain', lv:1, stats:{mhp:20,atk:11,def:5,spd:8,skl:7,mov:5}, lord:true, outfit:'camp',
            retort:'Come and find out.'},
  tall:    {name:'Tall Rabbit', rarity:1, fur:'sandy', generic:'standard', faction:'rae', cls:'hauler', lv:1, stats:{mhp:20,atk:10,def:6,spd:5,skl:5,mov:5}},
  burly:   {name:'Burly Rabbit', rarity:1, fur:'chocolate', faction:'rae', cls:'digger', lv:1, stats:{mhp:23,atk:12,def:4,spd:4,skl:4,mov:5}},
  old:     {name:'Old Rabbit', rarity:1, fur:'grey', elderly:true, faction:'rae', cls:'pebbler', lv:2, stats:{mhp:17,atk:9,def:3,spd:6,skl:8,mov:5}},
  swift:   {name:'Swift Rabbit', rarity:1, fur:'ginger', faction:'rae', cls:'runner', lv:1, stats:{mhp:18,atk:9,def:3,spd:10,skl:7,mov:6}},
  patched: {name:'Patched Rabbit', rarity:1, fur:'cream', faction:'rae', cls:'patcher', lv:1, stats:{mhp:16,atk:4,def:2,spd:6,skl:5,mov:5}},
  sister:  {name:'Little Sister', faction:'rae', look:'sister', outfit:'camp', cls:'patcher', wname:'Sewing Needle', lv:2,   // joins mid-battle in R1-4; Flopsy Flora from Chapter Two
            stats:{mhp:17,atk:5,def:2,spd:8,skl:6,mov:5}, retort:'I\'m not scared of you! …Much.'},
  froggle:  {name:'Froggle', faction:'rae', look:'froggle', cls:'tribune', lv:4, stars:3, stats:{mhp:24,atk:12,def:7,spd:7,skl:10,mov:5},   // founder of the Republic; recruited from the second Raepublic banner
             retort:'Every rabbit you ever chained, I wrote down. Every one.',
             intro:{title:'Founder of the Republic', text:'She kept the ledgers for the crown\'s mines, until one night the numbers stopped adding up. For years after, she kept the Republic hidden in the woods. She has handed it to Rae now, and picked up a spear instead.'}},
  patch:    {name:'Patch', faction:'rae', look:'patch', cls:'rfighter', wname:'Corporal\'s Axe', lv:4, stars:3, stats:{mhp:27,atk:13,def:7,spd:6,skl:6,mov:5},   // one-eyed Republic corporal; second Raepublic banner
             retort:'Only the one eye left, frog, and it\'s on you!',
             intro:{title:'Corporal, East Company', text:'He has marched at the front of the Republic\'s columns longer than anyone, and been caught by the frogs more times than he will admit. One of those times cost him an eye. He laughs about it. He laughs about most things.'}},
  ilc:      {name:'Ilc the Scout', faction:'rae', look:'ilc', cls:'runaway', lv:3, stars:3, stats:{mhp:23,atk:12,def:6,spd:9,skl:8,mov:5},   // December banner only: a frog scout who defected
             retort:'Sorry! Sorry. I\'m on the other side now. Merry festival, though!',
             intro:{title:'The Runaway Scout', text:'A young frog scout who spent every December carrying presents past the mine camps to frog children, and never once to a rabbit. This year he walked his sack straight through the Raepublic\'s gate instead. He has not been back.'}},
  willow:  {name:'Willow', fur:'grey', faction:'rae', cls:'scholar', lv:5, stats:{mhp:19,atk:12,def:2,spd:8,skl:11,mov:5}},
  // Friggliarchy
  tiggle:  {name:'Tiggle Taggle', faction:'frog', cls:'prince', lv:1, stats:{mhp:19,atk:11,def:5,spd:9,skl:8,mov:5}, lord:true, retort:'I\'m not afraid of you.'},
  // Rare recruits from the Recruit banners. stars:3 marks them as gacha units; placeholder:true ones have no art yet.
  // intro: the card shown the first time you recruit them (title + a few sentences). Important for characters
  // you never meet in the main story.
  brigand:  {name:'Brigand', faction:'rae', look:'bandit', cls:'digger', lv:3, stars:3, stats:{mhp:27,atk:15,def:5,spd:7,skl:7,mov:5},
             retort:'Ha! Swing harder, little prince.',
             intro:{title:'Bandit of the Mine Road', text:'He has robbed the crown\'s supply carts on the Mine Road for years and never once been caught. He calls it freedom. Lately he has started to wonder whether that\'s all it is.'}},
  condemned:{name:'The Condemned', faction:'rae', look:'condemned', cls:'runner', wname:'Broken Shackles', lv:3, stars:3, stats:{mhp:23,atk:13,def:5,spd:12,skl:10,mov:6},
             retort:'I\'ve been closer to the axe than you\'ll ever get.',
             intro:{title:'Next for the Block', text:'He was waiting in chains for his turn at the block the morning Rae stopped the Executioner. He says he owes her his life. No one has seen his face. He has never taken off the hood, and he will not say why.'}},
  lantern:  {name:'Lantern Rabbit', fur:'ginger', faction:'rae', cls:'runner', lv:3, stars:3, placeholder:true, stats:{mhp:22,atk:12,def:5,spd:11,skl:10,mov:6}, retort:'I\'ve seen darker tunnels than you.',
             intro:{title:'Placeholder character', text:'A ginger rabbit who knows the deep tunnels by lamplight. Their story is still to be written.'}},
  ironear:  {name:'Iron-Eared Rabbit', fur:'grey', faction:'rae', cls:'hauler', lv:3, stars:3, placeholder:true, stats:{mhp:26,atk:12,def:10,spd:5,skl:7,mov:5},
             intro:{title:'Placeholder character', text:'A grey rabbit with an iron ear, and a hauler\'s strength. Their story is still to be written.'}},
  duckweed: {name:'Dame Duckweed', faction:'frog', cls:'toadknight', lv:3, stars:3, placeholder:true, stats:{mhp:30,atk:14,def:13,spd:3,skl:7,mov:4},
             intro:{title:'Placeholder character', text:'A toad knight of the Lily Court. Her story is still to be written.'}},
  glimmer:  {name:'Captain Glimmer', faction:'frog', cls:'reed', lv:3, stars:3, placeholder:true, stats:{mhp:21,atk:13,def:5,spd:8,skl:11,mov:5},
             intro:{title:'Placeholder character', text:'A captain of the reed archers. Their story is still to be written.'}},
  bogsworth:{name:'Brother Bogsworth', faction:'frog', cls:'croaker', lv:3, stars:3, placeholder:true, stats:{mhp:21,atk:8,def:4,spd:6,skl:7,mov:5},
             intro:{title:'Placeholder character', text:'A croaker of the Friggliarchy. His story is still to be written.'}},
  rhubarb:     {name:'Rhubarb', faction:'frog', look:'rhubarb', cls:'overseer', lv:3, stars:3, stats:{mhp:26,atk:13,def:6,spd:6,skl:7,mov:5},
                retort:'Back down that seam wi\' you, love. And mind the lash on yer way.',
                intro:{title:'Overseer of the Mines', text:'She keeps the crown\'s mine camp digging, with her lash and with stories. Every morning the rabbits hear about Rae the monster. Her whip reaches further than you\'d expect.'}},
  executioner: {name:'The Executioner', faction:'frog', look:'headsman', cls:'headsman', lv:3, stars:3, stats:{mhp:27,atk:14,def:6,spd:4,skl:6,mov:4},
                retort:'Nothing personal. It never is.',
                intro:{title:'The Crown\'s Headsman', text:'He carries out the crown\'s sentences at the block and has never once asked what they were for. He does not hurry, and he does not miss.'}},
  fragglejr:   {name:'Fraggle Jr.', faction:'frog', look:'fraggle', artFrom:'fraggle', cls:'marshlord', lv:3, stars:3, stats:{mhp:26,atk:13,def:6,spd:6,skl:7,mov:5},
                retort:'Father shouted too. It didn\'t help him.',
                intro:{title:'Son of the Black Frog', text:'Fraggle Friggle\'s only son. He came to the war camp with a letter from the crown, his father\'s coat, and very little to say. He watches everything. He has never once asked how his father died.'}},
  chriggle:    {name:'Chriggle Chraggle', faction:'frog', look:'chriggle', cls:'giftgiver', lv:3, stars:3, stats:{mhp:25,atk:13,def:5,spd:6,skl:10,mov:5},   // December banner only
                retort:'Ho ho ho. Oh dear. Oh dear, oh dear. You\'re on the list.',
                intro:{title:'The First Gift-Bringer', text:'Friggle Fraggle\'s legendary ancestor, who started the festive gift-giving centuries ago. Nobody can explain how he is still about. He turns up every December with a sack, a beard and a very long list, and nobody has ever dared ask him to leave.'}},
  biggle:  {name:'Biggle Baggle', faction:'frog', cls:'lilyknight', lv:4, stats:{mhp:29,atk:14,def:12,spd:3,skl:7,mov:4}, retort:'Kneel, rabbit. Order is coming whether you like it or not.'},
};
// Characters who only speak (or appear as bosses), plus the narrator.
const SPEAKERS = Object.assign({
  narr:        {name:''},
  sister:      {name:'Little Sister', faction:'rae', look:'sister', outfit:'camp'},   // becomes Flopsy Flora in Chapter Two
  rabbits:     {name:'The Rabbits', faction:'rae', look:'workerLop', fur:'grey'},
  rhubarb:     {name:'Rhubarb', faction:'frog', look:'rhubarb'},
  guard:       {name:'Guard', faction:'frog', look:'guard'},
  executioner: {name:'The Executioner', faction:'frog', look:'headsman'},
  king:        {name:'King Friggle Fraggle', faction:'frog', look:'king'},
  scout:       {name:'Frog Scout', faction:'frog', look:'scout'},
  elfscout:    {name:'Frog Scout', faction:'frog', look:'courier'},   // December: a scout in elf green (art/elf-*.png)
  thin:        {name:'Thin Rabbit', faction:'rae', look:'thin', fur:'cream'},
  // Chapter Two (placeholder art)
  fraggle:     {name:'Fraggle Friggle', faction:'frog', look:'fraggle'},     // the King's cousin, lord of the woods (art/fraggle-*.png)
  republic:    {name:'Republic Soldiers', faction:'rae', look:'soldier'},
  sludge:      {name:'Sergeant Sludge', faction:'frog', look:'guard'},     // Flopsy's Day Out
  // side stories (29-data-sides-more.js)
  magpie:      {name:'Magpie', faction:'rae', look:'workerBig', fur:'chocolate'},   // Brigand's old gang
  reeve:       {name:'Reeve Puddock', faction:'frog', look:'guard'},
  grubb:       {name:'Warden Grubb', faction:'frog', look:'guard'},              // hooded the Condemned
  tally:       {name:'The Tallyman', faction:'frog', look:'guard'},              // Froggle's old master
  twelve:      {name:'Twelve', faction:'rae', look:'workerLop', fur:'cream', elderly:true},
  hawthorn:    {name:'Hawthorn', faction:'rae', look:'worker', fur:'ginger'},    // Willow's lost hero (Rhubarb's flashback)
  greyone:     {name:'The Grey Rabbit', faction:'rae', look:'workerLop', fur:'grey'},
  gristle:     {name:'Gristle', faction:'frog', look:'blackguard'},              // Fraggle Friggle's champion
  gloamjaw:    {name:'Gloamjaw', faction:'frog', look:'blackguard'},             // Fraggle's outlaw guard captain
  burdock:     {name:'Captain Burdock', faction:'rae', look:'soldier'},
  elder:       {name:'An Old Rabbit', faction:'rae', look:'workerLop', fur:'grey', elderly:true},
}, Object.fromEntries(Object.entries(CHARACTERS).map(([k, c]) => [k, {name: c.name, faction: c.faction, look: c.look || k}])));

// Fur colours for the generic mine-rabbit art (art/miner-*.png): [hue shift°, saturation ×, lightness shift].
// Positive lightness moves toward white, negative toward black. 'tan' is the art as drawn.
const FURS = {
  tan: null, grey: [0, .12, .05], cream: [4, .55, .38], white: [0, .1, .6],
  chocolate: [-4, .85, -.38], sooty: [0, .15, -.6], ginger: [-6, 1.45, -.02], sandy: [10, .75, .16],
};

// Generic rabbits of these classes use the bulkier mine-rabbit portrait (art/minerbulk-portrait.png).
const BULKY_CLASSES = ['digger', 'hauler'];
// Classes always drawn elderly (art/minerold-portrait.png). Characters can be marked elderly:true, and
// non-bulky generic rabbits are elderly about one time in three, so slingers get a mix of portraits.
const ELDERLY_CLASSES = [];

// Skin colours for the generic frog-soldier art (art/grunt-*.png), same format as FURS.
// Only the head is recoloured (art/gruntskin-*.png); 'green' is the art as drawn.
const SKINS = {
  green: null, lime: [22, 1.2, 0], olive: [6, .75, -.32], teal: [105, .9, -.06], blue: [150, 1.1, -.1],
  toad: [-28, .75, -.28], gold: [-22, 1.6, .02], red: [-58, 1.3, -.1], violet: [215, .8, -.06], pink: [-80, .9, .12],
};

// How tall each portrait stands in story scenes, relative to a standard full-body figure (1).
// drop pushes the bottom of the art below the stage, behind the dialogue box: used for art cropped
// at the waist, so it reads as a full-sized figure rather than a giant head.
const STAGE_SIZE = {
  sistercamp: {h: .8}, sisterflora: {h: .8}, sisterxmas: {h: .8},     // the little sister
  king: {h: 1.15},                                // full-body art: a little taller than everyone, as befits a king
  condemned: {h: .92},                            // big ears: a touch smaller so they stay on screen
  fragglejr: {h: .84},                            // the young son: shorter than Tiggle
  biggle: {h: 1.12, drop: .035},                  // the older brother stands taller than Tiggle; drop lines his planted foot up with Tiggle's
};

// Battle poses are all drawn at the same height in fights; these are drawn bigger (per art key), e.g. a rider whose
// pose includes the whole horse.
const BATTLE_SIZE = {bigglerose: 1.3};

// How front-portrait art is framed in the small panel and in dialogue, per art key (character + outfit).
const ART_CROP = {
  miner:   {panel: ['225% auto', '64% 1%'], talk: ['165% auto', '70% 1%']},   // generic mine rabbit, every fur
  minerold: {panel: ['215% auto', '58% 2%'], talk: ['160% auto', '60% 1%']},  // elderly mine rabbit
  minerbulk: {panel: ['215% auto', '60% 2%'], talk: ['160% auto', '62% 1%']}, // bulky mine rabbit
  troopelite: {panel: ['205% auto', '50% 3%'], talk: ['150% auto', '50% 2%']},   // elite Republic soldier, every fur
  black:   {panel: ['230% auto', '42% 9%'], talk: ['165% auto', '42% 7%']},
  elf:     {panel: ['200% auto', '48% 5%'], talk: ['150% auto', '48% 4%']},   // festive frog scouts, every skin   // Fraggle's Black Guard, every skin
  grunt:   {panel: ['230% auto', '44% 6%'], talk: ['165% auto', '42% 4%']},   // generic frog soldier, every skin
  rae:     {panel: ['225% auto', '33% 2%'], talk: ['190% auto', '33% 2%']},   // uniform
  tiggleformal: {panel: ['200% auto', '50% 2%'], talk: ['150% auto', '50% 1%']}, // Formal Wear (log-in reward)
  raecasual: {panel: ['215% auto', '50% 2%'], talk: ['160% auto', '50% 1%']},   // Casual Wear (log-in reward)
  raecamp: {panel: ['225% auto', '51% 1%'], talk: ['165% auto', '52% 1%']},   // camp rags (Chapter One)
  sistercamp: {panel: ['190% auto', '48% 3%'], talk: ['150% auto', '48% 3%']}, // Little Sister, Chapter One
  tiggle:   {panel: ['210% auto', '52% 3%'], talk: ['150% auto', '50% 2%']},
  rhubarb:  {panel: ['220% auto', '50% 5%'], talk: ['160% auto', '50% 4%']},
  executioner: {panel: ['210% auto', '30% 6%'], talk: ['150% auto', '30% 4%']},
  brigand:  {panel: ['200% auto', '38% 3%'], talk: ['150% auto', '36% 2%']},
  patch:    {panel: ['170% auto', '55% 9%'], talk: ['135% auto', '55% 8%']},
  froggle:  {panel: ['165% auto', '55% 4%'], talk: ['130% auto', '55% 3%']},
  fraggle:  {panel: ['210% auto', '46% 3%'], talk: ['155% auto', '46% 2%']},
  ilc:      {panel: ['175% auto', '46% 10%'], talk: ['135% auto', '46% 8%']},
  chriggle: {panel: ['170% auto', '42% 5%'], talk: ['132% auto', '42% 3%']},
  fragglejr: {panel: ['150% auto', '62% 0%'], talk: ['125% auto', '60% 0%']},   // own portrait; battle sprite and map icon are his father's
  willow:   {panel: ['215% auto', '44% 2%'], talk: ['160% auto', '44% 1%']},
  condemned: {panel: ['200% auto', '50% 4%'], talk: ['150% auto', '50% 3%']},
  biggle:   {panel: ['200% auto', '42% 8%'], talk: ['150% auto', '40% 6%']},
  biggleginger: {panel: ['190% auto', '44% 9%'], talk: ['145% auto', '44% 7%']},   // Gingerbiggle attire
  bigglerose: {panel: ['300% auto', '38% 9%'], talk: ['210% auto', '36% 7%']},   // Rose Knight attire: mounted, so the face is small and high
  king:     {panel: ['250% auto', '56% 2%'], talk: ['180% auto', '56% 1%']},   // King Friggle Fraggle (battle sprite and map icon saved for later)
  sisterxmas: {panel: ['185% auto', '45% 8%'], talk: ['145% auto', '45% 6%']},   // Hoppy Xmas attire
  sisterflora: {panel: ['200% auto', '42% 6%'], talk: ['155% auto', '42% 6%']}, // Flopsy Flora, Chapter Two on (keeps art/sister-token.png)
};

// Generic recruits. Camp rabbits have no names, so they are known by how they look.
const RECRUIT_NAMES = {
  rae:  ['Grey Rabbit', 'Scarred Rabbit', 'Small Rabbit', 'Lop-Eared Rabbit', 'Dusty Rabbit', 'Quiet Rabbit', 'Long-Eared Rabbit', 'Spotted Rabbit',
         'Sooty Rabbit', 'Bent-Eared Rabbit', 'Ginger Rabbit', 'Pale Rabbit', 'Stubby Rabbit', 'Patchy Rabbit', 'Big-Footed Rabbit', 'Twitchy Rabbit'],
  frog: ['Glub', 'Murkle', 'Bogwort', 'Puddle', 'Ribbet', 'Sludge', 'Croakley', 'Mire', 'Pondsby', 'Squelch', 'Gloop', 'Paddock', 'Fennick', 'Wortle', 'Plash', 'Brack'],
};
