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
  willow: {camp: 'rae', title: 'Willow\'s Lessons', about: 'Three training fights on the practice field. Willow leads a squad against Rae with wooden swords and padded spears, and each fight teaches one thing about how battles are won.',
    quests: [
      {
        id: 'WL-1', title: 'Lesson One: The High Ground', map: 'ridge', enemyFaction: 'rae', enemyLine: 'WILLOW\'S SQUAD ADVANCES',
        spar: true, ban: ['willow'], enemyMods: {},
        teaser: 'Willow has asked Rae to meet her on the practice field at first light.',
        star: {type: 'turns', n: 8, text: 'Win within 8 turns'},
        objective: {type: 'boss'}, maxDeploy: 6,
        deploy: [[3,11],[4,11],[2,11],[5,11],[3,10],[4,10]],
        brief: 'Willow\'s squad holds the rocks on the ridge, where they are hard to hit, and waits for you to come within reach. Draw them down one at a time and fight them from your own cover. Win by making Willow yield.',
        prepNote: 'A training fight: anyone who falls is only knocked out. Willow leads the other side, so she can\'t be deployed.',
        enemies: () => [
          E('scholar',4,3,2,'hold',{boss: true, flees: true, key: 'willow', name: 'Willow', look: 'willow'}),
          E('rarcher',3,2,3,'guard'), E('rarcher',3,6,4,'guard'), E('radept',3,3,3,'guard'),
          E('rfencer',3,4,6,'guard'), E('rlancer',3,5,6,'guard'), E('rfighter',3,1,8,'guard'),
        ],
        bossTalk: [
          {who: 'willow', text: 'You\'ve reached me. Now look at where I\'m standing: on rock, so you\'ll miss me more often than I miss you. That\'s why it pays to take the rocks first.'},
        ],
        pre: [
          {scene: 'ridge', place: 'The Practice Field · First Light'},
          {who: 'willow', text: 'Good, you came. Today my squad holds the ridge, and you have to take it from us.'},
          {who: 'willow', text: 'Before you look at my soldiers, look at the ground. The rocks are slow to climb, but anyone standing on them is harder to hit and takes less damage. The trees give the same kind of cover, only less of it.'},
          {who: 'rae', text: 'So I keep off the open grass, and I don\'t attack anyone who\'s standing on a rock.'},
          {who: 'willow', text: 'Not if you can help it. My soldiers will wait on the rocks until one of yours comes within reach, and then they\'ll come down to fight. Let them. Once they\'re off the rocks, they\'re in the open and you\'re in the trees.'},
          {who: 'willow', text: 'If you\'re not sure what a square gives you, tap it and look. The swords are wooden and the spears are padded, so anyone who falls today is only knocked down.'},
        ],
        post: [
          {who: 'willow', text: 'You waited in the trees and let my soldiers come down off the rocks to find you. That was the whole lesson, and you did it.'},
          {who: 'rae', text: 'It felt wrong, waiting for them. In the mines I\'d have charged straight up the hill.'},
          {who: 'willow', text: 'And half your squad would have been knocked flat on the way up. Waiting cost you nothing today. Go and rest, Rae. We\'ll talk again before the next lesson.'},
        ],
        reward: {res: 400, tokens: 2},
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
          {who: 'willow', text: 'You got past my axes and my spears. The guards beside me carry swords. What did you bring for them?'},
        ],
        pre: [
          {scene: 'ridge', place: 'The Practice Field · Morning'},
          {who: 'willow', text: 'Three piles: swords, axes and spears. Nearly every soldier on that field is carrying one of them.'},
          {show: 'triangle'},
          {who: 'willow', text: 'A sword beats an axe. An axe beats a spear. A spear beats a sword. Win the match-up and you hit a little harder and miss less often.'},
          {who: 'rae', text: 'And if I get it the wrong way round, they get all of that against me.'},
          {who: 'willow', text: 'Yes. So before you move anyone, look at what the enemy is carrying. My axes have already crossed at the west bridge, and my spears at the east. Who are you sending to each?'},
          {who: 'rae', text: 'Swords to the west bridge, axes to the east. I\'ll keep my spears back for whoever is guarding you.'},
          {who: 'willow', text: 'That\'s a good plan. Let\'s see if it still holds once everyone is moving.'},
        ],
        post: [
          {who: 'willow', text: 'Swords to the axes, axes to the spears, and spears for my guards. You picked every fight on your own terms.'},
          {who: 'rae', text: 'It\'s like stone, paper and scissors. The kits used to play it in the mines when the overseers weren\'t looking.'},
          {who: 'willow', text: 'It works the same way. The difference is that in a real battle the enemy is choosing too, so look again every turn.'},
          {who: 'willow', text: 'There\'s one more lesson after this one. I\'ll tell you when I think you\'re ready for it.'},
        ],
        reward: {res: 500, tokens: 2},
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
          {who: 'willow', text: 'Before you strike, Rae, look at who is beside you. Anyone left on their own this close to me will have my whole guard on them.'},
        ],
        pre: [
          {scene: 'republic', place: 'The Republic Camp · The Last Lesson'},
          {who: 'willow', text: 'My squad is behind the palisade. There are two gaps in it, and every one of my soldiers is watching them, waiting for someone to come through on their own.'},
          {who: 'willow', text: 'Tap Danger and you\'ll see every square they can reach this turn. Step into it alone and they\'ll all go for you at once.'},
          {who: 'rae', text: 'So nobody goes through first. We wait until we can all go through together.'},
          {who: 'willow', text: 'Yes. And one more rule for today: nobody is to land a single blow on you. Your soldiers have to keep you covered, and you have to let them.'},
          {who: 'rae', text: 'I don\'t like hiding behind them.'},
          {who: 'willow', text: 'You won\'t be behind them. You\'ll be in the middle of them, where they can reach you and the enemy can\'t. That\'s what I want you to practise.'},
        ],
        post: [
          {who: 'willow', text: 'None of my soldiers landed a blow on you. Every time one of them tried, somebody of yours was already in the way.'},
          {who: 'rae', text: 'I hardly fought at all. Every time I moved forward, someone moved up beside me.'},
          {who: 'willow', text: 'That\'s what I wanted you to see. With them beside you, you\'re far harder to beat than you could ever be alone.'},
          {who: 'willow', text: 'Come and find me this evening, Rae. I\'d like to tell you properly about the rabbit I trained before you.'},
        ],
        reward: {res: 600, tokens: 3},
      },
    ]},

  // ---------- Flopsy's Day Out: Flopsy Flora leads; Rae doesn't know she's gone. ----------
  sister: {camp: 'rae', title: 'Flopsy\'s Day Out', about: 'Flopsy Flora slips out of camp with a few soldiers to pick flowers in the meadow past the stream. A frog sergeant decides the Commander\'s little sister will be easy to catch.',
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
            {who: 'sludge', text: 'Well, look at this, lads. Rae Rabbit\'s little sister, out picking flowers. The King would pay a lot for you, little one. Come quietly, and we\'ll let your friends go home.'},
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
          {who: 'sister', text: 'She\'ll be in the council all morning. There\'s a meadow past the stream with every colour of flower in it, and I\'ve wanted to see it since we got here. We\'ll be back before lunch.'},
          {who: 'republic', text: 'And if we run into frogs?'},
          {who: 'sister', text: 'Then you\'ve got your weapons and I\'ve got my needle. But we won\'t. It\'s only flowers.'},
          {who: 'narr', text: 'Past the stream, a frog patrol is moving through the same woods.'},
        ],
        post: [
          {who: 'narr', text: 'The patrol breaks and runs into the trees, with Sergeant Sludge shouting at the others to wait for him.'},
          {who: 'republic', text: 'That was a whole frog patrol, Flopsy Flora, this close to the camp. We ought to go back and tell the Commander.'},
          {who: 'sister', text: 'We will, I promise. But the meadow is just past those trees, and I haven\'t picked a single flower yet. One more hour.'},
        ],
        reward: {res: 400, tokens: 2},
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
          {who: 'sister', text: 'I sew rabbits back together every day, Sergeant. I know exactly where a seam comes apart. Now get out of our way.'},
        ],
        pre: [
          {scene: 'woods', place: 'The Forest Trail · Afternoon'},
          {who: 'republic', text: 'Flopsy Flora, it\'s well past lunch. The Commander will be out of her council by now, and she\'ll be looking for you.'},
          {who: 'sister', text: 'I know. But this trail goes round to the meadow, and we\'re nearly there. Rae always says to finish what you start.'},
          {who: 'narr', text: 'Round the next bend, the trail is full of frogs: more of them than this morning, with Sergeant Sludge at the front.'},
          {who: 'sludge', text: 'That\'s her, lads. Rae Rabbit\'s sister. Don\'t let her size fool you.'},
          {who: 'republic', text: 'We could still run for the camp.'},
          {who: 'sister', text: 'If we run, they\'ll follow us all the way home. We stand here, and we stay close together, so nobody gets caught on their own.'},
        ],
        post: [
          {who: 'sludge', text: 'Fall back! Back to the meadow, all of you! She\'s as bad as her sister!'},
          {who: 'sister', text: 'As bad as Rae. Did you hear him? He thinks I\'m as frightening as Rae.'},
          {who: 'republic', text: 'You were, Flopsy Flora. You kept us all together the whole fight.'},
          {who: 'sister', text: 'Thank you. But he said the meadow. That\'s where the flowers are, and now that\'s where the frogs are too. Come on. I\'m not letting him have it.'},
        ],
        reward: {res: 500, tokens: 2},
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
          {who: 'sister', text: 'Every flower in the meadow, just for a wall. I came all this way to see them.'},
          {who: 'sister', text: 'I\'d have let you run away again, Sergeant. I\'m not going to now.'},
        ],
        pre: [
          {scene: 'woods', place: 'The Meadow · Evening'},
          {who: 'narr', text: 'The meadow is where Flopsy Flora said it would be, but there is no colour left in it.'},
          {who: 'narr', text: 'The frogs have torn up every flower by the roots and piled them into a wall across the field, with two gaps in it. Behind the wall is a stockade, and Sergeant Sludge.'},
          {who: 'sister', text: 'They pulled them all up to build a wall. I\'ve wanted to see this meadow ever since we came to the camp.'},
          {who: 'republic', text: 'Flopsy Flora, it\'s getting dark. We could go home now, and nobody would blame you.'},
          {who: 'sister', text: 'No. If we go home, they keep that stockade, right on the Republic\'s doorstep. We\'re going to take the wall down.'},
          {who: 'sister', text: 'Stay close to each other at the gaps, and don\'t let anyone get cut off. I\'ll be right behind you.'},
        ],
        post: [
          {who: 'narr', text: 'Sergeant Sludge falls, and the rest of his frogs run off into the dark. Under the last of the barricade, crushed flat but still growing, Flopsy Flora finds one small flower.'},
          {who: 'sister', text: 'Look. They missed one.'},
          {who: 'republic', text: 'We need to get back, Flopsy Flora. The Commander will have the whole camp out looking for you.'},
          {who: 'sister', text: 'I know. She\'s going to be very cross. I\'ll tell her everything, and I\'ll say sorry for going without asking.'},
          {who: 'sister', thought: true, text: 'But I\'m not sorry we came. I\'m going to sew this flower onto her coat, next to the one on the elbow.'},
        ],
        reward: {res: 600, tokens: 3, weapons: [{id: 'patchneedle', to: 'sister'}]},
      },
    ]},
};
