// ================= Recruitment rules (gacha) =================
function gachaState(ck){
  const st = SAVE.camps[ck];
  if (!st.gacha) st.gacha = {tokens: GACHA.startTokens, pity: {}, total: 0};
  return st.gacha;
}
// Recruiting as a whole opens after each army's Chapter One (opensAfter); a banner can also wait for a later stage.
for (const [ck, a] of Object.entries(GACHA_ARMY)) for (const b of a.banners) b.army = ck;
const recruitOpen = ck => !!SAVE?.debugUnlock || isCleared(GACHA_ARMY[ck].opensAfter);
// A banner's ★★★ characters: its own `pool`, else its featured characters. Never another banner's.
const bannerPool = b => b.pool || b.featured || GACHA_ARMY[b.army].rares;
const bannerOpen = b => recruitOpen(b.army) && bannerVisible(b) && (!b.after || SAVE?.debugUnlock || isCleared(b.after));   // debug unlock opens every banner
const findBanner = (ck, id) => GACHA_ARMY[ck].banners.find(b => b.id === id);
const isGachaUnit = rec => rec.key === 'recruit' || CHARACTERS[rec.key]?.stars === 3;

function rollRarity(pity){
  if (pity >= GACHA.pity - 1) return 3;
  const r = Math.random()*100, R = GACHA.rarity;
  return r < R[3].rate ? 3 : r < R[3].rate + R[2].rate ? 2 : 1;
}
// The fixed company of generic soldiers for an army: [{id, cls, stars, name}].
// A banner with troops:'<set>' draws its soldiers of the set's rarities from that company instead.
function companyOf(ck, set){
  const army = GACHA_ARMY[ck], names = RECRUIT_NAMES[CAMPAIGNS[ck].faction], out = [];
  let n = 0;
  for (const stars of [2, 1]) for (const cls of army.generic) for (let i = 0; i < GACHA.company[stars]; i++)
    out.push({id: `${ck}-s${stars}-${cls}-${i}`, cls, stars, name: names[n++] || `${CLASSES[cls].name} ${n}`});
  const T = set && army.troops?.[set]; if (!T) return out;
  let m = 0; const own = [];
  for (const stars of T.stars) for (const cls of T.generic) for (let i = 0; i < GACHA.company[stars]; i++)
    own.push({id: `${ck}-${set}-s${stars}-${cls}-${i}`, cls, stars, name: T.names[m++] || `${CLASSES[cls].name} ${m}`});
  return [...out.filter(t => !T.stars.includes(t.stars)), ...own];
}
// Turn a fresh generic recruit into a particular company soldier (stable id, name and look).
function asCompanySoldier(rec, tpl){
  rec.uid = tpl.id; rec.gid = tpl.id; rec.name = tpl.name; rec.stars = tpl.stars;
  if (tpl.stars === 2){ rec.stats.mhp += 2; for (const k of ['atk', 'def', 'spd', 'skl']) rec.stats[k] += 1; rec.wtier = 1; }
  return rec;
}
// Weapons this army can get from recruiting, at a rarity.
const weaponPool = (ck, stars) => Object.keys(WEAPONS).filter(id => WEAPONS[id].army === ck && WEAPONS[id].stars === stars);
function weaponResult(ck, stars){ const it = addWeapon(ck, pick(weaponPool(ck, stars))); return {stars, weapon: WEAPONS[it.id], kind: 'new'}; }
// Debug: everyone recruiting can give this army, as if pulled: every ★★★ from every banner (seasonal ones too), every
// company soldier (the standard company and every banner's troops), and every banner attire whose character is here.
// Units already in the army (or fallen) are left as they are. Returns how many joined.
function debugRecruitAll(ck){
  const st = SAVE.camps[ck], army = GACHA_ARMY[ck]; let n = 0;
  const banners = army.banners.map(b => ({...b, army: ck}));
  for (const key of new Set([...army.rares, ...banners.flatMap(b => [...bannerPool(b), ...(b.featured || [])])]))
    if (CHARACTERS[key] && !st.roster.some(r => r.key === key)){ const rec = recordFor(key); rec.uid = `${key}-${Date.now().toString(36)}`; rec.stars = 3; st.roster.push(rec); n++; }
  for (const set of [null, ...new Set(banners.map(b => b.troops).filter(Boolean))])
    for (const tpl of companyOf(ck, set)) if (!st.roster.some(r => r.gid === tpl.id)){ st.roster.push(asCompanySoldier(makeRecruit(ck, tpl.cls), tpl)); n++; }
  grantAttires(ck, banners.flatMap(b => b.attires || []));
  return n;
}
function grantPull(ck, banner, stars){
  const army = GACHA_ARMY[ck], st = SAVE.camps[ck];
  if (stars === 3){
    const pool = bannerPool(banner), feat = [...(banner.featured || []), ...(banner.attires || []).map(id => 'attire:' + id)];
    const key = feat.length && (!pool.length || Math.random() < GACHA.featuredShare) ? pick(feat) : pick(pool);   // a banner whose only ★★★ is an attire always gives it
    // a featured attire: for its character, if they're in the army and don't have it yet; otherwise a ★★★ weapon
    if (key.startsWith('attire:')){
      const id = key.slice(7), a = ATTIRES[id], rec = st.roster.find(r => r.key === a.char && !r.departed);
      if (!rec || rec.attires?.includes(id)) return weaponResult(ck, 3);
      grantAttires(ck, [id]);
      return {stars, attire: a, attireId: id, rec, kind: 'attire'};
    }
    const have = st.roster.find(r => r.key === key && !r.dead);
    if (have) return weaponResult(ck, 3);   // already with you: a ★★★ weapon instead
    const fallen = st.roster.find(r => r.key === key && r.dead && !r.departed);
    if (fallen){ fallen.dead = false; return {stars, rec: fallen, kind: 'back'}; }   // the same unit, stitched back up
    const rec = recordFor(key); rec.uid = `${key}-${Date.now().toString(36)}`; rec.stars = 3;
    st.roster.push(rec);
    return {stars, rec, kind: 'new'};
  }
  const tpl = pick(companyOf(ck, banner.troops).filter(t => t.stars === stars));
  const have = st.roster.find(r => r.gid === tpl.id && !r.dead);
  if (have) return weaponResult(ck, stars);   // already with you: a weapon of their rarity instead
  // a fallen soldier comes back, stitched up, with their level
  const fallen = st.roster.find(r => r.gid === tpl.id && r.dead);
  if (fallen){ fallen.dead = false; return {stars, rec: fallen, kind: 'back'}; }
  const rec = asCompanySoldier(makeRecruit(ck, tpl.cls), tpl);
  st.roster.push(rec);
  return {stars, rec, kind: 'new'};
}
// Spend pull currency on n pulls from a banner. Returns the results, or null if it can't be afforded.
function doPull(ck, bannerId, n){
  const g = gachaState(ck), banner = findBanner(ck, bannerId);
  const cur = bannerCur(ck, banner).key;   // Whispers/Writs, or an event's Gifts
  if (!banner || !bannerOpen(banner) || (g[cur] || 0) < n) return null;
  g[cur] -= n;
  let pity = g.pity[bannerId] || 0;
  const rolls = [];
  for (let i = 0; i < n; i++){
    let stars = rollRarity(pity);
    if (n >= 10 && i === n - 1 && stars < GACHA.tenPullFloor && !rolls.some(s => s >= GACHA.tenPullFloor)) stars = GACHA.tenPullFloor;
    pity = stars === 3 ? 0 : pity + 1;
    rolls.push(stars);
  }
  const results = rolls.map(stars => grantPull(ck, banner, stars));
  g.pity[bannerId] = pity; g.total += n;
  saveGame();
  return results;
}
function tradeForToken(ck){
  const st = SAVE.camps[ck], army = GACHA_ARMY[ck];
  if (st.res < army.trade) return false;
  st.res -= army.trade; gachaState(ck).tokens += 1; saveGame();
  return true;
}
function releaseUnit(ck, uid){
  const st = SAVE.camps[ck], i = st.roster.findIndex(r => r.uid === uid), rec = st.roster[i];
  if (!rec || rec.lord || !isGachaUnit(rec)) return 0;
  const back = rec.dead ? 0 : GACHA.release[rec.stars || 1];
  rec.arm = null;   // their weapon stays in the Armoury
  st.roster.splice(i, 1); st.res += back; saveGame();   // money, not pull currency
  return back;
}
