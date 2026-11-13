// ============================================================
// main.js — sets everything up and runs the game loop
// ============================================================

const canvas = document.getElementById("game");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlay-title");
const countEl = document.getElementById("carrot-count");
const totalEl = document.getElementById("carrot-total");
const toastEl = document.getElementById("toast");

// ---- Three.js basics: renderer, scene, camera ----
THREE.ColorManagement.legacyMode = false; // makes our pastel colours show up true-to-life
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xfbefe6);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.05, 100);
camera.layers.enable(LAYER_EYES_ONLY); // your eyes see the paws, but not Rae's own body (see rae.js)
scene.add(camera); // needed so things attached to the camera (the paws) get drawn

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ---- Build the world and the player ----
const world = new World(scene);
buildHouse(world); // see house.js

const player = new Player(camera);
player.attachInput(canvas);

// Rae's body (seen in mirrors) and her paws (seen at the bottom of the screen)
const raeModel = new RaeModel();
scene.add(raeModel.root);
const paws = new FirstPersonPaws(camera);

// Frogs, at the spots listed in house.js
const frogs = world.frogSpawns.map((s) => new Frog(world, s.x, s.y, s.z, s.color));

// Landing on a frog's head pops it (and bounces Rae up). Bumping into one
// from the side just nudges the frog out of the way.
function checkFrogs(fallingSpeed) {
  for (const frog of frogs) {
    if (!frog.alive) continue;
    const dx = frog.pos.x - player.pos.x, dz = frog.pos.z - player.pos.z;
    const flat = Math.hypot(dx, dz);
    const top = frog.top();
    if (flat < 0.34 && fallingSpeed < 0 && player.pos.y <= top + 0.05 && player.pos.y >= top - 0.3) {
      frog.pop();
      player.pos.y = top;
      player.vel.y = 5.5;   // boing off its head
      player.onGround = false;
    } else if (flat < 0.4 && flat > 0.001 && player.pos.y < top - 0.1 && player.pos.y + player.height > frog.pos.y) {
      const push = 0.4 - flat;
      frog.pos.x += (dx / flat) * push;
      frog.pos.z += (dz / flat) * push;
    }
  }
}

// ---- Rae's first-time thoughts ----
Dialogue.init();
player.onBounce = (prop) => {
  if (prop.name.startsWith("bed")) Dialogue.sayOnce("first-bed-bounce", "Bounce! Bounce! BOUNCE!");
};
world.onBreak = (prop) => {
  if (prop.name === "door") Dialogue.sayOnce("first-door", "Coming through!");
};
// Checked every frame: which invisible zone (see house.js) is Rae standing in?
function checkZones() {
  const zone = world.zoneAt(player.pos);
  if (zone === "bath") Dialogue.sayOnce("first-bath", "My fur is wet!");
}

let collectedCount = 0;
const totalCollectibles = world.collectibles().length;
totalEl.textContent = totalCollectibles;

// ---- Start / pause screen ----
let started = false;
let paused = true;

overlay.addEventListener("click", () => {
  Sfx.init();                 // sound is allowed now that the player clicked
  started = true;
  paused = false;
  overlay.classList.add("hidden");
  // Capture the mouse for looking around. If the browser says no,
  // tell the player to click-and-drag instead (see player.js).
  const noLock = () => showToast("Hold the mouse button and drag to look around");
  try {
    const result = canvas.requestPointerLock();
    if (result && result.catch) result.catch(noLock);
  } catch (e) { noLock(); }
});

document.addEventListener("pointerlockchange", () => {
  if (document.pointerLockElement !== canvas && started) {
    paused = true;
    overlayTitle.textContent = "Paused — click to continue";
    overlay.classList.remove("hidden");
  }
});

// ---- Little pop-up message ----
let toastTimer = null;
function showToast(text) {
  toastEl.textContent = text;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2500);
}

// ---- Check if Rae is touching any collectibles ----
function checkCollectibles() {
  const c = player.center();
  for (const prop of world.collectibles()) {
    const p = prop.mesh.position;
    if (c.distanceTo(p) < 0.45) {
      prop.collected = true;
      world.remove(prop);
      Sfx.chime();
      collectedCount++;
      countEl.textContent = collectedCount;
      if (prop.name === "carrot") Dialogue.sayOnce("first-carrot", "Yummers mode!");
    }
  }
}

// ---- The game loop: runs about 60 times a second ----
const clock = new THREE.Clock();
function loop() {
  requestAnimationFrame(loop);
  const dt = Math.min(clock.getDelta(), 0.05); // cap big jumps (e.g. after switching tabs)
  const time = clock.elapsedTime;

  if (!paused) {
    const fallingSpeed = player.vel.y;
    player.update(dt, world);
    checkFrogs(Math.min(fallingSpeed, player.vel.y));
    checkCollectibles();
    checkZones();
    for (const frog of frogs) frog.update(dt, player, time);
  } else if (!started) {
    player.update(0, world); // just place the camera for the title screen
  }
  world.update(dt, time); // animates props and flying pieces
  raeModel.update(paused ? 0 : dt, player, time);
  paws.update(paused ? 0 : dt, player, time);

  renderer.render(scene, camera);
}
loop();

// Handy for debugging in the browser console: type  game  and press Enter
window.game = { world, player, scene, camera, raeModel, paws, frogs };
