// ============================================================
// mirror.js — a real reflecting mirror
// ============================================================
// How it works: every frame the mirror is on screen, a second "mirror camera"
// is placed where your eye would be if it were reflected through the glass.
// It photographs the room into a texture, and the mirror's surface shows
// that photo, lined up so it looks like a reflection.
// The mirror camera can also see "layer 1", which is where Rae's body lives,
// so she appears in mirrors even though you can't see her body directly.

// Mirror quality (a setting on the menu):
//   "high": sharp reflections, updated every frame
//   "low":  blurry little reflections, updated every 3rd frame
//   "off":  no reflections: mirrors become plain glazed glass (fastest)
// Either way, mirrors don't redraw each other, and far-away mirrors keep their last photo.
class Mirror extends THREE.Mesh {
  static quality = "high";
  static all = [];     // every mirror in the house
  static frame = 0;    // counts frames (main.js), so "low" mirrors can take turns
  static busy = false; // true while a mirror is taking its photo
  static FAR = 9;      // further away than this (metres), a mirror stops updating

  static setQuality(quality) {
    Mirror.quality = quality;
    for (const m of Mirror.all) m.makeTarget();
  }

  constructor(geometry, { resolution = 1024, tint = 0xf2f7ff, clipBias = 0.003 } = {}) {
    super(geometry);
    this.isMirror = true;
    this.baseResolution = resolution;
    this.index = Mirror.all.length;
    Mirror.all.push(this);

    const mirrorCamera = new THREE.PerspectiveCamera();
    mirrorCamera.layers.enable(LAYER_MIRROR_ONLY); // sees Rae's body
    const textureMatrix = new THREE.Matrix4();

    this.reflectMaterial = this.material = new THREE.ShaderMaterial({
      uniforms: {
        tint: { value: new THREE.Color(tint) },
        tDiffuse: { value: null },
        textureMatrix: { value: textureMatrix },
      },
      vertexShader: `
        uniform mat4 textureMatrix;
        varying vec4 vUv;
        void main() {
          vUv = textureMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `
        uniform vec3 tint;
        uniform sampler2D tDiffuse;
        varying vec4 vUv;
        void main() {
          vec4 base = texture2DProj(tDiffuse, vUv);
          gl_FragColor = vec4(base.rgb * tint, 1.0);
          #include <tonemapping_fragment>
          #include <encodings_fragment>
        }`,
    });

    // Scratch values reused every frame
    const plane = new THREE.Plane(), normal = new THREE.Vector3();
    const mirrorPos = new THREE.Vector3(), eyePos = new THREE.Vector3();
    const rotation = new THREE.Matrix4(), lookAt = new THREE.Vector3();
    const view = new THREE.Vector3(), target = new THREE.Vector3();
    const clipPlane = new THREE.Vector4(), q = new THREE.Vector4();

    this.makeTarget();

    this.onBeforeRender = (renderer, scene, camera) => {
      if (Mirror.quality === "off") return; // "Fastest": no reflections
      // "Low" quality: only re-take the photo every 3rd frame (mirrors take turns),
      // and never while another mirror is taking its photo. Otherwise keep the old one.
      if (Mirror.quality === "low" && this.hasPhoto && (Mirror.frame + this.index) % 3 !== 0) return;
      // Mirrors seen inside another mirror just show their last photo (redrawing the
      // whole house again for a reflection-in-a-reflection is very slow)
      if (Mirror.busy && this.hasPhoto) return;

      mirrorPos.setFromMatrixPosition(this.matrixWorld);
      eyePos.setFromMatrixPosition(camera.matrixWorld);
      // Far away? It's tiny on screen: keep the old photo
      if (this.hasPhoto && mirrorPos.distanceTo(eyePos) > Mirror.FAR) return;
      rotation.extractRotation(this.matrixWorld);
      normal.set(0, 0, 1).applyMatrix4(rotation);

      // Looking at the back of the mirror? Nothing to do.
      view.subVectors(mirrorPos, eyePos);
      if (view.dot(normal) > 0) return;

      // Reflect the eye position and the point it looks at through the mirror
      view.reflect(normal).negate().add(mirrorPos);
      rotation.extractRotation(camera.matrixWorld);
      lookAt.set(0, 0, -1).applyMatrix4(rotation).add(eyePos);
      target.subVectors(mirrorPos, lookAt).reflect(normal).negate().add(mirrorPos);

      mirrorCamera.position.copy(view);
      mirrorCamera.up.set(0, 1, 0).applyMatrix4(rotation).reflect(normal);
      mirrorCamera.lookAt(target);
      mirrorCamera.far = camera.far;
      mirrorCamera.updateMatrixWorld();
      mirrorCamera.projectionMatrix.copy(camera.projectionMatrix);

      // Matrix that maps the mirror's surface onto the photo
      textureMatrix.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1);
      textureMatrix.multiply(mirrorCamera.projectionMatrix);
      textureMatrix.multiply(mirrorCamera.matrixWorldInverse);
      textureMatrix.multiply(this.matrixWorld);

      // Don't photograph anything BEHIND the mirror (e.g. the corridor through the wall)
      plane.setFromNormalAndCoplanarPoint(normal, mirrorPos);
      plane.applyMatrix4(mirrorCamera.matrixWorldInverse);
      clipPlane.set(plane.normal.x, plane.normal.y, plane.normal.z, plane.constant);
      const pm = mirrorCamera.projectionMatrix.elements;
      q.x = (Math.sign(clipPlane.x) + pm[8]) / pm[0];
      q.y = (Math.sign(clipPlane.y) + pm[9]) / pm[5];
      q.z = -1.0;
      q.w = (1.0 + pm[10]) / pm[14];
      clipPlane.multiplyScalar(2.0 / clipPlane.dot(q));
      pm[2] = clipPlane.x;
      pm[6] = clipPlane.y;
      pm[10] = clipPlane.z + 1.0 - clipBias;
      pm[14] = clipPlane.w;

      // Take the photo (with the mirror itself hidden)
      this.visible = false;
      const wasBusy = Mirror.busy;
      Mirror.busy = true;
      const previousTarget = renderer.getRenderTarget();
      renderer.setRenderTarget(this.renderTarget);
      renderer.state.buffers.depth.setMask(true);
      if (renderer.autoClear === false) renderer.clear();
      // Everything's already been positioned for this frame: don't work it all out again
      const auto = scene.matrixWorldAutoUpdate;
      scene.matrixWorldAutoUpdate = false;
      renderer.render(scene, mirrorCamera);
      scene.matrixWorldAutoUpdate = auto;
      renderer.setRenderTarget(previousTarget);
      Mirror.busy = wasBusy;
      this.visible = true;
      this.hasPhoto = true;
    };
  }

  // (Re)make the texture the mirror's photo is drawn into, at the current quality
  makeTarget() {
    if (this.renderTarget) { this.renderTarget.dispose(); this.renderTarget = null; }
    this.hasPhoto = false;
    // "Fastest": no reflection at all, just a glazed glassy surface
    if (Mirror.quality === "off") { this.material = Mirror.glaze(); return; }
    this.material = this.reflectMaterial;
    const low = Mirror.quality === "low";
    const size = low ? 160 : Math.min(this.baseResolution, 768);
    this.renderTarget = new THREE.WebGLRenderTarget(size, size, { samples: low ? 0 : 2 });
    this.material.uniforms.tDiffuse.value = this.renderTarget.texture;
  }

  // The glazed look for "Fastest" (made once, shared by every mirror): pale blue-grey glass
  // with a soft sheen and two diagonal streaks of light. No lighting maths: very cheap.
  static glaze() {
    if (!Mirror.glazeMaterial) {
      const c = document.createElement("canvas");
      c.width = c.height = 128;
      const x = c.getContext("2d");
      const g = x.createLinearGradient(0, 0, 128, 128);
      g.addColorStop(0, "#e9f1f7");
      g.addColorStop(0.55, "#c5d3df");
      g.addColorStop(1, "#aebfce");
      x.fillStyle = g;
      x.fillRect(0, 0, 128, 128);
      x.fillStyle = "rgba(255, 255, 255, 0.55)";
      for (const [at, width] of [[34, 16], [62, 7]]) {
        x.beginPath();
        x.moveTo(at, 0); x.lineTo(at + width, 0); x.lineTo(at + width - 60, 128); x.lineTo(at - 60, 128);
        x.fill();
      }
      const tex = new THREE.CanvasTexture(c);
      tex.encoding = THREE.sRGBEncoding;
      Mirror.glazeMaterial = new THREE.MeshBasicMaterial({ map: tex });
    }
    return Mirror.glazeMaterial;
  }
}
