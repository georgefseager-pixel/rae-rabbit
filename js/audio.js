// ============================================================
// audio.js — all sound effects, made with code (no sound files!)
// ============================================================
// Browsers only allow sound after the player clicks, so Sfx.init()
// is called from the "Click to start" screen.

const Sfx = {
  ctx: null,
  master: null,

  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.6; // overall volume (0 = silent, 1 = loud)
    this.master.connect(this.ctx.destination);
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
