// ============================================================
// weapons.js — what Rae attacks with (bought at Willow's Weapon Mart)
// ============================================================
//   paws    quick punches, short reach (the default)
//   stick   the Pokey Stick: reaches much further, but slower between pokes
//   raygun  the 'Rae' Gun: shoots slow, bright green balls that zap frogs far away
//
// main.js's punch() asks WEAPON_STATS how long to wait, then calls the right
// attack. Uses these from main.js: world, frogs, raeModel, paws, flopsy, willow,
// hitFrog(), scene.

// ---- Tweakable numbers ----
const WEAPON_STATS = {
  paws:   { cooldown: 0.28, reach: 0.4, radius: 0.3 },   // reach: metres in front of her eyes
  stick:  { cooldown: 0.65, reach: 1.15, radius: 0.25 },
  raygun: { cooldown: 0.6 },
};
const ZAP_SPEED = 5.5;     // how fast the green balls fly (metres per second): somewhat slow
const ZAP_LIFE = 3.5;      // seconds before a ball fizzles out on its own

let currentWeapon = "paws";

// Put a different weapon in Rae's paw (her body in mirrors, and her first-person view)
function equipWeapon(id) {
  currentWeapon = id;
  raeModel.setWeapon(id);
  paws.setWeapon(id);
}

// ---- The 'Rae' Gun's green balls ----
const Blaster = {
  shots: [],
  flashes: [],
  ballGeo: new THREE.SphereGeometry(0.045, 10, 8),
  haloGeo: new THREE.SphereGeometry(0.085, 10, 8),
  ballMat: new THREE.MeshBasicMaterial({ color: 0xb8ff7a }),
  haloMat: new THREE.MeshBasicMaterial({ color: 0x5dff3a, transparent: true, opacity: 0.35, depthWrite: false }),

  // Shoot a ball from just in front of Rae's eyes, the way she's looking
  fire(eye, aim) {
    const ball = new THREE.Mesh(this.ballGeo, this.ballMat);
    ball.add(new THREE.Mesh(this.haloGeo, this.haloMat));
    // starts a little below and to the right (out of the gun barrel)
    const right = new THREE.Vector3().crossVectors(aim, new THREE.Vector3(0, 1, 0)).normalize();
    ball.position.copy(eye).addScaledVector(aim, 0.35).addScaledVector(right, 0.06).add(new THREE.Vector3(0, -0.05, 0));
    scene.add(ball);
    this.shots.push({ mesh: ball, vel: aim.clone().multiplyScalar(ZAP_SPEED), life: ZAP_LIFE });
    Sfx.pew();
  },

  // A quick green flash where a ball hits something
  flash(pos) {
    const f = new THREE.Mesh(this.haloGeo, this.haloMat.clone());
    f.position.copy(pos);
    scene.add(f);
    this.flashes.push({ mesh: f, t: 0 });
  },

  // Move the balls along and see what they hit. Called every frame.
  update(dt) {
    for (const shot of this.shots) {
      shot.life -= dt;
      const pos = shot.mesh.position;
      pos.addScaledVector(shot.vel, dt);
      shot.mesh.scale.setScalar(1 + Math.sin(shot.life * 30) * 0.12); // fizzy wobble
      let hit = shot.life <= 0;

      // Frogs: ZAP!
      for (const frog of frogs) {
        if (hit || !frog.alive) continue;
        const middle = frog.pos.clone();
        middle.y += frog.height / 2;
        if (middle.distanceTo(pos) < frog.radius + 0.07) {
          hitFrog(frog, "zap");
          Sfx.zap();
          hit = true;
        }
      }
      // The shopkeepers don't appreciate it either
      for (const keeper of [flopsy, willow]) {
        if (!hit && keeper.middle().distanceTo(pos) < 0.2) { keeper.ouch(); hit = true; }
      }
      // Walls and furniture stop it; breakable things get smashed
      if (!hit) {
        for (const prop of world.solids()) {
          if (prop.box.distanceToPoint(pos) < 0.03) {
            if (prop.breakable) world.breakProp(prop);
            else Sfx.fizzle();
            hit = true;
            break;
          }
        }
      }
      if (hit) {
        if (shot.life > 0) this.flash(pos);
        scene.remove(shot.mesh);
        shot.dead = true;
      }
    }
    this.shots = this.shots.filter((s) => !s.dead);

    for (const f of this.flashes) {
      f.t += dt;
      f.mesh.scale.setScalar(1 + f.t * 12);
      f.mesh.material.opacity = Math.max(0, 0.6 - f.t * 3);
      if (f.t > 0.2) { scene.remove(f.mesh); f.mesh.material.dispose(); f.dead = true; }
    }
    this.flashes = this.flashes.filter((f) => !f.dead);
  },
};
