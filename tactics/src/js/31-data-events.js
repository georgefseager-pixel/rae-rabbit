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
        {who: 'narr', text: "Snow has fallen on the felt forest. The festive season has begun, and it lasts all December."},
        {who: 'sister', text: "Rae! The frog couriers are on the road with their present sacks again. In the mines we used to watch them go past the fence, and none of the sacks were ever for us."},
        {who: 'narr', text: "A seasonal side story is open on the Side Stories tab: How Rae Stole Christmas. You can play it once a day, all December."},
        {who: 'narr', text: "Every frog courier you catch earns a Rabbit Gift. Spend them on the festive recruiting banner before the season ends."},
      ],
      frog: [
        {who: 'narr', text: "Snow has fallen on the felt forest. The festive season has begun, and it lasts all December."},
        {who: 'elfscout', text: "Your Highness! There are rabbits in the woods, after the festival presents. Those sacks are for the frog children in the capital!"},
        {who: 'narr', text: "A seasonal side story is open on the Side Stories tab: Froggy Festivities. You can play it once a day, all December."},
        {who: 'narr', text: "Every courier you keep safe earns a Frog Gift. Spend them on the festive recruiting banner before the season ends."},
      ],
    },
  },
  // January: ring in the New Year. Hold the bell posts (fort squares); first to ring twelve wins (objective 'bells').
  newyear: {
    name: 'Ring in the New Year', month: 0, icon: '🔔', key: 'chimes',
    look: {cls: 'nyb', kind: '🔔 New Year banner · January only 🔔', rate: '🌟 New Year', fx: 'bspark', chip: 'New Year · January', until: '🔔 New Year · until 31 January', verb: '🌟 Recruit', tap: 'Tap to break the seal'}, scene: {rae: ['yard', 'The Old Watch-Posts · New Year'], frog: ['warcamp', 'The War Camp · New Year']},
    currency: {rae: {name: 'Rabbit Chimes', one: 'Rabbit Chime'}, frog: {name: 'Frog Chimes', one: 'Frog Chime'}},
    intro: {rae: [
      {who: "narr", text: "The year is turning, and the rabbits of the Raepublic will see it in as free rabbits for the first time. The New Year celebrations last all January."},
      {who: "sister", text: "Rae, do you remember the shift bells? They rang us awake in the dark every morning, all year round."},
      {who: "rae", text: "I remember. I used to wake up before them, just so I wouldn't have to hear them start."},
      {who: "narr", text: "A seasonal side story is open on the Side Stories tab: The Shift Bells. You can play it once a day, all January."},
      {who: "narr", text: "Hold the old bell posts and ring twelve chimes before the frogs do. The bigger your lead at the end, the more Rabbit Chimes you earn."},
      {who: "narr", text: "Spend them on the New Year recruiting banner, Wishes on the First Star, before January is out."},
    ], frog: [
      {who: "narr", text: "The year is turning, and the soldiers in Tiggle's war camp want a New Year's contest. The celebrations last all January."},
      {who: "biggle", text: "It's an old Lily Court custom, little brother. Two teams and four bells, and the first team to ring twelve wins. The losers polish everyone's boots."},
      {who: "narr", text: "A seasonal side story is open on the Side Stories tab: The War Camp Bells. You can play it once a day, all January."},
      {who: "narr", text: "Hold the bells and ring twelve chimes before Biggle's team does. The bigger your lead at the end, the more Frog Chimes you earn."},
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
  brief: "Frog couriers are carrying the festive presents south through the snowy woods. Catch as many as you can before they reach the road at the bottom of the map. Every courier you catch is a Rabbit Gift.",
  prepNote: "Nobody is unstitched for good, and you can play once a day, all December. There are eight couriers. They don't fight unless they're cornered; they run for the road (the gold squares). Catching all eight is hard.",
  enemies: () => [COURIER(2,0), COURIER(7,0), COURIER(4,1), E('reed',4,1,13,'guard'), E('reed',4,8,13,'guard')],
  reinforce: () => [
    {turn: 1, units: [COURIER(1,0), COURIER(5,0), COURIER(8,0)]},
    {turn: 2, units: [COURIER(3,0), COURIER(6,0), E('blade',4,4,0)]},
  ],
  pre: [
    {card: 'Seasonal Side Story', sub: 'How Rae Stole Christmas'},
    {scene: 'snow', place: 'The Snowy Woods · December'},
    {who: 'narr', text: "Every year, on the shortest day, frog couriers carry sacks of presents through the woods to the capital. Their road runs past the mine camps."},
    {who: 'sister', text: "Do you remember what rabbits got on the shortest day, Rae? When we were still in the mines?"},
    {who: 'rae', text: "An extra shift, because the guards wanted the day off."},
    {who: 'willow', text: "And every present in those sacks was paid for with ore that rabbits dug."},
    {who: 'rae', text: "Then we're taking some of it back. The couriers will run for the road south, and we catch as many as we can before they reach it. They're couriers, not soldiers, so catch them and don't hurt them more than you have to."},
    {who: 'sister', text: "And this year the rabbits get presents! I'm wearing my scarf. It's my stealing scarf now."},
  ],
  post: [
    {who: 'sister', text: "Look at it all! Socks, mittens, a tin drum, and a jar of pickled flies. We can give that one back."},
    {who: 'willow', text: "There's a lump of coal at the bottom of this sack. The label says it's for Rhubarb."},
    {who: 'rae', text: "Leave that one for the couriers to deliver. Flopsy Flora, take the rest back to camp and share it out, the youngest first."},
    {who: 'sister', text: "Everyone gets something, even the grown-ups. I'm going to wrap them all again first, so they can open them properly."},
  ],
  reward: {res: 200, tokens: 0},
});
CAMPAIGNS.frog.sides.push({
  id: 'XM-F', title: 'Froggy Festivities', event: 'december', map: 'snowWoods', enemyFaction: 'rae', enemyLine: 'THE PRESENT THIEVES STRIKE',
  objective: {type: 'survive', turns: 6, escort: true}, escort: true, maxDeploy: 6, enemyMods: {},
  deploy: [[3,2],[5,2],[2,2],[4,3],[6,3],[1,3]],
  exits: [[1,15],[4,15],[5,15],[8,15]],
  brief: "Rabbit thieves are after the festival presents. Get the frog couriers to the road at the bottom of the map, or keep them safe for six turns. Every courier you keep safe is a Frog Gift.",
  prepNote: "Nobody is unstitched for good, and you can play once a day, all December. The eight couriers (blue) walk to the road on their own, slowly, because of the sacks. The rabbits go for the couriers first. Saving all eight is hard.",
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
    {who: 'narr', text: "Every year, on the shortest day, couriers carry presents through the woods to the frog children of the capital."},
    {who: 'elfscout', text: "Your Highness! There are rabbits in the woods, and they're stealing the presents!"},
    {who: 'tiggle', text: "Stealing presents? Those are for children."},
    {who: 'biggle', text: "The rabbits won't see it that way. They'll say rabbits dug the ore that paid for them."},
    {who: 'tiggle', text: "Perhaps they did. But the children in the capital didn't dig anything either, and they'll be waiting. Biggle, are you wearing a paper crown?"},
    {who: 'biggle', text: "It came out of a cracker. You wear what comes out of the cracker."},
    {who: 'tiggle', text: "Then here's the plan. We walk the couriers down to the road south and keep the rabbits off them, for six turns if we have to."},
  ],
  post: [
    {who: 'tiggle', text: "We got them through. Most of them, anyway."},
    {who: 'elfscout', text: "One rabbit got away with a whole sack, Highness. A small one in a scarf. She shouted that it was her \"stealing scarf\"."},
    {who: 'biggle', text: "Let her keep it. The rabbits in those mine camps don't get much on the shortest day."},
    {who: 'tiggle', text: "That's kind of you, Biggle. Come on. The couriers will want hot soup before they go on to the capital."},
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
  brief: "Each of the old mine watch-posts holds a shift bell. At the end of each side's turn, every bell that side is standing on rings once. Ring twelve before the frog guards do; if nobody has after fourteen turns, whoever has rung more wins. The bigger your lead, the more Rabbit Chimes.",
  prepNote: "Nobody is unstitched for good, and you can play once a day, all January. The bells are the three posts (fort squares). End your turn standing on them to ring them. The guards will try to take them back.",
  enemies: () => [E('lily',3,5,2,'bell'), E('blade',3,4,1,'bell'), E('reed',3,6,1,'bell'), E('bruiser',3,2,3,'bell'), E('lily',3,7,3,'bell')],
  reinforce: () => [{turn: 3, units: [E('blade',3,0,0,'bell'), E('bruiser',3,9,0,'bell')]}, {turn: 6, units: [E('lily',4,4,0,'bell'), E('reed',3,5,0,'bell')]}],
  reward: {res: 200, tokens: 0},
  pre: [
    {card: 'Seasonal Side Story', sub: 'The Shift Bells'},
    {scene: 'yard', place: 'The Old Watch-Posts · New Year\'s Eve'},
    {who: "narr", text: "At the edge of the felt forest stand the old watch-posts of the mine camp, each with a brass shift bell. For years those bells woke the rabbits in the dark and sent them down the shafts."},
    {who: "sister", text: "I used to hate the sound so much, Rae. I'd hide under the blanket, and it never helped."},
    {who: "willow", text: "Tonight the frog guards will ring them at midnight for their New Year, the way they always have."},
    {who: "rae", text: "Not this year. This year rabbits ring them, twelve times, for twelve years of digging."},
    {who: "willow", text: "Then you'll have to hold the posts. At the end of your turn, each bell you're standing on rings once. The guards can ring them the same way, so they'll be trying to push you off."},
    {who: "sister", text: "First to twelve! And then the new year starts with rabbits ringing it in."},
  ],
  post: [
    {who: "narr", text: "Twelve chimes ring out over the treetops. Down in the camp, every rabbit stops what they're doing and looks up."},
    {who: "sister", text: "Happy New Year, Rae."},
    {who: "rae", text: "Happy New Year, Flopsy Flora. Our first one out of the mines."},
    {who: "willow", text: "Let's ring them again next year, and the year after. I'd like this to be a Raepublic custom."},
  ],
});
CAMPAIGNS.frog.sides.push({
  id: 'NY-F', title: 'The War Camp Bells', event: 'newyear', map: 'campBells', enemyFaction: 'frog', spar: true, ban: ['biggle'], enemyLine: 'BIGGLE\'S TEAM RUNS FOR THE BELLS',
  objective: {type: 'bells', n: 12, turns: 14}, maxDeploy: 6, enemyMods: {},
  deploy: [[4,14],[5,14],[3,13],[6,13],[2,14],[7,14]],
  brief: "Tiggle's team against Biggle's, with four bells hung from the tent poles. At the end of each side's turn, every bell that side is standing on rings once. Ring twelve first; if nobody has after fourteen turns, whoever has rung more wins. The bigger your lead, the more Frog Chimes.",
  prepNote: "A friendly contest: nobody is unstitched for good, and you can play once a day, all January. Biggle plays for the other team. End your turn standing on the bells (fort squares) to ring them.",
  enemies: () => [E('courtknight',3,4,2,'bell',{key: 'biggle', name: 'Biggle Baggle', look: 'biggle', flees: true}), E('blade',3,2,3,'bell'), E('blade',3,7,3,'bell'),
                  E('lily',3,3,1,'bell'), E('reed',3,6,1,'bell'), E('bruiser',3,5,4,'bell')],
  reinforce: () => [{turn: 4, units: [E('blade',3,0,0,'bell'), E('bruiser',3,9,0,'bell')]}],
  reward: {res: 200, tokens: 0},
  pre: [
    {card: 'Seasonal Side Story', sub: 'The War Camp Bells'},
    {scene: 'warcamp', place: 'The War Camp · New Year\'s Eve'},
    {who: "narr", text: "New Year's Eve in the war camp. The soldiers have hung four bells from the tent poles, and the whole camp has come out to watch."},
    {who: "biggle", text: "Lily Court rules, little brother. My team against yours. At the end of a team's turn, each bell it's standing on rings once. First to twelve wins."},
    {who: "tiggle", text: "And if I lose?"},
    {who: "biggle", text: "Then you polish every boot in the camp, starting with mine."},
    {who: "tiggle", text: "Agreed. But nobody gets hurt. It's New Year."},
    {who: "biggle", text: "Padded weapons, then. I'm still not going to let you win."},
  ],
  post: [
    {who: "narr", text: "The twelfth bell rings out, and the whole camp cheers, both teams together."},
    {who: "biggle", text: "Well played, little brother. You held the bells better than I did."},
    {who: "tiggle", text: "Happy New Year, Biggle."},
    {who: "biggle", text: "Happy New Year. My team will polish the camp's boots, and I'll do yours myself. Go and enjoy the party."},
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
  tease: "A parcel in brown paper, tied with string, that somebody has already shaken to hear what rattles.",
  blurb: "December only, paid with Rabbit Gifts from How Rae Stole Christmas. Every year Ilc the Scout carried a sack of presents to the capital, past mine camps where rabbit children watched from the fence. This year he turned off the road and brought it to the Raepublic. His bright red nose guides anyone near him through the snow. Also featuring Hoppy Xmas: Flopsy Flora in a jumper she knitted herself, whose mending comes with a present. The ★ and ★★ are Republic soldiers in festive colours."});
GACHA_ARMY.rae.troops.festive = {stars: [1, 2], generic: ['xfencer', 'xfighter', 'xlancer', 'xarcher', 'xadept'],
  names: ['Mitten', 'Bramblejam', 'Sloe', 'Crumble', 'Ginger', 'Cranberry', 'Clementine', 'Toffee', 'Hob', 'Quince', 'Chestnut', 'Marzipan', 'Snowberry', 'Gingersnap', 'Plum']};
GACHA_ARMY.frog.banners.push({id: 'frog-festive', name: 'Gifts for the Capital', kind: 'featured', event: 'december', currency: 'gifts', festive: true,
  pool: ['chriggle'], attires: ['gingerbiggle'], bg: 'snow', troops: 'elves',
  tease: "A box in green paper and gold ribbon, stamped with the royal seal and smelling faintly of pondweed.",
  blurb: "December only, paid with Frog Gifts from Froggy Festivities. In frog legend, Chriggle Chraggle was the first Gift-Bringer, an ancestor of King Friggle Fraggle who comes back every December with presents and the Naughty List. Any enemy he hits goes on it, and everyone hits it harder for the rest of the battle. Also featuring Gingerbiggle, the costume Biggle had made after a nightmare about a gingerbread house. He carries a candy-cane rapier and is hard to hit after a long run, but gingerbread breaks easily. The ★ soldiers are frog scouts in elf green; the ★★ wear Santa red."});
GACHA_ARMY.frog.troops.elves = {stars: [1, 2], generic: ['xblade', 'xaxe', 'xpike', 'xbow', 'xscribe'],
  names: ['Jingle', 'Tinsel', 'Sprout', 'Holly', 'Pudding', 'Bauble', 'Sleet', 'Cracker', 'Nutmeg', 'Figgy', 'Wassail', 'Snowdrop', 'Mince', 'Clove', 'Ivy']};
// ---------- January banner (paid with Chimes) ----------
// Raepublic: Willow's Starlight Scholar (attire only, as on Across the Stream); the ★ and ★★ are Republic soldiers.
// Friggliarchy: Tiggle's Life of the Party (attire only); the ★ and ★★ are the Court's own frog soldiers.
GACHA_ARMY.rae.banners.push({id: 'rae-newyear', name: 'Wishes on the First Star', kind: 'featured', event: 'newyear', currency: 'gifts',
  featured: [], attires: ['willowStarlight'], bg: 'yard', troops: 'republic',
  tease: "A folded paper star tied to a bell-rope, with a wish written inside and then carefully crossed out.",
  blurb: "January only, paid with Rabbit Chimes from The Shift Bells. On the first clear night of the year, Willow takes her star charts up the old watch-post, wearing a cloak she has been embroidering since autumn. Featuring Starlight Scholar: Willow under the New Year stars. Each spell that hits brings a shooting star down beside her target, striking the enemies around it. The ★ and ★★ are Republic soldiers."});
GACHA_ARMY.frog.banners.push({id: 'frog-newyear', name: 'The Midnight Ball', kind: 'featured', event: 'newyear', currency: 'gifts',
  featured: [], attires: ['tiggleParty'], bg: 'court',
  tease: "An invitation on thick cream card, edged in gold leaf, to the Lily Court's New Year Ball. The Prince's attendance is required.",
  blurb: "January only, paid with Frog Chimes from The War Camp Bells. The Lily Court sees the old year out with a ball, and the Prince is expected to dance. This year Tiggle dances until three in the morning. Featuring Life of the Party: Tiggle in sequins and a party hat. Each time he defeats an enemy, the allies around him recover. The ★ and ★★ are the Court's own frog soldiers."});
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
