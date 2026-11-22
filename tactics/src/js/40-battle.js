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
const unitAt = (x, y) => units.find(u => !u.dead && u.x === x && u.y === y);
const inBounds = (x, y) => x >= 0 && y >= 0 && x < COLS && y < ROWS;
const healAmt = u => 8 + Math.floor(u.atk/2);

function moveCost(u, x, y){
  const ch = MAP[y][x], c = TER[ch].cost;
  if (c >= 99) return 99;
  if (u.mt === 'mounted'){ if (ch === 'F') return 3; if (ch === 'M') return 99; }
  if (u.mt === 'armor' && ch === 'M') return 99;
  if (u.mt === 'bog' && ch === 'M') return 2;
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
function enemyUnit(sp, faction){
  const rec = {key: sp.key || 'enemy', look: sp.look || CLASS_LOOK[sp.cls], name: sp.name || CLASSES[sp.cls].name, faction, cls: sp.cls,
               lv: sp.lv, stats: scaledStats(sp.cls, sp.lv, sp.bonus), wtier: 0, wname: CLASSES[sp.cls].wname};
  if (sp.elite){ rec.stars = 2; rec.stats.mhp += 2; for (const k of ['atk', 'def', 'spd', 'skl']) rec.stats[k] += 1; }
  // chapter-wide difficulty tuning (see enemyMods in 25-data-campaign.js)
  for (const [k, v] of Object.entries(B?.ch?.chapter?.enemyMods || {})) rec.stats[k] = Math.max(k === 'mhp' ? 8 : 0, rec.stats[k] + v);
  // talk: lines this boss / named enemy says the first time anyone fights it (bosses fall back to the stage's bossTalk)
  const talk = sp.talk || (sp.boss ? B?.ch?.bossTalk : null);
  return Object.assign(battleUnit(rec, 'e'), {ai: sp.ai || 'charge', boss: !!sp.boss, flees: !!sp.flees, talk, talked: false});
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
       objective: {...ch.objective}, twist: ch.twist ? {...ch.twist} : null,
       events: opts.replay ? [] : (ch.events || []).map(ev => ({...ev}))};   // story events only happen the first time
  mapDef = MAPS[ch.map]; MAP = mapDef.rows; ROWS = MAP.length; COLS = MAP[0].length;
  nextId = 1; units = [];
  records.forEach((r, i) => { const u = battleUnit(r, 'p'); place(u, ...ch.deploy[i]); units.push(u); });
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
  B.resolve({win, retreated, reason, turn, star: win && B.ch.star ? starCheck(B.ch.star, {...starLive(), over: true}) : 'pending', survivors: units.filter(u => u.team === 'p' && !u.dead), lost: units.filter(u => u.team === 'p' && u.dead)});
}

// ---------- Movement & ranges ----------
function reach(u){
  const map = new Map([[K(u.x, u.y), {d: 0, prev: -1}]]), open = [K(u.x, u.y)];
  while (open.length){
    open.sort((a, b) => map.get(a).d - map.get(b).d);
    const cur = open.shift(), cd = map.get(cur).d, cx = KX(cur), cy = KY(cur);
    for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const nx = cx + dx, ny = cy + dy;
      if (!inBounds(nx, ny)) continue;
      const c = moveCost(u, nx, ny); if (c >= 99) continue;
      const o = unitAt(nx, ny); if (o && o.team !== u.team) continue;
      const nd = cd + c; if (nd > u.mov) continue;
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
function calc(a, d, ap, dp){
  if (a.w === 'staff') return {can: false, dmg: 0, hit: 0, crit: 0, dbl: false, tri: 0};
  const t = ter(dp.x, dp.y), tri = triangle(a.w, d.w), dist = man(ap, dp);
  return {
    can: dist >= a.rng[0] && dist <= a.rng[1],
    dmg: Math.max(0, a.atk + tri - (d.def + t.def)),
    hit: clamp(75 + a.skl*2 + (a.whit || 0) + tri*15 - (d.spd*2 + t.avo), 0, 100),
    crit: clamp(Math.floor(a.skl/2) + (a.wcrit || 0) - Math.floor(d.skl/4), 0, 100),
    dbl: a.spd - d.spd >= 4, tri,
  };
}

// ---------- Map animation ----------
let popups = [], shots = [], banner = null, shake = 0;
function popup(u, text, color){ popups.push({x: u.x + .5, y: u.y + .3, text, color, t0: performance.now(), dur: 950}); }
async function moveAlong(u, path){
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
const sideOf = u => duelSides[u.id] || (u.team === 'p' ? 'L' : 'R');
function sprite(u, side){
  // Battle poses face right; flip them when the unit stands on the right as the defender.
  const art = artFor(u, 'battle');
  if (art) return `<img alt="" src="${art}"${side === 'R' ? ' class="flip"' : ''}>`;
  return `<img alt="" class="plush" src="${plushPortrait(u.look)}">`;
}
function fillFighter(side, u, f){
  const pf = dEl[side].querySelector('.pf');
  // clear leftover effects from the previous fight (e.g. the greyed-out defeat pose, which is held with fill:'forwards')
  for (const el of [pf, dEl[side]]) for (const a of el.getAnimations()) a.cancel();
  pf.innerHTML = sprite(u, side); pf.style.filter = ''; pf.style.transform = '';
  const pl = pEl[side]; pl.className = 'plate f-' + u.faction;
  pl.querySelector('.nm').textContent = u.name;
  pl.querySelector('.ds').textContent = f.can ? `DMG ${f.dmg}${f.dbl ? '×2' : ''} · HIT ${f.hit} · CRIT ${f.crit}` : u.w === 'staff' ? 'Cannot strike' : 'Out of reach';
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
  fillFighter('L', a, calc(a, d, a, d)); fillFighter('R', d, calc(d, a, d, a));
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
  Sfx.play(a.w === 'tome' ? 'magic' : a.lash ? 'crack' : (a.w === 'bow' && ranged) ? 'twang' : 'swing');
  await tween(140, t => { a.ox = lx*t; a.oy = ly*t; });
  if (ranged){
    const s = {x0: a.x + .5, y0: a.y + .5, x1: d.x + .5, y1: d.y + .5, t: 0}; shots.push(s);
    await tween(170, t => { s.t = t; }); shots.splice(shots.indexOf(s), 1);
  }
  const roll = (Math.random()*100 + Math.random()*100)/2;   // two-roll hit, as in the classics
  if (roll < f.hit){
    const crit = Math.random()*100 < f.crit, dmg = crit ? f.dmg*3 : f.dmg;
    const from = d.hp; d.hp = Math.max(0, d.hp - dmg);
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
      stamp('FLEES', '#ecc673'); Sfx.play('flee');
      anim(D.querySelector('.pf'), [{opacity: 1, transform: 'none'}, {opacity: 0, transform: `translateX(${dir*140}px)`}], 700, {fill: 'forwards'});
      await wait(500);
    } else if (scene){
      stamp('UNSTITCHED', '#e8493b'); Sfx.play('unstitch');
      anim(D.querySelector('.pf'), [{filter: 'none', transform: 'none'}, {filter: 'grayscale(1) brightness(.45)', transform: `translateY(18px) rotate(${-dir*6}deg)`}], 700, {fill: 'forwards'});
      await wait(500);
    }
    if (d.flees) popup(d, 'Fled!', '#ecc673');
    await tween(380, t => { d.alpha = 1 - t; }); d.dead = true;
    if (d.team === 'e') B.kills++;
  }
}

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
  const A = calc(a, d, a, d), D = calc(d, a, d, a), seq = [[a, d, A]];
  if (D.can) seq.push([d, a, D]);
  if (A.dbl) seq.push([a, d, A]); else if (D.can && D.dbl) seq.push([d, a, D]);
  const hp0 = {a: a.hp, d: d.hp};
  speed = 1;
  await openDuel(a, d);
  for (const [x, y, f] of seq){ if (a.dead || d.dead) break; await strike(x, y, f); }
  await closeDuel();
  speed = 1;
  const p = a.team === 'p' ? a : d, e = p === a ? d : a;
  if (!p.dead){
    const dealt = (p === a ? hp0.d - d.hp : hp0.a - a.hp) > 0;
    const xp = e.dead ? Math.max(10, 30 + (e.lv - p.lv)*3 + (e.boss ? 40 : 0)) : dealt ? Math.max(1, 10 + (e.lv - p.lv)) : 1;
    await giveExp(p, xp);
  }
}
async function doHeal(h, t){
  const amt = Math.min(healAmt(h), t.mhp - t.hp), from = t.hp;
  t.hp += amt; popup(t, `+${amt}`, '#9ff0b0'); Sfx.play('heal');
  await tween(420, k => { t.shp = from + amt*k; t.flash = (1 - k)*.6; });
  await wait(200);
  if (h.team === 'p') await giveExp(h, 12);
}
async function giveExp(u, xp){
  popup(u, `+${xp} EXP`, '#ecc673'); Sfx.play('exp');
  u.exp += xp;
  await wait(450);
  while (u.exp >= 100){ u.exp -= 100; await levelUp(u); }
}
async function levelUp(u){
  u.lv++;
  const ups = rollLevel(u, u.g);
  if (ups.mhp){ u.hp += 1; u.shp = u.hp; }
  await showLevelUp(u, ups);
}

// ---------- Panel ----------
function porHTML(u){ return `<div class="por f-${u.faction}">${portraitInner(u, 'panel')}</div>`; }
function objectiveText(){
  const ob = B.objective, lord = units.find(u => u.team === 'p' && u.lord);
  const goal = ob.type === 'boss' ? `Defeat ${units.find(u => u.boss)?.name || 'the commander'}${ob.limit ? ` by the end of turn ${ROMAN(ob.limit)}` : ''}.`
    : ob.type === 'survive' ? `Survive until the end of turn ${ROMAN(ob.turns)} (${Math.max(0, ob.turns - turn + 1)} to go).` : 'Rout the enemy.';
  const must = [lord, ...units.filter(u => u.team === 'p' && u.vip && !u.dead)].filter(Boolean).map(u => u.name);
  return `${goal} ${must.length ? must.join(' and ') + ' must not fall.' : ''}`;
}
const starLive = () => ({lost: units.filter(u => u.team === 'p' && u.dead).length, turn, lordHit: B.lordHit, bossBy: B.bossBy, deployed: B.deployed, over: false});
function starHTML(){
  if (!B.ch.star) return '';
  const st = starCheck(B.ch.star, starLive()), had = hasStar(B.ch.id);
  return `<div class="hint starline ${st}">${had ? '★' : '☆'} Bonus: ${starText(B.ch, B.campKey)}${st === 'missed' ? ' <b>· missed</b>' : st === 'ok' ? ' <b>· done</b>' : ''}${had ? ' <small>(already earned)</small>' : ''}</div>`;
}
function unitHTML(u){
  const t = ter(u.x, u.y), tn = tileInfo(MAP[u.y][u.x])[0], pct = u.hp/u.mhp*100;
  const col = pct > 50 ? '#6fbf6a' : pct > 25 ? '#e0b44c' : '#e0533d';
  const note = u.w === 'staff' ? ` · Mends ${healAmt(u)} HP` : u.boss ? ' · Commander' : (u.ai === 'guard' && !u.triggered) ? ' · Waits for you' : '';
  return `<div class="urow">${porHTML(u)}<div class="uinfo">
      <div class="uhead"><span class="nm">${u.name}</span><span class="cl">${CLASSES[u.cls].name} · Lv ${u.lv}${u.team === 'p' ? ` · ${u.exp} EXP` : ''}</span></div>
      <div class="hprow">HP ${u.hp}/${u.mhp}<div class="bar"><i style="width:${pct}%;background:${col}"></i></div></div>
      <div class="meta"><b>${u.wname}</b> · ${WTYPE[u.w]} · Rng ${u.rng[0] === u.rng[1] ? u.rng[0] : u.rng.join("–")}${note}</div>
      <div class="tr">${tn}${t.def || t.avo ? ` <b>+${t.def} Def +${t.avo} Avo</b>` : ''}</div>
    </div></div>
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
    <button class="btn" data-act="wait" type="button">Wait</button>
    <button class="btn" data-act="cancel" type="button">Undo</button></div>`);
}
function panelForecast(a, d){
  const A = calc(a, d, a, d), D = calc(d, a, d, a);
  const ar = x => x > 0 ? ' <span class="adv">▲</span>' : x < 0 ? ' <span class="dis">▼</span>' : '';
  const row = (l, a1, d1) => `<div class="v pc">${a1}</div><div class="l">${l}</div><div class="v ec">${d1}</div>`;
  setPanel(`<div class="fc">
      <div class="h pc">${a.name.split(' ')[0]}${ar(A.tri)}</div><div></div><div class="h ec">${d.name.split(' ').slice(-2).join(' ')}${ar(D.tri)}</div>
      ${row('HP', `${a.hp}/${a.mhp}`, `${d.hp}/${d.mhp}`)}
      ${row('Dmg', A.dmg + (A.dbl ? ' ×2' : ''), D.can ? D.dmg + (D.dbl ? ' ×2' : '') : '–')}
      ${row('Hit', A.hit, D.can ? D.hit : '–')}
      ${row('Crit', A.crit, D.can ? D.crit : '–')}
    </div>
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
const enemiesInRange = u => team(u.team === 'p' ? 'e' : 'p').filter(o => { const d = man(u, o); return d >= u.rng[0] && d <= u.rng[1]; });
const healTargets = u => team(u.team).filter(o => o !== u && man(u, o) === 1 && o.hp < o.mhp);
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
  targets = kind === 'attack' ? enemiesInRange(sel) : healTargets(sel);
  if (targets.length === 1) chooseTarget(targets[0]);
  else setPanel(`<div class="hint">Tap a highlighted ${kind === 'attack' ? 'enemy' : 'ally'}.</div><div class="acts"><button class="btn" data-act="back" type="button">Back</button></div>`);
}
function chooseTarget(t){ fc = t; tmode === 'attack' ? panelForecast(sel, t) : panelHeal(sel, t); }
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
    return;
  }
  if (mode === 'target' && u && targets.includes(u)){ if (fc === u) act('confirm'); else chooseTarget(u); }
}

async function act(a){
  if (busy) return;
  if (a === 'attack') startTargeting('attack');
  else if (a === 'heal') startTargeting('heal');
  else if (a === 'wait') finishUnit(sel);
  else if (a === 'cancel'){ const u = sel; place(u, orig.x, orig.y); select(u); }
  else if (a === 'back') openActions();
  else if (a === 'confirm' && fc){
    busy = true; refreshTop();
    const u = sel, t = fc, kind = tmode; mode = 'busy'; targets = []; atkKeys = new Set(); healKeys = new Set();
    setPanel(`<div class="hint"><em>${kind === 'attack' ? `${u.name} strikes at ${t.name}…` : `${u.name} mends ${t.name}…`}</em></div>`);
    if (kind === 'attack') await doCombat(u, t); else await doHeal(u, t);
    busy = false;
    if (u.dead){ clearSel(); await afterAction(); return; }
    finishUnit(u);
  }
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
  refreshTop(); panelIdle();
  Music.want(B.bossMusic ? 'boss' : 'battle'); Sfx.play('phase', 'p');
  await showBanner(FACTIONS[B.pf].playerLine, `Turn ${ROMAN(turn)}`, B.pf);
  await fortHeal('p');
  await battleEvents();
  busy = false; mode = 'idle'; updateDanger(); panelIdle(); refreshTop();
}
// Story events during a battle (see `events` in 25-data-campaign.js): someone runs onto the field and joins in.
async function battleEvents(){
  for (const ev of B.events){
    if (ev.done || ev.turn !== turn || B.done) continue;
    ev.done = true;
    if (ev.join){
      if (units.some(u => u.team === 'p' && u.key === ev.join && !u.dead)) continue;   // already deployed
      // someone already in the army (and standing) runs in as themselves; otherwise they're new
      const have = SAVE.camps[B.campKey].roster.find(r => r.key === ev.join && !r.dead);
      const u = battleUnit(have || recordFor(ev.join), 'p'); u.vip = !!ev.mustSurvive;
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
  }
}
// A stage's twist (see `twist` in 25-data-campaign.js): once a survive objective is met, a scene plays,
// fresh enemies may arrive, and the battle goes on with a new objective.
async function runTwist(){
  const tw = B.twist; tw.done = true;
  if (tw.talk) await talk(tw.talk);
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
async function spawnReinforcements(){
  const wave = B.waves.find(w => w.turn === turn);
  if (!wave) return;
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
  Music.want(B.bossMusic ? 'boss' : 'enemy'); Sfx.play('phase', 'e');
  await showBanner(FACTIONS[B.ef].enemyLine, `Turn ${ROMAN(turn)}`, B.ef);
  await fortHeal('e');
  await spawnReinforcements();
  for (const e of team('e')){
    if (e.dead || B.done) continue;
    await aiAct(e);
    if (checkEnd()) return;
  }
  const ob = B.objective;
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
  for (const p of team('p')){ const k = K(p.x, p.y); f[k] = 0; open.push(k); }
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
    for (const a of team('e')){
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
    if (team('p').some(p => th.has(K(p.x, p.y)))) e.triggered = true; else return;
  }
  if (e.w === 'staff') return aiHeal(e);
  const map = e.ai === 'hold' ? new Map([[K(e.x, e.y), {d: 0, prev: -1}]]) : reach(e);
  const dests = destinations(e, map);
  let best = null;
  for (const dk of dests){
    const pos = {x: KX(dk), y: KY(dk)};
    for (const p of team('p')){
      const d = man(pos, p); if (d < e.rng[0] || d > e.rng[1]) continue;
      const A = calc(e, p, pos, p), D = calc(p, e, p, pos), hits = A.dbl ? 2 : 1;
      let score = A.dmg*A.hit/100*hits;
      if (A.dmg*hits >= p.hp) score += 40*A.hit/100;
      if (D.can) score -= D.dmg*D.hit/100*(D.dbl ? 2 : 1)*.4;
      score += ter(pos.x, pos.y).def*1.5 + (p.lord ? 2 : 0) - map.get(dk).d*.05;
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
  const vip = units.find(u => u.team === 'p' && u.vip && u.dead);
  if (vip){ finishBattle(false, false, 'vip:' + vip.name); return true; }
  const ob = B.objective, boss = units.find(u => u.boss);
  if (ob.type === 'boss' && boss && boss.dead){ finishBattle(true); return true; }
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
$('#skipWinBtn').addEventListener('click', e => {
  if (!armed(e.currentTarget, 'Tap again to win now')) return;
  $('#menu').hidden = true; finishBattle(true);   // the post-battle story and rewards still play
});
$('#retreatBtn').addEventListener('click', e => {
  if (!armed(e.currentTarget, 'Tap again: lose this battle')) return;
  $('#menu').hidden = true; finishBattle(false, true);
});
