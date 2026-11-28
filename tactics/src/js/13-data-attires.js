// ================= Attires (alternative costumes) =================
// An attire is another look for an existing character, not a separate unit: level, supports, weapons, Bond-free
// duplicates, falling and stitching up are all shared. Pick it on the unit card ("Attire ›").
// Story scenes always show the character's canonical (story) outfit; battles, unit cards, map icons and the Camp
// list show the attire being worn.
//   char    the character it belongs to
//   outfit  the art it uses: art/<char><outfit>-portrait.png, -battle.png, -token.png (falls back to the base art)
//   name / desc
//   cls     optional: wearing it changes class (and so usually weapon type, range and growths)
//   mods    optional: stat changes while worn, e.g. {def: 2, spd: -1}
//   ability optional: an attire that changes class or stats brings its own ability (14-data-abilities.js)
// Most attires will change stats slightly and the weapon type; the mine clothes below are look-only.
// Attires can also come from recruiting: a banner's `attires: [ids]` are featured alongside its characters (26-data-gacha.js).
const ATTIRES = {
  raeRags:   {char: 'rae',    outfit: 'camp', name: 'Mine Rags', desc: 'The patched rags Rae wore in the mines, belted with a length of rope. She has kept them, folded small, at the bottom of her pack.'},
  floraRags: {char: 'sister', outfit: 'camp', name: 'Camp Rags', desc: 'What Little Sister wore in the mine camp, before she chose the name Flopsy Flora. She mended them so often that there is more patch than cloth.'},
  // Daily log-in (66-login.js), log-ins 7 and 14: look only (both stay sword users). No map icons yet: they keep their usual ones.
  raeCasual: {char: 'rae',    outfit: 'casual', name: 'Casual Wear', desc: 'Rae\'s clothes for a rare day off from the war: a black T-shirt several sizes too big, with EMOTIONAL SUPPORT BEAR printed across the front.'},
  floraCarrot: {char: 'sister', outfit: 'carrot', name: 'In a Carrot', desc: 'A carrot costume Flopsy sewed herself from a sack of orange felt, with patches where the felt ran short and a tuft of green leaves on top. She calls it camouflage, and wears it whenever she gets the chance.'},   // log-in 21: look only
  // Daily log-in, log-in 28: look only. Biggle keeps his Court Knight's rapier and armour.
  biggleBow: {char: 'biggle', outfit: 'bow', name: 'Big Bow', desc: 'For the Court\'s spring ball, Biggle asked the tailors for "something dignified". They made him an enormous pink bow tie, and he has worn it to every function since.'},
  // Daily log-in, log-in 35: look only (she keeps her tome).
  willowDoctor: {char: 'willow', outfit: 'doctor', name: 'Dr. Willow', desc: 'A white coat and round spectacles, for the days Willow helps in the sick tent. She has read every book on medicine the Republic owns, but she always tells her patients that she is not a doctor.'},
  tiggleFormal: {char: 'tiggle', outfit: 'formal', name: 'Formal Wear', desc: 'A small smiley pin, somebody else\'s idea, sits on the lapel of Tiggle\'s navy suit. He wears the suit, with a red tie, to state dinners and peace talks.'},   // log-in 14
  // Across the Stream: Flopsy in the robes of a Monkeyland spell-reader. A tome instead of her needle; she still mends,
  // after a fashion (Healing Verse).
  floraSorcerer: {char: 'sister', outfit: 'sorcerer', name: 'Simian Sorcerer', cls: 'sorcerer', mods: {atk: 3, def: -1, spd: 1}, ability: 'verse',
              desc: 'The lotus-embroidered robes of a Monkeyland spell-reader, with a wide hat that was Flopsy\'s own idea. The temple monkeys taught her to read their spell-books, and when she reads a spell aloud, the friends beside her mend a little too.'},
  // Across the Stream (after Chapter Three): Rae in the armour of the monkey militia who came south with Speshul.
  // A spear instead of a sword; sturdier, and slower.
  raeMilitia: {char: 'rae', outfit: 'militia', name: 'Monkeyland Militia', cls: 'militia', mods: {def: 3, spd: -2, mhp: 2}, ability: 'plant',
              desc: 'The monkeys who crossed the stream made this armour for Rae plate by plate, in the colours of the old Southern Watch. The helmet was built for a monkey, so they cut holes in it for her ears.'},
  // Pirates of the Satin Sea (after Chapter Four): Speshul signs on with Ducky's crew. A hook instead of his bow (he still
  // climbs); sturdier and harder-hitting, a little slower. His pulls leave a lit fuse behind (Lit Fuse).
  speshulPowder: {char: 'speshul', outfit: 'powder', name: 'Powder Monkey', cls: 'powdermonkey', mods: {mhp: 2, atk: 2, def: 1, spd: -2}, ability: 'fuse',
              desc: 'Ducky\'s crew needed someone small and quick to carry powder below decks, and Speshul volunteered at once. The hat came out of the captain\'s own sea-chest, and Speshul stitched the first Governess\'s sun onto it himself.'},
  // Champions of the Lists (after Chapter Four): Tiggle in the laurels and armour of the Royal Tournament's champion. An axe
  // instead of his sword; tougher and harder-hitting, a little slower. Every foe he beats wins the crowd (Crowd Pleaser).
  tiggleChampion: {char: 'tiggle', outfit: 'champion', name: 'Arena Champion', cls: 'champion', mods: {mhp: 3, atk: 2, spd: -2}, ability: 'crowd',
              desc: 'The gilded armour, laurels and green cape of the Royal Tournament\'s champion. Everyone expected it to go to Biggle. After the final, Biggle had it taken in at the waist and sent it to his little brother.'},
  // December festive banner (31-data-events.js): Flopsy in a very large jumper. Same class and needle; a little
  // cosier (Def) and a little slower (Spd), and her mending comes with presents.
  floraXmas: {char: 'sister', outfit: 'xmas', name: 'Hoppy Xmas', mods: {def: 2, spd: -1}, ability: 'present',
              desc: 'Flopsy knitted this red jumper herself over three weeks, mostly in secret, with rabbits and snowflakes round the hem and HOPPY XMAS across the front, spelled that way on purpose.'},
  // New Year banner (31-data-events.js): Willow in a star-embroidered cloak. Same class and tome; her spells hit a
  // little harder, and she is a little less careful (Def). Each spell brings down a shooting star (Shooting Star).
  willowStarlight: {char: 'willow', outfit: 'star', name: 'Starlight Scholar', mods: {atk: 2, skl: 1, def: -1}, ability: 'starfall',
              desc: 'Willow spent the autumn embroidering this cloak, copying every star from her charts into its proper place. She fastens it with a crescent-moon brooch, and wears it up the old watch-post on the first clear night of the year to read the sky.'},
  // New Year banner (31-data-events.js): Tiggle in sequins and a party hat. Same class and sword; lighter on his feet
  // (Spd) and less well protected (Def). When he defeats an enemy, the party starts (Pop the Cork).
  tiggleParty: {char: 'tiggle', outfit: 'party', name: 'Life of the Party', mods: {spd: 2, skl: 1, def: -1}, ability: 'cork',
              desc: 'Biggle had the sequinned suit made for the Midnight Ball as a joke. Tiggle wore it without complaint, party hat and all, and danced until three in the morning in a HAPPY NEW YEAR sash the war camp cooks had made him.'},
  // From recruiting (a banner's `attires`): Biggle on horseback. Faster and further-moving than the Court Knight's
  // armour, but lighter (less Def), and a horse can't climb rocks.
  // December festive banner (31-data-events.js): Biggle as gingerbread, on foot with a candy-cane rapier. Much quicker
  // than the Court Knight's armour, and much easier to break.
  gingerbiggle: {char: 'biggle', outfit: 'ginger', name: 'Gingerbiggle', cls: 'gingerknight', mods: {def: -5, spd: 5, skl: 2, mov: 1}, ability: 'cantcatch',
              desc: 'Biggle once ate an entire gingerbread house, roof and all, and that night had a nightmare that he was made of gingerbread. In the morning he had the costume made, candy-cane rapier included. It is far lighter than his armour, so he moves much faster in it, but it protects him much less.'},
  rose:      {char: 'biggle', outfit: 'rose', name: 'Rose Knight', cls: 'roseknight', mods: {def: -3, spd: 4, skl: 1, mov: 3}, ability: 'lancecharge',
              desc: 'Biggle\'s parade armour in rose pink and gold, and the finest horse in the royal stables. Mounted, he covers open ground quickly and hits hardest at the end of a long charge.'},
};
const attireOf = rec => rec && ATTIRES[rec.attire];
// The class a unit fights as: its own, or its attire's.
const clsOf = rec => attireOf(rec)?.cls || rec.cls;
// A record's stats with its attire's changes applied (records keep their own stats; the attire is added on top).
function statsOf(rec){
  const s = {...rec.stats}, m = attireOf(rec)?.mods;
  if (m) for (const k in m) s[k] = Math.max(k === 'mhp' ? 1 : 0, (s[k] || 0) + m[k]);
  return s;
}
// Give a character attires (story or recruiting). Returns the names of any that are new.
function grantAttires(ck, ids){
  const got = [];
  for (const id of ids || []){
    const a = ATTIRES[id], rec = a && SAVE.camps[ck].roster.find(r => r.key === a.char);
    if (!rec || (rec.attires ||= []).includes(id)) continue;
    rec.attires.push(id); got.push(`${a.name} (${rec.name})`);
  }
  return got;
}
