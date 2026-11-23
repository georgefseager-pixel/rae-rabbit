// ================= Daily log-in =================
// Every new (local) calendar day you open the campaign screen counts as one more log-in: they don't need to be in a
// row, and missing days costs nothing. Log-ins are shown in weeks of seven; every seventh is a milestone with a
// recruit-style reveal. Rewards go to BOTH stories' recruiting currency (Whispers and Writs).
//   Log-in 7: Rae's Casual Wear (+5 each)    Log-in 14: Tiggle's Formal Wear (+5 each)
//   After 14, the second week repeats, with 10 each on every seventh instead of a costume.
// State: SAVE.login = {claimed: log-ins claimed in all, last: 'YYYY-MM-DD' of the last}.
const LOGIN = {
  track: [{tokens: 2}, {tokens: 2}, {tokens: 3}, {tokens: 2}, {tokens: 3}, {tokens: 3}, {tokens: 5, attire: ['rae', 'raeCasual'], instead: 10},
          {tokens: 2}, {tokens: 2}, {tokens: 3}, {tokens: 2}, {tokens: 3}, {tokens: 3}, {tokens: 5, attire: ['frog', 'tiggleFormal'], instead: 10}],
};
const todayKey = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const loginState = () => (SAVE.login ||= {claimed: 0, last: ''});
const loginPending = () => !!SAVE && loginState().last !== todayKey();
const ownsAttire = ([ck, id]) => SAVE.camps[ck].roster.some(r => r.key === ATTIRES[id].char && r.attires?.includes(id));
// The reward for log-in n (0-based). After the track, its second week repeats with currency on the milestone.
function loginEntry(n){
  const e = n < LOGIN.track.length ? LOGIN.track[n] : {...LOGIN.track[7 + (n - LOGIN.track.length) % 7], attire: null};
  return e.attire && !ownsAttire(e.attire) ? e : e.instead ? {tokens: e.instead, milestone: true} : e;
}
const isMilestone = n => n % 7 === 6;

function claimLogin(){
  if (!loginPending()) return null;
  const st = loginState(), n = st.claimed, e = loginEntry(n), got = [];
  for (const ck of Object.keys(CAMPAIGNS)){ gachaState(ck).tokens += e.tokens; got.push(`+${e.tokens} ${GACHA_ARMY[ck].currency}`); }
  if (e.attire) got.push(...grantAttires(e.attire[0], [e.attire[1]]));
  st.claimed++; st.last = todayKey(); saveGame();
  return {n, e, got};
}

const sealsHTML = () => Object.keys(CAMPAIGNS).map(ck => `<span class="f-${CAMPAIGNS[ck].faction}"><span class="seal sm">${GACHA_ARMY[ck].seal}</span></span>`).join('');
const attireArt = ([, id]) => { const a = ATTIRES[id]; return artFor({key: a.char, look: CHARACTERS[a.char]?.look || a.char, attire: id}, 'portrait'); };
// One week of the calendar: the week holding log-in `n` (the next to claim, or the one just claimed).
function loginHTML(claimed){
  const st = loginState(), n = claimed ? claimed.n : st.claimed, start = Math.floor(n/7)*7, week = start/7 + 1;
  const cell = i => { const k = start + i, e = claimed && k === claimed.n ? claimed.e : loginEntry(k);
    const got = k < st.claimed, today = !claimed && k === n, just = claimed && k === claimed.n;
    return `<div class="lday${got ? ' got' : ''}${today ? ' today' : ''}${just ? ' just' : ''}"><b>${k + 1}</b><div class="lseals">${sealsHTML()}</div>
      <small>+${e.tokens} each</small>${got ? '<i class="lstamp">✓</i>' : ''}${just ? `<span class="lfloat">+${e.tokens}</span>` : ''}</div>`; };
  const k7 = start + 6, e7 = claimed && claimed.n === k7 ? claimed.e : loginEntry(k7), got7 = k7 < st.claimed, today7 = !claimed && n === k7;
  const prize = e7.attire ? (() => { const a = ATTIRES[e7.attire[1]];
      return `<div class="lprizeart"><img alt="" src="${attireArt(e7.attire)}"></div>
        <div class="lprizetxt"><b>Log-in ${k7 + 1}</b><h2>${a.name}</h2><span>A costume for ${speakerName(a.char)}</span><small>${a.desc}</small>
        <small class="lplus">+${e7.tokens} ${GACHA_ARMY.rae.currency} and ${GACHA_ARMY.frog.currency}</small></div>`; })()
    : `<div class="lprizeart"><div class="lseals big">${sealsHTML()}</div></div>
       <div class="lprizetxt"><b>Log-in ${k7 + 1}</b><h2>+${e7.tokens} each</h2><span>${GACHA_ARMY.rae.currency} and ${GACHA_ARMY.frog.currency}</span></div>`;
  // what's waiting in later weeks
  const next = LOGIN.track.map((e, k) => ({e, k})).find(({e, k}) => e.attire && k > k7 && !ownsAttire(e.attire));
  const teaser = next ? `<p class="lnext">Still to come: <b>${ATTIRES[next.e.attire[1]].name}</b> for ${speakerName(ATTIRES[next.e.attire[1]].char)}, at log-in ${next.k + 1}.</p>` : '';
  return `<div class="card wsheet login">
    <div class="lhead"><div class="lkick">Daily Log-in · Week ${week}</div>
      <h1>${claimed ? `Log-in ${claimed.n + 1} claimed` : `Log-in ${n + 1}`}</h1>
      <div class="lbar"><i style="width:${(Math.min(st.claimed, start + 7) - start)/7*100}%"></i></div>
      <p class="meta">Every new day you visit counts, even with days missed in between. Rewards go to both stories.</p></div>
    <div class="lgrid">${[0, 1, 2, 3, 4, 5].map(cell).join('')}</div>
    <div class="lprize${got7 ? ' got' : ''}${today7 ? ' today' : ''}">${prize}${got7 ? '<i class="lstamp">✓</i>' : ''}</div>
    ${teaser}
    ${claimed ? `<p class="lgot">${claimed.got.join(' · ')}</p>${claimed.e.attire ? `<p class="meta lhint">Wear it from ${speakerName(ATTIRES[claimed.e.attire[1]].char)}'s unit card: tap “Attire”.</p>` : ''}
      <button class="btn primary" data-login-close type="button">Done</button>`
      : `<button class="btn primary lclaim" data-login-claim type="button">${isMilestone(n) ? 'Open Log-in ' + (n + 1) : 'Claim Log-in ' + (n + 1)}</button>`}</div>`;
}
// The seventh log-in of a week: a sealed note, then the prize in the spotlight (as when recruiting a ★★★).
function revealHTML(stage, claimed){
  if (stage === 'seal') return `<div class="lreveal"><div class="gtease"><div class="note lnote" style="--glow:#ecc673"><span class="seal big">★</span></div>
    <p>Log-in ${claimed.n + 1}. Something has been left for you.</p><div class="meta">Tap to break the seal</div></div></div>`;
  const e = claimed.e, a = e.attire && ATTIRES[e.attire[1]];
  return `<div class="lreveal"><div class="spin"><div class="sray"></div>
    <div class="sart${a ? '' : ' sw'}">${a ? `<img alt="" src="${attireArt(e.attire)}">` : `<div class="lseals big">${sealsHTML()}</div>`}</div>
    <div class="sstars">★★★</div><h2>${a ? a.name : `+${e.tokens} each`}</h2>
    <p>${a ? `A new costume for ${speakerName(a.char)}` : `${GACHA_ARMY.rae.currency} and ${GACHA_ARMY.frog.currency}`}</p>
    ${a ? `<p class="sdesc">${a.desc}</p>` : ''}<div class="stag">${claimed.got.join(' · ')}</div><div class="meta">Tap to continue</div></div></div>`;
}

let loginShowing = false;
async function checkDailyLogin(force){
  if (loginShowing || !loginPending() || (!force && location.hash === '#debug')) return;   // automated tests open it on purpose
  loginShowing = true;
  // wait for tutorials and story scenes on the campaign screen to finish
  for (let k = 0; k < 600 && (tutorialsRunning || !$('#talk').hidden || $('#hub').hidden); k++) await wait(300);
  if ($('#hub').hidden){ loginShowing = false; return; }
  let ov = $('#armsheet');
  if (!ov){ ov = document.createElement('div'); ov.id = 'armsheet'; ov.className = 'ov'; document.body.appendChild(ov); }
  ov.classList.add('loginov'); ov.innerHTML = loginHTML(null); ov.hidden = false;
  anim(ov.querySelector('.login'), [{opacity: 0, transform: 'translateY(18px) scale(.97)'}, {opacity: 1, transform: 'none'}], 380);
  let claimed = null, stage = 'calendar';
  ov.onclick = async e => {
    if (stage === 'calendar' && e.target.closest('[data-login-claim]')){
      claimed = claimLogin(); if (!claimed) return;
      if (isMilestone(claimed.n)){
        stage = 'seal'; ov.innerHTML = revealHTML('seal', claimed);
        anim(ov.querySelector('.lnote'), [{transform: 'rotate(-3deg)'}, {transform: 'rotate(3deg)'}, {transform: 'rotate(-3deg)'}], 600, {iterations: Infinity});
        return;
      }
      Sfx.play('coin'); stage = 'result'; ov.innerHTML = loginHTML(claimed); return;
    }
    if (stage === 'seal'){
      stage = 'busy'; Sfx.play('seal');
      await anim(ov.querySelector('.lnote'), [{transform: 'scale(1)', opacity: 1}, {transform: 'scale(1.35)', opacity: 0}], 380);
      ov.innerHTML = revealHTML('prize', claimed); Music.jingle('rare');
      anim(ov.querySelector('.spin'), [{opacity: 0, transform: 'scale(.8)'}, {opacity: 1, transform: 'none'}], 520);
      anim(ov.querySelector('.lreveal'), [{background: 'rgba(255,240,200,.9)'}, {background: 'rgba(0,0,0,0)'}], 600);
      stage = 'prize'; return;
    }
    if (stage === 'prize'){ stage = 'result'; ov.innerHTML = loginHTML(claimed); return; }
    if (stage === 'result' && e.target.closest('[data-login-close]')){
      ov.hidden = true; ov.onclick = null; ov.classList.remove('loginov'); loginShowing = false; renderHub();
    }
  };
}
// Debug: pretend today is a new day (the log-in becomes claimable again).
function debugNewDay(){ loginState().last = ''; saveGame(); checkDailyLogin(true); }
