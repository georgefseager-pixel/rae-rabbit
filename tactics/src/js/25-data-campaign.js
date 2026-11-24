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
//                 (any enemy spawn can carry its own talk: [...] lines, spoken the first time it's fought)
//   rename        {characterKey: 'New Name'} applied once the pre-battle scene has played
//   reward        {res, joins:[characterKeys], flags:[...]}
//   reward.weapons  story weapons: [{id, to}] (see 12-data-weapons.js), handed to that character
//   twist         {talk, objective, units, popup, on:'boss', arrive}: when a survive objective is met (or, with
//                 on:'boss', when the boss falls; arrive brings in a solo stage's held-back units), the scene plays, the units
//                 arrive, and the battle goes on with the new objective (e.g. survive, then rout)
//   allies        () => [spawns]: units on your side that act on their own (vip: true = must survive)
//   solo / mustDeploy / prepNote / enemyLine   only the leader starts; required units; a note on the Prepare
//                 screen; the enemy phase's banner text
//   events        mid-battle happenings: {turn, join: character key, at: [x, y], mustSurvive, talk: [lines]}
//                 at the start of that player turn the character runs onto the field, the lines play, and they fight
//                 for you; they join the army if the battle is won (skipped if they're already in the army)
//   star          the stage's bonus challenge (one ★ per stage, worth GACHA.starTokens recruiting currency once;
//                 a cleared stage can be replayed to try again). {lord} in the text becomes the leader's name.
//                 types: noLosses | turns (n: win by the end of turn n) | unhurt (the leader takes no damage) | allies (no ally falls)
//                        | catch (n: catch at least n runners, with an intercept objective)
//                        | bossBy (key: that unit defeats the boss) | fewer (n: deploy at most n units)
// A chapter with stub:true is a placeholder for story not written yet.
// A chapter can set enemyMods: {stat: +/-n}, added to every enemy in its stages (difficulty tuning). A stage can set
// its own enemyMods instead.
// A chapter can set outfits: {characterKey: 'outfit'}, applied when any of its stages starts (see art/ naming in README).
//
// Scene lines
//   {card:'Chapter One', sub:'Rabbit'}          full-screen title card
//   {scene:'mine', place:'The Lower Seam'}      change the backdrop (legend, yard, mine, quarters, block, woods, court, ridge, republic, warcamp, snow,
//                                              monkeyland, castlegate, castle)
//   {who:'rae', text:'…'}                       a speaker; their name comes from the roster, so it changes when they do
//   {who:'rae', text:'…', thought:true}         inner thoughts, shown in italics
//   {who:'narr', text:'…'}                      narration
//   {who, text, show:'triangle'}                show a diagram above the text (DIAGRAMS in 50-dialogue.js)
//   {rename: {key: 'Name'}} / {arm: [{id, to}]} rename a character / hand out story weapons mid-scene
//   {attire: [ids]}                             give characters attires (see 13-data-attires.js)
//   any line can carry if:'flag' or unless:'flag'
// Spawns: {cls, lv, x, y, ai:'charge'|'guard'|'hold', boss?, key?, name?, look?, bonus?:{stat:+n}, elite?}
//   elite: a tougher ★★ soldier: red armour on generic frog art, plus the ★★ stat bonus
//   flees: escapes when beaten instead of being unstitched (a recurring character)

const E = (cls, lv, x, y, ai = 'charge', extra = {}) => Object.assign({cls, lv, x, y, ai}, extra);

const CAMPAIGNS = {
  rae: {
    faction: 'rae', name: 'The Raepublic', lord: 'rae',
    start: ['rae', 'tall', 'burly', 'old'], startRes: 0,
    chapters: [
      {id: 'RC1', title: 'Chapter One', name: 'Rabbit', outfits: {rae: 'camp', sister: 'camp'},
       enemyMods: {mhp: -4, atk: -2, def: -1, spd: -1, skl: -1}, stages: [

        // ---------------- Stage 1 ----------------
        {
          id: 'R1-1', title: 'The Lower Seam', map: 'lowerSeam', enemyFaction: 'frog',
          star: {type: 'unhurt', text: '{lord} takes no damage'},
          objective: {type: 'rout'}, maxDeploy: 4,
          deploy: [[3,10],[4,10],[2,10],[5,10],[3,11],[4,11]],
          brief: 'Little Sister is in the cells, to be unstitched at dawn. Start with the guards in the lower tunnels.',
          enemies: () => [E('lily',1,3,7), E('bruiser',1,5,5), E('lily',1,2,2,'guard'), E('reed',1,1,1,'guard')],
          pre: [
            {card: 'Chapter One', sub: 'Rabbit'},
            {scene: 'yard', place: 'The Work Camp · Roll Call'},
            {who: 'narr', text: 'Every morning begins the same way. The rabbits stand in rows, and the overseer tells the story.'},
            {who: 'rhubarb', text: 'Right, gather round. Once, long ago, a rabbit had a name.'},
            {who: 'rhubarb', text: 'Rae, she were called. Lied, she did. Stole. Burned what weren\'t hers, and the whole world bled for it.'},
            {who: 'rhubarb', text: 'That\'s why no rabbit gets a name. That\'s why you dig. And you can be grateful we let you, an\' all.'},
            {who: 'rhubarb', text: 'Now. Pick up yer tools, love. Them seams won\'t dig themselves.'},
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
            {who: 'rhubarb', text: 'Oi! Pipe down, the lot of you.'},
            {who: 'rhubarb', text: 'The little \'un\'s owned up. Dawn tomorrow, she\'s for the block. Unstitched, in front of every one of you.'},
            {who: 'rhubarb', text: 'Let that be a lesson in what rabbits are for.'},
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
          star: {type: 'turns', n: 6, text: 'Win by the end of turn VI'},
          objective: {type: 'rout'}, maxDeploy: 4,
          deploy: [[3,1],[4,1],[2,1],[5,1],[1,0],[6,0]],
          brief: 'The frogs are locking the bunkhouses. Clear the guards and open every door.',
          enemies: () => [E('lily',1,3,4), E('bruiser',1,5,5), E('reed',1,1,8,'guard'), E('lily',1,6,8,'guard'), E('reed',1,3,10,'guard')],
          pre: [
            {scene: 'yard', place: 'The Bunkhouses · Midnight'},
            {who: 'narr', text: 'Word runs ahead of them through the camp. By the time they climb out of the mine, the frogs have a word for the trouble.'},
            {who: 'guard', text: 'Lock the bunkhouses! Rae is loose in the camp! RAE!'},
            {who: 'narr', text: 'Across the yard, a hooded frog climbs the scaffold steps, a great axe resting on his shoulder. He does not hurry.'},
            {who: 'executioner', text: 'Lock them in. Let them out. It makes no difference to me.'},
            {who: 'executioner', text: 'At dawn I have one small neck to see to. Bring me the one they call Rae, and I will make it two.'},
            {who: 'rae', thought: true, text: 'Dawn. We have until dawn.'},
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
          id: 'R1-3', title: 'The Unstitching', map: 'blockYard', enemyFaction: 'frog',
          star: {type: 'bossBy', key: 'rae', text: '{lord} defeats the Executioner herself'},
          objective: {type: 'boss', limit: 8}, maxDeploy: 6,
          enemyMods: {mhp: -2, atk: -1},   // eases off Chapter One's weakening towards its finale (see recommendedLevel)
          limitFail: 'The bell stopped ringing before you reached the block. The axe fell.',
          deploy: [[3,11],[4,11],[2,11],[5,11],[3,10],[4,10],[2,10],[5,10]],
          brief: 'Dawn. Reach the execution block and defeat the Executioner before the bell stops ringing and the axe falls.',
          enemies: () => [
            E('headsman',3,3,0,'hold',{boss: true, key: 'executioner', name: 'The Executioner', look: 'headsman'}),
            E('lily',2,4,0,'guard'), E('reed',2,1,2,'guard'), E('reed',2,6,2,'guard'),
            E('bruiser',2,2,5), E('lily',2,5,5), E('bruiser',2,3,7,'charge',{elite: true}),
          ],
          pre: [
            {scene: 'block', place: 'The Execution Block · Dawn'},
            {who: 'narr', text: 'Dawn. The bell rings for the unstitching. On the scaffold, the Executioner rests his great axe beside the block.'},
            {who: 'rhubarb', text: 'Rabbits! I know what you\'ve been whisperin\' all night. A dead name. A wicked name.'},
            {who: 'rhubarb', text: 'Now watch what \'appens to them as reaches for it.'},
            {who: 'narr', text: 'Behind Little Sister, guards drag a second prisoner to the foot of the scaffold. A white rabbit in chains, a sack hood pulled over his head.'},
            {who: 'guard', text: 'Wait your turn. You\'re after the girl.'},
            {who: 'condemned', text: 'Then I have a little longer than she does.'},
            {who: 'sister', text: 'I\'m not scared. I\'m not scared. I\'m not…'},
            {who: 'rae', text: 'Hold on, little one. I\'m coming. Don\'t you dare be brave without me.'},
          ],
          bossTalk: [
            {who: 'executioner', text: 'Stand aside, rabbit. I have work to do.'},
            {who: 'executioner', text: 'The bell is still ringing. When it stops, so does she.'},
          ],
          post: [
            {scene: 'block', place: 'The Execution Block · Morning'},
            {who: 'sister', text: 'You came. You actually came.'},
            {who: 'rae', text: 'Of course I came. Nobody else is allowed to pick on you.'},
            {who: 'sister', text: 'That\'s the nicest thing you\'ve ever said to me.'},
            {who: 'rae', text: 'Don\'t get used to it.'},
            {who: 'narr', text: 'At the foot of the scaffold, Burly Rabbit knocks the hooded prisoner\'s chains off the post with one swing of a pickaxe. The cuffs stay on his wrists.'},
            {who: 'condemned', text: 'I was next. After her.'},
            {who: 'condemned', text: 'You stopped the axe, so my life is yours, Rae. I won\'t forget it.'},
            {who: 'rae', text: 'You don\'t owe me anything. You\'re free. You can take that hood off now.'},
            {who: 'condemned', text: '…No. Not yet.'},
            {who: 'narr', text: 'He bows his hooded head. When Rae looks back, he is gone.'},
            {who: 'narr', text: 'From the tower above the gate, Rhubarb watches the yard. The rabbits are chanting.'},
            {who: 'rabbits', text: 'Rae! Rae! Rae!'},
          ],
          reward: {res: 400},
        },

        // ---------------- Stage 4 ----------------
        {
          id: 'R1-4', title: 'Rhubarb\'s Tower', map: 'tower', enemyFaction: 'frog',
          star: {type: 'noLosses', text: 'No one is unstitched'},
          requires: ['F1-3'], convergence: 'The Mines',
          objective: {type: 'boss'}, maxDeploy: 6,
          enemyMods: {mhp: -2, atk: -1},   // eases off Chapter One's weakening towards its finale (see recommendedLevel)
          deploy: [[3,11],[4,11],[2,11],[5,11],[3,10],[4,10],[1,11],[6,11]],
          brief: 'The whole camp is awake. Storm the tower above the gate and bring down Rhubarb.',
          rename: {rae: 'Rae Rabbit'},
          departs: ['old'], fallsIn: {old: 'F1-4'},   // Old Rabbit stays behind with the rearguard, and falls in F1-4
          // Little Sister runs onto the field at the start of turn II and won't be sent back. She must not fall.
          events: [{turn: 2, join: 'sister', at: [4, 11], mustSurvive: true, talk: [
            {who: 'narr', text: 'Small feet pound across the yard behind the line.'},
            {who: 'sister', text: 'Wait! Wait for me!'},
            {who: 'rae', text: 'What are you doing here? I told you to hide in the bunkhouse!'},
            {who: 'sister', text: 'You also said nobody else is allowed to pick on me. That means you have to stay in one piece.'},
            {who: 'rae', text: 'This is a battle, little one. Go back. Now.'},
            {who: 'sister', text: 'No. You came for me at the block. I\'m not hiding under a bunk while you climb that tower.'},
            {who: 'sister', text: 'And I can stitch. I\'ve been sewing up your rips my whole life.'},
            {who: 'rae', thought: true, text: 'She\'s not going anywhere. She never does.'},
            {who: 'rae', text: '…Stay behind me. Stay close. And if I say run, you run.'},
            {who: 'sister', text: 'Deal!'},
          ]}],
          enemies: () => [
            E('overseer',4,4,0,'hold',{boss: true, key: 'rhubarb', name: 'Rhubarb', look: 'rhubarb'}),
            E('toadknight',2,3,0,'guard',{elite: true}), E('croaker',2,4,1,'guard'), E('reed',2,1,1,'guard'),
            E('lily',2,3,3,'guard',{elite: true}), E('lily',2,4,3,'guard',{elite: true}), E('bruiser',2,1,5), E('bruiser',2,6,5),
          ],
          pre: [
            {scene: 'yard', place: 'The Overseer\'s Tower'},
            {who: 'guard', text: 'Hold the tower! The prince\'s column is on the ridge! Hold until dawn!'},
            {who: 'rhubarb', text: 'Oh, is that what you are now? A name? Give over. Rae were a monster, love. That\'s all that word\'s ever meant.'},
            {who: 'rae', text: 'You told us that story every morning of our lives. You made Rae the worst thing a rabbit could be.'},
            {who: 'rae', text: 'And now you\'re scared of her.'},
            {who: 'rae', text: 'So be it. I\'m Rae.'},
            {who: 'rabbits', text: 'Rae Rabbit! Rae Rabbit! RAE RABBIT!'},
          ],
          bossTalk: [{who: 'rhubarb', text: 'Right, that\'s it. I\'ll unstitch you meself, Rae.'}, {who: 'rae', text: 'It\'s Rae Rabbit.'}],
          post: [
            {who: 'narr', text: 'The tower comes down. For the first time anyone can remember, the camp gate stands open.'},
            {who: 'sister', text: 'See? I told you I could help.'},
            {who: 'rae', text: 'You did. Don\'t you dare do it again.'},
            {who: 'sister', text: 'No promises.'},
            {who: 'narr', text: 'On the way out, Rae takes the sword that hung above Rhubarb\'s desk. Little Sister takes the overseer\'s sewing box.'},
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
            {who: 'old', text: 'You\'re not. A few of us will stay and slow them down. Me first.'},
            {who: 'old', text: 'I\'m too old to run through the woods all night. I\'m not too old to throw stones.'},
            {who: 'rae', text: 'No. I\'m not asking anyone to—'},
            {who: 'old', text: 'You didn\'t ask. I watched them take your sister and I did nothing. Not this time.'},
            {who: 'old', text: 'Go, Rae Rabbit. Make it count.'},
            {who: 'narr', text: 'Old Rabbit stays behind.'},
            {who: 'rae', thought: true, text: 'Everything in me wants to stay and fight.'},
            {who: 'rae', text: '…Everyone who can walk, take what you can carry. We go now.'},
            {scene: 'woods', place: 'The Edge of the Woods · Night'},
            {who: 'narr', text: 'Behind them, frog drums on the ridge. Ahead, the dark of the woods.'},
            {who: 'sister', text: 'Will they be all right? The ones who stayed?'},
            {who: 'rae', text: '…Keep walking, little one. Don\'t look back.'},
            {card: 'End of Chapter One', sub: 'Rae Rabbit'},
          ],
          reward: {res: 500, tokens: 6, joins: ['sister']},   // the finale (with the rest of the chapter, about a first ×10 when recruiting opens
        },
      ]},
      // Chapter Two: Rae in her Republic uniform (outfit '' = art/rae-*.png), Little Sister as Flopsy Flora ('flora').
      {id: 'RC2', title: 'Chapter Two', name: 'Into the Woods', outfits: {rae: '', sister: 'flora'},
       enemyMods: {mhp: -2, atk: -1},
       stages: [

        // ---------------- Stage 1 ----------------
        {
          id: 'R2-1', title: 'Ambush at the River', map: 'riverWoods', enemyFaction: 'frog',
          star: {type: 'noLosses', text: 'No one is unstitched'},
          objective: {type: 'survive', turns: 3}, maxDeploy: 6,
          deploy: [[4,13],[5,13],[3,14],[6,14],[4,14],[5,14],[2,13],[7,13]],
          brief: 'Deep in the woods, on the way to the Republic, frogs spring an ambush at the river. Hold out until it breaks.',
          // Willow fights with you from the first turn (she joins the army for good after this battle)
          events: [{turn: 1, join: 'willow', at: [5, 12], mustSurvive: true, talk: [
            {who: 'willow', text: 'Archers on the far bank, blades coming round the sides. Keep me off the open bank and I\'ll show you what I meant.'},
            {who: 'rae', text: 'Stay behind us, then, Scholar. Everyone else, make a wall!'},
          ]}],
          enemies: () => [
            E('reed',2,1,6,'guard'), E('reed',2,4,6,'guard'), E('lily',2,6,6), E('bruiser',2,2,5),
            E('bruiser',2,0,10), E('blade',2,9,9),
          ],
          reinforce: () => [
            {turn: 2, units: [E('lily',2,8,4), E('reed',2,6,5,'guard'), E('bruiser',2,0,14)]},
            {turn: 3, units: [E('blade',3,9,12), E('lily',2,3,3)]},
          ],
          // after three turns the ambush breaks, and Rae decides nobody leaves the river
          twist: {objective: {type: 'rout'}, popup: 'Scouts!', units: [E('blade',3,4,0), E('reed',3,6,1,'guard'), E('blade',3,8,0,'charge',{elite: true})], talk: [
            {who: 'narr', text: 'The ambush breaks against the bank. On the far side of the river, a frog scout turns and runs for the trees.'},
            {who: 'willow', text: 'They\'re not here to kill us. They\'re following us. They want us to lead them to the Republic!'},
            {who: 'willow', text: 'We have to run. Now, before more of them come.'},
            {who: 'rae', text: 'No.'},
            {who: 'rae', text: 'If we run, they follow. If even one of them gets back to their lines, everyone we\'re running to is in danger.'},
            {who: 'rae', text: 'We can\'t lead them to the Republic. So nobody leaves this river. We stop them here, and now.'},
            {who: 'sister', text: 'Rae…'},
            {who: 'rabbits', text: '…You heard her. Rae Rabbit! Rae Rabbit!'},
            {who: 'willow', thought: true, text: 'Ha. There it is.'},
            {who: 'willow', text: 'You heard her! Not one of them leaves these woods!'},
          ]},
          pre: [
            {card: 'Chapter Two', sub: 'Into the Woods'},
            {scene: 'woods', place: 'The Deep Woods · Morning'},
            {who: 'narr', text: 'Two days\' walk from the mines, Willow\'s people meet them on the trail with bundles of new clothes.'},
            {who: 'sister', text: 'Look! LOOK! Flowers! Real stitched flowers, all down the sleeves!'},
            {who: 'willow', text: 'In the mines, rabbits get tags. In the Republic, rabbits choose their names. Have you chosen yours, little one?'},
            {who: 'sister', text: 'Flopsy. No: Flopsy Flora. Because of the flowers.'},
            {rename: {sister: 'Flopsy Flora'}},
            {who: 'sister', text: 'Flopsy Flora! Say it, Rae!'},
            {who: 'rae', text: 'Flopsy Flora. It suits you.'},
            {who: 'narr', text: 'Rae\'s new coat is Republic blue and red, stitched with its mark. It fits as if it were made for her. Perhaps it was.'},
            {who: 'rae', thought: true, text: 'Good cloth. Warm. Old Rabbit never had a coat like this.'},
            {who: 'rae', thought: true, text: 'The frogs would have had the yard by dawn. Whoever stayed behind…'},
            {who: 'willow', text: 'And these. You carried them out of the mines. Now carry them properly.'},
            {who: 'narr', text: 'The sword from above Rhubarb\'s desk: taken, the guards used to boast, from the last rabbit who ever fought back.'},
            {who: 'rae', text: 'Then it goes back to the rabbits. Last Stand. That\'s its name now.'},
            {who: 'sister', text: 'And the silver needle\'s mine! I\'m going to sew everybody up. Properly.'},
            {arm: [{id: 'laststand', to: 'rae'}, {id: 'silverneedle', to: 'sister'}]},
            {who: 'narr', text: 'Rae Rabbit takes up Last Stand. Flopsy Flora takes the Silver Needle.'},
            {who: 'narr', text: 'Neither of them throws their old mine clothes away. They fold them small, and keep them.'},
            {attire: ['raeRags', 'floraRags']},
            {who: 'rae', text: 'Why go to all this trouble, Willow? For a few mine workers. You could have left us.'},
            {who: 'willow', text: 'The Republic can\'t win on numbers. The Friggliarchy has more frogs than we have buttons.'},
            {who: 'willow', text: 'It needs a hero. And heroes can come from anywhere, even a mine. Finding them is my job.'},
            {who: 'rae', text: 'And you think I\'m one.'},
            {who: 'willow', text: 'I think you have talent. Talent without discipline gets rabbits unstitched. So: a lesson.'},
            {who: 'willow', show: 'triangle', text: 'Swords beat axes. Axes beat lances. Lances beat swords. Pick your fights by what the enemy carries.'},
            {who: 'willow', show: 'triangle', text: 'And a tome beats a bow. Words reach further than stones, and no archer can dodge an idea.'},
            {who: 'willow', text: 'But those of us who read are soft-stitched. A tome hits hard and from two tiles away, and that is all it does well.'},
            {who: 'willow', text: 'Keep your readers behind the line, and keep blades between us and theirs.'},
            {who: 'rae', text: '…Protect the bookworm. Got it.'},
            {who: 'willow', text: 'Protect the Scholar.'},
            {who: 'narr', text: 'A twig snaps. Then another. On the far bank of the river, green helmets move between the trees.'},
            {who: 'willow', text: 'We\'ve been followed. Frogs!'},
            {who: 'rae', text: 'Ambush! Everyone, to me!'},
          ],
          post: [
            {who: 'narr', text: 'The river runs quiet again. Not a single frog made it back through the trees.'},
            {who: 'rabbits', text: 'She didn\'t run. She didn\'t even think about running.'},
            {who: 'sister', text: 'She never does.'},
            {who: 'willow', text: 'Rae Rabbit. Do you know how many rabbits I\'ve watched take the safe road?'},
            {who: 'rae', text: 'Was I wrong?'},
            {who: 'willow', text: 'You were right. And you had a whole band of frightened rabbits follow you across a river to prove it.'},
            {who: 'willow', thought: true, text: 'Talent. Nerve. And they follow her without being asked. Oh, the Republic is going to like her.'},
            {who: 'willow', text: 'Come. Camp\'s a day\'s walk east. And this time, nobody is following us.'},
          ],
          reward: {res: 500},
        },

        // ---------------- Stage 2 ----------------
        {
          id: 'R2-2', title: 'The Lost Column', map: 'ravine', enemyFaction: 'frog',
          requires: ['F2-2'], convergence: 'The Ravine',
          star: {type: 'allies', text: 'No ally falls'},
          objective: {type: 'rout'}, maxDeploy: 6,
          deploy: [[4,13],[5,13],[3,12],[6,12],[4,12],[5,12],[2,13],[7,13]],
          brief: 'Patch\'s column is pinned in a ravine. Break through, rout the frogs, and keep Patch alive. His soldiers fight beside you, but on their own (blue coasters).',
          // allies: Republic soldiers who fight on your side but act on their own (green coasters)
          allies: () => [
            E('rfighter',4,4,7,'hold',{key: 'patch', name: 'Patch', look: 'patch', vip: true}),
            E('rfencer',2,5,7,'guard',{key: 'ally', name: 'Nettle'}), E('rarcher',2,4,6,'guard',{key: 'ally', name: 'Fern'}),
            E('rfighter',2,3,8,'guard',{key: 'ally', name: 'Burr'}), E('radept',2,5,6,'guard',{key: 'ally', name: 'Moss'}),
          ],
          enemies: () => [
            E('reed',3,2,2,'guard'), E('reed',3,7,2,'guard'), E('lily',4,4,3), E('bruiser',3,6,4), E('blade',4,3,1),
            E('toadknight',3,5,2,'charge',{elite: true}), E('gaxe',3,1,8), E('gpike',3,8,9),
          ],
          reinforce: () => [{turn: 3, units: [E('gblade',4,0,11), E('gscribe',3,9,11,'guard')]}],
          events: [{turn: 1, talk: [
              {who: "narr", text: "Down in the ravine, a ring of battered Republic soldiers. At their centre, a one-eyed rabbit with a spear."},
              {who: "patch", text: "Rabbits? Republic rabbits? Ha! Didn't think anyone would come for us!"},
              {who: "rae", text: "Hold on! We're breaking through to you!"},
              {who: "patch", text: "Mind the archers up on the ravine walls. And mind your skins. I've only got the one eye left to lose."},
            ]}],
          pre: [
            {scene: "republic", place: "The Republic Camp"},
            {who: "narr", text: "The Republic's camp is a town of patched tents hidden under the trees. Word of the river got there before they did."},
            {who: "republic", text: "That's her. The one from the mines. The one who held the river!"},
            {who: "republic", text: "Rae Rabbit! Rae Rabbit's here!"},
            {who: "narr", text: "Rabbits everywhere: mending, cooking, arguing, laughing. And everywhere, Rae hears names. Clover. Bramble. Thistle. Juniper."},
            {who: "rae", text: "Every one of them has a name. Every single one.", thought: true},
            {who: "sister", text: "Rae? Are you crying?"},
            {who: "rae", text: "It's the smoke. \u2026It's not the smoke."},
            {who: "willow", text: "Come. The leader of the Republic wants to meet you."},
            {who: "narr", text: "In the command tent, someone is bent over a map of the woods. Someone green."},
            {who: "rae", text: "That's\u2026 Willow, that's a frog."},
            {who: "froggle", text: "A frog. Yes. Froggle, at your service. I gather you were expecting longer ears."},
            {who: "froggle", text: "Tell me, Rae Rabbit. Did you think every frog was born able to look away from a chain?"},
            {who: "rae", text: "\u2026I didn't think about it at all. I'm sorry."},
            {who: "froggle", text: "Don't be. Once, I didn't think about rabbits at all. Then I saw what we do in the mines, and I couldn't stop thinking about them."},
            {who: "rae", text: "Then we want the same thing."},
            {who: "froggle", text: "We do. Which is why I'll be honest with you. We're leaving."},
            {who: "froggle", text: "The King's youngest brother has come into these woods with an army. There are too many eyes on this part of the forest. We're moving the camp north."},
            {who: "willow", text: "The first groups have already gone. Small columns, each on a different road."},
            {who: "froggle", text: "Some will be caught. We know that. When the frogs catch a column, they think they've found us, and the rest slip past."},
            {who: "rae", text: "You're sending them out to be caught?"},
            {who: "froggle", text: "I'm sending them out so that most of us live. That's what leading costs."},
            {who: "narr", text: "Running feet. A Republic scout bursts into the tent, mud to the knees."},
            {who: "republic", text: "Froggle! The east column, Patch's lot! They're pinned in the ravine, frogs on every side!"},
            {who: "froggle", text: "\u2026Then it's happened as we planned. Their sacrifice buys the rest of us time. We break camp tonight."},
            {who: "rae", text: "No."},
            {who: "rae", text: "You planned for them to be caught. You never planned for anyone to answer when they called."},
            {who: "froggle", text: "Rae Rabbit\u2014"},
            {who: "rae", text: "Willow. Flopsy Flora. Anyone who can hold a weapon. We're going to the ravine."},
            {who: "willow", text: "And there she goes again.", thought: true},
          ],
          post: [
            {who: "patch", text: "You came. Nobody comes for the columns. That's the whole point of the columns."},
            {who: "rae", text: "Then the whole point was wrong."},
            {who: "patch", text: "\u2026Patch. Corporal, Republic East Company. I owe you one. More than one. Never was much good at counting."},
            {who: "narr", text: "Willow isn't celebrating. She's staring at the ground: the trampled mud, the snapped branches, the wide, clear trail the rescue party carved through the woods."},
            {who: "willow", text: "Rae. Look at this."},
            {who: "rae", text: "It's our trail. So what?"},
            {who: "willow", text: "They had a whole column pinned here, and they didn't finish it. They didn't need to. They were waiting."},
            {who: "willow", text: "For someone to come. And then to follow them home."},
            {who: "rae", text: "\u2026The camp."},
            {who: "willow", text: "We've drawn them a map straight to the Republic."},
            {who: "rae", text: "Everyone, back to the camp! Now!"},
          ],
          reward: {res: 550},
        },

        // ---------------- Stage 3: the race back ----------------
        {
          id: 'R2-2b', title: 'Race to the Camp', map: 'forestTrail', enemyFaction: 'frog',
          star: {type: 'noLosses', text: 'No one is unstitched'},
          objective: {type: 'boss', limit: 7}, maxDeploy: 6,
          limitFail: 'The vanguard reached the camp first, and opened the gate.',
          deploy: [[4,15],[5,15],[3,14],[6,14],[4,14],[5,14],[2,15],[7,15]],
          brief: 'A frog vanguard is racing you back to the Republic camp. Cut through and defeat its captain before it gets there.',
          allies: () => [E('rfighter',4,5,13,'charge',{key: 'patch', name: 'Patch', look: 'patch'})],
          enemies: () => [
            E('toadknight',4,4,0,'hold',{boss: true, elite: true, key: 'vanguard', name: 'Vanguard Captain'}),
            E('lily',3,3,2,'guard'), E('reed',3,6,2,'guard'), E('bruiser',3,4,5), E('lily',3,7,6), E('blade',3,2,7),
            E('reed',3,1,9), E('bruiser',3,8,10), E('blade',3,5,12),
          ],
          bossTalk: [
            {who: "guard", text: "Run, rabbits! Run all the way home! We'll be right behind you!"},
            {who: "rae", text: "You'll be right behind nothing."},
          ],
          pre: [
            {scene: "woods", place: "The Trail Home \u00b7 Evening"},
            {who: "narr", text: "They run. Behind them, the ravine. Ahead, the camp. And between them, a line of torches moving fast through the trees."},
            {who: "patch", text: "Frogs on the trail ahead! A vanguard. They're going to beat us back to the camp."},
            {who: "willow", text: "If they reach the palisade first, they'll open the gate for the rest of the army."},
            {who: "rae", text: "Then they don't reach it. Cut through them. Don't stop for anything."},
            {who: "sister", text: "My legs are too short for this!"},
            {who: "rae", text: "Then I'll carry you after. Run!"},
          ],
          post: [
            {who: "narr", text: "The vanguard breaks. The trail home is clear, for now."},
            {who: "willow", text: "That was only the front of it. The rest of their army is an hour behind us. Less."},
            {who: "rae", text: "Then we have an hour."},
          ],
          reward: {res: 500},
        },

        // ---------------- Stage 4 ----------------
        {
          id: 'R2-3', title: 'Make a Stand', map: 'republicCamp', enemyFaction: 'frog',
          star: {type: 'noLosses', text: 'No one is unstitched'},
          objective: {type: 'survive', turns: 5}, maxDeploy: 6,
          deploy: [[4,9],[5,9],[3,11],[6,11],[4,12],[5,12],[2,12],[7,12]],
          brief: 'The frogs followed the trail to the Republic camp. Hold the palisade until dawn.',
          allies: () => [
            E('rfighter',4,3,7,'guard',{key: 'patch', name: 'Patch', look: 'patch'}),
            E('rfencer',3,6,7,'guard',{key: 'ally', name: 'Nettle', elite: true}), E('rarcher',3,4,8,'guard',{key: 'ally', name: 'Fern'}),
          ],
          enemies: () => [
            E('prince',4,4,2,'charge',{key: 'tiggle', name: 'Tiggle Taggle', look: 'tiggle', flees: true, talk: [
                {who: "tiggle", text: "So you're Rae. You don't look like a monster."},
                {who: "rae", text: "And you don't look like someone who'd burn a camp full of rabbits."},
                {who: "tiggle", text: "\u2026I'm not the one you should be afraid of."},
              ]}),
            E('lily',3,3,4), E('bruiser',3,6,4), E('reed',3,1,4), E('reed',3,8,4), E('blade',3,5,3), E('lily',3,2,2),
          ],
          reinforce: () => [
            {turn: 2, units: [E('bruiser',3,3,0), E('reed',3,6,0)]},
            {turn: 3, units: [E('toadknight',3,4,0,'charge',{elite: true}), E('blade',3,0,1)]},
            {turn: 4, units: [E('lily',3,5,0), E('reed',3,9,1)]},
          ],
          pre: [
            {scene: "republic", place: "The Republic Camp \u00b7 Dusk"},
            {who: "froggle", text: "Strike the tents. We run north tonight, all of us. Leave whatever we can't carry."},
            {who: "rae", text: "They'll follow. Wherever we go, they'll follow. I learned that at the river."},
            {who: "rae", text: "If we run, we lead them to every camp, every hiding place, every rabbit we've got."},
            {who: "froggle", text: "And if we stay, we die here."},
            {who: "rae", text: "Not if we fight here. Here we have the palisade, the trees, every rabbit who can hold a spear. Out there in the dark, we have nothing."},
            {who: "patch", text: "She's right. I'm done being bait. I'd rather stand somewhere I chose."},
            {who: "republic", text: "Rae Rabbit! Rae Rabbit!"},
            {who: "froggle", text: "\u2026Very well. We hold the camp. Rae Rabbit, the line is yours."},
            {who: "narr", text: "Torches in the trees. Green banners. And at their head, a young frog in a golden circlet."},
            {who: "willow", text: "The King's youngest brother. Tiggle Taggle."},
          ],
          post: [
            {who: "narr", text: "Dawn. The frogs pull back into the trees. The palisade holds."},
            {who: "froggle", text: "I've been doing this a long time, Rae Rabbit. Sending columns out to be caught. Leaving the slow ones behind. Calling it necessary."},
            {who: "froggle", text: "I told myself that was what leading costs. I think it was only what being afraid costs."},
            {who: "rae", text: "You kept them alive this long. That counts."},
            {who: "froggle", text: "It counts. It isn't enough. Not any more."},
            {who: "patch", text: "Scouts are back. The frogs regrouped on the hill to the north. The black frog's up there. The one in charge."},
            {who: "willow", text: "Fraggle Friggle. The King's cousin. These are his woods, and he doesn't take prisoners."},
            {who: "rae", text: "Then we go to him. Before he comes to us."},
          ],
          reward: {res: 550},
        },

        // ---------------- Stage 5 ----------------
        {
          id: 'R2-4', title: 'The Raepublic', map: 'thornHill', enemyFaction: 'frog',
          star: {type: 'bossBy', key: 'rae', text: '{lord} drives off Fraggle Friggle herself'},
          objective: {type: 'boss'}, maxDeploy: 6,
          deploy: [[4,15],[5,15],[3,14],[6,14],[4,14],[5,14],[2,15],[7,15]],
          brief: 'Take the fight to Fraggle Friggle on his hill, and drive him out of the woods. Froggle fights beside you.',
          allies: () => [E('tribune',4,4,13,'charge',{key: 'froggle', name: 'Froggle', look: 'froggle'})],
          enemies: () => [
            E('marshlord',5,4,0,'hold',{boss: true, flees: true, key: 'fraggle', name: 'Fraggle Friggle', look: 'fraggle'}),
            E('gpike',4,3,1,'guard',{elite: true}), E('gchaplain',4,5,1,'guard'), E('gscribe',4,2,2,'guard'), E('gscribe',4,7,2,'guard'),
            E('gaxe',4,5,3,'guard',{elite: true}), E('gpike',4,4,5), E('gaxe',4,6,6), E('gblade',4,2,7), E('gpike',3,8,7),
          ],
          bossTalk: [
            {who: "fraggle", text: "Oh, look! The little hero! I'm going to unstitch you slowly, and wear your name like a scarf!"},
            {who: "rae", text: "You'll have to catch me first."},
          ],
          pre: [
            {scene: "woods", place: "The Black Hill \u00b7 Morning"},
            {who: "narr", text: "On the hilltop: cages. Stakes. And a black frog, laughing at something only he can hear."},
            {who: "fraggle", text: "My cousin's gone soft, but I haven't! They came out of their burrow, all the little named things, out in the open!"},
            {who: "fraggle", text: "Burn the hill. Burn the woods. Burn the lot of them, and let's see what their names are worth as ash."},
            {who: "willow", text: "He means every word."},
            {who: "froggle", text: "Then he's the reason we've been hiding all these years. Rae Rabbit, I'm with you. Wherever you lead."},
            {who: "rae", text: "Then we end it here. For everyone they've chained."},
          ],
          post: [
            {who: "narr", text: "Fraggle Friggle crashes away through the thorns, shrieking, his guard scattering behind him."},
            {who: "fraggle", text: "This isn't over! I'll find you! I'll find every one of you!"},
            {who: "narr", text: "Then the woods go quiet. And then they don't."},
            {who: "republic", text: "RAE RABBIT!"},
            {who: "republic", text: "The Raepublic! Rae's Republic!"},
            {who: "rae", text: "Wait, no, that's not\u2026 It's the Republic. It's everyone's."},
            {who: "froggle", text: "Let them, Rae."},
            {who: "froggle", text: "I've kept the Republic hidden for years. Hidden is all it's ever been. It needs someone who'll stand in the open."},
            {who: "froggle", text: "It's time for fresh blood to take the reins. Rae Rabbit, will you lead us?"},
            {who: "rae", text: "\u2026I'll lead. But I'll be asking you, every step of the way."},
            {who: "froggle", text: "Good. That's how I know you'll be good at it."},
            {who: "sister", text: "The Raepublic! I'm sewing it on a flag! A big one!"},
            {who: "willow", text: "Found her.", thought: true},
            {card: "End of Chapter Two", sub: "The Raepublic"},
          ],
          reward: {res: 600, tokens: 6},
        },
      ]},
      {id: 'RC3', title: 'Chapter Three', name: 'Monkeyland', enemyMods: {mhp: -1},
       stages: [

        // ---------------- Stage 1: out of the forest (escort the refugees) ----------------
        {
          id: 'R3-1', title: 'Out of the Woods', map: 'meadowEdge', enemyFaction: 'frog',
          star: {type: 'allies', text: 'No refugee is lost'},
          objective: {type: 'survive', turns: 5, escort: true, who: 'refugees', dest: 'the meadows'}, escort: true, maxDeploy: 7,
          exits: [[0,15],[1,15],[2,15],[4,15],[5,15],[7,15],[8,15],[9,15]],
          deploy: [[4,5],[5,5],[3,6],[6,6],[2,5],[7,5],[4,6],[5,6]],
          brief: 'The Raepublic is leaving the forest. Hold back the frogs while the refugees walk down into the meadows (the gold squares). They go on their own; the frogs go for them first.',
          prepNote: 'The refugees (blue) walk to the gold squares by themselves, and leave the map there. Keep the frogs off them for five turns.',
          allies: () => [1,3,5,8,2,6,7].map((x, i) => E('hauler',2,x,1 + (i % 3),'courier',{courier: true, key: 'ally', name: 'Refugee', look: 'workerLop', bonus: {mov: -1}})),
          enemies: () => [
            E('blade',4,0,0), E('blade',4,9,1), E('bruiser',4,3,0), E('lily',4,6,0), E('reed',4,2,2), E('reed',4,8,3),
          ],
          reinforce: () => [
            {turn: 1, units: [E('blade',4,0,0), E('bruiser',4,9,0)]},
            {turn: 2, units: [E('lily',4,4,0), E('blade',5,5,0,'charge',{elite: true})]},
            {turn: 3, units: [E('reed',4,1,0), E('bruiser',4,8,0), E('blade',4,0,7)]},
          ],
          pre: [
            {card: 'Chapter Three', sub: 'Monkeyland'},
            {scene: 'woods', place: 'The Raepublic Camp · Before Dawn'},
            {who: 'narr', text: 'The scouts come back in the dark, out of breath. The King\'s army is in the woods. A whole army, and the King\'s youngest brother at its head.'},
            {who: 'froggle', text: 'North is the King\'s road. West is the way we came. That leaves east.'},
            {who: 'willow', text: 'East is Monkeyland.'},
            {who: 'sister', text: 'Monkeys? Real monkeys?'},
            {who: 'willow', text: 'Real monkeys. Monkeyland was a kingdom once, Flopsy. Older than the Friggliarchy. The frogs conquered it, long before any of us were stitched.'},
            {who: 'willow', text: 'Now the monkeys guard the frogs\' borders better than the frogs do. They are the most loyal subjects the King has.'},
            {who: 'rae', text: 'Loyal because they want to be?'},
            {who: 'froggle', text: 'Out of duty, or out of fear. Nobody has ever asked them. If they catch us, they\'ll hand us to the frogs, and then there will be trouble.'},
            {who: 'patch', text: 'So we go quiet. Quiet as mice.'},
            {who: 'sister', text: 'We\'re not very good at quiet.'},
            {who: 'narr', text: 'Behind them, at the edge of the trees, green helmets. The frogs have found the column.'},
            {who: 'rae', text: 'Then we go quiet later. Everyone who can fight, with me! Get the others down into the meadows!'},
          ],
          post: [
            {who: 'narr', text: 'The forest gives out all at once. Beyond it: meadows to the edge of the sky, and flowers everywhere, stitched in every colour there is.'},
            {who: 'sister', text: 'Rae. Rae, look. It\'s all flowers. All of it.'},
            {who: 'rae', text: 'I\'ve never seen so much sky.'},
            {who: 'willow', text: 'Enjoy it. Out here, everyone can see us, too.'},
          ],
          reward: {res: 600},
        },

        // ---------------- Stage 2: catch the lookout ----------------
        {
          id: 'R3-2', title: 'The Lookout', map: 'blossomFields', enemyFaction: 'monkey',
          star: {type: 'turns', n: 3, text: 'Catch Lookout Fig by the end of turn III'},
          objective: {type: 'boss', dest: 'the bell tower'}, maxDeploy: 7,
          exits: [[4,0],[5,0]],
          escapeFail: 'Lookout Fig reached the bell tower, and rang it. Every monkey in the meadows knows the Raepublic is here.',
          deploy: [[4,14],[5,14],[3,13],[6,13],[2,14],[7,14],[4,15],[5,15]],
          brief: 'A monkey lookout has seen the column, and she\'s running for the bell tower. Catch her before she rings it.',
          prepNote: 'Lookout Fig runs for the bell tower (the gold squares) and won\'t stop to fight. If she reaches it, the battle is lost. Monkeys climb through trees and flowers as if they weren\'t there.',
          enemies: () => [
            E('mkacro',4,4,9,'courier',{boss: true, flees: true, key: 'fig', name: 'Lookout Fig', bonus: {mov: -2}}),
            E('mkguard',5,3,7,'guard'), E('mkguard',5,6,7,'guard'), E('mkthrow',5,1,5,'guard'), E('mkthrow',5,8,5,'guard'),
            E('mkacro',5,2,10), E('mkacro',5,7,10), E('mkbrute',5,4,4,'guard'),
          ],
          bossTalk: [
            {who: 'fig', text: 'Rabbits! Rabbits in the meadows! Let me go, let me go, I have to ring the bell!'},
            {who: 'rae', text: 'We\'re not here to hurt anyone!'},
            {who: 'fig', text: 'That\'s what the frogs said too!'},
          ],
          pre: [
            {scene: 'monkeyland', place: 'The Meadows of Monkeyland'},
            {who: 'narr', text: 'Two days into the meadows. No frogs. No monkeys. Only flowers, and bees, and the Raepublic trying very hard to be quiet.'},
            {who: 'rae', text: 'Willow. If the monkeys were a kingdom once, maybe they remember it. Maybe we could talk to them.'},
            {who: 'willow', text: 'Maybe. But they\'ve served the frogs for longer than anyone remembers. Habits that old are hard to break.'},
            {who: 'narr', text: 'A rustle in the blossom trees. A small brown face. Two very wide eyes.'},
            {who: 'fig', text: '…RABBITS! RABBITS IN THE MEADOWS!'},
            {who: 'patch', text: 'She\'s heading for that tower. There\'s a bell on top!'},
            {who: 'rae', text: 'Catch her! Don\'t hurt her, just catch her!'},
          ],
          post: [
            {who: 'narr', text: 'Lookout Fig sits in the grass with her arms folded, glaring at everyone.'},
            {who: 'fig', text: 'Go on, then. Unstitch me. That\'s what rabbits do.'},
            {who: 'rae', text: 'Who told you that?'},
            {who: 'fig', text: '…The frogs.'},
            {who: 'rae', text: 'Go home, Fig. Tell your Governess the Raepublic means no harm. We\'re only passing through.'},
            {who: 'narr', text: 'Fig stares at her. Then she runs, and doesn\'t look back.'},
            {who: 'willow', text: 'You do know you\'ve just told the frogs\' most loyal servants exactly where we are.'},
            {who: 'rae', text: 'They\'d have found us anyway. This way, they hear it from us first.'},
          ],
          reward: {res: 600},
        },

        // ---------------- Stage 3: the monkeys come, with the prince ----------------
        {
          id: 'R3-3', title: 'Trouble in the Flowers', map: 'blossomFields', enemyFaction: 'monkey',
          requires: ['F3-2'], convergence: 'The Flower Fields',
          star: {type: 'noLosses', text: 'No one is unstitched'},
          objective: {type: 'survive', turns: 5}, maxDeploy: 7,
          deploy: [[4,8],[5,8],[3,9],[6,9],[4,10],[5,10],[2,9],[7,9]],
          brief: 'The monkeys have come for the camp in the flowers, and frogs with them. Hold out until dawn.',
          enemies: () => [
            E('heir',5,4,1,'charge',{key: 'speshul', name: 'Speshul', look: 'speshul', flees: true, talk: [
                {who: 'speshul', text: 'You\'re… you\'re Rae Rabbit. The real one! Mother says you\'re a monster.'},
                {who: 'rae', text: 'Do I look like one?'},
                {who: 'speshul', text: '…You look tired. Monsters don\'t look tired.'},
              ]}),
            E('mkacro',5,1,2), E('mkacro',5,8,2), E('mkguard',5,3,3), E('mkguard',5,6,3), E('mkthrow',5,2,0,'guard'), E('mkthrow',5,7,0,'guard'),
            E('blade',5,0,6,'charge',{faction: 'frog'}),
          ],
          reinforce: () => [
            {turn: 2, units: [E('prince',6,5,0,'charge',{key: 'tiggle', name: 'Tiggle Taggle', look: 'tiggle', faction: 'frog', flees: true, talk: [
                {who: 'tiggle', text: 'Rae Rabbit. You can\'t keep running forever.'},
                {who: 'rae', text: 'Watch me.'},
              ]}), E('lily',5,4,0,'charge',{faction: 'frog'})]},
            {turn: 3, units: [E('mkbrute',5,0,12), E('mkacro',5,9,12)]},
            {turn: 4, units: [E('mkchant',5,4,0,'guard'), E('mkacro',5,1,0), E('mkacro',5,8,0)]},
          ],
          pre: [
            {scene: 'monkeyland', place: 'The Flower Fields · Night'},
            {who: 'narr', text: 'The Raepublic camps in a sea of flowers. Nobody sleeps much.'},
            {who: 'patch', text: 'Torches. Over there, and there, and there. Monkeys. Lots of them.'},
            {who: 'froggle', text: 'And frogs among them. Green helmets. The prince has found friends.'},
            {who: 'sister', text: 'So much for passing through.'},
            {who: 'rae', text: 'Hold the camp until the sun comes up. And nobody unstitches a monkey they don\'t have to.'},
            {who: 'patch', text: 'They\'re not making it easy, Commander.'},
            {who: 'rae', text: 'I know. Do it anyway.'},
          ],
          post: [
            {who: 'narr', text: 'Dawn comes up pink over the flowers. The monkeys melt back into the blossom trees.'},
            {who: 'narr', text: 'One of them was left behind with a twisted ankle: an old courtier, very dignified, very cross.'},
            {who: 'courtier', text: 'The young one? That was Speshul. The Governess\'s son. Her only son.'},
            {who: 'rae', text: 'He didn\'t want to fight us. I saw it. He looked at us like he was seeing the world for the first time.'},
            {who: 'courtier', text: 'He looks at everything like that. It is very trying.'},
            {who: 'rae', text: 'Then I\'m going to talk to his mother.'},
            {who: 'froggle', text: 'Rae. The Governess lives in a castle full of guards, and every frog in Monkeyland reports to her.'},
            {who: 'rae', text: 'Then that\'s the last place they\'ll expect us.'},
          ],
          reward: {res: 650},
        },

        // ---------------- Stage 4: push into the castle ----------------
        {
          id: 'R3-4', title: 'The Castle Gate', map: 'castleGate', enemyFaction: 'monkey',
          star: {type: 'bossBy', key: 'rae', text: '{lord} drives back Captain Tamarind herself'},
          objective: {type: 'boss'}, maxDeploy: 7,
          deploy: [[4,14],[5,14],[3,13],[6,13],[2,14],[7,14],[4,15],[5,15]],
          brief: 'Rae means to meet the Governess, whether the Governess likes it or not. Cross the drawbridge, and drive back the captain of her guard.',
          enemies: () => [
            E('mkguard',7,4,1,'hold',{boss: true, elite: true, flees: true, key: 'tamarind', name: 'Captain Tamarind', look: 'tamarind'}),
            E('mkguard',6,4,4,'guard'), E('mkguard',6,5,4,'guard'), E('mkthrow',6,1,3,'guard'), E('mkthrow',6,8,3,'guard'),
            E('mkacro',6,2,7), E('mkacro',6,7,8), E('mkbrute',7,4,6), E('mkchant',6,5,1,'guard'),
            E('lily',6,1,1,'guard',{faction: 'frog'}), E('reed',6,8,1,'guard',{faction: 'frog'}),
          ],
          bossTalk: [
            {who: 'tamarind', text: 'Nobody walks into the Governess\'s castle. Nobody.'},
            {who: 'rae', text: 'I\'m not walking. I\'m knocking. Very loudly.'},
          ],
          pre: [
            {scene: 'castlegate', place: 'The Governess\'s Castle'},
            {who: 'narr', text: 'The castle stands on a hill above the meadows, older than anything in the Friggliarchy. Frog banners hang from every tower.'},
            {who: 'willow', text: 'Rae. Listen to me. This isn\'t brave. This is walking into a trap and knocking on it.'},
            {who: 'rae', text: 'The monkeys attacked us because the frogs told them to. Nobody\'s ever asked them what they want. I\'m going to ask.'},
            {who: 'patch', text: 'I\'m with the Commander. Somebody\'s got to hold the door for her.'},
            {who: 'froggle', text: '…Then be quick. The prince won\'t be far behind us.'},
          ],
          post: [
            {who: 'narr', text: 'Captain Tamarind falls back through the gate, his guard scattering into the courtyard.'},
            {who: 'tamarind', text: 'The Governess will not see you!'},
            {who: 'rae', text: 'She will. I\'ll wait in her hall until she does.'},
            {who: 'patch', text: 'I\'ll hold the gate. Go on, Commander. Go and ask your question.'},
          ],
          reward: {res: 650},
        },

        // ---------------- Stage 5: the meeting; Speshul changes sides ----------------
        {
          id: 'R3-5', title: 'The Governess', map: 'castleHall', enemyFaction: 'frog',
          requires: ['F3-4'], convergence: 'The Castle',
          star: {type: 'noLosses', text: 'No one is unstitched'},
          objective: {type: 'boss'}, maxDeploy: 7,
          deploy: [[4,13],[5,13],[3,13],[6,13],[4,14],[5,14],[2,14],[7,14]],
          brief: 'The Governess has refused you, and the King\'s envoy wants you in chains. Defeat the envoy before his guard closes the hall.',
          prepNote: 'Some of the Governess\'s guard may not stay on the frogs\' side for long.',
          enemies: () => [
            E('blade',6,4,1,'hold',{boss: true, elite: true, key: 'envoy', name: 'The King\'s Envoy', look: 'duelist'}),
            E('lily',6,3,2,'guard'), E('lily',6,6,2,'guard'), E('reed',6,2,4,'guard'), E('reed',6,7,4,'guard'), E('bruiser',6,4,6),
            E('mkguard',6,2,8,'charge',{faction: 'monkey', defects: true}), E('mkacro',6,7,8,'charge',{faction: 'monkey', defects: true}),
            E('mkthrow',6,3,10,'guard',{faction: 'monkey', defects: true}), E('mkguard',6,6,10,'charge',{faction: 'monkey', defects: true}),
            E('mkacro',6,1,5,'charge',{faction: 'monkey'}), E('mkbrute',6,8,6,'charge',{faction: 'monkey'}),
          ],
          // turn 2: Speshul stands up, and half the hall's guard goes with him
          events: [{turn: 2, join: 'speshul', at: [4, 11], mustSurvive: true, defect: true, popup: 'For Speshul!', talk: [
            {who: 'speshul', text: 'STOP! Everybody stop!'},
            {who: 'aurora', text: 'Speshul. Go to your room.'},
            {who: 'speshul', text: 'No, Mother. I\'ve read every book in this castle. We were a kingdom! We had our own songs, and our own laws, and our own flag!'},
            {who: 'speshul', text: 'And then the frogs came, and we knelt, and we\'ve been kneeling so long we\'ve forgotten we have legs!'},
            {who: 'aurora', text: 'We knelt so that we would still be alive to sing those songs.'},
            {who: 'speshul', text: 'We don\'t sing them! Nobody\'s sung them in a hundred years!'},
            {who: 'speshul', text: 'Monkeys of the guard! Who\'s with me?'},
          ]}],
          pre: [
            {scene: 'castle', place: 'The Great Hall'},
            {who: 'narr', text: 'The great hall. Old banners, faded almost white, hang behind the frog ones. On the throne sits a monkey in a circlet of gold petals.'},
            {who: 'narr', text: 'Beside her stands a frog in the King\'s colours, with his hand on his sword.'},
            {who: 'aurora', text: 'You must be the rabbit from the mines. You\'re smaller than they say.'},
            {who: 'rae', text: 'Governess. We aren\'t here to fight you. We\'re asking for passage through your land. And, if you\'ll give it, help.'},
            {who: 'aurora', text: 'Help. Against the Friggliarchy.'},
            {who: 'rae', text: 'You were a kingdom once. You could be again.'},
            {who: 'aurora', text: 'I have kept these people alive for twenty years by kneeling. Do you know how many monkeys stood up, the last time anyone tried?'},
            {who: 'aurora', text: 'Neither do I. Nobody could count them afterwards.'},
            {who: 'aurora', text: 'The answer is no, Rae Rabbit. I am sorry. I truly am.'},
            {who: 'envoy', text: 'There. You have your answer. Guards! Take the rebels!'},
            {who: 'narr', text: 'Up in the gallery, a young monkey in an orange bandana grips the rail so hard his knuckles go pale.'},
          ],
          post: [
            {who: 'narr', text: 'The envoy flees through a side door. The hall is quiet, and split straight down the middle.'},
            {who: 'aurora', text: 'You\'ve taken my son.'},
            {who: 'speshul', text: 'Nobody took me, Mother. I\'m going. I want to see the world. I want us to have a world to see.'},
            {who: 'aurora', text: 'And when the frogs come for this, and they will, who do you think will kneel to keep the rest alive? I will. Always.'},
            {who: 'aurora', text: 'I will not help you, Rae Rabbit. Leave my castle.'},
            {who: 'narr', text: 'Rae turns to go. Behind her, one by one, monkeys of the guard put down their frog colours, and follow.'},
            {who: 'sister', text: 'Rae… there are so many of them.'},
            {who: 'rae', text: 'I know.'},
          ],
          reward: {res: 650},
        },

        // ---------------- Stage 6: the schism ----------------
        {
          id: 'R3-6', title: 'The Schism', map: 'schismField', enemyFaction: 'monkey',
          requires: ['F3-5'], convergence: 'Monkeyland Divided',
          star: {type: 'allies', text: 'No monkey ally falls'},
          objective: {type: 'boss'}, maxDeploy: 7, mustDeploy: ['speshul'],
          deploy: [[4,14],[5,14],[3,13],[6,13],[2,14],[7,14],[4,15],[5,15]],
          brief: 'Monkeys loyal to the Governess block the bridges out of Monkeyland. Break through, and defeat Captain Tamarind. The monkeys who chose you fight beside you.',
          prepNote: 'Speshul must come. The monkeys who changed sides fight beside you, on their own (blue coasters).',
          allies: () => [E('mkguard',5,3,11,'charge',{key: 'ally', name: 'Guard Banyan'}), E('mkacro',5,6,11,'charge',{key: 'ally', name: 'Acrobat Kiwi'}),
                         E('mkthrow',5,1,12,'charge',{key: 'ally', name: 'Thrower Sorrel'}), E('mkbrute',5,8,12,'charge',{key: 'ally', name: 'Thumper Mango'})],
          enemies: () => [
            E('mkguard',8,4,2,'hold',{boss: true, elite: true, key: 'tamarind', name: 'Captain Tamarind', look: 'tamarind'}),
            E('mkguard',7,2,5,'guard'), E('mkguard',7,7,5,'guard'), E('mkthrow',7,1,3,'guard'), E('mkthrow',7,8,3,'guard'), E('mkchant',7,5,2,'guard'),
            E('mkacro',7,2,8), E('mkacro',7,7,8), E('mkbrute',7,4,9), E('mkacro',7,0,10),
            E('blade',7,3,0,'charge',{faction: 'frog'}), E('lily',7,6,0,'charge',{faction: 'frog'}),
          ],
          reinforce: () => [{turn: 3, units: [E('mkacro',7,0,6), E('mkacro',7,9,6), E('mkbrute',7,4,0)]}],
          bossTalk: [
            {who: 'tamarind', text: 'Young master. Come home. Please. Your mother is waiting.'},
            {who: 'speshul', text: 'I can\'t, Tamarind. You know I can\'t.'},
            {who: 'tamarind', text: 'Then I\'m sorry. I swore to keep Monkeyland whole.'},
          ],
          pre: [
            {scene: 'monkeyland', place: 'The Stream Below the Castle · Morning'},
            {who: 'narr', text: 'At the stream below the castle, Monkeyland splits in two.'},
            {who: 'narr', text: 'On one bank, the monkeys who chose Speshul. On the other, the monkeys who chose the Governess. Brothers. Neighbours. Old friends. Some of them are shouting each other\'s names.'},
            {who: 'speshul', text: 'That\'s Captain Tamarind on the bridge. He taught me to climb. He taught everyone to climb.'},
            {who: 'rae', text: 'Speshul. You don\'t have to fight him.'},
            {who: 'speshul', text: 'Yes I do. That\'s the whole point, isn\'t it? Somebody has to.'},
          ],
          post: [
            {who: 'narr', text: 'Captain Tamarind falls on the bridge he held all morning.'},
            {who: 'tamarind', text: 'I served your mother. And her mother before her…'},
            {who: 'tamarind', text: '…I would have served you, young master. Gladly.'},
            {who: 'narr', text: 'The Raepublic crosses the stream. Behind them, the meadows. Ahead, the hills. Speshul stands on the bridge a long time.'},
            {who: 'speshul', text: 'Centuries. Monkeyland had centuries of peace. Bad peace. Kneeling peace. But peace.'},
            {who: 'speshul', text: 'And I ended it in a morning.'},
            {who: 'rae', text: 'It wasn\'t peace, Speshul. It was waiting.'},
            {who: 'speshul', text: '…Then I hope we were worth the wait.'},
            {who: 'froggle', text: 'Rae. I\'ve counted. Four hundred monkeys came with us. Four hundred more mouths. And four hundred more spears.'},
            {who: 'willow', text: 'And every frog in the Friggliarchy now knows exactly where we are, and exactly how many of us there are.'},
            {who: 'rae', text: 'Then we keep moving.'},
            {who: 'rae', thought: true, text: 'We\'re bigger than we\'ve ever been. We\'re stronger than we\'ve ever been. And we\'ve never been easier to find.'},
            {card: 'End of Chapter Three', sub: 'Monkeyland'},
          ],
          reward: {res: 700, tokens: 6},
        },
      ]},
      {id: 'RC4', title: 'Chapter Four', name: 'Still to be written', stub: true, brief: 'Still to be written.'},
    ],
  },

  frog: {
    faction: 'frog', name: 'The Friggliarchy', lord: 'tiggle',
    start: ['tiggle', 'biggle'], startRecruits: ['lily', 'lily', 'bruiser', 'reed', 'croaker'], startLevel: 1, startRes: 0,
    chapters: [
      {id: 'FC1', title: 'Chapter One', name: 'The Prince',
       enemyMods: {mhp: -4, atk: -2, def: -1, spd: -1, skl: -1}, stages: [

        // ---------------- Stage 1 ----------------
        {
          id: 'F1-1', title: 'The Mine Road', map: 'ford', enemyFaction: 'rae',
          star: {type: 'bossBy', key: 'tiggle', text: '{lord} drives Brigand off himself'},
          objective: {type: 'boss'}, maxDeploy: 6,
          deploy: [[4,0],[3,1],[5,1],[2,1],[4,1],[6,1],[2,2],[6,2]],
          brief: 'Brigand and his bandits have stopped a supply cart on the road to the mines. Drive him off and seize his gang.',
          enemies: () => [
            E('digger',3,2,10,'hold',{boss: true, flees: true, key: 'brigand', name: 'Brigand', look: 'bandit'}),
            E('digger',1,1,6), E('hauler',1,6,6), E('pebbler',1,3,7,'guard'), E('runner',1,5,9)],
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
            {who: 'scout', text: 'Your Highness! Bandits on the road ahead. They\'ve stopped a supply cart.'},
            {who: 'brigand', text: 'Well, well. Frogs in shiny hats. This road\'s mine, princeling. Everything on it too.'},
            {who: 'tiggle', text: 'You\'re a runaway. That cart is the crown\'s.'},
            {who: 'brigand', text: 'The crown\'s? Funny. I dug the ore that paid for it. Call it back wages. The name\'s Brigand.'},
            {who: 'biggle', text: 'A rabbit with a name. Of course. Well, little brother? Give the order.'},
            {who: 'tiggle', text: 'Advance. And… try not to hurt them more than we have to.'},
            {who: 'biggle', text: 'We\'ll hurt them exactly as much as we have to.'},
          ],
          bossTalk: [
            {who: 'brigand', text: 'Come on, then. I\'ve robbed bigger frogs than you before breakfast.'},
            {who: 'tiggle', text: 'Then this will be your last breakfast.'},
          ],
          post: [
            {who: 'brigand', text: 'Ha! Not today, princeling. Keep the cart. I\'ll keep my neck.'},
            {who: 'narr', text: 'Brigand vanishes into the trees. His gang is not so quick, and the frogs seize every one of them.'},
            {who: 'biggle', text: 'Let him run. A bandit with no gang is just a rabbit in the woods.'},
            {who: 'narr', text: 'Tiggle Taggle looks at the rabbits they have caught.'},
            {who: 'tiggle', text: 'They\'re so thin. Are they always this thin?'},
            {who: 'biggle', text: 'They\'re hungry because they\'re idle. Don\'t look at them too long. That\'s how it started last time. Someone felt sorry for Rae.'},
            {who: 'tiggle', text: '…Of course. Order first.'},
          ],
          reward: {res: 300},
        },

        // ---------------- Stage 2 ----------------
        {
          id: 'F1-2', title: 'The Outer Camp', map: 'outerCamp', enemyFaction: 'rae',
          star: {type: 'noLosses', text: 'No one is unstitched'},
          objective: {type: 'rout'}, maxDeploy: 6,
          deploy: [[3,11],[4,11],[2,11],[5,11],[3,10],[4,10],[1,11],[6,11]],
          brief: 'The rabbits of the outer camp have barricaded themselves in. Take the camp back.',
          enemies: () => [E('digger',1,3,1,'guard'), E('hauler',1,1,3), E('hauler',1,6,3), E('pebbler',1,2,0,'guard'), E('runner',1,5,5), E('patcher',1,4,0,'guard')],
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
          star: {type: 'unhurt', text: '{lord} takes no damage'},
          objective: {type: 'survive', turns: 5}, maxDeploy: 6,
          enemyMods: {mhp: -2, atk: -1},   // eases off Chapter One's weakening towards its finale (see recommendedLevel)
          deploy: [[3,11],[4,11],[2,11],[5,11],[3,10],[4,10],[1,11],[6,11]],
          brief: 'Rebel scouts are climbing the ridge. Hold it for five turns until the main column arrives.',
          enemies: () => [E('runner',2,2,3), E('runner',2,6,2), E('pebbler',2,4,5)],
          reinforce: () => [
            {turn: 2, units: [E('hauler',2,3,0), E('digger',2,6,0)]},
            {turn: 3, units: [E('runner',2,1,0,'charge',{elite: true})]},
            {turn: 4, units: [E('digger',3,0,1,'charge',{elite: true})]},
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
          star: {type: 'fewer', n: 4, text: 'Win with 4 or fewer units deployed'},
          requires: ['R1-4'], convergence: 'The Mines',
          objective: {type: 'boss'}, maxDeploy: 6,
          enemyMods: {mhp: -2, atk: -1},   // eases off Chapter One's weakening towards its finale (see recommendedLevel)
          deploy: [[3,11],[4,11],[2,11],[5,11],[3,10],[4,10],[1,11],[6,11]],
          brief: 'The rebels have fled into the woods and left a rearguard in the yard, led by an old enemy. Break it and retake the mines.',
          enemies: () => [
            E('digger',4,4,0,'hold',{boss: true, flees: true, key: 'brigand', name: 'Brigand', look: 'bandit'}),
            E('pebbler',3,3,1,'guard',{key: 'old', name: 'Old Rabbit', look: 'old', fur: 'grey', elderly: true, talk: [
              {who: 'old', text: 'Every stone I throw is one more step she gets into the woods.'},
              {who: 'tiggle', text: 'Stand down, old one. You don\'t have to die here.'},
              {who: 'old', text: 'Yes I do, your highness. That\'s the whole point.'},
            ]}),
            E('hauler',2,3,0,'guard'), E('pebbler',2,1,1,'guard'), E('patcher',2,4,1,'guard'),
            E('digger',2,3,3,'guard'), E('hauler',2,4,3,'guard'), E('runner',2,1,5),
          ],
          pre: [
            {scene: 'yard', place: 'The Mine Camp · Dawn'},
            {who: 'narr', text: 'By the time the Friggliarchy comes down from the ridge, the tower has fallen and the gate stands open.'},
            {who: 'scout', text: 'Most of them are gone, Your Highness. Into the woods. A few stayed behind to hold the yard.'},
            {who: 'biggle', text: 'A rearguard. Brave of them. Pointless, but brave. Take it.'},
            {who: 'tiggle', text: 'Where did the rest go?'},
            {who: 'scout', text: 'Your Highness… the one leading them. It\'s the bandit from the road.'},
            {who: 'brigand', text: 'Morning, princeling. Didn\'t think you\'d see me again, did you?'},
            {who: 'tiggle', text: 'You ran last time. Why come back for them?'},
            {who: 'brigand', text: 'I\'ve robbed your carts for years and called it freedom. Then I heard a whole camp singing a name, and I thought: they\'re braver than me.'},
            {who: 'brigand', text: 'So I\'m done running. You want this yard, you go through me.'},
            {who: 'biggle', text: 'A bandit with a conscience. How tiresome. Take it.'},
          ],
          bossTalk: [
            {who: 'brigand', text: 'Every turn you spend on me is a turn she gets further away. Come on, then!'},
            {who: 'tiggle', text: 'Who? Who is she?'},
          ],
          post: [
            {who: 'brigand', text: 'Not yet… I can still—'},
            {who: 'old', text: 'Go, you fool. Someone has to tell her what happened here. You\'re the only one fast enough.'},
            {who: 'brigand', text: '…Then I\'ll tell her you held.'},
            {who: 'narr', text: 'This time, Brigand does not run to save himself. He runs because the rearguard makes him, and he looks back the whole way.'},
            {scene: 'block', place: 'The Execution Block · Evening'},
            {who: 'narr', text: 'By nightfall the mines belong to the Friggliarchy again. The rabbits who stayed behind are led up the scaffold to the block.'},
            {who: 'biggle', text: 'Read the sentence, little brother. You took the camp. This is part of taking it.'},
            {who: 'tiggle', text: 'For rebellion against the crown… you are to be unstitched.'},
            {who: 'old', text: 'Go on, then. I\'m old. I was going to be unstitched one way or another.'},
            {who: 'old', text: 'Rae Rabbit is reborn. And while you\'re busy with us, she\'s already on her way to end you. All of you.'},
            {who: 'tiggle', text: 'Rae is a story. A story for frightening rabbits.'},
            {who: 'old', text: 'Not any more.'},
            {who: 'narr', text: 'The sentence is carried out. Tiggle Taggle does not look away. Afterwards, he cannot stop seeing it.'},
            {who: 'biggle', text: 'Last words. They all say something like that. Forget it.'},
            {who: 'tiggle', thought: true, text: 'They weren\'t afraid. At the very end, they weren\'t afraid at all.'},
            {who: 'tiggle', text: 'If she\'s real, she\'s out there, and she\'s coming. Then I\'ll be the one who stops her.'},
            {card: 'End of Chapter One', sub: 'The Prince'},
          ],
          reward: {res: 500, tokens: 6},
        },
      ]},
      {id: 'FC2', title: 'Chapter Two', name: 'The Black Frog', enemyMods: {mhp: -2, atk: -1}, stages: [

        // ---------------- Stage 1 ----------------
        {
          id: 'F2-1', title: 'Cousin Fraggle\'s Woods', map: 'riverWoods', enemyFaction: 'rae',
          star: {type: 'turns', n: 7, text: 'Win by the end of turn VII'},
          objective: {type: 'rout'}, maxDeploy: 6,
          deploy: [[4,0],[5,0],[3,1],[6,1],[4,1],[5,1],[2,1],[7,1]],
          brief: 'The rebels\' trail leads into the deep woods, and a patrol of Republic soldiers bars the way. Rout them.',
          enemies: () => [
            E('rfencer',3,3,4), E('rfencer',2,6,5), E('rlancer',3,7,8), E('rarcher',2,2,9,'guard'), E('rarcher',2,6,9,'guard'),
            E('radept',2,4,10,'guard'), E('rfighter',3,8,12),
          ],
          pre: [
            {card: "Chapter Two", sub: "The Black Frog"},
            {scene: "woods", place: "The Deep Woods"},
            {who: "narr", text: "The column marches after the rebels, into woods so thick that the sun comes down in pieces."},
            {who: "biggle", text: "These are cousin Fraggle's woods. Stay close to me when we meet him."},
            {who: "tiggle", text: "Fraggle Friggle? I barely remember him. He came to court once, when I was small."},
            {who: "biggle", text: "He bit a footman. Friggle gave him these woods the next week: as far from the court as a frog can be sent."},
            {who: "biggle", text: "He isn't well, Tiggle. Whatever he says, don't argue with him in front of his soldiers."},
            {who: "scout", text: "Your Highness! Rabbits in the trees! Rabbits in armour!"},
            {who: "tiggle", text: "Armour? Mine rabbits don't have armour."},
            {who: "biggle", text: "These aren't mine rabbits, little brother. That's the Republic."},
          ],
          post: [
            {who: "narr", text: "The rebel patrol breaks and scatters. From the trees comes slow, wet clapping."},
            {who: "fraggle", text: "Bravo! Bravo, cousins! You've unstitched some of my rabbits. I was saving those."},
            {who: "fraggle", text: "Look at you, Tiggle Taggle. All grown up. Has Friggle given you a crown yet? No? Never mind. He never gave me one either."},
            {who: "tiggle", text: "Cousin Fraggle. We're here for the rebel leader. The one they call Rae."},
            {who: "fraggle", text: "Oh, I know. Everyone knows. The little monster from the mines. I've got a plan for her. You'll love it. Everybody screams."},
            {who: "biggle", text: "Tiggle. Remember what I said."},
            {who: "tiggle", text: "He's smiling. Why is he smiling like that?", thought: true},
          ],
          reward: {res: 500},
        },

        // ---------------- Stage 2 ----------------
        {
          id: 'F2-2', title: 'The Bait', map: 'ravine', enemyFaction: 'rae',
          star: {type: 'noLosses', text: 'No one is unstitched'},
          objective: {type: 'boss'}, maxDeploy: 6,
          deploy: [[4,0],[3,0],[6,0],[5,1],[4,1],[1,1],[8,1],[5,0]],
          brief: 'A rebel column is crossing the ravine. On Fraggle\'s orders: pin it, and break its leader. Don\'t finish it. Fraggle\'s Black Guard hold the far end.',
          // Fraggle's Black Guard close the far end of the ravine; they fight on Tiggle's side, but on their own
          allies: () => [E('gpike',3,4,13,'guard'), E('gaxe',3,5,13,'guard'), E('gscribe',3,2,11,'guard'), E('gblade',3,7,11,'guard')],
          enemies: () => [
            E('rfighter',4,4,8,'hold',{boss: true, flees: true, key: 'patch', name: 'Patch', look: 'patch'}),
            E('rfencer',3,3,6), E('rfencer',3,6,6), E('rarcher',3,4,9,'guard'), E('radept',3,6,8,'guard'), E('rfighter',3,2,8),
            E('rlancer',3,7,10,'guard',{elite: true}),
          ],
          bossTalk: [
            {who: "patch", text: "Come on, then, frogs! I've only got the one eye, and it's on you!"},
            {who: "tiggle", text: "Surrender, and you won't be hurt."},
            {who: "patch", text: "Ha! Go and tell that to your cousin."},
          ],
          pre: [
            {scene: "warcamp", place: "Fraggle's Camp"},
            {who: "fraggle", text: "Here's the plan, cousins. The rebels are moving. Little columns on every road. We catch one."},
            {who: "tiggle", text: "And take them prisoner."},
            {who: "fraggle", text: "No, no, no. We catch one and we HOLD it. We make it squeal. Somebody always comes running when a rabbit squeals."},
            {who: "fraggle", text: "And when they run home again, we follow. Right to the burrow."},
            {who: "biggle", text: "\u2026It's a good plan. Ugly. But good."},
            {who: "tiggle", text: "It's using them as bait. Living bait.", thought: true},
            {who: "scout", text: "A column in the ravine! Led by a one-eyed rabbit!"},
            {who: "fraggle", text: "Pin them. Hurt them. Don't finish them. Not yet."},
          ],
          post: [
            {who: "narr", text: "The column falls back into the ravine, hemmed in on every side."},
            {who: "tiggle", text: "That's enough. They're beaten. Let them surrender."},
            {who: "fraggle", text: "Surrender? Nobody's surrendering, cousin. We're waiting. Listen."},
            {who: "narr", text: "From inside the ravine, rabbits shout for help. Fraggle Friggle closes his eyes and smiles, as if it were music."},
            {who: "fraggle", text: "Now we wait for the hero."},
          ],
          reward: {res: 550},
        },

        // ---------------- Stage 3 ----------------
        {
          id: 'F2-3', title: 'Following the Trail', map: 'republicCamp', enemyFaction: 'rae',
          requires: ['R2-2'], convergence: 'The Republic Camp',
          star: {type: 'bossBy', key: 'tiggle', text: '{lord} drives back Rae Rabbit himself'},
          objective: {type: 'boss'}, maxDeploy: 6,
          deploy: [[4,0],[5,0],[2,0],[7,0],[3,1],[5,1],[6,1],[1,1]],
          brief: 'The rescuers\' trail leads straight to the rebel camp. Break through the palisade and drive back their leader.',
          enemies: () => [
            E('captain',5,4,10,'hold',{boss: true, flees: true, key: 'rae', name: 'Rae Rabbit', look: 'rae'}),
            E('rlancer',3,3,7,'guard',{elite: true}), E('rlancer',3,6,7,'guard',{elite: true}), E('rarcher',3,2,9,'guard'), E('radept',3,7,9,'guard'),
            E('rfighter',3,4,8), E('rfencer',3,5,12), E('rfencer',3,1,11),
          ],
          bossTalk: [
            {who: "rae", text: "Turn back, prince. There's nothing in this camp but rabbits trying to live."},
            {who: "tiggle", text: "Then surrender, and they will."},
            {who: "rae", text: "Ask your cousin if that's true."},
          ],
          pre: [
            {scene: "woods", place: "The Rebel Trail \u00b7 Dusk"},
            {who: "narr", text: "The rabbits came, just as Fraggle said they would. And when they ran home, they left a road behind them that a blind frog could follow."},
            {who: "fraggle", text: "There! Their whole nest! Hundreds of them! Burn it, cousin! Burn it all!"},
            {who: "tiggle", text: "There are little ones in there. Old rabbits. They aren't soldiers."},
            {who: "fraggle", text: "They're rabbits. That's worse."},
            {who: "biggle", text: "Tiggle. The camp is the target. Take the camp. We'll deal with prisoners after."},
            {who: "tiggle", text: "Prisoners. He means prisoners. \u2026Doesn't he?", thought: true},
          ],
          post: [
            {who: "narr", text: "The rabbit leader falls back behind the palisade. The camp holds, for now."},
            {who: "fraggle", text: "She got away! You let her get away! I had the torches ready!"},
            {who: "fraggle", text: "Next time I won't wait for you, cousin. Next time, I'll do it myself."},
            {who: "biggle", text: "Cousin, calm yourself. The prince commands here."},
            {who: "fraggle", text: "The prince! Ha! The prince can't even burn a tent!"},
            {who: "tiggle", text: "She told me to ask him if it was true. I didn't need to.", thought: true},
          ],
          reward: {res: 550},
        },

        // ---------------- Stage 4: after Rae's victory on the hill ----------------
        {
          id: 'F2-3b', title: 'The Empty Hill', map: 'thornHill', enemyFaction: 'rae',
          requires: ['R2-4'], convergence: 'After the Hill',
          star: {type: 'noLosses', text: 'No one is unstitched'},
          objective: {type: 'rout'}, maxDeploy: 6,
          deploy: [[4,15],[5,15],[3,14],[6,14],[4,14],[5,14],[2,15],[7,15]],
          brief: 'Fraggle Friggle has vanished from his hill, and a Republic rearguard holds it. Clear them off, and find his trail.',
          enemies: () => [
            E('rfighter',4,4,0,'hold',{elite: true}), E('rlancer',4,3,1,'guard'), E('radept',4,5,1,'guard',{elite: true}), E('rarcher',4,2,2,'guard'),
            E('rarcher',4,7,2,'guard'), E('rfighter',4,5,3,'guard'), E('rfencer',3,4,5), E('rfencer',3,2,7), E('rlancer',3,8,7),
          ],
          pre: [
            {scene: "woods", place: "The Black Hill \u00b7 Morning"},
            {who: "narr", text: "The morning after the battle, Tiggle climbs Fraggle's hill. The cages hang open. The stakes are empty. Fraggle Friggle is gone."},
            {who: "biggle", text: "The rabbits beat him. Badly, by the look of it. And now he's run off to sulk somewhere."},
            {who: "scout", text: "Your Highness! Rebels on the hilltop! A rearguard, digging in!"},
            {who: "tiggle", text: "Rabbits. On our hill."},
            {who: "biggle", text: "Clear them off. Then we find our cousin, before he does something we'll all regret."},
            {who: "tiggle", text: "Before. As if he hasn't already.", thought: true},
          ],
          post: [
            {who: "narr", text: "The rearguard breaks and slips away down the far side of the hill."},
            {who: "scout", text: "Your Highness, tracks. Big ones. Frog. Heading east, into the deep hollows."},
            {who: "biggle", text: "That's Fraggle. Nobody else walks like that."},
            {who: "tiggle", text: "There's something with him. Small prints. Lots of them. Shuffling."},
            {who: "tiggle", text: "Rabbits. Old ones, by the look of it."},
            {who: "tiggle", text: "I have a very bad feeling about this.", thought: true},
          ],
          reward: {res: 550},
        },

        // ---------------- Stage 5 ----------------
        {
          id: 'F2-4', title: 'Cousin', map: 'hollow', enemyFaction: 'frog', enemyLine: 'FRAGGLE\'S GUARD ATTACKS',
          star: {type: 'noLosses', text: 'No one is unstitched'},
          objective: {type: 'boss'}, maxDeploy: 6,
          deploy: [[4,11],[5,11],[3,11],[6,11],[4,10],[5,10],[2,11],[7,11]],
          // solo: only Tiggle starts; the team you pick arrives when Fraggle falls (the twist)
          solo: true, mustDeploy: ['biggle'],
          prepNote: 'Tiggle Taggle faces Fraggle Friggle alone. The team you pick arrives once the duel is over. Biggle Baggle must come.',
          brief: 'Fraggle Friggle has found the rabbits who were left behind. Stop him.',
          enemies: () => [E('marshlord',4,4,4,'charge',{boss: true, key: 'fraggle', name: 'Fraggle Friggle', look: 'fraggle'})],
          bossTalk: [
            {who: "fraggle", text: "You? YOU? You'd raise a sword to family, over a few old rabbits?"},
            {who: "tiggle", text: "I'd raise it to anyone who'd do this."},
            {who: "fraggle", text: "Then come on, little cousin! Let's see what Friggle's favourite is made of!"},
          ],
          twist: {on: 'boss', arrive: true, objective: {type: 'rout'}, popup: 'Fraggle\'s guard!', talk: [
              {who: "narr", text: "Fraggle Friggle falls, and doesn't get up. For a moment, the hollow is silent."},
              {who: "narr", text: "Then footsteps. Biggle and the rest of Tiggle's column come crashing through the trees. And behind them, Fraggle's own guard."},
              {who: "biggle", text: "Tiggle! What happened here?"},
              {who: "tiggle", text: "He\u2026 he drew on me. He said the King was weak. He was going to take the woods, and then the crown. A coup. I defended myself."},
              {who: "biggle", text: "I knew it. I knew he'd turn. Are you hurt, little brother?"},
              {who: "tiggle", text: "He believed me. He didn't even ask.", thought: true},
              {who: "guard", text: "Liar! We heard him! He was after the rabbits, not the crown! The prince murdered our lord!"},
              {who: "guard", text: "Take them! Take all of them!"},
              {who: "biggle", text: "Form up! Protect the prince!"},
            ], units: [
            E('gpike',4,0,4), E('gaxe',4,9,4), E('gscribe',4,4,0), E('gblade',4,1,2,'charge',{elite: true}), E('gpike',4,5,1,'charge',{elite: true}),
            E('gscribe',4,8,2), E('gaxe',4,3,3), E('gchaplain',4,6,1),
          ]},
          pre: [
            {scene: "woods", place: "The Hollow \u00b7 Evening"},
            {who: "narr", text: "Tiggle follows the tracks for two days. At last he finds Fraggle Friggle, in a hollow deep in the woods."},
            {who: "narr", text: "He isn't alone. Huddled against the roots are rabbits: the old, the sick, the slow. The ones who couldn't run with the rest."},
            {who: "elder", text: "Please. We can't fight. We were only left behind."},
            {who: "fraggle", text: "Cousin! Look what I found! The ones they couldn't be bothered to carry."},
            {who: "fraggle", text: "She cost me my hill. So I'll cost her these."},
            {who: "tiggle", text: "Fraggle, no. They're old. They're no danger to anyone."},
            {who: "fraggle", text: "Everyone's a danger. That's the secret, cousin. Everyone."},
            {who: "tiggle", text: "The King would never\u2014"},
            {who: "fraggle", text: "The King sent me out here so he'd never have to watch! Don't you see? This is what he wants. He just doesn't want to see it."},
            {who: "tiggle", text: "There's no one else here. No one to stop him. No one but me.", thought: true},
            {who: "tiggle", text: "Step away from them, Fraggle. I'll only ask once."},
            {who: "fraggle", text: "Ha! And if I don't?"},
            {who: "tiggle", text: "Then I'll make you."},
          ],
          post: [
            {who: "narr", text: "When it's over, frogs lie among the roots of the hollow. Green, and green. Not one rabbit among them."},
            {who: "narr", text: "The old rabbits are gone. Somewhere in the confusion, they slipped away into the dark."},
            {who: "biggle", text: "It's done. When we tell Friggle about the coup, he'll thank you. You saved the crown today."},
            {who: "tiggle", text: "\u2026Yes."},
            {who: "tiggle", text: "I lied to my brother. I killed my cousin. I made frogs fight frogs.", thought: true},
            {who: "tiggle", text: "And the rabbits are alive. Was that right? I don't know. I don't know what right is any more.", thought: true},
            {who: "tiggle", text: "But I know whose fault it is. Before her, I knew exactly who I was.", thought: true},
            {who: "tiggle", text: "Rae Rabbit. This is all your fault."},
            {card: "End of Chapter Two", sub: "The Black Frog"},
          ],
          reward: {res: 600, tokens: 6},
        },
      ]},
      {id: 'FC3', title: 'Chapter Three', name: 'The Governess', enemyMods: {mhp: -1}, stages: [

        // ---------------- Stage 1 ----------------
        {
          id: 'F3-1', title: 'Into Monkeyland', map: 'meadowEdge', enemyFaction: 'rae',
          star: {type: 'turns', n: 7, text: 'Win by the end of turn VII'},
          objective: {type: 'rout'}, maxDeploy: 7,
          deploy: [[4,0],[5,0],[3,1],[6,1],[2,1],[7,1],[4,1],[5,1]],
          brief: 'The rebels have slipped out of the forest into Monkeyland, and left a rearguard in the meadows behind them. Rout it.',
          enemies: () => [
            E('rfighter',4,4,8,'guard',{elite: true}), E('rlancer',4,2,7,'guard'), E('rlancer',4,7,7,'guard'), E('rarcher',4,3,10,'guard'),
            E('rarcher',4,6,10,'guard'), E('radept',4,5,11,'guard'), E('rfencer',4,1,5), E('rfencer',4,8,5), E('rfighter',4,4,12),
          ],
          pre: [
            {card: 'Chapter Three', sub: 'The Governess'},
            {scene: 'woods', place: 'The Edge of the Woods'},
            {who: 'narr', text: 'A letter comes from the court, sealed in green wax. Biggle reads it aloud.'},
            {who: 'biggle', text: '"The King thanks his youngest brother for uncovering Fraggle Friggle\'s treason. The matter is closed. It will not be spoken of again."'},
            {who: 'biggle', text: '"Follow the rebels into Monkeyland. The Governess will give you every monkey you need." …Well. There you are, little brother. A hero.'},
            {who: 'tiggle', thought: true, text: 'A hero. For a lie. And nobody will ever ask.'},
            {who: 'tiggle', text: 'Monkeyland. I\'ve only ever seen it on maps. What are they like, the monkeys?'},
            {who: 'biggle', text: 'Loyal. Very loyal. They were a kingdom once, before great-great-grandfather. These days they\'re the best border guards we have.'},
            {who: 'tiggle', text: 'Loyal because they want to be?'},
            {who: 'biggle', text: '…That\'s not the sort of question a prince asks out loud, Tiggle.'},
            {who: 'scout', text: 'Your Highness! Rebels in the meadows! A rearguard, holding the way out of the woods!'},
          ],
          post: [
            {who: 'narr', text: 'The rearguard breaks and runs east into the flowers. Out of the blossom trees comes a party of monkeys, a monkey in a circlet of gold petals at their head.'},
            {who: 'narr', text: 'She kneels in the grass before Tiggle. Every monkey behind her kneels too, all at once, as if they\'d practised it.'},
            {who: 'aurora', text: 'Your Highness. Monkeyland welcomes the King\'s brother. Everything we have is yours.'},
            {who: 'speshul', text: 'Is it true you beat the black frog? All on your own? With everyone watching?'},
            {who: 'aurora', text: 'Speshul!'},
            {who: 'tiggle', text: '…Nobody was watching.'},
            {who: 'tiggle', thought: true, text: 'She kneels like someone who has done it every day of her life. Like it hurts, every time.'},
          ],
          reward: {res: 600},
        },

        // ---------------- Stage 2: the hunt, with Speshul ----------------
        {
          id: 'F3-2', title: 'The Hunt', map: 'blossomFields', enemyFaction: 'rae',
          star: {type: 'allies', text: 'No ally falls'},
          objective: {type: 'boss'}, maxDeploy: 7,
          deploy: [[4,15],[5,15],[3,14],[6,14],[2,15],[7,15],[4,14],[5,14]],
          brief: 'Hunt down a Republic band in the flower fields, with the Governess\'s hunters beside you, and the Governess\'s son.',
          prepNote: 'The monkey hunters fight beside you, on their own (blue coasters). If Speshul is beaten, he runs home to his mother.',
          allies: () => [
            E('heir',5,4,12,'charge',{key: 'speshul', name: 'Speshul', look: 'speshul', flees: true, bonus: {mhp: 6, def: 2}}),
            E('mkacro',4,1,13,'charge',{key: 'ally', name: 'Hunter Plum'}), E('mkthrow',4,7,13,'charge',{key: 'ally', name: 'Hunter Quince'}),
            E('mkguard',4,8,12,'charge',{key: 'ally', name: 'Hunter Date'}),
          ],
          enemies: () => [
            E('rfighter',5,4,1,'hold',{boss: true, elite: true, flees: true, key: 'burr', name: 'Burr'}),
            E('rlancer',5,3,3,'guard'), E('rlancer',5,6,3,'guard'), E('rarcher',5,1,2,'guard'), E('rarcher',5,8,2,'guard'),
            E('rfencer',5,2,7), E('rfencer',5,7,7), E('radept',5,5,5,'guard'), E('rfighter',5,4,9),
          ],
          events: [{turn: 2, talk: [
            {who: 'speshul', text: 'Your Highness, look at them. They\'re not fighting to win. They\'re fighting to get away.'},
            {who: 'tiggle', thought: true, text: 'He\'s right. I wish he weren\'t.'},
          ]}],
          bossTalk: [
            {who: 'burr', text: 'Monkeys hunting rabbits for frogs! What did they ever give you, eh?'},
            {who: 'speshul', text: '…'},
          ],
          pre: [
            {scene: 'monkeyland', place: 'The Governess\'s Hunting Lodge'},
            {who: 'aurora', text: 'My best hunters are yours, Your Highness. And one more. My son.'},
            {who: 'tiggle', text: 'Your son? Governess, it\'ll be dangerous.'},
            {who: 'aurora', text: 'He reads too many books about the old days. He thinks the world is full of glory. He needs to see what it is really like, at the side of the King\'s brother.'},
            {who: 'aurora', text: 'Show him, Your Highness. And bring him back to me.'},
            {who: 'speshul', text: 'I\'ll be no trouble! I can climb anything. Ask anyone. Ask Captain Tamarind. He says I\'m a menace.'},
            {who: 'biggle', thought: true, text: 'Wonderful. A nursery outing.'},
          ],
          post: [
            {who: 'narr', text: 'The Republic sergeant crashes away through the blossom, bleeding stuffing, and the rest of his band scatters after him.'},
            {who: 'speshul', text: 'Your Highness? Why are we hunting them? They didn\'t do anything to us.'},
            {who: 'tiggle', text: 'They broke the King\'s law.'},
            {who: 'speshul', text: 'So did we, once. In the books. Before.'},
            {who: 'tiggle', thought: true, text: 'Before the frogs. He means before us.'},
          ],
          reward: {res: 600},
        },

        // ---------------- Stage 3: the granary runners ----------------
        {
          id: 'F3-3', title: 'The Granary', map: 'blossomFields', enemyFaction: 'rae',
          requires: ['R3-3'], convergence: 'After the Flower Fields',
          star: {type: 'catch', n: 5, text: 'Catch at least five grain runners'},
          objective: {type: 'intercept', who: 'grain runners', dest: 'the woods'}, maxDeploy: 7,
          exits: [[0,15],[2,15],[4,15],[6,15],[8,15]],
          deploy: [[4,6],[5,6],[3,7],[6,7],[1,7],[8,7],[4,8],[5,8]],
          brief: 'In the night, rebels raided the monkeys\' granary. Their runners are carrying the winter\'s grain south. Catch as many as you can.',
          prepNote: 'The grain runners don\'t stop to fight: they run for the gold squares. Eight in all. The battle ends once they\'re all caught or gone.',
          enemies: () => [
            ...[[2,0],[5,1],[7,0]].map(([x, y]) => E('runner',5,x,y,'courier',{courier: true, name: 'Grain Runner', bonus: {mov: -2}})),
            E('rlancer',5,3,10,'guard'), E('rlancer',5,6,10,'guard'), E('rfencer',5,1,12), E('rarcher',5,8,12,'guard'),
          ],
          reinforce: () => [
            {turn: 1, units: [[1,0],[4,0],[8,1]].map(([x, y]) => E('runner',5,x,y,'courier',{courier: true, name: 'Grain Runner', bonus: {mov: -2}}))},
            {turn: 2, units: [E('runner',5,3,0,'courier',{courier: true, name: 'Grain Runner', bonus: {mov: -2}}), E('runner',5,6,0,'courier',{courier: true, name: 'Grain Runner', bonus: {mov: -2}}), E('rfighter',5,5,0)]},
          ],
          pre: [
            {scene: 'monkeyland', place: 'The Granary · Dawn'},
            {who: 'narr', text: 'The night attack on the rebel camp failed. The rabbits held. And while the monkeys were busy, other rabbits found the granary.'},
            {who: 'aurora', text: 'That was the winter\'s grain. For the whole of the eastern meadows.'},
            {who: 'tiggle', text: 'Then we get it back.'},
            {who: 'speshul', text: 'They\'re hungry, Your Highness. That\'s all. They\'re only hungry.'},
            {who: 'aurora', text: 'So will we be, by midwinter. Go with the prince, Speshul.'},
          ],
          post: [
            {who: 'narr', text: 'Sacks of grain lie in the grass where the runners dropped them.'},
            {who: 'speshul', text: 'One of them was so small. Smaller than the sack.'},
            {who: 'tiggle', thought: true, text: 'Rae\'s people are starving, and the Governess\'s people will starve if they win. Everyone in this is hungry except the King.'},
            {who: 'scout', text: 'Your Highness! The rabbits! They\'ve turned around. They\'re marching on the castle!'},
            {who: 'biggle', text: 'On the castle? Are they mad?'},
            {who: 'tiggle', text: 'No. She\'s going to ask.'},
          ],
          reward: {res: 650},
        },

        // ---------------- Stage 4: back to the castle ----------------
        {
          id: 'F3-4', title: 'Rabbits at the Gate', map: 'castleGate', enemyFaction: 'rae',
          requires: ['R3-4'], convergence: 'The Castle',
          star: {type: 'bossBy', key: 'tiggle', text: '{lord} drives back Patch himself'},
          objective: {type: 'boss'}, maxDeploy: 7,
          deploy: [[4,14],[5,14],[3,13],[6,13],[2,14],[7,14],[4,15],[5,15]],
          brief: 'The rabbits have forced the castle gate, and the Governess is inside with them. Take the gate back. The castle\'s monkeys fight beside you.',
          allies: () => [E('mkguard',5,2,10,'charge',{key: 'ally', name: 'Gate Guard'}), E('mkthrow',5,7,10,'charge',{key: 'ally', name: 'Wall Thrower'})],
          enemies: () => [
            E('rfighter',6,4,2,'hold',{boss: true, elite: true, flees: true, key: 'patch', name: 'Patch', look: 'patch'}),
            E('rlancer',6,5,2,'guard'), E('rarcher',6,1,1,'guard'), E('rarcher',6,8,1,'guard'), E('radept',6,4,0,'guard'),
            E('rlancer',5,4,4,'guard',{elite: true}), E('rfencer',6,2,7), E('rfencer',6,7,7), E('rfighter',6,5,8),
          ],
          bossTalk: [
            {who: 'patch', text: 'Sorry, prince! The Commander\'s busy. Leave a message!'},
            {who: 'tiggle', text: 'Get out of my way, rabbit.'},
            {who: 'patch', text: 'Can\'t. I promised. And I\'ve only got the one eye, so I\'ve got to keep the promises I make.'},
          ],
          pre: [
            {scene: 'castlegate', place: 'The Governess\'s Castle'},
            {who: 'narr', text: 'Tiggle\'s column runs the last mile to the castle. The drawbridge is down. There are rabbits on the walls.'},
            {who: 'tamarind', text: 'Your Highness! They forced the gate! Rae Rabbit is in the great hall, with the Governess!'},
            {who: 'biggle', text: 'In the hall. With the frogs\' own envoy. That rabbit has nerve, I\'ll give her that.'},
            {who: 'tiggle', text: 'Take the gate back. Then I\'m going to that hall.'},
          ],
          post: [
            {who: 'narr', text: 'The one-eyed rabbit falls back through the courtyard, shouting for his soldiers.'},
            {who: 'patch', text: 'Inside, lads! Inside! Tell the Commander the prince is coming!'},
            {who: 'tiggle', text: 'Biggle. Hold the gate. I\'m going in.'},
            {who: 'biggle', text: 'Not alone you\'re not.'},
          ],
          reward: {res: 650},
        },

        // ---------------- Stage 5: betrayal in the hall; fight your way out ----------------
        {
          id: 'F3-5', title: 'Betrayal', map: 'castleHall', enemyFaction: 'rae',
          requires: ['R3-5'], convergence: 'The Great Hall',
          star: {type: 'noLosses', text: 'No one is unstitched'},
          objective: {type: 'escape', dest: 'the castle doors (the gold squares)'}, maxDeploy: 7,
          exits: [[4,15],[5,15]],
          deploy: [[4,1],[5,1],[3,1],[6,1],[4,2],[5,2],[3,3],[6,3]],
          brief: 'The great hall has turned against you. Fight your way out of the castle: get Tiggle to the doors.',
          prepNote: 'The battle is won as soon as Tiggle Taggle reaches the castle doors (the gold squares). The monkey guards beside you… may not stay beside you.',
          allies: () => [E('mkguard',6,2,4,'guard',{key: 'ally', name: 'Hall Guard', defects: true}), E('mkguard',6,7,4,'guard',{key: 'ally', name: 'Hall Guard', defects: true}),
                         E('mkacro',6,1,6,'guard',{key: 'ally', name: 'Hall Acrobat', defects: true}), E('mkthrow',6,8,6,'guard',{key: 'ally', name: 'Hall Thrower', defects: true})],
          enemies: () => [
            E('heir',6,4,9,'guard',{key: 'speshul', name: 'Speshul', look: 'speshul', flees: true, talk: [
                {who: 'speshul', text: 'I\'m sorry, Your Highness. I liked you. I really did.'},
                {who: 'tiggle', text: 'Then why?'},
                {who: 'speshul', text: 'Because you\'d never have let us stand up. Not really. Not even you.'},
              ]}),
            E('rfencer',6,3,11), E('rfencer',6,6,11), E('rlancer',6,4,13,'guard'), E('rlancer',6,5,13,'guard'),
            E('rarcher',6,2,9,'guard'), E('rarcher',6,7,9,'guard'), E('mkacro',6,1,12,'charge',{faction: 'monkey'}), E('mkbrute',6,8,12,'charge',{faction: 'monkey'}),
          ],
          events: [{turn: 2, defect: true, popup: 'Betrayal!', talk: [
            {who: 'monkey', text: 'Sorry, Your Highness. He\'s our prince. Not you.'},
            {who: 'tiggle', text: '…What?'},
            {who: 'biggle', text: 'Betrayal! Protect the prince! Get him to the doors!'},
          ]}],
          pre: [
            {scene: 'castle', place: 'The Great Hall'},
            {who: 'narr', text: 'Tiggle reaches the great hall by the side stair, with the Governess\'s own guard around him. He is too late.'},
            {who: 'narr', text: 'The envoy is gone. Rae Rabbit is gone. And standing in the middle of the hall, with half the castle guard at his back, is Speshul.'},
            {who: 'aurora', text: 'Your Highness. I did not invite them. I refused them. I swear it.'},
            {who: 'speshul', text: 'She did. I didn\'t.'},
            {who: 'tiggle', text: 'Speshul. Come here. Come away from them, and we\'ll forget this happened.'},
            {who: 'speshul', text: 'That\'s what frogs always say. That\'s what you said to Mother, three hundred years ago.'},
            {who: 'narr', text: 'Around Tiggle, the monkeys of the guard shift on their feet, and look at one another.'},
          ],
          post: [
            {who: 'narr', text: 'Tiggle\'s column bursts out of the castle doors into the daylight, bruised and torn and furious.'},
            {who: 'tiggle', text: 'They turned on us. The monkeys. They\'ve served us for centuries, and they turned on us in an instant.'},
            {who: 'biggle', text: 'Served, little brother. Not loved. Never loved. I thought you knew.'},
            {who: 'narr', text: 'Behind them comes the Governess, and with her, the monkeys who stayed.'},
            {who: 'aurora', text: 'Your Highness. Not all of us. Not all of us.'},
          ],
          reward: {res: 650},
        },

        // ---------------- Stage 6: the schism; Aurora's bargain ----------------
        {
          id: 'F3-6', title: 'The Schism', map: 'schismField', enemyFaction: 'monkey',
          star: {type: 'noLosses', text: 'No one is unstitched'},
          objective: {type: 'boss'}, maxDeploy: 7,
          deploy: [[4,1],[5,1],[3,0],[6,0],[2,1],[7,1],[4,0],[5,0]],
          brief: 'The monkeys who followed Speshul are crossing the stream with the rebels. Stop them, and drive Speshul back. The Governess fights beside you.',
          prepNote: 'Aurora and the monkeys who stayed loyal fight beside you, on their own (blue coasters). Aurora must not fall.',
          allies: () => [E('governess',6,4,3,'guard',{key: 'aurora', name: 'Aurora', look: 'aurora', vip: true, bonus: {mhp: 6, def: 2}}),
                         E('mkguard',6,2,3,'charge',{key: 'ally', name: 'Loyal Guard'}), E('mkchant',6,6,3,'charge',{key: 'ally', name: 'Loyal Chanter'})],
          enemies: () => [
            E('heir',8,4,12,'hold',{boss: true, elite: true, flees: true, key: 'speshul', name: 'Speshul', look: 'speshul'}),
            E('mkguard',7,2,9,'guard'), E('mkguard',7,7,9,'guard'), E('mkthrow',7,3,11,'guard'), E('mkthrow',7,6,11,'guard'),
            E('mkacro',7,1,7), E('mkacro',7,8,7), E('mkbrute',7,4,8),
            E('rlancer',7,2,13,'guard',{faction: 'rae'}), E('rarcher',7,7,13,'guard',{faction: 'rae'}),
          ],
          reinforce: () => [{turn: 3, units: [E('mkacro',7,0,10), E('mkacro',7,9,10), E('rfencer',7,4,15,'charge',{faction: 'rae'})]}],
          bossTalk: [
            {who: 'speshul', text: 'You let them hunt us with you! You let them kneel! You\'re no better than the rest of the frogs!'},
            {who: 'tiggle', text: 'I am a frog, Speshul. I\'m trying to be a better one. It\'s harder than it looks.'},
          ],
          pre: [
            {scene: 'monkeyland', place: 'The Stream Below the Castle · Morning'},
            {who: 'narr', text: 'At the stream below the castle, Monkeyland splits in two.'},
            {who: 'aurora', text: 'Your Highness. Let me come with you. He is my son.'},
            {who: 'tiggle', text: 'He\'s leading a rebellion against the Friggliarchy, Governess.'},
            {who: 'aurora', text: 'I know what he is doing. I know what the King does to rebels. I have seen it.'},
            {who: 'aurora', text: 'So I will ask you for one thing. When this is over, whatever he has done: clemency. For my son. Spare him.'},
            {who: 'aurora', text: 'Promise me that, and I will serve you. Me, and every monkey who stayed. For as long as I am stitched.'},
            {who: 'tiggle', thought: true, text: 'The King would never allow it. The King doesn\'t need to know.'},
            {who: 'tiggle', text: '…You have my word, Aurora. Speshul will be spared.'},
          ],
          post: [
            {who: 'narr', text: 'Speshul falls back across the stream with the rabbits. On the far bank, he turns, and looks back at his mother, for a long time.'},
            {who: 'narr', text: 'Then he is gone, and four hundred monkeys with him.'},
            {who: 'aurora', text: 'Centuries of peace. And it ends at a stream, on a sunny morning, with everyone shouting.'},
            {who: 'tiggle', text: 'It isn\'t over, Aurora. I meant what I said. Whatever happens, he\'ll be spared.'},
            {who: 'aurora', text: 'I know. That is why I am still here.'},
            {who: 'biggle', text: 'Half of Monkeyland, gone over to the rebels in a day. Friggle will be… displeased.'},
            {who: 'tiggle', thought: true, text: 'She didn\'t take them, Rae Rabbit. She didn\'t steal anything. She asked, and they went.'},
            {who: 'tiggle', thought: true, text: 'Nobody ever asked them before. Not once. Not us.'},
            {card: 'End of Chapter Three', sub: 'The Governess'},
          ],
          reward: {res: 700, tokens: 6, joins: ['aurora']},
        },
      ]},
      {id: 'FC4', title: 'Chapter Four', name: 'Still to be written', stub: true, brief: 'Still to be written.'},
    ],
  },
};

// Flatten chapters into one ordered list of stages per campaign. A stub chapter becomes one placeholder stage.
for (const camp of Object.values(CAMPAIGNS)){
  camp.stages = camp.chapters.flatMap((c, ci) => c.stub
    ? [{id: c.id + '-stub', title: c.name, stub: true, brief: c.brief, requires: c.requires, chapter: c, ci, si: 0}]
    : [...c.stages.map((s, si) => Object.assign(s, {chapter: c, ci, si})),
       // more: a chapter that's only partly written ends with a placeholder
       ...(c.more ? [{id: c.id + '-more', title: 'To be continued', stub: true, brief: c.more, chapter: c, ci, si: c.stages.length}] : [])]);
}
for (const camp of Object.values(CAMPAIGNS)) camp.sides = [];   // filled by 28-data-sides.js

// Recommended average level for a stage: the enemies' average level (an elite counts a level higher, a boss two),
// across everyone who will take the field (reinforcements and twists too), less however many levels' worth
// the chapter's enemyMods take off them. Each extra enemy beyond twice your deployment adds a little pressure.
function recommendedLevel(sg){
  if (sg.stub) return null;
  const units = [...(sg.enemies ? sg.enemies({}) : []), ...(sg.reinforce ? sg.reinforce({}).flatMap(r => r.units) : []), ...(sg.twist?.units || [])];
  if (!units.length) return null;
  const avg = units.reduce((a, u) => a + u.lv + (u.elite ? 1 : 0) + (u.boss ? 2 : 0), 0)/units.length;
  const crowd = Math.max(0, units.length - 2*sg.maxDeploy)*.25;
  // a level is worth about 2.3 stat points (HP counted at half): turn the chapter's weakening into levels
  const weak = Object.entries(sg.enemyMods || sg.chapter.enemyMods || {}).reduce((t, [k, v]) => t - v*(k === 'mhp' ? .5 : 1), 0)/2.3;
  return Math.max(1, Math.round(avg + crowd - weak));
}
