// ============================================================
// player.js — Rae Rabbit: controls, hopping and collision
// ============================================================
// Rae is treated as an invisible box (a "collider") standing on the floor.
// The camera sits at Rae's eye height, so you see through her eyes.

class Player {
  constructor(camera) {
    this.camera = camera;

    // ---- Tweakable numbers (feel free to play with these!) ----
    this.speed = 3.2;        // walking speed (metres per second)
    this.hopPower = 6.2;     // how hard a hop launches upward (about 1.2 m high)
    this.gravity = 16;       // how fast Rae falls back down
    this.superBounce = 6.8;  // pressing Space as you land on something bouncy
    this.radius = 0.22;      // half the width of Rae's collision box
    this.height = 0.45;      // height of Rae's collision box
    this.eyeHeight = 0.38;   // where the camera sits (rabbits are low!)
    this.mouseSensitivity = 0.0022;

    // ---- State ----
    this.spawn = new THREE.Vector3(-2.6, 0, 3.2); // just inside the bedroom door
    this.pos = this.spawn.clone(); // position of Rae's FEET
    this.vel = new THREE.Vector3();
    this.yaw = 0;    // looking left/right
    this.pitch = 0;  // looking up/down
    this.onGround = false;
    this.coyoteTime = 0;   // tiny grace period to hop just after leaving a ledge
    this.hopQueued = 0;    // remembers a Space press for a split second
    this.bobTime = 0;
    this.keys = {};
  }

  // Listen for keyboard and mouse
  attachInput(canvas) {
    window.addEventListener("keydown", (e) => {
      this.keys[e.code] = true;
      if (e.code === "Space") {
        if (!e.repeat) this.hopQueued = 0.15;
        e.preventDefault();
      }
    });
    window.addEventListener("keyup", (e) => { this.keys[e.code] = false; });
    window.addEventListener("blur", () => { this.keys = {}; });

    // Normally the mouse is "captured" (pointer lock) and moving it turns Rae's head.
    // Some browsers/previews don't allow that, so as a backup you can also
    // hold the mouse button down and drag to look around.
    this.dragging = false;
    canvas.addEventListener("mousedown", () => { this.dragging = true; });
    window.addEventListener("mouseup", () => { this.dragging = false; });

    document.addEventListener("mousemove", (e) => {
      const locked = document.pointerLockElement === canvas;
      if (!locked && !this.dragging) return;
      this.yaw -= e.movementX * this.mouseSensitivity;
      this.pitch -= e.movementY * this.mouseSensitivity;
      const limit = Math.PI / 2 - 0.05;
      this.pitch = Math.max(-limit, Math.min(limit, this.pitch));
    });
  }

  // Rae's collision box at a given position
  boxAt(pos) {
    return {
      minX: pos.x - this.radius, maxX: pos.x + this.radius,
      minY: pos.y,               maxY: pos.y + this.height,
      minZ: pos.z - this.radius, maxZ: pos.z + this.radius,
    };
  }

  overlaps(a, b) {
    return a.minX < b.max.x && a.maxX > b.min.x &&
           a.minY < b.max.y && a.maxY > b.min.y &&
           a.minZ < b.max.z && a.maxZ > b.min.z;
  }

  update(dt, world) {
    // ---- 1. Which way do the keys say to go? ----
    let forward = 0, right = 0;
    if (this.keys.KeyW || this.keys.ArrowUp) forward += 1;
    if (this.keys.KeyS || this.keys.ArrowDown) forward -= 1;
    if (this.keys.KeyD || this.keys.ArrowRight) right += 1;
    if (this.keys.KeyA || this.keys.ArrowLeft) right -= 1;

    // Turn that into a direction based on where we're looking
    const sin = Math.sin(this.yaw), cos = Math.cos(this.yaw);
    let dx = -sin * forward + cos * right;
    let dz = -cos * forward - sin * right;
    const len = Math.hypot(dx, dz);
    if (len > 0) { dx /= len; dz /= len; }
    this.vel.x = dx * this.speed;
    this.vel.z = dz * this.speed;

    // ---- 2. Hopping and gravity ----
    this.hopQueued = Math.max(0, this.hopQueued - dt);
    this.coyoteTime = this.onGround ? 0.1 : Math.max(0, this.coyoteTime - dt);
    if (this.hopQueued > 0 && this.coyoteTime > 0) {
      this.vel.y = this.hopPower;
      this.hopQueued = 0;
      this.coyoteTime = 0;
      Sfx.boing();
    }
    this.vel.y -= this.gravity * dt;

    // ---- 3. Move one axis at a time, pushing out of anything solid ----
    const solids = world.solids();
    const eps = 0.0001;

    this.pos.x += this.vel.x * dt;
    for (const s of solids) {
      if (this.overlaps(this.boxAt(this.pos), s.box)) {
        this.pos.x = this.vel.x > 0 ? s.box.min.x - this.radius - eps : s.box.max.x + this.radius + eps;
      }
    }

    this.pos.z += this.vel.z * dt;
    for (const s of solids) {
      if (this.overlaps(this.boxAt(this.pos), s.box)) {
        this.pos.z = this.vel.z > 0 ? s.box.min.z - this.radius - eps : s.box.max.z + this.radius + eps;
      }
    }

    this.onGround = false;
    let landedOn = null;
    this.pos.y += this.vel.y * dt;
    for (const s of solids) {
      if (this.overlaps(this.boxAt(this.pos), s.box)) {
        if (this.vel.y <= 0) {
          this.pos.y = s.box.max.y; // landed on top of it
          this.onGround = true;
          landedOn = s;
        } else {
          this.pos.y = s.box.min.y - this.height - eps; // bonked head
        }
        this.vel.y = 0;
      }
    }

    // Landed on something bouncy (like the bed)? Spring back up!
    // Press Space just as you land for an extra-big bounce.
    if (landedOn && landedOn.bouncy) {
      this.vel.y = this.hopQueued > 0 ? this.superBounce : landedOn.bouncePower;
      this.hopQueued = 0;
      this.onGround = false;
      Sfx.spring();
      if (this.onBounce) this.onBounce(landedOn);
    }

    // Safety net: if Rae ever somehow falls out of the world, put her back
    if (this.pos.y < -10) {
      this.pos.copy(this.spawn);
      this.vel.set(0, 0, 0);
    }

    // ---- 4. Put the camera at Rae's eyes, with a gentle hop-bob ----
    const moving = len > 0 && this.onGround;
    this.bobTime = moving ? this.bobTime + dt * 9 : 0;
    const bob = Math.abs(Math.sin(this.bobTime)) * 0.03;
    this.camera.position.set(this.pos.x, this.pos.y + this.eyeHeight + bob, this.pos.z);
    this.camera.rotation.set(this.pitch, this.yaw, 0, "YXZ");
  }

  // The centre of Rae's body (used to check if she touches things)
  center() {
    return new THREE.Vector3(this.pos.x, this.pos.y + this.height / 2, this.pos.z);
  }
}
