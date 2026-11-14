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
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // (the Graphics setting may lower this)
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
world.freezeStatic(); // things that never move: skip re-working-out their positions each frame

const player = new Player(camera);
player.attachInput(canvas);

// Rae's body (seen in mirrors) and her paws (seen at the bottom of the screen)
const raeModel = new RaeModel();
scene.add(raeModel.root);
const paws = new FirstPersonPaws(camera);

// Frogs, at the spots listed in house.js
const frogs = world.frogSpawns.map((s) => new Frog(world, s.x, s.y, s.z, s.color));

// ---- Hearts ----
let maxHearts = 3;         // goes up (to 6) by bonking Flopsy in the Frogpocalypse
const HURT_COOLDOWN = 1.5; // seconds Rae is safe after getting hurt
let hearts = maxHearts;
let hurtCooldown = 0;
const heartsEl = document.getElementById("hearts");
const flashEl = document.getElementById("hurt-flash");

function drawHearts(lostIndex = -1) {
  heartsEl.innerHTML = "";
  for (let i = 0; i < maxHearts; i++) {
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

  if (hearts <= 0) setTimeout(() => showGameOver("hearts"), 700); // out of hearts: show the summary
  else if (hearts === 1) raeSays("last-heart");
  else raeSays("hurt");
}
let hurts = 0; // how many times Rae has been hurt (handy for testing)

// ---- Scores for the summary screen ----
let smashedCount = 0;  // breakable things smashed (doors, cans, clothes...)
let stompedCount = 0;  // frogs popped
let gameOver = false;

// Out of hearts: pause, and show how she did, with a button to play again
// how: "hearts" (out of hearts), "washed" (washing machine) or "eaten" (Ducky)
const GAME_OVER_TITLES = {
  hearts: () => `💤 ${heroName()} needs a nap!`,
  washed: () => `🫧 ${heroName()} got washed! Poor ${heroName()}!`,
  eaten: () => `🦈 ${heroName()} got eaten by Ducky! Poor ${heroName()}!`,
  bird: () => `🦅 ${heroName()} got carried away by a bird!`,
};
function showGameOver(how = "hearts") {
  if (gameOver) return;
  gameOver = true;
  paused = true;
  document.getElementById("go-title").textContent = GAME_OVER_TITLES[how]();
  if (how === "washed") Achievements.unlock("washed");
  if (how === "eaten") Achievements.unlock("eaten");
  if (how === "bird") Achievements.unlock("roof");
  document.getElementById("go-carrots").textContent = `${collectedCount} / ${totalCollectibles}`;
  document.getElementById("go-time").textContent = formatTime(Frogpocalypse.time);
  document.getElementById("go-smashed").textContent = smashedCount;
  document.getElementById("go-frogs").textContent = stompedCount;
  document.getElementById("gameover").classList.remove("hidden");
  if (document.exitPointerLock) document.exitPointerLock(); // give the mouse back
  Music.stop();
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
      if (player.gentle) { Sfx.boing(); raeSays("frog-bounce"); } // Flopsy can't hurt frogs: just a bounce
      else hitFrog(frog, "stomp");
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
  if (!started || paused || gameOver || inShop || punchCooldown > 0 || Bird.active) return;
  if (player.gentle) { raeSays("no-punch"); return; } // Flopsy Mode: no punching
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
  // Dancing fireplace mice go POP
  for (const hit of spots) if (Mice.hitAt(hit, stats.radius)) break;
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
  Music.duck(DANCE_TIME); // (the dance tune takes over for a moment)
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
  "mice-popped":     ["Oops! Sorry, mice!", "Uh oh. That was the end of the mouse party.", "Pop pop! ...I feel a bit bad about that."],
  "frog-poked":      ["Poked! Right in the ribbits!", "Stick 1, frog 0!", "Poke-a-dot!"],
  "frog-zapped":     ["ZAPPED! Pew pew!", "Frog vaporised! ...Gently!", "Bullseye from across the room!"],
  "frog-friendly":   ["They think I'm a frog! Hehe.", "Hi froggy friends!", "Undercover bunny... ribbit!"],
  "hurt":            ["Ouch! Frogs are slimy!", "Ow! Watch the fur!", "Hey! No touching!"],
  "last-heart":      ["Uh oh, I need a carrot...", "One heart left... careful, Rae!", "Carrot, carrot, where's a carrot?!"],
  // carrots
  "first-carrot": ["Yummers mode!", "Crunch crunch! Delicious!", "Carrot get enough of these!"],
  // Frogpocalypse
  "frog-mode-start": ["Uh oh... why are there SO many frogs?!", "Frogs! Frogs everywhere!", "This is a frog-tastrophe!"],
  "jiggle-beaten":   ["Jiggle Jaggle is all jiggled out!", "Down goes the crown! Bunny wins!", "Ha! Who's the boss now?"],
  "fraggle-beaten":  ["So much for your evil plan, Fraggle!", "Evil defeated! Mostly. Probably.", "Bunny beats baddie!"],
  "boss-beaten":     ["Sorry, little guy! You were very brave. Rabbits rule!", "All three bosses beaten! Bunny wins!", "Phew! The house is frog-free... for now!"],
  // places (zones in house.js)
  "zone-bath":         ["My fur is wet!", "Splish splash, I'm soggy!", "Bath time? I didn't agree to this!"],
  "zone-mouse-nook":   ["Ooh, that looks like a mouse hole!", "Is that... a little mouse hole?", "A teeny tiny door! It looks like a mouse hole!"],
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

// Who you're playing as
function heroName() { return gameMode === "flopsy" ? "Flopsy" : "Rae"; }

function raeSays(id) {
  if (gameMode === "flopsy") { // Flopsy has her own lines (flopsymode.js); otherwise she stays quiet
    if (FLOPSY_MODE_LINES[id]) Dialogue.sayOnce(id, FLOPSY_MODE_LINES[id]);
    return;
  }
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
  if (hearts <= 0) setTimeout(() => showGameOver("hearts"), 700);
  else Dialogue.say(FALL_LINES);
}

// ---- The Flopsy Shop & Flopsy: see shop.js ----
const { flopsy, willow } = makeShopKeepers(scene, world);
Mice.init(); // the secret fireplace mice (mice.js)

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
  if (mode === "flopsy") FlopsyMode.start();
  menuEl.classList.add("hidden");
  overlayTitle.classList.remove("hidden");
  resumeGame();
  Music.play(mode === "frog" ? "frog" : mode === "flopsy" ? "musicbox" : "cosy"); // (music.js)
}

// Hide the menu/pause card and play
function resumeGame() {
  if (typeof Music !== "undefined") Music.setQuiet(false);
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

// ---- Graphics setting (Detailed / Faster / Fastest): mirror quality and screen resolution ----
// Remembered on this computer for next time.
const mirrorButtons = [...document.querySelectorAll("#mirror-setting button")];
function setMirrorQuality(quality) {
  Mirror.setQuality(quality);
  // "Faster" and "Fastest" also draw the game at normal resolution on sharp (high-DPI) laptop screens
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, quality === "high" ? 1.5 : 1));
  renderer.setSize(window.innerWidth, window.innerHeight);
  mirrorButtons.forEach((b) => b.classList.toggle("on", b.dataset.quality === quality));
  try { localStorage.setItem("rae-mirrors", quality); } catch (e) { /* can't save: fine */ }
}
function toggleMirrorQuality() {
  setMirrorQuality({ high: "low", low: "off", off: "high" }[Mirror.quality]); // Detailed -> Faster -> Fastest -> ...
}
mirrorButtons.forEach((b) => b.addEventListener("click", (e) => {
  e.stopPropagation(); // don't also un-pause the game
  setMirrorQuality(b.dataset.quality);
}));
let savedMirrors = "high";
try { savedMirrors = localStorage.getItem("rae-mirrors") || "high"; } catch (e) {}
setMirrorQuality(["high", "low", "off"].includes(savedMirrors) ? savedMirrors : "high");

// ---- Music On/Off (also remembered on this computer) ----
const musicButtons = [...document.querySelectorAll("#music-setting button")];
function setMusic(on) {
  Music.setOn(on);
  musicButtons.forEach((b) => b.classList.toggle("on", (b.dataset.music === "on") === on));
  try { localStorage.setItem("rae-music", on ? "on" : "off"); } catch (e) { /* can't save: fine */ }
}
function toggleMusic() { setMusic(!Music.on); }
musicButtons.forEach((b) => b.addEventListener("click", (e) => {
  e.stopPropagation(); // don't also un-pause the game
  setMusic(b.dataset.music === "on");
}));
let savedMusic = "on";
try { savedMusic = localStorage.getItem("rae-music") || "on"; } catch (e) {}
setMusic(savedMusic !== "off");

document.addEventListener("pointerlockchange", () => {
  if (document.pointerLockElement !== canvas && started && !gameOver && !inShop) showPauseScreen();
});

// Pause, and show the card with the right prompt for keyboard or controller
function showPauseScreen() {
  paused = true;
  overlayTitle.innerHTML = `<span class="kb-only">Paused — click to continue</span>` +
    `<span class="pad-only">Paused — press <span class="xb a">A</span> to continue</span>`;
  overlay.classList.remove("hidden");
  Music.setQuiet(true); // the music goes quiet while paused
  restartBtn.classList.remove("hidden");
  resetRestartButton();
  if (document.pointerLockElement && document.exitPointerLock) document.exitPointerLock();
}

// ---- Restart (pause screen): back to the main menu to pick a game mode ----
// The first press asks "Sure?", so a stray click doesn't throw away your game.
const restartBtn = document.getElementById("restart-game");
let restartSure = false;
function resetRestartButton() {
  restartSure = false;
  restartBtn.classList.remove("sure");
  restartBtn.querySelector(".restart-text").textContent = "↺ Restart (choose a mode)";
}
function pressRestart() {
  if (!restartSure) {
    restartSure = true;
    restartBtn.classList.add("sure");
    restartBtn.querySelector(".restart-text").textContent = "Sure? Press again to restart";
    Sfx.babble(false);
    return;
  }
  location.reload(); // a fresh start, at the main menu
}
restartBtn.addEventListener("click", (e) => {
  e.stopPropagation(); // don't also un-pause the game
  pressRestart();
});

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
    document.getElementById("win-sub").textContent = `Phew! ${heroName()} made it to the toilet just in time!`;
    document.getElementById("win-carrots").textContent = `${collectedCount} / ${totalCollectibles}`;
    Sfx.flush();
  }
  document.getElementById("win-time").textContent = formatTime(Frogpocalypse.time);
  document.getElementById("win-frogs").textContent = stompedCount;
  document.getElementById("win-smashed").textContent = smashedCount;
  document.getElementById("win").classList.remove("hidden");
  if (document.exitPointerLock) document.exitPointerLock();
  Music.stop();
  Sfx.win();
  // Achievements (see achievements.js)
  if (how === "toilet") {
    if (gameMode === "flopsy") Achievements.unlock("flopsy-mode");
    else Achievements.unlock("carrotventure");
    if (stompedCount === 0 && gameMode !== "flopsy") Achievements.unlock("pacifist"); // not a single frog popped!
  } else {
    Achievements.unlock("frogpocalypse");
  }
}
document.getElementById("win-again").addEventListener("click", () => location.reload());

// Carrotventure ending: eat every carrot and... uh oh. Get Rae to the toilet
// (stand on the seat) to win!
let needsToilet = false;
function tooManyCarrots() {
  needsToilet = true;
  Sfx.rumble();
  Dialogue.say(gameMode === "flopsy" ? "Uh oh!!! Too many carrots for this Flopsy!!!" : "Uh oh - too many carrots!");
  setTimeout(() => {
    if (gameOver) return;
    Dialogue.say(gameMode === "flopsy" ? "Flopsy needs to get to the toilet!!!" : "Rae needs to get to the toilet!");
    showBanner(`🚽 Quick! Get ${heroName()} to the toilet!`);
  }, 1800);
}

// ---- Traps: don't stay too long in the washing machine, or in Ducky's bath! ----
// After 5 seconds you get a warning; after 10 it's game over.
const WASHER_WARN_LINES = [
  "It's getting a bit spinny in here... I should get out!",
  "Hmm, I don't fancy being washed. Time to hop out!",
  "Cosy drum... but someone might press start. I'd better get out!",
];
const DUCKY_VOICE = { speaker: "🦈 Ducky", style: "ducky", voice: "ducky" };
const DUCKY_HUNGRY_LINES = [
  "Quack! ...Wait. I smell food.",
  "Quack quack! Something smells... delicious.",
  "Is that a bunny? QUACK. I'm suddenly very hungry.",
];
const TRAPS = {
  "washer-drum": { warn: () => Dialogue.say(WASHER_WARN_LINES), end: washedAway },
  "bath":        { warn: () => Dialogue.say(DUCKY_HUNGRY_LINES, DUCKY_VOICE), end: eatenByDucky },
};
const TRAP_WARN_TIME = 5, TRAP_END_TIME = 10;
let trapZone = null, trapTime = 0, trapWarned = false, trapped = false;

// Called every frame while playing
function checkTraps(dt) {
  if (trapped) return;
  const zone = world.zoneAt(player.pos);
  if (zone !== trapZone) { trapZone = zone; trapTime = 0; trapWarned = false; } // left (or hopped out): start again
  const trap = TRAPS[zone];
  if (!trap) return;
  trapTime += dt;
  if (!trapWarned && trapTime >= TRAP_WARN_TIME) { trapWarned = true; trap.warn(); }
  if (trapTime >= TRAP_END_TIME) { trapped = true; trap.end(); }
}

// Smoothly change something over a few seconds (step gets 0 -> 1), then call done
function tween(seconds, step, done) {
  const start = performance.now();
  const tick = () => {
    const t = Math.min(1, (performance.now() - start) / 1000 / seconds);
    step(t);
    if (t < 1) requestAnimationFrame(tick); else if (done) done();
  };
  requestAnimationFrame(tick);
}

function trapFilter(color) {
  const el = document.getElementById("trap-filter");
  el.className = "show " + color;
}

// The washing machine door swings shut... and the spin cycle begins
function washedAway() {
  paused = true;
  player.keys = {};
  const door = world.washerDoor, from = door.rotation.y, to = Math.PI / 2;
  tween(0.45, (t) => { door.rotation.y = from + (to - from) * t * t; }, () => {
    Sfx.slam();
    trapFilter("blue");
    setTimeout(() => Sfx.flush(), 300);
    setTimeout(() => showGameOver("washed"), 1800);
  });
}

// Ducky lunges at Rae: CHOMP!
function eatenByDucky() {
  paused = true;
  player.keys = {};
  const ducky = world.ducky;
  const from = ducky.position.clone();
  const eye = new THREE.Vector3();
  camera.getWorldPosition(eye);
  const to = eye.clone().add(new THREE.Vector3(0, -0.12, 0)).lerp(from, 0.25);
  ducky.rotation.y = Math.atan2(-(eye.z - from.z), eye.x - from.x); // nose towards Rae
  Dialogue.say(["QUACK!", "Quack! (chomp)", "Snack time! QUACK!"], DUCKY_VOICE);
  tween(0.35, (t) => {
    ducky.position.lerpVectors(from, to, t);
    ducky.scale.setScalar(1 + t * 1.6);
  }, () => {
    Sfx.chomp();
    trapFilter("red");
    setTimeout(() => showGameOver("eaten"), 1500);
  });
}

// Ducky bobs about in the bath, and turns to stare at Rae when she gets in
let duckyYaw = 0;
function updateDucky(dt, time) {
  const ducky = world.ducky;
  if (!ducky || trapped) return;
  ducky.position.y = 0.3 + Math.sin(time * 1.8) * 0.012;
  ducky.rotation.z = Math.sin(time * 1.3) * 0.06;
  ducky.userData.tail.rotation.y = Math.sin(time * 4) * 0.3;
  let target = Math.sin(time * 0.25) * 1.2; // lazily drifting about
  if (trapZone === "bath") target = Math.atan2(-(player.pos.z - ducky.position.z), player.pos.x - ducky.position.x);
  let diff = target - duckyYaw;
  diff = Math.atan2(Math.sin(diff), Math.cos(diff));
  duckyYaw += diff * Math.min(1, dt * 2);
  ducky.rotation.y = duckyYaw;
}

// Rae hit a frog (stomp, punch, poke or zap). Bosses take several hits; others pop straight away.
// Beating Jiggle Jaggle brings out Fraggle Friggle, then Tiggle Taggle; beating him wins the game.
const NEXT_BOSS = { jiggle: "fraggle", fraggle: "tiggle" };
function hitFrog(frog, how) {
  if (frog.isBoss) {
    if (frog.bossHit()) {
      stompedCount++;
      document.body.classList.remove("boss-fight");
      const next = NEXT_BOSS[frog.bossKind];
      if (frog.bossKind === "tiggle") Dialogue.say(TIGGLE_DEFEAT_LINES, frog.bossVoice());
      if (next) {
        Dialogue.say(RAE_LINES[frog.bossKind + "-beaten"]);
        setTimeout(() => { if (!gameOver) Frogpocalypse.spawnBoss(next); }, 2500);
      } else {
        setTimeout(() => Dialogue.say(RAE_LINES["boss-beaten"]), 1200);
        setTimeout(() => showWin("boss"), 3000);
      }
    }
    return;
  }
  // Zapping a frog that's waving hello at Rae in her frog face shirt. How rude!
  if (how === "zap" && frog.waving && raeModel.outfit === "frog") Achievements.unlock("friendly-fire");
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
      if (hearts < maxHearts) {
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

  if (Bird.active) {
    // Carried off by the bird (bird.js): it runs the camera; the game itself stops
    if (overlay.classList.contains("hidden")) Bird.update(dt, time);
  } else if (!paused) {
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
    if (!gameOver && Bird.onRoof()) Bird.start(); // made it onto the roof... uh oh
    if (player.standingOn && player.standingOn.name === "cloud") raeSays("first-cloud");
    if (!gameOver) checkTraps(dt); // washing machine & Ducky's bath
    updateDucky(dt, time);
    for (const frog of frogs) frog.update(dt, player, time);
    Blaster.update(dt); // the 'Rae' Gun's green balls
    flopsy.update(dt, player, time);
    willow.update(dt, player, time);
    Mice.update(dt, time);
    checkUnlocks();
    Frogpocalypse.update(dt, player);
    frogCountEl.textContent = stompedCount;
  } else if (!started) {
    player.update(0, world); // just place the camera for the title screen
  }
  world.update(dt, time); // animates props and flying pieces
  world.updateLights(player.pos.x, player.pos.y, player.pos.z); // the nearest room lamps
  const raeMoves = danceTime > 0 ? danceMotion(danceFake, player.pos, player.yaw, time) : player;
  raeModel.update(paused ? 0 : dt, raeMoves, time);
  paws.update(paused ? 0 : dt, player, time);

  if (inShop) shopStage.render(dt, time); // Rae dancing on the shop's little stage
  else renderer.render(scene, camera);
}
loop();

// Handy for debugging in the browser console: type  game  and press Enter
window.game = { world, player, scene, camera, raeModel, paws, frogs, flopsy, willow, Frogpocalypse };
