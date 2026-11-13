// ============================================================
// world.js — builds the house (for now: one square room)
// ============================================================

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

  // Helper: a solid box with its CENTRE at (x, y, z) and size (w, h, d)
  addBox(name, x, y, z, w, h, d, color, opts = {}) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), pastel(color));
    mesh.position.set(x, y, z);
    return this.add(new Prop({ name, mesh, ...opts }));
  }

  // Lists of props, handy for the player code
  solids() { return this.props.filter((p) => p.solid && !p.broken); }
  collectibles() { return this.props.filter((p) => p.collectible && !p.collected); }

  // ----- Room 1: an empty square room, 8m x 8m, 3m high -----
  buildFirstRoom() {
    const size = 8;      // inside width/depth in metres
    const height = 3;    // wall height
    const t = 0.5;       // wall thickness
    const half = size / 2;

    // Floor: a thick slab whose top is at y = 0 (thick = can't fall through)
    this.addBox("floor", 0, -t / 2, 0, size + t * 2, t, size + t * 2, COLORS.floor);
    // Ceiling
    this.addBox("ceiling", 0, height + t / 2, 0, size + t * 2, t, size + t * 2, COLORS.ceiling);
    // Four walls
    this.addBox("wall-north", 0, height / 2, -half - t / 2, size + t * 2, height, t, COLORS.wallA);
    this.addBox("wall-south", 0, height / 2,  half + t / 2, size + t * 2, height, t, COLORS.wallA);
    this.addBox("wall-west", -half - t / 2, height / 2, 0, t, height, size, COLORS.wallB);
    this.addBox("wall-east",  half + t / 2, height / 2, 0, t, height, size, COLORS.wallB);

    // Little skirting boards (decoration only, not solid)
    const sk = 0.12;
    this.addBox("skirting", 0, sk / 2, -half + 0.02, size, sk, 0.04, COLORS.skirting, { solid: false });
    this.addBox("skirting", 0, sk / 2,  half - 0.02, size, sk, 0.04, COLORS.skirting, { solid: false });
    this.addBox("skirting", -half + 0.02, sk / 2, 0, 0.04, sk, size, COLORS.skirting, { solid: false });
    this.addBox("skirting",  half - 0.02, sk / 2, 0, 0.04, sk, size, COLORS.skirting, { solid: false });

    // A round low-poly rug (decoration only)
    const rug = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.02, 10), pastel(COLORS.rug));
    rug.position.set(0, 0.01, 0);
    this.add(new Prop({ name: "rug", mesh: rug, solid: false }));

    // One collectible carrot, floating a little above the floor
    this.add(new Carrot(0, 0.35, -2.5));

    // Lights: a soft overall glow + a warm ceiling lamp
    this.scene.add(new THREE.HemisphereLight(0xfff4e6, 0xe4d9f5, 0.6));
    const sun = new THREE.DirectionalLight(0xfff1dc, 0.45); // gives shapes soft shading
    sun.position.set(3, 5, 2);
    this.scene.add(sun);
    const lamp = new THREE.PointLight(0xffe6c7, 0.5, 12);
    lamp.position.set(0, height - 0.3, 0);
    this.scene.add(lamp);
  }
}
