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

// ---- Hearts ----
const MAX_HEARTS = 3;
const HURT_COOLDOWN = 1.5; // seconds Rae is safe after getting hurt
let hearts = MAX_HEARTS;
let hurtCooldown = 0;
const heartsEl = document.getElementById("hearts");
const flashEl = document.getElementById("hurt-flash");

function drawHearts(lostIndex = -1) {
  heartsEl.innerHTML = "";
  for (let i = 0; i < MAX_HEARTS; i++) {
    const h = document.createElement("span");
    h.className = "heart" + (i < hearts ? "" : " empty") + (i === lostIndex ? " lost" : "");
    h.textContent = "♥";
    heartsEl.appendChild(h);
  }
}
drawHearts();

// Rae gets hurt by something at (fromX, fromZ): lose a heart, flash red, get knocked back
function hurtRae(fromX, fromZ) {
  if (hurtCooldown > 0) return;
  hurts++;
  hearts--;
  hurtCooldown = HURT_COOLDOWN;
  drawHearts(hearts);
  Sfx.hurt();
  flashEl.classList.remove("flash");
  void flashEl.offsetWidth; // restart the CSS animation
  flashEl.classList.add("flash");

  // Knocked back, away from whatever hurt her, with a little hop
  const away = new THREE.Vector3(player.pos.x - fromX, 0, player.pos.z - fromZ);
  if (away.length() < 0.001) away.set(0, 0, 1);
  away.normalize();
  player.knock.set(away.x * 5, 0, away.z * 5);
  player.vel.y = 3.5;
  player.onGround = false;

  if (hearts <= 0) setTimeout(showGameOver, 700); // out of hearts: show the summary
  else if (hearts === 1) raeSays("last-heart");
  else raeSays("hurt");
}
let hurts = 0; // how many times Rae has been hurt (handy for testing)

// ---- Scores for the summary screen ----
let smashedCount = 0;  // breakable things smashed (doors, cans, clothes...)
let stompedCount = 0;  // frogs popped
let gameOver = false;

// Out of hearts: pause, and show how she did, with a button to play again
function showGameOver() {
  gameOver = true;
  paused = true;
  document.getElementById("go-carrots").textContent = `${collectedCount} / ${totalCollectibles}`;
  document.getElementById("go-smashed").textContent = smashedCount;
  document.getElementById("go-frogs").textContent = stompedCount;
  document.getElementById("gameover").classList.remove("hidden");
  if (document.exitPointerLock) document.exitPointerLock(); // give the mouse back
  Sfx.gameOver();
}
document.getElementById("play-again").addEventListener("click", () => location.reload());

// Landing on a frog's head pops it (and bounces Rae up).
// Touching one any other way hurts Rae (and nudges the frog back a bit).
function checkFrogs(fallingSpeed) {
  for (const frog of frogs) {
    if (!frog.alive) continue;
    const dx = frog.pos.x - player.pos.x, dz = frog.pos.z - player.pos.z;
    const flat = Math.hypot(dx, dz);
    const top = frog.top();
    if (flat < 0.34 && fallingSpeed < 0 && player.pos.y <= top + 0.05 && player.pos.y >= top - 0.3) {
      frog.pop();
      stompedCount++;
      raeSays("frog-popped");
      player.pos.y = top;
      player.vel.y = 5.5;   // boing off its head
      player.onGround = false;
    } else if (flat < 0.4 && flat > 0.001 && player.pos.y < top - 0.1 && player.pos.y + player.height > frog.pos.y) {
      const push = 0.4 - flat;
      frog.pos.x += (dx / flat) * push;
      frog.pos.z += (dz / flat) * push;
      hurtRae(frog.pos.x, frog.pos.z);
    }
  }
}

// ---- Rae's first-time thoughts ----
// Each line plays only the first time it happens. Edit the words here!
const RAE_LINES = {
  // bouncing
  "bounce-bed":   "Bounce! Bounce! BOUNCE!",
  "bounce-sofa":  "Sofa, so good!",
  // smashing things (by the thing's name)
  "smash-door":    "Coming through!",
  "smash-book":    "Who needs books anyway?",
  "smash-bowl":    "Oopsie! Butterpaws!",
  "smash-glass":   "Smash-tastic!",
  "smash-lamp":    "Lights out!",
  "smash-can":     "Pssssht!",
  "smash-clothes": "Laundry day!",
  "smash-plant":   "Sorry, leafy friend!",
  // frogs and hearts
  "frog-spotted":  "Eep! A frog!",
  "frog-popped":   "Pop goes the frog! Rabbits rule!",
  "hurt":          "Ouch! Frogs are slimy!",
  "last-heart":    "Uh oh, I need a carrot...",
  // carrots
  "first-carrot":  "Yummers mode!",
  "all-carrots":   "All the carrots! Best day ever!",
  // places (zones in house.js)
  "zone-bath":         "My fur is wet!",
  "zone-mirror-table": "Who's that cute bunny?!",
  "zone-living-room":  "Ooh, so cosy in here!",
  "zone-office":       "This is where the humans do work-stuff.",
  "zone-kitchen":      "Down the rabbit hole... something smells yummy!",
};
function raeSays(id) {
  if (RAE_LINES[id]) Dialogue.sayOnce(id, RAE_LINES[id]);
}

Dialogue.init();
player.onBounce = (prop) => {
  if (prop.name.startsWith("bed")) raeSays("bounce-bed");
  if (prop.name.startsWith("sofa")) raeSays("bounce-sofa");
};
world.onBreak = (prop) => {
  smashedCount++;
  raeSays("smash-" + prop.name);
};
// Checked every frame: which invisible zone (see house.js) is Rae standing in?
function checkZones() {
  const zone = world.zoneAt(player.pos);
  if (zone) raeSays("zone-" + zone);
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
  if (document.pointerLockElement !== canvas && started && !gameOver) {
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
      if (prop.name === "carrot") raeSays("first-carrot");
      if (collectedCount === totalCollectibles) raeSays("all-carrots");
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
    hurtCooldown = Math.max(0, hurtCooldown - dt);
    paws.group.visible = hurtCooldown === 0 || Math.floor(hurtCooldown * 10) % 2 === 0; // blink while safe
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
