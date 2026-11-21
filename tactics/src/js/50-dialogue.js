// ================= Story scenes, dialogue & level-up cards =================
// talk(lines) plays a list of scene lines (see 25-data-campaign.js). If any line sets a {scene},
// it plays as a full story scene with a backdrop and characters on stage; otherwise it is a short
// exchange over the battlefield (boss lines).
const linesFor = lines => (lines || []).filter(l => (!l.if || SAVE.flags[l.if]) && (!l.unless || !SAVE.flags[l.unless]));

function actorHTML(who, side){
  const sp = SPEAKERS[who];
  if (!sp) return '';
  const art = artFor(who, 'portrait');   // falls back to the mine-rabbit art in the speaker's fur
  if (art){
    const st = STAGE_SIZE[artResolve(who, 'portrait')] || {}, h = st.h || 1, drop = st.drop || 0;
    const tf = `${drop ? `translateY(${drop*100}%)` : ''}${side === 'R' ? ' scaleX(-1)' : ''}`;
    return `<img alt="" src="${art}" style="height:${h*100}%${tf ? `;transform:${tf}` : ''}">`;
  }
  return `<img alt="" class="plush" src="${plushPortrait(sp.look)}">`;
}

// Backdrops painted already lamplit or at night: never shaded darker.
const NIGHT_LIT = ['quarters', 'ridge'];
// Where to anchor a backdrop when a tall phone screen crops its sides (default: centre).
const BG_POS = {ridge: '70% 30%'};
function talk(rawLines){
  const lines = linesFor(rawLines);
  if (!lines.length) return Promise.resolve();
  const sceneMode = lines.some(l => l.scene || l.card);
  return new Promise(res => {
    const ov = $('#talk'), txt = $('#ttext'), box = $('#tbody'), por = $('#tpor'), nm = $('#tname'), skip = $('#skip');
    const card = $('#tcard'), wrap = $('#tboxWrap'), actors = {L: $('#actorL'), R: $('#actorR')}, onStage = {L: null, R: null};
    let i = -1, typing = null, full = '';
    ov.classList.toggle('scene', sceneMode);
    for (const a of Object.values(actors)){ a.className = a.className.replace(/ on| dim/g, ''); a.innerHTML = ''; }
    const finish = () => { ov.hidden = true; skip.hidden = true; card.hidden = true; ov.onclick = null; skip.onclick = null; clearInterval(typing); res(); };
    const show = () => {
      i++; if (i >= lines.length) return finish();
      const l = lines[i];
      if (l.scene){   // change the backdrop and clear the stage
        $('#sbg').dataset.bg = l.scene; $('#splace').textContent = l.place || '';
        // painted backdrop (art/bg-<scene>.jpg) where there is one; darker for night and dusk scenes
        // (night is darker than dusk/evening); the drawn placeholder details are hidden under a painting
        const bg = ART.bg?.[l.scene], pl = l.place || '', shade = NIGHT_LIT.includes(l.scene) ? 0 : /night/i.test(pl) ? .66 : /dusk|evening/i.test(pl) ? .5 : 0;
        $('#sbg').style.background = bg ? `${shade ? `linear-gradient(rgba(10,12,30,${shade}), rgba(10,12,30,${shade})), ` : ''}url(${bg}) ${BG_POS[l.scene] || 'center 30%'}/cover no-repeat` : '';
        $('#sbg').toggleAttribute('data-painted', !!bg);
        for (const s of ['L', 'R']){ onStage[s] = null; actors[s].classList.remove('on', 'dim'); }
        anim($('#sbg'), [{opacity: 0}, {opacity: 1}], 500);
        return show();
      }
      if (l.card){
        card.hidden = false; wrap.hidden = true; $('#tc1').textContent = l.card; $('#tc2').textContent = l.sub || '';
        anim(card, [{opacity: 0}, {opacity: 1}], 600);
        return;
      }
      card.hidden = true; wrap.hidden = false;
      const narr = l.who === 'narr', sp = SPEAKERS[l.who] || SPEAKERS.narr;
      box.className = 'tbody' + (narr ? ' narr' : '') + (l.thought ? ' thought' : '');
      nm.hidden = narr;
      if (!narr){
        nm.className = 'tname f-' + sp.faction; nm.textContent = l.as || speakerName(l.who);
        por.hidden = sceneMode; por.className = 'tpor f-' + sp.faction; por.innerHTML = sceneMode ? '' : portraitInner(l.who, 'talk');
        if (sceneMode){
          // The campaign's lead stands on the left; whoever they are talking to stands on the right.
          const side = l.who === CAMPAIGNS[SAVE.current].lord ? 'L' : 'R';
          if (onStage[side] !== l.who){
            onStage[side] = l.who; actors[side].innerHTML = actorHTML(l.who, side);
            anim(actors[side], [{opacity: 0, transform: `translateX(${side === 'L' ? -30 : 30}px)`}, {opacity: 1, transform: 'none'}], 300);
          }
          actors[side].classList.add('on'); actors[side].classList.remove('dim');
          const other = side === 'L' ? 'R' : 'L'; if (onStage[other]) actors[other].classList.add('dim');
        }
      } else if (sceneMode){ for (const s of ['L', 'R']) if (onStage[s]) actors[s].classList.add('dim'); }
      full = l.text; let n = 0; txt.textContent = '';
      clearInterval(typing);
      typing = setInterval(() => { n += 2; txt.textContent = full.slice(0, n); if (n >= full.length){ clearInterval(typing); typing = null; } }, 22);
    };
    ov.onclick = () => { if (typing){ clearInterval(typing); typing = null; txt.textContent = full; } else show(); };
    skip.onclick = e => { e.stopPropagation(); finish(); };
    ov.hidden = false; skip.hidden = false; card.hidden = true; wrap.hidden = false; show();
  });
}

// u is anything with name, lv, key, look, faction, w and flat stats (a battle unit, or a record's stats spread in).
function showLevelUp(u, ups){
  const label = {mhp: 'HP', atk: u.w === 'staff' ? 'Mag' : 'Atk', def: 'Def', spd: 'Spd', skl: 'Skl'};
  $('#lvlCard').innerHTML = `<div class="urow"><div class="por f-${u.faction}">${portraitInner(u, 'panel')}</div>
    <div class="uinfo"><h1>LEVEL UP</h1><h2>${u.name} · Level ${u.lv}</h2></div></div>
    <div class="lv">${STAT_KEYS.map(s => `<div class="${ups[s] ? 'up' : ''}"><small>${label[s]}</small>${u[s]}${ups[s] ? ' ▲' : ''}</div>`).join('')}</div>
    <p class="meta">Tap to continue.</p>`;
  $('#lvl').hidden = false;
  return new Promise(res => {
    const done = () => { $('#lvl').hidden = true; $('#lvl').removeEventListener('click', done); clearTimeout(tm); res(); };
    const tm = setTimeout(done, 2800);
    setTimeout(() => $('#lvl').addEventListener('click', done), 250);
  });
}
