// ============================================================
// flopsymode.js — Flopsy Mode: play as tiny Flopsy
// ============================================================
// Flopsy is much smaller than Rae, so the whole house feels huge: her eyes are
// low down, her hops are small and she walks slower. She can't smash things
// (they're solid to her) and can't hurt frogs (landing on one just bounces her
// off). Both shops are shut, there are fewer frogs, and fluffy cloud platforms
// float all over the house so she can still reach every carrot... and the toilet.
//
// Uses these from other files: world, player, raeModel, paws, frogs, flopsy, scene,
// boardUpShops() (frogpocalypse.js), FLOPSY_COLORS (rae.js), FLOPSY_VOICE (shop.js).

const FlopsyMode = {
  active: false,

  // ---- Tweakable numbers: Flopsy's size and moves (Rae's are in player.js) ----
  SIZE: 0.58,          // Flopsy is this much the size of Rae
  SPEED: 2.6,          // walking speed (Rae: 3.4)
  HOP: 4.4,            // hop power: about 0.6 m high (Rae: 6.2, about 1.2 m)
  KEEP_FROGS: [1, 2, 4, 5], // which of the house's 7 frogs stay (bathroom, living room, office, kitchen)

  start() {
    this.active = true;
    document.body.classList.add("flopsy-mode");

    // Become Flopsy: small, pale-brown, lower eyes, little hops
    player.radius = 0.13;
    player.height = 0.27;
    player.eyeHeight = 0.23;
    player.stepHeight = 0.22;   // still just enough for the stairs (0.2 m each)
    player.speed = this.SPEED;
    player.hopPower = this.HOP;
    player.superBounce = 5.2;
    player.gentle = true;       // can't smash things or hurt frogs
    raeModel.setColors(FLOPSY_COLORS);
    raeModel.setOutfit("naked");
    raeModel.root.scale.setScalar(this.SIZE);
    paws.setColor(FLOPSY_COLORS.fur, 0.8);
    Dialogue.heroVoice = FLOPSY_VOICE; // "🐰 Flopsy" speaks instead of Rae

    // The shops are shut, and the shopkeeper Flopsy is... you!
    boardUpShops();
    flopsy.leave();

    // Fewer frogs
    for (let i = frogs.length - 1; i >= 0; i--) {
      if (!this.KEEP_FROGS.includes(i)) {
        scene.remove(frogs[i].root);
        frogs.splice(i, 1);
      }
    }

    // Doors: Flopsy can't smash them, so they start open (gone)
    for (const door of world.props.filter((p) => p.name === "door")) {
      door.broken = true;
      world.remove(door);
    }

    Clouds.build();
    Dialogue.say(FLOPSY_MODE_START_LINES, FLOPSY_VOICE);
  },
};

const FLOPSY_MODE_START_LINES = [
  "This Flopsy hunting carrots today!!! Clouds help Flopsy go high!!!",
  "Everything so BIG!!! Good thing clouds are bouncy-soft!!!",
  "Flopsy turn!!! Flopsy find ALL the carrots!!!",
];

// What Flopsy says the first time things happen (Rae's own lines are in main.js)
const FLOPSY_MODE_LINES = {
  "first-carrot":  ["Crunchy!!! Flopsy loves carrot!!!", "Yum yum this Flopsy!!!", "Carrot for Flopsy!!!"],
  "first-cloud":   ["Ooh, cloud is SO fluffy!!!", "Flopsy on a cloud!!! Wheee!!!", "Soft soft cloud!!!"],
  "frog-bounce":   ["Boing! Sorry frog!!! Flopsy just bouncing!!!", "Frog is very good trampoline!!!", "Hop hop on frog head!!!"],
  "frog-spotted":  ["Eek! Big frog!!! Flopsy stay away!!!", "Frog very big from down here!!!", "Not chase Flopsy please!!!"],
  "no-punch":      ["Flopsy too gentle for punching!!!", "No punching! Flopsy only does cuddles!!!", "Flopsy paws too tiny for that!!!"],
  "bounce-bed":    ["Bed so bouncy!!! Flopsy flying!!!", "Boing boing BOING!!!", "Wheee! This Flopsy can fly!!!"],
  "zone-bath":     ["Splash! Flopsy fur all wet!!!", "Bath time for Flopsy?!", "Wet wet wet!!!"],
  "zone-garden":   ["So high up!!! Flopsy brave!!!", "Tree is HUGE!!!", "Fresh air for Flopsy!!!"],
  "zone-kitchen":  ["Kitchen smell so yummy!!!", "So many cupboards!!!", "Snacks somewhere here!!!"],
  "zone-mouse-nook": ["Ooh! Little mouse hole!!! Hello in there!!!", "Mouse door!!! Flopsy wait and see!!!", "Tiny hole! Smaller than Flopsy even!!!"],
};

// ============================================================
// Clouds: soft white platforms that only exist in Flopsy Mode
// ============================================================
// Each cloud is a flat, invisible solid slab (what Flopsy stands on) with fluffy
// white puffs drawn on top. They're built as little spiral staircases next to
// each high-up carrot (and the toilet, the bath and the living room window), so
// Flopsy can hop up one small step at a time.
const Clouds = {
  SIZE: 0.8,        // each cloud is this wide (metres)
  THICK: 0.1,       // and this thick
  RISE: 0.38,       // each cloud is this much higher than the last
  RADIUS: 0.65,     // the spiral's radius
  TURN: 1.66,       // how far round the spiral each step goes (radians, ~95 degrees)
  CLEAR: 0.32,      // room left above every cloud for Flopsy
  REACH: 0.5,       // the highest step up Flopsy can comfortably hop (her hop is about 0.6 m)
  list: [],         // { x, z, top } for every cloud
  stairs: [],       // each staircase: what it leads to, and its clouds (lowest first)
  paths: [],        // the spaces Flopsy hops through between clouds (kept clear of other clouds)

  // Where the cloud staircases lead: [what, x, z, top of what you step onto, how]
  //   "beside": the last cloud is next to that spot, level with it (step across)
  //   "under":  the last cloud is right under it (for carrots floating in the air)
  TARGETS: [
    // (tight spots first, so they get first pick of the space)
    ["toilet", 3.2, 7.75, 0.85, "beside"],
    ["bathroom sink", -0.35, 4.95, 1.8, "beside"],
    ["bath rim", 2.3, 5.92, 1.1, "beside", (x, z) => z > 6.0],   // from outside the bath
    ["high shelf", -6.05, 24.6, LOW + 3.25, "beside"],
    ["office desk", -0.35, 22.4, LOW + 1.6, "beside"],
    ["shoe rack", -4.42, 25.3, LOW + 1.37, "beside"],
    ["bed (bounce up to the carrot!)", 0.0, 0.1, 1.04, "beside"],
    ["white table", -0.5, 3.4, 1.35, "beside"],
    ["desk", 3.2, 10.35, 1.6, "beside"],
    ["sofa back cushion (hop up to the carrot!)", -3.2, 15.1, 1.6, "beside"],
    ["TV table", 3.05, 18.15, 0.95, "beside"],
    ["living room window", 1.8, 18.75, 1.0, "beside"],
    ["worktop", -9.0, 20.65, LOW + 1.9, "beside"],
  ],

  // Clouds placed by hand: [x, top, z, size (if not the usual)]
  HAND_PLACED: [
    [1.6, 0.75, 5.35],    // inside the bath, so Flopsy can climb back out (before Ducky gets hungry!)
    // the garden tree: window -> low branch -> cloud -> middle branch -> cloud -> fork -> cloud -> high branch
    [1.5, 1.35, 20.25],
    [1.95, 2.05, 21.3],
    [2.98, 2.6, 22.75],
    // up to the fridge in the kitchen corner: small clouds squeezed between the wall and the bar stools
    [-0.95, 0.5, 26.45, 0.6], [-1.65, 0.16, 26.45, 0.6], [-2.35, -0.18, 26.45, 0.6], [-3.05, -0.52, 26.45, 0.6], [-3.75, -0.86, 26.45, 0.6],
  ],

  build() {
    this.material = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0xdfe9f5, emissiveIntensity: 0.35, flatShading: true });
    this.hidden = new THREE.MeshBasicMaterial({ visible: false });
    for (const [x, top, z, size] of this.HAND_PLACED) {
      if (!this.fits(x, top, z, size)) console.warn("A hand-placed cloud is in the way of something", x, top, z);
      this.add(x, top, z, size);
    }
    for (const [what, x, z, top, how, allowed] of this.TARGETS) {
      const stair = this.staircase(x, z, top, how, allowed);
      if (stair) this.stairs.push({ what, x, z, top, clouds: stair.reverse() }); // (lowest cloud first)
      else console.warn("No room for a cloud staircase to the " + what);
    }
    this.drawPuffs();
  },

  // One cloud: an invisible solid slab (the puffs are drawn all together in drawPuffs)
  add(x, top, z, size = this.SIZE) {
    const s = size;
    const slab = new THREE.Mesh(new THREE.BoxGeometry(s, this.THICK, s), this.hidden);
    slab.position.set(x, top - this.THICK / 2, z);
    world.add(new Prop({ name: "cloud", mesh: slab }));
    this.list.push({ x, z, top, size });
  },

  // Is there room for a cloud here (nothing solid in it, or just above it)?
  fits(x, top, z, size = this.SIZE) {
    const h = size / 2;
    const x1 = x - h, x2 = x + h, z1 = z - h, z2 = z + h, y1 = top - this.THICK, y2 = top + this.CLEAR;
    for (const s of world.solidsNear(x1, x2, z1, z2)) {
      const b = s.box;
      if (b.min.x < x2 && b.max.x > x1 && b.min.z < z2 && b.max.z > z1 && b.min.y < y2 && b.max.y > y1) return false;
    }
    // ...it mustn't sit in the way of another staircase's hops...
    for (const b of this.paths) {
      if (b.x1 < x2 && b.x2 > x1 && b.z1 < z2 && b.z2 > z1 && b.y1 < y2 && b.y2 > y1) return false;
    }
    // ...and it mustn't eat into the headroom above another cloud (or vice versa)
    for (const c of this.list) {
      if (Math.abs(c.x - x) < (c.size + size) / 2 && Math.abs(c.z - z) < (c.size + size) / 2 &&
          c.top - this.THICK < y2 && c.top + this.CLEAR > y1) return false;
    }
    return true;
  },

  // The highest solid surface below height y at (x, z), and the lowest (the floor)
  surfaceBelow(x, z, y) {
    let top = -Infinity, floor = Infinity, name = null, firm = false;
    for (const s of world.solidsNear(x, x, z, z)) {
      const b = s.box;
      if (x > b.min.x && x < b.max.x && z > b.min.z && z < b.max.z && b.max.y <= y + 0.001) {
        if (b.max.y > top) { top = b.max.y; name = s.name; firm = s.name !== "cloud" && !s.breakable; }
        floor = Math.min(floor, b.max.y);
      }
    }
    return { top, floor, name, firm }; // firm: real floor or furniture (not a cloud or bit of clutter)
  },

  // The space Flopsy hops through from cloud a up to cloud b (each [x, top, z])
  hopSpace(a, b) {
    return { x1: Math.min(a[0], b[0]) - 0.15, x2: Math.max(a[0], b[0]) + 0.15,
             z1: Math.min(a[2], b[2]) - 0.15, z2: Math.max(a[2], b[2]) + 0.15,
             y1: a[1] + 0.02, y2: b[1] + 0.3 };
  },

  // Is nothing solid in that space (furniture, walls, clouds already placed)?
  spaceFree(s) {
    for (const p of world.solidsNear(s.x1, s.x2, s.z1, s.z2)) {
      const b = p.box;
      if (b.min.x < s.x2 && b.max.x > s.x1 && b.min.z < s.z2 && b.max.z > s.z1 && b.min.y < s.y2 && b.max.y > s.y1) return false;
    }
    return true;
  },

  // Is the way from the last cloud across to the target clear at Flopsy height?
  pathClear(fx, fz, tx, tz, y) {
    const steps = 12;
    for (let i = 1; i < steps; i++) {
      const x = fx + (tx - fx) * (i / steps), z = fz + (tz - fz) * (i / steps);
      for (const s of world.solidsNear(x, x, z, z)) {
        const b = s.box;
        if (x > b.min.x && x < b.max.x && z > b.min.z && z < b.max.z && b.min.y < y + 0.25 && b.max.y > y + 0.03) return false;
      }
    }
    return true;
  },

  // Build a staircase of clouds down from the target to a floor Flopsy can walk on.
  // Tries lots of spots, two shapes (a spiral, or a straight line for narrow spaces)
  // and directions, and uses whichever needs the fewest clouds.
  staircase(px, pz, top, how, allowed) {
    let best = null;
    const consider = (plan) => { if (plan && (!best || plan.length < best.length)) best = plan; };
    const lasts = [];
    if (how === "under") lasts.push([px, pz]);
    else {
      for (let d = 0.55; d <= 1.3; d += 0.15) {
        for (let k = 0; k < 24; k++) {
          const a = (k / 24) * Math.PI * 2;
          lasts.push([px + Math.cos(a) * d, pz + Math.sin(a) * d]);
        }
      }
    }
    for (const [lx, lz] of lasts) {
      if (!this.fits(lx, top, lz) || (allowed && !allowed(lx, lz))) continue;
      if (how === "beside" && !this.pathClear(lx, lz, px, pz, top)) continue;
      // a spiral, its centre in one of 12 directions from the last cloud, turning either way
      for (const radius of [this.RADIUS, 0.55]) {
        for (let k = 0; k < 12; k++) {
          const a = (k / 12) * Math.PI * 2;
          const cx = lx + Math.cos(a) * radius, cz = lz + Math.sin(a) * radius;
          for (const turn of [this.TURN, -this.TURN]) {
            consider(this.plan(lx, lz, top, (i) => [cx + Math.cos(a + Math.PI - turn * i) * radius,
                                                    cz + Math.sin(a + Math.PI - turn * i) * radius]));
          }
        }
      }
      // a straight line of clouds heading away in one of 24 directions
      for (let k = 0; k < 24; k++) {
        const a = (k / 24) * Math.PI * 2, step = this.SIZE + 0.12;
        consider(this.plan(lx, lz, top, (i) => [lx + Math.cos(a) * step * i, lz + Math.sin(a) * step * i]));
      }
      if (best && best.length <= 2) break; // can't do better than that
    }
    if (!best) return false;
    for (const [x, t, z] of best) this.add(x, t, z);
    // keep the hops (and the last step across to the target) clear of later clouds
    for (let i = 1; i < best.length; i++) this.paths.push(this.hopSpace(best[i], best[i - 1]));
    if (how === "beside") this.paths.push(this.hopSpace(best[0], [px, top, pz]));
    return best;

  },

  // Plan the clouds for one try: the last (top) cloud at (lx, lz), the others at
  // place(1), place(2)... going down. Returns a list of [x, top, z], or null if it doesn't fit.
  plan(lx, lz, top, place) {
    const clouds = [[lx, top, lz]];
    for (let i = 1; i < 14; i++) {
      // can Flopsy hop up onto the lowest cloud so far, from what's beneath it?
      const [x0, t0, z0] = clouds[clouds.length - 1];
      const below = this.surfaceBelow(x0, z0, t0 - this.THICK);
      if (below.firm && t0 - below.top <= this.REACH && below.top - below.floor <= this.REACH) return clouds;
      // no: add another cloud, a step lower (but not so low it's barely off the ground)
      const [x, z] = place(i);
      let t = t0 - this.RISE;
      const ground = this.surfaceBelow(x, z, t - this.THICK).top;
      if (ground > -Infinity && t - ground < 0.3) t = ground + 0.3;
      if (t > t0 - 0.05 || !this.fits(x, t, z)) return null;
      if (!this.spaceFree(this.hopSpace([x, t, z], [x0, t0, z0]))) return null; // room to hop up to the next one?
      clouds.push([x, t, z]);
    }
    return null;
  },

  // Draw every cloud's fluffy puffs as one instanced mesh (quick to draw)
  drawPuffs() {
    const PUFFS = [[0, 0, 0, 0.3], [0.22, -0.02, 0.12, 0.22], [-0.22, -0.02, -0.08, 0.24],
                   [0.08, -0.03, -0.24, 0.2], [-0.12, -0.03, 0.24, 0.2], [0.26, -0.03, -0.2, 0.17]];
    const geo = new THREE.IcosahedronGeometry(1, 1);
    const mesh = new THREE.InstancedMesh(geo, this.material, this.list.length * PUFFS.length);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3();
    let n = 0;
    for (const c of this.list) {
      for (const [dx, dy, dz, r] of PUFFS) {
        const k = c.size / this.SIZE; // (smaller clouds, smaller puffs)
        p.set(c.x + dx * k, c.top - 0.06 + dy, c.z + dz * k);
        s.set(r * k, r * 0.55, r * k);
        m.compose(p, q, s);
        mesh.setMatrixAt(n++, m);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.frustumCulled = false; // (the puffs are spread all over the house)
    scene.add(mesh);
    this.puffs = mesh;
  },
};
