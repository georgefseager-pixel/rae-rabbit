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
// Most attires will change stats slightly and the weapon type; the two below (their mine clothes, kept when they
// change into Republic colours) are look-only.
const ATTIRES = {
  raeRags:   {char: 'rae',    outfit: 'camp', name: 'Mine Rags', desc: 'The patched rags Rae wore in the mines. She kept them, folded small.'},
  floraRags: {char: 'sister', outfit: 'camp', name: 'Camp Rags', desc: 'Little Sister\'s old camp clothes. Flopsy Flora never threw them away.'},
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
