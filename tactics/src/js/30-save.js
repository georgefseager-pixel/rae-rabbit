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
function recordFor(key){
  const c = CHARACTERS[key];
  return {uid: key, key, name: c.name, faction: c.faction, cls: c.cls, look: key, lv: c.lv, exp: 0, stats: {...c.stats},
          wtier: 0, wname: c.wname || CLASSES[c.cls].wname, lord: !!c.lord, dead: false};
}
function newSave(){
  return {v: 1, current: 'rae', flags: {}, camps: Object.fromEntries(Object.entries(CAMPAIGNS).map(([k, c]) =>
    [k, {cleared: [], res: c.startRes, roster: c.start.map(recordFor), recruited: 0}]))};
}
const saveGame = () => Store.save(SAVE);
const isCleared = id => Object.values(SAVE.camps).some(c => c.cleared.includes(id));
const growthOf = rec => CHARACTERS[rec.key]?.g || CLASSES[rec.cls].g;
const weaponName = rec => WEAPON_TIERS[rec.wtier || 0].prefix + rec.wname;
const living = campKey => SAVE.camps[campKey].roster.filter(r => !r.dead);

function findChapter(id){
  for (const [camp, c] of Object.entries(CAMPAIGNS)){
    const i = c.chapters.findIndex(ch => ch.id === id);
    if (i >= 0) return {camp, i, ch: c.chapters[i]};
  }
  return null;
}
// done | next | gate (waiting on the other story) | stub (not written yet) | future
function chapterState(campKey, i){
  const camp = CAMPAIGNS[campKey], ch = camp.chapters[i], st = SAVE.camps[campKey];
  if (st.cleared.includes(ch.id)) return {s: 'done'};
  if (i > 0 && !st.cleared.includes(camp.chapters[i - 1].id)) return {s: 'future'};
  if (ch.stub) return {s: 'stub'};
  const missing = (ch.requires || []).filter(r => !isCleared(r));
  return missing.length ? {s: 'gate', missing} : {s: 'next'};
}
function currentChapterIndex(campKey){
  const n = CAMPAIGNS[campKey].chapters.length;
  for (let i = 0; i < n; i++) if (chapterState(campKey, i).s !== 'done') return i;
  return n - 1;
}

function recruitOptions(campKey){
  return CAMPAIGNS[campKey].recruits.filter(r => !r.after || isCleared(r.after));
}
function recruitLevel(campKey){
  const lv = living(campKey).map(r => r.lv);
  return Math.max(1, Math.floor(lv.reduce((a, b) => a + b, 0)/lv.length) - 1);
}
function makeRecruit(campKey, cls){
  const st = SAVE.camps[campKey], faction = CAMPAIGNS[campKey].faction, used = new Set(st.roster.map(r => r.name));
  const name = RECRUIT_NAMES[faction].find(n => !used.has(n)) || `${CLASSES[cls].name} ${st.recruited + 1}`;
  const lv = recruitLevel(campKey);
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
