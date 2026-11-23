// ================= Daily log-in =================
// A seven-day calendar. The first time the campaign screen opens on a new (local) calendar day, the next day's
// reward is offered. Missing a day doesn't reset the week; it just waits. Each reward goes to BOTH stories' recruiting
// currency (Whispers and Writs). Day 7 gives Rae her Casual Wear; once owned, later day 7s give currency instead.
// State: SAVE.login = {claimed: days claimed in all, last: 'YYYY-MM-DD' of the last claim}.
const LOGIN = {
  days: [{tokens: 2}, {tokens: 2}, {tokens: 3}, {tokens: 2}, {tokens: 3}, {tokens: 3},
         {tokens: 5, attires: {rae: 'raeCasual'}, instead: 10}],   // day 7: costume (+5), or 10 once owned
};
const todayKey = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const loginState = () => (SAVE.login ||= {claimed: 0, last: ''});
const loginPending = () => !!SAVE && loginState().last !== todayKey();
const loginDay = () => loginState().claimed % 7;   // 0–6: the day that would be claimed next
const ownsWeekCostumes = day => Object.entries(day.attires || {}).every(([ck, id]) => SAVE.camps[ck].roster.some(r => r.key === ATTIRES[id].char && r.attires?.includes(id)));

function loginRewardText(day, i){
  if (day.attires && !ownsWeekCostumes(day)) return `${day.tokens} each + a costume`;
  return `${day.attires ? day.instead : day.tokens} each`;
}
function claimLogin(){
  if (!loginPending()) return null;
  const i = loginDay(), day = LOGIN.days[i], got = [];
  const costume = day.attires && !ownsWeekCostumes(day), label = loginRewardText(day, i);
  const n = day.attires && !costume ? day.instead : day.tokens;
  for (const ck of Object.keys(CAMPAIGNS)){ gachaState(ck).tokens += n; got.push(`+${n} ${GACHA_ARMY[ck].currency}`); }
  if (costume) for (const [ck, id] of Object.entries(day.attires)) got.push(...grantAttires(ck, [id]));
  const st = loginState(); st.claimed++; st.last = todayKey(); saveGame();
  return {i, got, label};
}
const seals = () => Object.keys(CAMPAIGNS).map(ck => `<span class="f-${CAMPAIGNS[ck].faction}"><span class="seal sm">${GACHA_ARMY[ck].seal}</span></span>`).join('');
function loginHTML(claimedNow){
  const done = loginDay(), shown = claimedNow ? (loginState().claimed % 7 || 7) : done;   // days ticked off this week
  const d7 = LOGIN.days[6], costumeLeft = !ownsWeekCostumes(d7) || (claimedNow?.i === 6 && /costume/.test(claimedNow.label));
  const [ck7, id7] = Object.entries(d7.attires)[0], a7 = ATTIRES[id7];
  const art7 = artFor({key: a7.char, look: CHARACTERS[a7.char]?.look || a7.char, attire: id7}, 'portrait');
  const cell = (d, i) => { const got = i < shown, today = !claimedNow && i === done;
    return `<div class="lday${got ? ' got' : ''}${today ? ' today' : ''}"><b>Day ${i + 1}</b><div class="lseals">${seals()}</div>
      <small>+${d.tokens} each</small>${got ? '<i class="lstamp">✓</i>' : ''}</div>`; };
  const got7 = shown >= 7, today7 = !claimedNow && done === 6;
  return `<div class="card wsheet login">
    <div class="lhead"><div class="lkick">Daily Log-in</div><h1>${claimedNow ? `Day ${claimedNow.i + 1} claimed` : `Day ${done + 1} of 7`}</h1>
      <div class="lbar"><i style="width:${shown/7*100}%"></i></div>
      <p class="meta">Come back each day for ${GACHA_ARMY.rae.currency} and ${GACHA_ARMY.frog.currency}, for both stories. Missing a day doesn't reset the week.</p></div>
    <div class="lgrid">${LOGIN.days.slice(0, 6).map(cell).join('')}</div>
    <div class="lprize${got7 ? ' got' : ''}${today7 ? ' today' : ''}">
      ${costumeLeft ? `<div class="lprizeart"><img alt="" src="${art7}"></div>` : `<div class="lprizeart"><div class="lseals big">${seals()}</div></div>`}
      <div class="lprizetxt"><b>Day 7</b>${costumeLeft ? `<h2>${a7.name}</h2><span>A costume for ${speakerName(a7.char)}</span><small>${a7.desc}</small><small class="lplus">+${d7.tokens} ${GACHA_ARMY.rae.currency} and ${GACHA_ARMY.frog.currency}</small>`
        : `<h2>+${d7.instead} each</h2><span>${GACHA_ARMY.rae.currency} and ${GACHA_ARMY.frog.currency}</span>`}</div>
      ${got7 ? '<i class="lstamp">✓</i>' : ''}</div>
    ${claimedNow ? `<p class="lgot">${claimedNow.got.join(' · ')}</p>${claimedNow.i === 6 && /costume/.test(claimedNow.label) ? `<p class="meta">Wear it from ${speakerName(a7.char)}'s unit card: tap “Attire”.</p>` : ''}
      <button class="btn primary" data-login-close type="button">Done</button>`
      : `<button class="btn primary" data-login-claim type="button">Claim Day ${done + 1}</button>`}</div>`;
}
let loginShowing = false;
async function checkDailyLogin(force){
  if (loginShowing || !loginPending() || (!force && location.hash === '#debug')) return;   // tests open it on purpose
  loginShowing = true;
  // wait for tutorials and story scenes on the campaign screen to finish
  for (let k = 0; k < 600 && (tutorialsRunning || !$('#talk').hidden || $('#hub').hidden); k++) await wait(300);
  if ($('#hub').hidden){ loginShowing = false; return; }
  let ov = $('#armsheet');
  if (!ov){ ov = document.createElement('div'); ov.id = 'armsheet'; ov.className = 'ov'; document.body.appendChild(ov); }
  ov.innerHTML = loginHTML(null); ov.hidden = false;
  ov.onclick = e => {
    if (e.target.closest('[data-login-claim]')){ const r = claimLogin(); Sfx.play('coin'); ov.innerHTML = loginHTML(r); return; }
    if (e.target.closest('[data-login-close]')){ ov.hidden = true; ov.onclick = null; loginShowing = false; renderHub(); }
  };
}
