// ============================================================
// shop.js — the Flopsy Shop (and Flopsy herself)
// ============================================================
// The little door inside the wardrobe opens this shop. Outfits are unlocked
// by collecting carrots, smashing things and stomping frogs. In the shop, Rae
// dances on a little stage wearing whichever outfit you're looking at.
//
// Uses these from main.js: player, raeModel, paused, gameOver, canvas,
// collectedCount, smashedCount, stompedCount.

// ---- The outfits ----
// need: what you have to do to unlock it (leave it out for "always available")
//   { carrots: 3 }  collect 3 carrots
//   { smashed: 20 } smash 20 things
//   { frogs: 2 }    stomp 2 frogs
const OUTFITS = [
  { id: "naked", emoji: "🐰", name: "Just fur",          line: "Fur is the only outfit I need!" },
  { id: "shirt", emoji: "➕", name: "Favourite shirt",   line: "Back in my favourite shirt!" },
  { id: "dress", emoji: "👗", name: "Pink dress",        line: "I feel like a princess bunny!",               need: { carrots: 3 } },
  { id: "frog",  emoji: "🐸", name: "Frog face shirt",   line: "Ribbit! The frogs will think I'm one of them!", need: { frogs: 5 } },
  { id: "suit",  emoji: "👔", name: "Navy suit",         line: "Time for serious business. Carrot business.",  need: { smashed: 20 } },
  { id: "clown", emoji: "🤡", name: "Clown face & nose", line: "Honk honk! The funniest bunny in town!",       need: { carrots: 8 } },
];

// How far along you are for an outfit's unlock
function outfitProgress(outfit) {
  if (!outfit.need) return null;
  if (outfit.need.carrots) return { icon: "🥕", have: collectedCount, want: outfit.need.carrots, what: "carrots" };
  if (outfit.need.smashed) return { icon: "💥", have: smashedCount, want: outfit.need.smashed, what: "things smashed" };
  if (outfit.need.frogs) return { icon: "🐸", have: stompedCount, want: outfit.need.frogs, what: "frogs stomped" };
}
function isUnlocked(outfit) {
  const p = outfitProgress(outfit);
  return !p || p.have >= p.want;
}

// Called every frame: when something new unlocks, Flopsy calls out about it
let announcedUnlocks = null;
function checkUnlocks() {
  if (Frogpocalypse.active) return; // Flopsy has fled the Frogpocalypse
  if (!announcedUnlocks) announcedUnlocks = new Set(OUTFITS.filter(isUnlocked).map((o) => o.id));
  for (const outfit of OUTFITS) {
    if (!announcedUnlocks.has(outfit.id) && isUnlocked(outfit)) {
      announcedUnlocks.add(outfit.id);
      Sfx.shopBell();
      Dialogue.say(`Psst! New at the Flopsy Shop: ${outfit.name}!`, FLOPSY_VOICE);
    }
  }
}

const FLOPSY_VOICE = { speaker: "🐰 Flopsy", style: "flopsy", voice: "flopsy" };

// ---- The little stage, with Rae dancing on it (its own small 3D view) ----
class ShopStage {
  constructor(stageCanvas) {
    this.canvas = stageCanvas;
    this.renderer = new THREE.WebGLRenderer({ canvas: stageCanvas, antialias: true });
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x4a3558);
    this.scene = scene;
    this.camera = new THREE.PerspectiveCamera(32, 2, 0.05, 20);
    this.camera.position.set(0, 0.42, -1.45);
    this.camera.lookAt(0, 0.26, 0);
    this.camera.layers.enable(LAYER_MIRROR_ONLY); // Rae's body lives on this layer

    // Round stage with a gold rim, and pink curtains either side
    const stage = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.45, 0.08, 16), pastel(COLORS.canPink));
    stage.position.y = -0.04;
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.43, 0.015, 4, 24), pastel(COLORS.butter));
    rim.rotation.x = Math.PI / 2;
    for (const side of [-1, 1]) {
      const curtain = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.4, 0.05), pastel(0xd9507a));
      curtain.position.set(side * 0.72, 0.5, 0.25);
      scene.add(curtain);
    }
    const backdrop = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.6, 0.05), pastel(0x7a4f86));
    backdrop.position.set(0, 0.5, 0.6);
    scene.add(stage, rim, backdrop);

    // Lights: soft fill plus a warm spotlight from above
    scene.add(new THREE.HemisphereLight(0xfff0f5, 0x6a4a7a, 0.55));
    const spot = new THREE.SpotLight(0xfff1d6, 0.9, 6, 0.45, 0.5);
    spot.position.set(0, 2.2, -0.8);
    spot.target.position.set(0, 0, 0);
    scene.add(spot, spot.target);

    // The dancer: a second Rae, just for the stage
    this.dancer = new RaeModel();
    scene.add(this.dancer.root);
    this.fake = { pos: new THREE.Vector3(), vel: new THREE.Vector3(), yaw: 0, pitch: 0, onGround: true };
  }

  show(outfitId) { this.dancer.setOutfit(outfitId); }

  // A little dance: bouncy hops, swaying, and a twirl every few seconds
  render(dt, time) {
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    if (w && h && (this.canvas.width !== Math.floor(w * this.renderer.getPixelRatio()))) {
      this.renderer.setSize(w, h, false);
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
    }
    const f = this.fake, beat = time * 5.5;
    const hop = Math.max(0, Math.sin(beat));
    f.pos.y = hop * 0.06;
    f.onGround = hop < 0.05;
    f.vel.set(f.onGround ? 0.5 : 0, Math.cos(beat) * 0.6, 0);
    const twirl = time % 4;
    f.yaw = Math.sin(time * 1.6) * 0.5 + (twirl > 3.3 ? ((twirl - 3.3) / 0.7) * Math.PI * 2 : 0);
    f.pitch = 0.25 + Math.sin(beat) * 0.15; // head bopping to the beat
    this.dancer.update(dt, f, time);
    this.renderer.render(this.scene, this.camera);
  }
}

// ---- The shop menu ----
let inShop = false;
let shopCooldown = 0;     // so stepping out doesn't send her straight back in
let shopSelected = null;  // the outfit being previewed on the stage
const fadeEl = document.getElementById("fade");
const shopEl = document.getElementById("shop");
const shopItemsEl = document.getElementById("shop-items");
const wearBtn = document.getElementById("shop-wear");
const shopStage = new ShopStage(document.getElementById("shop-stage"));

// Draw the outfit buttons (locked ones show what's needed)
function drawShopItems() {
  shopItemsEl.innerHTML = "";
  for (const outfit of OUTFITS) {
    const b = document.createElement("button");
    const unlocked = isUnlocked(outfit);
    b.className = "outfit" + (unlocked ? "" : " locked") +
      (outfit.id === raeModel.outfit ? " wearing" : "") +
      (shopSelected && outfit.id === shopSelected.id ? " selected" : "");
    const p = outfitProgress(outfit);
    const lockText = unlocked ? "" : `<span class="need">🔒 ${p.icon} ${p.have}/${p.want} ${p.what}</span>`;
    b.innerHTML = `<span class="emoji">${outfit.emoji}</span><span class="name">${outfit.name}</span>${lockText}`;
    b.addEventListener("click", () => selectOutfit(outfit));
    b.addEventListener("mouseenter", () => shopStage.show(outfit.id)); // peek on hover
    b.addEventListener("mouseleave", () => shopStage.show(shopSelected.id));
    shopItemsEl.appendChild(b);
  }
  const ok = shopSelected && isUnlocked(shopSelected);
  wearBtn.disabled = !ok;
  wearBtn.innerHTML = `<span class="pad-only xb a">A</span> ` +
    (ok ? `Wear the ${shopSelected.name.toLowerCase()}!` : "Locked! Keep exploring 🔒");
}

function selectOutfit(outfit) {
  shopSelected = outfit;
  shopStage.show(outfit.id);
  drawShopItems();
}

function openShop() {
  if (inShop || shopCooldown > 0 || gameOver) return;
  inShop = true;
  paused = true;
  player.keys = {};
  player.vel.set(0, 0, 0);
  Sfx.shopBell();
  fadeEl.classList.add("on"); // quick fade to black
  if (document.exitPointerLock) document.exitPointerLock();
  setTimeout(() => {
    selectOutfit(OUTFITS.find((o) => o.id === raeModel.outfit));
    shopEl.classList.remove("hidden");
  }, 300);
}

// Wear an outfit (or null to leave as she is), then step back out of the little door
function leaveShop(outfit) {
  if (!inShop) return;
  if (outfit && !isUnlocked(outfit)) return;
  shopEl.classList.add("hidden");
  const changed = outfit && outfit.id !== raeModel.outfit;
  if (outfit) {
    raeModel.setOutfit(outfit.id);
    Sfx.chime();
  }
  // Out of the door, facing back into the wardrobe
  player.pos.set(4.65, 0, 0.3);
  player.vel.set(0, 0, 0);
  player.knock.set(0, 0, 0);
  player.yaw = Math.PI / 2;
  player.pitch = 0;
  shopCooldown = 1.0;
  setTimeout(() => {
    fadeEl.classList.remove("on");
    inShop = false;
    paused = false;
    Dialogue.say(changed ? outfit.line : outfit ? "Still looking fab!" : "Maybe next time!");
  }, 250);
  try {
    const result = canvas.requestPointerLock(); // the click counts, so we can grab the mouse again
    if (result && result.catch) result.catch(() => {});
  } catch (e) {}
}

wearBtn.addEventListener("click", () => leaveShop(shopSelected));
document.getElementById("shop-leave").addEventListener("click", () => leaveShop(null));
window.addEventListener("keydown", (e) => { if (inShop && e.code === "Escape") leaveShop(null); });

// ============================================================
// Flopsy: the little brown bunny who runs the shop
// ============================================================
// She stands by the shop door. When she sees Rae come into the wardrobe,
// she turns, waves, and says hello.
class Flopsy {
  constructor(scene, x, y, z) {
    this.model = new RaeModel(FLOPSY_COLORS);
    this.model.setOutfit("naked");
    // Unlike Rae's body, everyone can see Flopsy
    this.model.root.traverse((o) => o.layers.set(0));
    this.model.root.scale.setScalar(0.72); // smaller than Rae
    scene.add(this.model.root);

    this.fake = { pos: new THREE.Vector3(x, y, z), vel: new THREE.Vector3(), yaw: Math.PI / 2, pitch: 0, onGround: true };
    this.homeYaw = Math.PI / 2;
    this.sawRae = false;
    this.greetCooldown = 0;
  }

  // Frogpocalypse: Flopsy runs away and hides
  leave() {
    this.gone = true;
    this.model.root.visible = false;
  }

  update(dt, player, time) {
    if (this.gone) return;
    const dx = player.pos.x - this.fake.pos.x, dz = player.pos.z - this.fake.pos.z;
    const insideWardrobe = player.pos.x > 4.12 && Math.abs(player.pos.y - this.fake.pos.y) < 1;
    const seesRae = insideWardrobe && Math.hypot(dx, dz) < 2.8;
    this.greetCooldown = Math.max(0, this.greetCooldown - dt);

    if (seesRae && !this.sawRae && this.greetCooldown === 0) {
      this.model.wave();
      Dialogue.say("Hello this Flopsy!!!", FLOPSY_VOICE);
      this.greetCooldown = 12;
    }
    this.sawRae = seesRae;

    // Turn to look at Rae while she's near, otherwise face out of the door
    const target = seesRae ? Math.atan2(-dx, -dz) : this.homeYaw;
    let diff = Math.atan2(Math.sin(target - this.fake.yaw), Math.cos(target - this.fake.yaw));
    this.fake.yaw += diff * Math.min(1, dt * 5);
    this.fake.pitch = seesRae ? 0.25 : 0; // looks up at Rae (Flopsy is shorter)
    this.model.update(dt, this.fake, time);
  }
}
