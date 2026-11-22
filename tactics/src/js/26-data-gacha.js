// ================= Recruitment banners (gacha) =================
// Each army recruits through its own banners with its own pull currency.
//   ★     Common: a generic soldier of one of the army's classes
//   ★★    Uncommon: a generic soldier with better stats and a reinforced weapon
//   ★★★   Rare: a unique character (see CHARACTERS with stars:3). A banner can set `pool` to choose
//         its own ★★★ characters; otherwise it draws from the army's `rares`.
// Pulling a recruit you already have gives a weapon of that rarity instead (see 12-data-weapons.js).
// Soldiers (★ and ★★) come from a fixed company per army: `company` copies of each generic class at
// each rarity, named from RECRUIT_NAMES. A soldier you already have becomes a weapon instead,
// so the roster can't grow forever.
const GACHA = {
  rarity: {
    1: {name: 'Common',   rate: 65, color: '#b88a58'},
    2: {name: 'Uncommon', rate: 30, color: '#c8d2de'},
    3: {name: 'Rare',     rate: 5,  color: '#ecc673'},
  },
  pity: 50,               // a ★★★ is guaranteed by this many pulls on the same banner
  featuredShare: .5,      // on a featured banner, this share of ★★★ results is the featured unit
  tenPullFloor: 2,        // every ×10 contains at least one unit of this rarity or better
  company: {1: 2, 2: 1},                                // soldiers per generic class at each rarity
  release: {1: 1, 2: 2, 3: 5},    // pull currency returned for releasing a unit (or a spare weapon) of each rarity
  // Pull currency is meant to be scarce: roughly one ×10 per chapter, plus what bonus stars earn.
  // (Chapter One: 3 stages × 2, its finale 10, and up to 4 stars × 5 = 16 to 36 when recruiting opens.)
  startTokens: 0,
  stageTokens: 2,         // for clearing a stage the first time, unless the stage's reward sets `tokens`
  starTokens: 5,          // for earning a stage's bonus star (once per stage)
};

const GACHA_ARMY = {
  rae: {
    currency: 'Whispers', one: 'Whisper', trade: 400,   // money for one pull: a last resort, not a currency exchange
    opensAfter: 'R1-4',   // recruiting opens once Chapter One is finished
    guide: 'willow',      // who introduces recruiting (the tutorial)
    tease: 'A folded note, passed hand to hand along the tunnels…', seal: 'R',
    generic: ['digger', 'hauler', 'pebbler', 'runner', 'patcher'],
    rares: ['brigand', 'condemned', 'lantern', 'ironear'],
    banners: [
      {id: 'rae-std', name: 'Word in the Tunnels', kind: 'standard', bg: 'mine', pool: ['brigand', 'condemned'],
       blurb: 'Two rabbits who answer the name: a bandit off the Mine Road, and a hooded prisoner who walked away from the block.'},
      {id: 'rae-lantern', name: 'A Light Underground', kind: 'featured', featured: ['lantern'], after: 'R1-2', bg: 'mine',
       blurb: 'Placeholder banner. Lantern Rabbit answers more often.'},
    ],
  },
  frog: {
    currency: 'Writs', one: 'Writ', trade: 400,
    opensAfter: 'F1-4',
    guide: 'biggle',
    tease: 'A writ under the royal seal, delivered by runner…', seal: 'F',
    generic: ['lily', 'bruiser', 'reed', 'croaker', 'blade'],
    rares: ['duckweed', 'glimmer', 'bogsworth'],
    banners: [
      {id: 'frog-mine', name: 'What\'s Yours is MINE', kind: 'featured', pool: ['rhubarb', 'executioner'], bg: 'mine',
       blurb: 'The crown\'s keepers of the mines answer the call: the overseer with her lash, and the headsman with his axe.'},
      {id: 'frog-duckweed', name: 'The King\'s Favour', kind: 'featured', featured: ['duckweed'], after: 'F1-2', bg: 'court',
       blurb: 'Placeholder banner. Dame Duckweed answers more often.'},
      {id: 'frog-glimmer', name: 'Watch on the Ridge', kind: 'featured', featured: ['glimmer'], after: 'F1-3', bg: 'woods',
       blurb: 'Placeholder banner. Captain Glimmer answers more often.'},
    ],
  },
};
