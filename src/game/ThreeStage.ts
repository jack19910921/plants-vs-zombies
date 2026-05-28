import * as THREE from "three";
import { SUN_TOKEN_TEXTURE } from "./assets";
import {
  getGardenToolState,
  getPlantingSparkState,
  getPotatoMineShockwaveState,
  getSeedPacketFlipState,
  getStatusBadgeState,
  getSunTrailParticleState,
  getToyGardenPropProfiles,
  getWaveWarningStakeState,
  type SeedPacketFlipMode,
  type StatusBadgeMode,
  type ToyGardenMaterialFamily,
  type ToyGardenPropProfile
} from "./threePresentation";

export class ThreeStage {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(38, 1, 0.1, 20);
  private readonly toyGardenProps = new THREE.Group();
  private readonly coin = new THREE.Group();
  private readonly burst = new THREE.Group();
  private readonly sunTrail = new THREE.Group();
  private readonly sunTrailHalos = new THREE.Group();
  private readonly waveRing = new THREE.Group();
  private readonly potatoMineShockwave = new THREE.Group();
  private readonly statusBadge = new THREE.Group();
  private readonly statusBadgeParticles = new THREE.Group();
  private readonly seedPacket = new THREE.Group();
  private readonly gardenTool = new THREE.Group();
  private readonly plantingSpark = new THREE.Group();
  private readonly waveWarningStake = new THREE.Group();
  private readonly waveWarningBeacon = new THREE.Group();
  private readonly statusBadgeMaterials: THREE.MeshStandardMaterial[] = [];
  private readonly statusBadgeParticleMaterials: THREE.MeshStandardMaterial[] = [];
  private readonly seedPacketMaterials: THREE.MeshStandardMaterial[] = [];
  private seedPacketShine?: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>;
  private readonly plantingSparkMaterials: THREE.MeshStandardMaterial[] = [];
  private readonly potatoMineShockwaveMaterials: THREE.MeshStandardMaterial[] = [];
  private readonly waveWarningStakeMaterials: THREE.MeshStandardMaterial[] = [];
  private readonly waveWarningBeaconMaterials: THREE.MeshStandardMaterial[] = [];
  private readonly textureLoader = new THREE.TextureLoader();
  private frameId = 0;
  private sunPulseStartedAt = -Infinity;
  private wavePulseStartedAt = -Infinity;
  private potatoMineShockwaveStartedAt = -Infinity;
  private statusPulseStartedAt = -Infinity;
  private seedPacketStartedAt = -Infinity;
  private gardenToolPulseStartedAt = -Infinity;
  private plantingSparkStartedAt = -Infinity;
  private seedPacketMode: SeedPacketFlipMode = "select";
  private statusBadgeMode: StatusBadgeMode | null = null;

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
    const tableLight = new THREE.PointLight(0xffd39a, 0.55, 4);
    tableLight.position.set(-1.3, -0.8, 2.4);
    this.scene.add(tableLight);

    this.buildToyGardenProps();
    this.scene.add(this.toyGardenProps);
    this.buildCoin();
    this.scene.add(this.coin);
    this.buildBurst();
    this.scene.add(this.burst);
    this.buildSunTrail();
    this.scene.add(this.sunTrail);
    this.scene.add(this.sunTrailHalos);
    this.buildWaveRing();
    this.scene.add(this.waveRing);
    this.buildPotatoMineShockwave();
    this.scene.add(this.potatoMineShockwave);
    this.buildWaveWarningStake();
    this.scene.add(this.waveWarningStake);
    this.buildStatusBadge();
    this.scene.add(this.statusBadge);
    this.buildStatusBadgeParticles();
    this.scene.add(this.statusBadgeParticles);
    this.buildGardenTool();
    this.scene.add(this.gardenTool);
    this.buildPlantingSpark();
    this.scene.add(this.plantingSpark);
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

  showLevelBadge(status: StatusBadgeMode): void {
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
    const now = performance.now();
    this.gardenToolPulseStartedAt = now;
    this.plantingSparkStartedAt = now;
  }

  destroy(): void {
    cancelAnimationFrame(this.frameId);
    window.removeEventListener("resize", this.resize);
    this.renderer.dispose();
    this.root.replaceChildren();
  }

  private buildToyGardenProps(): void {
    const trayMaterial = new THREE.MeshStandardMaterial({
      color: 0x86c894,
      emissive: 0x1f3c24,
      emissiveIntensity: 0.05,
      roughness: 0.86,
      transparent: true,
      opacity: 0.22,
      depthWrite: false
    });
    const tray = new THREE.Mesh(new THREE.CircleGeometry(1.32, 64), trayMaterial);
    tray.position.set(0, -0.06, -0.42);
    tray.scale.set(1, 0.62, 1);
    this.toyGardenProps.add(tray);

    getToyGardenPropProfiles().forEach((profile, index) => {
      const prop = this.createToyGardenProp(profile);
      prop.position.set(profile.x, profile.y, profile.z);
      prop.rotation.z = profile.rotationZ;
      prop.scale.setScalar(profile.scale);
      prop.userData.baseY = profile.y;
      prop.userData.idlePhase = index * 0.72;
      this.toyGardenProps.add(prop);
    });
  }

  private createToyGardenProp(profile: ToyGardenPropProfile): THREE.Group {
    if (profile.kind === "terracotta-pot") return this.createTerracottaPot(profile);
    if (profile.kind === "watering-can") return this.createWateringCan(profile);
    if (profile.kind === "seed-crate") return this.createSeedCrate(profile);
    if (profile.kind === "plant-label") return this.createPlantLabel(profile);
    return this.createPebble(profile);
  }

  private createPropMaterial(color: number, family: ToyGardenMaterialFamily): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color,
      metalness: family === "metal" ? 0.38 : 0.04,
      roughness: family === "metal" ? 0.36 : family === "stone" ? 0.72 : 0.62
    });
  }

  private createTerracottaPot(profile: ToyGardenPropProfile): THREE.Group {
    const group = new THREE.Group();
    const clay = this.createPropMaterial(profile.primaryColor, "ceramic");
    const darkClay = this.createPropMaterial(profile.secondaryColor, "ceramic");
    const soil = this.createPropMaterial(0x4d3523, "stone");
    const leaf = this.createPropMaterial(0x69b96f, "leaf");
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, 0.34, 24), clay);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.27, 0.075, 24), darkClay);
    const soilTop = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.03, 22), soil);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.22, 10), leaf);
    const leftLeaf = new THREE.Mesh(new THREE.SphereGeometry(0.065, 14, 10), leaf);
    const rightLeaf = new THREE.Mesh(new THREE.SphereGeometry(0.055, 14, 10), leaf);
    body.position.y = -0.06;
    body.scale.z = 0.62;
    rim.position.y = 0.13;
    rim.scale.z = 0.56;
    soilTop.position.y = 0.18;
    soilTop.scale.z = 0.52;
    stem.position.y = 0.28;
    stem.rotation.z = -0.14;
    leftLeaf.position.set(-0.055, 0.36, 0.018);
    leftLeaf.scale.set(1.35, 0.62, 0.36);
    leftLeaf.rotation.z = 0.56;
    rightLeaf.position.set(0.07, 0.32, 0.018);
    rightLeaf.scale.set(1.2, 0.58, 0.34);
    rightLeaf.rotation.z = -0.46;
    group.add(body, rim, soilTop, stem, leftLeaf, rightLeaf);
    return group;
  }

  private createWateringCan(profile: ToyGardenPropProfile): THREE.Group {
    const group = new THREE.Group();
    const metal = this.createPropMaterial(profile.primaryColor, "metal");
    const darkMetal = this.createPropMaterial(profile.secondaryColor, "metal");
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.26, 24, 16), metal);
    body.scale.set(1.18, 0.82, 0.46);
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.16, 16), darkMetal);
    top.position.y = 0.2;
    const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.038, 0.52, 12), darkMetal);
    spout.rotation.z = -1.05;
    spout.position.set(0.32, 0.1, 0);
    const rose = new THREE.Mesh(new THREE.SphereGeometry(0.06, 14, 10), darkMetal);
    rose.position.set(0.58, 0.2, 0);
    rose.scale.set(1.1, 0.72, 0.38);
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.025, 8, 28), darkMetal);
    handle.position.set(-0.24, 0.02, -0.01);
    handle.scale.set(0.74, 1, 0.28);
    group.add(body, top, spout, rose, handle);
    return group;
  }

  private createSeedCrate(profile: ToyGardenPropProfile): THREE.Group {
    const group = new THREE.Group();
    const wood = this.createPropMaterial(profile.primaryColor, "wood");
    const darkWood = this.createPropMaterial(profile.secondaryColor, "wood");
    const seed = this.createPropMaterial(0xd8a24a, "ceramic");
    const crate = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.3, 0.18), wood);
    const frontSlat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.055, 0.2), darkWood);
    const topSlat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.045, 0.2), darkWood);
    frontSlat.position.y = -0.04;
    topSlat.position.y = 0.11;
    group.add(crate, frontSlat, topSlat);
    for (let index = 0; index < 6; index += 1) {
      const bead = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), seed);
      bead.position.set(-0.16 + index * 0.065, 0.18 + (index % 2) * 0.018, 0.02);
      bead.scale.set(1.2, 0.72, 0.5);
      group.add(bead);
    }
    return group;
  }

  private createPlantLabel(profile: ToyGardenPropProfile): THREE.Group {
    const group = new THREE.Group();
    const primary = this.createPropMaterial(profile.primaryColor, profile.materialFamily);
    const secondary = this.createPropMaterial(profile.secondaryColor, profile.materialFamily);
    const stake = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.42, 10), secondary);
    stake.position.y = -0.08;
    const sign = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.16, 0.045), primary);
    sign.position.y = 0.16;
    group.add(stake, sign);
    if (profile.materialFamily === "leaf") {
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 10), primary);
      leaf.position.set(0.03, 0.2, 0.03);
      leaf.scale.set(1.3, 0.55, 0.3);
      leaf.rotation.z = -0.52;
      group.add(leaf);
    }
    return group;
  }

  private createPebble(profile: ToyGardenPropProfile): THREE.Group {
    const group = new THREE.Group();
    const stone = this.createPropMaterial(profile.primaryColor, "stone");
    const pebble = new THREE.Mesh(new THREE.SphereGeometry(0.2, 18, 12), stone);
    pebble.scale.set(1.25, 0.58, 0.36);
    const highlight = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 8), this.createPropMaterial(0xfff8df, "stone"));
    highlight.position.set(-0.06, 0.04, 0.07);
    highlight.scale.set(1.2, 0.52, 0.24);
    group.add(pebble, highlight);
    return group;
  }

  private buildCoin(): void {
    const halo = new THREE.Mesh(
      new THREE.CircleGeometry(0.82, 48),
      new THREE.MeshBasicMaterial({
        color: 0xffd34f,
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
        side: THREE.DoubleSide
      })
    );
    halo.position.z = -0.03;
    const token = this.createTexturePlane(SUN_TOKEN_TEXTURE, 1.48, 1.5);
    this.coin.add(halo, token);
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
    const haloGeometry = new THREE.TorusGeometry(0.09, 0.012, 8, 28);
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
      const haloMaterial = new THREE.MeshStandardMaterial({
        color: 0xfff8df,
        emissive: 0xffd34f,
        emissiveIntensity: 0.55,
        transparent: true,
        opacity: 0,
        roughness: 0.32
      });
      const halo = new THREE.Mesh(haloGeometry, haloMaterial);
      halo.visible = false;
      this.sunTrailHalos.add(halo);
    }
    this.sunTrail.visible = false;
    this.sunTrailHalos.visible = false;
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
    const beaconRingMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd34f,
      emissive: 0xff8f4d,
      emissiveIntensity: 0.72,
      transparent: true,
      opacity: 0,
      roughness: 0.36
    });
    const beaconCoreMaterial = new THREE.MeshStandardMaterial({
      color: 0xfff8df,
      emissive: 0xffd34f,
      emissiveIntensity: 0.82,
      transparent: true,
      opacity: 0,
      roughness: 0.28
    });
    const beaconRing = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.018, 8, 32), beaconRingMaterial);
    const beaconCore = new THREE.Mesh(new THREE.SphereGeometry(0.055, 14, 10), beaconCoreMaterial);
    beaconCore.position.z = 0.025;
    this.waveWarningBeacon.position.set(0.18, 0.16, 0.02);
    this.waveWarningBeacon.add(beaconRing, beaconCore);
    this.waveWarningBeacon.visible = false;
    this.waveWarningStake.position.set(-1.06, 0.4, 0.08);
    this.waveWarningStake.add(post, flag, cap, this.waveWarningBeacon);
    this.waveWarningStake.visible = false;
    this.waveWarningStakeMaterials.push(postMaterial, flagMaterial, capMaterial);
    this.waveWarningBeaconMaterials.push(beaconRingMaterial, beaconCoreMaterial);
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

  private buildStatusBadgeParticles(): void {
    for (let index = 0; index < 8; index += 1) {
      const material = new THREE.MeshStandardMaterial({
        color: index % 2 === 0 ? 0xfff1a3 : 0xffd34f,
        emissive: index % 2 === 0 ? 0xffffff : 0xffc547,
        emissiveIntensity: 0.75,
        roughness: 0.34,
        transparent: true,
        opacity: 0
      });
      const particle =
        index % 2 === 0
          ? new THREE.Mesh(this.createStarGeometry(), material)
          : new THREE.Mesh(new THREE.SphereGeometry(0.065, 14, 10), material);
      particle.userData.particleIndex = index;
      particle.visible = false;
      this.statusBadgeParticles.add(particle);
      this.statusBadgeParticleMaterials.push(material);
    }
    this.statusBadgeParticles.position.set(1.08, -0.88, 0.04);
    this.statusBadgeParticles.visible = false;
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
    this.gardenTool.visible = false;
  }

  private createTexturePlane(url: string, width: number, height: number): THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> {
    const texture = this.textureLoader.load(url);
    texture.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    return new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
  }

  private buildPlantingSpark(): void {
    const sparkGeometry = new THREE.SphereGeometry(0.045, 10, 8);
    const dustGeometry = new THREE.BoxGeometry(0.055, 0.035, 0.035);
    for (let index = 0; index < 10; index += 1) {
      const material = new THREE.MeshStandardMaterial({
        color: index % 3 === 0 ? 0xffd34f : index % 2 === 0 ? 0x8f5d32 : 0x6d4b2b,
        emissive: index % 3 === 0 ? 0xff8f4d : 0x000000,
        emissiveIntensity: 0,
        roughness: 0.62,
        transparent: true,
        opacity: 0
      });
      const particle = new THREE.Mesh(index % 3 === 0 ? sparkGeometry : dustGeometry, material);
      particle.userData.particleIndex = index;
      particle.visible = false;
      this.plantingSpark.add(particle);
      this.plantingSparkMaterials.push(material);
    }
    this.plantingSpark.position.set(0.78, -0.58, 0.08);
    this.plantingSpark.visible = false;
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
    this.animateToyGardenProps(seconds);
    this.animateBurst(pulseAge);
    this.animateSunTrail(now);
    this.animateWaveRing(now);
    this.animatePotatoMineShockwave(now);
    this.animateWaveWarningStake(now);
    this.animateStatusBadge(now);
    this.animateGardenTool(now);
    this.animatePlantingSpark(now);
    this.animateSeedPacket(now);
    this.renderer.render(this.scene, this.camera);
    this.frameId = requestAnimationFrame(this.animate);
  };

  private animateToyGardenProps(seconds: number): void {
    this.toyGardenProps.children.forEach((child, index) => {
      const prop = child as THREE.Group;
      const baseY = prop.userData.baseY as number | undefined;
      if (baseY === undefined) {
        prop.rotation.z = Math.sin(seconds * 0.18) * 0.018;
        return;
      }

      const phase = prop.userData.idlePhase as number;
      prop.position.y = baseY + Math.sin(seconds * 0.86 + phase) * 0.012;
      prop.rotation.y = Math.sin(seconds * 0.52 + phase) * 0.06;
    });
  }

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
    let hasVisibleHalo = false;

    this.sunTrail.children.forEach((child, index) => {
      const bead = child as THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial>;
      const halo = this.sunTrailHalos.children[index] as
        | THREE.Mesh<THREE.TorusGeometry, THREE.MeshStandardMaterial>
        | undefined;
      const state = getSunTrailParticleState(ageMs, index);
      bead.visible = state.visible;

      if (!state.visible) {
        bead.material.opacity = 0;
        if (halo) {
          halo.visible = false;
          halo.material.opacity = 0;
        }
        return;
      }

      hasVisibleParticle = true;
      bead.position.set(state.x, state.y, state.z);
      bead.scale.setScalar(state.scale);
      bead.material.opacity = state.opacity;
      bead.material.emissiveIntensity = 0.7 + state.shimmerOpacity * 0.9;

      if (halo) {
        hasVisibleHalo = true;
        halo.visible = true;
        halo.position.set(state.x, state.y, state.z - 0.02);
        halo.rotation.z = state.rotationZ;
        halo.scale.setScalar(state.haloScale);
        halo.material.opacity = state.shimmerOpacity * 0.82;
      }
    });

    this.sunTrail.visible = hasVisibleParticle;
    this.sunTrailHalos.visible = hasVisibleHalo;
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
    this.waveWarningStakeMaterials[1].emissiveIntensity = state.flagGlow;
    this.waveWarningStakeMaterials[2].emissiveIntensity = state.flagGlow * 0.72;
    this.waveWarningBeacon.visible = state.beaconOpacity > 0.02;
    this.waveWarningBeacon.scale.setScalar(state.beaconScale);
    this.waveWarningBeacon.rotation.z = now / 260;
    this.waveWarningBeaconMaterials.forEach((material) => {
      material.opacity = state.beaconOpacity;
      material.emissiveIntensity = state.flagGlow;
    });
  }

  private animateStatusBadge(now: number): void {
    if (!this.statusBadgeMode) {
      this.statusBadge.visible = false;
      this.statusBadgeParticles.visible = false;
      return;
    }

    const ageMs = now - this.statusPulseStartedAt;
    const state = getStatusBadgeState(ageMs, this.statusBadgeMode, 0);
    this.statusBadge.visible = state.visible;
    if (!state.visible) {
      this.statusBadgeParticles.visible = false;
      this.statusBadgeMaterials.forEach((material) => {
        material.opacity = 0;
      });
      this.statusBadgeParticleMaterials.forEach((material) => {
        material.opacity = 0;
      });
      return;
    }

    this.statusBadge.rotation.y = state.rotationY;
    this.statusBadge.rotation.z = state.rotationZ;
    this.statusBadge.position.y = state.y;
    this.statusBadge.scale.setScalar(state.scale);
    this.statusBadgeMaterials.forEach((material) => {
      material.opacity = state.opacity;
      material.emissiveIntensity = state.materialIntensity;
    });
    this.animateStatusBadgeParticles(ageMs, this.statusBadgeMode, state.y);
  }

  private animateStatusBadgeParticles(ageMs: number, mode: StatusBadgeMode, badgeY: number): void {
    let hasVisibleParticle = false;

    this.statusBadgeParticles.position.y = badgeY;
    this.statusBadgeParticles.children.forEach((child, index) => {
      const particle = child as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
      const state = getStatusBadgeState(ageMs, mode, index);
      particle.visible = state.particleVisible;

      if (!state.particleVisible) {
        particle.material.opacity = 0;
        return;
      }

      hasVisibleParticle = true;
      particle.position.set(state.particleX, state.particleY, state.particleZ);
      particle.rotation.z = state.particleRotationZ;
      particle.scale.setScalar(state.particleScale);
      particle.material.opacity = state.particleOpacity;
    });

    this.statusBadgeParticles.visible = hasVisibleParticle;
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

  private animatePlantingSpark(now: number): void {
    const ageMs = now - this.plantingSparkStartedAt;
    let hasVisibleParticle = false;

    this.plantingSpark.children.forEach((child, index) => {
      const particle = child as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
      const state = getPlantingSparkState(ageMs, index);
      particle.visible = state.visible;

      if (!state.visible) {
        particle.material.opacity = 0;
        particle.material.emissiveIntensity = 0;
        return;
      }

      hasVisibleParticle = true;
      particle.position.set(state.x, state.y, state.z);
      particle.rotation.z = state.rotationZ;
      particle.rotation.x = state.rotationZ * 0.28;
      particle.scale.setScalar(state.scale);
      particle.material.opacity = state.opacity;
      particle.material.emissiveIntensity = state.warmOpacity;
    });

    this.plantingSpark.visible = hasVisibleParticle;
  }

  private applyStatusBadgeColors(status: StatusBadgeMode): void {
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
