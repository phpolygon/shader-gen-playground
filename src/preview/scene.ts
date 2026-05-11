import * as THREE from "three";

export interface PreviewHandle {
  start: () => void;
  stop: () => void;
  setShader: (
    vertex: string,
    fragment: string,
    uniforms: Record<string, { value: unknown }>,
  ) => void;
  updateUniforms: (next: Record<string, { value: unknown }>) => void;
  dispose: () => void;
}

const PLACEHOLDER_VERTEX = /* glsl */ `
  varying vec3 vNormalW;
  varying vec3 vViewDir;
  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vViewDir = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const PLACEHOLDER_FRAGMENT = /* glsl */ `
  varying vec3 vNormalW;
  varying vec3 vViewDir;
  void main() {
    float ndv = clamp(dot(normalize(vNormalW), normalize(vViewDir)), 0.0, 1.0);
    vec3 col = mix(vec3(0.08, 0.10, 0.13), vec3(0.43, 0.94, 0.78), ndv);
    gl_FragColor = vec4(col, 1.0);
  }
`;

export function createPreview(canvas: HTMLCanvasElement): PreviewHandle {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0, 3.2);
  camera.lookAt(0, 0, 0);

  const geometry = new THREE.SphereGeometry(1, 96, 64);
  const material = new THREE.ShaderMaterial({
    vertexShader: PLACEHOLDER_VERTEX,
    fragmentShader: PLACEHOLDER_FRAGMENT,
    uniforms: {},
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  let raf = 0;
  let running = false;
  let lastT = performance.now();

  const resize = () => {
    const { clientWidth, clientHeight } = canvas;
    if (clientWidth === 0 || clientHeight === 0) return;
    renderer.setSize(clientWidth, clientHeight, false);
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
  };

  const tick = (t: number) => {
    if (!running) return;
    const dt = (t - lastT) / 1000;
    lastT = t;
    mesh.rotation.y += dt * 0.4;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  };

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  return {
    start() {
      if (running) return;
      running = true;
      lastT = performance.now();
      resize();
      raf = requestAnimationFrame(tick);
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
    },
    setShader(vertex, fragment, uniforms) {
      material.vertexShader = vertex;
      material.fragmentShader = fragment;
      material.uniforms = uniforms as THREE.ShaderMaterial["uniforms"];
      material.needsUpdate = true;
    },
    updateUniforms(next) {
      for (const key of Object.keys(next)) {
        const slot = material.uniforms[key];
        if (slot) slot.value = next[key]!.value;
      }
    },
    dispose() {
      this.stop();
      ro.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    },
  };
}
