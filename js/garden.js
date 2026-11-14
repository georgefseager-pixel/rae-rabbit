// ============================================================
// garden.js — the garden outside the two open windows, and the tree
// ============================================================
// The living room window and the office window are open. Both look out on the
// back garden (like the photo from the living room). Between them stands a tree
// whose branches make a parkour route from one window to the other, with carrots.
// The garden ground is far below and is just scenery: fall off the tree and Rae
// loses a heart and pops back in through the window she climbed out of (main.js).
//
// Outside is the +x side of the kitchen/office (x > 1.1) and north of the living
// room (z > 19). The house's outer walls get brick on the outside.

const GARDEN_GROUND = -3.2; // the lawn, far below the windows
const BARK = 0x9b7a5c;

function buildGarden(w) {
  const G = GARDEN_GROUND;

  // ---- Ground: leafy soil, a strip of grass, paving by the house, fallen leaves ----
  w.addDeco("garden-ground", 1.1, 20, G - 0.5, G, -6, 47, 0xb59a6c);
  w.addDeco("lawn", 2.6, 7.0, G, G + 0.02, 19.5, 33, 0x9cbf7d);
  w.addDeco("lawn", 4.6, 7.2, G, G + 0.02, 8, 19.5, 0x9cbf7d);
  w.addDeco("paving", 1.1, 1.85, G, G + 0.03, 19, 34, 0xc9c4bc);
  let s = 3;
  const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  for (let i = 0; i < 45; i++) {
    const x = 2 + rand() * 5.3, z = 8 + rand() * 26, size = 0.25 + rand() * 0.35;
    const leafColors = [0xd98a4a, 0xc9a35a, 0xe0b85f, 0xa9744a];
    w.addDeco("fallen-leaves", x, x + size, G + 0.02, G + 0.035, z, z + size * 0.7, leafColors[i % 4]);
  }

  // ---- The green trellis fence along the house (right-hand side in the photo) ----
  const fenceGreen = 0x5f8f5a;
  w.addDeco("fence", 1.85, 1.95, G, G + 1.6, 19.2, 34, fenceGreen);
  w.addDeco("fence-rail", 1.83, 1.97, G + 2.05, G + 2.12, 19.2, 34, fenceGreen);
  for (let z = 19.3; z < 34; z += 0.6) w.addDeco("fence-post", 1.82, 1.98, G, G + 2.15, z, z + 0.08, 0x4f7a4a);
  for (let z = 19.4; z < 34; z += 0.2) w.addDeco("trellis", 1.86, 1.94, G + 1.6, G + 2.05, z, z + 0.03, fenceGreen);

  // ---- Neighbours' side (left in the photo): old wooden fence and raised beds ----
  w.addDeco("neighbour-fence", 7.4, 7.5, G, G + 2.2, 4, 36, 0xb9ab95);
  for (let z = 4.2; z < 36; z += 1.6) w.addDeco("fence-post", 7.38, 7.52, G, G + 2.3, z, z + 0.1, 0xa89a84);
  for (const [z1, z2] of [[13, 18.6], [19.2, 24.8], [25.4, 31]]) {
    w.addDeco("raised-bed", 7.6, 10.4, G, G + 1.3, z1, z2, 0xa8875f);
    w.addDeco("raised-bed-soil", 7.7, 10.3, G + 1.3, G + 1.33, z1 + 0.1, z2 - 0.1, 0x7a6448);
  }

  // ---- Far end: a red shed, and the neighbours' brick house beyond ----
  w.addDeco("shed", 8.2, 11.2, G, G + 2.4, 34, 36.6, 0xd9796a);
  w.addDeco("shed-roof", 8.0, 11.4, G + 2.4, G + 2.6, 33.8, 36.8, 0x7a6a6a);
  w.addDeco("shed-door", 9.2, 10.2, G, G + 2.0, 33.97, 34, 0xc9695a);
  w.addDeco("neighbour-house", -2, 19, G, G + 9, 44, 46, 0xd8a48a);
  w.addDeco("neighbour-roof", -2, 19, G + 9, G + 9.4, 43.6, 46.4, 0x8f7d86);
  for (const x of [1, 5, 9, 13, 16.5]) {
    for (const y of [G + 2.5, G + 5.8]) {
      w.addDeco("neighbour-window", x, x + 1.4, y, y + 1.6, 43.97, 44, COLORS.skirting);
      w.addDeco("neighbour-window", x + 0.1, x + 1.3, y + 0.1, y + 1.5, 43.95, 43.97, COLORS.sky);
    }
  }

  // ---- Trees in the distance (autumn colours, like the photo) ----
  for (const [x, z, h, r, colors] of [
    [12.5, 23, 6, 2.6, [0x7fb36a, 0x9ac46f]], [14.5, 34, 7, 3.0, [0xe8c75a, 0xd9b04f, 0x9ac46f]],
    [5.6, 38, 6.5, 2.6, [0x8fbf6f, 0x7fb36a]], [11, 41, 8, 3.2, [0x9ac46f, 0xe8c75a]],
    [15.5, 13, 6, 2.6, [0xd9b04f, 0xe8c75a]], [16, 27, 5, 2.2, [0x7fb36a]],
  ]) addSceneryTree(w, x, z, h, r, colors);

  // ---- Brick on the outside of the house, with gaps for the open windows ----
  const brick = 0xc99a7f, top = H + 0.5;
  // kitchen/office outer wall (faces +x), around the office window
  w.addDeco("brick", 1.1, 1.13, G, top, 18.5, 22.52, brick);
  w.addDeco("brick", 1.1, 1.13, G, top, 24.08, 29.5, brick);
  w.addDeco("brick", 1.1, 1.13, G, LOW + 2.35, 22.52, 24.08, brick);
  w.addDeco("brick", 1.1, 1.13, LOW + 3.78, top, 22.52, 24.08, brick);
  // living room's back wall (faces +z), around the living room window
  w.addDeco("brick", 2.73, 4.5, G, top, 19, 19.03, brick);
  w.addDeco("brick", 1.1, 2.73, G, 0.95, 19, 19.03, brick);
  w.addDeco("brick", 1.1, 2.73, 2.48, top, 19, 19.03, brick);
  // the long side wall (living room, bathroom, bedroom)
  w.addDeco("brick", 4.5, 4.53, G, top, -4.5, 19, brick);
  for (let y = G + 0.5; y < top; y += 0.5) {   // a few rows of pale mortar lines
    w.addDeco("mortar", 4.53, 4.54, y, y + 0.02, -4.5, 19, 0xe2c2ae);
    w.addDeco("mortar", 2.73, 4.5, y, y + 0.02, 19.03, 19.04, 0xe2c2ae);
  }
  // a simple roof over everything
  w.addDeco("roof", -4.6, 4.6, H + 0.5, H + 0.6, -4.6, 19.05, 0x9a94a6);    // over the bedroom...living room
  w.addDeco("roof", -10.4, 1.15, H + 0.5, H + 0.6, 18.5, 29.6, 0x9a94a6);  // over the kitchen & office

  buildTree(w);

  // ---- Zones: which window Rae climbed out of, and "outside" ----
  w.addZone("window-living", 0.95, 2.65, 0.85, 2.4, 18.45, 19.15);
  w.addZone("window-office", 0.5, 1.15, 1.05, 2.5, 22.6, 24.0);
  w.addZone("garden", 1.15, 25, -12, 12, 19.15, 50);
  w.addZone("garden", 4.55, 25, -12, 12, -10, 19.15);
  // Where Rae pops back in if she falls (just inside each window)
  w.windowReturns = {
    "window-living": { x: 1.8, y: 0.02, z: 17.9, yaw: Math.PI },        // facing the window
    "window-office": { x: -0.95, y: LOW + 0.02, z: 23.9, yaw: -Math.PI / 2 },
  };
}

// A tree in the distance (just scenery): trunk and a few leafy blobs
function addSceneryTree(w, x, z, height, radius, colors) {
  const G = GARDEN_GROUND;
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.32, height, 6), pastel(BARK));
  trunk.position.set(x, G + height / 2, z);
  w.add(new Prop({ name: "scenery", mesh: trunk, solid: false }));
  for (let i = 0; i < 4; i++) {
    const a = i * 1.7;
    const leaves = new THREE.Mesh(new THREE.IcosahedronGeometry(radius * (0.6 + (i % 2) * 0.25), 0), pastel(colors[i % colors.length]));
    leaves.position.set(x + Math.cos(a) * radius * 0.45, G + height + (i % 3) * 0.5 - 0.3, z + Math.sin(a) * radius * 0.45);
    w.add(new Prop({ name: "scenery", mesh: leaves, solid: false }));
  }
}

// ---- The climbing tree between the two windows ----
// Route: living room window -> low branch (A) -> (B) -> the fork round the trunk (C)
//   -> up to the high branch (E, carrot!) ... or hop across to the side branch with
//   the bird's nest (F, carrot!) ... then down the branch (D) to the office window.
function buildTree(w) {
  const G = GARDEN_GROUND, tx = 3.2, tz = 21.6;
  // Trunk (and a second, leaning trunk, just for looks)
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.38, 3.4 - G, 7), pastel(BARK));
  trunk.position.set(tx, (G + 3.4) / 2, tz);
  w.add(new Prop({ name: "tree-trunk", mesh: trunk, solid: false }));
  w.addSpan("tree-trunk", tx - 0.2, tx + 0.2, G, 3.4, tz - 0.2, tz + 0.2, BARK).mesh.visible = false;
  const lean = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, 4.2, 6), pastel(BARK));
  lean.position.set(tx + 0.9, 2.6, tz + 0.7);
  lean.rotation.set(0.25, 0, -0.35);
  w.add(new Prop({ name: "scenery", mesh: lean, solid: false }));

  // Branches to stand on (bark-coloured planks): [name, x1, x2, top, z1, z2]
  const branches = [
    ["A", 1.15, 3.0, 1.0, 19.15, 19.8],   // right outside the living room window
    ["B", 1.9, 3.8, 1.7, 20.2, 20.9],
    ["C", 2.4, 4.1, 2.35, 21.1, 22.3],   // the big fork around the trunk
    ["E", 3.6, 4.9, 3.0, 22.4, 22.95],     // the high branch
    ["F", 4.3, 5.4, 1.9, 20.25, 20.9],     // the side branch with the nest
    ["D", 1.15, 2.6, 1.25, 22.85, 23.75],  // right outside the office window
  ];
  for (const [, x1, x2, top, z1, z2] of branches) {
    w.addSpan("branch", x1, x2, top - 0.16, top, z1, z2, BARK);
    w.addDeco("branch-moss", x1 + 0.05, x2 - 0.05, top, top + 0.01, z1 + 0.05, z2 - 0.05, 0x8fae6a);
  }

  // A bird's nest on the side branch, with a carrot in it
  const nest = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.08, 5, 9), pastel(0x8a6a48));
  nest.rotation.x = Math.PI / 2;
  nest.position.set(4.95, 1.98, 20.57);
  w.add(new Prop({ name: "nest", mesh: nest, solid: false }));
  w.add(new Carrot(4.95, 2.3, 20.57));
  w.add(new Carrot(4.6, 3.35, 22.67));   // at the end of the high branch
  w.add(new Carrot(3.8, 2.7, 21.6));     // on the fork, by the trunk

  // Leaves: a big canopy above, and clumps at the ends of some branches (just for looks)
  const greens = [0x7fb36a, 0x9ac46f, 0x8fbf6f, 0xd9b04f];
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const leaves = new THREE.Mesh(new THREE.IcosahedronGeometry(1.0 + (i % 3) * 0.3, 0), pastel(greens[i % greens.length]));
    leaves.position.set(tx + Math.cos(a) * 1.6, 4.3 + (i % 2) * 0.6, tz + Math.sin(a) * 1.6);
    w.add(new Prop({ name: "scenery", mesh: leaves, solid: false }));
  }
  for (const [x, y, z] of [[5.6, 2.3, 20.55], [5.15, 3.5, 22.65], [2.9, 3.6, 19.4]]) {
    const clump = new THREE.Mesh(new THREE.IcosahedronGeometry(0.45, 0), pastel(greens[(x * 3) % 4 | 0]));
    clump.position.set(x, y, z);
    w.add(new Prop({ name: "scenery", mesh: clump, solid: false }));
  }
}
