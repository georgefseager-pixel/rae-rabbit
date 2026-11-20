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
  // Raepublic
  captain:   {name: 'Banner-Captain', w: 'sword', rng: [1,1], mt: 'foot',    wname: 'Darning Blade',     base: {mhp:20,atk:11,def:5, spd:8,skl:7,mov:5}, g: {mhp:70,atk:45,def:30,spd:50,skl:45}},
  bulwark:   {name: 'Bulwark',        w: 'lance', rng: [1,1], mt: 'armor',   wname: 'Knitting Lance',    base: {mhp:24,atk:12,def:10,spd:2,skl:5,mov:4}, g: {mhp:80,atk:45,def:55,spd:20,skl:35}},
  outrider:  {name: 'Outrider',       w: 'sword', rng: [1,1], mt: 'mounted', wname: 'Pinking Sabre',     base: {mhp:21,atk:11,def:6, spd:7,skl:6,mov:7}, g: {mhp:70,atk:45,def:35,spd:45,skl:40}},
  quarter:   {name: 'Quartermaster',  w: 'bow',   rng: [2,2], mt: 'foot',    wname: 'Elastic Longbow',   base: {mhp:18,atk:10,def:3, spd:7,skl:8,mov:5}, g: {mhp:60,atk:45,def:25,spd:45,skl:55}},
  mender:    {name: 'Mender',         w: 'staff', rng: [1,1], mt: 'foot',    wname: 'Mending Needle',    base: {mhp:16,atk:4, def:2, spd:6,skl:5,mov:5}, g: {mhp:50,atk:45,def:20,spd:50,skl:40}},
  breaker:   {name: 'Millbreaker',    w: 'axe',   rng: [1,1], mt: 'foot',    wname: 'Seam-Ripper Axe',   base: {mhp:26,atk:13,def:4, spd:5,skl:4,mov:5}, g: {mhp:85,atk:55,def:25,spd:35,skl:35}},
  conscript: {name: 'Mill Hand',      w: 'lance', rng: [1,1], mt: 'foot',    wname: 'Broom-Handle Pike', base: {mhp:18,atk:10,def:4, spd:5,skl:4,mov:5}, g: {mhp:65,atk:40,def:30,spd:40,skl:40}},
  // Friggliarchy
  prince:    {name: 'Crown Prince',   w: 'lance', rng: [1,1], mt: 'foot',    wname: 'The Black Tongue',  base: {mhp:21,atk:12,def:6, spd:7,skl:7,mov:5}, g: {mhp:70,atk:50,def:35,spd:45,skl:40}},
  bruiser:   {name: 'Bog Bruiser',    w: 'axe',   rng: [1,1], mt: 'bog',     wname: 'Lilycleaver',       base: {mhp:20,atk:11,def:3, spd:4,skl:3,mov:5}, g: {mhp:80,atk:50,def:20,spd:30,skl:30}},
  lily:      {name: 'Lilyguard',      w: 'lance', rng: [1,1], mt: 'foot',    wname: 'Reed Pike',         base: {mhp:19,atk:10,def:5, spd:4,skl:4,mov:5}, g: {mhp:70,atk:40,def:40,spd:25,skl:35}},
  reed:      {name: 'Reedshot',       w: 'bow',   rng: [2,2], mt: 'foot',    wname: 'Reedbow',           base: {mhp:17,atk:10,def:3, spd:5,skl:6,mov:5}, g: {mhp:55,atk:45,def:20,spd:40,skl:50}},
  blade:     {name: 'Pond Duellist',  w: 'sword', rng: [1,1], mt: 'foot',    wname: 'Pondsword',         base: {mhp:19,atk:11,def:4, spd:9,skl:8,mov:6}, g: {mhp:60,atk:40,def:25,spd:55,skl:55}},
  toadknight:{name: 'Toad Knight',    w: 'lance', rng: [1,1], mt: 'armor',   wname: 'Reed Pike',         base: {mhp:25,atk:12,def:10,spd:2,skl:5,mov:4}, g: {mhp:85,atk:45,def:55,spd:15,skl:35}},
  croaker:   {name: 'Court Croaker',  w: 'staff', rng: [1,1], mt: 'foot',    wname: 'Silt Censer',       base: {mhp:16,atk:5, def:2, spd:5,skl:5,mov:5}, g: {mhp:50,atk:45,def:20,spd:40,skl:40}},
  baron:     {name: 'Baron of the Ford', w: 'axe', rng: [1,1], mt: 'bog',    wname: 'The Gilded Cleaver',base: {mhp:28,atk:14,def:5, spd:5,skl:6,mov:4}, g: {mhp:80,atk:50,def:30,spd:30,skl:40}},
  // Scrumbly mice
  nibbler:   {name: 'Nibbler',        w: 'sword', rng: [1,1], mt: 'foot',    wname: 'Pin Rapier',        base: {mhp:15,atk:9, def:2, spd:9,skl:7,mov:6}, g: {mhp:50,atk:35,def:15,spd:60,skl:50}},
  slinger:   {name: 'Crumb Slinger',  w: 'bow',   rng: [2,2], mt: 'foot',    wname: 'Crumb Sling',       base: {mhp:14,atk:9, def:2, spd:8,skl:7,mov:5}, g: {mhp:45,atk:40,def:15,spd:55,skl:50}},
  chewer:    {name: 'Rope Chewer',    w: 'axe',   rng: [1,1], mt: 'foot',    wname: 'Chewed Hatchet',    base: {mhp:18,atk:10,def:3, spd:6,skl:4,mov:5}, g: {mhp:70,atk:45,def:20,spd:40,skl:30}},
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
  // Raepublic
  rae:       {sp:'bun', ears:'lop', fur:'#e2c79c', light:'#f4e3c2', dark:'#9c8058', scarf:'#b5302a', gear:'fist'},
  thimble:   {sp:'bun', ears:'lop', fur:'#8f8279', light:'#b2a69c', dark:'#5a4f48', scarf:'#2e3d66', gear:'helm'},
  clover:    {sp:'bun', ears:'up',  fur:'#c99a6c', light:'#e3bf96', dark:'#87613f', scarf:'#2e3d66', gear:'shoe'},
  willow:    {sp:'bun', ears:'up',  fur:'#a9a8a6', light:'#cfcecb', dark:'#6c6b69', scarf:'#5b2a52', gear:'monocle'},
  flopsy:    {sp:'bun', ears:'lop', fur:'#d4b48c', light:'#ead2ae', dark:'#977651', scarf:'#d77a8c', gear:'heart', small:true},
  bramble:   {sp:'bun', ears:'up',  fur:'#7a5538', light:'#9c7452', dark:'#4a3220', scarf:'#b5302a', gear:'bandana', band:'#3b2a6b'},
  pip:       {sp:'bun', ears:'lop', fur:'#c7b49a', light:'#e0d2bc', dark:'#8a7860', scarf:'#7a5a3a', gear:'none', small:true},
  rebel:     {sp:'bun', ears:'up',  fur:'#b08a64', light:'#cfae88', dark:'#755a3e', scarf:'#b5302a', gear:'none'},
  rebelLead: {sp:'bun', ears:'lop', fur:'#d8c2a0', light:'#efdfc4', dark:'#9a8462', scarf:'#b5302a', gear:'fist'},
  rebelBow:  {sp:'bun', ears:'lop', fur:'#9c9a96', light:'#c4c2be', dark:'#62605c', scarf:'#5b2a52', gear:'none'},
  rebelBrute:{sp:'bun', ears:'up',  fur:'#6e4a30', light:'#8e6a4c', dark:'#422c1a', scarf:'#b5302a', gear:'bandana', band:'#b5302a'},
  rebelRider:{sp:'bun', ears:'up',  fur:'#bfa07a', light:'#dcc0a0', dark:'#806444', scarf:'#2e3d66', gear:'shoe'},
  rebelMender:{sp:'bun',ears:'lop', fur:'#e4d4bc', light:'#f4ead8', dark:'#a8967c', scarf:'#d77a8c', gear:'heart'},
  rebelShield:{sp:'bun',ears:'lop', fur:'#8a7c70', light:'#ab9e92', dark:'#564a40', scarf:'#2e3d66', gear:'helm'},
  // Friggliarchy
  fraggle:   {sp:'frog', skin:'#2c2c33', light:'#4c4c58', dark:'#0b0b0e', belly:'#5d5d68', eye:'#e02424', gear:'circlet'},
  king:      {sp:'frog', skin:'#3d6b2c', light:'#5f8f45', dark:'#1e3a12', belly:'#c9d98e', gear:'crown', big:true},
  jiggle:    {sp:'frog', skin:'#5b8a2f', light:'#7fae4c', dark:'#2b4415', belly:'#c9d98e', gear:'crown', big:true},
  tiggle:    {sp:'frog', skin:'#7bc043', light:'#a1db6a', dark:'#3d6a1e', belly:'#d8ee9c', gear:'eyepatch', small:true},
  murk:      {sp:'frog', skin:'#5a7a3a', light:'#7c9c58', dark:'#2c4019', belly:'#b9c98a', gear:'hood'},
  gulp:      {sp:'frog', skin:'#4a7530', light:'#6a9448', dark:'#243c14', belly:'#a9c46c', gear:'collar', big:true},
  lilyworth: {sp:'frog', skin:'#5e9a3c', light:'#80b85a', dark:'#2f5320', belly:'#bfd98a', gear:'kettle'},
  quill:     {sp:'frog', skin:'#6f9440', light:'#92b25c', dark:'#36501c', belly:'#cddb94', gear:'reed'},
  bruiser:   {sp:'frog', skin:'#4f7f33', light:'#6f9c48', dark:'#2a4519', belly:'#a9c46c', gear:'collar'},
  lily:      {sp:'frog', skin:'#5e9a3c', light:'#80b85a', dark:'#2f5320', belly:'#bfd98a', gear:'lilypad'},
  reed:      {sp:'frog', skin:'#6a8f3a', light:'#8cad55', dark:'#33491b', belly:'#c5d58c', gear:'reed'},
  duelist:   {sp:'frog', skin:'#66a83e', light:'#8cc862', dark:'#33591d', belly:'#d0e79a', gear:'bandana', band:'#2e5f9a'},
  toadknight:{sp:'frog', skin:'#557a36', light:'#76984f', dark:'#2a3f17', belly:'#b6c681', gear:'kettle'},
  croaker:   {sp:'frog', skin:'#5d7e3e', light:'#7fa05c', dark:'#2d421b', belly:'#bccb8c', gear:'hood'},
  // Scrumbly mice
  scrumbly:  {sp:'mouse', fur:'#ece7de', light:'#faf7f1', dark:'#9a948a', gear:'thimble', big:true},
  mouse:     {sp:'mouse', fur:'#d9d4cb', light:'#f2eee8', dark:'#8f897f', gear:'none', scarf:'#5a7fa8'},
  mouseSling:{sp:'mouse', fur:'#bdb4a8', light:'#dad3ca', dark:'#7a7268', gear:'bandana', band:'#8a5a2a'},
  mouseBrute:{sp:'mouse', fur:'#9a9088', light:'#bab1a9', dark:'#5e5650', gear:'none', scarf:'#7a2a2a', big:true},
};
const CLASS_LOOK = {
  captain:'rebelLead', bulwark:'rebelShield', outrider:'rebelRider', quarter:'rebelBow', mender:'rebelMender', breaker:'rebelBrute', conscript:'rebel',
  prince:'fraggle', bruiser:'bruiser', lily:'lily', reed:'reed', blade:'duelist', toadknight:'toadknight', croaker:'croaker', baron:'jiggle',
  nibbler:'mouse', slinger:'mouseSling', chewer:'mouseBrute',
};

// ================= Named characters =================
// Names marked (placeholder) are stand-ins until the real toys are cast.
// crop: how the front portrait art is framed in the small panel and in dialogue.
const CHARACTERS = {
  // Raepublic
  rae:     {name:'Rae Rabbit', faction:'rae', cls:'captain', lv:1, stats:{mhp:20,atk:11,def:5,spd:8,skl:7,mov:5}, lord:true,
            crop:{panel:['225% auto','33% 2%'], talk:['190% auto','33% 2%']}, retort:'Then come and try to hold me.'},
  thimble: {name:'Thimble', faction:'rae', cls:'bulwark', lv:1, stats:{mhp:24,atk:12,def:10,spd:2,skl:5,mov:4}, retort:'I was made to stand in the way. I am standing in it.'},   // (placeholder)
  clover:  {name:'Clover', faction:'rae', cls:'outrider', lv:1, stats:{mhp:21,atk:11,def:6,spd:7,skl:6,mov:7}, retort:'Made to be held? I was made to run.'},               // (placeholder)
  willow:  {name:'Willow', faction:'rae', cls:'quarter', lv:1, stats:{mhp:18,atk:10,def:3,spd:7,skl:8,mov:5}, retort:'Noted. Firing.'},
  flopsy:  {name:'Flopsy', faction:'rae', cls:'mender', lv:1, stats:{mhp:16,atk:4,def:2,spd:6,skl:5,mov:5}, retort:'I was made to fix things. I will fix you.'},
  bramble: {name:'Bramble', faction:'rae', cls:'breaker', lv:1, stats:{mhp:26,atk:13,def:4,spd:5,skl:4,mov:5}, retort:'I was made in a mill. Same as this axe.'},          // (placeholder)
  pip:     {name:'Pip', faction:'rae', cls:'conscript', lv:2, stats:{mhp:19,atk:10,def:4,spd:6,skl:5,mov:5}, retort:'Four years at a loom. I can manage four minutes of you.'}, // (placeholder)
  // Friggliarchy
  fraggle: {name:'Fraggle Friggle', faction:'frog', cls:'prince', lv:3, stats:{mhp:23,atk:13,def:6,spd:8,skl:8,mov:5}, lord:true,
            retort:'Order is not cruelty. It only looks like it from below.'},
  tiggle:  {name:'Tiggle Taggle', faction:'frog', cls:'blade', lv:2, stats:{mhp:18,atk:11,def:4,spd:10,skl:9,mov:6}, retort:'Big brother says I am not allowed to lose.'},
  murk:    {name:'Mother Murk', faction:'frog', cls:'croaker', lv:3, stats:{mhp:17,atk:5,def:3,spd:5,skl:6,mov:5}, retort:'The pond remembers everything, child.'},          // (placeholder)
  gulp:    {name:'Gulp', faction:'frog', cls:'bruiser', lv:3, stats:{mhp:24,atk:13,def:4,spd:4,skl:3,mov:5}, retort:'Gulp.'},                                               // (placeholder)
  lilyworth:{name:'Sir Lilyworth', faction:'frog', cls:'toadknight', lv:3, stats:{mhp:26,atk:12,def:10,spd:2,skl:5,mov:4}, retort:'I have held this line since before your mother was stitched.'}, // (placeholder)
  quill:   {name:'Quill', faction:'frog', cls:'reed', lv:2, stats:{mhp:17,atk:10,def:3,spd:6,skl:8,mov:5}, retort:'Hold still. This is the polite part.'},                   // (placeholder)
};
// Characters who only speak (or appear as bosses), plus the narrator.
const SPEAKERS = Object.assign({
  narr:     {name:''},
  king:     {name:'King Friggle Fraggle', faction:'frog', look:'king'},
  jiggle:   {name:'Baron Jiggle Jaggle', faction:'frog', look:'jiggle'},
  scrumbly: {name:'Scrumbly', faction:'mouse', look:'scrumbly'},
}, Object.fromEntries(Object.entries(CHARACTERS).map(([k, c]) => [k, {name: c.name, faction: c.faction, look: k}])));

const RECRUIT_NAMES = {
  rae:  ['Hazel', 'Tansy', 'Bracken', 'Sorrel', 'Juniper', 'Burdock', 'Teasel', 'Yarrow', 'Nettle', 'Campion', 'Sedge', 'Briar'],
  frog: ['Glub', 'Murkle', 'Bogwort', 'Puddle', 'Ribbet', 'Sludge', 'Duckweed', 'Croakley', 'Mire', 'Pondsby', 'Squelch', 'Gloop'],
};
