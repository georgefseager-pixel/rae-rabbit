// ============================================================
// dialogue.js — the speech bubble in the top-left panel
// ============================================================
// Use:
//   Dialogue.sayOnce("some-id", "Text!")  -> Rae says it only the FIRST time
//   Dialogue.say("Text!")                 -> Rae says it every time it's called
//   Dialogue.say("Ribbit!", { speaker: "🐸 Frog", style: "enemy", voice: "frog" })
//                                         -> someone else talks (red text)
// Messages queue up, type out letter by letter with a babbly voice,
// stay for a moment, then fade away.

const Dialogue = {
  panel: null,
  textEl: null,
  nameEl: null,
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
    this.nameEl = this.panel.querySelector(".name-tag");
  },

  sayOnce(id, text) {
    if (this.seen.has(id)) return;
    this.seen.add(id);
    this.say(text);
  },

  say(text, opts = {}) {
    this.queue.push({ text, opts });
    if (!this.busy) this.next();
  },

  next() {
    const item = this.queue.shift();
    if (item === undefined) { this.busy = false; return; }
    this.busy = true;
    const { text, opts } = item;

    this.nameEl.textContent = opts.speaker || "🐰 Rae";
    this.panel.classList.toggle("enemy", opts.style === "enemy");
    this.textEl.textContent = "";
    this.panel.classList.add("show");

    let i = 0;
    const typeLetter = () => {
      i++;
      this.textEl.textContent = text.slice(0, i);
      const ch = text[i - 1];
      // a babble blip on every other letter (skipping spaces & punctuation)
      if (/[a-z0-9]/i.test(ch) && i % 2 === 1) {
        Sfx.babble(/[A-Z]/.test(ch), opts.voice); // CAPITALS = excited & higher
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
