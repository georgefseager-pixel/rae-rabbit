// ============================================================
// world.js — the toolbox for building the house
// ============================================================
// The actual rooms are built in house.js using these helpers.
//
// Directions (looking down from above):
//   +z = towards the living room and kitchen, -z = the bedroom's bed wall
//   +x = the bathroom / west side, -x = the corridor / fire-exit side
//   up = +y. Ground floor is y = 0; the kitchen & office level is y = -1.2 (down the stairs).
// Sizes are in metres (Rae-sized metres: the house is ~2x real size).

class World {
  constructor(scene) {
    this.scene = scene;
    this.props = []; // every Prop in the house lives in this list
    this.zones = []; // invisible areas (like "inside the bath") that main.js can check
    this.frogSpawns = []; // where frogs start (main.js creates them)
    this.debris = new Debris(scene);
    this.onBreak = null; // main.js can set this to react when something breaks
  }

  // Smash a breakable prop into pieces
  breakProp(prop) {
    if (prop.broken) return;
    prop.broken = true;
    this.debris.burst(prop);
    this.remove(prop);
    Sfx.crunch();
    if (this.onBreak) this.onBreak(prop);
  }

  // Called every frame from main.js
  update(dt, time) {
    for (const prop of this.props) prop.update(dt, time);
    this.debris.update(dt, this.props.filter((p) => p.solid && !p.breakable));
  }

  // Add any Prop to the world
  add(prop) {
    this.props.push(prop);
    this.scene.add(prop.mesh);
    return prop;
  }

  // Remove a Prop (e.g. once collected or broken)
  remove(prop) {
    this.scene.remove(prop.mesh);
    this.props = this.props.filter((p) => p !== prop);
  }

  // Lists of props, handy for the player code
  solids() { return this.props.filter((p) => p.solid && !p.broken); }
  collectibles() { return this.props.filter((p) => p.collectible && !p.collected); }

  // ---------- Shape helpers ----------

  // A box with its CENTRE at (x, y, z) and size (w, h, d). Solid by default.
  addBox(name, x, y, z, w, h, d, color, opts = {}) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), pastel(color));
    mesh.position.set(x, y, z);
    return this.add(new Prop({ name, mesh, ...opts }));
  }

  // Same as addBox, but you give the box's edges instead of its centre:
  // "from x1 to x2, from y1 to y2, from z1 to z2". (Order of each pair doesn't matter.)
  addSpan(name, x1, x2, y1, y2, z1, z2, color, opts = {}) {
    [x1, x2] = [Math.min(x1, x2), Math.max(x1, x2)];
    [y1, y2] = [Math.min(y1, y2), Math.max(y1, y2)];
    [z1, z2] = [Math.min(z1, z2), Math.max(z1, z2)];
    return this.addBox(name, (x1 + x2) / 2, (y1 + y2) / 2, (z1 + z2) / 2,
      x2 - x1, y2 - y1, z2 - z1, color, opts);
  }

  // Decoration only (Rae passes straight through it)
  addDeco(name, x1, x2, y1, y2, z1, z2, color) {
    return this.addSpan(name, x1, x2, y1, y2, z1, z2, color, { solid: false });
  }

  // A wall from (x1..x2, z1..z2), y1 up to y2, with optional doorways cut out.
  // Doorways run along the wall's long side, and each gets a breakable door:
  //   doors: [{ from: 2, to: 3.2, top: 2.1 }]                 (from the floor up to 'top')
  //   doors: [{ from: 2, to: 3.2, bottom: -1.2, top: 0.9 }]   (doorway starting at another level)
  //   doors: [{ from: 2, to: 3.2, top: 2.1, door: false }]    (an open doorway, no door)
  addWall(name, x1, x2, y1, y2, z1, z2, color, doors = []) {
    [x1, x2] = [Math.min(x1, x2), Math.max(x1, x2)];
    [z1, z2] = [Math.min(z1, z2), Math.max(z1, z2)];
    const alongX = (x2 - x1) >= (z2 - z1);
    const start = alongX ? x1 : z1, end = alongX ? x2 : z2;
    // build a piece of wall between positions a..b along the wall, heights h1..h2
    const piece = (a, b, h1, h2) => {
      if (b - a < 0.001 || h2 - h1 < 0.001) return;
      if (alongX) this.addSpan(name, a, b, h1, h2, z1, z2, color);
      else this.addSpan(name, x1, x2, h1, h2, a, b, color);
    };
    let cursor = start;
    const sorted = [...doors].sort((p, q) => Math.min(p.from, p.to) - Math.min(q.from, q.to));
    for (const d of sorted) {
      const a = Math.min(d.from, d.to), b = Math.max(d.from, d.to);
      const bottom = d.bottom !== undefined ? d.bottom : y1;
      piece(cursor, a, y1, y2);       // solid wall up to the doorway
      piece(a, b, y1, bottom);        // under the doorway (for raised doors)
      piece(a, b, d.top, y2);         // above the doorway
      if (d.trim !== false) this.addDoorTrim(alongX, a, b, bottom, d.top, alongX ? z1 : x1, alongX ? z2 : x2);
      // a breakable door in the doorway (unless door: false)
      if (d.door !== false) this.add(makeDoor(alongX, a, b, bottom, d.top, alongX ? (z1 + z2) / 2 : (x1 + x2) / 2));
      cursor = b;
    }
    piece(cursor, end, y1, y2);
  }

  // White door frame around a doorway (decoration), showing on both sides of the wall
  addDoorTrim(alongX, a, b, bottom, top, c1, c2) {
    const t = 0.08, c = COLORS.skirting;
    const lo = c1 - 0.02, hi = c2 + 0.02;
    if (alongX) {
      this.addDeco("door-trim", a - t, a, bottom, top, lo, hi, c);
      this.addDeco("door-trim", b, b + t, bottom, top, lo, hi, c);
      this.addDeco("door-trim", a - t, b + t, top, top + t, lo, hi, c);
    } else {
      this.addDeco("door-trim", lo, hi, bottom, top, a - t, a, c);
      this.addDeco("door-trim", lo, hi, bottom, top, b, b + t, c);
      this.addDeco("door-trim", lo, hi, top, top + t, a - t, b + t, c);
    }
  }

  // A window (decoration): a white frame with a glowing sky-blue pane.
  // 'face' is the wall surface it sits on: { z: value } for walls running along x,
  // or { x: value } for walls running along z. 'dir' = which way the room is (+1 or -1).
  addWindow(face, a1, a2, y1, y2, dir) {
    const frame = 0.08, out = 0.03 * dir;
    const pane = new THREE.MeshStandardMaterial({
      color: COLORS.sky, emissive: new THREE.Color(COLORS.sky), emissiveIntensity: 0.6, flatShading: true,
    });
    const mk = (x1, x2, yy1, yy2, z1, z2, color, mat) => {
      const p = this.addDeco("window", x1, x2, yy1, yy2, z1, z2, color);
      if (mat) p.mesh.material = mat;
    };
    if (face.z !== undefined) {
      const z = face.z;
      mk(a1 - frame, a2 + frame, y1 - frame, y2 + frame, z, z + out, COLORS.skirting);
      mk(a1, a2, y1, y2, z + out, z + out * 1.5, COLORS.sky, pane);
      mk((a1 + a2) / 2 - 0.03, (a1 + a2) / 2 + 0.03, y1, y2, z + out * 1.5, z + out * 2, COLORS.skirting);
    } else {
      const x = face.x;
      mk(x, x + out, y1 - frame, y2 + frame, a1 - frame, a2 + frame, COLORS.skirting);
      mk(x + out, x + out * 1.5, y1, y2, a1, a2, COLORS.sky, pane);
      mk(x + out * 1.5, x + out * 2, y1, y2, (a1 + a2) / 2 - 0.03, (a1 + a2) / 2 + 0.03, COLORS.skirting);
    }
  }

  // An oval wall mirror with a frame. (x, y, z) is its centre; 'facing' is the
  // direction it looks: "+z", "-z", "+x" or "-x". Width and height in metres.
  addOvalMirror(x, y, z, width, height, facing = "-z", frameColor = COLORS.canPink) {
    const turn = { "+z": 0, "-z": Math.PI, "+x": Math.PI / 2, "-x": -Math.PI / 2 }[facing];
    const holder = new THREE.Group();
    holder.position.set(x, y, z);
    holder.rotation.y = turn;

    const glass = new Mirror(new THREE.CircleGeometry(0.5, 40));
    glass.scale.set(width, height, 1);
    glass.position.z = 0.012;
    const frame = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.04, 6, 32), pastel(frameColor));
    frame.scale.set(width, height, 0.8);
    frame.position.z = 0.012;
    const backing = new THREE.Mesh(new THREE.CircleGeometry(0.52, 32), pastel(frameColor));
    backing.scale.set(width, height, 1);
    holder.add(backing, glass, frame);
    this.scene.add(holder);
    return holder;
  }

  // A frog's home: it starts here, and comes back here when it respawns
  addFrog(x, y, z, color) {
    this.frogSpawns.push({ x, y, z, color });
  }

  // An invisible named area (from x1..x2, y1..y2, z1..z2). Use world.zoneAt(point)
  // to find out which zone a position is in.
  addZone(name, x1, x2, y1, y2, z1, z2) {
    const box = new THREE.Box3(
      new THREE.Vector3(Math.min(x1, x2), Math.min(y1, y2), Math.min(z1, z2)),
      new THREE.Vector3(Math.max(x1, x2), Math.max(y1, y2), Math.max(z1, z2)));
    this.zones.push({ name, box });
  }

  zoneAt(point) {
    const zone = this.zones.find((z) => z.box.containsPoint(point));
    return zone ? zone.name : null;
  }

  // A warm ceiling light for a room
  addRoomLight(x, y, z, intensity = 0.45, distance = 12) {
    const lamp = new THREE.PointLight(0xffe6c7, intensity, distance);
    lamp.position.set(x, y, z);
    this.scene.add(lamp);
  }

  // Soft light for the whole house (call once)
  addGlobalLights() {
    this.scene.add(new THREE.HemisphereLight(0xfff4e6, 0xe4d9f5, 0.6));
    const sun = new THREE.DirectionalLight(0xfff1dc, 0.45);
    sun.position.set(3, 5, 2);
    this.scene.add(sun);
  }
}
