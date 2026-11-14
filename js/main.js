// ============================================================
// main.js — sets everything up and runs the game loop
// ============================================================

const canvas = document.getElementById("game");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlay-title");
const countEl = document.getElementById("carrot-count");
const totalEl = document.getElementById("carrot-total");
const toastEl = document.getElementById("toast");
const frogCountEl = document.getElementById("frog-count");

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
  document.getElementById("go-time").textContent = formatTime(Frogpocalypse.time);
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
    const stompReach = frog.radius + 0.14, bumpReach = frog.radius + 0.2; // smaller frogs are harder to land on
    if (flat < stompReach && fallingSpeed < 0 && player.pos.y <= top + 0.05 && player.pos.y >= top - 0.3) {
      hitFrog(frog, "stomp");
      player.pos.y = top;
      player.vel.y = 5.5;   // boing off its head
      player.onGround = false;
    } else if (flat < bumpReach && flat > 0.001 && player.pos.y < top - 0.1 && player.pos.y + player.height > frog.pos.y) {
      if (!frog.isBoss) { // the boss is too big to shove
        const push = bumpReach - flat;
        frog.pos.x += (dx / flat) * push;
        frog.pos.z += (dz / flat) * push;
      }
      hurtRae(frog.pos.x, frog.pos.z);
    }
  }
}

// ---- Punching (click) ----
// Rae punches with alternating paws. Anything breakable, or any frog, just in
// front of where she's looking gets smashed.
const PUNCH_REACH = 0.4;   // how far in front of her eyes the punch lands (metres)
const PUNCH_RADIUS = 0.3;  // how big the "hit zone" around that point is
let punchCooldown = 0;
let punchSide = 1;

function punch() {
  if (!started || paused || gameOver || inShop || punchCooldown > 0) return;
  punchCooldown = 0.28;
  punchSide = -punchSide; // left, right, left, right...
  paws.punch(punchSide);
  raeModel.punch(punchSide);
  Sfx.punch();
  setTimeout(landPunch, 70); // the hit lands as the paw reaches full stretch
}

function landPunch() {
  const eye = new THREE.Vector3(), aim = new THREE.Vector3();
  camera.getWorldPosition(eye);
  camera.getWorldDirection(aim);
  const hit = eye.addScaledVector(aim, PUNCH_REACH);
  for (const prop of world.props.filter((p) => p.breakable && !p.broken)) {
    if (prop.box.distanceToPoint(hit) < PUNCH_RADIUS) world.breakProp(prop);
  }
  for (const frog of frogs) {
    if (!frog.alive) continue;
    const middle = frog.pos.clone();
    middle.y += frog.height / 2;
    if (middle.distanceTo(hit) < PUNCH_RADIUS + frog.radius) hitFrog(frog, "punch");
  }
  // Poor Flopsy!
  if (flopsy.middle().distanceTo(hit) < PUNCH_RADIUS + 0.15) flopsy.ouch();
}

// ---- Dancing (G key / Y button) ----
// Rae dances for a few seconds (moving stops her). Nearby frogs stop and dance
// along... except in the Frogpocalypse, where they're far too busy.
const DANCE_TIME = 4;
let danceTime = 0;
const danceFake = { pos: new THREE.Vector3(), vel: new THREE.Vector3(), yaw: 0, pitch: 0, onGround: true };

function startDance() {
  if (!started || paused || gameOver || inShop || danceTime > 0) return;
  danceTime = DANCE_TIME;
  Sfx.danceTune();
  raeSays("dance");
  if (!Frogpocalypse.active) {
    for (const frog of frogs) {
      if (frog.alive && frog.pos.distanceTo(player.pos) < 9) frog.dance(DANCE_TIME);
    }
  }
}
window.addEventListener("keydown", (e) => { if (e.code === "KeyG" && !e.repeat) startDance(); });

// Frogs wave at Rae (instead of chasing) while she wears the frog face shirt
Frog.isFriendly = () => raeModel.outfit === "frog" && !Frogpocalypse.active;

// A click punches. (In click-and-drag look mode, a quick click still punches; a drag just looks.)
let pressedAt = null;
canvas.addEventListener("mousedown", (e) => {
  if (e.button !== 0) return;
  if (document.pointerLockElement === canvas) punch();
  else pressedAt = { x: e.clientX, y: e.clientY };
});
window.addEventListener("mouseup", (e) => {
  if (pressedAt && Math.hypot(e.clientX - pressedAt.x, e.clientY - pressedAt.y) < 6) punch();
  pressedAt = null;
});

// ---- Rae's first-time thoughts ----
// Each one plays only the first time it happens, and Rae picks one of the
// variations at random, so every playthrough sounds a bit different.
// Edit or add words here!
const RAE_LINES = {
  // bouncing & dancing
  "bounce-bed":  ["Bounce! Bounce! BOUNCE!", "Boing boing boing! Wheee!", "This bed is a trampoline now!"],
  "bounce-sofa": ["Sofa, so good!", "Comfy AND bouncy? Perfect!", "Cushion launch!"],
  "dance":       ["Dance party!", "Shake that fluffy tail!", "Bunny boogie time!"],
  // smashing things (by the thing's name)
  "smash-door":     ["Coming through!", "Knock knock! Too late!", "Doors are just walls that give up!"],
  "smash-book":     ["Who needs books anyway?", "That's one way to read!", "Chapter one: SMASH!"],
  "smash-bowl":     ["Oopsie! Butterpaws!", "Bowl-ed over!", "That bowl was empty anyway... I think."],
  "smash-glass":    ["Smash-tastic!", "Glass half... gone!", "Tinkle tinkle!"],
  "smash-lamp":     ["Lights out!", "Who turned off the lights?", "Lamp-tastic mess!"],
  "smash-can":      ["Pssssht!", "Spritz attack!", "Can't stop, won't stop!"],
  "smash-clothes":  ["Laundry day!", "Fashion disaster!", "Sock it to me!"],
  "smash-plant":    ["Sorry, leafy friend!", "Oops! Un-be-leaf-able!", "Leaf me alone, I'm busy!"],
  "smash-tv":       ["Nooo! My shows!", "Screen time's over!", "Guess I'll go outside... no, wait."],
  "smash-laptop":   ["Oops... that had homework on it!", "Ctrl+Alt+Defeat!", "That's one way to log off!"],
  "smash-phone":    ["No more doomscrolling!", "New phone, who dis?", "Call me... never!"],
  "smash-cracker":  ["BANG! Where's my paper hat?", "Christmas came early!", "Pull? Nah. Punch!"],
  "smash-frame":    ["Sorry, cute photo!", "Say cheese... and crunch!", "That was a frame-tastic photo!"],
  "smash-vase":     ["Flower power!", "Petal to the metal!", "Oops, a vase-ty mistake!"],
  "smash-jar":      ["Jar-ring!", "Jarred it!", "Well, that's jarring!"],
  "smash-notebook": ["Dear diary... oops.", "Notebook? No-book!", "Note to self: stop smashing."],
  "smash-mug":      ["Mug-nificent mess!", "Tea time is cancelled!", "That's the mug life!"],
  "smash-speaker":  ["Turn it down... forever!", "The music stopped!", "Speak no more!"],
  "smash-pot":      ["Pot-tastrophe!", "Pot luck!", "A pot-ty mistake!"],
  "smash-backpack": ["Bag smash!", "The homework escaped!", "That bag had snacks in it, right?"],
  "smash-computer": ["Blue screen of... crumbs!", "Ctrl+Alt+DESTROYED!", "Game over, computer!"],
  "smash-shoes":    ["Shoe-per smash!", "Sole destroyer!", "These shoes were made for smashin'!"],
  "smash-bottle":   ["Sports fuel? More like sports SPILL!", "Glug glug... splash!", "Hydration nation!"],
  // frogs and hearts
  "frog-spotted":    ["Eep! A frog!", "Oh no, froggy business!", "Ribbit yourself, mister!"],
  "frog-popped":     ["Pop goes the frog! Rabbits rule!", "Boing! Frog flattened!", "Frog? More like flop!"],
  "minifrog-popped": ["Got you, you speedy little thing!", "Too fast? Not for me!", "Tiny frog, tiny pop!"],
  "frog-punched":    ["Hi-yah! Bunny fu!", "Pow! Right in the ribbit!", "One punch frog!"],
  "frog-friendly":   ["They think I'm a frog! Hehe.", "Hi froggy friends!", "Undercover bunny... ribbit!"],
  "hurt":            ["Ouch! Frogs are slimy!", "Ow! Watch the fur!", "Hey! No touching!"],
  "last-heart":      ["Uh oh, I need a carrot...", "One heart left... careful, Rae!", "Carrot, carrot, where's a carrot?!"],
  // carrots
  "first-carrot": ["Yummers mode!", "Crunch crunch! Delicious!", "Carrot get enough of these!"],
  "all-carrots":  ["All the carrots! Best day ever!", "Every last carrot! I'm stuffed!", "Carrot champion!"],
  // Frogpocalypse
  "frog-mode-start": ["Uh oh... why are there SO many frogs?!", "Frogs! Frogs everywhere!", "This is a frog-tastrophe!"],
  "boss-beaten":     ["I did it! Rabbits rule FOREVER!", "Jiggle Jaggle is all jiggled out!", "Bunny wins! Frog loses!"],
  // places (zones in house.js)
  "zone-bath":         ["My fur is wet!", "Splish splash, I'm soggy!", "Bath time? I didn't agree to this!"],
  "zone-mirror-table": ["Who's that cute bunny?!", "Looking good, Rae!", "Mirror mirror on the wall..."],
  "zone-wardrobe":     ["A secret hideout! It smells like laundry.", "Ooh, a cosy closet!", "Narnia? No... just a wardrobe."],
  "zone-living-room":  ["Ooh, so cosy in here!", "What a comfy room!", "Sofa! TV! Snacks?"],
  "zone-office":       ["This is where the humans do work-stuff.", "Shh... someone's working!", "Office? More like nap room."],
  "zone-kitchen":      ["Down the rabbit hole... something smells yummy!", "Kitchen! Where are the carrots kept?", "Mmm, snack headquarters!"],
};
// Said EVERY time a carrot heals her (not just the first time)
const CARROT_HEAL_LINES = ["Crunchy! I feel better already!", "Carrot power! Heart restored!", "Nom nom... all better!"];

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
  if (zone === "shop-door") openShop();
  else if (zone) raeSays("zone-" + zone);
}

// ---- The Flopsy Shop & Flopsy: see shop.js ----
const flopsy = new Flopsy(scene, world.flopsySpot.x, world.flopsySpot.y, world.flopsySpot.z);

let collectedCount = 0;
const totalCollectibles = world.collectibles().length;
totalEl.textContent = totalCollectibles;

// ---- Main menu / pause screen ----
let started = false;
let paused = true;
let gameMode = null; // "carrot" (Carrotventure) or "frog" (Frogpocalypse)
const menuEl = document.getElementById("menu");
const modeButtons = [...document.querySelectorAll(".mode")];

// Highlight a game mode on the menu (mouse hover, or controller)
function selectMode(i) {
  modeButtons.forEach((b, j) => b.classList.toggle("selected", i === j));
}
modeButtons.forEach((b, i) => {
  b.addEventListener("mouseenter", () => selectMode(i));
  b.addEventListener("click", (e) => { e.stopPropagation(); startGame(b.dataset.mode); });
});

// Start playing in the chosen mode
function startGame(mode) {
  if (started) return;
  gameMode = mode;
  if (mode === "frog") Frogpocalypse.start();
  menuEl.classList.add("hidden");
  overlayTitle.classList.remove("hidden");
  resumeGame();
}

// Hide the menu/pause card and play
function resumeGame() {
  Sfx.init();                 // sound is allowed now that the player clicked
  started = true;
  paused = false;
  overlay.classList.add("hidden");
  // Capture the mouse for looking around. If the browser says no,
  // tell the player to click-and-drag instead (see player.js).
  const noLock = () => { if (Pad.mode !== "gamepad") showToast("Hold the mouse button and drag to look around"); };
  try {
    const result = canvas.requestPointerLock();
    if (result && result.catch) result.catch(noLock);
  } catch (e) { noLock(); }
}

// Clicking the pause card carries on (before the game starts, pick a mode instead)
overlay.addEventListener("click", () => { if (started) resumeGame(); });

document.addEventListener("pointerlockchange", () => {
  if (document.pointerLockElement !== canvas && started && !gameOver && !inShop) showPauseScreen();
});

// Pause, and show the card with the right prompt for keyboard or controller
function showPauseScreen() {
  paused = true;
  overlayTitle.innerHTML = `<span class="kb-only">Paused — click to continue</span>` +
    `<span class="pad-only">Paused — press <span class="xb a">A</span> to continue</span>`;
  overlay.classList.remove("hidden");
  if (document.pointerLockElement && document.exitPointerLock) document.exitPointerLock();
}

// ---- Little pop-up message ----
let toastTimer = null;
function showToast(text) {
  toastEl.textContent = text;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2500);
}

// ---- Big warning banner (e.g. the boss arriving) ----
let bannerTimer = null;
function showBanner(text) {
  const el = document.getElementById("banner");
  el.textContent = text;
  el.classList.add("show");
  clearTimeout(bannerTimer);
  bannerTimer = setTimeout(() => el.classList.remove("show"), 4000);
}

// ---- YOU WIN! (beat the boss in Frogpocalypse) ----
function formatTime(seconds) {
  const t = Math.floor(seconds);
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
}
function showWin() {
  gameOver = true;
  paused = true;
  document.getElementById("win-time").textContent = formatTime(Frogpocalypse.time);
  document.getElementById("win-frogs").textContent = stompedCount;
  document.getElementById("win-smashed").textContent = smashedCount;
  document.getElementById("win").classList.remove("hidden");
  if (document.exitPointerLock) document.exitPointerLock();
  Sfx.win();
}
document.getElementById("win-again").addEventListener("click", () => location.reload());

// Rae hit a frog (stomp or punch). The boss takes 3 hits; others pop straight away.
function hitFrog(frog, how) {
  if (frog.isBoss) {
    if (frog.bossHit()) {
      stompedCount++;
      Dialogue.say(RAE_LINES["boss-beaten"]);
      document.body.classList.remove("boss-fight");
      setTimeout(showWin, 1800);
    }
    return;
  }
  frog.pop();
  stompedCount++;
  if (how === "punch") raeSays("frog-punched");
  else raeSays(frog.mini ? "minifrog-popped" : "frog-popped");
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
      // Carrots heal a heart (in every mode)
      if (hearts < MAX_HEARTS) {
        hearts++;
        drawHearts();
        Dialogue.say(CARROT_HEAL_LINES);
      } else if (gameMode !== "frog") {
        raeSays("first-carrot");
      }
      if (gameMode !== "frog" && collectedCount === totalCollectibles) raeSays("all-carrots");
    }
  }
}

// ---- The game loop: runs about 60 times a second ----
const clock = new THREE.Clock();
function loop() {
  requestAnimationFrame(loop);
  const dt = Math.min(clock.getDelta(), 0.05); // cap big jumps (e.g. after switching tabs)
  const time = clock.elapsedTime;

  handleGamepad(dt); // controller input (see gamepad.js)

  if (!paused) {
    hurtCooldown = Math.max(0, hurtCooldown - dt);
    shopCooldown = Math.max(0, shopCooldown - dt);
    punchCooldown = Math.max(0, punchCooldown - dt);
    if (danceTime > 0) {
      danceTime -= dt;
      // walking off stops the dance
      const walking = Math.hypot(player.vel.x - player.knock.x, player.vel.z - player.knock.z) > 0.5;
      if (walking && danceTime < DANCE_TIME - 0.3) danceTime = 0;
    }
    paws.dancing = danceTime > 0;
    paws.group.visible = hurtCooldown === 0 || Math.floor(hurtCooldown * 10) % 2 === 0; // blink while safe
    const fallingSpeed = player.vel.y;
    player.update(dt, world);
    checkFrogs(Math.min(fallingSpeed, player.vel.y));
    checkCollectibles();
    checkZones();
    for (const frog of frogs) frog.update(dt, player, time);
    flopsy.update(dt, player, time);
    checkUnlocks();
    Frogpocalypse.update(dt, player);
    frogCountEl.textContent = stompedCount;
  } else if (!started) {
    player.update(0, world); // just place the camera for the title screen
  }
  world.update(dt, time); // animates props and flying pieces
  const raeMoves = danceTime > 0 ? danceMotion(danceFake, player.pos, player.yaw, time) : player;
  raeModel.update(paused ? 0 : dt, raeMoves, time);
  paws.update(paused ? 0 : dt, player, time);

  if (inShop) shopStage.render(dt, time); // Rae dancing on the shop's little stage
  else renderer.render(scene, camera);
}
loop();

// Handy for debugging in the browser console: type  game  and press Enter
window.game = { world, player, scene, camera, raeModel, paws, frogs, flopsy, Frogpocalypse };
