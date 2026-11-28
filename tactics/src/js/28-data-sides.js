// ================= Side Stories =================
// Every unique character gets a set of three side stories. The Side Stories tab opens with the Camp (SIDE_OPENS, the
// same stage as SUPPORT.opensAfter, and the same tutorial), and then they open one at a time: the first with Support C
// with that character, the second with B, the third with A.
// Clearing all three opens Support S (the final conversation, in 27-data-supports.js).
// A side story is a stage (same fields as 25-data-campaign.js), plus a few that only side stories tend to use:
//   lead: key     someone else leads (the battle is lost if they fall)
//   ban: [keys]   characters who can't be deployed
//   spar: true    a training fight: nobody is unstitched for real, and a fleeing boss "yields"
//   teaser        one line shown while it's locked
//   flashback     set years ago: only the `lead` and ordinary soldiers can deploy
//   yields        the stage's fleeing boss surrenders ("Yields!") instead of escaping
// Side stories use the Chapter Two outfits and run at full strength (enemyMods: {}).
const SIDE_OPENS = SUPPORT.opensAfter;

const SIDE_SETS = {
  // ---------- Willow's Lessons: Willow trains Rae on the practice field. Each teaches one thing. ----------
  willow: {camp: 'rae', title: 'Willow\'s Lessons', about: 'Three training fights on the practice field, where Willow leads a squad against Rae. Each one teaches a single lesson about how battles are won.',
    quests: [
      {
        id: 'WL-1', title: 'Lesson One: The High Ground', map: 'ridge', enemyFaction: 'rae', enemyLine: 'WILLOW\'S SQUAD ADVANCES',
        spar: true, ban: ['willow'], enemyMods: {},
        teaser: 'Willow has asked Rae to meet her on the practice field at first light.',
        star: {type: 'turns', n: 8, text: 'Win within 8 turns'},
        objective: {type: 'boss'}, maxDeploy: 6,
        deploy: [[3,11],[4,11],[2,11],[5,11],[3,10],[4,10]],
        brief: 'Willow\'s squad holds the rocks on the ridge, where they\'re hard to hit. They wait for you to come within reach: draw them off one at a time, and fight from your own cover.',
        prepNote: 'A training fight: anyone who falls is only knocked out. Willow leads the other side, so she can\'t be deployed.',
        enemies: () => [
          E('scholar',4,3,2,'hold',{boss: true, flees: true, key: 'willow', name: 'Willow', look: 'willow'}),
          E('rarcher',3,2,3,'guard'), E('rarcher',3,6,4,'guard'), E('radept',3,3,3,'guard'),
          E('rfencer',3,4,6,'guard'), E('rlancer',3,5,6,'guard'), E('rfighter',3,1,8,'guard'),
        ],
        bossTalk: [
          {who: 'willow', text: 'You\'ve reached me. But I\'m standing on rock, so you\'ll miss me more often than I miss you.'},
        ],
        pre: [
          {scene: 'ridge', place: 'The Practice Field · First Light'},
          {who: 'willow', text: 'Today my squad holds the ridge, and you have to take it from us.'},
          {who: 'willow', text: 'Look at the ground before you look at my soldiers. Rocks are slow to climb, but anyone on them is harder to hit and harder to hurt. Trees give the same cover, only less.'},
          {who: 'rae', text: 'So I stay off the open grass, and I don\'t attack anyone on a rock.'},
          {who: 'willow', text: 'Not if you can help it. My soldiers will wait up there until one of yours comes within reach, then come down to fight. Let them come, and meet them from the trees.'},
          {who: 'willow', text: 'Tap any square to see what it gives you. The swords are wooden and the spears padded, so nobody is unstitched today.'},
        ],
        post: [
          {who: 'willow', text: 'You waited in the trees and let my soldiers come off the rocks to find you. That was the lesson.'},
          {who: 'rae', text: 'It felt wrong, waiting for them. In the mines I\'d have charged straight up the hill.'},
          {who: 'willow', text: 'And half your squad would have been knocked flat on the way up. Go and rest, Rae.'},
        ],
        reward: {res: 400, tokens: 1},
      },
      {
        id: 'WL-2', title: 'Lesson Two: Swords, Axes and Spears', map: 'ford', enemyFaction: 'rae', enemyLine: 'WILLOW\'S SQUAD ADVANCES',
        spar: true, ban: ['willow'], enemyMods: {},
        teaser: 'Willow has sorted the practice weapons into three piles: swords, axes and spears.',
        star: {type: 'noLosses', text: 'No one is knocked out'},
        objective: {type: 'boss'}, maxDeploy: 6,
        deploy: [[3,11],[4,11],[2,11],[5,11],[3,10],[4,10]],
        brief: 'Willow\'s squad has crossed the river: axes at the west bridge, spears at the east, and swords guarding Willow. Meet each of them with the weapon that beats it.',
        prepNote: 'A training fight: anyone who falls is only knocked out. Bring a mix of swords, axes and spears, so you have an answer to each. Willow can\'t be deployed.',
        enemies: () => [
          E('scholar',4,2,0,'hold',{boss: true, flees: true, key: 'willow', name: 'Willow', look: 'willow'}),
          E('rfighter',4,2,5), E('rfighter',4,1,6), E('rlancer',4,6,5), E('rlancer',4,5,7),
          E('rfencer',4,3,2,'guard'), E('rfencer',4,6,2,'guard'), E('radept',4,5,1,'guard'),
        ],
        bossTalk: [
          {who: 'willow', text: 'My guards carry swords, Rae. What have you brought for them?'},
        ],
        pre: [
          {scene: 'ridge', place: 'The Practice Field · Morning'},
          {who: 'willow', text: 'Three piles: swords, axes and spears. Nearly every soldier on that field is carrying one of them.'},
          {show: 'triangle'},
          {who: 'willow', text: 'A sword beats an axe. An axe beats a spear. A spear beats a sword. Win the match-up and you hit a little harder and miss less often.'},
          {who: 'rae', text: 'And if I get it wrong, it works for them instead.'},
          {who: 'willow', text: 'Yes. My axes are over the west bridge, my spears over the east. Who are you sending where?'},
          {who: 'rae', text: 'Swords to the west bridge, axes to the east. Spears for your guards.'},
        ],
        post: [
          {who: 'willow', text: 'Swords to the axes, axes to the spears, spears to my guards. You picked every fight on your own terms.'},
          {who: 'rae', text: 'It\'s like stone, paper and scissors. The kits played that in the mines.'},
          {who: 'willow', text: 'It is. But in a battle the enemy chooses too, so look again every turn. There\'s one lesson left.'},
        ],
        reward: {res: 500, tokens: 1},
      },
      {
        id: 'WL-3', title: 'Lesson Three: Never Alone', map: 'republicCamp', enemyFaction: 'rae', enemyLine: 'WILLOW\'S SQUAD ADVANCES',
        spar: true, ban: ['willow'], enemyMods: {},
        teaser: 'The last lesson. Willow wants to show Rae what happens to a soldier who fights on her own.',
        star: {type: 'unhurt', text: 'Rae Rabbit is never hit'},
        objective: {type: 'boss'}, maxDeploy: 6,
        deploy: [[4,9],[5,9],[3,11],[6,11],[4,12],[5,12]],
        brief: 'Willow\'s squad waits behind the camp palisade, ready to fall on anyone who comes through a gap alone. Tap Danger to see every square they can reach, and move through together.',
        prepNote: 'A training fight: anyone who falls is only knocked out. Tap Danger in battle to see everywhere the enemy can strike. For the bonus, don\'t let anyone land a hit on Rae. Willow can\'t be deployed.',
        enemies: () => [
          E('scholar',5,4,1,'hold',{boss: true, flees: true, key: 'willow', name: 'Willow', look: 'willow'}),
          E('rfencer',5,2,4,'guard'), E('rfighter',5,7,4,'guard'), E('rlancer',5,3,3,'guard'),
          E('rarcher',5,6,2,'guard'), E('radept',5,5,2,'guard'), E('rfencer',5,5,4,'guard',{elite: true}),
        ],
        bossTalk: [
          {who: 'willow', text: 'Before you strike, Rae, look at who is beside you. Anyone alone this close to me has my whole guard to deal with.'},
        ],
        pre: [
          {scene: 'republic', place: 'The Republic Camp · The Last Lesson'},
          {who: 'willow', text: 'My squad is behind the palisade, watching its two gaps for anyone who comes through alone.'},
          {who: 'willow', text: 'Tap Danger and you\'ll see every square they can reach this turn. Step into it alone and they\'ll all go for you at once.'},
          {who: 'rae', text: 'Then nobody goes through first. We go through together.'},
          {who: 'willow', text: 'Yes. And today nobody lands a single blow on you. Your soldiers keep you covered, and you let them.'},
          {who: 'rae', text: 'I don\'t like hiding behind them.'},
          {who: 'willow', text: 'You won\'t be behind them. You\'ll be among them, where they can reach you and the enemy can\'t.'},
        ],
        post: [
          {who: 'willow', text: 'You came through those gaps together every time. I kept looking for one of you on your own, and I couldn\'t find one.'},
          {who: 'rae', text: 'You look tired, Willow.'},
          {who: 'willow', text: 'I am, a little. Come and find me tonight, Rae. I want to tell you more about the friend I lost.'},
        ],
        reward: {res: 600, tokens: 2},
      },
    ]},

  // ---------- Flopsy's Day Out: Flopsy Flora leads; Rae doesn't know she's gone. ----------
  sister: {camp: 'rae', title: 'Flopsy\'s Day Out', about: 'Flopsy Flora slips out of camp with a few soldiers to pick flowers. A frog sergeant thinks the Commander\'s little sister will be easy to catch.',
    quests: [
      {
        id: 'FD-1', title: 'Flower Picking', map: 'riverWoods', enemyFaction: 'frog',
        lead: 'sister', ban: ['rae'], enemyMods: {},
        teaser: 'Rae is in a war council all morning, and Flopsy Flora has found a basket.',
        star: {type: 'noLosses', text: 'No one is unstitched'},
        objective: {type: 'rout'}, maxDeploy: 5,
        deploy: [[4,13],[5,13],[3,14],[6,14],[4,14]],
        brief: 'Flopsy Flora has slipped out of camp with a few soldiers to pick flowers, and a frog patrol has found them in the woods. Beat the whole patrol. Flopsy leads, and must not fall.',
        prepNote: 'Flopsy Flora leads (the battle is lost if she falls). Rae can\'t come: she doesn\'t know Flopsy has gone. More frogs join the patrol on turn 2.',
        enemies: () => [
          E('lily',3,4,6,'charge',{key: 'sludge', name: 'Sergeant Sludge', look: 'guard', talk: [
            {who: 'sludge', text: 'Look, lads: Rae Rabbit\'s little sister, picking flowers. The King will pay well for you, little one. Come quietly and your friends can go home.'},
            {who: 'sister', text: 'Don\'t call me that. My name is Flopsy Flora, and I\'m not going anywhere with you.'},
          ]}),
          E('reed',3,1,6,'guard'), E('bruiser',3,2,5), E('blade',3,9,9), E('bruiser',3,0,10),
        ],
        reinforce: () => [{turn: 2, units: [E('lily',3,8,4), E('reed',3,6,5,'guard')]}],
        pre: [
          {scene: 'woods', place: 'Past the Stream · Morning'},
          {who: 'narr', text: 'Rae is in a war council with Willow, and nobody is watching the edge of the camp.'},
          {who: 'sister', text: 'You four, come with me. Bring your weapons, and this basket.'},
          {who: 'republic', text: 'Flopsy Flora? Does the Commander know you\'re going out?'},
          {who: 'sister', text: 'She\'s in the council all morning. There\'s a meadow full of flowers past the stream, and we\'ll be back before lunch.'},
          {who: 'republic', text: 'And if we run into frogs?'},
          {who: 'sister', text: 'Then you\'ve got your weapons and I\'ve got my needle. But we won\'t. It\'s only flowers.'},
          {who: 'narr', text: 'Past the stream, a frog patrol is moving through the same woods.'},
        ],
        post: [
          {who: 'narr', text: 'The patrol breaks and runs into the trees, with Sergeant Sludge shouting at the others to wait for him.'},
          {who: 'republic', text: 'A frog patrol, this close to camp. We ought to go back and tell the Commander.'},
          {who: 'sister', text: 'We will. But the meadow is just past those trees, and I haven\'t picked a single flower. One more hour.'},
        ],
        reward: {res: 400, tokens: 1},
      },
      {
        id: 'FD-2', title: 'Scarier Than She Looks', map: 'forestTrail', enemyFaction: 'frog',
        lead: 'sister', ban: ['rae'], enemyMods: {},
        teaser: 'Sergeant Sludge got away, and he has gone to fetch more frogs.',
        star: {type: 'unhurt', text: 'Flopsy Flora is never hit'},
        objective: {type: 'boss'}, maxDeploy: 5,
        deploy: [[4,15],[5,15],[3,14],[6,14],[4,14]],
        brief: 'Sergeant Sludge is back on the forest trail with a bigger patrol, sure that the first fight was luck. Drive him off. Flopsy leads, and must not fall.',
        prepNote: 'Flopsy Flora leads (the battle is lost if she falls), and Rae still doesn\'t know she\'s gone. For the bonus, don\'t let any frog land a hit on Flopsy.',
        enemies: () => [
          E('lily',4,4,0,'hold',{boss: true, flees: true, key: 'sludge', name: 'Sergeant Sludge', look: 'guard'}),
          E('lily',4,3,2,'guard'), E('reed',4,6,2,'guard'), E('bruiser',4,4,5), E('lily',4,7,6,'charge',{elite: true}),
          E('blade',4,2,7), E('reed',4,1,9), E('bruiser',4,8,10),
        ],
        bossTalk: [
          {who: 'sludge', text: 'This morning was luck, that\'s all! Nobody\'s frightened of a rabbit with a sewing needle!'},
          {who: 'sister', text: 'I mend rabbits every day, Sergeant. I know exactly where a seam comes apart.'},
        ],
        pre: [
          {scene: 'woods', place: 'The Forest Trail · Afternoon'},
          {who: 'republic', text: 'Flopsy Flora, it\'s well past lunch. The Commander will be looking for you by now.'},
          {who: 'sister', text: 'I know. But this trail goes to the meadow, and we\'re nearly there. Rae always says finish what you start.'},
          {who: 'narr', text: 'Round the next bend are more frogs than this morning, with Sergeant Sludge at the front.'},
          {who: 'sludge', text: 'That\'s her, lads. Rae Rabbit\'s sister. Don\'t let her size fool you.'},
          {who: 'republic', text: 'We could still run for the camp.'},
          {who: 'sister', text: 'If we run, they\'ll follow us home. We stand here, close together, so nobody gets caught alone.'},
        ],
        post: [
          {who: 'sludge', text: 'Fall back! Back to the meadow, all of you! She\'s as bad as her sister!'},
          {who: 'sister', text: 'Did you hear that? He thinks I\'m as frightening as Rae.'},
          {who: 'republic', text: 'You were, Flopsy Flora. You kept us all together the whole fight.'},
          {who: 'sister', text: 'He said the meadow. That\'s where the flowers are. Come on, I\'m not letting him have it.'},
        ],
        reward: {res: 500, tokens: 1},
      },
      {
        id: 'FD-3', title: 'The Flower Field', map: 'flowerField', enemyFaction: 'frog',
        lead: 'sister', ban: ['rae'], enemyMods: {},
        teaser: 'Sergeant Sludge has fallen back to the meadow that Flopsy Flora has wanted to see all day.',
        star: {type: 'noLosses', text: 'No one is unstitched'},
        objective: {type: 'boss'}, maxDeploy: 5,
        deploy: [[4,13],[5,13],[3,12],[6,12],[4,12]],
        brief: 'The frogs have torn up the whole meadow to build a barricade, with a stockade behind it. Break through the gaps and take Sergeant Sludge down for good. Flopsy leads, and must not fall.',
        prepNote: 'Flopsy Flora leads (the battle is lost if she falls). The barricade has only two gaps. More frogs join Sludge on turn 3.',
        enemies: () => [
          E('toadknight',5,4,1,'hold',{boss: true, key: 'sludge', name: 'Sergeant Sludge', look: 'guard'}),
          E('reed',5,2,2,'guard'), E('reed',5,7,2,'guard'), E('croaker',4,5,1,'guard'),
          E('lily',5,3,4,'guard',{elite: true}), E('lily',5,6,4,'guard'), E('bruiser',5,4,3), E('blade',5,1,3),
        ],
        reinforce: () => [{turn: 3, units: [E('bruiser',5,0,4), E('blade',5,9,4)]}],
        bossTalk: [
          {who: 'sludge', text: 'Like our wall? We pulled up every flower in the meadow to build it.'},
          {who: 'sister', text: 'I came all this way to see those flowers, and you pulled them up for a wall.'},
          {who: 'sister', text: 'I was going to let you run away again, Sergeant. I won\'t now.'},
        ],
        pre: [
          {scene: 'woods', place: 'The Meadow · Evening'},
          {who: 'narr', text: 'The meadow is where Flopsy Flora said it would be, but there is no colour left in it.'},
          {who: 'narr', text: 'The frogs have torn up every flower and piled them into a wall across the field, with two gaps in it. Behind it are a stockade and Sergeant Sludge.'},
          {who: 'sister', text: 'There were meant to be flowers of every colour here.'},
          {who: 'republic', text: 'Flopsy Flora, it\'s getting dark. We could go home now, and nobody would blame you.'},
          {who: 'sister', text: 'No. If we go home, they keep that stockade, right on the Republic\'s doorstep. We\'re going to take the wall down.'},
          {who: 'sister', text: 'Stay together at the gaps, and don\'t let anyone get cut off.'},
        ],
        post: [
          {who: 'narr', text: 'Sergeant Sludge falls, and his frogs run off into the dark. Under the last of the barricade, Flopsy Flora finds one small flower, crushed flat but still growing.'},
          {who: 'sister', text: 'Look. They missed one.'},
          {who: 'republic', text: 'We need to get back. The Commander will have the whole camp out looking for you.'},
          {who: 'sister', text: 'I know. I\'ll tell her everything, and say sorry for going without asking.'},
          {who: 'sister', thought: true, text: 'But I\'m not sorry we came. I\'m going to sew this flower onto her coat, next to the one on the elbow.'},
        ],
        reward: {res: 600, tokens: 2, weapons: [{id: 'patchneedle', to: 'sister'}]},
      },
    ]},
};
