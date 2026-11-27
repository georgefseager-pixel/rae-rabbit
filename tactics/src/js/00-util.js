// Shared helpers. tools/build.py concatenates every file in src/js into one closure,
// in filename order, so top-level names declared here are visible everywhere.

const $ = s => document.querySelector(s);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const deepCopy = o => JSON.parse(JSON.stringify(o));
const pick = arr => arr[Math.floor(Math.random()*arr.length)];
const ROMAN = n => { let s = ''; for (const [v, c] of [[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']]) while (n >= v){ s += c; n -= v; } return s; };
function hash(x, y, s = 0){ let h = (x*374761393 + y*668265263 + s*1442695041) | 0; h = Math.imul(h ^ (h>>>13), 1274126177); return ((h ^ (h>>>16)) >>> 0) / 4294967295; }

// Three save slots per viewer. Slot 1 keeps the original key, so saves from before slots became slot 1.
// Browser storage can be missing or throw (private windows, previews), so every access is guarded and the game
// still runs without it. Store.slot is the slot being played (remembered between visits).
const SLOTS = 3;
const Store = {
  slot: (() => { try { return Math.min(SLOTS, Math.max(1, +localStorage.getItem('raepublic-slot') || 1)); } catch (e){ return 1; } })(),
  keyOf: n => n === 1 ? 'raepublic-save-v3' : `raepublic-save-v3-s${n}`,
  get key(){ return this.keyOf(this.slot); },
  use(n){ this.slot = n; try { localStorage.setItem('raepublic-slot', String(n)); } catch (e){} },
  load(n = this.slot){ try { const s = localStorage.getItem(this.keyOf(n)); return s ? JSON.parse(s) : null; } catch (e){ return null; } },
  save(d){ try { localStorage.setItem(this.key, JSON.stringify(d)); } catch (e){} },
  clear(n = this.slot){ try { localStorage.removeItem(this.keyOf(n)); } catch (e){} },
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
function artKey(key, kind, o = outfitOf(key)){ return o && ART[key + o]?.[kind] ? key + o : key; }

// Which art to show for a character or unit. `ent` is a character key, or anything with {key, look, uid, name, fur}.
// Order: the character's own art (in their current outfit), then the shared generic art for their species,
// recoloured into their coat: mine rabbits (art/miner-*.png, colours in FURS) and frog soldiers
// (art/grunt-*.png, skin colours in SKINS).
function strHash(s){ let h = 7; for (const c of String(s)) h = (h*31 + c.charCodeAt(0)) | 0; return Math.abs(h); }
const SPECIES_ART = {bun: {base: 'miner', palette: () => FURS}, frog: {base: 'grunt', palette: () => SKINS}, troop: {base: 'troop', palette: () => FURS},
                     troopxm: {base: 'troop', palette: () => FESTIVE_FURS},   // December: Republic soldiers with festive fur
                     black: {base: 'black', palette: () => SKINS},   // Fraggle's Black Guard (art/black-*.png)
                     elf: {base: 'elf', palette: () => SKINS},
                     mk: {base: 'mk', palette: () => MONKEY_FURS},
                     fish: {base: 'fish', palette: () => FISH_COLOURS},     // the pirate crew (art/fish-*.png)
                     shark: {base: 'shark', palette: () => SHARK_COLOURS}};   // ★★ pirates and named pirates (art/shark-*.png)   // the pirate crew (art/fish-*.png)   // Monkeyland soldiers (art/mk-*.png)       // festive frog scouts in elf green (art/elf-*.png)
function speciesOf(ent){ const L = LOOKS[ent.look]; return SPECIES_ART[L?.art || L?.sp] || null; }
function furOf(ent){
  const sp = speciesOf(ent); if (!sp) return null;
  const pal = sp.palette();
  const f = ent.fur || CHARACTERS[ent.key]?.fur || SPEAKERS[ent.key]?.fur;
  if (f && f in pal) return f;
  const keys = Object.keys(pal); return keys[strHash(ent.uid || ent.name || ent.key) % keys.length];
}
function artResolve(ent, kind){
  if (typeof ent === 'string') ent = {key: ent, look: SPEAKERS[ent]?.look || CHARACTERS[ent]?.look || ent};
  // a unit or record wearing an attire shows it; a speaker named in a story scene (a plain key) shows the canonical outfit
  const at = typeof ATTIRES !== 'undefined' && ATTIRES[ent.attire];
  const k = at ? artKey(ent.key, kind, at.outfit) : artKey(ent.key, kind);
  if (ART[k]?.[kind]) return k;
  // a character can borrow another's art for what it doesn't have (Fraggle Jr. fights in his father's sprite)
  const from = CHARACTERS[ent.key]?.artFrom || SPEAKERS[ent.key]?.artFrom; if (from && ART[from]?.[kind]) return from;
  const sp = speciesOf(ent), fur = furOf(ent);
  if (!sp || !fur) return null;
  const cls = ent.cls || CHARACTERS[ent.key]?.cls;
  // bulky rabbit fighters have their own portrait (art/minerbulk-portrait.png)
  const ranged = (ent.w || CLASSES[cls]?.w) === 'bow';
  // ranged rabbits all share the slinger battle pose (art/minersling-battle.png), whatever their portrait
  if (sp.base === 'miner' && ranged && ART['minersling' + fur]?.[kind]) return 'minersling' + fur;
  const standard = CHARACTERS[ent.key]?.generic === 'standard';   // forced onto the first generic look
  if (sp.base === 'miner' && !standard && BULKY_CLASSES.includes(cls) && ART['minerbulk' + fur]?.[kind]) return 'minerbulk' + fur;
  // elderly rabbits have their own portrait (art/minerold-portrait.png)
  // generic rabbits (recruits, enemies) that aren't bulky are elderly about one time in three, fixed per rabbit
  const generic = ent.key === 'recruit' || ent.key === 'enemy';
  const elderly = !standard && (CHARACTERS[ent.key]?.elderly || SPEAKERS[ent.key]?.elderly || ELDERLY_CLASSES.includes(cls)
    || (generic && !BULKY_CLASSES.includes(cls) && strHash((ent.uid || ent.name) + '|age') % 3 === 0));
  if (sp.base === 'miner' && elderly && ART['minerold' + fur]?.[kind]) return 'minerold' + fur;
  if (sp.base === 'troop'){
    const T = 'troop';
    // Republic soldiers: one portrait and map icon, and a battle pose for each weapon (art/troop<weapon>-battle.png).
    // ★★ (elite) soldiers wear the plumed helmet: art/troopelite*-*.png (no bow pose: elite archers use the plain one).
    const e = (ent.stars ?? ent.rec?.stars) === 2 ? 'elite' : '';
    const pose = kind === 'battle' && {axe: 'axe', lance: 'lance', bow: 'bow', tome: 'book', staff: 'staff'}[ent.w || CLASSES[cls]?.w];
    if (pose && ART[T + e + pose + fur]?.[kind]) return T + e + pose + fur;
    if (pose && ART[T + pose + fur]?.[kind]) return T + pose + fur;
    if (ART[T + e + fur]?.[kind]) return T + e + fur;
  }
  if (sp.base === 'black'){
    // Fraggle's Black Guard: one portrait and map icon, and a battle pose for each weapon (art/black<weapon>-battle.png; swords use black-battle.png).
    // ★★ (elite) guards wear the closed helm: the same set as art/blackelite*-*.png.
    const e = (ent.stars ?? ent.rec?.stars) === 2 ? 'elite' : '';
    const pose = kind === 'battle' && {axe: 'axe', lance: 'lance', tome: 'book', staff: 'staff'}[ent.w || CLASSES[cls]?.w];
    if (pose && ART['black' + e + pose + fur]?.[kind]) return 'black' + e + pose + fur;
    if (ART['black' + e + fur]?.[kind]) return 'black' + e + fur;
  }
  if (sp.base === 'mk'){
    // Monkeyland soldiers: one portrait and map icon, and a battle pose for each weapon (art/mk<weapon>-battle.png;
    // swords use mk-battle.png, and the healers read from a book like the scribes)
    // ★★ (elite) monkeys wear the gilded armour and the scar: the same set as art/mkelite*-*.png
    const e = (ent.stars ?? ent.rec?.stars) === 2 ? 'elite' : '';
    const pose = kind === 'battle' && {axe: 'axe', lance: 'lance', bow: 'bow', tome: 'book', staff: 'book'}[ent.w || CLASSES[cls]?.w] || '';
    if (ART['mk' + e + pose + fur]?.[kind]) return 'mk' + e + pose + fur;
    if (ART['mk' + e + fur]?.[kind]) return 'mk' + e + fur;
    if (ART['mk' + pose + fur]?.[kind]) return 'mk' + pose + fur;
    if (ART['mk' + fur]?.[kind]) return 'mk' + fur;
  }
  if (sp.base === 'fish' || sp.base === 'shark'){
    // the pirates: one portrait and map icon, and a battle pose for each weapon (art/fish<weapon>-battle.png; swords use
    // fish-battle.png). ★★ (elite) pirates are sharks, in a shark colour of their own (art/shark*-*.png); so are named pirates.
    const elite = sp.base === 'shark' || (ent.stars ?? ent.rec?.stars) === 2;
    const base = elite ? 'shark' : 'fish', col = elite && sp.base === 'fish' ? Object.keys(SHARK_COLOURS)[strHash(ent.uid || ent.name || ent.key) % Object.keys(SHARK_COLOURS).length] : fur;
    // hooks: art/fishhook-battle.png and art/sharkhook-battle.png (a set without a hook pose would borrow its lance pose)
    const pose = kind === 'battle' && {axe: 'axe', lance: 'lance', bow: 'bow', tome: 'book', staff: 'staff', hook: ART[base + 'hook'] ? 'hook' : 'lance'}[ent.w || CLASSES[cls]?.w] || '';
    if (ART[base + pose + col]?.[kind]) return base + pose + col;
    if (ART[base + col]?.[kind]) return base + col;
  }
  if (sp.base === 'elf'){
    // December frog scouts (the couriers, and the festive banner's soldiers): a battle pose for each weapon
    // (art/elf<weapon>-battle.png; swords and staves use elf-battle.png). ★★ wear Santa red: built at load from art/elf*armour-*.png.
    const e = (ent.stars ?? ent.rec?.stars) === 2 ? 'elite' : '';
    const pose = kind === 'battle' && {axe: 'axe', lance: 'lance', bow: 'bow', tome: 'book'}[ent.w || CLASSES[cls]?.w] || '';
    if (ART['elf' + pose + e + fur]?.[kind]) return 'elf' + pose + e + fur;
    if (ART['elf' + e + fur]?.[kind]) return 'elf' + e + fur;
  }
  if (sp.base === 'grunt'){
    // ★★ frog soldiers wear red (elite) armour: art built from art/grunt*armour-*.png at load
    const e = (ent.stars ?? ent.rec?.stars) === 2 ? 'elite' : '';
    // ranged frog soldiers have their own battle pose (art/gruntbow-battle.png)
    if (ranged && ART['gruntbow' + e + fur]?.[kind]) return 'gruntbow' + e + fur;
    if (ART['grunt' + e + fur]?.[kind]) return 'grunt' + e + fur;
  }
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
//                    nose, eyes); the rest of the warm fur is recoloured. Republic soldiers (troop*) work the same
//                    way: art/troop*mask-<kind>.png keeps the armour, cloth, leather, weapons and ear linings.
//   grunt (frogs):   art/gruntskin-<kind>.png marks the skin to recolour (the head); armour, cloak,
//                    (Fraggle's Black Guard, black*, likewise from art/black*skin-<kind>.png)
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
  loadReport(65 + 34*Math.min(1, ++variantsDone/VARIANT_SETS));
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
        // [hue shift, saturation ×, lightness shift], or {h, s, l}: set the hue and saturation outright (for near-grey felt)
        const set = !Array.isArray(f), [dh, sm, dl] = set ? [0, 1, f.l || 0] : f, out = new ImageData(new Uint8ClampedArray(px), W, H), o = out.data;
        for (let i = 0; i < n; i++){
          if (w[i] <= 0) continue;
          const l = hsl[i*3 + 2], nl = dl >= 0 ? l + dl*(1 - l) : l*(1 + dl);
          const [r, gg, b] = set ? hslToRgb(f.h, f.s, nl) : hslToRgb((hsl[i*3] + dh + 360) % 360, clamp(hsl[i*3 + 1]*sm, 0, 1), nl);
          o[i*4] += (r*255 - o[i*4])*w[i]; o[i*4 + 1] += (gg*255 - o[i*4 + 1])*w[i]; o[i*4 + 2] += (b*255 - o[i*4 + 2])*w[i];
        }
        g.putImageData(out, 0, 0);
        const blob = await new Promise(res => c.toBlob(res, 'image/png'));
        ART[base + name][kind] = blob ? URL.createObjectURL(blob) : c.toDataURL();
      }
    } catch (e){ console.warn('recolour failed for', base, kind, e); }
  }
}
async function buildEliteArmour(base, tone = l => l*.95, sat = s => s*1.25 + .08){
  loadReport(65 + 34*Math.min(1, ++variantsDone/VARIANT_SETS));
  if (!ART[base]) return;
  ART[base + 'elite'] = {};
  for (const kind of Object.keys(ART[base])){
    try {
      const img = await loadImg(ART[base][kind]), W = img.naturalWidth, H = img.naturalHeight;
      const c = document.createElement('canvas'); c.width = W; c.height = H;
      const g = c.getContext('2d'); g.drawImage(img, 0, 0);
      const data = g.getImageData(0, 0, W, H), px = data.data, m = await maskAlpha(ART[base + 'armour']?.[kind], W, H);
      for (let i = 0; i < W*H; i++){
        if (m[i] <= 0) continue;
        const [, s, l] = rgbToHsl(px[i*4]/255, px[i*4 + 1]/255, px[i*4 + 2]/255);
        const [r, gg, b] = hslToRgb(356, clamp(sat(s), 0, 1), tone(l));
        px[i*4] += (r*255 - px[i*4])*m[i]; px[i*4 + 1] += (gg*255 - px[i*4 + 1])*m[i]; px[i*4 + 2] += (b*255 - px[i*4 + 2])*m[i];
      }
      g.putImageData(data, 0, 0);
      const blob = await new Promise(res => c.toBlob(res, 'image/png'));
      ART[base + 'elite'][kind] = blob ? URL.createObjectURL(blob) : c.toDataURL();
    } catch (e){ console.warn('elite armour failed for', base, kind, e); }
  }
}
const loadReport = (v, text) => window.__load?.(v, text);   // the loading screen's bar (shell.html)
let variantsDone = 0;
const VARIANT_SETS = 9 + 5 + 2 + 14;   // the buildVariants / buildEliteArmour calls below, for the loading bar
// mine rabbits and Republic soldiers: the warm fur, outside the keep mask
const furWeight = (base) => async (kind, px, W, H) => {
    const keep = await maskAlpha(ART[base + 'mask']?.[kind], W, H), w = new Float32Array(W*H);
    for (let i = 0; i < w.length; i++){
      const r = px[i*4], gg = px[i*4 + 1], b = px[i*4 + 2], l = (Math.max(r, gg, b) + Math.min(r, gg, b))/510;
      // fur is warm (red above green); ink outlines are left alone
      w[i] = clamp((r - gg - 6)/12, 0, 1)*clamp((l - .12)/.1, 0, 1)*(1 - keep[i]);
    }
    return w;
  };
// frogs: the skin, from art/<base>skin-<kind>.png (★★ grunts reuse the plain grunt masks)
const skinWeight = (base) => async (kind, px, W, H) => {
  // the elite grunts reuse the plain grunt masks; the elite Black Guard have masks of their own
  const skin = await maskAlpha(ART[(ART[base + 'skin'] ? base : base.replace('elite', '')) + 'skin']?.[kind], W, H), w = new Float32Array(W*H);
  for (let i = 0; i < w.length; i++){
    const r = px[i*4], gg = px[i*4 + 1], b = px[i*4 + 2], mx = Math.max(r, gg, b), mn = Math.min(r, gg, b);
    // colourless pixels (eye highlights) and near-black ink keep their colour
    w[i] = skin[i]*clamp((mx - mn - 18)/20, 0, 1)*clamp(((mx + mn)/510 - .14)/.08, 0, 1);
  }
  return w;
};
// the pirate fish: the mask alone (their felt is nearly grey, so there is no colourfulness test), keeping near-black ink
const fishWeight = (base) => async (kind, px, W, H) => {
  const skin = await maskAlpha(ART[base + 'skin']?.[kind], W, H), w = new Float32Array(W*H);
  for (let i = 0; i < w.length; i++){ const mx = Math.max(px[i*4], px[i*4 + 1], px[i*4 + 2]); w[i] = skin[i]*clamp((mx/255 - .12)/.1, 0, 1); }
  return w;
};
const TROOP_BASES = ['troop', 'troopaxe', 'trooplance', 'troopbow', 'troopbook', 'troopelite', 'troopeliteaxe', 'troopelitelance', 'troopelitebook', 'troopelitestaff'];
// December soldiers (festive-furred Republic troops, and the frog elf scouts elf*) are only dyed when they can be seen: in December, or once you have recruited some.
// Turning on Debug: December dyes them then.
const festiveNeeded = () => (typeof eventActive === 'function' && eventActive('december')) || Object.values(SAVE?.camps || {}).some(c => (c.roster || []).some(r => ['soldierxm', 'courier'].includes(CLASS_LOOK[r.cls])));
let festiveBuilt = null;
function buildFestiveTroops(){
  return festiveBuilt ||= (async () => {
    for (const base of TROOP_BASES) await buildVariants(base, FESTIVE_FURS, furWeight(base));   // Republic soldiers with festive fur
    // the frog scouts in elf green; ★★ hat and coat turned Santa red (lifted a little: the green felt is dark)
    const elves = ['elf', 'elfaxe', 'elflance', 'elfbow', 'elfbook'];
    for (const base of elves) await buildEliteArmour(base, l => clamp(l*1.35 + .07, 0, .6), s => s*1.7 + .25);
    for (const base of elves.flatMap(b => [b, b + 'elite'])) await buildVariants(base, SKINS, skinWeight(base));
  })();
}
async function buildFurVariants(){
  loadReport(65, 'Dyeing the soldiers\u2019 coats…');
  const troops = TROOP_BASES;
  for (const base of ['miner', 'minerbulk', 'minerold', 'minersling', ...troops]) await buildVariants(base, FURS, furWeight(base));
  if (festiveNeeded()) await buildFestiveTroops();
  // Elite (★★) frog art: the green armour, cloak, plume and banner turned red, before the skin colours.
  for (const base of ['grunt', 'gruntbow']) await buildEliteArmour(base);
  // Fraggle's Black Guard (black*) recolour the same way, from art/black*skin-<kind>.png.
  const black = ['', 'axe', 'lance', 'book', 'staff'].flatMap(p => ['black' + p, 'blackelite' + p]);
  for (const base of ['grunt', 'gruntbow', 'gruntelite', 'gruntbowelite', ...black]) await buildVariants(base, SKINS, skinWeight(base));
  furReady = true; loadReport(100);
  // Monkeyland soldiers (Chapter Three on): their fur colours (art/mk*skin-<kind>.png) are made after the loading
  // screen, in the background, so they don't slow the start. Until then they show as felt plush.
  (async () => { for (const base of ['mk', 'mkaxe', 'mklance', 'mkbow', 'mkbook', 'mkelite', 'mkeliteaxe', 'mkelitelance', 'mkelitebow', 'mkelitebook']) await buildVariants(base, MONKEY_FURS, skinWeight(base));
    // the pirate fish (Chapter Four): the skin, fins and tail from art/fish*skin-<kind>.png
    for (const base of ['fish', 'fishaxe', 'fishlance', 'fishbow', 'fishbook', 'fishstaff', 'fishhook']) await buildVariants(base, FISH_COLOURS, fishWeight(base));
    for (const base of ['shark', 'sharkaxe', 'sharklance', 'sharkbow', 'sharkbook', 'sharkstaff', 'sharkhook']) await buildVariants(base, SHARK_COLOURS, fishWeight(base));
    if (typeof tokenCache !== 'undefined') tokenCache.clear(); })();
}

function toast(msg){
  const t = $('#toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(toast.tm); toast.tm = setTimeout(() => { t.hidden = true; }, 2200);
}

// Two-tap confirmation for destructive buttons (the viewer has no confirm() dialog).
function armed(btn, label){
  if (btn.dataset.armed){ delete btn.dataset.armed; return true; }   // (the label is put back by the timer below)
  // the confirmation is usually longer than the label: keep the button's size, and shrink the text until it fits
  const orig = btn.textContent, r = btn.getBoundingClientRect();
  btn.dataset.armed = '1'; btn.style.width = r.width + 'px'; btn.style.height = r.height + 'px'; btn.textContent = label;
  btn.classList.add('armed');
  let fs = parseFloat(getComputedStyle(btn).fontSize) || 16;
  while (fs > 9 && (btn.scrollWidth > btn.clientWidth + 1 || btn.scrollHeight > btn.clientHeight + 1)){ fs -= 0.5; btn.style.fontSize = fs + 'px'; }
  const reset = () => { btn.textContent = orig; btn.classList.remove('armed'); btn.style.width = btn.style.height = btn.style.fontSize = ''; };
  setTimeout(() => { if (btn.dataset.armed){ delete btn.dataset.armed; reset(); } }, 2500);
  return false;
}
