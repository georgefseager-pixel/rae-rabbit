// ============================================================
// bird.js — what happens if Rae makes it up onto the roof...
// ============================================================
// From the garden tree, a really good hop can get Rae up onto the roof.
// "Woah! I made it onto the roof!"... and then a big bird spots her. The camera
// locks onto it as it swoops down, grabs Rae, and flies off with her: a special
// game over (and the "Up, Up and Away" achievement).
//
// Uses these from other files: player, camera, paws, world, scene (main.js),
// Dialogue, Sfx, heroName(), showGameOver().

// A big friendly-looking bird of prey (wingspan about 2.3 m: Rae is only 0.45 m tall!).
// Built facing +z, so lookAt() points it where it's flying.
function makeBird() {
  const root = new THREE.Group();
  const brown = 0x8b6a4f, dark = 0x6e5240, cream = 0xf0e2c8, gold = 0xf2c14e;
  const body = blob(0.22, brown, 1, 0.9, 2.0);
  const belly = blob(0.18, cream, 0.95, 0.75, 1.6);
  belly.position.set(0, -0.06, 0.02);
  const head = blob(0.15, brown, 1, 1, 1.05);
  head.position.set(0, 0.12, 0.42);
  const face = blob(0.11, cream, 0.95, 0.8, 0.6);
  face.position.set(0, 0.1, 0.5);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.16, 6), pastel(gold));
  beak.rotation.x = Math.PI / 2 + 0.5; // pointing forward and a bit down (a hooked beak)
  beak.position.set(0, 0.06, 0.6);
  const eyes = [-1, 1].map((s) => {
    const eye = blob(0.022, 0x1f1b22, 1, 1, 0.6, [6, 4]);
    eye.position.set(s * 0.08, 0.18, 0.53);
    return eye;
  });
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.03, 0.34), pastel(dark));
  tail.position.set(0, 0, -0.5);
  // wings on shoulder pivots, so they can flap
  const wings = [-1, 1].map((s) => {
    const pivot = new THREE.Group();
    pivot.position.set(s * 0.18, 0.06, 0.05);
    const inner = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.04, 0.42), pastel(brown));
    inner.position.x = s * 0.28;
    const outer = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.03, 0.3), pastel(dark));
    outer.position.set(s * 0.8, 0, -0.04);
    pivot.add(inner, outer);
    return pivot;
  });
  // legs with orange talons, reaching down to grab
  const legs = [-1, 1].map((s) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.22, 5), pastel(gold));
    leg.position.set(s * 0.08, -0.25, 0.08);
    const talon = blob(0.045, 0xe0913a, 1.2, 0.5, 1.3, [6, 4]);
    talon.position.y = -0.12;
    leg.add(talon);
    return leg;
  });
  root.add(body, belly, head, face, beak, ...eyes, tail, ...wings, ...legs);
  root.userData.wings = wings;
  return root;
}

const Bird = {
  active: false,
  t: 0,

  // Is Rae standing up on the roof (or the very top of the house's walls)?
  onRoof() {
    const s = player.standingOn;
    return player.onGround && s && (s.name === "roof" || ((s.name === "ceiling" || s.name === "wall") && player.pos.y > 2.9));
  },

  start() {
    this.active = true;
    this.t = 0;
    this.lines = 0;
    this.home = player.pos.clone();
    const eye = this.home.clone().add(new THREE.Vector3(0, player.eyeHeight, 0));
    this.eye = eye;
    // Where Rae is looking (flat), and which way is "away from the house"
    this.ahead = new THREE.Vector3(-Math.sin(player.yaw), 0, -Math.cos(player.yaw));
    this.away = new THREE.Vector3(this.home.x - 0, 0, this.home.z - 14).normalize();
    if (this.away.lengthSq() < 0.01) this.away.set(1, 0, 0);
    // The bird appears high up ahead, circles in, swoops down, grabs, and flies away
    const side = new THREE.Vector3(this.ahead.z, 0, -this.ahead.x);
    this.p0 = eye.clone().addScaledVector(this.ahead, 14).addScaledVector(side, 6).add(new THREE.Vector3(0, 9, 0));
    this.p1 = eye.clone().addScaledVector(this.ahead, 6).add(new THREE.Vector3(0, 4.5, 0));
    this.pc = eye.clone().addScaledVector(this.ahead, 2.2).add(new THREE.Vector3(0, 0.4, 0));
    this.grab = eye.clone().add(new THREE.Vector3(0, 0.75, 0));
    this.end = this.grab.clone().addScaledVector(this.away, 34).add(new THREE.Vector3(0, 16, 0));
    this.look = eye.clone().addScaledVector(this.ahead, 5); // where the camera is looking
    this.bird = makeBird();
    this.bird.position.copy(this.p0);
    scene.add(this.bird);
    paws.group.visible = false;
    player.keys = {};
    Dialogue.say(heroName() === "Flopsy" ? "Woah!!! Flopsy made it onto the roof!!!" : "Woah! I made it onto the roof!");
  },

  // Called every frame instead of the normal game while it's happening
  update(dt, time) {
    this.t += dt;
    const t = this.t, b = this.bird;
    const prev = b.position.clone();
    let camPos = this.eye.clone(), lookAt = null;

    if (t < 1.2) {
      // just Rae on the roof, enjoying the view... then a screech!
      if (t > 0.9 && !this.screeched) { this.screeched = true; Sfx.screech(); }
      b.position.copy(this.p0);
      lookAt = this.eye.clone().addScaledVector(this.ahead, 5);
    } else if (t < 2.6) {
      // the bird glides in from up high (the camera turns to watch it)
      const k = (t - 1.2) / 1.4;
      b.position.lerpVectors(this.p0, this.p1, k * k * (3 - 2 * k));
      lookAt = b.position;
      if (!this.said1) { this.said1 = true; Dialogue.say(BIRD_SPOT_LINES); }
    } else if (t < 3.6) {
      // ...and swoops down at Rae!
      const k = (t - 2.6) / 1.0, e = k * k;
      const a = this.p1.clone().lerp(this.pc, e), c = this.pc.clone().lerp(this.grab, e);
      b.position.copy(a.lerp(c, e));
      lookAt = b.position;
      if (!this.screeched2) { this.screeched2 = true; Sfx.screech(); }
    } else {
      // GRABBED: up, up and away (Rae hangs below, looking back at the house)
      if (!this.grabbed) { this.grabbed = true; Sfx.boing(); Dialogue.say(BIRD_GRAB_LINES); }
      const k = Math.min(1, (t - 3.6) / 6), e = k * k;
      b.position.lerpVectors(this.grab, this.end, e);
      camPos = b.position.clone().add(new THREE.Vector3(Math.sin(t * 3) * 0.05, -0.85, 0));
      lookAt = new THREE.Vector3(0, 1, 13); // the house, getting smaller
      if (t > 5.4 && this.lines < 1) { this.lines = 1; Dialogue.say(BIRD_FLY_LINES); }
      if (t > 7.4 && this.lines < 2) { this.lines = 2; Dialogue.say(BIRD_BYE_LINES); }
      if (t > 9.4 && this.lines < 3) { this.lines = 3; showGameOver("bird"); }
    }

    // flap, and point the bird the way it's going
    const flap = this.grabbed ? 9 : (t < 2.6 ? 4 : 2);
    b.userData.wings.forEach((w, i) => { w.rotation.z = (i ? -1 : 1) * Math.sin(time * flap) * (t < 2.6 || this.grabbed ? 0.6 : 0.15); });
    const dir = b.position.clone().sub(prev);
    if (dir.lengthSq() > 1e-6) b.lookAt(b.position.clone().add(dir));

    // the camera: smoothly turning to whatever it's watching
    this.look.lerp(lookAt, Math.min(1, dt * (t < 3.6 ? 3 : 1.5)));
    camera.position.copy(camPos);
    camera.lookAt(this.look);
  },
};

const BIRD_SPOT_LINES = ["Huh? What's that up there?", "Is that... a really big bird?", "Ooh, a birdie! A really, REALLY big birdie..."];
const BIRD_GRAB_LINES = ["Eek! Put me down, birdy!", "Hey! I'm not a worm!", "Waaah! My feet aren't touching anything!"];
const BIRD_FLY_LINES = ["Wheee! ...wait, no. Not wheee!", "I can see the whole garden from here!", "This is NOT how bunnies are supposed to travel!"];
const BIRD_BYE_LINES = ["Bye bye, house! Save me some carrots!", "Somebody tell Willow I'll be late!", "Next time I'm staying on the ground!"];
