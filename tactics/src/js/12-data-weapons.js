// ================= Weapons =================
// Every unit uses one weapon type, set by its class (CLASSES[cls].w): sword, lance, axe, bow or staff.
// Everyone starts with their class's basic weapon (its `wname`). Better weapons are items: they come from
// the story (stage reward `weapons`) and from recruiting (as results, and for duplicates), and any unit of the right type
// can carry one (unless it has an `owner`, then only that character can).
//   type   sword | lance | axe | bow | staff | tome          stars  1–3 (rarity)
//   mt     might (★ 1, ★★ 2, ★★★ 3–4; axes a point higher but less accurate): added to Atk (for a staff: to Mag, so it mends more)
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
  almanac:      {name: 'Tattered Almanac', type: 'tome',  stars: 1, mt: 1, hit: 5,  crit: 0,  army: 'rae', desc: 'Every page says when to plant. Some say when to rise.'},
  boneneedle:   {name: 'Bone Needle',      type: 'staff', stars: 1, mt: 1, hit: 0,  crit: 0,  army: 'rae', desc: 'For quick stitches between fights.'},
  shearsabre:   {name: 'Shear Sabre',      type: 'sword', stars: 2, mt: 2, hit: 10, crit: 5,  army: 'rae', desc: 'One half of a pair of wool shears, wrapped at the grip.'},
  tunnelspear:  {name: 'Tunnel Spear',     type: 'lance', stars: 2, mt: 2, hit: 10, crit: 0,  army: 'rae', desc: 'Short enough to fight with underground.'},
  mattock:      {name: 'Miner\'s Mattock', type: 'axe',   stars: 2, mt: 2, hit: 0, crit: 5,  army: 'rae', desc: 'Heavy, honest, and very hard to stop.'},
  longsling:    {name: 'Longsling',        type: 'bow',   stars: 2, mt: 2, hit: 5,  crit: 0,  rng: [2, 3], army: 'rae', desc: 'A long cord for a long throw: reaches 3 tiles.'},
  pamphlets:    {name: 'Rebel Pamphlets',  type: 'tome',  stars: 2, mt: 2, hit: 5, crit: 0,  army: 'rae', desc: 'Printed by night, passed hand to hand. Words can wound.'},
  patchneedle:  {name: 'Patchwork Needle', type: 'staff', stars: 2, mt: 3, hit: 0,  crit: 0,  army: 'rae', desc: 'Threaded with every colour in the camp.'},
  moonshears:   {name: 'Moonlit Shears',   type: 'sword', stars: 3, mt: 3, hit: 15, crit: 10, army: 'rae', desc: 'Stolen from the overseer\'s own sewing room.'},
  gatehook:     {name: 'Gatehook Pike',    type: 'lance', stars: 3, mt: 3, hit: 15, crit: 5,  army: 'rae', desc: 'The hook that once barred the camp gate.'},
  rockbreaker:  {name: 'Rockbreaker',      type: 'axe',   stars: 3, mt: 4, hit: 5, crit: 10, army: 'rae', desc: 'It split the deepest seam in the mine.'},
  starsling:    {name: 'Starshot Sling',   type: 'bow',   stars: 3, mt: 3, hit: 15, crit: 10, rng: [2, 3], army: 'rae', desc: 'Its stones glitter like the crystals in the rock. Reaches 3 tiles.'},
  charter:      {name: 'The Charter',      type: 'tome',  stars: 3, mt: 3, hit: 10, crit: 5,  rng: [1, 3], army: 'rae', desc: 'The founding words of the Republic. Reaches 3 tiles.'},
  thimble:      {name: 'Golden Thimble',   type: 'staff', stars: 3, mt: 4, hit: 0, crit: 0,  army: 'rae', desc: 'No stitch made with it has ever come loose.'},
  // ---- The Friggliarchy: royal arms ----
  pondsword:    {name: 'Pond Sword',       type: 'sword', stars: 1, mt: 1, hit: 5,  crit: 0,  army: 'frog', desc: 'Standard issue, green at the hilt.'},
  lilypike:     {name: 'Lily Pike',        type: 'lance', stars: 1, mt: 1, hit: 5,  crit: 0,  army: 'frog', desc: 'Topped with a little iron lily.'},
  bogclub:      {name: 'Bog Club',         type: 'axe',   stars: 1, mt: 1, hit: 5,  crit: 0,  army: 'frog', desc: 'Bogwood, soaked until it\'s as hard as stone.'},
  rushbow:      {name: 'Rush Bow',         type: 'bow',   stars: 1, mt: 1, hit: 5,  crit: 0,  army: 'frog', desc: 'Bent from a single river reed.'},
  mudcenser:    {name: 'Mud Censer',       type: 'staff', stars: 1, mt: 1, hit: 0,  crit: 0,  army: 'frog', desc: 'Its smoke smells of the marsh, and soothes.'},
  rapier:       {name: 'Crowned Rapier',   type: 'sword', stars: 2, mt: 2, hit: 10, crit: 5,  army: 'frog', desc: 'Carried by officers of the Lily Court.'},
  courthalberd: {name: 'Court Halberd',    type: 'lance', stars: 2, mt: 2, hit: 10, crit: 0,  army: 'frog', desc: 'Polished for parades, sharpened for everything else.'},
  ironmace:     {name: 'Ironwood Mace',    type: 'axe',   stars: 2, mt: 2, hit: 0, crit: 5,  army: 'frog', desc: 'A mace that sinks rather than floats.'},
  lash:         {name: 'Overseer\'s Lash', type: 'bow',   stars: 2, mt: 2, hit: 5, crit: 0,  lash: true, army: 'frog', desc: 'A whip, used at range like a bow.'},
  silvercenser: {name: 'Silver Censer',    type: 'staff', stars: 2, mt: 3, hit: 0,  crit: 0,  army: 'frog', desc: 'Swung on a silver chain at court blessings.'},
  lilyblade:    {name: 'Lily Crown Blade', type: 'sword', stars: 3, mt: 3, hit: 15, crit: 10, army: 'frog', desc: 'Forged for a prince, with a lily in the pommel.'},
  glaive:       {name: 'Royal Glaive',     type: 'lance', stars: 3, mt: 3, hit: 15, crit: 5,  army: 'frog', desc: 'The King\'s guard carry nothing finer.'},
  kingsfall:    {name: 'Kingsfall Axe',    type: 'axe',   stars: 3, mt: 4, hit: 5, crit: 10, army: 'frog', desc: 'Named for a king it didn\'t quite fell.'},
  dragonfly:    {name: 'Dragonfly Bow',    type: 'bow',   stars: 3, mt: 3, hit: 15, crit: 10, rng: [2, 3], army: 'frog', desc: 'Light as a wing and as quick. Reaches 3 tiles.'},
  thornwhip:    {name: 'Thornwhip',        type: 'bow',   stars: 3, mt: 4, hit: 10, crit: 5,  lash: true, army: 'frog', desc: 'A briar whip from the royal gardens.'},
  lilycenser:   {name: 'Golden Lily Censer', type: 'staff', stars: 3, mt: 4, hit: 0, crit: 0, army: 'frog', desc: 'Lit only for the King\'s own household.'},
  // ---- Story weapons (personal) ----
  laststand:    {name: 'Last Stand',       type: 'sword', stars: 3, mt: 4, hit: 15, crit: 10, owner: 'rae',
                 desc: 'Taken, the guards used to boast, from the last rabbit who fought back. Now it\'s Rae Rabbit\'s.'},
  silverneedle: {name: 'Silver Needle',    type: 'staff', stars: 3, mt: 3, hit: 0, crit: 0,  owner: 'sister',
                 desc: 'From the overseer\'s sewing box. Little Sister mends better with it than anyone.'},
};

// Weapon icons: drawn upright in a 64×64 box (blades and needles then tilted to a diagonal), with steel,
// wood and leather, and fittings in the rarity's colour (bronze ★, silver ★★, gold ★★★; Basic is plain).
const RARITY_COL = {0: '#a3927a', 1: '#cc8a4c', 2: '#d3dce7', 3: '#f1c95f'};
const W_O = '#1d140d';   // outline
const WEAPON_ICON = {
  sword: A => `<g transform="rotate(45 32 32)">
    <path d="M32 3 L36.5 10 L36.5 39 L27.5 39 L27.5 10 Z" fill="url(#wSteel)" stroke="${W_O}" stroke-width="1.4"/>
    <path d="M32 9 V36" stroke="#8592a1" stroke-width="1.3"/>
    <rect x="20.5" y="38.5" width="23" height="5" rx="2.5" fill="${A}" stroke="${W_O}" stroke-width="1.4"/>
    <rect x="29.4" y="43.5" width="5.2" height="11.5" rx="1.6" fill="#5b3a24" stroke="${W_O}" stroke-width="1.3"/>
    <path d="M29.4 46.5 L34.6 48.5 M29.4 50.5 L34.6 52.5" stroke="#9a6d46" stroke-width="1.1"/>
    <circle cx="32" cy="58" r="3.6" fill="${A}" stroke="${W_O}" stroke-width="1.4"/></g>`,
  lance: A => `<g transform="rotate(45 32 32)">
    <rect x="30.1" y="17" width="3.8" height="45" rx="1.6" fill="url(#wWood)" stroke="${W_O}" stroke-width="1.3"/>
    <path d="M32 1 L38.5 12 L35.2 19.5 L28.8 19.5 L25.5 12 Z" fill="url(#wSteel)" stroke="${W_O}" stroke-width="1.4"/>
    <path d="M32 4.5 V17" stroke="#8592a1" stroke-width="1.2"/>
    <rect x="28.3" y="19" width="7.4" height="4" rx="1.2" fill="${A}" stroke="${W_O}" stroke-width="1.3"/>
    <rect x="29.3" y="57" width="5.4" height="5" rx="1.2" fill="${A}" stroke="${W_O}" stroke-width="1.3"/></g>`,
  axe: A => `<g transform="rotate(30 32 32)">
    <rect x="30.1" y="8" width="3.8" height="54" rx="1.7" fill="url(#wWood)" stroke="${W_O}" stroke-width="1.3"/>
    <path d="M33.5 12 C42 7.5 52 9.5 55 18 C56.5 24 55.5 30 53.5 34.5 C48 29 41 27 33.5 28 Z" fill="url(#wSteel)" stroke="${W_O}" stroke-width="1.4"/>
    <path d="M50.5 13 C54.5 18 54.6 27 53 31.5" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="1.3"/>
    <path d="M30.5 14.5 L23.5 19 L30.5 23.5 Z" fill="url(#wSteel)" stroke="${W_O}" stroke-width="1.3"/>
    <rect x="28.8" y="24.5" width="6.4" height="5" rx="1.3" fill="${A}" stroke="${W_O}" stroke-width="1.3"/>
    <path d="M30.1 50 L33.9 52 M30.1 54 L33.9 56" stroke="#4a2e1b" stroke-width="1.1"/></g>`,
  bow: A => `<path d="M14 32 H49" stroke="${W_O}" stroke-width="3.6" stroke-linecap="round"/><path d="M14 32 H49" stroke="url(#wWood)" stroke-width="2"/>
    <path d="M48 27.5 L57 32 L48 36.5 Z" fill="url(#wSteel)" stroke="${W_O}" stroke-width="1.3"/>
    <path d="M14 32 L9.5 27.5 M14 32 L9.5 36.5 M17.5 32 L13 27.5 M17.5 32 L13 36.5" stroke="${A}" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M22 4 C43 13 43 51 22 60" fill="none" stroke="${W_O}" stroke-width="6.4" stroke-linecap="round"/>
    <path d="M22 4 C43 13 43 51 22 60" fill="none" stroke="url(#wWood)" stroke-width="4" stroke-linecap="round"/>
    <path d="M22 5 V59" stroke="#efe6d2" stroke-width="1.1"/>
    <rect x="34" y="26.5" width="5.6" height="11" rx="2.2" fill="${A}" stroke="${W_O}" stroke-width="1.3"/>
    <circle cx="22" cy="4.5" r="2.4" fill="${A}" stroke="${W_O}"/><circle cx="22" cy="59.5" r="2.4" fill="${A}" stroke="${W_O}"/>`,
  sling: A => `<path d="M32 60 V38 M32 38 L19 15 M32 38 L45 15" fill="none" stroke="${W_O}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M32 60 V38 M32 38 L19 15 M32 38 L45 15" fill="none" stroke="url(#wWood)" stroke-width="5.4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M19 15 Q24 30 32 30 Q40 30 45 15" fill="none" stroke="#d9b48a" stroke-width="2.2"/>
    <ellipse cx="32" cy="30" rx="5.6" ry="3.4" fill="#6b4223" stroke="${W_O}" stroke-width="1.2"/>
    <circle cx="32" cy="27.5" r="3.6" fill="#aeb7c1" stroke="${W_O}" stroke-width="1.2"/>
    <rect x="28.6" y="45" width="6.8" height="10" rx="2.2" fill="${A}" stroke="${W_O}" stroke-width="1.3"/>
    <circle cx="19" cy="15" r="2.3" fill="${A}" stroke="${W_O}"/><circle cx="45" cy="15" r="2.3" fill="${A}" stroke="${W_O}"/>`,
  lash: A => `<path d="M9 57 L22 44" stroke="${W_O}" stroke-width="7.4" stroke-linecap="round"/><path d="M9 57 L22 44" stroke="#5b3a24" stroke-width="5" stroke-linecap="round"/>
    <path d="M11 52 L14 55 M14 49 L17 52 M17 46 L20 49" stroke="#9a6d46" stroke-width="1.1"/>
    <path d="M22 44 C34 31 54 40 51 25 C48 12 29 16 35 7" fill="none" stroke="${W_O}" stroke-width="4.6" stroke-linecap="round"/>
    <path d="M22 44 C34 31 54 40 51 25 C48 12 29 16 35 7" fill="none" stroke="#8a5a34" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M35 7 L39.5 3.5" stroke="${A}" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="9" cy="57" r="3.4" fill="${A}" stroke="${W_O}" stroke-width="1.3"/><circle cx="22" cy="44" r="3" fill="${A}" stroke="${W_O}" stroke-width="1.3"/>`,
  tome: A => `<path d="M14 13 C22 9 28 10 32 14 C36 10 42 9 50 13 V52 C42 48 36 49 32 53 C28 49 22 48 14 52 Z" fill="#efe2c4" stroke="${W_O}" stroke-width="1.4"/>
    <path d="M11 16 V55 C20 51 27 52 32 56 C37 52 44 51 53 55 V16" fill="none" stroke="#6b2a22" stroke-width="3.2" stroke-linejoin="round"/>
    <path d="M32 14 V53" stroke="${W_O}" stroke-opacity=".45" stroke-width="1.2"/>
    <path d="M18 20 H28 M18 25 H28 M18 30 H26 M36 20 H46 M36 25 H46 M36 30 H44" stroke="#8d7d63" stroke-width="1.3"/>
    <circle cx="41" cy="40" r="5.2" fill="${A}" stroke="${W_O}" stroke-width="1.2"/><path d="M41 36.5 L42.2 39.3 L45 39.5 L42.8 41.3 L43.5 44 L41 42.5 L38.5 44 L39.2 41.3 L37 39.5 L39.8 39.3 Z" fill="${W_O}" fill-opacity=".5"/>
    <path d="M26 6 C30 9 33 12 34 17" fill="none" stroke="${A}" stroke-width="1.6" stroke-linecap="round"/>`,
  needle: A => `<g transform="rotate(45 32 32)">
    <path d="M32 3 L34.4 11 L34.4 51 L32 62 L29.6 51 L29.6 11 Z" fill="url(#wSteel)" stroke="${W_O}" stroke-width="1.3"/>
    <ellipse cx="32" cy="12.5" rx="1.1" ry="3.4" fill="${W_O}"/></g>
    <path d="M45.5 18.5 C52 22 54 30 46 34 C38 38 34 46 42 52 C46 55 52 52 53 48" fill="none" stroke="${A}" stroke-width="2.2" stroke-linecap="round"/>`,
  thimble: A => `<path d="M19 53 L21.5 23 C22 11 42 11 42.5 23 L45 53 Z" fill="${A}" stroke="${W_O}" stroke-width="1.4"/>
    <g fill="${W_O}" fill-opacity=".35">${[22, 29, 36, 43].map((y, r) => [0, 1, 2, 3, 4].map(c => `<circle cx="${24.4 + c*3.8 + (r % 2)*1.9}" cy="${y}" r="1.15"/>`).join('')).join('')}</g>
    <path d="M25 16 C27 14 30 13.5 32 13.5" stroke="#fff" stroke-opacity=".7" stroke-width="1.4" fill="none"/>
    <rect x="17" y="49" width="30" height="7" rx="2.4" fill="${A}" stroke="${W_O}" stroke-width="1.4"/>
    <path d="M18 52.5 H46" stroke="${W_O}" stroke-opacity=".35" stroke-width="1"/>`,
  censer: A => `<path d="M32 2 V16" stroke="${A}" stroke-width="1.8" stroke-dasharray="2.2 1.6"/><circle cx="32" cy="3" r="2.2" fill="none" stroke="${A}" stroke-width="1.5"/>
    <path d="M27 14 C23 10 30 7.5 26.5 3.5 M38 14 C41.5 10 35 7.5 38.5 3.5" fill="none" stroke="#dfe5ea" stroke-opacity=".65" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="32" cy="17.5" r="2.6" fill="${A}" stroke="${W_O}" stroke-width="1.2"/>
    <path d="M19.5 27 C19.5 18.5 44.5 18.5 44.5 27 Z" fill="${A}" stroke="${W_O}" stroke-width="1.4"/>
    <g fill="${W_O}" fill-opacity=".5"><circle cx="27" cy="23.5" r="1.2"/><circle cx="32" cy="22" r="1.2"/><circle cx="37" cy="23.5" r="1.2"/></g>
    <path d="M17.5 27 H46.5 C46.5 40 40 46.5 32 46.5 C24 46.5 17.5 40 17.5 27 Z" fill="${A}" stroke="${W_O}" stroke-width="1.4"/>
    <path d="M19 32 H45" stroke="${W_O}" stroke-opacity=".35" stroke-width="2.2"/>
    <path d="M26 46 L23.5 53 H40.5 L38 46" fill="${A}" stroke="${W_O}" stroke-width="1.3"/>`,
};
const WEAPON_DEFS = `<defs><linearGradient id="wSteel" x1="0" x2="1"><stop offset="0" stop-color="#f6f9fc"/><stop offset=".55" stop-color="#bcc6d2"/><stop offset="1" stop-color="#7c8795"/></linearGradient>
  <linearGradient id="wWood" x1="0" x2="1"><stop offset="0" stop-color="#b07a47"/><stop offset="1" stop-color="#6b4223"/></linearGradient></defs>`;
function weaponKind(w){
  if (w.lash) return 'lash';
  if (w.type === 'bow') return /sling/i.test(w.name) ? 'sling' : 'bow';
  if (w.type === 'staff') return /censer/i.test(w.name) ? 'censer' : /thimble/i.test(w.name) ? 'thimble' : 'needle';
  return WEAPON_ICON[w.type] ? w.type : 'sword';
}
function weaponIconSVG(w, size = 28){
  const A = RARITY_COL[w.stars || 0];
  return `<svg class="wicon" viewBox="0 0 64 64" width="${size}" height="${size}" aria-hidden="true">${WEAPON_DEFS}
    <circle cx="32" cy="32" r="30.5" fill="${A}" fill-opacity=".13" stroke="${A}" stroke-opacity=".45" stroke-width="1.2"/>${WEAPON_ICON[weaponKind(w)](A)}</svg>`;
}
