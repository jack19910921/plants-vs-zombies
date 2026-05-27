import * as THREE from "three";
import {
  getGardenToolState,
  getPotatoMineShockwaveState,
  getSeedPacketFlipState,
  getSunTrailParticleState,
  getWaveWarningStakeState,
  type SeedPacketFlipMode
} from "./threePresentation";

export class ThreeStage {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(38, 1, 0.1, 20);
  private readonly coin = new THREE.Group();
  private readonly burst = new THREE.Group();
  private readonly sunTrail = new THREE.Group();
  private readonly waveRing = new THREE.Group();
  private readonly potatoMineShockwave = new THREE.Group();
  private readonly statusBadge = new THREE.Group();
  private readonly seedPacket = new THREE.Group();
  private readonly gardenTool = new THREE.Group();
  private readonly waveWarningStake = new THREE.Group();
  private readonly statusBadgeMaterials: THREE.MeshStandardMaterial[] = [];
  private readonly seedPacketMaterials: THREE.MeshStandardMaterial[] = [];
  private seedPacketShine?: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>;
  private readonly potatoMineShockwaveMaterials: THREE.MeshStandardMaterial[] = [];
  private readonly waveWarningStakeMaterials: THREE.MeshStandardMaterial[] = [];
  private frameId = 0;
  private sunPulseStartedAt = -Infinity;
  private wavePulseStartedAt = -Infinity;
  private potatoMineShockwaveStartedAt = -Infinity;
  private statusPulseStartedAt = -Infinity;
  private seedPacketStartedAt = -Infinity;
  private gardenToolPulseStartedAt = -Infinity;
  private seedPacketMode: SeedPacketFlipMode = "select";
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
    this.buildSunTrail();
    this.scene.add(this.sunTrail);
    this.buildWaveRing();
    this.scene.add(this.waveRing);
    this.buildPotatoMineShockwave();
    this.scene.add(this.potatoMineShockwave);
    this.buildWaveWarningStake();
    this.scene.add(this.waveWarningStake);
    this.buildStatusBadge();
    this.scene.add(this.statusBadge);
    this.buildGardenTool();
    this.scene.add(this.gardenTool);
    this.buildSeedPacket();
    this.scene.add(this.seedPacket);
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

  pulsePotatoMineExplosion(): void {
    this.potatoMineShockwaveStartedAt = performance.now();
  }

  showLevelBadge(status: "victory" | "failure"): void {
    this.statusBadgeMode = status;
    this.statusPulseStartedAt = performance.now();
    this.applyStatusBadgeColors(status);
  }

  flipSeedPacket(mode: SeedPacketFlipMode): void {
    this.seedPacketMode = mode;
    this.seedPacketStartedAt = performance.now();
    this.applySeedPacketColors(mode);
  }

  swingGardenTool(): void {
    this.gardenToolPulseStartedAt = performance.now();
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

  private buildSunTrail(): void {
    const beadGeometry = new THREE.SphereGeometry(0.07, 16, 10);
    for (let index = 0; index < 6; index += 1) {
      const material = new THREE.MeshStandardMaterial({
        color: index % 2 === 0 ? 0xfff1a3 : 0xffd34f,
        emissive: 0xffc547,
        emissiveIntensity: 0.7,
        metalness: 0.12,
        roughness: 0.28,
        transparent: true,
        opacity: 0
      });
      const bead = new THREE.Mesh(beadGeometry, material);
      this.sunTrail.add(bead);
    }
    this.sunTrail.visible = false;
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

  private buildPotatoMineShockwave(): void {
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd34f,
      emissive: 0xff8f4d,
      emissiveIntensity: 0.78,
      roughness: 0.4,
      transparent: true,
      opacity: 0
    });
    const flashMaterial = new THREE.MeshStandardMaterial({
      color: 0xfff1a3,
      emissive: 0xffc547,
      emissiveIntensity: 0.95,
      roughness: 0.32,
      transparent: true,
      opacity: 0
    });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.026, 8, 48), ringMaterial);
    const flash = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 12), flashMaterial);
    flash.scale.set(1.6, 0.44, 0.12);
    flash.position.z = -0.02;
    this.potatoMineShockwave.add(ring, flash);
    this.potatoMineShockwaveMaterials.push(ringMaterial, flashMaterial);

    const debrisGeometry = new THREE.BoxGeometry(0.075, 0.045, 0.04);
    for (let index = 0; index < 8; index += 1) {
      const debrisMaterial = new THREE.MeshStandardMaterial({
        color: index % 2 === 0 ? 0x8f5d32 : 0x6d4b2b,
        roughness: 0.68,
        metalness: 0.02,
        transparent: true,
        opacity: 0
      });
      const debris = new THREE.Mesh(debrisGeometry, debrisMaterial);
      debris.userData.debrisIndex = index;
      this.potatoMineShockwave.add(debris);
      this.potatoMineShockwaveMaterials.push(debrisMaterial);
    }

    this.potatoMineShockwave.position.set(-0.54, -0.52, 0.12);
    this.potatoMineShockwave.visible = false;
  }

  private buildWaveWarningStake(): void {
    const postMaterial = new THREE.MeshStandardMaterial({
      color: 0x8f5d32,
      roughness: 0.58,
      transparent: true,
      opacity: 0
    });
    const flagMaterial = new THREE.MeshStandardMaterial({
      color: 0xf45f4f,
      emissive: 0x3d0f0b,
      emissiveIntensity: 0.35,
      roughness: 0.46,
      transparent: true,
      opacity: 0
    });
    const capMaterial = new THREE.MeshStandardMaterial({
      color: 0xfff1a3,
      emissive: 0xff8f4d,
      emissiveIntensity: 0.35,
      roughness: 0.36,
      transparent: true,
      opacity: 0
    });
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.62, 12), postMaterial);
    post.position.y = -0.07;
    const flag = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.2, 0.035), flagMaterial);
    flag.position.set(0.18, 0.16, 0);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.065, 14, 10), capMaterial);
    cap.position.y = 0.28;
    this.waveWarningStake.position.set(-1.06, 0.4, 0.08);
    this.waveWarningStake.add(post, flag, cap);
    this.waveWarningStake.visible = false;
    this.waveWarningStakeMaterials.push(postMaterial, flagMaterial, capMaterial);
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

  private buildSeedPacket(): void {
    const packetMaterial = new THREE.MeshStandardMaterial({
      color: 0x65b86b,
      roughness: 0.48,
      transparent: true,
      opacity: 0
    });
    const rimMaterial = new THREE.MeshStandardMaterial({
      color: 0x35513f,
      roughness: 0.42,
      transparent: true,
      opacity: 0
    });
    const labelMaterial = new THREE.MeshStandardMaterial({
      color: 0xfff8df,
      roughness: 0.5,
      transparent: true,
      opacity: 0
    });
    const seedMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd34f,
      emissive: 0x332000,
      emissiveIntensity: 0.4,
      roughness: 0.36,
      transparent: true,
      opacity: 0
    });
    const shineMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfff8df,
      emissiveIntensity: 0.9,
      roughness: 0.24,
      transparent: true,
      opacity: 0
    });
    const packet = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.72, 0.08), packetMaterial);
    const rim = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.76, 0.045), rimMaterial);
    rim.position.z = -0.035;
    const label = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.18, 0.09), labelMaterial);
    label.position.set(0, 0.08, 0.055);
    const seed = new THREE.Mesh(new THREE.SphereGeometry(0.08, 18, 12), seedMaterial);
    seed.scale.set(1, 0.72, 0.24);
    seed.position.set(0, -0.16, 0.08);
    this.seedPacketShine = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.84, 0.018), shineMaterial);
    this.seedPacketShine.position.z = 0.11;
    this.seedPacketShine.visible = false;
    this.seedPacket.position.set(1.1, 0.58, 0);
    this.seedPacket.add(rim, packet, label, seed, this.seedPacketShine);
    this.seedPacket.visible = false;
    this.seedPacketMaterials.push(packetMaterial, rimMaterial, labelMaterial, seedMaterial);
  }

  private buildGardenTool(): void {
    const handleMaterial = new THREE.MeshStandardMaterial({
      color: 0x8f5d32,
      roughness: 0.62,
      metalness: 0.08
    });
    const ferruleMaterial = new THREE.MeshStandardMaterial({
      color: 0xc7d2d6,
      roughness: 0.32,
      metalness: 0.45
    });
    const bladeMaterial = new THREE.MeshStandardMaterial({
      color: 0x9fb2b7,
      roughness: 0.38,
      metalness: 0.5
    });
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.92, 18), handleMaterial);
    handle.rotation.z = Math.PI / 2;
    handle.position.x = -0.18;
    const grip = new THREE.Mesh(new THREE.SphereGeometry(0.09, 18, 12), handleMaterial);
    grip.scale.set(1, 0.8, 0.72);
    grip.position.x = -0.66;
    const ferrule = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.18, 18), ferruleMaterial);
    ferrule.rotation.z = Math.PI / 2;
    ferrule.position.x = 0.31;
    const blade = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.32, 8, 18), bladeMaterial);
    blade.scale.set(0.9, 1.2, 0.2);
    blade.rotation.z = -Math.PI / 2;
    blade.position.x = 0.58;
    this.gardenTool.position.set(0.45, -0.28, -0.08);
    this.gardenTool.rotation.z = -0.42;
    this.gardenTool.add(handle, grip, ferrule, blade);
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
    this.animateSunTrail(now);
    this.animateWaveRing(now);
    this.animatePotatoMineShockwave(now);
    this.animateWaveWarningStake(now);
    this.animateStatusBadge(now);
    this.animateGardenTool(now);
    this.animateSeedPacket(now);
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

  private animateSunTrail(now: number): void {
    const ageMs = now - this.sunPulseStartedAt;
    let hasVisibleParticle = false;

    this.sunTrail.children.forEach((child, index) => {
      const bead = child as THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial>;
      const state = getSunTrailParticleState(ageMs, index);
      bead.visible = state.visible;

      if (!state.visible) {
        bead.material.opacity = 0;
        return;
      }

      hasVisibleParticle = true;
      bead.position.set(state.x, state.y, state.z);
      bead.scale.setScalar(state.scale);
      bead.material.opacity = state.opacity;
    });

    this.sunTrail.visible = hasVisibleParticle;
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

  private animatePotatoMineShockwave(now: number): void {
    const ageMs = now - this.potatoMineShockwaveStartedAt;
    const ringState = getPotatoMineShockwaveState(ageMs, 0);
    let hasVisibleParticle = ringState.visible;
    this.potatoMineShockwave.visible = ringState.visible;
    if (!ringState.visible) {
      this.potatoMineShockwaveMaterials.forEach((material) => {
        material.opacity = 0;
      });
      return;
    }

    const [ring, flash, ...debris] = this.potatoMineShockwave.children as Array<
      THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>
    >;
    ring.rotation.z = ageMs / 260;
    ring.scale.setScalar(ringState.ringScale);
    ring.material.opacity = ringState.opacity * 0.78;
    flash.scale.set(1.3 + ringState.ringScale * 0.74, 0.32 + ringState.ringScale * 0.18, 0.12);
    flash.material.opacity = ringState.flashOpacity * 0.52;

    debris.forEach((chunk, index) => {
      const state = getPotatoMineShockwaveState(ageMs, index);
      chunk.visible = state.visible;
      if (!state.visible) {
        chunk.material.opacity = 0;
        return;
      }
      hasVisibleParticle = true;
      chunk.position.set(state.x, state.y, state.z);
      chunk.rotation.z = state.rotationZ;
      chunk.rotation.x = state.rotationZ * 0.35;
      chunk.scale.setScalar(state.scale);
      chunk.material.opacity = state.opacity;
    });

    this.potatoMineShockwave.visible = hasVisibleParticle;
  }

  private animateWaveWarningStake(now: number): void {
    const state = getWaveWarningStakeState(now - this.wavePulseStartedAt);
    this.waveWarningStake.visible = state.visible;
    if (!state.visible) return;
    this.waveWarningStake.position.y = 0.4 + state.y;
    this.waveWarningStake.rotation.z = state.rotationZ;
    this.waveWarningStake.scale.setScalar(state.scale);
    this.waveWarningStakeMaterials.forEach((material) => {
      material.opacity = state.opacity;
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

  private animateSeedPacket(now: number): void {
    const state = getSeedPacketFlipState(now - this.seedPacketStartedAt, this.seedPacketMode);
    this.seedPacket.visible = state.visible;
    if (!state.visible) return;
    this.seedPacket.position.y = 0.58 + state.y;
    this.seedPacket.rotation.y = state.rotationY;
    this.seedPacket.rotation.z = state.rotationZ;
    this.seedPacket.scale.setScalar(state.scale);
    this.seedPacketMaterials.forEach((material) => {
      material.opacity = state.opacity;
    });
    if (this.seedPacketShine) {
      this.seedPacketShine.visible = state.shineOpacity > 0.02;
      this.seedPacketShine.position.x = state.shineX;
      this.seedPacketShine.rotation.z = state.shineRotationZ;
      this.seedPacketShine.material.opacity = state.shineOpacity * state.opacity;
    }
  }

  private animateGardenTool(now: number): void {
    const state = getGardenToolState(now, this.gardenToolPulseStartedAt);
    this.gardenTool.visible = state.visible;
    this.gardenTool.position.y = state.y;
    this.gardenTool.rotation.z = state.rotationZ;
    this.gardenTool.rotation.y = state.rotationY;
    this.gardenTool.scale.setScalar(state.scale);
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

  private applySeedPacketColors(mode: SeedPacketFlipMode): void {
    const [packet, rim, label, seed] = this.seedPacketMaterials;
    if (mode === "plant") {
      packet.color.setHex(0xffd34f);
      rim.color.setHex(0x8f6a24);
      label.color.setHex(0xfff8df);
      seed.color.setHex(0x65b86b);
      return;
    }
    packet.color.setHex(0x65b86b);
    rim.color.setHex(0x35513f);
    label.color.setHex(0xfff8df);
    seed.color.setHex(0xffd34f);
  }
}
