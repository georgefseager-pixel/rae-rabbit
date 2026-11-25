// ================= Installed app (web app on a phone) =================
// When the game is hosted as a website (tactics/web/, see tools/build.py), it can be installed to a phone's home
// screen. This file covers what that needs from inside the game: backing up and restoring the save, asking the
// browser to keep the save safe, and noticing when a new version has been published.
//   BUILD_ID   set by the build; tactics/web/version.json holds the newest one
const BUILD_ID = '/*@BUILD*/';
const hosted = () => /^https?:$/.test(location.protocol) && !!document.querySelector('link[rel="manifest"]');

// ---------- Save backup ----------
// A backup is a small text file of the save. Restoring one replaces the save on this device.
function backupSave(){
  const s = SAVE || Store.load(); if (!s){ toast('Nothing to back up yet: start a campaign first.'); return; }
  const blob = new Blob([JSON.stringify({game: 'toy-wars', saved: new Date().toISOString(), save: s})], {type: 'application/json'});
  const a = document.createElement('a'), d = gameDate();
  a.href = URL.createObjectURL(blob); a.download = `toy-wars-save-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}.json`;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  toast('Save backed up. Keep the file somewhere safe.');
}
async function restoreSave(file){
  try {
    const data = JSON.parse(await file.text()), s = data?.game === 'toy-wars' ? data.save : data;
    if (!s?.camps?.rae || !s?.camps?.frog) throw new Error('not a save');
    SAVE = migrateSave(s); saveGame();
    $('#contBtn').hidden = false; toast('Save restored. Tap Continue.');
  } catch (e){ toast('That file isn\'t a Toy Wars save.'); }
}
// (only on the hosted app: the Claude preview can't hand out files, and its save lives in the preview)
if (!hosted()) document.querySelector('.tsave')?.remove();
else {
$('#backupBtn').addEventListener('click', backupSave);
$('#restoreBtn').addEventListener('click', e => {
  if ((SAVE || Store.load()) && !armed(e.currentTarget, 'Tap again: this replaces your save')) return;
  $('#restoreFile').click();
});
$('#restoreFile').addEventListener('change', e => { const f = e.target.files?.[0]; if (f) restoreSave(f); e.target.value = ''; });
}

// ---------- Installed: keep the save, offline play, updates ----------
if (hosted()){
  // ask the browser not to clear the save when the phone is short of space
  navigator.storage?.persist?.().catch(() => {});
  // the service worker keeps a copy of the game for playing offline (tactics/web/sw.js)
  navigator.serviceWorker?.register('./sw.js').catch(() => {});
  // New versions: version.json names the newest build. When it differs, fetch the new game into the offline copy,
  // then offer to switch (never in the middle of a battle without asking).
  let offered = false;
  async function checkForUpdate(){
    if (offered || !navigator.onLine) return;
    try {
      const v = await (await fetch('./version.json', {cache: 'no-store'})).json();
      if (!v?.build || v.build === BUILD_ID) return;
      const fresh = await fetch('./', {cache: 'reload'}); if (!fresh.ok) return;
      const cache = await caches.open('toy-wars'); await cache.put('./', fresh.clone());
      offered = true; showUpdateBar();
    } catch (e){}
  }
  function showUpdateBar(){
    const bar = document.createElement('button'); bar.id = 'updbar'; bar.type = 'button';
    bar.innerHTML = '<b>A new version is ready.</b> Tap to update.';
    bar.onclick = () => { if (B && !B.done && !armed(bar, 'Tap again: the battle will restart')) return; saveGame?.(); location.reload(); };
    document.body.appendChild(bar);
  }
  setTimeout(checkForUpdate, 4000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) checkForUpdate(); });
}
