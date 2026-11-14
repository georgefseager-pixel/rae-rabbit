// ============================================================
// rae.js — Rae Rabbit's body
// ============================================================
// Two parts:
//   RaeModel         her whole low-poly body. Only MIRRORS can see it
//                    (it lives on "layer 1", which the main camera skips).
//   FirstPersonPaws  the tips of her two front paws, peeking up at the bottom
//                    corners of the screen (layer 2: main camera only).
//
// Based on a floppy-eared plush bunny: caramel fur, pink inner ears,
// pink nose and foot pads, black bead eyes. She wears a black shirt with a red plus.

const RAE_COLORS = {
  fur:      0xd6a774, // caramel
  furLight: 0xe9cba3, // muzzle
  pink:     0xf2bcc4, // inner ears, nose, foot pads
  eye:      0x2b2630,
  shirt:    0x2f2b35, // soft black
  plus:     0xe2475a, // red plus
  tail:     0xf6e7d4,
};

// Colours for Rae's outfits (see setOutfit below and the Flopsy Shop in main.js)
const OUTFIT_COLORS = {
  dress:     0xf6a5c8, // pink dress
  navy:      0x3e4c7e, // navy suit
  frogGreen: 0x9fdc8a, // frog shirt
  clownRed:  0xec3b4f, // clown nose & cheeks
  clownBlue: 0x6fa8f0, // clown face paint
};

const LAYER_MIRROR_ONLY = 1; // things only mirrors see (Rae's body)
const LAYER_EYES_ONLY = 2;   // things only the main camera sees (first-person paws)

// A flat-shaded ellipsoid: a low-poly sphere stretched by (sx, sy, sz)
function blob(radius, color, sx = 1, sy = 1, sz = 1, detail = [7, 5]) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, detail[0], detail[1]), pastel(color));
  mesh.scale.set(sx, sy, sz);
  return mesh;
}

// Flopsy, who runs the Flopsy Shop: a smaller, light caramel-brown bunny (same shape as Rae)
const FLOPSY_COLORS = { ...RAE_COLORS, fur: 0xc39a72, furLight: 0xe2c8a8, tail: 0xf6e9d8 };

class RaeModel {
  // colors: RAE_COLORS for Rae, FLOPSY_COLORS for Flopsy
  constructor(colors = RAE_COLORS) {
    const C = colors;
    this.C = colors;
    this.waveTimer = 0;
    this.root = new THREE.Group();   // stands at Rae's feet, turns with her
    this.body = new THREE.Group();   // everything; squashes & bobs
    this.root.add(this.body);

    // ---- Torso in her black shirt, with the red plus on the front ----
    const torso = blob(0.125, C.shirt, 1, 1.05, 0.92);
    torso.position.y = 0.18;
    const hips = blob(0.11, C.fur, 1, 0.8, 0.95);
    hips.position.y = 0.1;
    const plusA = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.022, 0.02), pastel(C.plus));
    const plusB = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.075, 0.02), pastel(C.plus));
    plusA.position.set(0, 0.2, -0.112);
    plusB.position.set(0, 0.2, -0.112);
    const tail = blob(0.035, C.tail);
    tail.position.set(0, 0.1, 0.11);
    this.body.add(torso, hips, plusA, plusB, tail);

    // ---- Head (on a neck pivot so it can nod) ----
    this.head = new THREE.Group();
    this.head.position.y = 0.29;
    const skull = blob(0.115, C.fur, 1.05, 0.95, 1);
    skull.position.y = 0.075;
    const muzzle = blob(0.052, C.furLight, 1.1, 0.8, 0.8);
    muzzle.position.set(0, 0.045, -0.095);
    const nose = blob(0.018, C.pink, 1.3, 0.9, 0.8, [6, 4]);
    nose.position.set(0, 0.062, -0.135);
    const eyeL = blob(0.015, C.eye, 1, 1, 0.6, [6, 4]);
    const eyeR = eyeL.clone();
    eyeL.position.set(-0.048, 0.1, -0.098);
    eyeR.position.set(0.048, 0.1, -0.098);
    this.head.add(skull, muzzle, nose, eyeL, eyeR);

    // Long floppy ears, hanging down the sides of her head
    this.ears = [-1, 1].map((side) => {
      const pivot = new THREE.Group();
      pivot.position.set(side * 0.075, 0.16, 0.01);
      const outer = blob(0.05, C.fur, 0.75, 2.7, 0.38);
      outer.position.y = -0.11;
      const inner = blob(0.04, C.pink, 0.62, 2.4, 0.2);
      inner.position.set(-side * 0.004, -0.11, -0.016);
      pivot.add(outer, inner);
      pivot.userData.side = side;
      this.head.add(pivot);
      return pivot;
    });
    this.body.add(this.head);

    // ---- Arms (pivot at the shoulder) ----
    this.arms = [-1, 1].map((side) => {
      const pivot = new THREE.Group();
      pivot.position.set(side * 0.115, 0.24, -0.01);
      const arm = blob(0.04, C.fur, 1, 2.0, 1);
      arm.position.y = -0.065;
      pivot.add(arm);
      pivot.userData.side = side;
      this.body.add(pivot);
      return pivot;
    });

    // ---- Legs with big pink-padded feet (pivot at the hip) ----
    this.legs = [-1, 1].map((side) => {
      const pivot = new THREE.Group();
      pivot.position.set(side * 0.065, 0.09, 0);
      const thigh = blob(0.05, C.fur, 1, 1.2, 1.1);
      thigh.position.y = -0.02;
      const foot = blob(0.045, C.fur, 1, 0.6, 1.7);
      foot.position.set(0, -0.065, -0.035);
      const pad = blob(0.03, C.pink, 1, 0.75, 0.35, [6, 4]);
      pad.position.set(0, -0.062, -0.11);
      pivot.add(thigh, foot, pad);
      pivot.userData.side = side;
      this.body.add(pivot);
      return pivot;
    });

    // Remember the parts that outfits change
    this.torso = torso;
    this.muzzle = muzzle;
    this.nose = nose;
    this.plusSign = [plusA, plusB];
    this.thighs = this.legs.map((leg) => leg.children[0]);
    this.buildOutfitExtras();
    this.setOutfit("shirt");

    // Only mirrors may see her body
    this.root.traverse((o) => o.layers.set(LAYER_MIRROR_ONLY));

    this.walkPhase = 0;
    this.squash = 0;
    this.wasOnGround = true;
  }

  // The extra bits that only some outfits use (all hidden until needed)
  buildOutfitExtras() {
    const X = {};
    // Pink dress: a flared skirt and a bow between the ears
    X.skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.175, 0.13, 9), pastel(OUTFIT_COLORS.dress));
    X.skirt.position.y = 0.1;
    X.bow = new THREE.Group();
    for (const side of [-1, 1]) {
      const loop = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.06, 4), pastel(OUTFIT_COLORS.dress));
      loop.rotation.z = side * Math.PI / 2;
      loop.position.x = side * 0.03;
      X.bow.add(loop);
    }
    X.bow.add(blob(0.015, OUTFIT_COLORS.dress));
    X.bow.position.set(0, 0.19, -0.02);
    this.head.add(X.bow);

    // Navy suit: white shirt collar, a red tie
    X.collar = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.07, 3), pastel(0xffffff));
    X.collar.rotation.x = Math.PI;
    X.collar.position.set(0, 0.245, -0.108);
    X.tie = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.085, 0.015), pastel(RAE_COLORS.plus));
    X.tie.position.set(0, 0.2, -0.122);

    // Frog shirt: a frog face on the chest
    X.frogFace = new THREE.Group();
    for (const side of [-1, 1]) {
      const eyeWhite = blob(0.024, 0xffffff);
      eyeWhite.position.set(side * 0.038, 0.235, -0.11);
      const pupil = blob(0.011, RAE_COLORS.eye);
      pupil.position.set(side * 0.038, 0.235, -0.13);
      X.frogFace.add(eyeWhite, pupil);
    }
    const frogSmile = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.006, 4, 10, Math.PI), pastel(0x4f7f48));
    frogSmile.rotation.z = Math.PI;
    frogSmile.position.set(0, 0.185, -0.12);
    X.frogFace.add(frogSmile);

    // Clown: big red nose, blue diamonds round the eyes, rosy cheeks
    X.clown = new THREE.Group();
    const redNose = blob(0.03, OUTFIT_COLORS.clownRed);
    redNose.position.set(0, 0.065, -0.14);
    X.clown.add(redNose);
    for (const side of [-1, 1]) {
      for (const dy of [0.032, -0.03]) {
        const diamond = new THREE.Mesh(new THREE.OctahedronGeometry(0.018), pastel(OUTFIT_COLORS.clownBlue));
        diamond.scale.set(0.7, 1.3, 0.3);
        diamond.position.set(side * 0.048, 0.1 + dy, -0.103);
        X.clown.add(diamond);
      }
      const cheek = blob(0.02, OUTFIT_COLORS.clownRed, 1, 0.8, 0.4);
      cheek.position.set(side * 0.075, 0.045, -0.09);
      X.clown.add(cheek);
    }
    this.head.add(X.clown);

    this.body.add(X.skirt, X.collar, X.tie, X.frogFace);
    this.extras = X;
  }

  // Change clothes! name is one of the ids in OUTFITS (frog.js / main.js use these too)
  setOutfit(name) {
    const C = this.C, X = this.extras;
    const torsoColor = {
      naked: C.fur, shirt: C.shirt, dress: OUTFIT_COLORS.dress,
      suit: OUTFIT_COLORS.navy, frog: OUTFIT_COLORS.frogGreen, clown: C.shirt,
    }[name];
    this.outfit = name;
    this.torso.material.color.set(torsoColor);
    this.plusSign.forEach((m) => (m.visible = name === "shirt" || name === "clown"));
    X.skirt.visible = X.bow.visible = name === "dress";
    X.collar.visible = X.tie.visible = name === "suit";
    X.frogFace.visible = name === "frog";
    X.clown.visible = name === "clown";
    this.nose.visible = name !== "clown";
    this.muzzle.material.color.set(name === "clown" ? 0xffffff : C.furLight); // white face paint
    this.thighs.forEach((t) => t.material.color.set(name === "suit" ? OUTFIT_COLORS.navy : C.fur)); // trousers
  }

  // Follow the player and animate. Called every frame.
  update(dt, player, time) {
    this.root.position.copy(player.pos);
    this.root.rotation.y = player.yaw;

    const speed = Math.hypot(player.vel.x, player.vel.z);
    const moving = speed > 0.1;
    const air = !player.onGround;

    // Landing squash
    if (!air && !this.wasOnGround) this.squash = 1;
    this.wasOnGround = !air;
    this.squash = Math.max(0, this.squash - dt * 6);

    let bob = 0, legSwing = 0, armSwing = 0, earLift = 0, armsOut = 0;
    if (air) {
      // Jumping: legs stretch back when rising, ears flop up as she falls
      legSwing = player.vel.y > 0 ? -0.6 : 0.3;
      armsOut = 0.7;
      earLift = Math.min(1.3, Math.max(0, -player.vel.y * 0.18));
    } else if (moving) {
      // Hoppy walk
      this.walkPhase += dt * 13;
      bob = Math.abs(Math.sin(this.walkPhase)) * 0.045;
      legSwing = Math.sin(this.walkPhase) * 0.7;
      armSwing = Math.sin(this.walkPhase) * 0.5;
      earLift = Math.abs(Math.sin(this.walkPhase)) * 0.25;
    } else {
      this.walkPhase = 0;
    }

    // Idle breathing and a gentle ear sway
    const breathe = Math.sin(time * 2.2) * 0.018;
    const sq = this.squash;
    this.body.scale.set(1 + sq * 0.12, 1 + breathe - sq * 0.18, 1 + sq * 0.12);
    this.body.position.y = bob;

    this.head.rotation.x = player.pitch * 0.45; // nods to follow where you look
    this.head.rotation.z = Math.sin(time * 0.9) * 0.04;

    for (const ear of this.ears) {
      const side = ear.userData.side;
      ear.rotation.z = side * (0.22 + earLift + Math.sin(time * 1.7 + side) * 0.04);
      ear.rotation.x = -earLift * 0.3;
    }
    for (const arm of this.arms) {
      const side = arm.userData.side;
      arm.rotation.x = armSwing * -side;
      arm.rotation.z = side * (0.15 + armsOut);
    }
    for (const leg of this.legs) {
      const side = leg.userData.side;
      leg.rotation.x = air ? legSwing : legSwing * side;
    }

    // Punching: the arm swings straight out in front
    for (const arm of this.arms) {
      arm.userData.punch = Math.max(0, (arm.userData.punch || 0) - dt);
      const e = punchCurve(arm.userData.punch);
      if (e > 0) {
        arm.rotation.x = 1.6 * e;
        arm.rotation.z = arm.userData.side * 0.1;
      }
    }

    // A friendly wave: one arm up high, waggling
    if (this.waveTimer > 0) {
      this.waveTimer -= dt;
      const arm = this.arms[1];
      arm.rotation.z = 2.5 + Math.sin(time * 16) * 0.35;
      arm.rotation.x = 0;
    }
  }

  wave(seconds = 2.2) { this.waveTimer = seconds; }

  // Throw a punch with the left (-1) or right (+1) arm
  punch(side) {
    this.arms.find((a) => a.userData.side === side).userData.punch = PUNCH_TIME;
  }
}

// The two front paws you see at the bottom corners of the screen
class FirstPersonPaws {
  constructor(camera) {
    this.camera = camera;
    this.group = new THREE.Group();
    camera.add(this.group);
    this.paws = [-1, 1].map((side) => {
      const paw = new THREE.Group();
      const arm = blob(0.05, RAE_COLORS.fur, 1, 0.9, 2.2); // big fluffy paw
      paw.add(arm);
      paw.rotation.x = 0.35;               // tilted up a little
      paw.rotation.y = -side * 0.25;       // angled in towards the middle
      paw.userData.side = side;
      paw.userData.punch = 0;              // counts down while punching
      this.group.add(paw);
      return paw;
    });
    // Always drawn on top (so they never poke into walls), and only for the main camera
    this.group.traverse((o) => {
      o.layers.set(LAYER_EYES_ONLY);
      if (o.isMesh) {
        o.material.depthTest = false;
        o.material.depthWrite = false;
        o.renderOrder = 999;
      }
    });
    this.phase = 0;
    this.lift = 0;
  }

  update(dt, player, time) {
    // Work out where the bottom corners of the screen are, at 0.25m in front
    const dist = 0.25;
    const halfH = dist * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    const halfW = halfH * this.camera.aspect;

    const moving = Math.hypot(player.vel.x, player.vel.z) > 0.1 && player.onGround;
    if (moving) this.phase += dt * 13;
    const targetLift = player.onGround ? 0 : 0.03; // paws come up when she jumps
    this.lift += (targetLift - this.lift) * Math.min(1, dt * 10);

    for (const paw of this.paws) {
      const side = paw.userData.side;
      const step = moving ? Math.abs(Math.sin(this.phase + (side > 0 ? Math.PI / 2 : 0))) * 0.018 : 0;
      const idle = Math.sin(time * 2.2 + side) * 0.003;
      // Punch: the paw shoots forward and up towards the middle of the screen, then back
      paw.userData.punch = Math.max(0, paw.userData.punch - dt);
      const e = punchCurve(paw.userData.punch);
      const restX = side * Math.min(halfW * 0.62, 0.21);
      // Dancing: paws pump up and down in turn, waving side to side
      const groove = this.dancing ? Math.abs(Math.sin(time * 5.5 + (side > 0 ? Math.PI / 2 : 0))) * halfH * 0.7 : 0;
      const sway = this.dancing ? Math.sin(time * 2.75) * 0.03 : 0;
      // Only the tips show: most of each paw sits just below the screen edge
      paw.position.set(
        restX * (1 - e * 0.75) + sway,
        -halfH - 0.012 + step + idle + this.lift + e * (halfH * 0.75) + groove,
        -dist - e * 0.1);
      paw.rotation.x = 0.35 - e * 0.35;
    }
  }

  // Throw a punch with the left (-1) or right (+1) paw
  punch(side) {
    const paw = this.paws.find((p) => p.userData.side === side);
    paw.userData.punch = PUNCH_TIME;
  }
}

// Dance moves for Rae's body: give it where she's standing and the time, and it
// fills in a pretend "player" (bouncy hops, swaying, a twirl every few seconds)
// for RaeModel.update to animate. Used for the dance button and the shop stage.
function danceMotion(fake, standPos, baseYaw, time) {
  const beat = time * 5.5;
  const hop = Math.max(0, Math.sin(beat));
  fake.pos.set(standPos.x, standPos.y + hop * 0.06, standPos.z);
  fake.onGround = hop < 0.05;
  fake.vel.set(fake.onGround ? 0.5 : 0, Math.cos(beat) * 0.6, 0);
  const twirl = time % 4;
  fake.yaw = baseYaw + Math.sin(time * 1.6) * 0.5 + (twirl > 3.3 ? ((twirl - 3.3) / 0.7) * Math.PI * 2 : 0);
  fake.pitch = 0.25 + Math.sin(beat) * 0.15; // head bopping to the beat
  return fake;
}

// How long a punch takes (seconds), and its shape over time:
// 0 at rest -> 1 fully stretched out (quickly) -> back to 0 (a bit slower)
const PUNCH_TIME = 0.3;
function punchCurve(timeLeft) {
  if (timeLeft <= 0) return 0;
  const t = 1 - timeLeft / PUNCH_TIME;     // 0 -> 1 through the punch
  return t < 0.3 ? t / 0.3 : 1 - (t - 0.3) / 0.7;
}
