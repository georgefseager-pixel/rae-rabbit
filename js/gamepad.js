// ============================================================
// gamepad.js — playing with a controller (Xbox layout)
// ============================================================
//   Left stick     move            Right stick   look
//   A              hop             X / RB / RT   punch
//   Y              dance
//   Menu (☰)       pause           B             back (shop)
//   D-pad / stick  choose outfits in the shop, A to wear
//
// Whatever you touched last (controller, or keyboard & mouse) decides which
// button prompts are shown: the page gets the class "pad" while you're using
// a controller, and the CSS swaps .kb-only / .pad-only bits around.
//
// Uses these from main.js / shop.js: player, overlay, started, paused, gameOver,
// inShop, punch(), showPauseScreen(), leaveShop(), selectOutfit(), shopSelected,
// OUTFITS, isUnlocked().

const BTN = { A: 0, B: 1, X: 2, Y: 3, LB: 4, RB: 5, LT: 6, RT: 7, VIEW: 8, MENU: 9, UP: 12, DOWN: 13, LEFT: 14, RIGHT: 15 };

const Pad = {
  mode: "keyboard",   // "keyboard" or "gamepad"
  prev: [],           // which buttons were down last frame (to spot fresh presses)
  deadzone: 0.18,     // ignore tiny stick wobbles
  lookSpeed: 2.8,     // how fast the right stick turns Rae's head (radians per second)
  navCooldown: 0,     // stops the shop selection racing when you hold the stick

  setMode(mode) {
    if (this.mode === mode) return;
    this.mode = mode;
    document.body.classList.toggle("pad", mode === "gamepad");
  },

  // The first connected controller, or null
  read() {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const gp of pads) if (gp && gp.connected) return gp;
    return null;
  },

  stick(v) {
    const a = Math.abs(v);
    return a < this.deadzone ? 0 : Math.sign(v) * (a - this.deadzone) / (1 - this.deadzone);
  },
};

// Keyboard or mouse used? Switch the prompts back.
window.addEventListener("keydown", () => Pad.setMode("keyboard"));
window.addEventListener("mousedown", () => Pad.setMode("keyboard"));
window.addEventListener("mousemove", (e) => {
  if (Math.abs(e.movementX) + Math.abs(e.movementY) > 3) Pad.setMode("keyboard");
});
window.addEventListener("gamepadconnected", () => Pad.setMode("gamepad"));

// Called once per frame from main.js, before Rae moves
function handleGamepad(dt) {
  const gp = Pad.read();
  player.padMove.x = 0;
  player.padMove.y = 0;
  if (!gp) return;

  const down = (i) => !!(gp.buttons[i] && gp.buttons[i].pressed);
  const pressed = (i) => down(i) && !Pad.prev[i]; // pressed this frame
  const lx = Pad.stick(gp.axes[0] || 0), ly = Pad.stick(gp.axes[1] || 0);
  const rx = Pad.stick(gp.axes[2] || 0), ry = Pad.stick(gp.axes[3] || 0);
  if (lx || ly || rx || ry || gp.buttons.some((b) => b.pressed)) Pad.setMode("gamepad");
  Pad.navCooldown = Math.max(0, Pad.navCooldown - dt);

  const endShown = !document.getElementById("gameover").classList.contains("hidden") ||
    !document.getElementById("win").classList.contains("hidden");
  const startOrPauseShown = !overlay.classList.contains("hidden");
  // X on the menu / pause screen switches the mirror quality
  if (startOrPauseShown && !endShown && !inShop && pressed(BTN.X)) toggleMirrorQuality();

  if (endShown) {
    if (pressed(BTN.A) || pressed(BTN.MENU)) location.reload(); // play again
  } else if (inShop) {
    shopWithPad(pressed, lx, ly);
  } else if (startOrPauseShown && !started) {
    // Main menu: left/right (or up/down) to pick a mode, A to play
    const current = modeButtons.findIndex((b) => b.classList.contains("selected"));
    let move = 0;
    if (pressed(BTN.LEFT) || pressed(BTN.UP)) move = -1;
    if (pressed(BTN.RIGHT) || pressed(BTN.DOWN)) move = 1;
    if (!move && Pad.navCooldown === 0 && (Math.abs(lx) > 0.5 || Math.abs(ly) > 0.5)) {
      move = (lx || ly) > 0 ? 1 : -1;
      Pad.navCooldown = 0.25;
    }
    if (move) selectMode(Math.max(0, Math.min(modeButtons.length - 1, current + move)));
    if (pressed(BTN.A) || pressed(BTN.MENU)) startGame(modeButtons[Math.max(0, current)].dataset.mode);
  } else if (startOrPauseShown) {
    if (pressed(BTN.A) || pressed(BTN.MENU)) resumeGame(); // carry on
  } else if (started && !paused) {
    // Playing!
    player.padMove.x = lx;
    player.padMove.y = ly;
    player.yaw -= rx * Pad.lookSpeed * dt;
    player.pitch -= ry * Pad.lookSpeed * 0.7 * dt;
    player.pitch = Math.max(-1.5, Math.min(1.5, player.pitch));
    if (pressed(BTN.A)) player.hopQueued = 0.15;
    if (pressed(BTN.X) || pressed(BTN.RB) || pressed(BTN.RT)) punch();
    if (pressed(BTN.Y)) startDance();
    if (pressed(BTN.MENU)) showPauseScreen();
  }

  Pad.prev = gp.buttons.map((b) => b.pressed);
}

// In a shop: move between items, A to take one, B to leave
function shopWithPad(pressed, lx, ly) {
  if (document.getElementById("shop").classList.contains("hidden")) return; // still fading in
  if (pressed(BTN.B)) { leaveShop(null); return; }
  if (pressed(BTN.A)) {
    if (shopSelected && isUnlocked(shopSelected)) leaveShop(shopSelected);
    else Sfx.hurt(); // locked: a little "nope"
    return;
  }
  // How many outfits fit across one row of the menu?
  const items = [...document.querySelectorAll("#shop-items .outfit")];
  if (!items.length || !shopSelected) return;
  const cols = items.filter((el) => el.offsetTop === items[0].offsetTop).length || 1;

  let move = 0;
  if (pressed(BTN.LEFT)) move = -1;
  if (pressed(BTN.RIGHT)) move = 1;
  if (pressed(BTN.UP)) move = -cols;
  if (pressed(BTN.DOWN)) move = cols;
  if (!move && Pad.navCooldown === 0) {
    if (lx < -0.5) move = -1; else if (lx > 0.5) move = 1;
    else if (ly < -0.5) move = -cols; else if (ly > 0.5) move = cols;
    if (move) Pad.navCooldown = 0.22;
  }
  if (move) {
    const items = currentShop.items;
    const i = items.indexOf(shopSelected);
    const next = Math.max(0, Math.min(items.length - 1, i + move));
    if (next !== i) {
      selectOutfit(items[next]);
      Sfx.babble(false);
      const el = document.querySelectorAll("#shop-items .outfit")[next];
      if (el) el.scrollIntoView({ block: "nearest" });
    }
  }
}
