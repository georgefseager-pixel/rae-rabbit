// ================= Side Stories: Princess (joins the Friggliarchy in Chapter Five) =================
// Same format as 28-data-sides.js. Princess joins after F5-6, so her set runs above the Chapter Five line (recommended
// 13 · 14 · 14). Her first story is a flashback to the day she started her book. The new faces (Mudge, Quartermaster
// Snipe, the Miller) are drawn with generic frog art.

Object.assign(SIDE_SETS, {
  princess: {camp: 'frog', title: 'Two Columns', about: 'Why Princess started keeping a book of grievances, the King\'s order that follows her to Tiggle\'s camp, and a village of her own she has never visited.',
    quests: [
      {
        id: 'PR-1', title: 'Years Ago: The Spring Hunt', map: 'royalPark', enemyFaction: 'frog', lead: 'princess', flashback: true, enemyMods: {},
        teaser: 'Princess has promised to tell Tiggle about the first thing she ever wrote in her book: the King\'s spring hunt, the year she turned eleven.',
        star: {type: 'unhurt', text: 'Princess takes no damage'},
        objective: {type: 'boss'}, maxDeploy: 5,
        deploy: [[4,15],[5,15],[3,14],[6,14],[5,14]],
        brief: 'Years ago, at the King\'s spring hunt. Marsh brigands have climbed into the royal park while the hunt is out in the woods. Drive off their leader. Princess must not fall.',
        prepNote: 'A flashback: Princess, eleven years old, leads the defence of the pavilion. The battle is lost if she falls.',
        enemies: () => [
          E('bruiser',13,4,2,'hold',{boss: true, flees: true, key: 'mudge', name: 'Mudge', look: 'bruiser'}),
          E('blade',12,2,4), E('blade',12,7,4), E('reed',12,1,1,'guard'), E('reed',12,8,1,'guard'), E('croaker',12,5,0,'guard'),
          E('bruiser',12,5,7), E('lily',12,3,8), E('blade',12,8,8),
        ],
        reinforce: () => [{turn: 3, units: [E('blade',12,0,5), E('lily',12,9,5)]}],
        bossTalk: [
          {who: "mudge", text: "A little girl in a tiara? Run along back to your nurse. We only want the silver."},
          {who: "princess", text: "That silver belongs to the King, and you are standing on his lawn. I'm not going anywhere."},
        ],
        pre: [
          {scene: "court", place: "The Royal Park · Years Ago · Side Story"},
          {who: "narr", text: "Years ago. The King's spring hunt has ridden out into the woods with horns and hounds and half the court behind it."},
          {who: "narr", text: "Princess, eleven years old, has been left at the hunt pavilion on the lawn, with the servants, the spare beaters and the silver."},
          {who: "princess", thought: true, text: "I asked to command the beaters. Friggle laughed in front of everyone and gave the job to Biggle, who is only two years older than me and can't count past twenty."},
          {who: "narr", text: "There is shouting from the hedges. Frogs in muddy coats are climbing over them, carrying sacks."},
          {who: "guard", text: "Marsh brigands! Your Highness, get inside the pavilion and stay there!"},
          {who: "princess", text: "No. If we all hide, they'll take everything. There are a dozen beaters here with poles, and six of you with spears."},
          {who: "princess", text: "Beaters, stay together and don't let them get round you. Guards, with me. We drive them back over the hedge."},
        ],
        post: [
          {who: "narr", text: "Mudge's brigands scramble back over the hedges without the silver. A few minutes later the horns sound, and the hunt comes galloping back across the lawn with Biggle and the hunt guard in front."},
          {who: "king", text: "Biggle! Well done, boy. You heard the shouting and rode straight back. That's how a prince should behave."},
          {who: "biggle", text: "Majesty, I didn't do anything. It was—"},
          {who: "king", text: "And modest with it. Somebody bring him a drink."},
          {who: "narr", text: "Nobody asks Princess what happened. She stands by the pavilion with a beater's pole in her hands until a servant takes it away from her."},
          {who: "narr", text: "That night she takes a blank exercise book from the schoolroom and writes down the date, the hunt, the brigands and what she did. Then she writes what the King said, and to whom."},
          {who: "princess", thought: true, text: "If nobody else is going to keep count, I will."},
        ],
        reward: sideReward(0),
      },
      {
        id: 'PR-2', title: 'The Writ', map: 'forestTrail', enemyFaction: 'frog', mustDeploy: ['princess'], enemyMods: {},
        teaser: 'Lieutenant Silt is on the road with a writ from the King and a squad of soldiers. He has come to take Princess back to the capital in irons.',
        star: {type: 'bossBy', key: 'princess', text: 'Princess drives off Lieutenant Silt herself'},
        objective: {type: 'boss'}, maxDeploy: 7,
        deploy: [[4,14],[5,14],[3,13],[6,14],[2,14],[7,14],[4,15]],
        brief: 'Lieutenant Silt has brought the King\'s writ and a squad of loyal soldiers to arrest Princess. Drive him off. Princess must come.',
        prepNote: 'Princess must come. Silt waits at the far end of the forest road, with his soldiers in the trees on either side. More of them come out of the woods on turn III.',
        enemies: () => [
          E('blade',15,4,1,'hold',{boss: true, flees: true, elite: true, key: 'silt', name: 'Lieutenant Silt', look: 'duelist'}),
          E('toadknight',14,3,3,'guard'), E('lilyknight',14,6,3,'guard'), E('reed',14,1,5,'guard'), E('reed',14,8,5,'guard'), E('croaker',14,5,2,'guard'),
          E('lily',14,2,7), E('blade',14,7,7), E('bruiser',14,4,9), E('lily',14,6,10),
        ],
        reinforce: () => [{turn: 3, units: [E('blade',14,0,7), E('blade',14,9,7)]}],
        bossTalk: [
          {who: "silt", text: "Your Highness. By order of His Majesty, you are to come back to the capital with me, in irons. The writ is here, under his seal."},
          {who: "princess", text: "You were late with every report you ever brought me, Silt. You're very punctual today."},
          {who: "silt", text: "I learned from your book, Highness. Everything gets written down, and everyone gets paid back. I'm doing as I'm told, the way you taught us."},
        ],
        pre: [
          {scene: "woods", place: "The Forest Road · Side Story"},
          {who: "narr", text: "On the forest road north of the camp, a squad of the King's soldiers waits under a royal banner. Lieutenant Silt stands at the front, holding up a scroll with a red seal."},
          {who: "silt", text: "Prince Tiggle! I have a writ from the King for the arrest of Princess. Hand her over, and there will be no trouble."},
          {who: "tiggle", text: "I'm the senior royal officer in the field, Lieutenant, and I've already decided. She stays with me."},
          {who: "silt", text: "The writ is in the King's own hand, Highness. It outranks you."},
          {who: "princess", text: "Let me answer him, cousin. He was my lieutenant. If anyone is going to send him home, it should be me."},
        ],
        post: [
          {who: "narr", text: "Lieutenant Silt runs north up the road with what is left of his squad. The writ lies in the mud where he dropped it."},
          {who: "princess", text: "He did exactly what I would have done in his place. Followed his orders, and enjoyed it."},
          {who: "narr", text: "Captain Wort, who was Princess's own captain until the night he went over to Tiggle, picks the writ up and hands it to her."},
          {who: "princess", text: "Wort. You walked out of my camp with your whole company. I never asked you why."},
          {who: "wort", text: "You knew all our names, Highness, but only when we'd done something wrong. The Prince asked us how many of us had come back from the lighthouse. You never asked us anything."},
          {who: "princess", text: "That's fair. I don't like it, but it's fair."},
          {who: "narr", text: "She tears the writ in half and puts both pieces inside the cover of her book."},
        ],
        reward: sideReward(1),
      },
      {
        id: 'PR-3', title: 'Lilyford', map: 'flowerField', enemyFaction: 'frog', mustDeploy: ['princess'], enemyMods: {},
        teaser: 'Foragers from the eastern march are stripping the villages on their way south. Lilyford, the village on Princess\'s mother\'s lands, is next on their road.',
        star: {type: 'allies', text: 'No villager is lost'},
        objective: {type: 'survive', turns: 5, escort: true, who: 'villagers', dest: 'the ford'}, escort: true, maxDeploy: 7,
        exits: [[2,13],[3,13],[4,13],[5,13],[6,13],[7,13]],
        deploy: [[3,6],[6,6],[4,7],[5,7],[2,7],[7,7],[3,4],[6,4]],
        brief: 'Foragers are taking Lilyford\'s harvest for the eastern march. Hold them off while the villagers carry what they can south to the ford (the gold squares). Princess must come.',
        prepNote: 'Princess must come. The villagers (blue) walk to the gold squares on their own, through the two gaps in the old wall; the foragers go after them first. Hold out for five turns, or until every villager is across.',
        allies: () => [[3,2],[4,2],[5,2],[6,2],[3,3],[6,3]].map(([x, y]) => E('blade',8,x,y,'courier',{courier: true, key: 'ally', name: 'Villager', look: 'scout', bonus: {mov: -1}})),
        enemies: () => [
          E('blade',15,4,0,'charge',{key: 'snipe', name: 'Quartermaster Snipe', look: 'duelist', elite: true, flees: true, talk: [
            {who: "snipe", text: "This harvest is requisitioned for the eastern march, by order of Governor Bulrush. Stand aside."},
            {who: "princess", text: "This is my family's village, and these are my family's people. You will requisition nothing here."},
          ]}),
          E('blade',14,2,0), E('bruiser',14,7,1), E('lily',14,0,3), E('lily',14,9,3), E('reed',14,1,1,'guard'),
        ],
        reinforce: () => [
          {turn: 2, units: [E('blade',14,0,7), E('bruiser',14,9,7)]},
          {turn: 3, units: [E('reed',14,0,9), E('lily',14,9,9), E('toadknight',15,5,0)]},
          {turn: 4, units: [E('blade',14,0,11), E('blade',14,9,11)]},
        ],
        pre: [
          {scene: "woods", place: "Lilyford · Side Story"},
          {who: "narr", text: "Lilyford is a small frog village beside a ford: a mill, a barn, a dozen houses round a green, and an old wall from the days when it needed one. Princess has not been here since she was six."},
          {who: "narr", text: "Smoke is rising from behind the barn. Soldiers in the eastern march's colours are loading the villagers' grain onto carts."},
          {who: "miller", text: "Soldiers in the barn, and more coming up the road! They've taken the seed corn as well as the harvest! Who are— Your Highness? Is that you?"},
          {who: "princess", text: "Get everyone together and take them south, across the ford. Carry whatever food you can. We'll keep the soldiers off you until you're over."},
          {who: "tiggle", text: "They'll go for the villagers before they come for us. Keep between them and the ford, and don't let anyone get cut off at the wall."},
        ],
        post: [
          {who: "narr", text: "The last of the villagers splash across the ford with their sacks. Quartermaster Snipe's foragers give up and go back up the road with empty carts."},
          {who: "miller", text: "Your Highness. We didn't think anyone in the family remembered we were here. Nobody has come to Lilyford in twenty years."},
          {who: "princess", text: "I remembered. I just never came. I'm sorry."},
          {who: "miller", text: "Well, you came today. Will you take some bread? It's baked with the last of the old flour, but it's good."},
          {who: "narr", text: "Princess takes the bread. Later, Tiggle finds her sitting on the riverbank with her book open, writing slowly."},
          {who: "tiggle", text: "Another grievance?"},
          {who: "princess", text: "No. Something I owe them. I've had to rule a line down the middle of the page to make room for it."},
        ],
        reward: sideReward(2, 'secondbook', 'princess'),
      },
    ],
  },
});

// Each set's quests go on its route's side story list, in the order they open (as in 29-data-sides-more.js).
for (const key of ['princess']){
  const set = SIDE_SETS[key], camp = CAMPAIGNS[set.camp], at = camp.stages.find(s => s.id === SIDE_OPENS[set.camp]);
  set.quests.forEach((q, k) => { Object.assign(q, {side: true, char: key, rank: k + 1, set, chapter: at.chapter, ci: at.ci, si: k}); camp.sides.push(q); });
}
