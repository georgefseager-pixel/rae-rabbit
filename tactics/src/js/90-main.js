// ================= Boot =================
validateMaps();
function boot(data){
  SAVE = migrateSave((data && data.save) || Store.load());
  $('#titleArt').src = ART.rae?.portrait || plushPortrait('rae');
  $('#titleArt2').src = ART.tiggle?.portrait || plushPortrait('tiggle');
  $('#contBtn').hidden = !SAVE; soundLabels();
  if (!(data && data.save)) Music.want('title');
  if (data && data.save){ $('#title').hidden = true; renderHub(); }   // returning from a live update
  requestAnimationFrame(frame);
  document.fonts?.ready?.then(() => { tokenCache.clear(); resize(); });
  // Recolour the mine-rabbit art, then redraw whatever is showing so placeholders become art.
  buildFurVariants().then(() => {
    tokenCache.clear(); for (const k in portraitCache) delete portraitCache[k];
    if (!$('#hub').hidden) renderHub(); else if (!$('#army').hidden) renderArmy(); else if (!$('#prep').hidden) renderPrep();
    else if (B && !$('#app').hidden){ resize(); if (phase === 'p' && mode === 'idle') panelIdle(); }
  });
}
// Keep the campaign when the page is updated while open (a battle in progress restarts from the hub).
window.claude?.hot?.snapshot?.(() => SAVE ? {save: SAVE} : {});
window.claude?.hot?.ready ? window.claude.hot.ready(boot) : boot(window.claude?.hot?.data ?? {});
// Test hook, only with #debug in the address: lets automated checks force a battle result.
if (location.hash === '#debug') Object.assign(window, {__audio: Audio_, __music: Music, __sfx: Sfx});
if (location.hash === '#debug') window.RAE_DEBUG = {battle: () => B, killUnit: key => { const u = units.find(x => x.key === key && x.team === 'p'); if (u){ u.hp = 0; u.dead = true; } }, icons: () => [...['Scrap Blade:sword','Pike:lance','Axe:axe','Longbow:bow','Sling:bow','Lash:bow:lash','Needle:staff','Thimble:staff','Censer:staff'].flatMap(s => { const [name, type, l] = s.split(':'); return [0,1,2,3].map(st => '<div style="color:#eee;font:11px sans-serif;text-align:center">' + weaponIconSVG({name, type, stars: st, lash: !!l}, 72) + '<br>' + name + ' ' + st + '</div>'); })].join(''), win: () => finishBattle(true), lose: () => finishBattle(false), save: () => SAVE, art: () => ART, artReady: () => furReady, talk: lines => talk(lines), resolve: (e, k) => artResolve(e, k), fight: (ak, dk) => { const f = k => units.find(u => !u.dead && u.key === k); return doCombat(f(ak), f(dk)); },
  duel: (a, d) => { const mk = (e, t) => Object.assign({id: Math.random(), team: t, hp: 20, mhp: 20, atk: 10, def: 3, spd: 5, skl: 5, w: CLASSES[e.cls].w, rng: CLASSES[e.cls].rng, lv: 1}, e);
    B = B || {ch: {}}; if (!MAP.length){ mapDef = MAPS.ford; MAP = mapDef.rows; } showScreen('app'); const A = mk(a, 'p'), D = mk(d, 'e'); A.x = 2; A.y = 6; D.x = 3; D.y = 6; return openDuel(A, D); }};
