// ============================================================
// shop.js — the Flopsy Shop, Willow's Weapon Mart, and their shopkeepers
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
// lines: what Rae might say stepping out in it (one is picked at random)
const OUTFITS = [
  { id: "naked", emoji: "🐰", name: "Just fur",
    lines: ["Fur is the only outfit I need!", "Au naturel, darling!", "Fluffy and free!"] },
  { id: "shirt", emoji: "➕", name: "Favourite shirt",
    lines: ["Back in my favourite shirt!", "Classic Rae!", "Nothing beats the old faithful!"] },
  { id: "dress", emoji: "👗", name: "Pink dress", need: { carrots: 3 },
    lines: ["I feel like a princess bunny!", "Twirl, twirl, TWIRL!", "Pretty in pink!"] },
  { id: "frog",  emoji: "🐸", name: "Frog face shirt", need: { frogs: 5 },
    lines: ["Ribbit! The frogs will think I'm one of them!", "Frog disguise: activated!", "Ribbit ribbit... I mean, hello!"] },
  { id: "suit",  emoji: "👔", name: "Navy suit", need: { smashed: 20 },
    lines: ["Time for serious business. Carrot business.", "The name's Rabbit. Rae Rabbit.", "Very fancy. Very important."] },
  { id: "clown", emoji: "🤡", name: "Clown face & nose", need: { carrots: 8 },
    lines: ["Honk honk! The funniest bunny in town!", "Send in the clowns!", "Boop my nose! Go on!"] },
];

// ---- Willow's weapons (same "need" rules as the outfits) ----
// lines: what Rae might say stepping out holding it
const WEAPONS = [
  { id: "paws", emoji: "🐾", name: "Paws",
    desc: "Quick little jabs. Short reach.",
    lines: ["Paws up! Old school!", "These paws are registered weapons!", "Who needs gadgets? Pow pow!"] },
  { id: "stick", emoji: "🥢", name: "Pokey Stick", need: { frogs: 4 },
    desc: "Long reach, slower pokes.",
    lines: ["Poke poke POKE!", "En garde, frogs!", "A stick! The finest stick in all the land!"] },
  { id: "raygun", emoji: "🔫", name: "'Rae' Gun", need: { frogs: 12 },
    desc: "Zaps frogs from far away!",
    lines: ["Pew pew! Alien technology!", "Zap zap! Take me to your carrot!", "The 'Rae' Gun! Frogs, beware!"] },
];

// Willow's lines in and around her shop
const willowUnlockLine = (name) => pick([
  `A felicitous development! The ${name} is now available for acquisition.`,
  `Attention, esteemed customer: the ${name} has arrived at my emporium!`,
  `Splendid news! Your froggy exploits have earned you access to the ${name}.`,
]);
const WILLOW_SAME_LINES = ["Remaining loyal to one's armament. Admirable!", "Sticking with that? Commendable!", "Same again! Very sensible."];
const WILLOW_LEAVE_LINES = ["Just browsing, Willow. Bye!", "Maybe next time, Willow!", "Lovely shop, Willow. Bye!"];

// Flopsy's lines
const FLOPSY_HELLO = ["Hello this Flopsy!!!", "Hi hi! This Flopsy!!!", "Welcome welcome! This Flopsy shop!!!"];
const FLOPSY_OUCH = ["Ouch this Flopsy!!!", "Ow ow ow! Why punch this Flopsy!!!", "Ouchie! This Flopsy not punching bag!!!"];
const flopsyUnlockLine = (name) => pick([
  `Psst! New at the Flopsy Shop: ${name}!`,
  `Ooh! ${name} now in Flopsy Shop!!!`,
  `Come see! ${name} waiting for you!!!`,
]);
// What Rae says leaving the shop without changing
const SHOP_SAME_LINES = ["Still looking fab!", "Why change perfection?", "Same outfit, same fabulous me!"];
const SHOP_LEAVE_LINES = ["Maybe next time!", "Just browsing, thanks!", "Bye Flopsy! See you soon!"];

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

// Called every frame: when something new unlocks, Flopsy (outfits) or Willow
// (weapons) calls out about it
let announcedUnlocks = null;
function checkUnlocks() {
  if (Frogpocalypse.active) return; // the shopkeepers have fled the Frogpocalypse
  const all = [...OUTFITS, ...WEAPONS];
  if (!announcedUnlocks) announcedUnlocks = new Set(all.filter(isUnlocked).map((o) => o.id));
  for (const item of all) {
    if (!announcedUnlocks.has(item.id) && isUnlocked(item)) {
      announcedUnlocks.add(item.id);
      Sfx.shopBell();
      if (WEAPONS.includes(item)) Dialogue.say(willowUnlockLine(item.name), WILLOW_VOICE);
      else Dialogue.say(flopsyUnlockLine(item.name), FLOPSY_VOICE);
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
    this.curtainMat = pastel(0xd9507a);
    this.backdropMat = pastel(0x7a4f86);
    this.stageMat = stage.material;
    for (const side of [-1, 1]) {
      const curtain = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.4, 0.05), this.curtainMat);
      curtain.position.set(side * 0.72, 0.5, 0.25);
      scene.add(curtain);
    }
    const backdrop = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.6, 0.05), this.backdropMat);
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

  // Dress the dancer (and put a weapon in her paw)
  show(outfitId, weaponId) {
    this.dancer.setOutfit(outfitId);
    this.dancer.setWeapon(weaponId);
  }

  // Flopsy's stage is pink and purple; Willow's is a sober green and grey
  setTheme(shop) {
    const willow = shop === SHOPS.willow;
    this.curtainMat.color.set(willow ? 0x2f5a46 : 0xd9507a);
    this.backdropMat.color.set(willow ? 0x5a5662 : 0x7a4f86);
    this.stageMat.color.set(willow ? 0x9a8f80 : COLORS.canPink);
    this.scene.background.set(willow ? 0x3a3840 : 0x4a3558);
  }

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

// ---- The shop menu (used by both shops) ----
// Each shop: its title, what it sells, what Rae has now, how to use an item,
// and where Rae steps back out of its little door.
const SHOPS = {
  flopsy: {
    title: "FLOPSY SHOP", sub: "Pick an outfit, little bunny!", items: OUTFITS,
    current: () => raeModel.outfit,
    apply: (item) => raeModel.setOutfit(item.id),
    stage: (item) => shopStage.show(item.id, currentWeapon), // try the outfit on
    useLabel: (item) => `Wear the ${item.name.toLowerCase()}!`,
    lockedLabel: "Locked! Keep exploring 🔒",
    leaveLabel: "Just looking, thanks",
    sameLines: SHOP_SAME_LINES, leaveLines: SHOP_LEAVE_LINES,
    exit: { x: 4.65, z: 0.3, yaw: Math.PI / 2 },
  },
  willow: {
    title: "WILLOW'S WEAPON MART", sub: "Purveyor of peerless armaments. Do choose judiciously.", items: WEAPONS,
    current: () => currentWeapon,
    apply: (item) => equipWeapon(item.id),
    stage: (item) => shopStage.show(raeModel.outfit, item.id), // try the weapon out
    useLabel: (item) => `Take the ${item.name}!`,
    lockedLabel: "Locked! Stomp more frogs 🔒",
    leaveLabel: "Merely perusing, thank you",
    sameLines: WILLOW_SAME_LINES, leaveLines: WILLOW_LEAVE_LINES,
    exit: { x: 4.66, z: 1.8, yaw: 0 },
  },
};

let inShop = false;
let currentShop = SHOPS.flopsy;
let shopCooldown = 0;     // so stepping out doesn't send her straight back in
let shopSelected = null;  // the item being previewed on the stage
const fadeEl = document.getElementById("fade");
const shopEl = document.getElementById("shop");
const shopItemsEl = document.getElementById("shop-items");
const wearBtn = document.getElementById("shop-wear");
const shopStage = new ShopStage(document.getElementById("shop-stage"));

// Draw the item buttons (locked ones show what's needed)
function drawShopItems() {
  const shop = currentShop;
  shopItemsEl.innerHTML = "";
  for (const item of shop.items) {
    const b = document.createElement("button");
    const unlocked = isUnlocked(item);
    b.className = "outfit" + (unlocked ? "" : " locked") +
      (item.id === shop.current() ? " wearing" : "") +
      (shopSelected && item.id === shopSelected.id ? " selected" : "");
    const p = outfitProgress(item);
    const lockText = unlocked ? "" : `<span class="need">🔒 ${p.icon} ${p.have}/${p.want} ${p.what}</span>`;
    const descText = item.desc ? `<span class="desc">${item.desc}</span>` : "";
    b.innerHTML = `<span class="emoji">${item.emoji}</span><span class="name">${item.name}</span>${descText}${lockText}`;
    b.addEventListener("click", () => selectOutfit(item));
    b.addEventListener("mouseenter", () => shop.stage(item)); // peek on hover
    b.addEventListener("mouseleave", () => shop.stage(shopSelected));
    shopItemsEl.appendChild(b);
  }
  const ok = shopSelected && isUnlocked(shopSelected);
  wearBtn.disabled = !ok;
  wearBtn.innerHTML = `<span class="pad-only xb a">A</span> ` + (ok ? shop.useLabel(shopSelected) : shop.lockedLabel);
}

function selectOutfit(item) {
  shopSelected = item;
  currentShop.stage(item);
  drawShopItems();
}

// which: "flopsy" or "willow"
function openShop(which = "flopsy") {
  if (inShop || shopCooldown > 0 || gameOver) return;
  inShop = true;
  paused = true;
  currentShop = SHOPS[which];
  player.keys = {};
  player.vel.set(0, 0, 0);
  Sfx.shopBell();
  fadeEl.classList.add("on"); // quick fade to black
  if (document.exitPointerLock) document.exitPointerLock();
  setTimeout(() => {
    shopEl.classList.toggle("willow", which === "willow");
    document.querySelector("#shop .shop-title").textContent = currentShop.title;
    document.querySelector("#shop .shop-sub").textContent = currentShop.sub;
    document.querySelector("#shop-leave .leave-text").textContent = currentShop.leaveLabel;
    shopStage.setTheme(currentShop);
    selectOutfit(currentShop.items.find((o) => o.id === currentShop.current()));
    shopEl.classList.remove("hidden");
  }, 300);
}

// Take an item (or null to leave as she is), then step back out of the little door
function leaveShop(item) {
  if (!inShop) return;
  if (item && !isUnlocked(item)) return;
  const shop = currentShop;
  shopEl.classList.add("hidden");
  const changed = item && item.id !== shop.current();
  if (item) {
    shop.apply(item);
    Sfx.chime();
  }
  // Out of the door, facing back into the wardrobe
  player.pos.set(shop.exit.x, 0, shop.exit.z);
  player.vel.set(0, 0, 0);
  player.knock.set(0, 0, 0);
  player.yaw = shop.exit.yaw;
  player.pitch = 0;
  shopCooldown = 1.0;
  setTimeout(() => {
    fadeEl.classList.remove("on");
    inShop = false;
    paused = false;
    Dialogue.say(changed ? item.lines : item ? shop.sameLines : shop.leaveLines);
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
// Shopkeepers: Flopsy (Flopsy Shop) and Willow (Willow's Weapon Mart)
// ============================================================
// Little bunnies who stand by their shop doors inside the wardrobe. When one
// sees Rae come into the wardrobe she turns, waves and says hello. Punch one
// and she jumps up and complains.
const WILLOW_COLORS = { ...RAE_COLORS, fur: 0xa8a5ae, furLight: 0xd9d6de, tail: 0xf4f2f6 };
const WILLOW_VOICE = { speaker: "🐰 Willow", style: "willow", voice: "willow" };
// Willow is frightfully erudite
const WILLOW_HELLO = [
  "Salutations! Welcome to Willow's Weapon Mart, purveyor of peerless armaments!",
  "Greetings, esteemed lagomorph! Do peruse my forthcoming inventory.",
  "Ah, a discerning clientele! Regrettably, my emporium remains in its nascent stages.",
];
const WILLOW_OUCH = [
  "Ouch! Such egregious belligerence is wholly unwarranted!",
  "Ow! I find your pugilistic proclivities most disagreeable!",
  "Preposterous! Assaulting a proprietor is the very epitome of impropriety!",
];

class ShopKeeper {
  // opts: { colors, scale, homeYaw, voice, hello, ouch }
  constructor(scene, x, y, z, opts) {
    this.opts = opts;
    this.model = new RaeModel(opts.colors);
    this.model.setOutfit("naked");
    if (opts.extras) opts.extras(this.model); // e.g. Willow's monocle
    // Unlike Rae's body, everyone can see the shopkeepers
    this.model.root.traverse((o) => o.layers.set(0));
    this.model.root.scale.setScalar(opts.scale);
    scene.add(this.model.root);

    this.fake = { pos: new THREE.Vector3(x, y, z), vel: new THREE.Vector3(), yaw: opts.homeYaw, pitch: 0, onGround: true };
    this.floorY = y;
    this.jumpVel = 0;      // for jumping when punched
    this.ouchCooldown = 0;
    this.homeYaw = opts.homeYaw;
    this.sawRae = false;
    this.greetCooldown = 0;
  }

  // Run away and hide (Flopsy, in the Frogpocalypse)
  leave() {
    this.gone = true;
    this.model.root.visible = false;
  }

  // The middle of her body (for punches)
  middle() {
    if (this.gone) return new THREE.Vector3(0, -999, 0);
    return new THREE.Vector3(this.fake.pos.x, this.fake.pos.y + 0.24 * this.opts.scale, this.fake.pos.z);
  }

  // Rae punched her! She jumps up with a squeak
  ouch() {
    if (this.gone || this.ouchCooldown > 0) return;
    this.ouchCooldown = 0.6;
    this.jumpVel = 2.8;
    Sfx.squeak();
    Dialogue.say(this.opts.ouch, this.opts.voice);
  }

  update(dt, player, time) {
    if (this.gone) return;
    // Jumping after a punch
    this.ouchCooldown = Math.max(0, this.ouchCooldown - dt);
    if (this.jumpVel !== 0 || this.fake.pos.y > this.floorY) {
      this.jumpVel -= 14 * dt;
      this.fake.pos.y += this.jumpVel * dt;
      if (this.fake.pos.y <= this.floorY) { this.fake.pos.y = this.floorY; this.jumpVel = 0; }
    }
    this.fake.onGround = this.fake.pos.y <= this.floorY;
    this.fake.vel.y = this.jumpVel;
    const dx = player.pos.x - this.fake.pos.x, dz = player.pos.z - this.fake.pos.z;
    const insideWardrobe = player.pos.x > 4.12 && player.pos.x < 5.45 && player.pos.z > -1.85 &&
      player.pos.z < 2.45 && Math.abs(player.pos.y - this.fake.pos.y) < 1;
    const seesRae = insideWardrobe && Math.hypot(dx, dz) < 2.8;
    this.greetCooldown = Math.max(0, this.greetCooldown - dt);

    if (seesRae && !this.sawRae && this.greetCooldown === 0) {
      this.model.wave();
      Dialogue.say(this.opts.hello, this.opts.voice);
      this.greetCooldown = 12;
    }
    this.sawRae = seesRae;

    // Turn to look at Rae while she's near, otherwise face out of the door
    const target = seesRae ? Math.atan2(-dx, -dz) : this.homeYaw;
    let diff = Math.atan2(Math.sin(target - this.fake.yaw), Math.cos(target - this.fake.yaw));
    this.fake.yaw += diff * Math.min(1, dt * 5);
    this.fake.pitch = seesRae ? 0.25 : 0; // looks up at Rae (shopkeepers are shorter)
    this.model.update(dt, this.fake, time);
  }
}

// Willow's monocle: a little gold ring over her right eye, on a chain
function willowMonocle(model) {
  const gold = 0xe8c262;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.026, 0.006, 4, 10), pastel(gold));
  ring.position.set(0.048, 0.1, -0.112);
  const chain = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.09, 0.004), pastel(gold));
  chain.position.set(0.07, 0.055, -0.1);
  chain.rotation.z = 0.4;
  model.head.add(ring, chain);
}

// Make both shopkeepers (main.js calls this). Flopsy is the smaller, paler one.
function makeShopKeepers(scene, world) {
  const f = world.flopsySpot, w = world.willowSpot;
  const flopsy = new ShopKeeper(scene, f.x, f.y, f.z, {
    colors: FLOPSY_COLORS, scale: 0.58, homeYaw: Math.PI / 2,
    voice: FLOPSY_VOICE, hello: FLOPSY_HELLO, ouch: FLOPSY_OUCH,
  });
  const willow = new ShopKeeper(scene, w.x, w.y, w.z, {
    colors: WILLOW_COLORS, scale: 0.72, homeYaw: w.yaw, extras: willowMonocle,
    voice: WILLOW_VOICE, hello: WILLOW_HELLO, ouch: WILLOW_OUCH,
  });
  return { flopsy, willow };
}
