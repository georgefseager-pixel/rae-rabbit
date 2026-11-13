// ============================================================
// dialogue.js — Rae's little thoughts, shown in the top-left panel
// ============================================================
// Use:
//   Dialogue.sayOnce("some-id", "Text!")  -> only ever shown the FIRST time
//   Dialogue.say("Text!")                 -> shown every time it's called
// Messages queue up, type out letter by letter with a babbly voice,
// stay for a moment, then fade away.

const Dialogue = {
  panel: null,
  textEl: null,
  queue: [],
  busy: false,
  seen: new Set(), // ids of lines Rae has already said

  // Tweakable timings (milliseconds)
  letterDelay: 45,   // time between letters while typing
  holdTime: 2200,    // how long the finished line stays on screen
  fadeTime: 500,     // must match the CSS transition in style.css

  init() {
    this.panel = document.getElementById("dialogue");
    this.textEl = document.getElementById("dialogue-text");
  },

  sayOnce(id, text) {
    if (this.seen.has(id)) return;
    this.seen.add(id);
    this.say(text);
  },

  say(text) {
    this.queue.push(text);
    if (!this.busy) this.next();
  },

  next() {
    const text = this.queue.shift();
    if (text === undefined) { this.busy = false; return; }
    this.busy = true;

    this.textEl.textContent = "";
    this.panel.classList.add("show");

    let i = 0;
    const typeLetter = () => {
      i++;
      this.textEl.textContent = text.slice(0, i);
      const ch = text[i - 1];
      // a babble blip on every other letter (skipping spaces & punctuation)
      if (/[a-z0-9]/i.test(ch) && i % 2 === 1) {
        Sfx.babble(ch === ch.toUpperCase() && /[A-Z]/.test(ch)); // CAPITALS = excited & higher
      }
      if (i < text.length) {
        setTimeout(typeLetter, /[.!?,]/.test(ch) ? this.letterDelay * 4 : this.letterDelay);
      } else {
        setTimeout(() => {
          this.panel.classList.remove("show"); // fade out
          setTimeout(() => this.next(), this.fadeTime + 150);
        }, this.holdTime);
      }
    };
    setTimeout(typeLetter, 250); // short pause while the panel pops in
  },
};
