import * as THREE from "three";
import { GameAudio } from "./audio";
import { RunnerRig } from "./character";
import {
  ATTRACT_SPEED,
  BASE_SPEED,
  BIOME_LABEL,
  COIN_SCORE,
  COYOTE,
  FIXED_DT,
  GRAVITY,
  JUMP_BUFFER,
  JUMP_VY,
  LANE_COUNT,
  LANE_SNAP,
  LANE_X,
  MAGNET_RANGE,
  MAX_BOATS,
  MAX_COINS,
  MAX_OBS,
  MAX_POWERS,
  MAX_SPARKS,
  MAX_SPEED,
  MAX_STEPS,
  MAX_TRAINS,
  PAD_BOOST_MULT,
  PAD_BOOST_TIME,
  PLAYER_HALF_D,
  PLAYER_HALF_W,
  POWER_DURATION,
  RAMP_VY,
  SECTION_COUNT,
  SECTION_LEN,
  SLIDE_TIME,
  SPEED_PER_METER,
  SUPER_JUMP_MULT,
  type Biome,
  type ObstacleKind,
  type PowerId,
  type QualityLevel,
  type QualitySetting,
} from "./constants";
import { GameInput } from "./input";
import { characterById, type RunStats, upgradeMult, type SaveData } from "./save";
import { BIOME_FOG, buildBoatGeometry, buildSection, buildSkyline, buildTrainGeometry, OBS_VIS, type Spawn } from "./world";

export type HudSnapshot = {
  score: number;
  coins: number;
  distance: number;
  combo: number;
  fps: number;
  speed: number;
  powers: { id: PowerId; t: number; max: number }[];
  shield: boolean;
  zone: string;
  pad: boolean;
  board: boolean;
};

export type EngineHooks = {
  onHud: (h: HudSnapshot) => void;
  onOver: (stats: RunStats) => void;
  onPause: () => void;
};

type CoinSlot = { alive: boolean; x: number; y: number; z: number };
type ObsSlot = {
  alive: boolean;
  kind: ObstacleKind;
  lane: number;
  x: number;
  y: number;
  z: number;
  sx: number;
  sy: number;
  sz: number;
  phase: number;
  vz: number;
  ridden: boolean;
  used: boolean;
  tint: number;
};
type PowerSlot = { alive: boolean; id: PowerId; x: number; y: number; z: number; mesh: THREE.Mesh };
type Spark = { alive: boolean; x: number; y: number; z: number; life: number; mesh: THREE.Mesh };

type Section = {
  group: THREE.Group;
  mesh: THREE.Mesh;
  z: number;
  biome: Biome;
};

const dummy = new THREE.Object3D();
const _color = new THREE.Color();

function aabbOverlap(
  ax: number,
  ay: number,
  az: number,
  ahx: number,
  ahy: number,
  ahz: number,
  bx: number,
  by: number,
  bz: number,
  bhx: number,
  bhy: number,
  bhz: number,
) {
  return (
    Math.abs(ax - bx) < ahx + bhx &&
    Math.abs(ay - by) < ahy + bhy &&
    Math.abs(az - bz) < ahz + bhz
  );
}

export class GameEngine {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private timer = new THREE.Timer();
  private acc = 0;
  private canvas: HTMLCanvasElement;
  private hooks: EngineHooks;
  private input: GameInput;
  private audio = new GameAudio();
  private runner = new RunnerRig();
  private envMat: THREE.MeshLambertMaterial;
  private coinMesh: THREE.InstancedMesh;
  private obsMesh: THREE.InstancedMesh;
  private trainMesh: THREE.InstancedMesh;
  private boatMesh: THREE.InstancedMesh;
  private sections: Section[] = [];
  private coins: CoinSlot[] = [];
  private obs: ObsSlot[] = [];
  private powers: PowerSlot[] = [];
  private sparks: Spark[] = [];
  private skyline: THREE.Mesh;
  private sun: THREE.Mesh;
  private hemi: THREE.HemisphereLight;
  private dir: THREE.DirectionalLight;

  private mode: "attract" | "play" | "paused" | "dead" = "attract";
  private lane = 1;
  private queuedLane: number | null = null;
  private x = 0;
  private y = 0;
  private vy = 0;
  private grounded = true;
  private sliding = 0;
  private jumpBuf = 0;
  private coyote = 0;
  private crashing = false;
  private crashT = 0;
  private speed = ATTRACT_SPEED;
  private distance = 0;
  private score = 0;
  private runCoins = 0;
  private combo = 0;
  private comboT = 0;
  private jumps = 0;
  private slides = 0;
  private powerPicks = 0;
  private maxCombo = 0;
  private shieldSave = false;
  private usedMagnet = false;
  private usedDeck = false;
  private trainsRidden = 0;
  private boatsRidden = 0;
  private padsHit = 0;
  private padBoost = 0;
  private zone: Biome = "downtown";
  private fogCol = new THREE.Color(0x9ec4d4);
  private skyCol = new THREE.Color(0x87b7d0);
  private fogTarget = new THREE.Color();
  private skyTarget = new THREE.Color();
  private active: Record<PowerId, number> = {
    magnet: 0,
    shield: 0,
    boost: 0,
    double: 0,
    superjump: 0,
    deck: 0,
  };
  private trauma = 0;
  private fovPunch = 0;
  private time = 0;
  private hudAcc = 0;
  private fpsEma = 60;
  private fpsFrames = 0;
  private fpsTime = 0;
  private quality: QualityLevel = 2;
  private qualitySetting: QualitySetting = "auto";
  private shakeOn = true;
  private saveRef: SaveData;
  private sectionSeed = 1;
  private sectionCursor = 0;
  private disposed = false;
  private deadStats: RunStats | null = null;
  private cam = { x: 0, y: 3.5, z: 8, fov: 60 };
  private resizeObs: ResizeObserver;
  private onVis: () => void;

  constructor(canvas: HTMLCanvasElement, hooks: EngineHooks, save: SaveData) {
    this.canvas = canvas;
    this.hooks = hooks;
    this.saveRef = save;
    this.qualitySetting = save.settings.quality;
    this.shakeOn = save.settings.shake;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    });
    this.renderer.setClearColor(0x87b7d0, 1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = false;
    this.camera = new THREE.PerspectiveCamera(60, 1, 0.15, 110);
    this.timer.connect(document);

    this.scene.fog = new THREE.Fog(0x9ec4d4, 28, 78);
    this.scene.background = new THREE.Color(0x87b7d0);

    this.hemi = new THREE.HemisphereLight(0xcfe6f2, 0xc4b49a, 1.05);
    this.scene.add(this.hemi);
    this.dir = new THREE.DirectionalLight(0xfff1d6, 1.15);
    this.dir.position.set(-8, 18, 6);
    this.scene.add(this.dir);

    this.envMat = new THREE.MeshLambertMaterial({ vertexColors: true });

    const coinGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.08, 8);
    coinGeo.rotateZ(Math.PI / 2);
    this.coinMesh = new THREE.InstancedMesh(
      coinGeo,
      new THREE.MeshBasicMaterial({ color: 0xe8c872 }),
      MAX_COINS,
    );
    this.coinMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.coinMesh.frustumCulled = false;
    this.scene.add(this.coinMesh);

    this.obsMesh = new THREE.InstancedMesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshLambertMaterial({ vertexColors: false, color: 0xffffff }),
      MAX_OBS,
    );
    this.obsMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.obsMesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(MAX_OBS * 3), 3);
    this.obsMesh.frustumCulled = false;
    this.scene.add(this.obsMesh);

    this.trainMesh = new THREE.InstancedMesh(
      buildTrainGeometry(),
      new THREE.MeshLambertMaterial({ vertexColors: true, color: 0xffffff }),
      MAX_TRAINS,
    );
    this.trainMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.trainMesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(MAX_TRAINS * 3), 3);
    this.trainMesh.frustumCulled = false;
    this.scene.add(this.trainMesh);

    this.boatMesh = new THREE.InstancedMesh(
      buildBoatGeometry(),
      new THREE.MeshLambertMaterial({ vertexColors: true, color: 0xffffff }),
      MAX_BOATS,
    );
    this.boatMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.boatMesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(MAX_BOATS * 3), 3);
    this.boatMesh.frustumCulled = false;
    this.scene.add(this.boatMesh);

    for (let i = 0; i < MAX_COINS; i++) this.coins.push({ alive: false, x: 0, y: 0, z: 0 });
    for (let i = 0; i < MAX_OBS; i++) {
      this.obs.push({
        alive: false,
        kind: "crate",
        lane: 1,
        x: 0,
        y: 0,
        z: 0,
        sx: 1,
        sy: 1,
        sz: 1,
        phase: 0,
        vz: 0,
        ridden: false,
        used: false,
        tint: 0xffffff,
      });
    }

    const powerGeo = new THREE.IcosahedronGeometry(0.32, 0);
    const powerColors: Record<PowerId, number> = {
      magnet: 0x8eb9b6,
      shield: 0x7aa0d4,
      boost: 0xe07a5f,
      double: 0xd9cbb6,
      superjump: 0x5d9a78,
      deck: 0x4d6d78,
    };
    for (const id of Object.keys(powerColors) as PowerId[]) {
      const mesh = new THREE.Mesh(powerGeo, new THREE.MeshBasicMaterial({ color: powerColors[id] }));
      mesh.visible = false;
      this.scene.add(mesh);
      this.powers.push({ alive: false, id, x: 0, y: 0.9, z: 0, mesh });
    }
    while (this.powers.length < MAX_POWERS) {
      const mesh = new THREE.Mesh(powerGeo.clone(), new THREE.MeshBasicMaterial({ color: 0x8eb9b6 }));
      mesh.visible = false;
      this.scene.add(mesh);
      this.powers.push({ alive: false, id: "magnet", x: 0, y: 0.9, z: 0, mesh });
    }

    const sparkGeo = new THREE.SphereGeometry(0.08, 5, 4);
    for (let i = 0; i < MAX_SPARKS; i++) {
      const mesh = new THREE.Mesh(sparkGeo, new THREE.MeshBasicMaterial({ color: 0xe8c872 }));
      mesh.visible = false;
      this.scene.add(mesh);
      this.sparks.push({ alive: false, x: 0, y: 0, z: 0, life: 0, mesh });
    }

    this.skyline = new THREE.Mesh(buildSkyline(), this.envMat);
    this.skyline.position.set(0, 0, -64);
    this.scene.add(this.skyline);

    this.sun = new THREE.Mesh(
      new THREE.SphereGeometry(3.2, 12, 10),
      new THREE.MeshBasicMaterial({ color: 0xfff1c8, fog: false }),
    );
    this.sun.position.set(-28, 26, -70);
    this.scene.add(this.sun);

    this.scene.add(this.runner.root);
    this.runner.apply(characterById(save.selected));

    this.input = new GameInput(canvas);
    this.bootstrapSections();
    this.hideAllInstances();
    this.applyQuality(this.qualityFromSetting(save.settings.quality));
    this.fit();

    this.resizeObs = new ResizeObserver(() => this.fit());
    this.resizeObs.observe(canvas.parentElement ?? canvas);
    this.onVis = () => {
      this.audio.resume();
      if (document.hidden) this.timer.reset();
    };
    document.addEventListener("visibilitychange", this.onVis);

    window.__controlsTest = {
      getYaw: () => -this.lane,
      getSpeed: () => this.speed,
      setKeys: (codes) => this.input.setInjected(codes),
      setSteer: (v) => {
        if (v > 0.3) this.tryLane(-1);
        else if (v < -0.3) this.tryLane(1);
      },
      kinds: () => this.obs.filter((o) => o.alive).map((o) => o.kind),
    };
  }

  start() {
    this.renderer.setAnimationLoop(() => this.frame());
  }

  unlockAudio() {
    this.audio.unlock();
    this.audio.setMusic(this.saveRef.settings.music);
    this.audio.setSfx(this.saveRef.settings.sfx);
  }

  applySave(save: SaveData) {
    this.saveRef = save;
    this.audio.setMusic(save.settings.music);
    this.audio.setSfx(save.settings.sfx);
    this.shakeOn = save.settings.shake;
    this.qualitySetting = save.settings.quality;
    if (save.settings.quality !== "auto") this.applyQuality(this.qualityFromSetting(save.settings.quality));
    this.runner.apply(characterById(save.selected));
  }

  beginRun() {
    this.resetWorld();
    this.mode = "play";
    this.speed = BASE_SPEED;
    this.input.setEnabled(true);
    this.audio.play("ui");
    this.pushHud(true);
  }

  pause() {
    if (this.mode !== "play") return;
    this.mode = "paused";
    this.input.setEnabled(false);
  }

  resume() {
    if (this.mode !== "paused") return;
    this.mode = "play";
    this.input.setEnabled(true);
    this.timer.reset();
  }

  toAttract() {
    this.resetWorld();
    this.mode = "attract";
    this.speed = ATTRACT_SPEED;
    this.input.setEnabled(false);
  }

  dispose() {
    this.disposed = true;
    this.renderer.setAnimationLoop(null);
    this.input.dispose();
    this.audio.dispose();
    this.runner.dispose();
    this.resizeObs.disconnect();
    document.removeEventListener("visibilitychange", this.onVis);
    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        const m = obj.material;
        if (Array.isArray(m)) m.forEach((x) => x.dispose());
        else (m as THREE.Material).dispose();
      }
    });
    this.renderer.dispose();
    delete window.__controlsTest;
  }

  private qualityFromSetting(s: QualitySetting): QualityLevel {
    if (s === "low") return 0;
    if (s === "med") return 1;
    if (s === "high") return 3;
    return 2;
  }

  private applyQuality(q: QualityLevel) {
    this.quality = q;
    const dpr = [0.85, 1.0, 1.12, 1.28][q]!;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dpr));
    const fog = this.scene.fog as THREE.Fog;
    fog.near = [18, 24, 28, 32][q]!;
    fog.far = [46, 60, 74, 88][q]!;
    this.camera.far = fog.far + 16;
    this.skyline.visible = q > 0;
    this.fit();
  }

  private fit() {
    const parent = this.canvas.parentElement ?? this.canvas;
    const w = Math.max(1, parent.clientWidth);
    const h = Math.max(1, parent.clientHeight);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    const portrait = h > w;
    this.camera.fov = portrait ? 62 : 54;
    this.camera.updateProjectionMatrix();
  }

  private bootstrapSections() {
    for (let i = 0; i < SECTION_COUNT; i++) {
      const group = new THREE.Group();
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), this.envMat);
      group.add(mesh);
      this.scene.add(group);
      this.sections.push({ group, mesh, z: -i * SECTION_LEN, biome: "downtown" });
    }
    this.rebuildAllSections();
  }

  private rebuildAllSections() {
    this.sectionCursor = 0;
    for (let i = 0; i < this.sections.length; i++) {
      this.placeSection(this.sections[i]!, -i * SECTION_LEN);
    }
  }

  private placeSection(sec: Section, z: number) {
    sec.mesh.geometry.dispose();
    const built = buildSection(this.distance, this.sectionCursor, this.sectionSeed);
    sec.mesh.geometry = built.geometry;
    sec.z = z;
    sec.biome = built.biome;
    sec.group.position.set(0, 0, z);
    this.sectionCursor++;
    for (const spawn of built.spawns) this.spawnAt(spawn, z);
  }

  private spawnAt(spawn: Spawn, sectionZ: number) {
    const worldZ = sectionZ + spawn.z;
    if (spawn.kind === "coin") {
      const slot = this.coins.find((c) => !c.alive);
      if (!slot) return;
      slot.alive = true;
      slot.x = LANE_X[spawn.lane]!;
      slot.y = spawn.y ?? 0.85;
      slot.z = worldZ;
      return;
    }
    if (spawn.kind === "power") {
      const slot = this.powers.find((p) => !p.alive);
      if (!slot || !spawn.power) return;
      slot.alive = true;
      slot.id = spawn.power;
      (slot.mesh.material as THREE.MeshBasicMaterial).color.setHex(
        {
          magnet: 0x8eb9b6,
          shield: 0x7aa0d4,
          boost: 0xe07a5f,
          double: 0xd9cbb6,
          superjump: 0x5d9a78,
          deck: 0x4d6d78,
        }[spawn.power],
      );
      slot.x = LANE_X[spawn.lane]!;
      slot.y = 1.05;
      slot.z = worldZ;
      slot.mesh.visible = true;
      return;
    }
    const slot = this.obs.find((o) => !o.alive);
    if (!slot) return;
    const vis = OBS_VIS[spawn.kind];
    slot.alive = true;
    slot.kind = spawn.kind;
    slot.lane = spawn.lane;
    slot.x = LANE_X[spawn.lane]!;
    slot.y = vis.y;
    slot.z = worldZ;
    slot.sx = vis.sx;
    slot.sy = vis.sy;
    slot.sz = vis.sz;
    slot.phase = spawn.phase ?? 0;
    slot.vz = spawn.vz ?? 0;
    slot.ridden = false;
    slot.used = false;
    slot.tint = spawn.kind === "train" || spawn.kind === "boat" ? 0xffffff : vis.color;
  }

  private hideAllInstances() {
    dummy.scale.set(0, 0, 0);
    dummy.position.set(0, -20, 0);
    dummy.updateMatrix();
    for (let i = 0; i < MAX_COINS; i++) this.coinMesh.setMatrixAt(i, dummy.matrix);
    for (let i = 0; i < MAX_OBS; i++) this.obsMesh.setMatrixAt(i, dummy.matrix);
    for (let i = 0; i < MAX_TRAINS; i++) this.trainMesh.setMatrixAt(i, dummy.matrix);
    for (let i = 0; i < MAX_BOATS; i++) this.boatMesh.setMatrixAt(i, dummy.matrix);
    this.coinMesh.instanceMatrix.needsUpdate = true;
    this.obsMesh.instanceMatrix.needsUpdate = true;
    this.trainMesh.instanceMatrix.needsUpdate = true;
    this.boatMesh.instanceMatrix.needsUpdate = true;
  }

  private resetWorld() {
    for (const c of this.coins) c.alive = false;
    for (const o of this.obs) o.alive = false;
    for (const p of this.powers) {
      p.alive = false;
      p.mesh.visible = false;
    }
    for (const s of this.sparks) {
      s.alive = false;
      s.mesh.visible = false;
    }
    this.lane = 1;
    this.queuedLane = null;
    this.x = 0;
    this.y = 0;
    this.vy = 0;
    this.grounded = true;
    this.sliding = 0;
    this.jumpBuf = 0;
    this.coyote = 0;
    this.crashing = false;
    this.crashT = 0;
    this.distance = 0;
    this.score = 0;
    this.runCoins = 0;
    this.combo = 0;
    this.comboT = 0;
    this.jumps = 0;
    this.slides = 0;
    this.powerPicks = 0;
    this.maxCombo = 0;
    this.shieldSave = false;
    this.usedMagnet = false;
    this.usedDeck = false;
    this.trainsRidden = 0;
    this.boatsRidden = 0;
    this.padsHit = 0;
    this.padBoost = 0;
    this.deadStats = null;
    (Object.keys(this.active) as PowerId[]).forEach((k) => {
      this.active[k] = 0;
    });
    this.trauma = 0;
    this.fovPunch = 0;
    this.sectionSeed = (Math.random() * 1e9) | 0;
    this.runner.reset();
    this.rebuildAllSections();
    this.hideAllInstances();
  }

  private tryLane(dir: number) {
    const next = this.lane + dir;
    if (next < 0 || next >= LANE_COUNT) return;
    const dx = Math.abs(this.x - LANE_X[this.lane]!);
    if (dx > 0.55) {
      this.queuedLane = next;
      return;
    }
    this.lane = next;
    this.audio.play("whoosh");
  }

  private tryJump() {
    if (this.sliding > 0) this.sliding = 0;
    const can = this.grounded || this.coyote > 0;
    if (!can) {
      this.jumpBuf = JUMP_BUFFER;
      return;
    }
    const ch = characterById(this.saveRef.selected);
    const spring = upgradeMult(this.saveRef.upgrades.spring) * ch.jump;
    const superM = this.active.superjump > 0 ? SUPER_JUMP_MULT : 1;
    this.vy = JUMP_VY * spring * superM;
    this.grounded = false;
    this.coyote = 0;
    this.jumpBuf = 0;
    this.jumps++;
    this.audio.play("jump");
  }

  private trySlide() {
    if (!this.grounded && this.y > 0.35) return;
    this.sliding = SLIDE_TIME;
    this.slides++;
    this.audio.play("slide");
  }

  private frame() {
    if (this.disposed) return;
    this.timer.update();
    const raw = Math.min(this.timer.getDelta(), 0.1);
    this.fpsFrames++;
    this.fpsTime += raw;
    if (this.fpsTime >= 0.6) {
      const fps = this.fpsFrames / this.fpsTime;
      this.fpsEma = this.fpsEma * 0.65 + fps * 0.35;
      this.fpsFrames = 0;
      this.fpsTime = 0;
      if (this.qualitySetting === "auto") {
        if (this.fpsEma < 28 && this.quality > 0) this.applyQuality((this.quality - 1) as QualityLevel);
        else if (this.fpsEma > 56 && this.quality < 2) this.applyQuality((this.quality + 1) as QualityLevel);
      }
    }

    if (this.mode !== "paused") {
      this.acc += raw;
      let steps = 0;
      while (this.acc >= FIXED_DT && steps < MAX_STEPS) {
        this.fixed(FIXED_DT);
        this.acc -= FIXED_DT;
        steps++;
      }
      if (steps === MAX_STEPS) this.acc = 0;
      this.visual(raw);
    }

    this.audio.tick(raw, this.mode === "play" || this.mode === "attract", this.speed);
    this.renderer.render(this.scene, this.camera);
    this.hudAcc += raw;
    if (this.hudAcc > 0.08) {
      this.hudAcc = 0;
      this.pushHud(false);
    }
  }

  private charMult() {
    const ch = characterById(this.saveRef.selected);
    return {
      magnet: ch.magnet * upgradeMult(this.saveRef.upgrades.magnet),
      shield: ch.shield * upgradeMult(this.saveRef.upgrades.shield),
      coin: ch.coin * upgradeMult(this.saveRef.upgrades.fortune),
      jump: ch.jump * upgradeMult(this.saveRef.upgrades.spring),
    };
  }

  private fixed(dt: number) {
    this.time += dt;
    const play = this.mode === "play";
    const actions = this.input.sample();
    if (play) {
      if (actions.pause) {
        this.pause();
        this.hooks.onPause();
        return;
      }
      if (actions.laneLeft) this.tryLane(-1);
      if (actions.laneRight) this.tryLane(1);
      if (actions.jump) this.tryJump();
      if (actions.slide) this.trySlide();
      if (this.queuedLane !== null && Math.abs(this.x - LANE_X[this.lane]!) < 0.2) {
        const q = this.queuedLane;
        this.queuedLane = null;
        if (q !== this.lane) this.tryLane(q > this.lane ? 1 : -1);
      }
    }

    const targetSpeed =
      this.mode === "attract"
        ? ATTRACT_SPEED
        : Math.min(MAX_SPEED, BASE_SPEED + this.distance * SPEED_PER_METER);
    const boost = (this.active.boost > 0 ? 1.32 : 1) * (this.padBoost > 0 ? PAD_BOOST_MULT : 1);
    this.speed += (targetSpeed * boost - this.speed) * Math.min(1, dt * 2.4);

    if (this.mode === "dead") {
      this.crashT += dt;
      this.y = Math.max(0, this.y + this.vy * dt);
      this.vy += GRAVITY * dt * 0.4;
      if (this.crashT > 1.05 && this.deadStats) {
        const stats = this.deadStats;
        this.deadStats = null;
        this.hooks.onOver(stats);
      }
      this.scroll(dt);
      return;
    }

    this.x += (LANE_X[this.lane]! - this.x) * (1 - Math.exp(-LANE_SNAP * dt));

    if (this.sliding > 0) this.sliding = Math.max(0, this.sliding - dt);
    if (this.jumpBuf > 0) this.jumpBuf -= dt;
    if (this.grounded) this.coyote = COYOTE;
    else this.coyote = Math.max(0, this.coyote - dt);

    const overGap = this.mode === "play" && this.gapUnder();
    const platform = this.platformTop();
    const deck = this.active.deck > 0;
    const floor = platform ?? (overGap && !deck ? -99 : deck ? 0.22 : 0);
    if (!this.grounded || this.y > floor + 0.08 || (overGap && !deck && !platform)) {
      this.vy += GRAVITY * dt;
      this.y += this.vy * dt;
      if (this.y <= floor && this.vy <= 0 && !(overGap && !deck && !platform)) {
        this.y = floor;
        this.vy = 0;
        this.grounded = true;
        this.audio.play("land");
        if (this.jumpBuf > 0) this.tryJump();
      } else {
        this.grounded = false;
      }
      if (this.y < -1.6) {
        if (play) this.die();
        else {
          this.y = 0;
          this.vy = 0;
          this.grounded = true;
        }
      }
    } else {
      this.y = floor;
      this.grounded = true;
    }

    this.scroll(dt);
    this.distance += this.speed * dt;
    const mult = this.active.double > 0 ? 2 : 1;
    this.score += this.speed * dt * mult;
    this.comboT = Math.max(0, this.comboT - dt);
    if (this.comboT <= 0) this.combo = 0;

    for (const k of Object.keys(this.active) as PowerId[]) {
      if (this.active[k] > 0) this.active[k] = Math.max(0, this.active[k] - dt);
    }
    if (this.padBoost > 0) this.padBoost = Math.max(0, this.padBoost - dt);
    this.trauma = Math.max(0, this.trauma - dt * 1.8);
    this.fovPunch = Math.max(0, this.fovPunch - dt * 2.4);

    if (play) {
      this.collectCoins();
      this.collectPowers();
      this.hitObstacles();
    }
    this.recycleSections();
  }

  private scroll(dt: number) {
    const dz = this.speed * dt;
    for (const s of this.sections) {
      s.z += dz;
      s.group.position.z = s.z;
    }
    for (const c of this.coins) if (c.alive) c.z += dz;
    for (const o of this.obs) {
      if (!o.alive) continue;
      o.z += dz + o.vz * dt;
      if (o.kind === "gate") {
        const a = LANE_X[Math.max(0, o.lane - 1)]!;
        const b = LANE_X[Math.min(2, o.lane + 1)]!;
        o.x = (a + b) * 0.5 + (b - a) * 0.5 * Math.sin(this.time * 1.35 + o.phase);
      }
    }
    for (const p of this.powers) if (p.alive) p.z += dz;
    for (const s of this.sparks) if (s.alive) s.z += dz;
  }

  private recycleSections() {
    for (const sec of this.sections) {
      if (sec.z > SECTION_LEN + 8) {
        let minZ = Infinity;
        for (const s of this.sections) minZ = Math.min(minZ, s.z);
        this.cullBehind(sec.z, sec.z + SECTION_LEN);
        this.placeSection(sec, minZ - SECTION_LEN);
      }
    }
    for (const c of this.coins) if (c.alive && c.z > 10) c.alive = false;
    for (const o of this.obs) if (o.alive && o.z > 12) o.alive = false;
    for (const p of this.powers) {
      if (p.alive && p.z > 10) {
        p.alive = false;
        p.mesh.visible = false;
      }
    }
  }

  private cullBehind(z0: number, z1: number) {
    for (const c of this.coins) if (c.alive && c.z >= z0 - 1 && c.z <= z1 + 1) c.alive = false;
    for (const o of this.obs) if (o.alive && o.z >= z0 - 1 && o.z <= z1 + 1) o.alive = false;
  }

  private playerBox() {
    const sliding = this.sliding > 0;
    const hh = sliding ? 0.38 : 0.82;
    const cy = sliding ? 0.4 : this.y + hh;
    return { x: this.x, y: cy, z: 0, hx: PLAYER_HALF_W, hy: hh, hz: PLAYER_HALF_D };
  }

  private gapUnder() {
    const p = this.playerBox();
    for (const o of this.obs) {
      if (!o.alive || o.kind !== "gap") continue;
      if (Math.abs(p.x - o.x) < 0.95 && Math.abs(p.z - o.z) < o.sz * 0.5 + 0.2) return true;
    }
    return false;
  }

  private collectCoins() {
    const p = this.playerBox();
    const magnet = this.active.magnet > 0;
    const cm = this.charMult().coin;
    for (const c of this.coins) {
      if (!c.alive) continue;
      if (magnet && c.z < MAGNET_RANGE && c.z > -1.5) {
        c.x += (this.x - c.x) * 0.18;
        c.y += (this.y + 1.05 - c.y) * 0.18;
        c.z += (0.2 - c.z) * 0.16;
      }
      const dx = c.x - p.x;
      const dy = c.y - p.y;
      const dz = c.z - p.z;
      if (dx * dx + dy * dy + dz * dz < 0.72) {
        c.alive = false;
        this.runCoins += 1;
        this.combo += 1;
        this.comboT = 1.35;
        this.maxCombo = Math.max(this.maxCombo, this.combo);
        const bonus = 1 + Math.min(8, this.combo) * 0.08;
        const double = this.active.double > 0 ? 2 : 1;
        this.score += COIN_SCORE * bonus * double * cm;
        this.audio.play("coin");
        this.spark(c.x, c.y, c.z);
        this.fovPunch = Math.min(1, this.fovPunch + 0.08);
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(8);
      }
    }
  }

  private collectPowers() {
    const p = this.playerBox();
    const m = this.charMult();
    for (const slot of this.powers) {
      if (!slot.alive) continue;
      if (aabbOverlap(p.x, p.y, p.z, p.hx, p.hy, p.hz, slot.x, slot.y, slot.z, 0.4, 0.4, 0.4)) {
        slot.alive = false;
        slot.mesh.visible = false;
        const dur = POWER_DURATION[slot.id] * (slot.id === "magnet" ? m.magnet : slot.id === "shield" ? m.shield : 1);
        this.active[slot.id] = dur;
        this.powerPicks++;
        if (slot.id === "magnet") this.usedMagnet = true;
        if (slot.id === "deck") this.usedDeck = true;
        this.audio.play("power");
        this.fovPunch = 0.6;
      }
    }
  }

  private platformTop(): number | null {
    let top: number | null = null;
    for (const o of this.obs) {
      if (!o.alive || (o.kind !== "train" && o.kind !== "boat")) continue;
      const roof = o.y + o.sy * 0.5;
      const onX = Math.abs(this.x - o.x) < o.sx * 0.48;
      const onZ = Math.abs(o.z) < o.sz * 0.5 + 0.22;
      if (!onX || !onZ) continue;
      if (this.y >= roof - 0.62 && this.vy <= 5.5) {
        if (top === null || roof > top) top = roof;
        if (!o.ridden && this.mode === "play") {
          o.ridden = true;
          if (o.kind === "train") this.trainsRidden++;
          else this.boatsRidden++;
          this.audio.play(o.kind === "boat" ? "splash" : "land");
        }
      }
    }
    return top;
  }

  private hitObstacles() {
    const p = this.playerBox();
    const deck = this.active.deck > 0;
    for (const o of this.obs) {
      if (!o.alive || o.kind === "gap") continue;
      if (o.kind === "pad") {
        this.tryPad(o, p);
        continue;
      }
      if (o.kind === "ramp") {
        this.tryRamp(o, p);
        continue;
      }
      if ((o.kind === "train" || o.kind === "boat") && this.platformTop() !== null) {
        const roof = o.y + o.sy * 0.5;
        if (Math.abs(this.x - o.x) < o.sx * 0.48 && Math.abs(o.z) < o.sz * 0.5 + 0.22 && this.y >= roof - 0.7) {
          continue;
        }
      }
      if (deck && (o.kind === "barrier" || o.kind === "sign")) continue;

      const hx = o.sx * 0.42;
      const hy = o.sy * 0.42;
      const hz = o.sz * 0.42;
      if (!aabbOverlap(p.x, p.y, p.z, p.hx, p.hy, p.hz, o.x, o.y, o.z, hx, hy, hz)) continue;

      if (o.kind === "barrier" && this.y > 0.72) continue;
      if (o.kind === "sign" && this.sliding > 0) continue;

      if (this.active.shield > 0) {
        this.active.shield = 0;
        this.shieldSave = true;
        o.alive = false;
        this.trauma = 0.45;
        this.audio.play("whoosh");
        continue;
      }
      this.die();
      return;
    }
  }

  private tryPad(o: ObsSlot, p: ReturnType<GameEngine["playerBox"]>) {
    if (o.used) return;
    if (!aabbOverlap(p.x, p.y, p.z, p.hx + 0.2, p.hy, p.hz + 0.3, o.x, o.y, o.z, o.sx * 0.45, 0.4, o.sz * 0.45)) return;
    o.used = true;
    this.padBoost = PAD_BOOST_TIME;
    this.padsHit++;
    this.fovPunch = 0.7;
    this.audio.play("boost");
    this.spark(o.x, 0.4, o.z);
  }

  private tryRamp(o: ObsSlot, p: ReturnType<GameEngine["playerBox"]>) {
    if (o.used) return;
    if (!aabbOverlap(p.x, p.y, p.z, p.hx, p.hy, p.hz + 0.2, o.x, o.y, o.z, o.sx * 0.42, o.sy * 0.5, o.sz * 0.42)) return;
    if (this.y > 1.5 && this.vy > 2) return;
    o.used = true;
    const ch = characterById(this.saveRef.selected);
    const spring = upgradeMult(this.saveRef.upgrades.spring) * ch.jump;
    const superM = this.active.superjump > 0 ? SUPER_JUMP_MULT : 1;
    this.vy = RAMP_VY * spring * superM;
    this.grounded = false;
    this.audio.play("jump");
    this.fovPunch = 0.45;
  }

  private die() {
    if (this.mode !== "play") return;
    this.mode = "dead";
    this.crashing = true;
    this.crashT = 0;
    this.vy = 3;
    this.trauma = 1;
    this.input.setEnabled(false);
    this.audio.play("hit");
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([30, 40, 30]);
    this.deadStats = {
      score: Math.floor(this.score),
      coins: this.runCoins,
      distance: this.distance,
      jumps: this.jumps,
      slides: this.slides,
      powers: this.powerPicks,
      combo: this.maxCombo,
      shieldSave: this.shieldSave,
      usedMagnet: this.usedMagnet,
      usedDeck: this.usedDeck,
      trains: this.trainsRidden,
      boats: this.boatsRidden,
      pads: this.padsHit,
    };
  }

  private spark(x: number, y: number, z: number) {
    const s = this.sparks.find((k) => !k.alive);
    if (!s) return;
    s.alive = true;
    s.x = x;
    s.y = y;
    s.z = z;
    s.life = 0.28;
    s.mesh.visible = true;
  }

  private visual(dt: number) {
    this.runner.root.position.set(this.x, this.y, 0);
    this.runner.update(dt, {
      speed: this.speed,
      grounded: this.grounded,
      sliding: this.sliding > 0,
      crashing: this.crashing,
      y: this.y,
      vy: this.vy,
      board: this.active.deck > 0,
    });

    dummy.rotation.set(0, this.time * 4.2, 0);
    for (let i = 0; i < this.coins.length; i++) {
      const c = this.coins[i]!;
      if (!c.alive) {
        dummy.position.set(0, -20, 0);
        dummy.scale.set(0, 0, 0);
      } else {
        dummy.position.set(c.x, c.y, c.z);
        dummy.scale.set(1, 1, 1);
      }
      dummy.updateMatrix();
      this.coinMesh.setMatrixAt(i, dummy.matrix);
    }
    this.coinMesh.instanceMatrix.needsUpdate = true;

    dummy.rotation.set(0, 0, 0);
    let oi = 0;
    let ti = 0;
    let bi = 0;
    for (let i = 0; i < this.obs.length; i++) {
      const o = this.obs[i]!;
      if (!o.alive) continue;
      dummy.position.set(o.x, o.y, o.z);
      dummy.scale.set(o.sx, o.sy, o.sz);
      dummy.updateMatrix();
      _color.setHex(o.tint);
      if (o.kind === "train") {
        if (ti < MAX_TRAINS) {
          this.trainMesh.setMatrixAt(ti, dummy.matrix);
          this.trainMesh.setColorAt(ti, _color);
          ti++;
        }
      } else if (o.kind === "boat") {
        if (bi < MAX_BOATS) {
          this.boatMesh.setMatrixAt(bi, dummy.matrix);
          this.boatMesh.setColorAt(bi, _color);
          bi++;
        }
      } else {
        this.obsMesh.setMatrixAt(oi, dummy.matrix);
        this.obsMesh.setColorAt(oi, _color);
        oi++;
      }
    }
    dummy.position.set(0, -20, 0);
    dummy.scale.set(0, 0, 0);
    dummy.updateMatrix();
    for (let i = oi; i < MAX_OBS; i++) this.obsMesh.setMatrixAt(i, dummy.matrix);
    for (let i = ti; i < MAX_TRAINS; i++) this.trainMesh.setMatrixAt(i, dummy.matrix);
    for (let i = bi; i < MAX_BOATS; i++) this.boatMesh.setMatrixAt(i, dummy.matrix);
    this.obsMesh.instanceMatrix.needsUpdate = true;
    this.trainMesh.instanceMatrix.needsUpdate = true;
    this.boatMesh.instanceMatrix.needsUpdate = true;
    if (this.obsMesh.instanceColor) this.obsMesh.instanceColor.needsUpdate = true;
    if (this.trainMesh.instanceColor) this.trainMesh.instanceColor.needsUpdate = true;
    if (this.boatMesh.instanceColor) this.boatMesh.instanceColor.needsUpdate = true;

    for (const p of this.powers) {
      if (!p.alive) continue;
      p.mesh.position.set(p.x, p.y + Math.sin(this.time * 4 + p.z) * 0.12, p.z);
      p.mesh.rotation.y += dt * 2.4;
    }
    for (const s of this.sparks) {
      if (!s.alive) continue;
      s.life -= dt;
      s.y += dt * 1.6;
      s.mesh.position.set(s.x, s.y, s.z);
      s.mesh.scale.setScalar(Math.max(0.1, s.life * 4));
      if (s.life <= 0) {
        s.alive = false;
        s.mesh.visible = false;
      }
    }

    const boost = this.active.boost > 0 || this.padBoost > 0;
    const lookX = this.x * 0.72;
    const desired = {
      x: this.x * 0.38,
      y: 3.35 + this.y * 0.18 + (this.sliding > 0 ? -0.25 : 0) + (this.active.deck > 0 ? 0.15 : 0),
      z: boost ? 7.1 : 8.05,
      fov: (this.camera.aspect < 1 ? 62 : 54) + (boost ? 7 : 0) + this.fovPunch * 4,
    };
    const k = 1 - Math.exp(-6.2 * dt);
    this.cam.x += (desired.x - this.cam.x) * k;
    this.cam.y += (desired.y - this.cam.y) * k;
    this.cam.z += (desired.z - this.cam.z) * k;
    this.cam.fov += (desired.fov - this.cam.fov) * k;

    let sx = 0;
    let sy = 0;
    if (this.shakeOn && this.trauma > 0) {
      const mag = this.trauma * this.trauma;
      sx = (Math.random() * 2 - 1) * mag * 0.28;
      sy = (Math.random() * 2 - 1) * mag * 0.18;
    }
    this.camera.position.set(this.cam.x + sx, this.cam.y + sy, this.cam.z);
    this.camera.lookAt(lookX, 1.05 + this.y * 0.25, -6.2);
    if (Math.abs(this.camera.fov - this.cam.fov) > 0.05) {
      this.camera.fov = this.cam.fov;
      this.camera.updateProjectionMatrix();
    }
    this.skyline.position.x = this.cam.x * 0.15;
    this.sun.position.x = -28 + this.cam.x * 0.05;
    this.tintBiome(dt);
  }

  private currentBiome(): Biome {
    for (const s of this.sections) {
      if (s.z <= 4 && s.z + SECTION_LEN > 4) return s.biome;
    }
    return this.zone;
  }

  private tintBiome(dt: number) {
    this.zone = this.currentBiome();
    const pal = BIOME_FOG[this.zone];
    const k = 1 - Math.exp(-1.8 * dt);
    this.fogTarget.setHex(pal.fog);
    this.skyTarget.setHex(pal.sky);
    this.fogCol.lerp(this.fogTarget, k);
    this.skyCol.lerp(this.skyTarget, k);
    (this.scene.fog as THREE.Fog).color.copy(this.fogCol);
    (this.scene.background as THREE.Color).copy(this.skyCol);
    this.renderer.setClearColor(this.skyCol, 1);
  }

  private pushHud(force: boolean) {
    if (!force && this.mode === "attract") return;
    this.hooks.onHud({
      score: Math.floor(this.score),
      coins: this.runCoins,
      distance: Math.floor(this.distance),
      combo: this.combo,
      fps: Math.round(this.fpsEma),
      speed: this.speed,
      powers: (Object.keys(this.active) as PowerId[])
        .filter((id) => this.active[id] > 0)
        .map((id) => ({ id, t: this.active[id], max: POWER_DURATION[id] })),
      shield: this.active.shield > 0,
      zone: BIOME_LABEL[this.zone],
      pad: this.padBoost > 0,
      board: this.active.deck > 0,
    });
  }
}

declare global {
  interface Window {
    __controlsTest?: {
      getYaw: () => number;
      getSpeed: () => number;
      setKeys: (codes: string[]) => void;
      setSteer?: (v: number) => void;
    };
  }
}
