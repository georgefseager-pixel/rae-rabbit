// ================= Recruitment banners (gacha) =================
// Each army recruits through its own banners with its own pull currency.
//   ★     Common: a generic soldier of one of the army's classes
//   ★★    Uncommon: a generic soldier with better stats and a reinforced weapon
//   ★★★   Rare: a unique character (all placeholders for now; see CHARACTERS with stars:3)
// Pulling a rare you already have raises their Bond instead (a small stat boost, up to bondMax);
// past that, it refunds pull currency.
const GACHA = {
  rarity: {
    1: {name: 'Common',   rate: 64, color: '#b88a58'},
    2: {name: 'Uncommon', rate: 30, color: '#c8d2de'},
    3: {name: 'Rare',     rate: 6,  color: '#ecc673'},
  },
  pity: 40,               // a ★★★ is guaranteed by this many pulls on the same banner
  featuredShare: .5,      // on a featured banner, this share of ★★★ results is the featured unit
  tenPullFloor: 2,        // every ×10 contains at least one unit of this rarity or better
  bondMax: 5,
  release: {1: 1, 2: 3, 3: 10},   // pull currency returned for releasing a unit of each rarity
  startTokens: 10,
  stageTokens: 5,         // awarded for clearing a stage unless the stage's reward sets `tokens`
};

const GACHA_ARMY = {
  rae: {
    currency: 'Whispers', one: 'Whisper', trade: 100,
    tease: 'A folded note, passed hand to hand along the tunnels…', seal: 'R',
    generic: ['digger', 'hauler', 'pebbler', 'runner', 'patcher'],
    rares: ['lantern', 'masked', 'ironear'],
    banners: [
      {id: 'rae-std', name: 'Word in the Tunnels', kind: 'standard',
       blurb: 'Rabbits who hear the name and come looking for it. Anyone in the pool can answer.'},
      {id: 'rae-lantern', name: 'A Light Underground', kind: 'featured', featured: ['lantern'], after: 'R1-2',
       blurb: 'Placeholder banner. Lantern Rabbit answers more often.'},
      {id: 'rae-masked', name: 'Faces in the Woods', kind: 'featured', featured: ['masked'], after: 'R1-4',
       blurb: 'Placeholder banner. Masked Rabbit answers more often.'},
    ],
  },
  frog: {
    currency: 'Writs', one: 'Writ', trade: 100,
    tease: 'A writ under the royal seal, delivered by runner…', seal: 'F',
    generic: ['lily', 'bruiser', 'reed', 'croaker', 'blade'],
    rares: ['duckweed', 'glimmer', 'bogsworth'],
    banners: [
      {id: 'frog-std', name: 'The Royal Levy', kind: 'standard',
       blurb: 'Frogs answering the crown\'s call to arms. Anyone in the pool can answer.'},
      {id: 'frog-duckweed', name: 'The King\'s Favour', kind: 'featured', featured: ['duckweed'], after: 'F1-2',
       blurb: 'Placeholder banner. Dame Duckweed answers more often.'},
      {id: 'frog-glimmer', name: 'Watch on the Ridge', kind: 'featured', featured: ['glimmer'], after: 'F1-3',
       blurb: 'Placeholder banner. Captain Glimmer answers more often.'},
    ],
  },
};
