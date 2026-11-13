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

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ---- Build the world and the player ----
const world = new World(scene);
world.buildBedroom();

const player = new Player(camera);
player.attachInput(canvas);

// ---- Rae's first-time thoughts ----
Dialogue.init();
player.onBounce = (prop) => {
  if (prop.name.startsWith("bed")) Dialogue.sayOnce("first-bed-bounce", "Bounce! Bounce! BOUNCE!");
};

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
    player.update(dt, world);
    checkCollectibles();
  } else if (!started) {
    player.update(0, world); // just place the camera for the title screen
  }
  for (const prop of world.props) prop.update(dt, time);

  renderer.render(scene, camera);
}
loop();

// Handy for debugging in the browser console: type  game  and press Enter
window.game = { world, player, scene, camera };
