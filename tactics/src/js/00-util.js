// Shared helpers. tools/build.py concatenates every file in src/js into one closure,
// in filename order, so top-level names declared here are visible everywhere.

const $ = s => document.querySelector(s);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const deepCopy = o => JSON.parse(JSON.stringify(o));
const ROMAN = n => { let s = ''; for (const [v, c] of [[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']]) while (n >= v){ s += c; n -= v; } return s; };
function hash(x, y, s = 0){ let h = (x*374761393 + y*668265263 + s*1442695041) | 0; h = Math.imul(h ^ (h>>>13), 1274126177); return ((h ^ (h>>>16)) >>> 0) / 4294967295; }

// Per-viewer save slot. Browser storage can be missing or throw (private windows,
// previews), so every access is guarded and the game still runs without it.
const Store = {
  key: 'raepublic-save-v3',
  load(){ try { const s = localStorage.getItem(this.key); return s ? JSON.parse(s) : null; } catch (e){ return null; } },
  save(d){ try { localStorage.setItem(this.key, JSON.stringify(d)); } catch (e){} },
  clear(){ try { localStorage.removeItem(this.key); } catch (e){} },
};

// Character art arrives as data URIs (see tools/build.py). Turn each into a short blob: URL
// once, so the page never copies the big strings around when it re-renders.
function dataToURL(d){
  try {
    const [head, b64] = d.split(','), bin = atob(b64), bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return URL.createObjectURL(new Blob([bytes], {type: head.slice(5).split(';')[0]}));
  } catch (e){ return d; }
}
const ART = {};   // ART[characterKey] = {portrait, battle}
for (const [key, set] of Object.entries(window.GAME_ART || {})){
  ART[key] = {};
  for (const [kind, d] of Object.entries(set)) ART[key][kind] = dataToURL(d);
}

function toast(msg){
  const t = $('#toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(toast.tm); toast.tm = setTimeout(() => { t.hidden = true; }, 2200);
}

// Two-tap confirmation for destructive buttons (the viewer has no confirm() dialog).
function armed(btn, label){
  if (btn.dataset.armed){ delete btn.dataset.armed; return true; }
  const orig = btn.textContent; btn.dataset.armed = '1'; btn.textContent = label;
  setTimeout(() => { if (btn.dataset.armed){ delete btn.dataset.armed; btn.textContent = orig; } }, 2500);
  return false;
}
