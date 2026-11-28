// ================= Battle engine =================
// runBattle(campKey, chapter, deployedRecords) plays one chapter and resolves with
// {win, retreated, turn, survivors, lost}. Team 'p' is whoever the player controls
// (rabbits or frogs); team 'e' is the AI.
let B = null;   // {ch (the stage), campKey, pf, ef, kills, waves, resolve, done}
let MAP = [], COLS = 8, ROWS = 12;
let units = [], turn = 1, phase = 'p', mode = 'idle', busy = false, nextId = 1;
let sel = null, orig = null, reachMap = null, moveKeys = new Set(), atkKeys = new Set(), healKeys = new Set();
let targets = [], tmode = null, fc = null, inspect = null, showDanger = false, dangerKeys = new Set(), cursor = null;
let fortOwner = new Map();

const ter = (x, y) => TER[MAP[y][x]];
const K = (x, y) => y*COLS + x, KX = k => k % COLS, KY = k => Math.floor(k / COLS);
const man = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
const team = t => units.filter(u => !u.dead && u.team === t);
// Allies (team 'a') fight on the player's side but act on their own, in an allied phase.
const sideOfTeam = u => u.team === 'e' ? 'e' : 'p';
const foes = u => units.filter(o => !o.dead && sideOfTeam(o) !== sideOfTeam(u));
const friends = u => units.filter(o => !o.dead && sideOfTeam(o) === sideOfTeam(u));
const unitAt = (x, y) => units.find(u => !u.dead && u.x === x && u.y === y);
const inBounds = (x, y) => x >= 0 && y >= 0 && x < COLS && y < ROWS;
const healAmt = u => 8 + Math.floor(u.atk/2);

function moveCost(u, x, y){
  const ch = MAP[y][x], c = TER[ch].cost;
  if (c >= 99) return 99;
  if (u.mt === 'mounted'){ if (ch === 'F') return 3; if (ch === 'M') return 99; }
  if (u.mt === 'armor' && ch === 'M') return 99;
  if (u.mt === 'bog' && ch === 'M') return 2;
  if (u.mt === 'climb' && ch === 'F') return 1;   // monkeys swing through trees and flowers   // monkeys swing through trees and flowers
  return c;
}

// ---------- Setup ----------
function battleUnit(rec, teamId){
  const c = CLASSES[clsOf(rec)], s = statsOf(rec), wp = weaponOf(rec), tb = wp.mt;
  const id = nextId++;
  return {id, uid: rec.uid || `enemy-${id}`, fur: rec.fur, stars: rec.stars, rec, team: teamId, faction: rec.faction, key: rec.key, look: rec.look, attire: rec.attire, name: rec.name, cls: clsOf(rec),
    wname: wp.name, tb, whit: wp.hit || 0, wcrit: wp.crit || 0, lash: !!wp.lash, lv: rec.lv, exp: rec.exp || 0, hp: s.mhp, mhp: s.mhp, atk: s.atk + tb, def: s.def, spd: s.spd, skl: s.skl, mov: s.mov,
    w: wp.type, rng: wp.rng || c.rng, mt: c.mt, ai: 'charge', lord: !!rec.lord, boss: false, g: growthOf(rec),
    moved: false, dead: false, x: 0, y: 0, px: 0, py: 0, ox: 0, oy: 0, flash: 0, alpha: 1, shp: s.mhp};
}
function enemyUnit(sp, faction, teamId = 'e'){
  // a spawn can belong to another side (e.g. rabbit bandits among frog soldiers); monkeys are Monkeyland's, whoever they fight for
  faction = sp.faction || (LOOKS[sp.look || CLASS_LOOK[sp.cls]]?.sp === 'monkey' ? 'monkey' : faction);
  const rec = {key: sp.key || 'enemy', look: sp.look || CLASS_LOOK[sp.cls], name: sp.name || CLASSES[sp.cls].name, faction, cls: sp.cls, fur: sp.fur,
               lv: sp.lv, stats: scaledStats(sp.cls, sp.lv, sp.bonus), wtier: 0, wname: CLASSES[sp.cls].wname};
  // Armoured enemies (armoured guards, Lily Knights, Biggle as an enemy) lose some Def, more at higher levels: their class
  // Def growth outpaces anything the player's attack can catch up with, and nothing in the game pierces armour.
  if (teamId === 'e' && CLASSES[sp.cls].mt === 'armor') rec.stats.def = Math.max(0, rec.stats.def - (2 + Math.floor(sp.lv/4)));
  // Every enemy has 1 less Def than its class (with the +10 Hit your side gets in calc): ordinary soldiers fall in one or
  // two turns when surrounded, instead of three or four (see tools/balance_audit.js, SLOG).
  if (teamId === 'e') rec.stats.def = Math.max(0, rec.stats.def - 1);
  if (sp.elite){ rec.stars = 2; rec.stats.mhp += 2; for (const k of ['atk', 'def', 'spd', 'skl']) rec.stats[k] += 1; }
  // chapter-wide difficulty tuning (see enemyMods in 25-data-campaign.js)
  if (teamId === 'e') for (const [k, v] of Object.entries(B?.ch?.enemyMods || B?.ch?.chapter?.enemyMods || {})) rec.stats[k] = Math.max(k === 'mhp' ? 8 : 0, rec.stats[k] + v);
  // talk: lines this boss / named enemy says the first time anyone fights it (bosses fall back to the stage's bossTalk)
  const talk = sp.talk || (sp.boss ? B?.ch?.bossTalk : null);
  return Object.assign(battleUnit(rec, teamId), {ai: sp.ai || 'charge', boss: !!sp.boss, flees: !!sp.flees, vip: !!sp.vip, courier: !!sp.courier, defects: !!sp.defects, talk, talked: false,
    parley: sp.parley || null, squad: sp.squad || null, fleeWord: sp.fleeWord || null});   // parley: can be talked round (Chapter Five)
}
function place(u, x, y){ u.x = u.px = x; u.y = u.py = y; }
function freeTileNear(x, y){
  const seen = new Set([K(x, y)]), q = [[x, y]];
  while (q.length){
    const [cx, cy] = q.shift();
    if (TER[MAP[cy][cx]].cost < 99 && !unitAt(cx, cy)) return [cx, cy];
    for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const nx = cx + dx, ny = cy + dy;
      if (inBounds(nx, ny) && !seen.has(K(nx, ny))){ seen.add(K(nx, ny)); q.push([nx, ny]); }
    }
  }
  return [x, y];
}

function runBattle(campKey, ch, records, opts = {}){
  B = {ch, campKey, pf: CAMPAIGNS[campKey].faction, ef: ch.enemyFaction, kills: 0, done: false, deployed: records.length, lordHit: false, bossBy: null,
       waves: ch.reinforce ? ch.reinforce(SAVE.flags) : [],
       objective: {...ch.objective}, twist: ch.twist ? {...ch.twist} : null, bells: {p: 0, e: 0},
       events: opts.replay ? (ch.events || []).filter(ev => ev.defect).map(ev => ({turn: ev.turn, defect: ev.defect, popup: ev.popup})) : (ch.events || []).map(ev => ({...ev}))};   // story events only happen the first time
  mapDef = MAPS[ch.map]; MAP = [...mapDef.rows]; ROWS = MAP.length;   // a copy: the tide can change it COLS = MAP[0].length;
  nextId = 1; units = [];
  // solo: only the leader starts on the field; the rest arrive with the stage's twist
  const starting = ch.solo ? records.filter(r => r.lord) : records;
  B.reserve = ch.solo ? records.filter(r => !r.lord) : [];
  starting.forEach((r, i) => { const u = battleUnit(r, 'p'); place(u, ...ch.deploy[i]); units.push(u); });
  // lead: someone else leads this battle (it's lost if they fall), e.g. Flopsy Flora's side stories
  if (ch.lead) for (const u of units) if (u.team === 'p') u.lord = u.key === ch.lead;
  for (const sp of ch.allies ? ch.allies(SAVE.flags) : []){ const u = enemyUnit(sp, B.pf, 'a'); place(u, ...freeTileNear(sp.x, sp.y)); units.push(u); }
  for (const sp of ch.enemies(SAVE.flags)){ const u = enemyUnit(sp, B.ef); place(u, ...freeTileNear(sp.x, sp.y)); units.push(u); }
  fortOwner = new Map();
  MAP.forEach((row, y) => [...row].forEach((c, x) => {
    if (c !== 'T') return;
    let best = null; for (const u of units){ const d = Math.abs(u.x - x) + Math.abs(u.y - y); if (!best || d < best.d) best = {d, f: u.faction}; }
    fortOwner.set(K(x, y), best ? best.f : B.pf);
  }));
  turn = 1; phase = 'p'; clearSel(); inspect = null; showDanger = false; cursor = null; updateDanger();
  $('#panel').className = 'f-' + B.pf;
  mapZoom = null; showScreen('app'); resize(); refreshTop();
  const lord = units.find(u => u.team === 'p' && u.lord) || units.find(u => u.team === 'p'); if (lord) focusOn(lord.x, lord.y, true);
  return new Promise(res => { B.resolve = res; startPlayerPhase(); });
}
function finishBattle(win, retreated = false, reason = ''){
  if (!B || B.done) return;
  B.done = true; busy = true; mode = 'over'; $('#duel').hidden = true;
  Music.jingle(win ? 'victory' : 'defeat');
  B.resolve({win, retreated, reason, turn, bells: {...B.bells}, gifts: win && B.ch.event ? giftCount() : 0, star: win && B.ch.star ? starCheck(B.ch.star, {...starLive(), over: true}) : 'pending', survivors: units.filter(u => u.team === 'p' && !u.dead), lost: units.filter(u => u.team === 'p' && u.dead)});
}

// ---------- Movement & ranges ----------
// Blood in the Water (Ducky): any enemy of his below half HP
const smellsBlood = u => hasAb(u, 'blood') && foes(u).some(o => !o.dead && o.hp < o.mhp/2);
function reach(u){
  const holders = foes(u).filter(o => !o.dead && hasAb(o, 'holdline'));
  const guided = alliesNear(u, u, 2).some(o => hasAb(o, 'guiding')) ? 1 : 0;   // Guiding Nose: +1 Mov near Ilc
  const blood = smellsBlood(u) ? 2 : 0;   // Blood in the Water: Ducky hunts the wounded
  const map = new Map([[K(u.x, u.y), {d: 0, prev: -1}]]), open = [K(u.x, u.y)];
  while (open.length){
    open.sort((a, b) => map.get(a).d - map.get(b).d);
    const cur = open.shift(), cd = map.get(cur).d, cx = KX(cur), cy = KY(cur);
    // Hold the Line: a square next to Biggle (for his enemies) is as far as they go
    if (cd > 0 && holders.some(h => Math.abs(h.x - cx) + Math.abs(h.y - cy) === 1)) continue;
    for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const nx = cx + dx, ny = cy + dy;
      if (!inBounds(nx, ny)) continue;
      const c = moveCost(u, nx, ny); if (c >= 99) continue;
      const o = unitAt(nx, ny); if (o && sideOfTeam(o) !== sideOfTeam(u)) continue;
      const nd = cd + c; if (nd > (u.hobbled ? 1 : u.mov + guided + blood)) continue;
      const nk = K(nx, ny), prev = map.get(nk);
      if (!prev || nd < prev.d){ map.set(nk, {d: nd, prev: cur}); open.push(nk); }
    }
  }
  return map;
}
const destinations = (u, map) => [...map.keys()].filter(k => { const o = unitAt(KX(k), KY(k)); return !o || o === u; });
function rangeTiles(fromKeys, rng){
  const out = new Set();
  for (const k of fromKeys){
    const x = KX(k), y = KY(k);
    for (let dy = -rng[1]; dy <= rng[1]; dy++) for (let dx = -rng[1]; dx <= rng[1]; dx++){
      const d = Math.abs(dx) + Math.abs(dy), nx = x + dx, ny = y + dy;
      if (d < rng[0] || d > rng[1] || !inBounds(nx, ny)) continue;
      out.add(K(nx, ny));
    }
  }
  return out;
}
function pathTo(map, k){ const p = []; while (k !== -1){ p.unshift(k); k = map.get(k).prev; } return p; }
function threat(u){
  if (u.w === 'staff') return new Set();
  return rangeTiles(u.ai === 'hold' ? [K(u.x, u.y)] : destinations(u, reach(u)), u.rng);
}
function updateDanger(){
  dangerKeys = new Set();
  if (showDanger) for (const e of team('e')) for (const k of threat(e)) dangerKeys.add(k);
}

// ---------- Combat math ----------
// ---------- Unique abilities in combat (14-data-abilities.js) ----------
const alliesNear = (u, pos, r) => friends(u).filter(o => o !== u && !o.dead && man(o, pos) <= r);
// Next to Me: a unit standing next to an ally, where one of them is Rae
const besideRae = (u, pos) => alliesNear(u, pos, 1).some(o => hasAb(o, 'nextto') || hasAb(u, 'nextto'));
const solo = (u, pos) => hasAb(u, 'nobody') && !alliesNear(u, pos, 2).length;   // Nobody Comes
const effSpd = (u, pos) => u.spd + (solo(u, pos) ? 3 : 0);
function calc(a, d, ap, dp){
  if (a.w === 'staff') return {can: false, dmg: 0, hit: 0, crit: 0, dbl: false, tri: 0};
  const t = d.offbal ? {def: 0, avo: 0} : ter(dp.x, dp.y), tri = triangle(a.w, d.w), dist = man(ap, dp);   // Off Balance: no cover
  let atk = a.atk + (solo(a, ap) ? 3 : 0) + (d.naughty ? 2 : 0) + (a.present ? 3 : 0), def = d.def + t.def + (d.seams || 0), hitB = 0, critB = 0;
  if (besideRae(a, ap)) atk += 1;
  if (besideRae(d, dp)) def += 1;
  if (hasAb(a, 'lancecharge') && (a.movedDist || 0) >= 3) atk += 3;
  if (hasAb(d, 'bait') && phase === 'e' && sideOfTeam(d) === 'p' && !d.baitUsed) def += 2;
  if (alliesNear(a, ap, 2).some(o => hasAb(o, 'listen'))) hitB += 10;
  if (hasAb(a, 'onestroke') && d.hp < d.mhp/2) critB += 25;
  if (hasAb(a, 'wecan') && d.lv > a.lv){ atk += 2; hitB += 10; }   // We Can Fight!
  if (hasAb(a, 'blood') && d.hp < d.mhp/2) atk += 2;   // Blood in the Water
  if (hasAb(a, 'grievance') && a.grudges?.has(d.id)) atk += 3;   // Every Grievance Noted
  if (hasAb(a, 'crowd')) atk += a.cheers || 0;   // Crowd Pleaser
  if (hasAb(d, 'cantcatch') && d.ranFar) hitB -= 25;
  if (d.offbal) hitB += 20;   // Off Balance (Tilly's Do Come Closer): −20 Avoid
  return {
    can: dist >= a.rng[0] && dist <= a.rng[1],
    dmg: Math.max(0, atk + tri - def),
    hit: clamp((sideOfTeam(a) === 'p' ? 85 : 75) + a.skl*2 + (a.whit || 0) + tri*15 + hitB - (effSpd(d, dp)*2 + t.avo), 0, 100),
    crit: clamp(Math.floor(a.skl/2) + (a.wcrit || 0) + critB - Math.floor(d.skl/4), 0, 100),
    dbl: effSpd(a, ap) - effSpd(d, dp) >= 4, tri,
  };
}
// a small popup the first time an ability changes something, so players see it working
function abilityPop(u, id){ const A = ABILITIES[id]; if (A) popup(u, `${A.icon} ${A.name}`, '#ecc673'); }

// ---------- Map animation ----------
let popups = [], shots = [], banner = null, shake = 0;
function popup(u, text, color){ popups.push({x: u.x + .5, y: u.y + .3, text, color, t0: performance.now(), dur: 950}); }
async function moveAlong(u, path){
  u.movedDist = (u.movedDist || 0) + Math.max(0, path.length - 1);
  if (hasAb(u, 'cantcatch') && u.movedDist >= 3) u.ranFar = true;   // Can't Catch Me: until his next turn
  for (let i = 1; i < path.length; i++){
    const fx = KX(path[i-1]), fy = KY(path[i-1]), tx = KX(path[i]), ty = KY(path[i]);
    Sfx.play('step');
    await tween(80, t => { u.px = fx + (tx - fx)*t; u.py = fy + (ty - fy)*t; });
  }
  const last = path[path.length - 1];
  u.x = u.px = KX(last); u.y = u.py = KY(last);
}

// ---------- Battle scene (attacker left, defender right) ----------
const duelEl = () => $('#duel');
const dEl = {L: $('#dL'), R: $('#dR')}, pEl = {L: $('#pL'), R: $('#pR')};
let duelSides = {};
const sideOf = u => duelSides[u.id] || (sideOfTeam(u) === 'p' ? 'L' : 'R');
function sprite(u, side){
  // Battle poses face right; flip them when the unit stands on the right as the defender.
  const art = artFor(u, 'battle'), sc = BATTLE_SIZE[artResolve(u, 'battle')] || 1;
  if (art) return `<img alt="" src="${art}"${side === 'R' ? ' class="flip"' : ''}${sc !== 1 ? ` style="height:calc(var(--sprH, 100%)*${sc})"` : ''}>`;
  return `<img alt="" class="plush" src="${plushPortrait(u.look)}">`;
}
function fillFighter(side, u, f, foe){
  const pf = dEl[side].querySelector('.pf');
  // clear leftover effects from the previous fight (e.g. the greyed-out defeat pose, which is held with fill:'forwards')
  for (const el of [pf, dEl[side]]) for (const a of el.getAnimations()) a.cancel();
  pf.innerHTML = sprite(u, side); pf.style.filter = ''; pf.style.transform = '';
  const pl = pEl[side]; pl.className = 'plate f-' + u.faction;
  pl.querySelector('.nm').textContent = u.name;
  const pulledIn = foe?.w === 'hook' && u.w !== 'staff' && u.rng[0] <= 1;   // a melee fighter a hook is about to pull in
  pl.querySelector('.ds').textContent = f.can ? `DMG ${f.dmg}${f.dbl ? '×2' : ''} · HIT ${f.hit} · CRIT ${f.crit}` : u.w === 'staff' ? 'Cannot strike' : pulledIn ? 'Strikes back if pulled in' : 'Out of reach';
  setDuelHp(u);
}
function setDuelHp(u){
  const pl = pEl[sideOf(u)], r = u.hp/u.mhp;
  pl.querySelector('.hpn').textContent = `${u.hp}/${u.mhp}`;
  const bar = pl.querySelector('.bar i'); bar.style.width = (r*100) + '%';
  bar.style.background = r > .5 ? '#6fbf6a' : r > .25 ? '#e0b44c' : '#e0533d';
}
async function openDuel(a, d){
  duelSides = {[a.id]: 'L', [d.id]: 'R'};
  fillFighter('L', a, calc(a, d, a, d), d); fillFighter('R', d, calc(d, a, d, a), a);
  const duel = duelEl(); duel.hidden = false;
  // one shared sprite height for every fight: as tall as the stage allows, but never so tall
  // that the widest pose (a weapon held out, about 1.5 times wider than tall) runs off the far side
  const ar = duel.querySelector('.arena').getBoundingClientRect();
  duel.style.setProperty('--sprH', Math.round(Math.min(ar.height*.86*.98, ar.width*.62/1.5)) + 'px');
  dEl.L.classList.add('atk'); dEl.R.classList.remove('atk');
  anim(dEl.L, [{transform: 'translateX(-60px)', opacity: 0}, {transform: 'none', opacity: 1}], 320);
  anim(dEl.R, [{transform: 'translateX(60px)', opacity: 0}, {transform: 'none', opacity: 1}], 320);
  anim(pEl.L, [{transform: 'translateY(20px)', opacity: 0}, {transform: 'none', opacity: 1}], 320);
  anim(pEl.R, [{transform: 'translateY(20px)', opacity: 0}, {transform: 'none', opacity: 1}], 320);
  await anim(duel, [{opacity: 0}, {opacity: 1}], 260);
}
async function closeDuel(){ await wait(450); const duel = duelEl(); await anim(duel, [{opacity: 1}, {opacity: 0}], 220); duel.hidden = true; }
function stamp(text, color){
  const s = $('#stamp'); s.textContent = text; s.style.color = s.style.borderColor = color;
  anim(s, [{opacity: 0, transform: 'translate(-50%,-50%) rotate(-9deg) scale(2.2)'}, {opacity: 1, transform: 'translate(-50%,-50%) rotate(-9deg) scale(1)', offset: .25},
    {opacity: 1, transform: 'translate(-50%,-50%) rotate(-9deg) scale(1)', offset: .8}, {opacity: 0, transform: 'translate(-50%,-50%) rotate(-9deg) scale(1)'}], 1100, {easing: 'cubic-bezier(.2,1.4,.4,1)'});
}
function duelPop(u, text, color){
  const p = dEl[sideOf(u)].querySelector('.pop'); p.textContent = text; p.style.color = color;
  anim(p, [{opacity: 0, transform: 'translateY(14px) scale(.7)'}, {opacity: 1, transform: 'translateY(0) scale(1.1)', offset: .2}, {opacity: 1, transform: 'translateY(-8px) scale(1)', offset: .7}, {opacity: 0, transform: 'translateY(-20px)'}], 900);
}

async function strike(a, d, f){
  const dx = d.x - a.x, dy = d.y - a.y, len = Math.hypot(dx, dy), ranged = man(a, d) > 1 && !a.lash;   // a whip lashes, it doesn't shoot
  const lx = dx/len*(ranged ? .12 : .32), ly = dy/len*(ranged ? .12 : .32);
  const duel = duelEl(), scene = !duel.hidden, A = dEl[sideOf(a)], D = dEl[sideOf(d)], dir = sideOf(a) === 'L' ? 1 : -1;
  if (scene) anim(A.querySelector('.pf'), [{transform: 'none'}, {transform: `translateX(${dir*(ranged ? 16 : 64)}px) rotate(${dir*3}deg)`}, {transform: 'none'}], 380, {easing: 'ease-in-out'});
  Sfx.play(a.w === 'tome' ? 'magic' : a.lash ? 'crack' : ((a.w === 'bow' || a.w === 'hook') && ranged) ? 'twang' : 'swing');
  await tween(140, t => { a.ox = lx*t; a.oy = ly*t; });
  if (ranged){
    const s = {x0: a.x + .5, y0: a.y + .5, x1: d.x + .5, y1: d.y + .5, t: 0}; shots.push(s);
    await tween(170, t => { s.t = t; }); shots.splice(shots.indexOf(s), 1);
  }
  const roll = (Math.random()*100 + Math.random()*100)/2;   // two-roll hit, as in the classics
  if (roll < f.hit){
    const crit = Math.random()*100 < f.crit, dmg = crit ? f.dmg*3 : f.dmg;
    const from = d.hp; d.hp = Math.max(0, d.hp - (B.god && sideOfTeam(d) === 'p' ? 0 : dmg));   // (debug: invincible)
    if (d.hp <= 0 && from > 1 && hasAb(d, 'bend') && !d.bendUsed){ d.hp = 1; d.bendUsed = true; abilityPop(d, 'bend'); }   // Bend, Not Break
    if (hasAb(d, 'bait') && phase === 'e' && !d.baitUsed){ d.baitUsed = true; if (dmg >= 0) abilityPop(d, 'bait'); }
    if (hasAb(a, 'digging') && d.hp > 0){ d.hobbled = true; }   // Keep Them Digging: 1 square on its next turn
    if (hasAb(a, 'verse')){   // Healing Verse: allies beside her recover a little
      for (const o of alliesNear(a, a, 1)) if (o.hp < o.mhp){ const h = Math.min(3, o.mhp - o.hp); o.hp += h; o.shp = o.hp; popup(o, `+${h}`, '#9ff0b0'); }
    }
    if (hasAb(d, 'grievance') && dmg > 0 && d.hp > 0 && !(d.grudges ||= new Set()).has(a.id)){ d.grudges.add(a.id); a.grieved = true; setTimeout(() => popup(a, '📜 Noted!', '#f2a7c2'), 300); }   // Every Grievance Noted
    if (hasAb(a, 'starfall')){   // Shooting Star: 2 damage to every other enemy beside the target (never below 1 HP)
      let any = false;
      for (const o of alliesNear(d, d, 1)) if (o.hp > 1){ const h = Math.min(2, o.hp - 1); o.hp -= h; o.shp = o.hp; any = true; setTimeout(() => popup(o, `🌠 ${h}`, '#ffe08a'), 250); }
      if (any) abilityPop(a, 'starfall');
    }
    if (hasAb(a, 'naughty') && d.hp > 0 && !d.naughty){ d.naughty = true; abilityPop(a, 'naughty'); }   // Naughty List: +2 damage from everyone, all battle
    if (a.w === 'hook' && d.hp > 0) hookPull(a, d, scene);   // a hook drags what it catches one square closer
    if (d.lord && d.team === 'p' && dmg > 0) B.lordHit = true;
    popup(d, crit ? `${dmg}!` : String(dmg), crit ? '#ffd166' : '#ffffff');
    Sfx.play(crit ? 'crit' : dmg === 0 ? 'nodamage' : 'hit');
    if (crit){ shake = 1; if (scene){ stamp('CRITICAL', '#ffcf5a'); anim(duel, [{transform: 'none'}, {transform: 'translate(-8px,5px)'}, {transform: 'translate(7px,-4px)'}, {transform: 'translate(-4px,2px)'}, {transform: 'none'}], 380); } }
    if (scene){
      duelPop(d, dmg === 0 ? 'NO DAMAGE' : String(dmg), crit ? '#ffcf5a' : '#fff');
      anim(D.querySelector('.pf'), [{filter: 'brightness(3) saturate(0)', transform: `translateX(${-dir*10}px)`}, {filter: 'none', transform: 'none'}], 340);
      setDuelHp(d);
    }
    tween(280, t => { d.flash = 1 - t; d.shp = from + (d.hp - from)*t; });
  } else {
    popup(d, 'Miss', '#c5d3e3'); Sfx.play('miss');
    if (scene){ duelPop(d, 'MISS', '#c5d3e3'); anim(D.querySelector('.pf'), [{transform: 'none'}, {transform: `translateX(${-dir*26}px)`}, {transform: 'none'}], 380); }
  }
  await tween(150, t => { a.ox = lx*(1 - t); a.oy = ly*(1 - t); });
  await wait(scene ? 380 : 220);
  if (d.hp <= 0){
    if (d.boss && !B.bossBy) B.bossBy = a.key;   // who brought the boss down (for bonus stars)
    if (scene && d.flees){   // escapes instead of being unstitched (e.g. Brigand)
      stamp(d.fleeWord ? d.fleeWord.toUpperCase() : B.ch.spar || B.ch.yields ? 'YIELDS' : 'FLEES', '#ecc673'); Sfx.play('flee');
      anim(D.querySelector('.pf'), [{opacity: 1, transform: 'none'}, {opacity: 0, transform: `translateX(${dir*140}px)`}], 700, {fill: 'forwards'});
      await wait(500);
    } else if (scene){
      stamp('UNSTITCHED', '#e8493b'); Sfx.play('unstitch');
      anim(D.querySelector('.pf'), [{filter: 'none', transform: 'none'}, {filter: 'grayscale(1) brightness(.45)', transform: `translateY(18px) rotate(${-dir*6}deg)`}], 700, {fill: 'forwards'});
      await wait(500);
    }
    if (d.flees) popup(d, d.fleeWord ? d.fleeWord + '!' : B.ch.spar || B.ch.yields ? 'Yields!' : 'Fled!', '#ecc673');
    if (hasAb(a, 'crowd') && (a.cheers || 0) < 3){ a.cheers = (a.cheers || 0) + 1; popup(a, `🏆 The crowd roars! +${a.cheers}`, '#ffd166'); }   // Crowd Pleaser
    if (hasAb(a, 'cork')){ let any = false;   // Pop the Cork: allies within 2 recover 4 HP
      for (const o of alliesNear(a, a, 2)) if (o.hp < o.mhp){ const h = Math.min(4, o.mhp - o.hp); o.hp += h; o.shp = o.hp; any = true; setTimeout(() => popup(o, `🎉 +${h}`, '#9ff0b0'), 250); }
      if (any) abilityPop(a, 'cork'); }
    await tween(380, t => { d.alpha = 1 - t; }); d.dead = true;
    if (d.team === 'e') B.kills++;
  }
}

// Hooks: the square a target would be pulled into (one step closer to the hook), or null if it can't be pulled
// (out of the hook's 2-tile reach, the way is blocked by a unit or by ground the target can't stand on).
function pullSquare(a, d, ap = a, dp = d){
  if (man(ap, dp) !== 2) return null;
  for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
    const x = dp.x + dx, y = dp.y + dy;
    if (!inBounds(x, y) || man({x, y}, ap) !== 1) continue;
    const o = unitAt(x, y); if (o && o !== d && o !== a) continue;
    if (moveCost(d, x, y) >= 99) continue;
    return {x, y};
  }
  return null;
}
function hookPull(a, d, scene){
  const sq = pullSquare(a, d);
  if (!sq){ popup(d, 'Holds fast', '#c5d3e3'); if (scene) duelPop(d, 'HOLDS FAST', '#c5d3e3'); return; }
  const fx = d.x, fy = d.y; d.x = sq.x; d.y = sq.y; d.pulled = true;
  tween(220, t => { d.px = fx + (sq.x - fx)*t; d.py = fy + (sq.y - fy)*t; });
  popup(d, '🪝 Pulled!', '#f0965a'); Sfx.play('step');
  if (hasAb(a, 'closer')){ d.offbal = true; setTimeout(() => popup(d, '🎀 Off balance!', '#ffb3c6'), 450); }   // Do Come Closer: until its next turn
  if (hasAb(a, 'fuse') && sideOfTeam(d) !== sideOfTeam(a)){ d.fuse = true; setTimeout(() => abilityPop(a, 'fuse'), 500); }   // Lit Fuse: it goes off at the start of the next enemy turn
  if (scene) setTimeout(() => duelPop(d, 'PULLED IN', '#f0965a'), 380);
}
// Can x strike y right now? (Reach is checked again before every blow, because a hook can pull someone mid-fight:
// a pulled melee fighter can now strike back from beside the hook; a pulled ranged one can't.)
const canStrikeNow = (x, y) => !x.dead && !y.dead && calc(x, y, x, y).can && !(x.pulled && x.rng[1] > 1);
async function doCombat(a, d){
  // First time a boss or named enemy is fought (either side attacking): they speak before the duel,
  // and a named character on the other side answers with their retort if the lines don't already include them.
  const foe = [d, a].find(u => u.talk?.length && !u.talked);
  if (foe){
    foe.talked = true;
    if (foe.boss && !B.bossMusic){ B.bossMusic = true; Music.want('boss'); }   // the boss has spoken: the music turns
    const r = foe === a ? d : a, retort = CHARACTERS[r.key]?.retort, answered = foe.talk.some(l => l.who === r.key);
    await talk([...foe.talk, ...(retort && !answered ? [{who: r.key, text: retort}] : [])]);
  }
  // Guard Duty: Cornelius, next to the ally under attack, lunges at an attacker within 2 squares of him first (once a turn)
  const guard = friends(d).find(g => g !== d && !g.dead && !g.guardUsed && hasAb(g, 'guardduty') && man(g, d) === 1 && man(g, a) <= 2);
  if (guard){ guard.guardUsed = true; abilityPop(guard, 'guardduty'); await wait(250); await strike(guard, a, calc(guard, a, guard, a)); await wait(200); updateDanger(); if (a.dead){ checkEnd(); return; } }
  const A = calc(a, d, a, d), D = calc(d, a, d, a);
  // who strikes, in order; whether each blow lands in reach is checked as it comes (a hook can pull mid-fight)
  const hooked = a.w === 'hook' && d.w !== 'staff' && d.rng[0] <= 1;   // a melee target pulled in can strike back
  const counters = D.can || hooked, seq = [a];
  if (counters) seq.push(d);
  // Walked Away: below half HP, the defender strikes first
  if (D.can && hasAb(d, 'walkedaway') && d.hp < d.mhp/2){ seq.reverse(); abilityPop(d, 'walkedaway'); }
  else if (D.can && hasAb(d, 'plant') && d.planted){ seq.reverse(); abilityPop(d, 'plant'); }   // Plant the Spear: braced, she strikes first
  if (A.dbl) seq.push(a); else if (counters && D.dbl) seq.push(d);
  const hp0 = {a: a.hp, d: d.hp};
  a.pulled = d.pulled = false;
  speed = 1;
  await openDuel(a, d);
  for (const x of seq){ const y = x === a ? d : a; if (a.dead || d.dead) break; if (!canStrikeNow(x, y)) continue; await strike(x, y, calc(x, y, x, y)); }
  await closeDuel();
  a.pulled = d.pulled = false;
  speed = 1;
  a.present = false; d.present = false;   // Stocking Filler: the present is used up in one fight
  const p = a.team === 'p' ? a : d.team === 'p' ? d : null, e = p === a ? d : a;   // allies don't gain experience
  if (p && !p.dead && e.dead && hasAb(p, 'fingers')){ B.bonusRes = (B.bonusRes || 0) + 25; popup(p, '🪙 +25', '#ecc673'); }
  if (p && !p.dead){
    const dealt = (p === a ? hp0.d - d.hp : hp0.a - a.hp) > 0;
    const xp = e.dead ? Math.max(10, 30 + (e.lv - p.lv)*3 + (e.boss ? 40 : 0)) : dealt ? Math.max(1, 10 + (e.lv - p.lv)) : 1;
    await giveExp(p, xp);
  }
  // a twist on the boss's fall (e.g. a duel, then everyone else arrives)
  if (B.twist && !B.twist.done && B.twist.on === 'boss' && units.some(u => u.boss && u.dead)) await runTwist();
}
async function doHeal(h, t){
  const amt = Math.min(healAmt(h), t.mhp - t.hp), from = t.hp;
  t.hp += amt; popup(t, `+${amt}`, '#9ff0b0'); Sfx.play('heal');
  if (hasAb(h, 'seams')){ t.seams = 2; t.seamsBy = h.id; }
  if (hasAb(h, 'sanctuary')){ t.sanct = true; popup(t, '🪷 Sanctuary', '#ffc8d8'); }   // left in peace until the mender's next turn
  if (hasAb(h, 'present')){ t.present = true; popup(t, '🎁 A present!', '#ffb3c6'); }   // Stocking Filler: +3 damage in their next fight   // Mended Seams: +2 Def until the mender's next turn
  await tween(420, k => { t.shp = from + amt*k; t.flash = (1 - k)*.6; });
  await wait(200);
  if (h.team === 'p') await giveExp(h, 12);
}
async function giveExp(u, xp){
  // The Lesson: +20% near Willow
  if (u.team === 'p' && alliesNear(u, u, 2).some(o => hasAb(o, 'lesson'))) xp = Math.round(xp*1.2);
  const cap = u.team === 'p' ? levelCap(B.campKey) : Infinity;   // the level cap (30-save.js): no experience at the cap
  if (u.lv >= cap){ u.exp = 0; popup(u, `Lv ${cap} · cap`, '#c9c2b4'); await wait(300); return; }
  popup(u, `+${xp} EXP`, '#ecc673'); Sfx.play('exp');
  u.exp += xp;
  await wait(450);
  while (u.exp >= 100 && u.lv < cap){ u.exp -= 100; await levelUp(u); }
  if (u.lv >= cap) u.exp = 0;
}
async function levelUp(u){
  u.lv++;
  const ups = rollLevel(u, u.g);
  if (ups.mhp){ u.hp += 1; u.shp = u.hp; }
  await showLevelUp(u, ups);
}

// ---------- Panel ----------
function porHTML(u){ return `<div class="por f-${u.faction}">${portraitInner(u, 'panel')}</div>`; }
// ---------- Event couriers (31-data-events.js) ----------
const couriers = () => units.filter(u => u.courier);
// gifts so far: couriers caught (stealing) or couriers safe (escorting)
const giftCount = () => B.objective.type === 'bells' ? bellPay() : B.ch.escort ? couriers().filter(u => u.escaped || !u.dead).length : couriers().filter(u => u.dead && !u.escaped).length;
const giftLine = () => B.objective.type === 'bells' ? `<b>🔔 You ${B.bells.p} · Them ${B.bells.e}</b> (first to ${B.objective.n})` : `<b>${EVENTS[B.ch.event].icon} ${giftCount()} of ${eventMaxGifts(B.ch)} ${B.ch.escort ? 'safe' : 'caught'}</b>`;
const onExit = u => (B.ch.exits || []).some(([x, y]) => x === u.x && y === u.y);
function exitField(u){
  const f = new Array(COLS*ROWS).fill(Infinity), open = [];
  for (const [x, y] of B.ch.exits || []){ f[K(x, y)] = 0; open.push(K(x, y)); }
  while (open.length){
    open.sort((a, b) => f[a] - f[b]);
    const cur = open.shift(), cx = KX(cur), cy = KY(cur);
    for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const nx = cx + dx, ny = cy + dy; if (!inBounds(nx, ny)) continue;
      const c = moveCost(u, cx, cy); if (c >= 99) continue;
      const nk = K(nx, ny), nd = f[cur] + c;
      if (nd < f[nk]){ f[nk] = nd; open.push(nk); }
    }
  }
  return f;
}
// a courier runs for the nearest exit; reaching it, it leaves the map (escaped, or delivered)
async function courierAct(e){
  if (!onExit(e)){
    const map = reach(e), f = exitField(e);
    let bk = K(e.x, e.y);
    for (const dk of destinations(e, map)) if (f[dk] < f[bk] || (f[dk] === f[bk] && map.get(dk).d < map.get(bk).d)) bk = dk;
    if (bk !== K(e.x, e.y)){ await wait(150); await moveAlong(e, pathTo(map, bk)); }
  }
  if (onExit(e)){
    e.escaped = true; const safe = sideOfTeam(e) === 'p'; popup(e, safe ? (B.ch.event ? '🎁 Delivered!' : 'Safe!') : 'Got away!', safe ? '#9ff0b0' : '#ffb3a6'); Sfx.play(safe ? 'coin' : 'flee');
    await tween(380, t => { e.alpha = 1 - t; }); e.dead = true;
  }
  updateDanger();
}
function objectiveText(){
  const ob = B.objective, lord = units.find(u => u.team === 'p' && u.lord);
  const runner = units.find(u => u.boss && u.ai === 'courier');
  const goal = ob.type === 'boss' ? `${runner ? 'Catch' : 'Defeat'} ${units.find(u => u.boss)?.name || 'the commander'}${ob.limit ? ` by the end of turn ${ROMAN(ob.limit)}` : ''}${runner ? ` before they reach ${ob.dest || 'the gold squares'}` : ''}.`
    : ob.type === 'survive' ? (B.ch.escort ? `Protect the ${ob.who || 'couriers'} until the end of turn ${ROMAN(ob.turns)} (${Math.max(0, ob.turns - turn + 1)} to go), or until they reach ${ob.dest || 'the road'}.` : `Survive until the end of turn ${ROMAN(ob.turns)} (${Math.max(0, ob.turns - turn + 1)} to go).`)
    : ob.type === 'intercept' ? `Catch as many ${ob.who || 'couriers'} as you can before they reach ${ob.dest || 'the road'}.${B.ch.event ? '' : ` ${couriers().filter(u => u.dead && !u.escaped).length} caught.`}`
    : ob.type === 'escape' ? (ob.reach ? `Get ${lord?.name || 'your leader'} to ${ob.dest || 'the gold squares'}.` : `Get ${lord?.name || 'your leader'} out: reach ${ob.dest || 'the gold squares'}.`)
    : ob.type === 'bells' ? `Hold the bells: each one you stand on at the end of your turn rings once. Ring ${ob.n} before they do.` : 'Rout the enemy.';
  if (B.ch.event) return `${goal} ${giftLine()}`;
  const tide = B.ch.tide ? (tideHigh() ? ' 🌊 High tide: the flats are under water.' : tideComing() ? ' 🌊 The tide comes in next turn: get off the marked flats!' : ' 🌊 Low tide: the flats are dry, for now.') : '';
  const must = [lord, ...units.filter(u => u.team !== 'e' && u.vip && !u.dead)].filter(Boolean).map(u => u.name);
  return `${goal} ${must.length ? must.join(' and ') + ' must not fall.' : ''}${tide}`;
}
const starLive = () => ({talked: B.talked || 0, caught: couriers().filter(u => u.team === 'e' && u.dead && !u.escaped).length, allyLost: units.filter(u => u.team === 'a' && u.dead && !u.escaped).length, lost: units.filter(u => u.team === 'p' && u.dead).length, turn, lordHit: B.lordHit, bossBy: B.bossBy, deployed: B.deployed, over: false});
function starHTML(){
  if (!B.ch.star) return '';
  const st = starCheck(B.ch.star, starLive()), had = hasStar(B.ch.id);
  return `<div class="hint starline ${st}">${had ? '★' : '☆'} Bonus: ${starText(B.ch, B.campKey)}${st === 'missed' ? ' <b>· missed</b>' : st === 'ok' ? ' <b>· done</b>' : ''}${had ? ' <small>(already earned)</small>' : ''}</div>`;
}
function unitHTML(u){
  const t = ter(u.x, u.y), tn = tileInfo(MAP[u.y][u.x])[0], pct = u.hp/u.mhp*100;
  const col = pct > 50 ? '#6fbf6a' : pct > 25 ? '#e0b44c' : '#e0533d';
  const note = u.team === 'a' ? ' · Ally: fights on its own' : u.w === 'staff' ? ` · Mends ${healAmt(u)} HP` : u.boss ? ' · Commander' : (u.ai === 'guard' && !u.triggered) ? ' · Waits for you' : '';
  const parley = u.parley && u.team === 'e' ? `<div class="hint">💬 ${u.parley.by ? charName(u.parley.by) : 'Your units'} can talk ${u.name} round: stand next to them and choose Talk.${u.squad ? ' Their squad comes too.' : ''}</div>` : '';
  return `<div class="urow">${porHTML(u)}<div class="uinfo">
      <div class="uhead"><span class="nm">${u.name}</span><span class="cl">${CLASSES[u.cls].name} · Lv ${u.lv}${u.team === 'p' ? ` · ${u.exp} EXP` : ''}</span></div>
      <div class="hprow">HP ${u.hp}/${u.mhp}<div class="bar"><i style="width:${pct}%;background:${col}"></i></div></div>
      <div class="meta"><b>${u.wname}</b> · ${WTYPE[u.w]} · Rng ${u.rng[0] === u.rng[1] ? u.rng[0] : u.rng.join("–")}${note}</div>
      <div class="tr">${tn}${t.def || t.avo ? ` <b>+${t.def} Def +${t.avo} Avo</b>` : ''}</div>
      ${abilityOf(u) ? `<div class="abl">${abilityIcon(u)}${u.seams ? ' <i>Mended: +2 Def</i>' : ''}${u.hobbled ? ' <i>Slowed</i>' : ''}${smellsBlood(u) ? ' <i>🦈 Smells blood: +2 Mov</i>' : ''}${u.naughty ? ' <i>📜 Naughty: +2 damage taken</i>' : ''}${u.fuse ? ' <i>🧨 Lit fuse: goes off next enemy turn</i>' : ''}${u.offbal ? ' <i>🎀 Off balance: no cover, −20 Avoid</i>' : ''}${u.grieved ? ' <i>📜 On Princess\'s list: she deals +3 damage</i>' : ''}${u.cheers ? ` <i>🏆 Crowd Pleaser: +${u.cheers} damage</i>` : ''}${u.ranFar ? ' <i>🍪 Can\'t catch him: −25 Hit against him</i>' : ''}${u.present ? ' <i>🎁 Present: +3 damage next fight</i>' : ''}${u.sanct ? ' <i>🪷 Sanctuary: enemies leave them be</i>' : ''}</div>` : (u.seams || u.hobbled || u.naughty || u.fuse || u.offbal || u.grieved || u.present || u.sanct) ? `<div class="abl">${u.seams ? '<i>Mended: +2 Def</i>' : ''}${u.hobbled ? ' <i>Slowed: 1 square</i>' : ''}${u.naughty ? ' <i>📜 Naughty: +2 damage taken</i>' : ''}${u.fuse ? ' <i>🧨 Lit fuse: goes off next enemy turn</i>' : ''}${u.offbal ? ' <i>🎀 Off balance: no cover, −20 Avoid</i>' : ''}${u.grieved ? ' <i>📜 On Princess\'s list: she deals +3 damage</i>' : ''}${u.cheers ? ` <i>🏆 Crowd Pleaser: +${u.cheers} damage</i>` : ''}${u.present ? ' <i>🎁 Present: +3 damage next fight</i>' : ''}${u.sanct ? ' <i>🪷 Sanctuary: enemies leave them be</i>' : ''}</div>` : ''}
    </div></div>
    ${parley}
    <div class="stats">${[[isMagic(u.w) ? 'Mag' : 'Atk', u.atk], ['Def', u.def], ['Spd', u.spd], ['Skl', u.skl], ['Mov', u.mov]].map(([l, v]) => `<div><small>${l}</small><span>${v}</span></div>`).join('')}</div>`;
}
const setPanel = html => { $('#panel').innerHTML = html; };
function panelIdle(){
  if (phase !== 'p'){ setPanel(`<div class="hint"><em>${FACTIONS[B.ef].name} is moving…</em></div>`); return; }
  const left = team('p').filter(u => !u.moved).length;
  setPanel(`<div class="hint"><b>${left} unit${left === 1 ? '' : 's'} ready.</b> Tap one of yours to give orders. Tap an enemy to see how far it can reach.</div>
    <div class="hint"><em>${objectiveText()}</em></div>${starHTML()}`);
}
function panelSelected(u){ setPanel(unitHTML(u) + `<div class="hint">Tap a blue patch to march there, or tap ${u.name.split(' ')[0]} again to act in place.</div>`); }
function panelActions(u){
  const atk = u.w !== 'staff' && enemiesInRange(u).length, heal = u.w === 'staff' && healTargets(u).length;
  setPanel(unitHTML(u) + `<div class="acts">
    ${atk ? '<button class="btn primary" data-act="attack" type="button">Attack</button>' : ''}
    ${heal ? '<button class="btn primary" data-act="heal" type="button">Mend</button>' : ''}
    ${drawTargets(u).length ? '<button class="btn wide" data-act="draw" type="button">↩ Draw Back</button>' : ''}
    ${parleyTargets(u).length ? '<button class="btn primary" data-act="talk" type="button">💬 Talk</button>' : ''}
    <button class="btn" data-act="wait" type="button">Wait</button>
    <button class="btn" data-act="cancel" type="button">Undo</button></div>`);
}
function panelForecast(a, d){
  const A = calc(a, d, a, d);
  let D = calc(d, a, d, a), note = '';
  if (a.w === 'hook'){   // what the pull will do, if the hook lands
    const sq = pullSquare(a, d);
    if (!sq) note = '🪝 Something is in the way: no pull.';
    else if (d.w === 'staff' || d.rng[1] > 1){ D = {...D, can: false}; note = '🪝 On a hit, pulls them in. Pulled, a ranged foe can\'t strike back.'; }
    else { D = calc(d, a, sq, a); note = '🪝 On a hit, pulls them in, and they can strike back from beside you.'; }
  } else if (d.w === 'hook' && D.can && pullSquare(d, a)) note = '🪝 Their hook will pull you in if it lands.';
  const ar = x => x > 0 ? ' <span class="adv">▲</span>' : x < 0 ? ' <span class="dis">▼</span>' : '';
  const row = (l, a1, d1) => `<div class="v pc">${a1}</div><div class="l">${l}</div><div class="v ec">${d1}</div>`;
  setPanel(`<div class="fc">
      <div class="h pc">${a.name.split(' ')[0]}${ar(A.tri)}</div><div></div><div class="h ec">${d.name.split(' ').slice(-2).join(' ')}${ar(D.tri)}</div>
      ${row('HP', `${a.hp}/${a.mhp}`, `${d.hp}/${d.mhp}`)}
      ${row('Dmg', A.dmg + (A.dbl ? ' ×2' : ''), D.can ? D.dmg + (D.dbl ? ' ×2' : '') : '–')}
      ${row('Hit', A.hit, D.can ? D.hit : '–')}
      ${row('Crit', A.crit, D.can ? D.crit : '–')}
    </div>${note ? `<div class="hint">${note}</div>` : ''}
    <div class="acts"><button class="btn primary" data-act="confirm" type="button">Strike</button>
    <button class="btn" data-act="back" type="button">Back</button></div>`);
}
function panelHeal(h, t){
  const amt = Math.min(healAmt(h), t.mhp - t.hp);
  setPanel(unitHTML(t) + `<div class="hint">Stitch <b>${t.name}</b> back together for ${amt} HP (${t.hp} → ${t.hp + amt}).</div>
    <div class="acts"><button class="btn primary" data-act="confirm" type="button">Mend</button>
    <button class="btn" data-act="back" type="button">Back</button></div>`);
}
function refreshTop(){
  const f = phase === 'p' ? B.pf : B.ef;
  $('#turn').textContent = ROMAN(turn);
  $('#phase').textContent = FACTIONS[f].name;
  $('#phase').className = 'f-' + f;
  $('#endBtn').disabled = phase !== 'p' || busy || !(mode === 'idle' || mode === 'selected');
  $('#menuBtn').disabled = phase !== 'p' || busy;
  $('#dangerBtn').classList.toggle('on', showDanger);
}

// ---------- Player flow ----------
const enemiesInRange = u => foes(u).filter(o => { const d = man(u, o); return d >= u.rng[0] && d <= u.rng[1]; });
const healTargets = u => friends(u).filter(o => o !== u && man(u, o) === 1 && o.hp < o.mhp);
// Draw Back (Froggle): an adjacent ally, where the square behind her (away from them) is free for her to step into
const backSquare = (u, o) => ({x: u.x + (u.x - o.x), y: u.y + (u.y - o.y)});
// Talk (Chapter Five): an enemy with `parley` can be talked round by the unit it names (parley.by), standing next to it.
// It changes sides, with everyone in its squad, and fights on as an ally.
const parleyTargets = u => units.filter(o => o.team === 'e' && !o.dead && o.parley && (!o.parley.by || o.parley.by === u.key) && man(u, o) === 1);
function panelTalk(u, t){
  const n = units.filter(o => o.team === 'e' && !o.dead && o !== t && t.squad && o.squad === t.squad).length;
  setPanel(unitHTML(t) + `<div class="hint">💬 <b>Talk:</b> ${u.name} tries to talk ${t.name} round.${n ? ` If it works, ${n === 1 ? 'one more soldier comes' : n + ' more soldiers come'} with them.` : ''} It uses ${u.name}'s turn.</div>
    <div class="acts"><button class="btn primary" data-act="confirm" type="button">Talk</button>
    <button class="btn" data-act="back" type="button">Back</button></div>`);
}
async function doTalk(u, t){
  if (t.parley.talk) await talk(t.parley.talk);
  const squad = units.filter(o => o.team === 'e' && !o.dead && (o === t || (t.squad && o.squad === t.squad)));
  for (const o of squad){ o.team = 'a'; o.ai = 'charge'; o.boss = false; o.flees = false; o.talk = null; o.parley = null; popup(o, 'Changes sides!', '#9fd0ff'); }
  B.talked = (B.talked || 0) + 1; Sfx.play('coin'); updateDanger(); await wait(500);
}
const drawTargets = u => !hasAb(u, 'drawback') ? [] : friends(u).filter(o => { if (o === u || man(u, o) !== 1) return false;
  const b = backSquare(u, o); return inBounds(b.x, b.y) && moveCost(u, b.x, b.y) < 99 && !unitAt(b.x, b.y); });
function clearSel(){ sel = null; orig = null; reachMap = null; moveKeys = new Set(); atkKeys = new Set(); healKeys = new Set(); targets = []; fc = null; tmode = null; }

function select(u){
  clearSel(); inspect = null;
  sel = u; orig = {x: u.x, y: u.y}; reachMap = reach(u);
  moveKeys = new Set(destinations(u, reachMap));
  for (const k of rangeTiles(moveKeys, u.rng)) if (!moveKeys.has(k)) (u.w === 'staff' ? healKeys : atkKeys).add(k);
  mode = 'selected'; panelSelected(u); refreshTop();
}
function openActions(){
  mode = 'action'; moveKeys = new Set(); atkKeys = new Set(); healKeys = new Set(); targets = []; fc = null;
  for (const k of rangeTiles([K(sel.x, sel.y)], sel.rng)) (sel.w === 'staff' ? healKeys : atkKeys).add(k);
  panelActions(sel); refreshTop();
}
function startTargeting(kind){
  mode = 'target'; tmode = kind;
  targets = kind === 'attack' ? enemiesInRange(sel) : kind === 'draw' ? drawTargets(sel) : kind === 'talk' ? parleyTargets(sel) : healTargets(sel);
  if (targets.length === 1) chooseTarget(targets[0]);
  else setPanel(`<div class="hint">Tap a highlighted ${kind === 'attack' ? 'enemy' : 'ally'}.</div><div class="acts"><button class="btn" data-act="back" type="button">Back</button></div>`);
}
function chooseTarget(t){ fc = t; tmode === 'attack' ? panelForecast(sel, t) : tmode === 'draw' ? panelDraw(sel, t) : tmode === 'talk' ? panelTalk(sel, t) : panelHeal(sel, t); }
function panelDraw(u, t){
  setPanel(unitHTML(t) + `<div class="hint">${ABILITIES.drawback.icon} <b>Draw Back:</b> ${u.name} steps back, and ${t.name} takes her place, out of the front line.</div>
    <div class="acts"><button class="btn primary" data-act="confirm" type="button">Draw Back</button>
    <button class="btn" data-act="back" type="button">Back</button></div>`);
}
async function doDrawBack(u, t){
  const b = backSquare(u, t), from = {x: u.x, y: u.y};
  await moveAlong(u, [K(u.x, u.y), K(b.x, b.y)]); await moveAlong(t, [K(t.x, t.y), K(from.x, from.y)]);
  abilityPop(u, 'drawback'); Sfx.play('select'); await wait(300);
}
// Two Pairs of Paws: the free squares next to a unit it could step into
const scurrySquares = u => [[1,0],[-1,0],[0,1],[0,-1]].map(([dx, dy]) => ({x: u.x + dx, y: u.y + dy}))
  .filter(p => inBounds(p.x, p.y) && moveCost(u, p.x, p.y) < 99 && !unitAt(p.x, p.y)).map(p => K(p.x, p.y));
async function afterAction(){
  mode = 'idle'; updateDanger();
  if (checkEnd()) return;
  panelIdle(); refreshTop();
  if (team('p').every(p => p.moved)){ await wait(350); enemyPhase(); }
}
async function finishUnit(u){ u.moved = true; clearSel(); await afterAction(); }

async function onTap(x, y){
  if (!B || busy || phase !== 'p') return;
  cursor = {x, y};
  const u = unitAt(x, y), k = K(x, y);
  if (mode === 'idle' || mode === 'selected'){
    if (mode === 'selected'){
      if (u === sel){ openActions(); return; }
      if (moveKeys.has(k) && !u){
        busy = true; refreshTop();
        await moveAlong(sel, pathTo(reachMap, k));
        busy = false; openActions(); return;
      }
    }
    if (u && u.team === 'p' && !u.moved){ Sfx.play('select'); select(u); return; }
    Sfx.play('cursor');
    clearSel(); mode = 'idle';
    if (u){ inspect = u.team === 'e' && inspect !== u ? u : null; setPanel(unitHTML(u)); }
    else {
      inspect = null;
      const t = ter(x, y), ch = MAP[y][x], [tn, note] = tileInfo(ch);
      setPanel(`<div class="uhead"><span class="nm">${tn}</span><span class="cl">${t.cost >= 99 ? 'Impassable' : `Move cost ${t.cost}`}</span></div>
        <div class="hint"><em>${note}</em></div>
        <div class="hint">${t.def || t.avo ? `Units here gain <b>+${t.def} Def</b> and <b>+${t.avo} Avoid</b>.` : 'No cover.'}${ch === 'F' ? ' Mounted units pay 3 to enter.' : ''}${ch === 'M' ? ' Mounted and armoured units cannot climb.' : ''}</div>`);
    }
    refreshTop(); return;
  }
  if (mode === 'action'){
    if (u && sel.w !== 'staff' && enemiesInRange(sel).includes(u)){ startTargeting('attack'); chooseTarget(u); }
    else if (u && sel.w === 'staff' && healTargets(sel).includes(u)){ startTargeting('heal'); chooseTarget(u); }
    else if (u && drawTargets(sel).includes(u)){ startTargeting('draw'); chooseTarget(u); }
    else if (u && parleyTargets(sel).includes(u)){ startTargeting('talk'); chooseTarget(u); }
    return;
  }
  if (mode === 'target' && u && targets.includes(u)){ if (fc === u) act('confirm'); else chooseTarget(u); }
  if (mode === 'scurry' && !u && moveKeys.has(k)){ busy = true; moveKeys = new Set(); await moveAlong(sel, [K(sel.x, sel.y), k]); busy = false; finishUnit(sel); }
}

async function act(a){
  if (busy) return;
  if (a === 'attack') startTargeting('attack');
  else if (a === 'heal') startTargeting('heal');
  else if (a === 'draw') startTargeting('draw');
  else if (a === 'talk') startTargeting('talk');
  else if (a === 'wait') finishUnit(sel);
  else if (a === 'cancel'){ const u = sel; place(u, orig.x, orig.y); u.movedDist = 0; u.ranFar = false; select(u); }
  else if (a === 'back') openActions();
  else if (a === 'confirm' && fc){
    busy = true; refreshTop();
    const u = sel, t = fc, kind = tmode; mode = 'busy'; targets = []; atkKeys = new Set(); healKeys = new Set();
    setPanel(`<div class="hint"><em>${kind === 'attack' ? `${u.name} strikes at ${t.name}…` : kind === 'talk' ? `${u.name} talks to ${t.name}…` : kind === 'draw' ? `${u.name} draws ${t.name} back…` : `${u.name} mends ${t.name}…`}</em></div>`);
    if (kind === 'attack') await doCombat(u, t); else if (kind === 'talk') await doTalk(u, t); else if (kind === 'draw') await doDrawBack(u, t); else await doHeal(u, t);
    busy = false;
    if (u.dead){ clearSel(); await afterAction(); return; }
    // Two Pairs of Paws (Tandy & Maus): after mending, they may scurry one more square
    if (kind === 'heal' && hasAb(u, 'scurry')){
      const sq = scurrySquares(u);
      if (sq.length){ mode = 'scurry'; moveKeys = new Set(sq); abilityPop(u, 'scurry'); refreshTop();
        setPanel(unitHTML(u) + `<div class="hint">${ABILITIES.scurry.icon} <b>Two Pairs of Paws:</b> tap a blue square to scurry 1 more, or stay put.</div>
          <div class="acts"><button class="btn" data-act="wait" type="button">Stay</button></div>`); return; }
    }
    finishUnit(u);
  }
}

// ---------- The tide (Chapter Five: a stage's `tide`) ----------
// tide: {mask: rows ('~' = a tide flat), rises: [turns], falls: [turns]}. At the start of a rising turn's player phase
// the flats become sea (anyone standing on one is swept to the nearest dry square and loses 3 HP, never below 1);
// on a falling turn they're sand again. The flats are marked the turn before the sea comes in.
const tideFlats = () => { const m = B?.ch?.tide?.mask, out = []; if (m) m.forEach((r, y) => [...r].forEach((c, x) => { if (c === '~') out.push([x, y]); })); return out; };
const tideHigh = () => { const t = B?.ch?.tide; if (!t) return false; let hi = false; for (let n = 1; n <= turn; n++){ if (t.rises.includes(n)) hi = true; if (t.falls.includes(n)) hi = false; } return hi; };
const tideComing = () => { const t = B?.ch?.tide; return !!t && !tideHigh() && t.rises.includes(turn + 1); };
async function tideTurn(){
  const t = B.ch.tide; if (!t) return;
  const rise = t.rises.includes(turn), fall = t.falls.includes(turn); if (!rise && !fall) return;
  B.tideRows ||= [...MAP];
  for (const [x, y] of tideFlats()){ const ch = rise ? 'W' : B.tideRows[y][x]; MAP[y] = MAP[y].slice(0, x) + ch + MAP[y].slice(x + 1); }
  resize();
  if (rise){
    toast('🌊 The tide comes in!'); Sfx.play('flee');
    for (const u of units) if (!u.dead && MAP[u.y][u.x] === 'W'){
      const [nx, ny] = freeTileNear(u.x, u.y); await moveAlong(u, [K(u.x, u.y), K(nx, ny)]);
      const h = Math.min(3, u.hp - 1); u.hp -= h; u.shp = u.hp; popup(u, `🌊 Swept! −${h}`, '#9fd0ff'); await wait(200);
    }
  } else toast('The tide goes out.');
  updateDanger(); await wait(400);
}

// ---------- Phases ----------
async function showBanner(text, sub, f){ banner = {text, sub, f, t0: performance.now(), dur: 1400}; await wait(1400); banner = null; }
async function fortHeal(t){
  for (const u of team(t)){
    if (ter(u.x, u.y).heal && u.hp < u.mhp){
      const amt = Math.min(u.mhp - u.hp, Math.max(1, Math.round(u.mhp*.2))), from = u.hp;
      u.hp += amt; popup(u, `+${amt}`, '#9ff0b0'); tween(300, k => { u.shp = from + amt*k; });
    }
  }
  await wait(300);
}
async function startPlayerPhase(){
  const ob = B.objective;
  if (ob.limit && turn > ob.limit){ finishBattle(false, false, 'limit'); return; }
  phase = 'p'; busy = true; mode = 'busy';
  for (const u of team('p')) u.moved = false;
  for (const u of units) if (sideOfTeam(u) === 'p') u.offbal = false;   // Off Balance lasts until the pulled unit's next turn
  for (const u of units) if (sideOfTeam(u) === 'p') u.sanct = false;   // the player's Sanctuary lasts until their next turn
  for (const u of units){ if (sideOfTeam(u) === 'p') u.planted = false; else u.planted = (u.movedDist || 0) <= 1; }
  for (const u of units){ u.movedDist = 0; u.guardUsed = false; if (u.seams && units.find(h => h.id === u.seamsBy && sideOfTeam(h) === 'p')) u.seams = 0; }
  for (const u of units) if (sideOfTeam(u) !== 'p') u.hobbled = false;   // enemies' slowed turn is over
  for (const u of units) if (sideOfTeam(u) === 'p') u.ranFar = false;   // Can't Catch Me lasts until his next turn
  refreshTop(); panelIdle();
  Music.want(B.bossMusic ? 'boss' : 'battle'); Sfx.play('phase', 'p');
  await showBanner(FACTIONS[B.pf].playerLine, `Turn ${ROMAN(turn)}`, B.pf);
  await tideTurn();
  await fortHeal('p');
  await battleEvents();
  busy = false; mode = 'idle'; updateDanger(); panelIdle(); refreshTop();
}
// Story events during a battle (see `events` in 25-data-campaign.js): someone runs onto the field and joins in.
async function battleEvents(){
  for (const ev of B.events){
    if (ev.done || ev.turn !== turn || B.done) continue;
    ev.done = true;
    if (ev.join && !units.some(u => u.team === 'p' && u.key === ev.join && !u.dead)){   // (unless already deployed)
      // someone already in the army (and standing) runs in as themselves; otherwise they're new
      const have = SAVE.camps[B.campKey].roster.find(r => r.key === ev.join && !r.dead);
      const u = battleUnit(have || recordFor(ev.join), 'p'); u.vip = !!ev.mustSurvive;
      if (ev.bonus) for (const [k, v] of Object.entries(ev.bonus)){ u[k] += v; if (k === 'mhp'){ u.hp += v; u.shp = u.hp; } }   // for this battle only
      const [tx, ty] = freeTileNear(...ev.at); place(u, tx, ty); units.push(u); focusOn(tx, ty);
      // run in from beyond the edge of the map
      const fy = ROWS + .6;
      for (let s = 0; s < 3; s++) setTimeout(() => Sfx.play('step'), s*110);
      await tween(420, t => { u.py = fy + (ty - fy)*t; });
      u.py = ty; popup(u, 'Joins!', '#9fe09a');
      refreshTop(); panelIdle();
      await wait(350);
    }
    if (ev.talk) await talk(ev.talk);
    // defect: every unit spawned with defects:true changes sides (enemies become allies; allies turn on you)
    if (ev.defect){
      const who = units.filter(u => !u.dead && u.defects);
      for (const u of who){
        u.team = u.team === 'e' ? 'a' : 'e'; u.defects = false; u.ai = 'charge'; u.moved = false;
        popup(u, u.team === 'a' ? (ev.popup || 'Changes sides!') : (ev.popup || 'Betrayal!'), u.team === 'a' ? '#9fe09a' : '#ff9a8a');
      }
      if (who.length){ Sfx.play(who[0].team === 'a' ? 'select' : 'flee'); tokenCache.clear(); updateDanger(); refreshTop(); await wait(700); }
    }
  }
}
// A stage's twist (see `twist` in 25-data-campaign.js): once a survive objective is met, a scene plays,
// fresh enemies may arrive, and the battle goes on with a new objective.
async function runTwist(){
  const tw = B.twist; tw.done = true;
  if (tw.talk) await talk(tw.talk);
  // arrive: the units held back (a solo start) join now
  if (tw.arrive) for (const [i, r] of B.reserve.entries()){
    const u = battleUnit(r, 'p'), [x, y] = B.ch.deploy[i + 1] || B.ch.deploy[0];
    place(u, ...freeTileNear(x, y)); u.alpha = 0; units.push(u); tween(400, t => { u.alpha = t; });
  }
  if (tw.arrive && B.reserve.length){ const r = units.filter(u => u.team === 'p').pop(); focusOn(r.x, r.y); Sfx.play('step'); await wait(400); }
  let first = true;
  for (const sp of tw.units || []){
    const u = enemyUnit(sp, B.ef); place(u, ...freeTileNear(sp.x, sp.y)); u.alpha = 0; units.push(u);
    if (first){ focusOn(u.x, u.y); popup(u, tw.popup || 'More of them!', '#ffcf5a'); Sfx.play('reinforce'); first = false; }
    tween(400, t => { u.alpha = t; });
  }
  if (tw.units?.length) await wait(700);
  B.objective = {...tw.objective};
  refreshTop(); panelIdle();
}
// Lit Fuse (Speshul, Powder Monkey): at the start of the enemy turn, each lit fuse goes off. 5 damage to the enemy carrying
// it, 2 to each of that enemy's allies beside it. Returns true if that ended the battle.
async function litFuses(){
  const lit = units.filter(u => u.fuse && !u.dead); if (!lit.length) return false;
  for (const u of lit){
    u.fuse = false; focusOn(u.x, u.y); Sfx.play('crit'); shake = .8;
    const hits = [[u, 5], ...friends(u).filter(o => o !== u && !o.dead && man(o, u) === 1).map(o => [o, 2])];
    for (const [o, n] of hits){
      const from = o.hp; o.hp = Math.max(0, o.hp - n); popup(o, o === u ? `🧨 ${n}` : String(n), '#ffb347');
      tween(280, t => { o.flash = 1 - t; o.shp = from + (o.hp - from)*t; });
    }
    await wait(650);
    for (const [o] of hits) if (o.hp <= 0 && !o.dead){
      if (o.flees) popup(o, B.ch.spar || B.ch.yields ? 'Yields!' : 'Fled!', '#ecc673');
      if (o.boss && !B.bossBy) B.bossBy = 'speshul';
      await tween(380, t => { o.alpha = 1 - t; }); o.dead = true; if (o.team === 'e') B.kills++;
    }
    updateDanger(); refreshTop();
    if (checkEnd()) return true;
  }
  return false;
}
// ---------- Bells (objective 'bells', the New Year event) ----------
// Every fort square is a bell. At the end of a side's turn, each bell one of its units stands on rings once for it.
const bellSquares = () => { const out = []; MAP.forEach((row, y) => [...row].forEach((c, x) => { if (c === 'T') out.push([x, y]); })); return out; };
const onBell = u => MAP[u.y]?.[u.x] === 'T';
const bellHolder = ([x, y]) => { const u = unitAt(x, y); return u ? (sideOfTeam(u) === 'p' ? 'p' : 'e') : null; };
// pay by the margin: 12-0 pays the full 8, a 12-11 squeaker 1
const bellPay = () => Math.max(1, Math.min(BELL_PAY, Math.round(BELL_PAY*(B.objective.n - B.bells.e)/B.objective.n)));
async function ringBells(side){
  const held = bellSquares().filter(b => bellHolder(b) === side); if (!held.length) return false;
  let rang = 0;
  for (const [x, y] of held){ if (B.bells[side] >= B.objective.n) break; B.bells[side]++; rang++; popup({x, y}, '🔔 +1', side === 'p' ? '#ffd98a' : '#ffb3a6'); Sfx.play('coin'); await wait(260); }
  toast(`🔔 ${side === 'p' ? 'Your' : 'Their'} bells ring: +${rang} · You ${B.bells.p} – Them ${B.bells.e}`);
  refreshTop(); panelIdle(); await wait(500);
  if (B.bells[side] >= B.objective.n){ finishBattle(side === 'p', false, 'bells'); return true; }
  return false;
}
// the bell AI: hold a bell once on one (striking anything in reach); otherwise head for the nearest bell not held by its
// own side, and strike whoever is in reach on arrival (preferring whoever is standing on a bell)
async function bellAct(e){
  const mine = sideOfTeam(e) === 'p' ? 'p' : 'e';
  if (!onBell(e)){
    const goals = bellSquares().filter(b => bellHolder(b) !== mine), f = new Array(COLS*ROWS).fill(Infinity), open = [];
    for (const [x, y] of goals){ f[K(x, y)] = 0; open.push(K(x, y)); }
    while (open.length){ open.sort((a, b) => f[a] - f[b]); const cur = open.shift(), cx = KX(cur), cy = KY(cur);
      for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx = cx + dx, ny = cy + dy; if (!inBounds(nx, ny)) continue;
        const c = moveCost(e, cx, cy); if (c >= 99) continue; const nk = K(nx, ny), nd = f[cur] + c; if (nd < f[nk]){ f[nk] = nd; open.push(nk); } } }
    const map = reach(e); let bk = K(e.x, e.y);
    for (const dk of destinations(e, map)) if (f[dk] < f[bk] || (f[dk] === f[bk] && map.get(dk).d < map.get(bk).d)) bk = dk;
    if (bk !== K(e.x, e.y)){ inspect = e; await wait(150); await moveAlong(e, pathTo(map, bk)); }
  }
  const tgts = foes(e).filter(p => !p.sanct && man(e, p) >= e.rng[0] && man(e, p) <= e.rng[1]);
  if (tgts.length && e.w !== 'staff'){
    const pick = tgts.sort((a, b) => (onBell(b) - onBell(a)) || (calc(e, b, e, b).dmg - calc(e, a, e, a).dmg))[0];
    await wait(150); inspect = null; await doCombat(e, pick);
  }
  inspect = null; updateDanger();
}
async function spawnReinforcements(){
  const wave = B.waves.find(w => w.turn === turn);
  if (!wave) return;
  wave.spawned = true;
  let first = true;
  for (const sp of wave.units){
    const u = enemyUnit(sp, B.ef); place(u, ...freeTileNear(sp.x, sp.y)); u.alpha = 0; units.push(u);
    if (first){ focusOn(u.x, u.y); popup(u, 'Reinforcements!', '#ffcf5a'); Sfx.play('reinforce'); first = false; }
    tween(400, t => { u.alpha = t; });
  }
  await wait(700);
}
async function enemyPhase(){
  clearSel(); inspect = null; phase = 'e'; busy = true; mode = 'busy'; refreshTop(); panelIdle();
  if (B.objective.type === 'bells' && await ringBells('p')) return;
  for (const u of units) if (sideOfTeam(u) !== 'p') u.sanct = false;
  for (const u of units) if (sideOfTeam(u) !== 'p') u.offbal = false;
  for (const u of units) if (sideOfTeam(u) === 'p') u.planted = (u.movedDist || 0) <= 1;   // Plant the Spear: braced if she barely moved
  for (const u of units){ u.movedDist = 0; u.baitUsed = false; u.guardUsed = false; if (sideOfTeam(u) === 'p') u.hobbled = false; else u.ranFar = false;
    if (u.seams && units.find(h => h.id === u.seamsBy && sideOfTeam(h) !== 'p')) u.seams = 0; }
  if (team('a').length){   // allied phase: they fight on their own
    Sfx.play('phase', 'p');
    await showBanner(B.ch.allyLine || 'ALLIES ADVANCE', `Turn ${ROMAN(turn)}`, B.pf);
    await fortHeal('a');
    for (const u of team('a')){
      if (u.dead || B.done) continue;
      await aiAct(u);
      if (checkEnd()) return;
    }
  }
  Music.want(B.bossMusic ? 'boss' : 'enemy'); Sfx.play('phase', 'e');
  await showBanner(B.ch.enemyLine || FACTIONS[B.ef].enemyLine, `Turn ${ROMAN(turn)}`, B.ef);
  await fortHeal('e');
  if (await litFuses()) return;
  await spawnReinforcements();
  for (const e of team('e')){
    if (e.dead || B.done) continue;
    await aiAct(e);
    if (checkEnd()) return;
  }
  const ob = B.objective;
  if (ob.type === 'bells'){
    if (await ringBells('e')) return;
    if (turn >= ob.turns){ finishBattle(B.bells.p > B.bells.e, false, 'bells'); return; }
  }
  if (ob.type === 'survive' && turn >= ob.turns){
    if (B.twist && !B.twist.done) await runTwist();   // the story turns: a new objective
    else { finishBattle(true); return; }
  }
  turn++; busy = false;
  startPlayerPhase();
}

// ---------- Enemy AI ----------
function distField(e){
  const f = new Array(COLS*ROWS).fill(Infinity), open = [];
  for (const p of foes(e)){ const k = K(p.x, p.y); f[k] = 0; open.push(k); }
  while (open.length){
    open.sort((a, b) => f[a] - f[b]);
    const cur = open.shift(), cx = KX(cur), cy = KY(cur);
    const step = f[cur] === 0 ? 1 : moveCost(e, cx, cy);
    if (step >= 99) continue;
    for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const nx = cx + dx, ny = cy + dy; if (!inBounds(nx, ny) || moveCost(e, nx, ny) >= 99) continue;
      const nk = K(nx, ny), nd = f[cur] + step;
      if (nd < f[nk]){ f[nk] = nd; open.push(nk); }
    }
  }
  return f;
}
async function aiHeal(e){
  const map = e.ai === 'hold' ? new Map([[K(e.x, e.y), {d: 0, prev: -1}]]) : reach(e);
  let best = null;
  for (const dk of destinations(e, map)){
    const pos = {x: KX(dk), y: KY(dk)};
    for (const a of friends(e)){
      if (a === e || a.hp >= a.mhp || man(pos, a) !== 1) continue;
      const need = a.mhp - a.hp - map.get(dk).d*.1;
      if (!best || need > best.need) best = {need, dk, a};
    }
  }
  if (!best) return;
  inspect = e; await wait(200);
  if (best.dk !== K(e.x, e.y)) await moveAlong(e, pathTo(map, best.dk));
  inspect = null; await doHeal(e, best.a);
}
async function aiAct(e){
  focusOn(e.x, e.y);
  if (e.ai === 'guard' && !e.triggered){
    const th = e.w === 'staff' ? rangeTiles(destinations(e, reach(e)), [1, 2]) : threat(e);
    if (foes(e).some(p => th.has(K(p.x, p.y)))) e.triggered = true; else return;
  }
  if (e.ai === 'courier') return courierAct(e);
  if (e.ai === 'bell') return bellAct(e);
  if (e.w === 'staff') return aiHeal(e);
  const map = e.ai === 'hold' ? new Map([[K(e.x, e.y), {d: 0, prev: -1}]]) : reach(e);
  const dests = destinations(e, map);
  let best = null;
  for (const dk of dests){
    const pos = {x: KX(dk), y: KY(dk)};
    for (const p of foes(e)){
      if (p.sanct) continue;   // Sanctuary: nobody chooses to attack them
      const d = man(pos, p); if (d < e.rng[0] || d > e.rng[1]) continue;
      const A = calc(e, p, pos, p), D = calc(p, e, p, pos), hits = A.dbl ? 2 : 1;
      let score = A.dmg*A.hit/100*hits, Dx = D;
      if (A.dmg*hits >= p.hp) score += 40*A.hit/100;
      // a hook plans its pull: readers can't answer once pulled, dragging someone off cover or into friends is worth it,
      // and a pulled melee fighter will strike back from beside the hook
      if (e.w === 'hook'){
        const sq = pullSquare(e, p, pos, p);
        if (sq){
          if (p.w === 'staff' || p.rng[1] > 1) Dx = {...D, can: false};
          else Dx = calc(p, e, sq, pos);
          const t = ter(p.x, p.y); score += (t.def*2 + t.avo/10)*A.hit/100;
          score += friends(e).filter(o => o !== e && man(o, sq) === 1).length*3*A.hit/100*(hasAb(e, 'closer') ? 1.5 : 1);
        }
      }
      if (Dx.can) score -= Dx.dmg*Dx.hit/100*(Dx.dbl ? 2 : 1)*.4;
      score += ter(pos.x, pos.y).def*1.5 + (p.lord ? 2 : 0) + (p.vip ? 3 : 0) - map.get(dk).d*.05;
      if (hasAb(p, 'bait')) score += 1000;
      if (p.courier) score += 25;   // the December thieves go for the presents   // Bait, By Choice: anyone who can reach Patch goes for him
      if (!best || score > best.score) best = {score, dk, p};
    }
  }
  inspect = e;
  if (best){
    await wait(250);
    if (best.dk !== K(e.x, e.y)) await moveAlong(e, pathTo(map, best.dk));
    await wait(150);
    inspect = null;
    await doCombat(e, best.p);
    updateDanger();
    return;
  }
  if (e.ai === 'hold'){ inspect = null; return; }
  const f = distField(e);
  let bk = K(e.x, e.y);
  for (const dk of dests) if (f[dk] < f[bk] || (f[dk] === f[bk] && map.get(dk).d < map.get(bk).d)) bk = dk;
  if (bk !== K(e.x, e.y)){ await wait(200); await moveAlong(e, pathTo(map, bk)); await wait(120); }
  inspect = null; updateDanger();
}

// ---------- End conditions ----------
function checkEnd(){
  if (!B || B.done) return true;
  const lord = units.find(u => u.team === 'p' && u.lord);
  if ((lord && lord.dead) || !team('p').length){ finishBattle(false); return true; }
  const vip = units.find(u => u.team !== 'e' && u.vip && u.dead);
  if (vip){ finishBattle(false, false, 'vip:' + vip.name); return true; }
  const ob = B.objective, boss = units.find(u => u.boss);
  // a boss who runs for the exits (ai 'courier') and reaches one has got away: the battle is lost
  if (ob.type === 'boss' && boss && boss.escaped){ finishBattle(false, false, 'escaped'); return true; }
  if (ob.type === 'boss' && boss && boss.dead){ finishBattle(true); return true; }
  // escape: the leader reaches one of the stage's exits
  if (ob.type === 'escape' && lord && !lord.dead && onExit(lord)){ finishBattle(true); return true; }
  // event: over once every courier has been caught, delivered or got away, and no more are coming
  if ((B.ch.event || ob.type === 'intercept') && couriers().length && !couriers().some(u => !u.dead) && !B.waves.some(w => !w.spawned && w.units.some(s => s.courier))){ finishBattle(true); return true; }
  const wavesLeft = B.waves.some(w => w.turn > turn || (w.turn === turn && phase === 'p'));
  if (!team('e').length && !(ob.type === 'survive' && (wavesLeft || (B.twist && !B.twist.done)))){ finishBattle(true); return true; }
  return false;
}

// ---------- Input ----------
// ---------- Zoom and pan (bigger maps) ----------
// The map sits in a scrolling viewport: drag to pan, pinch / ctrl+wheel / the +/− buttons to zoom.
let mapZoom = null;   // 1 = the whole map fits; null = choose a comfortable zoom when the battle starts
const mapView = $('#mapView');
function setZoom(z, cx, cy){
  const r = mapView.getBoundingClientRect(), T0 = T;
  // keep the point under (cx, cy) (or the view centre) in place
  const px = cx ?? r.width/2, py = cy ?? r.height/2;
  const mx = (mapView.scrollLeft + px - cvs.offsetLeft)/T0, my = (mapView.scrollTop + py - cvs.offsetTop)/T0;
  mapZoom = clamp(z, 1, 3.2); resize();
  mapView.scrollLeft = mx*T + cvs.offsetLeft - px; mapView.scrollTop = my*T + cvs.offsetTop - py;
  refreshZoomButtons();
}
function refreshZoomButtons(){ $('#zoomOut').disabled = (mapZoom || 1) <= 1.001; $('#zoomIn').disabled = mapZoom >= 3.19; }
// scroll so a tile is comfortably in view
function focusOn(x, y, instant){
  if (!B) return;
  const vw = mapView.clientWidth, vh = mapView.clientHeight, cx = cvs.offsetLeft + (x + .5)*T, cy = cvs.offsetTop + (y + .5)*T, m = T*1.5;
  const l = mapView.scrollLeft, t = mapView.scrollTop;
  if (cx - m >= l && cx + m <= l + vw && cy - m >= t && cy + m <= t + vh) return;
  mapView.scrollTo({left: cx - vw/2, top: cy - vh/2, behavior: instant ? 'auto' : 'smooth'});
}
$('#zoomIn').addEventListener('click', () => setZoom((mapZoom || 1)*1.35));
$('#zoomOut').addEventListener('click', () => setZoom((mapZoom || 1)/1.35));
mapView.addEventListener('wheel', e => { if (!e.ctrlKey) return; e.preventDefault(); setZoom((mapZoom || 1)*Math.exp(-e.deltaY*.01), e.clientX - mapView.getBoundingClientRect().left, e.clientY - mapView.getBoundingClientRect().top); }, {passive: false});
let pinch = null, pinchRaf = 0;
const tdist = t => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
mapView.addEventListener('touchstart', e => { if (e.touches.length === 2) pinch = {d: tdist(e.touches), z: mapZoom || 1}; }, {passive: true});
mapView.addEventListener('touchmove', e => {
  if (!pinch || e.touches.length !== 2) return;
  e.preventDefault();
  const r = mapView.getBoundingClientRect(), z = pinch.z*tdist(e.touches)/pinch.d;
  const cx = (e.touches[0].clientX + e.touches[1].clientX)/2 - r.left, cy = (e.touches[0].clientY + e.touches[1].clientY)/2 - r.top;
  cancelAnimationFrame(pinchRaf); pinchRaf = requestAnimationFrame(() => setZoom(z, cx, cy));
}, {passive: false});
mapView.addEventListener('touchend', e => { if (e.touches.length < 2) pinch = null; });
$('#cv').addEventListener('click', e => {
  const r = $('#cv').getBoundingClientRect();
  const x = Math.floor((e.clientX - r.left)/T), y = Math.floor((e.clientY - r.top)/T);
  if (inBounds(x, y)) onTap(x, y);
});
$('#panel').addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (b) act(b.dataset.act); });
$('#duel').addEventListener('click', () => { speed = 3; });
$('#endBtn').addEventListener('click', () => {
  if (!B || busy || phase !== 'p' || !(mode === 'idle' || mode === 'selected')) return;
  clearSel(); inspect = null; mode = 'idle'; enemyPhase();
});
$('#dangerBtn').addEventListener('click', () => { if (!B) return; showDanger = !showDanger; updateDanger(); refreshTop(); });
$('#menuBtn').addEventListener('click', () => {
  if (!B || busy || phase !== 'p') return;
  $('#menuSub').textContent = `${CAMPAIGNS[B.campKey].name} · ${B.ch.title} · Turn ${ROMAN(turn)}`;
  $('#menuObj').textContent = objectiveText();
  $('#menu').hidden = false;
});
$('#resumeBtn').addEventListener('click', () => { $('#menu').hidden = true; });
$('#retreatBtn').addEventListener('click', e => {
  if (!armed(e.currentTarget, 'Tap again: lose this battle')) return;
  $('#menu').hidden = true; finishBattle(false, true);
});
