// ================= Music and sound effects =================
// Everything is synthesised in the browser with Web Audio: no sound files, so the game stays one file.
//   Music.want(track)   loop a track (crossfades; does nothing if it is already playing)
//   Music.jingle(name)  a one-shot (victory, defeat…); a track asked for meanwhile starts once it ends
//   Sfx.play(name)      a sound effect
// Browsers only allow sound after the player has touched the page, so the audio starts on the first tap.
// Setting (remembered): 'all' | 'sfx' (effects only) | 'off'.

const Audio_ = (() => {
  let ctx = null, master, musicBus, sfxBus, verb, noiseBuf;
  let mode = 'all';
  try { mode = localStorage.getItem('raepublic-sound') || 'all'; } catch (e){}

  function init(){
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = .9;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
    master.connect(comp); comp.connect(ctx.destination);
    musicBus = ctx.createGain(); sfxBus = ctx.createGain();
    musicBus.connect(master); sfxBus.connect(master);
    // a soft room reverb, shared
    const len = ctx.sampleRate*2.2, ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++){ const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random()*2 - 1)*Math.pow(1 - i/len, 3); }
    verb = ctx.createConvolver(); verb.buffer = ir; const vg = ctx.createGain(); vg.gain.value = .28; verb.connect(vg); vg.connect(master);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const nd = noiseBuf.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random()*2 - 1;
    applyMode();
    return ctx;
  }
  function applyMode(){
    if (!ctx) return;
    const t = ctx.currentTime;
    musicBus.gain.setTargetAtTime(mode === 'all' ? .42 : 0, t, .15);
    sfxBus.gain.setTargetAtTime(mode === 'off' ? 0 : .75, t, .05);
  }
  // first touch: create / resume the audio (iOS needs this inside a gesture)
  const unlock = () => {
    if (!init()) return;
    if (ctx.state !== 'running') ctx.resume();
    // iOS: play one silent buffer inside the gesture
    const b = ctx.createBufferSource(); b.buffer = ctx.createBuffer(1, 1, 22050); b.connect(ctx.destination); b.start();
    Music.kick();
  };
  for (const ev of ['pointerdown', 'touchend', 'keydown']) window.addEventListener(ev, unlock, {capture: true, passive: true});
  document.addEventListener('visibilitychange', () => { if (!ctx) return; if (document.hidden) ctx.suspend(); else ctx.resume(); });

  return {
    get ctx(){ return ctx; }, get master(){ return master; }, get musicBus(){ return musicBus; }, get sfxBus(){ return sfxBus; },
    get verb(){ return verb; }, get noise(){ return noiseBuf; }, ready: () => !!ctx && ctx.state === 'running',
    get mode(){ return mode; },
    setMode(m){ mode = m; try { localStorage.setItem('raepublic-sound', m); } catch (e){} applyMode(); },
    cycle(){ this.setMode(mode === 'all' ? 'sfx' : mode === 'sfx' ? 'off' : 'all'); return mode; },
  };
})();
const SOUND_LABEL = {all: '♪ Sound: On', sfx: '♪ Effects Only', off: '♪ Sound: Off'};

// ---------- Synth voices ----------
const NOTE_IDX = {C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11};
function midiOf(n){ const m = /^([A-G])(#|b)?(-?\d)$/.exec(n); if (!m) return null; return 12*(+m[3] + 1) + NOTE_IDX[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0); }
const hz = m => 440*Math.pow(2, (m - 69)/12);
function env(g, t, a, peak, d, sus, rel, end){   // attack, decay to sustain, release at end
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + a);
  g.gain.exponentialRampToValueAtTime(Math.max(.0001, peak*sus), t + a + d);
  g.gain.setValueAtTime(Math.max(.0001, peak*sus), Math.max(t + a + d, end));
  g.gain.exponentialRampToValueAtTime(.0001, Math.max(t + a + d, end) + rel);
  return Math.max(t + a + d, end) + rel + .05;
}
function osc(type, f, t, stop, out, detune = 0){
  const o = Audio_.ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); o.detune.value = detune; o.connect(out); o.start(t); o.stop(stop); return o;
}
function noiseSrc(t, stop, out){ const s = Audio_.ctx.createBufferSource(); s.buffer = Audio_.noise; s.loop = true; s.connect(out); s.start(t, Math.random()*.5); s.stop(stop); return s; }
function filt(type, f, q = .7){ const b = Audio_.ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; }
function voiceOut(bus, wet){ const g = Audio_.ctx.createGain(); g.connect(bus); if (wet){ const w = Audio_.ctx.createGain(); w.gain.value = wet; g.connect(w); w.connect(Audio_.verb); } return g; }

// Instruments: (time, frequency, duration in seconds, velocity 0..1, output) → stop time
const INST = {
  flute(t, f, d, v, out){   // breathy wooden flute with a late vibrato
    const g = Audio_.ctx.createGain(); g.connect(out);
    const lp = filt('lowpass', 2600); lp.connect(g);
    const end = env(g, t, .06, .22*v, .1, .8, .14, t + d);
    const o1 = osc('triangle', f, t, end, lp), o2 = osc('sine', f*2, t, end, lp);
    const o2g = Audio_.ctx.createGain(); o2g.gain.value = .15; o2.disconnect(); o2.connect(o2g); o2g.connect(lp);
    const lfo = Audio_.ctx.createOscillator(), lg = Audio_.ctx.createGain(); lfo.frequency.value = 5.2;
    lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f*.006, t + Math.min(.35, d)); lfo.connect(lg); lg.connect(o1.frequency); lfo.start(t); lfo.stop(end);
    const ng = Audio_.ctx.createGain(), nb = filt('bandpass', f*2, 2); ng.gain.setValueAtTime(.05*v, t); ng.gain.exponentialRampToValueAtTime(.0001, t + .09);
    noiseSrc(t, t + .1, nb); nb.connect(ng); ng.connect(g);
    return end;
  },
  pluck(t, f, d, v, out){   // harp / lute
    const g = Audio_.ctx.createGain(); g.connect(out);
    const lp = filt('lowpass', 3200); lp.frequency.setValueAtTime(3600, t); lp.frequency.exponentialRampToValueAtTime(700, t + .5); lp.connect(g);
    g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(.16*v, t + .005); g.gain.exponentialRampToValueAtTime(.0001, t + .9 + d*.3);
    const end = t + 1 + d*.3; osc('triangle', f, t, end, lp); osc('sawtooth', f, t, end, lp, 4);
    return end;
  },
  bass(t, f, d, v, out){
    const g = Audio_.ctx.createGain(); g.connect(out); const lp = filt('lowpass', 520); lp.connect(g);
    const end = env(g, t, .01, .32*v, .18, .55, .08, t + d*.9);
    osc('triangle', f, t, end, lp); osc('sine', f/2, t, end, lp);
    return end;
  },
  pad(t, f, d, v, out){
    const g = Audio_.ctx.createGain(); g.connect(out); const lp = filt('lowpass', 900); lp.connect(g);
    const end = env(g, t, .45, .05*v, .3, .8, .7, t + d);
    osc('sawtooth', f, t, end, lp, -7); osc('sawtooth', f, t, end, lp, 7); osc('triangle', f/2, t, end, lp);
    return end;
  },
  lead(t, f, d, v, out){   // the battle melody: a soft square
    const g = Audio_.ctx.createGain(); g.connect(out); const lp = filt('lowpass', 2200); lp.connect(g);
    const end = env(g, t, .012, .11*v, .12, .7, .08, t + d*.92);
    const o = osc('square', f, t, end, lp); osc('sawtooth', f, t, end, lp, 9);
    const lfo = Audio_.ctx.createOscillator(), lg = Audio_.ctx.createGain(); lfo.frequency.value = 6; lg.gain.value = f*.004; lfo.connect(lg); lg.connect(o.frequency); lfo.start(t + .15); lfo.stop(end);
    return end;
  },
  brass(t, f, d, v, out){
    const g = Audio_.ctx.createGain(); g.connect(out); const lp = filt('lowpass', 600, 1.2); lp.connect(g);
    lp.frequency.setValueAtTime(500, t); lp.frequency.linearRampToValueAtTime(2400, t + .07); lp.frequency.exponentialRampToValueAtTime(1300, t + .3);
    const end = env(g, t, .04, .16*v, .2, .75, .12, t + d*.95);
    osc('sawtooth', f, t, end, lp); osc('sawtooth', f, t, end, lp, 6); osc('square', f/2, t, end, lp);
    return end;
  },
  bell(t, f, d, v, out){
    const g = Audio_.ctx.createGain(); g.connect(out);
    g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(.14*v, t + .004); g.gain.exponentialRampToValueAtTime(.0001, t + 1.6);
    osc('sine', f, t, t + 1.7, g);
    const h = Audio_.ctx.createGain(); h.gain.setValueAtTime(.35, t); h.gain.exponentialRampToValueAtTime(.001, t + .5); h.connect(g); osc('sine', f*2.76, t, t + .6, h);
    return t + 1.7;
  },
  // drums (the note is ignored)
  kick(t, f, d, v, out){
    const g = Audio_.ctx.createGain(); g.connect(out); g.gain.setValueAtTime(.55*v, t); g.gain.exponentialRampToValueAtTime(.0001, t + .28);
    const o = osc('sine', 130, t, t + .3, g); o.frequency.exponentialRampToValueAtTime(42, t + .14); return t + .3;
  },
  snare(t, f, d, v, out){
    const g = Audio_.ctx.createGain(); g.connect(out); g.gain.setValueAtTime(.22*v, t); g.gain.exponentialRampToValueAtTime(.0001, t + .16);
    const hp = filt('highpass', 1400); hp.connect(g); noiseSrc(t, t + .18, hp);
    const tg = Audio_.ctx.createGain(); tg.gain.setValueAtTime(.18*v, t); tg.gain.exponentialRampToValueAtTime(.0001, t + .08); tg.connect(out); osc('triangle', 190, t, t + .1, tg);
    return t + .2;
  },
  hat(t, f, d, v, out){
    const g = Audio_.ctx.createGain(); g.connect(out); g.gain.setValueAtTime(.07*v, t); g.gain.exponentialRampToValueAtTime(.0001, t + .045);
    const hp = filt('highpass', 7500); hp.connect(g); noiseSrc(t, t + .06, hp); return t + .06;
  },
  tom(t, f, d, v, out){   // bodhrán-like frame drum
    const g = Audio_.ctx.createGain(); g.connect(out); g.gain.setValueAtTime(.35*v, t); g.gain.exponentialRampToValueAtTime(.0001, t + .32);
    const o = osc('sine', 120, t, t + .34, g); o.frequency.exponentialRampToValueAtTime(68, t + .2);
    const ng = Audio_.ctx.createGain(), lp = filt('lowpass', 900); ng.gain.setValueAtTime(.08*v, t); ng.gain.exponentialRampToValueAtTime(.0001, t + .06); lp.connect(ng); ng.connect(out); noiseSrc(t, t + .07, lp);
    return t + .35;
  },
  tamb(t, f, d, v, out){
    const g = Audio_.ctx.createGain(); g.connect(out); g.gain.setValueAtTime(.05*v, t); g.gain.exponentialRampToValueAtTime(.0001, t + .1);
    const bp = filt('bandpass', 8500, 1.5); bp.connect(g); noiseSrc(t, t + .12, bp); return t + .12;
  },
};
const DRUM_KEY = {k: 'kick', s: 'snare', h: 'hat', t: 'tom', m: 'tamb'};

// ---------- Patterns ----------
// A part is a string of steps separated by spaces: a note ("D5", or a chord "D4+F4+A4") starts a note,
// "-" holds it, "." is a rest. Drum parts use k s h t m (several letters in one step play together).
// Accompaniment is generated from a chord per bar.
const CHORD_Q = {'': [0, 4, 7], m: [0, 3, 7], dim: [0, 3, 6], 7: [0, 4, 7, 10]};
function chordTones(name, oct){
  const m = /^([A-G](?:#|b)?)(m|dim|7)?$/.exec(name);
  const root = midiOf(m[1] + oct); return CHORD_Q[m[2] || ''].map(i => root + i);
}
function parsePart(str, drums){
  const toks = str.trim().split(/\s+/), ev = [];
  toks.forEach((tk, i) => {
    if (tk === '.' || tk === '-') return;
    let len = 1; while (toks[i + len] === '-') len++;
    if (drums) for (const ch of tk) ev.push({step: i, len: 1, drum: DRUM_KEY[ch]});
    else ev.push({step: i, len, notes: tk.split('+').map(midiOf)});
  });
  return {ev, steps: toks.length};
}
// Generated accompaniment. kinds: waltz (bass on 1, chord on 2 and 3), arp (rolling 8ths), march (root–fifth),
// gallop (driving 8ths), ostinato (menacing repeated root), pad (held chord), stab (chords on the off-beats)
function accomp(kind, chords, bar, oct = 3){
  const out = [];
  chords.forEach((c, b) => {
    const tn = chordTones(c, oct), r = tn[0], s0 = b*bar;
    const add = (st, notes, len) => out.push({step: s0 + st, len, notes});
    if (kind === 'waltz'){ add(0, [r - 12], 2); add(2, tn.slice(1).concat(r + 12), 2); add(4, tn.slice(1).concat(r + 12), 2); }
    else if (kind === 'arp'){ const seq = [r, r + 7, r + 12, tn[1] + 12, r + 19, tn[1] + 12, r + 12, r + 7]; for (let i = 0; i < bar; i++) add(i, [seq[i % 8]], 1); }
    else if (kind === 'march'){ add(0, [r - 12], 3); add(bar/2, [r - 5], 3); }
    else if (kind === 'gallop'){ const seq = [0, 0, 12, 0, 0, 0, 12, 7]; for (let i = 0; i < bar; i++) add(i, [r - 12 + seq[i % 8]], 1); }
    else if (kind === 'ostinato'){ const seq = [0, null, 0, null, 0, 3, 1, null]; for (let i = 0; i < bar; i++) if (seq[i % 8] !== null) add(i, [r - 12 + seq[i % 8]], 1); }
    else if (kind === 'pad') add(0, tn, bar);
    else if (kind === 'stab'){ for (let i = 2; i < bar; i += 4) add(i, tn.slice(1).concat(r + 12), 1); }
  });
  return {ev: out, steps: chords.length*bar};
}

// ---------- Tracks ----------
// bpm counts quarter notes; every step is an eighth note. `bar` = steps per bar.
const TRACKS = (() => {
  const P = (inst, pat, vel = 1, wet = .3) => ({inst, ...parsePart(Array.isArray(pat) ? pat.join(' ') : pat, false), vel, wet});
  const D = (pat, vel = 1, bars = 1) => ({inst: 'drum', ...parsePart(Array(bars).fill(pat).join(' '), true), vel, wet: .1});
  const A = (inst, kind, chords, bar, oct, vel = 1, wet = .3) => ({inst, ...accomp(kind, chords, bar, oct), vel, wet});
  const T = {};

  // Title: a slow folk waltz in D minor
  { const ch = ['Dm', 'Dm', 'Bb', 'C', 'Dm', 'Bb', 'C', 'A'];
    T.title = {bpm: 88, bar: 6, parts: [
      P('flute', ['A4 - - - F4 G4', 'A4 - D5 - C5 A4', 'Bb4 - - - A4 G4', 'G4 - E4 - C4 -', 'D4 - F4 - A4 -', 'D5 - - - C5 Bb4', 'C5 - G4 - E4 -', 'E4 - A4 - C#5 -'], .9, .4),
      A('pluck', 'waltz', ch, 6, 3, .8), A('pad', 'pad', ch, 6, 3, .7, .5)]}; }

  // The Raepublic's camp: quiet, stubborn, D dorian, with a frame drum
  { const ch = ['Dm', 'C', 'G', 'Dm', 'F', 'C', 'G', 'A'];
    T.raeCamp = {bpm: 84, bar: 8, parts: [
      P('flute', ['D5 - - - C5 - A4 -', 'G4 - - - E4 - G4 -', 'B4 - - - A4 - G4 -', 'A4 - - - - - - -', 'F4 - A4 - C5 - D5 -', 'E5 - D5 - C5 - - -', 'D5 - B4 - G4 - B4 -', 'A4 - - - C#5 - E5 -'], .85, .35),
      A('pluck', 'arp', ch, 8, 3, .6), A('bass', 'march', ch, 8, 3, .7, .1), A('pad', 'pad', ch, 8, 3, .5, .5),
      D('t . . t . . m .', .7, 8)]}; }

  // The Friggliarchy's court: a stately march in B-flat with brass and bells
  { const ch = ['Bb', 'F', 'Gm', 'Eb', 'Bb', 'F', 'Eb', 'Bb'];
    T.frogCamp = {bpm: 100, bar: 8, parts: [
      P('brass', ['Bb4 - - D5 F5 - - -', 'F5 - Eb5 - D5 - C5 -', 'D5 - - Bb4 G4 - - -', 'Eb5 - D5 - C5 - - -', 'Bb4 - - D5 F5 - Bb5 -', 'A5 - G5 - F5 - - -', 'G5 - Eb5 - F5 - D5 -', 'Bb4 - - - - - - .'], .8, .3),
      A('bell', 'stab', ch, 8, 4, .55, .4), A('bass', 'march', ch, 8, 3, .8, .1), A('pad', 'pad', ch, 8, 3, .45, .5),
      D('k . s . k . s s', .55, 8)]}; }

  // Story scenes: harp and pad, a sparse flute
  { const ch = ['Dm', 'Bb', 'F', 'C', 'Dm', 'Bb', 'Gm', 'A'];
    T.story = {bpm: 66, bar: 8, parts: [
      P('flute', ['. . . . A4 - - -', 'F4 - - - D4 - - -', '. . . . C5 - A4 -', 'G4 - - - - - - -', '. . . . A4 - D5 -', 'D5 - - - C5 - Bb4 -', 'Bb4 - - - A4 - G4 -', 'A4 - - - - - - .'], .7, .5),
      A('pluck', 'arp', ch, 8, 3, .45, .45), A('pad', 'pad', ch, 8, 3, .6, .6)]}; }

  // Battle, player phase: driving D minor
  { const ch = ['Dm', 'Dm', 'Bb', 'C', 'Dm', 'Dm', 'Bb', 'A'];
    T.battle = {bpm: 132, bar: 8, parts: [
      P('lead', ['D5 - - A4 D5 - E5 F5', 'E5 - D5 - C5 - A4 -', 'Bb4 - - F4 Bb4 - C5 D5', 'C5 - Bb4 - A4 - G4 -', 'D5 - - A4 D5 - F5 G5', 'A5 - G5 - F5 - E5 -', 'F5 - - D5 Bb4 - D5 -', 'E5 - - - C#5 - - -'], .9, .2),
      A('bass', 'gallop', ch, 8, 3, .8, .05), A('pad', 'pad', ch, 8, 4, .5, .3), A('pluck', 'stab', ch, 8, 4, .5, .2),
      D('kh h sh h kh kh sh h', .8, 8)]}; }

  // Battle, enemy phase: low brass over a creeping ostinato
  { const ch = ['Dm', 'Dm', 'Bb', 'A', 'Dm', 'Dm', 'Gm', 'A'];
    T.enemy = {bpm: 120, bar: 8, parts: [
      P('brass', ['A3 - - - Bb3 - A3 -', 'F3 - - - E3 - D3 -', 'F3 - - - G3 - F3 -', 'E3 - - - C#3 - - -', 'A3 - - - Bb3 - A3 -', 'D4 - - - C4 - A3 -', 'Bb3 - - - A3 - G3 -', 'A3 - - - - - - -'], .85, .25),
      A('bass', 'ostinato', ch, 8, 3, .9, .05), A('pad', 'pad', ch, 8, 3, .5, .4),
      D('k . . k s . . .', .8, 8), D('h . h . h . h .', .5, 8)]}; }

  // A boss has spoken: faster, fiercer
  { const ch = ['Dm', 'Eb', 'Dm', 'A', 'Dm', 'Bb', 'Gm', 'A'];
    T.boss = {bpm: 144, bar: 8, parts: [
      P('lead', ['D5 - F5 - A5 - G#5 -', 'G5 - - - Eb5 - - -', 'F5 - E5 - D5 - A4 -', 'C#5 - - - E5 - - -', 'D5 - F5 - A5 - D6 -', 'C6 - Bb5 - A5 - G5 -', 'Bb5 - A5 - G5 - E5 -', 'A5 - - - - - - -'], .9, .2),
      P('brass', ['D4 - - - - - - -', 'Eb4 - - - - - - -', 'D4 - - - - - - -', 'C#4 - - - E4 - - -', 'D4 - - - - - - -', 'D4 - - - - - - -', 'D4 - - - - - - -', 'C#4 - - - - - - -'], .6, .2),
      A('bass', 'gallop', ch, 8, 3, .9, .05), A('pad', 'pad', ch, 8, 4, .4, .3),
      D('kh h sh h kh kh sh sh', .9, 8)]}; }

  // One-shots
  T.victory = {bpm: 120, bar: 8, once: true, parts: [
    P('brass', 'D5 F#5 A5 - D6 - - - - - - - - - - .', .9, .4), P('bell', 'D5 F#5 A5 - D6 - - - . . . . . . . .', .5, .5),
    P('pad', 'D4+F#4+A4 - - - - - - - - - - - - - - .', .8, .6), D('k k k . s . . . . . . . . . . .', .8)]};
  T.defeat = {bpm: 64, bar: 8, once: true, parts: [
    P('flute', 'A4 - F4 - D4 - - - C#4 - - - D4 - - .', .8, .6), P('pad', 'D3+F3+A3 - - - - - - - A2+C#3+E3 - - - D3+F3+A3 - - .', .8, .6)]};
  T.levelup = {bpm: 180, bar: 8, once: true, parts: [P('bell', 'C5 E5 G5 C6 - - - .', .9, .5), P('pluck', 'C4 E4 G4 C5 - - - .', .7, .4)]};
  T.rare = {bpm: 132, bar: 8, once: true, parts: [
    P('brass', 'C5 E5 G5 C6 - - E6 - G6 - - - - - - .', .8, .5), P('bell', 'C6 E6 G6 C7 - - - - G6 - - - - - - .', .6, .6),
    P('pad', 'C4+E4+G4 - - - - - - - - - - - - - - .', .8, .6), D('k . . . s . . . k . . . . . . .', .7)]};
  return T;
})();

// ---------- The sequencer ----------
const Music = (() => {
  let cur = null, want = null, timer = null, jingleUntil = 0;
  function start(name){
    const ctx = Audio_.ctx, tr = TRACKS[name]; if (!ctx || !tr) return;
    const gain = ctx.createGain(); gain.gain.setValueAtTime(.0001, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(1, ctx.currentTime + .6); gain.connect(Audio_.musicBus);
    const outs = tr.parts.map(p => voiceOut(gain, p.wet));
    const steps = Math.max(...tr.parts.map(p => p.steps)), dt = 60/tr.bpm/2;
    const st = {name, tr, gain, outs, steps, dt, next: ctx.currentTime + .08, step: 0, done: false};
    cur = st;
  }
  function fadeOut(st, sec = .7){
    if (!st) return; const t = Audio_.ctx.currentTime;
    st.gain.gain.cancelScheduledValues(t); st.gain.gain.setValueAtTime(st.gain.gain.value || .0001, t); st.gain.gain.exponentialRampToValueAtTime(.0001, t + sec);
    st.done = true; setTimeout(() => st.gain.disconnect(), sec*1000 + 3000);
  }
  function tick(){
    const ctx = Audio_.ctx; if (!ctx || ctx.state !== 'running') return;
    // a queued track starts once any jingle has finished
    if (want && (!cur || cur.done || cur.name !== want) && ctx.currentTime >= jingleUntil){ if (cur && !cur.done) fadeOut(cur); start(want); }
    const st = cur; if (!st || st.done) return;
    while (st.next < ctx.currentTime + .15){
      const s = st.step % st.steps;
      st.tr.parts.forEach((p, pi) => {
        for (const e of p.ev) if (e.step === s){
          if (Audio_.mode !== 'all') continue;   // keep time silently when music is off
          if (e.drum) INST[e.drum](st.next, 0, st.dt, p.vel, st.outs[pi]);
          else for (const m of e.notes) INST[p.inst](st.next, hz(m), e.len*st.dt, p.vel, st.outs[pi]);
        }
      });
      st.next += st.dt; st.step++;
      if (st.tr.once && st.step >= st.steps){ st.done = true; setTimeout(() => st.gain.disconnect(), 4000); break; }
    }
  }
  return {
    kick(){ if (!timer) timer = setInterval(tick, 30); tick(); },
    want(name){ want = name; if (Audio_.ready()) tick(); },
    get current(){ return want; },
    // a one-shot: fades the loop out, plays, and anything asked for meanwhile follows it
    jingle(name){
      if (!Audio_.ready()) return;
      const tr = TRACKS[name], ctx = Audio_.ctx; if (!tr) return;
      if (cur && !cur.done) fadeOut(cur, .35);
      const back = want; want = null;
      const steps = Math.max(...tr.parts.map(p => p.steps));
      jingleUntil = ctx.currentTime + steps*60/tr.bpm/2 + .3;
      start(name); want = back;   // the loop that was playing comes back afterwards (unless something else is asked for)
    },
    stop(){ want = null; if (cur && !cur.done) fadeOut(cur); },
  };
})();

// ---------- Sound effects ----------
const Sfx = (() => {
  const C = () => Audio_.ctx, out = wet => voiceOut(Audio_.sfxBus, wet);
  const blip = (f1, f2, dur, vol, type = 'sine', wet = 0) => {
    const t = C().currentTime, g = out(wet); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    const o = osc(type, f1, t, t + dur + .02, g); if (f2 !== f1) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
  };
  const noise = (type, f, q, dur, vol, sweepTo, delay = 0, wet = 0) => {
    const t = C().currentTime + delay, g = out(wet), b = filt(type, f, q); b.connect(g);
    if (sweepTo) b.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
    g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(vol, t + Math.min(.02, dur/4)); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    noiseSrc(t, t + dur + .02, b);
  };
  const notes = (inst, list, gap, vel = 1, wet = .4) => { const t = C().currentTime, o = out(wet); list.forEach((n, i) => INST[inst](t + i*gap, hz(midiOf(n)), gap*1.5, vel, o)); };
  let lastBlip = 0;
  const S = {
    tap(){ blip(660, 880, .05, .07, 'triangle'); },
    back(){ blip(520, 360, .07, .07, 'triangle'); },
    select(){ blip(700, 700, .05, .08, 'triangle'); setTimeout(() => blip(1050, 1050, .07, .07, 'triangle'), 45); },
    cursor(){ blip(1200, 1200, .025, .035, 'sine'); },
    step(){ noise('lowpass', 500, 1, .06, .12); blip(90, 60, .05, .1); },
    swing(){ noise('bandpass', 700, 1.2, .2, .4, 2600); },
    twang(){ const t = C().currentTime, g = out(.1); INST.pluck(t, 196, .1, 1.4, g); noise('highpass', 3000, .7, .06, .06); },
    crack(){ noise('highpass', 2500, .8, .07, .35); blip(1800, 600, .05, .12, 'square'); },
    hit(){ blip(150, 50, .16, .55); noise('lowpass', 1800, .8, .12, .35); },
    crit(){ blip(170, 40, .3, .7); noise('lowpass', 2600, .8, .22, .5); notes('bell', ['E6', 'B6'], .04, .9, .3); },
    nodamage(){ blip(900, 900, .12, .08, 'triangle'); noise('bandpass', 3000, 6, .15, .1); },
    miss(){ noise('bandpass', 1200, 1.5, .25, .35, 400); },
    unstitch(){ for (let i = 0; i < 7; i++) noise('bandpass', 2400 - i*220, 3, .05, .45, null, i*.045); blip(300, 80, .45, .3, 'sawtooth'); },
    flee(){ noise('bandpass', 900, 1, .35, .2, 3000); for (let i = 0; i < 4; i++) setTimeout(() => S.step(), 80 + i*90); },
    heal(){ notes('bell', ['C6', 'E6', 'G6', 'C7'], .07, .7, .6); },
    exp(){ blip(1400, 1800, .06, .04, 'triangle'); },
    phase(f){ const t = C().currentTime, g = out(.4); INST.tom(t, 0, 0, 1.2, g);
      if (f === 'e'){ INST.brass(t + .05, hz(midiOf('D3')), .5, .9, g); INST.brass(t + .05, hz(midiOf('A3')), .5, .7, g); }
      else { INST.brass(t + .05, hz(midiOf('D4')), .18, .8, g); INST.brass(t + .25, hz(midiOf('A4')), .45, .9, g); } },
    reinforce(){ const t = C().currentTime, g = out(.4); INST.brass(t, hz(midiOf('A3')), .3, .8, g); INST.brass(t + .3, hz(midiOf('Bb3')), .5, .8, g); },
    blip(f){   // dialogue typing; rabbits a little higher than frogs
      const now = performance.now(); if (now - lastBlip < 55) return; lastBlip = now;
      const hz0 = f === 'frog' ? 260 + Math.random()*40 : f === 'rae' ? 520 + Math.random()*60 : 400 + Math.random()*40;
      blip(hz0, hz0*.9, .035, .03, 'triangle');
    },
    page(){ noise('bandpass', 2500, 1, .12, .07, 5000); },
    seal(){ noise('lowpass', 1200, 1, .25, .4); blip(220, 60, .25, .4); },
    flip(){ noise('bandpass', 1800, 1.4, .12, .24, 4200); },
    star(n){ notes(n >= 3 ? 'bell' : 'pluck', n >= 3 ? ['G5', 'C6', 'E6', 'G6'] : n === 2 ? ['E5', 'A5'] : ['C5'], .06, .8, .5); },
    levelup(){ notes('bell', ['C5', 'E5', 'G5', 'C6'], .08, .9, .5); notes('pluck', ['C4', 'E4', 'G4', 'C5'], .08, .6, .3); },
    coin(){ notes('bell', ['B5', 'E6'], .06, .7, .2); },
    toast(){ notes('bell', ['A5'], .1, .4, .3); },
  };
  return {play(name, ...a){ if (!Audio_.ready() || Audio_.mode === 'off' || !S[name]) return; try { S[name](...a); } catch (e){} }};
})();

// ---------- Wiring that isn't tied to one screen ----------
const SOUND_SHORT = {all: '♪ On', sfx: '♪ FX only', off: '♪ Off'};
function soundLabels(){ document.querySelectorAll('[data-sound]').forEach(b => { b.textContent = SOUND_SHORT[Audio_.mode]; b.setAttribute('aria-label', SOUND_LABEL[Audio_.mode]); }); }
// every button clicks; the sound button cycles On → Effects only → Off
document.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b || b.disabled) return;
  if ('sound' in b.dataset){ e.stopPropagation(); Audio_.cycle(); soundLabels(); Sfx.play('tap'); return; }
  if (b.classList.contains('gcard')) return;   // cards have their own flip
  const back = /‹|Back|Cancel|Resume/.test(b.textContent) || b.dataset.act === 'cancel' || b.dataset.act === 'back';
  Sfx.play(back ? 'back' : 'tap');
}, true);
