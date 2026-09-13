import * as THREE from "three";
import type { CharacterDef } from "./constants";

function mat(color: number, extras?: THREE.MeshLambertMaterialParameters) {
  return new THREE.MeshLambertMaterial({ color, ...extras });
}

function box(
  w: number,
  h: number,
  d: number,
  material: THREE.Material,
  y = 0,
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.y = y;
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  return mesh;
}

export class RunnerRig {
  readonly root = new THREE.Group();
  private hip = new THREE.Group();
  private torso = new THREE.Group();
  private head = new THREE.Group();
  private armL = new THREE.Group();
  private armR = new THREE.Group();
  private legL = new THREE.Group();
  private legR = new THREE.Group();
  private shinL = new THREE.Group();
  private shinR = new THREE.Group();
  private scarf = new THREE.Group();
  private visor: THREE.Mesh;
  private shadow: THREE.Mesh;
  private board: THREE.Mesh;
  private mats: THREE.MeshLambertMaterial[] = [];
  private runT = 0;
  private crashT = 0;
  private squash = 1;

  constructor() {
    const skin = mat(0xe0b089);
    const jacket = mat(0x2f7f7a);
    const pants = mat(0x24303a);
    const visorM = mat(0xc45c4a, { emissive: 0x401810, emissiveIntensity: 0.35 });
    const hair = mat(0x1a1e24);
    const scarfM = mat(0xd9cbb6);
    const shoes = mat(0x151a20);
    this.mats = [skin, jacket, pants, visorM, hair, scarfM, shoes];

    this.hip.position.y = 0.92;
    this.root.add(this.hip);

    this.legL.position.set(-0.13, 0, 0);
    this.legR.position.set(0.13, 0, 0);
    const thighL = box(0.16, 0.38, 0.18, pants, -0.19);
    const thighR = box(0.16, 0.38, 0.18, pants, -0.19);
    this.legL.add(thighL);
    this.legR.add(thighR);
    this.shinL.position.y = -0.38;
    this.shinR.position.y = -0.38;
    this.shinL.add(box(0.14, 0.36, 0.16, pants, -0.18));
    this.shinR.add(box(0.14, 0.36, 0.16, pants, -0.18));
    this.shinL.add(box(0.18, 0.1, 0.28, shoes, -0.4));
    this.shinR.add(box(0.18, 0.1, 0.28, shoes, -0.4));
    this.legL.add(this.shinL);
    this.legR.add(this.shinR);
    this.hip.add(this.legL, this.legR);

    this.torso.position.y = 0.12;
    this.torso.add(box(0.42, 0.5, 0.26, jacket, 0.28));
    this.hip.add(this.torso);

    this.armL.position.set(-0.28, 0.42, 0);
    this.armR.position.set(0.28, 0.42, 0);
    this.armL.add(box(0.12, 0.42, 0.12, jacket, -0.16));
    this.armR.add(box(0.12, 0.42, 0.12, jacket, -0.16));
    this.armL.add(box(0.1, 0.12, 0.1, skin, -0.4));
    this.armR.add(box(0.1, 0.12, 0.1, skin, -0.4));
    this.torso.add(this.armL, this.armR);

    this.head.position.y = 0.64;
    this.head.add(box(0.32, 0.3, 0.3, skin, 0.08));
    this.head.add(box(0.34, 0.12, 0.32, hair, 0.22));
    this.visor = box(0.34, 0.1, 0.08, visorM, 0.1);
    this.visor.position.z = -0.16;
    this.head.add(this.visor);
    this.torso.add(this.head);

    this.scarf.position.set(0, 0.48, 0.12);
    this.scarf.add(box(0.18, 0.08, 0.22, scarfM, 0));
    const s2 = box(0.14, 0.06, 0.28, scarfM, -0.08);
    s2.position.z = 0.2;
    this.scarf.add(s2);
    this.torso.add(this.scarf);

    const shadowGeo = new THREE.CircleGeometry(0.42, 10);
    shadowGeo.rotateX(-Math.PI / 2);
    this.shadow = new THREE.Mesh(
      shadowGeo,
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28 }),
    );
    this.shadow.position.y = 0.02;
    this.root.add(this.shadow);

    this.board = box(0.46, 0.06, 0.95, mat(0x2a3442), 0.05);
    this.board.visible = false;
    this.root.add(this.board);

    this.root.rotation.y = 0;
  }

  apply(def: CharacterDef) {
    const set = (i: number, hex: number) => {
      const m = this.mats[i];
      if (m) m.color.setHex(hex);
    };
    set(0, def.skin);
    set(1, def.jacket);
    set(2, def.pants);
    set(3, def.visor);
    this.mats[3]!.emissive.setHex(def.visor);
    this.mats[3]!.emissiveIntensity = 0.22;
    set(4, def.hair);
    set(5, def.scarf);
    set(6, def.shoes);
  }

  update(
    dt: number,
    state: {
      speed: number;
      grounded: boolean;
      sliding: boolean;
      crashing: boolean;
      y: number;
      vy: number;
      board?: boolean;
    },
  ) {
    if (state.crashing) {
      this.crashT += dt;
      this.root.rotation.x = Math.min(1.2, this.crashT * 3.2);
      this.root.rotation.z = Math.sin(this.crashT * 9) * 0.25;
      this.hip.position.y = Math.max(0.35, 0.92 - this.crashT * 1.4);
      return;
    }
    this.crashT = 0;
    this.root.rotation.x = 0;
    this.root.rotation.z = 0;

    if (state.sliding) {
      this.hip.rotation.x = 1.05;
      this.hip.position.y = 0.52;
      this.armL.rotation.x = 0.6;
      this.armR.rotation.x = -0.9;
      this.legL.rotation.x = -0.2;
      this.legR.rotation.x = 0.35;
      this.shinL.rotation.x = 0.6;
      this.shinR.rotation.x = 0.2;
      this.squash = 0.88;
    } else if (!state.grounded) {
      this.hip.rotation.x = 0.12;
      this.hip.position.y = 0.92;
      const tuck = 0.55;
      this.legL.rotation.x = -tuck;
      this.legR.rotation.x = -tuck * 0.7;
      this.shinL.rotation.x = 1.1;
      this.shinR.rotation.x = 0.9;
      this.armL.rotation.x = -0.8;
      this.armR.rotation.x = 0.5;
      this.squash = state.vy > 0 ? 1.12 : 1.04;
    } else {
      this.hip.rotation.x = 0.08;
      this.runT += dt * (7.2 + state.speed * 0.18);
      const a = Math.sin(this.runT);
      const b = Math.sin(this.runT + Math.PI);
      this.legL.rotation.x = a * 0.85;
      this.legR.rotation.x = b * 0.85;
      this.shinL.rotation.x = Math.max(0, -a) * 0.7;
      this.shinR.rotation.x = Math.max(0, -b) * 0.7;
      this.armL.rotation.x = b * 0.7;
      this.armR.rotation.x = a * 0.7;
      this.hip.position.y = 0.9 + Math.abs(Math.sin(this.runT * 2)) * 0.045;
      this.torso.rotation.y = a * 0.08;
      this.squash = 1;
    }

    this.root.scale.set(1 / Math.sqrt(this.squash), this.squash, 1 / Math.sqrt(this.squash));
    const scarfWave = Math.sin(this.runT * 1.6) * 0.25;
    this.scarf.rotation.x = 0.35 + scarfWave;
    this.board.visible = !!state.board && !state.sliding && !state.crashing;
    this.board.position.y = state.grounded ? 0.04 : 0.08;
    this.shadow.scale.setScalar(state.grounded ? 1 : 0.55 + Math.min(0.4, state.y * 0.12));
    (this.shadow.material as THREE.MeshBasicMaterial).opacity = state.grounded ? 0.28 : 0.12;
  }

  reset() {
    this.crashT = 0;
    this.runT = 0;
    this.root.rotation.set(0, 0, 0);
    this.hip.position.y = 0.92;
    this.hip.rotation.x = 0;
    this.root.scale.set(1, 1, 1);
    this.board.visible = false;
  }

  dispose() {
    this.root.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        const m = obj.material;
        if (Array.isArray(m)) m.forEach((x) => x.dispose());
        else m.dispose();
      }
    });
  }
}
