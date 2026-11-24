// ================= Energy =================
// One pool for the whole game (both routes): 6 at most. Losing or retreating from a battle costs 1 (winning costs
// nothing); 1 comes back every hour, counted from timestamps, so it refills while the game is closed. At 0, battles
// can't begin until one comes back (the Prepare screen still opens). The clock is the game's (gameDate), so
// "Debug: New Day" refills it too.
//   SAVE.energy = {n, t}: n now, t = when the next point started refilling (only meaningful below the max)
const ENERGY = {max: 6, regenMs: 3600e3};
const nowMs = () => gameDate().getTime();
function energyNow(){
  const e = SAVE.energy ||= {n: ENERGY.max, t: nowMs()}, now = nowMs();
  if (e.n >= ENERGY.max){ e.n = ENERGY.max; e.t = now; return e; }
  const got = Math.floor((now - e.t)/ENERGY.regenMs);
  if (got > 0){ e.n = Math.min(ENERGY.max, e.n + got); e.t = e.n >= ENERGY.max ? now : e.t + got*ENERGY.regenMs; }
  return e;
}
// ms until the next point (0 when full)
const energyWait = () => { const e = energyNow(); return e.n >= ENERGY.max ? 0 : Math.max(0, e.t + ENERGY.regenMs - nowMs()); };
const fmtWait = ms => { const s = Math.ceil(ms/1000), m = Math.floor(s/60); return `${m}:${String(s % 60).padStart(2, '0')}`; };
function spendEnergy(){
  const e = energyNow(); if (e.n >= ENERGY.max) e.t = nowMs();
  e.n = Math.max(0, e.n - 1); saveGame(); return e.n;
}
// Can a battle begin? If not, says why.
function energyGate(){
  if (energyNow().n > 0) return true;
  toast(`Out of energy. The next point comes back in ${fmtWait(energyWait())}.`);
  return false;
}
// The meter: six pips and, below the max, a countdown to the next one (kept live by the ticker below)
function energyHTML(cls = ''){
  const e = energyNow();
  return `<span class="energy ${cls}${e.n ? '' : ' empty'}" aria-label="Energy ${e.n} of ${ENERGY.max}"><span class="epips">${Array.from({length: ENERGY.max}, (_, i) => `<i class="${i < e.n ? 'on' : ''}"></i>`).join('')}</span>`
    + `<span class="etime" data-energy-time>${e.n < ENERGY.max ? `+1 in ${fmtWait(energyWait())}` : 'Full'}</span></span>`;
}
// the Prepare screen's button, while there's no energy
const beginLabel = () => energyNow().n ? 'Begin Battle' : `No energy · ${fmtWait(energyWait())}`;
setInterval(() => {
  const bb = document.querySelector('[data-begin]');
  if (bb && typeof SAVE !== 'undefined' && SAVE?.camps){ bb.textContent = beginLabel(); bb.classList.toggle('noenergy', !energyNow().n); }
  if (typeof SAVE === 'undefined' || !SAVE?.camps) return;
  const els = document.querySelectorAll('.energy'); if (!els.length) return;
  const before = SAVE.energy?.n, e = energyNow();
  if (e.n !== before){ saveGame(); for (const el of els) el.outerHTML = energyHTML(el.classList.contains('big') ? 'big' : ''); return; }
  for (const t of document.querySelectorAll('[data-energy-time]')) t.textContent = e.n < ENERGY.max ? `+1 in ${fmtWait(energyWait())}` : 'Full';
}, 1000);
