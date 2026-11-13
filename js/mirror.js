// ============================================================
// mirror.js — a real reflecting mirror
// ============================================================
// How it works: every frame the mirror is on screen, a second "mirror camera"
// is placed where your eye would be if it were reflected through the glass.
// It photographs the room into a texture, and the mirror's surface shows
// that photo, lined up so it looks like a reflection.
// The mirror camera can also see "layer 1", which is where Rae's body lives,
// so she appears in mirrors even though you can't see her body directly.

class Mirror extends THREE.Mesh {
  constructor(geometry, { resolution = 1024, tint = 0xf2f7ff, clipBias = 0.003 } = {}) {
    super(geometry);
    this.isMirror = true;

    const mirrorCamera = new THREE.PerspectiveCamera();
    mirrorCamera.layers.enable(LAYER_MIRROR_ONLY); // sees Rae's body
    const renderTarget = new THREE.WebGLRenderTarget(resolution, resolution, { samples: 4 });
    const textureMatrix = new THREE.Matrix4();

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        tint: { value: new THREE.Color(tint) },
        tDiffuse: { value: renderTarget.texture },
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

    this.onBeforeRender = (renderer, scene, camera) => {
      mirrorPos.setFromMatrixPosition(this.matrixWorld);
      eyePos.setFromMatrixPosition(camera.matrixWorld);
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
      const previousTarget = renderer.getRenderTarget();
      renderer.setRenderTarget(renderTarget);
      renderer.state.buffers.depth.setMask(true);
      if (renderer.autoClear === false) renderer.clear();
      renderer.render(scene, mirrorCamera);
      renderer.setRenderTarget(previousTarget);
      this.visible = true;
    };
  }
}
