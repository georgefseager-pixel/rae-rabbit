// ================= Campaigns =================
// Two stories run side by side. The player can switch between them at any time.
//
// Chapter fields
//   id, title, map, objective {type:'boss'|'rout'|'survive', turns}, enemyFaction
//   deploy        [[x,y], ...] starting tiles in order; the campaign's lord always takes the first
//   maxDeploy     how many units the player may bring
//   requires      chapter ids from EITHER campaign that must be cleared first (the convergence gates)
//   convergence   label shown on both sides of a shared story beat
//   enemies(flags)          initial enemy spawns
//   reinforce(flags)        [{turn, units:[spawns]}] arriving at the start of that enemy phase
//   pre / post / bossTalk   dialogue lines {who, text, if?:flag, unless?:flag}
//   reward        {res, joins:[characterKeys], flags:[...]}
//   bonus         {type:'noLosses', text, flag}  optional objective that sets a world flag
//   stub          placeholder for a chapter that isn't written yet
// Spawns: {cls, lv, x, y, ai:'charge'|'guard'|'hold', boss?, key?, name?, look?, bonus?:{stat:+n}}
// Flags are shared by both campaigns: how you play one side changes the other.

const E = (cls, lv, x, y, ai = 'charge', extra = {}) => Object.assign({cls, lv, x, y, ai}, extra);

const CAMPAIGNS = {
  rae: {
    faction: 'rae', name: 'The Raepublic', tagline: 'Soft things are hard to break.', lord: 'rae',
    start: ['rae', 'thimble', 'clover', 'willow', 'flopsy', 'bramble'], startRes: 200,
    recruits: [{cls:'conscript', after:'R2', cost:300}, {cls:'quarter', after:'R3', cost:400}],
    chapters: [
      {
        id:'R1', title:'The Ford at Stitchwater', map:'stitchwater', enemyFaction:'frog',
        objective:{type:'boss'}, maxDeploy:6,
        deploy:[[3,11],[4,10],[4,11],[2,11],[3,10],[5,10],[2,10],[5,11]],
        brief:'Stitchwater Ford is the only road north. Baron Jiggle Jaggle holds it with nine frogs and a gilded cleaver.',
        enemies: () => [
          E('bruiser',1,1,6), E('bruiser',1,6,7), E('blade',2,4,6,'guard'), E('reed',1,6,5,'guard'),
          E('lily',1,2,3,'guard'), E('lily',2,6,3,'guard'), E('bruiser',2,3,2,'guard'), E('reed',2,5,1,'guard'),
          E('baron',5,4,0,'hold',{boss:true, key:'jiggle', name:'Baron Jiggle Jaggle', look:'jiggle'}),
        ],
        pre: [
          {who:'narr', text:'For a hundred seasons the Friggliarchy has ruled the Toybox from the Lily Throne.'},
          {who:'narr', text:'Frogs feast on velvet cushions. Rabbits stitch in the Stuffing Mills until their seams split.'},
          {who:'narr', text:'But a thread, once pulled, unravels everything.'},
          {who:'rae', text:'They call us soft. Fine. Soft things are hard to break.'},
          {who:'rae', text:'Stitchwater Ford is the only road north. Baron Jiggle Jaggle holds it for King Friggle Fraggle. We take the ford, we take the road.'},
          {who:'willow', text:'Nine frogs, comrade. One of them is wearing a crown he did not earn. My arrows are counted and ready.'},
          {who:'flopsy', text:'I brought the big needle. Nobody comes apart today. Not on my watch.'},
          {who:'jiggle', text:'Rabbits? With swords? Croak the drums. Remind these cushions what they were made for.'},
          {who:'rae', text:'For the Raepublic. Raise the banner.'},
        ],
        bossTalk: [{who:'jiggle', text:'Do you know what you ARE, rabbit? Stuffing and thread. You were MADE to be held.'}],
        post: [
          {who:'jiggle', text:'The King… will unpick… every last one of you…'},
          {who:'rae', text:'Let him try. We know how to sew.'},
          {who:'narr', text:'Stitchwater Ford is taken. By morning, every mill in the Toybox has heard: the Raepublic is real.'},
        ],
        reward:{res:500, flags:['stitchwater_taken']},
      },
      {
        id:'R2', title:'The Stuffing Mills', map:'mills', enemyFaction:'frog',
        objective:{type:'rout'}, maxDeploy:6,
        deploy:[[3,11],[4,11],[2,11],[5,11],[3,10],[4,10],[1,10],[6,10]],
        brief:'A thousand rabbits card wool for frog cushions behind these spool walls. Rout the overseers and the looms are ours.',
        enemies: () => [
          E('bruiser',2,4,6), E('bruiser',2,2,7), E('lily',2,3,8,'guard'), E('reed',2,6,5,'guard'),
          E('lily',2,2,3,'guard'), E('bruiser',3,5,3,'guard'), E('reed',2,1,1,'guard'), E('croaker',3,6,1,'guard'),
          E('toadknight',3,5,0,'guard'),
        ],
        pre: [
          {who:'narr', text:'Three days south of the ford stand the Stuffing Mills, where a thousand rabbits card wool for frog cushions.'},
          {who:'bramble', text:'I was born in Mill Four. The overseers count us twice a day. They never count right.'},
          {who:'rae', text:'Then we free the mill and let everyone count themselves. Standing up.'},
        ],
        post: [
          {who:'narr', text:'The looms stop. For the first time in living memory, the Stuffing Mills are silent.'},
          {who:'pip', text:'Name\'s Pip. I\'ve got a broom handle and nothing left to lose. Where do I sign?'},
          {who:'rae', text:'You just did.'},
        ],
        reward:{res:600, joins:['pip'], flags:['mills_free']},
      },
      {
        id:'R3', title:'Night at Thimble Hollow', map:'hollow', enemyFaction:'frog',
        objective:{type:'survive', turns:7}, maxDeploy:7,
        deploy:[[4,6],[3,6],[5,6],[4,5],[2,7],[6,7],[4,7]],
        brief:'Lilyguard columns are closing on every road. Hold the hollow through seven turns of darkness.',
        bonus:{type:'noLosses', text:'Lose no comrades', flag:'hollow_unbroken'},
        enemies: () => [E('lily',3,1,0), E('bruiser',3,6,1), E('reed',3,3,1), E('blade',3,2,11), E('bruiser',3,6,10)],
        reinforce: () => [
          {turn:2, units:[E('lily',3,0,1), E('reed',3,7,11)]},
          {turn:4, units:[E('bruiser',4,4,0), E('lily',4,3,11), E('blade',3,7,5)]},
          {turn:5, units:[E('toadknight',4,0,6), E('reed',4,4,11)]},
        ],
        pre: [
          {who:'willow', text:'Scouts report Lilyguard on every road. They mean to smother us before word spreads.'},
          {who:'rae', text:'Then we hold the Hollow until dawn. Seven turns of dark. Everyone stands.'},
          {who:'flopsy', text:'Everyone stands. I will make sure of it.'},
        ],
        post: [{who:'narr', text:'Dawn finds Thimble Hollow still flying the red scarf.'}],
        reward:{res:700},
      },
      {
        id:'R4', title:'The Siege of Lilyhaven', map:'lilyhaven', enemyFaction:'frog', convergence:'Lilyhaven',
        requires:['F3'], objective:{type:'boss'}, maxDeploy:7,
        deploy:[[3,11],[4,11],[2,11],[5,11],[4,10],[3,10],[1,11],[6,11]],
        brief:'The summer palace of the Friggliarchy. Prince Fraggle Friggle commands the walls himself.',
        enemies: flags => [
          E('prince',6,3,0,'hold',{boss:true, key:'fraggle', name:'Fraggle Friggle', look:'fraggle', bonus:{mhp:4, def:1}}),
          E('lily',4,4,1,'guard'), E('reed',4,2,1,'guard'), E('reed',4,5,1,'guard'), E('croaker',4,4,2,'guard'),
          E('toadknight',4,3,3,'guard'), E('lily',4,4,3,'guard'), E('bruiser',4,2,5), E('bruiser',4,5,6), E('blade',4,5,7),
          ...(flags.reedwall_unbroken ? [E('reed',4,0,2,'guard'), E('reed',4,7,2,'guard')] : []),
        ],
        pre: [
          {who:'narr', text:'Lilyhaven: the summer palace of the Friggliarchy, its moat thick with lilies and its walls thick with archers.'},
          {who:'willow', text:'The Reedwall garrison came south without losing a frog. There are more bows on those walls than we planned for.', if:'reedwall_unbroken'},
          {who:'clover', text:'Prince Fraggle Friggle holds the gate. They say he has never lost a battle.'},
          {who:'rae', text:'Everyone has never lost, right up until they have.'},
        ],
        bossTalk: [{who:'fraggle', text:'The rabbit with the scarf. My father calls you a nuisance. I think you are a war.'}],
        post: [
          {who:'fraggle', text:'Fall back. Fall BACK. This is not finished, rabbit.'},
          {who:'narr', text:'The Prince escapes across the lily marsh. Lilyhaven\'s gates open from the inside.'},
        ],
        reward:{res:900, flags:['lilyhaven_fallen']},
      },
      {id:'R5', title:'The Road to the Lily Throne', stub:true, brief:'The next chapter of the Raepublic is still being stitched.'},
    ],
  },

  frog: {
    faction: 'frog', name: 'The Friggliarchy', tagline: 'Order is a kindness.', lord: 'fraggle',
    start: ['fraggle', 'tiggle', 'murk', 'gulp', 'lilyworth', 'quill'], startRes: 200,
    recruits: [{cls:'lily', after:null, cost:300}, {cls:'bruiser', after:'F1', cost:320}, {cls:'reed', after:'F2', cost:380}],
    chapters: [
      {
        id:'F1', title:'The Tithe of Crumbs', map:'pantry', enemyFaction:'mouse',
        objective:{type:'boss'}, maxDeploy:6,
        deploy:[[3,11],[4,11],[2,10],[5,10],[3,10],[4,10],[1,11],[6,11]],
        brief:'The pantry mice have paid no tithe this season. Their ringleader, Scrumbly, dances on the top shelf.',
        enemies: () => [
          E('nibbler',4,3,0,'hold',{boss:true, key:'scrumbly', name:'Scrumbly', look:'scrumbly', bonus:{mhp:6, def:2}}),
          E('nibbler',2,1,6), E('nibbler',2,6,6), E('slinger',2,2,3,'guard'), E('slinger',2,5,3,'guard'),
          E('chewer',2,3,5,'guard'), E('chewer',3,4,1,'guard'), E('nibbler',3,6,1,'guard'), E('slinger',3,1,1,'guard'),
        ],
        pre: [
          {who:'narr', text:'In the Lily Palace, King Friggle Fraggle receives the harvest tithe. The pantry mice have sent none.'},
          {who:'king', text:'The mice forget themselves, my son. Remind them. Gently, if they let you.'},
          {who:'fraggle', text:'They never let me, Father.'},
          {who:'tiggle', text:'Can I come? I will be very gentle. Mostly.'},
        ],
        bossTalk: [{who:'scrumbly', text:'We dance, we nibble, we pay no tithe! The pantry belongs to whoever is hungry!'}],
        post: [
          {who:'fraggle', text:'Take the crumbs. Leave them enough for the winter. A starved subject is a rebel in waiting.'},
          {who:'murk', text:'Mercy, my prince? Your father would call that weakness.'},
          {who:'fraggle', text:'My father calls everything weakness. That is why he needs me.'},
        ],
        reward:{res:500, flags:['tithe_collected']},
      },
      {
        id:'F2', title:'The Baron\'s Funeral', map:'stitchwater', enemyFaction:'rae', convergence:'After Stitchwater',
        requires:['R1'], objective:{type:'rout'}, maxDeploy:6,
        deploy:[[4,0],[3,1],[5,1],[2,1],[4,1],[6,1],[2,2],[6,2]],
        brief:'Stitchwater has fallen and Baron Jiggle Jaggle with it. Bury him at the ford, and clear the rebels who still hold it.',
        enemies: () => [
          E('conscript',3,1,6), E('conscript',3,6,6), E('conscript',3,2,5), E('outrider',3,5,9),
          E('quarter',3,3,7,'guard'), E('breaker',3,4,8,'guard'), E('captain',4,2,10,'guard'), E('mender',3,3,11,'guard'), E('quarter',3,6,10,'guard'),
        ],
        pre: [
          {who:'narr', text:'Word comes north: Stitchwater has fallen, and Baron Jiggle Jaggle with it. Unstitched by a rabbit in a red scarf.'},
          {who:'king', text:'A rabbit. With a SWORD. Bury Jiggle at the ford he lost, and bury whoever is still standing there beside him.'},
          {who:'fraggle', text:'Rabbits do not raise swords on their own. Someone taught them how.'},
          {who:'lilyworth', text:'Then let us find the teacher, my prince.'},
        ],
        post: [
          {who:'fraggle', text:'These are not bandits. They fight like they believe in something.'},
          {who:'quill', text:'So do we, my prince.'},
          {who:'fraggle', text:'…Do we?'},
        ],
        reward:{res:600, flags:['baron_buried']},
      },
      {
        id:'F3', title:'The Reedwall', map:'reedwall', enemyFaction:'rae',
        objective:{type:'survive', turns:6}, maxDeploy:7,
        deploy:[[3,0],[4,0],[2,1],[5,1],[3,1],[4,1],[1,1],[6,1]],
        brief:'The Reedwall guards the marsh road to Lilyhaven. Hold it for six turns until the King\'s barges arrive.',
        bonus:{type:'noLosses', text:'Lose no frogs', flag:'reedwall_unbroken'},
        enemies: () => [E('conscript',3,1,8), E('conscript',3,6,8), E('breaker',3,3,9), E('quarter',3,5,10), E('outrider',3,0,6)],
        reinforce: () => [
          {turn:2, units:[E('conscript',3,2,11), E('conscript',3,5,11)]},
          {turn:3, units:[E('captain',4,3,11), E('quarter',3,6,11)]},
          {turn:4, units:[E('breaker',4,1,11), E('outrider',4,7,10)]},
          {turn:5, units:[E('conscript',4,4,11), E('quarter',4,0,11)]},
        ],
        pre: [
          {who:'narr', text:'The Reedwall guards the marsh road to Lilyhaven. If it breaks, the summer palace lies open.'},
          {who:'fraggle', text:'Six turns. Hold six turns and the King\'s barges arrive.'},
          {who:'gulp', text:'Gulp.'},
          {who:'tiggle', text:'He means yes.'},
        ],
        post: [{who:'fraggle', text:'The wall held. Send word to Lilyhaven. I will command its defence myself.'}],
        reward:{res:700},
      },
      {
        id:'F4', title:'The Fall of Lilyhaven', map:'lilyhaven', enemyFaction:'rae', convergence:'Lilyhaven',
        requires:['R3'], objective:{type:'survive', turns:6}, maxDeploy:7,
        deploy:[[3,0],[4,0],[2,1],[5,1],[3,1],[4,1],[2,2],[5,2]],
        brief:'The red scarves are crossing the marsh. Hold the palace walls until the barges come.',
        enemies: () => [
          E('conscript',4,2,9), E('conscript',4,5,9), E('breaker',4,3,8), E('quarter',4,1,10),
          E('captain',5,4,10), E('outrider',4,6,10), E('mender',4,3,11),
        ],
        reinforce: flags => [
          {turn:2, units:[E('conscript',4,0,11), E('conscript',4,7,11)]},
          {turn:3, units:[E('breaker',4,2,11), E('quarter',4,5,11), ...(flags.hollow_unbroken ? [E('captain',5,4,11), E('breaker',5,3,11)] : [])]},
          {turn:4, units:[E('outrider',5,1,11), E('conscript',5,6,11)]},
        ],
        pre: [
          {who:'narr', text:'Across the lily marsh, the red scarves are coming.'},
          {who:'murk', text:'Their army came through Thimble Hollow without losing a single soul. That is not luck, my prince. That is faith.', if:'hollow_unbroken'},
          {who:'fraggle', text:'Hold the walls until the barges come. Then we will see whose faith floats.'},
        ],
        post: [
          {who:'narr', text:'The barges come, too late to save the palace. Fraggle Friggle crosses the marsh with what remains of his guard.'},
          {who:'fraggle', text:'Remember her face, Tiggle. We will see it again.'},
        ],
        reward:{res:900, flags:['lilyhaven_evacuated']},
      },
      {id:'F5', title:'The Lily Throne', stub:true, brief:'The next chapter of the Friggliarchy is still being stitched.'},
    ],
  },
};
