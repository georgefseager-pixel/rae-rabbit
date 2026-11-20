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
  pebbler:   {name: 'Slinger',        w: 'bow',   rng: [2,2], mt: 'foot',    wname: 'Pebble Sling',      base: {mhp:17,atk:9, def:3, spd:6,skl:7,mov:5}, g: {mhp:55,atk:45,def:20,spd:45,skl:55}},
  runner:    {name: 'Runner',         w: 'sword', rng: [1,1], mt: 'foot',    wname: 'Sharpened Shears',  base: {mhp:18,atk:9, def:3, spd:9,skl:7,mov:6}, g: {mhp:60,atk:40,def:20,spd:60,skl:50}},
  patcher:   {name: 'Patcher',        w: 'staff', rng: [1,1], mt: 'foot',    wname: 'Darning Needle',    base: {mhp:16,atk:4, def:2, spd:6,skl:5,mov:5}, g: {mhp:50,atk:45,def:20,spd:50,skl:40}},
  quarter:   {name: 'Archer',         w: 'bow',   rng: [2,2], mt: 'foot',    wname: 'Longbow',           base: {mhp:18,atk:10,def:3, spd:7,skl:8,mov:5}, g: {mhp:60,atk:45,def:25,spd:45,skl:55}},
  // Frogs
  prince:    {name: 'Frog Prince',    w: 'sword', rng: [1,1], mt: 'foot',    wname: 'Royal Rapier',      base: {mhp:19,atk:11,def:5, spd:9,skl:8,mov:5}, g: {mhp:65,atk:45,def:30,spd:55,skl:50}},
  lilyknight:{name: 'Lily Knight',    w: 'lance', rng: [1,1], mt: 'armor',   wname: 'Royal Halberd',     base: {mhp:26,atk:13,def:11,spd:3,skl:6,mov:4}, g: {mhp:80,atk:45,def:50,spd:15,skl:35}},
  lily:      {name: 'Pike Guard',     w: 'lance', rng: [1,1], mt: 'foot',    wname: 'Pike',              base: {mhp:19,atk:10,def:5, spd:4,skl:4,mov:5}, g: {mhp:70,atk:40,def:40,spd:25,skl:35}},
  bruiser:   {name: 'Club Guard',     w: 'axe',   rng: [1,1], mt: 'bog',     wname: 'Cudgel',            base: {mhp:20,atk:11,def:3, spd:4,skl:3,mov:5}, g: {mhp:80,atk:50,def:20,spd:30,skl:30}},
  reed:      {name: 'Tower Archer',   w: 'bow',   rng: [2,2], mt: 'foot',    wname: 'Reedbow',           base: {mhp:17,atk:10,def:3, spd:5,skl:6,mov:5}, g: {mhp:55,atk:45,def:20,spd:40,skl:50}},
  blade:     {name: 'Duellist',       w: 'sword', rng: [1,1], mt: 'foot',    wname: 'Pondsword',         base: {mhp:19,atk:11,def:4, spd:9,skl:8,mov:6}, g: {mhp:60,atk:40,def:25,spd:55,skl:55}},
  toadknight:{name: 'Armoured Guard', w: 'lance', rng: [1,1], mt: 'armor',   wname: 'Halberd',           base: {mhp:25,atk:12,def:10,spd:2,skl:5,mov:4}, g: {mhp:85,atk:45,def:55,spd:15,skl:35}},
  croaker:   {name: 'Croaker',        w: 'staff', rng: [1,1], mt: 'foot',    wname: 'Silt Censer',       base: {mhp:16,atk:5, def:2, spd:5,skl:5,mov:5}, g: {mhp:50,atk:45,def:20,spd:40,skl:40}},
  headsman:  {name: 'Executioner',    w: 'axe',   rng: [1,1], mt: 'foot',    wname: 'Headsman\'s Axe',   base: {mhp:26,atk:13,def:5, spd:4,skl:5,mov:4}, g: {mhp:80,atk:50,def:30,spd:25,skl:35}},
  overseer:  {name: 'Overseer',       w: 'axe',   rng: [1,1], mt: 'foot',    wname: 'Tally Club',        base: {mhp:28,atk:14,def:6, spd:5,skl:6,mov:4}, g: {mhp:80,atk:50,def:35,spd:30,skl:40}},
};
const STAT_KEYS = ['mhp','atk','def','spd','skl'];
const WTYPE = {sword: 'Sword', lance: 'Lance', axe: 'Axe', bow: 'Bow', staff: 'Staff'};
const BEATS = {sword: 'axe', axe: 'lance', lance: 'sword'};
const triangle = (a, b) => BEATS[a] === b ? 1 : BEATS[b] === a ? -1 : 0;

// Weapon upgrades bought in the Armoury: each tier adds might (or mending power for staves).
const WEAPON_TIERS = [
  {prefix: '',            bonus: 0, cost: 0},
  {prefix: 'Reinforced ', bonus: 2, cost: 250},
  {prefix: 'Masterwork ', bonus: 4, cost: 600},
];
const TRAIN = {cost: 150, exp: 40};   // Drill Yard: spend currency for experience

// ================= Plush looks (placeholder art drawn in code) =================
// Used for tokens everywhere, and for portraits until real art exists in art/.
const LOOKS = {
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
  stayer:    {sp:'bun', ears:'up',  fur:'#8a7a6a', light:'#a89888', dark:'#54483c', scarf:'#7a2a24', gear:'none', oneEar:true},
  thin:      {sp:'bun', ears:'lop', fur:'#cfc4b4', light:'#e6ddd0', dark:'#8a7e70', gear:'none', small:true},
  // Frogs
  tiggle:    {sp:'frog', skin:'#7bc043', light:'#a6dc72', dark:'#3d6a1e', belly:'#dcf0a8', gear:'circlet', small:true},
  biggle:    {sp:'frog', skin:'#467a2e', light:'#679a4a', dark:'#203a12', belly:'#b8cc84', gear:'kettle', big:true},
  king:      {sp:'frog', skin:'#26262c', light:'#45454f', dark:'#0b0b0e', belly:'#55555f', eye:'#e02424', gear:'crown', big:true},
  scout:     {sp:'frog', skin:'#6a8f3a', light:'#8cad55', dark:'#33491b', belly:'#c5d58c', gear:'reed', small:true},
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
  captain:'worker', digger:'workerBig', hauler:'worker', pebbler:'workerLop', runner:'worker', patcher:'workerMend', quarter:'workerLop',
  lily:'guard', bruiser:'bruiser', reed:'reed', blade:'duelist', toadknight:'toadknight', croaker:'croaker', headsman:'headsman', overseer:'rhubarb',
};

// ================= Named characters =================
// Rabbits in the camps are not allowed names; the descriptors below are how the player tells them apart.
// crop: how front-portrait art is framed in the small panel and in dialogue.
const CHARACTERS = {
  // Raepublic
  rae:     {name:'Rabbit', faction:'rae', cls:'captain', lv:1, stats:{mhp:20,atk:11,def:5,spd:8,skl:7,mov:5}, lord:true,
            crop:{panel:['225% auto','33% 2%'], talk:['190% auto','33% 2%']}, retort:'Come and find out.'},
  tall:    {name:'Tall Rabbit', faction:'rae', cls:'hauler', lv:1, stats:{mhp:20,atk:10,def:6,spd:5,skl:5,mov:5}},
  burly:   {name:'Burly Rabbit', faction:'rae', cls:'digger', lv:1, stats:{mhp:23,atk:12,def:4,spd:4,skl:4,mov:5}},
  old:     {name:'Old Rabbit', faction:'rae', cls:'pebbler', lv:2, stats:{mhp:17,atk:9,def:3,spd:6,skl:8,mov:5}},
  swift:   {name:'Swift Rabbit', faction:'rae', cls:'runner', lv:1, stats:{mhp:18,atk:9,def:3,spd:10,skl:7,mov:6}},
  patched: {name:'Patched Rabbit', faction:'rae', cls:'patcher', lv:1, stats:{mhp:16,atk:4,def:2,spd:6,skl:5,mov:5}},
  willow:  {name:'Willow', faction:'rae', cls:'quarter', lv:5, stats:{mhp:22,atk:12,def:4,spd:8,skl:11,mov:5}},
  // Friggliarchy
  tiggle:  {name:'Tiggle Taggle', faction:'frog', cls:'prince', lv:1, stats:{mhp:19,atk:11,def:5,spd:9,skl:8,mov:5}, lord:true, retort:'I\'m not afraid of you.'},
  biggle:  {name:'Biggle Baggle', faction:'frog', cls:'lilyknight', lv:4, stats:{mhp:29,atk:14,def:12,spd:3,skl:7,mov:4}, retort:'Kneel, rabbit. Order is coming whether you like it or not.'},
};
// Characters who only speak (or appear as bosses), plus the narrator.
const SPEAKERS = Object.assign({
  narr:        {name:''},
  sister:      {name:'Little Sister', faction:'rae', look:'sister'},
  rabbits:     {name:'The Rabbits', faction:'rae', look:'workerLop'},
  rhubarb:     {name:'Rhubarb', faction:'frog', look:'rhubarb'},
  guard:       {name:'Guard', faction:'frog', look:'guard'},
  executioner: {name:'The Executioner', faction:'frog', look:'headsman'},
  king:        {name:'King Friggle Fraggle', faction:'frog', look:'king'},
  scout:       {name:'Frog Scout', faction:'frog', look:'scout'},
  stayer:      {name:'One-Eared Rabbit', faction:'rae', look:'stayer'},
  thin:        {name:'Thin Rabbit', faction:'rae', look:'thin'},
}, Object.fromEntries(Object.entries(CHARACTERS).map(([k, c]) => [k, {name: c.name, faction: c.faction, look: c.look || k}])));

// Generic recruits. Camp rabbits have no names, so they are known by how they look.
const RECRUIT_NAMES = {
  rae:  ['Grey Rabbit', 'Scarred Rabbit', 'Small Rabbit', 'Lop-Eared Rabbit', 'Dusty Rabbit', 'Quiet Rabbit', 'Long-Eared Rabbit', 'Spotted Rabbit', 'Sooty Rabbit', 'Bent-Eared Rabbit'],
  frog: ['Glub', 'Murkle', 'Bogwort', 'Puddle', 'Ribbet', 'Sludge', 'Duckweed', 'Croakley', 'Mire', 'Pondsby'],
};
