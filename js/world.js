// ============================================================
// world.js — builds the house
// ============================================================
// Directions used in this file (looking down from above):
//   "front" wall = north = negative z  (the wall you face when you start)
//   "back" wall  = south = positive z  (behind you; has the corridor door)
//   right = positive x,  left = negative x  (as you face the front wall),  up = positive y
// Floor level is y = 0. Sizes are in metres.

class World {
  constructor(scene) {
    this.scene = scene;
    this.props = []; // every Prop in the house lives in this list
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

  // Helper: a box with its CENTRE at (x, y, z) and size (w, h, d). Solid by default.
  addBox(name, x, y, z, w, h, d, color, opts = {}) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), pastel(color));
    mesh.position.set(x, y, z);
    return this.add(new Prop({ name, mesh, ...opts }));
  }

  // Helper: same as addBox, but you give the box's edges instead of its centre.
  // Often easier for furniture: "from x1 to x2, from y1 to y2, from z1 to z2".
  addSpan(name, x1, x2, y1, y2, z1, z2, color, opts = {}) {
    return this.addBox(name, (x1 + x2) / 2, (y1 + y2) / 2, (z1 + z2) / 2,
      x2 - x1, y2 - y1, z2 - z1, color, opts);
  }

  // Lists of props, handy for the player code
  solids() { return this.props.filter((p) => p.solid && !p.broken); }
  collectibles() { return this.props.filter((p) => p.collectible && !p.collected); }

  // =====================================================
  // THE BEDROOM: 8m x 8m, 3m high
  // =====================================================
  buildBedroom() {
    const H = 3;     // wall height
    const T = 0.5;   // wall thickness
    // Inside of the room goes from x = -4 to 4 and z = -4 to 4.

    // ---- Floor & ceiling (thick slabs, so you can't fall through) ----
    this.addSpan("floor",   -4.5, 4.5, -T, 0,     -4.5, 4.5, COLORS.floor);
    this.addSpan("ceiling", -4.5, 4.5, H, H + T,  -4.5, 4.5, COLORS.ceiling);

    // ---- Walls ----
    this.addSpan("wall-front", -4.5, 4.5, 0, H, -4.5, -4, COLORS.wallA);
    this.addSpan("wall-left",  -4.5, -4,  0, H, -4, 4,    COLORS.wallB);
    this.addSpan("wall-right",  4, 4.5,   0, H, -4, 4,    COLORS.wallB);

    // Back wall, with a doorway on the right-hand side (as you face the door)
    const door = { x1: -3.15, x2: -2.05, top: 2.1 }; // 1.1m wide, 2.1m tall
    this.addSpan("wall-back",       -4.5, door.x1, 0, H,        4, 4.5, COLORS.wallA);
    this.addSpan("wall-back",       door.x2, 4.5,  0, H,        4, 4.5, COLORS.wallA);
    this.addSpan("wall-back-above", door.x1, door.x2, door.top, H, 4, 4.5, COLORS.wallA);
    this.buildDoorway(door);

    // ---- Skirting boards (decoration only) ----
    const sk = 0.12, deco = { solid: false };
    this.addSpan("skirting", -4, 4, 0, sk, -4, -3.96, COLORS.skirting, deco);
    this.addSpan("skirting", -4, -3.96, 0, sk, -4, 4, COLORS.skirting, deco);
    this.addSpan("skirting", 3.96, 4, 0, sk, -4, 4, COLORS.skirting, deco);
    this.addSpan("skirting", -4, door.x1, 0, sk, 3.96, 4, COLORS.skirting, deco);
    this.addSpan("skirting", door.x2, 4, 0, sk, 3.96, 4, COLORS.skirting, deco);

    // ---- The king-sized bed ----
    this.buildBed();

    // ---- Furniture ----
    // Tabletops are 1.35m high: too high to hop onto from the floor (a hop reaches ~1.2m).
    this.buildBedsideTable(-2.4); // left of the bed
    this.buildBedsideTable(2.4);  // right of the bed
    this.buildWhiteTable();       // against the back wall, opposite the bed

    // ---- A round low-poly rug at the foot of the bed (decoration) ----
    const rug = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.02, 10), pastel(COLORS.rug));
    rug.position.set(0, 0.01, 1.5);
    this.add(new Prop({ name: "rug", mesh: rug, solid: false }));

    // ---- A carrot floating above the bed: bounce up to grab it! ----
    this.add(new Carrot(0, 2.2, -1.6));

    // ---- Lights: a soft overall glow, gentle shading, and a warm ceiling lamp ----
    this.scene.add(new THREE.HemisphereLight(0xfff4e6, 0xe4d9f5, 0.6));
    const sun = new THREE.DirectionalLight(0xfff1dc, 0.45);
    sun.position.set(3, 5, 2);
    this.scene.add(sun);
    const lamp = new THREE.PointLight(0xffe6c7, 0.5, 12);
    lamp.position.set(0, H - 0.3, 0.5);
    this.scene.add(lamp);
  }

  // The king-sized bed, headboard against the front wall, centred.
  // Raised on four legs so Rae can scurry underneath.
  buildBed() {
    const W = 1.7;           // half the bed's width  (bed is 3.4m wide, from x=-1.7 to 1.7)
    const head = -4;         // headboard end touches the front wall
    const foot = 0.3;        // foot end of the bed (bed is 4.3m long)
    const under = 0.55;      // height of the gap underneath (Rae is 0.45m tall)
    const frameTop = 0.72;
    const mattressTop = 0.98;
    const leg = 0.18;        // leg thickness
    const bounce = { bouncy: true, bouncePower: 5.5 };

    // Four legs in the corners
    for (const x of [-W, W - leg]) {
      for (const z of [head + 0.15, foot - leg]) {
        this.addSpan("bed-leg", x, x + leg, 0, under, z, z + leg, COLORS.bedWood);
      }
    }
    // Frame (the wooden base) and headboard
    this.addSpan("bed-frame", -W, W, under, frameTop, head + 0.15, foot, COLORS.bedWood);
    this.addSpan("bed-headboard", -W - 0.1, W + 0.1, 0, 1.7, head, head + 0.15, COLORS.bedWood);

    // Mattress, duvet and pillows are all bouncy.
    // The mattress covers the frame's whole top, so there's no wooden ledge to get stuck on.
    this.addSpan("bed-mattress", -W, W, frameTop, mattressTop, head + 0.15, foot, COLORS.mattress, bounce);
    this.addSpan("bed-duvet", -W - 0.02, W + 0.02, mattressTop, mattressTop + 0.06, -2.5, foot - 0.03, COLORS.duvet, bounce);
    this.addSpan("bed-pillow", -1.45, -0.12, mattressTop, mattressTop + 0.16, -3.75, -3.15, COLORS.pillow, bounce);
    this.addSpan("bed-pillow", 0.12, 1.45, mattressTop, mattressTop + 0.16, -3.75, -3.15, COLORS.pillow, bounce);
  }

  // A brown bedside table against the front wall, centred at x.
  // Too tall to reach from the floor: bounce over from the bed!
  buildBedsideTable(x) {
    const w = 0.4;           // half the width (table is 0.8m wide)
    const z1 = -4, z2 = -3.3; // from the wall out to 0.7m deep
    const top = 1.35;
    const deco = { solid: false };

    // Main cabinet body, and a slightly wider top
    this.addSpan("bedside-table", x - w, x + w, 0, top - 0.05, z1, z2, COLORS.walnut);
    this.addSpan("bedside-top", x - w - 0.04, x + w + 0.04, top - 0.05, top, z1, z2 + 0.04, COLORS.walnut);

    // Two drawers with little round knobs (decoration)
    for (const y of [0.45, 0.9]) {
      this.addSpan("drawer", x - w + 0.06, x + w - 0.06, y - 0.17, y + 0.17, z2, z2 + 0.02, COLORS.walnutLight, deco);
      const knob = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 4), pastel(COLORS.butter));
      knob.position.set(x, y, z2 + 0.04);
      this.add(new Prop({ name: "knob", mesh: knob, solid: false }));
    }
  }

  // A wide white table against the back wall, next to the doorway, facing the bed.
  // The only way up is a big bounce off the foot of the bed.
  buildWhiteTable() {
    const x1 = -1.8, x2 = 0.8;   // 2.6m wide
    const z1 = 2.95, z2 = 3.95;  // 1m deep, back edge against the wall
    const top = 1.35, thick = 0.08, leg = 0.12;

    this.addSpan("white-table", x1, x2, top - thick, top, z1, z2, COLORS.tableWhite);
    for (const x of [x1 + 0.05, x2 - 0.05 - leg]) {
      for (const z of [z1 + 0.05, z2 - 0.05 - leg]) {
        this.addSpan("white-table-leg", x, x + leg, 0, top - thick, z, z + leg, COLORS.tableWhite);
      }
    }
  }

  // A doorway in the back wall, with a short closed-off bit of corridor
  // behind it (the rest of the house will be built there later).
  buildDoorway(door) {
    const trim = 0.08, deco = { solid: false };
    // Off-white door frame on the bedroom side
    this.addSpan("door-trim", door.x1 - trim, door.x1, 0, door.top, 3.97, 4, COLORS.skirting, deco);
    this.addSpan("door-trim", door.x2, door.x2 + trim, 0, door.top, 3.97, 4, COLORS.skirting, deco);
    this.addSpan("door-trim", door.x1 - trim, door.x2 + trim, door.top, door.top + trim, 3.97, 4, COLORS.skirting, deco);

    // Corridor stub: floor, sides, end wall and ceiling
    const d1 = 4.5, d2 = 5.7; // it runs from z=4.5 to z=5.7
    this.addSpan("corridor-floor", door.x1 - 0.5, door.x2 + 0.5, -0.5, 0, d1, d2 + 0.25, COLORS.floor);
    this.addSpan("corridor-wall", door.x1 - 0.25, door.x1, 0, door.top, d1, d2, COLORS.corridor);
    this.addSpan("corridor-wall", door.x2, door.x2 + 0.25, 0, door.top, d1, d2, COLORS.corridor);
    this.addSpan("corridor-end",  door.x1, door.x2, 0, door.top, d2, d2 + 0.25, COLORS.corridor);
    this.addSpan("corridor-ceiling", door.x1 - 0.25, door.x2 + 0.25, door.top, door.top + 0.25, d1, d2 + 0.25, COLORS.corridor);
  }
}
