import {
  ACHIEVEMENTS,
  CHARACTERS,
  DAILY_CHALLENGES,
  LIFETIME_MISSIONS,
  ROTATING_MISSIONS,
  SAVE_KEY,
  SAVE_VERSION,
  type CharacterId,
  type MissionDef,
  type QualitySetting,
  type UpgradeId,
} from "./constants";

export type SaveData = {
  version: number;
  highScore: number;
  bestDistance: number;
  coins: number;
  totalCoins: number;
  totalDistance: number;
  totalRuns: number;
  unlocked: CharacterId[];
  selected: CharacterId;
  upgrades: Record<UpgradeId, number>;
  achievements: Record<string, boolean>;
  claimedMissions: string[];
  lifetime: { runs: number; totalCoins: number; totalDistance: number };
  daily: { day: number; id: string; claimed: boolean; best: number };
  settings: {
    music: number;
    sfx: number;
    shake: boolean;
    quality: QualitySetting;
  };
};

export const DEFAULT_SAVE: SaveData = {
  version: SAVE_VERSION,
  highScore: 0,
  bestDistance: 0,
  coins: 0,
  totalCoins: 0,
  totalDistance: 0,
  totalRuns: 0,
  unlocked: ["jett"],
  selected: "jett",
  upgrades: { magnet: 0, shield: 0, fortune: 0, spring: 0 },
  achievements: {},
  claimedMissions: [],
  lifetime: { runs: 0, totalCoins: 0, totalDistance: 0 },
  daily: { day: -1, id: "d-coins-60", claimed: false, best: 0 },
  settings: { music: 0.55, sfx: 0.8, shake: true, quality: "auto" },
};

function dayIndex(): number {
  return Math.floor(Date.now() / 86_400_000);
}

function pickDaily(day: number): string {
  return DAILY_CHALLENGES[Math.abs(day * 17) % DAILY_CHALLENGES.length]!.id;
}

function migrate(raw: SaveData): SaveData {
  const s: SaveData = {
    ...DEFAULT_SAVE,
    ...raw,
    upgrades: { ...DEFAULT_SAVE.upgrades, ...raw.upgrades },
    settings: { ...DEFAULT_SAVE.settings, ...raw.settings },
    achievements: { ...raw.achievements },
    unlocked: raw.unlocked?.length ? raw.unlocked : ["jett"],
    lifetime: { ...DEFAULT_SAVE.lifetime, ...raw.lifetime },
    daily: { ...DEFAULT_SAVE.daily, ...raw.daily },
    version: SAVE_VERSION,
  };
  const day = dayIndex();
  if (s.daily.day !== day) {
    s.daily = { day, id: pickDaily(day), claimed: false, best: 0 };
  }
  return s;
}

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return migrate({ ...DEFAULT_SAVE, daily: { day: -1, id: "", claimed: false, best: 0 } });
    return migrate(JSON.parse(raw) as SaveData);
  } catch {
    return { ...DEFAULT_SAVE };
  }
}

export function persistSave(save: SaveData): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  } catch {
    /* private mode / quota */
  }
}

export type RunStats = {
  score: number;
  coins: number;
  distance: number;
  jumps: number;
  slides: number;
  powers: number;
  combo: number;
  shieldSave: boolean;
  usedMagnet: boolean;
  usedDeck: boolean;
  trains: number;
  boats: number;
  pads: number;
};

export function applyRun(save: SaveData, stats: RunStats): { save: SaveData; unlocked: string[] } {
  const next: SaveData = {
    ...save,
    coins: save.coins + stats.coins,
    totalCoins: save.totalCoins + stats.coins,
    totalDistance: save.totalDistance + stats.distance,
    totalRuns: save.totalRuns + 1,
    highScore: Math.max(save.highScore, Math.floor(stats.score)),
    bestDistance: Math.max(save.bestDistance, Math.floor(stats.distance)),
    lifetime: {
      runs: save.lifetime.runs + 1,
      totalCoins: save.lifetime.totalCoins + stats.coins,
      totalDistance: save.lifetime.totalDistance + stats.distance,
    },
    achievements: { ...save.achievements },
    daily: { ...save.daily },
  };

  const unlocked: string[] = [];
  const mark = (id: string, ok: boolean) => {
    if (ok && !next.achievements[id]) {
      next.achievements[id] = true;
      const def = ACHIEVEMENTS.find((a) => a.id === id);
      if (def) unlocked.push(def.name);
    }
  };
  mark("first-run", true);
  mark("coins-100", next.totalCoins >= 100);
  mark("coins-1000", next.totalCoins >= 1000);
  mark("dist-500", stats.distance >= 500);
  mark("dist-2000", stats.distance >= 2000);
  mark("shield-save", stats.shieldSave);
  mark("magnet-run", stats.usedMagnet);
  mark("combo-15", stats.combo >= 15);
  mark("chars-3", next.unlocked.length >= 3);
  mark("train-1", stats.trains >= 1);
  mark("boat-1", stats.boats >= 1);
  mark("pad-1", stats.pads >= 1);
  mark("deck-run", stats.usedDeck);

  const daily = DAILY_CHALLENGES.find((d) => d.id === next.daily.id);
  if (daily) {
    const value = statValue(daily, stats, next);
    next.daily.best = Math.max(next.daily.best, value);
    if (!next.daily.claimed && value >= daily.target) {
      next.daily.claimed = true;
      next.coins += daily.reward;
      mark("daily-1", true);
      unlocked.push(`Daily: ${daily.name}`);
    }
  }

  return { save: next, unlocked };
}

export function statValue(def: MissionDef, stats: RunStats, save: SaveData): number {
  switch (def.stat) {
    case "runCoins":
      return stats.coins;
    case "distance":
      return stats.distance;
    case "jumps":
      return stats.jumps;
    case "slides":
      return stats.slides;
    case "powers":
      return stats.powers;
    case "runs":
      return save.lifetime.runs;
    case "totalCoins":
      return save.lifetime.totalCoins;
    case "totalDistance":
      return save.lifetime.totalDistance;
    case "trains":
      return stats.trains;
    case "boats":
      return stats.boats;
    case "pads":
      return stats.pads;
    default:
      return 0;
  }
}

export function activeMissions(save: SaveData): MissionDef[] {
  const rot = ROTATING_MISSIONS.filter((m) => !save.claimedMissions.includes(m.id)).slice(0, 2);
  const life = LIFETIME_MISSIONS.filter((m) => !save.claimedMissions.includes(m.id)).slice(0, 1);
  return [...rot, ...life];
}

export function claimMission(save: SaveData, id: string, stats: RunStats | null): SaveData {
  const def =
    ROTATING_MISSIONS.find((m) => m.id === id) ?? LIFETIME_MISSIONS.find((m) => m.id === id);
  if (!def || save.claimedMissions.includes(id)) return save;
  const dummy: RunStats = stats ?? {
    score: 0,
    coins: 0,
    distance: 0,
    jumps: 0,
    slides: 0,
    powers: 0,
    combo: 0,
    shieldSave: false,
    usedMagnet: false,
    usedDeck: false,
    trains: 0,
    boats: 0,
    pads: 0,
  };
  if (statValue(def, dummy, save) < def.target) return save;
  return {
    ...save,
    coins: save.coins + def.reward,
    claimedMissions: [...save.claimedMissions, id],
  };
}

export function characterById(id: CharacterId) {
  return CHARACTERS.find((c) => c.id === id) ?? CHARACTERS[0]!;
}

export function upgradeMult(level: number): number {
  return 1 + level * 0.18;
}
