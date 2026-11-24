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
  willow: {camp: 'rae', title: 'Willow\'s Lessons', about: 'On the practice field, Willow takes the other side, and teaches Rae what she can\'t learn from words.',
    quests: [
      {
        id: 'WL-1', title: 'Lesson One: The High Ground', map: 'ridge', enemyFaction: 'rae', enemyLine: 'WILLOW\'S SQUAD ADVANCES',
        spar: true, ban: ['willow'], enemyMods: {},
        teaser: 'Willow wants to show Rae what the ground can do.',
        star: {type: 'turns', n: 8, text: 'Win within 8 turns'},
        objective: {type: 'boss'}, maxDeploy: 6,
        deploy: [[3,11],[4,11],[2,11],[5,11],[3,10],[4,10]],
        brief: 'Willow\'s squad holds the rocks on the ridge. Rocks make anyone standing on them hard to hit. Use the cover yourself, and draw them off it.',
        prepNote: 'Training: nobody is unstitched for real. Willow leads the other side, so she can\'t be deployed.',
        enemies: () => [
          E('scholar',4,3,2,'hold',{boss: true, flees: true, key: 'willow', name: 'Willow', look: 'willow'}),
          E('rarcher',3,2,3,'guard'), E('rarcher',3,6,4,'guard'), E('radept',3,3,3,'guard'),
          E('rfencer',3,4,6,'guard'), E('rlancer',3,5,6,'guard'), E('rfighter',3,1,8,'guard'),
        ],
        bossTalk: [
          {who: 'willow', text: 'There you are. Now: are you going to stand in the open and let me hit you, or are you going to think?'},
        ],
        pre: [
          {scene: 'ridge', place: 'The Practice Field · First Light'},
          {who: 'willow', text: 'Today you\'re the one climbing the hill. My squad has the rocks.'},
          {who: 'willow', text: 'Look at the ground before you look at the enemy. Rocks are hard to cross and harder to hit anyone on. Trees are cover too, only less.'},
          {who: 'rae', text: 'So I stay off the open grass, and I don\'t attack anyone standing on a rock.'},
          {who: 'willow', text: 'Not if you can help it. Make them come down to you. Tap the ground to see what each tile gives.'},
          {who: 'willow', text: 'Wooden swords and padded spears. Nobody gets unstitched today. Except perhaps your pride.'},
        ],
        post: [
          {who: 'willow', text: 'You waited in the trees and let my soldiers come off the rocks to find you. Good.'},
          {who: 'rae', text: 'In the mines, I\'d have charged straight up.'},
          {who: 'willow', text: 'In the mines, you had nothing to lose. Same time tomorrow? No. Rest. You\'ll know when the next lesson is.'},
        ],
        reward: {res: 400, tokens: 2},
      },
      {
        id: 'WL-2', title: 'Lesson Two: Swords, Axes and Spears', map: 'ford', enemyFaction: 'rae', enemyLine: 'WILLOW\'S SQUAD ADVANCES',
        spar: true, ban: ['willow'], enemyMods: {},
        teaser: 'Willow is sorting the practice weapons into three piles.',
        star: {type: 'noLosses', text: 'No one is knocked out'},
        objective: {type: 'boss'}, maxDeploy: 6,
        deploy: [[3,11],[4,11],[2,11],[5,11],[3,10],[4,10]],
        brief: 'Willow\'s squad crosses the river: axes at the west bridge, spears at the east. Send the right weapon against each.',
        prepNote: 'Training: nobody is unstitched for real. Bring a mix of swords, axes and spears. Willow can\'t be deployed.',
        enemies: () => [
          E('scholar',4,2,0,'hold',{boss: true, flees: true, key: 'willow', name: 'Willow', look: 'willow'}),
          E('rfighter',4,2,5), E('rfighter',4,1,6), E('rlancer',4,6,5), E('rlancer',4,5,7),
          E('rfencer',4,3,2,'guard'), E('rfencer',4,6,2,'guard'), E('radept',4,5,1,'guard'),
        ],
        bossTalk: [
          {who: 'willow', text: 'A sword against my axes, a spear against my swords? Show me you were listening.'},
        ],
        pre: [
          {scene: 'ridge', place: 'The Practice Field · Morning'},
          {who: 'willow', text: 'Three piles. Swords, axes, spears. Every soldier on that field is carrying one of them.'},
          {show: 'triangle'},
          {who: 'willow', text: 'A sword beats an axe. An axe beats a spear. A spear beats a sword. Win the match-up and you hit harder and more often.'},
          {who: 'rae', text: 'And lose it and they do the same to me.'},
          {who: 'willow', text: 'Exactly. My axes are coming over the west bridge, my spears over the east. Who are you sending where?'},
        ],
        post: [
          {who: 'willow', text: 'Swords to the axes, axes to the spears. Not one wasted fight.'},
          {who: 'rae', text: 'It\'s like a game of stones and scissors.'},
          {who: 'willow', text: 'It is a game of stones and scissors. Only the scissors are very sharp. One lesson left.'},
        ],
        reward: {res: 500, tokens: 2},
      },
      {
        id: 'WL-3', title: 'Lesson Three: Never Alone', map: 'republicCamp', enemyFaction: 'rae', enemyLine: 'WILLOW\'S SQUAD ADVANCES',
        spar: true, ban: ['willow'], enemyMods: {},
        teaser: 'Willow says the last lesson is the only one that matters.',
        star: {type: 'unhurt', text: 'Rae Rabbit is never hit'},
        objective: {type: 'boss'}, maxDeploy: 6,
        deploy: [[4,9],[5,9],[3,11],[6,11],[4,12],[5,12]],
        brief: 'Willow\'s squad waits behind the palisade, ready to pounce on anyone who comes through a gap alone. Use Danger to see where they can reach, and move together.',
        prepNote: 'Training: nobody is unstitched for real. Tap Danger in battle to see everywhere the enemy can strike. Willow can\'t be deployed.',
        enemies: () => [
          E('scholar',5,4,1,'hold',{boss: true, flees: true, key: 'willow', name: 'Willow', look: 'willow'}),
          E('rfencer',5,2,4,'guard'), E('rfighter',5,7,4,'guard'), E('rlancer',5,3,3,'guard'),
          E('rarcher',5,6,2,'guard'), E('radept',5,5,2,'guard'), E('rfencer',5,5,4,'guard',{elite: true}),
        ],
        bossTalk: [
          {who: 'willow', text: 'Look around you, Rae. Who\'s beside you? If the answer is nobody, you\'ve already lost.'},
        ],
        pre: [
          {scene: 'republic', place: 'The Republic Camp · The Last Lesson'},
          {who: 'willow', text: 'My squad is behind the palisade. Every one of them is waiting for someone to come through a gap on their own.'},
          {who: 'willow', text: 'Tap Danger, and you\'ll see every tile they can reach this turn. Step into it alone and they\'ll all come for you at once.'},
          {who: 'rae', text: 'So we go through together, or not at all.'},
          {who: 'willow', text: 'Together, or not at all. And you, Rae Rabbit, are not to be touched. Not once. Let them protect you, for a change.'},
        ],
        post: [
          {who: 'willow', text: 'Not one of them got to you. Not once.'},
          {who: 'rae', text: 'I barely did anything. They wouldn\'t let me.'},
          {who: 'willow', text: 'That\'s what it looks like when an army fights beside you. Come and find me tonight. There\'s something I want to tell you.'},
        ],
        reward: {res: 600, tokens: 3},
      },
    ]},

  // ---------- Flopsy's Day Out: Flopsy Flora leads; Rae doesn't know she's gone. ----------
  sister: {camp: 'rae', title: 'Flopsy\'s Day Out', about: 'Flopsy Flora sneaks off to pick flowers with a few soldiers. The frogs think they\'ve found an easy target.',
    quests: [
      {
        id: 'FD-1', title: 'Flower Picking', map: 'riverWoods', enemyFaction: 'frog',
        lead: 'sister', ban: ['rae'], enemyMods: {},
        teaser: 'Flopsy Flora has a basket, and a look in her eye.',
        star: {type: 'noLosses', text: 'No one is unstitched'},
        objective: {type: 'rout'}, maxDeploy: 5,
        deploy: [[4,13],[5,13],[3,14],[6,14],[4,14]],
        brief: 'Flopsy Flora has slipped out of camp with a few soldiers to pick flowers. A frog patrol thinks it\'s found an easy target. Flopsy leads, and must not fall.',
        prepNote: 'Flopsy Flora leads. Rae isn\'t here: she doesn\'t know Flopsy\'s gone.',
        enemies: () => [
          E('lily',3,4,6,'charge',{key: 'sludge', name: 'Sergeant Sludge', look: 'guard', talk: [
            {who: 'sludge', text: 'Well, well. A little bunny with a basket. Hand it over, little one, and we\'ll only unstitch your friends.'},
            {who: 'sister', text: 'Nobody calls me little one. Not even my sister. Not any more.'},
          ]}),
          E('reed',3,1,6,'guard'), E('bruiser',3,2,5), E('blade',3,9,9), E('bruiser',3,0,10),
        ],
        reinforce: () => [{turn: 2, units: [E('lily',3,8,4), E('reed',3,6,5,'guard')]}],
        pre: [
          {scene: 'woods', place: 'Past the Stream · Morning'},
          {who: 'narr', text: 'Rae is in a war council. Willow is with her. Nobody is watching the edge of the camp.'},
          {who: 'sister', text: 'Psst. You four. Bring your weapons. And a basket.'},
          {who: 'republic', text: 'Flopsy Flora? Does the Commander know you\'re going out?'},
          {who: 'sister', text: 'The Commander is very busy. We\'ll be back before lunch. It\'s just flowers!'},
          {who: 'narr', text: 'It is not just flowers.'},
        ],
        post: [
          {who: 'republic', text: 'They… ran. A whole patrol, and they ran from the Commander\'s little sister.'},
          {who: 'sister', text: 'I heard that. And I\'ve still not got any flowers. Come on, there are more past the trees.'},
        ],
        reward: {res: 400, tokens: 2},
      },
      {
        id: 'FD-2', title: 'Scarier Than She Looks', map: 'forestTrail', enemyFaction: 'frog',
        lead: 'sister', ban: ['rae'], enemyMods: {},
        teaser: 'Sergeant Sludge wants a rematch, and he\'s brought friends.',
        star: {type: 'unhurt', text: 'Flopsy Flora is never hit'},
        objective: {type: 'boss'}, maxDeploy: 5,
        deploy: [[4,15],[5,15],[3,14],[6,14],[4,14]],
        brief: 'Sergeant Sludge is back with more frogs, sure that the first time was a fluke. Show him it wasn\'t. Flopsy leads, and must not fall.',
        prepNote: 'Flopsy Flora leads. Rae isn\'t here. Keep Flopsy out of reach for the bonus.',
        enemies: () => [
          E('lily',4,4,0,'hold',{boss: true, flees: true, key: 'sludge', name: 'Sergeant Sludge', look: 'guard'}),
          E('lily',4,3,2,'guard'), E('reed',4,6,2,'guard'), E('bruiser',4,4,5), E('lily',4,7,6,'charge',{elite: true}),
          E('blade',4,2,7), E('reed',4,1,9), E('bruiser',4,8,10),
        ],
        bossTalk: [
          {who: 'sludge', text: 'That was a fluke! A fluke! Nobody\'s scared of a rabbit with a sewing needle!'},
          {who: 'sister', text: 'You should be. I know exactly where all your seams are.'},
        ],
        pre: [
          {scene: 'woods', place: 'The Forest Trail · Afternoon'},
          {who: 'republic', text: 'Flopsy Flora, it\'s past lunch. Way past lunch.'},
          {who: 'sister', text: 'We haven\'t found the meadow yet. Rae always says finish what you start.'},
          {who: 'narr', text: 'Ahead, on the trail: frogs. More of them than before. And at the front, a very cross sergeant.'},
          {who: 'sludge', text: 'YOU. Lads, that\'s the one. Don\'t be fooled, she\'s only small.'},
          {who: 'sister', text: 'Only small? Right. Everyone, stay next to me. Not behind. Next to.'},
        ],
        post: [
          {who: 'sludge', text: 'Fall back! Fall back to the field! She\'s every bit as bad as the other one!'},
          {who: 'sister', text: 'The other one? …He means Rae. He thinks I\'m as scary as Rae.'},
          {who: 'republic', text: 'You are, Flopsy Flora. Honestly. You are.'},
          {who: 'sister', text: 'The field. He said the field. That\'s where the flowers are.'},
        ],
        reward: {res: 500, tokens: 2},
      },
      {
        id: 'FD-3', title: 'The Flower Field', map: 'flowerField', enemyFaction: 'frog',
        lead: 'sister', ban: ['rae'], enemyMods: {},
        teaser: 'The meadow, at last. But something is wrong with it.',
        star: {type: 'noLosses', text: 'No one is unstitched'},
        objective: {type: 'boss'}, maxDeploy: 5,
        deploy: [[4,13],[5,13],[3,12],[6,12],[4,12]],
        brief: 'The frogs tore up the whole meadow to build a barricade. Break through the gaps and take Sergeant Sludge down for good. Flopsy leads, and must not fall.',
        prepNote: 'Flopsy Flora leads. Rae isn\'t here. The barricade only has two gaps.',
        enemies: () => [
          E('toadknight',5,4,1,'hold',{boss: true, key: 'sludge', name: 'Sergeant Sludge', look: 'guard'}),
          E('reed',5,2,2,'guard'), E('reed',5,7,2,'guard'), E('croaker',4,5,1,'guard'),
          E('lily',5,3,4,'guard',{elite: true}), E('lily',5,6,4,'guard'), E('bruiser',5,4,3), E('blade',5,1,3),
        ],
        reinforce: () => [{turn: 3, units: [E('bruiser',5,0,4), E('blade',5,9,4)]}],
        bossTalk: [
          {who: 'sludge', text: 'Nice, isn\'t it? Best wall in the woods. Took us all morning to pull up the flowers.'},
          {who: 'sister', text: 'All morning. To pull up every flower in the meadow. For a wall.'},
          {who: 'sister', text: 'I was going to be nice to you, Sergeant. I really was.'},
        ],
        pre: [
          {scene: 'woods', place: 'The Meadow · Evening'},
          {who: 'narr', text: 'The meadow is there, just as Flopsy said. Only there are no colours left in it.'},
          {who: 'narr', text: 'Every flower has been torn up by the roots and heaped into a wall. Behind the wall: frogs, and a stockade.'},
          {who: 'sister', text: '…They pulled them up. All of them. Just to make a wall.'},
          {who: 'republic', text: 'Flopsy Flora? We could go back. Nobody would blame you.'},
          {who: 'sister', text: 'No. We\'re not going back. Not until that wall is down and every one of them is gone.'},
          {who: 'sister', text: 'Next to me. All of you. We do this properly.'},
        ],
        post: [
          {who: 'narr', text: 'The barricade comes down. Under the last of it, crushed flat but still alive, is one small flower.'},
          {who: 'sister', text: 'There. They didn\'t get all of them.'},
          {who: 'sister', text: 'Come on. We\'re very late for lunch, and Rae is going to be so cross.'},
          {who: 'sister', thought: true, text: 'And then I\'m going to sew this onto her coat.'},
        ],
        reward: {res: 600, tokens: 3, weapons: [{id: 'patchneedle', to: 'sister'}]},
      },
    ]},
};

