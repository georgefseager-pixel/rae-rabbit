// ================= Supports (Camp conversations) =================
// After Chapter One, each army's leader can sit down with the unique (★★★) units in their army.
// Every pairing has three ranks, C → B → A, each unlocked by paying the army's money (Thread / Crowns).
// Each rank also makes the partner permanently stronger (SUPPORT.boost); after A they can Train for more.
// This is the only way to spend money on a unit's stats (there is no Drill or weapon upgrade).
//   kind: 'friend' (they become friends) | 'learn' (the leader learns something from them) | 'family'
//   about: a one-line hint of what the conversations are about (shown in the Camp)
//   C / B / A: the scene for that rank, as dialogue lines (see 25-data-campaign.js). Leave a rank out to get
//              a placeholder scene. Anyone unique without an entry here gets placeholder scenes too.
const SUPPORT = {
  ranks: ['C', 'B', 'A'],
  cost: {C: 200, B: 400, A: 800},
  // what each rank gives the partner, permanently (HP, Atk, Def, Spd, Skl)
  boost: {C: {mhp: 2, atk: 1, def: 1}, B: {mhp: 2, spd: 1, skl: 1}, A: {mhp: 3, atk: 1, def: 1, spd: 1}},
  // after rank A: Train, +1 to two stats (+2 if HP), weighted by the unit's growths. The price rises each time.
  train: {cost: 300, step: 100, max: 10},
  opensAfter: {rae: 'R1-4', frog: 'F1-4'},   // the end of each army's Chapter One
  scene: {rae: 'woods', frog: 'yard'},       // where the leader's camp is
  kinds: {friend: 'Friendship', learn: 'Lessons', family: 'Family'},
};
// Keyed by the leader, then by the unit.
const SUPPORTS = {
  rae: {
    sister:    {kind: 'family', about: 'Two sisters, and everything they never had time to say in the camp.'},
    willow:    {kind: 'learn',  about: 'Willow teaches Rae what the Republic really is, and what it costs.'},
    brigand:   {kind: 'friend', about: 'A bandit who stopped running, and the rebel who gave him a reason.'},
    condemned: {kind: 'friend', about: 'He owes Rae his life. Little by little, she earns his trust.'},
    lantern:   {kind: 'friend', about: 'Placeholder character.'},
    ironear:   {kind: 'friend', about: 'Placeholder character.'},
  },
  tiggle: {
    biggle:      {kind: 'family', about: 'Two brothers, one crown between them, and very different ideas of order.'},
    rhubarb:     {kind: 'learn',  about: 'The overseer shows the prince how the mines are really run.'},
    executioner: {kind: 'learn',  about: 'The headsman teaches Tiggle what carrying out a sentence means.'},
    duckweed:    {kind: 'friend', about: 'Placeholder character.'},
    glimmer:     {kind: 'friend', about: 'Placeholder character.'},
    bogsworth:   {kind: 'friend', about: 'Placeholder character.'},
  },
};
