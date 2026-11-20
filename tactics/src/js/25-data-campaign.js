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
            {who: 'rae', text: 'I know.'},
            {scene: 'woods', place: 'The Edge of the Woods · Dusk'},
            {who: 'narr', text: 'At the edge of the woods, an old rabbit is waiting, leaning on a longbow.'},
            {who: 'willow', text: 'So. You\'re the one they\'re calling Rae.'},
            {who: 'rae', text: 'Rae Rabbit. Who are you?'},
            {who: 'willow', text: 'My name is Willow. I chose it, a long time ago. Out here, rabbits choose their own names.'},
            {who: 'willow', text: 'There are more of us. Many more, hidden in the woods. We call ourselves the Republic.'},
            {who: 'willow', text: 'Your camp is free tonight. Tomorrow the frogs will come back with an army. Bring your rabbits into the woods, Rae Rabbit. Join us.'},
            {who: 'rae', text: '…Everyone pack what you can carry. We march at dark.'},
            {card: 'End of Chapter One', sub: 'Rae Rabbit'},
          ],
          reward: {res: 500, joins: ['willow']},
        },
      ]},
      {id: 'RC2', title: 'Chapter Two', name: 'Into the woods', stub: true, requires: ['F1-2'],
       brief: 'Still to be written. (Placeholder gate: waits on the Friggliarchy\'s placeholder battles, to show how the stories link.)'},
    ],
  },

  // The Friggliarchy story is not written yet. These story-free battles keep the side playable.
  frog: {
    faction: 'frog', name: 'The Friggliarchy', lord: 'frogcmd',
    start: ['frogcmd'], startRecruits: ['lily', 'bruiser', 'reed', 'croaker', 'toadknight'], startRes: 0,
    recruits: [{cls: 'lily', after: null, cost: 250}, {cls: 'reed', after: 'F1-1', cost: 300}],
    chapters: [
      {id: 'FC1', title: 'Chapter One', name: 'Story to come', stages: [
        {
          id: 'F1-1', title: 'Placeholder Battle I', map: 'ford', enemyFaction: 'rae',
          objective: {type: 'rout'}, maxDeploy: 6,
          deploy: [[4,0],[3,1],[5,1],[2,1],[4,1],[6,1],[2,2],[6,2]],
          brief: 'A story-free battle so this side can be played while its story is written.',
          enemies: () => [E('digger',2,1,6), E('hauler',2,6,6), E('pebbler',2,3,7,'guard'), E('digger',2,4,8,'guard'), E('runner',2,5,9), E('hauler',2,2,10,'guard')],
          reward: {res: 300},
        },
        {
          id: 'F1-2', title: 'Placeholder Battle II', map: 'wall', enemyFaction: 'rae',
          objective: {type: 'survive', turns: 5}, maxDeploy: 6,
          deploy: [[3,0],[4,0],[2,1],[5,1],[3,1],[4,1],[1,1],[6,1]],
          brief: 'Hold the wall for five turns. Another story-free placeholder.',
          enemies: () => [E('digger',2,1,8), E('digger',2,6,8), E('runner',2,0,6), E('pebbler',2,5,10)],
          reinforce: () => [{turn: 2, units: [E('hauler',2,2,11), E('hauler',2,5,11)]}, {turn: 3, units: [E('digger',3,3,11), E('pebbler',2,6,11)]}],
          reward: {res: 400},
        },
      ]},
      {id: 'FC2', title: 'Chapter Two', name: 'Story to come', stub: true, brief: 'Still to be written.'},
    ],
  },
};

// Flatten chapters into one ordered list of stages per campaign. A stub chapter becomes one placeholder stage.
for (const camp of Object.values(CAMPAIGNS)){
  camp.stages = camp.chapters.flatMap((c, ci) => c.stub
    ? [{id: c.id + '-stub', title: c.name, stub: true, brief: c.brief, requires: c.requires, chapter: c, ci, si: 0}]
    : c.stages.map((s, si) => Object.assign(s, {chapter: c, ci, si})));
}
