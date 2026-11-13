// ============================================================
// frogpocalypse.js — the Frogpocalypse game mode
// ============================================================
// Frogs pour into the house, faster and faster. Survive for 5 minutes and
// Boss Frog Jiggle Jaggle turns up in the living room. Beat him (3 hits) to win!
// The Flopsy Shop is boarded up and Flopsy has fled. Carrots heal a heart.
//
// Uses these from main.js: world, frogs, player, flopsy, stompedCount, showWin().

const Frogpocalypse = {
  active: false,
  time: 0,             // seconds survived
  spawnTimer: 2,
  boss: null,
  bossWarned: false,

  // ---- Tweakable numbers ----
  BOSS_TIME: 300,      // seconds until the boss appears (5 minutes)
  MAX_FROGS: 30,       // never more frogs than this at once

  // Where new frogs can appear (all over the house)
  SPAWNS: [
    // bedroom
    [2.8, 0, 1.6], [-3.0, 0, -1.0], [-3.2, 0, 2.0], [2.8, 0, -1.0], [0.0, 0, 2.3],
    // corridor & bathroom
    [-2.95, 0, 6.5], [1.8, 0, 7.2], [-0.6, 0, 7.6],
    // living room
    [2.0, 0, 12.0], [-1.2, 0, 16.6], [1.5, 0, 17.6], [-1.5, 0, 10.5], [1.6, 0, 15.5],
    // top of the stairs
    [0.2, 0, 19.8],
    // kitchen & office
    [-7.0, -1.2, 24.0], [-3.0, -1.2, 26.9], [-6.5, -1.2, 20.5], [-7.0, -1.2, 27.2],
    [-2.0, -1.2, 23.5], [-3.5, -1.2, 24.5],
  ],

  // How many frogs can be about, and how often a new one appears, as time goes on
  maxAlive() { return Math.min(this.MAX_FROGS, 9 + Math.floor(this.time / 20)); },
  spawnEvery() { return Math.max(1.0, 5 - this.time / 45); },

  // Turn the house into a frog-filled nightmare
  start() {
    this.active = true;
    Frog.sightBoost = 1.7; // frogs see further
    for (const f of frogs) f.respawnDistance = Infinity; // the spawner handles frogs now

    // Board up the Flopsy Shop: no way in, and Flopsy has gone
    world.zones = world.zones.filter((z) => z.name !== "shop-door");
    flopsy.leave();
    const block = world.props.find((p) => p.name === "flopsy");
    if (block) world.remove(block);
    const doorZ = 0.3, face = 5.33;
    world.add(makeThing("planks", face, 0, doorZ, [
      ["box", [0.04, 0.11, 0.85], [0, 0.28, 0], COLORS.bedWood, { rx: 0.45 }],
      ["box", [0.04, 0.11, 0.85], [0.01, 0.5, 0], COLORS.walnut, { rx: -0.4 }],
      ["box", [0.04, 0.1, 0.8], [0.02, 0.68, 0], COLORS.bedWood, { rx: 0.08 }],
    ], { solid: false }));
    const closed = makeHandwrittenSign("CLOSED!!", 0.42, 0.15);
    closed.rotation.y = -Math.PI / 2;
    closed.rotation.z = -0.15;
    closed.position.set(face - 0.05, 0.42, doorZ + 0.05);
    world.add(new Prop({ name: "closed-sign", mesh: closed, solid: false }));

    // Show frogs stomped and the timer instead of carrots
    document.body.classList.add("frog-mode");
    Dialogue.say("Uh oh... why are there SO many frogs?!");
    for (let i = 0; i < 3; i++) this.spawnFrog(player);
  },

  // A new frog somewhere in the house: not too close to Rae, not too far either
  spawnFrog(player) {
    const options = this.SPAWNS.filter(([x, y, z]) => {
      const d = Math.hypot(x - player.pos.x, z - player.pos.z);
      return d > 4 && d < 16;
    });
    if (!options.length) return;
    const [x, y, z] = options[Math.floor(Math.random() * options.length)];
    // Reuse a popped frog if there is one, otherwise make a new one
    let frog = frogs.find((f) => !f.alive && !f.isBoss);
    if (frog) {
      frog.spawn.set(x, y, z);
      frog.reset();
    } else if (frogs.length < this.MAX_FROGS + 1) {
      const colors = Object.values(FROG_COLORS);
      frog = new Frog(world, x, y, z, colors[Math.floor(Math.random() * colors.length)]);
      frogs.push(frog);
    }
    if (frog) frog.respawnDistance = Infinity;
  },

  // Called every frame while playing
  update(dt, player) {
    if (!this.active) return;
    this.time += dt;
    const t = Math.floor(this.time);
    document.getElementById("survive-time").textContent =
      `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;

    // More frogs, more often, as time goes on
    this.spawnTimer -= dt;
    const alive = frogs.filter((f) => f.alive && !f.isBoss).length;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = this.spawnEvery();
      if (alive < this.maxAlive()) this.spawnFrog(player);
    }

    // Five minutes survived: here comes the boss!
    if (!this.boss && this.time >= this.BOSS_TIME) this.spawnBoss();
    if (this.boss) {
      const hp = Math.max(0, this.boss.hp);
      document.getElementById("boss-hp").textContent = "❤".repeat(hp) + "♡".repeat(3 - hp);
    }
  },

  spawnBoss() {
    this.boss = new Frog(world, 1.7, 0, 13.8, 0x7fc46e);
    this.boss.setBoss();
    frogs.push(this.boss);
    Sfx.bossRoar();
    showBanner("⚠️ Boss Frog Jiggle Jaggle has spawned in the living room!");
    Dialogue.say("Boss Frog Jiggle Jaggle has spawned in the living room!",
      { speaker: "⚠️ Warning", style: "enemy", voice: "frog" });
    document.body.classList.add("boss-fight");
  },
};
