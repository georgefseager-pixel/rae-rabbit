// ================= Weapons: owning, carrying, equipping =================
// Each army keeps its weapons in SAVE.camps[ck].arms as items {uid, id} (id is a key of WEAPONS).
// A unit carries at most one item (rec.arm = the item's uid); without one it uses its class's basic weapon.
const armsOf = ck => (SAVE.camps[ck].arms ||= []);
function campOfRec(rec){ for (const [k, c] of Object.entries(SAVE?.camps || {})) if (c.roster.includes(rec)) return k; return null; }
// The class weapon. Older saves may have reinforced it (wtier), which still counts.
function basicWeapon(rec){
  const c = CLASSES[rec.cls], t = WEAPON_TIERS[rec.wtier || 0];
  return {name: t.prefix + (rec.wname || c.wname), type: c.w, stars: 0, mt: t.bonus, hit: 0, crit: 0, rng: c.rng, lash: !!c.lash, basic: true,
          desc: 'Standard for the class.'};
}
function weaponOf(rec){
  if (rec.arm){
    const ck = campOfRec(rec), it = ck && armsOf(ck).find(a => a.uid === rec.arm), w = it && WEAPONS[it.id];
    if (w) return {...w, rng: w.rng || CLASSES[rec.cls].rng, uid: it.uid, id: it.id};
  }
  return basicWeapon(rec);
}
const canCarry = (rec, w) => w.type === CLASSES[rec.cls].w && (!w.owner || w.owner === rec.key);
const holderOf = (ck, itemUid) => SAVE.camps[ck].roster.find(r => r.arm === itemUid && !r.dead);
function addWeapon(ck, id){
  const it = {uid: `${id}-${Date.now().toString(36)}${Math.floor(Math.random()*1e4)}`, id};
  armsOf(ck).push(it); return it;
}
// Give a unit an item (or null for the class weapon). Whoever had the item goes back to their class weapon.
function equipWeapon(ck, rec, itemUid){
  if (itemUid) for (const r of SAVE.camps[ck].roster) if (r.arm === itemUid) r.arm = null;
  rec.arm = itemUid || null;
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
const rngText = r => r[0] === r[1] ? `${r[0]}` : `${r[0]}–${r[1]}`;
const weaponStatsText = w => `Mt ${w.mt >= 0 ? '+' : ''}${w.mt}${w.hit ? ` · Hit +${w.hit}` : ''}${w.crit ? ` · Crit +${w.crit}` : ''} · Rng ${rngText(w.rng || [1, 1])}`;
