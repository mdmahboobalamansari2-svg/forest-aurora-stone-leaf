export const LANE_X = [-2.2, 0, 2.2] as const;
export const LANE_COUNT = 3;
export const SECTION_LEN = 42;
export const SECTION_COUNT = 8;
export const BASE_SPEED = 17;
export const ATTRACT_SPEED = 11.5;
export const MAX_SPEED = 36;
export const SPEED_PER_METER = 0.0115;
export const GRAVITY = -48;
export const JUMP_VY = 14.4;
export const RAMP_VY = 18.4;
export const SUPER_JUMP_MULT = 1.22;
export const SLIDE_TIME = 0.72;
export const LANE_SNAP = 24;
export const PLAYER_HALF_W = 0.34;
export const PLAYER_HALF_D = 0.3;
export const FIXED_DT = 1 / 60;
export const MAX_STEPS = 5;
export const COIN_SCORE = 10;
export const MAGNET_RANGE = 5.8;
export const JUMP_BUFFER = 0.12;
export const COYOTE = 0.08;
export const PAD_BOOST_TIME = 1.85;
export const PAD_BOOST_MULT = 1.26;
export const SAVE_KEY = "rushline-save-v1";
export const SAVE_VERSION = 2;
export const MAX_COINS = 96;
export const MAX_OBS = 80;
export const MAX_TRAINS = 12;
export const MAX_BOATS = 12;
export const MAX_SPARKS = 16;
export const MAX_POWERS = 8;

export type Biome = "downtown" | "park" | "bridge" | "tunnel" | "rail" | "harbor";
export type PowerId = "magnet" | "shield" | "boost" | "double" | "superjump" | "deck";
export type ObstacleKind = "barrier" | "sign" | "crate" | "vehicle" | "gate" | "gap" | "train" | "boat" | "ramp" | "pad";
export type QualityLevel = 0 | 1 | 2 | 3;
export type QualitySetting = "auto" | "low" | "med" | "high";
export type Overlay =
  | "menu"
  | "play"
  | "pause"
  | "over"
  | "settings"
  | "garage"
  | "missions";

export const BIOME_ORDER: Biome[] = ["downtown", "harbor", "rail", "park", "bridge", "tunnel"];

export const BIOME_LABEL: Record<Biome, string> = {
  downtown: "Solara",
  park: "Greenway",
  harbor: "Harbor",
  bridge: "Span",
  rail: "Yard",
  tunnel: "Underpass",
};

export const POWER_DURATION: Record<PowerId, number> = {
  magnet: 8,
  shield: 6.5,
  boost: 4.2,
  double: 10,
  superjump: 8,
  deck: 7.2,
};

export const POWER_LABEL: Record<PowerId, string> = {
  magnet: "Magnet",
  shield: "Shield",
  boost: "Surge",
  double: "Multiplier",
  superjump: "Spring",
  deck: "Deck",
};

export type CharacterId = "jett" | "maru" | "rook" | "nyx" | "pico";

export type CharacterDef = {
  id: CharacterId;
  name: string;
  blurb: string;
  price: number;
  jacket: number;
  pants: number;
  visor: number;
  skin: number;
  hair: number;
  scarf: number;
  shoes: number;
  magnet: number;
  shield: number;
  coin: number;
  jump: number;
};

export const CHARACTERS: CharacterDef[] = [
  {
    id: "jett",
    name: "Jett",
    blurb: "City regular. Nothing extra, nothing missing.",
    price: 0,
    jacket: 0x2f7f7a,
    pants: 0x24303a,
    visor: 0xc45c4a,
    skin: 0xe0b089,
    hair: 0x1a1e24,
    scarf: 0xd9cbb6,
    shoes: 0x151a20,
    magnet: 1,
    shield: 1,
    coin: 1,
    jump: 1,
  },
  {
    id: "maru",
    name: "Maru",
    blurb: "Harbor courier. Magnets linger a little longer.",
    price: 400,
    jacket: 0xd9cbb6,
    pants: 0x3e6b52,
    visor: 0x1c2532,
    skin: 0xc48a62,
    hair: 0x4a3020,
    scarf: 0x5d9a78,
    shoes: 0x2a211c,
    magnet: 1.18,
    shield: 1,
    coin: 1,
    jump: 1,
  },
  {
    id: "rook",
    name: "Rook",
    blurb: "Yard mechanic. Shields hold a beat longer.",
    price: 900,
    jacket: 0xa45a3c,
    pants: 0x6b6358,
    visor: 0x8eb9b6,
    skin: 0xd0a07a,
    hair: 0x2c241c,
    scarf: 0xc4a15a,
    shoes: 0x3a2c24,
    magnet: 1,
    shield: 1.2,
    coin: 1,
    jump: 1,
  },
  {
    id: "nyx",
    name: "Nyx",
    blurb: "Rail-shift runner. Coins count for more.",
    price: 1600,
    jacket: 0x1a222c,
    pants: 0x4d6d78,
    visor: 0xeef1f5,
    skin: 0xb88868,
    hair: 0x0e1014,
    scarf: 0x8eb9b6,
    shoes: 0x101418,
    magnet: 1,
    shield: 1,
    coin: 1.12,
    jump: 1,
  },
  {
    id: "pico",
    name: "Pico",
    blurb: "Rookie spark. Springs a little higher.",
    price: 2800,
    jacket: 0x6ec8c0,
    pants: 0xe8d5c4,
    visor: 0xc45c4a,
    skin: 0xf0c4a0,
    hair: 0x3a6a68,
    scarf: 0xeef1f5,
    shoes: 0x2a3442,
    magnet: 1,
    shield: 1,
    coin: 1,
    jump: 1.14,
  },
];

export const UPGRADE_PRICES = [200, 500, 1100] as const;

export type UpgradeId = "magnet" | "shield" | "fortune" | "spring";

export const UPGRADES: { id: UpgradeId; name: string; blurb: string }[] = [
  { id: "magnet", name: "Pull", blurb: "Magnet lasts longer" },
  { id: "shield", name: "Aegis", blurb: "Shield lasts longer" },
  { id: "fortune", name: "Fortune", blurb: "Each coin is worth more" },
  { id: "spring", name: "Spring", blurb: "Jumps reach a little higher" },
];

export type MissionStat =
  | "runCoins"
  | "distance"
  | "jumps"
  | "slides"
  | "powers"
  | "runs"
  | "totalCoins"
  | "totalDistance"
  | "trains"
  | "boats"
  | "pads";

export type MissionDef = {
  id: string;
  name: string;
  blurb: string;
  target: number;
  reward: number;
  stat: MissionStat;
  lifetime: boolean;
};

export const ROTATING_MISSIONS: MissionDef[] = [
  { id: "m-coins-80", name: "Pocket change", blurb: "Collect 80 coins in one run", target: 80, reward: 60, stat: "runCoins", lifetime: false },
  { id: "m-dist-500", name: "Five blocks", blurb: "Travel 500 m in one run", target: 500, reward: 70, stat: "distance", lifetime: false },
  { id: "m-jump-20", name: "Air time", blurb: "Jump 20 times in one run", target: 20, reward: 50, stat: "jumps", lifetime: false },
  { id: "m-slide-12", name: "Keep low", blurb: "Slide 12 times in one run", target: 12, reward: 50, stat: "slides", lifetime: false },
  { id: "m-power-2", name: "Kit up", blurb: "Grab 2 power-ups in one run", target: 2, reward: 80, stat: "powers", lifetime: false },
  { id: "m-train-2", name: "Hop the line", blurb: "Ride 2 commuter cars in one run", target: 2, reward: 80, stat: "trains", lifetime: false },
  { id: "m-boat-1", name: "Deck hand", blurb: "Land on a harbor boat", target: 1, reward: 70, stat: "boats", lifetime: false },
  { id: "m-pad-3", name: "Catch the surge", blurb: "Hit 3 surge pads in one run", target: 3, reward: 70, stat: "pads", lifetime: false },
];

export const LIFETIME_MISSIONS: MissionDef[] = [
  { id: "l-runs-5", name: "Warm-up", blurb: "Finish 5 runs", target: 5, reward: 80, stat: "runs", lifetime: true },
  { id: "l-coins-400", name: "Banked", blurb: "Collect 400 coins total", target: 400, reward: 120, stat: "totalCoins", lifetime: true },
  { id: "l-dist-3000", name: "City loop", blurb: "Travel 3,000 m total", target: 3000, reward: 140, stat: "totalDistance", lifetime: true },
];

export type AchievementDef = {
  id: string;
  name: string;
  blurb: string;
};

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "first-run", name: "First spark", blurb: "Complete a run" },
  { id: "coins-100", name: "Shiny", blurb: "Bank 100 coins lifetime" },
  { id: "coins-1000", name: "Loaded", blurb: "Bank 1,000 coins lifetime" },
  { id: "dist-500", name: "Neighborhood", blurb: "Run 500 m in a single go" },
  { id: "dist-2000", name: "Across town", blurb: "Run 2,000 m in a single go" },
  { id: "shield-save", name: "Close call", blurb: "Let a shield take a hit" },
  { id: "magnet-run", name: "Pull", blurb: "Pick up a magnet" },
  { id: "combo-15", name: "Streak", blurb: "Hit a 15-coin streak" },
  { id: "chars-3", name: "Crew", blurb: "Unlock 3 runners" },
  { id: "daily-1", name: "Clock in", blurb: "Finish a daily challenge" },
  { id: "train-1", name: "Car hopper", blurb: "Ride a commuter car" },
  { id: "boat-1", name: "Harbor feet", blurb: "Land on a boat" },
  { id: "pad-1", name: "Kick", blurb: "Hit a surge pad" },
  { id: "deck-run", name: "Glide", blurb: "Ride the deck board" },
];

export const DAILY_CHALLENGES: MissionDef[] = [
  { id: "d-coins-60", name: "Daily take", blurb: "Collect 60 coins in one run", target: 60, reward: 100, stat: "runCoins", lifetime: false },
  { id: "d-dist-400", name: "Daily miles", blurb: "Travel 400 m in one run", target: 400, reward: 100, stat: "distance", lifetime: false },
  { id: "d-jump-16", name: "Daily hops", blurb: "Jump 16 times in one run", target: 16, reward: 90, stat: "jumps", lifetime: false },
  { id: "d-slide-10", name: "Daily duck", blurb: "Slide 10 times in one run", target: 10, reward: 90, stat: "slides", lifetime: false },
  { id: "d-power-1", name: "Daily kit", blurb: "Grab a power-up", target: 1, reward: 110, stat: "powers", lifetime: false },
  { id: "d-train-1", name: "Daily hop", blurb: "Ride a commuter car", target: 1, reward: 110, stat: "trains", lifetime: false },
  { id: "d-pad-2", name: "Daily kick", blurb: "Hit 2 surge pads", target: 2, reward: 110, stat: "pads", lifetime: false },
];
