// ============================================================
// achievements.js — trophies Rae can earn, and the Achievements screen
// ============================================================
// Earned achievements are remembered on this computer (in the browser's
// localStorage). The screen has room for 9: add new ones to ACHIEVEMENTS and
// call Achievements.unlock("their-id") from wherever they're earned.
//
// Uses these from other files: Sfx (audio.js), Pad (gamepad.js).

const ACHIEVEMENT_SLOTS = 9;
const ACHIEVEMENTS = [
  { id: "carrotventure", icon: "🚽", name: "Just in Time!",
    desc: "Beat Carrotventure: eat all the carrots, then make it to the toilet." },
  { id: "frogpocalypse", icon: "👑", name: "Frog Slayer",
    desc: "Beat Frogpocalypse: defeat Jiggle Jaggle, Fraggle Friggle and Tiggle Taggle." },
  { id: "pacifist", icon: "🕊️", name: "Pacifist",
    desc: "Beat Carrotventure without popping a single frog." },
  { id: "friendly-fire", icon: "🎯", name: "Friendly Fire",
    desc: "Zap a frog with the 'Rae' Gun while it's waving at you in your frog face shirt." },
  { id: "washed", icon: "🫧", name: "Spin Cycle",
    desc: "Stay in the washing machine until the door slams shut. Poor Rae!" },
  { id: "eaten", icon: "🦈", name: "Snack Time",
    desc: "Stay in the bath until Ducky gets hungry. Poor Rae!" },
  { id: "flopsy-mode", icon: "☁️", name: "Tiny but Mighty",
    desc: "Beat Flopsy Mode: every carrot (hopping across the clouds), then the toilet." },
];

const Achievements = {
  key: "rae-achievements",
  earned: {},       // id -> date it was earned
  popQueue: [],     // popups waiting their turn

  load() {
    try { this.earned = JSON.parse(localStorage.getItem(this.key)) || {}; } catch (e) { this.earned = {}; }
  },
  save() {
    try { localStorage.setItem(this.key, JSON.stringify(this.earned)); } catch (e) { /* can't save: fine */ }
  },
  has(id) { return !!this.earned[id]; },

  // Earn one! (Does nothing if it's already earned.)
  unlock(id) {
    const a = ACHIEVEMENTS.find((x) => x.id === id);
    if (!a || this.has(id)) return;
    this.earned[id] = new Date().toISOString().slice(0, 10);
    this.save();
    this.popQueue.push(a);
    if (this.popQueue.length === 1) this.showNextPop();
  },

  // A little gold banner sliding down from the top: "Achievement unlocked!"
  showNextPop() {
    const a = this.popQueue[0];
    if (!a) return;
    const el = document.getElementById("achievement-pop");
    el.innerHTML = `<span class="ach-pop-icon">${a.icon}</span>` +
      `<span><span class="ach-pop-label">🏆 Achievement unlocked!</span><b>${a.name}</b></span>`;
    el.classList.add("show");
    Sfx.achievement();
    setTimeout(() => {
      el.classList.remove("show");
      setTimeout(() => { this.popQueue.shift(); this.showNextPop(); }, 450);
    }, 3200);
  },

  // ---- The Achievements screen (from the main menu) ----
  isOpen() { return !document.getElementById("achievements").classList.contains("hidden"); },

  open() {
    const grid = document.getElementById("ach-grid");
    grid.innerHTML = "";
    for (let i = 0; i < ACHIEVEMENT_SLOTS; i++) {
      const a = ACHIEVEMENTS[i];
      const tile = document.createElement("div");
      if (!a) {
        tile.className = "ach-tile empty";
        tile.innerHTML = `<span class="ach-icon">❔</span><span class="ach-name">???</span><span class="ach-desc">Coming soon...</span>`;
      } else {
        const got = this.has(a.id);
        tile.className = "ach-tile" + (got ? " got" : "");
        tile.innerHTML = `<span class="ach-icon">${got ? a.icon : "🔒"}</span>` +
          `<span class="ach-name">${a.name}</span><span class="ach-desc">${a.desc}</span>` +
          (got ? `<span class="ach-date">Earned ${this.earned[a.id]}</span>` : "");
      }
      grid.appendChild(tile);
    }
    const count = ACHIEVEMENTS.filter((a) => this.has(a.id)).length;
    document.getElementById("ach-count").textContent = `${count} / ${ACHIEVEMENTS.length} earned`;
    document.getElementById("achievements").classList.remove("hidden");
    Sfx.init();
    Sfx.chime();
  },

  close() {
    document.getElementById("achievements").classList.add("hidden");
  },
};

Achievements.load();
document.getElementById("open-achievements").addEventListener("click", (e) => {
  e.stopPropagation(); // don't also click the menu card behind it
  Achievements.open();
});
document.getElementById("ach-close").addEventListener("click", () => Achievements.close());
document.getElementById("achievements").addEventListener("click", (e) => {
  if (e.target.id === "achievements") Achievements.close(); // click outside the card
});
window.addEventListener("keydown", (e) => {
  if (Achievements.isOpen() && (e.code === "Escape" || e.code === "Enter")) Achievements.close();
});
