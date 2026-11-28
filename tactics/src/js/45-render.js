// ================= Map rendering =================
const cvs = $('#cv'), ctx = cvs.getContext('2d'), boardEl = $('#board');
let T = 40, dpr = 1, terrCv = document.createElement('canvas'), tokenCache = new Map(), noisePat = null;
const isWater = (x, y) => inBounds(x, y) && (MAP[y][x] === 'W' || MAP[y][x] === 'B');

function resize(){
  if (!B) return;
  const r = boardEl.getBoundingClientRect();
  if (!r.width || !r.height) return;
  const fit = Math.min(r.width/COLS, r.height/ROWS);
  // bigger maps start zoomed in to comfortable tiles (about 44px); small maps fit the screen
  if (mapZoom == null) mapZoom = clamp(44/fit, 1, 2.2);
  T = Math.max(20, Math.floor(fit*mapZoom));
  // cap the canvas size (phones refuse very large canvases)
  dpr = Math.min(3, window.devicePixelRatio || 1, Math.sqrt(12e6/(COLS*T*ROWS*T)));
  refreshZoomButtons?.();
  cvs.width = COLS*T*dpr; cvs.height = ROWS*T*dpr;
  cvs.style.width = COLS*T + 'px'; cvs.style.height = ROWS*T + 'px';
  terrCv.width = cvs.width; terrCv.height = cvs.height; tokenCache.clear();
  const g = terrCv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++){ drawTile(g, x, y, MAP[y][x]); if (mapDef?.theme === 'snow') snowOver(g, x, y, MAP[y][x]); if (mapDef?.theme === 'blossom') blossomOver(g, x, y, MAP[y][x]); if (mapDef?.theme === 'castle') castleOver(g, x, y, MAP[y][x]); if (mapDef?.theme === 'shore') shoreOver(g, x, y, MAP[y][x]); if (mapDef?.theme === 'arena') arenaOver(g, x, y, MAP[y][x]); if (mapDef?.theme === 'ship') deckOver(g, x, y, MAP[y][x]); }
  if (!noisePat){
    const n = document.createElement('canvas'); n.width = n.height = 96; const ng = n.getContext('2d');
    for (let i = 0; i < 1400; i++){ ng.fillStyle = Math.random() < .5 ? 'rgba(0,0,0,.18)' : 'rgba(255,245,220,.12)'; ng.fillRect(Math.random()*96, Math.random()*96, 1, Math.random()*2 + .5); }
    noisePat = n;
  }
  g.globalAlpha = .55; g.fillStyle = g.createPattern(noisePat, 'repeat'); g.fillRect(0, 0, COLS*T, ROWS*T); g.globalAlpha = 1;
  const v = g.createRadialGradient(COLS*T/2, ROWS*T/2, Math.min(COLS, ROWS)*T*.45, COLS*T/2, ROWS*T/2, ROWS*T*.72);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(20,8,4,.5)'); g.fillStyle = v; g.fillRect(0, 0, COLS*T, ROWS*T);
  if (!$('#app').hidden) render(performance.now());   // paint straight away: a resized canvas is blank until the next frame
}
function patch(g, X, Y, base, x, y){
  g.fillStyle = base; g.fillRect(X, Y, T, T);
  const h = hash(x, y, 9);
  g.save(); g.beginPath(); g.rect(X, Y, T, T); g.clip();
  if (h < .3){ g.fillStyle = 'rgba(255,255,230,.07)'; for (let i = 0; i < 3; i++){ g.fillRect(X + i*T/3 + T/12, Y, T/6, T); g.fillRect(X, Y + i*T/3 + T/12, T, T/6); } }
  else if (h < .55){ g.strokeStyle = 'rgba(0,0,0,.1)'; g.lineWidth = Math.max(1, T/22); for (let i = 1; i < 10; i++){ g.beginPath(); g.moveTo(X + i*T/10, Y); g.lineTo(X + i*T/10, Y + T); g.stroke(); } }
  else if (h < .75){ g.fillStyle = 'rgba(255,240,200,.13)'; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++){ ell(g, X + (i + .5 + (j % 2)*.5)*T/4, Y + (j + .5)*T/4, T*.03, T*.03); g.fill(); } }
  g.restore();
  g.strokeStyle = 'rgba(15,22,8,.45)'; g.lineWidth = 1.5; g.strokeRect(X + .75, Y + .75, T - 1.5, T - 1.5);
  g.save(); g.setLineDash([T*.09, T*.07]); g.lineWidth = Math.max(1, T*.028); g.strokeStyle = 'rgba(240,228,200,.42)';
  g.strokeRect(X + T*.07, Y + T*.07, T*.86, T*.86); g.restore();
}
function hump(g, cx, base, rx, ry, col, stitchCol){
  g.fillStyle = col; g.beginPath(); g.ellipse(cx, base, rx, ry, 0, Math.PI, 0); g.closePath(); g.fill();
  g.save(); g.beginPath(); g.ellipse(cx, base, rx*.86, ry*.84, 0, Math.PI*1.08, Math.PI*1.92); g.setLineDash([T*.06, T*.05]); g.lineWidth = Math.max(1, T*.025); g.strokeStyle = stitchCol; g.stroke(); g.restore();
}
function drawTile(g, x, y, ch){
  const X = x*T, Y = y*T, greens = ['#5d8a43', '#67944b', '#557f3d', '#6e9a52'];
  if (ch === 'W' || ch === 'B'){
    const wg = g.createLinearGradient(0, Y, 0, Y + T); wg.addColorStop(0, '#2a5582'); wg.addColorStop(.5, '#3c78ad'); wg.addColorStop(1, '#2a5582');
    g.fillStyle = wg; g.fillRect(X, Y, T, T);
    g.strokeStyle = 'rgba(255,255,255,.17)'; g.lineWidth = Math.max(1, T*.035);
    for (let i = 0; i < 3; i++){ g.beginPath(); for (let k = 0; k <= 12; k++){ const px = X + k*T/12, py = Y + T*(.22 + .28*i) + Math.sin((px/T)*4.2 + i*2)*T*.05; k ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke(); }
    g.save(); g.setLineDash([T*.09, T*.07]); g.lineWidth = Math.max(1, T*.03); g.strokeStyle = 'rgba(240,228,200,.6)';
    if (!isWater(x, y - 1)){ g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(X, Y, T, T*.08); g.beginPath(); g.moveTo(X, Y + T*.13); g.lineTo(X + T, Y + T*.13); g.stroke(); }
    if (!isWater(x, y + 1)){ g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(X, Y + T*.94, T, T*.06); g.beginPath(); g.moveTo(X, Y + T*.87); g.lineTo(X + T, Y + T*.87); g.stroke(); }
    if (!isWater(x - 1, y) && x > 0){ g.beginPath(); g.moveTo(X + T*.13, Y); g.lineTo(X + T*.13, Y + T); g.stroke(); }
    if (!isWater(x + 1, y) && x < COLS - 1){ g.beginPath(); g.moveTo(X + T*.87, Y); g.lineTo(X + T*.87, Y + T); g.stroke(); }
    g.restore();
    if (ch === 'B'){
      g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(X + T*.14, Y, T*.76, T);
      for (let i = 0; i < 5; i++){
        const py = Y + i*T/5 + T*.015, ph = T/5 - T*.03;
        g.fillStyle = i % 2 ? '#d7ab6a' : '#cf9f5c'; g.beginPath(); g.roundRect ? g.roundRect(X + T*.12, py, T*.76, ph, ph/2) : g.rect(X + T*.12, py, T*.76, ph); g.fill();
        g.strokeStyle = 'rgba(120,80,40,.45)'; g.lineWidth = 1; g.beginPath(); g.moveTo(X + T*.2, py + ph*.55); g.lineTo(X + T*.8, py + ph*.45); g.stroke();
      }
      g.strokeStyle = '#7a5530'; g.lineWidth = Math.max(1.5, T*.05);
      for (const rx of [.1, .9]){ g.beginPath(); g.moveTo(X + T*rx, Y); g.lineTo(X + T*rx, Y + T); g.stroke(); }
    }
    return;
  }
  const theme = mapDef?.theme || 'meadow';
  if (theme !== 'meadow' && theme !== 'snow' && theme !== 'blossom' && theme !== 'shore') return drawThemedTile(g, x, y, ch, ['castle', 'arena', 'ship'].includes(theme) ? 'camp' : theme);
  const base = ch === 'F' ? '#4a7838' : ch === 'M' ? '#6d7550' : ch === 'X' ? '#4a3b2c' : greens[Math.floor(hash(x, y)*4)];
  patch(g, X, Y, base, x, y);
  if (ch === 'F'){
    for (const [a, b, sc] of [[.3, .5, .95], [.72, .42, 1.05], [.52, .86, .8]]){
      const cx = X + T*a, cy = Y + T*b, h = T*.36*sc, w = T*.2*sc;
      g.fillStyle = 'rgba(0,0,0,.25)'; ell(g, cx + T*.03, cy + h*.12, w*.9, h*.12); g.fill();
      g.fillStyle = '#6b4a2e'; g.fillRect(cx - T*.025, cy - h*.05, T*.05, h*.16);
      g.fillStyle = hash(x, y, a*10) < .5 ? '#2c5a33' : '#346a3b';
      g.beginPath(); g.moveTo(cx, cy - h); g.quadraticCurveTo(cx + w*1.3, cy - h*.05, cx + w*.2, cy); g.lineTo(cx - w*.2, cy); g.quadraticCurveTo(cx - w*1.3, cy - h*.05, cx, cy - h); g.fill();
      g.save(); g.setLineDash([T*.045, T*.04]); g.lineWidth = Math.max(.8, T*.022); g.strokeStyle = 'rgba(200,230,170,.55)';
      g.beginPath(); g.moveTo(cx, cy - h*.82); g.lineTo(cx, cy - h*.1); g.stroke(); g.restore();
      if (hash(x, y, b*20) < .35){ g.fillStyle = '#c0392b'; ell(g, cx + w*.35, cy - h*.35, T*.03, T*.03); g.fill(); }
    }
  }
  if (ch === 'M'){
    hump(g, X + T*.62, Y + T*.84, T*.38, T*.6, '#8e8a83', 'rgba(60,55,50,.6)');
    g.fillStyle = '#f1ece0'; g.beginPath(); g.ellipse(X + T*.62, Y + T*.84, T*.38, T*.6, 0, Math.PI*1.32, Math.PI*1.68); g.lineTo(X + T*.62, Y + T*.5); g.closePath(); g.fill();
    hump(g, X + T*.33, Y + T*.9, T*.3, T*.42, '#aaa59b', 'rgba(70,65,58,.55)');
  }
  if (ch === 'X'){
    // two cotton reels: wooden flanges with wound thread between
    const threads = ['#b5302a', '#2e3d66', '#c9973f', '#e8dcc0', '#4c6e2a', '#6b4a8a'];
    for (const [a, w] of [[.28, .38], [.72, .38]]){
      const cx = X + T*a, top = Y + T*.14, bot = Y + T*.86, rw = T*w/2;
      g.fillStyle = 'rgba(0,0,0,.3)'; ell(g, cx + T*.03, bot + T*.03, rw*1.05, T*.06); g.fill();
      g.fillStyle = threads[Math.floor(hash(x, y, a*7)*threads.length)]; g.fillRect(cx - rw*.78, top + T*.06, rw*1.56, bot - top - T*.12);
      g.strokeStyle = 'rgba(0,0,0,.2)'; g.lineWidth = 1;
      for (let i = 1; i < 9; i++){ const yy = top + T*.06 + i*(bot - top - T*.12)/9; g.beginPath(); g.moveTo(cx - rw*.78, yy); g.lineTo(cx + rw*.78, yy + T*.02); g.stroke(); }
      g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(cx - rw*.6, top + T*.06, rw*.25, bot - top - T*.12);
      for (const yy of [top, bot]){ g.fillStyle = '#b58a5a'; ell(g, cx, yy, rw, T*.07); g.fill(); g.fillStyle = '#d7ad7a'; ell(g, cx, yy - T*.015, rw*.85, T*.045); g.fill(); }
      g.fillStyle = '#5a3f24'; ell(g, cx, top - T*.015, rw*.22, T*.02); g.fill();
    }
  }
  if (ch === 'T'){
    const f = FACTIONS[fortOwner.get(K(x, y)) || 'rae'];
    const blk = (bx, by, bw, bh, c, top) => {
      g.fillStyle = c; g.fillRect(X + bx*T, Y + by*T, bw*T, bh*T);
      g.fillStyle = 'rgba(255,255,255,.22)'; g.fillRect(X + bx*T, Y + by*T, bw*T, T*.035);
      g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(X + (bx + bw)*T - T*.035, Y + by*T, T*.035, bh*T);
      if (top) for (let i = 0; i < 2; i++){ g.fillStyle = c; g.fillRect(X + (bx + i*bw*.6)*T, Y + (by - .08)*T, bw*.4*T, .08*T); }
    };
    g.fillStyle = 'rgba(0,0,0,.3)'; ell(g, X + T*.5, Y + T*.88, T*.42, T*.08); g.fill();
    blk(.1, .34, .26, .54, f.fort[0], true); blk(.64, .34, .26, .54, f.fort[1], true); blk(.33, .48, .34, .4, '#e9dcc0');
    g.fillStyle = '#3a2a1e'; g.beginPath(); g.arc(X + T*.5, Y + T*.74, T*.09, Math.PI, 0); g.lineTo(X + T*.59, Y + T*.88); g.lineTo(X + T*.41, Y + T*.88); g.closePath(); g.fill();
    g.fillStyle = f.fort[0]; g.font = `${Math.round(T*.16)}px 'Saira Stencil One', Impact, sans-serif`; g.textAlign = 'center'; g.fillText(f.letter, X + T*.5, Y + T*.62);
    g.strokeStyle = '#3a2a1e'; g.lineWidth = Math.max(1, T*.025); g.beginPath(); g.moveTo(X + T*.77, Y + T*.26); g.lineTo(X + T*.77, Y + T*.02); g.stroke();
    g.fillStyle = f.band; g.beginPath(); g.moveTo(X + T*.77, Y + T*.03); g.lineTo(X + T*.98, Y + T*.08); g.lineTo(X + T*.77, Y + T*.15); g.closePath(); g.fill();
  }
}

// Mine and camp tiles: felt rocks, crates, ore heaps and palisades instead of meadow and spools.
function drawFort(g, X, Y, x, y){
  const f = FACTIONS[fortOwner.get(K(x, y)) || 'rae'];
  const blk = (bx, by, bw, bh, c, top) => {
    g.fillStyle = c; g.fillRect(X + bx*T, Y + by*T, bw*T, bh*T);
    g.fillStyle = 'rgba(255,255,255,.22)'; g.fillRect(X + bx*T, Y + by*T, bw*T, T*.035);
    g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(X + (bx + bw)*T - T*.035, Y + by*T, T*.035, bh*T);
    if (top) for (let i = 0; i < 2; i++){ g.fillStyle = c; g.fillRect(X + (bx + i*bw*.6)*T, Y + (by - .08)*T, bw*.4*T, .08*T); }
  };
  g.fillStyle = 'rgba(0,0,0,.3)'; ell(g, X + T*.5, Y + T*.88, T*.42, T*.08); g.fill();
  blk(.1, .34, .26, .54, f.fort[0], true); blk(.64, .34, .26, .54, f.fort[1], true); blk(.33, .48, .34, .4, '#e9dcc0');
  g.fillStyle = '#3a2a1e'; g.beginPath(); g.arc(X + T*.5, Y + T*.74, T*.09, Math.PI, 0); g.lineTo(X + T*.59, Y + T*.88); g.lineTo(X + T*.41, Y + T*.88); g.closePath(); g.fill();
  g.fillStyle = f.fort[0]; g.font = `${Math.round(T*.16)}px 'Saira Stencil One', Impact, sans-serif`; g.textAlign = 'center'; g.fillText(f.letter, X + T*.5, Y + T*.62);
  g.strokeStyle = '#3a2a1e'; g.lineWidth = Math.max(1, T*.025); g.beginPath(); g.moveTo(X + T*.77, Y + T*.26); g.lineTo(X + T*.77, Y + T*.02); g.stroke();
  g.fillStyle = f.band; g.beginPath(); g.moveTo(X + T*.77, Y + T*.03); g.lineTo(X + T*.98, Y + T*.08); g.lineTo(X + T*.77, Y + T*.15); g.closePath(); g.fill();
}
function stones(g, X, Y, list, cols, stitch){
  list.forEach(([a, b, r], i) => {
    g.fillStyle = 'rgba(0,0,0,.28)'; ell(g, X + T*a + T*.02, Y + T*b + T*.03, T*r, T*r*.75); g.fill();
    g.fillStyle = cols[i % cols.length]; ell(g, X + T*a, Y + T*b, T*r, T*r*.78); g.fill();
    g.fillStyle = 'rgba(255,255,255,.12)'; ell(g, X + T*a - T*r*.3, Y + T*b - T*r*.3, T*r*.4, T*r*.25); g.fill();
    g.beginPath(); g.ellipse(X + T*a, Y + T*b, T*r*.82, T*r*.62, 0, 0, Math.PI*2); stitchStroke(g, stitch, T*.45, .7);
  });
}
// Snow: the meadow tile under a white blanket, with snow caps on trees and drifts
// Monkeyland: stitched daisies in the grass, and pink blossom on every tree
function blossomOver(g, x, y, ch){
  const X = x*T, Y = y*T, cols = ['#fff6f0', '#ffd6e2', '#ffe58a', '#f4a6c4'];
  if (ch === '.' || ch === 'B') for (let i = 0; i < 3; i++){
    const fx = X + T*(.12 + .76*hash(x, y, i + 50)), fy = Y + T*(.12 + .76*hash(x, y, i + 60)), r = T*.035;
    g.fillStyle = cols[Math.floor(hash(x, y, i + 70)*cols.length)];
    for (let k = 0; k < 5; k++){ const a = k*Math.PI*2/5; ell(g, fx + Math.cos(a)*r, fy + Math.sin(a)*r, r*.8, r*.8); g.fill(); }
    g.fillStyle = '#e8a33a'; ell(g, fx, fy, r*.6, r*.6); g.fill();
  }
  if (ch === 'F') for (let i = 0; i < 9; i++){
    g.fillStyle = i % 3 ? 'rgba(248,168,198,.92)' : 'rgba(255,226,236,.95)';
    ell(g, X + T*(.18 + .64*hash(x, y, i + 80)), Y + T*(.12 + .5*hash(x, y, i + 90)), T*.06, T*.05); g.fill();
  }
}
// the castle: a cool grey wash over the camp-style ground, so it reads as stone
function castleOver(g, x, y, ch){
  const X = x*T, Y = y*T;
  if (ch === '.' || ch === 'T' || ch === 'F'){ g.fillStyle = 'rgba(150,150,165,.42)'; g.fillRect(X, Y, T, T);
    g.strokeStyle = 'rgba(60,60,70,.25)'; g.lineWidth = 1; g.strokeRect(X + .5, Y + .5, T/2, T/2); g.strokeRect(X + T/2 + .5, Y + T/2 + .5, T/2 - 1, T/2 - 1); }
  if (ch === 'X' || ch === 'M'){ g.fillStyle = 'rgba(140,140,155,.62)'; g.fillRect(X, Y, T, T); g.strokeStyle = 'rgba(50,50,60,.4)'; g.lineWidth = 1;
    for (let r = 0; r < 3; r++){ const yy = Y + T*(r + 1)/3; g.beginPath(); g.moveTo(X, yy); g.lineTo(X + T, yy); g.stroke(); const xx = X + T*(r % 2 ? .25 : .65); g.beginPath(); g.moveTo(xx, yy - T/3); g.lineTo(xx, yy); g.stroke(); } }
  if (ch === 'F') for (let i = 0; i < 5; i++){ g.fillStyle = i % 2 ? '#f4a6c4' : '#ffe58a'; ell(g, X + T*(.3 + .4*hash(x, y, i + 30)), Y + T*(.2 + .3*hash(x, y, i + 40)), T*.06, T*.06); g.fill(); }
}
// the shore: pale sand over the meadow; dune grass stays green, rocks go grey-blue, cliffs go dark
function shoreOver(g, x, y, ch){
  const X = x*T, Y = y*T;
  if (ch === 'W' || ch === 'B'){ g.fillStyle = 'rgba(40,150,160,.22)'; g.fillRect(X, Y, T, T);   // a greener, seaside blue
    if (ch === 'W' && hash(x, y, 3) < .5){ g.fillStyle = 'rgba(255,255,255,.55)'; ell(g, X + T*(.2 + .6*hash(x, y, 4)), Y + T*(.25 + .5*hash(x, y, 5)), T*.08, T*.025); g.fill(); }
    return; }
  if (ch === '.' || ch === 'T'){ g.fillStyle = 'rgba(232,208,150,.78)'; g.fillRect(X, Y, T, T);
    g.fillStyle = 'rgba(160,128,80,.35)'; for (let i = 0; i < 3; i++){ ell(g, X + T*hash(x, y, i + 20), Y + T*hash(x, y, i + 30), T*.02, T*.02); g.fill(); }
    if (hash(x, y, 9) < .12){ g.fillStyle = '#f2c2c8'; g.beginPath(); g.moveTo(X + T*.6, Y + T*.6); g.arc(X + T*.6, Y + T*.6, T*.07, Math.PI, 0); g.closePath(); g.fill(); }   // a shell
    if (ch === 'T') drawFort(g, X, Y, x, y);
  }
  if (ch === 'F'){ g.fillStyle = 'rgba(232,208,150,.45)'; g.fillRect(X, Y, T, T); }
  if (ch === 'M'){ g.fillStyle = 'rgba(214,196,150,.55)'; g.fillRect(X, Y, T, T); hump(g, X + T*.58, Y + T*.84, T*.36, T*.5, '#7c8a92', 'rgba(40,50,56,.6)'); hump(g, X + T*.32, Y + T*.9, T*.26, T*.34, '#96a2a8', 'rgba(40,50,56,.5)');
    g.fillStyle = '#3e7a4a'; ell(g, X + T*.6, Y + T*.45, T*.12, T*.04); g.fill(); }
  if (ch === 'X'){ g.fillStyle = '#5a4e46'; g.fillRect(X, Y, T, T); g.strokeStyle = 'rgba(30,24,20,.6)'; g.lineWidth = Math.max(1, T*.03);
    for (let i = 0; i < 3; i++){ g.beginPath(); g.moveTo(X + T*(.1 + .3*i), Y); g.lineTo(X + T*(.2 + .3*i), Y + T*.5); g.lineTo(X + T*(.12 + .3*i), Y + T); g.stroke(); }
    g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(X, Y, T, T*.08); }
}
// the tournament: raked pale sand, striped pennants, grandstands of benches
function arenaOver(g, x, y, ch){
  const X = x*T, Y = y*T, stripes = ['#c0392b', '#2e5f9a', '#d9b04a', '#4c8a3a'];
  if (ch === '.' || ch === 'F' || ch === 'T'){ g.fillStyle = 'rgba(230,214,170,.7)'; g.fillRect(X, Y, T, T);
    g.strokeStyle = 'rgba(150,120,80,.25)'; g.lineWidth = 1; for (let i = 1; i < 4; i++){ g.beginPath(); g.moveTo(X, Y + T*i/4); g.lineTo(X + T, Y + T*i/4); g.stroke(); } }
  if (ch === 'F') for (const [a, b] of [[.28, .25], [.7, .4]]){   // pennants on poles
    g.strokeStyle = '#5a3e24'; g.lineWidth = Math.max(1, T*.04); g.beginPath(); g.moveTo(X + T*a, Y + T*(b + .55)); g.lineTo(X + T*a, Y + T*b); g.stroke();
    g.fillStyle = stripes[Math.floor(hash(x, y, a*10)*4)]; g.beginPath(); g.moveTo(X + T*a, Y + T*b); g.lineTo(X + T*(a + .24), Y + T*(b + .08)); g.lineTo(X + T*a, Y + T*(b + .18)); g.closePath(); g.fill();
  }
  if (ch === 'M'){ g.fillStyle = '#6a4a30'; g.fillRect(X, Y, T, T);   // benches, with frogs watching
    for (let r = 0; r < 3; r++){ g.fillStyle = r % 2 ? '#8a6440' : '#9a7048'; g.fillRect(X, Y + T*(r/3 + .2), T, T*.1);
      for (let i = 0; i < 3; i++){ if (hash(x, y, r*3 + i) < .55){ g.fillStyle = ['#6aa040', '#7bc043', '#5e8a3c', '#d9779a'][Math.floor(hash(x, y, r*3 + i + 9)*4)]; ell(g, X + T*(.18 + i*.32), Y + T*(r/3 + .17), T*.09, T*.07); g.fill(); } } } }
  if (ch === 'X'){ g.fillStyle = '#e9dcc0'; g.fillRect(X + T*.08, Y, T*.84, T); for (let i = 0; i < 4; i++){ g.fillStyle = i % 2 ? '#c0392b' : '#2e5f9a'; g.fillRect(X + T*.08, Y + T*i/4, T*.84, T*.12); }
    g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(X + T*.82, Y, T*.1, T); }
  if (ch === 'T') drawFort(g, X, Y, x, y);
}
// the ships: planked decks, barrels, masts and rails
function deckOver(g, x, y, ch){
  const X = x*T, Y = y*T;
  if (ch === 'W' || ch === 'B') return;
  g.fillStyle = ch === 'X' ? '#4a2e1c' : '#9a6a40'; g.fillRect(X, Y, T, T);
  if (ch !== 'X'){ g.strokeStyle = 'rgba(60,36,20,.5)'; g.lineWidth = 1; for (let i = 1; i < 5; i++){ g.beginPath(); g.moveTo(X + T*i/5, Y); g.lineTo(X + T*i/5, Y + T); g.stroke(); }
    g.fillStyle = 'rgba(30,18,10,.5)'; for (let i = 0; i < 5; i++){ ell(g, X + T*(i/5 + .1), Y + T*(hash(x, y, i) < .5 ? .15 : .85), T*.015, T*.015); g.fill(); } }
  else { g.fillStyle = '#6a4228'; g.fillRect(X, Y + T*.3, T, T*.4); g.fillStyle = '#c9a24a'; g.fillRect(X, Y + T*.46, T, T*.06); }
  if (ch === 'F') for (const [a, b] of [[.3, .6], [.68, .5]]){ const cx = X + T*a, cy = Y + T*b;
    g.fillStyle = 'rgba(0,0,0,.3)'; ell(g, cx + T*.03, cy + T*.2, T*.16, T*.06); g.fill();
    g.fillStyle = '#7a4a26'; g.beginPath(); g.ellipse(cx, cy, T*.15, T*.22, 0, 0, Math.PI*2); g.fill();
    g.strokeStyle = '#3a3a3e'; g.lineWidth = Math.max(1, T*.03); for (const k of [-.1, .1]){ g.beginPath(); g.moveTo(cx - T*.15, cy + T*k); g.lineTo(cx + T*.15, cy + T*k); g.stroke(); } }
  if (ch === 'M'){ g.fillStyle = 'rgba(0,0,0,.3)'; ell(g, X + T*.52, Y + T*.56, T*.22, T*.1); g.fill();
    g.fillStyle = '#5a3a22'; ell(g, X + T*.5, Y + T*.5, T*.17, T*.17); g.fill(); g.fillStyle = '#7a5232'; ell(g, X + T*.47, Y + T*.47, T*.11, T*.11); g.fill();
    g.strokeStyle = '#e0d2b0'; g.lineWidth = Math.max(1, T*.025); for (const [a, b] of [[.05, .1], [.95, .1], [.05, .9], [.95, .9]]){ g.beginPath(); g.moveTo(X + T*.5, Y + T*.5); g.lineTo(X + T*a, Y + T*b); g.stroke(); } }
  if (ch === 'T') drawFort(g, X, Y, x, y);
}
function snowOver(g, x, y, ch){
  const X = x*T, Y = y*T;
  // a cool blue-white snowfield; forests keep their green so they still read as cover
  g.fillStyle = ch === 'F' ? 'rgba(222,234,250,.5)' : ch === 'M' ? 'rgba(232,240,252,.7)' : 'rgba(226,236,250,.64)'; g.fillRect(X, Y, T, T);
  g.fillStyle = 'rgba(160,182,214,.22)'; ell(g, X + T*hash(x, y, 7), Y + T*hash(x, y, 8), T*.34, T*.1); g.fill();   // drift shadow
  g.fillStyle = 'rgba(255,255,255,.95)';
  for (let i = 0; i < 4; i++){ ell(g, X + T*hash(x, y, i + 30), Y + T*hash(x, y, i + 40), T*.022, T*.022); g.fill(); }
  if (ch === 'F') for (const [a, b, s] of [[.3, .5, .9], [.72, .42, 1], [.52, .86, .8]]){   // snowy pines
    const cx = X + T*a, by = Y + T*b, w = T*.2*s, h = T*.34*s;
    g.fillStyle = 'rgba(40,50,60,.22)'; ell(g, cx + w*.2, by + T*.03, w*.9, T*.05); g.fill();
    g.fillStyle = '#5a3e2a'; g.fillRect(cx - T*.02, by - T*.04, T*.04, T*.06);
    for (let k = 0; k < 2; k++){ const ty = by - h*.3*k, tw = w*(1 - k*.28);
      g.fillStyle = k ? '#2f6a4a' : '#26583d'; g.beginPath(); g.moveTo(cx - tw, ty - T*.02); g.lineTo(cx + tw, ty - T*.02); g.lineTo(cx, ty - h*.75); g.closePath(); g.fill();
      g.fillStyle = 'rgba(255,255,255,.92)'; g.beginPath(); g.moveTo(cx - tw*.45, ty - h*.42); g.lineTo(cx + tw*.45, ty - h*.42); g.lineTo(cx, ty - h*.75); g.closePath(); g.fill(); }
  }
  if (ch === 'M'){ g.fillStyle = 'rgba(150,170,200,.6)'; ell(g, X + T*.55, Y + T*.78, T*.38, T*.14); g.fill(); g.fillStyle = '#fbfdff'; ell(g, X + T*.5, Y + T*.7, T*.32, T*.16); g.fill(); }
}
function drawThemedTile(g, x, y, ch, theme){
  const X = x*T, Y = y*T, mine = theme === 'mine';
  const floor = mine ? ['#5a4434', '#634b39', '#53402f', '#6a503c'] : ['#7a6448', '#836c4e', '#725d42', '#8a7352'];
  if (ch === 'X' && mine){
    g.fillStyle = '#2a221c'; g.fillRect(X, Y, T, T);
    stones(g, X, Y, [[.28, .3, .26], [.72, .28, .24], [.5, .66, .3], [.15, .78, .18], [.86, .74, .17]], ['#4a423b', '#56504a', '#3f3833'], 'rgba(20,16,12,.8)');
    return;
  }
  patch(g, X, Y, ch === 'M' ? (mine ? '#4e4036' : '#6e5a42') : floor[Math.floor(hash(x, y)*4)], x, y);
  if (ch === 'F'){
    if (mine) stones(g, X, Y, [[.3, .6, .16], [.62, .52, .19], [.48, .8, .14], [.78, .8, .11]], ['#8a8580', '#9c968e', '#7c7772'], 'rgba(50,45,40,.7)');
    else for (const [a, b, w] of [[.12, .3, .42], [.5, .5, .4]]){   // ore crates
      const cx = X + T*a, cy = Y + T*b, s = T*w;
      g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(cx + T*.03, cy + T*.04, s, s);
      g.fillStyle = '#9a6e42'; g.fillRect(cx, cy, s, s);
      g.strokeStyle = '#6a4626'; g.lineWidth = Math.max(1, T*.03); g.strokeRect(cx, cy, s, s);
      g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + s, cy + s); g.moveTo(cx + s, cy); g.lineTo(cx, cy + s); g.stroke();
      g.fillStyle = 'rgba(255,255,255,.15)'; g.fillRect(cx, cy, s, T*.03);
    }
  }
  if (ch === 'M'){
    hump(g, X + T*.62, Y + T*.84, T*.38, T*.58, mine ? '#6e6a66' : '#8e7050', 'rgba(40,35,30,.6)');
    hump(g, X + T*.33, Y + T*.9, T*.3, T*.4, mine ? '#8a857e' : '#a3845e', 'rgba(50,40,30,.55)');
    if (mine){ g.fillStyle = '#e3b54c'; for (let i = 0; i < 6; i++){ ell(g, X + T*(.3 + hash(x, y, i)*.5), Y + T*(.5 + hash(x, y, i + 9)*.35), T*.025, T*.025); g.fill(); } }
  }
  if (ch === 'X'){   // palisade
    for (let i = 0; i < 5; i++){
      const sx = X + T*(.04 + i*.19), w = T*.15;
      g.fillStyle = i % 2 ? '#6e4e30' : '#7a5838';
      g.beginPath(); g.moveTo(sx, Y + T*.95); g.lineTo(sx, Y + T*.2); g.lineTo(sx + w/2, Y + T*.04); g.lineTo(sx + w, Y + T*.2); g.lineTo(sx + w, Y + T*.95); g.closePath(); g.fill();
      g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(sx + w*.7, Y + T*.2, w*.3, T*.75);
    }
    g.fillStyle = '#c9a46a'; g.fillRect(X, Y + T*.38, T, T*.06); g.fillRect(X, Y + T*.7, T, T*.06);
  }
  if (ch === 'T') drawFort(g, X, Y, x, y);
}
// The weapon badge: a disc in the weapon's colour (the triangle reads at a glance: swords red, axes green, lances blue;
// bows gold, tomes purple, hooks copper, staves pale teal) with the weapon's symbol in white. On every map token, and large in Danger view.
const WEAPON_COLOURS = {sword: ['#e8675a', '#9c2a20'], axe: ['#6fc25a', '#2f6e22'], lance: ['#5f9ae8', '#22508f'], bow: ['#f2cc5a', '#9a6e14'],
                        tome: ['#b07ae0', '#5a2e8a'], hook: ['#f0965a', '#9a4a1a'], staff: ['#bfe8e0', '#4f8c84'], whip: ['#f2cc5a', '#9a6e14']};
function weaponBadge(g, u, x, y, r, ring){
  const w = u.w,   // a whip is a bow in play, so it wears the bow badge
  [hi, lo] = WEAPON_COLOURS[w] || WEAPON_COLOURS.sword;
  g.fillStyle = 'rgba(0,0,0,.4)'; ell(g, x + r*.08, y + r*.12, r, r); g.fill();
  const bg = g.createRadialGradient(x - r*.3, y - r*.3, 1, x, y, r); bg.addColorStop(0, hi); bg.addColorStop(1, lo);
  g.fillStyle = bg; ell(g, x, y, r, r); g.fill();
  g.strokeStyle = ring || '#1e140a'; g.lineWidth = Math.max(1.2, r*(ring ? .16 : .1)); g.stroke();
  glyph(g, w, x, y, r*.8, w === 'staff' ? '#1e3a36' : '#fffaf0');
}
// The weapon-triangle arrow: green and pointing up for an advantage, red and pointing down for a disadvantage.
function triangleArrow(g, x, y, r, up){
  g.save(); g.translate(x, y); if (!up) g.scale(1, -1);
  g.beginPath(); g.moveTo(0, -r); g.lineTo(r*.95, r*.15); g.lineTo(r*.38, r*.15); g.lineTo(r*.38, r); g.lineTo(-r*.38, r); g.lineTo(-r*.38, r*.15); g.lineTo(-r*.95, r*.15); g.closePath();
  g.lineJoin = 'round'; g.lineWidth = Math.max(2, r*.32); g.strokeStyle = 'rgba(12,8,6,.9)'; g.stroke();
  g.fillStyle = up ? '#4fdc6e' : '#ff4f3e'; g.fill();
  g.restore();
}
// How much of a map icon is drawn: opaque pixels, measured once per image (at natural size).
const TOKEN_INK = .78;   // every icon's drawn area is (TOKEN_INK × tile)², about what the rabbits always had
const inkCache = new WeakMap();
function inkOf(img){
  if (inkCache.has(img)) return inkCache.get(img);
  const c = document.createElement('canvas'), k = Math.min(1, 160/Math.max(img.width, img.height));
  c.width = Math.max(1, Math.round(img.width*k)); c.height = Math.max(1, Math.round(img.height*k));
  const g = c.getContext('2d'); g.drawImage(img, 0, 0, c.width, c.height);
  const px = g.getImageData(0, 0, c.width, c.height).data; let n = 0;
  for (let i = 3; i < px.length; i += 4) if (px[i] > 128) n++;
  const ink = Math.max(1, n/(k*k)); inkCache.set(img, ink); return ink;
}
const TEAM_COLOURS = {p: {fill: 'rgba(36,92,196,.95)', rim: '#8fc0ff', stitch: '#d8e8ff', bar: '#5aa0ff'},
                      a: {fill: 'rgba(34,138,70,.95)', rim: '#8fe6a2', stitch: '#d8f5de', bar: '#5fd27a'},
                      e: {fill: 'rgba(186,40,32,.95)', rim: '#ff8a78', stitch: '#ffe0da', bar: '#ff5a48'}};
// Local multiplayer colours each side by its player instead (VS_COLOURS, 70-versus.js): George green, Rosie pink
const teamColours = u => (B?.vs && VS_COLOURS[u.owner]) || TEAM_COLOURS[u.team] || TEAM_COLOURS.e;
function tokenFor(u, variant){
  const key = `${artResolve(u, 'token') || u.look}|${u.faction}|${B?.vs ? u.owner : u.team}|${u.w}|${variant}|${T}|${dpr}`;
  if (tokenCache.has(key)) return tokenCache.get(key);
  const S = Math.ceil(T*1.6), c = document.createElement('canvas'); c.width = S*dpr; c.height = S*dpr;
  const g = c.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
  // Team colours, whatever a unit's people or faction (as in most tactics games): blue coaster for yours, green for allies
  // who fight on their own, red for enemies; a bright rim and a stitched ring in the same colour (TEAM_COLOURS).
  const L = LOOKS[u.look] || LOOKS.worker, ox = T*.3, oy = T*.3, TC = teamColours(u);
  g.fillStyle = TC.fill; ell(g, ox + T*.5, oy + T*.8, T*.4, T*.11); g.fill();
  g.beginPath(); g.ellipse(ox + T*.5, oy + T*.8, T*.4, T*.11, 0, 0, Math.PI*2); g.lineWidth = Math.max(1.8, T*.065); g.strokeStyle = TC.rim; g.stroke();
  g.beginPath(); g.ellipse(ox + T*.5, oy + T*.8, T*.31, T*.065, 0, 0, Math.PI*2); stitchStroke(g, TC.stitch, T*.5);
  const icon = artImage(u, 'token');
  if (artFor(u, 'token') && !icon) return c;   // art still decoding: draw nothing yet and don't cache
  if (icon){
    // Real token art: fit it to the tile, sitting on the felt coaster.
    // Every icon is sized by how much of it is actually drawn (its ink), not by its picture's box: so a wide frog with a
    // banner, a monkey with a tall plume and a rabbit with long ears all read as the same size on the map. Limits keep
    // the widest and tallest from spilling off their tile.
    const sc = Math.min(Math.sqrt((T*TOKEN_INK)**2/inkOf(icon)), T*1.45/icon.width, T*1.15/icon.height), w = icon.width*sc, h = icon.height*sc;
    g.drawImage(icon, ox + T*.5 - w/2, oy + T*.88 - h, w, h);
  } else {
    const s = T*(L.sp === 'bun' ? .27 : L.sp === 'mouse' ? .27 : L.sp === 'monkey' ? .26 : .28)*(L.small ? .82 : L.big ? 1.15 : 1);
    drawPlush(g, u.look, ox + T*.5, oy + T*(L.sp === 'bun' ? .44 : .46) + (L.small ? T*.05 : 0), s);
  }
  weaponBadge(g, u, ox + T*.86, oy + T*.68, T*.19);
  if (variant !== 'n'){ g.globalCompositeOperation = 'source-atop'; g.fillStyle = variant === 'w' ? '#ffffff' : 'rgba(40,40,52,.58)'; g.fillRect(0, 0, S, S); }
  tokenCache.set(key, c); return c;
}
function drawUnit(u, now){
  const X = (u.px + u.ox)*T, Y = (u.py + u.oy)*T, S = T*1.6;
  ctx.save(); ctx.globalAlpha = u.alpha;
  if (u === sel){
    const p = .5 + .5*Math.sin(now/180);
    ctx.strokeStyle = `rgba(236,198,115,${.55 + .45*p})`; ctx.lineWidth = T*.05; ctx.setLineDash([T*.08, T*.06]);
    ell(ctx, X + T*.5, Y + T*.8, T*.44, T*.13); ctx.stroke(); ctx.setLineDash([]);
  }
  const bob = (u.team === 'p' && !u.moved && phase === 'p' && !busy) || u === inspect ? Math.sin(now/260 + u.id)*T*.02 : 0;
  const moved = u.team === 'p' && u.moved && phase === 'p';
  ctx.drawImage(tokenFor(u, moved ? 'd' : 'n'), X - T*.3, Y - T*.3 + bob, S, S);
  if (u.flash > 0){ ctx.globalAlpha = u.alpha*u.flash; ctx.drawImage(tokenFor(u, 'w'), X - T*.3, Y - T*.3 + bob, S, S); ctx.globalAlpha = u.alpha; }
  const bw = T*.62, bh = Math.max(3, T*.075), bx = X + T*.5 - bw/2 - T*.06, by = Y + T*.9;
  ctx.fillStyle = '#120c0a'; ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 2);
  const ratio = clamp(u.shp/u.mhp, 0, 1);
  ctx.fillStyle = teamColours(u).bar; ctx.fillRect(bx, by, bw*ratio, bh);   // HP bars in the team colour too
  if (u.naughty){ ctx.font = `${Math.round(T*.3)}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('📜', X + T*.12, Y + T*.1); }   // on Chriggle Chraggle's Naughty List
  ctx.restore();
}
function fillKeys(keys, fill, stroke){
  for (const k of keys){
    const X = KX(k)*T, Y = KY(k)*T;
    ctx.fillStyle = fill; ctx.fillRect(X + 1, Y + 1, T - 2, T - 2);
    if (stroke){ ctx.strokeStyle = stroke; ctx.lineWidth = Math.max(1, T*.035); ctx.setLineDash([T*.08, T*.06]); ctx.strokeRect(X + T*.09, Y + T*.09, T*.82, T*.82); ctx.setLineDash([]); }
  }
}
function brackets(x, y, col){
  const X = x*T, Y = y*T, l = T*.26, i = T*.04;
  ctx.strokeStyle = col; ctx.lineWidth = Math.max(2, T*.06); ctx.lineCap = 'round';
  for (const [sx, sy] of [[0,0],[1,0],[0,1],[1,1]]){
    const cx = X + (sx ? T - i : i), cy = Y + (sy ? T - i : i), dx = sx ? -1 : 1, dy = sy ? -1 : 1;
    ctx.beginPath(); ctx.moveTo(cx + dx*l, cy); ctx.lineTo(cx, cy); ctx.lineTo(cx, cy + dy*l); ctx.stroke();
  }
}
function tornBand(y, h, w, col, seed){
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, y);
  for (let x = 0; x <= w; x += 8) ctx.lineTo(x, y + (hash(x, seed) - .5)*7);
  for (let x = w; x >= 0; x -= 8) ctx.lineTo(x, y + h + (hash(x, seed + 3) - .5)*7);
  ctx.closePath(); ctx.fill();
}
function render(now){
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, COLS*T, ROWS*T);
  let sx = 0, sy = 0;
  if (shake > 0){ sx = (Math.random() - .5)*T*.15*shake; sy = (Math.random() - .5)*T*.15*shake; shake = Math.max(0, shake - .06); }
  ctx.translate(sx, sy);
  ctx.drawImage(terrCv, 0, 0, COLS*T, ROWS*T);
  if (B?.ch?.exits){   // where couriers leave the map (the December event)
    for (const [ex, ey] of B.ch.exits){ ctx.fillStyle = 'rgba(255,190,60,.42)'; ctx.fillRect(ex*T + 1, ey*T + 1, T - 2, T - 2); ctx.strokeStyle = 'rgba(190,120,20,.8)'; ctx.lineWidth = 2; ctx.strokeRect(ex*T + 2, ey*T + 2, T - 4, T - 4); ctx.fillStyle = '#8a4a10';
      ctx.font = `${Math.round(T*.42)}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha = .85; ctx.fillText('⬇', ex*T + T/2, ey*T + T/2); ctx.globalAlpha = 1; }
  }
  if (B?.objective?.type === 'bells') for (const [bx, by] of bellSquares()){   // the bells: dashed gold (yours), red (theirs) or white (free)
    const h = bellHolder([bx, by]);
    ctx.strokeStyle = h === 'p' ? 'rgba(255,217,138,.95)' : h === 'e' ? 'rgba(255,110,90,.95)' : 'rgba(255,255,255,.55)'; ctx.lineWidth = Math.max(2, T*.07);
    ctx.setLineDash([T*.12, T*.08]); ctx.strokeRect(bx*T + T*.08, by*T + T*.08, T*.84, T*.84); ctx.setLineDash([]);
    ctx.font = `${Math.round(T*.34)}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('🔔', bx*T + T*.82, by*T + T*.18); ctx.textBaseline = 'alphabetic';
  }
  if (B?.ch?.tide && !tideHigh()){   // the tide flats: pale blue ripples; brighter, dashed, the turn before the sea comes in
    const warn = tideComing();
    for (const [tx, ty] of tideFlats()){ ctx.fillStyle = warn ? 'rgba(90,170,255,.38)' : 'rgba(120,180,235,.16)'; ctx.fillRect(tx*T, ty*T, T, T);
      if (warn){ ctx.strokeStyle = 'rgba(200,230,255,.9)'; ctx.lineWidth = Math.max(1.5, T*.05); ctx.setLineDash([T*.1, T*.08]); ctx.strokeRect(tx*T + T*.1, ty*T + T*.1, T*.8, T*.8); ctx.setLineDash([]); } }
  }
  for (const u of units) if (u.parley && u.team === 'e' && !u.dead){   // can be talked round
    ctx.font = `${Math.round(T*.36)}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('💬', (u.px + u.ox)*T + T*.82, (u.py + u.oy)*T + T*.12); ctx.textBaseline = 'alphabetic';
  }
  if (showDanger) fillKeys(dangerKeys, 'rgba(255,128,32,.26)');
  if (inspect && !inspect.dead){
    const m = inspect.ai === 'hold' ? [K(inspect.x, inspect.y)] : destinations(inspect, reach(inspect));
    if (inspect.w !== 'staff') fillKeys([...rangeTiles(m, inspect.rng)].filter(k => !m.includes(k)), 'rgba(205,40,30,.36)', 'rgba(255,170,150,.55)');
    fillKeys(m, 'rgba(225,110,60,.3)');
  }
  fillKeys(moveKeys, 'rgba(70,130,255,.4)', 'rgba(200,222,255,.85)');
  fillKeys(atkKeys, mode === 'selected' ? 'rgba(215,45,35,.32)' : 'rgba(215,45,35,.24)', mode === 'selected' ? null : 'rgba(255,170,150,.5)');
  fillKeys(healKeys, 'rgba(70,210,120,.26)', mode === 'selected' ? null : 'rgba(190,255,200,.6)');
  if (mode === 'target'){
    const p = .5 + .25*Math.sin(now/160);
    for (const t of targets){ ctx.fillStyle = tmode === 'attack' ? `rgba(230,50,40,${p})` : `rgba(80,230,120,${p})`; ctx.fillRect(t.x*T + 1, t.y*T + 1, T - 2, T - 2); }
    if (fc) brackets(fc.x, fc.y, '#fff');
  }
  if (cursor && phase === 'p' && !busy && mode !== 'target') brackets(cursor.x, cursor.y, 'rgba(236,198,115,.95)');
  for (const u of units.filter(u => !u.dead).sort((a, b) => a.py - b.py)) drawUnit(u, now);
  // With one of your units selected: on each enemy's top-left corner, a green ▲ if your weapon beats theirs, a red ▼ if theirs beats yours
  if (sel && sideOfTeam(sel) === 'p' && sel.w !== 'staff' && !busy) for (const e of foes(sel)){
    if (e.alpha <= .5) continue;
    const t = triangle(sel.w, e.w); if (!t) continue;
    triangleArrow(ctx, (e.px + e.ox + .18)*T, (e.py + e.oy + .22)*T + Math.sin(now/220)*T*.03, T*.21, t > 0);
  }
  // Danger view: each unit's weapon, large, over its token, ringed in its team colour (yours blue, allies green, enemies red)
  if (showDanger && !busy) for (const u of units) if (!u.dead && u.alpha > .5){
    const ring = teamColours(u).rim;
    weaponBadge(ctx, u, (u.px + u.ox + .56)*T, (u.py + u.oy + .54)*T, T*.44, ring);
  }
  for (const s of shots){
    const x = (s.x0 + (s.x1 - s.x0)*s.t)*T, y = (s.y0 + (s.y1 - s.y0)*s.t)*T - Math.sin(s.t*Math.PI)*T*.4, a = Math.atan2(s.y1 - s.y0, s.x1 - s.x0);
    ctx.strokeStyle = '#f3ead2'; ctx.lineWidth = Math.max(1.5, T*.04);
    ctx.beginPath(); ctx.moveTo(x - Math.cos(a)*T*.28, y - Math.sin(a)*T*.28); ctx.lineTo(x, y); ctx.stroke();
  }
  popups = popups.filter(p => now - p.t0 < p.dur);
  for (const p of popups){
    const t = (now - p.t0)/p.dur, y = (p.y - t*.55)*T;
    ctx.globalAlpha = 1 - t*t; ctx.font = `${Math.round(T*.44)}px 'Saira Stencil One', Impact, sans-serif`; ctx.textAlign = 'center';
    ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(10,6,4,.9)'; ctx.strokeText(p.text, p.x*T, y);
    ctx.fillStyle = p.color; ctx.fillText(p.text, p.x*T, y); ctx.globalAlpha = 1;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (banner){
    // drawn across the part of the map that's on screen (the map can be zoomed and scrolled)
    const vw = Math.min(COLS*T, mapView.clientWidth), vh = Math.min(ROWS*T, mapView.clientHeight);
    const vx = clamp(mapView.scrollLeft - cvs.offsetLeft, 0, COLS*T - vw), vy = clamp(mapView.scrollTop - cvs.offsetTop, 0, ROWS*T - vh);
    const bT = Math.min(T, vw/8, vh/6);   // the banner's own scale, so it fits the view at any zoom
    const F = VS_BANNERS[banner.f] || FACTIONS[banner.f], W = vw, t = (now - banner.t0)/banner.dur, a = t < .15 ? t/.15 : t > .82 ? Math.max(0, (1 - t)/.18) : 1;
    const h = bT*1.9, y = vh/2 - h/2, slide = (1 - a)*W*.15*(t < .5 ? -1 : 1);
    ctx.globalAlpha = a*.55; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, COLS*T, ROWS*T);
    ctx.save(); ctx.translate(vx, vy);
    ctx.globalAlpha = a; ctx.save(); ctx.translate(slide, 0);
    tornBand(y, h, W, F.band, banner.f.length);
    ctx.save(); ctx.setLineDash([bT*.12, bT*.08]); ctx.lineWidth = 1.5; ctx.strokeStyle = F.stitch;
    ctx.beginPath(); ctx.moveTo(0, y + bT*.18); ctx.lineTo(W, y + bT*.18); ctx.moveTo(0, y + h - bT*.18); ctx.lineTo(W, y + h - bT*.18); ctx.stroke(); ctx.restore();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `${Math.round(Math.min(bT*.62, W/(banner.text.length*.62)))}px 'Saira Stencil One', Impact, sans-serif`;
    ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillText(banner.text, W/2 + 2, y + h*.42 + 3);
    ctx.fillStyle = F.text; ctx.fillText(banner.text, W/2, y + h*.42);
    ctx.font = `italic ${Math.round(bT*.32)}px 'IM Fell English', Georgia, serif`; ctx.fillStyle = F.sub;
    ctx.fillText(banner.sub, W/2, y + h*.74);
    ctx.restore(); ctx.restore(); ctx.textBaseline = 'alphabetic'; ctx.globalAlpha = 1;
  }
}
function frame(now){
  stepTweens(now);
  if (B && !$('#app').hidden){
    if (!tweens.length) for (const u of units) u.shp = u.hp;
    render(now);
  }
  requestAnimationFrame(frame);
}
new ResizeObserver(() => resize()).observe(boardEl);
