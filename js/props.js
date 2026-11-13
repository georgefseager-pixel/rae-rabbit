// ============================================================
// props.js — every object in the house is a "Prop"
// ============================================================
// A Prop wraps a 3D shape (mesh) plus some simple flags:
//
//   solid:       true  -> Rae bumps into it / can stand on it
//   collectible: true  -> touching it picks it up (chime!)
//   breakable:   true  -> bumping into or landing on it breaks it into pieces (crunch!)
//   bouncy:      true  -> landing on it springs Rae back up (like the bed)
//                         bouncePower sets how high
//
// To add something new later you just create a Prop and add it to the world.

// Pastel colour palette, so everything matches. Use these by name.
const COLORS = {
  floor:   0xe8c9a0, // warm wood
  wallA:   0xf6dfe6, // blush pink
  wallB:   0xdfe9f6, // baby blue
  ceiling: 0xfff7ee, // cream
  rug:     0xbfe5d2, // mint
  skirting:0xfffaf3, // off-white
  carrot:  0xffa66b, // soft orange
  leaf:    0x9ad88f, // soft green
  lilac:   0xd8c8f0,
  butter:  0xfff0a8,
  bedWood: 0xc9a27e, // soft caramel wood
  mattress:0xfffaf3, // white sheet
  duvet:   0xc7b6ea, // lavender
  pillow:  0xfdf3f6, // pale pink-white
  corridor:0xfbeec4, // pale butter (hallway, coming later)
  walnut:  0x9e7656, // brown bedside tables
  walnutLight: 0xb48b6a, // drawer fronts
  tableWhite: 0xfbf8f2, // white table
  stool:   0xffffff, // white stool
  glass:   0xd6f0fb, // see-through glass
  water:   0xa9dcf2, // water in the glass
  canPink: 0xf7b6cb,
  canBlue: 0xaed3f3,
  canMint: 0xa8e2c7,
  canLilac:0xcdb8ef,
  sky:     0xcdeafc, // window glass
  // rooms
  hallWall:    0xfbeec4, // corridor (pale butter)
  bathWall:    0xd2eee2, // bathroom (mint)
  bathFloor:   0xe3eef8, // bathroom tiles (pale blue)
  porcelain:   0xfefefe, // bath, toilet, sink
  livingWall:  0xfde0cc, // living room (peach)
  livingFloor: 0xe6cfae, // living room floor
  fireplace:   0xcfc4dc, // fireplace opening
  stairs:      0xd9b38e, // stair treads
  officeWall:  0xe4dbf6, // office (lilac)
  kitchenWall: 0xfdf2d0, // kitchen (cream yellow)
  kitchenFloor:0xeee6f3, // kitchen tiles
  cabinet:     0xb9dcea, // kitchen cupboards (pastel blue)
  worktop:     0xfffaf2, // kitchen worktop
  hob:         0x8d88a2, // cooker top
  steel:       0xd8dce6, // sink & tap
  door:        0xf2c9a7, // doors
  doorPanel:   0xf8dcc3, // raised panels on doors
  exitSign:    0x9edbb0, // fire exit sign
};

// Makes a flat-shaded pastel material (the "low-poly" look)
function pastel(color) {
  return new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.9, metalness: 0 });
}

class Prop {
  constructor({ name = "prop", mesh, solid = true, collectible = false, breakable = false,
                bouncy = false, bouncePower = 5.5 }) {
    this.name = name;
    this.mesh = mesh;
    this.solid = solid;
    this.collectible = collectible;
    this.breakable = breakable;
    this.bouncy = bouncy;
    this.bouncePower = bouncePower;
    this.collected = false;
    this.broken = false;
    this.box = new THREE.Box3(); // the invisible collision box
    this.updateBox();
  }

  // Recalculate the collision box (call this if you move the prop)
  updateBox() {
    this.mesh.updateMatrixWorld(true);
    this.box.setFromObject(this.mesh);
  }

  // Called every frame; props can override this to animate
  update(dt, time) {}
}

// A collectible carrot that gently spins and bobs
class Carrot extends Prop {
  constructor(x, y, z) {
    const group = new THREE.Group();

    const body = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.32, 6), pastel(COLORS.carrot));
    body.rotation.x = Math.PI; // point downwards
    group.add(body);

    for (let i = 0; i < 3; i++) {
      const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.16, 4), pastel(COLORS.leaf));
      leaf.position.y = 0.22;
      leaf.rotation.z = (i - 1) * 0.45;
      group.add(leaf);
    }

    group.position.set(x, y, z);
    super({ name: "carrot", mesh: group, solid: false, collectible: true });
    this.baseY = y;
  }

  update(dt, time) {
    this.mesh.rotation.y += dt * 1.5;
    this.mesh.position.y = this.baseY + Math.sin(time * 2.5) * 0.05;
  }
}

// ============================================================
// Breakable things. Each function returns a Prop standing with its
// BOTTOM at (x, y, z), so y is just the height of the surface it sits on.
// ============================================================

// A tall narrow can (deodorant / hairspray style), with a cap
function makeCan(x, y, z, color, capColor = COLORS.skirting) {
  const group = new THREE.Group();
  const h = 0.3, r = 0.055;
  const body = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 8), pastel(color));
  body.position.y = h / 2;
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.85, r * 0.85, 0.07, 8), pastel(capColor));
  cap.position.y = h + 0.035;
  group.add(body, cap);
  group.position.set(x, y, z);
  return new Prop({ name: "can", mesh: group, breakable: true });
}

// A drinking glass with a little water in it
function makeGlass(x, y, z) {
  const group = new THREE.Group();
  const glassMat = new THREE.MeshStandardMaterial({
    color: COLORS.glass, flatShading: true, roughness: 0.2, transparent: true, opacity: 0.55,
  });
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.045, 0.15, 8), glassMat);
  glass.position.y = 0.075;
  const water = new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.04, 0.08, 8), pastel(COLORS.water));
  water.position.y = 0.045;
  group.add(glass, water);
  group.position.set(x, y, z);
  return new Prop({ name: "glass", mesh: group, breakable: true });
}

// A door filling a doorway. It smashes apart when Rae touches it!
//   alongX: true if the wall runs along x
//   a..b:   the doorway's edges along the wall;  bottom..top: its height
//   mid:    the middle of the wall's thickness
function makeDoor(alongX, a, b, bottom, top, mid) {
  const width = b - a, height = top - bottom, thick = 0.1;
  const group = new THREE.Group();
  const size = (w, h, d) => (alongX ? [w, h, d] : [d, h, w]); // swap for walls along z

  const slab = new THREE.Mesh(new THREE.BoxGeometry(...size(width, height, thick)), pastel(COLORS.door));
  group.add(slab);
  // Two raised panels on each side, and a knob on each side
  for (const side of [-1, 1]) {
    for (const [py, ph] of [[height * 0.2, height * 0.38], [-height * 0.22, height * 0.34]]) {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(...size(width * 0.7, ph, 0.03)), pastel(COLORS.doorPanel));
      panel.position.y = py;
      if (alongX) panel.position.z = side * (thick / 2 + 0.01); else panel.position.x = side * (thick / 2 + 0.01);
      group.add(panel);
    }
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 4), pastel(COLORS.butter));
    const along = width / 2 - 0.15, out = side * (thick / 2 + 0.05);
    knob.position.set(alongX ? along : out, -height * 0.02, alongX ? out : along);
    group.add(knob);
  }

  const centre = (a + b) / 2, y = (bottom + top) / 2;
  if (alongX) group.position.set(centre, y, mid); else group.position.set(mid, y, centre);
  return new Prop({ name: "door", mesh: group, breakable: true });
}

// A little bedside lamp: round base, thin stem, glowing cone shade
function makeLamp(x, y, z, shadeColor = COLORS.butter) {
  const group = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.04, 8), pastel(COLORS.lilac));
  base.position.y = 0.02;
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.28, 6), pastel(COLORS.skirting));
  stem.position.y = 0.18;
  const shadeMat = pastel(shadeColor);
  shadeMat.emissive = new THREE.Color(shadeColor);
  shadeMat.emissiveIntensity = 0.35; // a soft "switched on" glow
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.16, 0.2, 8), shadeMat);
  shade.position.y = 0.38;
  group.add(base, stem, shade);
  group.position.set(x, y, z);
  return new Prop({ name: "lamp", mesh: group, breakable: true });
}
