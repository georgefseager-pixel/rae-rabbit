// ================= Side Stories: the tournament (Chapter Four's Friggliarchy characters) =================
// Same format as 28-data-sides.js. Tilly Tealbottom joins after Chapter Four (Champions of the Lists), so her set runs on
// the same line as the pirates' (recommended 9 · 11 · 11). Her second story is a flashback to last season.

Object.assign(SIDE_SETS, {
  tilly: {camp: 'frog', title: 'Do Come Closer', about: 'How the Lily Court\'s best lancer came to fight with a pirate\'s hook, and the pirate great-great-grandmother her mother keeps behind a curtain.',
    quests: [
      {
        id: 'TL-1', title: 'The Garden Party', map: 'royalPark', enemyFaction: 'rae', lead: 'tilly', ban: ['tiggle'], enemyMods: {},
        teaser: 'Tilly has gone home for her mother\'s spring garden party, and a gang of bandits has picked the same afternoon to rob the house.',
        star: {type: 'turns', n: 6, text: 'Win by the end of turn VI'},
        objective: {type: 'boss'}, maxDeploy: 5,
        deploy: [[4,15],[5,15],[3,14],[6,14],[4,14]],
        brief: 'Bandits have come over the hedges of the Tealbottom gardens. Drive off their leader before they make off with the silver. Tilly must not fall.',
        prepNote: 'Tilly leads (the battle is lost if she falls). Tiggle stays at the war camp. Her hook pulls bandits out of the topiary and off the fountains, and leaves them Off Balance for whoever strikes next.',
        enemies: () => [
          E('captain',10,4,2,'hold',{boss: true, flees: true, key: 'magpie', name: 'Magpie', look: 'workerBig', fur: 'chocolate'}),
          E('runner',9,2,4), E('runner',9,7,4), E('digger',9,3,8,'guard'), E('digger',9,6,8,'guard'),
          E('pebbler',9,1,1,'guard'), E('pebbler',9,8,1,'guard'), E('hauler',9,5,5), E('runner',9,0,7),
        ],
        bossTalk: [
          {who: "magpie", text: "Look at this, lads. A frog in pearls, on a pony. Hand over the silver, love, and nobody gets hurt."},
          {who: "tilly", text: "You've frightened my mother's guests, and you're standing in her begonias. Do come closer, darling. I'd like a word."},
        ],
        pre: [
          {scene: "court", place: "The Tealbottom Gardens · Side Story"},
          {who: "narr", text: "It is the afternoon of the Tealbottom spring garden party. Forty frogs in large hats are drinking lemonade on the lawn."},
          {who: "ladyteal", text: "Matilda, put that hook down and go and talk to Sir Reginald Pondsworth. He is a very suitable frog."},
          {who: "tilly", text: "I have talked to him, Mother. He spent half an hour telling me about his hat, and didn't ask me a single thing. I'd rather hold the hook."},
          {who: "narr", text: "Someone screams in the rose garden. Big rabbits with sacks are climbing over the hedges."},
          {who: "ladyteal", text: "Bandits! In the begonias! Somebody fetch the guards!"},
          {who: "tilly", text: "There's no time to fetch anyone, Mother. Biscuit! Gardeners, footmen, anyone who can hold a rake, come with me!"},
        ],
        post: [
          {who: "narr", text: "Magpie's gang scrambles back over the hedges, leaving the silver and their sacks behind."},
          {who: "magpie", text: "Nobody told us there'd be a frog with a hook!"},
          {who: "ladyteal", text: "Matilda. You pulled a bandit through the fountain in front of all my guests. Sir Reginald fainted."},
          {who: "tilly", text: "I'm sorry about Sir Reginald, Mother. I'm not sorry about the bandit. They'd have taken the silver, and your guests' pearls with it."},
          {who: "ladyteal", text: "That is not how a Tealbottom behaves. But the guests are safe, and so is the silver. Thank you, Matilda."},
        ],
        reward: sideReward(0),
      },
      {
        id: 'TL-2', title: 'Last Season', map: 'cove', enemyFaction: 'pirate', lead: 'tilly', flashback: true, enemyMods: {},
        teaser: 'Tilly has promised Tiggle the story of where she got her hook, over tea.',
        star: {type: 'noLosses', text: 'No one is unstitched'},
        objective: {type: 'boss'}, maxDeploy: 5,
        deploy: [[4,14],[5,14],[3,13],[6,13],[2,14]],
        brief: 'Last season. Pirates have raided the Tealbottom summer house on the coast, and a lance is no use at all on a jetty. Drive off their captain. Tilly must not fall.',
        prepNote: 'Last season: only Tilly and ordinary soldiers can come. The pirates have Grapplers too, and their hooks pull your units in just as Tilly\'s do.',
        enemies: () => [
          E('sharkcapt',12,4,2,'hold',{boss: true, flees: true, key: 'mako', name: 'Captain Mako', look: 'mako', fur: 'mako'}),
          E('phook',10,3,4,'guard'), E('phook',10,6,4,'guard'), E('pgunner',10,2,3,'guard'), E('psawbones',10,7,3,'guard'),
          E('pcutlass',10,3,7), E('pcutlass',10,6,7), E('pboarder',11,4,9,'charge',{elite: true}), E('pharpoon',10,1,9), E('pcutlass',10,8,9),
        ],
        reinforce: () => [{turn: 3, units: [E('phook',10,1,3), E('pcutlass',10,8,3)]}],
        bossTalk: [
          {who: "mako", text: "A lady frog with one of my crew's hooks? Where did you get that, sweetheart?"},
          {who: "tilly", text: "Your crew threw it at me, and I've decided to keep it. Now take your pirates off my family's beach."},
        ],
        pre: [
          {scene: "court", place: "The War Camp · Now"},
          {who: "tiggle", text: "You promised me the story of the hook."},
          {who: "tilly", text: "So I did, darling. Pour yourself some tea. I took it off a pirate."},
          {scene: "shore", place: "The Tealbottom Summer House · Last Season"},
          {who: "narr", text: "Last season, at the Tealbottom summer house on the coast. Tilly, unbeaten in eleven tournaments, is practising with her lance on the lawn."},
          {who: "narr", text: "A grey ship drops anchor in the bay. Longboats run up the beach, and pirates swing hooks on ropes at the house staff, dragging them off the jetty steps one by one."},
          {who: "tilly", text: "Footmen, get everyone up to the house! Anyone who can hold a sword, with me!"},
          {who: "narr", text: "Her lance breaks on the first pirate she meets. A Grappler's hook comes spinning across the sand and lands at her feet. Tilly drops what is left of her lance and picks up the hook."},
          {who: "tilly", text: "Right. Let's see how this works."},
        ],
        post: [
          {who: "narr", text: "Captain Mako's longboats row hard back to the grey ship. On the beach, the house staff pick themselves up and stare at the young lady of the house."},
          {who: "narr", text: "She is standing at the end of the jetty in a torn gown, with a pirate's hook in her hand, laughing."},
          {scene: "court", place: "The War Camp · Now"},
          {who: "tilly", text: "I never picked up a lance again. Mother was appalled, and the Lily Court decided I'd gone mad."},
          {who: "tiggle", text: "Why were you laughing?"},
          {who: "tilly", text: "Because for eleven years I'd waited for my opponents to come to me, and that afternoon I went after them instead. It was the best I've ever felt. I wasn't going to give that up for a lance."},
        ],
        reward: sideReward(1),
      },
      {
        id: 'TL-3', title: 'Bess Tealbottom', map: 'lighthouse', enemyFaction: 'pirate', mustDeploy: ['tilly'], enemyMods: {},
        teaser: 'A portrait hangs behind a curtain at the end of the Tealbottom gallery. Tilly has finally pulled the curtain back.',
        star: {type: 'bossBy', key: 'tilly', text: 'Tilly drives off Old Wrasse herself'},
        objective: {type: 'boss'}, maxDeploy: 7,
        deploy: [[4,14],[5,14],[3,13],[6,13],[2,14],[7,14],[4,15]],
        brief: 'Smugglers hold the old tower on the point, where Bess Tealbottom the pirate is said to have hidden her treasure. Cross the causeway and drive off Old Wrasse. Tilly must come.',
        prepNote: 'Tilly must come. The causeway to the tower is only two squares wide, and smugglers with hooks wait at the far end to pull your units in among their friends. They like to pick on readers, who can\'t strike back once pulled. Bows beat hooks.',
        enemies: () => [
          E('sharkcapt',12,4,1,'hold',{boss: true, flees: true, key: 'wrasse', name: 'Old Wrasse', look: 'mako', fur: 'tiger'}),
          E('phook',11,3,2,'guard'), E('phook',11,6,2,'guard'), E('psawbones',11,5,1,'guard'), E('pgunner',11,4,3,'guard'),
          E('pcutlass',11,1,7), E('pboarder',11,7,7), E('phook',11,8,8,'guard'), E('pgunner',11,3,10,'guard'), E('pcutlass',11,0,6),
        ],
        bossTalk: [
          {who: "wrasse", text: "Bess Tealbottom's tower, and Bess Tealbottom's gold, and here comes a Tealbottom in a fancy hat to ask for it back."},
          {who: "tilly", text: "I haven't come for the gold, darling. I've come to see what she left behind. Now get out of her tower."},
        ],
        pre: [
          {scene: "court", place: "The Tealbottom Gallery · Side Story"},
          {who: "narr", text: "The long gallery of the Tealbottom house is lined with portraits of teal frogs in ruffs and pearls."},
          {who: "narr", text: "At the far end, behind a curtain, hangs one more: a teal frog in a sea-captain's coat, holding a hook where the others hold fans."},
          {who: "tilly", text: "“Bess Tealbottom, Scourge of the Satin Sea.” Mother, who is this?"},
          {who: "ladyteal", text: "Your great-great-grandmother, and the family's disgrace. She robbed the King's tax ships for thirty years, and bought our title with what she stole."},
          {who: "tilly", text: "Our title? We're Tealbottoms because of a pirate?"},
          {who: "ladyteal", text: "We do not talk about her, Matilda. That is why the curtain is there."},
          {who: "tilly", text: "Well, I want to know about her. The old tower out on the point was hers, wasn't it? They say she hid her treasure there."},
          {who: "ladyteal", text: "It's a ruin, and smugglers have used it for years. You are not to go near it."},
          {who: "tilly", text: "Then I'll take soldiers with me. Tiggle, can you spare me a few for the afternoon?"},
        ],
        post: [
          {who: "narr", text: "Old Wrasse and the smugglers row away from the point. At the top of the tower, in a sea-chest under a hundred years of dust, there is no gold at all."},
          {who: "narr", text: "There is only a hook, black with salt and still sharp, with a name worked into the steel: BESS."},
          {who: "tiggle", text: "There's no treasure, Tilly. I'm sorry."},
          {who: "tilly", text: "Don't be. She must have spent the gold on our title and the house. But she kept this, up here where nobody would find it. This is what she cared about."},
          {who: "tilly", text: "Hello, Grandmama Bess. I think we'd have got on terribly well."},
          {who: "narr", text: "That evening, Tilly takes down the curtain in front of Bess Tealbottom's portrait. Lady Tealbottom does not put it back up."},
        ],
        reward: sideReward(2, 'grandmabess', 'tilly'),
      },
    ]},
});

// Each set's quests go on its route's side story list, in the order they open (as in 29-data-sides-more.js).
for (const key of ['tilly']){
  const set = SIDE_SETS[key], camp = CAMPAIGNS[set.camp], at = camp.stages.find(s => s.id === SIDE_OPENS[set.camp]);
  set.quests.forEach((q, k) => { Object.assign(q, {side: true, char: key, rank: k + 1, set, chapter: at.chapter, ci: at.ci, si: k}); camp.sides.push(q); });
}
