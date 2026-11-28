# Toy Wars: how the game is written

Toy Wars is a tactics game about plush toys: rabbits who escape the frog King's mines and found the Raepublic
(Rae Rabbit's route), and the young frog prince Tiggle Taggle who is sent to put them down (the Friggliarchy route).
"Unstitched" means killed; the stakes are real but the world is soft felt and stitching, and a child may be playing.
Story summary per chapter: `tactics/MECHANICS.md` (sections "Chapter Three" to "Chapter Five", and the side-story
notes). Read the parts relevant to your files before you start.

## What to avoid, and why

In November 2026 the whole game was rewritten because the writing "reads very AI": too quippy, too many scenes and lines that end on a single
punchy sentence, too many airy one-liners, and in the supports and side stories "it's hard to tell sometimes what
they're trying to say because it's just a bunch of airy quips". The character bios are repetitive. Quips are fine
in their place (a line before a battle, a character who is genuinely a joker), but the amount and the tone are
excessive. Read every line asking: **does this sound like an AI wrote it?** and **does this actually make sense?**

### Patterns to cut or rewrite (these are the tells)

1. **The button ending.** A scene, a speech or a bio that ends on a short punchline, an ironic reversal or a
   portentous one-liner: "He laughs about most things." / "Nobody has dared tell him otherwise." / "It runs." /
   "Nobody sings." / "That's the frightening kind." / "Nobody leaves." / "He will not discuss it." End scenes on
   what actually happens or what someone decides, said plainly. Not every scene needs a closing beat at all.
2. **Stock phrases:** "never once", "nobody has ever", "nobody dared", "nobody has had the heart to", "for the first
   time in years", "a very long time", "which is more than…", "the kind that…", "and something else besides",
   "not for nothing". Also the "X. Y. Z." stacked-fragment rhythm ("Not you. Not Biggle. Me.") and tricolons
   everywhere ("the school, and the lighthouse, and the huts").
3. **Aphorisms.** Characters dispensing neat maxims instead of talking: "Everything is a test." / "It's what a crown
   tests. Every day." / "Every name chosen out here was paid for by someone who didn't get the chance." One wise line
   in a whole chapter is plenty; most people don't speak in proverbs.
4. **Riffing instead of meaning.** Back-and-forth banter that circles a joke ("He wasn't screaming. He was yelling.
   There's a difference. …Mostly.") while the point of the scene never gets said. Every scene (and every support
   rank) should have a clear point: something is learned, decided, admitted, planned or changed. Say it in words a
   reader can't miss. If you can't tell what a scene is for, work it out from context and make it be about that.
5. **Everyone talks the same.** Witty, clipped, wry, whoever is speaking. Give each character their own voice (see
   below). Most people, most of the time, just say what they mean.
6. **The "…" beat.** "…Thank you." "…All right." used as an emotional pause on every other reply. Use rarely.
7. **Cute narrator asides** ("which nobody thought was possible in satin", "and a great deal of grumbling", "very
   large and very fierce" doubled adjectives everywhere). Narration should describe what happens, concretely, in
   the present tense (the game's narration is present tense; keep it).
8. **Running gags and callbacks** repeated scene after scene. Once can be charming; three times is a tic.
9. **Vagueness.** Allusive lines that hint instead of stating ("You know what this means." "She knew. She'd always
   known."). Replace with the actual thing.

### What good looks like

- Clear, warm, plain storybook prose. Simple words. Sentences of varied length; no dramatic one-sentence paragraphs
  as a habit.
- Dialogue where people ask real questions and get real answers, disagree about concrete things, explain plans,
  say how they feel in their own words. Humour comes from character and situation, and sparingly.
- Each scene does a job: sets up the battle (who, where, why it matters, what the plan is), or pays it off (what
  happened, what it cost, what's next). Support conversations: two people getting to know each other, with real
  information about their pasts, opinions and the relationship changing across C → B → A (→ S).
- Bios (`intro.text`, attire `desc`, weapon `desc`, banner `blurb`, side-story `about`/`teaser`): informative and
  varied. Who they are, what they want, what they're like, how they fight. One distinctive detail is better than
  a joke. No two bios should share a sentence shape.
- British spelling (colour, armour, grey). Keep the names exactly as they are.
- Roughly the same length or shorter. Cut filler lines. You may add a line where a scene needs it to make sense.

### A before/after example (Flopsy's first support with Rae)

Before:
```
narr: By the fire, Flopsy Flora is sewing. Her tongue sticks out of the corner of her mouth.
rae: What are you making?
sister: Fixing. Your coat had a hole in the elbow. You fight with your elbows, did you know that?
rae: I fight with whatever's closest.
sister: Well, your elbows are always closest. There. Good as new. Better, actually. I put a flower on it.
rae: …You put a flower on my battle coat.
sister: A small one! Nobody will see it unless they're very close. And if a frog's that close, you've got bigger problems.
rae: …Thank you, Flopsy.
sister: Flopsy FLORA. You have to say all of it. That's the whole point of choosing it.
```
After (the same scene, saying what it's about: Flopsy wants to look after Rae, and wants her new name to count):
```
narr: By the fire, Flopsy Flora is mending Rae's coat.
rae: You don't need to do that. I can patch my own coat.
sister: You patch it with string and a knot. Look, the elbow's worn right through. You always lead with that arm when you fight.
rae: Do I? I hadn't noticed.
sister: I notice. I watch you in every fight, so I know what needs mending afterwards. There. I've stitched a flower on the patch. Something that isn't from the mines.
rae: It's lovely. Thank you, Flopsy.
sister: Flopsy Flora. I chose both halves, Rae. I'd like you to use both.
rae: Flopsy Flora, then. Every time.
```

## Character voices (keep these distinct)

**Raepublic**
- **Rae Rabbit**: escaped mine rabbit, the Raepublic's commander. Direct, practical, short sentences when she's
  deciding, protective of everyone to a fault; doubts herself in her thoughts, not out loud. Not a wisecracker.
- **Flopsy Flora** (`sister`, Little Sister in Chapter One): Rae's younger sister, a mender with a needle. Eager,
  open, says what she feels, a child growing up fast and proud of it. Chose her own name.
- **Willow**: a Republic scholar and Rae's teacher, once a mine rabbit herself. Calm and exact; explains things
  properly (she teaches the game's mechanics, so her explanations must stay accurate). Not an oracle: she can be
  wrong, warm, tired.
- **Froggle**: the frog who founded the hidden Republic; kept the King's mine ledgers until the numbers didn't add
  up. Careful, precise, thinks in practicalities (supplies, numbers, routes), quietly guilty about her past.
- **Patch**: one-eyed corporal, front of every column. Cheerful soldier, plain-spoken, loyal. Some humour is right
  for him, but not every line.
- **Speshul**: Aurora's young son, heir to Monkeyland, who joined the rabbits. Enthusiastic, bookish, brave beyond
  his experience, idealistic.
- **Ducky**: hammerhead pirate captain. Loud, theatrical, greedy in word and loyal in deed. The one character allowed
  to joke a lot, but his jokes should land on something.
- **Tandy & Maus** (`tandyone`, `maus`): two white mice, ship's surgeons, one unit. They bicker affectionately;
  Tandy is the calm one, Maus the excitable one. Competent.
- **Brigand** (bandit), **the Condemned** (hooded, saved from the block, owes Rae his life), **Ilc** (a frog scout who
  defected), the generic Republic soldiers.

**Friggliarchy**
- **Tiggle Taggle**: the young frog prince, the King's youngest brother. Earnest, formal, idealistic; believes in
  order, law and doing things properly; increasingly troubled by what his brother is. Speaks courteously, even to
  enemies.
- **Biggle Baggle**: his big brother, a knight (the "Wall of the Lily Court"). Gruff, protective, few words, but
  when he speaks he says something real. Not cryptic.
- **King Friggle Fraggle**: their eldest brother, the tyrant. Vain, cold, cares about his reputation.
- **Princess**: their cousin; ambitious, sharp-tongued, keeps a Book of Grievances; wants to be heir. Proud, not
  stupid. Joins Tiggle at the end of Chapter Five.
- **Aurora**: Governess of Monkeyland, who has kept her people alive by kneeling to the frogs. Dignified, weary,
  speaks carefully, loves her son Speshul.
- **Captain Cornelius** (Aurora's monkey guard captain, steady, dutiful), **Chansey** (Monkeyland's head priestess,
  gentle, believes kindness mends things), **Rhubarb** (the mine overseer with a whip, hard, with a past),
  **the Executioner** (the headsman, grave and literal), **Fraggle Jr.** (the late Black Frog's quiet son),
  **Chriggle Chraggle** (the festive gift-bringer, jolly), **Tilly Tealbottom** (aristocratic hook rider who says
  "darling"; that verbal habit is hers and should stay, but sparingly).

## Practical notes

- Keep `prepNote` and `brief` accurate to the battle's rules (turn counts, who must come, what the objective is), and
  keep teaching lines (Willow's Lessons, Biggle's explanations) mechanically correct.
- Supports are watched at the Camp at any point in the story, so they stay away from specific plot events; an S rank
  follows the character's three side stories and should fit them.
- Seasonal events and side stories have their own rules about which characters may appear: see CLAUDE.md.
- Before finishing new writing, reread it asking the two questions above, and cut the tells listed here.
