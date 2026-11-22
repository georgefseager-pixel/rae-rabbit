// ================= Weapons =================
// Every unit uses one weapon type, set by its class (CLASSES[cls].w): sword, lance, axe, bow or staff.
// Everyone starts with their class's basic weapon (its `wname`). Better weapons are items: they come from
// the story (stage reward `weapons`) and from recruiting (as results, and for duplicates), and any unit of the right type
// can carry one (unless it has an `owner`, then only that character can).
//   type   sword | lance | axe | bow | staff          stars  1–3 (rarity)
//   mt     might: added to Atk (for a staff: to Mag, so it mends more)
//   hit / crit   added to the chance to hit / to land a critical
//   rng    [min, max] range; leave out to use the class's usual range
//   lash   a whip: a bow-type weapon that lashes instead of firing (no projectile, a crack instead of a twang)
//   army   'rae' | 'frog': which army can get it from recruiting (story weapons have none)
//   owner  a character key: only they can carry it (personal story weapons)
const WEAPONS = {
  // ---- The Raepublic: tools and scraps from the mines, then better ----
  scrapblade:   {name: 'Scrap Blade',      type: 'sword', stars: 1, mt: 1, hit: 5,  crit: 0,  army: 'rae', desc: 'A sharpened sliver of a broken mine cart.'},
  tentpole:     {name: 'Tent Pole Spear',  type: 'lance', stars: 1, mt: 1, hit: 5,  crit: 0,  army: 'rae', desc: 'A guard-tent pole with a nail hammered into the end.'},
  spade:        {name: 'Sharpened Spade',  type: 'axe',   stars: 1, mt: 1, hit: 5,  crit: 0,  army: 'rae', desc: 'Dug with all day. Swung with all night.'},
  braidsling:   {name: 'Braided Sling',    type: 'bow',   stars: 1, mt: 1, hit: 5,  crit: 0,  army: 'rae', desc: 'Three strands of rope, plaited tight.'},
  boneneedle:   {name: 'Bone Needle',      type: 'staff', stars: 1, mt: 1, hit: 0,  crit: 0,  army: 'rae', desc: 'For quick stitches between fights.'},
  shearsabre:   {name: 'Shear Sabre',      type: 'sword', stars: 2, mt: 2, hit: 10, crit: 5,  army: 'rae', desc: 'One half of a pair of wool shears, wrapped at the grip.'},
  tunnelspear:  {name: 'Tunnel Spear',     type: 'lance', stars: 2, mt: 2, hit: 10, crit: 0,  army: 'rae', desc: 'Short enough to fight with underground.'},
  mattock:      {name: 'Miner\'s Mattock', type: 'axe',   stars: 2, mt: 3, hit: 0,  crit: 5,  army: 'rae', desc: 'Heavy, honest, and very hard to stop.'},
  longsling:    {name: 'Longsling',        type: 'bow',   stars: 2, mt: 2, hit: 5,  crit: 0,  rng: [2, 3], army: 'rae', desc: 'A long cord for a long throw: reaches 3 tiles.'},
  patchneedle:  {name: 'Patchwork Needle', type: 'staff', stars: 2, mt: 3, hit: 0,  crit: 0,  army: 'rae', desc: 'Threaded with every colour in the camp.'},
  moonshears:   {name: 'Moonlit Shears',   type: 'sword', stars: 3, mt: 4, hit: 15, crit: 15, army: 'rae', desc: 'Stolen from the overseer\'s own sewing room.'},
  gatehook:     {name: 'Gatehook Pike',    type: 'lance', stars: 3, mt: 4, hit: 15, crit: 5,  army: 'rae', desc: 'The hook that once barred the camp gate.'},
  rockbreaker:  {name: 'Rockbreaker',      type: 'axe',   stars: 3, mt: 5, hit: 5,  crit: 10, army: 'rae', desc: 'It split the deepest seam in the mine.'},
  starsling:    {name: 'Starshot Sling',   type: 'bow',   stars: 3, mt: 4, hit: 15, crit: 10, rng: [2, 3], army: 'rae', desc: 'Its stones glitter like the crystals in the rock. Reaches 3 tiles.'},
  thimble:      {name: 'Golden Thimble',   type: 'staff', stars: 3, mt: 5, hit: 0,  crit: 0,  army: 'rae', desc: 'No stitch made with it has ever come loose.'},
  // ---- The Friggliarchy: royal arms ----
  pondsword:    {name: 'Pond Sword',       type: 'sword', stars: 1, mt: 1, hit: 5,  crit: 0,  army: 'frog', desc: 'Standard issue, green at the hilt.'},
  lilypike:     {name: 'Lily Pike',        type: 'lance', stars: 1, mt: 1, hit: 5,  crit: 0,  army: 'frog', desc: 'Topped with a little iron lily.'},
  bogclub:      {name: 'Bog Club',         type: 'axe',   stars: 1, mt: 1, hit: 5,  crit: 0,  army: 'frog', desc: 'Bogwood, soaked until it\'s as hard as stone.'},
  rushbow:      {name: 'Rush Bow',         type: 'bow',   stars: 1, mt: 1, hit: 5,  crit: 0,  army: 'frog', desc: 'Bent from a single river reed.'},
  mudcenser:    {name: 'Mud Censer',       type: 'staff', stars: 1, mt: 1, hit: 0,  crit: 0,  army: 'frog', desc: 'Its smoke smells of the marsh, and soothes.'},
  rapier:       {name: 'Crowned Rapier',   type: 'sword', stars: 2, mt: 2, hit: 10, crit: 5,  army: 'frog', desc: 'Carried by officers of the Lily Court.'},
  courthalberd: {name: 'Court Halberd',    type: 'lance', stars: 2, mt: 2, hit: 10, crit: 0,  army: 'frog', desc: 'Polished for parades, sharpened for everything else.'},
  ironmace:     {name: 'Ironwood Mace',    type: 'axe',   stars: 2, mt: 3, hit: 0,  crit: 5,  army: 'frog', desc: 'A mace that sinks rather than floats.'},
  lash:         {name: 'Overseer\'s Lash', type: 'bow',   stars: 2, mt: 3, hit: 5,  crit: 0,  lash: true, army: 'frog', desc: 'A whip, used at range like a bow.'},
  silvercenser: {name: 'Silver Censer',    type: 'staff', stars: 2, mt: 3, hit: 0,  crit: 0,  army: 'frog', desc: 'Swung on a silver chain at court blessings.'},
  lilyblade:    {name: 'Lily Crown Blade', type: 'sword', stars: 3, mt: 4, hit: 15, crit: 15, army: 'frog', desc: 'Forged for a prince, with a lily in the pommel.'},
  glaive:       {name: 'Royal Glaive',     type: 'lance', stars: 3, mt: 4, hit: 15, crit: 5,  army: 'frog', desc: 'The King\'s guard carry nothing finer.'},
  kingsfall:    {name: 'Kingsfall Axe',    type: 'axe',   stars: 3, mt: 5, hit: 5,  crit: 10, army: 'frog', desc: 'Named for a king it didn\'t quite fell.'},
  dragonfly:    {name: 'Dragonfly Bow',    type: 'bow',   stars: 3, mt: 4, hit: 15, crit: 10, rng: [2, 3], army: 'frog', desc: 'Light as a wing and as quick. Reaches 3 tiles.'},
  thornwhip:    {name: 'Thornwhip',        type: 'bow',   stars: 3, mt: 5, hit: 10, crit: 5,  lash: true, army: 'frog', desc: 'A briar whip from the royal gardens.'},
  lilycenser:   {name: 'Golden Lily Censer', type: 'staff', stars: 3, mt: 5, hit: 0, crit: 0, army: 'frog', desc: 'Lit only for the King\'s own household.'},
  // ---- Story weapons (personal) ----
  laststand:    {name: 'Last Stand',       type: 'sword', stars: 3, mt: 5, hit: 15, crit: 10, owner: 'rae',
                 desc: 'Taken, the guards used to boast, from the last rabbit who fought back. Now it\'s Rae Rabbit\'s.'},
  silverneedle: {name: 'Silver Needle',    type: 'staff', stars: 3, mt: 4, hit: 0,  crit: 0,  owner: 'sister',
                 desc: 'From the overseer\'s sewing box. Little Sister mends better with it than anyone.'},
};

// Small line icons for each weapon type (drawn in the colour of the weapon's rarity).
const WEAPON_ICON = {
  sword: '<path d="M7 25 L23 9 M20 7 L25 12 M5 23 L9 27 M6 26 L3 29"/>',
  lance: '<path d="M5 27 L24 8 M24 8 L27 5 M21 6 L28 4 L26 11 Z"/>',
  axe:   '<path d="M8 28 L22 7 M18 5 C27 4 30 12 25 16 C22 13 19 11 18 5 Z"/>',
  bow:   '<path d="M9 4 C24 8 24 24 9 28 M9 4 L9 28 M9 16 L27 16 M23 13 L27 16 L23 19"/>',
  lash:  '<path d="M6 27 L11 20 M11 20 C17 12 26 20 21 25 C17 29 13 20 20 12 C24 7 28 8 28 5"/>',
  staff: '<path d="M8 28 L24 6 M22 5 C26 3 29 7 26 9 C24 10 22 8 22 5 Z M11 24 L14 26"/>',
};
const RARITY_COL = {0: '#b4a68d', 1: '#c9905a', 2: '#d2dbe6', 3: '#ecc673'};
function weaponIconSVG(w, size = 28){
  const shape = WEAPON_ICON[w.lash ? 'lash' : w.type] || WEAPON_ICON.sword;
  return `<svg class="wicon" viewBox="0 0 32 32" width="${size}" height="${size}" aria-hidden="true" style="color:${RARITY_COL[w.stars || 0]}"><g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${shape}</g></svg>`;
}
