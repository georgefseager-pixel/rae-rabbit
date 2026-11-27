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
  raeRags:   {char: 'rae',    outfit: 'camp', name: 'Mine Rags', desc: 'The patched rags Rae wore in the mines. She kept them, folded small.'},
  floraRags: {char: 'sister', outfit: 'camp', name: 'Camp Rags', desc: 'Little Sister\'s old camp clothes. Flopsy Flora never threw them away.'},
  // Daily log-in (66-login.js), log-ins 7 and 14: look only (both stay sword users). No map icons yet: they keep their usual ones.
  raeCasual: {char: 'rae',    outfit: 'casual', name: 'Casual Wear', desc: 'A day off from the war, in a very large T-shirt. Somebody in the Republic has a sense of humour.'},
  floraCarrot: {char: 'sister', outfit: 'carrot', name: 'In a Carrot', desc: 'Flopsy sewed it herself, from a sack of orange felt and a great deal of enthusiasm. She says it is camouflage. Nobody has had the heart to ask for what.'},   // log-in 21: look only
  // Daily log-in, log-in 28: look only. Biggle keeps his Court Knight's rapier and armour.
  biggleBow: {char: 'biggle', outfit: 'bow', name: 'Big Bow', desc: 'For the Court\'s spring ball, Biggle asked the tailors for "something dignified". He has worn it to every function since, and nobody has dared tell him.'},
  tiggleFormal: {char: 'tiggle', outfit: 'formal', name: 'Formal Wear', desc: 'For state dinners, peace talks, and looking terribly serious. The smiley pin was not his idea.'},   // log-in 14
  // Across the Stream: Flopsy in the robes of a Monkeyland spell-reader. A tome instead of her needle; she still mends,
  // after a fashion (Healing Verse).
  floraSorcerer: {char: 'sister', outfit: 'sorcerer', name: 'Simian Sorcerer', cls: 'sorcerer', mods: {atk: 3, def: -1, spd: 1}, ability: 'verse',
              desc: 'The temple monkeys taught her to read their spell-books. She learned very fast, mostly the shouty bits. The hat was her own idea. Nobody has been able to talk her out of it.'},
  // Across the Stream (after Chapter Three): Rae in the armour of the monkey militia who came south with Speshul.
  // A spear instead of a sword; sturdier, and slower.
  raeMilitia: {char: 'rae', outfit: 'militia', name: 'Monkeyland Militia', cls: 'militia', mods: {def: 3, spd: -2, mhp: 2}, ability: 'plant',
              desc: 'The monkeys who crossed the stream made it for her, plate by plate, in the old Southern Watch colours. The helmet was made for a monkey. The ear holes were added later, with some difficulty.'},
  // Pirates of the Satin Sea (after Chapter Four): Speshul signs on with Ducky's crew. A hook instead of his bow (he still
  // climbs); sturdier and harder-hitting, a little slower. His pulls leave a lit fuse behind (Lit Fuse).
  speshulPowder: {char: 'speshul', outfit: 'powder', name: 'Powder Monkey', cls: 'powdermonkey', mods: {mhp: 2, atk: 2, def: 1, spd: -2}, ability: 'fuse',
              desc: 'Ducky\'s crew needed someone small and quick to run the powder below decks. Speshul volunteered before they finished asking. The hat came from the captain\'s own sea-chest. The sun on it he stitched himself.'},
  // Champions of the Lists (after Chapter Four): Tiggle in the laurels and armour of the Royal Tournament's champion. An axe
  // instead of his sword; tougher and harder-hitting, a little slower. Every foe he beats wins the crowd (Crowd Pleaser).
  tiggleChampion: {char: 'tiggle', outfit: 'champion', name: 'Arena Champion', cls: 'champion', mods: {mhp: 3, atk: 2, spd: -2}, ability: 'crowd',
              desc: 'The armour of the Royal Tournament\'s champion, made for whoever won it. It was meant for Biggle. Biggle had it taken in at the waist, and sent to his little brother with no note at all.'},
  // December festive banner (31-data-events.js): Flopsy in a very large jumper. Same class and needle; a little
  // cosier (Def) and a little slower (Spd), and her mending comes with presents.
  floraXmas: {char: 'sister', outfit: 'xmas', name: 'Hoppy Xmas', mods: {def: 2, spd: -1}, ability: 'present',
              desc: 'Knitted by Flopsy herself, over three weeks, mostly in secret. The spelling is deliberate. She will tell you so.'},
  // From recruiting (a banner's `attires`): Biggle on horseback. Faster and further-moving than the Court Knight's
  // armour, but lighter (less Def), and a horse can't climb rocks.
  // December festive banner (31-data-events.js): Biggle as gingerbread, on foot with a candy-cane rapier. Much quicker
  // than the Court Knight's armour, and much easier to break.
  gingerbiggle: {char: 'biggle', outfit: 'ginger', name: 'Gingerbiggle', cls: 'gingerknight', mods: {def: -5, spd: 5, skl: 2, mov: 1}, ability: 'cantcatch',
              desc: 'From a nightmare Biggle had after eating an entire gingerbread house, roof and all. He woke up, had the costume made, and will not discuss it.'},
  rose:      {char: 'biggle', outfit: 'rose', name: 'Rose Knight', cls: 'roseknight', mods: {def: -3, spd: 4, skl: 1, mov: 3}, ability: 'lancecharge',
              desc: 'Biggle\'s parade armour, rose-pink and gold, and the royal stables\' finest horse. He insists the colour is "crimson".'},
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
