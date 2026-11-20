// ================= Campaigns =================
// Two stories run side by side; the player can switch between them at any time.
// Each campaign is a list of chapters, and each chapter holds stages (battles).
//
// Stage fields
//   id, title, map, objective {type:'boss'|'rout'|'survive', turns?, limit?}, enemyFaction
//     limit: for 'boss', the battle is lost if the boss still stands after that turn (limitFail explains why)
//   deploy        [[x,y], ...] starting tiles in order; the campaign's leader always takes the first
//   maxDeploy     how many units the player may bring
//   requires      stage ids from EITHER campaign that must be cleared first (convergence gates)
//   convergence   label shown where the two stories meet
//   enemies(flags)          initial enemy spawns
//   reinforce(flags)        [{turn, units:[spawns]}] arriving at the start of that enemy phase
//   pre / post    story scenes (see Scene lines below)
//   bossTalk      lines spoken the first time anyone fights the boss
//   rename        {characterKey: 'New Name'} applied once the pre-battle scene has played
//   reward        {res, joins:[characterKeys], flags:[...]}
//   bonus         {type:'noLosses', text, flag}  optional objective that sets a shared world flag
// A chapter with stub:true is a placeholder for story not written yet.
//
// Scene lines
//   {card:'Chapter One', sub:'Rabbit'}          full-screen title card
//   {scene:'mine', place:'The Lower Seam'}      change the backdrop (legend, yard, mine, quarters, gallows, woods)
//   {who:'rae', text:'…'}                       a speaker; their name comes from the roster, so it changes when they do
//   {who:'rae', text:'…', thought:true}         inner thoughts, shown in italics
//   {who:'narr', text:'…'}                      narration
//   any line can carry if:'flag' or unless:'flag'
// Spawns: {cls, lv, x, y, ai:'charge'|'guard'|'hold', boss?, key?, name?, look?, bonus?:{stat:+n}}

const E = (cls, lv, x, y, ai = 'charge', extra = {}) => Object.assign({cls, lv, x, y, ai}, extra);

const CAMPAIGNS = {
  rae: {
    faction: 'rae', name: 'The Raepublic', lord: 'rae',
    start: ['rae', 'tall', 'burly', 'old'], startRes: 0,
    recruits: [{cls: 'digger', after: 'R1-2', cost: 250}, {cls: 'hauler', after: 'R1-3', cost: 280}, {cls: 'pebbler', after: 'R1-4', cost: 300}],
    chapters: [
      {id: 'RC1', title: 'Chapter One', name: 'Rabbit', stages: [

        // ---------------- Stage 1 ----------------
        {
          id: 'R1-1', title: 'The Lower Seam', map: 'lowerSeam', enemyFaction: 'frog',
          objective: {type: 'rout'}, maxDeploy: 4,
          deploy: [[3,10],[4,10],[2,10],[5,10],[3,11],[4,11]],
          brief: 'Little Sister is in the cells, to be unstitched at dawn. Start with the guards in the lower tunnels.',
          enemies: () => [E('lily',1,3,7), E('bruiser',1,5,5), E('lily',1,2,2,'guard'), E('reed',1,1,1,'guard'), E('bruiser',1,5,2,'guard')],
          pre: [
            {card: 'Chapter One', sub: 'Rabbit'},
            {scene: 'yard', place: 'The Work Camp · Roll Call'},
            {who: 'narr', text: 'Every morning begins the same way. The rabbits stand in rows, and the overseer tells the story.'},
            {who: 'rhubarb', text: 'Once, long ago, a rabbit had a name.'},
            {who: 'rhubarb', text: 'Her name was Rae. She lied. She stole. She burned what was not hers, and the whole world bled for it.'},
            {who: 'rhubarb', text: 'That is why no rabbit has a name. That is why you dig. Be grateful we let you.'},
            {who: 'rhubarb', text: 'Now. Pick up your tools.'},
            {scene: 'mine', place: 'The Mine · Lower Seam'},
            {who: 'narr', text: 'Deep in the lower seam, two rabbits dig side by side.'},
            {who: 'sister', text: 'You\'re on my side of the seam again.'},
            {who: 'rae', text: 'Your side? You can barely lift that pick, little one. I\'m doing you a favour.'},
            {who: 'sister', text: 'I can lift it. I\'m pacing myself.'},
            {who: 'rae', text: 'Pace faster. If Rhubarb sees a pile that small, you\'ll be on half water for a week.'},
            {who: 'rae', thought: true, text: 'She\'s too small for this. They all are.'},
            {who: 'narr', text: 'That night, someone creeps back down the shaft and cuts the ropes on the ore lift. Three days of digging crash to the bottom.'},
            {scene: 'yard', place: 'The Work Camp · Morning'},
            {who: 'guard', text: 'The lift ropes were cut in the night. Somebody steps forward, or this whole row goes without water.'},
            {who: 'rae', thought: true, text: 'Stay still. They can\'t prove anything. Stay still.'},
            {who: 'sister', text: 'It was me.'},
            {who: 'rae', text: 'What? No. She\'s lying, she can\'t even reach the—'},
            {who: 'rhubarb', text: 'Silence.'},
            {who: 'rhubarb', text: 'The small one has confessed. At dawn tomorrow she will be unstitched on the gallows, in front of all of you.'},
            {who: 'rhubarb', text: 'Let it remind you what rabbits are for.'},
            {scene: 'quarters', place: 'The Bunkhouse · Night'},
            {who: 'rae', text: 'Why did you do that? It was me. You knew it was me.'},
            {who: 'sister', text: 'Because they\'d have taken you. And then who would pick on me?'},
            {who: 'narr', text: 'The guards come before she can say anything else. Little Sister is dragged away to the cells.'},
            {who: 'narr', text: 'Rabbit looks along the bunks. A hundred rabbits. Twenty frogs.'},
            {who: 'rae', text: 'We dig for them every day of our lives. Tonight, we stop.'},
            {who: 'tall', text: 'And do what? There are guards in every tunnel.'},
            {who: 'rae', text: 'Then we start with the tunnels. Bring your tools.'},
            {who: 'burly', text: '…I\'ve always wanted to hit one.'},
            {who: 'old', text: 'I\'m too old to dig. I\'m not too old to throw stones.'},
          ],
          post: [
            {who: 'guard', text: 'Sound the bell! The rabbits are loose! One of them is leading them, a mad one with a stolen sword!'},
            {who: 'guard', text: 'She\'s a Rae! A real one! A RAE!'},
            {who: 'old', text: 'Did you hear what it called you?'},
            {who: 'rae', text: 'I heard.'},
          ],
          reward: {res: 300},
        },

        // ---------------- Stage 2 ----------------
        {
          id: 'R1-2', title: 'The Bunkhouses', map: 'bunkhouses', enemyFaction: 'frog',
          objective: {type: 'rout'}, maxDeploy: 4,
          deploy: [[3,1],[4,1],[2,1],[5,1],[1,0],[6,0]],
          brief: 'The frogs are locking the bunkhouses. Clear the guards and open every door.',
          enemies: () => [E('lily',1,3,4), E('bruiser',2,5,5), E('reed',1,1,8,'guard'), E('lily',2,6,8,'guard'), E('bruiser',1,2,9,'guard'), E('reed',2,3,10,'guard')],
          pre: [
            {scene: 'yard', place: 'The Bunkhouses · Midnight'},
            {who: 'narr', text: 'Word runs ahead of them through the camp. By the time they climb out of the mine, the frogs have a word for the trouble.'},
            {who: 'guard', text: 'Lock the bunkhouses! Rae is loose in the camp! RAE!'},
            {who: 'tall', text: 'They\'re saying it like a curse.'},
            {who: 'rae', text: 'Let them. Every bunkhouse they lock has rabbits inside. We open every door.'},
          ],
          post: [
            {who: 'narr', text: 'One by one, the bunkhouse doors swing open.'},
            {who: 'swift', text: 'Is it true? Are you… her? Are you Rae?'},
            {who: 'rae', text: 'I\'m a rabbit. Same as you. Grab whatever\'s heavy.'},
            {who: 'patched', text: 'I can\'t fight. But I can sew up the ones who do.'},
            {who: 'rae', text: 'That\'s fighting too.'},
            {who: 'narr', text: 'Across the camp, rabbits start saying the word. Quietly, at first.'},
          ],
          reward: {res: 350, joins: ['swift', 'patched']},
        },

        // ---------------- Stage 3 ----------------
        {
          id: 'R1-3', title: 'The Unstitching', map: 'gallowsYard', enemyFaction: 'frog',
          objective: {type: 'boss', limit: 6}, maxDeploy: 6,
          limitFail: 'The bell stopped ringing before you reached the gallows.',
          deploy: [[3,11],[4,11],[2,11],[5,11],[3,10],[4,10],[2,10],[5,10]],
          brief: 'Dawn. Reach the gallows and defeat the Executioner before the bell stops ringing.',
          enemies: () => [
            E('headsman',3,3,0,'hold',{boss: true, key: 'executioner', name: 'The Executioner', look: 'headsman'}),
            E('lily',2,4,0,'guard'), E('reed',2,1,2,'guard'), E('reed',2,6,2,'guard'),
            E('bruiser',2,2,5), E('lily',2,5,5), E('bruiser',2,3,7), E('blade',2,6,8),
          ],
          pre: [
            {scene: 'gallows', place: 'The Gallows · Dawn'},
            {who: 'narr', text: 'Dawn. The bell rings for the unstitching.'},
            {who: 'rhubarb', text: 'Rabbits! All night you have heard a name whispered. A dead name. A wicked name.'},
            {who: 'rhubarb', text: 'Watch what happens to rabbits who reach for it.'},
            {who: 'sister', text: 'I\'m not scared. I\'m not scared. I\'m not…'},
            {who: 'rae', text: 'Hold on, little one. I\'m coming. Don\'t you dare be brave without me.'},
          ],
          bossTalk: [{who: 'executioner', text: 'Stand aside, rabbit. I have work to do.'}],
          post: [
            {scene: 'gallows', place: 'The Gallows · Morning'},
            {who: 'sister', text: 'You came. You actually came.'},
            {who: 'rae', text: 'Of course I came. Nobody else is allowed to pick on you.'},
            {who: 'sister', text: 'That\'s the nicest thing you\'ve ever said to me.'},
            {who: 'rae', text: 'Don\'t get used to it.'},
            {who: 'narr', text: 'From the tower above the gate, Rhubarb watches the yard. The rabbits are chanting.'},
            {who: 'rabbits', text: 'Rae! Rae! Rae!'},
          ],
          reward: {res: 400},
        },

        // ---------------- Stage 4 ----------------
        {
          id: 'R1-4', title: 'Rhubarb\'s Tower', map: 'tower', enemyFaction: 'frog',
          requires: ['F1-3'], convergence: 'The Mines',
          objective: {type: 'boss'}, maxDeploy: 6,
          deploy: [[3,11],[4,11],[2,11],[5,11],[3,10],[4,10],[1,11],[6,11]],
          brief: 'The whole camp is awake. Storm the tower above the gate and bring down Rhubarb.',
          rename: {rae: 'Rae Rabbit'},
          enemies: () => [
            E('overseer',5,4,0,'hold',{boss: true, key: 'rhubarb', name: 'Rhubarb', look: 'rhubarb', bonus: {mhp: 4}}),
            E('toadknight',3,3,0,'guard'), E('croaker',3,4,1,'guard'), E('reed',3,1,1,'guard'), E('reed',3,6,1,'guard'),
            E('lily',3,3,3,'guard'), E('lily',3,4,3,'guard'), E('bruiser',3,1,5), E('bruiser',3,6,5), E('blade',3,3,7),
          ],
          pre: [
            {scene: 'yard', place: 'The Overseer\'s Tower'},
            {who: 'guard', text: 'Hold the tower! The prince\'s column is on the ridge! Hold until dawn!'},
            {who: 'rhubarb', text: 'Is that what you are now? A name? Rae was a monster. That is all the word has ever meant.'},
            {who: 'rae', text: 'You told us that story every morning of our lives. You made Rae the worst thing a rabbit could be.'},
            {who: 'rae', text: 'And now you\'re scared of her.'},
            {who: 'rae', text: 'So be it. I\'m Rae.'},
            {who: 'rabbits', text: 'Rae Rabbit! Rae Rabbit! RAE RABBIT!'},
          ],
          bossTalk: [{who: 'rhubarb', text: 'I will unstitch you myself, Rae.'}, {who: 'rae', text: 'It\'s Rae Rabbit.'}],
          post: [
            {who: 'narr', text: 'The tower comes down. For the first time anyone can remember, the camp gate stands open.'},
            {who: 'sister', text: 'What happens now? They\'ll come back. More of them.'},
            {who: 'rae', text: 'Let them come.'},
            {scene: 'yard', place: 'The Camp Gate · Night'},
            {who: 'narr', text: 'An old rabbit pushes through the cheering crowd, leaning on a longbow.'},
            {who: 'willow', text: 'So. You\'re the one they\'re calling Rae.'},
            {who: 'rae', text: 'Rae Rabbit. Who are you?'},
            {who: 'willow', text: 'My name is Willow. I chose it, a long time ago. Out in the woods, rabbits choose their own names.'},
            {who: 'willow', text: 'Listen to me. There are frog torches on the ridge. The king\'s own brother leads them. They\'ll be in this yard by dawn.'},
            {who: 'rae', text: 'Then we hold the yard. We just won it.'},
            {who: 'willow', text: 'You won it from twenty guards. That is an army. If you stay, you die here, and the name dies with you. Again.'},
            {who: 'willow', text: 'There are more of us. Many more, hidden in the woods. We call ourselves the Republic, and we need you alive.'},
            {who: 'rae', text: 'I\'m not leaving anyone behind for them.'},
            {who: 'stayer', text: 'You\'re not. A few of us will stay and slow them down. The rest go with you.'},
            {who: 'rae', text: 'No. I\'m not asking anyone to—'},
            {who: 'stayer', text: 'You didn\'t ask. Go, Rae Rabbit. Make it count.'},
            {who: 'rae', thought: true, text: 'Everything in me wants to stay and fight.'},
            {who: 'rae', text: '…Everyone who can walk, take what you can carry. We go now.'},
            {scene: 'woods', place: 'The Edge of the Woods · Night'},
            {who: 'narr', text: 'Behind them, frog drums on the ridge. Ahead, the dark of the woods.'},
            {who: 'sister', text: 'Will they be all right? The ones who stayed?'},
            {who: 'rae', text: '…Keep walking, little one. Don\'t look back.'},
            {card: 'End of Chapter One', sub: 'Rae Rabbit'},
          ],
          reward: {res: 500, joins: ['willow']},
        },
      ]},
      {id: 'RC2', title: 'Chapter Two', name: 'Into the Woods', stub: true, brief: 'Still to be written.'},
    ],
  },

  frog: {
    faction: 'frog', name: 'The Friggliarchy', lord: 'tiggle',
    start: ['tiggle', 'biggle'], startRecruits: ['lily', 'lily', 'bruiser', 'reed', 'croaker'], startLevel: 1, startRes: 0,
    recruits: [{cls: 'lily', after: null, cost: 250}, {cls: 'reed', after: 'F1-1', cost: 280}, {cls: 'bruiser', after: 'F1-2', cost: 300}],
    chapters: [
      {id: 'FC1', title: 'Chapter One', name: 'The Prince', stages: [

        // ---------------- Stage 1 ----------------
        {
          id: 'F1-1', title: 'The Mine Road', map: 'ford', enemyFaction: 'rae',
          objective: {type: 'rout'}, maxDeploy: 6,
          deploy: [[4,0],[3,1],[5,1],[2,1],[4,1],[6,1],[2,2],[6,2]],
          brief: 'Runaway rabbits have stopped a supply cart on the road to the mines. Clear the road.',
          enemies: () => [E('digger',1,1,6), E('hauler',1,6,6), E('pebbler',1,3,7,'guard'), E('digger',1,4,8,'guard'), E('runner',1,5,9), E('hauler',1,2,10,'guard')],
          pre: [
            {card: 'Chapter One', sub: 'The Prince'},
            {scene: 'court', place: 'The Lily Court'},
            {who: 'narr', text: 'In the Lily Court, the king holds audience.'},
            {who: 'king', text: 'Little brother. Come here. Stand up straight.'},
            {who: 'tiggle', text: 'Your Majesty.'},
            {who: 'king', text: 'There are stories coming out of the mines. Tools going missing. Ropes cut. Rabbits whispering in the dark.'},
            {who: 'king', text: 'Rabbits whisper. That is what they do. But whispers become shouting, and shouting becomes fire. You know the story.'},
            {who: 'tiggle', text: 'The story of Rae. Everyone knows it.'},
            {who: 'king', text: 'Then you know why it must never happen again. Go to the mines. Remind them what order looks like.'},
            {who: 'tiggle', text: 'Me? On my own?'},
            {who: 'biggle', text: 'Not on your own. I\'ll be right there to make sure you don\'t trip over your own sword.'},
            {who: 'king', text: 'Biggle Baggle goes with you. Listen to him. This is your chance to prove you are worth the crown on your head, Tiggle Taggle.'},
            {who: 'tiggle', thought: true, text: 'Order keeps everyone safe. Frogs and rabbits both. I\'ll show him I understand that.'},
            {scene: 'woods', place: 'The Mine Road'},
            {who: 'scout', text: 'Your Highness! Runaway rabbits on the road ahead. They\'ve stopped a supply cart.'},
            {who: 'biggle', text: 'Runaways. It\'s started already. Well, little brother? Give the order.'},
            {who: 'tiggle', text: 'Advance. And… try not to hurt them more than we have to.'},
            {who: 'biggle', text: 'We\'ll hurt them exactly as much as we have to.'},
          ],
          post: [
            {who: 'narr', text: 'When it is over, Tiggle Taggle looks at the rabbits they have caught.'},
            {who: 'tiggle', text: 'They\'re so thin. Are they always this thin?'},
            {who: 'biggle', text: 'They\'re hungry because they\'re idle. Don\'t look at them too long. That\'s how it started last time. Someone felt sorry for Rae.'},
            {who: 'tiggle', text: '…Of course. Order first.'},
          ],
          reward: {res: 300},
        },

        // ---------------- Stage 2 ----------------
        {
          id: 'F1-2', title: 'The Outer Camp', map: 'outerCamp', enemyFaction: 'rae',
          objective: {type: 'rout'}, maxDeploy: 6,
          deploy: [[3,11],[4,11],[2,11],[5,11],[3,10],[4,10],[1,11],[6,11]],
          brief: 'The rabbits of the outer camp have barricaded themselves in. Take the camp back.',
          enemies: () => [E('digger',2,3,1,'guard'), E('hauler',1,1,3), E('hauler',1,6,3), E('pebbler',2,2,0,'guard'), E('runner',2,5,5), E('patcher',1,4,0,'guard'), E('digger',2,3,4,'guard')],
          pre: [
            {scene: 'yard', place: 'The Outer Camp'},
            {who: 'narr', text: 'The outer camp feeds ore to the great mines. Its rabbits have barricaded the gate.'},
            {who: 'thin', text: 'We only want water! There\'s been no water for three days!'},
            {who: 'tiggle', text: 'No water? Biggle, is that true?'},
            {who: 'biggle', text: 'It\'s a punishment. They earned it. And now they\'re in open rebellion, which is exactly why they earned it.'},
            {who: 'tiggle', thought: true, text: 'Three days without water…'},
            {who: 'tiggle', text: 'Open the gate! If you surrender, no one gets hurt!'},
            {who: 'thin', text: 'Rae\'s coming back! You\'ll see! She\'s coming back!'},
            {who: 'biggle', text: 'There it is. Do you understand now? Take the camp.'},
          ],
          post: [
            {who: 'tiggle', text: 'Give them water. All of them. Today.'},
            {who: 'biggle', text: 'Generous. Fine, it costs us nothing. But the ones who shouted that name go in chains.'},
            {who: 'tiggle', text: '…Agreed.'},
            {who: 'tiggle', thought: true, text: 'When this is over, I\'ll ask the king to change things. Properly. Once there\'s order.'},
          ],
          reward: {res: 350},
        },

        // ---------------- Stage 3 ----------------
        {
          id: 'F1-3', title: 'The Ridge', map: 'ridge', enemyFaction: 'rae',
          objective: {type: 'survive', turns: 5}, maxDeploy: 6,
          deploy: [[3,11],[4,11],[2,11],[5,11],[3,10],[4,10],[1,11],[6,11]],
          brief: 'Rebel scouts are climbing the ridge. Hold it for five turns until the main column arrives.',
          enemies: () => [E('runner',2,2,3), E('runner',2,6,2), E('pebbler',2,4,5), E('digger',2,1,6)],
          reinforce: () => [
            {turn: 2, units: [E('hauler',2,3,0), E('digger',2,6,0)]},
            {turn: 3, units: [E('runner',3,1,0), E('pebbler',2,4,0)]},
            {turn: 4, units: [E('digger',3,0,1), E('hauler',3,7,1)]},
          ],
          pre: [
            {scene: 'ridge', place: 'The Ridge Above the Mines · Night'},
            {who: 'narr', text: 'From the ridge they can see the great mine camp. Every bunkhouse is lit. The bell is ringing.'},
            {who: 'scout', text: 'Your Highness. The camp has risen. The guards are dead or fled. Overseer Rhubarb is trapped in the tower.'},
            {who: 'scout', text: 'And the rabbits are chanting a name.'},
            {who: 'tiggle', text: 'What name?'},
            {who: 'scout', text: '…Rae, Your Highness.'},
            {who: 'biggle', text: 'So the stories were true. Good. Now it\'s a fight, not a rumour.'},
            {who: 'scout', text: 'Rebel scouts are coming up the ridge!'},
            {who: 'biggle', text: 'Hold the ridge until the main column comes up. Then we go down.'},
          ],
          post: [
            {who: 'narr', text: 'The column arrives. Below, the bell has stopped ringing.'},
            {who: 'tiggle', text: 'Biggle… what if all they wanted was water?'},
            {who: 'biggle', text: 'Then they should have asked before they killed the guards. We march at dawn, little brother. You lead.'},
            {who: 'tiggle', text: '…We march at dawn.'},
          ],
          reward: {res: 400},
        },

        // ---------------- Stage 4 ----------------
        {
          id: 'F1-4', title: 'Retaking the Mines', map: 'tower', enemyFaction: 'rae',
          requires: ['R1-4'], convergence: 'The Mines',
          objective: {type: 'boss'}, maxDeploy: 6,
          deploy: [[3,11],[4,11],[2,11],[5,11],[3,10],[4,10],[1,11],[6,11]],
          brief: 'The rebels have fled into the woods and left a rearguard in the yard. Break it and retake the mines.',
          enemies: () => [
            E('digger',4,4,0,'hold',{boss: true, key: 'stayer', name: 'One-Eared Rabbit', look: 'stayer', bonus: {mhp: 4}}),
            E('hauler',3,3,0,'guard'), E('pebbler',3,1,1,'guard'), E('pebbler',3,6,1,'guard'), E('patcher',3,4,1,'guard'),
            E('digger',3,3,3,'guard'), E('hauler',3,4,3,'guard'), E('runner',3,1,5), E('runner',3,6,5),
          ],
          pre: [
            {scene: 'yard', place: 'The Mine Camp · Dawn'},
            {who: 'narr', text: 'By the time the Friggliarchy comes down from the ridge, the tower has fallen and the gate stands open.'},
            {who: 'scout', text: 'Most of them are gone, Your Highness. Into the woods. A few stayed behind to hold the yard.'},
            {who: 'biggle', text: 'A rearguard. Brave of them. Pointless, but brave. Take it.'},
            {who: 'tiggle', text: 'Where did the rest go?'},
            {who: 'biggle', text: 'It doesn\'t matter. Win this first.'},
          ],
          bossTalk: [
            {who: 'stayer', text: 'Come on, then, little prince. Every turn you spend on me is a turn she gets further away.'},
            {who: 'tiggle', text: 'Who? Who is she?'},
          ],
          post: [
            {scene: 'gallows', place: 'The Gallows · Evening'},
            {who: 'narr', text: 'By nightfall the mines belong to the Friggliarchy again. The rabbits who stayed behind are led to the gallows.'},
            {who: 'biggle', text: 'Read the sentence, little brother. You took the camp. This is part of taking it.'},
            {who: 'tiggle', text: 'For rebellion against the crown… you are to be unstitched.'},
            {who: 'stayer', text: 'Go on, then. It doesn\'t matter any more.'},
            {who: 'stayer', text: 'Rae Rabbit is reborn. And while you\'re busy with us, she\'s already on her way to end you. All of you.'},
            {who: 'tiggle', text: 'Rae is a story. A story for frightening rabbits.'},
            {who: 'stayer', text: 'Not any more.'},
            {who: 'narr', text: 'The sentence is carried out. Tiggle Taggle does not look away. Afterwards, he cannot stop seeing it.'},
            {who: 'biggle', text: 'Last words. They all say something like that. Forget it.'},
            {who: 'tiggle', thought: true, text: 'They weren\'t afraid. At the very end, they weren\'t afraid at all.'},
            {who: 'tiggle', text: 'If she\'s real, she\'s out there, and she\'s coming. Then I\'ll be the one who stops her.'},
            {card: 'End of Chapter One', sub: 'The Prince'},
          ],
          reward: {res: 500},
        },
      ]},
      {id: 'FC2', title: 'Chapter Two', name: 'Still to be written', stub: true, brief: 'Still to be written.'},
    ],
  },
};

// Flatten chapters into one ordered list of stages per campaign. A stub chapter becomes one placeholder stage.
for (const camp of Object.values(CAMPAIGNS)){
  camp.stages = camp.chapters.flatMap((c, ci) => c.stub
    ? [{id: c.id + '-stub', title: c.name, stub: true, brief: c.brief, requires: c.requires, chapter: c, ci, si: 0}]
    : c.stages.map((s, si) => Object.assign(s, {chapter: c, ci, si})));
}
