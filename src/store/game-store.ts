import { create } from "zustand";
import type { CharacterId, Overlay, UpgradeId } from "@/game/constants";
import { CHARACTERS, UPGRADE_PRICES } from "@/game/constants";
import {
  activeMissions,
  applyRun,
  claimMission,
  DEFAULT_SAVE,
  loadSave,
  persistSave,
  type RunStats,
  type SaveData,
} from "@/game/save";
import type { HudSnapshot } from "@/game/engine";

export type GameStore = {
  overlay: Overlay;
  ready: boolean;
  save: SaveData;
  hud: HudSnapshot;
  lastRun: RunStats | null;
  newHigh: boolean;
  unlockedNotes: string[];
  lastStats: RunStats | null;
  hydrate: () => void;
  setOverlay: (o: Overlay) => void;
  setHud: (h: HudSnapshot) => void;
  finishRun: (stats: RunStats) => void;
  setSettings: (patch: Partial<SaveData["settings"]>) => void;
  buyCharacter: (id: CharacterId) => boolean;
  selectCharacter: (id: CharacterId) => void;
  buyUpgrade: (id: UpgradeId) => boolean;
  claim: (missionId: string) => void;
  dismissNotes: () => void;
};

const EMPTY_HUD: HudSnapshot = {
  score: 0,
  coins: 0,
  distance: 0,
  combo: 0,
  fps: 60,
  speed: 0,
  powers: [],
  shield: false,
  zone: "Solara",
  pad: false,
  board: false,
};

function write(save: SaveData) {
  persistSave(save);
  return save;
}

export const useGameStore = create<GameStore>((set, get) => ({
  overlay: "menu",
  ready: false,
  save: DEFAULT_SAVE,
  hud: EMPTY_HUD,
  lastRun: null,
  newHigh: false,
  unlockedNotes: [],
  lastStats: null,
  hydrate: () => {
    const save = loadSave();
    set({ save, ready: true });
  },
  setOverlay: (overlay) => set({ overlay }),
  setHud: (hud) => set({ hud }),
  finishRun: (stats) => {
    const prev = get().save;
    const { save, unlocked } = applyRun(prev, stats);
    const newHigh = stats.score > prev.highScore;
    set({
      save: write(save),
      lastRun: stats,
      lastStats: stats,
      overlay: "over",
      newHigh,
      unlockedNotes: unlocked,
    });
  },
  setSettings: (patch) => {
    const save = get().save;
    const next = { ...save, settings: { ...save.settings, ...patch } };
    set({ save: write(next) });
  },
  buyCharacter: (id) => {
    const save = get().save;
    const def = CHARACTERS.find((c) => c.id === id);
    if (!def || save.unlocked.includes(id) || save.coins < def.price) return false;
    const next = {
      ...save,
      coins: save.coins - def.price,
      unlocked: [...save.unlocked, id],
      selected: id,
    };
    set({ save: write(next) });
    return true;
  },
  selectCharacter: (id) => {
    const save = get().save;
    if (!save.unlocked.includes(id)) return;
    set({ save: write({ ...save, selected: id }) });
  },
  buyUpgrade: (id) => {
    const save = get().save;
    const level = save.upgrades[id];
    if (level >= 3) return false;
    const price = UPGRADE_PRICES[level]!;
    if (save.coins < price) return false;
    const next = {
      ...save,
      coins: save.coins - price,
      upgrades: { ...save.upgrades, [id]: level + 1 },
    };
    set({ save: write(next) });
    return true;
  },
  claim: (missionId) => {
    const { save, lastStats } = get();
    const next = claimMission(save, missionId, lastStats);
    if (next === save) return;
    set({ save: write(next) });
  },
  dismissNotes: () => set({ unlockedNotes: [] }),
}));

export function missionList(save: SaveData) {
  return activeMissions(save);
}
