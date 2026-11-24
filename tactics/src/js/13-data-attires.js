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
  tiggleFormal: {char: 'tiggle', outfit: 'formal', name: 'Formal Wear', desc: 'For state dinners, peace talks, and looking terribly serious. The smiley pin was not his idea.'},   // log-in 14
  // From recruiting (a banner's `attires`): Biggle on horseback. Faster and further-moving than the Lily Knight's
  // armour, but lighter (less Def), and a horse can't climb rocks.
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
