// ================= Side Stories: the tournament (Chapter Four's Friggliarchy characters) =================
// Same format as 28-data-sides.js. Tilly Tealbottom joins after Chapter Four (Champions of the Lists), so her set runs on
// the same line as the pirates' (recommended 9 · 11 · 11). Her second story is a flashback to last season.

Object.assign(SIDE_SETS, {
  tilly: {camp: 'frog', title: 'Do Come Closer', about: 'Why the pride of the Lily Court put down her lance, and what the Tealbottoms were before they were proper.',
    quests: [
      {
        id: 'TL-1', title: 'The Garden Party', map: 'royalPark', enemyFaction: 'rae', lead: 'tilly', ban: ['tiggle'], enemyMods: {},
        teaser: 'Lady Tealbottom is holding her spring garden party. Tilly has been made to attend. So, uninvited, has a gang of bandits.',
        star: {type: 'turns', n: 6, text: 'Win by the end of turn VI'},
        objective: {type: 'boss'}, maxDeploy: 5,
        deploy: [[4,15],[5,15],[3,14],[6,14],[4,14]],
        brief: 'Bandits have come over the hedges of the Tealbottom gardens. Drive off their leader before they make off with the silver. Tilly must not fall.',
        prepNote: 'Tilly leads (the battle is lost if she falls). Tiggle stays at the war camp. Her hook drags bandits off the hedgerows and fountains, and leaves them Off Balance for whoever comes next.',
        enemies: () => [
          E('captain',10,4,2,'hold',{boss: true, flees: true, key: 'magpie', name: 'Magpie', look: 'workerBig', fur: 'chocolate'}),
          E('runner',9,2,4), E('runner',9,7,4), E('digger',9,3,8,'guard'), E('digger',9,6,8,'guard'),
          E('pebbler',9,1,1,'guard'), E('pebbler',9,8,1,'guard'), E('hauler',9,5,5), E('runner',9,0,7),
        ],
        bossTalk: [
          {who: "magpie", text: "Look at this, lads. A frog in pearls, on a pony. Hand over the teaspoons, love, and nobody gets muddy."},
          {who: "tilly", text: "Darling, you're standing on Mother's begonias. Do come closer."},
        ],
        pre: [
          {scene: "court", place: "The Tealbottom Gardens · Side Story"},
          {who: "narr", text: "The Tealbottom estate's spring garden party. Lace. Lemonade. Forty frogs in enormous hats, all being polite at each other."},
          {who: "ladyteal", text: "Matilda. Put that hook down this instant. Sir Reginald Pondsworth has been waiting forty minutes to admire your hat."},
          {who: "tilly", text: "He can admire it from there, Mother. It's a very visible hat."},
          {who: "narr", text: "A scream from the rose garden. Then another. Over the hedges come rabbits: big ones, with sacks."},
          {who: "ladyteal", text: "Bandits! In the begonias! Somebody fetch a guard! Somebody fetch a—"},
          {who: "tilly", text: "Somebody already has, Mother. Biscuit! Gardeners, footmen, anyone with a rake: with me!"},
        ],
        post: [
          {who: "narr", text: "Magpie's gang goes back over the hedges a good deal faster than they came, with no silver and several fewer sacks."},
          {who: "magpie", text: "A frog with a hook! Nobody said anything about a frog with a hook!"},
          {who: "ladyteal", text: "…Matilda. You dragged a bandit through the fountain."},
          {who: "tilly", text: "Two, Mother. The other one went over the sundial."},
          {who: "ladyteal", text: "Sir Reginald fainted."},
          {who: "tilly", text: "Then he's finally doing something interesting at one of your parties."},
          {who: "ladyteal", text: "…It was rather well done. Don't tell anyone I said so."},
        ],
        reward: sideReward(0),
      },
      {
        id: 'TL-2', title: 'Last Season', map: 'cove', enemyFaction: 'pirate', lead: 'tilly', flashback: true, enemyMods: {},
        teaser: 'Biggle says Tilly changed weapons last season. Nobody at court knows why. Tilly tells it over tea.',
        star: {type: 'noLosses', text: 'No one is unstitched'},
        objective: {type: 'boss'}, maxDeploy: 5,
        deploy: [[4,14],[5,14],[3,13],[6,13],[2,14]],
        brief: 'Last season. Pirates have raided the Tealbottom summer house on the coast, and a lance is no use at all on a jetty. Drive off their captain.',
        prepNote: 'Last season: only Tilly and ordinary soldiers can come. The pirates\' Grapplers pull, too.',
        enemies: () => [
          E('sharkcapt',12,4,2,'hold',{boss: true, flees: true, key: 'mako', name: 'Captain Mako', look: 'mako', fur: 'mako'}),
          E('phook',10,3,4,'guard'), E('phook',10,6,4,'guard'), E('pgunner',10,2,3,'guard'), E('psawbones',10,7,3,'guard'),
          E('pcutlass',10,3,7), E('pcutlass',10,6,7), E('pboarder',11,4,9,'charge',{elite: true}), E('pharpoon',10,1,9), E('pcutlass',10,8,9),
        ],
        reinforce: () => [{turn: 3, units: [E('phook',10,1,3), E('pcutlass',10,8,3)]}],
        bossTalk: [
          {who: "mako", text: "A lady frog with a hook? Where'd you get that, sweetheart?"},
          {who: "tilly", text: "From the last pirate who called me sweetheart. Do come closer, and I'll show you how it works."},
        ],
        pre: [
          {scene: "court", place: "The War Camp · Now"},
          {who: "tiggle", text: "Tilly, where did you actually get the hook?"},
          {who: "tilly", text: "Off a pirate, darling. Pour yourself some tea, it's a long story. Well. It's a medium story with a lot of shouting."},
          {scene: "shore", place: "The Tealbottom Summer House · Last Season"},
          {who: "narr", text: "Last season. The Tealbottom summer house on the coast. Tilly, eleven tournaments unbeaten, practising her lance on the lawn."},
          {who: "narr", text: "A grey ship in the bay. Longboats on the beach. Pirates on the jetty, with hooks on ropes, dragging the house staff off the steps one by one."},
          {who: "tilly", text: "A lance is a wonderful thing, darling, if your enemy will stand in a line and ride at you. Pirates won't. Pirates go round."},
          {who: "narr", text: "Her lance snaps on the first boarder. A Grappler's hook comes spinning across the sand and lands at her feet."},
          {who: "tilly", text: "…Well. Waste not."},
        ],
        post: [
          {who: "narr", text: "Captain Mako's longboats pull hard for the grey ship. On the beach, the house staff are picking themselves up, and staring at the young lady of the house."},
          {who: "narr", text: "She is standing at the end of the jetty in a torn gown, holding a pirate's hook, and laughing."},
          {scene: "court", place: "The War Camp · Now"},
          {who: "tilly", text: "I never went back to the lance. Mother was appalled. The Lily Court thought I'd gone mad."},
          {who: "tiggle", text: "Had you?"},
          {who: "tilly", text: "Darling, I'd just found out I'd spent eleven years waiting for things to come to me. I'd have gone a lot madder than that."},
        ],
        reward: sideReward(1),
      },
      {
        id: 'TL-3', title: 'Bess Tealbottom', map: 'lighthouse', enemyFaction: 'pirate', mustDeploy: ['tilly'], enemyMods: {},
        teaser: 'There is a portrait in the Tealbottom gallery that nobody looks at. Tilly has finally read the name on the frame.',
        star: {type: 'bossBy', key: 'tilly', text: 'Tilly drives off Old Wrasse herself'},
        objective: {type: 'boss'}, maxDeploy: 7,
        deploy: [[4,14],[5,14],[3,13],[6,13],[2,14],[7,14],[4,15]],
        brief: 'Smugglers hold the old tower on the point where Bess Tealbottom, pirate, hid her treasure. Cross the causeway and drive off Old Wrasse. Tilly must come.',
        prepNote: 'Tilly must come. The causeway is two squares wide: smugglers with hooks will try to pull your readers into the water\'s edge crowd. Bows beat hooks.',
        enemies: () => [
          E('sharkcapt',12,4,1,'hold',{boss: true, flees: true, key: 'wrasse', name: 'Old Wrasse', look: 'mako', fur: 'tiger'}),
          E('phook',11,3,2,'guard'), E('phook',11,6,2,'guard'), E('psawbones',11,5,1,'guard'), E('pgunner',11,4,3,'guard'),
          E('pcutlass',11,1,7), E('pboarder',11,7,7), E('phook',11,8,8,'guard'), E('pgunner',11,3,10,'guard'), E('pcutlass',11,0,6),
        ],
        bossTalk: [
          {who: "wrasse", text: "Bess Tealbottom's tower. Bess Tealbottom's gold. And here comes a Tealbottom in a silly hat to ask for it back."},
          {who: "tilly", text: "I'm not asking, darling. It's a family tradition. Apparently."},
        ],
        pre: [
          {scene: "court", place: "The Tealbottom Gallery · Side Story"},
          {who: "narr", text: "The long gallery of the Tealbottom estate. Generations of teal frogs in ruffs and pearls, all looking very proper."},
          {who: "narr", text: "And at the far end, behind a curtain, one portrait that isn't proper at all: a teal frog in a sea-captain's coat, with a hook where a lady's fan should be."},
          {who: "tilly", text: "“Bess Tealbottom, Scourge of the Satin Sea.” Mother. MOTHER. Who is this?"},
          {who: "ladyteal", text: "Nobody, Matilda. A great-great-grandmother. A family embarrassment. She robbed the King's tax ships for thirty years and bought the title with the proceeds."},
          {who: "tilly", text: "The title? Our title? We're Tealbottoms because of a PIRATE?"},
          {who: "ladyteal", text: "We do not discuss it."},
          {who: "tilly", text: "Darling, I'm going to discuss nothing else. The old tower on the point was hers, wasn't it? Tiggle! Fetch the army. Well. Fetch some of it."},
        ],
        post: [
          {who: "narr", text: "Old Wrasse and the smugglers row away from the point. At the top of the tower, in a sea-chest under a hundred years of dust, there is no gold at all."},
          {who: "narr", text: "Only a hook. Old, and black with salt, and still sharp, with a name worked into the steel: BESS."},
          {who: "tiggle", text: "No treasure."},
          {who: "tilly", text: "No treasure? Darling, look at it. She left the one thing that mattered. Everything else she gave away. That's why there are no Tealbottoms left on the Satin Sea who hate us."},
          {who: "tilly", text: "Grandmama Bess. Hello. I think we'd have got on terribly well."},
          {who: "narr", text: "That evening, the curtain in the Tealbottom gallery comes down, and stays down. Lady Tealbottom pretends not to notice. She is seen, later, looking at the portrait for a very long time."},
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
