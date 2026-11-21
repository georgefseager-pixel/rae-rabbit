// ================= Campaign screens =================
const SCREENS = ['app', 'hub', 'army', 'prep', 'result'];
const campTrack = () => CAMPAIGNS[SAVE.current]?.faction === 'frog' ? 'frogCamp' : 'raeCamp';
function showScreen(id){
  for (const s of SCREENS) $('#' + s).hidden = s !== id;
  if (id !== 'app') Music.want(campTrack());   // battles choose their own music
  if (id !== 'app') window.scrollTo(0, 0);
}
const campOf = () => CAMPAIGNS[SAVE.current];
const stOf = () => SAVE.camps[SAVE.current];
const otherCamp = ck => Object.keys(CAMPAIGNS).find(k => k !== ck);
const objectiveLabel = ob => ob.type === 'boss' ? (ob.limit ? `Defeat the commander within ${ob.limit} turns` : 'Defeat the commander') : ob.type === 'survive' ? `Survive ${ob.turns} turns` : 'Rout the enemy';
function chapterRef(id){
  const f = findStage(id); if (!f) return id;
  return `${FACTIONS[CAMPAIGNS[f.camp].faction].name} · ${stageLabel(f.st)}: ${f.st.title}`;
}
const stageLabel = sg => sg.stub ? sg.chapter.title : `${sg.chapter.title.replace('Chapter ', 'Ch. ')}, Stage ${sg.si + 1}`;
function progressLabel(ck){
  const chs = CAMPAIGNS[ck].stages.filter(c => !c.stub), done = SAVE.camps[ck].cleared.length;
  const i = currentStageIndex(ck), s = stageState(ck, i).s;
  const got = chs.filter(c => c.star && hasStar(c.id)).length, of = chs.filter(c => c.star).length;
  return `${s === 'gate' ? `${done}/${chs.length} · waiting` : `${done}/${chs.length} cleared`}${of ? ` · ★ ${got}/${of}` : ''}`;
}

// ---------- Hub ----------
function nodeHTML(ck, ch, i){
  const st = stageState(ck, i), n = ch.stub ? '…' : ch.si + 1;
  const conv = ch.convergence ? `<span class="chip conv">Convergence · ${ch.convergence}</span>` : '';
  if (st.s === 'done'){
    const got = hasStar(ch.id);
    return `<div class="node"><div class="pin done">${n}</div><div class="ncard"><div class="nhead"><h3>${ch.title}</h3>${ch.star ? `<span class="nstar${got ? ' got' : ''}" aria-label="${got ? 'Bonus star earned' : 'Bonus star not earned'}">${got ? '★' : '☆'}</span>` : ''}</div>
      <div class="chips"><span class="chip ok">Cleared</span>${conv}</div>
      ${ch.star ? `<div class="starrow${got ? ' got' : ''}">${got ? '★ Bonus earned' : '☆ Bonus'}: ${starText(ch, ck)}${got ? '' : ` · <b>+${GACHA.starTokens} ${GACHA_ARMY[ck].currency}</b>`}</div>` : ''}
      <button class="btn" data-play="${i}" type="button">${got ? 'Replay' : 'Replay for the ★'}</button></div></div>`;
  }
  if (st.s === 'next') return `<div class="node"><div class="pin next">${n}</div><div class="ncard">
      <h3>${ch.title}</h3><div class="nmeta">${ch.brief}</div>
      <div class="chips"><span class="chip">${objectiveLabel(ch.objective)}</span><span class="chip">vs ${FACTIONS[ch.enemyFaction].name}</span>${conv}</div>
      ${ch.star ? `<div class="starrow">☆ Bonus: ${starText(ch, ck)} · <b>+${GACHA.starTokens} ${GACHA_ARMY[ck].currency}</b></div>` : ''}
      <button class="btn primary" data-play="${i}" type="button">Prepare for Battle</button></div></div>`;
  if (st.s === 'gate'){
    const other = findStage(st.missing[0]).camp;
    return `<div class="node"><div class="pin gate">${n}</div><div class="ncard">
      <h3>${ch.title}</h3><div class="chips">${conv}</div>
      ${ch.stub ? `<div class="nmeta">${ch.brief}</div>` : ''}<div class="gatebox"><span>The stories meet here. Before this can begin, the other side must reach the same moment. Clear <b>${st.missing.map(chapterRef).join('</b> and <b>')}</b>.</span>
      <button class="btn" data-camp="${other}" type="button">Switch to the ${FACTIONS[CAMPAIGNS[other].faction].name}</button></div></div></div>`;
  }
  if (st.s === 'stub') return `<div class="node"><div class="pin stub">${n}</div><div class="ncard dim"><h3>${ch.title}</h3><div class="nmeta">${ch.brief}</div></div></div>`;
  return `<div class="node"><div class="pin future">${n}</div><div class="ncard dim"><h3>${ch.title}</h3><div class="chips">${conv}<span class="chip">Locked</span></div></div></div>`;
}
function renderHub(){
  const ck = SAVE.current, camp = campOf(), st = stOf(), F = FACTIONS[camp.faction];
  const lord = st.roster.find(r => r.lord), alive = living(ck);
  const art = artFor(lord, 'portrait') || plushPortrait(lord.look);
  const avg = Math.round(alive.reduce((a, r) => a + r.lv, 0)/alive.length*10)/10;
  $('#hub').innerHTML = `<div class="sin f-${camp.faction}">
    <div class="sbar"><h1>TOY WARS</h1><button class="btn" data-sound type="button">${SOUND_SHORT[Audio_.mode]}</button><button class="btn" data-go="title" type="button">Title</button></div>
    <div class="fswitch" role="tablist" aria-label="Choose a story">${Object.entries(CAMPAIGNS).map(([k, c]) =>
      `<button class="f-${c.faction}${k === ck ? ' on' : ''}" data-camp="${k}" role="tab" aria-selected="${k === ck}" type="button">${FACTIONS[c.faction].name}<small>${progressLabel(k)}</small></button>`).join('')}</div>
    <div class="hero f-${camp.faction}">
      <div class="himg"><img alt="${lord.name}" src="${art}"></div>
      <div><h2>${camp.name}</h2><div class="tagl">${(() => { const sg = camp.stages[currentStageIndex(ck)]; return `${sg.chapter.title}: ${sg.chapter.name}`; })()}</div>
        <div class="hstats"><span><b>${st.res}</b> ${F.currency}</span><span><b>${gachaState(ck).tokens}</b> ${GACHA_ARMY[ck].currency}</span><span><b>${alive.length}</b> in the army</span><span>Avg Lv <b>${avg}</b></span></div>
        <button class="btn" data-go="army" type="button">Army &amp; Armoury</button>
        ${recruitOpen(ck) && !recruitSeen(ck) ? `<button class="btn primary newrec" data-recruit-now type="button">New: Recruiting is open</button>` : ''}</div>
    </div>
    ${SAVE.debugUnlock ? '<div class="gatebox"><span><b>Debug:</b> all fights and recruit banners are unlocked.</span></div>' : ''}
    ${camp.chapters.map(c => `<div class="chead"><span>${c.title}</span>${c.name}</div>
      <div class="track">${camp.stages.map((sg, i) => sg.chapter === c ? nodeHTML(ck, sg, i) : '').join('')}</div>`).join('')}
    <div class="dbg"><button class="btn" data-debug type="button">${SAVE.debugUnlock ? 'Debug: Relock' : 'Debug: Unlock Everything'}</button></div>
  </div>`;
  showScreen('hub');
}

// ---------- Army ----------
let armyTab = 'roster', armyReturn = 'hub';
function statsGrid(rec){
  const s = rec.stats, tb = WEAPON_TIERS[rec.wtier || 0].bonus, w = CLASSES[rec.cls].w;
  return `<div class="stats">${[['HP', s.mhp], [w === 'staff' ? 'Mag' : 'Atk', s.atk + tb], ['Def', s.def], ['Spd', s.spd], ['Mov', s.mov]]
    .map(([l, v]) => `<div><small>${l}</small><span>${v}</span></div>`).join('')}</div>`;
}
// ---------- Roster order and favourites ----------
let rosterSort = 'stars';
try { rosterSort = localStorage.getItem('raepublic-sort') || 'stars'; } catch (e){}
const SORTS = {fav: '♥ Favourites', stars: '★ Rarity', level: 'Level'};
function sortRecs(list){
  const by = {
    stars: (a, b) => (b.stars || 0) - (a.stars || 0) || b.lv - a.lv || b.exp - a.exp,
    level: (a, b) => b.lv - a.lv || b.exp - a.exp || (b.stars || 0) - (a.stars || 0),
    fav:   (a, b) => (b.fav ? 1 : 0) - (a.fav ? 1 : 0) || (b.stars || 0) - (a.stars || 0) || b.lv - a.lv,
  }[rosterSort];
  return [...list.filter(r => r.lord), ...list.filter(r => !r.lord).sort(by)];   // the leader always comes first
}
const sortBarHTML = () => `<div class="sortbar" role="group" aria-label="Sort the roster"><span>Sort</span>${Object.entries(SORTS).map(([k, l]) =>
  `<button class="btn${rosterSort === k ? ' on' : ''}" data-sort="${k}" type="button" aria-pressed="${rosterSort === k}">${l}</button>`).join('')}</div>`;
// re-render without jumping back to the top of the list
function rerenderKeepScroll(){ const y = window.scrollY; if (!$('#prep').hidden) renderPrep(); else renderArmy(); window.scrollTo(0, y); }

function recCard(rec, actions = '', extraClass = ''){
  const c = CLASSES[rec.cls];
  return `<div class="ucard ${extraClass}${rec.dead ? ' dead' : ''}" data-uid="${rec.uid}">
    ${rec.dead ? '' : `<button class="ufav${rec.fav ? ' on' : ''}" data-fav="${rec.uid}" type="button" aria-pressed="${!!rec.fav}" aria-label="${rec.fav ? 'Remove from favourites' : 'Add to favourites'}">${rec.fav ? '♥' : '♡'}</button>`}
    <div class="por f-${rec.faction}">${portraitInner(rec, 'panel')}</div>
    <div class="uinfo"><div class="uhead"><span class="nm">${rec.name}</span><span class="cl">${c.name} · Lv ${rec.lv}</span>${rec.stars ? `<span class="ustars s${rec.stars}">${'★'.repeat(rec.stars)}${rec.bond ? ` <small>Bond ${rec.bond}</small>` : ''}</span>` : ''}</div>
      ${CHARACTERS[rec.key]?.intro && rec.stars === 3 ? `<button class="uabout" data-about="${rec.uid}" type="button">${CHARACTERS[rec.key].intro.title} ›</button>` : ''}
      <div class="ustat"><b>${weaponName(rec)}</b> · ${WTYPE[c.w]}${rec.lord ? ' · <span class="tick">Leader</span>' : ''}${rec.dead ? ' · <span class="tick">Unstitched</span>' : ''}</div>
      <div class="ustat">EXP ${rec.exp}/100</div><div class="xp"><i style="width:${rec.exp}%"></i></div></div>
    ${statsGrid(rec)}${actions}</div>`;
}
function renderArmy(){
  const ck = SAVE.current, camp = campOf(), st = stOf(), F = FACTIONS[camp.faction];
  let body = '';
  if (armyTab === 'roster'){
    const alive = st.roster.filter(r => !r.dead), fallen = st.roster.filter(r => r.dead);
    body = `<div class="hint">Drill a unit for experience, or upgrade its weapon. Fallen units do not return. Recruits can be released for ${GACHA_ARMY[ck].currency}.</div>${sortBarHTML()}<div class="ulist">${sortRecs(alive).map(r => {
      const next = WEAPON_TIERS[(r.wtier || 0) + 1];
      return recCard(r, `<div class="uacts">
        <button class="btn" data-train="${r.uid}" type="button" ${st.res < TRAIN.cost || r.lv >= 20 ? 'disabled' : ''}>Drill +${TRAIN.exp} EXP · ${TRAIN.cost}</button>
        ${next ? `<button class="btn" data-arm="${r.uid}" type="button" ${st.res < next.cost ? 'disabled' : ''}>${next.prefix.trim()} · ${next.cost}</button>` : '<button class="btn" type="button" disabled>Weapon mastered</button>'}
        ${isGachaUnit(r) ? `<button class="btn" data-release="${r.uid}" type="button">Release · +${GACHA.release[r.stars || 1]}</button>` : ''}
      </div>`);
    }).join('')}</div>${fallen.length ? `<div class="sec">Unstitched</div><div class="ulist">${fallen.map(r => recCard(r)).join('')}</div>` : ''}`;
  } else body = recruitTabHTML(ck);
  $('#army').innerHTML = `<div class="sin f-${camp.faction}">
    <div class="sbar"><button class="btn" data-go="${armyReturn}" type="button">‹ Back</button><h1>Army</h1><div class="res">${st.res}<small>${F.currency}</small></div></div>
    <div class="tabs"><button class="btn${armyTab === 'roster' ? ' on' : ''}" data-tab="roster" type="button">Roster</button><button class="btn${armyTab === 'recruit' ? ' on' : ''}" data-tab="recruit" type="button">Recruit</button></div>
    ${body}</div>`;
  showScreen('army');
}
async function trainUnit(uid){
  const st = stOf(), rec = st.roster.find(r => r.uid === uid);
  if (!rec || st.res < TRAIN.cost) return;
  st.res -= TRAIN.cost; rec.exp += TRAIN.exp; Sfx.play('coin');
  while (rec.exp >= 100 && rec.lv < 20){
    rec.exp -= 100; rec.lv++;
    const ups = rollLevel(rec.stats, growthOf(rec));
    await showLevelUp({...rec, ...rec.stats, atk: rec.stats.atk + WEAPON_TIERS[rec.wtier || 0].bonus, w: CLASSES[rec.cls].w}, ups);
  }
  if (rec.lv >= 20) rec.exp = 0;
  saveGame(); renderArmy();
}
function upgradeWeapon(uid){
  const st = stOf(), rec = st.roster.find(r => r.uid === uid), next = rec && WEAPON_TIERS[(rec.wtier || 0) + 1];
  if (!next || st.res < next.cost) return;
  st.res -= next.cost; rec.wtier = (rec.wtier || 0) + 1; Sfx.play('coin');
  saveGame(); toast(`${rec.name} now carries the ${weaponName(rec)}.`); renderArmy();
}
function release(btn){
  const ck = SAVE.current, rec = stOf().roster.find(r => r.uid === btn.dataset.release);
  if (!rec || !armed(btn, 'Tap again to release')) return;
  const back = releaseUnit(ck, rec.uid);
  toast(`${rec.name} leaves the army. +${back} ${GACHA_ARMY[ck].currency}.`); renderArmy();
}

// ---------- Battle preparation ----------
let prep = null;   // {ck, i, picks:Set(uid)}
function openPrep(ck, i){
  const ch = CAMPAIGNS[ck].stages[i], alive = living(ck);
  const max = Math.min(ch.maxDeploy, ch.deploy.length);
  const order = [...alive.filter(r => r.lord), ...alive.filter(r => !r.lord)];
  if (!prep || prep.ck !== ck || prep.i !== i) prep = {ck, i, picks: new Set(order.slice(0, max).map(r => r.uid))};
  for (const uid of [...prep.picks]) if (!alive.some(r => r.uid === uid)) prep.picks.delete(uid);
  renderPrep();
}
function renderPrep(){
  const {ck, i} = prep, camp = CAMPAIGNS[ck], ch = camp.stages[i], alive = living(ck);
  const max = Math.min(ch.maxDeploy, ch.deploy.length), order = [...alive.filter(r => r.lord), ...alive.filter(r => !r.lord)];
  const replaying = SAVE.camps[ck].cleared.includes(ch.id);
  $('#prep').innerHTML = `<div class="sin f-${camp.faction}">
    <div class="sbar"><button class="btn" data-go="hub" type="button">‹ Back</button><h1>Prepare</h1><div class="res">${stOf().res}<small>${FACTIONS[camp.faction].currency}</small></div></div>
    <div class="brief"><div class="kick">${camp.name} · ${stageLabel(ch)}${ch.convergence ? ' · Convergence' : ''}</div><h2>${ch.title}</h2><p>${ch.brief}</p>
      <div class="chips"><span class="chip">${objectiveLabel(ch.objective)}</span><span class="chip">vs ${FACTIONS[ch.enemyFaction].name}</span></div>
      ${ch.star ? `<div class="starrow${hasStar(ch.id) ? ' got' : ''}">${hasStar(ch.id) ? '★ Bonus earned' : '☆ Bonus'}: ${starText(ch, ck)}${hasStar(ch.id) ? '' : ` · <b>+${GACHA.starTokens} ${GACHA_ARMY[ck].currency}</b>`}${ch.star.type === 'fewer' && prep.picks.size > ch.star.n ? ` <span class="warn">(you're deploying ${prep.picks.size})</span>` : ''}</div>` : ''}
      ${replaying ? '<p class="meta">Replay: the story scenes are skipped and nobody new joins. Your army keeps any experience earned, and anyone unstitched is still lost.</p>' : ''}</div>
    <div class="sec">Deploy ${prep.picks.size} of ${max}</div>
    ${sortBarHTML()}
    <div class="ulist">${sortRecs(order).map(r => recCard(r, '', 'pick' + (prep.picks.has(r.uid) ? ' on' : ''))).join('')}</div>
    <div class="sticky"><button class="btn" data-go="army" data-from="prep" type="button">Army</button><button class="btn primary" data-begin type="button">Begin Battle</button></div>
  </div>`;
  showScreen('prep');
}
function togglePick(uid){
  const ch = CAMPAIGNS[prep.ck].stages[prep.i], rec = SAVE.camps[prep.ck].roster.find(r => r.uid === uid), max = Math.min(ch.maxDeploy, ch.deploy.length);
  if (!rec) return;
  if (rec.lord){ toast(`${rec.name} leads every battle.`); return; }
  if (prep.picks.has(uid)) prep.picks.delete(uid);
  else if (prep.picks.size >= max){ toast(`Only ${max} can deploy here.`); return; }
  else prep.picks.add(uid);
  rerenderKeepScroll();
}

// ---------- Playing a chapter ----------
async function playChapter(){
  const {ck, i} = prep, camp = CAMPAIGNS[ck], ch = camp.stages[i], st = SAVE.camps[ck];
  const recs = [...st.roster.filter(r => r.lord), ...st.roster.filter(r => !r.lord && prep.picks.has(r.uid))].filter(r => !r.dead);
  const replay = st.cleared.includes(ch.id);   // replays skip the story and its one-time rewards
  if (!replay){
    applyOutfits(ck, ch.chapter.outfits);
    await talk(ch.pre);
    if (ch.rename){ applyRename(ck, ch.rename); saveGame(); }
  }
  const res = await runBattle(ck, ch, recs);
  const kills = B.kills;
  if (!res.win){
    B = null;
    renderResult({win: false, retreated: res.retreated, ck, i});
    return;
  }
  // Commit the battle to the permanent army.
  for (const u of res.survivors){
    const r = u.rec;
    r.lv = u.lv; r.exp = u.exp;
    r.stats = {mhp: u.mhp, atk: u.atk - u.tb, def: u.def, spd: u.spd, skl: u.skl, mov: u.mov};
  }
  for (const u of res.lost) u.rec.dead = true;
  const departed = [], joined = [];
  // bonus star: earned once, for recruiting currency
  const starNew = res.star === 'ok' && !hasStar(ch.id), starTokens = starNew ? GACHA.starTokens : 0;
  if (starNew) SAVE.stars[ch.id] = true;
  const spoils = (replay ? Math.round(ch.reward.res/2) : ch.reward.res) + kills*20, tokens = (replay ? 0 : ch.reward.tokens ?? GACHA.stageTokens) + starTokens;
  st.res += spoils; gachaState(ck).tokens += tokens;
  if (!replay){
    for (const key of ch.departs || []) for (const r of st.roster) if (r.key === key && !r.dead){ r.dead = true; departed.push(r.name || CHARACTERS[key].name); }
    for (const f of ch.reward.flags || []) SAVE.flags[f] = true;
    for (const key of ch.reward.joins || []) if (!st.roster.some(r => r.key === key)){ st.roster.push(recordFor(key)); joined.push(CHARACTERS[key].name); }
    st.cleared.push(ch.id);
  }
  saveGame();
  if (!replay) await talk(ch.post);
  B = null;
  renderResult({win: true, ck, i, replay, turn: res.turn, kills, spoils, tokens, starTokens, star: res.star, joined, lost: res.lost.map(u => u.name), departed});
}

function renderResult(r){
  const camp = CAMPAIGNS[r.ck], ch = camp.stages[r.i], F = FACTIONS[camp.faction];
  let html;
  if (r.win){
    const other = otherCamp(r.ck), opened = CAMPAIGNS[other].stages
      .map((c, j) => ({c, j})).filter(({c, j}) => (c.requires || []).includes(ch.id) && stageState(other, j).s === 'next');
    html = `<div class="brief"><div class="kick">${r.replay ? 'Replay victory' : 'Victory'} · ${camp.name} · ${stageLabel(ch)}</div><h2>${ch.title}</h2><p>Won on turn ${ROMAN(r.turn)}.</p></div>
      <div class="rlist">
        <div><span>Spoils</span><b>+${r.spoils} ${F.currency}</b></div>
        <div><span>For recruiting</span><b>+${r.tokens} ${GACHA_ARMY[r.ck].currency}</b></div>
        <div><span>Foes unstitched</span><b>${r.kills}</b></div>
        ${r.joined.length ? `<div><span>Joined the army</span><b>${r.joined.join(', ')}</b></div>` : ''}
        ${ch.star ? `<div class="rstar ${r.star === 'ok' ? 'got' : ''}"><span>${r.star === 'ok' ? '★' : '☆'} Bonus: ${starText(ch, r.ck)}</span><b>${r.starTokens ? `Earned! +${r.starTokens} ${GACHA_ARMY[r.ck].currency}` : r.star === 'ok' ? 'Done (already earned)' : hasStar(ch.id) ? 'Missed (already earned)' : 'Missed: replay to try again'}</b></div>` : ''}
        ${r.lost.length ? `<div><span>Unstitched for good</span><b>${r.lost.join(', ')}</b></div>` : ''}
        ${r.departed?.length ? `<div><span>Stayed behind</span><b>${r.departed.join(', ')}</b></div>` : ''}
      </div>
      ${ch.id === GACHA_ARMY[r.ck].opensAfter && !r.replay ? `<div class="gatebox recopen"><span><b>Recruiting is now open.</b> Spend your ${GACHA_ARMY[r.ck].currency} to bring new units into the ${FACTIONS[camp.faction].name}'s army.</span><button class="btn primary" data-recruit-now type="button">Go to Recruiting</button></div>` : ''}
      ${opened.map(({c, j}) => `<div class="gatebox"><span>The other story can now go on: <b>${chapterRef(c.id)}</b>.</span><button class="btn" data-camp="${other}" type="button">Switch to the ${FACTIONS[CAMPAIGNS[other].faction].name}</button></div>`).join('')}
      <div class="sticky"><button class="btn primary" data-go="hub" type="button">Continue</button></div>`;
  } else {
    html = `<div class="brief"><div class="kick">${r.retreated ? 'Retreat' : 'Defeat'} · ${camp.name}</div><h2>${ch.title}</h2>
      <p>${r.retreated ? 'You pulled back from the field.' : r.reason === 'limit' ? (ch.limitFail || 'You ran out of time.') : `${speakerName(camp.lord)} has fallen.`} Nothing was lost: your army is exactly as it was before the battle.</p></div>
      <div class="sticky"><button class="btn" data-go="hub" type="button">Campaign</button><button class="btn primary" data-retry type="button">Try Again</button></div>`;
  }
  $('#result').innerHTML = `<div class="sin f-${camp.faction}">${html}</div>`;
  showScreen('result');
}

// ---------- Screen input ----------
document.addEventListener('click', e => {
  const t = e.target.closest('button, .ucard.pick');
  if (!t || !t.closest('.screen')) return;
  const d = t.dataset;
  if (d.camp){ SAVE.current = d.camp; saveGame(); renderHub(); }
  else if (d.go === 'hub') renderHub();
  else if (d.go === 'army'){ armyReturn = d.from || 'hub'; renderArmy(); }
  else if (d.go === 'prep') renderPrep();
  else if (d.go === 'title'){ $('#contBtn').hidden = false; $('#title').hidden = false; Music.want('title'); }
  else if (d.tab){ armyTab = d.tab; renderArmy(); if (d.tab === 'recruit') recruitTutorial(SAVE.current); }
  else if ('recruitNow' in d){ armyTab = 'recruit'; armyReturn = 'hub'; renderArmy(); recruitTutorial(SAVE.current); }
  else if (d.train) trainUnit(d.train);
  else if (d.arm) upgradeWeapon(d.arm);
  else if ('debug' in d){
    if (!armed(t, SAVE.debugUnlock ? 'Tap again to relock' : 'Tap again to unlock all')) return;
    SAVE.debugUnlock = !SAVE.debugUnlock;
    if (SAVE.debugUnlock) for (const ck of Object.keys(SAVE.camps)){ SAVE.camps[ck].res += 100000; gachaState(ck).tokens += 1000; }
    saveGame();
    toast(SAVE.debugUnlock ? 'Debug: every fight and banner unlocked; +100,000 money and +1,000 pulls on both sides.' : 'Relocked: normal progression.'); renderHub();
  }
  else if (d.about) showIntro(d.about);
  else if (d.release) release(t);
  else if (d.banner){ gachaSel[SAVE.current] = d.banner; renderArmy(); }
  else if (d.pull) runPull(SAVE.current, +d.pull);
  else if ('trade' in d){ if (tradeForToken(SAVE.current)) renderArmy(); }
  else if (d.play !== undefined) openPrep(SAVE.current, +d.play);
  else if ('begin' in d) playChapter();
  else if ('retry' in d) openPrep(prep.ck, prep.i);
  else if (d.fav){ const rec = stOf().roster.find(r => r.uid === d.fav); if (rec){ rec.fav = !rec.fav; saveGame(); rerenderKeepScroll(); } }
  else if (d.sort){ rosterSort = d.sort; try { localStorage.setItem('raepublic-sort', d.sort); } catch (e){} rerenderKeepScroll(); }
  else if (t.classList.contains('pick')) togglePick(d.uid);
});

// ---------- Title ----------
// How the two-campaign structure works, shown once when a new game starts.
const INTRO = [
  {who: 'narr', text: 'There are two stories here: the Raepublic and the Friggliarchy. Switch between them whenever you like.'},
  {who: 'narr', text: 'Sometimes the stories meet. When they do, neither can go on until both have reached that point.'},
];
$('#contBtn').addEventListener('click', () => {
  SAVE = SAVE || Store.load();
  if (!SAVE) return;
  $('#title').hidden = true; renderHub();
});
$('#newBtn').addEventListener('click', async e => {
  if ((SAVE || Store.load()) && !armed(e.currentTarget, 'Tap again to erase your save')) return;
  newSave(); saveGame(); prep = null;
  $('#title').hidden = true; renderHub();
  await talk(INTRO); Music.want(campTrack());
});
