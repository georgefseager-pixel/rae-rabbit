// ============================================================
// audio.js — all sound effects, made with code (no sound files!)
// ============================================================
// Browsers only allow sound after the player clicks, so Sfx.init()
// is called from the "Click to start" screen.

const Sfx = {
  ctx: null,
  master: null,

  init() {
    if (this.ctx) { this.ctx.resume(); return; }
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.6; // overall volume (0 = silent, 1 = loud)
    this.master.connect(this.ctx.destination);
    // Some browsers only allow sound after a click or key press (a controller
    // button may not count), so wake the sound up on the next one if needed.
    const wake = () => { if (this.ctx.state === "suspended") this.ctx.resume(); };
    window.addEventListener("keydown", wake);
    window.addEventListener("mousedown", wake);
  },

  // A soft, springy "boing" for hops
  boing() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const pitch = 0.9 + Math.random() * 0.2; // tiny variation so it's not repetitive
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(180 * pitch, t);
    osc.frequency.exponentialRampToValueAtTime(520 * pitch, t + 0.1);
    osc.frequency.exponentialRampToValueAtTime(320 * pitch, t + 0.25);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.35, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    osc.connect(gain).connect(this.master);
    osc.start(t);
    osc.stop(t + 0.32);
  },

  // A wobbly "sproing" for bouncing on springy things like the bed
  spring() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    // a fast wobble (LFO) on the pitch makes it sound like a coiled spring
    const wobble = this.ctx.createOscillator();
    const wobbleDepth = this.ctx.createGain();
    wobble.frequency.value = 28;
    wobbleDepth.gain.setValueAtTime(90, t);
    wobbleDepth.gain.exponentialRampToValueAtTime(5, t + 0.45);
    wobble.connect(wobbleDepth).connect(osc.frequency);

    osc.type = "triangle";
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(700, t + 0.18);
    osc.frequency.exponentialRampToValueAtTime(480, t + 0.45);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.3, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    osc.connect(gain).connect(this.master);
    osc.start(t); wobble.start(t);
    osc.stop(t + 0.52); wobble.stop(t + 0.52);
  },

  // One tiny squeaky "mi" syllable for Rae's babbly voice.
  // excited = true makes it higher and bouncier (used for CAPITAL letters).
  // voice "frog" = lower and croakier
  babble(excited = false, voice = "rae") {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const notes = voice === "frog" ? [196, 220, 247, 262, 294]        // low, froggy
      : voice === "minifrog" ? [440, 494, 523, 587, 659]                // small, croaky-squeaky
      : voice === "willow" ? [523, 587, 659, 698, 784]                  // prim and proper
      : voice === "flopsy" ? [988, 1109, 1175, 1319, 1480]              // tiny and squeaky
      : [660, 740, 784, 880, 988];                                      // Rae: cheerful
    let freq = notes[Math.floor(Math.random() * notes.length)];
    if (excited) freq *= 1.25;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(freq * 1.15, t);           // starts a bit high...
    osc.frequency.exponentialRampToValueAtTime(freq, t + 0.03); // ...and settles: "mi"
    filter.type = "lowpass";
    filter.frequency.value = 2400; // softens the square wave so it's cute, not harsh
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.12, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    osc.connect(filter).connect(gain).connect(this.master);
    osc.start(t);
    osc.stop(t + 0.08);
  },

  // A little "oof!" when Rae gets hurt: a squeaky voice dropping in pitch, plus a soft thump
  hurt() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(700, t);
    osc.frequency.exponentialRampToValueAtTime(260, t + 0.22);
    filter.type = "lowpass";
    filter.frequency.value = 1500;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.2, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.26);
    osc.connect(filter).connect(gain).connect(this.master);
    osc.start(t);
    osc.stop(t + 0.28);

    const thump = this.ctx.createOscillator();
    const tg = this.ctx.createGain();
    thump.frequency.setValueAtTime(160, t);
    thump.frequency.exponentialRampToValueAtTime(60, t + 0.15);
    tg.gain.setValueAtTime(0.35, t);
    tg.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    thump.connect(tg).connect(this.master);
    thump.start(t);
    thump.stop(t + 0.2);
  },

  // A quick "fwip!" whoosh for a punch
  punch() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const len = Math.floor(this.ctx.sampleRate * 0.16);
    const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = 2;
    filter.frequency.setValueAtTime(600, t);
    filter.frequency.exponentialRampToValueAtTime(2800, t + 0.12); // rising swish
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.35, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
    src.connect(filter).connect(gain).connect(this.master);
    src.start(t);
    src.stop(t + 0.16);
  },

  // A bouncy little 4-second dance tune (melody + bass)
  danceTune() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime, beat = 0.25;
    const melody = [784, 988, 1175, 988, 784, 988, 1319, 1175, 880, 1047, 1319, 1047, 880, 1175, 1568, 1319];
    const bass = [196, 196, 247, 247, 220, 220, 262, 262];
    melody.forEach((freq, i) => this.note(freq, t + i * beat, beat * 0.8, 0.13, "triangle"));
    bass.forEach((freq, i) => this.note(freq, t + i * beat * 2, beat * 1.6, 0.16, "sine"));
  },

  // One plain note (used by the dance tune)
  note(freq, start, length, volume, type) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
    osc.connect(gain).connect(this.master);
    osc.start(start);
    osc.stop(start + length + 0.02);
  },

  // An achievement: a bright little rising fanfare
  achievement() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    [523, 659, 784, 1047, 1319].forEach((freq, i) => this.note(freq, t + i * 0.08, 0.35, 0.12, "triangle"));
  },

  // A rumbly tummy: "grrrrbl-wubble" (too many carrots!)
  rumble() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const wobble = this.ctx.createOscillator();
    const wobbleAmount = this.ctx.createGain();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(70, t);
    osc.frequency.linearRampToValueAtTime(110, t + 0.5);
    osc.frequency.linearRampToValueAtTime(55, t + 1.1);
    wobble.frequency.value = 9;
    wobbleAmount.gain.value = 25;
    wobble.connect(wobbleAmount).connect(osc.frequency);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.35, t + 0.08);
    gain.gain.setValueAtTime(0.35, t + 0.9);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
    osc.connect(gain).connect(this.master);
    osc.start(t); wobble.start(t);
    osc.stop(t + 1.25); wobble.stop(t + 1.25);
  },

  // A toilet flush: a big watery whoosh that swirls down
  flush() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const len = Math.floor(this.ctx.sampleRate * 1.6);
    const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = 1.5;
    filter.frequency.setValueAtTime(1800, t);
    filter.frequency.exponentialRampToValueAtTime(300, t + 1.5); // swirling down the drain
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.4, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.55);
    src.connect(filter).connect(gain).connect(this.master);
    src.start(t);
    src.stop(t + 1.6);
  },

  // The 'Rae' Gun firing: a sci-fi "pew!" that drops in pitch
  pew() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(1800, t);
    osc.frequency.exponentialRampToValueAtTime(220, t + 0.18);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.13, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    osc.connect(gain).connect(this.master);
    osc.start(t);
    osc.stop(t + 0.22);
  },

  // A green ball hitting a frog: a warbly "bzzwip!"
  zap() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const wobble = this.ctx.createOscillator();
    const wobbleAmount = this.ctx.createGain();
    const gain = this.ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(1400, t + 0.25);
    wobble.frequency.value = 40;
    wobbleAmount.gain.value = 120;
    wobble.connect(wobbleAmount).connect(osc.frequency);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.12, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
    osc.connect(gain).connect(this.master);
    osc.start(t); wobble.start(t);
    osc.stop(t + 0.3); wobble.stop(t + 0.3);
  },

  // A green ball fizzling out against a wall
  fizzle() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const len = Math.floor(this.ctx.sampleRate * 0.12);
    const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 3000;
    const gain = this.ctx.createGain();
    gain.gain.value = 0.15;
    src.connect(filter).connect(gain).connect(this.master);
    src.start(t);
  },

  // A little squeak (punching Flopsy)
  squeak() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1400, t);
    osc.frequency.exponentialRampToValueAtTime(2200, t + 0.06);
    osc.frequency.exponentialRampToValueAtTime(900, t + 0.2);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.2, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    osc.connect(gain).connect(this.master);
    osc.start(t);
    osc.stop(t + 0.24);
  },

  // A shop doorbell: "ding-a-ling!"
  shopBell() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    [1760, 2350, 1760, 2350].forEach((freq, i) => {
      const start = t + i * 0.07;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.15, start + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.5);
      osc.connect(gain).connect(this.master);
      osc.start(start);
      osc.stop(start + 0.55);
    });
  },

  // The boss arrives: a big, deep, wobbly "RRRIBBBIT"
  bossRoar() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    for (const [freq, delay] of [[90, 0], [70, 0.45]]) {
      const osc = this.ctx.createOscillator();
      const wob = this.ctx.createOscillator();
      const wobDepth = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq * 1.4, t + delay);
      osc.frequency.exponentialRampToValueAtTime(freq, t + delay + 0.4);
      wob.frequency.value = 18;
      wobDepth.gain.value = 14;
      wob.connect(wobDepth).connect(osc.frequency);
      filter.type = "lowpass";
      filter.frequency.value = 700;
      gain.gain.setValueAtTime(0.0001, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.45, t + delay + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + delay + 0.42);
      osc.connect(filter).connect(gain).connect(this.master);
      osc.start(t + delay); wob.start(t + delay);
      osc.stop(t + delay + 0.45); wob.stop(t + delay + 0.45);
    }
  },

  // A happy "ta-da-da-DAAA!" for winning
  win() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    [523, 659, 784, 1047, 784, 1047].forEach((freq, i) => {
      const start = t + i * 0.13 + (i >= 4 ? 0.1 : 0);
      const long = i === 5;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + (long ? 1.0 : 0.25));
      osc.connect(gain).connect(this.master);
      osc.start(start);
      osc.stop(start + (long ? 1.05 : 0.3));
    });
  },

  // A sleepy little falling tune for the summary screen
  gameOver() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    [784, 659, 523, 392].forEach((freq, i) => {
      const start = t + i * 0.22;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, start);
      if (i === 3) osc.frequency.exponentialRampToValueAtTime(freq * 0.94, start + 0.6); // droopy last note
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.22, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + (i === 3 ? 0.8 : 0.3));
      osc.connect(gain).connect(this.master);
      osc.start(start);
      osc.stop(start + 0.85);
    });
  },

  // A soft "plip" when a frog hops (quieter the further away it is)
  frogHop(distance = 0) {
    if (!this.ctx) return;
    const volume = Math.max(0, 0.12 * (1 - distance / 8));
    if (volume <= 0.001) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.09);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(volume, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    osc.connect(gain).connect(this.master);
    osc.start(t);
    osc.stop(t + 0.13);
  },

  // A silly squeaky "bwoo-SQUEEEAK-pop" for popping a frog
  frogPop() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // 1. a slide-whistle "bwoop" up
    const up = this.ctx.createOscillator();
    const upGain = this.ctx.createGain();
    up.type = "sine";
    up.frequency.setValueAtTime(250, t);
    up.frequency.exponentialRampToValueAtTime(1100, t + 0.12);
    upGain.gain.setValueAtTime(0.0001, t);
    upGain.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
    upGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
    up.connect(upGain).connect(this.master);
    up.start(t); up.stop(t + 0.15);
    // 2. a wobbly rubber-toy squeak falling down
    const sq = this.ctx.createOscillator();
    const wob = this.ctx.createOscillator();
    const wobDepth = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    const sqGain = this.ctx.createGain();
    sq.type = "square";
    sq.frequency.setValueAtTime(1300, t + 0.12);
    sq.frequency.exponentialRampToValueAtTime(380, t + 0.45);
    wob.frequency.value = 32;
    wobDepth.gain.value = 70;
    wob.connect(wobDepth).connect(sq.frequency);
    filter.type = "lowpass";
    filter.frequency.value = 2200;
    sqGain.gain.setValueAtTime(0.0001, t + 0.12);
    sqGain.gain.exponentialRampToValueAtTime(0.16, t + 0.14);
    sqGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.48);
    sq.connect(filter).connect(sqGain).connect(this.master);
    sq.start(t + 0.12); wob.start(t + 0.12);
    sq.stop(t + 0.5); wob.stop(t + 0.5);
    // 3. a little "pop" of noise at the start
    const len = Math.floor(this.ctx.sampleRate * 0.05);
    const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const pop = this.ctx.createBufferSource();
    const popGain = this.ctx.createGain();
    pop.buffer = buffer;
    popGain.gain.value = 0.35;
    pop.connect(popGain).connect(this.master);
    pop.start(t);
  },

  // A sparkly three-note chime for collecting things
  chime() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    [1046.5, 1318.5, 1568.0].forEach((freq, i) => {
      const start = t + i * 0.07;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.25, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.6);
      osc.connect(gain).connect(this.master);
      osc.start(start);
      osc.stop(start + 0.65);
    });
  },

  // A crunchy breaking sound: short bursts of filtered noise + a low thump
  crunch() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const len = Math.floor(this.ctx.sampleRate * 0.3);
    const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;

    for (let i = 0; i < 5; i++) {
      const start = t + i * 0.03 + Math.random() * 0.02;
      const src = this.ctx.createBufferSource();
      src.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 800 + Math.random() * 2200;
      filter.Q.value = 1.2;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.5, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.08);
      src.connect(filter).connect(gain).connect(this.master);
      src.start(start);
      src.stop(start + 0.1);
    }

    const thump = this.ctx.createOscillator();
    const tg = this.ctx.createGain();
    thump.frequency.setValueAtTime(140, t);
    thump.frequency.exponentialRampToValueAtTime(50, t + 0.15);
    tg.gain.setValueAtTime(0.4, t);
    tg.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    thump.connect(tg).connect(this.master);
    thump.start(t);
    thump.stop(t + 0.2);
  },
};
