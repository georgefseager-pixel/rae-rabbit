// ================= Campaign screens =================
const SCREENS = ['app', 'hub', 'army', 'camp', 'prep', 'result'];
const campTrack = () => CAMPAIGNS[SAVE.current]?.faction === 'frog' ? 'frogCamp' : 'raeCamp';
function showScreen(id){
  for (const s of SCREENS) $('#' + s).hidden = s !== id;
  if (id !== 'app') Music.want(campTrack());   // battles choose their own music
  if (id !== 'app') window.scrollTo(0, 0);
}
const campOf = () => CAMPAIGNS[SAVE.current];
const stOf = () => SAVE.camps[SAVE.current];
const otherCamp = ck => Object.keys(CAMPAIGNS).find(k => k !== ck);
// A main stage is a number (its index); a side story is 's<n>'.
const stageAt = (ck, i) => typeof i === 'string' ? CAMPAIGNS[ck].sides[+i.slice(1)] : CAMPAIGNS[ck].stages[i];
// average level of the units you'd deploy (the leader and the strongest of the rest)
function teamLevel(ck, n){
  const alive = living(ck), lord = alive.filter(r => r.lord), rest = alive.filter(r => !r.lord).sort((a, b) => b.lv - a.lv);
  const team = [...lord, ...rest].slice(0, n); return team.length ? team.reduce((a, r) => a + r.lv, 0)/team.length : 0;
}
function recChip(ck, sg, team){
  const rec = recommendedLevel(sg); if (!rec) return '';
  const have = team ?? teamLevel(ck, Math.min(sg.maxDeploy, sg.deploy.length));
  const low = have < rec - .5;
  return `<span class="chip${low ? " under" : ""}" title="Your team's average: Lv ${have.toFixed(1)}">Rec. Lv ${rec}${low ? ` · yours ${have.toFixed(1)}` : ''}</span>`;
}
const objectiveLabel = ob => ob.type === 'boss' ? (ob.limit ? `Defeat the commander within ${ob.limit} turns` : 'Defeat the commander') : ob.type === 'survive' ? (ob.escort ? `Protect the ${ob.who || 'couriers'} for ${ob.turns} turns` : `Survive ${ob.turns} turns`) : ob.type === 'intercept' ? `Catch the ${ob.who || 'couriers'}` : ob.type === 'escape' ? 'Escape' : 'Rout the enemy';
function chapterRef(id){
  const f = findStage(id); if (!f) return id;
  return `${FACTIONS[CAMPAIGNS[f.camp].faction].name} · ${stageLabel(f.st)}: ${f.st.title}`;
}
const stageLabel = sg => sg.side ? 'Side Story' : sg.stub ? sg.chapter.title : `${sg.chapter.title.replace('Chapter ', 'Ch. ')}, Stage ${sg.si + 1}`;
function progressLabel(ck){
  const chs = CAMPAIGNS[ck].stages.filter(c => !c.stub), done = chs.filter(c => SAVE.camps[ck].cleared.includes(c.id)).length;
  const i = currentStageIndex(ck), s = stageState(ck, i).s;
  const got = chs.filter(c => c.star && hasStar(c.id)).length, of = chs.filter(c => c.star).length;
  return `${s === 'gate' ? `${done}/${chs.length} · waiting` : `${done}/${chs.length} cleared`}${of ? ` · ★ ${got}/${of}` : ''}`;
}

// ---------- Hub ----------
function nodeHTML(ck, ch, i, st = stageState(ck, i)){
  const n = ch.stub ? '…' : ch.side ? '✦' : ch.si + 1;
  const conv = ch.convergence ? `<span class="chip conv">Convergence · ${ch.convergence}</span>` : '';
  if (st.s === 'done'){
    const got = hasStar(ch.id);
    return `<div class="node"><div class="pin done">${n}</div><div class="ncard"><div class="nhead"><h3>${ch.title}</h3>${ch.star ? `<span class="nstar${got ? ' got' : ''}" aria-label="${got ? 'Bonus star earned' : 'Bonus star not earned'}">${got ? '★' : '☆'}</span>` : ''}</div>
      <div class="chips"><span class="chip ok">Cleared</span>${recChip(ck, ch)}${conv}</div>
      ${ch.star ? `<div class="starrow${got ? ' got' : ''}">${got ? '★ Bonus earned' : '☆ Bonus'}: ${starText(ch, ck)}${got ? '' : ` · <b>+${GACHA.starTokens} ${GACHA_ARMY[ck].currency}</b>`}</div>` : ''}
      <button class="btn" data-play="${i}" type="button">${got ? 'Replay' : 'Replay for the ★'}</button></div></div>`;
  }
  if (st.s === 'next') return `<div class="node"><div class="pin next">${n}</div><div class="ncard">
      <h3>${ch.title}</h3><div class="nmeta">${ch.brief}</div>
      <div class="chips">${recChip(ck, ch)}<span class="chip">${objectiveLabel(ch.objective)}</span><span class="chip">vs ${FACTIONS[ch.enemyFaction].name}</span>${conv}</div>
      ${ch.star ? `<div class="starrow">☆ Bonus: ${starText(ch, ck)} · <b>+${GACHA.starTokens} ${GACHA_ARMY[ck].currency}</b></div>` : ''}
      ${ch.side ? sideRewardHTML(ck, ch) : ''}
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
// ---------- Side Stories ----------
let hubTab = 'main';
// Each unique character's set of three (28-data-sides.js): the tab opens with the Camp, then one side story
// with each support rank (C, B, A). The character has to be in the army.
function sideLock(ck, s){
  const st = SAVE.camps[ck];
  if (SAVE.debugUnlock) return null;
  if (!campOpen(ck)) return `Opens with the Camp, after ${chapterRef(SIDE_OPENS[ck])}`;
  if (!st.roster.some(r => r.key === s.char && !r.departed)) return `${speakerName(s.char)} isn't in the army`;
  if (supportRank(ck, s.char) < s.rank) return `Opens with Support ${SUPPORT.ranks[s.rank - 1]} with ${speakerName(s.char)}`;
  return null;
}
const sideState = (ck, j) => { const s = CAMPAIGNS[ck].sides[j];
  if (s.event) return !(eventActive(s.event) && campOpen(ck)) ? {s: 'locked', why: 'Seasonal'} : eventPlayedToday(s) ? {s: 'played'} : {s: 'next'};
  return SAVE.camps[ck].cleared.includes(s.id) ? {s: 'done'} : sideLock(ck, s) ? {s: 'locked', why: sideLock(ck, s)} : {s: 'next'}; };
const sidesNew = ck => CAMPAIGNS[ck].sides.filter((s, j) => sideState(ck, j).s === 'next').length;
function sideRewardHTML(ck, s){
  const r = s.reward, bits = [`${r.res} ${FACTIONS[CAMPAIGNS[ck].faction].currency}`];
  if (r.tokens) bits.push(`${r.tokens} ${GACHA_ARMY[ck].currency}`);
  for (const w of r.weapons || []) if (WEAPONS[w.id]) bits.push(`the ${WEAPONS[w.id].name}`);
  return `<div class="starrow side">Reward: ${bits.join(' · ')}</div>`;
}
function sideNodeHTML(ck, s, j){
  const st = sideState(ck, j);
  if (st.s === 'locked') return `<div class="node"><div class="pin future">${s.rank}</div><div class="ncard dim"><h3>${s.title}</h3>
    ${s.teaser ? `<div class="nmeta">${s.teaser}</div>` : ''}<div class="chips"><span class="chip">${st.why}</span></div></div></div>`;
  return nodeHTML(ck, s, 's' + j, st);
}
// Seasonal event side stories: a festive card at the top of the tab, playable once a day
function eventNodeHTML(ck, s, j){
  const st = sideState(ck, j), E_ = EVENTS[s.event], cur = E_.currency[ck], best = (SAVE.eventBest || {})[s.id];
  return `<div class="evcard"><div class="evsnow" aria-hidden="true"></div>
    <div class="evkick">${E_.icon} ${E_.name} · December only</div><h3>${s.title}</h3>
    <p>${s.brief}</p>
    <div class="chips">${recChip(ck, s)}<span class="chip">${objectiveLabel(s.objective)}</span><span class="chip evc">Up to ${eventMaxGifts(s)} ${cur.name} a day</span>${best != null ? `<span class="chip">Best: ${best} of ${eventMaxGifts(s)}</span>` : ''}</div>
    ${st.s === 'played' ? `<button class="btn" type="button" disabled>Played today · come back tomorrow</button>`
      : `<button class="btn primary evplay" data-play="s${j}" type="button">${E_.icon} Play today's run</button>`}
    <div class="evbal">You have <b>${gachaState(ck).gifts || 0} ${cur.name}</b> for the festive recruiting banner.</div></div>`;
}
function sidesHTML(ck){
  const sets = Object.entries(SIDE_SETS).filter(([, set]) => set.camp === ck);
  const sides = CAMPAIGNS[ck].sides;
  const seasonal = sides.map((s, j) => s.event && sideState(ck, j).s !== 'locked' ? eventNodeHTML(ck, s, j) : '').join('');
  if (!sets.length) return seasonal || '<div class="hint">No side stories on this route yet.</div>';
  return `${seasonal}<div class="hint">Every unique member of the army has three side stories. One opens with each support rank (C, B and A) you reach with them at the Camp. Clear all three for a final conversation, Support S. Their rewards are extras: the main story never needs them.</div>
    ${sets.map(([key, set]) => { const done = sidesDone(ck, key), rank = supportRank(ck, key);
      const sTag = rank >= 4 ? '<span class="chip ok">Support S reached</span>' : done === 3 ? '<span class="chip conv">Support S ready at the Camp</span>' : `<span class="chip">Support S: clear all three</span>`;
      return `<div class="sset"><div class="por f-${CAMPAIGNS[ck].faction}">${portraitInner({key, look: CHARACTERS[key].look || key}, 'panel')}</div>
        <div><h3>${set.title}</h3><p class="meta">${set.about}</p><div class="chips"><span class="chip">${done} of 3 cleared</span>${sTag}</div></div></div>
        <div class="track">${sides.map((s, j) => s.char === key ? sideNodeHTML(ck, s, j) : '').join('')}</div>`; }).join('')}`;
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
        ${energyHTML()}
        <div class="hbtns"><button class="btn" data-go="army" type="button">Army &amp; Armoury</button>
        <button class="btn" data-camp-open type="button" ${campOpen(ck) ? '' : 'disabled'}>${campOpen(ck) ? 'Camp' : 'Camp · after Ch. Two'}</button></div></div>
    </div>
    ${SAVE.debugUnlock ? '<div class="gatebox"><span><b>Debug:</b> all fights and recruit banners are unlocked.</span></div>' : ''}
    ${eventsOn(ck).map(id => { const s = camp.sides.find(x => x.event === id); return s ? `<button class="evstrip" data-hubtab="side" type="button"><span>${EVENTS[id].icon}</span><span><b>${EVENTS[id].name}</b><small>${s.title}${eventPlayedToday(s) ? ' · played today' : ' · ready to play'}</small></span><span>›</span></button>` : ''; }).join('')}
    <div class="htabs" role="tablist"><button class="${hubTab === 'main' ? 'on' : ''}" data-hubtab="main" role="tab" aria-selected="${hubTab === 'main'}" type="button">Main Story</button><button class="${hubTab === 'side' ? 'on' : ''}" data-hubtab="side" role="tab" aria-selected="${hubTab === 'side'}" type="button" ${campOpen(ck) ? '' : 'disabled'}>Side Stories${campOpen(ck) ? '' : ' <small>· after Ch. Two</small>'}${(() => { const n = sidesNew(ck); return n ? ` <span class="hbadge">${n}</span>` : ''; })()}</button></div>
    ${hubTab === 'side' && campOpen(ck) ? sidesHTML(ck) : camp.chapters.map(c => `<div class="chead"><span>${c.title}</span>${c.name}</div>
      <div class="track">${camp.stages.map((sg, i) => sg.chapter === c ? nodeHTML(ck, sg, i) : '').join('')}</div>`).join('')}
    ${debugButtonHTML()}
  </div>`;
  showScreen('hub');
  unlockTutorials(ck);   // anything that just opened explains itself here
  checkDailyLogin();     // then the daily log-in reward, once a day (66-login.js)
}

// ---------- Army ----------
let armyTab = 'roster', armyReturn = 'hub';
function statsGrid(rec){
  const s = statsOf(rec), tb = weaponOf(rec).mt, w = CLASSES[clsOf(rec)].w;
  return `<div class="stats">${[['HP', s.mhp], [isMagic(w) ? 'Mag' : 'Atk', s.atk + tb], ['Def', s.def], ['Spd', s.spd], ['Mov', s.mov]]
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
  const c = CLASSES[clsOf(rec)];
  return `<div class="ucard ${extraClass}${rec.dead ? ' dead' : ''}" data-uid="${rec.uid}">
    ${rec.dead ? '' : `<button class="ufav${rec.fav ? ' on' : ''}" data-fav="${rec.uid}" type="button" aria-pressed="${!!rec.fav}" aria-label="${rec.fav ? 'Remove from favourites' : 'Add to favourites'}">${rec.fav ? '♥' : '♡'}</button>`}
    <div class="por f-${rec.faction}">${portraitInner(rec, 'panel')}</div>
    <div class="uinfo"><div class="uhead"><span class="nm">${rec.name}</span><span class="cl">${c.name} · Lv ${rec.lv}</span>${rec.stars ? `<span class="ustars s${rec.stars}">${'★'.repeat(rec.stars)}</span>` : ''}</div>
      ${rec.dead ? '' : abilityIcon(rec)}
      ${rec.attires?.length && !rec.dead ? `<button class="uattire" data-attire-pick="${rec.uid}" type="button">Attire: ${attireOf(rec)?.name || 'Story outfit'} ›</button>` : ''}
      ${CHARACTERS[rec.key]?.intro && rec.stars === 3 ? `<button class="uabout" data-about="${rec.uid}" type="button">${CHARACTERS[rec.key].intro.title} ›</button>` : ''}
      <div class="ustat">${rec.dead ? `<b>${weaponName(rec)}</b>` : `<button class="uwpn" data-arm-pick="${rec.uid}" type="button" aria-label="Change weapon">${weaponIconSVG(weaponOf(rec), 18)}<b>${weaponName(rec)}</b> ›</button>`} · ${WTYPE[c.w]}${rec.lord ? ' · <span class="tick">Leader</span>' : ''}${rec.dead ? ` · <span class="tick">${rec.departed ? departureLabel(rec) : 'Unstitched'}</span>` : ''}</div>
      <div class="ustat">EXP ${rec.exp}/100</div><div class="xp"><i style="width:${rec.exp}%"></i></div></div>
    ${statsGrid(rec)}${actions}</div>`;
}
// Release every soldier of a rarity at once: ★ or ★★ recruits who aren't favourites (♥). Unique characters never.
const bulkReleasable = (ck, stars) => SAVE.camps[ck].roster.filter(r => !r.dead && !r.lord && !r.fav && r.key === 'recruit' && (r.stars || 1) === stars);
function bulkReleaseHTML(ck){
  const cur = FACTIONS[CAMPAIGNS[ck].faction].currency;
  return `<div class="sec">Release in bulk</div><div class="hint">Releases every soldier of that rarity who isn't a favourite (♥). Their weapons stay in the Armoury.</div>
    <div class="bulkrel">${[1, 2].map(n => { const list = bulkReleasable(ck, n);
      return `<button class="btn" data-bulk-release="${n}" type="button" ${list.length ? '' : 'disabled'}>Release all ${'★'.repeat(n)} · ${list.length} unit${list.length === 1 ? '' : 's'}<small>${list.length ? `+${list.length*GACHA.release[n]} ${cur}` : 'none to release'}</small></button>`; }).join('')}</div>`;
}
function bulkRelease(btn, stars){
  const ck = SAVE.current, list = bulkReleasable(ck, stars);
  if (!list.length || !armed(btn, `Tap again to release ${list.length}`)) return;
  let back = 0; for (const r of list) back += releaseUnit(ck, r.uid);
  toast(`${list.length} ${'★'.repeat(stars)} soldier${list.length === 1 ? '' : 's'} released. +${back} ${FACTIONS[CAMPAIGNS[ck].faction].currency}.`); rerenderKeepScroll();
}
function renderArmy(){
  const ck = SAVE.current, camp = campOf(), st = stOf(), F = FACTIONS[camp.faction];
  let body = '';
  if (armyTab === 'roster'){
    const alive = st.roster.filter(r => !r.dead), fallen = st.roster.filter(r => r.dead);
    body = `<div class="hint">Units grow stronger by fighting. Unique (★★★) units also grow through their supports at the Camp. Units who fall in a battle you win are unstitched, but can be stitched back up below. Recruits can be released for a little ${F.currency}.</div>${sortBarHTML()}<div class="ulist">${sortRecs(alive).map(r =>
      recCard(r, isGachaUnit(r) ? `<div class="uacts"><button class="btn" data-release="${r.uid}" type="button">Release · +${GACHA.release[r.stars || 1]} ${F.currency}</button></div>` : '')).join('')}</div>${fallen.length ? `<div class="sec">Unstitched</div><div class="ulist">${fallen.map(r => recCard(r, r.departed
      ? `<div class="uacts"><button class="btn" type="button" disabled>${departureLabel(r)}</button></div>`
      : `<div class="uacts"><button class="btn primary" data-stitch="${r.uid}" type="button" ${st.res < stitchCost(r) ? 'disabled' : ''}>Stitch up · ${stitchCost(r)} ${F.currency}</button></div>`)).join('')}</div>` : ''}
      ${bulkReleaseHTML(ck)}`;
  } else if (armyTab === 'arms') body = armouryTabHTML(ck);
  else body = recruitTabHTML(ck);
  $('#army').innerHTML = `<div class="sin f-${camp.faction}">
    <div class="sbar"><button class="btn" data-go="${armyReturn}" type="button">‹ Back</button><h1>Army</h1><div class="res">${st.res}<small>${F.currency}</small></div></div>
    <div class="tabs"><button class="btn${armyTab === 'roster' ? ' on' : ''}" data-tab="roster" type="button">Roster</button><button class="btn${armyTab === 'arms' ? ' on' : ''}" data-tab="arms" type="button">Armoury</button><button class="btn${armyTab === 'recruit' ? ' on' : ''}" data-tab="recruit" type="button">Recruit</button></div>
    ${body}</div>`;
  showScreen('army');
}
// Fallen units can be stitched back up for money: more for higher levels. Story departures can't.
const STITCH = {base: 150, perLevel: 30};
const stitchCost = rec => STITCH.base + STITCH.perLevel*rec.lv;
function stitchUp(uid){
  const st = stOf(), rec = st.roster.find(r => r.uid === uid);
  if (!rec || !rec.dead || rec.departed) return;
  const cost = stitchCost(rec); if (st.res < cost) return;
  st.res -= cost; rec.dead = false; saveGame(); Sfx.play('heal');
  toast(`${rec.name} is stitched back up and ready to fight.`); rerenderKeepScroll();
}
function release(btn){
  const ck = SAVE.current, rec = stOf().roster.find(r => r.uid === btn.dataset.release);
  if (!rec || !armed(btn, 'Tap again to release')) return;
  const back = releaseUnit(ck, rec.uid);
  toast(`${rec.name} leaves the army. +${back} ${FACTIONS[CAMPAIGNS[ck].faction].currency}.`); renderArmy();
}

// ---------- Battle preparation ----------
// A stage can name its own leader (lead: key) and keep characters out (ban: [keys]).
const isLead = (ch, r) => ch.lead ? r.key === ch.lead : r.lord;
// flashback: set years ago, so only the leader and ordinary soldiers (no other named characters) can deploy
const canDeploy = (ch, r) => !(ch.ban || []).includes(r.key) && (!ch.flashback || r.key === 'recruit' || r.key === ch.lead);
let prep = null;   // {ck, i, picks:Set(uid)}
function openPrep(ck, i){
  const ch = stageAt(ck, i), alive = living(ck).filter(r => canDeploy(ch, r));
  if (ch.event && (eventPlayedToday(ch) || !eventActive(ch.event))){ toast(eventActive(ch.event) ? 'Already played today. Come back tomorrow!' : 'This seasonal story isn\'t on right now.'); renderHub(); return; }
  const max = Math.min(ch.maxDeploy, ch.deploy.length);
  // mustDeploy: characters this stage needs (always picked, after the leader)
  const must = r => (ch.mustDeploy || []).includes(r.key);
  const order = [...alive.filter(r => isLead(ch, r)), ...alive.filter(r => !isLead(ch, r) && must(r)), ...alive.filter(r => !isLead(ch, r) && !must(r))];
  if (!prep || prep.ck !== ck || prep.i !== i) prep = {ck, i, picks: new Set(order.slice(0, max).map(r => r.uid))};
  for (const uid of [...prep.picks]) if (!alive.some(r => r.uid === uid)) prep.picks.delete(uid);
  for (const r of alive) if (must(r) && !prep.picks.has(r.uid)){
    if (prep.picks.size >= max){ const drop = [...prep.picks].reverse().find(uid => { const x = alive.find(a => a.uid === uid); return x && !isLead(ch, x) && !must(x); }); if (drop) prep.picks.delete(drop); }
    prep.picks.add(r.uid);
  }
  renderPrep();
}
function renderPrep(){
  const {ck, i} = prep, camp = CAMPAIGNS[ck], ch = stageAt(ck, i), alive = living(ck).filter(r => canDeploy(ch, r));
  const max = Math.min(ch.maxDeploy, ch.deploy.length), order = [...alive.filter(r => isLead(ch, r)), ...alive.filter(r => !isLead(ch, r))];
  const replaying = SAVE.camps[ck].cleared.includes(ch.id) && !ch.event;
  $('#prep').innerHTML = `<div class="sin f-${camp.faction}">
    <div class="sbar"><button class="btn" data-go="hub" type="button">‹ Back</button><h1>Prepare</h1><div class="res">${stOf().res}<small>${FACTIONS[camp.faction].currency}</small></div></div>
    <div class="prepenergy">${energyHTML()}<small>Losing or retreating costs 1 energy. Winning costs none.</small></div>
    <div class="brief"><div class="kick">${camp.name} · ${stageLabel(ch)}${ch.convergence ? ' · Convergence' : ''}</div><h2>${ch.title}</h2><p>${ch.brief}</p>
      <div class="chips">${recChip(ck, ch, prep.picks.size ? [...prep.picks].map(u => alive.find(r => r.uid === u)?.lv || 0).reduce((a, b) => a + b, 0)/prep.picks.size : 0)}<span class="chip">${objectiveLabel(ch.objective)}</span><span class="chip">vs ${FACTIONS[ch.enemyFaction].name}</span></div>
      ${ch.side ? sideRewardHTML(ck, ch) : ''}
      ${ch.star ? `<div class="starrow${hasStar(ch.id) ? ' got' : ''}">${hasStar(ch.id) ? '★ Bonus earned' : '☆ Bonus'}: ${starText(ch, ck)}${hasStar(ch.id) ? '' : ` · <b>+${GACHA.starTokens} ${GACHA_ARMY[ck].currency}</b>`}${ch.star.type === 'fewer' && prep.picks.size > ch.star.n ? ` <span class="warn">(you're deploying ${prep.picks.size})</span>` : ''}</div>` : ''}
      ${ch.prepNote ? `<p class="meta prepnote">${ch.prepNote}</p>` : ''}
      ${replaying ? '<p class="meta">Replay: the story scenes are skipped and nobody new joins. Your army keeps any experience earned, and anyone unstitched is still lost.</p>' : ''}</div>
    <div class="sec">Deploy ${prep.picks.size} of ${max}</div>
    ${sortBarHTML()}
    <div class="ulist">${sortRecs(order).map(r => recCard(r, '', 'pick' + (prep.picks.has(r.uid) ? ' on' : ''))).join('')}</div>
    <div class="sticky"><button class="btn" data-go="army" data-from="prep" type="button">Army</button><button class="btn primary" data-begin type="button">${beginLabel()}</button></div>
  </div>`;
  showScreen('prep');
}
function togglePick(uid){
  const ch = stageAt(prep.ck, prep.i), rec = SAVE.camps[prep.ck].roster.find(r => r.uid === uid), max = Math.min(ch.maxDeploy, ch.deploy.length);
  if (!rec) return;
  if (isLead(ch, rec)){ toast(`${rec.name} leads ${ch.lead ? 'this battle' : 'every battle'}.`); return; }
  if ((ch.mustDeploy || []).includes(rec.key)){ toast(`${rec.name} must come on this one.`); return; }
  if (prep.picks.has(uid)) prep.picks.delete(uid);
  else if (prep.picks.size >= max){ toast(`Only ${max} can deploy here.`); return; }
  else prep.picks.add(uid);
  rerenderKeepScroll();
}

// ---------- Playing a chapter ----------
async function playChapter(){
  const {ck, i} = prep, camp = CAMPAIGNS[ck], ch = stageAt(ck, i), st = SAVE.camps[ck];
  const recs = [...st.roster.filter(r => isLead(ch, r)), ...st.roster.filter(r => !isLead(ch, r) && canDeploy(ch, r) && prep.picks.has(r.uid))].filter(r => !r.dead);
  // replays skip the story and its one-time rewards; a seasonal story is fresh each day (full pay) but tells its story once
  const seen = st.cleared.includes(ch.id), replay = seen && !ch.event;
  if (!seen){
    applyOutfits(ck, ch.chapter.outfits);
    await talk(ch.pre);
    if (ch.rename){ applyRename(ck, ch.rename); saveGame(); }
  }
  const res = await runBattle(ck, ch, recs, {replay: seen});
  const kills = B.kills, lightFingers = B.bonusRes || 0;   // Brigand's Light Fingers
  // seasonal event: gifts by how well you did; once a (game) day
  const gifts = res.win && ch.event ? res.gifts : 0;
  if (res.win && ch.event){ gachaState(ck).gifts = (gachaState(ck).gifts || 0) + gifts; (SAVE.eventPlays ||= {})[ch.id] = todayKey();
    (SAVE.eventBest ||= {})[ch.id] = Math.max(SAVE.eventBest[ch.id] || 0, gifts); }
  if (!res.win){
    B = null;
    const energyLeft = spendEnergy();   // losing or retreating costs 1 energy (winning costs none)
    renderResult({win: false, retreated: res.retreated, reason: res.reason, ck, i, energyLeft});
    return;
  }
  // Commit the battle to the permanent army.
  for (const u of res.survivors){
    const r = u.rec;
    r.lv = u.lv; r.exp = u.exp;
    r.stats = {mhp: u.mhp, atk: u.atk - u.tb, def: u.def, spd: u.spd, skl: u.skl, mov: u.mov};
    const m = attireOf(r)?.mods; if (m) for (const k in m) r.stats[k] -= m[k];   // the attire's changes aren't kept
  }
  // their weapon stays in the Armoury. Training (spar) knocks nobody out for good.
  if (!ch.spar) for (const u of res.lost){ u.rec.dead = true; u.rec.arm = null; }
  const departed = [], joined = [];
  // bonus star: earned once, for recruiting currency
  const starNew = res.star === 'ok' && !hasStar(ch.id), starTokens = starNew ? GACHA.starTokens : 0;
  if (starNew) SAVE.stars[ch.id] = true;
  const spoils = (replay ? Math.round(ch.reward.res/2) : ch.reward.res) + kills*15 + lightFingers, tokens = (replay ? 0 : ch.reward.tokens ?? GACHA.stageTokens) + starTokens;
  st.res += spoils; gachaState(ck).tokens += tokens;
  if (!seen){
    for (const key of ch.departs || []) for (const r of st.roster) if (r.key === key && !r.departed){ r.dead = true; r.departed = true; r.fallsIn = ch.fallsIn?.[key]; departed.push(r.name || CHARACTERS[key].name); }
    for (const f of ch.reward.flags || []) SAVE.flags[f] = true;
    // anyone who joined mid-battle keeps the experience they earned there
    for (const u of res.survivors) if (!st.roster.includes(u.rec)){ st.roster.push(u.rec); joined.push(u.rec.name); }
    for (const key of ch.reward.joins || []) if (!st.roster.some(r => r.key === key)){ st.roster.push(recordFor(key)); joined.push(CHARACTERS[key].name); }
    st.cleared.push(ch.id);
  }
  const armed = seen ? [] : grantStoryWeapons(ck, ch.reward.weapons);
  saveGame();
  if (!seen) await talk(ch.post);
  B = null;
  renderResult({win: true, ck, i, replay, turn: res.turn, kills, spoils, tokens, starTokens, star: res.star, joined, gifts, armed, lost: res.lost.map(u => u.name), departed});
}

function renderResult(r){
  const camp = CAMPAIGNS[r.ck], ch = stageAt(r.ck, r.i), F = FACTIONS[camp.faction];
  let html;
  if (r.win){
    const other = otherCamp(r.ck), opened = CAMPAIGNS[other].stages
      .map((c, j) => ({c, j})).filter(({c, j}) => (c.requires || []).includes(ch.id) && stageState(other, j).s === 'next');
    html = `<div class="brief"><div class="kick">${r.replay ? 'Replay victory' : 'Victory'} · ${camp.name} · ${stageLabel(ch)}</div><h2>${ch.title}</h2><p>Won on turn ${ROMAN(r.turn)}.</p></div>
      <div class="rlist">
        <div><span>Spoils</span><b>+${r.spoils} ${F.currency}</b></div>
        ${ch.event ? `<div class="rgift"><span>${EVENTS[ch.event].icon} ${ch.escort ? 'Couriers kept safe' : 'Couriers caught'}: ${r.gifts} of ${eventMaxGifts(ch)}${(SAVE.eventBest||{})[ch.id] != null ? ` · best ${SAVE.eventBest[ch.id]}` : ''}</span><b>+${r.gifts} ${giftName(r.ck, r.gifts)}</b></div>
        <div><span>Come back tomorrow to play again</span><b>Once a day</b></div>`
          : `<div><span>For recruiting</span><b>+${r.tokens} ${GACHA_ARMY[r.ck].currency}</b></div>`}
        <div><span>Foes unstitched</span><b>${r.kills}</b></div>
        ${r.joined.length ? `<div><span>Joined the army</span><b>${r.joined.join(', ')}</b></div>` : ''}
        ${r.armed?.length ? `<div><span>New weapons</span><b>${r.armed.join(', ')}</b></div>` : ''}
        ${ch.star ? `<div class="rstar ${r.star === 'ok' ? 'got' : ''}"><span>${r.star === 'ok' ? '★' : '☆'} Bonus: ${starText(ch, r.ck)}</span><b>${r.starTokens ? `Earned! +${r.starTokens} ${GACHA_ARMY[r.ck].currency}` : r.star === 'ok' ? 'Done (already earned)' : hasStar(ch.id) ? 'Missed (already earned)' : 'Missed: replay to try again'}</b></div>` : ''}
        ${r.lost.length ? `<div><span>${ch.spar ? 'Knocked out in training (no harm done)' : 'Unstitched (stitch them up on the Army screen)'}</span><b>${r.lost.join(', ')}</b></div>` : ''}
        ${r.departed?.length ? `<div><span>Stayed behind</span><b>${r.departed.join(', ')}</b></div>` : ''}
      </div>
      ${!r.replay && SIDE_OPENS[r.ck] === ch.id && CAMPAIGNS[r.ck].sides.length ? `<div class="gatebox"><span><b>The Camp and Side Stories are open.</b> Each unique member of the army has supports to unlock, and side stories that open with them.</span><button class="btn" data-sidego="${r.ck}" type="button">Side Stories</button></div>` : ''}
      ${opened.map(({c, j}) => `<div class="gatebox"><span>The other story can now go on: <b>${chapterRef(c.id)}</b>.</span><button class="btn" data-camp="${other}" type="button">Switch to the ${FACTIONS[CAMPAIGNS[other].faction].name}</button></div>`).join('')}
      <div class="sticky"><button class="btn primary" data-go="hub" type="button">Continue</button></div>`;
  } else {
    html = `<div class="brief"><div class="kick">${r.retreated ? 'Retreat' : 'Defeat'} · ${camp.name}</div><h2>${ch.title}</h2>
      <p>${r.retreated ? 'You pulled back from the field.' : r.reason === 'limit' ? (ch.limitFail || 'You ran out of time.') : r.reason === 'escaped' ? (ch.escapeFail || 'They got away.') : r.reason?.startsWith('vip:') ? `${r.reason.slice(4)} has fallen.` : `${speakerName(ch.lead || camp.lord)} has fallen.`} Nothing was lost: your army is exactly as it was before the battle.</p></div>
      <div class="renergy"><span><b>−1 energy.</b> ${r.energyLeft ? `${r.energyLeft} left.` : 'You\'re out: battles wait until some comes back.'} One comes back every hour.</span>${energyHTML('big')}</div>
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
  if (d.camp){ if (d.camp !== SAVE.current) hubTab = 'main'; SAVE.current = d.camp; saveGame(); renderHub(); }
  else if (d.go === 'hub') renderHub();
  else if (d.go === 'army'){ armyReturn = d.from || 'hub'; renderArmy(); }
  else if (d.go === 'prep') renderPrep();
  else if (d.go === 'title'){ saveGame(); renderSlots(); $('#title').hidden = false; Music.want('title'); }
  else if (d.tab){ armyTab = d.tab; renderArmy(); if (d.tab === 'recruit') recruitTutorial(SAVE.current); }
  else if (d.armPick) openWeaponPicker(d.armPick);
  else if (d.attirePick) openAttirePicker(d.attirePick);
  else if (d.armRelease){ if (!armed(t, 'Tap again to release')) return; const back = releaseSpare(SAVE.current, d.armRelease); saveGame(); toast(`Released. +${back} ${FACTIONS[campOf().faction].currency}.`); renderArmy(); }
  else if ('campOpen' in d) openCamp();
  else if (d.support) unlockSupport(d.support);
  else if (d.trainUnit) trainPartner(d.trainUnit);
  else if (d.supportView) viewSupport(d.supportView, +d.rank);
  else if (d.stitch) stitchUp(d.stitch);
  else if (d.about) showIntro(d.about);
  else if (d.release) release(t);
  else if (d.bulkRelease) bulkRelease(t, +d.bulkRelease);
  else if (d.banner){ gachaSel[SAVE.current] = d.banner; renderArmy(); }
  else if (d.pull) runPull(SAVE.current, +d.pull);
  else if ('trade' in d){ if (tradeForToken(SAVE.current)) renderArmy(); }
  else if (d.play !== undefined) openPrep(SAVE.current, d.play.startsWith('s') ? d.play : +d.play);
  else if (d.hubtab){ hubTab = d.hubtab; renderHub(); }
  else if (d.sidego){ SAVE.current = d.sidego; hubTab = 'side'; saveGame(); renderHub(); }
  else if ('begin' in d){ if (energyGate()) playChapter(); }
  else if ('retry' in d) openPrep(prep.ck, prep.i);
  else if (d.fav){ const rec = stOf().roster.find(r => r.uid === d.fav); if (rec){ rec.fav = !rec.fav; saveGame(); rerenderKeepScroll(); } }
  else if (d.sort){ rosterSort = d.sort; try { localStorage.setItem('raepublic-sort', d.sort); } catch (e){} rerenderKeepScroll(); }
  else if (t.classList.contains('pick')) togglePick(d.uid);
});

// ---------- Title ----------
// How the two-campaign structure works, shown once when a new game starts.
// Save slots: each shows how far both stories have got. The most recently played slot carries #contBtn, the first
// empty one #newBtn.
function slotSummary(s){
  const ch = ck => { const nx = CAMPAIGNS[ck].stages.find(sg => !sg.stub && !s.camps[ck]?.cleared?.includes(sg.id));
    return nx ? nx.chapter.title : 'All caught up'; };
  const d = s.played ? new Date(s.played) : null;
  return `<span class="f-rae">${FACTIONS.rae.name} · ${ch('rae')}</span><span class="f-frog">${FACTIONS.frog.name} · ${ch('frog')}</span>`
    + (d ? `<small>Last played ${d.getDate()} ${d.toLocaleString('en-GB', {month: 'short'})} ${d.getFullYear()}</small>` : '');
}
// A slot card's progress for one story: how many of its stages are cleared, and the chapter it's on.
function slotStory(s, ck){
  const st = CAMPAIGNS[ck].stages.filter(sg => !sg.stub), done = st.filter(sg => s.camps[ck]?.cleared?.includes(sg.id)).length;
  const nx = st.find(sg => !s.camps[ck]?.cleared?.includes(sg.id));
  return `<div class="tslrow f-${CAMPAIGNS[ck].faction}"><i>${FACTIONS[CAMPAIGNS[ck].faction].name}</i>
    <span class="tslbar"><em style="width:${Math.round(done/st.length*100)}%"></em></span><small>${nx ? nx.chapter.title.replace('Chapter ', 'Ch. ') : 'Done'}</small></div>`;
}
function renderSlots(){
  const saves = [1, 2, 3].map(n => migrateSave(Store.load(n)));
  const last = saves[Store.slot - 1] ? Store.slot : (saves.findIndex(Boolean) + 1 || 0), firstEmpty = saves.findIndex(s => !s) + 1;
  $('#tslots').innerHTML = saves.map((s, i) => { const n = i + 1, d = s?.played ? new Date(s.played) : null;
    return s ? `<div class="tslot${n === last ? ' last' : ''}"><button class="tscard" data-slot-play="${n}"${n === last ? ' id="contBtn"' : ''} type="button">
        <div class="tslhead"><b>Slot ${n}</b>${n === last ? '<span class="tslgo">Continue ›</span>' : d ? `<small>${d.getDate()} ${d.toLocaleString('en-GB', {month: 'short'})}</small>` : ''}</div>
        ${slotStory(s, 'rae')}${slotStory(s, 'frog')}</button>
        <button class="tslotx" data-slot-erase="${n}" type="button" aria-label="Erase slot ${n}">✕</button></div>`
      : `<div class="tslot"><button class="tscard empty" data-slot-new="${n}"${n === firstEmpty ? ' id="newBtn"' : ''} type="button"><b>Slot ${n}</b><span>＋ New Campaign</span></button></div>`; }).join('');
  for (const id of ['backupBtn', 'restoreBtn']) { const b = $('#' + id); if (b) b.textContent = `${id === 'backupBtn' ? 'Back up' : 'Restore'} slot ${Store.slot}`; }
}
function playSlot(n){
  Store.use(n); SAVE = migrateSave(Store.load(n)); if (!SAVE) return;
  prep = null; $('#title').hidden = true; renderHub(); Music.want(campTrack());
  // festive soldiers are only recoloured when needed: a slot that has some (outside December) needs them now
  if (festiveNeeded()) buildFestiveTroops().then(() => { tokenCache.clear(); if (!$('#hub').hidden) renderHub(); });
}
$('#tslots').addEventListener('click', e => {
  const t = e.target.closest('[data-slot-play], [data-slot-new], [data-slot-erase]'); if (!t) return;
  const d = t.dataset;
  if (d.slotPlay) playSlot(+d.slotPlay);
  else if (d.slotNew){ Store.use(+d.slotNew); newSave(); saveGame(); playSlot(+d.slotNew); }
  else if (d.slotErase) confirmErase(+d.slotErase);
});
// Erasing a slot is deliberate: a card showing what will be lost, and a button you have to hold down for two seconds.
const ERASE_HOLD = 2000;
function confirmErase(n){
  const s = migrateSave(Store.load(n)); if (!s) return;
  const ov = document.createElement('div'); ov.className = 'ov erasesheet'; ov.id = 'erasesheet';
  ov.innerHTML = `<div class="card"><h1>Erase slot ${n}?</h1><div class="erasewhat">${slotSummary(s)}</div>
    <p class="meta">Both stories in this slot, the whole army, and everything recruited, gone for good. This can't be undone.</p>
    <button class="btn danger erasehold" type="button"><i></i><span>Hold to erase</span></button>
    <button class="btn" data-erase-cancel type="button">Cancel</button></div>`;
  document.body.appendChild(ov);
  const btn = ov.querySelector('.erasehold'), bar = btn.querySelector('i'), lbl = btn.querySelector('span');
  let timer = null, anim = null;
  const close = () => { clearTimeout(timer); ov.remove(); };
  const start = e => { e.preventDefault(); if (timer) return;
    lbl.textContent = 'Keep holding…'; anim = bar.animate([{width: '0%'}, {width: '100%'}], {duration: ERASE_HOLD, fill: 'forwards'});
    timer = setTimeout(() => { Store.clear(n); if (Store.slot === n) SAVE = null; close(); toast(`Slot ${n} erased.`); renderSlots(); }, ERASE_HOLD); };
  const stop = () => { if (!timer) return; clearTimeout(timer); timer = null; anim?.cancel(); lbl.textContent = 'Hold to erase'; };
  btn.addEventListener('pointerdown', start); for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) btn.addEventListener(ev, stop);
  btn.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) start(e); });
  btn.addEventListener('keyup', e => { if (e.key === 'Enter' || e.key === ' ') stop(); });
  btn.addEventListener('contextmenu', e => e.preventDefault());   // a long press shouldn't open the phone's menu
  ov.querySelector('[data-erase-cancel]').addEventListener('click', close);
  ov.addEventListener('click', e => { if (e.target === ov) close(); });
}
