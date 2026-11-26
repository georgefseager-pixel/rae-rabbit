// ================= Debug menu =================
// One "Debug" button on the campaign screen (and in the battle menu). It asks for a password; the right one opens the
// full debug menu for the rest of the session (it isn't saved, so a reload asks again).
// Everything here changes the save directly. It's for testing, not for players.
const DEBUG_PASSWORD = 'scrumbly';
let debugAuthed = location.hash === '#debug';   // automated checks skip the password
let dbgCk = null;                                // which army the menu is acting on (defaults to the one in view)

function debugButtonHTML(){ return `<div class="dbg"><button class="btn" data-dbgopen type="button">🔧 Debug</button></div>`; }

// ---------- Password ----------
function openDebug(){
  if (debugAuthed) return renderDebug();
  let ov = $('#dbgsheet');
  if (!ov){ ov = document.createElement('div'); ov.id = 'dbgsheet'; ov.className = 'ov'; document.body.appendChild(ov); }
  ov.innerHTML = `<div class="card dbgpw"><h1>Debug</h1><p>Enter the password.</p>
    <input id="dbgpwIn" type="password" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Password">
    <div class="dbgrow"><button class="btn" data-dbgclose type="button">Cancel</button><button class="btn primary" data-dbgpw type="button">Open</button></div></div>`;
  ov.hidden = false;
  const inp = $('#dbgpwIn'); setTimeout(() => inp.focus(), 50);
  inp.onkeydown = e => { if (e.key === 'Enter') tryPassword(); };
}
function tryPassword(){
  const v = ($('#dbgpwIn')?.value || '').trim().toLowerCase();
  if (v === DEBUG_PASSWORD){ debugAuthed = true; Sfx.play('select'); renderDebug(); }
  else { $('#dbgpwIn').value = ''; $('#dbgpwIn').classList.add('bad'); toast('That isn\'t the password.'); }
}

// ---------- Helpers ----------
const dbgArmy = () => dbgCk || SAVE?.current || 'rae';
// Everything the story has done up to (not including) stage index `upto`: joins, renames, outfits, story weapons and
// attires. Used by "jump to stage" and "unlock everything".
function storyUpTo(ck, upto){
  const camp = CAMPAIGNS[ck], st = SAVE.camps[ck];
  camp.stages.forEach((sg, i) => {
    if (i >= upto || sg.stub) return;
    if (!st.cleared.includes(sg.id)) st.cleared.push(sg.id);
    applyOutfits(ck, sg.chapter.outfits); if (sg.rename) applyRename(ck, sg.rename);
    for (const l of sg.pre || []){ if (l.rename) applyRename(ck, l.rename); if (l.arm) grantStoryWeapons(ck, l.arm); if (l.attire) grantAttires(ck, l.attire); }
    grantStoryWeapons(ck, sg.reward?.weapons);
    for (const key of [...(sg.reward?.joins || []), ...(sg.events || []).map(e => e.join).filter(Boolean)])
      if (CHARACTERS[key] && !st.roster.some(r => r.key === key)) st.roster.push(recordFor(key));
  });
}
function jumpTo(ck, idx){
  const st = SAVE.camps[ck], camp = CAMPAIGNS[ck];
  st.cleared = st.cleared.filter(id => camp.sides.some(s => s.id === id));   // side stories stay as they were
  storyUpTo(ck, idx);
  // a stage can also wait on the other story (convergence): clear what it needs there too
  const need = camp.stages.slice(0, idx + 1).flatMap(s => s.requires || []);
  for (const id of need){ const o = otherCamp(ck), j = CAMPAIGNS[o].stages.findIndex(s => s.id === id); if (j >= 0) storyUpTo(o, j + 1); }
}
const dbgLevelTo = (rec, to) => { if (rec.lv >= to) return; const g = growthOf(rec); for (const k of ['mhp', 'atk', 'def', 'spd', 'skl']) rec.stats[k] += Math.round(g[k]/100*(to - rec.lv)); rec.lv = to; rec.exp = 0; };
const uniques = ck => SAVE.camps[ck].roster.filter(r => CHARACTERS[r.key]?.stars === 3 || CHARACTERS[r.key]?.lord || SUPPORTS[CAMPAIGNS[ck].lord]?.[r.key]);

// ---------- The menu ----------
function renderDebug(){
  let ov = $('#dbgsheet');
  if (!ov){ ov = document.createElement('div'); ov.id = 'dbgsheet'; ov.className = 'ov'; document.body.appendChild(ov); }
  const ck = dbgArmy(), camp = CAMPAIGNS[ck], st = SAVE.camps[ck], g = gachaState(ck), e = energyNow(), L = loginState();
  const inBattle = B && !B.done && !$('#app').hidden;
  const stageOpts = camp.stages.map((s, i) => `<option value="${i}"${stageState(ck, i).s === 'next' ? ' selected' : ''}>${s.stub ? '· ' + s.chapter.title + ' (not written)' : s.id + ' · ' + s.title}</option>`).join('');
  const sideOpts = camp.sides.map((s, j) => `<option value="${j}">${s.id} · ${s.title}${st.cleared.includes(s.id) ? ' ✓' : ''}</option>`).join('');
  const charOpts = uniques(ck).map(r => `<option value="${r.key}">${r.name} (${['–', 'C', 'B', 'A', 'S'][supportRank(ck, r.key)]})</option>`).join('');
  const sec = (title, body) => `<details class="dbgsec"${SAVE.debugOpenSec?.[title] === false ? '' : ' open'} data-sec="${title}"><summary>${title}</summary><div class="dbgbody">${body}</div></details>`;
  const b = (act, label, extra = '') => `<button class="btn" data-dbg="${act}" type="button" ${extra}>${label}</button>`;
  ov.innerHTML = `<div class="card dbgcard">
    <div class="dbghead"><h1>🔧 Debug</h1><button class="btn" data-dbgclose type="button">Close</button></div>
    <div class="dbgarmy">${Object.entries(CAMPAIGNS).map(([k, c]) => `<button class="btn${k === ck ? ' on' : ''} f-${c.faction}" data-dbgarmy="${k}" type="button">${FACTIONS[c.faction].name}</button>`).join('')}</div>
    <p class="dbgnote">Acting on <b>${camp.name}</b>. ${st.res} ${FACTIONS[camp.faction].currency} · ${g.tokens} ${GACHA_ARMY[ck].currency}${g.gifts ? ` · ${g.gifts} gifts` : ''} · ${st.roster.length} in the army · energy ${e.n}/${ENERGY.max}</p>
    ${inBattle ? sec('This battle', `<div class="dbggrid">${b('win', 'Win now')}${b('lose', 'Lose now')}${b('killall', 'Defeat every enemy')}${b('healall', 'Heal my units')}${b('refresh', 'Units can act again')}${b('turnend', 'Skip to the objective turn')}${b('bossweak', 'Boss to 1 HP')}${b('godmode', B.god ? 'Invincible: on' : 'Invincible: off')}</div>`) : ''}
    ${sec('Story progress', `<label>Jump to stage<select id="dbgStage">${stageOpts}</select></label>
      <div class="dbggrid">${b('jump', 'Jump there')}${b('clearch', 'Clear this whole chapter')}${b('unlock', SAVE.debugUnlock ? 'Relock everything' : 'Unlock everything')}${b('resetprog', 'Reset this army\'s story')}</div>
      <label>Side story<select id="dbgSide">${sideOpts}</select></label>
      <div class="dbggrid">${b('playside', 'Open it (ignore locks)')}${b('clearside', 'Mark it cleared')}${b('allsides', 'Clear every side story')}${b('resetsides', 'Reset side stories')}</div>`)}
    ${sec('Resources', `<div class="dbggrid">${b('res', `+1,000 ${FACTIONS[camp.faction].currency}`)}${b('res10', `+10,000 ${FACTIONS[camp.faction].currency}`)}${b('tok', `+10 ${GACHA_ARMY[ck].currency}`)}${b('tok100', `+100 ${GACHA_ARMY[ck].currency}`)}${b('gifts', '+20 gifts')}${b('pity', 'Next pull: guaranteed ★★★')}${b('zero', 'Set everything to 0')}</div>`)}
    ${sec('Army', `<label>Set every unit to level<input id="dbgLv" type="number" min="1" max="40" value="${Math.max(...st.roster.map(r => r.lv))}"></label>
      <div class="dbggrid">${b('setlv', 'Set levels')}${b('recruit', 'Recruit everyone')}${b('revive', 'Stitch up the fallen')}${b('weapons', 'Every weapon (one each)')}${b('attires', 'Every attire')}${b('clearrel', 'Release all ★ and ★★')}</div>
      <label>Supports<select id="dbgSup"><option value="*">Everyone</option>${charOpts}</select></label>
      <div class="dbggrid">${['C', 'B', 'A', 'S'].map((r, i) => b('sup' + (i + 1), 'Set to ' + r)).join('')}${b('sup0', 'Reset')}</div>`)}
    ${sec('Time, energy and events', `<div class="dbggrid">${b('newday', 'New day')}${b('loginall', 'Claim every log-in reward')}${b('hour', '+1 hour')}${b('energy0', 'Empty energy')}${b('energy1', 'Energy −1')}${b('energyfull', 'Refill energy')}${b('december', SAVE.debugDecember ? 'December: on' : 'December: off')}${b('eventplays', 'Event stories: play again today')}</div>
      <label>Log-ins so far (${L.claimed})<input id="dbgLogin" type="number" min="0" max="200" value="${L.claimed}"></label>
      <div class="dbggrid">${b('setlogin', 'Set, and log in again today')}${b('resetlogin', 'Reset log-ins')}</div>`)}
    ${sec('Tutorials and display', `<div class="dbggrid">${b('tuts', 'Show every tutorial again')}${b('fast', SAVE.debugFast ? 'Fast animations: on' : 'Fast animations: off')}${b('nomusic', 'Sound: ' + SOUND_SHORT[Audio_.mode].replace('♪ ', ''))}</div>`)}
    ${sec('Save', `<div class="dbggrid">${b('copysave', 'Copy save as text')}${b('pastesave', 'Load save from text')}${b('wipe', 'Erase the save')}</div>
      <textarea id="dbgSaveTxt" rows="3" placeholder="Paste a save here, then Load save from text"></textarea>`)}
    <div class="dbgrow">${b('lock', 'Lock the debug menu')}</div>
  </div>`;
  ov.hidden = false;
}

function debugAction(act, btn){
  const ck = dbgArmy(), st = SAVE.camps[ck], g = gachaState(ck), num = id => parseInt($(id)?.value, 10);
  const done = msg => { saveGame(); if (msg) toast(msg); refreshUnder(); renderDebug(); };
  switch (act){
    // this battle
    case 'win': $('#dbgsheet').hidden = true; $('#menu').hidden = true; finishBattle(true); return;
    case 'lose': $('#dbgsheet').hidden = true; $('#menu').hidden = true; finishBattle(false); return;
    case 'killall': for (const u of team('e')){ u.hp = 0; u.dead = true; } $('#dbgsheet').hidden = true; $('#menu').hidden = true; if (!checkEnd()) refreshTop(); return;
    case 'healall': for (const u of units) if (u.team !== 'e' && !u.dead){ u.hp = u.shp = u.mhp; } toast('Healed.'); return renderDebug();
    case 'refresh': for (const u of team('p')) u.moved = false; panelIdle(); toast('Everyone can act again.'); return renderDebug();
    case 'turnend': if (B.objective.turns) turn = B.objective.turns; $('#dbgsheet').hidden = true; $('#menu').hidden = true; refreshTop(); toast(`Turn ${ROMAN(turn)}: end your turn to finish.`); return;
    case 'bossweak': for (const u of units) if (u.boss && !u.dead) u.hp = u.shp = 1; toast('Boss on 1 HP.'); return renderDebug();
    case 'godmode': B.god = !B.god; return renderDebug();
    // story
    case 'jump': { const i = num('#dbgStage'); jumpTo(ck, i); return done(`Jumped to ${CAMPAIGNS[ck].stages[i].title}.`); }
    case 'clearch': { const i = num('#dbgStage'), ch = CAMPAIGNS[ck].stages[i].chapter, last = CAMPAIGNS[ck].stages.findLastIndex(s => s.chapter === ch); jumpTo(ck, last + 1); return done(`${ch.title} cleared.`); }
    case 'unlock': SAVE.debugUnlock = !SAVE.debugUnlock; if (SAVE.debugUnlock) for (const k of Object.keys(SAVE.camps)) storyUpTo(k, 0); return done(SAVE.debugUnlock ? 'Every fight and banner unlocked.' : 'Normal progression.');
    case 'resetprog': if (!armed(btn, 'Tap again: erase this army\'s story progress')) return; st.cleared = st.cleared.filter(id => CAMPAIGNS[ck].sides.some(s => s.id === id)); return done('Story progress reset (the army keeps its units).');
    case 'playside': { const j = num('#dbgSide'); $('#dbgsheet').hidden = true; SAVE.current = ck; const was = SAVE.debugUnlock; SAVE.debugUnlock = true; openPrep(ck, 's' + j); SAVE.debugUnlock = was; return; }
    case 'clearside': { const s = CAMPAIGNS[ck].sides[num('#dbgSide')]; if (!st.cleared.includes(s.id)) st.cleared.push(s.id); grantStoryWeapons(ck, s.reward?.weapons); return done(`${s.title} cleared.`); }
    case 'allsides': for (const s of CAMPAIGNS[ck].sides) if (!s.event && !st.cleared.includes(s.id)){ st.cleared.push(s.id); grantStoryWeapons(ck, s.reward?.weapons); } return done('Every side story cleared.');
    case 'resetsides': st.cleared = st.cleared.filter(id => !CAMPAIGNS[ck].sides.some(s => s.id === id)); return done('Side stories reset.');
    // resources
    case 'res': st.res += 1000; return done();
    case 'res10': st.res += 10000; return done();
    case 'tok': g.tokens += 10; return done();
    case 'tok100': g.tokens += 100; return done();
    case 'gifts': g.gifts = (g.gifts || 0) + 20; return done();
    case 'pity': for (const bn of GACHA_ARMY[ck].banners) (g.pity ||= {})[bn.id] = GACHA.pity - 1; return done('The next pull on any banner is a guaranteed ★★★.');
    case 'zero': st.res = 0; g.tokens = 0; g.gifts = 0; return done('Money and pulls set to 0.');
    // army
    case 'setlv': { const to = Math.max(1, Math.min(40, num('#dbgLv') || 1)); for (const r of st.roster) if (r.lv < to) dbgLevelTo(r, to); else r.lv = to; return done(`Everyone is level ${to}.`); }
    case 'recruit': { const n = debugRecruitAll(ck); if (n && festiveNeeded()) buildFestiveTroops().then(() => tokenCache?.clear?.()); return done(`${n} recruits joined.`); }
    case 'revive': for (const r of st.roster) if (r.dead && !r.departed) r.dead = false; return done('The fallen are stitched up.');
    case 'weapons': for (const [id, w] of Object.entries(WEAPONS)) if ((w.army === ck || (w.owner && st.roster.some(r => r.key === w.owner))) && !armsOf(ck).some(a => a.id === id)) addWeapon(ck, id); return done('One of every weapon.');
    case 'attires': grantAttires(ck, Object.keys(ATTIRES)); return done('Every attire for the characters here.');
    case 'clearrel': if (!armed(btn, 'Tap again: release every ★ and ★★')) return; st.roster = st.roster.filter(r => !(r.key === 'recruit' && (r.stars || 1) < 3 && !r.fav)); return done('Released.');
    case 'sup0': case 'sup1': case 'sup2': case 'sup3': case 'sup4': {
      const n = +act.slice(3), who = $('#dbgSup').value, keys = who === '*' ? uniques(ck).map(r => r.key) : [who];
      for (const k of keys) supportState(ck)[k] = Math.min(n, maxRank(ck, k));
      return done(`Supports set to ${['none', 'C', 'B', 'A', 'S'][n]}${n === 4 ? ' (where S exists)' : ''}.`);
    }
    // time
    case 'newday': debugNewDay(); return renderDebug();
    case 'loginall': {   // every reward left on the log-in track (currency, and the milestone costumes), without using up today's log-in
      const L = loginState(), from = L.claimed, tok = {rae: 0, frog: 0}, costumes = [];
      for (let n = from; n < LOGIN.track.length; n++){ const e = loginEntry(n); tok[loginCk(n)] += e.tokens; gachaState(loginCk(n)).tokens += e.tokens;
        if (e.attire) costumes.push(...grantAttires(e.attire[0], [e.attire[1]])); }
      L.claimed = Math.max(from, LOGIN.track.length); saveGame();
      return done(from >= LOGIN.track.length ? 'Every log-in reward is already claimed.' : `Claimed log-ins ${from + 1}–${LOGIN.track.length}: +${tok.rae} ${GACHA_ARMY.rae.currency}, +${tok.frog} ${GACHA_ARMY.frog.currency}${costumes.length ? ', ' + costumes.join(', ') : ''}.`);
    }
    case 'hour': SAVE.debugDays = (SAVE.debugDays || 0) + 1/24; return done('An hour passes.');
    case 'energy0': { const e = energyNow(); e.n = 0; e.t = nowMs(); return done(); }
    case 'energy1': spendEnergy(); return done();
    case 'energyfull': energyNow().n = ENERGY.max; return done();
    case 'december': SAVE.debugDecember = !SAVE.debugDecember; if (festiveNeeded()) buildFestiveTroops().then(() => tokenCache?.clear?.()); return done(SAVE.debugDecember ? 'It is December.' : 'Back to the real date.');
    case 'eventplays': SAVE.eventPlays = {}; return done('The seasonal stories can be played again today.');
    case 'setlogin': { const L = loginState(); L.claimed = Math.max(0, num('#dbgLogin') || 0); L.last = ''; saveGame(); $('#dbgsheet').hidden = true; refreshUnder(); checkDailyLogin(true); return; }
    case 'resetlogin': SAVE.login = {claimed: 0, last: ''}; return done('Log-ins reset.');
    // display
    case 'tuts': for (const k of Object.keys(SAVE.flags)) if (k.startsWith('tut-')) delete SAVE.flags[k]; return done('Tutorials will show again.');
    case 'fast': SAVE.debugFast = !SAVE.debugFast; return done();
    case 'nomusic': $('[data-sound]')?.click(); return renderDebug();
    // save
    case 'copysave': { const txt = JSON.stringify(SAVE), ta = $('#dbgSaveTxt'); ta.value = txt; ta.select();
      (navigator.clipboard?.writeText(txt) || Promise.reject()).then(() => toast('Save copied.'), () => toast('Select the text and copy it.')); return; }
    case 'pastesave': try { const s = JSON.parse($('#dbgSaveTxt').value); if (!s?.camps?.rae) throw 0; SAVE = migrateSave(s); return done('Save loaded.'); } catch (e){ toast('That isn\'t a save.'); return; }
    case 'wipe': if (!armed(btn, 'Tap again: erase everything')) return; Store.clear(); location.reload(); return;
    case 'lock': debugAuthed = false; $('#dbgsheet').hidden = true; toast('Debug menu locked.'); return;
  }
}
// redraw whatever is under the menu
function refreshUnder(){
  if (!$('#hub').hidden) renderHub(); else if (!$('#army').hidden) renderArmy(); else if (!$('#prep').hidden) renderPrep(); else if (!$('#camp')?.hidden && typeof renderCamp === 'function') renderCamp();
}

document.addEventListener('click', e => {
  const t = e.target.closest('[data-dbgopen], [data-dbgclose], [data-dbgpw], [data-dbgarmy], [data-dbg]'); if (!t) return;
  const d = t.dataset;
  if ('dbgopen' in d){ dbgCk = null; openDebug(); }
  else if ('dbgclose' in d) $('#dbgsheet').hidden = true;
  else if ('dbgpw' in d) tryPassword();
  else if (d.dbgarmy){ dbgCk = d.dbgarmy; renderDebug(); }
  else if (d.dbg) debugAction(d.dbg, t);
});
document.addEventListener('toggle', e => { const s = e.target.closest?.('.dbgsec'); if (s){ (SAVE.debugOpenSec ||= {})[s.dataset.sec] = s.open; } }, true);
