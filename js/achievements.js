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
  // (The descriptions are hints, not instructions: half the fun is working them out!)
  { id: "carrotventure", icon: "🚽", name: "Just in Time!",
    desc: "Eat every last carrot in Carrotventure... then deal with the consequences." },
  { id: "frogpocalypse", icon: "👑", name: "Frog Slayer",
    desc: "Outlast the Frogpocalypse, and whoever comes after it." },
  { id: "pacifist", icon: "🕊️", name: "Pacifist",
    desc: "Finish Carrotventure as the gentlest bunny ever." },
  { id: "friendly-fire", icon: "🎯", name: "Friendly Fire",
    desc: "Betray a frog who thinks you're one of the family." },
  { id: "washed", icon: "🫧", name: "Spin Cycle",
    desc: "Get far too comfortable somewhere in the kitchen." },
  { id: "eaten", icon: "🦈", name: "Snack Time",
    desc: "Enjoy a nice long soak. Someone's watching..." },
  { id: "flopsy-mode", icon: "☁️", name: "Tiny but Mighty",
    desc: "Find every carrot as someone much smaller than Rae." },
  { id: "scrumbly", icon: "🐭", name: "Scrumbly Secret",
    desc: "Be patient in the cosiest corner of the living room." },
  { id: "roof", icon: "🦅", name: "Up, Up and Away",
    desc: "Climb higher than any bunny should." },
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
