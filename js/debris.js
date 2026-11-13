// ============================================================
// debris.js — the little pieces things shatter into
// ============================================================
// When a breakable Prop breaks, Debris.burst() throws out a handful of
// small low-poly shards in the object's own colours. They fly, tumble,
// bounce on whatever they land on, then shrink away after a few seconds.

class Debris {
  constructor(scene) {
    this.scene = scene;
    this.pieces = [];
    this.gravity = 14;
    this.lifetime = 3;  // seconds before a piece starts shrinking away
  }

  // Shatter a prop: pieces come from its position, coloured like its parts
  burst(prop) {
    const materials = [];
    prop.mesh.traverse((o) => { if (o.isMesh) materials.push(o.material); });
    if (materials.length === 0) return;

    const box = prop.box;
    const centre = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const pieceSize = Math.max(0.025, Math.max(size.x, size.y, size.z) * 0.16);
    const count = 10 + Math.floor(Math.random() * 5);

    for (let i = 0; i < count; i++) {
      const geo = Math.random() < 0.5
        ? new THREE.TetrahedronGeometry(pieceSize * (0.6 + Math.random() * 0.6))
        : new THREE.BoxGeometry(pieceSize, pieceSize * 0.7, pieceSize * 0.5);
      const mesh = new THREE.Mesh(geo, materials[i % materials.length]);
      mesh.position.set(
        centre.x + (Math.random() - 0.5) * size.x,
        centre.y + (Math.random() - 0.5) * size.y,
        centre.z + (Math.random() - 0.5) * size.z
      );
      mesh.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
      this.scene.add(mesh);

      const angle = Math.random() * Math.PI * 2;
      const outward = 0.8 + Math.random() * 1.6;
      this.pieces.push({
        mesh,
        vel: new THREE.Vector3(Math.cos(angle) * outward, 1.5 + Math.random() * 2.5, Math.sin(angle) * outward),
        spin: new THREE.Vector3(Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5),
        radius: pieceSize * 0.5,
        age: 0,
        resting: false,
      });
    }
  }

  update(dt, solids) {
    for (const p of this.pieces) {
      p.age += dt;

      if (!p.resting) {
        p.vel.y -= this.gravity * dt;
        const prevY = p.mesh.position.y;
        p.mesh.position.addScaledVector(p.vel, dt);
        p.mesh.rotation.x += p.spin.x * dt;
        p.mesh.rotation.y += p.spin.y * dt;
        p.mesh.rotation.z += p.spin.z * dt;

        // Land on top of anything solid (floor, tables, bed...)
        const pos = p.mesh.position;
        for (const s of solids) {
          const b = s.box;
          if (pos.x > b.min.x && pos.x < b.max.x && pos.z > b.min.z && pos.z < b.max.z &&
              pos.y - p.radius < b.max.y && prevY - p.radius >= b.max.y - 0.05 && p.vel.y < 0) {
            pos.y = b.max.y + p.radius;
            p.vel.y *= -0.3;            // small bounce
            p.vel.x *= 0.5; p.vel.z *= 0.5;
            p.spin.multiplyScalar(0.5);
            if (Math.abs(p.vel.y) < 0.4) { p.resting = true; }
          }
        }
        if (pos.y < -5) p.age = 999; // fell out of the world: tidy up
      }

      // Shrink away at the end of its life
      if (p.age > this.lifetime) {
        const s = Math.max(0, 1 - (p.age - this.lifetime) / 0.5);
        p.mesh.scale.setScalar(s);
      }
    }

    // Remove finished pieces
    this.pieces = this.pieces.filter((p) => {
      if (p.age > this.lifetime + 0.5) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        return false;
      }
      return true;
    });
  }
}
