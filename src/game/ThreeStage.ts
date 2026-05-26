import * as THREE from "three";

export class ThreeStage {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(38, 1, 0.1, 20);
  private readonly coin = new THREE.Group();
  private frameId = 0;

  constructor(private readonly root: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.root.appendChild(this.renderer.domElement);

    this.camera.position.set(0, 0, 5);
    this.scene.add(new THREE.AmbientLight(0xfff2cc, 1.4));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.1);
    keyLight.position.set(2.4, 2.2, 4);
    this.scene.add(keyLight);

    this.buildCoin();
    this.scene.add(this.coin);
    this.resize();
    window.addEventListener("resize", this.resize);
    this.animate();
  }

  destroy(): void {
    cancelAnimationFrame(this.frameId);
    window.removeEventListener("resize", this.resize);
    this.renderer.dispose();
    this.root.replaceChildren();
  }

  private buildCoin(): void {
    const coinMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd34f,
      metalness: 0.18,
      roughness: 0.38
    });
    const rimMaterial = new THREE.MeshStandardMaterial({
      color: 0x9d6b24,
      metalness: 0.2,
      roughness: 0.45
    });
    const face = new THREE.Mesh(new THREE.CylinderGeometry(0.76, 0.76, 0.14, 48), coinMaterial);
    face.rotation.x = Math.PI / 2;
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.77, 0.035, 10, 48), rimMaterial);
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 16), coinMaterial);
    core.scale.set(1, 1, 0.2);
    this.coin.add(face, rim, core);
  }

  private readonly resize = (): void => {
    const width = Math.max(1, this.root.clientWidth);
    const height = Math.max(1, this.root.clientHeight);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  };

  private readonly animate = (): void => {
    const seconds = performance.now() / 1000;
    this.coin.rotation.y = Math.sin(seconds * 1.7) * 0.65;
    this.coin.rotation.z = seconds * 0.35;
    this.coin.position.y = Math.sin(seconds * 2.2) * 0.08;
    this.renderer.render(this.scene, this.camera);
    this.frameId = requestAnimationFrame(this.animate);
  };
}
