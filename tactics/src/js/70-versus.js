// ================= Local multiplayer (pass and play) =================
// From the "Local Multiplayer" button at the foot of the campaign screen. Two players share one phone: George and Rosie.
// 1. Choose how many troops each army has. 2. Choose a map (VS_MAPS). 3. Take turns picking troops from everyone
// standing in either army (the first picker is chosen at random). 4. A coin toss decides who moves first.
// The battle runs on the ordinary engine with runBattle(..., {vs}): whoever is moving is team 'p' and the other player
// is team 'e', and the two swap at the end of every turn (vsSwap). Nothing is saved: no experience, no rewards, no
// losses. George's troops are green and Rosie's pink (VS_COLOURS); the banner and top bar name whose turn it is.

const VS_NAME = {george: 'George', rosie: 'Rosie'};
const vsOther = p => p === 'george' ? 'rosie' : 'george';
const VS_COLOURS = {george: {fill: 'rgba(34,138,70,.95)', rim: '#8fe6a2', stitch: '#d8f5de', bar: '#5fd27a'},
                    rosie:  {fill: 'rgba(204,62,140,.95)', rim: '#ffa6dc', stitch: '#ffe2f3', bar: '#ff72c4'}};
const VS_BANNERS = {'vs-george': {band: '#23623a', text: '#e8f8e4', sub: '#a8e2b0', stitch: 'rgba(220,245,222,.65)'},
                    'vs-rosie':  {band: '#9c2c68', text: '#fde8f3', sub: '#ffc0e0', stitch: 'rgba(255,226,243,.65)'}};
const VS_MAX = 6;

// The maps are made fair by turning half of a story map (or a hand-drawn half) round 180°: each player's half is the
// other's, square for square. George starts at the bottom, Rosie at the top.
const vsTurn = rows => rows.slice().reverse().map(r => [...r].reverse().join(''));
const VS_MAPS = [
  {key: 'hollow', name: 'The Hollow', about: 'A small wood with roots and rocks for cover. The armies meet quickly.', from: 'hollow', half: 6},
  {key: 'bridges', name: 'Three Bridges', about: 'A river across the middle, with a bridge at each side and a wide one in the centre.', theme: 'meadow', top: [
    'F..F..F..F',
    '.F......F.',
    '..F.MM....',
    'F......F..',
    '.F..F....M',
    'WBWWBBWWBW']},
  {key: 'snow', name: 'The Snowy Wood', about: 'Pines and boulders in the snow. Plenty of places to hide archers.', from: 'snowWoods', half: 6},
  {key: 'arena', name: 'The Grand Arena', about: 'Open sand and stone pillars, with a healing gate behind each army. A long walk.', from: 'grandArena', half: 7},
];
for (const m of VS_MAPS){
  const src = m.from ? MAPS[m.from] : null, top = m.top || src.rows.slice(0, m.half);
  MAPS['vs-' + m.key] = {theme: m.theme || src.theme, names: src?.names, rows: [...top, ...vsTurn(top)]};
}
// Starting squares: George's are the open squares nearest the bottom middle; Rosie's are the same squares turned round.
function vsDeploy(m){
  const rows = MAPS['vs-' + m.key].rows, H = rows.length, W = rows[0].length, sq = [];
  for (let y = H - 3; y < H; y++) for (let x = 0; x < W; x++){ const c = rows[y][x]; if (TER[c].cost < 99) sq.push({x, y, s: Math.abs(x - (W - 1)/2) + (H - 1 - y)*.6 + (c === 'M' ? 3 : 0)}); }
  const george = sq.sort((a, b) => a.s - b.s).slice(0, VS_MAX).map(p => [p.x, p.y]);
  return {george, rosie: george.map(([x, y]) => [W - 1 - x, H - 1 - y])};
}

// Everyone standing, in both armies
const vsPool = () => Object.keys(CAMPAIGNS).flatMap(ck => (SAVE.camps[ck]?.roster || []).filter(r => !r.dead).map(r => ({ck, r, id: ck + ':' + r.uid})));
let vs = null;   // {step, size, map, pickFirst, picks: {george: [ids], rosie: [ids]}, first}
const vsPicker = () => { const n = vs.picks.george.length + vs.picks.rosie.length; return n % 2 === 0 ? vs.pickFirst : vsOther(vs.pickFirst); };
const vsOwnerOf = id => vs.picks.george.includes(id) ? 'george' : vs.picks.rosie.includes(id) ? 'rosie' : null;
const vsRec = id => vsPool().find(p => p.id === id)?.r;
const vsNameTag = p => `<b class="vsname vs-${p}">${VS_NAME[p]}</b>`;

function vsButtonHTML(){ return `<button class="btn" data-vsopen type="button">👥 Local Multiplayer</button>`; }
function openVersus(){
  if (vsPool().length < 2){ toast('You need at least two troops between your armies to play.'); return; }
  vs = {step: 'size', size: 0, map: null, pickFirst: null, picks: {george: [], rosie: []}, first: null};
  renderVersus();
}
function vsMiniMap(m){
  const rows = MAPS['vs-' + m.key].rows, d = vsDeploy(m), at = {};
  d.george.slice(0, vs.size || VS_MAX).forEach(([x, y]) => at[x + ',' + y] = 'george'); d.rosie.slice(0, vs.size || VS_MAX).forEach(([x, y]) => at[x + ',' + y] = 'rosie');
  return `<div class="vsmini" style="grid-template-columns:repeat(${rows[0].length},1fr)" aria-hidden="true">${rows.map((r, y) => [...r].map((c, x) =>
    `<i class="t${c === '.' ? 'o' : c}${at[x + ',' + y] ? ' vs-' + at[x + ',' + y] : ''}"></i>`).join('')).join('')}</div>`;
}
function vsPickCard({id, r}){
  const owner = vsOwnerOf(id), s = statsOf(r), wp = weaponOf(r);
  return `<button class="vspick${owner ? ' taken vs-' + owner : ''}" data-vspick="${id}" type="button" ${owner ? 'disabled' : ''}>
    <div class="por f-${r.faction}">${portraitInner(r, 'panel')}</div>
    <b>${r.name}</b><small>${CLASSES[clsOf(r)].name} · Lv ${r.lv}</small>
    <small class="vsst">HP ${s.mhp} · ${isMagic(wp.type) ? 'Mag' : 'Atk'} ${s.atk + (wp.mt || 0)} · Def ${s.def} · Spd ${s.spd}</small>
    ${owner ? `<i class="vsown">${VS_NAME[owner]}</i>` : ''}</button>`;
}
const vsTeamList = p => vs.picks[p].map(id => vsRec(id)?.name).filter(Boolean).join(', ') || '<span class="vsnone">nobody yet</span>';
function renderVersus(){
  let ov = $('#vsov');
  if (!ov){ ov = document.createElement('div'); ov.id = 'vsov'; ov.className = 'ov'; document.body.appendChild(ov); }
  const pool = vsPool(), max = Math.min(VS_MAX, Math.floor(pool.length/2));
  let body = '';
  if (vs.step === 'size'){
    body = `<h1>Local Multiplayer</h1><h2>George against Rosie, on one phone</h2>
      <p>How many troops in each army?</p>
      <div class="vssizes">${Array.from({length: VS_MAX}, (_, k) => k + 1).map(n => `<button class="btn${n === 4 && n <= max ? ' primary' : ''}" data-vssize="${n}" type="button" ${n > max ? 'disabled' : ''}>${n} v ${n}</button>`).join('')}</div>
      ${max < VS_MAX ? `<p class="hint">Your armies have ${pool.length} troops standing between them, so each side can have up to ${max}.</p>` : ''}
      <div class="dbgrow"><button class="btn" data-vsclose type="button">Cancel</button></div>`;
  } else if (vs.step === 'map'){
    body = `<h1>Choose a map</h1><h2>${vs.size} v ${vs.size}</h2>
      <div class="vsmaps">${VS_MAPS.map(m => { const rows = MAPS['vs-' + m.key].rows;
        return `<button class="vsmap" data-vsmap="${m.key}" type="button">${vsMiniMap(m)}<span><b>${m.name}</b><small>${rows[0].length} × ${rows.length}</small><span>${m.about}</span></span></button>`; }).join('')}</div>
      <p class="hint">${vsNameTag('george')} starts at the bottom (green squares), ${vsNameTag('rosie')} at the top (pink).</p>
      <div class="dbgrow"><button class="btn" data-vsback="size" type="button">Back</button><button class="btn" data-vsclose type="button">Cancel</button></div>`;
  } else if (vs.step === 'draft'){
    const p = vsPicker(), n = vs.picks[p].length + 1;
    body = `<h1>Pick your troops</h1>
      <div class="vsprompt vs-${p}">${VS_NAME[p]}, pick troop ${n} of ${vs.size}.</div>
      <div class="vsteams"><div>${vsNameTag('george')}: ${vsTeamList('george')}</div><div>${vsNameTag('rosie')}: ${vsTeamList('rosie')}</div></div>
      ${Object.keys(CAMPAIGNS).map(ck => { const list = pool.filter(x => x.ck === ck).sort((a, b) => (b.r.lord ? 1 : 0) - (a.r.lord ? 1 : 0) || b.r.lv - a.r.lv);
        return list.length ? `<div class="sec">${CAMPAIGNS[ck].name}</div><div class="vspool">${list.map(vsPickCard).join('')}</div>` : ''; }).join('')}
      <div class="dbgrow"><button class="btn" data-vsundo type="button" ${vs.picks.george.length + vs.picks.rosie.length ? '' : 'disabled'}>Undo last pick</button><button class="btn" data-vsback="map" type="button">Back</button><button class="btn" data-vsclose type="button">Cancel</button></div>`;
  } else if (vs.step === 'toss'){
    const m = VS_MAPS.find(x => x.key === vs.map);
    body = `<h1>Coin toss</h1><h2>${m.name} · ${vs.size} v ${vs.size}</h2>
      <div class="vsprompt vs-${vs.first}">${VS_NAME[vs.first]} goes first!</div>
      <div class="vsteams"><div>${vsNameTag('george')} (bottom): ${vsTeamList('george')}</div><div>${vsNameTag('rosie')} (top): ${vsTeamList('rosie')}</div></div>
      <p>Take turns moving, and pass the phone when your turn is over. Unstitch every one of the other player's troops to win.</p>
      <button class="btn primary" data-vsgo type="button">Start the battle</button>
      <div class="dbgrow"><button class="btn" data-vsback="draft" type="button">Back</button><button class="btn" data-vsclose type="button">Cancel</button></div>`;
  } else if (vs.step === 'result'){
    const w = vs.winner;
    body = `<h1 class="vsname vs-${w}">${VS_NAME[w]} wins!</h1><h2>${VS_MAPS.find(x => x.key === vs.map).name} · ${vs.turns === 1 ? 'in the first turn' : `in ${vs.turns} turns`}</h2>
      <div class="vsteams"><div>${vsNameTag('george')}: ${vsTeamList('george')}</div><div>${vsNameTag('rosie')}: ${vsTeamList('rosie')}</div></div>
      <button class="btn primary" data-vsrematch type="button">Rematch (same troops and map)</button>
      <button class="btn" data-vsnew type="button">New match</button>
      <button class="btn" data-vsclose type="button">Back to the campaign</button>`;
  }
  ov.innerHTML = `<div class="card vscard">${body}</div>`;
  ov.hidden = false;
}
function vsToss(){ vs.first = Math.random() < .5 ? 'george' : 'rosie'; vs.step = 'toss'; }
async function vsStart(){
  const m = VS_MAPS.find(x => x.key === vs.map), dep = vsDeploy(m), first = vs.first;
  const teams = {george: vs.picks.george.map(vsRec), rosie: vs.picks.rosie.map(vsRec)};
  if (teams.george.some(r => !r) || teams.rosie.some(r => !r)){ toast('Something changed in the armies: pick again.'); vs.picks = {george: [], rosie: []}; vs.step = 'draft'; return renderVersus(); }
  const ch = {id: 'VS', title: m.name, map: 'vs-' + m.key, enemyFaction: 'frog', objective: {type: 'rout'}, deploy: dep[first], enemies: () => [], events: []};
  $('#vsov').hidden = true;
  const res = await runBattle('rae', ch, teams[first], {vs: {first, teams, deploy: dep}});
  const winner = B?.vs?.winner;
  renderHub();
  if (res.retreated || !winner){ vs = null; return; }
  Object.assign(vs, {step: 'result', winner, turns: res.turn}); renderVersus();
}

// ---------- In battle (called from 40-battle.js) ----------
// End of a player's turn: the sides swap, so the next player's troops become team 'p' and use the ordinary controls.
async function vsSwap(){
  clearSel(); inspect = null; busy = true; mode = 'busy';
  for (const u of units){ u.team = u.team === 'p' ? 'e' : 'p'; u.moved = false; u.baitUsed = false; }
  B.vs.cur = vsOther(B.vs.cur);
  if (B.vs.cur === B.vs.first) turn++;
  updateDanger();
  const lead = team('p')[0]; if (lead) focusOn(lead.x, lead.y);   // show the next player their troops
  startPlayerPhase();
}
// Over when one side has nobody left standing (a counter-attack can knock out the last of the side that's moving)
function vsCheckEnd(){
  const mine = team('p').length, theirs = team('e').length;
  if (mine && theirs) return false;
  B.vs.winner = theirs ? vsOther(B.vs.cur) : B.vs.cur;
  finishBattle(true); return true;
}

document.addEventListener('click', e => {
  const t = e.target.closest('[data-vsopen], [data-vsclose], [data-vssize], [data-vsmap], [data-vspick], [data-vsundo], [data-vsback], [data-vsgo], [data-vsrematch], [data-vsnew]'); if (!t) return;
  const d = t.dataset; Sfx.play('select');
  if ('vsopen' in d) return openVersus();
  if ('vsclose' in d){ vs = null; $('#vsov').hidden = true; return; }
  if ('vsnew' in d) return openVersus();
  if (!vs) return;
  if (d.vssize){ vs.size = +d.vssize; vs.step = 'map'; }
  else if (d.vsmap){ vs.map = d.vsmap; vs.picks = {george: [], rosie: []}; vs.pickFirst = Math.random() < .5 ? 'george' : 'rosie'; vs.step = 'draft'; }
  else if (d.vspick){
    if (vsOwnerOf(d.vspick)) return;
    vs.picks[vsPicker()].push(d.vspick);
    if (vs.picks.george.length >= vs.size && vs.picks.rosie.length >= vs.size) vsToss();
  }
  else if ('vsundo' in d){ const last = vs.picks.george.length + vs.picks.rosie.length - 1; if (last >= 0) vs.picks[last % 2 === 0 ? vs.pickFirst : vsOther(vs.pickFirst)].pop(); }
  else if (d.vsback){ vs.step = d.vsback; if (d.vsback === 'draft'){ const p = vsOther(vsPicker()); vs.picks[p].pop(); } }
  else if ('vsgo' in d) return vsStart();
  else if ('vsrematch' in d) vsToss();
  const y = $('#vsov')?.scrollTop || 0; renderVersus(); if (d.vspick || 'vsundo' in d) $('#vsov').scrollTop = y;
});
