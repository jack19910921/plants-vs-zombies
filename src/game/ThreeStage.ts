import * as THREE from "three";

export class ThreeStage {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(38, 1, 0.1, 20);
  private readonly coin = new THREE.Group();
  private readonly burst = new THREE.Group();
  private readonly waveRing = new THREE.Group();
  private readonly statusBadge = new THREE.Group();
  private readonly statusBadgeMaterials: THREE.MeshStandardMaterial[] = [];
  private frameId = 0;
  private sunPulseStartedAt = -Infinity;
  private wavePulseStartedAt = -Infinity;
  private statusPulseStartedAt = -Infinity;
  private statusBadgeMode: "victory" | "failure" | null = null;

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
    this.buildBurst();
    this.scene.add(this.burst);
    this.buildWaveRing();
    this.scene.add(this.waveRing);
    this.buildStatusBadge();
    this.scene.add(this.statusBadge);
    this.resize();
    window.addEventListener("resize", this.resize);
    this.animate();
  }

  pulseSunCollection(): void {
    this.sunPulseStartedAt = performance.now();
  }

  pulseWaveAlert(): void {
    this.wavePulseStartedAt = performance.now();
  }

  showLevelBadge(status: "victory" | "failure"): void {
    this.statusBadgeMode = status;
    this.statusPulseStartedAt = performance.now();
    this.applyStatusBadgeColors(status);
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

  private buildBurst(): void {
    const sparkleMaterial = new THREE.MeshStandardMaterial({
      color: 0xfff1a3,
      emissive: 0xffc547,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0
    });
    for (let index = 0; index < 10; index += 1) {
      const sparkle = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 8), sparkleMaterial.clone());
      sparkle.userData.angle = (Math.PI * 2 * index) / 10;
      sparkle.userData.speed = 0.7 + (index % 3) * 0.12;
      this.burst.add(sparkle);
    }
    this.burst.visible = false;
  }

  private buildWaveRing(): void {
    const material = new THREE.MeshStandardMaterial({
      color: 0xff8f4d,
      emissive: 0xff5f4f,
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0
    });
    const outer = new THREE.Mesh(new THREE.TorusGeometry(0.92, 0.035, 10, 64), material);
    const inner = new THREE.Mesh(new THREE.TorusGeometry(0.64, 0.02, 8, 48), material.clone());
    this.waveRing.add(outer, inner);
    this.waveRing.visible = false;
  }

  private buildStatusBadge(): void {
    const faceMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd34f,
      metalness: 0.16,
      roughness: 0.36,
      transparent: true,
      opacity: 0
    });
    const rimMaterial = new THREE.MeshStandardMaterial({
      color: 0x8f6a24,
      metalness: 0.22,
      roughness: 0.42,
      transparent: true,
      opacity: 0
    });
    const markMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfff1a3,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0
    });
    const face = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.12, 42), faceMaterial);
    face.rotation.x = Math.PI / 2;
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.47, 0.04, 10, 42), rimMaterial);
    const mark = new THREE.Mesh(this.createStarGeometry(), markMaterial);
    mark.position.z = 0.08;
    mark.scale.setScalar(0.22);
    this.statusBadge.position.set(1.08, -0.88, 0);
    this.statusBadge.add(face, rim, mark);
    this.statusBadge.visible = false;
    this.statusBadgeMaterials.push(faceMaterial, rimMaterial, markMaterial);
  }

  private createStarGeometry(): THREE.ShapeGeometry {
    const shape = new THREE.Shape();
    for (let point = 0; point < 10; point += 1) {
      const radius = point % 2 === 0 ? 1 : 0.44;
      const angle = -Math.PI / 2 + (point * Math.PI) / 5;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (point === 0) {
        shape.moveTo(x, y);
      } else {
        shape.lineTo(x, y);
      }
    }
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
  }

  private readonly resize = (): void => {
    const width = Math.max(1, this.root.clientWidth);
    const height = Math.max(1, this.root.clientHeight);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  };

  private readonly animate = (): void => {
    const now = performance.now();
    const seconds = now / 1000;
    const pulseAge = (now - this.sunPulseStartedAt) / 620;
    const pulse = pulseAge >= 0 && pulseAge <= 1 ? 1 - pulseAge : 0;
    const pulseEase = pulse * pulse;
    this.coin.rotation.y = Math.sin(seconds * 1.7) * 0.65;
    this.coin.rotation.z = seconds * 0.35 + pulseEase * 0.45;
    this.coin.position.y = Math.sin(seconds * 2.2) * 0.08 + pulseEase * 0.1;
    this.coin.scale.setScalar(1 + pulseEase * 0.24);
    this.animateBurst(pulseAge);
    this.animateWaveRing(now);
    this.animateStatusBadge(now);
    this.renderer.render(this.scene, this.camera);
    this.frameId = requestAnimationFrame(this.animate);
  };

  private animateBurst(pulseAge: number): void {
    this.burst.visible = pulseAge >= 0 && pulseAge <= 1;
    if (!this.burst.visible) return;
    const opacity = Math.max(0, 1 - pulseAge);
    this.burst.children.forEach((child) => {
      const sparkle = child as THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial>;
      const angle = sparkle.userData.angle as number;
      const speed = sparkle.userData.speed as number;
      const radius = 0.34 + pulseAge * speed;
      sparkle.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, Math.sin(angle * 2) * 0.08);
      sparkle.scale.setScalar(1 + pulseAge * 1.6);
      sparkle.material.opacity = opacity;
    });
  }

  private animateWaveRing(now: number): void {
    const age = (now - this.wavePulseStartedAt) / 820;
    this.waveRing.visible = age >= 0 && age <= 1;
    if (!this.waveRing.visible) return;
    const opacity = Math.max(0, 1 - age);
    this.waveRing.rotation.z = age * Math.PI * 1.8;
    this.waveRing.scale.setScalar(1 + age * 0.42);
    this.waveRing.children.forEach((child) => {
      const ring = child as THREE.Mesh<THREE.TorusGeometry, THREE.MeshStandardMaterial>;
      ring.material.opacity = opacity * 0.85;
    });
  }

  private animateStatusBadge(now: number): void {
    const age = (now - this.statusPulseStartedAt) / 900;
    this.statusBadge.visible = this.statusBadgeMode !== null && age >= 0 && age <= 5;
    if (!this.statusBadge.visible) return;
    const intro = Math.min(1, Math.max(0, age));
    const alpha = age > 4 ? Math.max(0, 5 - age) : 1;
    this.statusBadge.rotation.y = Math.sin(now / 480) * 0.5;
    this.statusBadge.rotation.z = now / 900;
    this.statusBadge.position.y = -0.88 + Math.sin(now / 260) * 0.04;
    this.statusBadge.scale.setScalar(0.3 + intro * 0.7);
    this.statusBadgeMaterials.forEach((material) => {
      material.opacity = alpha;
    });
  }

  private applyStatusBadgeColors(status: "victory" | "failure"): void {
    const [face, rim, mark] = this.statusBadgeMaterials;
    if (status === "victory") {
      face.color.setHex(0xffd34f);
      face.emissive.setHex(0x332000);
      rim.color.setHex(0x8f6a24);
      mark.color.setHex(0xffffff);
      mark.emissive.setHex(0xfff1a3);
      return;
    }
    face.color.setHex(0xf45f4f);
    face.emissive.setHex(0x3d0f0b);
    rim.color.setHex(0x7b2d25);
    mark.color.setHex(0xfff8df);
    mark.emissive.setHex(0xff8f4d);
  }
}
