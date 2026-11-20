// ================= Dialogue & level-up cards =================
// Lines: {who, text, if?:flag, unless?:flag}. Lines whose flag test fails are skipped.
const linesFor = lines => (lines || []).filter(l => (!l.if || SAVE.flags[l.if]) && (!l.unless || !SAVE.flags[l.unless]));

function talk(rawLines){
  const lines = linesFor(rawLines);
  if (!lines.length) return Promise.resolve();
  return new Promise(res => {
    const ov = $('#talk'), txt = $('#ttext'), box = $('#tbody'), por = $('#tpor'), nm = $('#tname'), skip = $('#skip');
    let i = -1, typing = null, full = '';
    const finish = () => { ov.hidden = true; skip.hidden = true; ov.onclick = null; skip.onclick = null; clearInterval(typing); res(); };
    const show = () => {
      i++; if (i >= lines.length) return finish();
      const l = lines[i], sp = SPEAKERS[l.who] || SPEAKERS.narr, narr = l.who === 'narr';
      box.className = 'tbody' + (narr ? ' narr' : '');
      por.hidden = narr; nm.hidden = narr;
      if (!narr){
        por.className = 'tpor f-' + sp.faction;
        por.innerHTML = portraitInner(l.who, sp.look, 'talk');
        nm.className = 'tname f-' + sp.faction; nm.textContent = sp.name;
      }
      full = l.text; let n = 0; txt.textContent = '';
      clearInterval(typing);
      typing = setInterval(() => { n += 2; txt.textContent = full.slice(0, n); if (n >= full.length){ clearInterval(typing); typing = null; } }, 22);
    };
    ov.onclick = () => { if (typing){ clearInterval(typing); typing = null; txt.textContent = full; } else show(); };
    skip.onclick = e => { e.stopPropagation(); finish(); };
    ov.hidden = false; skip.hidden = false; show();
  });
}

// u is anything with name, lv, key, look, faction, w and flat stats (a battle unit, or a record's stats spread in).
function showLevelUp(u, ups){
  const label = {mhp: 'HP', atk: u.w === 'staff' ? 'Mag' : 'Atk', def: 'Def', spd: 'Spd', skl: 'Skl'};
  $('#lvlCard').innerHTML = `<div class="urow"><div class="por f-${u.faction}">${portraitInner(u.key, u.look, 'panel')}</div>
    <div class="uinfo"><h1>LEVEL UP</h1><h2>${u.name} · Level ${u.lv}</h2></div></div>
    <div class="lv">${STAT_KEYS.map(s => `<div class="${ups[s] ? 'up' : ''}"><small>${label[s]}</small>${u[s]}${ups[s] ? ' ▲' : ''}</div>`).join('')}</div>
    <p class="meta">The cause grows stronger. Tap to continue.</p>`;
  $('#lvl').hidden = false;
  return new Promise(res => {
    const done = () => { $('#lvl').hidden = true; $('#lvl').removeEventListener('click', done); clearTimeout(tm); res(); };
    const tm = setTimeout(done, 2800);
    setTimeout(() => $('#lvl').addEventListener('click', done), 250);
  });
}
