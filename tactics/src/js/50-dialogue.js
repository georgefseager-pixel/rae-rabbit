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
    return `<img alt="" src="${art}" data-h="${h}" style="height:${h*100}%${tf ? `;transform:${tf}` : ''}">`;
  }
  return `<img alt="" class="plush" data-h=".62" src="${plushPortrait(sp.look)}">`;
}
// Two characters on stage must not stand inside each other. Each is drawn at its own height (STAGE_SIZE);
// if together they're wider than the screen, both shrink by the same amount so they still match in size.
function fitActors(){
  const ov = $('#talk'); if (!ov.classList.contains('scene')) return;
  const on = [...ov.querySelectorAll('.actor.on img')], box = ov.querySelector('.actor.on');
  if (!on.length || !box) return;
  const H = box.clientHeight, W = ov.clientWidth;
  let total = 0;
  for (const im of on){ if (!im.naturalWidth) return; total += H*(+im.dataset.h || 1)*im.naturalWidth/im.naturalHeight; }
  const k = on.length > 1 ? Math.min(1, W*1.02/total) : Math.min(1, W*.95/total);
  for (const im of on) im.style.height = (+im.dataset.h || 1)*k*100 + '%';
}
window.addEventListener('resize', () => fitActors());

// Backdrops painted already lamplit or at night: never shaded darker.
const NIGHT_LIT = ['quarters', 'ridge'];
// Where to anchor a backdrop when a tall phone screen crops its sides (default: centre).
const BG_POS = {ridge: '70% 30%'};
// Scenes whose painting hasn't arrived yet borrow another's (drop art/bg-<scene>.jpg in and it's used instead):
// (Chapter Three's monkeyland, castlegate and castle used this until their paintings arrived.)
const SCENE_FALLBACK = {};
// Diagrams a line can show with show:'name'.
const DIAGRAMS = {
  // the weapon triangle, plus tomes over bows: each arrow points at what it beats
  triangle(){
    const ic = (type, x, y, label) => `<g transform="translate(${x - 23} ${y - 23})">${weaponIconSVG({type, stars: 3, name: type}, 46)}</g>
      <text x="${x}" y="${y < 90 ? y - 30 : y + 38}" text-anchor="middle">${label}</text>`;
    const arrow = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), ux = dx/L, uy = dy/L, s = 30, e = 32;
      return `<path d="M${a[0] + ux*s} ${a[1] + uy*s} L${b[0] - ux*e} ${b[1] - uy*e}" marker-end="url(#dArr)"/>`; };
    const S = [80, 52], A = [136, 138], Lc = [24, 138], Tm = [238, 52], Bw = [238, 138];
    return `<div class="dtitle">What beats what</div>
      <svg viewBox="-8 4 296 182" role="img" aria-label="Swords beat axes, axes beat lances, lances beat swords. Tomes beat bows.">
        <defs><marker id="dArr" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="#ecc673"/></marker></defs>
        <g class="darr">${arrow(S, A)}${arrow(A, Lc)}${arrow(Lc, S)}${arrow(Tm, Bw)}</g>
        ${ic('sword', ...S, 'Sword')}${ic('axe', ...A, 'Axe')}${ic('lance', ...Lc, 'Lance')}${ic('tome', ...Tm, 'Tome')}${ic('bow', ...Bw, 'Bow')}
        <path d="M188 14 V178" class="dsep"/>
      </svg>
      <div class="dnote">The winner gets <b>+1 damage</b> and <b>+15 hit</b>; the loser the opposite.</div>`;
  },
};
function talk(rawLines){
  const lines = linesFor(rawLines);
  if (!lines.length) return Promise.resolve();
  const sceneMode = lines.some(l => l.scene || l.card);
  return new Promise(res => {
    const ov = $('#talk'), txt = $('#ttext'), box = $('#tbody'), por = $('#tpor'), nm = $('#tname'), skip = $('#skip');
    const card = $('#tcard'), wrap = $('#tboxWrap'), actors = {L: $('#actorL'), R: $('#actorR')}, onStage = {L: null, R: null};
    let i = -1, typing = null, full = '', voice = null;
    if (sceneMode) Music.want('story');   // whoever called talk() picks the music that follows
    ov.classList.toggle('scene', sceneMode);
    for (const a of Object.values(actors)){ a.className = a.className.replace(/ on| dim/g, ''); a.innerHTML = ''; }
    // story actions in lines not yet reached still happen when a scene is skipped (or ends early)
    const applyRest = () => { for (let j = i + 1; j < lines.length; j++){ const l = lines[j];
      if (l.rename) applyRename(SAVE.current, l.rename); if (l.arm) grantStoryWeapons(SAVE.current, l.arm); if (l.attire) grantAttires(SAVE.current, l.attire); }
      i = lines.length; saveGame(); };
    const finish = () => { applyRest(); $('#tdiag').hidden = true; ov.hidden = true; skip.hidden = true; card.hidden = true; ov.onclick = null; skip.onclick = null; clearInterval(typing); res(); };
    const show = () => {
      i++; if (i >= lines.length) return finish();
      const l = lines[i];
      // story actions that happen mid-scene: a new name, new weapons
      if (l.rename){ applyRename(SAVE.current, l.rename); saveGame(); return show(); }
      if (l.arm){ grantStoryWeapons(SAVE.current, l.arm); saveGame(); return show(); }
      if (l.attire){ grantAttires(SAVE.current, l.attire); saveGame(); return show(); }
      // a diagram shown above the text while this line is up (see DIAGRAMS)
      $('#tdiag').hidden = !l.show; if (l.show) $('#tdiag').innerHTML = DIAGRAMS[l.show]();
      if (l.scene){   // change the backdrop and clear the stage
        const sc = ART.bg?.[l.scene] ? l.scene : (SCENE_FALLBACK[l.scene] || l.scene);
        $('#sbg').dataset.bg = sc; $('#splace').textContent = l.place || '';
        // painted backdrop (art/bg-<scene>.jpg) where there is one; darker for night and dusk scenes
        // (night is darker than dusk/evening); the drawn placeholder details are hidden under a painting
        const bg = ART.bg?.[sc], pl = l.place || '', shade = NIGHT_LIT.includes(sc) ? 0 : /night/i.test(pl) ? .66 : /dusk|evening/i.test(pl) ? .5 : 0;
        $('#sbg').style.background = bg ? `${shade ? `linear-gradient(rgba(10,12,30,${shade}), rgba(10,12,30,${shade})), ` : ''}url(${bg}) ${BG_POS[sc] || 'center 30%'}/cover no-repeat` : '';
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
      if (narr) por.hidden = true;   // narration has no speaker portrait
      if (!narr){
        nm.className = 'tname f-' + sp.faction; nm.textContent = l.as || speakerName(l.who);
        por.hidden = sceneMode; por.className = 'tpor f-' + sp.faction; por.innerHTML = sceneMode ? '' : portraitInner(l.who, 'talk');
        if (sceneMode){
          // The campaign's lead stands on the left; whoever they are talking to stands on the right.
          const side = l.who === CAMPAIGNS[SAVE.current].lord ? 'L' : 'R';
          if (onStage[side] !== l.who){
            onStage[side] = l.who; actors[side].innerHTML = actorHTML(l.who, side);
            const im = actors[side].querySelector('img'); if (im && !im.complete) im.onload = fitActors;
            anim(actors[side], [{opacity: 0, transform: `translateX(${side === 'L' ? -30 : 30}px)`}, {opacity: 1, transform: 'none'}], 300);
          }
          actors[side].classList.add('on'); actors[side].classList.remove('dim');
          const other = side === 'L' ? 'R' : 'L'; if (onStage[other]) actors[other].classList.add('dim');
          fitActors();
        }
      } else if (sceneMode){ for (const s of ['L', 'R']) if (onStage[s]) actors[s].classList.add('dim'); }
      full = l.text; let n = 0; txt.textContent = '';
      clearInterval(typing);
      voice = narr ? null : sp.faction;
      typing = setInterval(() => { n += 2; txt.textContent = full.slice(0, n); if (voice && full[n - 1] !== ' ') Sfx.play('blip', voice); if (n >= full.length){ clearInterval(typing); typing = null; } }, 22);
    };
    ov.onclick = () => { if (typing){ clearInterval(typing); typing = null; txt.textContent = full; } else show(); };
    skip.onclick = e => { e.stopPropagation(); finish(); };
    ov.hidden = false; skip.hidden = false; card.hidden = true; wrap.hidden = false; show();
  });
}

// u is anything with name, lv, key, look, faction, w and flat stats (a battle unit, or a record's stats spread in).
function showLevelUp(u, ups, title = 'LEVEL UP', sub = null){
  const label = {mhp: 'HP', atk: isMagic(u.w) ? 'Mag' : 'Atk', def: 'Def', spd: 'Spd', skl: 'Skl'};
  $('#lvlCard').innerHTML = `<div class="urow"><div class="por f-${u.faction}">${portraitInner(u, 'panel')}</div>
    <div class="uinfo"><h1>${title}</h1><h2>${sub || `${u.name} · Level ${u.lv}`}</h2></div></div>
    <div class="lv">${STAT_KEYS.map(s => `<div class="${ups[s] ? 'up' : ''}"><small>${label[s]}</small>${u[s]}${ups[s] ? ' ▲' : ''}</div>`).join('')}</div>
    <p class="meta">Tap to continue.</p>`;
  $('#lvl').hidden = false; Sfx.play('levelup');
  return new Promise(res => {
    const done = () => { $('#lvl').hidden = true; $('#lvl').removeEventListener('click', done); clearTimeout(tm); res(); };
    const tm = setTimeout(done, 2800);
    setTimeout(() => $('#lvl').addEventListener('click', done), 250);
  });
}
