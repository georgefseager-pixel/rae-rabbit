// ================= The Collection (a Pokédex of everyone you've had in an army) =================
// One page for the whole save (both routes). Entries:
//   characters  every unique character in CHARACTERS (not the ★ story rabbits like Tall Rabbit: they count as their company)
//   soldiers    one entry per company and rarity: all ★ Republic soldiers are one entry, all ★★ another
//   costumes    every attire
// Sections: one per faction (the character's own, or the company's army), then Costumes (story and banner attires),
// Daily log-in (LOGIN.track's costumes) and one per seasonal event (its banners' characters, costumes and soldiers).
// Unlocking: anyone who has ever been in either army, and any costume ever owned. SAVE.dex remembers them, so releasing
// a recruit doesn't lock its entry again (dexSync runs on every save). Locked entries are silhouettes.

// The companies (GACHA_ARMY[ck].troops sets, plus each army's own `base` soldiers): names and blurbs per rarity.
// A set both armies share (the monkeys) is one company.
const DEX_COMPANIES = {
  'rae-base': {faction: 'rae',   names: ['Mine Rabbits', 'Mine Veterans'], blurb: 'Diggers, haulers, pebble-slingers, runners and patchers: the rabbits who walked out of the mines with Rae.'},
  'frog-base': {faction: 'frog', names: ['Court Soldiers', 'Court Veterans'], blurb: 'The Lily Court\'s own: guards, bruisers, reed archers, croakers and duellists. The veterans wear the red armour.'},
  republic:  {faction: 'rae',    names: ['Republic Soldiers', 'Republic Veterans'], blurb: 'The trained troops of Froggle\'s hidden Republic. The veterans wear the plumed helmet.'},
  fraggle:   {faction: 'frog',   names: ['The Black Guard', 'Black Guard Elite'], blurb: 'Fraggle Friggle\'s Black Guard, who followed his son. The elite wear the closed helm.'},
  monkeys:   {faction: 'monkey', names: ['Monkeyland Soldiers', 'Monkeyland Elite'], blurb: 'Soldiers of Monkeyland, in bronze. The elite wear the gilded armour.'},
  gladiators:{faction: 'frog',   names: ['Gladiators', 'Gladiator Champions'], blurb: 'Fighters of the Royal Tournament. The champions wear the scarred helm and cape.'},
  pirates:   {faction: 'pirate', names: ['Pirate Fish', 'Pirate Sharks'], blurb: 'The crew of the Grinning Mary, in every colour of the Satin Sea. The sharks are the old hands.'},
  festive:   {faction: 'rae',    names: ['Festive Soldiers', 'Festive Veterans'], blurb: 'Republic soldiers in their festive colours, for December.'},
  elves:     {faction: 'frog',   names: ['Elf Scouts', 'Santa Scouts'], blurb: 'Frog scouts in elf green; the promoted ones wear Santa red.'},
};
const DEX_SECTION_NAMES = {costumes: 'Costumes', login: 'Daily log-in'};
// The painted backdrop behind a full portrait: the banner it comes from, or else its faction's home (as on the title screen).
const DEX_HOME_BG = {rae: 'mine', frog: 'court', monkey: 'monkeyland', pirate: 'ships'};
const dexBg = (from, faction) => from.find(b => b.bg)?.bg || DEX_HOME_BG[faction] || 'mine';

// Which company (and rarity) a non-unique record belongs to: from its company id, or else by its class.
function dexCompanyOf(ck, rec){
  const stars = rec.stars || 1, m = /^(rae|frog)-(?:([a-z]+)-)?s(\d)-/.exec(rec.gid || '');
  if (m) return {set: m[2] || m[1] + '-base', stars: +m[3]};
  const sets = GACHA_ARMY[ck].troops || {}, set = Object.keys(sets).find(s => sets[s].generic.includes(rec.cls) && sets[s].stars.includes(stars));
  return {set: set || ck + '-base', stars};
}
const isUniqueRec = rec => !!CHARACTERS[rec.key] && CHARACTERS[rec.key].rarity !== 1;

// Remember everyone in the armies now (called on every save).
function dexSync(){
  if (!SAVE?.camps) return;
  const D = SAVE.dex ||= {};
  for (const [ck, st] of Object.entries(SAVE.camps)) for (const r of st.roster || []){
    if (isUniqueRec(r)) D['c:' + r.key] = 1;
    else { const c = dexCompanyOf(ck, r); D[`t:${c.set}:${c.stars}`] = 1; }
    for (const id of r.attires || []) D['a:' + id] = 1;
  }
}

// Every entry, in its section. Built once (the data doesn't change while playing).
let DEX_CACHE = null;
function dexEntries(){
  if (DEX_CACHE) return DEX_CACHE;
  const banners = Object.entries(GACHA_ARMY).flatMap(([ck, a]) => a.banners.map(b => ({...b, ck})));
  const eventOfChar = k => !banners.some(b => !b.event && [...(b.pool || []), ...(b.featured || [])].includes(k)) && banners.find(b => b.event && [...(b.pool || []), ...(b.featured || [])].includes(k))?.event;
  const eventOfAttire = id => banners.find(b => b.event && (b.attires || []).includes(id))?.event;
  const eventOfSet = s => !banners.some(b => !b.event && b.troops === s) && banners.find(b => b.event && b.troops === s)?.event;   // only if no ordinary banner has them too
  const loginOf = id => LOGIN.track.findIndex(e => e.attire?.[1] === id);
  const out = [];
  // unique characters
  for (const [k, c] of Object.entries(CHARACTERS)){
    if (c.rarity === 1) continue;
    const ev = eventOfChar(k), from = banners.filter(b => [...(b.pool || []), ...(b.featured || [])].includes(k));
    const army = Object.keys(CAMPAIGNS).find(ck => CAMPAIGNS[ck].start.includes(k) || CAMPAIGNS[ck].stages.some(s => (s.reward?.joins || []).includes(k) || (s.events || []).some(e => e.join === k)));
    out.push({id: 'c:' + k, kind: 'char', key: k, section: ev || c.faction, faction: c.faction, stars: 3, bg: dexBg(from, c.faction),
              how: from.length ? `Recruited on “${from.map(b => b.name).join('” or “')}”` : army ? `Joins the ${FACTIONS[CAMPAIGNS[army].faction].name} in the story` : 'Joins in the story'});
  }
  // companies, one entry per rarity
  const seen = new Set();
  for (const [ck, a] of Object.entries(GACHA_ARMY)){
    const sets = [[ck + '-base', {stars: [1, 2], generic: a.generic}], ...Object.entries(a.troops || {})];
    for (const [set, T] of sets) for (const stars of T.stars){
      const id = `t:${set}:${stars}`; if (seen.has(id)) continue; seen.add(id);
      const D_ = DEX_COMPANIES[set] || {faction: CAMPAIGNS[ck].faction, names: [set, set + ' ★★']};
      const from = banners.filter(b => set.endsWith('-base') ? b.ck === ck && !b.troops : b.troops === set);
      out.push({id, kind: 'company', set, stars, ck, classes: T.generic, section: eventOfSet(set) || D_.faction, faction: D_.faction, bg: dexBg(set.endsWith('-base') ? [] : from, D_.faction),
                name: D_.names[stars - 1], blurb: D_.blurb,
                how: from.length ? `Recruited on “${from.map(b => b.name).join('”, “')}”${set.endsWith('-base') && stars === 1 ? ', or in the story' : ''}` : 'In the story'});
    }
  }
  // costumes
  for (const [id, A] of Object.entries(ATTIRES)){
    const ev = eventOfAttire(id), n = loginOf(id), from = banners.filter(b => (b.attires || []).includes(id));
    out.push({id: 'a:' + id, kind: 'attire', attire: id, key: A.char, section: ev || (n >= 0 ? 'login' : 'costumes'), faction: CHARACTERS[A.char]?.faction || 'rae', stars: 3, login: n, bg: dexBg(from, CHARACTERS[A.char]?.faction || 'rae'),
              how: n >= 0 ? `Daily log-in ${n + 1}` : from.length ? `Recruited on “${from.map(b => b.name).join('” or “')}”` : 'In the story'});
  }
  // section order: factions, costumes, log-in, events
  const order = ['rae', 'frog', 'monkey', 'pirate', 'costumes', 'login', ...Object.keys(EVENTS)];
  const sections = order.map(s => ({id: s, name: EVENTS[s] ? `${EVENTS[s].icon} ${EVENTS[s].name}` : DEX_SECTION_NAMES[s] || FACTIONS[s]?.name || s,
                                    entries: out.filter(e => e.section === s)})).filter(s => s.entries.length);
  for (const s of sections) if (s.id === 'login') s.entries.sort((a, b) => a.login - b.login);
  return DEX_CACHE = sections;
}

const dexHas = e => !!SAVE.dex?.[e.id];
let DEX_ROLL = {};   // the soldier shown for each company entry (re-rolled when the Collection opens, or with Randomise)
// Something to draw an entry with: the soldier or character you actually have, if any.
function dexEnt(e){
  const recs = Object.entries(SAVE.camps).flatMap(([ck, st]) => (st.roster || []).map(r => ({ck, r})));
  if (e.kind === 'char'){ const own = recs.find(x => x.r.key === e.key)?.r; return own ? {...own, attire: null} : recordFor(e.key); }
  if (e.kind === 'attire') return {key: e.key, look: CHARACTERS[e.key]?.look || e.key, attire: e.attire, faction: e.faction};
  // a company: a random soldier of it (any of its classes, any of its colours), rolled afresh each time the Collection opens
  // Colours still being dyed in the background are skipped (a few tries); if none are ready yet, dexArt shows the undyed art.
  const make = r => ({key: 'recruit', uid: r.seed, name: r.seed, look: CLASS_LOOK[r.cls], cls: r.cls, stars: e.stars, faction: e.faction});
  const pick = () => ({seed: 'dex-' + Math.random().toString(36).slice(2), cls: e.classes[Math.floor(Math.random()*e.classes.length)]});
  if (!DEX_ROLL[e.id]){ let r = pick(); for (let k = 0; k < 40 && !(artFor(make(r), 'token') && artFor(make(r), 'portrait')); k++) r = pick(); DEX_ROLL[e.id] = r; }
  return make(DEX_ROLL[e.id]);
}
// the tile picture: the map-icon head (its outline makes a readable silhouette), or the portrait if there's no icon
// the tile picture: always the map icon the game uses for it (a costume without its own icon uses the character's),
// whose outline also makes a readable silhouette; the portrait only if there is no icon at all
// art for an entry; a soldier whose colours aren't dyed yet shows its company's undyed art (never a plush placeholder)
function dexArt(ent, kind){
  const a = artFor(ent, kind); if (a || ent.key !== 'recruit') return a;
  const sp = speciesOf(ent); if (!sp) return undefined;
  const e = ent.stars === 2, b = sp.base === 'fish' && e ? 'shark' : sp.base;
  for (const k of [b + (e && b !== 'shark' ? 'elite' : ''), b]) if (ART[k]?.[kind]) return ART[k][kind];
}
const dexFace = ent => { const t = dexArt(ent, 'token'); return t ? `<img class="dface" alt="" src="${t}">` : portraitInner(ent, 'panel'); };
// the card picture: the whole portrait (a silhouette until collected)
const dexFull = ent => { const a = dexArt(ent, 'portrait'); return `<img class="dfull" alt="" src="${a || plushPortrait(ent.look)}">`; };
const dexName = e => e.kind === 'char' ? charName(e.key) : e.kind === 'attire' ? ATTIRES[e.attire].name : e.name;

// Redraw an open Collection in place (once soldiers' recoloured art is ready), keeping the scroll position.
function dexRefresh(){ if ($('#dex').hidden) return; const y = window.scrollY; renderDex(true); window.scrollTo(0, y); }
function renderDex(refresh){
  dexSync();
  // December's soldiers are only dyed when needed: the Collection needs them (their entries would otherwise be plush placeholders)
  if (!refresh) DEX_ROLL = {};
  if (!refresh) buildFestiveTroops().then(() => { tokenCache?.clear?.(); dexRefresh(); });
  const S = dexEntries(), all = S.flatMap(s => s.entries), got = all.filter(dexHas).length;
  const tile = e => { const has = dexHas(e);
    return `<button class="dtile${has ? '' : ' locked'}" data-dex="${e.id}" type="button">
      <div class="por f-${e.faction}">${dexFace(dexEnt(e))}</div>
      <b>${has ? dexName(e) : '???'}</b><span class="ustars s${e.stars}">${'★'.repeat(e.stars)}</span></button>`; };
  $('#dex').innerHTML = `
    <div class="sbar"><button class="btn" data-go="hub" type="button">‹ Back</button><h1>Collection</h1><div class="res">${got}<small>of ${all.length}</small></div></div>
    <p class="dintro">Everyone who has ever joined one of your armies, and every costume you've owned. All the ★ soldiers of a company are one entry, and so are the ★★.</p>
    <div class="dchips">${S.map(s => `<button class="chip" data-dexjump="${s.id}" type="button">${s.name} <small>${s.entries.filter(dexHas).length}/${s.entries.length}</small></button>`).join('')}</div>
    ${S.map(s => `<div class="sec" id="dexsec-${s.id}">${s.name} <small>${s.entries.filter(dexHas).length} of ${s.entries.length}</small></div>
      <div class="dgrid">${s.entries.map(tile).join('')}</div>`).join('')}`;
  if (!refresh) showScreen('dex');
}

function openDexEntry(id){
  const e = dexEntries().flatMap(s => s.entries).find(x => x.id === id); if (!e) return;
  const has = dexHas(e), ent = dexEnt(e);
  let ov = $('#armsheet');
  if (!ov){ ov = document.createElement('div'); ov.id = 'armsheet'; ov.className = 'ov'; document.body.appendChild(ov); }
  let body = '';
  if (!has) body = `<p class="meta">Not yet in your collection.</p>`;
  else if (e.kind === 'char'){
    const c = CHARACTERS[e.key], cls = CLASSES[c.cls], ab = ABILITIES[CHARACTER_ABILITY[e.key]];
    body = `<div class="dfacts"><span>${cls.name}</span><span>${WTYPE[cls.w]}</span><span>${FACTIONS[e.faction]?.name || ''}</span></div>
      ${ab ? `<div class="dab"><b>${ab.icon} ${ab.name}</b><span>${ab.text}</span></div>` : ''}
      ${c.intro ? `<p><b>${c.intro.title}.</b> ${c.intro.text}</p>` : ''}`;
  } else if (e.kind === 'attire'){
    const A = ATTIRES[e.attire], ab = A.ability && ABILITIES[A.ability];
    body = `<div class="dfacts"><span>${charName(A.char)}'s costume</span>${A.cls ? `<span>${CLASSES[A.cls].name}</span><span>${WTYPE[CLASSES[A.cls].w]}</span>` : ''}</div>
      <p class="meta">${attireChanges({cls: CHARACTERS[A.char].cls}, A)}</p>
      ${ab ? `<div class="dab"><b>${ab.icon} ${ab.name}</b><span>${ab.text}</span></div>` : ''}<p>${A.desc}</p>`;
  } else {
    body = `<div class="dfacts">${[...new Set(e.classes.map(c => CLASSES[c].name))].map(n => `<span>${n}</span>`).join('')}</div><p>${e.blurb}</p>`;
  }
  ov.innerHTML = `<div class="card wsheet dsheet${has ? '' : ' locked'}">
    <div class="dstage f-${e.faction}"${ART.bg?.[e.bg] ? ` style="--dbg:url(${ART.bg[e.bg]})"` : ''}>${dexFull(ent)}</div>
    <div class="dhead"><span class="ustars s${e.stars}">${'★'.repeat(e.stars)}</span><h1>${has ? dexName(e) : '???'}</h1><h2>${e.kind === 'company' ? 'Soldiers' : e.kind === 'attire' ? 'Costume' : 'Character'}</h2></div>
    ${body}<p class="dhow">${e.how}</p>
    <div class="dbtns">${has && e.kind === 'company' ? '<button class="btn" data-dex-roll type="button">🎲 Randomise</button>' : ''}<button class="btn" data-dex-close type="button">Close</button></div></div>`;
  ov.hidden = false;
  ov.onclick = ev => {
    if (ev.target.closest('[data-dex-roll]')){   // another soldier of the company: a new colour, and maybe another class's look
      delete DEX_ROLL[e.id]; const n = dexEnt(e);
      ov.querySelector('.dstage').innerHTML = dexFull(n);
      const tile = document.querySelector(`.dtile[data-dex="${e.id}"] .por`); if (tile) tile.innerHTML = dexFace(n);
      return; }
    if (ev.target === ov || ev.target.closest('[data-dex-close]')){ ov.hidden = true; ov.onclick = null; ov.innerHTML = ''; } };
}
