// ================= Recruitment banners (gacha) =================
// Each army recruits through its own banners with its own pull currency. Until the route's Chapter Two is finished
// only the first (standard) banner is open; every other banner waits for R2-4 / F2-4 (`after`).
//   ★     Common: a generic soldier of one of the army's classes
//   ★★    Uncommon: a generic soldier with better stats and a reinforced weapon
//   ★★★   Rare: a unique character (see CHARACTERS with stars:3). Each banner only gives its own: its `pool`,
//         or, if it has none, its `featured` characters (and featured `attires`). `rares` lists the army's rare characters.
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
  featuredShare: .5,      // on a featured banner, this share of ★★★ results is the featured unit (or attire: a banner's `attires`)
  tenPullFloor: 2,        // every ×10 contains at least one unit of this rarity or better
  company: {1: 2, 2: 1},                                // soldiers per generic class at each rarity
  // money (Thread / Crowns, never pull currency) for releasing a unit or a spare weapon of each rarity. Kept far below
  // `trade` (400 money for one pull): on average a pull's results release for under a tenth of that, so there's no loop.
  release: {1: 15, 2: 40, 3: 100},
  // Pull currency is meant to be scarce: a chapter (with its stars, a few side stories and a week of log-ins) earns
  // roughly two-thirds of what it takes to recruit both ★★★ from a banner (about 60 on average), so finishing a
  // banner takes about a chapter and a half. Chapter One: 3 stages × 1, its finale 6, up to 4 stars × 3 = 9–21.
  startTokens: 0,
  stageTokens: 1,         // for clearing a stage the first time, unless the stage's reward sets `tokens`
  starTokens: 3,          // for earning a stage's bonus star (once per stage)
};

const GACHA_ARMY = {
  rae: {
    currency: 'Whispers', one: 'Whisper', trade: 400,   // money for one pull: a last resort, not a currency exchange
    opensAfter: 'R1-4',   // recruiting opens once Chapter One is finished
    guide: 'willow',      // who introduces recruiting (the tutorial)
    tease: 'A folded note, passed hand to hand along the tunnels…', seal: 'R',
    generic: ['digger', 'hauler', 'pebbler', 'runner', 'patcher'],
    rares: ['brigand', 'condemned', 'lantern', 'ironear'],
    // Other companies a banner can draw its soldiers from (troops: '<name>'). Republic soldiers choose their names.
    // (★★ Republic veterans wear the plumed helmet)
    troops: {
      // Monkeyland's soldiers who went with Speshul (Chapter Three): ★ in bronze, ★★ in the gilded elite armour
      monkeys: {stars: [1, 2], generic: ['mkacro', 'mkguard', 'mkbrute', 'mkthrow', 'mkchant'],
        names: ['Loquat', 'Guava', 'Lychee', 'Papaya', 'Pomelo', 'Durian', 'Sapote', 'Longan', 'Rambutan', 'Medlar',
                'Jujube', 'Carambola', 'Mangosteen', 'Cherimoya', 'Feijoa']},
      republic: {stars: [1, 2], generic: ['rfencer', 'rfighter', 'rlancer', 'rarcher', 'radept'],
      // the ten ★ soldiers take the first ten names, the five ★★ veterans the last five
      names: ['Clover', 'Bramble', 'Thistle', 'Hazel', 'Sorrel', 'Juniper', 'Fennel', 'Rowan', 'Briar', 'Tansy',
              'Comfrey', 'Mallow', 'Teasel', 'Vetch', 'Woad']}},
    banners: [
      {id: 'rae-std', name: 'Word in the Tunnels', kind: 'standard', bg: 'mine', pool: ['brigand', 'condemned'],
       blurb: 'Two rabbits who answer the name: a bandit off the Mine Road, and a hooded prisoner who walked away from the block.'},
      {id: 'rae-froggle', name: 'The Republic Stands', kind: 'featured', featured: ['froggle', 'patch'], after: 'R2-4', bg: 'republic', troops: 'republic',
       blurb: 'Out of hiding at last: the frog who built the Republic and gave it away, and the one-eyed corporal who always marches at the front. The ★ soldiers who answer are trained troops of the Republic, and the ★★ are its helmeted veterans.'},
      {id: 'rae-monkeys', name: 'Across the Stream', kind: 'featured', featured: ['kumquat'], after: 'R3-6', bg: 'monkeyland', troops: 'monkeys',
       blurb: 'Placeholder ★★★. The monkeys who crossed the stream with Speshul take up the Raepublic\'s colours. The ★ soldiers who answer are Monkeyland\'s guard, and the ★★ its gilded veterans.'},
      {id: 'rae-lantern', name: 'A Light Underground', kind: 'featured', featured: ['lantern'], after: 'R2-4', bg: 'mine', troops: 'republic',
       blurb: 'Placeholder banner. Lantern Rabbit answers more often, and the ★ soldiers who answer are trained troops of the Republic.'},
    ],
  },
  frog: {
    currency: 'Writs', one: 'Writ', trade: 400,
    opensAfter: 'F1-4',
    guide: 'biggle',
    tease: 'A writ under the royal seal, delivered by runner…', seal: 'F',
    generic: ['lily', 'bruiser', 'reed', 'croaker', 'blade'],
    rares: ['duckweed', 'glimmer', 'bogsworth'],
    // Fraggle Friggle's Black Guard: the ★ and ★★ soldiers on Fraggle Jr.'s banner (★★ wear the closed helm)
    troops: {
      // the monkeys who stayed with the Governess (Chapter Three): ★ in bronze, ★★ in the gilded elite armour
      monkeys: {stars: [1, 2], generic: ['mkacro', 'mkguard', 'mkbrute', 'mkthrow', 'mkchant'],
        names: ['Acacia', 'Baobab', 'Cypress', 'Kapok', 'Mahogany', 'Teak', 'Sandalwood', 'Ebony', 'Rosewood', 'Wisteria',
                'Magnolia', 'Camphor', 'Laurel', 'Myrtle', 'Banksia']},
      fraggle: {stars: [1, 2], generic: ['gblade', 'gaxe', 'gpike', 'gscribe', 'gchaplain'],
      names: ['Thornback', 'Gloam', 'Blackwater', 'Nettlejaw', 'Sedge', 'Murkmire', 'Briarwick', 'Fen', 'Rook', 'Sloe',
              'Blackthorn', 'Wormwood', 'Grimsby', 'Tarn', 'Hollin']}},
    banners: [
      {id: 'frog-mine', name: 'What\'s Yours is MINE', kind: 'featured', pool: ['rhubarb', 'executioner'], bg: 'mine',
       blurb: 'The crown\'s keepers of the mines answer the call: the overseer with her lash, and the headsman with his axe.'},
      {id: 'frog-fragglejr', name: 'The Black Frog\'s Son', kind: 'featured', featured: ['fragglejr'], attires: ['rose'], after: 'F2-4', bg: 'woods', troops: 'fraggle',
       blurb: 'The crown sends a letter of condolence to the woods, and an offer. Fraggle Friggle\'s son answers it, wearing his father\'s coat, and every soldier who answers (★ and ★★) is from his father\'s Black Guard. Biggle\'s Rose Knight attire is featured too.'},
      {id: 'frog-monkeys', name: 'The Loyal Court', kind: 'featured', featured: ['cornelius'], after: 'F3-6', bg: 'castle', troops: 'monkeys',
       blurb: 'Captain Cornelius, the old orangutan who stayed with the Governess when Monkeyland split, brings her guard to the prince. They kneel, as they always have. The ★ soldiers who answer are Monkeyland\'s guard, and the ★★ its gilded veterans.'},
      {id: 'frog-duckweed', name: 'The King\'s Favour', kind: 'featured', featured: ['duckweed'], after: 'F2-4', bg: 'court',
       blurb: 'Placeholder banner. Dame Duckweed answers more often.'},
      {id: 'frog-glimmer', name: 'Watch on the Ridge', kind: 'featured', featured: ['glimmer'], after: 'F2-4', bg: 'woods',
       blurb: 'Placeholder banner. Captain Glimmer answers more often.'},
    ],
  },
};
