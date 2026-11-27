// ================= Seasonal events =================
// A seasonal event runs for a set month and brings time-limited side stories and/or recruiting banners. Events only
// appear once a route's Side Stories are open (the Camp), and introduce themselves with a short tutorial.
// Event side stories can be played once a (game) day, and pay the event's own currency by how well you did.
//   EVENTS[id] = {name, month (0 = January … 11 = December), currency: {ck: {name, one}}, intro: {ck: [lines]}}
// Event stages live with the side stories (CAMPAIGNS[ck].sides, `event: id`) and event banners with the other
// banners (GACHA_ARMY[ck].banners, `event: id`, `currency: 'gifts'`).
// Debug: "Debug: December" pretends it's the event month; "Debug: New Day" moves the game's calendar on a day
// (so the daily log-in and once-a-day event stories come round again).
const gameDate = () => new Date(Date.now() + ((typeof SAVE !== 'undefined' && SAVE?.debugDays) || 0)*864e5);
const EVENTS = {
  december: {
    name: 'The Festive Season', month: 11, icon: '🎁', key: 'gifts',
    look: {cls: 'festive', kind: '❄ Festive banner · December only ❄', rate: '🎁 Festive', fx: 'bsnow', chip: 'Festive · December', until: '🎁 Festive · until 31 December', verb: '🎁 Unwrap', tap: 'Tap to unwrap'}, scene: {rae: ['snow', 'The Snowy Woods · December'], frog: ['snow', 'The Snowy Woods · December']},
    currency: {rae: {name: 'Rabbit Gifts', one: 'Rabbit Gift'}, frog: {name: 'Frog Gifts', one: 'Frog Gift'}},
    intro: {
      rae: [
        {who: 'narr', text: 'Snow has fallen on the felt forest. It\'s the festive season, for the whole of December!'},
        {who: 'sister', text: 'Rae! RAE! The frog couriers are out with their present sacks again! Every year it\'s presents for frogs and a cold for rabbits!'},
        {who: 'narr', text: 'A seasonal side story is open on the Side Stories tab: How Rae Stole Christmas. It can be played once a day, all December.'},
        {who: 'narr', text: 'Every frog courier you catch is a Rabbit Gift. Spend them on the festive recruiting banner, before the season ends.'},
      ],
      frog: [
        {who: 'narr', text: 'Snow has fallen on the felt forest. It\'s the festive season, for the whole of December!'},
        {who: 'elfscout', text: 'Your Highness! The rabbits are after the festival presents! The ones for the frog children at the capital!'},
        {who: 'narr', text: 'A seasonal side story is open on the Side Stories tab: Froggy Festivities. It can be played once a day, all December.'},
        {who: 'narr', text: 'Every courier you get safely through is a Frog Gift. Spend them on the festive recruiting banner, before the season ends.'},
      ],
    },
  },
  // January: ring in the New Year. Hold the bell posts (fort squares); first to ring twelve wins (objective 'bells').
  newyear: {
    name: 'Ring in the New Year', month: 0, icon: '🔔', key: 'chimes',
    look: {cls: 'nyb', kind: '🔔 New Year banner · January only 🔔', rate: '🌟 New Year', fx: 'bspark', chip: 'New Year · January', until: '🔔 New Year · until 31 January', verb: '🌟 Recruit', tap: 'Tap to break the seal'}, scene: {rae: ['yard', 'The Old Watch-Posts · New Year'], frog: ['warcamp', 'The War Camp · New Year']},
    currency: {rae: {name: 'Rabbit Chimes', one: 'Rabbit Chime'}, frog: {name: 'Frog Chimes', one: 'Frog Chime'}},
    intro: {rae: [
      {who: "narr", text: "The year is turning. Out in the felt forest, the Raepublic is about to see its first New Year free, for the whole of January!"},
      {who: "sister", text: "Rae! Do you remember the shift bells? The ones that rang us awake in the dark, every morning, every year?"},
      {who: "rae", text: "I remember."},
      {who: "narr", text: "A seasonal side story is open on the Side Stories tab: The Shift Bells. It can be played once a day, all January."},
      {who: "narr", text: "Hold the old bell posts and ring in the New Year before the frogs do. Win by a wide margin for more Rabbit Chimes."},
      {who: "narr", text: "Spend them on the New Year recruiting banner, Wishes on the First Star, before January is out."},
    ], frog: [
      {who: "narr", text: "The year is turning. In Tiggle's war camp, the soldiers want a New Year's contest, for the whole of January!"},
      {who: "biggle", text: "An old Lily Court custom, little brother. Two teams, four bells, first to ring twelve. Loser polishes everyone's boots."},
      {who: "narr", text: "A seasonal side story is open on the Side Stories tab: The War Camp Bells. It can be played once a day, all January."},
      {who: "narr", text: "Hold the bells and ring in the New Year before Biggle's team does. Win by a wide margin for more Frog Chimes."},
      {who: "narr", text: "Spend them on the New Year recruiting banner, The Midnight Ball, before January is out."},
    ]},
  },
};
// The game's month: the real one, or the one the debug menu pretends it is (SAVE.debugMonth, 0 = January).
const gameMonth = () => (SAVE?.debugMonth ?? gameDate().getMonth());
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const eventActive = id => { const E = EVENTS[id]; return !!E && gameMonth() === E.month; };
const eventsOn = ck => Object.keys(EVENTS).filter(id => eventActive(id) && campOpen(ck));
const giftName = (ck, n, id = 'december') => n === 1 ? EVENTS[id].currency[ck].one : EVENTS[id].currency[ck].name;

// ---------- December side stories ----------
const COURIER = (x, y, extra = {}) => E('courier', 4, x, y, 'courier', {courier: true, name: 'Gift Courier', ...extra});
CAMPAIGNS.rae.sides.push({
  id: 'XM-R', title: 'How Rae Stole Christmas', event: 'december', map: 'snowWoods', enemyFaction: 'frog', enemyLine: 'THE COURIERS SET OFF',
  objective: {type: 'intercept'}, maxDeploy: 6, enemyMods: {},
  deploy: [[4,9],[5,9],[3,11],[6,11],[1,11],[8,11]],
  exits: [[1,15],[4,15],[5,15],[8,15]],
  brief: 'Frog couriers are carrying the festive presents south through the snowy woods. Catch as many as you can before they reach the road at the bottom of the map. Every courier caught is a Rabbit Gift.',
  prepNote: 'No one is unstitched for good. Once a day, all December. The couriers don\'t fight unless cornered: they run for the road (the gold squares). Eight in all. Catching every one is hard.',
  enemies: () => [COURIER(2,0), COURIER(7,0), COURIER(4,1), E('reed',4,1,13,'guard'), E('reed',4,8,13,'guard')],
  reinforce: () => [
    {turn: 1, units: [COURIER(1,0), COURIER(5,0), COURIER(8,0)]},
    {turn: 2, units: [COURIER(3,0), COURIER(6,0), E('blade',4,4,0)]},
  ],
  pre: [
    {card: 'Seasonal Side Story', sub: 'How Rae Stole Christmas'},
    {scene: 'snow', place: 'The Snowy Woods · December'},
    {who: 'narr', text: 'Every year, on the shortest day, frog couriers carry sacks of presents through the woods to the capital.'},
    {who: 'sister', text: 'Presents. For FROGS. Every single year. Do you know what rabbits get every year, Rae?'},
    {who: 'rae', text: '…Extra digging?'},
    {who: 'sister', text: 'Extra digging! And a cold!'},
    {who: 'willow', text: 'Technically, those presents were bought with ore that rabbits dug.'},
    {who: 'rae', text: 'So technically, they\'re our presents.'},
    {who: 'sister', text: 'TECHNICALLY!'},
    {who: 'rae', text: 'Right. The couriers run for the road south. We catch as many as we can before they get there. Nobody gets hurt. Much.'},
    {who: 'sister', text: 'And then rabbits get presents! I\'m wearing my scarf. It\'s a stealing scarf now.'},
  ],
  post: [
    {who: 'sister', text: 'Look at them all! Socks! A tin drum! A jar of pickled flies… we can give that one back.'},
    {who: 'willow', text: 'This one\'s just a lump of coal.'},
    {who: 'rae', text: 'Who\'s it addressed to?'},
    {who: 'willow', text: '"Rhubarb."'},
    {who: 'rae', text: '…Put it back in the sack. Some things are tradition.'},
  ],
  reward: {res: 200, tokens: 0},
});
CAMPAIGNS.frog.sides.push({
  id: 'XM-F', title: 'Froggy Festivities', event: 'december', map: 'snowWoods', enemyFaction: 'rae', enemyLine: 'THE PRESENT THIEVES STRIKE',
  objective: {type: 'survive', turns: 6, escort: true}, escort: true, maxDeploy: 6, enemyMods: {},
  deploy: [[3,2],[5,2],[2,2],[4,3],[6,3],[1,3]],
  exits: [[1,15],[4,15],[5,15],[8,15]],
  brief: 'Rabbit thieves are after the festival presents. Get the frog couriers to the road at the bottom of the map, or keep them safe for six turns. Every courier protected is a Frog Gift.',
  prepNote: 'No one is unstitched for good. Once a day, all December. The couriers (blue) walk to the road on their own, slowly: they\'re carrying presents. The rabbits go for the couriers first. Saving all eight is hard.',
  allies: () => [COURIER(1,0,{bonus: {mov: -1}}), COURIER(3,0,{bonus: {mov: -1}}), COURIER(5,0,{bonus: {mov: -1}}), COURIER(8,0,{bonus: {mov: -1}}),
                 COURIER(2,1,{bonus: {mov: -1}}), COURIER(6,1,{bonus: {mov: -1}}), COURIER(7,1,{bonus: {mov: -1}}), COURIER(9,1,{bonus: {mov: -1}})],
  enemies: () => [E('runner',4,0,6), E('runner',4,9,7), E('rfencer',4,0,9), E('rfighter',4,9,10), E('rarcher',4,2,12,'guard'), E('rlancer',4,7,12,'guard')],
  reinforce: () => [
    {turn: 1, units: [E('runner',4,0,4), E('runner',4,9,4)]},
    {turn: 2, units: [E('rfencer',4,0,13), E('rfighter',4,9,13)]},
    {turn: 3, units: [E('runner',4,4,15), E('runner',4,5,15)]},
  ],
  pre: [
    {card: 'Seasonal Side Story', sub: 'Froggy Festivities'},
    {scene: 'snow', place: 'The Snowy Woods · December'},
    {who: 'narr', text: 'Every year, on the shortest day, couriers carry presents through the woods to the frog children of the capital.'},
    {who: 'elfscout', text: 'Your Highness! Terrible news! Rabbits in the woods! They\'re stealing the PRESENTS!'},
    {who: 'tiggle', text: 'The presents? Who steals presents?'},
    {who: 'biggle', text: 'Rabbits, apparently. In their infinite wickedness.'},
    {who: 'tiggle', text: 'Biggle, are you wearing a paper crown?'},
    {who: 'biggle', text: '…It came out of a cracker. It\'s regulation.'},
    {who: 'tiggle', text: 'Right. We get the couriers to the road south. Every present that gets through is a frog child who doesn\'t cry on festival morning.'},
    {who: 'biggle', text: 'Shields up. Crowns on.'},
  ],
  post: [
    {who: 'tiggle', text: 'We got them through! Well. Most of them.'},
    {who: 'elfscout', text: 'One of the rabbits took a whole sack, Highness. She was wearing a scarf. She said it was a "stealing scarf".'},
    {who: 'biggle', text: 'Disgraceful. …Has anyone seen my crown?'},
  ],
  reward: {res: 200, tokens: 0},
});
// side story fields the list expects
// ---------- New Year side stories (January): hold the bell posts, first to ring twelve ----------
// Objective 'bells' (40-battle.js): every fort square is a bell; at the end of each side's turn, each bell that side is
// standing on rings once. First to `n` wins; after `turns` turns the side with more rings wins. Pays by the margin.
const BELL_PAY = 8;
CAMPAIGNS.rae.sides.push({
  id: 'NY-R', title: 'The Shift Bells', event: 'newyear', map: 'shiftBells', enemyFaction: 'frog', enemyLine: 'THE GUARDS RUN FOR THE BELLS',
  objective: {type: 'bells', n: 12, turns: 14}, maxDeploy: 6, enemyMods: {},
  deploy: [[4,14],[5,14],[3,13],[6,13],[2,14],[7,14]],
  brief: 'The old mine watch-posts each hold a shift bell. A bell rings for whoever is standing at it when their turn ends. Ring twelve before the frog guards do. The bigger your lead, the more Rabbit Chimes.',
  prepNote: 'No one is unstitched for good. Once a day, all January. The bells are the three posts (fort squares). End your turn on them to ring them; the guards will try to take them back.',
  enemies: () => [E('lily',3,5,2,'bell'), E('blade',3,4,1,'bell'), E('reed',3,6,1,'bell'), E('bruiser',3,2,3,'bell'), E('lily',3,7,3,'bell')],
  reinforce: () => [{turn: 3, units: [E('blade',3,0,0,'bell'), E('bruiser',3,9,0,'bell')]}, {turn: 6, units: [E('lily',4,4,0,'bell'), E('reed',3,5,0,'bell')]}],
  reward: {res: 200, tokens: 0},
  pre: [
    {card: 'Seasonal Side Story', sub: 'The Shift Bells'},
    {scene: 'yard', place: 'The Old Watch-Posts · New Year\'s Eve'},
    {who: "narr", text: "At the edge of the felt forest stand the old watch-posts of the mine camp, each with a brass shift bell. For years, those bells rang the rabbits awake in the dark."},
    {who: "sister", text: "Every morning. Every single morning, Rae. Clang, clang, up you get, down the shaft."},
    {who: "willow", text: "Tonight the frog guards will ring them at midnight, for their New Year. As they always have."},
    {who: "rae", text: "Not this year. This year rabbits ring them. Twelve times, for twelve years of digging."},
    {who: "willow", text: "Then hold the posts. A bell rings for whoever is standing at it when the turn ends. The frogs will try the same."},
    {who: "sister", text: "First to twelve! And then we're free for a whole new year!"},
  ],
  post: [
    {who: "narr", text: "Twelve chimes ring out over the treetops, and every rabbit in the camp below looks up."},
    {who: "sister", text: "Happy New Year, Rae."},
    {who: "rae", text: "Happy New Year, Flopsy. Our first one."},
    {who: "willow", text: "The first of a great many, I should think."},
  ],
});
CAMPAIGNS.frog.sides.push({
  id: 'NY-F', title: 'The War Camp Bells', event: 'newyear', map: 'campBells', enemyFaction: 'frog', spar: true, ban: ['biggle'], enemyLine: 'BIGGLE\'S TEAM RUNS FOR THE BELLS',
  objective: {type: 'bells', n: 12, turns: 14}, maxDeploy: 6, enemyMods: {},
  deploy: [[4,14],[5,14],[3,13],[6,13],[2,14],[7,14]],
  brief: 'Tiggle\'s team against Biggle\'s: four bells hung from the tent poles. A bell rings for whoever is standing at it when their turn ends. Ring twelve first. The bigger your lead, the more Frog Chimes.',
  prepNote: 'Once a day, all January. A friendly contest: nobody is unstitched for good. Biggle plays for the other team. End your turn on the bells (fort squares) to ring them.',
  enemies: () => [E('courtknight',3,4,2,'bell',{key: 'biggle', name: 'Biggle Baggle', look: 'biggle', flees: true}), E('blade',3,2,3,'bell'), E('blade',3,7,3,'bell'),
                  E('lily',3,3,1,'bell'), E('reed',3,6,1,'bell'), E('bruiser',3,5,4,'bell')],
  reinforce: () => [{turn: 4, units: [E('blade',3,0,0,'bell'), E('bruiser',3,9,0,'bell')]}],
  reward: {res: 200, tokens: 0},
  pre: [
    {card: 'Seasonal Side Story', sub: 'The War Camp Bells'},
    {scene: 'warcamp', place: 'The War Camp · New Year\'s Eve'},
    {who: "narr", text: "New Year's Eve in the war camp. The soldiers have hung four bells from the tent poles, and the whole camp has come out to watch."},
    {who: "biggle", text: "Lily Court rules, little brother. My team, your team, four bells. A bell rings for whoever is standing at it when the turn ends. First to twelve."},
    {who: "tiggle", text: "And if I lose?"},
    {who: "biggle", text: "Then you polish every boot in the camp. Including mine. Especially mine."},
    {who: "tiggle", text: "Fine. But nobody gets hurt. It's New Year."},
    {who: "biggle", text: "Nobody ever gets hurt in the bell game. Much."},
  ],
  post: [
    {who: "narr", text: "The twelfth bell rings out, and the whole camp cheers, both teams together."},
    {who: "biggle", text: "Not bad, little brother. Not bad at all."},
    {who: "tiggle", text: "Happy New Year, Biggle."},
    {who: "biggle", text: "Happy New Year. Now go and enjoy it. Somebody else can polish the boots."},
  ],
});
for (const ck of ['rae', 'frog']) for (const s of CAMPAIGNS[ck].sides) if (s.event){
  const at = CAMPAIGNS[ck].stages.find(x => x.id === SIDE_OPENS[ck]); Object.assign(s, {side: true, chapter: at.chapter, ci: at.ci, si: 0, rank: 0});
}
const eventPlayedToday = s => (SAVE.eventPlays || {})[s.id] === todayKey();
const eventMaxGifts = s => s.objective?.type === 'bells' ? BELL_PAY : [...(s.enemies ? s.enemies({}) : []), ...(s.allies ? s.allies({}) : []), ...(s.reinforce ? s.reinforce({}).flatMap(w => w.units) : [])].filter(u => u.courier).length;

// ---------- December banners (paid with Gifts) ----------
GACHA_ARMY.rae.banners.push({id: 'rae-festive', name: 'A Sack Full of Rabbits', kind: 'featured', event: 'december', currency: 'gifts', festive: true,
  pool: ['ilc'], attires: ['floraXmas'], bg: 'snow', troops: 'festive',
  tease: 'A parcel in brown paper, tied with string. It\'s been shaken. Something rattles.',
  blurb: 'December only, paid for with Rabbit Gifts from How Rae Stole Christmas. Ilc the Scout, a young frog courier who got tired of walking past the mine camps with a sack full of presents, has defected to deliver them to rabbits instead. Featuring Hoppy Xmas: Flopsy Flora in a jumper she knitted herself. The ★ and ★★ who answer are Republic soldiers in their festive colours.'});
GACHA_ARMY.rae.troops.festive = {stars: [1, 2], generic: ['xfencer', 'xfighter', 'xlancer', 'xarcher', 'xadept'],
  names: ['Mitten', 'Bramblejam', 'Sloe', 'Crumble', 'Ginger', 'Cranberry', 'Clementine', 'Toffee', 'Hob', 'Quince', 'Chestnut', 'Marzipan', 'Snowberry', 'Gingersnap', 'Plum']};
GACHA_ARMY.frog.banners.push({id: 'frog-festive', name: 'Gifts for the Capital', kind: 'featured', event: 'december', currency: 'gifts', festive: true,
  pool: ['chriggle'], attires: ['gingerbiggle'], bg: 'snow', troops: 'elves',
  tease: 'A box wrapped in green paper and gold ribbon, stamped with the royal seal. It smells faintly of pondweed.',
  blurb: 'December only, paid for with Frog Gifts from Froggy Festivities. Chriggle Chraggle, the first Gift-Bringer and Friggle Fraggle\'s legendary ancestor, has come down from wherever he spends the rest of the year. He has a list. Featuring Gingerbiggle: Biggle in gingerbread, as he appeared in a nightmare after eating an entire gingerbread house. The ★ soldiers who answer are frog scouts in elf green; the ★★ have been promoted to Santa red.'});
GACHA_ARMY.frog.troops.elves = {stars: [1, 2], generic: ['xblade', 'xaxe', 'xpike', 'xbow', 'xscribe'],
  names: ['Jingle', 'Tinsel', 'Sprout', 'Holly', 'Pudding', 'Bauble', 'Sleet', 'Cracker', 'Nutmeg', 'Figgy', 'Wassail', 'Snowdrop', 'Mince', 'Clove', 'Ivy']};
// ---------- January banner (paid with Chimes) ----------
// Raepublic: Willow's Starlight Scholar (attire only, as on Across the Stream); the ★ and ★★ are Republic soldiers.
// Friggliarchy: Tiggle's Life of the Party (attire only); the ★ and ★★ are the Court's own frog soldiers.
GACHA_ARMY.rae.banners.push({id: 'rae-newyear', name: 'Wishes on the First Star', kind: 'featured', event: 'newyear', currency: 'gifts',
  featured: [], attires: ['willowStarlight'], bg: 'yard', troops: 'republic',
  tease: 'A folded paper star, tied to a bell-rope. Somebody has written a wish inside and then, very carefully, crossed it out.',
  blurb: 'January only, paid for with Rabbit Chimes from The Shift Bells. On the first clear night of the year, Willow climbs the old watch-post with a book of star charts and a cloak she has been embroidering since autumn. Featuring Starlight Scholar: Willow under the New Year stars, whose spells bring shooting stars down beside her targets. The ★ and ★★ who answer are Republic soldiers.'});
GACHA_ARMY.frog.banners.push({id: 'frog-newyear', name: 'The Midnight Ball', kind: 'featured', event: 'newyear', currency: 'gifts',
  featured: [], attires: ['tiggleParty'], bg: 'court',
  tease: 'An invitation on thick cream card, edged in gold leaf. Dancing until midnight. Attendance is not optional.',
  blurb: 'January only, paid for with Frog Chimes from The War Camp Bells. The Lily Court sees the year out with a ball, and the Prince is expected to dance. He does. Rather a lot. Featuring Life of the Party: Tiggle in sequins and a party hat, and every enemy he beats gets the whole party going again. The ★ and ★★ who answer are the Court\'s own soldiers.'});
// a banner's seasonal look (its event's), or null
const bannerLook = b => (b?.event && EVENTS[b.event]?.look) || null;
// what a banner is paid with: {key in the army's gacha state, name, one, seal, tease}
function bannerCur(ck, b){
  if (b?.currency === 'gifts'){ const E_ = EVENTS[b.event], c = E_.currency[ck]; return {key: E_.key || 'gifts', name: c.name, one: c.one, seal: E_.icon, tease: b.tease}; }
  const a = GACHA_ARMY[ck]; return {key: 'tokens', name: a.currency, one: a.one, seal: a.seal, tease: a.tease};
}
// event banners show only while their event is on (and the Camp is open)
const bannerVisible = b => !b.event || (eventActive(b.event) && campOpen(b.army));

// ---------- The event's tutorial (once per season, per route) ----------
const eventTutKey = (id, ck) => `tut-event-${id}-${gameDate().getFullYear()}-${ck}`;
function eventTutorial(ck){
  const id = eventsOn(ck).find(id => !SAVE.flags[eventTutKey(id, ck)]); if (!id) return;
  SAVE.flags[eventTutKey(id, ck)] = true; saveGame();
  const [scene, place] = EVENTS[id].scene?.[ck] || [];
  return talk([{card: EVENTS[id].name, sub: 'Seasonal Event'}, ...(scene ? [{scene, place}] : []), ...EVENTS[id].intro[ck]]).then(() => { hubTab = 'side'; renderHub(); });
}
