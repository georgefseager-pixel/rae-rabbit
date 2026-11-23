// ================= Weapons: owning, carrying, equipping =================
// Each army keeps its weapons in SAVE.camps[ck].arms as items {uid, id} (id is a key of WEAPONS).
// A unit carries at most one item (rec.arm = the item's uid); without one it uses its class's basic weapon.
const armsOf = ck => (SAVE.camps[ck].arms ||= []);
function campOfRec(rec){ for (const [k, c] of Object.entries(SAVE?.camps || {})) if (c.roster.includes(rec)) return k; return null; }
// The class weapon. Older saves may have reinforced it (wtier), which still counts.
function basicWeapon(rec){
  const c = CLASSES[clsOf(rec)], t = WEAPON_TIERS[rec.wtier || 0];
  return {name: t.prefix + (attireOf(rec)?.cls ? c.wname : (rec.wname || c.wname)), type: c.w, stars: 0, mt: t.bonus, hit: 0, crit: 0, rng: c.rng, lash: !!c.lash, basic: true,
          desc: 'Standard for the class.'};
}
function weaponOf(rec){
  if (rec.arm){
    const ck = campOfRec(rec), it = ck && armsOf(ck).find(a => a.uid === rec.arm), w = it && WEAPONS[it.id];
    if (w) return {...w, rng: w.rng || CLASSES[clsOf(rec)].rng, uid: it.uid, id: it.id};
  }
  return basicWeapon(rec);
}
const canCarry = (rec, w) => w.type === CLASSES[clsOf(rec)].w && (!w.owner || w.owner === rec.key);
const holderOf = (ck, itemUid) => SAVE.camps[ck].roster.find(r => r.arm === itemUid && !r.dead);
function addWeapon(ck, id){
  const it = {uid: `${id}-${Date.now().toString(36)}${Math.floor(Math.random()*1e4)}`, id};
  armsOf(ck).push(it); return it;
}
// Give a unit an item (or null for the class weapon). If someone else carries it, the two swap: they take
// this unit's weapon when they can carry it, and otherwise go back to their class weapon.
function equipWeapon(ck, rec, itemUid){
  const prev = rec.arm, prevW = prev && WEAPONS[armsOf(ck).find(a => a.uid === prev)?.id];
  if (itemUid) for (const r of SAVE.camps[ck].roster) if (r !== rec && r.arm === itemUid)
    r.arm = !r.dead && prevW && canCarry(r, prevW) ? prev : null;
  rec.arm = itemUid || null;
}
// What swapping would leave the current holder with (for the picker).
function swapResult(ck, rec, holder){
  const prevW = rec.arm && WEAPONS[armsOf(ck).find(a => a.uid === rec.arm)?.id];
  return prevW && canCarry(holder, prevW) ? prevW.name : basicWeapon(holder).name;
}
// Release one unused copy of a weapon.
function releaseSpare(ck, id){
  const it = armsOf(ck).find(a => a.id === id && !holderOf(ck, a.uid));
  return it ? releaseWeapon(ck, it.uid) : 0;
}
function releaseWeapon(ck, itemUid){
  const list = armsOf(ck), i = list.findIndex(a => a.uid === itemUid), w = i >= 0 && WEAPONS[list[i].id];
  if (!w || w.owner) return 0;
  for (const r of SAVE.camps[ck].roster) if (r.arm === itemUid) r.arm = null;
  list.splice(i, 1);
  const back = GACHA.release[w.stars] || 1; gachaState(ck).tokens += back; return back;
}
// Story weapons from a stage reward: [{id, to: character key}] — added once, and handed to that character.
function grantStoryWeapons(ck, list){
  const got = [];
  for (const {id, to} of list || []){
    if (!WEAPONS[id] || armsOf(ck).some(a => a.id === id)) continue;
    const it = addWeapon(ck, id), rec = SAVE.camps[ck].roster.find(r => r.key === to && !r.dead);
    if (rec && canCarry(rec, WEAPONS[id])) equipWeapon(ck, rec, it.uid);
    got.push(`${WEAPONS[id].name}${rec ? ` (${rec.name})` : ''}`);
  }
  return got;
}
// the usual range of a weapon type (bows 2, tomes 1–2, the rest 1)
const typeRange = type => ({bow: [2, 2], tome: [1, 2]})[type] || [1, 1];
const rngText = r => r[0] === r[1] ? `${r[0]}` : `${r[0]}–${r[1]}`;
const weaponStatsText = w => `Mt ${w.mt >= 0 ? '+' : ''}${w.mt}${w.hit ? ` · Hit +${w.hit}` : ''}${w.crit ? ` · Crit +${w.crit}` : ''} · Rng ${rngText(w.rng || [1, 1])}`;
