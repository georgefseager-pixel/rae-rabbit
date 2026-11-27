// ================= Side Stories: the pirates (Chapter Four's characters) =================
// Same format as 28-data-sides.js. Ducky joins after Chapter Four (Pirates of the Satin Sea), so his set runs higher
// than Chapter Three's (recommended 9 · 10 · 11). His second story is a flashback: his first voyage, years ago.

Object.assign(SIDE_SETS, {
  ducky: {camp: 'rae', title: 'The Terror of the Satin Sea', about: 'A pirate captain who came ashore to sell Rae, and stayed. He says it\'s for the treasure.',
    quests: [
      {
        id: 'DK-1', title: 'Ten Thousand Crowns', map: 'beachCamp', enemyFaction: 'pirate', lead: 'ducky', ban: ['rae'], enemyMods: {},
        teaser: 'A rival crew has come for Rae\'s bounty, and Rae is away up the coast.',
        star: {type: 'noLosses', text: 'No one is unstitched'},
        objective: {type: 'boss'}, maxDeploy: 6,
        deploy: [[4,9],[5,9],[3,10],[6,10],[2,9],[7,9]],
        brief: 'Captain Mako\'s crew have landed at the settlement to collect the bounty on Rae. Ducky leads the defence. Drive Mako off. Ducky must not fall.',
        prepNote: 'Ducky leads (the battle is lost if he falls). Rae is away at the lighthouse. More pirates land at the jetties.',
        enemies: () => [
          E('sharkcapt',10,4,3,'guard',{boss: true, flees: true, key: 'mako', name: 'Captain Mako', look: 'mako', fur: 'mako'}),
          E('pcutlass',8,2,3), E('pcutlass',8,7,3), E('pboarder',8,4,5), E('pgunner',8,8,4,'guard'), E('pharpoon',8,1,5),
          E('pshanty',8,5,3,'guard'), E('pboarder',8,6,6), E('phook',8,3,5,'guard'),
        ],
        reinforce: () => [{turn: 2, units: [E('pcutlass',8,2,2), E('pharpoon',8,7,2)]}, {turn: 4, units: [E('pboarder',9,2,2,'charge',{elite: true})]}],
        bossTalk: [
          {who: "mako", text: "Ducky! You old guppy! Half of ten thousand Crowns, you and me. Where's the rabbit?"},
          {who: "ducky", text: "Not for sale, Mako."},
          {who: "mako", text: "Everything's for sale. You taught me that."},
          {who: "ducky", text: "Then I taught you wrong. She beat me fair, on my own deck. Nobody sells her. Least of all you."},
        ],
        pre: [
          {scene: "shore", place: "The Settlement · Side Story"},
          {who: "narr", text: "A grey ship at the jetty. A grey shark on the gangplank, in a hat even bigger than Ducky's."},
          {who: "barnacle", text: "Cap'n. It's Mako. Off the Barracuda. He's brought his whole crew."},
          {who: "ducky", text: "Course he has. Mako never could resist a poster."},
          {who: "willow", text: "Rae is at the lighthouse until tonight. We could send for her."},
          {who: "ducky", text: "No. If Rae comes running, Mako gets exactly what he wants: the rabbit, out in the open, with every gun on the Barracuda pointed at her."},
          {who: "ducky", text: "This one's mine. Lads! Rabbits! Monkeys! Whoever's listening! Let's go and be rude to some pirates."},
        ],
        post: [
          {who: "narr", text: "Captain Mako flounders back up the gangplank of the Barracuda, his big hat floating away on the tide."},
          {who: "mako", text: "You've gone soft, Ducky! Soft as a sponge!"},
          {who: "ducky", text: "Come back and say that! Go on! …No? Thought not."},
          {who: "narr", text: "The crew of the Grinning Mary cheers. So do the rabbits. So do the monkeys. Ducky looks round at all of them, and for once doesn't seem to know what to say."},
          {who: "willow", text: "You could have taken half of ten thousand Crowns, Captain."},
          {who: "ducky", text: "Half? I'm holding out for the whole lot. She's worth more every day. Don't tell her."},
        ],
        reward: sideReward(0),
      },
      {
        id: 'DK-2', title: 'Seasick', map: 'gangplanks', enemyFaction: 'frog', lead: 'ducky', flashback: true, enemyMods: {},
        teaser: 'Ducky has never said how he got the scar. Tonight, after a great deal of cordial, he does.',
        star: {type: 'allies', text: 'Captain Gullet and the whole crew survive'},
        objective: {type: 'survive', turns: 4}, maxDeploy: 1,
        deploy: [[4,13]],
        brief: 'Years ago. The King\'s navy has caught the Grinning Mary, lashed to its ships with gangplanks. Hold them off until the Mary cuts loose. Young Ducky must not fall.',
        prepNote: 'Years ago: Ducky comes alone, a cabin pup on his first voyage. The Mary\'s crew fight beside him, on their own (blue coasters). Old Captain Gullet holds the gangplank.',
        allies: () => [
          E('sharkcapt',11,3,11,'hold',{key: 'ally', name: 'Captain Gullet', look: 'gullet', fur: 'white', faction: 'pirate'}),
          E('pcutlass',8,6,12,'charge',{key: 'ally', name: 'Young Barnacle', look: 'barnacle', fur: 'slate', faction: 'pirate'}),
          E('pgunner',8,2,13,'charge',{key: 'ally', name: 'Limpet', faction: 'pirate'}),
          E('pharpoon',8,7,14,'charge',{key: 'ally', name: 'Old Nettle', faction: 'pirate'}),
        ],
        enemies: () => [
          E('toadknight',11,4,1,'hold',{boss: true, flees: true, key: 'croakwell', name: 'Admiral Croakwell', look: 'toadknight'}),
          E('blade',8,3,7), E('blade',8,6,7), E('lily',8,4,8), E('reed',8,1,8,'guard'), E('reed',8,8,8,'guard'),
          E('bruiser',8,5,9), E('blade',8,3,3), E('lily',8,6,3), E('croaker',8,5,1,'guard'),
        ],
        reinforce: () => [{turn: 2, units: [E('blade',8,2,3), E('bruiser',8,7,3)]}, {turn: 3, units: [E('blade',9,4,9,'charge',{elite: true})]}],
        bossTalk: [
          {who: "croakwell", text: "A pup! They've got pups crewing for them now! Stand aside, little fish."},
          {who: "ducky", text: "I'm a shark."},
          {who: "croakwell", text: "You're a pup with a stick. Here. Something to remember the King's navy by."},
        ],
        pre: [
          {scene: "ships", place: "The Satin Sea · Years Ago"},
          {who: "narr", text: "Years ago. A cabin pup on the Grinning Mary, on his very first voyage, being sick over the rail."},
          {who: "gullet", text: "Look at that. Bobbing about like a little duck. You'll get your sea legs, Ducky. Or you won't, and you'll make a very good anchor."},
          {who: "narr", text: "Then a horn, out of the fog. Green sails. The King's navy, three ships of it, with an admiral in a great green hat on the biggest."},
          {who: "gullet", text: "Croakwell. Of course it's Croakwell. Lads! Grapples! They'll lash on and board us!"},
          {who: "ducky", text: "What do I do, Captain?"},
          {who: "gullet", text: "Grab a cutlass and stay behind me. When the ropes are cut, the Mary runs. Until then, nobody comes across that plank."},
        ],
        post: [
          {who: "narr", text: "The last rope parts. The Grinning Mary swings free of the frog ships, and her sails fill."},
          {who: "narr", text: "But the gangplank is still across the gap. And Captain Gullet is still standing on it."},
          {who: "ducky", text: "Captain! Captain, come ON! Jump!"},
          {who: "gullet", text: "Someone has to hold the plank, pup. Take her out. She's yours now."},
          {who: "ducky", text: "I can't! I don't know how! I'm SEASICK!"},
          {who: "gullet", text: "So's half the crew, they just hide it better. Go on. Answer to nobody, Ducky. Except them."},
          {who: "narr", text: "The fog closes over the frog ships. Ducky stands at the stern until it's gone, with a fresh cut across his cheek and the whole crew looking at him."},
          {who: "barnacle", text: "…Orders, Cap'n?"},
          {who: "ducky", text: "…Away. Get us away. And somebody find me a bucket."},
          {scene: "shore", place: "The Settlement · Now"},
          {who: "rae", text: "What happened to Captain Gullet?"},
          {who: "ducky", text: "Never found out. Croakwell got a new medal for it, I heard. And I got this scar, and a ship, and a name I couldn't get rid of."},
        ],
        reward: sideReward(1),
      },
      {
        id: 'DK-3', title: 'A Refund', map: 'coastRoad', enemyFaction: 'frog', mustDeploy: ['ducky'], enemyMods: {},
        teaser: 'Ducky has found out where the King\'s tax from the mines goes. He would like to plunder it. Rae has conditions.',
        star: {type: 'catch', n: 6, text: 'Catch at least six tax clerks'},
        objective: {type: 'intercept', who: 'tax clerks', dest: 'the tax ship'}, maxDeploy: 7,
        exits: [[2,0],[3,0],[5,0],[6,0],[8,0],[9,0]],
        deploy: [[4,8],[5,8],[3,8],[6,8],[2,8],[7,8],[5,7]],
        brief: 'Frog tax clerks are carrying the mines\' taxes up the coast road to the King\'s tax ship. Catch them before they get aboard. Ducky must come.',
        prepNote: 'The tax clerks don\'t stop to fight: they run north for the gold squares, where the tax ship waits. Eight in all. The battle ends once they\'re all caught or gone.',
        enemies: () => [
          ...[[2,15],[5,14],[8,15]].map(([x, y]) => E('blade',10,x,y,'courier',{courier: true, name: 'Tax Clerk', look: 'guard', bonus: {mov: -1}})),
          E('lily',11,3,4,'guard'), E('lily',11,6,4,'guard'), E('reed',11,8,3,'guard'), E('toadknight',12,5,2,'guard'), E('blade',11,1,11),
        ],
        reinforce: () => [
          {turn: 1, units: [[1,15],[4,15],[7,14]].map(([x, y]) => E('blade',10,x,y,'courier',{courier: true, name: 'Tax Clerk', look: 'guard', bonus: {mov: -1}}))},
          {turn: 2, units: [E('blade',10,3,15,'courier',{courier: true, name: 'Tax Clerk', look: 'guard', bonus: {mov: -1}}), E('blade',10,6,15,'courier',{courier: true, name: 'Tax Clerk', look: 'guard', bonus: {mov: -1}}), E('bruiser',11,5,15)]},
        ],
        pre: [
          {scene: "shore", place: "The Coast Road · Side Story"},
          {who: "ducky", text: "Every month, Commander. Every month, the King's tax clerks carry the Crowns from the mine camps up this road, and onto a ship, and off to the capital."},
          {who: "ducky", text: "Crowns. Chests of them. Just walking past. It would be rude not to."},
          {who: "rae", text: "Where do those Crowns come from, Ducky?"},
          {who: "ducky", text: "…The mines?"},
          {who: "rae", text: "From rabbits digging in the dark for nothing. Every one of those Crowns was dug out by somebody who never got to keep it."},
          {who: "ducky", text: "So you're saying no."},
          {who: "rae", text: "I'm saying we take it. And then we give it back to the rabbits in the mine camps. Every Crown."},
          {who: "ducky", text: "That's not plunder. That's a refund. Pirates don't do refunds!"},
          {who: "rae", text: "Pirates do now."},
          {who: "ducky", text: "…Fine. FINE. But I'm still calling it plunder. I have a reputation."},
        ],
        post: [
          {who: "narr", text: "Tax chests lie open on the coast road. Crowns everywhere, rolling in the dust."},
          {who: "froggle", text: "I'll write it all down. Every Crown, and which camp it came from. They'll go back the way they came, with the smugglers' carts."},
          {who: "narr", text: "At the bottom of the last chest, under the Crowns, lies a long bundle wrapped in a frog navy flag."},
          {who: "ducky", text: "…No. No, it can't be."},
          {who: "narr", text: "He unwraps it. A scimitar, old and notched, with a grinning face worked into the hilt."},
          {who: "ducky", text: "Old Mary's Edge. Gullet's blade. Croakwell must have kept it all these years. Sending it to the capital, to hang on some wall."},
          {who: "rae", text: "Then it isn't going to the capital. Is it?"},
          {who: "ducky", text: "No, Commander. It isn't."},
          {who: "narr", text: "That night, a small rabbit from the latest group out of the mines finds a single Crown on her bedroll, with a note: ‘For luck. From a pirate.’"},
        ],
        reward: sideReward(2, 'oldmary', 'ducky'),
      },
    ]},
});

// Each set's quests go on its route's side story list, in the order they open (as in 29-data-sides-more.js).
for (const key of ['ducky']){
  const set = SIDE_SETS[key], camp = CAMPAIGNS[set.camp], at = camp.stages.find(s => s.id === SIDE_OPENS[set.camp]);
  set.quests.forEach((q, k) => { Object.assign(q, {side: true, char: key, rank: k + 1, set, chapter: at.chapter, ci: at.ci, si: k}); camp.sides.push(q); });
}
