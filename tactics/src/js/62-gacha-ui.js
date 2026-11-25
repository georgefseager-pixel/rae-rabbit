// ================= Recruit screen & pull reveal =================
const gachaSel = {};   // selected banner per army
const stars = n => '★'.repeat(n || 1);

// The banner poster: its ★★★ characters standing large over a painted backdrop (banner.bg).
// A banner's featured attires, as entities that show the attire's art (artResolve) and its class.
const attireEnt = id => { const a = ATTIRES[id], c = CHARACTERS[a.char]; return {key: a.char, look: c.look || a.char, attire: id, cls: a.cls || c.cls}; };
function bannerArt(ck, b){
  const keys = b.featured || b.pool || GACHA_ARMY[ck].rares;
  const items = [...keys.map(k => ({ent: k, look: CHARACTERS[k].look || k, name: CHARACTERS[k].name, cls: CHARACTERS[k].cls})),
                 ...(b.attires || []).map(id => ({ent: attireEnt(id), look: attireEnt(id).look, name: ATTIRES[id].name, cls: attireEnt(id).cls, sub: `${charName(ATTIRES[id].char)} · attire`}))];
  const figs = items.map((x, i) => {
    const art = artFor(x.ent, 'portrait'), src = art || plushPortrait(x.look);
    return `<div class="bfig${art ? '' : ' plush'}" style="--i:${i}"><img alt="" src="${src}"></div>`;
  }).join('');
  const plates = items.map(x => `<div class="bplate"><span class="bpst">★★★</span><b>${x.name}</b><small>${x.sub || CLASSES[x.cls].name}</small></div>`).join('');
  const bg = b.bg && ART.bg?.[b.bg];
  return `<div class="bhero"${bg ? ` style="--bgimg:url(${bg})"` : ''}>
      <div class="brays"></div>
      <div class="bfigs n${items.length}">${figs}</div>
      <div class="btitle${b.featured ? ' rated' : ''}"><div class="bkind">${b.festive ? '❄ Festive banner · December only ❄' : b.kind === 'featured' ? 'Featured banner' : 'Standard banner'}</div><h2>${b.name}</h2></div>
      ${b.festive ? '<div class="brate fest">🎁 Festive</div><div class="bsnow" aria-hidden="true"></div>' : b.featured ? '<div class="brate">Rate up</div>' : ''}
      <div class="bplates">${plates}</div>
    </div>`;
}
// Everyone a banner can give: its ★★★ characters (featured and pool) and its company of soldiers,
// each marked by whether they've ever joined this army (fallen ones still count).
function bannerRoster(ck, b){
  const st = SAVE.camps[ck], army = GACHA_ARMY[ck];
  const rares = [...new Set([...(b.featured || []), ...bannerPool(b)])].map(k => ({
    stars: 3, name: CHARACTERS[k].name, cls: CHARACTERS[k].cls, ent: k, got: st.roster.some(r => r.key === k)}));
  const soldiers = companyOf(ck, b.troops).sort((a, c) => c.stars - a.stars).map(t => ({
    stars: t.stars, name: t.name, cls: t.cls, got: st.roster.some(r => r.gid === t.id),
    ent: {key: 'recruit', look: CLASS_LOOK[t.cls], cls: t.cls, name: t.name, uid: t.id, stars: t.stars, faction: CAMPAIGNS[ck].faction}}));
  // featured attires count as ★★★ results too
  for (const id of b.attires || []){ const a = ATTIRES[id];
    rares.push({stars: 3, name: `${a.name} (${charName(a.char)}'s attire)`, cls: attireEnt(id).cls, ent: attireEnt(id), got: st.roster.some(r => r.key === a.char && r.attires?.includes(id))}); }
  const all = [...rares, ...soldiers];
  return {rares, soldiers, got: all.filter(x => x.got).length, total: all.length};
}
function bannerRosterHTML(ck, b){
  const R = bannerRoster(ck, b);
  const cell = x => { const src = artFor(x.ent, 'token') || artFor(x.ent, 'portrait');
    const look = typeof x.ent === 'string' ? (CHARACTERS[x.ent].look || x.ent) : x.ent.look;
    return `<div class="bcell s${x.stars}${x.got ? ' got' : ''}"><div class="bcimg"><img alt="" src="${src || plushPortrait(look)}"></div>
      <div class="bcname">${x.name}</div><div class="bccls">${stars(x.stars)} ${CLASSES[x.cls].name}</div>
      <div class="bctag">${x.got ? '✓ Recruited' : 'Not yet'}</div></div>`; };
  return `<details class="rates broster"><summary>Who can answer · ${R.got} of ${R.total} recruited</summary>
    <h3 class="bch">★★★ Characters</h3><div class="bgrid">${R.rares.map(cell).join('')}</div>
    <h3 class="bch">Soldiers</h3><div class="bgrid">${R.soldiers.map(cell).join('')}</div></details>`;
}
function recruitTabHTML(ck){
  const army = GACHA_ARMY[ck], g = gachaState(ck), st = SAVE.camps[ck], F = FACTIONS[CAMPAIGNS[ck].faction];
  const banners = army.banners.filter(bannerVisible);   // seasonal banners only while their event is on
  if (!recruitOpen(ck)){   // locked until Chapter One is finished: show what's coming
    const first = banners[0];
    return `<div class="gbar"><div class="tok"><span class="seal sm">${army.seal}</span><b>${g.tokens}</b> ${army.currency}</div></div>
      <div class="gbanner locked f-${CAMPAIGNS[ck].faction}">${bannerArt(ck, first)}
        <div class="binfo"><p><b>Recruiting opens when Chapter One is finished.</b> Clear <b>${chapterRef(army.opensAfter)}</b> to unlock “${first.name}”.</p>
        <p class="meta">Keep the ${army.currency} you earn from battles: they're what you'll recruit with.</p></div></div>`;
  }
  if (!gachaSel[ck] || !bannerOpen(findBanner(ck, gachaSel[ck]))) gachaSel[ck] = banners[0].id;
  const b = findBanner(ck, gachaSel[ck]), cur = bannerCur(ck, b), bal = g[cur.key] || 0, pity = g.pity[b.id] || 0, R = GACHA.rarity;
  const poolRares = [...bannerPool(b).map(k => `${CHARACTERS[k].name}${b.featured?.includes(k) ? ' (rate up)' : ''}`),
                     ...(b.featured || []).filter(k => !bannerPool(b).includes(k)).map(k => `${CHARACTERS[k].name} (rate up)`),
                     ...(b.attires || []).map(id => `${ATTIRES[id].name}, an attire for ${charName(ATTIRES[id].char)} (rate up)`)].join(', ');
  return `
    <div class="gbar"><div class="tok${b.festive ? ' festive' : ''}"><span class="seal sm">${cur.seal}</span><b>${bal}</b> ${cur.name}</div>
      ${b.festive ? `<span class="evuntil">🎁 Festive · until 31 December</span>` : `<button class="btn" data-trade type="button" ${st.res < army.trade ? 'disabled' : ''}>Trade ${army.trade} ${F.currency} for 1</button>`}</div>
    <div class="bchips">${banners.map(x => `<button class="bchip${x.id === b.id ? ' on' : ''}" data-banner="${x.id}" type="button" ${bannerOpen(x) ? '' : 'disabled'}>
      ${x.festive ? '🎁 ' : ''}${x.name}<small>${!bannerOpen(x) ? 'Locked' : x.festive ? 'Festive · December' : x.kind === 'featured' ? 'Featured' : 'Standard'}</small></button>`).join('')}</div>
    ${banners.filter(x => !bannerOpen(x)).map(x => `<div class="hint">“${x.name}” opens after <b>${chapterRef(x.after)}</b>.</div>`).join('')}
    <div class="gbanner f-${CAMPAIGNS[ck].faction}${b.festive ? ' festive' : ''}" data-b="${b.id}">
      ${bannerArt(ck, b)}
      ${(() => { const R = bannerRoster(ck, b); return R.got === R.total ? `<div class="bdone"><b>Complete</b><span>Everyone on this banner has joined. Recruiting again gives weapons.</span></div>` : ''; })()}
      <div class="binfo"><p>${b.blurb}</p>
        <div class="chips"><span class="chip bonus">★★★ ${R[3].rate}%</span><span class="chip">★★ ${R[2].rate}%</span><span class="chip">★ ${R[1].rate}%</span>
        ${b.featured || b.attires ? `<span class="chip conv">Rate up · ${[...(b.featured || []).map(k => CHARACTERS[k].name), ...(b.attires || []).map(id => ATTIRES[id].name)].join(', ')}</span>` : ''}</div>
        <div class="pity"><div class="pbar"><i style="width:${pity/GACHA.pity*100}%"></i></div>
          <span>★★★ guaranteed within <b>${GACHA.pity - pity}</b> more pull${GACHA.pity - pity === 1 ? '' : 's'}</span></div>
      </div>
    </div>
    <div class="pullbtns">
      <button class="btn" data-pull="1" type="button" ${bal < 1 ? 'disabled' : ''}>${b.festive ? '🎁 Unwrap' : 'Recruit'} ×1 · 1 ${cur.one}</button>
      <button class="btn primary" data-pull="10" type="button" ${bal < 10 ? 'disabled' : ''}>${b.festive ? '🎁 Unwrap' : 'Recruit'} ×10 · 10 ${cur.name}</button>
    </div>
    ${bannerRosterHTML(ck, b)}
    <details class="rates"><summary>Rates and pool</summary>
      <div class="rlist">
        <div><span>★★★ Rare: unique characters</span><b>${R[3].rate}%</b></div>
        <div><span>★★ Uncommon: veteran soldiers</span><b>${R[2].rate}%</b></div>
        <div><span>★ Common: soldiers</span><b>${R[1].rate}%</b></div>
      </div>
      <p class="meta">Rare pool: ${poolRares}.${b.featured ? ` On this banner, ${Math.round(GACHA.featuredShare*100)}% of rare characters are the featured unit.` : ''}
      Soldiers can be any of: ${[...new Set(companyOf(ck, b.troops).map(t => t.cls))].map(c => CLASSES[c].name).join(', ')}.
      Recruiting someone you already have gives you a weapon of their rarity instead.${b.attires ? ' So does an attire that\'s already owned, or whose character isn\'t in the army.' : ''}
      Soldiers come from a fixed company of ${companyOf(ck, b.troops).length}.
      Every ×10 includes at least one ★★, and a ★★★ is guaranteed by pull ${GACHA.pity} on each banner. Weapons go to the Armoury, on the Army screen.</p>
    </details>`;
}

// ---------- Pull reveal ----------
let pullSeal = '';   // the card backs' seal for the pull being shown (an event banner's 🎁)
function cardHTML(r, i, single){
  if (r.weapon){ const w = r.weapon;
    return `<button class="gcard s${r.stars}" data-card="${i}" type="button" aria-label="Reveal pull ${i + 1}">
    <div class="gin"><div class="gback"><span class="seal">${pullSeal}</span></div>
      <div class="gface"><div class="gpor gw">${weaponIconSVG(w, single ? 120 : 52)}</div>
        <div class="gtxt"><div class="gstars">${stars(r.stars)}</div><div class="gname">${w.name}</div><div class="gcls">${WTYPE[w.type]}${w.lash ? ' · Whip' : ''}</div><div class="gtag">Weapon</div></div>
      </div></div></button>`;
  }
  if (r.attire){ const ent = attireEnt(r.attireId), art = single ? artFor(ent, 'portrait') : (artFor(ent, 'token') || artFor(ent, 'portrait'));
    return `<button class="gcard s3" data-card="${i}" type="button" aria-label="Reveal pull ${i + 1}">
    <div class="gin"><div class="gback"><span class="seal">${pullSeal}</span></div>
      <div class="gface"><div class="gpor"><img alt="" src="${art || plushPortrait(ent.look)}"></div>
        <div class="gtxt"><div class="gstars">${stars(3)}</div><div class="gname">${r.attire.name}</div><div class="gcls">${r.rec.name}</div><div class="gtag">Attire</div></div>
      </div></div></button>`;
  }
  // ×10 cards show the map icon (it reads better this small); a single big card shows the full portrait
  const rec = r.rec, look = rec.look, art = single ? artFor(rec, 'portrait') : (artFor(rec, 'token') || artFor(rec, 'portrait'));
  const tag = r.kind === 'back' ? 'Returns' : 'New';
  return `<button class="gcard s${r.stars}" data-card="${i}" type="button" aria-label="Reveal recruit ${i + 1}">
    <div class="gin">
      <div class="gback"><span class="seal">${pullSeal}</span></div>
      <div class="gface">
        <div class="gpor">${art ? `<img alt="" src="${art}">` : `<img alt="" src="${plushPortrait(look)}">`}</div>
        <div class="gtxt">
          <div class="gstars">${stars(r.stars)}</div>
          <div class="gname">${rec.name}</div>
          <div class="gcls">${CLASSES[rec.cls].name}</div>
          <div class="gtag">${tag}</div>
        </div>
      </div>
    </div></button>`;
}
function spotlight(r){
  const sp = $('#gspot');
  if (r.weapon){ const w = r.weapon;
    sp.innerHTML = `<div class="spin"><div class="sray"></div><div class="sart sw">${weaponIconSVG(w, 160)}</div>
      <div class="sstars">★★★</div><h2>${w.name}</h2><p>${WTYPE[w.type]}${w.lash ? ' (whip)' : ''} · ${weaponStatsText({...w, rng: w.rng || typeRange(w.type)})}</p>
      <p class="sdesc">${w.desc}</p><div class="stag">Added to the Armoury</div><div class="meta">Tap to continue</div></div>`;
    sp.hidden = false; Music.jingle('rare');
    anim(sp.querySelector('.spin'), [{opacity: 0, transform: 'scale(.85)'}, {opacity: 1, transform: 'none'}], 450);
    return new Promise(res => { sp.onclick = () => { sp.hidden = true; sp.onclick = null; res(); }; });
  }
  if (r.attire){ const a = r.attire, rec = r.rec, art = artFor(attireEnt(r.attireId), 'portrait');
    sp.innerHTML = `<div class="spin"><div class="sray"></div><div class="sart"><img alt="" src="${art || plushPortrait(rec.look)}"></div>
      <div class="sstars">★★★</div><h2>${a.name}</h2><p>${rec.name}'s attire · ${attireChanges(rec, a)}</p>
      <p class="sdesc">${a.desc}</p><div class="stag">New attire: wear it from ${rec.name}'s unit card</div><div class="meta">Tap to continue</div></div>`;
    sp.hidden = false; Music.jingle('rare');
    anim(sp.querySelector('.spin'), [{opacity: 0, transform: 'scale(.85)'}, {opacity: 1, transform: 'none'}], 450);
    return new Promise(res => { sp.onclick = () => { sp.hidden = true; sp.onclick = null; res(); }; });
  }
  const rec = r.rec, art = artFor(rec, 'portrait');
  sp.innerHTML = `<div class="spin"><div class="sray"></div>
      <div class="sart">${art ? `<img alt="" src="${art}">` : `<img alt="" src="${plushPortrait(rec.look)}">`}</div>
      <div class="sstars">★★★</div><h2>${rec.name}</h2>
      <p>${CLASSES[rec.cls].name}${CHARACTERS[rec.key]?.placeholder ? ' · placeholder character' : ''}</p>
      <div class="stag">${r.kind === 'back' ? 'Stitched back up, and rejoins the army' : 'Joins the army'}</div>
      <div class="meta">Tap to continue</div></div>`;
  sp.hidden = false; Music.jingle('rare');
  anim(sp.querySelector('.spin'), [{opacity: 0, transform: 'scale(.85)'}, {opacity: 1, transform: 'none'}], 450);
  const intro = r.kind === 'new' && CHARACTERS[rec.key]?.intro;
  return new Promise(res => { sp.onclick = () => {
    sp.onclick = null;
    if (intro) return introCard(rec, intro, 'Joins the army').then(res);
    sp.hidden = true; res();
  }; });
}
// A ★★★ character's first arrival: who they are, in a few lines (many are never met in the main story).
function introCard(rec, intro, kicker){
  const sp = $('#gspot'), art = artFor(rec, 'portrait');
  sp.innerHTML = `<div class="sintro f-${rec.faction}">
      <div class="iart">${art ? `<img alt="" src="${art}">` : `<img alt="" src="${plushPortrait(rec.look)}">`}</div>
      <div class="itxt"><div class="ikick${kicker.includes('★') ? ' gold' : ''}">${kicker}</div><h2>${rec.name}</h2><div class="ititle">${intro.title}</div>
        <p>${intro.text}</p>
        <div class="ifacts">${CLASSES[rec.cls].name} · ${weaponName(rec)}</div></div>
      <div class="meta">Tap to continue</div></div>`;
  anim(sp.querySelector('.sintro'), [{opacity: 0, transform: 'translateY(16px)'}, {opacity: 1, transform: 'none'}], 380);
  return new Promise(res => { sp.onclick = () => { sp.hidden = true; sp.onclick = null; res(); }; });
}
async function runPull(ck, n){
  const army = GACHA_ARMY[ck], results = doPull(ck, gachaSel[ck], n);
  const B_ = findBanner(ck, gachaSel[ck]), cur = bannerCur(ck, B_); pullSeal = cur.seal;
  if (!results){ toast(`Not enough ${cur.name}.`); return; }
  const best = Math.max(...results.map(r => r.stars));
  const ov = $('#gacha'), stage = $('#gstage');
  ov.className = 'ov f-' + CAMPAIGNS[ck].faction + (B_.festive ? ' festive' : ''); ov.hidden = false;
  // 1. The sealed message. Its seal glows in the colour of the best result.
  stage.innerHTML = `<div class="gtease${B_.festive ? ' festive' : ''}"><div class="note" style="--glow:${GACHA.rarity[best].color}"><span class="seal big">${cur.seal}</span></div>
    <p>${cur.tease}</p><div class="meta">${B_.festive ? 'Tap to unwrap' : 'Tap to break the seal'}</div></div>`;
  const note = stage.querySelector('.note');
  anim(note, [{transform: 'rotate(-2deg)'}, {transform: 'rotate(2deg)'}, {transform: 'rotate(-2deg)'}], 700, {iterations: Infinity});
  await new Promise(res => { ov.onclick = res; });
  ov.onclick = null;
  Sfx.play('seal');
  await anim(note, [{transform: 'scale(1)', opacity: 1}, {transform: 'scale(1.25)', opacity: 0}], 380);
  // 2. Face-down cards. Tap each to turn it over, or reveal them all.
  stage.innerHTML = `<div class="gtitle">${findBanner(ck, gachaSel[ck]).name}</div>
    <div class="ggrid n${n}">${results.map((r, i) => cardHTML(r, i, n === 1)).join('')}</div>
    <div class="gacts"><button class="btn" data-reveal-all type="button">Reveal All</button></div>`;
  const cards = [...stage.querySelectorAll('.gcard')];
  cards.forEach((c, i) => anim(c, [{opacity: 0, transform: 'translateY(20px)'}, {opacity: 1, transform: 'none'}], 300, {delay: i*50, fill: 'backwards'}));
  let busyReveal = false;
  const reveal = async i => {
    const c = cards[i]; if (c.classList.contains('open')) return;
    c.classList.add('open'); Sfx.play('flip'); setTimeout(() => Sfx.play('star', results[i].stars), 220);
    if (results[i].stars === 3){ busyReveal = true; await wait(500); await spotlight(results[i]); busyReveal = false; }
    if (cards.every(x => x.classList.contains('open'))) finishReveal();
  };
  const finishReveal = () => {
    const g = gachaState(ck);
    stage.querySelector('.gacts').innerHTML = `<button class="btn" data-gdone type="button">Done</button>
      <button class="btn primary" data-again="${n}" type="button" ${(g[cur.key] || 0) < n ? 'disabled' : ''}>Again ×${n} · ${g[cur.key] || 0} left</button>`;
  };
  stage.onclick = async e => {
    if (busyReveal) return;
    const card = e.target.closest('[data-card]'), b = e.target.closest('button');
    if (card) return reveal(+card.dataset.card);
    if (!b) return;
    if ('revealAll' in b.dataset){ for (let i = 0; i < cards.length; i++){ if (!cards[i].classList.contains('open')){ await reveal(i); await wait(90); } } }
    else if ('gdone' in b.dataset){ ov.hidden = true; stage.onclick = null; renderArmy(); }
    else if (b.dataset.again){ stage.onclick = null; runPull(ck, +b.dataset.again); }
  };
}
// Re-read a ★★★ character's intro from the Army screen.
function showIntro(uid){
  const rec = stOf().roster.find(r => r.uid === uid), intro = rec && CHARACTERS[rec.key]?.intro;
  if (!intro) return;
  const ov = $('#gacha'); ov.className = 'ov f-' + rec.faction; $('#gstage').innerHTML = ''; ov.hidden = false; $('#gspot').hidden = false;
  introCard(rec, intro, `${'★'.repeat(rec.stars || 3)}`).then(() => { ov.hidden = true; });
}

// ---------- First visit: a short guide to recruiting ----------
const recruitSeen = ck => !!SAVE.flags['tut-recruit-' + ck];
// Played over the campaign screen as soon as recruiting opens (see unlockTutorials).
function recruitTutorial(ck){
  if (!recruitOpen(ck) || recruitSeen(ck)) return;
  SAVE.flags['tut-recruit-' + ck] = true; saveGame();
  const a = GACHA_ARMY[ck], F = FACTIONS[CAMPAIGNS[ck].faction], R = GACHA.rarity;
  const hello = ck === 'rae'
    ? 'Word of you is spreading through the tunnels, Rae Rabbit. Rabbits are coming to find you. Let\'s see who answers.'
    : 'The crown rewards loyalty, little brother. Put out the call and see who answers it.';
  return talk([
    {who: a.guide, text: hello},
    {who: 'narr', text: `Recruiting is open. Spend ${a.currency} on a banner to bring new units into your army: one at a time, or ten at once.`},
    {who: 'narr', text: `Every recruit is ★ a soldier (${R[1].rate}%), ★★ a veteran (${R[2].rate}%), or ★★★ a unique character with a story of their own (${R[3].rate}%).`},
    {who: 'narr', text: `A ten-recruit call always brings at least one ★★, and every banner guarantees a ★★★ within ${GACHA.pity} recruits. The bar under the banner shows how close you are.`},
    {who: 'narr', text: 'Recruit someone you already have, and you get a weapon of their rarity instead.'},
    {who: 'narr', text: 'Weapons go to the Armoury, on the Army screen. Any unit of the right type can carry them.'},
    {who: 'narr', text: `Earn ${a.currency} by clearing stages and winning bonus ★s, or trade ${a.trade} ${F.currency} for one at the top of the Recruit screen.`},
    {who: 'narr', text: 'To begin, tap Army & Armoury, then the Recruit tab.'},
  ]);
}
