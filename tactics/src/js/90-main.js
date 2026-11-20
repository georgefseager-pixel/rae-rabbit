// ================= Boot =================
validateMaps();
function boot(data){
  SAVE = (data && data.save) || Store.load();
  $('#titleArt').src = ART.rae?.portrait || plushPortrait('rae');
  $('#contBtn').hidden = !SAVE;
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
if (location.hash === '#debug') window.RAE_DEBUG = {win: () => finishBattle(true), lose: () => finishBattle(false), save: () => SAVE, art: () => ART, artReady: () => furReady};
