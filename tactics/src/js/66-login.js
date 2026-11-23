// ================= Daily log-in =================
// A seven-day calendar. The first time the campaign screen opens on a new (local) calendar day, the next day's
// reward is offered. Missing a day doesn't reset the week; it just waits. Each reward goes to BOTH stories' recruiting
// currency (Whispers and Writs). Day 7 gives each story's leader a costume; once owned, later day 7s give currency.
// State: SAVE.login = {claimed: days claimed in all, last: 'YYYY-MM-DD' of the last claim}.
const LOGIN = {
  days: [{tokens: 2}, {tokens: 2}, {tokens: 3}, {tokens: 2}, {tokens: 3}, {tokens: 3},
         {tokens: 5, attires: {rae: 'raeWeek', frog: 'tiggleWeek'}, instead: 10}],   // day 7: costume (+5), or 10 once owned
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
function loginHTML(claimedNow){
  const done = loginDay(), shown = claimedNow ? (loginState().claimed % 7 || 7) : done;   // days ticked off this week
  const cells = LOGIN.days.map((d, i) => {
    const got = i < shown, today = !claimedNow && i === done;
    return `<div class="lday${got ? ' got' : ''}${today ? ' today' : ''}${d.attires ? ' big' : ''}"><b>Day ${i + 1}</b>
      <span>${d.attires && (!ownsWeekCostumes(d) || (claimedNow && i === claimedNow.i && /costume/.test(claimedNow.label))) ? '👘' : '✉'}</span><small>${claimedNow && i === claimedNow.i ? claimedNow.label : loginRewardText(d, i)}</small>${got ? '<i>✓</i>' : ''}</div>`;
  }).join('');
  return `<div class="card wsheet login"><h1>Daily Log-in</h1>
    <h2>Come back each day for ${GACHA_ARMY.rae.currency} and ${GACHA_ARMY.frog.currency}. Day 7 brings a costume for Rae Rabbit and Tiggle Taggle.</h2>
    <div class="lgrid">${cells}</div>
    ${claimedNow ? `<p class="meta lgot">${claimedNow.got.join(' · ')}</p><button class="btn primary" data-login-close type="button">Done</button>`
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
