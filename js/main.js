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
scene.background = new THREE.Color(0xcfe6f5); // sky blue (you can see out of the open windows)

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

// With a weapon from Willow's shop, the same button pokes the Pokey Stick or
// fires the 'Rae' Gun instead (see weapons.js).
function punch() {
  if (!started || paused || gameOver || inShop || punchCooldown > 0) return;
  const stats = WEAPON_STATS[currentWeapon];
  punchCooldown = stats.cooldown;
  if (currentWeapon === "raygun") {
    paws.useWeapon();
    raeModel.punch(1);
    const eye = new THREE.Vector3(), aim = new THREE.Vector3();
    camera.getWorldPosition(eye);
    camera.getWorldDirection(aim);
    Blaster.fire(eye, aim);
    return;
  }
  if (currentWeapon === "stick") {
    paws.useWeapon();
    raeModel.punch(1);
  } else {
    punchSide = -punchSide; // left, right, left, right...
    paws.punch(punchSide);
    raeModel.punch(punchSide);
  }
  Sfx.punch();
  setTimeout(() => landPunch(stats), 70); // the hit lands as the paw (or stick) reaches full stretch
}

// Smash whatever is in the hit zone. The stick checks several spots along its length.
function landPunch(stats) {
  const eye = new THREE.Vector3(), aim = new THREE.Vector3();
  camera.getWorldPosition(eye);
  camera.getWorldDirection(aim);
  const how = currentWeapon === "stick" ? "poke" : "punch";
  const spots = [];
  for (let d = PUNCH_REACH; d < stats.reach + 0.01; d += 0.25) spots.push(eye.clone().addScaledVector(aim, d));
  spots.push(eye.clone().addScaledVector(aim, stats.reach));
  const near = (point, extra) => spots.some((hit) => hit.distanceTo(point) < stats.radius + extra);

  for (const prop of world.props.filter((p) => p.breakable && !p.broken)) {
    if (spots.some((hit) => prop.box.distanceToPoint(hit) < stats.radius)) world.breakProp(prop);
  }
  for (const frog of frogs) {
    if (!frog.alive) continue;
    const middle = frog.pos.clone();
    middle.y += frog.height / 2;
    if (near(middle, frog.radius)) hitFrog(frog, how);
  }
  // Poor Flopsy! Poor Willow!
  if (near(flopsy.middle(), 0.15)) flopsy.ouch();
  if (near(willow.middle(), 0.15)) willow.ouch();
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
  "smash-bottle":   ["Glug glug... SPLASH!", "That's a lot of bottles to recycle!", "Hydration nation!"],
  "smash-pan":      ["Pan-demonium!", "Dinner's ruined!", "Frying pan? Flying pan!"],
  "smash-jug":      ["Filter THIS!", "Water everywhere!", "Splash-tastic!"],
  "smash-board":    ["Chop chop!", "Board? Never!", "Cutting board, cut short!"],
  "smash-mortar":   ["Pestle? I hardly know her!", "Grind time!", "Mortar-fied!"],
  "smash-oranges":  ["Orange you glad I did that?", "Juicy!", "Citrus chaos!"],
  "smash-paper-towel": ["Roll with it!", "Paper towel, meet bunny paw!", "Who needs to wipe anything?"],
  "smash-paint":    ["Paint the town pastel!", "Splat!", "That's one way to redecorate!"],
  "smash-cereal":   ["Breakfast is served... everywhere!", "Snap, crackle, POP!", "Cereal killer!"],
  "smash-box":      ["Boxed in? Not me!", "Out of the box!", "What was in there? Doesn't matter now!"],
  "smash-tape":     ["That's a wrap!", "Stuck? Not anymore!", "Tape-tastrophe!"],
  // frogs and hearts
  "frog-spotted":    ["Eep! A frog!", "Oh no, froggy business!", "Ribbit yourself, mister!"],
  "frog-popped":     ["Pop goes the frog! Rabbits rule!", "Boing! Frog flattened!", "Frog? More like flop!"],
  "minifrog-popped": ["Got you, you speedy little thing!", "Too fast? Not for me!", "Tiny frog, tiny pop!"],
  "frog-punched":    ["Hi-yah! Bunny fu!", "Pow! Right in the ribbit!", "One punch frog!"],
  "frog-poked":      ["Poked! Right in the ribbits!", "Stick 1, frog 0!", "Poke-a-dot!"],
  "frog-zapped":     ["ZAPPED! Pew pew!", "Frog vaporised! ...Gently!", "Bullseye from across the room!"],
  "frog-friendly":   ["They think I'm a frog! Hehe.", "Hi froggy friends!", "Undercover bunny... ribbit!"],
  "hurt":            ["Ouch! Frogs are slimy!", "Ow! Watch the fur!", "Hey! No touching!"],
  "last-heart":      ["Uh oh, I need a carrot...", "One heart left... careful, Rae!", "Carrot, carrot, where's a carrot?!"],
  // carrots
  "first-carrot": ["Yummers mode!", "Crunch crunch! Delicious!", "Carrot get enough of these!"],
  // Frogpocalypse
  "frog-mode-start": ["Uh oh... why are there SO many frogs?!", "Frogs! Frogs everywhere!", "This is a frog-tastrophe!"],
  "boss-beaten":     ["I did it! Rabbits rule FOREVER!", "Jiggle Jaggle is all jiggled out!", "Bunny wins! Frog loses!"],
  // places (zones in house.js)
  "zone-bath":         ["My fur is wet!", "Splish splash, I'm soggy!", "Bath time? I didn't agree to this!"],
  "zone-mirror-table": ["Who's that cute bunny?!", "Looking good, Rae!", "Mirror mirror on the wall..."],
  "zone-wardrobe":     ["A secret hideout! It smells like laundry.", "Ooh, a cosy closet!", "Narnia? No... just a wardrobe."],
  "zone-living-room":  ["Ooh, so cosy in here!", "What a comfy room!", "Sofa! TV! Snacks?"],
  "zone-office":       ["This is where the humans do work-stuff.", "Shh... someone's working!", "Office? More like nap room."],
  "zone-garden":       ["Fresh air! And a TREE!", "Ooh, the garden! Don't look down...", "Climbing time!"],
  "zone-high-shelf":   ["I made it to the top!", "King of the cupboards!", "The view from up here is amazing!"],
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
  if (zone === "toilet") { if (needsToilet) showWin("toilet"); return; } // only matters once she's eaten every carrot
  if (zone === "shop-door") openShop("flopsy");
  if (zone === "willow-door") openShop("willow");
  else if (zone && zone.startsWith("window-")) lastWindow = zone; // remember which window she used
  else if (zone) raeSays("zone-" + zone);
  if (zone === "garden" && player.pos.y < -0.8) fallOffTree();
}

// ---- Falling off the tree ----
// The garden ground is just scenery: fall below the branches and Rae loses a
// heart and pops back inside through the window she climbed out of.
let lastWindow = "window-living";
const FALL_LINES = ["Woah! Too high!", "Eek! Back inside!", "Ouch... stay on the branches, Rae!"];

function fallOffTree() {
  const spot = world.windowReturns[lastWindow] || world.windowReturns["window-living"];
  player.pos.set(spot.x, spot.y, spot.z);
  player.vel.set(0, 0, 0);
  player.knock.set(0, 0, 0);
  player.yaw = spot.yaw;
  player.pitch = 0;
  hearts--;
  drawHearts(hearts);
  Sfx.hurt();
  flashEl.classList.remove("flash");
  void flashEl.offsetWidth; // restart the red flash
  flashEl.classList.add("flash");
  hurtCooldown = HURT_COOLDOWN;
  if (hearts <= 0) setTimeout(showGameOver, 700);
  else Dialogue.say(FALL_LINES);
}

// ---- The Flopsy Shop & Flopsy: see shop.js ----
const { flopsy, willow } = makeShopKeepers(scene, world);

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

// ---- Mirror quality setting (Detailed / Faster) ----
// Remembered on this computer for next time.
const mirrorButtons = [...document.querySelectorAll("#mirror-setting button")];
function setMirrorQuality(quality) {
  Mirror.setQuality(quality);
  mirrorButtons.forEach((b) => b.classList.toggle("on", b.dataset.quality === quality));
  try { localStorage.setItem("rae-mirrors", quality); } catch (e) { /* can't save: fine */ }
}
function toggleMirrorQuality() {
  setMirrorQuality(Mirror.quality === "high" ? "low" : "high");
}
mirrorButtons.forEach((b) => b.addEventListener("click", (e) => {
  e.stopPropagation(); // don't also un-pause the game
  setMirrorQuality(b.dataset.quality);
}));
let savedMirrors = "high";
try { savedMirrors = localStorage.getItem("rae-mirrors") || "high"; } catch (e) {}
setMirrorQuality(savedMirrors === "low" ? "low" : "high");

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
// The YOU WIN! screen. how: "boss" (Frogpocalypse) or "toilet" (Carrotventure)
function showWin(how = "boss") {
  if (gameOver) return;
  gameOver = true;
  paused = true;
  if (how === "toilet") {
    document.getElementById("win-title").textContent = "🚽 YOU WIN! 🚽";
    document.getElementById("win-sub").textContent = "Phew! Rae made it to the toilet just in time!";
    document.getElementById("win-carrots").textContent = `${collectedCount} / ${totalCollectibles}`;
    Sfx.flush();
  }
  document.getElementById("win-time").textContent = formatTime(Frogpocalypse.time);
  document.getElementById("win-frogs").textContent = stompedCount;
  document.getElementById("win-smashed").textContent = smashedCount;
  document.getElementById("win").classList.remove("hidden");
  if (document.exitPointerLock) document.exitPointerLock();
  Sfx.win();
}
document.getElementById("win-again").addEventListener("click", () => location.reload());

// Carrotventure ending: eat every carrot and... uh oh. Get Rae to the toilet
// (stand on the seat) to win!
let needsToilet = false;
function tooManyCarrots() {
  needsToilet = true;
  Sfx.rumble();
  Dialogue.say("Uh oh - too many carrots!");
  setTimeout(() => {
    if (gameOver) return;
    Dialogue.say("Rae needs to get to the toilet!");
    showBanner("🚽 Quick! Get Rae to the toilet!");
  }, 1800);
}

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
  else if (how === "poke") raeSays("frog-poked");
  else if (how === "zap") raeSays("frog-zapped");
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
      if (gameMode !== "frog" && collectedCount === totalCollectibles) tooManyCarrots();
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
  Mirror.frame++;    // lets "Faster" mirrors take turns updating

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
    Blaster.update(dt); // the 'Rae' Gun's green balls
    flopsy.update(dt, player, time);
    willow.update(dt, player, time);
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
window.game = { world, player, scene, camera, raeModel, paws, frogs, flopsy, willow, Frogpocalypse };
