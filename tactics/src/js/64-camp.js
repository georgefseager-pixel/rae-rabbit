// ================= Camp: supports between the leader and unique units =================
const campOpen = ck => !!SAVE?.debugUnlock || isCleared(SUPPORT.opensAfter[ck]);
const campSeen = ck => !!SAVE.flags['tut-camp-' + ck];
const supportState = ck => ((SAVE.supports ||= {})[ck] ||= {});
const supportRank = (ck, key) => supportState(ck)[key] || 0;   // ranks unlocked: 0 (none) to 3 (A), 4 (S)
// Characters with side stories (28-data-sides.js) go on to S once all three are cleared; everyone else stops at A.
const sideSetOf = (ck, key) => SIDE_SETS[key]?.camp === ck ? SIDE_SETS[key] : null;
const sidesDone = (ck, key) => (sideSetOf(ck, key)?.quests || []).filter(q => SAVE.camps[ck].cleared.includes(q.id)).length;
const maxRank = (ck, key) => sideSetOf(ck, key) ? 4 : 3;
// Unique units who can support the leader: alive, ★★★, not the leader.
const supportPartners = ck => living(ck).filter(r => !r.lord && r.stars === 3 && CHARACTERS[r.key]);
function supportInfo(ck, key){
  const lord = CAMPAIGNS[ck].lord;
  return SUPPORTS[lord]?.[key] || {kind: 'friend', about: 'Their conversations are still to be written.'};
}
function supportScene(ck, rec, rank){
  const lord = CAMPAIGNS[ck].lord, R = SUPPORT.ranks[rank], info = supportInfo(ck, rec.key);
  const head = {scene: SUPPORT.scene[ck], place: `The Camp · Support ${R}`};
  if (info[R]) return [head, ...info[R]];
  return [head,   // placeholder until the scene is written
    {who: 'narr', text: `Support ${R} · ${SUPPORT.kinds[info.kind]}. ${info.about}`},
    {who: lord, text: `(Placeholder) ${speakerName(lord)} sits down with ${rec.name}.`},
    {who: rec.key, text: `(Placeholder) The rank ${R} conversation is still to be written.`},
  ];
}

const STAT_SHORT = {mhp: 'HP', atk: 'Atk', def: 'Def', spd: 'Spd', skl: 'Skl'};
const boostText = b => Object.entries(b).map(([k, v]) => `+${v} ${STAT_SHORT[k]}`).join(' ');
const trainCost = rec => SUPPORT.train.cost + SUPPORT.train.step*(rec.trained || 0);
// show the gains on the level-up card, with its own heading
function showGains(rec, gains, title, sub){
  const s = rec.stats;
  return showLevelUp({...rec, ...s, atk: s.atk + weaponOf(rec).mt, w: CLASSES[clsOf(rec)].w}, gains, title, sub);
}
function applyGains(rec, gains){ for (const [k, v] of Object.entries(gains)) rec.stats[k] = (rec.stats[k] || 0) + v; }
function renderCamp(){
  const ck = SAVE.current, camp = campOf(), st = stOf(), F = FACTIONS[camp.faction], lord = camp.lord;
  const partners = supportPartners(ck);
  const card = r => {
    const rank = supportRank(ck, r.key), info = supportInfo(ck, r.key), next = rank < maxRank(ck, r.key) ? SUPPORT.ranks[rank] : null, cost = next && SUPPORT.cost[next];
    const tc = trainCost(r), maxed = (r.trained || 0) >= SUPPORT.train.max, done = sidesDone(ck, r.key);
    const trainBtn = maxed ? '<button class="btn" type="button" disabled>Fully trained</button>'
        : `<button class="btn${next ? '' : ' primary'}" data-train-unit="${r.key}" type="button" ${st.res < tc ? 'disabled' : ''}>Train · ${tc} ${F.currency}<small>+1 to two stats${r.trained ? ` · trained ×${r.trained}` : ''}</small></button>`;
    const pips = SUPPORT.ranks.slice(0, maxRank(ck, r.key)).map((R, i) => i < rank
      ? `<button class="spip on" data-support-view="${r.key}" data-rank="${i}" type="button" aria-label="Watch support ${R} again">${R}</button>`
      : `<span class="spip">${R}</span>`).join('');
    return `<div class="scard">
      <div class="por f-${r.faction}">${portraitInner(r, 'panel')}</div>
      <div class="sinfo"><div class="uhead"><span class="nm">${r.name}</span><span class="skind ${info.kind}">${SUPPORT.kinds[info.kind]}</span></div>
        <p class="meta">${info.about}</p>
        <div class="spips" aria-label="Support rank">${pips}</div></div>
      ${statsGrid(r)}
      ${next === 'S' ? `<button class="btn primary" data-support="${r.key}" type="button" ${st.res < cost || done < 3 ? 'disabled' : ''}>Support S · ${cost} ${F.currency}<small>${done < 3 ? `Clear all three of ${sideSetOf(ck, r.key).title} (${done}/3)` : boostText(SUPPORT.boost.S)}</small></button>${trainBtn}`
        : next ? `<button class="btn primary" data-support="${r.key}" type="button" ${st.res < cost ? 'disabled' : ''}>Support ${next} · ${cost} ${F.currency}<small>${boostText(SUPPORT.boost[next])}</small></button>`
        : trainBtn}
    </div>`;
  };
  $('#camp').innerHTML = `<div class="sin f-${camp.faction}">
    <div class="sbar"><button class="btn" data-go="hub" type="button">‹ Back</button><h1>Camp</h1><div class="res">${st.res}<small>${F.currency}</small></div></div>
    <div class="hint">Spend time with the unique members of the army. Each conversation unlocks a support rank with ${speakerName(lord)}, from C to A, and makes them permanently stronger. Those with side stories go on to a final rank, S, once all three are cleared. After A, they can keep training. Tap a rank you've reached to watch it again.</div>
    ${partners.length ? `<div class="ulist">${partners.map(card).join('')}</div>`
      : `<div class="gatebox"><span>No one to sit with yet. Unique (★★★) members of the army appear here: some join in the story, others through Recruiting.</span></div>`}
  </div>`;
  showScreen('camp');
}
async function unlockSupport(key){
  const ck = SAVE.current, st = stOf(), rec = st.roster.find(r => r.key === key && !r.dead);
  const rank = supportRank(ck, key), next = SUPPORT.ranks[rank];
  if (!rec || !next || rank >= maxRank(ck, key)) return;
  if (next === 'S' && sidesDone(ck, key) < 3) return;
  const cost = SUPPORT.cost[next];
  if (st.res < cost){ toast(`Not enough ${FACTIONS[campOf().faction].currency}.`); return; }
  const gains = SUPPORT.boost[next];
  st.res -= cost; supportState(ck)[key] = rank + 1; applyGains(rec, gains); saveGame(); Sfx.play('coin');
  await talk(supportScene(ck, rec, rank));
  Music.want(campTrack()); renderCamp();
  await showGains(rec, gains, `SUPPORT ${next}`, `${rec.name} & ${speakerName(campOf().lord)}`);
  // a support rank opens that character's next side story (once Chapter Two is over)
  const q = sideSetOf(ck, key)?.quests[rank];
  if (q && next !== 'S') toast(`A side story has opened: ${q.title}.`);
}
// After rank A: +1 to two different stats (+2 HP), chosen by the unit's growth rates. No conversation.
async function trainPartner(key){
  const ck = SAVE.current, st = stOf(), rec = st.roster.find(r => r.key === key && !r.dead);
  if (!rec || supportRank(ck, key) < 3 || (rec.trained || 0) >= SUPPORT.train.max) return;
  const cost = trainCost(rec); if (st.res < cost) return;
  const g = growthOf(rec), pool = Object.keys(STAT_SHORT), gains = {};
  for (let n = 0; n < 2; n++){
    const left = pool.filter(k => !gains[k]), total = left.reduce((a, k) => a + (g[k] || 30), 0);
    let roll = Math.random()*total, pick = left[0];
    for (const k of left){ roll -= g[k] || 30; if (roll <= 0){ pick = k; break; } }
    gains[pick] = pick === 'mhp' ? 2 : 1;
  }
  st.res -= cost; rec.trained = (rec.trained || 0) + 1; applyGains(rec, gains); saveGame(); Sfx.play('coin');
  renderCamp();
  await showGains(rec, gains, 'TRAINED', `${rec.name} · training ${rec.trained} of ${SUPPORT.train.max}`);
}
async function viewSupport(key, rank){
  const ck = SAVE.current, rec = stOf().roster.find(r => r.key === key);
  if (!rec || rank >= supportRank(ck, key)) return;
  await talk(supportScene(ck, rec, rank));
  Music.want(campTrack()); renderCamp();
}
function openCamp(){
  const ck = SAVE.current;
  if (!campOpen(ck)){ toast(`The Camp opens after the first stage of Chapter Two.`); return; }
  renderCamp();
}

// Played over the campaign screen as soon as the Camp opens (see unlockTutorials).
function campTutorial(ck){
  if (!campOpen(ck) || campSeen(ck)) return;
  SAVE.flags['tut-camp-' + ck] = true; SAVE.flags['tut-sides-' + ck] = true; saveGame();   // one tutorial for both
  const lord = CAMPAIGNS[ck].lord, F = FACTIONS[CAMPAIGNS[ck].faction];
  return talk([
    {who: lord, text: ck === 'rae' ? 'A night without guards or bells. We should use it to get to know who\'s standing with us.'
                                  : 'Biggle says a prince should know his soldiers. On that, at least, he may be right.'},
    {who: 'narr', text: `The Camp is open. Here, ${speakerName(lord)} can spend time with the unique (★★★) members of the army.`},
    {who: 'narr', text: 'Each of them has support conversations, ranked C, B and A (and, for some, a final rank: S). Some become friends. Others have something to teach. Every rank makes them permanently stronger.'},
    {who: 'narr', text: `Unlocking a rank costs ${F.currency}: ${SUPPORT.cost.C} for C, ${SUPPORT.cost.B} for B, ${SUPPORT.cost.A} for A. Anything you've unlocked can be watched again at any time.`},
    {who: 'narr', text: 'To visit, tap Camp.'},
    ...sideTutorialLines(ck),
  ]);
}
// Side Stories open with the Camp; the Camp's tutorial explains both.
const sidesOpen = ck => campOpen(ck) && Object.values(SIDE_SETS).some(s => s.camp === ck);
const sidesSeen = ck => !!SAVE.flags['tut-sides-' + ck];
const sideTutorialLines = ck => Object.values(SIDE_SETS).some(s => s.camp === ck) ? [
  {who: 'narr', text: 'Supports also open Side Stories: three optional battles for each unique member of the army, on the Side Stories tab.'},
  {who: 'narr', text: 'Their first side story opens at Support C, the second at B, the third at A. Clear all three for a final conversation: Support S.'},
  {who: 'narr', text: 'Side stories are extras. Their rewards are nice to have, and the main story never needs them.'},
] : [];
// Saves that saw the Camp's tutorial before Side Stories existed get just the side story part.
function sideTutorial(ck){
  if (!sidesOpen(ck) || sidesSeen(ck)) return;
  SAVE.flags['tut-sides-' + ck] = true; saveGame();
  return talk(sideTutorialLines(ck));
}
// When a feature opens, its tutorial plays straight away on the campaign screen, one after another.
let tutorialsRunning = false;
async function unlockTutorials(ck){
  if (tutorialsRunning || !$('#title').hidden) return;
  if (!(recruitOpen(ck) && !recruitSeen(ck)) && !(campOpen(ck) && !campSeen(ck)) && !(sidesOpen(ck) && !sidesSeen(ck))) return;
  tutorialsRunning = true;
  await wait(50); $('#hub').scrollTo({top: 0});   // the buttons the tutorial points at are at the top
  try {
    if (recruitOpen(ck) && !recruitSeen(ck)) await recruitTutorial(ck);
    if (campOpen(ck) && !campSeen(ck)) await campTutorial(ck);
    if (sidesOpen(ck) && !sidesSeen(ck)) await sideTutorial(ck);
  } finally { tutorialsRunning = false; }
}
