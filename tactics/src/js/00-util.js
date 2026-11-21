// Shared helpers. tools/build.py concatenates every file in src/js into one closure,
// in filename order, so top-level names declared here are visible everywhere.

const $ = s => document.querySelector(s);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const deepCopy = o => JSON.parse(JSON.stringify(o));
const pick = arr => arr[Math.floor(Math.random()*arr.length)];
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

// Outfits: a character can have alternate art, named art/<key><outfit>-<kind>.png (e.g. raecamp-portrait.png).
// The outfit a character is wearing is kept on their army record and set by chapters (see 25-data-campaign.js).
function outfitOf(key){
  const S = typeof SAVE !== 'undefined' ? SAVE : null;
  for (const c of Object.values(S?.camps || {})){ const r = c.roster.find(r => r.key === key); if (r) return r.outfit ?? CHARACTERS[key]?.outfit ?? ''; }
  // story-only characters (not in any army) keep their outfit on the save itself
  return S?.outfits?.[key] ?? CHARACTERS[key]?.outfit ?? SPEAKERS[key]?.outfit ?? '';
}
function artKey(key, kind){ const o = outfitOf(key); return o && ART[key + o]?.[kind] ? key + o : key; }

// Which art to show for a character or unit. `ent` is a character key, or anything with {key, look, uid, name, fur}.
// Order: the character's own art (in their current outfit), then the shared generic art for their species,
// recoloured into their coat: mine rabbits (art/miner-*.png, colours in FURS) and frog soldiers
// (art/grunt-*.png, skin colours in SKINS).
function strHash(s){ let h = 7; for (const c of String(s)) h = (h*31 + c.charCodeAt(0)) | 0; return Math.abs(h); }
const SPECIES_ART = {bun: {base: 'miner', palette: () => FURS}, frog: {base: 'grunt', palette: () => SKINS}};
function speciesOf(ent){ return SPECIES_ART[LOOKS[ent.look]?.sp] || null; }
function furOf(ent){
  const sp = speciesOf(ent); if (!sp) return null;
  const pal = sp.palette();
  const f = ent.fur || CHARACTERS[ent.key]?.fur || SPEAKERS[ent.key]?.fur;
  if (f && f in pal) return f;
  const keys = Object.keys(pal); return keys[strHash(ent.uid || ent.name || ent.key) % keys.length];
}
function artResolve(ent, kind){
  if (typeof ent === 'string') ent = {key: ent, look: SPEAKERS[ent]?.look || CHARACTERS[ent]?.look || ent};
  const k = artKey(ent.key, kind);
  if (ART[k]?.[kind]) return k;
  const sp = speciesOf(ent), fur = furOf(ent);
  if (!sp || !fur) return null;
  const cls = ent.cls || CHARACTERS[ent.key]?.cls;
  // bulky rabbit fighters have their own portrait (art/minerbulk-portrait.png)
  if (sp.base === 'miner' && BULKY_CLASSES.includes(cls) && ART['minerbulk' + fur]?.[kind]) return 'minerbulk' + fur;
  // ranged frog soldiers have their own battle pose (art/gruntbow-battle.png)
  const ranged = (ent.w || CLASSES[cls]?.w) === 'bow';
  if (ranged && sp.base === 'grunt' && ART['gruntbow' + fur]?.[kind]) return 'gruntbow' + fur;
  return ART[sp.base + fur]?.[kind] ? sp.base + fur : null;
}
const artFor = (ent, kind) => { const k = artResolve(ent, kind); return k ? ART[k][kind] : undefined; };

// Decoded art for drawing on the map canvas (art/<key>-token.png). Returns null until loaded.
const artImages = {};
function artImage(ent, kind){
  const url = artFor(ent, kind);
  if (!url) return null;
  const id = url;
  if (!artImages[id]){
    const img = new Image();
    img.onload = () => { img.ready = true; if (typeof tokenCache !== 'undefined') tokenCache.clear(); };
    img.src = url; artImages[id] = img;
  }
  return artImages[id].ready ? artImages[id] : null;
}

// Recolour the generic art into every colour of its palette, once, at load. Results become ART['<base><colour>'].
//   miner (rabbits): art/minermask-<kind>.png marks what KEEPS its colour (loincloth, rope, ear linings,
//                    nose, eyes); the rest of the warm fur is recoloured.
//   grunt (frogs):   art/gruntskin-<kind>.png marks the skin to recolour (the head); armour, cloak,
//                    plume and banner stay as drawn.
let furReady = false;
function rgbToHsl(r, g, b){
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn)/2, d = mx - mn;
  if (!d) return [0, 0, l];
  const s = d/(l > .5 ? 2 - mx - mn : mx + mn);
  const h = mx === r ? ((g - b)/d + 6) % 6 : mx === g ? (b - r)/d + 2 : (r - g)/d + 4;
  return [h*60, s, l];
}
function hslToRgb(h, s, l){
  const c = (1 - Math.abs(2*l - 1))*s, x = c*(1 - Math.abs((h/60) % 2 - 1)), m = l - c/2, k = Math.floor(h/60) % 6;
  const [r, g, b] = [[c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x]][k];
  return [r + m, g + m, b + m];
}
const loadImg = url => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
async function maskAlpha(url, W, H){
  const out = new Float32Array(W*H);
  if (!url) return out;
  const mi = await loadImg(url), mc = document.createElement('canvas'); mc.width = W; mc.height = H;
  const mg = mc.getContext('2d'); mg.drawImage(mi, 0, 0, W, H);
  const md = mg.getImageData(0, 0, W, H).data;
  for (let i = 0; i < out.length; i++) out[i] = md[i*4 + 3]/255;
  return out;
}
async function buildVariants(base, palette, weightOf){
  if (!ART[base]) return;
  for (const kind of Object.keys(ART[base])){
    try {
      const img = await loadImg(ART[base][kind]), W = img.naturalWidth, H = img.naturalHeight;
      const c = document.createElement('canvas'); c.width = W; c.height = H;
      const g = c.getContext('2d'); g.drawImage(img, 0, 0);
      const px = g.getImageData(0, 0, W, H).data, n = W*H;
      const w = await weightOf(kind, px, W, H), hsl = new Float32Array(n*3);
      for (let i = 0; i < n; i++){ const [h, s2, l] = rgbToHsl(px[i*4]/255, px[i*4 + 1]/255, px[i*4 + 2]/255); hsl[i*3] = h; hsl[i*3 + 1] = s2; hsl[i*3 + 2] = l; }
      for (const [name, f] of Object.entries(palette)){
        ART[base + name] = ART[base + name] || {};
        if (!f){ ART[base + name][kind] = ART[base][kind]; continue; }
        const [dh, sm, dl] = f, out = new ImageData(new Uint8ClampedArray(px), W, H), o = out.data;
        for (let i = 0; i < n; i++){
          if (w[i] <= 0) continue;
          const l = hsl[i*3 + 2], nl = dl >= 0 ? l + dl*(1 - l) : l*(1 + dl);
          const [r, gg, b] = hslToRgb((hsl[i*3] + dh + 360) % 360, clamp(hsl[i*3 + 1]*sm, 0, 1), nl);
          o[i*4] += (r*255 - o[i*4])*w[i]; o[i*4 + 1] += (gg*255 - o[i*4 + 1])*w[i]; o[i*4 + 2] += (b*255 - o[i*4 + 2])*w[i];
        }
        g.putImageData(out, 0, 0);
        const blob = await new Promise(res => c.toBlob(res, 'image/png'));
        ART[base + name][kind] = blob ? URL.createObjectURL(blob) : c.toDataURL();
      }
    } catch (e){ console.warn('recolour failed for', base, kind, e); }
  }
}
async function buildFurVariants(){
  for (const base of ['miner', 'minerbulk']) await buildVariants(base, FURS, async (kind, px, W, H) => {
    const keep = await maskAlpha(ART[base + 'mask']?.[kind], W, H), w = new Float32Array(W*H);
    for (let i = 0; i < w.length; i++){
      const r = px[i*4], gg = px[i*4 + 1], b = px[i*4 + 2], l = (Math.max(r, gg, b) + Math.min(r, gg, b))/510;
      // fur is warm (red above green); ink outlines are left alone
      w[i] = clamp((r - gg - 6)/12, 0, 1)*clamp((l - .12)/.1, 0, 1)*(1 - keep[i]);
    }
    return w;
  });
  for (const base of ['grunt', 'gruntbow']) await buildVariants(base, SKINS, async (kind, px, W, H) => {
    const skin = await maskAlpha(ART[base + 'skin']?.[kind], W, H), w = new Float32Array(W*H);
    for (let i = 0; i < w.length; i++){
      const r = px[i*4], gg = px[i*4 + 1], b = px[i*4 + 2], mx = Math.max(r, gg, b), mn = Math.min(r, gg, b);
      // colourless pixels (eye highlights) and near-black ink keep their colour
      w[i] = skin[i]*clamp((mx - mn - 18)/20, 0, 1)*clamp(((mx + mn)/510 - .14)/.08, 0, 1);
    }
    return w;
  });
  furReady = true;
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
