// ============================================================
// frog.js — the frog "enemies"
// ============================================================
// Squishy plush frogs that hop about. When one spots Rae it says something
// (in red, top left) and slowly hops after her. Land on its head to pop it!
// If Rae wanders far from where a frog started, it comes back there, good as new.

const FROG_LINES = [
  "Hop hop!",
  "Hi rabbit friend!",
  "Ribbit!",
  "Have a hoppy day!",
  "It's me, Friggle Fraggle!",
  "Ribbit ribbit!",
  "Wanna play leapfrog?",
  "Toad-ally nice to see you!",
  "Hoppity hop hop!",
  "Croak-a-doodle-doo!",
  "Lily pads are my favourite!",
  "You're un-be-leaf-able!",
  "Frogs and bunnies, best buddies!",
  "Catch me if you can! Wait, no...",
  "Splish splash!",
  "Ribbit means hello!",
  "I'm un-frog-ettable!",
];

// Pastel colours for the frogs; each frog gets its own
const FROG_COLORS = {
  green:  0x9fdc8a,
  pink:   0xf6aecb,
  blue:   0x9fcdf2,
  yellow: 0xf6e08a,
  lilac:  0xc6b0f0,
  peach:  0xf8c29e,
  teal:   0x8fdcce,
};

class Frog {
  constructor(world, x, y, z, color) {
    this.world = world;
    this.spawn = new THREE.Vector3(x, y, z);
    this.color = color;

    // ---- Tweakable numbers ----
    this.sightRange = 6.5;    // how far away a frog can spot Rae
    this.loseRange = 10;      // stops chasing beyond this
    this.hopSpeed = 1.5;      // sideways speed during a hop (slow!)
    this.hopPower = 3.4;      // how high each hop goes
    this.gravity = 14;
    this.radius = 0.2;
    this.height = 0.47;
    this.respawnDistance = 16; // Rae this far from the spawn point -> frog resets

    this.buildModel(color);
    world.scene.add(this.root);
    this.reset(false);
  }

  // Repaint the whole frog in a new colour (eyes stay black; mouth is a darker shade)
  recolor(color) {
    this.color = color;
    const dark = new THREE.Color(color).multiplyScalar(0.45);
    this.root.traverse((o) => {
      if (!o.isMesh || o.userData.keep) return;
      if (o.userData.dark) o.material.color.copy(dark);
      else o.material.color.set(color);
    });
  }

  // A random colour from FROG_COLORS, different from the current one
  randomColor() {
    const options = Object.values(FROG_COLORS).filter((c) => c !== this.color);
    return options[Math.floor(Math.random() * options.length)];
  }

  // ---------- The model ----------
  buildModel(color) {
    const dark = new THREE.Color(color).multiplyScalar(0.45).getHex(); // mouth & nostrils
    this.root = new THREE.Group();
    this.body = new THREE.Group();
    this.root.add(this.body);

    const belly = blob(0.15, color, 1.1, 0.95, 0.95);
    belly.position.y = 0.15;
    this.body.add(belly);

    // Big wide head with two eye bumps on top
    this.head = new THREE.Group();
    this.head.position.y = 0.26;
    const face = blob(0.15, color, 1.25, 0.82, 1);
    face.position.y = 0.07;
    this.head.add(face);
    for (const side of [-1, 1]) {
      const bump = blob(0.06, color);
      bump.position.set(side * 0.095, 0.145, -0.025);
      const eye = blob(0.019, RAE_COLORS.eye, 1, 1, 0.6, [6, 4]);
      eye.userData.keep = true; // eyes stay black when the frog changes colour
      eye.position.set(side * 0.095, 0.155, -0.08);
      const nostril = blob(0.008, dark, 1, 1, 1, [4, 3]);
      nostril.userData.dark = true;
      nostril.position.set(side * 0.03, 0.105, -0.146);
      this.head.add(bump, eye, nostril);
    }
    // A wide, happy smile (half a thin ring)
    const smile = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.007, 4, 14, Math.PI), pastel(dark));
    smile.userData.dark = true;
    smile.rotation.z = Math.PI;
    smile.scale.set(1.15, 0.45, 1);
    smile.position.set(0, 0.075, -0.135);
    this.head.add(smile);
    this.body.add(this.head);

    // Arms with little three-toed hands
    this.arms = [-1, 1].map((side) => {
      const pivot = new THREE.Group();
      pivot.position.set(side * 0.15, 0.22, -0.02);
      const arm = blob(0.045, color, 1, 1.8, 1);
      arm.position.y = -0.06;
      pivot.add(arm);
      for (let t = -1; t <= 1; t++) {
        const toe = blob(0.02, color);
        toe.position.set(side * 0.01 + t * 0.022, -0.135, -0.01);
        pivot.add(toe);
      }
      pivot.userData.side = side;
      this.body.add(pivot);
      return pivot;
    });

    // Big flat feet with three toes
    this.legs = [-1, 1].map((side) => {
      const pivot = new THREE.Group();
      pivot.position.set(side * 0.09, 0.07, -0.02);
      const foot = blob(0.07, color, 1, 0.45, 1.45);
      foot.position.set(0, -0.04, -0.05);
      pivot.add(foot);
      for (let t = -1; t <= 1; t++) {
        const toe = blob(0.028, color, 1, 0.6, 1);
        toe.position.set(t * 0.042, -0.045, -0.15);
        pivot.add(toe);
      }
      pivot.userData.side = side;
      this.body.add(pivot);
      return pivot;
    });
  }

  // Back to the spawn point, fresh and unpopped (and, on a respawn, a new colour!)
  reset(newColor = true) {
    if (newColor) this.recolor(this.randomColor());
    this.pos = this.spawn.clone();
    this.pos.y += 0.05; // start just above the floor, then drop onto it
    this.vel = new THREE.Vector3();
    this.yaw = Math.random() * Math.PI * 2;
    this.targetYaw = this.yaw;
    this.onGround = false;
    this.alive = true;
    this.chasing = false;
    this.hopTimer = 0.5 + Math.random();
    this.crouch = 0;
    this.squash = 0;
    this.wanderDir = null;
    this.sightTimer = Math.random() * 0.3;
    this.canSee = false;
    this.talkCooldown = 0;
    this.root.visible = true;
    this.root.scale.setScalar(0.01); // pops in
  }

  top() { return this.pos.y + this.height; }

  // Is there a clear line between the frog's eyes and Rae's? (walls & doors block it)
  lookFor(player) {
    const from = new THREE.Vector3(this.pos.x, this.pos.y + 0.35, this.pos.z);
    const to = new THREE.Vector3(player.pos.x, player.pos.y + 0.35, player.pos.z);
    const dist = from.distanceTo(to);
    const blockers = this.world.props.filter((p) => p.solid && !p.broken &&
      (p.name === "wall" || p.name === "door" || p.name.includes("floor") || p.name === "ceiling"));
    const point = new THREE.Vector3();
    for (let d = 0.3; d < dist - 0.2; d += 0.3) {
      point.lerpVectors(from, to, d / dist);
      if (blockers.some((b) => b.box.containsPoint(point))) return false;
    }
    return true;
  }

  // Pop! Called when Rae lands on its head.
  pop() {
    if (!this.alive) return;
    this.alive = false;
    this.chasing = false;
    const box = new THREE.Box3().setFromObject(this.root);
    this.world.debris.burst({ mesh: this.root, box });
    this.root.visible = false;
    Sfx.frogPop();
  }

  update(dt, player, time) {
    const toRaeFromSpawn = Math.hypot(player.pos.x - this.spawn.x, player.pos.z - this.spawn.z);

    // ---- Respawn when Rae is far away from where this frog lives ----
    if (toRaeFromSpawn > this.respawnDistance) {
      const away = this.pos.distanceTo(this.spawn) > 1;
      if (!this.alive || away) this.reset();
    }
    if (!this.alive) return;

    // Pop-in grow after a respawn
    const s = this.root.scale.x;
    if (s < 1) this.root.scale.setScalar(Math.min(1, s + dt * 4));

    // ---- Look for Rae (a few times a second) ----
    const dx = player.pos.x - this.pos.x, dz = player.pos.z - this.pos.z;
    const dist = Math.hypot(dx, dz);
    const sameLevel = Math.abs(player.pos.y - this.pos.y) < 2.5;
    this.sightTimer -= dt;
    if (this.sightTimer <= 0) {
      this.sightTimer = 0.25;
      this.canSee = sameLevel && dist < (this.chasing ? this.loseRange : this.sightRange) && this.lookFor(player);
    }
    this.talkCooldown = Math.max(0, this.talkCooldown - dt);
    if (this.canSee && !this.chasing) {
      this.chasing = true;
      if (this.talkCooldown === 0 && Dialogue.queue.length < 2) {
        const line = FROG_LINES[Math.floor(Math.random() * FROG_LINES.length)];
        Dialogue.say(line, { speaker: "🐸 Frog", style: "enemy", voice: "frog" });
        this.talkCooldown = 10;
        if (typeof raeSays === "function") raeSays("frog-spotted"); // Rae's reply, the first time
      }
    }
    if (!this.canSee && this.chasing && (dist > this.loseRange || !sameLevel)) this.chasing = false;

    // ---- Decide where to hop ----
    let dir = null;
    if (this.chasing && dist > 0.35) {
      dir = { x: dx / dist, z: dz / dist };
    } else if (!this.chasing) {
      // Wander gently near home
      if (!this.wanderDir || Math.random() < dt * 0.4) {
        const home = this.spawn.clone().sub(this.pos);
        if (home.length() > 2.5) this.wanderDir = { x: home.x / home.length(), z: home.z / home.length() };
        else if (Math.random() < 0.5) this.wanderDir = { stay: true };
        else { const a = Math.random() * Math.PI * 2; this.wanderDir = { x: Math.cos(a), z: Math.sin(a) }; }
      }
      if (!this.wanderDir.stay) dir = this.wanderDir;
    }
    if (dir) this.targetYaw = Math.atan2(-dir.x, -dir.z);
    if (this.chasing && dist <= 0.35) this.targetYaw = Math.atan2(-dx, -dz);

    // Turn smoothly
    let diff = this.targetYaw - this.yaw;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    this.yaw += diff * Math.min(1, dt * 6);

    // ---- Hopping: crouch, then spring ----
    if (this.onGround) {
      this.vel.x = 0; this.vel.z = 0;
      this.hopTimer -= dt;
      if (dir && this.hopTimer <= 0) {
        this.crouch += dt;
        if (this.crouch > 0.15) {
          this.crouch = 0;
          this.vel.y = this.hopPower;
          this.vel.x = dir.x * this.hopSpeed;
          this.vel.z = dir.z * this.hopSpeed;
          this.onGround = false;
          this.hopTimer = (this.chasing ? 0.35 : 1.0) + Math.random() * 0.4;
          Sfx.frogHop(this.pos.distanceTo(player.pos));
        }
      }
    }

    this.move(dt);
    this.animate(dt, time);
  }

  // Simple physics, like Rae's: gravity, slide along walls, land on things
  move(dt) {
    const wasInAir = !this.onGround;
    this.vel.y -= this.gravity * dt;
    const solids = this.world.solids();
    const box = (p) => ({
      minX: p.x - this.radius, maxX: p.x + this.radius,
      minY: p.y, maxY: p.y + this.height,
      minZ: p.z - this.radius, maxZ: p.z + this.radius,
    });
    const hit = (a, b) => a.minX < b.max.x && a.maxX > b.min.x && a.minY < b.max.y &&
      a.maxY > b.min.y && a.minZ < b.max.z && a.maxZ > b.min.z;

    this.pos.x += this.vel.x * dt;
    for (const s of solids) if (hit(box(this.pos), s.box)) {
      if (s.box.max.y - this.pos.y <= 0.25) this.pos.y = s.box.max.y + 0.001;
      else this.pos.x = this.vel.x > 0 ? s.box.min.x - this.radius - 0.001 : s.box.max.x + this.radius + 0.001;
    }
    this.pos.z += this.vel.z * dt;
    for (const s of solids) if (hit(box(this.pos), s.box)) {
      if (s.box.max.y - this.pos.y <= 0.25) this.pos.y = s.box.max.y + 0.001;
      else this.pos.z = this.vel.z > 0 ? s.box.min.z - this.radius - 0.001 : s.box.max.z + this.radius + 0.001;
    }
    this.onGround = false;
    this.pos.y += this.vel.y * dt;
    for (const s of solids) if (hit(box(this.pos), s.box)) {
      if (this.vel.y <= 0) { this.pos.y = s.box.max.y; this.onGround = true; }
      else this.pos.y = s.box.min.y - this.height - 0.001;
      this.vel.y = 0;
    }
    if (this.onGround && wasInAir) this.squash = 1;
    if (this.pos.y < -10) this.reset();
  }

  // Squash & stretch, legs and arms, a little breathing
  animate(dt, time) {
    this.root.position.copy(this.pos);
    this.root.rotation.y = this.yaw;
    this.squash = Math.max(0, this.squash - dt * 5);

    const crouching = this.crouch > 0 ? Math.min(1, this.crouch / 0.15) : 0;
    const air = !this.onGround;
    const stretch = air ? Math.max(-0.5, Math.min(0.5, this.vel.y * 0.08)) : 0;
    const squish = this.squash * 0.25 + crouching * 0.2;
    const breathe = Math.sin(time * 2.4 + this.spawn.x) * 0.02;

    this.body.scale.set(1 + squish * 0.6, 1 - squish + stretch * 0.3 + breathe, 1 + squish * 0.6);
    this.head.rotation.x = air ? -0.15 : Math.sin(time * 1.3 + this.spawn.z) * 0.05;

    for (const leg of this.legs) {
      leg.rotation.x = air ? -0.7 + stretch : crouching * 0.3;
      leg.rotation.z = leg.userData.side * (air ? 0.3 : 0.1);
    }
    for (const arm of this.arms) {
      const side = arm.userData.side;
      // In the air: arms up like the waving plush. On the ground: a little wave.
      arm.rotation.z = side * (air ? 1.2 : 0.35 + Math.sin(time * 3 + side) * 0.08);
      arm.rotation.x = air ? -0.3 : 0;
    }
  }
}
