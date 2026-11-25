// ================= Save state & armies =================
// SAVE = {v, current:'rae'|'frog', flags:{}, camps:{rae:{cleared:[], res, roster:[records], recruited}, frog:{...}}}
// A roster record is a unit's permanent self: level, experience, stats, weapon tier, and whether it has fallen.
let SAVE = null;

function scaledStats(cls, lv, bonus){
  const c = CLASSES[cls], s = {...c.base};
  for (const k of STAT_KEYS) s[k] += Math.round((lv - 1)*c.g[k]/100);
  if (bonus) for (const k in bonus) s[k] = (s[k] || 0) + bonus[k];
  return s;
}
// Older saves: the placeholder Masked Rabbit became The Condemned.
function migrateSave(s){
  if (!s?.camps) return s;
  s.stars = s.stars || {};
  // the day-7 log-in placeholders became Rae's Casual Wear (Tiggle's was dropped)
  for (const c of Object.values(s.camps)) for (const r of c.roster || []){
    if (!r.attires) continue;
    r.attires = [...new Set(r.attires.map(id => id === 'raeWeek' ? 'raeCasual' : id).filter(id => id !== 'tiggleWeek'))];
    if (r.attire === 'raeWeek') r.attire = 'raeCasual'; if (r.attire === 'tiggleWeek') r.attire = null;
  }
  // attires that were dropped (the festive placeholders) leave the wardrobe
  for (const c of Object.values(s.camps)) for (const r of c.roster || []){ if (r.attires) r.attires = r.attires.filter(id => ATTIRES[id]); if (r.attire && !ATTIRES[r.attire]) r.attire = null; }
  // the festive soldier Pip was renamed Cranberry (the name is saved for a future character)
  for (const r of s.camps.rae?.roster || []) if (r.gid?.startsWith('rae-festive-') && r.name === 'Pip') r.name = 'Cranberry';
  // Speshul became a bowman (his art arrived with a bow): his basic weapon follows, and a carried sword goes back
  for (const st of Object.values(s.camps)) for (const r of st.roster || []) if (r.key === 'speshul' && r.wname !== 'Sunrise Bow'){
    r.wname = 'Sunrise Bow'; const it = (st.arms || []).find(a => a.uid === r.arm); if (it && WEAPONS[it.id]?.type !== 'bow') r.arm = null; }
  // the placeholder Kumquat was replaced by Rae's Monkeyland Militia attire on Across the Stream
  for (const st of Object.values(s.camps)) if (st.roster) st.roster = st.roster.filter(r => r.key !== 'kumquat');
  // the placeholder Persimmon was replaced by Captain Cornelius on The Loyal Court
  for (const st of Object.values(s.camps)) if (st.roster) st.roster = st.roster.filter(r => r.key !== 'persimmon');
  // the mine clothes became attires when Rae and Flopsy changed into Republic colours (Chapter Two, stage 1)
  if (s.camps.rae?.cleared?.includes('R2-1')) for (const [key, id] of [['rae', 'raeRags'], ['sister', 'floraRags']]){ const r = s.camps.rae.roster.find(x => x.key === key); if (r && !(r.attires ||= []).includes(id)) r.attires.push(id); }
  // Willow became a Scholar (tomes): drop any bow she was carrying
  for (const st of Object.values(s.camps)) for (const r of st.roster || []) if (r.key === 'willow' && r.cls === 'quarter'){
    r.cls = 'scholar'; r.wname = CLASSES.scholar.wname; r.wtier = 0;
    const it = (st.arms || []).find(a => a.uid === r.arm); if (it && WEAPONS[it.id]?.type !== 'tome') r.arm = null;
  }
  for (const [ck, st] of Object.entries(s.camps)) for (const r of st.roster || []) { const sg = r.dead && st.cleared?.map(id => findStage(id)?.st).find(g => (g?.departs || []).includes(r.key)); if (sg){ r.departed = true; r.fallsIn = sg.fallsIn?.[r.key]; } }
  for (const st of Object.values(s.camps)) for (const r of st.roster || []) if (r.dead) r.arm = null;   // the fallen drop their weapons
  for (const st of Object.values(s.camps)) for (const r of st.roster || []) if (CHARACTERS[r.key] && !CHARACTERS[r.key].stars) r.stars = CHARACTERS[r.key].rarity || 3;   // story characters: ★★★, camp rabbits ★
  for (const st of Object.values(s.camps)) for (const r of st.roster || []) if (r.key === 'masked'){
    const c = CHARACTERS.condemned;
    Object.assign(r, {key: 'condemned', uid: r.uid === 'masked' ? 'condemned' : r.uid, name: c.name, look: c.look, cls: c.cls, wname: c.wname});
  }
  return s;
}
// ---------- Bonus stars ----------
// live: {lost, turn, lordHit, bossBy, deployed, over}. Returns 'ok' (earned, or on course), 'missed', or 'pending'.
function starText(ch, ck){ return ch.star ? ch.star.text.replace('{lord}', speakerName(CAMPAIGNS[ck].lord)) : ''; }
function starCheck(star, v){
  if (!star) return 'pending';
  switch (star.type){
    case 'noLosses': return v.lost > 0 ? 'missed' : v.over ? 'ok' : 'pending';
    case 'allies':   return v.allyLost > 0 ? 'missed' : v.over ? 'ok' : 'pending';
    case 'catch':    return (v.caught || 0) >= star.n ? 'ok' : v.over ? 'missed' : 'pending';
    case 'turns':    return v.turn > star.n ? 'missed' : v.over ? 'ok' : 'pending';
    case 'unhurt':   return v.lordHit ? 'missed' : v.over ? 'ok' : 'pending';
    case 'bossBy':   return v.bossBy ? (v.bossBy === star.key ? 'ok' : 'missed') : 'pending';
    case 'fewer':    return v.deployed > star.n ? 'missed' : v.over ? 'ok' : 'pending';
  }
  return 'pending';
}
// A story departure's status on the Army screen: 'Stayed behind', then 'Fallen' once the stage where they fall is won.
const departureLabel = rec => rec.fallsIn && isCleared(rec.fallsIn) ? 'Fallen' : 'Stayed behind';
const hasStar = id => !!SAVE.stars?.[id];
function recordFor(key){
  const c = CHARACTERS[key];
  return {uid: key, key, name: c.name, faction: c.faction, cls: c.cls, look: c.look || key, lv: c.lv, exp: 0, stats: {...c.stats},
          wtier: 0, wname: c.wname || CLASSES[c.cls].wname, lord: !!c.lord, dead: false, outfit: c.outfit || '',
          stars: c.rarity || 3};   // named characters are ★★★ (story or recruited) unless their data says otherwise
}
// A chapter can dress its characters: {rae: 'camp'} uses art/raecamp-*.png, {rae: ''} goes back to the default art.
function applyOutfits(ck, outfits){
  for (const [key, o] of Object.entries(outfits || {})){
    for (const r of SAVE.camps[ck].roster) if (r.key === key) r.outfit = o;
    (SAVE.outfits ||= {})[key] = o;
  }
}
function newSave(){
  SAVE = {v: 2, current: 'rae', flags: {}, stars: {}, camps: Object.fromEntries(Object.entries(CAMPAIGNS).map(([k, c]) =>
    [k, {cleared: [], res: c.startRes, roster: c.start.map(recordFor), recruited: 0}]))};
  // starting soldiers are members of the army's fixed company (★), so pulling them again gives a weapon
  for (const [k, c] of Object.entries(CAMPAIGNS)) for (const cls of c.startRecruits || []){
    const st = SAVE.camps[k], tpl = companyOf(k).find(t => t.stars === 1 && t.cls === cls && !st.roster.some(r => r.gid === t.id));
    const rec = makeRecruit(k, cls, c.startLevel || 1);
    st.roster.push(tpl ? asCompanySoldier(rec, tpl) : rec);
  }
  return SAVE;
}
// Story renames (Rabbit becomes Rae Rabbit). Speakers in later scenes pick the new name up from the roster.
function applyRename(ck, map){
  for (const [key, name] of Object.entries(map || {})){
    for (const r of SAVE.camps[ck].roster) if (r.key === key) r.name = name;
    (SAVE.names ||= {})[key] = name;   // story-only characters (not in any army) are renamed on the save
  }
}
function speakerName(who){
  for (const c of Object.values(SAVE?.camps || {})){ const r = c.roster.find(r => r.key === who); if (r) return r.name; }
  return SAVE?.names?.[who] || SPEAKERS[who]?.name || '';
}
// a character's name as the story has it now (Rabbit becomes Rae Rabbit, Little Sister becomes Flopsy Flora)
const charName = key => speakerName(key) || CHARACTERS[key]?.name || key;
const saveGame = () => Store.save(SAVE);
const isCleared = id => Object.values(SAVE.camps).some(c => c.cleared.includes(id));
const growthOf = rec => CHARACTERS[rec.key]?.g || CLASSES[clsOf(rec)].g;
const weaponName = rec => weaponOf(rec).name;   // see 33-arms.js
const living = campKey => SAVE.camps[campKey].roster.filter(r => !r.dead);

function findStage(id){
  for (const [camp, c] of Object.entries(CAMPAIGNS)){
    const i = c.stages.findIndex(s => s.id === id);
    if (i >= 0) return {camp, i, st: c.stages[i]};
  }
  return null;
}
// done | next | gate (waiting on the other story) | stub (not written yet) | future
function stageState(campKey, i){
  const camp = CAMPAIGNS[campKey], sg = camp.stages[i], st = SAVE.camps[campKey];
  if (st.cleared.includes(sg.id)) return {s: 'done'};
  if (SAVE.debugUnlock) return sg.stub ? {s: 'stub'} : {s: 'next'};   // debug: every written stage is playable
  if (i > 0 && !st.cleared.includes(camp.stages[i - 1].id)) return {s: 'future'};
  const missing = (sg.requires || []).filter(r => !isCleared(r));
  if (missing.length) return {s: 'gate', missing};
  return sg.stub ? {s: 'stub'} : {s: 'next'};
}
function currentStageIndex(campKey){
  const n = CAMPAIGNS[campKey].stages.length;
  for (let i = 0; i < n; i++) if (stageState(campKey, i).s !== 'done') return i;
  return n - 1;
}

function recruitLevel(campKey){
  const lv = living(campKey).map(r => r.lv);
  return Math.max(1, Math.floor(lv.reduce((a, b) => a + b, 0)/lv.length) - 1);
}
function makeRecruit(campKey, cls, fixedLv){
  const st = SAVE.camps[campKey], faction = CAMPAIGNS[campKey].faction, used = new Set(st.roster.map(r => r.name));
  const list = RECRUIT_NAMES[faction];
  let name = list.find(n => !used.has(n));
  for (let k = 2; !name; k++) name = list.map(n => `${n} ${ROMAN(k)}`).find(n => !used.has(n));
  const lv = fixedLv || recruitLevel(campKey);
  st.recruited++;
  return {uid: `${cls}-${Date.now().toString(36)}-${st.recruited}`, key: 'recruit', name, faction, cls, look: CLASS_LOOK[cls],
          lv, exp: 0, stats: scaledStats(cls, lv), wtier: 0, wname: CLASSES[cls].wname, lord: false, dead: false};
}

// Roll level-up gains for a record-shaped object ({lv, stats or flat stats}); guarantees at least one.
function rollLevel(statsObj, g){
  const ups = {};
  for (const s of STAT_KEYS) ups[s] = Math.random()*100 < g[s] ? 1 : 0;
  if (!STAT_KEYS.some(s => ups[s])) ups[STAT_KEYS[Math.floor(Math.random()*STAT_KEYS.length)]] = 1;
  for (const s of STAT_KEYS) statsObj[s] += ups[s];
  return ups;
}
