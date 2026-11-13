// ============================================================
// props.js — every object in the house is a "Prop"
// ============================================================
// A Prop wraps a 3D shape (mesh) plus some simple flags:
//
//   solid:       true  -> Rae bumps into it / can stand on it
//   collectible: true  -> touching it picks it up (chime!)
//   breakable:   true  -> bumping into or landing on it breaks it (crunch!)
//                         (breaking is coming in a later step)
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
