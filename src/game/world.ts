import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import {
  BIOME_ORDER,
  LANE_X,
  SECTION_LEN,
  type Biome,
  type ObstacleKind,
  type PowerId,
} from "./constants";

const _col = new THREE.Color();

function paint(geo: THREE.BufferGeometry, hex: number, jitter = 0) {
  if (jitter) {
    _col.setHex(hex);
    _col.offsetHSL((Math.random() - 0.5) * jitter, 0, (Math.random() - 0.5) * jitter * 0.6);
  } else {
    _col.setHex(hex);
  }
  const n = geo.getAttribute("position").count;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    arr[i * 3] = _col.r;
    arr[i * 3 + 1] = _col.g;
    arr[i * 3 + 2] = _col.b;
  }
  geo.setAttribute("color", new THREE.Float32BufferAttribute(arr, 3));
  return geo;
}

function box(w: number, h: number, d: number, x: number, y: number, z: number, hex: number, jitter = 0) {
  const g = new THREE.BoxGeometry(w, h, d);
  g.translate(x, y, z);
  return paint(g, hex, jitter);
}

function cyl(
  rTop: number,
  rBot: number,
  h: number,
  x: number,
  y: number,
  z: number,
  hex: number,
  segs = 6,
) {
  const g = new THREE.CylinderGeometry(rTop, rBot, h, segs);
  g.translate(x, y, z);
  return paint(g, hex);
}

export type Spawn = {
  kind: ObstacleKind | "coin" | "power";
  lane: number;
  z: number;
  y?: number;
  power?: PowerId;
  phase?: number;
  vz?: number;
};

export type BuiltSection = {
  geometry: THREE.BufferGeometry;
  spawns: Spawn[];
  biome: Biome;
};

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(r: () => number, arr: T[]): T {
  return arr[Math.floor(r() * arr.length) % arr.length]!;
}

const POWERS: PowerId[] = ["magnet", "shield", "boost", "double", "superjump", "deck"];

function biomeAt(distance: number, sectionIndex: number): Biome {
  const cycle = 200;
  const t = (distance + sectionIndex * 8) % (cycle * BIOME_ORDER.length);
  return BIOME_ORDER[Math.floor(t / cycle) % BIOME_ORDER.length]!;
}

function decorateDowntown(parts: THREE.BufferGeometry[], r: () => number) {
  const palette = [0xe8d5c4, 0xd4a574, 0xc46c4a, 0x6b9e9a, 0xf0e6d8, 0x7a8b9c, 0xb07050];
  for (const side of [-1, 1]) {
    let z = 2;
    while (z < SECTION_LEN - 2) {
      const w = 2.4 + r() * 2.2;
      const d = 3.2 + r() * 4.2;
      const h = 5 + r() * 14;
      const x = side * (5.4 + r() * 1.4);
      const cz = z + d * 0.5;
      parts.push(box(w, h, d, x, h * 0.5, cz, pick(r, palette), 0.04));
      if (r() > 0.45) {
        parts.push(box(w + 0.3, 0.18, d + 0.3, x, h + 0.05, cz, 0xd8c4b0));
      }
      if (r() > 0.55) {
        parts.push(box(w * 0.7, 0.12, 0.7, x - side * 0.2, 2.2, cz, 0xc45c4a));
      }
      z += d + 0.35 + r() * 0.8;
    }
  }
}

function decoratePark(parts: THREE.BufferGeometry[], r: () => number) {
  parts.push(box(18, 0.08, SECTION_LEN, -11, 0.02, SECTION_LEN * 0.5, 0x5c8c54));
  parts.push(box(18, 0.08, SECTION_LEN, 11, 0.02, SECTION_LEN * 0.5, 0x6a9a62));
  for (const side of [-1, 1]) {
    for (let i = 0; i < 5; i++) {
      const z = 4 + i * 7.5 + r() * 2;
      const x = side * (6.2 + r() * 2.5);
      const th = 1.1 + r() * 0.5;
      parts.push(cyl(0.16, 0.22, th, x, th * 0.5, z, 0x6b4a32, 5));
      const ch = 1.6 + r() * 1.1;
      parts.push(cyl(0.08, 1.15, ch, x, th + ch * 0.45, z, r() > 0.5 ? 0x3d6b3a : 0x4a7a44, 6));
    }
    parts.push(box(1.4, 0.45, 0.45, side * 6.4, 0.35, 10 + r() * 20, 0x6b5340));
  }
}

function decorateBridge(parts: THREE.BufferGeometry[], r: () => number) {
  parts.push(box(28, 0.4, SECTION_LEN, 0, -1.6, SECTION_LEN * 0.5, 0x3d6a7a));
  for (const side of [-1, 1]) {
    parts.push(box(0.18, 1.1, SECTION_LEN, side * 4.1, 0.7, SECTION_LEN * 0.5, 0x6d7884));
    for (let i = 0; i < 6; i++) {
      const z = 3 + i * 6.6;
      parts.push(box(0.12, 7, 0.12, side * 4.1, 4.2, z, 0x4a5058));
    }
    parts.push(box(0.7, 9, 0.7, side * 5.6, 4.6, SECTION_LEN * 0.5, 0x5a6570));
  }
  if (r() > 0.4) {
    parts.push(box(1.2, 0.15, 8, 0, 6.4, SECTION_LEN * 0.5, 0x6d7884));
  }
}

function decorateTunnel(parts: THREE.BufferGeometry[]) {
  parts.push(box(1.4, 5.4, SECTION_LEN, -4.6, 2.6, SECTION_LEN * 0.5, 0x3a444e));
  parts.push(box(1.4, 5.4, SECTION_LEN, 4.6, 2.6, SECTION_LEN * 0.5, 0x3a444e));
  parts.push(box(10.6, 0.8, SECTION_LEN, 0, 5.4, SECTION_LEN * 0.5, 0x2a323c));
  for (let i = 0; i < 8; i++) {
    const z = 3 + i * 5;
    parts.push(box(0.4, 0.12, 1.6, -3.7, 4.6, z, 0xf0d9a8));
    parts.push(box(0.4, 0.12, 1.6, 3.7, 4.6, z, 0xf0d9a8));
    parts.push(box(0.18, 4.6, 0.18, -4.1, 2.4, z, i % 2 ? 0xc45c4a : 0x8eb9b6));
  }
}

function decorateRail(parts: THREE.BufferGeometry[], r: () => number) {
  parts.push(box(0.12, 0.08, SECTION_LEN, -0.72, 0.06, SECTION_LEN * 0.5, 0x3a3a40));
  parts.push(box(0.12, 0.08, SECTION_LEN, 0.72, 0.06, SECTION_LEN * 0.5, 0x3a3a40));
  parts.push(box(0.12, 0.08, SECTION_LEN, -2.9, 0.06, SECTION_LEN * 0.5, 0x3a3a40));
  parts.push(box(0.12, 0.08, SECTION_LEN, 2.9, 0.06, SECTION_LEN * 0.5, 0x3a3a40));
  const crates = [0xb85c38, 0x3d6a7a, 0xc4a35a, 0x5a6570];
  for (const side of [-1, 1]) {
    let z = 3;
    while (z < SECTION_LEN - 4) {
      const d = 3.2 + r() * 2.4;
      const h = 2.2 + r() * 2.4;
      parts.push(box(2.4, h, d, side * 6.4, h * 0.5, z + d * 0.5, pick(r, crates), 0.03));
      z += d + 1.2 + r() * 2;
    }
    parts.push(box(0.2, 3.4, 0.2, side * 4.6, 1.8, 8, 0x4a5058));
    parts.push(box(0.2, 3.4, 0.2, side * 4.6, 1.8, 28, 0x4a5058));
    parts.push(box(0.16, 0.16, 22, side * 4.6, 3.5, 18, 0x2a3038));
  }
}

function decorateHarbor(parts: THREE.BufferGeometry[], r: () => number) {
  parts.push(box(30, 0.16, SECTION_LEN, 0, -1.15, SECTION_LEN * 0.5, 0x3a6e7c));
  parts.push(box(8.2, 0.22, SECTION_LEN, 0, -0.08, SECTION_LEN * 0.5, 0x7a6248));
  for (let i = 0; i < 12; i++) {
    parts.push(box(8.0, 0.05, 0.28, 0, 0.06, 1.6 + i * 3.4, 0x6b5340));
  }
  for (const side of [-1, 1]) {
    parts.push(box(10, 0.12, SECTION_LEN, side * 11.5, -0.95, SECTION_LEN * 0.5, 0x2f5f6c));
    const wareH = 4.2 + r() * 2.4;
    parts.push(box(3.6, wareH, 8.4, side * 7.2, wareH * 0.5, 10 + r() * 6, 0xb8a888, 0.03));
    parts.push(box(3.2, 0.2, 8.6, side * 7.2, wareH + 0.08, 12, 0x8a7860));
    parts.push(box(0.22, 7.4, 0.22, side * 6.4, 3.8, 28, 0x5a6570));
    parts.push(box(0.16, 0.16, 4.6, side * 6.4, 7.5, 28, 0x4a5058));
    parts.push(box(0.12, 0.9, 0.9, side * 6.4, 7.2, 26.2, 0xc45c4a));
    if (r() > 0.4) {
      parts.push(cyl(0.08, 0.14, 1.1, side * 5.4, 0.2, 6 + r() * 24, 0xc4a15a, 5));
    }
  }
}

function otherLane(safe: number, r: () => number) {
  const a = (safe + 1) % 3;
  const b = (safe + 2) % 3;
  return r() > 0.5 ? a : b;
}

function layoutSpawns(r: () => number, difficulty: number, distance: number, biome: Biome): Spawn[] {
  const spawns: Spawn[] = [];
  let safe = 1;
  const rowGap = Math.max(8.4, 12.8 - difficulty * 0.85);
  let z = 6 + r() * 3;
  let rows = 0;

  const pushCoins = (lane: number, at: number, y = 0.85, n = 2, step = 1.35) => {
    for (let i = 0; i < n; i++) {
      if (r() > 0.22) spawns.push({ kind: "coin", lane, z: at + i * step, y });
    }
  };

  while (z < SECTION_LEN - 7) {
    if (r() > 0.4 && rows > 0) {
      const dir = r() > 0.5 ? 1 : -1;
      safe = Math.max(0, Math.min(2, safe + dir));
    }

    if (distance < 55 && rows === 0) {
      for (let lane = 0; lane < 3; lane++) pushCoins(lane, z, 0.85, 3);
      z += rowGap;
      rows++;
      continue;
    }

    const setPiece = r();
    const canSpecial = distance > 40 && z < SECTION_LEN - 14 && rows > 0;

    if (canSpecial && (biome === "rail" || biome === "downtown") && setPiece > 0.46) {
      const tLane = otherLane(safe, r);
      const mid = z + 5;
      spawns.push({ kind: "train", lane: tLane, z: mid, vz: 1.8 + r() * 1.6 });
      for (let k = 0; k < 5; k++) {
        spawns.push({ kind: "coin", lane: tLane, z: mid - 4 + k * 1.7, y: 2.35 });
      }
      pushCoins(safe, z, 0.85, 3);
      if (r() > 0.55 && distance > 160) {
        const leftover = 3 - tLane - safe;
        if (leftover >= 0 && leftover <= 2 && leftover !== tLane && leftover !== safe) {
          spawns.push({ kind: "crate", lane: leftover, z });
        }
      }
      z += rowGap + 7;
      rows++;
      continue;
    }

    if (canSpecial && biome === "harbor" && setPiece > 0.5) {
      const bLane = otherLane(safe, r);
      const mid = z + 2.4;
      spawns.push({ kind: "boat", lane: bLane, z: mid, vz: 0.8 + r() * 1.1 });
      pushCoins(bLane, mid - 1.2, 1.75, 3, 1.2);
      if (r() > 0.45) spawns.push({ kind: "gap", lane: 3 - bLane - safe, z: z + 1.6 });
      else pushCoins(safe, z, 0.85, 2);
      z += rowGap + 4;
      rows++;
      continue;
    }

    if (distance > 90 && r() > 0.78 && z < SECTION_LEN - 10) {
      const rLane = otherLane(safe, r);
      spawns.push({ kind: "ramp", lane: rLane, z });
      spawns.push({ kind: "coin", lane: rLane, z: z - 2.2, y: 2.4 });
      spawns.push({ kind: "coin", lane: rLane, z: z - 3.4, y: 3.1 });
      spawns.push({ kind: "coin", lane: rLane, z: z - 4.6, y: 2.6 });
      pushCoins(safe, z, 0.85, 2);
      z += rowGap + 2;
      rows++;
      continue;
    }

    if (distance > 40 && r() > 0.72) {
      spawns.push({ kind: "pad", lane: safe, z });
      pushCoins(safe, z - 1.5, 0.85, 2);
    }

    const fill = Math.min(0.8, 0.2 + difficulty * 0.16);
    for (let lane = 0; lane < 3; lane++) {
      if (lane === safe) {
        if (r() > 0.5) spawns.push({ kind: "coin", lane, z });
        if (r() > 0.7) spawns.push({ kind: "coin", lane, z: z + 1.4 });
        continue;
      }
      if (r() > fill) {
        if (r() > 0.4) spawns.push({ kind: "coin", lane, z });
        continue;
      }
      const roll = r();
      let kind: ObstacleKind;
      if (biome === "harbor" && roll < 0.22) kind = "gap";
      else if (roll < 0.26) kind = "barrier";
      else if (roll < 0.46) kind = "sign";
      else if (roll < 0.66) kind = "crate";
      else if (roll < 0.82) kind = "vehicle";
      else if (roll < 0.92) kind = "gap";
      else kind = "gate";
      if (kind === "vehicle" && z > SECTION_LEN - 12) kind = "crate";
      const spawn: Spawn = { kind, lane, z };
      if (kind === "gate") spawn.phase = r() * Math.PI * 2;
      if (kind === "vehicle" && r() > 0.55) spawn.vz = 2.4 + r() * 2.2;
      spawns.push(spawn);
    }

    if (r() > 0.55) spawns.push({ kind: "coin", lane: safe, z: z + rowGap * 0.4 });
    z += rowGap + r() * 2.2;
    rows++;
  }

  if (distance > 70 && r() > 0.55) {
    const power: PowerId =
      distance > 180 && r() > 0.72 ? "deck" : pick(r, POWERS);
    spawns.push({
      kind: "power",
      lane: safe,
      z: 10 + r() * (SECTION_LEN - 18),
      power,
    });
  }
  return spawns;
}

export function buildSection(distance: number, index: number, seed: number): BuiltSection {
  const r = rng(seed + index * 9973);
  const biome = biomeAt(distance, index);
  const difficulty = Math.min(3.2, distance / 420);
  const parts: THREE.BufferGeometry[] = [];

  const roadHex =
    biome === "park" ? 0x4a5348 : biome === "tunnel" ? 0x2a3038 : biome === "harbor" ? 0x6a5644 : 0x3a4048;
  const walkHex = biome === "park" ? 0x8a9a72 : biome === "harbor" ? 0x8a7860 : 0xc5c0b5;
  parts.push(box(7.4, 0.22, SECTION_LEN, 0, -0.1, SECTION_LEN * 0.5, roadHex));
  parts.push(box(2.4, 0.16, SECTION_LEN, -4.9, 0.02, SECTION_LEN * 0.5, walkHex));
  parts.push(box(2.4, 0.16, SECTION_LEN, 4.9, 0.02, SECTION_LEN * 0.5, walkHex));
  if (biome !== "harbor") {
    for (let i = 0; i < 10; i++) {
      const z = 2 + i * 4.1;
      parts.push(box(0.08, 0.02, 1.6, -1.1, 0.03, z, 0xe8e0d0));
      parts.push(box(0.08, 0.02, 1.6, 1.1, 0.03, z, 0xe8e0d0));
    }
  }

  if (biome === "downtown") decorateDowntown(parts, r);
  else if (biome === "park") decoratePark(parts, r);
  else if (biome === "bridge") decorateBridge(parts, r);
  else if (biome === "tunnel") decorateTunnel(parts);
  else if (biome === "harbor") decorateHarbor(parts, r);
  else decorateRail(parts, r);

  const merged = mergeGeometries(parts, false);
  for (const g of parts) g.dispose();
  const spawns = layoutSpawns(r, difficulty, distance, biome);
  if (!merged) {
    const fallback = box(7.4, 0.22, SECTION_LEN, 0, -0.1, SECTION_LEN * 0.5, roadHex);
    return { geometry: fallback, spawns, biome };
  }
  merged.computeBoundingSphere();
  return { geometry: merged, spawns, biome };
}

export function buildSkyline(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const palette = [0x6a7a88, 0x7a6a60, 0x5a706c, 0x8a8074, 0x4a5864];
  for (let i = 0; i < 22; i++) {
    const x = -42 + i * 4.1 + (i % 3) * 0.4;
    const h = 8 + ((i * 17) % 18);
    const w = 2.2 + (i % 4) * 0.5;
    parts.push(box(w, h, 2.2, x, h * 0.5, 0, palette[i % palette.length]!, 0.02));
  }
  const merged = mergeGeometries(parts, false);
  for (const g of parts) g.dispose();
  return merged ?? new THREE.BoxGeometry(1, 1, 1);
}

export function buildTrainGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  parts.push(box(0.94, 0.78, 0.94, 0, 0.04, 0, 0x3d4c54));
  parts.push(box(0.86, 0.08, 0.92, 0, 0.46, 0, 0x2a343c));
  parts.push(box(0.96, 0.08, 0.94, 0, -0.08, 0, 0xc45c4a));
  for (let i = -3; i <= 3; i++) {
    parts.push(box(0.9, 0.2, 0.08, 0, 0.22, i * 0.12, 0x8eb9b6));
  }
  parts.push(box(0.72, 0.28, 0.06, 0, 0.18, -0.48, 0xd4e4ea));
  parts.push(box(0.5, 0.06, 0.12, 0, -0.42, -0.28, 0x1a1e24));
  parts.push(box(0.5, 0.06, 0.12, 0, -0.42, 0.28, 0x1a1e24));
  const merged = mergeGeometries(parts, false);
  for (const g of parts) g.dispose();
  return merged ?? new THREE.BoxGeometry(1, 1, 1);
}

export function buildBoatGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  parts.push(box(0.92, 0.38, 0.88, 0, -0.12, 0.04, 0xc4b49a));
  parts.push(box(0.62, 0.3, 0.22, 0, -0.14, -0.46, 0xb8a888));
  parts.push(box(0.58, 0.42, 0.4, 0, 0.22, 0.1, 0xe8efe8));
  parts.push(box(0.4, 0.14, 0.22, 0, 0.48, 0.08, 0x3d6a7a));
  parts.push(cyl(0.03, 0.04, 0.7, 0.12, 0.55, 0.16, 0x6b5340, 5));
  const merged = mergeGeometries(parts, false);
  for (const g of parts) g.dispose();
  return merged ?? new THREE.BoxGeometry(1, 1, 1);
}

export const OBS_VIS: Record<
  ObstacleKind,
  { y: number; sx: number; sy: number; sz: number; color: number }
> = {
  barrier: { y: 0.42, sx: 1.85, sy: 0.82, sz: 0.7, color: 0xc45c4a },
  sign: { y: 1.55, sx: 1.95, sy: 0.32, sz: 0.45, color: 0x8eb9b6 },
  crate: { y: 0.82, sx: 1.5, sy: 1.62, sz: 1.4, color: 0x8a5a3c },
  vehicle: { y: 0.85, sx: 1.7, sy: 1.55, sz: 4.6, color: 0x2a4450 },
  gate: { y: 0.9, sx: 1.55, sy: 1.7, sz: 1.05, color: 0xa45a3c },
  gap: { y: -0.35, sx: 1.9, sy: 0.5, sz: 4.2, color: 0x12161c },
  train: { y: 0.92, sx: 1.72, sy: 1.78, sz: 11.4, color: 0x4a5a62 },
  boat: { y: 0.62, sx: 1.78, sy: 1.18, sz: 5.8, color: 0xc4b49a },
  ramp: { y: 0.42, sx: 1.7, sy: 0.82, sz: 2.6, color: 0x5d9a78 },
  pad: { y: 0.06, sx: 1.55, sy: 0.1, sz: 1.7, color: 0x8eb9b6 },
};

export const LANE_POS = LANE_X;

export const BIOME_FOG: Record<Biome, { fog: number; sky: number }> = {
  downtown: { fog: 0x9ec4d4, sky: 0x87b7d0 },
  park: { fog: 0xa8c9b4, sky: 0x8fbfb0 },
  harbor: { fog: 0x8eb8c4, sky: 0x7aadc0 },
  bridge: { fog: 0xa8c4d2, sky: 0x90b8cc },
  rail: { fog: 0xa3aeb6, sky: 0x8ea0aa },
  tunnel: { fog: 0x4a5560, sky: 0x3a444e },
};
