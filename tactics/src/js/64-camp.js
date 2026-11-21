// ================= Camp: supports between the leader and unique units =================
const campOpen = ck => !!SAVE?.debugUnlock || isCleared(SUPPORT.opensAfter[ck]);
const campSeen = ck => !!SAVE.flags['tut-camp-' + ck];
const supportState = ck => ((SAVE.supports ||= {})[ck] ||= {});
const supportRank = (ck, key) => supportState(ck)[key] || 0;   // ranks unlocked: 0 (none) to 3 (A)
// Unique units who can support the leader: alive, ★★★, not the leader.
const supportPartners = ck => living(ck).filter(r => !r.lord && r.stars === 3 && CHARACTERS[r.key]);
function supportInfo(ck, key){
  const lord = CAMPAIGNS[ck].lord;
  return SUPPORTS[lord]?.[key] || {kind: 'friend', about: 'Their conversations are still to be written.'};
}
function supportScene(ck, rec, rank){
  const lord = CAMPAIGNS[ck].lord, R = SUPPORT.ranks[rank], info = supportInfo(ck, rec.key);
  const head = {scene: SUPPORT.scene[ck], place: `Camp · Support ${R}`};
  if (info[R]) return [head, ...info[R]];
  return [head,   // placeholder until the scene is written
    {who: 'narr', text: `Support ${R} · ${SUPPORT.kinds[info.kind]}. ${info.about}`},
    {who: lord, text: `(Placeholder) ${speakerName(lord)} sits down with ${rec.name}.`},
    {who: rec.key, text: `(Placeholder) The rank ${R} conversation is still to be written.`},
  ];
}

function renderCamp(){
  const ck = SAVE.current, camp = campOf(), st = stOf(), F = FACTIONS[camp.faction], lord = camp.lord;
  const partners = supportPartners(ck);
  const card = r => {
    const rank = supportRank(ck, r.key), info = supportInfo(ck, r.key), next = SUPPORT.ranks[rank], cost = next && SUPPORT.cost[next];
    const pips = SUPPORT.ranks.map((R, i) => i < rank
      ? `<button class="spip on" data-support-view="${r.key}" data-rank="${i}" type="button" aria-label="Watch support ${R} again">${R}</button>`
      : `<span class="spip">${R}</span>`).join('');
    return `<div class="scard">
      <div class="por f-${r.faction}">${portraitInner(r, 'panel')}</div>
      <div class="sinfo"><div class="uhead"><span class="nm">${r.name}</span><span class="skind ${info.kind}">${SUPPORT.kinds[info.kind]}</span></div>
        <p class="meta">${info.about}</p>
        <div class="spips" aria-label="Support rank">${pips}</div></div>
      ${next ? `<button class="btn primary" data-support="${r.key}" type="button" ${st.res < cost ? 'disabled' : ''}>Support ${next} · ${cost} ${F.currency}</button>`
             : '<button class="btn" type="button" disabled>Support A reached</button>'}
    </div>`;
  };
  $('#camp').innerHTML = `<div class="sin f-${camp.faction}">
    <div class="sbar"><button class="btn" data-go="hub" type="button">‹ Back</button><h1>Camp</h1><div class="res">${st.res}<small>${F.currency}</small></div></div>
    <div class="hint">Spend time with the unique members of the army. Each conversation unlocks a support rank with ${speakerName(lord)}, from C to A. Tap a rank you've reached to watch it again.</div>
    ${partners.length ? `<div class="ulist">${partners.map(card).join('')}</div>`
      : `<div class="gatebox"><span>No one to sit with yet. Unique (★★★) members of the army appear here: some join in the story, others through Recruiting.</span></div>`}
  </div>`;
  showScreen('camp');
}
async function unlockSupport(key){
  const ck = SAVE.current, st = stOf(), rec = st.roster.find(r => r.key === key && !r.dead);
  const rank = supportRank(ck, key), next = SUPPORT.ranks[rank];
  if (!rec || !next) return;
  const cost = SUPPORT.cost[next];
  if (st.res < cost){ toast(`Not enough ${FACTIONS[campOf().faction].currency}.`); return; }
  st.res -= cost; supportState(ck)[key] = rank + 1; saveGame(); Sfx.play('coin');
  await talk(supportScene(ck, rec, rank));
  toast(`${rec.name} and ${speakerName(campOf().lord)} reached Support ${next}.`);
  Music.want(campTrack()); renderCamp();
}
async function viewSupport(key, rank){
  const ck = SAVE.current, rec = stOf().roster.find(r => r.key === key);
  if (!rec || rank >= supportRank(ck, key)) return;
  await talk(supportScene(ck, rec, rank));
  Music.want(campTrack()); renderCamp();
}
function openCamp(){
  const ck = SAVE.current;
  if (!campOpen(ck)){ toast(`The Camp opens once Chapter One is finished.`); return; }
  renderCamp();
  if (!campSeen(ck)){
    SAVE.flags['tut-camp-' + ck] = true; saveGame();
    const lord = CAMPAIGNS[ck].lord, F = FACTIONS[campOf().faction];
    talk([
      {who: lord, text: ck === 'rae' ? 'A night without guards or bells. We should use it to get to know who\'s standing with us.'
                                    : 'Biggle says a prince should know his soldiers. On that, at least, he may be right.'},
      {who: 'narr', text: `The Camp is open. Here, ${speakerName(lord)} can spend time with the unique (★★★) members of the army.`},
      {who: 'narr', text: 'Each of them has three support conversations, ranked C, B and A. Some become friends. Others have something to teach.'},
      {who: 'narr', text: `Unlocking a rank costs ${F.currency}: ${SUPPORT.cost.C} for C, ${SUPPORT.cost.B} for B, ${SUPPORT.cost.A} for A. Anything you've unlocked can be watched again at any time.`},
    ]);
  }
}
