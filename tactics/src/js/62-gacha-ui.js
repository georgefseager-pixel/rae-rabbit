// ================= Recruit screen & pull reveal =================
const gachaSel = {};   // selected banner per army
const stars = n => '★'.repeat(n || 1);

// The banner poster: its ★★★ characters standing large over a painted backdrop (banner.bg).
function bannerArt(ck, b){
  const keys = b.featured || b.pool || GACHA_ARMY[ck].rares;
  const figs = keys.map((k, i) => {
    const src = artFor(k, 'portrait') || plushPortrait(CHARACTERS[k].look || k);
    return `<div class="bfig${artFor(k, 'portrait') ? '' : ' plush'}" style="--i:${i}"><img alt="" src="${src}"></div>`;
  }).join('');
  const plates = keys.map(k => `<div class="bplate"><span class="bpst">★★★</span><b>${CHARACTERS[k].name}</b><small>${CLASSES[CHARACTERS[k].cls].name}</small></div>`).join('');
  const bg = b.bg && ART.bg?.[b.bg];
  return `<div class="bhero"${bg ? ` style="--bgimg:url(${bg})"` : ''}>
      <div class="brays"></div>
      <div class="bfigs n${keys.length}">${figs}</div>
      <div class="btitle${b.featured ? ' rated' : ''}"><div class="bkind">${b.kind === 'featured' ? 'Featured banner' : 'Standard banner'}</div><h2>${b.name}</h2></div>
      ${b.featured ? '<div class="brate">Rate up</div>' : ''}
      <div class="bplates">${plates}</div>
    </div>`;
}
function recruitTabHTML(ck){
  const army = GACHA_ARMY[ck], g = gachaState(ck), st = SAVE.camps[ck], F = FACTIONS[CAMPAIGNS[ck].faction];
  const banners = army.banners;
  if (!recruitOpen(ck)){   // locked until Chapter One is finished: show what's coming
    const first = banners[0];
    return `<div class="gbar"><div class="tok"><span class="seal sm">${army.seal}</span><b>${g.tokens}</b> ${army.currency}</div></div>
      <div class="gbanner locked f-${CAMPAIGNS[ck].faction}">${bannerArt(ck, first)}
        <div class="binfo"><p><b>Recruiting opens when Chapter One is finished.</b> Clear <b>${chapterRef(army.opensAfter)}</b> to unlock “${first.name}”.</p>
        <p class="meta">Keep the ${army.currency} you earn from battles: they're what you'll recruit with.</p></div></div>`;
  }
  if (!gachaSel[ck] || !bannerOpen(findBanner(ck, gachaSel[ck]))) gachaSel[ck] = banners[0].id;
  const b = findBanner(ck, gachaSel[ck]), pity = g.pity[b.id] || 0, R = GACHA.rarity;
  const poolRares = (b.pool || army.rares).map(k => `${CHARACTERS[k].name}${b.featured?.includes(k) ? ' (rate up)' : ''}`).join(', ');
  return `
    <div class="gbar"><div class="tok"><span class="seal sm">${army.seal}</span><b>${g.tokens}</b> ${army.currency}</div>
      <button class="btn" data-trade type="button" ${st.res < army.trade ? 'disabled' : ''}>Trade ${army.trade} ${F.currency} for 1</button></div>
    <div class="bchips">${banners.map(x => `<button class="bchip${x.id === b.id ? ' on' : ''}" data-banner="${x.id}" type="button" ${bannerOpen(x) ? '' : 'disabled'}>
      ${x.name}<small>${bannerOpen(x) ? (x.kind === 'featured' ? 'Featured' : 'Standard') : 'Locked'}</small></button>`).join('')}</div>
    ${banners.filter(x => !bannerOpen(x)).map(x => `<div class="hint">“${x.name}” opens after <b>${chapterRef(x.after)}</b>.</div>`).join('')}
    <div class="gbanner f-${CAMPAIGNS[ck].faction}" data-b="${b.id}">
      ${bannerArt(ck, b)}
      <div class="binfo"><p>${b.blurb}</p>
        <div class="chips"><span class="chip bonus">★★★ ${R[3].rate}%</span><span class="chip">★★ ${R[2].rate}%</span><span class="chip">★ ${R[1].rate}%</span>
        ${b.featured ? `<span class="chip conv">Rate up · ${b.featured.map(k => CHARACTERS[k].name).join(', ')}</span>` : ''}</div>
        <div class="pity"><div class="pbar"><i style="width:${pity/GACHA.pity*100}%"></i></div>
          <span>★★★ guaranteed within <b>${GACHA.pity - pity}</b> more pull${GACHA.pity - pity === 1 ? '' : 's'}</span></div>
      </div>
    </div>
    <div class="pullbtns">
      <button class="btn" data-pull="1" type="button" ${g.tokens < 1 ? 'disabled' : ''}>Recruit ×1 · 1 ${army.one}</button>
      <button class="btn primary" data-pull="10" type="button" ${g.tokens < 10 ? 'disabled' : ''}>Recruit ×10 · 10 ${army.currency}</button>
    </div>
    <details class="rates"><summary>Rates and pool</summary>
      <div class="rlist">
        <div><span>★★★ Rare: unique characters, or a ★★★ weapon</span><b>${R[3].rate}%</b></div>
        <div><span>★★ Uncommon: veteran soldiers, or a ★★ weapon</span><b>${R[2].rate}%</b></div>
        <div><span>★ Common: soldiers, or a ★ weapon</span><b>${R[1].rate}%</b></div>
      </div>
      <p class="meta">Rare pool: ${poolRares}.${b.featured ? ` On this banner, ${Math.round(GACHA.featuredShare*100)}% of rare characters are the featured unit.` : ''}
      Soldiers can be any of: ${army.generic.map(c => CLASSES[c].name).join(', ')}.
      About ${Math.round(GACHA.weaponShare*100)}% of results are a weapon of that rarity instead of a recruit.
      Recruiting someone you already have also gives you a weapon of their rarity instead.
      Soldiers come from a fixed company of ${companyOf(ck).length}.
      Every ×10 includes at least one ★★, and a ★★★ is guaranteed by pull ${GACHA.pity} on each banner. Weapons go to the Armoury, on the Army screen.</p>
    </details>`;
}

// ---------- Pull reveal ----------
function cardHTML(r, i, single){
  if (r.weapon){ const w = r.weapon;
    return `<button class="gcard s${r.stars}" data-card="${i}" type="button" aria-label="Reveal pull ${i + 1}">
    <div class="gin"><div class="gback"><span class="seal">${GACHA_ARMY[SAVE.current].seal}</span></div>
      <div class="gface"><div class="gpor gw">${weaponIconSVG(w, single ? 120 : 52)}</div>
        <div class="gtxt"><div class="gstars">${stars(r.stars)}</div><div class="gname">${w.name}</div><div class="gcls">${WTYPE[w.type]}${w.lash ? ' · Whip' : ''}</div><div class="gtag">${r.dupOf ? 'Repeat: weapon' : 'Weapon'}</div></div>
      </div></div></button>`;
  }
  // ×10 cards show the map icon (it reads better this small); a single big card shows the full portrait
  const rec = r.rec, look = rec.look, art = single ? artFor(rec, 'portrait') : (artFor(rec, 'token') || artFor(rec, 'portrait'));
  const tag = 'New';
  return `<button class="gcard s${r.stars}" data-card="${i}" type="button" aria-label="Reveal recruit ${i + 1}">
    <div class="gin">
      <div class="gback"><span class="seal">${GACHA_ARMY[SAVE.current].seal}</span></div>
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
      <div class="sstars">★★★</div><h2>${w.name}</h2><p>${WTYPE[w.type]}${w.lash ? ' (whip)' : ''} · ${weaponStatsText({...w, rng: w.rng || (w.type === 'bow' ? [2, 2] : [1, 1])})}</p>
      <p class="sdesc">${w.desc}</p><div class="stag">${r.dupOf ? `${r.dupOf} is already with you, so: a weapon instead.` : 'Added to the Armoury'}</div><div class="meta">Tap to continue</div></div>`;
    sp.hidden = false; Music.jingle('rare');
    anim(sp.querySelector('.spin'), [{opacity: 0, transform: 'scale(.85)'}, {opacity: 1, transform: 'none'}], 450);
    return new Promise(res => { sp.onclick = () => { sp.hidden = true; sp.onclick = null; res(); }; });
  }
  const rec = r.rec, art = artFor(rec, 'portrait');
  sp.innerHTML = `<div class="spin"><div class="sray"></div>
      <div class="sart">${art ? `<img alt="" src="${art}">` : `<img alt="" src="${plushPortrait(rec.look)}">`}</div>
      <div class="sstars">★★★</div><h2>${rec.name}</h2>
      <p>${CLASSES[rec.cls].name}${CHARACTERS[rec.key]?.placeholder ? ' · placeholder character' : ''}</p>
      <div class="stag">Joins the army</div>
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
  if (!results){ toast(`Not enough ${army.currency}.`); return; }
  const best = Math.max(...results.map(r => r.stars));
  const ov = $('#gacha'), stage = $('#gstage');
  ov.className = 'ov f-' + CAMPAIGNS[ck].faction; ov.hidden = false;
  // 1. The sealed message. Its seal glows in the colour of the best result.
  stage.innerHTML = `<div class="gtease"><div class="note" style="--glow:${GACHA.rarity[best].color}"><span class="seal big">${army.seal}</span></div>
    <p>${army.tease}</p><div class="meta">Tap to break the seal</div></div>`;
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
      <button class="btn primary" data-again="${n}" type="button" ${g.tokens < n ? 'disabled' : ''}>Again ×${n} · ${g.tokens} left</button>`;
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
function recruitTutorial(ck){
  if (!recruitOpen(ck) || recruitSeen(ck)) return;
  SAVE.flags['tut-recruit-' + ck] = true; saveGame();
  const a = GACHA_ARMY[ck], F = FACTIONS[CAMPAIGNS[ck].faction], R = GACHA.rarity;
  const hello = ck === 'rae'
    ? 'Word of you is spreading through the tunnels, Rae Rabbit. Rabbits are coming to find you. Let\'s see who answers.'
    : 'The crown rewards loyalty, little brother. Put out the call and see who answers it.';
  talk([
    {who: a.guide, text: hello},
    {who: 'narr', text: `Recruiting is open. Spend ${a.currency} on a banner to bring new units into your army: one at a time, or ten at once.`},
    {who: 'narr', text: `Every recruit is ★ a soldier (${R[1].rate}%), ★★ a veteran (${R[2].rate}%), or ★★★ a unique character with a story of their own (${R[3].rate}%).`},
    {who: 'narr', text: `A ten-recruit call always brings at least one ★★, and every banner guarantees a ★★★ within ${GACHA.pity} recruits. The bar under the banner shows how close you are.`},
    {who: 'narr', text: 'Some results are weapons instead of recruits. And recruit someone you already have, and you get a weapon of their rarity instead.'},
    {who: 'narr', text: 'Weapons go to the Armoury, on the Army screen. Any unit of the right type can carry them.'},
    {who: 'narr', text: `Earn ${a.currency} by clearing stages and winning bonus ★s, or trade ${a.trade} ${F.currency} for one at the top of this screen.`},
  ]);
}
