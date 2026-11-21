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
  return {uid: key, key, name: c.name, faction: c.faction, cls: c.cls, look: c.look || key, lv: c.lv, exp: 0, stats: {...c.stats},
          wtier: 0, wname: c.wname || CLASSES[c.cls].wname, lord: !!c.lord, dead: false, outfit: c.outfit || ''};
}
// A chapter can dress its characters: {rae: 'camp'} uses art/raecamp-*.png, {rae: ''} goes back to the default art.
function applyOutfits(ck, outfits){
  for (const [key, o] of Object.entries(outfits || {})){
    for (const r of SAVE.camps[ck].roster) if (r.key === key) r.outfit = o;
    (SAVE.outfits ||= {})[key] = o;
  }
}
function newSave(){
  SAVE = {v: 2, current: 'rae', flags: {}, camps: Object.fromEntries(Object.entries(CAMPAIGNS).map(([k, c]) =>
    [k, {cleared: [], res: c.startRes, roster: c.start.map(recordFor), recruited: 0}]))};
  for (const [k, c] of Object.entries(CAMPAIGNS)) for (const cls of c.startRecruits || []) SAVE.camps[k].roster.push(makeRecruit(k, cls, c.startLevel || 1));
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
const saveGame = () => Store.save(SAVE);
const isCleared = id => Object.values(SAVE.camps).some(c => c.cleared.includes(id));
const growthOf = rec => CHARACTERS[rec.key]?.g || CLASSES[rec.cls].g;
const weaponName = rec => WEAPON_TIERS[rec.wtier || 0].prefix + rec.wname;
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
