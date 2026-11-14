// ============================================================
// dialogue.js — speech bubbles in the top-left corner
// ============================================================
// Use:
//   Dialogue.sayOnce("some-id", "Text!")  -> Rae says it only the FIRST time
//   Dialogue.say("Text!")                 -> Rae says it every time it's called
//   Dialogue.say("Ribbit!", { speaker: "🐸 Frog", style: "enemy", voice: "frog" })
//                                         -> someone else talks (red text)
// Each line gets its own bubble, straight away. New bubbles appear underneath
// the older ones, so you always see what was just said. Each bubble types out
// with a babbly voice, stays a moment, then fades away on its own.

// Pick one at random from a list of lines (a plain string is just itself),
// so the same moment can be said differently each playthrough.
function pick(lines) {
  return Array.isArray(lines) ? lines[Math.floor(Math.random() * lines.length)] : lines;
}

const Dialogue = {
  stack: null,
  bubbles: [],      // bubbles currently on screen (oldest first)
  seen: new Set(),  // ids of lines Rae has already said

  // Tweakable settings
  maxBubbles: 4,     // more than this and the oldest one is cleared away
  letterDelay: 45,   // ms between letters while typing
  holdTime: 2400,    // ms the finished line stays on screen
  fadeTime: 450,     // must match the CSS transition in style.css

  init() {
    this.stack = document.getElementById("dialogue-stack");
  },

  sayOnce(id, text, opts) {
    if (this.seen.has(id)) return;
    this.seen.add(id);
    this.say(text, opts);
  },

  // text can be one line or a list of variations (one is picked at random)
  say(text, opts = {}) {
    text = pick(text);
    // Make room: clear the oldest bubble if there are too many
    while (this.bubbles.length >= this.maxBubbles) this.dismiss(this.bubbles[0]);

    const el = document.createElement("div");
    el.className = "bubble" + (opts.style ? " " + opts.style : ""); // e.g. "enemy" (frogs), "flopsy"
    const name = document.createElement("div");
    name.className = "name-tag";
    name.textContent = opts.speaker || "🐰 Rae";
    const p = document.createElement("p");
    p.className = "bubble-text";
    el.append(name, p);
    this.stack.appendChild(el);
    requestAnimationFrame(() => el.classList.add("show")); // pop in

    const bubble = { el, timers: [] };
    this.bubbles.push(bubble);

    let i = 0;
    const typeLetter = () => {
      i++;
      p.textContent = text.slice(0, i);
      const ch = text[i - 1];
      // babble on every other letter, but only for the newest bubble (so voices don't pile up)
      const newest = this.bubbles[this.bubbles.length - 1] === bubble;
      if (newest && /[a-z0-9]/i.test(ch) && i % 2 === 1) Sfx.babble(/[A-Z]/.test(ch), opts.voice);
      if (i < text.length) {
        bubble.timers.push(setTimeout(typeLetter, /[.!?,]/.test(ch) ? this.letterDelay * 4 : this.letterDelay));
      } else {
        bubble.timers.push(setTimeout(() => this.dismiss(bubble), this.holdTime));
      }
    };
    bubble.timers.push(setTimeout(typeLetter, 200));
  },

  // Fade a bubble out and remove it
  dismiss(bubble) {
    if (!this.bubbles.includes(bubble)) return;
    this.bubbles = this.bubbles.filter((b) => b !== bubble);
    bubble.timers.forEach(clearTimeout);
    bubble.el.classList.remove("show");
    bubble.el.classList.add("leaving");
    setTimeout(() => bubble.el.remove(), this.fadeTime);
  },
};
