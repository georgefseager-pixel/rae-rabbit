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
    name: 'The Festive Season', month: 11, icon: '🎁',
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
};
const eventActive = id => { const E = EVENTS[id]; return !!E && (!!SAVE?.debugDecember && id === 'december' || gameDate().getMonth() === E.month); };
const eventsOn = ck => Object.keys(EVENTS).filter(id => eventActive(id) && campOpen(ck));
const giftName = (ck, n) => n === 1 ? EVENTS.december.currency[ck].one : EVENTS.december.currency[ck].name;

// ---------- December side stories ----------
const COURIER = (x, y, extra = {}) => E('courier', 4, x, y, 'courier', {courier: true, name: 'Gift Courier', ...extra});
CAMPAIGNS.rae.sides.push({
  id: 'XM-R', title: 'How Rae Stole Christmas', event: 'december', map: 'snowWoods', enemyFaction: 'frog', enemyLine: 'THE COURIERS SET OFF',
  objective: {type: 'intercept'}, maxDeploy: 6, enemyMods: {},
  deploy: [[4,9],[5,9],[3,11],[6,11],[1,11],[8,11]],
  exits: [[1,15],[4,15],[5,15],[8,15]],
  brief: 'Frog couriers are carrying the festive presents south through the snowy woods. Catch as many as you can before they reach the road at the bottom of the map. Every courier caught is a Rabbit Gift.',
  prepNote: 'Once a day, all December. The couriers don\'t fight unless cornered: they run for the road (the gold squares). Eight in all. Catching every one is hard.',
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
  prepNote: 'Once a day, all December. The couriers (blue) walk to the road on their own, slowly: they\'re carrying presents. The rabbits go for the couriers first. Saving all eight is hard.',
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
for (const ck of ['rae', 'frog']) for (const s of CAMPAIGNS[ck].sides) if (s.event){
  const at = CAMPAIGNS[ck].stages.find(x => x.id === SIDE_OPENS[ck]); Object.assign(s, {side: true, chapter: at.chapter, ci: at.ci, si: 0, rank: 0});
}
const eventPlayedToday = s => (SAVE.eventPlays || {})[s.id] === todayKey();
const eventMaxGifts = s => [...(s.enemies ? s.enemies({}) : []), ...(s.allies ? s.allies({}) : []), ...(s.reinforce ? s.reinforce({}).flatMap(w => w.units) : [])].filter(u => u.courier).length;

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
// what a banner is paid with: {key in the army's gacha state, name, one, seal, tease}
function bannerCur(ck, b){
  if (b?.currency === 'gifts'){ const c = EVENTS[b.event].currency[ck]; return {key: 'gifts', name: c.name, one: c.one, seal: '🎁', tease: b.tease}; }
  const a = GACHA_ARMY[ck]; return {key: 'tokens', name: a.currency, one: a.one, seal: a.seal, tease: a.tease};
}
// event banners show only while their event is on (and the Camp is open)
const bannerVisible = b => !b.event || (eventActive(b.event) && campOpen(b.army));

// ---------- The event's tutorial (once per season, per route) ----------
const eventTutKey = (id, ck) => `tut-event-${id}-${gameDate().getFullYear()}-${ck}`;
function eventTutorial(ck){
  const id = eventsOn(ck).find(id => !SAVE.flags[eventTutKey(id, ck)]); if (!id) return;
  SAVE.flags[eventTutKey(id, ck)] = true; saveGame();
  return talk([{card: EVENTS[id].name, sub: 'Seasonal Event'}, ...EVENTS[id].intro[ck]]).then(() => { hubTab = 'side'; renderHub(); });
}
