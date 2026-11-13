// ============================================================
// house.js — all the rooms, following the real floorplan
// ============================================================
// Layout (looking down, the bedroom at the bottom like on the floorplan):
//
//                 [ kitchen (L-shape, wraps round the office) ]
//                 [ office ]  [ kitchen ]
//          [ stairs down ->]  [ landing ]      <- kitchen level is 1.2m lower
//   [          living room           ]
//   [ bathroom ]  [ corridor ] (fire exit)
//   [            bedroom             ]
//
// Each room has its own build function below. Numbers are positions in metres
// (see the direction notes at the top of world.js).

const GROUND = 0;     // ground floor level
const LOW = -1.2;     // kitchen & office floor level: 6 stairs (0.2m each) DOWN
const H = 3;          // ceiling height (the kitchen & office are taller rooms)
const BASE = LOW - 0.5; // bottom of the walls & floors round the kitchen level
const T = 0.5;        // wall thickness

function buildHouse(w) {
  w.addGlobalLights();
  buildBedroom(w);
  buildCorridorAndBathroom(w);
  buildLivingRoom(w);
  buildStairs(w);
  buildOffice(w);
  buildKitchen(w);

  // Invisible zones, so Rae can say something the first time she gets somewhere
  w.addZone("mirror-table", -1.8, 0.8, 1.3, 2.5, 2.95, 3.95);   // standing on the white table
  w.addZone("living-room", -4, 4, -0.2, 3, 9, 18.5);
  w.addZone("office", -5, 0.6, LOW - 0.3, LOW + 2, 21, 25.6);
  w.addZone("kitchen", -9.85, -4, LOW - 0.3, LOW + 2.5, 19, 21);
  w.addZone("kitchen", -9.85, -5.5, LOW - 0.3, LOW + 2.5, 21, 26.1);
  w.addZone("kitchen", -9.85, 0.6, LOW - 0.3, LOW + 2.5, 26.1, 29);

  // Frogs! One per spot, each a different colour (see frog.js)
  w.addFrog(2.6, GROUND, -0.6, FROG_COLORS.green);   // bedroom, beside the bed
  w.addFrog(1.8, GROUND, 7.2, FROG_COLORS.pink);     // bathroom
  w.addFrog(2.0, GROUND, 12.0, FROG_COLORS.blue);    // living room, by the fireplace
  w.addFrog(-1.2, GROUND, 16.6, FROG_COLORS.yellow); // living room, by the sofa
  w.addFrog(-2.0, LOW, 23.5, FROG_COLORS.teal);      // office
  w.addFrog(-7.0, LOW, 24.0, FROG_COLORS.lilac);     // kitchen, by the hob
  w.addFrog(-3.0, LOW, 26.9, FROG_COLORS.peach);     // kitchen, far end
}

// =====================================================
// BEDROOM: x -4..4, z -4..4
// =====================================================
function buildBedroom(w) {
  w.addSpan("floor",   -4.5, 4.5, -T, 0,     -4.5, 4.5, COLORS.floor);
  w.addSpan("ceiling", -4.5, 4.5, H, H + T,  -4.5, 4.5, COLORS.ceiling);

  w.addWall("wall", -4.5, 4.5, 0, H, -4.5, -4, COLORS.wallA);  // bed wall
  w.addWall("wall", -4.5, -4,  0, H, -4, 4,    COLORS.wallB);
  w.addWall("wall",  4, 4.5,   0, H, -4, 4,    COLORS.wallB);
  // Back wall with the door to the corridor (on the right as you face it)
  w.addWall("wall", -4.5, 4.5, 0, H, 4, 4.5, COLORS.wallA, [{ from: -3.15, to: -2.05, top: 2.1 }]);

  // Two windows above the bed, like on the floorplan
  w.addWindow({ z: -4 }, 0.35, 2.2, 1.9, 2.7, +1);
  w.addWindow({ z: -4 }, -2.2, -0.35, 1.9, 2.7, +1);

  // Skirting boards
  const sk = 0.12;
  w.addDeco("skirting", -4, 4, 0, sk, -4, -3.96, COLORS.skirting);
  w.addDeco("skirting", -4, -3.96, 0, sk, -4, 4, COLORS.skirting);
  w.addDeco("skirting", 3.96, 4, 0, sk, -4, 4, COLORS.skirting);
  w.addDeco("skirting", -4, -3.23, 0, sk, 3.96, 4, COLORS.skirting);
  w.addDeco("skirting", -1.97, 4, 0, sk, 3.96, 4, COLORS.skirting);

  buildBed(w);
  buildBedsideTable(w, -2.4);
  buildBedsideTable(w, 2.4);
  buildWhiteTable(w);

  // Breakables: a lamp and a glass on each bedside table, cans on the white table
  w.add(makeLamp(-2.55, 1.35, -3.72, COLORS.butter));
  w.add(makeGlass(-2.15, 1.35, -3.45));
  w.add(makeLamp(2.55, 1.35, -3.72, COLORS.canPink));
  w.add(makeGlass(2.15, 1.35, -3.45));
  w.add(makeCan(-1.55, 1.35, 3.72, COLORS.canPink));
  w.add(makeCan(-1.38, 1.35, 3.78, COLORS.canBlue));
  w.add(makeCan(-1.22, 1.35, 3.7, COLORS.canLilac));
  w.add(makeCan(0.32, 1.35, 3.74, COLORS.canMint));
  w.add(makeCan(0.52, 1.35, 3.6, COLORS.canPink, COLORS.canLilac));

  // Little piles of clothes dotted around the floor (breakable)
  w.add(makeClothesPile(3.0, 0, 1.0, 1));
  w.add(makeClothesPile(2.9, 0, -2.2, 2));
  w.add(makeClothesPile(-3.2, 0, -1.5, 3));
  w.add(makeClothesPile(-3.3, 0, 2.2, 4));
  w.add(makeClothesPile(0.9, 0, 2.0, 5));    // on the rug
  w.add(makeClothesPile(-0.8, 0, -1.0, 6));  // kicked under the bed

  // Carrots
  w.add(new Carrot(0, 2.2, -1.6));    // above the bed: bounce up to grab it!
  w.add(new Carrot(0.9, 0.27, -2.2)); // hidden under the bed
  w.add(new Carrot(-0.5, 1.7, 3.4));  // on the white table

  // Round rug at the foot of the bed
  const rug = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.02, 10), pastel(COLORS.rug));
  rug.position.set(0, 0.01, 1.5);
  w.add(new Prop({ name: "rug", mesh: rug, solid: false }));

  w.addRoomLight(0, H - 0.3, 0.5, 0.5);
}

// The king-sized bed, headboard against the bed wall, centred.
// Raised on four legs so Rae can scurry underneath.
function buildBed(w) {
  const W = 1.7;           // half the bed's width (3.4m wide)
  const head = -4;         // headboard end touches the wall
  const foot = 0.3;        // foot end (bed is 4.3m long)
  const under = 0.55;      // gap underneath (Rae is 0.45m tall)
  const frameTop = 0.72;
  const mattressTop = 0.98;
  const leg = 0.18;
  const bounce = { bouncy: true, bouncePower: 5.5 };

  for (const x of [-W, W - leg]) {
    for (const z of [head + 0.15, foot - leg]) {
      w.addSpan("bed-leg", x, x + leg, 0, under, z, z + leg, COLORS.bedWood);
    }
  }
  w.addSpan("bed-frame", -W, W, under, frameTop, head + 0.15, foot, COLORS.bedWood);
  w.addSpan("bed-headboard", -W - 0.1, W + 0.1, 0, 1.7, head, head + 0.15, COLORS.bedWood);

  // Mattress, duvet and pillows are all bouncy
  w.addSpan("bed-mattress", -W, W, frameTop, mattressTop, head + 0.15, foot, COLORS.mattress, bounce);
  w.addSpan("bed-duvet", -W - 0.02, W + 0.02, mattressTop, mattressTop + 0.06, -2.5, foot - 0.03, COLORS.duvet, bounce);
  w.addSpan("bed-pillow", -1.45, -0.12, mattressTop, mattressTop + 0.16, -3.75, -3.15, COLORS.pillow, bounce);
  w.addSpan("bed-pillow", 0.12, 1.45, mattressTop, mattressTop + 0.16, -3.75, -3.15, COLORS.pillow, bounce);
}

// A brown bedside table against the bed wall, centred at x. 1.35m tall:
// too high to reach from the floor, so bounce over from the bed!
function buildBedsideTable(w, x) {
  const hw = 0.4, z1 = -4, z2 = -3.3, top = 1.35;
  w.addSpan("bedside-table", x - hw, x + hw, 0, top - 0.05, z1, z2, COLORS.walnut);
  w.addSpan("bedside-top", x - hw - 0.04, x + hw + 0.04, top - 0.05, top, z1, z2 + 0.04, COLORS.walnut);
  for (const y of [0.45, 0.9]) {
    w.addDeco("drawer", x - hw + 0.06, x + hw - 0.06, y - 0.17, y + 0.17, z2, z2 + 0.02, COLORS.walnutLight);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 4), pastel(COLORS.butter));
    knob.position.set(x, y, z2 + 0.04);
    w.add(new Prop({ name: "knob", mesh: knob, solid: false }));
  }
}

// The wide white table opposite the bed (only reachable with a big bounce
// off the foot of the bed), with a white stool tucked underneath.
function buildWhiteTable(w) {
  const x1 = -1.8, x2 = 0.8, z1 = 2.95, z2 = 3.95;
  const top = 1.35, thick = 0.08, leg = 0.12;
  w.addSpan("white-table", x1, x2, top - thick, top, z1, z2, COLORS.tableWhite);
  for (const x of [x1 + 0.05, x2 - 0.05 - leg]) {
    for (const z of [z1 + 0.05, z2 - 0.05 - leg]) {
      w.addSpan("white-table-leg", x, x + leg, 0, top - thick, z, z + leg, COLORS.tableWhite);
    }
  }
  // Oval vanity mirror on the wall above the table: hop up and say hi to yourself!
  w.addOvalMirror(-0.5, 2.15, 3.97, 1.1, 1.3, "-z");

  // Stool: its seat (0.9m) is too close under the tabletop (1.27m) for Rae to fit on
  const sx = -0.2, sz = 3.4, half = 0.22, seat = 0.9, sleg = 0.05;
  w.addSpan("stool-seat", sx - half, sx + half, seat - 0.06, seat, sz - half, sz + half, COLORS.stool);
  for (const x of [sx - half + 0.02, sx + half - 0.02 - sleg]) {
    for (const z of [sz - half + 0.02, sz + half - 0.02 - sleg]) {
      w.addSpan("stool-leg", x, x + sleg, 0, seat - 0.06, z, z + sleg, COLORS.stool);
    }
  }
}

// =====================================================
// CORRIDOR (x -4..-1.9) and BATHROOM (x -1.4..4), z 4.5..8.5
// =====================================================
function buildCorridorAndBathroom(w) {
  // Floors and the ceiling (one ceiling covers corridor, bathroom and living room)
  w.addSpan("corridor-floor", -4.5, -1.65, -T, 0, 4.5, 9, COLORS.floor);
  w.addSpan("bath-floor", -1.65, 4.5, -T, 0, 4.5, 9, COLORS.bathFloor);
  w.addSpan("ceiling", -4.5, 4.5, H, H + T, 4.5, 18.5, COLORS.ceiling);

  // The bedroom's back wall is pink on the bedroom side: paint this side to match each room
  w.addDeco("paint", -1.4, 4, 0, H, 4.5, 4.52, COLORS.bathWall);
  // (corridor side: around the bedroom doorway, not over it!)
  w.addDeco("paint", -4, -3.23, 0, H, 4.5, 4.52, COLORS.hallWall);
  w.addDeco("paint", -1.97, -1.9, 0, H, 4.5, 4.52, COLORS.hallWall);
  w.addDeco("paint", -3.23, -1.97, 2.18, H, 4.5, 4.52, COLORS.hallWall);

  // Outer walls
  w.addWall("wall", 4, 4.5, 0, H, 4.5, 8.5, COLORS.bathWall);
  w.addWall("wall", -4.5, -4, 0, H, 4.5, 8.5, COLORS.hallWall);
  // Wall between bathroom and corridor, with the bathroom door
  w.addWall("wall", -1.9, -1.4, 0, H, 4.5, 8.5, COLORS.bathWall, [{ from: 5.6, to: 6.8, top: 2.1 }]);
  // Wall between this strip and the living room, with the corridor's doorway
  w.addWall("wall", -4.5, 4.5, 0, H, 8.5, 9, COLORS.livingWall, [{ from: -3.6, to: -2.3, top: 2.1 }]);

  // Fire exit door on the corridor's side wall (closed: just for looks)
  w.addDeco("fire-exit", -4, -3.96, 0, 2.1, 6.9, 8.1, COLORS.door);
  w.addDeco("fire-exit-bar", -3.96, -3.9, 0.95, 1.05, 7.0, 8.0, COLORS.steel);
  w.addDeco("fire-exit-sign", -4, -3.94, 2.25, 2.5, 7.15, 7.85, COLORS.exitSign);

  // ---- Bath (along the bedroom wall, hollow so Rae can hop in) ----
  const bx1 = 0.6, bx2 = 4, bz1 = 4.5, bz2 = 6.0, rim = 1.1, edge = 0.15;
  w.addSpan("bath-base", bx1, bx2, 0, 0.3, bz1, bz2, COLORS.porcelain);
  w.addSpan("bath-rim", bx1, bx2, 0.3, rim, bz1, bz1 + edge, COLORS.porcelain);
  w.addSpan("bath-rim", bx1, bx2, 0.3, rim, bz2 - edge, bz2, COLORS.porcelain);
  w.addSpan("bath-rim", bx1, bx1 + edge, 0.3, rim, bz1 + edge, bz2 - edge, COLORS.porcelain);
  w.addSpan("bath-rim", bx2 - edge, bx2, 0.3, rim, bz1 + edge, bz2 - edge, COLORS.porcelain);
  w.addDeco("bath-inside", bx1 + edge, bx2 - edge, 0.3, 0.31, bz1 + edge, bz2 - edge, COLORS.water);
  // Taps at the wall end
  w.addDeco("bath-tap", 3.7, 3.85, rim, rim + 0.25, 5.15, 5.35, COLORS.steel);

  // ---- Toilet (against the outer wall, next to the bath) ----
  w.addSpan("toilet-cistern", 3.65, 4, 0, 1.7, 7.35, 8.15, COLORS.porcelain);
  w.addSpan("toilet-bowl", 2.95, 3.65, 0, 0.75, 7.5, 8.0, COLORS.porcelain);
  w.addSpan("toilet-seat", 2.8, 3.65, 0.75, 0.85, 7.4, 8.1, COLORS.porcelain);
  w.addDeco("toilet-flush", 3.6, 3.66, 1.45, 1.55, 7.65, 7.85, COLORS.steel);

  // ---- Sink (pedestal basin, with a mirror above) ----
  w.addSpan("sink-pedestal", -0.5, -0.2, 0, 1.5, 4.5, 4.85, COLORS.porcelain);
  w.addSpan("sink-basin", -0.95, 0.25, 1.5, 1.8, 4.5, 5.35, COLORS.porcelain);
  w.addDeco("sink-water", -0.8, 0.1, 1.8, 1.81, 4.65, 5.2, COLORS.water);
  w.addDeco("sink-tap", -0.4, -0.3, 1.8, 2.0, 4.55, 4.75, COLORS.steel);
  w.addDeco("mirror", -0.9, 0.2, 2.05, 2.75, 4.5, 4.53, COLORS.sky);

  // Bath mat
  w.addDeco("bath-mat", 1.4, 2.8, 0, 0.02, 6.1, 6.9, COLORS.canPink);

  // The inside of the bath, so main.js knows when Rae hops in ("My fur is wet!")
  w.addZone("bath", bx1 + edge, bx2 - edge, 0.25, rim - 0.2, bz1 + edge, bz2 - edge);

  // Carrots: one lying in the bath, one in the sink (hop from the bath's edge!)
  w.add(new Carrot(2.3, 0.5, 5.25));
  w.add(new Carrot(-0.35, 2.0, 4.95));

  w.addRoomLight(-2.9, H - 0.3, 6.5, 0.3, 7);
  w.addRoomLight(1.5, H - 0.3, 6.5, 0.35, 8);
}

// =====================================================
// LIVING ROOM ("reception"): x -4..4, z 9..18.5
// =====================================================
function buildLivingRoom(w) {
  w.addSpan("living-floor", -4.5, 4.5, -T, 0, 9, 18.5, COLORS.livingFloor);

  w.addWall("wall", 4, 4.5, 0, H, 9, 18.5, COLORS.livingWall);
  w.addWall("wall", -4.5, -4, 0, H, 9, 18.5, COLORS.livingWall);
  // Far wall: runs along the kitchen too, and goes down to the kitchen's
  // lower floor. The doorway on the left leads to the stairs.
  w.addWall("wall", -10.35, 4.5, BASE, H, 18.5, 19, COLORS.livingWall,
    [{ from: -1.4, to: 0.6, bottom: GROUND, top: 2.4 }]);

  // Chimney breast on the outer wall, with a fireplace and a mantelpiece
  w.addSpan("chimney", 3.4, 4, 0, H, 12.7, 16.5, COLORS.livingWall);
  w.addDeco("fireplace", 3.37, 3.4, 0, 1.2, 13.9, 15.3, COLORS.fireplace);
  w.addSpan("mantelpiece", 3.15, 3.4, 1.4, 1.5, 13.6, 15.6, COLORS.skirting);

  w.addWindow({ z: 18.5 }, 0.95, 2.65, 1.0, 2.4, -1); // between the stairs door and the TV corner

  // Furniture, placed from the photos (standing in the corridor doorway, looking in):
  //   right-hand wall: the big white sofa, black side table in the far corner
  //   far-left corner: TV on its white table, next to the window
  //   near-left wall: bookshelf by the door, drawers with a plant, desk in the corner
  //   middle: black coffee table on a grey-green shaggy rug
  buildSofa(w);
  buildCoffeeTable(w);
  buildTVCorner(w);
  buildDeskCorner(w);
  buildShelves(w);
  buildMantelClutter(w);

  w.addRoomLight(0, H - 0.3, 13.7, 0.55, 14);
}

// Glowing decoration (screens)
function addGlow(w, name, x1, x2, y1, y2, z1, z2, color, strength = 0.7) {
  const p = w.addDeco(name, x1, x2, y1, y2, z1, z2, color);
  p.mesh.material.emissive = new THREE.Color(color);
  p.mesh.material.emissiveIntensity = strength;
  return p;
}

// The big white sofa along the corridor-side wall, facing the fireplace,
// with the black side table in the corner and a cereal bowl on the arm
function buildSofa(w) {
  const x1 = -4, x2 = -2.2, z1 = 13.4, z2 = 17.4; // 4m long, 1.8m deep
  const C = COLORS.sofa;
  w.addSpan("sofa-base", x1, x2, 0, 0.5, z1, z2, C);
  w.addSpan("sofa-back", x1, x1 + 0.6, 0.5, 1.75, z1, z2, C);
  w.addSpan("sofa-arm", x1, x2, 0.5, 1.3, z1, z1 + 0.55, C);
  w.addSpan("sofa-arm", x1, x2, 0.5, 1.3, z2 - 0.55, z2, C);
  // Two seat cushions and two back cushions: bouncy, like the bed!
  const bounce = { bouncy: true, bouncePower: 5.2 };
  for (const [c1, c2] of [[z1 + 0.55, 15.4], [15.4, z2 - 0.55]]) {
    w.addSpan("sofa-cushion", x1 + 0.6, x2, 0.5, 0.9, c1 + 0.02, c2 - 0.02, COLORS.sofaCushion, bounce);
    w.addSpan("sofa-cushion", x1 + 0.6, x1 + 0.95, 0.9, 1.6, c1 + 0.05, c2 - 0.05, COLORS.sofaCushion, bounce);
  }
  // A carrot floating high above the sofa: a big bounce reaches it
  w.add(new Carrot(-3.0, 2.45, 15.4));
  // Bamboo tray on the near arm, with a cereal bowl on it
  w.addDeco("bamboo-tray", x1 + 0.1, x2 - 0.05, 1.3, 1.33, z1 + 0.02, z1 + 0.53, COLORS.bamboo);
  w.add(makeBowl(-2.75, 1.33, 13.67, COLORS.porcelain, 0.15, true));

  // Small black side table in the corner
  w.addSpan("side-table", -4, -3.1, 0.88, 0.95, 17.55, 18.45, COLORS.softBlack);
  for (const [lx, lz] of [[-3.95, 17.6], [-3.22, 17.6], [-3.95, 18.33], [-3.22, 18.33]]) {
    w.addSpan("side-table-leg", lx, lx + 0.07, 0, 0.88, lz, lz + 0.07, COLORS.softBlack);
  }
  // Side table clutter: little mirror, remote, a jar and a red notebook
  w.addDeco("small-mirror", -3.98, -3.93, 0.95, 1.75, 17.75, 18.35, COLORS.sky);
  w.addDeco("remote", -3.75, -3.35, 0.95, 0.99, 17.62, 17.72, COLORS.tvBlack);
  w.add(makeThing("jar", -3.55, 0.95, 18.15, [
    ["cyl", [0.08, 0.08, 0.14], [0, 0.07, 0], COLORS.book2],
    ["cyl", [0.085, 0.085, 0.04], [0, 0.16, 0], COLORS.screenSky],
  ]));
  w.add(makeThing("notebook", -3.35, 0.95, 18.05, [["box", [0.22, 0.05, 0.3], [0, 0.025, 0], COLORS.plus]]));

  // Blankets thrown over the sofa (just for looks)
  w.addDeco("blanket", -3.35, -2.3, 0.9, 1.0, 13.95, 15.0, COLORS.pillow);
  w.addDeco("blanket", -3.4, -3.0, 0.9, 1.65, 16.0, 16.85, COLORS.book2);
}

// The big black coffee table in the middle, on a shaggy rug. Its long side
// lines up with the sofa. Covered in clutter: a desk mat, bowls, laptop, phone, a cracker.
function buildCoffeeTable(w) {
  w.addDeco("shaggy-rug", -1.6, 2.6, 0, 0.03, 12.8, 17.4, COLORS.rugSage);
  const x1 = -0.6, x2 = 0.55, z1 = 14.1, z2 = 16.2, top = 0.95;
  w.addSpan("coffee-table", x1, x2, top - 0.08, top, z1, z2, COLORS.softBlack);
  w.addSpan("coffee-table-shelf", x1 + 0.05, x2 - 0.05, 0.25, 0.3, z1 + 0.05, z2 - 0.05, COLORS.softBlack);
  for (const lx of [x1, x2 - 0.1]) {
    for (const lz of [z1, z2 - 0.1]) {
      w.addSpan("coffee-table-leg", lx, lx + 0.1, 0, top - 0.08, lz, lz + 0.1, COLORS.softBlack);
    }
  }
  // Clutter on top
  const t = top + 0.01;
  w.addDeco("desk-mat", x1 + 0.08, x2 - 0.08, top, t, z1 + 0.1, z2 - 0.1, COLORS.book2);
  w.add(makeBowl(-0.15, t, 14.6, COLORS.bamboo, 0.3));                  // big wooden bowl
  w.add(makeBowl(0.25, t, 15.25, COLORS.porcelain, 0.16, true));        // cereal bowl
  w.add(makeThing("laptop", -0.18, t, 15.7, [["box", [0.55, 0.05, 0.7], [0, 0.025, 0], COLORS.tvBlack]]));
  w.add(makeThing("phone", 0.3, t, 14.35, [["box", [0.13, 0.025, 0.26], [0, 0.012, 0], COLORS.tvBlack]]));
  w.add(makeThing("cracker", 0.3, t, 14.75, [
    ["cyl", [0.05, 0.05, 0.3], [0, 0.05, 0], COLORS.plus, { rx: Math.PI / 2 }],
    ["cyl", [0.035, 0.05, 0.08], [0, 0.05, 0.18], COLORS.butter, { rx: Math.PI / 2 }],
    ["cyl", [0.05, 0.035, 0.08], [0, 0.05, -0.18], COLORS.butter, { rx: Math.PI / 2 }],
  ]));
  w.add(new Carrot(0.0, 0.5, 15.15)); // hiding on the lower shelf, under the table
}

// TV on its white table in the corner by the window, facing the sofa
function buildTVCorner(w) {
  const x1 = 2.85, x2 = 3.95, z1 = 16.65, z2 = 18.45, top = 0.95;
  const white = COLORS.tableWhite;
  w.addSpan("tv-table", x1, x2, top - 0.07, top, z1, z2, white);
  w.addSpan("tv-table-shelf", x1, x2, 0.25, 0.3, z1 + 0.1, z2 - 0.1, white);
  w.addSpan("tv-table-side", x1, x2, 0, top - 0.07, z1, z1 + 0.1, white);
  w.addSpan("tv-table-side", x1, x2, 0, top - 0.07, z2 - 0.1, z2, white);
  w.addDeco("games-console", x1 + 0.2, x2 - 0.15, 0.3, 0.42, 17.1, 18.0, COLORS.tvBlack);
  w.add(new Carrot(3.05, 1.15, 18.15)); // on the TV table, an easy hop

  // The TV, showing green hills under a blue sky (smashable!), and two photo frames
  w.add(makeTV(3.45, top, 17.55));
  w.add(makeFrame(3.0, top, 16.95, COLORS.walnut));
  w.add(makeFrame(3.02, top, 17.4, COLORS.tvBlack));
  w.addDeco("controller", 3.0, 3.2, 0.3, 0.36, 16.85, 17.05, COLORS.canMint);
}

// The desk corner: black desk with a computer, office chair, PC tower
function buildDeskCorner(w) {
  const x1 = 2.95, x2 = 4, z1 = 10.2, z2 = 11.8, top = 1.6;
  const black = COLORS.softBlack;
  w.addSpan("desk", x1, x2, top - 0.08, top, z1, z2, black);
  for (const lz of [z1, z2 - 0.08]) {
    w.addSpan("desk-leg", x1, x1 + 0.08, 0, top - 0.08, lz, lz + 0.08, black);
  }
  w.addSpan("desk-back", x2 - 0.08, x2, 0, top - 0.08, z1, z2, black);
  // Monitor (facing the room) and keyboard
  w.addSpan("monitor-stand", 3.6, 3.75, top, top + 0.25, 10.9, 11.1, COLORS.tvBlack);
  w.addSpan("monitor", 3.55, 3.65, top + 0.2, top + 0.85, 10.45, 11.55, COLORS.tvBlack);
  addGlow(w, "monitor-screen", 3.53, 3.55, top + 0.5, top + 0.8, 10.5, 11.5, COLORS.screenSky, 0.6);
  addGlow(w, "monitor-screen", 3.525, 3.545, top + 0.25, top + 0.5, 10.5, 11.5, COLORS.screenGrass, 0.6);
  w.addDeco("keyboard", 3.05, 3.35, top, top + 0.03, 10.6, 11.4, COLORS.canPink);
  w.add(new Carrot(3.2, top + 0.2, 10.35)); // on the desk: climb up via the chair
  // Desk clutter: a mug and a little speaker
  w.add(makeThing("mug", 3.12, top, 11.62, [
    ["cyl", [0.06, 0.055, 0.13], [0, 0.065, 0], COLORS.book1],
    ["box", [0.02, 0.06, 0.05], [0.07, 0.07, 0], COLORS.book1],
  ]));
  w.add(makeThing("speaker", 3.75, top, 10.3, [["blob", [0.08, 1, 1.2, 1], [0, 0.09, 0], COLORS.tvBlack]]));
  // A backpack dumped on the floor
  w.addSpan("backpack", 0.25, 0.85, 0, 0.45, 9.7, 10.15, COLORS.tvBlack);
  // PC tower on the floor beside the desk
  w.addSpan("pc-tower", 3.15, 3.95, 0, 0.95, 9.3, 9.95, COLORS.tvBlack);

  // Office chair, facing the desk: star base, pole, seat and back
  const cx = 2.3, cz = 11.0;
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.08, 5), pastel(COLORS.tvBlack));
  base.position.set(cx, 0.06, cz);
  w.add(new Prop({ name: "chair-base", mesh: base, solid: false }));
  w.addSpan("chair-pole", cx - 0.05, cx + 0.05, 0, 0.9, cz - 0.05, cz + 0.05, COLORS.tvBlack);
  w.addSpan("chair-seat", cx - 0.45, cx + 0.45, 0.9, 1.0, cz - 0.45, cz + 0.45, COLORS.tvBlack);
  w.addSpan("chair-back", cx - 0.45, cx - 0.33, 1.0, 1.95, cz - 0.4, cz + 0.4, COLORS.tvBlack);
}

// Along the wall with the corridor door: tall bookshelf by the door,
// then a white chest of drawers with a plant on top
function buildShelves(w) {
  // Bookshelf: open-fronted, with shelves Rae can squeeze onto
  const x1 = -2.1, x2 = -1.2, z1 = 9, z2 = 9.6, top = 2.7;
  const white = COLORS.tableWhite;
  w.addSpan("bookshelf-back", x1, x2, 0, top, z1, z1 + 0.05, white);
  w.addSpan("bookshelf-side", x1, x1 + 0.05, 0, top, z1, z2, white);
  w.addSpan("bookshelf-side", x2 - 0.05, x2, 0, top, z1, z2, white);
  const bookColors = [COLORS.book1, COLORS.book2, COLORS.book3, COLORS.book4, COLORS.book5];
  let k = 0;
  for (let y = 0; y <= top; y += 0.54) {
    const shelfTop = Math.min(y + 0.05, top);
    w.addSpan("bookshelf-shelf", x1 + 0.05, x2 - 0.05, shelfTop - 0.05, shelfTop, z1 + 0.05, z2, white);
    if (shelfTop + 0.4 < top) {
      // a few books standing on the shelf (breakable!)
      for (let bx = x1 + 0.1; bx < x2 - 0.35; bx += 0.09) {
        const h = 0.25 + ((k * 37) % 10) / 70;
        w.addSpan("book", bx, bx + 0.07, shelfTop, shelfTop + h, z1 + 0.08, z1 + 0.42,
          bookColors[k++ % bookColors.length], { breakable: true });
      }
    }
  }

  // Chest of drawers with a plant on top
  const dx1 = -1.0, dx2 = -0.15, dTop = 1.9;
  w.addSpan("drawers", dx1, dx2, 0, dTop, 9, 9.85, white);
  for (let y = 0.25; y < dTop; y += 0.4) {
    w.addDeco("drawer-line", dx1 + 0.04, dx2 - 0.04, y, y + 0.02, 9.85, 9.87, COLORS.sofaCushion);
  }
  w.add(makePlant(-0.65, dTop, 9.42));
  w.add(makeThing("pot", -0.3, dTop, 9.55, [["cyl", [0.09, 0.07, 0.14], [0, 0.07, 0], COLORS.tvBlack]]));

  // A wobbly stack of books on the floor, next to the bookshelf
  w.add(makeThing("book", -1.1, 0, 10.15, [
    ["box", [0.4, 0.08, 0.3], [0, 0.04, 0], COLORS.book4],
    ["box", [0.36, 0.07, 0.28], [0.02, 0.115, 0], COLORS.book1, { ry: 0.2 }],
    ["box", [0.32, 0.07, 0.26], [-0.02, 0.185, 0], COLORS.book3, { ry: -0.15 }],
  ]));
}

// The mantelpiece: posters on the chimney breast above, and bits and bobs on the shelf
function buildMantelClutter(w) {
  const face = 3.4;  // the room-side face of the chimney breast
  const posters = [
    [13.0, 13.55, 1.75, 2.45, COLORS.book1], [13.65, 14.3, 1.9, 2.75, COLORS.plus],
    [14.4, 14.9, 1.7, 2.3, COLORS.book3], [15.0, 15.7, 1.8, 2.6, COLORS.softBlack],
    [15.8, 16.3, 1.75, 2.35, COLORS.book4],
  ];
  for (const [z1, z2, y1, y2, c] of posters) w.addDeco("poster", face - 0.02, face, y1, y2, z1, z2, c);
  w.addDeco("tv-bracket", face - 0.03, face, 2.85, 2.92, 13.4, 15.8, COLORS.tvBlack);

  const shelf = 1.5, x = 3.27;
  w.add(makeThing("vase", x, shelf, 15.35, [
    ["cyl", [0.06, 0.07, 0.22], [0, 0.11, 0], COLORS.porcelain],
    ["blob", [0.05, 1, 1, 1], [0.02, 0.27, 0.02], COLORS.plus],
    ["blob", [0.045, 1, 1, 1], [-0.03, 0.29, -0.02], COLORS.plus],
    ["blob", [0.04, 1, 1, 1], [0, 0.32, -0.04], COLORS.leaf],
  ]));
  w.add(makeFrame(x, shelf, 14.75, COLORS.steel));
  w.add(makeThing("pot", x, shelf, 14.0, [
    ["cyl", [0.07, 0.06, 0.12], [0, 0.06, 0], COLORS.porcelain],
    ["blob", [0.08, 1, 1.3, 1], [0, 0.19, 0], COLORS.plant],
  ]));
}

// =====================================================
// STAIRS: a hall between the living room and the office; 6 steps
// go DOWN to the kitchen level (x -1 -> -4)
// =====================================================
function buildStairs(w) {
  // Top of the stairs, at living room level (also fills the doorway)
  w.addSpan("stair-hall-floor", -1, 1.1, -T, GROUND, 18.5, 20.5, COLORS.livingFloor);
  for (let i = 0; i < 6; i++) {
    const x1 = -1 - 0.5 * i, x2 = x1 - 0.5;
    w.addSpan("stair", x1, x2, BASE, GROUND - 0.2 * (i + 1), 19, 20.5, COLORS.stairs);
  }
  w.addRoomLight(-1.7, H - 0.3, 19.8, 0.3, 6);
}

// =====================================================
// OFFICE (the small bedroom on the plan): x -5..0.6, z 21..25.6, down the stairs
// =====================================================
function buildOffice(w) {
  w.addSpan("office-floor", -5, 0.6, BASE, LOW, 21, 25.6, COLORS.floor);

  // West outer wall (shared with the stair hall), with a window
  w.addWall("wall", 0.6, 1.1, BASE, H, 18.5, 25.6, COLORS.officeWall);
  w.addWindow({ x: 0.6 }, 22.4, 24.2, LOW + 1.2, LOW + 2.6, -1);
  // Wall between the stairs and the office, with the office door at the
  // bottom of the stairs (like on the floorplan)
  w.addWall("wall", -5.5, 1.1, BASE, H, 20.5, 21, COLORS.officeWall,
    [{ from: -4.85, to: -3.65, bottom: LOW, top: LOW + 2.1 }]);
  // Wall between office and kitchen
  w.addWall("wall", -5.5, -5, BASE, H, 21, 26.1, COLORS.officeWall);
  w.addWall("wall", -5.5, 1.1, BASE, H, 25.6, 26.1, COLORS.officeWall);

  w.addRoomLight(-2.2, H - 0.3, 23.3, 0.45, 9);
}

// =====================================================
// KITCHEN: an L-shape wrapping round the office, upstairs.
// Counters along the far wall and the side wall, with a sink and a hob.
// =====================================================
function buildKitchen(w) {
  // Floor pieces (down at the kitchen level)
  w.addSpan("kitchen-floor", -9.85, -4, BASE, LOW, 19, 21, COLORS.kitchenFloor);      // bottom of the stairs
  w.addSpan("kitchen-floor", -9.85, -5.5, BASE, LOW, 21, 26.1, COLORS.kitchenFloor);  // beside office
  w.addSpan("kitchen-floor", -9.85, 0.6, BASE, LOW, 26.1, 29, COLORS.kitchenFloor);   // far end
  w.addSpan("ceiling", -10.35, 1.1, H, H + T, 18.5, 29.5, COLORS.ceiling);

  w.addWall("wall", 0.6, 1.1, BASE, H, 25.6, 29.5, COLORS.kitchenWall);
  w.addWall("wall", -10.35, 1.1, BASE, H, 29, 29.5, COLORS.kitchenWall);
  w.addWall("wall", -10.35, -9.85, BASE, H, 18.5, 29, COLORS.kitchenWall);

  // Back door to outside (closed: just for looks)
  w.addDeco("back-door", -6.6, -5.4, LOW, LOW + 2.1, 19, 19.04, COLORS.door);
  w.addDeco("back-door-knob", -6.45, -6.35, LOW + 1.0, LOW + 1.1, 19.04, 19.09, COLORS.steel);

  // ---- Counters: 1.9m tall cupboards with a worktop ----
  const top = LOW + 1.8, depth = 1.3;
  // Along the far wall
  w.addSpan("counter", 0.6, -9.85 + depth, LOW, top, 29 - depth, 29, COLORS.cabinet);
  w.addSpan("worktop", 0.6, -9.85 + depth, top, top + 0.1, 29 - depth - 0.08, 29, COLORS.worktop);
  // Along the side wall
  w.addSpan("counter", -9.85, -9.85 + depth, LOW, top, 19.6, 29, COLORS.cabinet);
  w.addSpan("worktop", -9.85, -9.85 + depth + 0.08, top, top + 0.1, 19.52, 29, COLORS.worktop);
  // Cupboard doors (decoration): pale panels along the fronts
  for (let x = 0.4; x > -8.4; x -= 1.1) {
    w.addDeco("cupboard-door", x, x - 0.95, LOW + 0.15, top - 0.15, 29 - depth - 0.02, 29 - depth, COLORS.sky);
  }
  for (let z = 20.0; z < 27.5; z += 1.1) {
    w.addDeco("cupboard-door", -9.85 + depth, -9.85 + depth + 0.02, LOW + 0.15, top - 0.15, z, z + 0.95, COLORS.sky);
  }

  // Sink (by the side-wall window) and tap
  const wt = top + 0.1;
  w.addDeco("sink", -8.8, -9.6, wt, wt + 0.02, 25.6, 27.0, COLORS.steel);
  w.addDeco("tap", -9.7, -9.6, wt, wt + 0.35, 26.25, 26.35, COLORS.steel);
  w.addDeco("tap-spout", -9.7, -9.35, wt + 0.3, wt + 0.35, 26.25, 26.35, COLORS.steel);
  w.addWindow({ x: -9.85 }, 25.3, 27.3, wt + 0.25, wt + 1.6, +1);

  // Hob with four rings
  w.addDeco("hob", -8.75, -9.65, wt, wt + 0.02, 22.6, 24.2, COLORS.hob);
  for (const x of [-8.98, -9.42]) {
    for (const z of [23.0, 23.8]) {
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.03, 8), pastel(COLORS.walnut));
      ring.position.set(x, wt + 0.03, z);
      w.add(new Prop({ name: "hob-ring", mesh: ring, solid: false }));
    }
  }

  // Windows above the far counter
  w.addWindow({ z: 29 }, -4.6, -1.4, wt + 0.25, wt + 1.6, -1);

  w.addRoomLight(-6.5, H - 0.3, 26.5, 0.6, 15);
  w.addRoomLight(-7, H - 0.3, 21, 0.35, 8);
}
