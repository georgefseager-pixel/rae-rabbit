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
  starTokens: 2,          // for earning a stage's bonus star (once per stage)
};

const GACHA_ARMY = {
  rae: {
    currency: 'Whispers', one: 'Whisper', trade: 400,   // money for one pull: a last resort, not a currency exchange
    opensAfter: 'R1-4',   // recruiting opens once Chapter One is finished
    guide: 'willow',      // who introduces recruiting (the tutorial)
    tease: 'A folded note, passed hand to hand along the tunnels…', seal: 'R',
    generic: ['digger', 'hauler', 'pebbler', 'runner', 'patcher'],
    rares: ['brigand', 'condemned'],
    // Other companies a banner can draw its soldiers from (troops: '<name>'). Republic soldiers choose their names.
    // (★★ Republic veterans wear the plumed helmet)
    troops: {
      // Monkeyland's soldiers who went with Speshul (Chapter Three): ★ in bronze, ★★ in the gilded elite armour
      monkeys: {stars: [1, 2], generic: ['mkacro', 'mkguard', 'mkbrute', 'mkthrow', 'mkchant'],
        names: ['Loquat', 'Guava', 'Lychee', 'Papaya', 'Pomelo', 'Durian', 'Sapote', 'Longan', 'Rambutan', 'Medlar',
                'Jujube', 'Carambola', 'Mangosteen', 'Cherimoya', 'Feijoa']},
      // the crew of the Grinning Mary (Chapter Four): ★ pirate fish in every colour of the Satin Sea, ★★ pirate sharks
      pirates: {stars: [1, 2], generic: ['pcutlass', 'pboarder', 'pharpoon', 'pgunner', 'pshanty', 'psawbones', 'phook'],
        // the fourteen ★ fish take the first fourteen names, the seven ★★ sharks the last seven
        names: ['Mackerel', 'Haddock', 'Pollock', 'Kipper', 'Sprat', 'Herring', 'Bream', 'Gurnard', 'Pilchard', 'Turbot', 'Halibut', 'Brill', 'Snapper', 'Grouper',
                'Thresher', 'Blacktip', 'Whitetip', 'Wobbegong', 'Dogfish', 'Angelshark', 'Hammerjaw']},
      republic: {stars: [1, 2], generic: ['rfencer', 'rfighter', 'rlancer', 'rarcher', 'radept'],
      // the ten ★ soldiers take the first ten names, the five ★★ veterans the last five
      names: ['Clover', 'Bramble', 'Thistle', 'Hazel', 'Sorrel', 'Juniper', 'Fennel', 'Rowan', 'Briar', 'Tansy',
              'Comfrey', 'Mallow', 'Teasel', 'Vetch', 'Woad']}},
    banners: [
      {id: 'rae-std', name: 'Word in the Tunnels', kind: 'standard', bg: 'mine', pool: ['brigand', 'condemned'],
       blurb: 'Word of Rae has spread through the mine tunnels, and two rabbits have come looking for her: a bandit from the Mine Road, and the hooded prisoner who walked away from the block. The ★ and ★★ who answer are rabbits from the mines.'},
      {id: 'rae-froggle', name: 'The Republic Stands', kind: 'featured', featured: ['froggle', 'patch'], after: 'R2-4', bg: 'republic', troops: 'republic',
       blurb: 'With the Republic out of hiding, two of its own join the Raepublic: Froggle, the frog who founded it and handed it to Rae, and Patch, the one-eyed corporal at the front of every column. The ★ soldiers who answer are trained Republic troops, and the ★★ are its veterans in plumed helmets.'},
      {id: 'rae-monkeys', name: 'Across the Stream', kind: 'featured', featured: [], attires: ['raeMilitia', 'floraSorcerer'], after: 'R3-6', bg: 'monkeyland', troops: 'monkeys',
       blurb: 'The monkeys who crossed the stream with Speshul now march under the Raepublic\'s colours. They have made Rae a suit of their militia\'s armour and dressed Flopsy Flora in the robes of a spell-reader, and both outfits are featured. The ★ soldiers who answer are Monkeyland\'s guard, and the ★★ its veterans in gilded armour.'},
      {id: 'rae-pirates', name: 'Pirates of the Satin Sea', kind: 'featured', featured: ['tandy'], attires: ['speshulPowder'], after: 'R4-7', bg: 'shore', troops: 'pirates',
       blurb: 'The crew of the Grinning Mary have come ashore to stay. Their first mates, Tandy & Maus, have opened a sick bay in the longhouse, and Speshul has signed on with Ducky as a Powder Monkey, trading his bow for a hook. The soldiers who answer are the crew: ★ pirate fish in every colour of the Satin Sea, and ★★ pirate sharks.'},
    ],
  },
  frog: {
    currency: 'Writs', one: 'Writ', trade: 400,
    opensAfter: 'F1-4',
    guide: 'biggle',
    tease: 'A writ under the royal seal, delivered by runner…', seal: 'F',
    generic: ['lily', 'bruiser', 'reed', 'croaker', 'blade'],
    rares: ['rhubarb', 'executioner'],
    // Fraggle Friggle's Black Guard: the ★ and ★★ soldiers on Fraggle Jr.'s banner (★★ wear the closed helm)
    troops: {
      // the monkeys who stayed with the Governess (Chapter Three): ★ in bronze, ★★ in the gilded elite armour
      monkeys: {stars: [1, 2], generic: ['mkacro', 'mkguard', 'mkbrute', 'mkthrow', 'mkchant'],
        names: ['Acacia', 'Baobab', 'Cypress', 'Kapok', 'Mahogany', 'Teak', 'Sandalwood', 'Ebony', 'Rosewood', 'Wisteria',
                'Magnolia', 'Camphor', 'Laurel', 'Myrtle', 'Banksia']},
      // the Royal Tournament's gladiators (Chapter Four): ★ in bronze, ★★ champions in the scarred helm and cape
      gladiators: {stars: [1, 2], generic: ['gladblade', 'gladspear', 'gladaxe', 'gladbow', 'gladscribe', 'gladmedic', 'gladhook'],
        // the fourteen ★ take the first fourteen names, the seven ★★ champions the last seven
        names: ['Maximus', 'Crixus', 'Spiculus', 'Verus', 'Priscus', 'Flamma', 'Carpophorus', 'Tetraites', 'Gannicus', 'Oenomaus', 'Hermes', 'Triumphus', 'Marcus', 'Felix',
                'Commodus', 'Spartacus', 'Calamus', 'Hilarus', 'Celadus', 'Asteropaeus', 'Pugnax']},
      fraggle: {stars: [1, 2], generic: ['gblade', 'gaxe', 'gpike', 'gscribe', 'gchaplain'],
      names: ['Thornback', 'Gloam', 'Blackwater', 'Nettlejaw', 'Sedge', 'Murkmire', 'Briarwick', 'Fen', 'Rook', 'Sloe',
              'Blackthorn', 'Wormwood', 'Grimsby', 'Tarn', 'Hollin']}},
    banners: [
      {id: 'frog-mine', name: 'What\'s Yours is MINE', kind: 'featured', pool: ['rhubarb', 'executioner'], bg: 'mine',
       blurb: 'Two of the crown\'s servants from the mine camp answer the prince\'s call: the overseer with her lash, and the headsman with his axe. The ★ and ★★ recruits are the crown\'s own frog soldiers.'},
      {id: 'frog-fragglejr', name: 'The Black Frog\'s Son', kind: 'featured', featured: ['fragglejr'], attires: ['rose'], after: 'F2-4', bg: 'woods', troops: 'fraggle',
       blurb: 'The crown has sent a letter of condolence to the woods, with an offer of service, and Fraggle Friggle\'s son has accepted it. He brings soldiers from his father\'s Black Guard: they are the ★ and ★★ who answer. Also featured: Biggle as a Rose Knight, in parade armour and on horseback.'},
      {id: 'frog-monkeys', name: 'The Loyal Court', kind: 'featured', featured: ['cornelius', 'chansey'], after: 'F3-6', bg: 'castle', troops: 'monkeys',
       blurb: 'Two of the Governess\'s most trusted people come to serve the prince. Captain Cornelius, the old orangutan who stayed at her side when Monkeyland split, brings her guard, and Chansey, her head priestess, brings the temple\'s blessing. The ★ soldiers who answer are Monkeyland\'s guard, and the ★★ its veterans in gilded armour.'},
      {id: 'frog-tournament', name: 'Champions of the Lists', kind: 'featured', featured: ['tilly'], attires: ['tiggleChampion'], after: 'F4-7', bg: 'arena', troops: 'gladiators',
       blurb: 'The Royal Tournament is over, and some of its fighters have followed the prince who won it. Tilly Tealbottom, the hook rider Tiggle unseated in the lists, has ridden to the war camp to join him, and the champion\'s armour has been altered to fit Tiggle. The soldiers who answer are the tournament\'s gladiators: ★ in bronze, and ★★ scarred champions of the sand.'},
    ],
  },
};
