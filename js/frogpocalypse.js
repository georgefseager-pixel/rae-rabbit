// ============================================================
// frogpocalypse.js — the Frogpocalypse game mode
// ============================================================
// Frogs pour into the house, faster and faster. Survive for 3 minutes and
// Boss Frog Jiggle Jaggle turns up in the living room. Beat him (3 hits) to win!
// Both shops in the wardrobe are boarded up and the shopkeepers have fled. Carrots heal a heart.
//
// Uses these from main.js: world, frogs, player, flopsy, willow, stompedCount, showWin().

const Frogpocalypse = {
  active: false,
  time: 0,             // seconds survived
  spawnTimer: 2,
  boss: null,
  bossWarned: false,

  // ---- Tweakable numbers ----
  BOSS_TIME: 180,      // seconds until the boss appears (3 minutes)
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
    [-7.0, -1.2, 24.0], [-2.0, -1.2, 26.6], [-6.5, -1.2, 20.5], [-6.0, -1.2, 26.7],
    [-2.5, -1.2, 22.5], [-3.6, -1.2, 22.4],
  ],

  // How many frogs can be about, and how often a new one appears, as time goes on
  // While a boss is out, fewer frogs (BOSS_FROGS of the usual number) appear, and more slowly
  BOSS_FROGS: 0.55,
  bossOut() { return !!(this.boss && this.boss.alive); },
  maxAlive() {
    const n = Math.min(this.MAX_FROGS, 9 + Math.floor(this.time / 20));
    return this.bossOut() ? Math.round(n * this.BOSS_FROGS) : n;
  },
  spawnEvery() {
    const every = Math.max(1.0, 5 - this.time / 45);
    return this.bossOut() ? every / this.BOSS_FROGS : every;
  },

  // Turn the house into a frog-filled nightmare
  start() {
    this.active = true;
    Frog.sightBoost = 1.7; // frogs see further
    for (const f of frogs) f.respawnDistance = Infinity; // the spawner handles frogs now

    // Every door starts already smashed, so there's nowhere to hide
    for (const door of world.props.filter((p) => p.name === "door")) {
      door.broken = true;
      world.remove(door);
    }

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

    // Willow's Weapon Mart shuts too (very properly), and Willow departs
    world.zones = world.zones.filter((z) => z.name !== "willow-door");
    willow.leave();
    const wBlock = world.props.find((p) => p.name === "willow");
    if (wBlock) world.remove(wBlock);
    const wx = 4.66, wFace = 2.3;
    world.add(makeThing("planks", wx, 0, wFace, [
      ["box", [0.6, 0.1, 0.04], [0, 0.3, 0], COLORS.bedWood, { rz: -0.35 }],
      ["box", [0.6, 0.1, 0.04], [0, 0.55, -0.01], COLORS.walnut, { rz: 0.3 }],
    ], { solid: false }));
    const wClosed = makeTypedSign(["REGRETTABLY", "CLOSED"], 0.34, 0.14);
    wClosed.rotation.y = Math.PI;
    wClosed.position.set(wx, 0.68, wFace - 0.04);
    world.add(new Prop({ name: "closed-sign", mesh: wClosed, solid: false }));

    // Show frogs stomped and the timer instead of carrots
    document.body.classList.add("frog-mode");
    Dialogue.say(RAE_LINES["frog-mode-start"]);
    for (let i = 0; i < 3; i++) this.spawnFrog(player);
  },

  // A new frog somewhere in the house, often right where Rae can see it pop in.
  // (Never right on top of her, though.)
  spawnFrog(player) {
    const options = this.SPAWNS.filter(([x, y, z]) => {
      const d = Math.hypot(x - player.pos.x, z - player.pos.z);
      return d > 2.2 && d < 14;
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

    // Three minutes survived: here comes the first boss!
    if (!this.boss && this.time >= this.BOSS_TIME) this.spawnBoss("jiggle");
    if (this.boss) {
      const hp = Math.max(0, this.boss.hp);
      document.getElementById("boss-name").textContent = this.boss.boss.name;
      document.getElementById("boss-hp").textContent = "❤".repeat(hp) + "♡".repeat(this.boss.maxHp - hp);
      if (this.boss.relentless && this.boss.alive) this.keepUp(dt, player);
    }

    this.updateParcels(dt, player);
  },

  // kind: "jiggle" (living room), "fraggle" (bedroom) or "tiggle" (kitchen). See BOSSES in frog.js.
  spawnBoss(kind) {
    const where = {
      jiggle: { x: 1.7, y: 0, z: 13.8, text: "Boss Frog Jiggle Jaggle has spawned in the living room!" },
      fraggle: { x: 0, y: 0, z: 2.3, text: "A NEW boss has appeared in the bedroom: Fraggle Friggle!" },
      tiggle: { x: -7.0, y: LOW, z: 24.0, text: "The FINAL boss has appeared in the kitchen: Tiggle Taggle!" },
    }[kind];
    this.boss = new Frog(world, where.x, where.y, where.z, BOSSES[kind].color);
    this.boss.setBoss(kind);
    frogs.push(this.boss);
    Sfx.bossRoar();
    showBanner("⚠️ " + where.text);
    Dialogue.say(where.text, { speaker: "⚠️ Warning", style: "enemy", voice: "frog" });
    document.body.classList.add("boss-fight");
  },

  // Fraggle Friggle is very persistent: run away and, before long, he pops up
  // again somewhere near Rae (but never right on top of her)
  keepUp(dt, player) {
    const boss = this.boss;
    const far = boss.pos.distanceTo(player.pos) > 6;
    this.lostTimer = far ? (this.lostTimer || 0) + dt : 0;
    if (this.lostTimer < 5) return;
    this.lostTimer = 0;
    const spots = this.SPAWNS.filter(([x, y, z]) => {
      const d = Math.hypot(x - player.pos.x, z - player.pos.z);
      return d > 2.5 && d < 6 && Math.abs(y - player.pos.y) < 1.5;
    });
    if (!spots.length) return;
    const [x, y, z] = spots[Math.floor(Math.random() * spots.length)];
    boss.reappearAt(x, y, z);
  },

  // ---- Willow's parcels ----
  // Willow (from her shop) sends weapons to whoever pops lots of frogs: the Pokey Stick
  // after 20 frogs, then the 'Rae' Gun after 20 more. Each parcel lands in a random room.
  PARCEL_FROGS: 20,
  PARCEL_ROOMS: [
    { room: "bedroom", x: 2.8, y: 0, z: 1.6 },
    { room: "bathroom", x: 1.8, y: 0, z: 7.4 },
    { room: "corridor", x: -2.95, y: 0, z: 6.5 },
    { room: "living room", x: 2.0, y: 0, z: 12.0 },
    { room: "office", x: -2.5, y: LOW, z: 22.5 },
    { room: "kitchen", x: -7.0, y: LOW, z: 24.0 },
  ],
  nextParcel: "stick",   // then "raygun", then nothing
  parcelGoal: 20,        // frogs popped before the next parcel arrives
  parcel: null,          // the parcel waiting to be picked up

  updateParcels(dt, player) {
    // Early on, Willow drops a hint
    if (!this.hinted && this.time > 8) {
      this.hinted = true;
      Dialogue.say(WILLOW_HINT_LINES, WILLOW_VOICE);
    }
    // Enough frogs: send a parcel!
    if (!this.parcel && this.nextParcel && stompedCount >= this.parcelGoal) this.sendParcel(player);
    if (!this.parcel) return;

    // Spin and bob so it's easy to spot; walk into it to open it
    const p = this.parcel;
    p.mesh.rotation.y += dt * 1.5;
    p.mesh.position.y = p.y + 0.12 + Math.sin(this.time * 3) * 0.05;
    const flat = Math.hypot(player.pos.x - p.x, player.pos.z - p.z);
    if (flat < 0.55 && Math.abs(player.pos.y - p.y) < 0.8) this.openParcel();
  },

  sendParcel(player) {
    // Any room except the one Rae is standing in (so she has to go and fetch it)
    const options = this.PARCEL_ROOMS.filter((r) => Math.hypot(r.x - player.pos.x, r.z - player.pos.z) > 4);
    const spot = options[Math.floor(Math.random() * options.length)];
    const mesh = makeParcel(this.nextParcel === "raygun" ? 0xb79ce6 : 0x8fcf7a);
    mesh.position.set(spot.x, spot.y + 0.12, spot.z);
    scene.add(mesh);
    this.parcel = { mesh, x: spot.x, y: spot.y, z: spot.z, weapon: this.nextParcel };
    Sfx.shopBell();
    const name = this.nextParcel === "raygun" ? "'Rae' Gun" : "Pokey Stick";
    Dialogue.say(willowParcelLine(name, spot.room), WILLOW_VOICE);
    showBanner(`📦 A parcel from Willow has arrived in the ${spot.room}!`);
  },

  openParcel() {
    const p = this.parcel;
    scene.remove(p.mesh);
    this.parcel = null;
    equipWeapon(p.weapon);
    Sfx.chime();
    Dialogue.say(p.weapon === "raygun" ? RAE_GUN_PARCEL_LINES : RAE_STICK_PARCEL_LINES);
    // The next parcel comes after another 20 frogs
    this.nextParcel = p.weapon === "stick" ? "raygun" : null;
    this.parcelGoal = stompedCount + this.PARCEL_FROGS;
  },
};

// What Willow says (she's left her shop, but she keeps in touch)
const WILLOW_HINT_LINES = [
  "Willow here, communicating remotely! Dispatch a sufficient quantity of frogs and I shall furnish you with armaments.",
  "A word from Willow: vanquish frogs in abundance and I shall reward you with superior weaponry!",
  "Willow speaking! Pop plenty of frogs, esteemed customer, and parcels of armaments shall follow.",
];
const willowParcelLine = (name, room) => pick([
  `Splendid frog-dispatching! I have had a ${name} delivered to the ${room}. Do retrieve it posthaste!`,
  `A parcel containing a ${name} awaits you in the ${room}. Compliments of Willow's Weapon Mart!`,
  `Your exemplary efforts merit a reward: a ${name}, delivered to the ${room}.`,
]);
const RAE_STICK_PARCEL_LINES = ["A Pokey Stick! Thanks, Willow!", "Ooh, a stick! Poke poke!", "Parcel for Rae! A Pokey Stick!"];
const RAE_GUN_PARCEL_LINES = ["The 'Rae' Gun! Pew pew!", "Thank you, Willow! Time to zap some frogs!", "Alien blaster acquired!"];

// A cardboard parcel tied with a coloured ribbon (green: stick, purple: 'Rae' Gun)
function makeParcel(ribbon) {
  const g = new THREE.Group();
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.24, 0.34), pastel(0xd9b48a));
  box.position.y = 0.12;
  const ribbonA = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.25, 0.06), pastel(ribbon));
  ribbonA.position.y = 0.12;
  const ribbonB = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.25, 0.36), pastel(ribbon));
  ribbonB.position.y = 0.12;
  const bow = [-1, 1].map((s) => {
    const loop = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.016, 4, 10), pastel(ribbon));
    loop.position.set(s * 0.05, 0.27, 0);
    loop.rotation.y = Math.PI / 2;
    loop.rotation.x = s * 0.5;
    return loop;
  });
  // A soft beam of light so you can spot it from across the room
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 2.2, 10, 1, true),
    new THREE.MeshBasicMaterial({ color: 0xfff2a8, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide }));
  beam.position.y = 1.2;
  g.add(box, ribbonA, ribbonB, ...bow, beam);
  return g;
}
