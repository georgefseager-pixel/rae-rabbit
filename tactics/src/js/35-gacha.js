// ================= Recruitment rules (gacha) =================
function gachaState(ck){
  const st = SAVE.camps[ck];
  if (!st.gacha) st.gacha = {tokens: GACHA.startTokens, pity: {}, total: 0};
  return st.gacha;
}
const bannerOpen = b => !b.after || SAVE?.debugUnlock || isCleared(b.after);   // debug unlock opens every banner
const findBanner = (ck, id) => GACHA_ARMY[ck].banners.find(b => b.id === id);
const isGachaUnit = rec => rec.key === 'recruit' || CHARACTERS[rec.key]?.stars === 3;

function rollRarity(pity){
  if (pity >= GACHA.pity - 1) return 3;
  const r = Math.random()*100, R = GACHA.rarity;
  return r < R[3].rate ? 3 : r < R[3].rate + R[2].rate ? 2 : 1;
}
function bondBoost(rec){
  rec.stats.mhp += 1;
  const keys = ['atk', 'def', 'spd', 'skl'];
  for (let i = 0; i < 2; i++) rec.stats[keys.splice(Math.floor(Math.random()*keys.length), 1)[0]] += 1;
}
function grantPull(ck, banner, stars){
  const army = GACHA_ARMY[ck], st = SAVE.camps[ck];
  if (stars === 3){
    const pool = banner.pool || army.rares;
    const key = banner.featured && Math.random() < GACHA.featuredShare ? pick(banner.featured) : pick(pool);
    const have = st.roster.find(r => r.key === key && !r.dead);
    if (have){
      if ((have.bond || 0) < GACHA.bondMax){ have.bond = (have.bond || 0) + 1; bondBoost(have); return {stars, rec: have, kind: 'bond'}; }
      gachaState(ck).tokens += GACHA.release[3];
      return {stars, rec: have, kind: 'refund', refund: GACHA.release[3]};
    }
    const rec = recordFor(key); rec.uid = `${key}-${Date.now().toString(36)}`; rec.stars = 3; rec.bond = 0;
    st.roster.push(rec);
    return {stars, rec, kind: 'new'};
  }
  const rec = makeRecruit(ck, pick(army.generic));
  rec.stars = stars;
  if (stars === 2){ rec.stats.mhp += 2; for (const k of ['atk', 'def', 'spd', 'skl']) rec.stats[k] += 1; rec.wtier = 1; }
  st.roster.push(rec);
  return {stars, rec, kind: 'new'};
}
// Spend pull currency on n pulls from a banner. Returns the results, or null if it can't be afforded.
function doPull(ck, bannerId, n){
  const g = gachaState(ck), banner = findBanner(ck, bannerId);
  if (!banner || !bannerOpen(banner) || g.tokens < n) return null;
  g.tokens -= n;
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
  st.roster.splice(i, 1); gachaState(ck).tokens += back; saveGame();
  return back;
}
