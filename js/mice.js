// ============================================================
// mice.js — the secret of the fireplace mouse hole
// ============================================================
// Stand in the fireplace nook (by the little mouse hole) and wait...
//   after 5 seconds:  a white mouse pokes its head out, has a look, and pops back in
//   10 seconds later: two mice step out and do a little dance (the "Scrumbly Secret"!)
// Hit them while they're dancing and they both go POP. Otherwise, after their
// dance they scurry back home (and might come out again if you wait).
//
// Uses these from other files: world, scene, player (main.js), Sfx, Dialogue,
// Achievements, raeSays().

// A little white mouse: round body, big round ears, bead eyes, tiny pink nose,
// stubby arms and a long thin tail. About 0.22 m tall. Faces -z (like Rae).
function makeMouse() {
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);
  const fur = 0xf7f4f1, shade = 0xe4e0e6, pink = 0xf2b8c6, black = 0x1f1b22;

  const belly = blob(0.065, fur, 1, 1.05, 0.95);
  belly.position.y = 0.07;
  const feet = [-1, 1].map((s) => {
    const foot = blob(0.025, shade, 1, 0.6, 1.4, [6, 4]);
    foot.position.set(s * 0.035, 0.012, -0.015);
    return foot;
  });
  body.add(belly, ...feet);

  const head = new THREE.Group();
  head.position.y = 0.15;
  const skull = blob(0.06, fur, 1.05, 0.95, 1);
  const eyes = [-1, 1].map((s) => {
    const eye = blob(0.011, black, 1, 1.15, 0.7, [6, 4]);
    eye.position.set(s * 0.026, 0.006, -0.054);
    return eye;
  });
  const nose = blob(0.008, pink, 1.2, 0.9, 1, [6, 4]);
  nose.position.set(0, -0.012, -0.06);
  const ears = [-1, 1].map((s) => {
    const ear = new THREE.Group();
    const outer = blob(0.045, fur, 1, 1, 0.25);
    const inner = blob(0.033, pink, 1, 1, 0.15, [8, 5]);
    inner.position.z = -0.006;
    ear.add(outer, inner);
    ear.position.set(s * 0.05, 0.055, 0.005);
    ear.rotation.z = s * -0.35;
    return ear;
  });
  head.add(skull, ...eyes, nose, ...ears);
  body.add(head);

  const arms = [-1, 1].map((s) => {
    const arm = new THREE.Group();
    const paw = blob(0.016, fur, 1, 1.6, 1, [6, 4]);
    paw.position.y = -0.02;
    arm.add(paw);
    arm.position.set(s * 0.06, 0.1, -0.02);
    arm.rotation.z = s * 0.4;
    body.add(arm);
    return arm;
  });

  // a long thin curly tail
  const tail = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.005, 4, 12, Math.PI * 1.4), pastel(pink));
  tail.position.set(0, 0.03, 0.08);
  tail.rotation.set(0, Math.PI / 2, 0);
  body.add(tail);

  root.userData = { body, head, arms, ears };
  return root;
}

const Mice = {
  PEEK_AT: 5,         // seconds in the nook before a mouse peeks out
  DANCE_AT: 15,       // ...and before the two of them come out to dance
  DANCE_TIME: 8,      // how long they dance before going home

  state: "hidden",    // hidden -> peek -> waiting -> out -> dance -> home -> hidden (or "popped")
  waited: 0,          // seconds Rae has stood in the nook
  t: 0,               // seconds into the current state

  init() {
    this.hole = world.mouseHole;
    this.mice = [makeMouse(), makeMouse()];
    for (const m of this.mice) { m.visible = false; scene.add(m); }
  },

  // Where each mouse stands when out of the hole (side by side, in front of it)
  spot(i) {
    return { x: this.hole.x - 0.42, z: this.hole.z + (i === 0 ? -0.16 : 0.16) };
  },

  update(dt, time) {
    if (!this.mice || this.state === "popped") return;
    const inNook = world.zoneAt(player.pos) === "mouse-nook";
    this.t += dt;

    if (this.state === "hidden") {
      this.waited = inNook ? this.waited + dt : 0; // have to keep standing there
      if (this.waited >= this.PEEK_AT) this.go("peek");
    } else if (this.state === "peek") {
      // one mouse pokes its head out of the hole for a look, then ducks back in
      const m = this.mice[0], h = this.hole;
      const out = Math.min(1, Math.sin(Math.min(this.t, 1.8) / 1.8 * Math.PI) * 1.6); // out... and in
      m.visible = true;
      m.position.set(h.x + 0.1 - out * 0.12, h.y, h.z);
      m.rotation.y = Math.PI / 2;                          // looking out into the room
      m.userData.head.rotation.y = Math.sin(this.t * 6) * 0.4; // looking around
      if (this.t > 0.6 && !this.squeaked) { this.squeaked = true; Sfx.squeak(); }
      if (this.t > 1.8) { m.visible = false; this.go("waiting"); }
    } else if (this.state === "waiting") {
      if (!inNook) { this.go("hidden"); return; } // wandered off: start over
      this.waited += dt;
      if (this.waited >= this.DANCE_AT) this.go("out");
    } else if (this.state === "out") {
      // both mice scurry out of the hole, side by side
      const k = Math.min(1, this.t / 1.2);
      this.mice.forEach((m, i) => {
        const s = this.spot(i);
        m.visible = true;
        m.position.set(this.hole.x + 0.1 + (s.x - this.hole.x - 0.1) * k, this.hole.y + Math.abs(Math.sin(this.t * 16)) * 0.015,
          this.hole.z + (s.z - this.hole.z) * k);
        m.rotation.y = Math.PI / 2;
        m.userData.body.rotation.z = Math.sin(this.t * 16) * 0.12; // waddle
      });
      if (k >= 1) {
        this.go("dance");
        Sfx.danceTune();
        Achievements.unlock("scrumbly");
        Dialogue.say(MICE_DANCE_LINES);
      }
    } else if (this.state === "dance") {
      this.mice.forEach((m, i) => {
        const s = this.spot(i), beat = this.t * 6 + i * Math.PI; // they take turns bouncing
        const hop = Math.max(0, Math.sin(beat)) * 0.06;
        m.position.set(s.x, this.hole.y + hop, s.z);
        const twirl = (this.t % 2.5) > 2 ? (((this.t % 2.5) - 2) / 0.5) * Math.PI * 2 : 0;
        m.rotation.y = Math.PI / 2 + Math.sin(this.t * 3) * 0.4 + twirl * (i ? -1 : 1);
        const { arms, ears, body } = m.userData;
        arms.forEach((a, j) => { a.rotation.z = (j ? 1 : -1) * (2.2 + Math.sin(beat * 2 + j) * 0.5); }); // paws up, waving
        ears.forEach((e, j) => { e.rotation.z = (j ? 1 : -1) * (0.35 + Math.sin(beat) * 0.15); });
        body.rotation.z = Math.sin(this.t * 3 + i) * 0.15;
      });
      if (this.t > this.DANCE_TIME) this.go("home");
    } else if (this.state === "home") {
      // back into the hole they go
      const k = Math.min(1, this.t / 1.0);
      this.mice.forEach((m, i) => {
        const s = this.spot(i);
        m.position.set(s.x + (this.hole.x + 0.1 - s.x) * k, this.hole.y, s.z + (this.hole.z - s.z) * k);
        m.rotation.y = -Math.PI / 2;
        m.userData.arms.forEach((a, j) => { a.rotation.z = (j ? 1 : -1) * 0.4; });
        m.userData.body.rotation.z = Math.sin(this.t * 16) * 0.12;
      });
      if (k >= 1) { this.mice.forEach((m) => (m.visible = false)); this.go("hidden"); }
    }
  },

  go(state) {
    this.state = state;
    this.t = 0;
    this.squeaked = false;
    if (state === "hidden") this.waited = 0;
  },

  // Rae hit something at this point: dancing mice go POP (both of them!)
  hitAt(point, reach) {
    if (this.state !== "dance") return false;
    const hit = this.mice.some((m) => m.position.clone().add(new THREE.Vector3(0, 0.1, 0)).distanceTo(point) < reach + 0.12);
    if (!hit) return false;
    for (const m of this.mice) {
      const box = new THREE.Box3().setFromObject(m);
      world.debris.burst({ mesh: m, box });
      m.visible = false;
    }
    Sfx.frogPop();
    Sfx.crunch();
    this.state = "popped";
    raeSays("mice-popped");
    return true;
  },
};

const MICE_DANCE_LINES = [
  "Mice! Dancing mice! This is the best secret ever!",
  "Aww, look at them go! Scrumbly!",
  "A tiny mouse dance party in the fireplace!",
];
