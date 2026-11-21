// ================= Plush drawing =================
// Placeholder characters drawn in code: felt shapes, button eyes, running stitches.
function ell(g, x, y, rx, ry, rot = 0){ g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, Math.PI*2); }
function stitchStroke(g, color, s, w = 1){ g.save(); g.setLineDash([s*.11, s*.08]); g.lineWidth = Math.max(.8, s*.045*w); g.strokeStyle = color; g.stroke(); g.restore(); }
function button(g, x, y, r, col = '#0d0b0a'){
  g.fillStyle = col; ell(g, x, y, r, r); g.fill();
  g.fillStyle = 'rgba(255,255,255,.85)'; ell(g, x - r*.35, y - r*.35, r*.32, r*.32); g.fill();
}
function bandana(g, cx, cy, s, col, rx, ry, tailSide = -1){
  g.strokeStyle = col; g.lineWidth = s*.2;
  g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, Math.PI*1.12, Math.PI*1.88); g.stroke();
  const kx = cx + tailSide*rx*.86, ky = cy - ry*.55;
  g.lineWidth = s*.12; g.beginPath(); g.moveTo(kx, ky); g.lineTo(kx + tailSide*.35*s, ky + .18*s); g.moveTo(kx, ky); g.lineTo(kx + tailSide*.3*s, ky - .17*s); g.stroke();
}

function bunny(g, cx, cy, s, L){
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  const ear = side => {
    g.save();
    if (L.ears === 'up'){ g.translate(cx + side*.42*s, cy - 1.05*s); g.rotate(side*.2); }
    else { g.translate(cx + side*.98*s, cy + .02*s); g.rotate(-side*.38); }
    g.fillStyle = L.fur; ell(g, 0, 0, .3*s, .84*s); g.fill(); stitchStroke(g, L.dark, s);
    g.fillStyle = '#e8a6a6'; ell(g, 0, L.ears === 'up' ? -.04*s : .06*s, .15*s, .6*s); g.fill();
    g.restore();
  };
  ear(-1);
  if (L.oneEar){   // a torn stump where the right ear was
    g.fillStyle = L.fur; g.beginPath(); g.ellipse(cx + .45*s, cy - .82*s, .2*s, .22*s, .3, 0, Math.PI*2); g.fill(); stitchStroke(g, L.dark, s);
  } else ear(1);
  const gr = g.createRadialGradient(cx - .3*s, cy - .45*s, s*.1, cx, cy, s*1.15);
  gr.addColorStop(0, L.light); gr.addColorStop(1, L.fur);
  g.fillStyle = gr; ell(g, cx, cy, s, .92*s); g.fill(); stitchStroke(g, L.dark, s);
  g.beginPath(); g.moveTo(cx, cy - .9*s); g.lineTo(cx, cy - .4*s); stitchStroke(g, L.dark, s, .8);
  g.fillStyle = L.light; ell(g, cx, cy + .33*s, .42*s, .28*s); g.fill();
  button(g, cx - .4*s, cy - .06*s, .14*s); button(g, cx + .4*s, cy - .06*s, .14*s);
  g.fillStyle = '#e48c96'; g.beginPath(); g.moveTo(cx - .11*s, cy + .17*s); g.lineTo(cx + .11*s, cy + .17*s); g.lineTo(cx, cy + .3*s); g.closePath(); g.fill();
  g.strokeStyle = L.dark; g.lineWidth = Math.max(.8, s*.04); g.beginPath();
  g.moveTo(cx, cy + .3*s); g.lineTo(cx, cy + .38*s); g.moveTo(cx - .12*s, cy + .42*s); g.quadraticCurveTo(cx - .05*s, cy + .46*s, cx, cy + .38*s);
  g.quadraticCurveTo(cx + .05*s, cy + .46*s, cx + .12*s, cy + .42*s); g.stroke();
  if (L.scarf){
    g.fillStyle = L.scarf; g.beginPath();
    g.moveTo(cx - .86*s, cy + .58*s); g.quadraticCurveTo(cx, cy + 1.0*s, cx + .86*s, cy + .58*s);
    g.lineTo(cx + .8*s, cy + .86*s); g.quadraticCurveTo(cx, cy + 1.28*s, cx - .8*s, cy + .86*s); g.closePath(); g.fill();
    g.fillRect(cx + .38*s, cy + .85*s, .24*s, .38*s);
    g.beginPath(); g.moveTo(cx - .78*s, cy + .73*s); g.quadraticCurveTo(cx, cy + 1.13*s, cx + .78*s, cy + .73*s); stitchStroke(g, 'rgba(239,227,200,.75)', s, .8);
  }
  const bx = cx - .38*s, by = cy + .86*s;
  if (L.gear === 'fist'){
    const bg = g.createRadialGradient(bx - .05*s, by - .05*s, 1, bx, by, .2*s); bg.addColorStop(0, '#f3d27d'); bg.addColorStop(1, '#9c6d22');
    g.fillStyle = bg; ell(g, bx, by, .19*s, .19*s); g.fill(); g.fillStyle = '#5a3a10'; g.fillRect(bx - .08*s, by - .07*s, .16*s, .14*s);
  }
  if (L.gear === 'heart'){
    g.fillStyle = '#f2b8c2'; g.beginPath(); g.moveTo(bx, by + .14*s);
    g.bezierCurveTo(bx - .26*s, by - .04*s, bx - .1*s, by - .22*s, bx, by - .07*s); g.bezierCurveTo(bx + .1*s, by - .22*s, bx + .26*s, by - .04*s, bx, by + .14*s); g.fill();
  }
  if (L.gear === 'helm'){
    const hg = g.createLinearGradient(cx, cy - s, cx, cy - .2*s); hg.addColorStop(0, '#d6dbe2'); hg.addColorStop(1, '#7c838e');
    g.fillStyle = hg; g.beginPath(); g.ellipse(cx, cy - .26*s, s*1.04, s*.78, 0, Math.PI, 0); g.closePath(); g.fill();
    g.fillStyle = '#5d636d'; g.fillRect(cx - 1.04*s, cy - .34*s, 2.08*s, .14*s);
    g.fillStyle = '#e8ecf0'; for (const k of [-.7,-.35,0,.35,.7]){ ell(g, cx + k*s, cy - .27*s, .045*s, .045*s); g.fill(); }
    g.strokeStyle = '#b5302a'; g.lineWidth = s*.1; g.beginPath(); g.moveTo(cx, cy - 1.0*s); g.quadraticCurveTo(cx + .2*s, cy - 1.35*s, cx + .55*s, cy - 1.3*s); g.stroke();
  }
  if (L.gear === 'mask'){   // a dark cloth mask over the eyes
    g.fillStyle = '#1a1614'; g.beginPath(); g.ellipse(cx, cy - .06*s, .78*s, .24*s, 0, 0, Math.PI*2); g.fill();
    g.beginPath(); g.ellipse(cx, cy - .06*s, .7*s, .17*s, 0, 0, Math.PI*2); stitchStroke(g, '#5a4a40', s, .6);
    button(g, cx - .4*s, cy - .06*s, .1*s, '#e8dcc0'); button(g, cx + .4*s, cy - .06*s, .1*s, '#e8dcc0');
    g.strokeStyle = '#1a1614'; g.lineWidth = s*.08; g.beginPath(); g.moveTo(cx - .78*s, cy - .06*s); g.lineTo(cx - 1.1*s, cy + .2*s); g.stroke();
  }
  if (L.gear === 'monocle'){
    g.strokeStyle = '#e2b955'; g.lineWidth = s*.07; ell(g, cx + .4*s, cy - .06*s, .25*s, .25*s); g.stroke();
    g.lineWidth = s*.03; g.beginPath(); g.moveTo(cx + .62*s, cy + .05*s); g.quadraticCurveTo(cx + .8*s, cy + .5*s, cx + .6*s, cy + .75*s); g.stroke();
  }
  if (L.gear === 'bandana') bandana(g, cx, cy - .05*s, s, L.band || '#3b2a6b', s*.98, s*.62);
  if (L.gear === 'shoe'){ g.strokeStyle = '#c9973f'; g.lineWidth = s*.1; g.beginPath(); g.arc(cx + .45*s, cy + .9*s, .17*s, Math.PI*.1, Math.PI*.9, true); g.stroke(); }
  g.restore();
}

function frog(g, cx, cy, s, L){
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  const by = cy + .15*s;
  if (L.gear === 'hood'){   // drawn behind the body
    g.fillStyle = L.hood || '#3e2a52'; g.beginPath(); g.ellipse(cx, cy - .05*s, 1.3*s, 1.15*s, 0, Math.PI*.92, Math.PI*2.08); g.closePath(); g.fill();
    g.beginPath(); g.ellipse(cx, cy - .05*s, 1.3*s, 1.15*s, 0, Math.PI*.92, Math.PI*2.08); stitchStroke(g, '#c9a8e0', s, .7);
  }
  const gr = g.createRadialGradient(cx - .3*s, by - .4*s, s*.1, cx, by, s*1.3);
  gr.addColorStop(0, L.light); gr.addColorStop(1, L.skin);
  for (const side of [-1,1]){ g.fillStyle = L.skin; ell(g, cx + side*.52*s, cy - .45*s, .37*s, .37*s); g.fill(); stitchStroke(g, L.dark, s); }
  g.fillStyle = gr; ell(g, cx, by, 1.12*s, .78*s); g.fill(); stitchStroke(g, L.dark, s);
  for (const side of [-1,1]){
    g.fillStyle = L.skin; ell(g, cx + side*.52*s, cy - .45*s, .33*s, .33*s); g.fill();
    g.fillStyle = '#f4f0dd'; ell(g, cx + side*.52*s, cy - .45*s, .25*s, .25*s); g.fill();
    button(g, cx + side*.48*s, cy - .42*s, .13*s, L.eye);
  }
  g.fillStyle = L.belly; ell(g, cx, by + .3*s, .66*s, .36*s); g.fill(); g.beginPath(); g.ellipse(cx, by + .3*s, .66*s, .36*s, 0, 0, Math.PI*2); stitchStroke(g, L.dark, s, .7);
  g.strokeStyle = L.dark; g.lineWidth = s*.06; g.beginPath(); g.moveTo(cx - .62*s, cy + .02*s); g.quadraticCurveTo(cx, cy + .38*s, cx + .62*s, cy + .02*s); g.stroke();
  g.fillStyle = 'rgba(232,120,130,.45)'; ell(g, cx - .75*s, cy + .12*s, .14*s, .09*s); g.fill(); ell(g, cx + .75*s, cy + .12*s, .14*s, .09*s); g.fill();
  switch (L.gear){
    case 'collar':
      g.fillStyle = '#3b3631'; g.fillRect(cx - .8*s, by + .5*s, 1.6*s, .16*s);
      g.fillStyle = '#9a948c'; for (let i = 0; i < 5; i++){ const x = cx - .64*s + i*.32*s; g.beginPath(); g.moveTo(x - .08*s, by + .5*s); g.lineTo(x, by + .34*s); g.lineTo(x + .08*s, by + .5*s); g.fill(); }
      g.strokeStyle = '#e9d9b0'; g.lineWidth = s*.04; g.beginPath(); g.moveTo(cx + .3*s, cy - .72*s); g.lineTo(cx + .7*s, cy - .2*s); g.moveTo(cx + .4*s, cy - .4*s); g.lineTo(cx + .6*s, cy - .52*s); g.stroke();
      break;
    case 'lilypad':
      g.fillStyle = '#3e7a3b'; g.beginPath(); g.ellipse(cx, cy - .78*s, .62*s, .2*s, -.08, .25, Math.PI*2 - .1); g.lineTo(cx, cy - .78*s); g.closePath(); g.fill();
      g.beginPath(); g.ellipse(cx, cy - .78*s, .62*s, .2*s, -.08, 0, Math.PI*2); stitchStroke(g, '#203f1e', s, .7);
      g.fillStyle = '#f2a3c0'; for (const [a, b] of [[-.1,-.95],[.06,-.97],[-.02,-1.06]]){ ell(g, cx + a*s, cy + b*s, .1*s, .1*s); g.fill(); }
      g.fillStyle = '#f7e27a'; ell(g, cx - .02*s, cy - .97*s, .05*s, .05*s); g.fill();
      break;
    case 'reed':
      g.strokeStyle = '#4a3a22'; g.lineWidth = s*.12; g.beginPath(); g.ellipse(cx, cy + .02*s, s*1.02, s*.55, 0, Math.PI*1.08, Math.PI*1.92); g.stroke();
      g.strokeStyle = '#6b8a3a'; g.lineWidth = s*.06; g.beginPath(); g.moveTo(cx - .45*s, cy - .5*s); g.quadraticCurveTo(cx - .55*s, cy - 1.0*s, cx - .35*s, cy - 1.45*s); g.stroke();
      g.fillStyle = '#6b4a2a'; ell(g, cx - .38*s, cy - 1.3*s, .08*s, .2*s, .2); g.fill();
      break;
    case 'bandana':
      bandana(g, cx, by, s, L.band || '#c0392b', s*1.1, s*.62, 1);
      break;
    case 'eyepatch':
      bandana(g, cx, by, s, '#c0392b', s*1.1, s*.62, 1);
      g.fillStyle = '#111'; ell(g, cx - .52*s, cy - .45*s, .27*s, .27*s); g.fill();
      g.strokeStyle = '#111'; g.lineWidth = s*.04; g.beginPath(); g.moveTo(cx - .82*s, cy - .62*s); g.lineTo(cx - .2*s, cy - .62*s); g.stroke();
      break;
    case 'crown': {
      g.fillStyle = '#5b2a6b'; g.beginPath(); g.moveTo(cx - 1.1*s, by + .45*s); g.quadraticCurveTo(cx, by + .95*s, cx + 1.1*s, by + .45*s);
      g.lineTo(cx + 1.0*s, by + .78*s); g.quadraticCurveTo(cx, by + 1.2*s, cx - 1.0*s, by + .78*s); g.closePath(); g.fill();
      g.strokeStyle = '#f4efe2'; g.lineWidth = s*.14; g.beginPath(); g.moveTo(cx - 1.06*s, by + .5*s); g.quadraticCurveTo(cx, by + 1.0*s, cx + 1.06*s, by + .5*s); g.stroke();
      g.fillStyle = '#111'; for (const k of [-.6,-.2,.2,.6]){ ell(g, cx + k*s, by + .72*s - Math.abs(k)*.18*s, .035*s, .05*s); g.fill(); }
      const cg = g.createLinearGradient(cx, cy - 1.3*s, cx, cy - .75*s); cg.addColorStop(0, '#f7dc8a'); cg.addColorStop(1, '#b07d22');
      g.fillStyle = cg; g.beginPath(); const yb = cy - .78*s;
      g.moveTo(cx - .36*s, yb); g.lineTo(cx - .4*s, yb - .38*s); g.lineTo(cx - .2*s, yb - .18*s); g.lineTo(cx, yb - .5*s); g.lineTo(cx + .2*s, yb - .18*s); g.lineTo(cx + .4*s, yb - .38*s); g.lineTo(cx + .36*s, yb); g.closePath(); g.fill();
      g.fillStyle = '#c0392b'; ell(g, cx, yb - .12*s, .06*s, .06*s); g.fill();
      break;
    }
    case 'circlet':
      g.fillStyle = '#7a1420'; g.beginPath(); g.moveTo(cx - 1.08*s, by + .42*s); g.quadraticCurveTo(cx, by + .9*s, cx + 1.08*s, by + .42*s);
      g.lineTo(cx + .96*s, by + .74*s); g.quadraticCurveTo(cx, by + 1.16*s, cx - .96*s, by + .74*s); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(cx - .96*s, by + .58*s); g.quadraticCurveTo(cx, by + 1.02*s, cx + .96*s, by + .58*s); stitchStroke(g, 'rgba(240,200,120,.7)', s, .8);
      g.strokeStyle = '#d9b04a'; g.lineWidth = s*.08; g.beginPath(); g.ellipse(cx, cy - .48*s, .3*s, .12*s, 0, Math.PI*1.05, Math.PI*1.95); g.stroke();
      g.fillStyle = '#e02424'; ell(g, cx, cy - .62*s, .07*s, .07*s); g.fill();
      break;
    case 'hood':
      g.fillStyle = '#e6d2a0'; ell(g, cx, by + .62*s, .14*s, .14*s); g.fill();
      g.fillStyle = '#7a5aa0'; for (const a of [0, 1.26, 2.51, 3.77, 5.03]){ ell(g, cx + Math.cos(a)*.13*s, by + .62*s + Math.sin(a)*.13*s, .07*s, .07*s); g.fill(); }
      break;
    case 'cap': {   // overseer's peaked cap, with a tally-mark badge
      g.fillStyle = '#1e1a22'; g.beginPath(); g.ellipse(cx, cy - .74*s, .62*s, .3*s, 0, Math.PI, 0); g.closePath(); g.fill();
      g.fillStyle = '#2c2630'; g.fillRect(cx - .62*s, cy - .78*s, 1.24*s, .14*s);
      g.fillStyle = '#121014'; g.beginPath(); g.ellipse(cx + .1*s, cy - .62*s, .7*s, .12*s, .05, 0, Math.PI); g.fill();
      g.fillStyle = '#d9b04a'; ell(g, cx, cy - .86*s, .12*s, .12*s); g.fill();
      g.strokeStyle = '#3a2a10'; g.lineWidth = s*.025; for (const k of [-.05, 0, .05]){ g.beginPath(); g.moveTo(cx + k*s, cy - .93*s); g.lineTo(cx + k*s, cy - .79*s); g.stroke(); }
      g.strokeStyle = '#3b2a1e'; g.lineWidth = s*.07; g.beginPath(); g.moveTo(cx + .95*s, by + .1*s); g.quadraticCurveTo(cx + 1.4*s, by - .4*s, cx + 1.15*s, by - .95*s); g.stroke();
      break;
    }
    case 'kettle': {
      const hg = g.createLinearGradient(cx, cy - 1.15*s, cx, cy - .7*s); hg.addColorStop(0, '#d6dbe2'); hg.addColorStop(1, '#7c838e');
      g.fillStyle = hg; g.beginPath(); g.ellipse(cx, cy - .76*s, .42*s, .36*s, 0, Math.PI, 0); g.closePath(); g.fill();
      g.fillStyle = '#5d636d'; ell(g, cx, cy - .74*s, .7*s, .1*s); g.fill();
      g.fillStyle = '#e8ecf0'; ell(g, cx - .2*s, cy - .92*s, .05*s, .05*s); g.fill();
      break;
    }
  }
  g.restore();
}

function mouse(g, cx, cy, s, L){
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  for (const side of [-1,1]){
    g.fillStyle = L.fur; ell(g, cx + side*.74*s, cy - .62*s, .5*s, .5*s); g.fill(); stitchStroke(g, L.dark, s);
    g.fillStyle = '#f1b5c0'; ell(g, cx + side*.74*s, cy - .6*s, .32*s, .32*s); g.fill();
  }
  const gr = g.createRadialGradient(cx - .3*s, cy - .4*s, s*.1, cx, cy, s*1.1);
  gr.addColorStop(0, L.light); gr.addColorStop(1, L.fur);
  g.fillStyle = gr; g.beginPath(); g.moveTo(cx - .92*s, cy - .1*s);
  g.bezierCurveTo(cx - .95*s, cy - .9*s, cx + .95*s, cy - .9*s, cx + .92*s, cy - .1*s);
  g.bezierCurveTo(cx + .85*s, cy + .5*s, cx + .3*s, cy + .82*s, cx, cy + .86*s);
  g.bezierCurveTo(cx - .3*s, cy + .82*s, cx - .85*s, cy + .5*s, cx - .92*s, cy - .1*s); g.fill(); stitchStroke(g, L.dark, s);
  button(g, cx - .36*s, cy - .08*s, .13*s); button(g, cx + .36*s, cy - .08*s, .13*s);
  g.fillStyle = '#e88a9a'; ell(g, cx, cy + .32*s, .11*s, .09*s); g.fill();
  g.strokeStyle = L.dark; g.lineWidth = Math.max(.7, s*.03);
  for (const side of [-1,1]) for (const dy of [-.06, .08]){ g.beginPath(); g.moveTo(cx + side*.22*s, cy + .36*s); g.lineTo(cx + side*.95*s, cy + .3*s + dy*s*2); g.stroke(); }
  if (L.scarf){
    g.fillStyle = L.scarf; g.beginPath(); g.moveTo(cx - .55*s, cy + .66*s); g.lineTo(cx + .55*s, cy + .66*s); g.lineTo(cx, cy + 1.08*s); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(cx - .4*s, cy + .74*s); g.lineTo(cx + .4*s, cy + .74*s); stitchStroke(g, 'rgba(240,230,210,.7)', s, .7);
  }
  if (L.gear === 'bandana') bandana(g, cx, cy - .05*s, s, L.band || '#8a5a2a', s*.9, s*.6);
  if (L.gear === 'thimble'){
    const tg = g.createLinearGradient(cx - .45*s, 0, cx + .45*s, 0); tg.addColorStop(0, '#8d939c'); tg.addColorStop(.45, '#e4e8ee'); tg.addColorStop(1, '#7a8089');
    g.fillStyle = tg; g.beginPath(); g.moveTo(cx - .46*s, cy - .52*s); g.lineTo(cx - .38*s, cy - 1.2*s); g.quadraticCurveTo(cx, cy - 1.36*s, cx + .38*s, cy - 1.2*s); g.lineTo(cx + .46*s, cy - .52*s); g.closePath(); g.fill();
    g.fillStyle = 'rgba(60,60,70,.45)'; for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++){ ell(g, cx - .27*s + i*.18*s, cy - 1.08*s + j*.17*s, .035*s, .035*s); g.fill(); }
    g.fillStyle = '#c0392b'; g.fillRect(cx - .5*s, cy - .6*s, s, .1*s);
  }
  g.restore();
}

function drawPlush(g, look, cx, cy, s){
  const L = LOOKS[look] || LOOKS.worker;
  ({bun: bunny, frog, mouse})[L.sp](g, cx, cy, s, L);
}
const portraitCache = {};
function plushPortrait(look){
  if (portraitCache[look]) return portraitCache[look];
  const c = document.createElement('canvas'); c.width = 300; c.height = 360;
  const L = LOOKS[look] || LOOKS.worker;
  drawPlush(c.getContext('2d'), look, 150, L.sp === 'bun' ? 175 : 200, L.sp === 'bun' ? 92 : 100);
  return portraitCache[look] = c.toDataURL();
}

// Weapon glyph for the brass badge on each token.
function glyph(g, w, cx, cy, r, col){
  g.save(); g.translate(cx, cy); g.strokeStyle = col; g.fillStyle = col;
  g.lineWidth = Math.max(1.2, r*.2); g.lineCap = 'round'; g.lineJoin = 'round';
  const L = (a, b, c, d) => { g.beginPath(); g.moveTo(a, b); g.lineTo(c, d); g.stroke(); };
  if (w === 'sword'){ g.rotate(Math.PI/4); L(0,-.65*r,0,.2*r); L(-.3*r,.2*r,.3*r,.2*r); L(0,.2*r,0,.55*r); }
  if (w === 'lance'){ g.rotate(Math.PI/4); L(0,.65*r,0,-.3*r); g.beginPath(); g.moveTo(0,-.75*r); g.lineTo(-.18*r,-.28*r); g.lineTo(.18*r,-.28*r); g.closePath(); g.fill(); }
  if (w === 'axe'){ g.rotate(Math.PI/7); L(-.05*r,.65*r,-.05*r,-.6*r); g.beginPath(); g.arc(0,-.3*r,.38*r,-Math.PI/2,Math.PI/2); g.closePath(); g.fill(); }
  if (w === 'bow'){ g.beginPath(); g.arc(-.3*r,0,.62*r,-1.05,1.05); g.stroke(); const ex = -.3*r + .62*r*Math.cos(1.05), ey = .62*r*Math.sin(1.05); g.lineWidth *= .5; L(ex,-ey,ex,ey); g.lineWidth *= 2; L(-.15*r,0,.6*r,0); }
  if (w === 'staff'){ g.rotate(Math.PI/4); L(0,.68*r,0,-.45*r); g.lineWidth *= .6; g.beginPath(); g.ellipse(0,-.5*r,.1*r,.2*r,0,0,Math.PI*2); g.stroke(); g.beginPath(); g.moveTo(0,-.6*r); g.quadraticCurveTo(.6*r,-.4*r,.3*r,.1*r); g.stroke(); }
  g.restore();
}

// Portrait markup for panels, cards and dialogue. Uses real art when art/<key>-portrait.png exists.
function portraitInner(ent, where = 'panel'){
  if (typeof ent === 'string') ent = {key: ent, look: SPEAKERS[ent]?.look || ent};
  const look = ent.look, ak = artResolve(ent, 'portrait'), art = ak && ART[ak].portrait;
  const crop = ak && (ART_CROP[ak] || (ak.startsWith('miner') ? ART_CROP.miner : ak.startsWith('grunt') ? ART_CROP.grunt : null))?.[where];
  if (art) return `<div class="porart" style="background-image:url(${art});background-size:${crop ? crop[0] : '200% auto'};background-position:${crop ? crop[1] : '50% 0%'}"></div>`;
  return `<img alt="" src="${plushPortrait(look)}">`;
}
