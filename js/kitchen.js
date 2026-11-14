// ============================================================
// kitchen.js — the kitchen's furniture and clutter (from the photos)
// ============================================================
// The kitchen is the L-shape at the bottom of the stairs (see house.js for its
// walls and floor). In here:
//   - the long counter along the side wall: hob, sink, microwave, washing machine
//   - the tall wall cupboards across the aisle: the "high shelf" to parkour onto
//     (step stool -> worktop -> microwave -> running leap across the aisle!)
//   - round the corner: the breakfast bar with stools, a mini fridge and lots of plants

function buildKitchenInsides(w) {
  // Dark slate floor tiles (just lines on the floor)
  for (let x = -9.4; x < 0.6; x += 0.9) w.addDeco("tile-line", x, x + 0.025, LOW, LOW + 0.005, 26.1, 29, 0x5d5a66);
  for (let z = 19.4; z < 29; z += 0.9) w.addDeco("tile-line", -9.85, -5.5, LOW, LOW + 0.005, z, z + 0.025, 0x5d5a66);

  buildKitchenCounter(w);
  buildKitchenCupboards(w);
  buildBreakfastBar(w);

  // Ceiling spotlights (just for looks)
  for (const [x, z] of [[-7.6, 22.5], [-7.6, 26.8], [-3.0, 27.6]]) {
    w.addDeco("spotlight", x - 0.15, x + 0.15, H - 0.06, H, z - 0.15, z + 0.15, COLORS.tableWhite);
    for (const dx of [-0.1, 0.1]) {
      w.addDeco("spotlight", x + dx - 0.05, x + dx + 0.05, H - 0.22, H - 0.06, z - 0.05, z + 0.05, COLORS.tvBlack);
    }
  }
}

// A bottle standing at (x, y, z): body, shoulders, neck and cap. Smashable!
function makeBottle(x, y, z, color, height = 0.38, cap = 0x2a2730, radius = 0.06) {
  return makeThing("bottle", x, y, z, [
    ["cyl", [radius, radius, height * 0.7], [0, height * 0.35, 0], color],
    ["cyl", [radius * 0.4, radius, height * 0.12], [0, height * 0.76, 0], color],
    ["cyl", [radius * 0.38, radius * 0.38, height * 0.14], [0, height * 0.89, 0], color],
    ["cyl", [radius * 0.42, radius * 0.42, height * 0.06], [0, height * 0.97, 0], cap],
  ]);
}

// A plant in a pot (bottom at y). style: "croton" (red, orange & green leaves),
// "leafy" (green), or "succulent" (small and blue-green). Smashable!
function makePotPlant(x, y, z, potColor, style = "leafy", size = 1) {
  const parts = [["cyl", [0.11 * size, 0.08 * size, 0.18 * size], [0, 0.09 * size, 0], potColor]];
  const leaves = style === "croton" ? [0x4f8f4a, 0xc2483c, 0xe0a33a]
    : style === "succulent" ? [0x8fc4a0] : [0x5fa860, 0x7fc28c];
  const count = style === "succulent" ? 5 : 8;
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2, lean = style === "succulent" ? 0.5 : 0.7;
    parts.push(["blob", [0.06 * size, 0.55, 1.6, 0.25],
      [Math.cos(a) * 0.05 * size, (0.26 + (i % 3) * 0.05) * size, Math.sin(a) * 0.05 * size],
      leaves[i % leaves.length], { rx: Math.sin(a) * lean, rz: -Math.cos(a) * lean }]);
  }
  return makeThing("plant", x, y, z, parts);
}

// The washing machine under the worktop, with its round door left wide open.
// Rae can hop up into the drum (just big enough for a rabbit!), where the last
// carrot is hiding among the socks.
function buildWashingMachine(w, x1, x2, top) {
  const za = 26.75, zb = 27.6;                 // the machine's sides
  const h1 = LOW + 0.42, h2 = LOW + 1.02;      // bottom and top of the drum opening
  const o1 = 26.9, o2 = 27.5;                  // its sides
  const back = -9.6, drum = 0xb9c2cc;
  // The solid body around the drum (its inner faces are the steel drum walls)
  w.addSpan("washer", x1, x2, LOW, h1, za, zb, drum);
  w.addSpan("washer", x1, x2, h2, top, za, zb, drum);
  w.addSpan("washer", x1, x2, h1, h2, za, o1, drum);
  w.addSpan("washer", x1, x2, h1, h2, o2, zb, drum);
  w.addSpan("washer", x1, back, h1, h2, o1, o2, drum);
  // White front panel, with a square cut out for the porthole...
  const front = COLORS.tableWhite, fx1 = x2, fx2 = x2 + 0.03;
  w.addDeco("washer-front", fx1, fx2, LOW + 0.05, h1, za, zb, front);
  w.addDeco("washer-front", fx1, fx2, h2, top - 0.05, za, zb, front);
  w.addDeco("washer-front", fx1, fx2, h1, h2, za, o1, front);
  w.addDeco("washer-front", fx1, fx2, h1, h2, o2, zb, front);
  // ...a grey rubber ring round the opening, and a dial and buttons up top
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.035, 6, 20), pastel(0x6f7480));
  ring.rotation.y = Math.PI / 2;
  ring.position.set(x2 + 0.03, (h1 + h2) / 2, (o1 + o2) / 2);
  ring.scale.set(1, 0.92, 1);
  w.add(new Prop({ name: "washer-ring", mesh: ring, solid: false }));
  const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 10), pastel(COLORS.steel));
  dial.rotation.z = Math.PI / 2;
  dial.position.set(x2 + 0.045, top - 0.17, zb - 0.15);
  w.add(new Prop({ name: "washer-dial", mesh: dial, solid: false }));
  w.addDeco("washer-panel", x2 + 0.03, x2 + 0.04, top - 0.22, top - 0.12, za + 0.08, za + 0.4, 0x9fd0ef);

  // The round glass door, swung wide open on its hinge (to the far side), sticking out into the room
  const door = new THREE.Group();
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.05, 16),
    new THREE.MeshStandardMaterial({ color: 0xbfd9e8, transparent: true, opacity: 0.55, roughness: 0.2 }));
  glass.rotation.x = Math.PI / 2;
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.04, 6, 20), pastel(0xdfe3e8));
  door.add(glass, rim);
  const handle = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.14, 0.04), pastel(0x6f7480));
  handle.position.set(0.33, 0, 0);
  door.add(handle);
  // hinge: the door's edge stays at the far side of the opening; the door swings out ~110 degrees
  const hinge = new THREE.Group();
  hinge.position.set(x2 + 0.05, (h1 + h2) / 2, (o1 + o2) / 2 + 0.34);
  hinge.rotation.y = -0.35;
  door.position.set(0.34, 0, 0);
  hinge.add(door);
  w.add(new Prop({ name: "washer-door", mesh: hinge, solid: false }));
  // main.js swings it shut (rotation.y to PI / 2) if Rae stays in too long...
  w.washerDoor = hinge;
  // The inside of the drum (main.js times how long Rae stays in there)
  w.addZone("washer-drum", back, x2, h1 - 0.05, h2, o1, o2);

  // A few socks in the drum, and the 20th carrot right at the back
  w.addDeco("sock", -9.5, -9.25, h1, h1 + 0.05, o1 + 0.05, o1 + 0.18, COLORS.canPink);
  w.addDeco("sock", -9.0, -8.8, h1, h1 + 0.04, o2 - 0.2, o2 - 0.06, COLORS.butter);
  w.add(new Carrot(-9.3, h1 + 0.15, (o1 + o2) / 2));
}

// The long counter along the side wall, from the stairs to the far corner (like
// the first photo): wood cupboards, dark worktop, with (near to far) bottles and
// chopping boards, the hob with a frying pan, the sink, the microwave, and the
// washing machine underneath. Windows all along above it.
function buildKitchenCounter(w) {
  const x1 = -9.85, x2 = -8.55, z1 = 19.6, z2 = 29, top = LOW + 1.8, wt = top + 0.1;
  // (the counter is solid, except for the washing machine's drum, which Rae can climb into)
  w.addSpan("counter", x1, x2, LOW, top, z1, 26.75, COLORS.kitchenWood);
  w.addSpan("counter", x1, x2, LOW, top, 27.6, z2, COLORS.kitchenWood);
  w.addSpan("worktop", x1, x2 + 0.08, top, wt, z1 - 0.08, z2, COLORS.worktop);
  // Cupboard doors with long silver handles (leaving a gap for the washing machine)
  for (let z = 19.75; z < 28.8; z += 0.9) {
    if (z > 26.6 && z < 27.6) continue;
    w.addDeco("cupboard-door", x2, x2 + 0.02, LOW + 0.12, top - 0.12, z, z + 0.84, COLORS.kitchenWoodLight);
    w.addDeco("handle", x2 + 0.02, x2 + 0.05, top - 0.5, top - 0.2, z + 0.7, z + 0.74, COLORS.steel);
  }
  buildWashingMachine(w, x1, x2, top);

  // Hob with four rings, and a frying pan on it
  w.addDeco("hob", -8.75, -9.65, wt, wt + 0.02, 22.6, 24.2, COLORS.tvBlack);
  for (const x of [-8.98, -9.42]) {
    for (const z of [23.0, 23.8]) {
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.03, 8), pastel(0x55505e));
      ring.position.set(x, wt + 0.03, z);
      w.add(new Prop({ name: "hob-ring", mesh: ring, solid: false }));
    }
  }
  w.add(makeThing("pan", -9.0, wt + 0.02, 23.4, [
    ["cyl", [0.26, 0.22, 0.07], [0, 0.035, 0], 0x4a4652],
    ["cyl", [0.22, 0.22, 0.01], [0, 0.07, 0], 0x6a5a4a],      // something tasty in it
    ["box", [0.45, 0.04, 0.05], [0.42, 0.05, 0], 0x2a2730],   // handle
  ]));

  // Sink and tap, under a window
  w.addDeco("sink", -8.8, -9.6, wt, wt + 0.02, 24.45, 25.25, COLORS.steel);
  w.addDeco("tap", -9.7, -9.6, wt, wt + 0.35, 24.8, 24.9, COLORS.steel);
  w.addDeco("tap-spout", -9.7, -9.35, wt + 0.3, wt + 0.35, 24.8, 24.9, COLORS.steel);

  // Microwave near the far end: a step on the way up to the high cupboards!
  w.addSpan("microwave", -9.6, -8.55, wt, wt + 0.78, 25.4, 26.25, 0x3c3843);
  w.addDeco("microwave-door", -8.55, -8.53, wt + 0.08, wt + 0.7, 25.48, 26.0, 0x55606e);
  w.add(makeThing("jug", -9.42, wt + 0.78, 26.08, [   // water filter jug on top
    ["cyl", [0.08, 0.08, 0.26], [0, 0.13, 0], 0x9fd0ef],
    ["cyl", [0.085, 0.085, 0.05], [0, 0.27, 0], COLORS.tableWhite],
  ]));

  // Green tiles on the far wall, by the washing machine
  w.addDeco("tiles", x1, x2, wt, wt + 0.9, 28.97, 29, 0x9fbf9a);
  for (let y = wt + 0.15; y < wt + 0.9; y += 0.15) {
    w.addDeco("tile-line", x1, x2, y, y + 0.012, 28.96, 28.97, 0xd8e6d4);
  }

  // Windows all along the side wall, and plants on the sill
  for (const [a, b] of [[20.0, 21.8], [22.2, 24.0], [24.4, 25.9], [27.0, 28.7]]) {
    w.addWindow({ x: -9.85 }, a, b, wt + 0.3, H - 0.35, +1);
  }
  w.add(makePotPlant(-9.62, wt, 21.85, 0xd98c5f, "leafy"));
  w.add(makePotPlant(-9.62, wt, 24.32, COLORS.tableWhite, "succulent", 0.8));
  w.add(makePotPlant(-9.6, wt, 28.6, 0xd98c5f, "leafy", 1.2));

  // Clutter at the near end: chopping boards, pestle & mortar, bottles, a bag of oranges
  w.add(makeThing("board", -9.25, wt, 20.0, [
    ["cyl", [0.26, 0.26, 0.04], [0, 0.02, 0], COLORS.bamboo],
    ["cyl", [0.22, 0.22, 0.04], [0.03, 0.06, 0.02], 0xb98a5c],
  ]));
  w.add(makeThing("mortar", -9.55, wt, 20.55, [
    ["cyl", [0.1, 0.07, 0.12], [0, 0.06, 0], 0x2a2730],
    ["cyl", [0.025, 0.02, 0.22], [0.03, 0.15, 0], 0x3c3843, { rz: 0.5 }],
  ]));
  w.add(makeBottle(-9.6, wt, 20.95, 0x5f8a3a, 0.44));                           // olive oil
  w.add(makeBottle(-9.35, wt, 21.15, 0x2f5a3a, 0.48, 0xc9b26a));                // wine
  w.add(makeBottle(-9.6, wt, 21.35, 0x5a3324, 0.36));                           // dark sauce
  w.add(makeBottle(-9.15, wt, 21.3, COLORS.butter, 0.32, COLORS.canMint, 0.055)); // squash
  w.add(makeThing("oranges", -8.95, wt, 21.65, [
    ["box", [0.3, 0.02, 0.3], [0.05, 0.01, -0.03], COLORS.canPink],             // pink net bag
    ["blob", [0.08, 1, 1, 1], [0, 0.08, 0], 0xf09a4a],
    ["blob", [0.08, 1, 1, 1], [0.12, 0.08, 0.05], 0xf2a85a],
    ["blob", [0.08, 1, 1, 1], [0.05, 0.08, -0.12], 0xee9440],
    ["blob", [0.08, 1, 1, 1], [0.06, 0.2, -0.03], 0xf4b062],
  ]));
  // ...and between the hob and the microwave
  w.add(makeBottle(-9.0, wt, 21.95, 0xf2902c, 0.4, COLORS.tableWhite, 0.07));   // orange juice
  w.add(makeBottle(-9.55, wt, 22.2, COLORS.sky, 0.46, 0x3a68b8, 0.065));         // big water bottle
  w.add(makeThing("paper-towel", -9.0, wt, 26.5, [
    ["cyl", [0.08, 0.08, 0.3], [0, 0.15, 0], COLORS.tableWhite],
    ["cyl", [0.02, 0.02, 0.38], [0, 0.19, 0], COLORS.steel],
  ]));
  w.add(new Carrot(-9.0, wt + 0.35, 20.65)); // a carrot on the worktop, among the bottles
}

// The tall wooden wall cupboards across the aisle (on the office wall), high up,
// with a radiator below. Their top is the "high shelf".
function buildKitchenCupboards(w) {
  const face = -5.5, x1 = face - 1.0, z1 = 22.5, z2 = 26.0;
  const bottom = LOW + 2.45, top = LOW + 3.25;
  w.addSpan("wall-cupboard", x1, face, bottom, top, z1, z2, COLORS.kitchenWood);
  for (let i = 0; i < 4; i++) {
    const z = z1 + 0.05 + i * 0.86;
    w.addDeco("cupboard-door", x1 - 0.02, x1, bottom + 0.05, top - 0.05, z, z + 0.82, COLORS.kitchenWoodLight);
    const hz = i % 2 ? z + 0.08 : z + 0.7; // handles meet in the middle of each pair of doors
    w.addDeco("handle", x1 - 0.05, x1 - 0.02, bottom + 0.06, bottom + 0.36, hz, hz + 0.04, COLORS.steel);
  }
  // On top: a paint tub, a plant, and a carrot for whoever makes it up there
  w.add(makeThing("paint", -6.05, top, 22.85, [
    ["cyl", [0.17, 0.16, 0.26], [0, 0.13, 0], COLORS.tableWhite],
    ["cyl", [0.175, 0.175, 0.05], [0, 0.27, 0], 0x3a68b8],
    ["box", [0.2, 0.1, 0.01], [0, 0.13, -0.17], 0xd9483f],
  ]));
  w.add(makePotPlant(-6.05, top, 22.0 + 1.55, COLORS.tableWhite, "leafy", 0.9));
  w.add(new Carrot(-6.05, top + 0.35, 24.6));
  w.addZone("high-shelf", x1, face, top - 0.1, top + 0.6, z1, z2);

  // Radiator under the cupboards, and a light switch
  w.addSpan("radiator", face - 0.14, face, LOW + 0.3, LOW + 1.35, 22.9, 25.3, COLORS.tableWhite);
  for (let z = 23.0; z < 25.25; z += 0.15) {
    w.addDeco("radiator-fin", face - 0.17, face - 0.14, LOW + 0.35, LOW + 1.3, z, z + 0.04, COLORS.skirting);
  }
  w.addDeco("light-switch", face - 0.02, face, LOW + 1.95, LOW + 2.15, 22.0, 22.2, COLORS.tableWhite);
}

// Around the corner: the breakfast bar along the windows (like the third photo):
// a thinner dark top on chrome legs, two bar stools, a mini fridge with magnets
// and a bin underneath, the white step stool, and lots of plants.
function buildBreakfastBar(w) {
  const x1 = -8.55, x2 = 0.6, z1 = 27.6, z2 = 29, top = LOW + 1.88;
  w.addSpan("breakfast-bar", x1, x2, top - 0.07, top, z1, z2, COLORS.worktop);
  for (const x of [-5.2, -2.2]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.81, 8), pastel(COLORS.steel));
    leg.position.set(x, LOW + 0.905, z1 + 0.08);
    w.add(new Prop({ name: "bar-leg", mesh: leg }));
  }
  // Windows along the bar
  for (const [a, b] of [[-8.2, -6.1], [-5.7, -3.6], [-3.2, -1.1], [-0.7, 0.4]]) {
    w.addWindow({ z: 29 }, a, b, top + 0.3, H - 0.35, -1);
  }

  // Mini fridge tucked into the corner (office wall + end wall), out from under
  // the bar, its door (with magnets) facing into the kitchen. A carrot on top!
  const fx1 = -0.6, fx2 = 0.58, fz1 = 26.12, fz2 = 27.3;
  w.addSpan("fridge", fx1, fx2, LOW, LOW + 1.7, fz1, fz2, COLORS.tableWhite);
  w.addDeco("fridge-handle", fx1 - 0.04, fx1, LOW + 0.9, LOW + 1.5, fz2 - 0.15, fz2 - 0.1, COLORS.steel);
  const magnetColors = [COLORS.plus, COLORS.book2, COLORS.butter, COLORS.canMint, COLORS.book1, COLORS.canLilac];
  for (let i = 0; i < 6; i++) {
    const mz = fz1 + 0.12 + (i % 3) * 0.3, my = LOW + 1.0 + Math.floor(i / 3) * 0.3;
    w.addDeco("magnet", fx1 - 0.03, fx1, my, my + 0.2, mz, mz + 0.16, magnetColors[i]);
  }
  w.add(new Carrot(0.0, LOW + 1.7 + 0.35, 26.7));
  // ...and a carrot dropped on the floor under the bar, between the stools
  w.add(new Carrot(-3.3, LOW + 0.3, 28.3));
  const bin = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.25, 0.95, 10), pastel(COLORS.tvBlack));
  bin.position.set(-1.25, LOW + 0.475, 28.3);
  w.add(new Prop({ name: "bin", mesh: bin }));

  // Two black bar stools with navy seats, tucked up to the bar
  for (const sx of [-2.7, -3.9]) {
    const sz = 27.05, black = 0x2a2730;
    for (const [lx, lz] of [[-0.2, -0.2], [0.17, -0.2], [-0.2, 0.17], [0.17, 0.17]]) {
      w.addSpan("stool-leg", sx + lx, sx + lx + 0.03, LOW, LOW + 1.35, sz + lz, sz + lz + 0.03, black);
    }
    w.addSpan("stool-footrest", sx - 0.2, sx + 0.2, LOW + 0.5, LOW + 0.55, sz - 0.2, sz + 0.2, black);
    w.addSpan("stool-seat", sx - 0.24, sx + 0.24, LOW + 1.35, LOW + 1.42, sz - 0.24, sz + 0.24, 0x2f3a6a);
    w.addSpan("stool-back", sx - 0.22, sx + 0.22, LOW + 1.42, LOW + 2.1, sz - 0.27, sz - 0.23, black);
  }

  // The white folding step stool, pushed partly under the bar, near the bar stools:
  // step 1 at 0.85m, step 2 at 1.7m (its back half tucks under the bar's edge).
  // Solid underneath, so each step is a block Rae can hop straight onto.
  // Climbing route: step stool -> breakfast bar -> along to the worktop -> microwave -> leap!
  const kx = -6.6, kz = 26.65, white = COLORS.tableWhite, grey = 0xd8d4dc;
  w.addSpan("step-stool", kx - 0.4, kx + 0.4, LOW, LOW + 0.85, kz, kz + 0.45, white);
  w.addSpan("step-stool", kx - 0.4, kx + 0.4, LOW, LOW + 1.7, kz + 0.45, kz + 0.9, white);
  w.addDeco("step-tread", kx - 0.38, kx + 0.38, LOW + 0.85, LOW + 0.87, kz + 0.02, kz + 0.43, grey);
  w.addDeco("step-tread", kx - 0.38, kx + 0.38, LOW + 1.7, LOW + 1.72, kz + 0.47, kz + 0.88, grey);
  for (const sx of [kx - 0.42, kx + 0.38]) {
    w.addDeco("step-rail", sx, sx + 0.04, LOW, LOW + 1.75, kz + 0.84, kz + 0.9, COLORS.steel);
    w.addDeco("step-rail", sx, sx + 0.04, LOW, LOW + 0.9, kz, kz + 0.06, COLORS.steel);
  }

  // Lots of plants along the window, and breakfast things
  w.add(makePotPlant(-6.4, top, 28.65, 0xc9774a, "croton", 1.5));
  w.add(makePotPlant(-5.55, top, 28.6, 0xf2a6a0, "leafy", 1.3));
  w.add(makePotPlant(-4.7, top, 28.72, COLORS.tableWhite, "succulent"));
  w.add(makePotPlant(-4.2, top, 28.75, 0xd98c5f, "succulent", 0.8));
  w.add(makePotPlant(-1.6, top, 28.65, 0xc9774a, "leafy", 1.6));
  w.add(makePotPlant(-0.95, top, 28.75, 0xd98c5f, "croton", 0.9));
  w.add(makePotPlant(-0.35, top, 28.7, COLORS.tableWhite, "succulent", 0.9));
  w.add(makeThing("cereal", -7.7, top, 28.3, [
    ["box", [0.12, 0.5, 0.34], [0, 0.25, 0], 0xf0c27a],
    ["box", [0.01, 0.2, 0.24], [0.065, 0.3, 0], 0xd9483f],
  ]));
  w.add(makeThing("box", -7.95, top, 27.85, [
    ["box", [0.28, 0.08, 0.2], [0, 0.04, 0], 0xf6c0c8],
    ["box", [0.24, 0.07, 0.18], [0, 0.115, 0], COLORS.book2],
  ]));
  w.add(makeThing("tape", -7.1, top, 27.95, [["cyl", [0.07, 0.07, 0.04], [0, 0.02, 0], 0xe8dcc4]]));
  w.add(makeBottle(-3.0, top, 28.75, 0x9fd0ef, 0.34, COLORS.tableWhite, 0.06));
}
