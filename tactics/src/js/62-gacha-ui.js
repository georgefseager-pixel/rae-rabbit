// ================= Recruit screen & pull reveal =================
const gachaSel = {};   // selected banner per army
const stars = n => '★'.repeat(n || 1);

function bannerArt(ck, b){
  const keys = b.featured || b.pool || GACHA_ARMY[ck].rares;
  return keys.map((k, i) => `<div class="bfig${b.featured ? ' big' : ''}" style="--i:${i}">${artFor(k, 'portrait') ? `<img alt="" src="${artFor(k, 'portrait')}">` : `<img alt="" src="${plushPortrait(CHARACTERS[k].look || k)}">`}</div>`).join('');
}
function recruitTabHTML(ck){
  const army = GACHA_ARMY[ck], g = gachaState(ck), st = SAVE.camps[ck], F = FACTIONS[CAMPAIGNS[ck].faction];
  const banners = army.banners;
  if (!gachaSel[ck] || !bannerOpen(findBanner(ck, gachaSel[ck]))) gachaSel[ck] = banners[0].id;
  const b = findBanner(ck, gachaSel[ck]), pity = g.pity[b.id] || 0, R = GACHA.rarity;
  const poolRares = (b.pool || army.rares).map(k => `${CHARACTERS[k].name}${b.featured?.includes(k) ? ' (rate up)' : ''}`).join(', ');
  return `
    <div class="gbar"><div class="tok"><span class="seal sm">${army.seal}</span><b>${g.tokens}</b> ${army.currency}</div>
      <button class="btn" data-trade type="button" ${st.res < army.trade ? 'disabled' : ''}>Trade ${army.trade} ${F.currency} for 1</button></div>
    <div class="bchips">${banners.map(x => `<button class="bchip${x.id === b.id ? ' on' : ''}" data-banner="${x.id}" type="button" ${bannerOpen(x) ? '' : 'disabled'}>
      ${x.name}<small>${bannerOpen(x) ? (x.kind === 'featured' ? 'Featured' : 'Standard') : 'Locked'}</small></button>`).join('')}</div>
    ${banners.filter(x => !bannerOpen(x)).map(x => `<div class="hint">“${x.name}” opens after <b>${chapterRef(x.after)}</b>.</div>`).join('')}
    <div class="gbanner f-${CAMPAIGNS[ck].faction}">
      <div class="bart">${bannerArt(ck, b)}</div>
      <div class="binfo"><div class="bkind">${b.kind === 'featured' ? 'Featured banner' : 'Standard banner'}</div>
        <h2>${b.name}</h2><p>${b.blurb}</p>
        <div class="chips"><span class="chip bonus">★★★ ${R[3].rate}%</span><span class="chip">★★ ${R[2].rate}%</span><span class="chip">★ ${R[1].rate}%</span>
        ${b.featured ? `<span class="chip conv">Rate up · ${b.featured.map(k => CHARACTERS[k].name).join(', ')}</span>` : ''}</div>
        <div class="pity">A ★★★ is guaranteed within <b>${GACHA.pity - pity}</b> more pull${GACHA.pity - pity === 1 ? '' : 's'} on this banner.</div>
      </div>
    </div>
    <div class="pullbtns">
      <button class="btn" data-pull="1" type="button" ${g.tokens < 1 ? 'disabled' : ''}>Recruit ×1 · 1 ${army.one}</button>
      <button class="btn primary" data-pull="10" type="button" ${g.tokens < 10 ? 'disabled' : ''}>Recruit ×10 · 10 ${army.currency}</button>
    </div>
    <details class="rates"><summary>Rates and pool</summary>
      <div class="rlist">
        <div><span>★★★ Rare: unique characters</span><b>${R[3].rate}%</b></div>
        <div><span>★★ Uncommon: veteran soldiers</span><b>${R[2].rate}%</b></div>
        <div><span>★ Common: soldiers</span><b>${R[1].rate}%</b></div>
      </div>
      <p class="meta">Rare pool: ${poolRares}.${b.featured ? ` On this banner, ${Math.round(GACHA.featuredShare*100)}% of rare results are the featured unit.` : ''}
      Soldiers can be any of: ${army.generic.map(c => CLASSES[c].name).join(', ')}.
      Every ×10 includes at least one ★★. A ★★★ is guaranteed by pull ${GACHA.pity} on each banner.
      A duplicate rare raises their Bond (up to ${GACHA.bondMax}); after that it returns ${GACHA.release[3]} ${army.currency}.</p>
    </details>`;
}

// ---------- Pull reveal ----------
function cardHTML(r, i){
  const rec = r.rec, look = rec.look, art = artFor(rec, 'portrait');
  const tag = r.kind === 'new' ? 'New' : r.kind === 'bond' ? `Bond ${rec.bond}` : `+${r.refund}`;
  return `<button class="gcard s${r.stars}" data-card="${i}" type="button" aria-label="Reveal recruit ${i + 1}">
    <div class="gin">
      <div class="gback"><span class="seal">${GACHA_ARMY[SAVE.current].seal}</span></div>
      <div class="gface">
        <div class="gpor">${art ? `<img alt="" src="${art}">` : `<img alt="" src="${plushPortrait(look)}">`}</div>
        <div class="gstars">${stars(r.stars)}</div>
        <div class="gname">${rec.name}</div>
        <div class="gcls">${CLASSES[rec.cls].name}</div>
        <div class="gtag">${tag}</div>
      </div>
    </div></button>`;
}
function spotlight(r){
  const rec = r.rec, art = artFor(rec, 'portrait');
  const sp = $('#gspot');
  sp.innerHTML = `<div class="spin"><div class="sray"></div>
      <div class="sart">${art ? `<img alt="" src="${art}">` : `<img alt="" src="${plushPortrait(rec.look)}">`}</div>
      <div class="sstars">★★★</div><h2>${rec.name}</h2>
      <p>${CLASSES[rec.cls].name}${CHARACTERS[rec.key]?.placeholder ? ' · placeholder character' : ''}</p>
      <div class="stag">${r.kind === 'new' ? 'Joins the army' : r.kind === 'bond' ? `Bond rises to ${rec.bond}` : `Bond is full: +${r.refund} ${GACHA_ARMY[SAVE.current].currency}`}</div>
      <div class="meta">Tap to continue</div></div>`;
  sp.hidden = false;
  anim(sp.querySelector('.spin'), [{opacity: 0, transform: 'scale(.85)'}, {opacity: 1, transform: 'none'}], 450);
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
  await anim(note, [{transform: 'scale(1)', opacity: 1}, {transform: 'scale(1.25)', opacity: 0}], 380);
  // 2. Face-down cards. Tap each to turn it over, or reveal them all.
  stage.innerHTML = `<div class="gtitle">${findBanner(ck, gachaSel[ck]).name}</div>
    <div class="ggrid n${n}">${results.map(cardHTML).join('')}</div>
    <div class="gacts"><button class="btn" data-reveal-all type="button">Reveal All</button></div>`;
  const cards = [...stage.querySelectorAll('.gcard')];
  cards.forEach((c, i) => anim(c, [{opacity: 0, transform: 'translateY(20px)'}, {opacity: 1, transform: 'none'}], 300, {delay: i*50, fill: 'backwards'}));
  let busyReveal = false;
  const reveal = async i => {
    const c = cards[i]; if (c.classList.contains('open')) return;
    c.classList.add('open');
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
