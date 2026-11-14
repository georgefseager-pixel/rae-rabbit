// ============================================================
// music.js — cute background music, made with code (no music files!)
// ============================================================
// Three little looping tunes:
//   "cosy"     gentle and bouncy (Carrotventure)
//   "musicbox" the same tune, twinkly and higher (Flopsy Mode)
//   "frog"     hoppy and a bit cheeky (Frogpocalypse)
// Each has a melody, a bass line, soft chords and a light tick-tick on the off-beats.
// The notes are scheduled a moment ahead, so they stay in perfect time.
//
// Uses Sfx.ctx and Sfx.master from audio.js. The menu has a Music On/Off switch.

// Note names to frequencies ("C4" = middle C, "G#4", "Bb3"...)
function noteFreq(name) {
  const m = /^([A-G])([#b]?)(\d)$/.exec(name);
  const semis = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]] + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0);
  return 440 * Math.pow(2, (semis + (Number(m[3]) - 4) * 12 - 9) / 12);
}

// ---- The tunes ----
// melody: [note, length in eighth-notes] ("-" is a rest). Each bar is 8 eighths.
// chords: one chord per bar (played as a soft arpeggio); bass: one root note per bar.
const TUNES = {
  cosy: {
    bpm: 104, melodyWave: "triangle", melodyVol: 0.09, octave: 0, pluck: 0.5,
    melody: [
      ["E5", 2], ["G5", 2], ["A5", 1], ["G5", 1], ["E5", 2],
      ["C5", 2], ["E5", 2], ["D5", 1], ["C5", 1], ["A4", 2],
      ["F4", 1], ["A4", 1], ["C5", 2], ["D5", 2], ["C5", 2],
      ["B4", 2], ["D5", 2], ["G5", 4],
      ["E5", 2], ["G5", 2], ["C6", 2], ["B5", 1], ["A5", 1],
      ["A5", 2], ["E5", 2], ["C5", 2], ["E5", 2],
      ["F5", 2], ["E5", 1], ["D5", 1], ["C5", 2], ["A4", 2],
      ["B4", 2], ["D5", 2], ["C5", 4],
    ],
    chords: [["C4", "E4", "G4"], ["A3", "C4", "E4"], ["F3", "A3", "C4"], ["G3", "B3", "D4"],
             ["C4", "E4", "G4"], ["A3", "C4", "E4"], ["F3", "A3", "C4"], ["G3", "B3", "D4"]],
    bass: ["C3", "A2", "F2", "G2", "C3", "A2", "F2", "G2"],
  },
  frog: {
    bpm: 132, melodyWave: "square", melodyVol: 0.05, octave: 0, pluck: 0.25,
    melody: [
      ["A4", 1], ["C5", 1], ["E5", 1], ["A5", 1], ["G5", 1], ["E5", 1], ["C5", 1], ["E5", 1],
      ["F5", 1], ["E5", 1], ["C5", 1], ["A4", 1], ["C5", 2], ["A4", 2],
      ["G4", 1], ["C5", 1], ["E5", 1], ["G5", 1], ["E5", 1], ["C5", 1], ["G4", 2],
      ["G#4", 2], ["B4", 2], ["E5", 2], ["D5", 1], ["B4", 1],
      ["A5", 1], ["A5", 1], ["G5", 1], ["E5", 1], ["C5", 2], ["E5", 2],
      ["F5", 2], ["A5", 2], ["G5", 1], ["F5", 1], ["E5", 2],
      ["E5", 1], ["G5", 1], ["C6", 2], ["B5", 1], ["G5", 1], ["E5", 2],
      ["G#5", 2], ["E5", 2], ["B4", 2], ["A4", 2],
    ],
    chords: [["A3", "C4", "E4"], ["F3", "A3", "C4"], ["C4", "E4", "G4"], ["E3", "G#3", "B3"],
             ["A3", "C4", "E4"], ["F3", "A3", "C4"], ["C4", "E4", "G4"], ["E3", "G#3", "B3"]],
    bass: ["A2", "F2", "C3", "E2", "A2", "F2", "C3", "E2"],
    bouncyBass: true, // octave-jumping bass on every eighth
  },
};
// Flopsy Mode: the cosy tune as a little music box (higher, twinklier, a touch quicker)
TUNES.musicbox = { ...TUNES.cosy, bpm: 112, melodyWave: "sine", melodyVol: 0.11, octave: 12, pluck: 0.35, softBass: true };

const Music = {
  on: true,          // the menu switch
  volume: 0.9,       // overall music volume (the sound effects stay a little louder)
  tune: null,
  timer: null,

  // Start (or switch to) a tune by name
  play(name) {
    if (!Sfx.ctx) return;
    this.wanted = name;
    if (!this.on) return;
    if (this.tune === TUNES[name] && this.timer) return; // already playing
    this.stop(true);
    if (!this.out) {
      this.out = Sfx.ctx.createGain();
      this.out.connect(Sfx.master);
    }
    this.tune = TUNES[name];
    this.out.gain.cancelScheduledValues(Sfx.ctx.currentTime);
    this.out.gain.setValueAtTime(this.volume * this.level(), Sfx.ctx.currentTime);
    this.step = 0;          // which eighth-note we're up to
    this.noteIndex = 0;     // which melody note is next
    this.noteLeft = 0;      // eighths left on the current melody note
    this.nextTime = Sfx.ctx.currentTime + 0.1;
    this.timer = setInterval(() => this.schedule(), 50);
  },

  // Stop (fading out quickly, unless told not to)
  stop(instant = false) {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    if (this.out && !instant) {
      const t = Sfx.ctx.currentTime;
      this.out.gain.cancelScheduledValues(t);
      this.out.gain.setValueAtTime(this.out.gain.value, t);
      this.out.gain.linearRampToValueAtTime(0, t + 0.6);
      // (a fresh gain node next time, so leftover fade-outs don't affect the next tune)
      this.out = null;
    } else if (this.out && instant) {
      this.out.disconnect();
      this.out = null;
    }
  },

  // Quieter for a while (e.g. while Rae's dance tune plays)
  duck(seconds) {
    this.duckUntil = performance.now() + seconds * 1000;
    this.applyLevel();
  },
  // Quieter while paused or in a shop
  setQuiet(quiet) {
    this.quiet = quiet;
    this.applyLevel();
  },
  level() {
    if (this.duckUntil && performance.now() < this.duckUntil) return 0.1;
    return this.quiet ? 0.45 : 1;
  },
  applyLevel() {
    if (!this.out) return;
    const t = Sfx.ctx.currentTime;
    this.out.gain.cancelScheduledValues(t);
    this.out.gain.setTargetAtTime(this.volume * this.level(), t, 0.15);
    if (this.duckUntil && performance.now() < this.duckUntil) setTimeout(() => this.applyLevel(), this.duckUntil - performance.now() + 50);
    else this.duckUntil = 0;
  },

  setOn(on) {
    this.on = on;
    if (!on) this.stop();
    else if (this.wanted) this.play(this.wanted);
  },

  // Schedule the notes for the next quarter of a second
  schedule() {
    const ctx = Sfx.ctx, tune = this.tune, eighth = 60 / tune.bpm / 2;
    while (this.nextTime < ctx.currentTime + 0.25) {
      const t = this.nextTime, bar = Math.floor(this.step / 8) % tune.chords.length, beat = this.step % 8;
      // melody
      if (this.noteLeft <= 0) {
        const [name, len] = tune.melody[this.noteIndex];
        this.noteIndex = (this.noteIndex + 1) % tune.melody.length;
        this.noteLeft = len;
        if (name !== "-") this.voice(noteFreq(name) * Math.pow(2, tune.octave / 12), t, len * eighth * (0.6 + tune.pluck * 0.4), tune.melodyVol, tune.melodyWave);
      }
      this.noteLeft--;
      // soft arpeggio of the bar's chord (very quiet), on every eighth
      const chord = tune.chords[bar];
      this.voice(noteFreq(chord[beat % chord.length]) * (tune.octave ? 2 : 1), t, eighth * 1.6, 0.025, "sine");
      // bass
      const root = noteFreq(tune.bass[bar]);
      if (tune.bouncyBass) this.voice(beat % 2 ? root * 2 : root, t, eighth * 0.8, 0.07, "triangle");
      else if (beat % 4 === 0) this.voice(beat === 4 ? root * 1.5 : root, t, eighth * 3.5, tune.softBass ? 0.05 : 0.08, "sine");
      // a light "tick" on the off-beats
      if (beat % 2 === 1) this.tick(t, tune.bouncyBass ? 0.035 : 0.02);
      this.nextTime += eighth;
      this.step++;
    }
  },

  // One soft note into the music's own volume control
  voice(freq, start, length, volume, type) {
    if (!this.out) return;
    const osc = Sfx.ctx.createOscillator(), gain = Sfx.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
    osc.connect(gain).connect(this.out);
    osc.start(start);
    osc.stop(start + length + 0.05);
  },

  // A tiny shaker sound
  tick(start, volume) {
    if (!this.noise) {
      const len = Math.floor(Sfx.ctx.sampleRate * 0.05);
      this.noise = Sfx.ctx.createBuffer(1, len, Sfx.ctx.sampleRate);
      const d = this.noise.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    }
    const src = Sfx.ctx.createBufferSource(), filter = Sfx.ctx.createBiquadFilter(), gain = Sfx.ctx.createGain();
    src.buffer = this.noise;
    filter.type = "highpass";
    filter.frequency.value = 6000;
    gain.gain.value = volume;
    src.connect(filter).connect(gain).connect(this.out);
    src.start(start);
  },
};
