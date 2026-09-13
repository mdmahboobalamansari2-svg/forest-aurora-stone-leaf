import { i as __toESM } from "../_runtime.mjs";
import { I as require_jsx_runtime, L as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as ArrowLeft, c as RotateCcw, d as Magnet, f as House, g as ArrowRight, h as ArrowUp, i as Trophy, l as Play, m as CircleDollarSign, n as Volume2, o as Shield, p as Flag, r as User, s as Settings, t as Zap, u as Pause, v as ArrowDown } from "../_libs/lucide-react.mjs";
import { t as create } from "../_libs/zustand.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Dzuz0lG_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var LANE_X = [
	-2.2,
	0,
	2.2
];
var ATTRACT_SPEED = 11.5;
var SPEED_PER_METER = .0115;
var JUMP_VY = 14.4;
var SUPER_JUMP_MULT = 1.22;
var SLIDE_TIME = .72;
var PLAYER_HALF_W = .34;
var PLAYER_HALF_D = .3;
var FIXED_DT = 1 / 60;
var JUMP_BUFFER = .12;
var COYOTE = .08;
var SAVE_KEY = "rushline-save-v1";
var BIOME_ORDER = [
	"downtown",
	"park",
	"bridge",
	"tunnel",
	"rail"
];
var POWER_DURATION = {
	magnet: 8,
	shield: 6.5,
	boost: 4.2,
	double: 10,
	superjump: 8
};
var POWER_LABEL = {
	magnet: "Magnet",
	shield: "Shield",
	boost: "Surge",
	double: "Multiplier",
	superjump: "Spring"
};
var CHARACTERS = [
	{
		id: "jett",
		name: "Jett",
		blurb: "City regular. Nothing extra, nothing missing.",
		price: 0,
		jacket: 3112826,
		pants: 2371642,
		visor: 12868682,
		skin: 14725257,
		hair: 1711652,
		scarf: 14273462,
		shoes: 1382944,
		magnet: 1,
		shield: 1,
		coin: 1,
		jump: 1
	},
	{
		id: "maru",
		name: "Maru",
		blurb: "Harbor courier. Magnets linger a little longer.",
		price: 400,
		jacket: 14273462,
		pants: 4090706,
		visor: 1844530,
		skin: 12880482,
		hair: 4861984,
		scarf: 6134392,
		shoes: 2760988,
		magnet: 1.18,
		shield: 1,
		coin: 1,
		jump: 1
	},
	{
		id: "rook",
		name: "Rook",
		blurb: "Yard mechanic. Shields hold a beat longer.",
		price: 900,
		jacket: 10771004,
		pants: 7037784,
		visor: 9353654,
		skin: 13672570,
		hair: 2892828,
		scarf: 12886362,
		shoes: 3812388,
		magnet: 1,
		shield: 1.2,
		coin: 1,
		jump: 1
	},
	{
		id: "nyx",
		name: "Nyx",
		blurb: "Rail-shift runner. Coins count for more.",
		price: 1600,
		jacket: 1712684,
		pants: 5074296,
		visor: 15659509,
		skin: 12093544,
		hair: 921620,
		scarf: 9353654,
		shoes: 1053720,
		magnet: 1,
		shield: 1,
		coin: 1.12,
		jump: 1
	},
	{
		id: "pico",
		name: "Pico",
		blurb: "Rookie spark. Springs a little higher.",
		price: 2800,
		jacket: 7260352,
		pants: 15259076,
		visor: 12868682,
		skin: 15778976,
		hair: 3828328,
		scarf: 15659509,
		shoes: 2765890,
		magnet: 1,
		shield: 1,
		coin: 1,
		jump: 1.14
	}
];
var UPGRADE_PRICES = [
	200,
	500,
	1100
];
var UPGRADES = [
	{
		id: "magnet",
		name: "Pull",
		blurb: "Magnet lasts longer"
	},
	{
		id: "shield",
		name: "Aegis",
		blurb: "Shield lasts longer"
	},
	{
		id: "fortune",
		name: "Fortune",
		blurb: "Each coin is worth more"
	},
	{
		id: "spring",
		name: "Spring",
		blurb: "Jumps reach a little higher"
	}
];
var ROTATING_MISSIONS = [
	{
		id: "m-coins-80",
		name: "Pocket change",
		blurb: "Collect 80 coins in one run",
		target: 80,
		reward: 60,
		stat: "runCoins",
		lifetime: false
	},
	{
		id: "m-dist-500",
		name: "Five blocks",
		blurb: "Travel 500 m in one run",
		target: 500,
		reward: 70,
		stat: "distance",
		lifetime: false
	},
	{
		id: "m-jump-20",
		name: "Air time",
		blurb: "Jump 20 times in one run",
		target: 20,
		reward: 50,
		stat: "jumps",
		lifetime: false
	},
	{
		id: "m-slide-12",
		name: "Keep low",
		blurb: "Slide 12 times in one run",
		target: 12,
		reward: 50,
		stat: "slides",
		lifetime: false
	},
	{
		id: "m-power-2",
		name: "Kit up",
		blurb: "Grab 2 power-ups in one run",
		target: 2,
		reward: 80,
		stat: "powers",
		lifetime: false
	}
];
var LIFETIME_MISSIONS = [
	{
		id: "l-runs-5",
		name: "Warm-up",
		blurb: "Finish 5 runs",
		target: 5,
		reward: 80,
		stat: "runs",
		lifetime: true
	},
	{
		id: "l-coins-400",
		name: "Banked",
		blurb: "Collect 400 coins total",
		target: 400,
		reward: 120,
		stat: "totalCoins",
		lifetime: true
	},
	{
		id: "l-dist-3000",
		name: "City loop",
		blurb: "Travel 3,000 m total",
		target: 3e3,
		reward: 140,
		stat: "totalDistance",
		lifetime: true
	}
];
var ACHIEVEMENTS = [
	{
		id: "first-run",
		name: "First spark",
		blurb: "Complete a run"
	},
	{
		id: "coins-100",
		name: "Shiny",
		blurb: "Bank 100 coins lifetime"
	},
	{
		id: "coins-1000",
		name: "Loaded",
		blurb: "Bank 1,000 coins lifetime"
	},
	{
		id: "dist-500",
		name: "Neighborhood",
		blurb: "Run 500 m in a single go"
	},
	{
		id: "dist-2000",
		name: "Across town",
		blurb: "Run 2,000 m in a single go"
	},
	{
		id: "shield-save",
		name: "Close call",
		blurb: "Let a shield take a hit"
	},
	{
		id: "magnet-run",
		name: "Pull",
		blurb: "Pick up a magnet"
	},
	{
		id: "combo-15",
		name: "Streak",
		blurb: "Hit a 15-coin streak"
	},
	{
		id: "chars-3",
		name: "Crew",
		blurb: "Unlock 3 runners"
	},
	{
		id: "daily-1",
		name: "Clock in",
		blurb: "Finish a daily challenge"
	}
];
var DAILY_CHALLENGES = [
	{
		id: "d-coins-60",
		name: "Daily take",
		blurb: "Collect 60 coins in one run",
		target: 60,
		reward: 100,
		stat: "runCoins",
		lifetime: false
	},
	{
		id: "d-dist-400",
		name: "Daily miles",
		blurb: "Travel 400 m in one run",
		target: 400,
		reward: 100,
		stat: "distance",
		lifetime: false
	},
	{
		id: "d-jump-16",
		name: "Daily hops",
		blurb: "Jump 16 times in one run",
		target: 16,
		reward: 90,
		stat: "jumps",
		lifetime: false
	},
	{
		id: "d-slide-10",
		name: "Daily duck",
		blurb: "Slide 10 times in one run",
		target: 10,
		reward: 90,
		stat: "slides",
		lifetime: false
	},
	{
		id: "d-power-1",
		name: "Daily kit",
		blurb: "Grab a power-up",
		target: 1,
		reward: 110,
		stat: "powers",
		lifetime: false
	}
];
var DEFAULT_SAVE = {
	version: 1,
	highScore: 0,
	bestDistance: 0,
	coins: 0,
	totalCoins: 0,
	totalDistance: 0,
	totalRuns: 0,
	unlocked: ["jett"],
	selected: "jett",
	upgrades: {
		magnet: 0,
		shield: 0,
		fortune: 0,
		spring: 0
	},
	achievements: {},
	claimedMissions: [],
	lifetime: {
		runs: 0,
		totalCoins: 0,
		totalDistance: 0
	},
	daily: {
		day: -1,
		id: "d-coins-60",
		claimed: false,
		best: 0
	},
	settings: {
		music: .55,
		sfx: .8,
		shake: true,
		quality: "auto"
	}
};
function dayIndex() {
	return Math.floor(Date.now() / 864e5);
}
function pickDaily(day) {
	return DAILY_CHALLENGES[Math.abs(day * 17) % DAILY_CHALLENGES.length].id;
}
function migrate(raw) {
	const s = {
		...DEFAULT_SAVE,
		...raw,
		upgrades: {
			...DEFAULT_SAVE.upgrades,
			...raw.upgrades
		},
		settings: {
			...DEFAULT_SAVE.settings,
			...raw.settings
		},
		achievements: { ...raw.achievements },
		unlocked: raw.unlocked?.length ? raw.unlocked : ["jett"],
		lifetime: {
			...DEFAULT_SAVE.lifetime,
			...raw.lifetime
		},
		daily: {
			...DEFAULT_SAVE.daily,
			...raw.daily
		},
		version: 1
	};
	const day = dayIndex();
	if (s.daily.day !== day) s.daily = {
		day,
		id: pickDaily(day),
		claimed: false,
		best: 0
	};
	return s;
}
function loadSave() {
	try {
		const raw = localStorage.getItem(SAVE_KEY);
		if (!raw) return migrate({
			...DEFAULT_SAVE,
			daily: {
				day: -1,
				id: "",
				claimed: false,
				best: 0
			}
		});
		return migrate(JSON.parse(raw));
	} catch {
		return { ...DEFAULT_SAVE };
	}
}
function persistSave(save) {
	try {
		localStorage.setItem(SAVE_KEY, JSON.stringify(save));
	} catch {}
}
function applyRun(save, stats) {
	const next = {
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
			totalDistance: save.lifetime.totalDistance + stats.distance
		},
		achievements: { ...save.achievements },
		daily: { ...save.daily }
	};
	const unlocked = [];
	const mark = (id, ok) => {
		if (ok && !next.achievements[id]) {
			next.achievements[id] = true;
			const def = ACHIEVEMENTS.find((a) => a.id === id);
			if (def) unlocked.push(def.name);
		}
	};
	mark("first-run", true);
	mark("coins-100", next.totalCoins >= 100);
	mark("coins-1000", next.totalCoins >= 1e3);
	mark("dist-500", stats.distance >= 500);
	mark("dist-2000", stats.distance >= 2e3);
	mark("shield-save", stats.shieldSave);
	mark("magnet-run", stats.usedMagnet);
	mark("combo-15", stats.combo >= 15);
	mark("chars-3", next.unlocked.length >= 3);
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
	return {
		save: next,
		unlocked
	};
}
function statValue(def, stats, save) {
	switch (def.stat) {
		case "runCoins": return stats.coins;
		case "distance": return stats.distance;
		case "jumps": return stats.jumps;
		case "slides": return stats.slides;
		case "powers": return stats.powers;
		case "runs": return save.lifetime.runs;
		case "totalCoins": return save.lifetime.totalCoins;
		case "totalDistance": return save.lifetime.totalDistance;
		default: return 0;
	}
}
function activeMissions(save) {
	const rot = ROTATING_MISSIONS.filter((m) => !save.claimedMissions.includes(m.id)).slice(0, 2);
	const life = LIFETIME_MISSIONS.filter((m) => !save.claimedMissions.includes(m.id)).slice(0, 1);
	return [...rot, ...life];
}
function claimMission(save, id, stats) {
	const def = ROTATING_MISSIONS.find((m) => m.id === id) ?? LIFETIME_MISSIONS.find((m) => m.id === id);
	if (!def || save.claimedMissions.includes(id)) return save;
	if (statValue(def, stats ?? {
		score: 0,
		coins: 0,
		distance: 0,
		jumps: 0,
		slides: 0,
		powers: 0,
		combo: 0,
		shieldSave: false,
		usedMagnet: false
	}, save) < def.target) return save;
	return {
		...save,
		coins: save.coins + def.reward,
		claimedMissions: [...save.claimedMissions, id]
	};
}
function characterById(id) {
	return CHARACTERS.find((c) => c.id === id) ?? CHARACTERS[0];
}
function upgradeMult(level) {
	return 1 + level * .18;
}
var EMPTY_HUD = {
	score: 0,
	coins: 0,
	distance: 0,
	combo: 0,
	fps: 60,
	speed: 0,
	powers: [],
	shield: false
};
function write(save) {
	persistSave(save);
	return save;
}
var useGameStore = create((set, get) => ({
	overlay: "menu",
	ready: false,
	save: DEFAULT_SAVE,
	hud: EMPTY_HUD,
	lastRun: null,
	newHigh: false,
	unlockedNotes: [],
	lastStats: null,
	hydrate: () => {
		set({
			save: loadSave(),
			ready: true
		});
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
			unlockedNotes: unlocked
		});
	},
	setSettings: (patch) => {
		const save = get().save;
		set({ save: write({
			...save,
			settings: {
				...save.settings,
				...patch
			}
		}) });
	},
	buyCharacter: (id) => {
		const save = get().save;
		const def = CHARACTERS.find((c) => c.id === id);
		if (!def || save.unlocked.includes(id) || save.coins < def.price) return false;
		set({ save: write({
			...save,
			coins: save.coins - def.price,
			unlocked: [...save.unlocked, id],
			selected: id
		}) });
		return true;
	},
	selectCharacter: (id) => {
		const save = get().save;
		if (!save.unlocked.includes(id)) return;
		set({ save: write({
			...save,
			selected: id
		}) });
	},
	buyUpgrade: (id) => {
		const save = get().save;
		const level = save.upgrades[id];
		if (level >= 3) return false;
		const price = UPGRADE_PRICES[level];
		if (save.coins < price) return false;
		set({ save: write({
			...save,
			coins: save.coins - price,
			upgrades: {
				...save.upgrades,
				[id]: level + 1
			}
		}) });
		return true;
	},
	claim: (missionId) => {
		const { save, lastStats } = get();
		const next = claimMission(save, missionId, lastStats);
		if (next === save) return;
		set({ save: write(next) });
	},
	dismissNotes: () => set({ unlockedNotes: [] })
}));
function missionList(save) {
	return activeMissions(save);
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var SWATCH = {
	jett: "swatch-jett",
	maru: "swatch-maru",
	rook: "swatch-rook",
	nyx: "swatch-nyx",
	pico: "swatch-pico"
};
function GameOverlays(props) {
	const overlay = useGameStore((s) => s.overlay);
	if (overlay === "play") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hud, { onPause: props.onPause });
	if (overlay === "pause") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PauseScreen, { ...props });
	if (overlay === "over") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OverScreen, { ...props });
	if (overlay === "settings") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsScreen, { ...props });
	if (overlay === "garage") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GarageScreen, { ...props });
	if (overlay === "missions") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MissionsScreen, { ...props });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuScreen, { ...props });
}
function Hud({ onPause }) {
	const hud = useGameStore((s) => s.hud);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "hud-layer pointer-events-none absolute inset-0 z-10 flex flex-col p-4 pt-[max(16px,env(safe-area-inset-top))]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "chip text-fg",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "display text-lg tabular",
					children: hud.score
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "chip text-fg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleDollarSign, {
						className: "size-3.5 text-accent",
						strokeWidth: 2
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tabular",
						children: hud.coins
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"data-ui": true,
					"aria-label": "Pause",
					onClick: onPause,
					className: "btn btn-ghost size-12 min-h-12 p-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-5" })
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-2 flex flex-wrap gap-1.5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "chip text-muted",
					children: [hud.distance, " m"]
				}),
				hud.combo >= 3 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "chip text-accent",
					children: ["Streak ", hud.combo]
				}) : null,
				hud.powers.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "chip text-fg",
					children: [
						p.id === "shield" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "size-3.5" }) : null,
						p.id === "magnet" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Magnet, { className: "size-3.5" }) : null,
						p.id === "boost" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "size-3.5" }) : null,
						POWER_LABEL[p.id],
						" ",
						p.t.toFixed(0),
						"s"
					]
				}, p.id))
			]
		})]
	});
}
function Shell({ children, wide }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "scrim absolute inset-0 z-20 flex items-end justify-center overflow-y-auto p-4 pb-[max(20px,env(safe-area-inset-bottom))] pt-[max(20px,env(safe-area-inset-top))] sm:items-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("panel w-full", wide ? "max-w-lg" : "max-w-md"),
			children
		})
	});
}
function MenuScreen({ onStart, onOpen }) {
	const save = useGameStore((s) => s.save);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-medium tracking-[0.18em] text-muted uppercase",
			children: "Solara streets"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "display mt-2 text-4xl font-semibold text-fg sm:text-5xl",
			children: "Rushline"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 max-w-sm text-sm leading-relaxed text-muted",
			children: "Three lanes through a sunlit city. Swipe to move, jump, and slide. Keep the line."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-5 grid grid-cols-2 gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-md bg-surface-2 px-3 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-subtle",
					children: "Best"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "display text-xl tabular text-fg",
					children: save.highScore
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-md bg-surface-2 px-3 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-subtle",
					children: "Bank"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "display text-xl tabular text-fg",
					children: save.coins
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			className: "btn btn-primary mt-5 w-full",
			onClick: onStart,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), "Start"]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 grid grid-cols-3 gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "btn btn-ghost",
					onClick: () => onOpen("garage"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-4" }), "Crew"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "btn btn-ghost",
					onClick: () => onOpen("missions"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flag, { className: "size-4" }), "Tasks"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "btn btn-ghost",
					onClick: () => onOpen("settings"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "size-4" }), "Setup"]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ControlsHint, {})
	] });
}
function ControlsHint() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-5 flex flex-wrap items-center gap-3 text-xs text-subtle",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "inline-flex items-center gap-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-3.5" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-3.5" }),
					"lane"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "inline-flex items-center gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, { className: "size-3.5" }), "jump"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "inline-flex items-center gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDown, { className: "size-3.5" }), "slide"]
			})
		]
	});
}
function PauseScreen({ onResume, onRetry, onMenu, onOpen }) {
	const hud = useGameStore((s) => s.hud);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "display text-2xl font-semibold",
			children: "Paused"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-1 text-sm text-muted",
			children: [
				hud.distance,
				" m · ",
				hud.coins,
				" coins"
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "btn btn-primary mt-5 w-full",
			onClick: onResume,
			children: "Resume"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-2 grid grid-cols-3 gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "btn btn-ghost",
					onClick: onRetry,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4" }), "Retry"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "btn btn-ghost",
					onClick: () => onOpen("settings"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "size-4" }), "Setup"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "btn btn-ghost",
					onClick: onMenu,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "size-4" }), "Menu"]
				})
			]
		})
	] });
}
function OverScreen({ onRetry, onMenu }) {
	const last = useGameStore((s) => s.lastRun);
	const save = useGameStore((s) => s.save);
	const newHigh = useGameStore((s) => s.newHigh);
	const notes = useGameStore((s) => s.unlockedNotes);
	if (!last) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-medium tracking-[0.16em] text-muted uppercase",
			children: "Run over"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "display mt-1 text-3xl font-semibold",
			children: last.score
		}),
		newHigh ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-accent",
			children: "New best"
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid grid-cols-3 gap-2 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Distance",
					value: `${Math.floor(last.distance)} m`
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Coins",
					value: `${last.coins}`
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Streak",
					value: `${last.combo}`
				})
			]
		}),
		notes.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-4 space-y-1 text-sm text-accent",
			children: notes.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: n }, n))
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-3 text-xs text-subtle",
			children: ["Bank ", save.coins]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			className: "btn btn-primary mt-5 w-full",
			onClick: onRetry,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4" }), "Restart"]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "btn btn-ghost mt-2 w-full",
			onClick: onMenu,
			children: "Main menu"
		})
	] });
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md bg-surface-2 px-2 py-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[11px] text-subtle",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "display mt-0.5 tabular text-fg",
			children: value
		})]
	});
}
function SettingsScreen({ onOpen, onMenu }) {
	const save = useGameStore((s) => s.save);
	const setSettings = useGameStore((s) => s.setSettings);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {
			title: "Setup",
			onBack: () => onOpen("menu")
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
			className: "mt-4 block text-sm text-muted",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "mb-2 flex items-center gap-2 text-fg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" }), "Music"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "range",
				min: 0,
				max: 1,
				step: .01,
				value: save.settings.music,
				onChange: (e) => setSettings({ music: Number(e.target.value) })
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
			className: "mt-4 block text-sm text-muted",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "mb-2 flex items-center gap-2 text-fg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" }), "Effects"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "range",
				min: 0,
				max: 1,
				step: .01,
				value: save.settings.sfx,
				onChange: (e) => setSettings({ sfx: Number(e.target.value) })
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-5 flex items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-fg",
				children: "Camera shake"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: cn("btn min-h-10 px-3 text-sm", save.settings.shake ? "btn-primary" : "btn-ghost"),
				onClick: () => setSettings({ shake: !save.settings.shake }),
				children: save.settings.shake ? "On" : "Off"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-5 text-sm text-fg",
			children: "Picture quality"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-2 grid grid-cols-4 gap-1.5",
			children: [
				"auto",
				"high",
				"med",
				"low"
			].map((q) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: cn("btn min-h-10 px-2 text-sm capitalize", save.settings.quality === q ? "btn-primary" : "btn-ghost"),
				onClick: () => setSettings({ quality: q }),
				children: q
			}, q))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "btn btn-ghost mt-6 w-full",
			onClick: onMenu,
			children: "Main menu"
		})
	] });
}
function GarageScreen({ onOpen }) {
	const save = useGameStore((s) => s.save);
	const buyCharacter = useGameStore((s) => s.buyCharacter);
	const selectCharacter = useGameStore((s) => s.selectCharacter);
	const buyUpgrade = useGameStore((s) => s.buyUpgrade);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, {
		wide: true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {
				title: "Crew",
				onBack: () => onOpen("menu")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-sm text-muted",
				children: ["Bank ", save.coins]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid grid-cols-2 gap-2",
				children: CHARACTERS.map((c) => {
					const owned = save.unlocked.includes(c.id);
					const selected = save.selected === c.id;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: cn("rounded-lg border p-2.5 text-left", selected ? "border-accent bg-surface-2" : "border-border bg-surface"),
						onClick: () => owned ? selectCharacter(c.id) : buyCharacter(c.id),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("swatch", SWATCH[c.id]) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "display mt-2 text-sm text-fg",
								children: c.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-0.5 line-clamp-2 text-[11px] leading-snug text-subtle",
								children: c.blurb
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs text-muted",
								children: owned ? selected ? "Selected" : "Owned" : `${c.price} coins`
							})
						]
					}, c.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "display mt-5 text-base text-fg",
				children: "Kits"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 space-y-2",
				children: UPGRADES.map((u) => {
					const level = save.upgrades[u.id];
					const maxed = level >= 3;
					const price = maxed ? 0 : UPGRADE_PRICES[level];
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center justify-between gap-3 rounded-md bg-surface-2 px-3 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-fg",
							children: u.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-[11px] text-subtle",
							children: [
								u.blurb,
								" · ",
								level,
								"/3"
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							disabled: maxed || save.coins < price,
							className: "btn btn-ghost min-h-10 px-3 text-sm",
							onClick: () => buyUpgrade(u.id),
							children: maxed ? "Max" : price
						})]
					}, u.id);
				})
			})
		]
	});
}
function MissionsScreen({ onOpen }) {
	const save = useGameStore((s) => s.save);
	const last = useGameStore((s) => s.lastStats);
	const claim = useGameStore((s) => s.claim);
	const dummy = last ?? {
		score: 0,
		coins: 0,
		distance: 0,
		jumps: 0,
		slides: 0,
		powers: 0,
		combo: 0,
		shieldSave: false,
		usedMagnet: false
	};
	const daily = DAILY_CHALLENGES.find((d) => d.id === save.daily.id);
	const missions = missionList(save);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, {
		wide: true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {
				title: "Tasks",
				onBack: () => onOpen("menu")
			}),
			daily ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 rounded-lg border border-border bg-surface-2 p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs tracking-[0.14em] text-subtle uppercase",
						children: "Today"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "display mt-1 text-fg",
						children: daily.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: daily.blurb
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
						value: save.daily.best,
						max: daily.target
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-subtle",
						children: save.daily.claimed ? "Claimed" : `${Math.min(save.daily.best, daily.target)} / ${daily.target} · ${daily.reward} coins`
					})
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 space-y-2",
				children: missions.map((m) => {
					const value = statValue(m, dummy, save);
					const ready = value >= m.target;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-md border border-border bg-surface px-3 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-fg",
								children: m.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] text-subtle",
								children: m.blurb
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								disabled: !ready,
								className: "btn btn-ghost min-h-10 px-3 text-sm",
								onClick: () => claim(m.id),
								children: ready ? m.reward : `${Math.min(value, m.target)}/${m.target}`
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
							value,
							max: m.target
						})]
					}, m.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "display mt-5 text-base text-fg",
				children: "Marks"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 space-y-1.5",
				children: ACHIEVEMENTS.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-2 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: cn("size-3.5", save.achievements[a.id] ? "text-accent" : "text-subtle") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: save.achievements[a.id] ? "text-fg" : "text-muted",
						children: [a.name, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-2 text-[11px] text-subtle",
							children: a.blurb
						})]
					})]
				}, a.id))
			})
		]
	});
}
function Bar({ value, max }) {
	const pct = Math.max(0, Math.min(1, value / max));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "progress-track mt-2",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "progress-fill",
			style: { width: `${pct * 100}%` }
		})
	});
}
function Header({ title, onBack }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "btn btn-ghost size-11 min-h-11 p-0",
			onClick: onBack,
			"aria-label": "Back",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "display text-2xl font-semibold",
			children: title
		})]
	});
}
function GameApp() {
	const canvasRef = (0, import_react.useRef)(null);
	const engineRef = (0, import_react.useRef)(null);
	const overlay = useGameStore((s) => s.overlay);
	const save = useGameStore((s) => s.save);
	const hydrate = useGameStore((s) => s.hydrate);
	const setOverlay = useGameStore((s) => s.setOverlay);
	const returnTo = (0, import_react.useRef)("menu");
	(0, import_react.useEffect)(() => {
		hydrate();
	}, [hydrate]);
	(0, import_react.useEffect)(() => {
		if (!canvasRef.current) return;
		let cancelled = false;
		let engine = null;
		import("./engine-USv0WkB_.mjs").then(({ GameEngine }) => {
			if (cancelled || !canvasRef.current) return;
			const state = useGameStore.getState();
			engine = new GameEngine(canvasRef.current, {
				onHud: (h) => useGameStore.getState().setHud(h),
				onOver: (stats) => useGameStore.getState().finishRun(stats),
				onPause: () => useGameStore.getState().setOverlay("pause")
			}, state.save);
			engineRef.current = engine;
			engine.start();
		});
		return () => {
			cancelled = true;
			engine?.dispose();
			engineRef.current = null;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		engineRef.current?.applySave(save);
	}, [save]);
	const unlock = (0, import_react.useCallback)(() => {
		engineRef.current?.unlockAudio();
	}, []);
	const onStart = (0, import_react.useCallback)(() => {
		unlock();
		engineRef.current?.beginRun();
		setOverlay("play");
	}, [setOverlay, unlock]);
	const onResume = (0, import_react.useCallback)(() => {
		unlock();
		engineRef.current?.resume();
		setOverlay("play");
	}, [setOverlay, unlock]);
	const onRetry = (0, import_react.useCallback)(() => {
		unlock();
		engineRef.current?.beginRun();
		setOverlay("play");
	}, [setOverlay, unlock]);
	const onMenu = (0, import_react.useCallback)(() => {
		engineRef.current?.toAttract();
		setOverlay("menu");
	}, [setOverlay]);
	const onPause = (0, import_react.useCallback)(() => {
		engineRef.current?.pause();
		setOverlay("pause");
	}, [setOverlay]);
	const onOpen = (0, import_react.useCallback)((o) => {
		if (o === "settings" || o === "garage" || o === "missions") returnTo.current = overlay === "settings" ? returnTo.current : overlay;
		if (o === "menu" && overlay === "settings" && returnTo.current === "pause") {
			setOverlay("pause");
			return;
		}
		setOverlay(o);
	}, [overlay, setOverlay]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "game-root",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "sr-only",
				children: "Rushline"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
				ref: canvasRef,
				className: "game-canvas"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GameOverlays, {
				onStart,
				onResume,
				onRetry,
				onMenu,
				onPause,
				onOpen
			})
		]
	});
}
var routes_exports = /* @__PURE__ */ __exportAll({ component: () => Home });
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GameApp, {});
}
//#endregion
export { SUPER_JUMP_MULT as _, BIOME_ORDER as a, JUMP_BUFFER as c, PLAYER_HALF_D as f, SPEED_PER_METER as g, SLIDE_TIME as h, ATTRACT_SPEED as i, JUMP_VY as l, POWER_DURATION as m, characterById as n, COYOTE as o, PLAYER_HALF_W as p, upgradeMult as r, FIXED_DT as s, routes_exports as t, LANE_X as u };
