import type { ReactNode } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CircleDollarSign,
  Flag,
  Home,
  Magnet,
  Pause,
  Play,
  RotateCcw,
  Settings,
  Shield,
  Ship,
  TrainFront,
  Trophy,
  User,
  Volume2,
  Wind,
  Zap,
} from "lucide-react";
import {
  ACHIEVEMENTS,
  CHARACTERS,
  DAILY_CHALLENGES,
  POWER_LABEL,
  UPGRADE_PRICES,
  UPGRADES,
  type Overlay,
} from "@/game/constants";
import { statValue } from "@/game/save";
import { cn } from "@/lib/utils";
import { missionList, useGameStore } from "@/store/game-store";

const SWATCH: Record<string, string> = {
  jett: "swatch-jett",
  maru: "swatch-maru",
  rook: "swatch-rook",
  nyx: "swatch-nyx",
  pico: "swatch-pico",
};

type OverlayProps = {
  onStart: () => void;
  onResume: () => void;
  onRetry: () => void;
  onMenu: () => void;
  onPause: () => void;
  onOpen: (o: Overlay) => void;
};

export function GameOverlays(props: OverlayProps) {
  const overlay = useGameStore((s) => s.overlay);
  if (overlay === "play") return <Hud onPause={props.onPause} />;
  if (overlay === "pause") return <PauseScreen {...props} />;
  if (overlay === "over") return <OverScreen {...props} />;
  if (overlay === "settings") return <SettingsScreen {...props} />;
  if (overlay === "garage") return <GarageScreen {...props} />;
  if (overlay === "missions") return <MissionsScreen {...props} />;
  return <MenuScreen {...props} />;
}

function Hud({ onPause }: { onPause: () => void }) {
  const hud = useGameStore((s) => s.hud);
  return (
    <div className="hud-layer pointer-events-none absolute inset-0 z-10 flex flex-col p-4 pt-[max(16px,env(safe-area-inset-top))]">
      <div className="flex items-start justify-between gap-3">
        <div className="chip text-fg">
          <span className="display text-lg tabular">{hud.score}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="chip text-fg">
            <CircleDollarSign className="size-3.5 text-accent" strokeWidth={2} />
            <span className="tabular">{hud.coins}</span>
          </div>
          <button
            type="button"
            data-ui
            aria-label="Pause"
            onClick={onPause}
            className="btn btn-ghost size-12 min-h-12 p-0"
          >
            <Pause className="size-5" />
          </button>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <span className="chip text-muted">{hud.distance} m</span>
        {hud.combo >= 3 ? <span className="chip text-accent">Streak {hud.combo}</span> : null}
        {hud.pad ? (
          <span className="chip text-fg">
            <Zap className="size-3.5" />
            Kick
          </span>
        ) : null}
        {hud.powers.map((p) => (
          <span key={p.id} className="chip text-fg">
            {p.id === "shield" ? <Shield className="size-3.5" /> : null}
            {p.id === "magnet" ? <Magnet className="size-3.5" /> : null}
            {p.id === "boost" ? <Zap className="size-3.5" /> : null}
            {p.id === "deck" ? <Wind className="size-3.5" /> : null}
            {POWER_LABEL[p.id]} {p.t.toFixed(0)}s
          </span>
        ))}
      </div>
      <p className="mt-auto pb-1 text-[11px] tracking-[0.14em] text-subtle uppercase">{hud.zone}</p>
    </div>
  );
}

function Shell({
  children,
  wide,
  align = "end",
}: {
  children: ReactNode;
  wide?: boolean;
  align?: "end" | "start";
}) {
  return (
    <div
      className={cn(
        "scrim absolute inset-0 z-20 flex justify-center overflow-y-auto p-4",
        "pt-[max(16px,env(safe-area-inset-top))] pb-[max(20px,env(safe-area-inset-bottom))]",
        align === "start" ? "items-start" : "items-end sm:items-center",
      )}
    >
      <div className={cn("panel w-full", wide ? "max-w-lg" : "max-w-md")}>{children}</div>
    </div>
  );
}

function MenuScreen({ onStart, onOpen }: OverlayProps) {
  const save = useGameStore((s) => s.save);
  return (
    <Shell>
      <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">Solara streets</p>
      <h1 className="display mt-2 text-4xl font-semibold text-fg sm:text-5xl">Rushline</h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
        Three lanes through a sunlit city. Jump the commuter cars, land on harbor boats, and kick surge pads.
      </p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-md bg-surface-2 px-2 py-2 text-center">
          <TrainFront className="mx-auto size-4 text-accent" strokeWidth={1.75} />
          <p className="mt-1 text-[11px] text-subtle">Ride cars</p>
        </div>
        <div className="rounded-md bg-surface-2 px-2 py-2 text-center">
          <Ship className="mx-auto size-4 text-accent" strokeWidth={1.75} />
          <p className="mt-1 text-[11px] text-subtle">Harbor boats</p>
        </div>
        <div className="rounded-md bg-surface-2 px-2 py-2 text-center">
          <Zap className="mx-auto size-4 text-accent" strokeWidth={1.75} />
          <p className="mt-1 text-[11px] text-subtle">Surge pads</p>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <div className="rounded-md bg-surface-2 px-3 py-2">
          <p className="text-xs text-subtle">Best</p>
          <p className="display text-xl tabular text-fg">{save.highScore}</p>
        </div>
        <div className="rounded-md bg-surface-2 px-3 py-2">
          <p className="text-xs text-subtle">Bank</p>
          <p className="display text-xl tabular text-fg">{save.coins}</p>
        </div>
      </div>
      <button type="button" className="btn btn-primary mt-5 w-full" onClick={onStart}>
        <Play className="size-4" />
        Start
      </button>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <button type="button" className="btn btn-ghost" onClick={() => onOpen("garage")}>
          <User className="size-4" />
          Crew
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => onOpen("missions")}>
          <Flag className="size-4" />
          Tasks
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => onOpen("settings")}>
          <Settings className="size-4" />
          Setup
        </button>
      </div>
      <ControlsHint />
    </Shell>
  );
}

function ControlsHint() {
  return (
    <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-subtle">
      <span className="inline-flex items-center gap-1">
        <ArrowLeft className="size-3.5" />
        <ArrowRight className="size-3.5" />
        lane
      </span>
      <span className="inline-flex items-center gap-1">
        <ArrowUp className="size-3.5" />
        jump
      </span>
      <span className="inline-flex items-center gap-1">
        <ArrowDown className="size-3.5" />
        slide
      </span>
    </div>
  );
}

function PauseScreen({ onResume, onRetry, onMenu, onOpen }: OverlayProps) {
  const hud = useGameStore((s) => s.hud);
  return (
    <Shell>
      <h2 className="display text-2xl font-semibold">Paused</h2>
      <p className="mt-1 text-sm text-muted">
        {hud.distance} m · {hud.coins} coins
      </p>
      <button type="button" className="btn btn-primary mt-5 w-full" onClick={onResume}>
        Resume
      </button>
      <div className="mt-2 grid grid-cols-3 gap-2">
        <button type="button" className="btn btn-ghost" onClick={onRetry}>
          <RotateCcw className="size-4" />
          Retry
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => onOpen("settings")}>
          <Settings className="size-4" />
          Setup
        </button>
        <button type="button" className="btn btn-ghost" onClick={onMenu}>
          <Home className="size-4" />
          Menu
        </button>
      </div>
    </Shell>
  );
}

function OverScreen({ onRetry, onMenu }: OverlayProps) {
  const last = useGameStore((s) => s.lastRun);
  const save = useGameStore((s) => s.save);
  const newHigh = useGameStore((s) => s.newHigh);
  const notes = useGameStore((s) => s.unlockedNotes);
  if (!last) return null;
  return (
    <Shell>
      <p className="text-xs font-medium tracking-[0.16em] text-muted uppercase">Run over</p>
      <h2 className="display mt-1 text-3xl font-semibold">{last.score}</h2>
      {newHigh ? <p className="mt-1 text-sm text-accent">New best</p> : null}
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Stat label="Distance" value={`${Math.floor(last.distance)} m`} />
        <Stat label="Coins" value={`${last.coins}`} />
        <Stat label="Streak" value={`${last.combo}`} />
      </div>
      {notes.length > 0 ? (
        <ul className="mt-4 space-y-1 text-sm text-accent">
          {notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      ) : null}
      <p className="mt-3 text-xs text-subtle">Bank {save.coins}</p>
      <button type="button" className="btn btn-primary mt-5 w-full" onClick={onRetry}>
        <RotateCcw className="size-4" />
        Restart
      </button>
      <button type="button" className="btn btn-ghost mt-2 w-full" onClick={onMenu}>
        Main menu
      </button>
    </Shell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-surface-2 px-2 py-2">
      <p className="text-[11px] text-subtle">{label}</p>
      <p className="display mt-0.5 tabular text-fg">{value}</p>
    </div>
  );
}

function SettingsScreen({ onOpen, onMenu }: OverlayProps) {
  const save = useGameStore((s) => s.save);
  const setSettings = useGameStore((s) => s.setSettings);
  return (
    <Shell align="start">
      <Header title="Setup" onBack={() => onOpen("menu")} />
      <label className="mt-4 block text-sm text-muted">
        <span className="mb-2 flex items-center gap-2 text-fg">
          <Volume2 className="size-4" />
          Music
        </span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={save.settings.music}
          onChange={(e) => setSettings({ music: Number(e.target.value) })}
        />
      </label>
      <label className="mt-4 block text-sm text-muted">
        <span className="mb-2 flex items-center gap-2 text-fg">
          <Volume2 className="size-4" />
          Effects
        </span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={save.settings.sfx}
          onChange={(e) => setSettings({ sfx: Number(e.target.value) })}
        />
      </label>
      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-sm text-fg">Camera shake</p>
        <button
          type="button"
          className={cn("btn min-h-10 px-3 text-sm", save.settings.shake ? "btn-primary" : "btn-ghost")}
          onClick={() => setSettings({ shake: !save.settings.shake })}
        >
          {save.settings.shake ? "On" : "Off"}
        </button>
      </div>
      <p className="mt-5 text-sm text-fg">Picture quality</p>
      <div className="mt-2 grid grid-cols-4 gap-1.5">
        {(["auto", "high", "med", "low"] as const).map((q) => (
          <button
            key={q}
            type="button"
            className={cn("btn min-h-10 px-2 text-sm capitalize", save.settings.quality === q ? "btn-primary" : "btn-ghost")}
            onClick={() => setSettings({ quality: q })}
          >
            {q}
          </button>
        ))}
      </div>
      <button type="button" className="btn btn-ghost mt-6 w-full" onClick={onMenu}>
        Main menu
      </button>
    </Shell>
  );
}

function GarageScreen({ onOpen }: OverlayProps) {
  const save = useGameStore((s) => s.save);
  const buyCharacter = useGameStore((s) => s.buyCharacter);
  const selectCharacter = useGameStore((s) => s.selectCharacter);
  const buyUpgrade = useGameStore((s) => s.buyUpgrade);
  return (
    <Shell wide align="start">
      <Header title="Crew" onBack={() => onOpen("menu")} />
      <p className="mt-1 text-sm text-muted">Bank {save.coins}</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {CHARACTERS.map((c) => {
          const owned = save.unlocked.includes(c.id);
          const selected = save.selected === c.id;
          return (
            <button
              key={c.id}
              type="button"
              className={cn(
                "rounded-lg border p-2.5 text-left",
                selected ? "border-accent bg-surface-2" : "border-border bg-surface",
              )}
              onClick={() => (owned ? selectCharacter(c.id) : buyCharacter(c.id))}
            >
              <div className={cn("swatch", SWATCH[c.id])} />
              <p className="display mt-2 text-sm text-fg">{c.name}</p>
              <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-subtle">{c.blurb}</p>
              <p className="mt-2 text-xs text-muted">
                {owned ? (selected ? "Selected" : "Owned") : `${c.price} coins`}
              </p>
            </button>
          );
        })}
      </div>
      <h3 className="display mt-5 text-base text-fg">Kits</h3>
      <ul className="mt-2 space-y-2">
        {UPGRADES.map((u) => {
          const level = save.upgrades[u.id];
          const maxed = level >= 3;
          const price = maxed ? 0 : UPGRADE_PRICES[level]!;
          return (
            <li key={u.id} className="flex items-center justify-between gap-3 rounded-md bg-surface-2 px-3 py-2">
              <div>
                <p className="text-sm text-fg">{u.name}</p>
                <p className="text-[11px] text-subtle">
                  {u.blurb} · {level}/3
                </p>
              </div>
              <button
                type="button"
                disabled={maxed || save.coins < price}
                className="btn btn-ghost min-h-10 px-3 text-sm"
                onClick={() => buyUpgrade(u.id)}
              >
                {maxed ? "Max" : price}
              </button>
            </li>
          );
        })}
      </ul>
    </Shell>
  );
}

function MissionsScreen({ onOpen }: OverlayProps) {
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
    usedMagnet: false,
    usedDeck: false,
    trains: 0,
    boats: 0,
    pads: 0,
  };
  const daily = DAILY_CHALLENGES.find((d) => d.id === save.daily.id);
  const missions = missionList(save);
  return (
    <Shell wide align="start">
      <Header title="Tasks" onBack={() => onOpen("menu")} />
      {daily ? (
        <div className="mt-4 rounded-lg border border-border bg-surface-2 p-3">
          <p className="text-xs tracking-[0.14em] text-subtle uppercase">Today</p>
          <p className="display mt-1 text-fg">{daily.name}</p>
          <p className="text-sm text-muted">{daily.blurb}</p>
          <Bar value={save.daily.best} max={daily.target} />
          <p className="mt-1 text-xs text-subtle">
            {save.daily.claimed ? "Claimed" : `${Math.min(save.daily.best, daily.target)} / ${daily.target} · ${daily.reward} coins`}
          </p>
        </div>
      ) : null}
      <ul className="mt-3 space-y-2">
        {missions.map((m) => {
          const value = statValue(m, dummy, save);
          const ready = value >= m.target;
          return (
            <li key={m.id} className="rounded-md border border-border bg-surface px-3 py-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm text-fg">{m.name}</p>
                  <p className="text-[11px] text-subtle">{m.blurb}</p>
                </div>
                <button
                  type="button"
                  disabled={!ready}
                  className="btn btn-ghost min-h-10 px-3 text-sm"
                  onClick={() => claim(m.id)}
                >
                  {ready ? m.reward : `${Math.min(value, m.target)}/${m.target}`}
                </button>
              </div>
              <Bar value={value} max={m.target} />
            </li>
          );
        })}
      </ul>
      <h3 className="display mt-5 text-base text-fg">Marks</h3>
      <ul className="mt-2 space-y-1.5">
        {ACHIEVEMENTS.map((a) => (
          <li key={a.id} className="flex items-center gap-2 text-sm">
            <Trophy className={cn("size-3.5", save.achievements[a.id] ? "text-accent" : "text-subtle")} />
            <span className={save.achievements[a.id] ? "text-fg" : "text-muted"}>
              {a.name}
              <span className="ml-2 text-[11px] text-subtle">{a.blurb}</span>
            </span>
          </li>
        ))}
      </ul>
    </Shell>
  );
}

function Bar({ value, max }: { value: number; max: number }) {
  const pct = Math.max(0, Math.min(1, value / max));
  return (
    <div className="progress-track mt-2">
      <div className="progress-fill" style={{ width: `${pct * 100}%` }} />
    </div>
  );
}

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <button type="button" className="btn btn-ghost size-11 min-h-11 p-0" onClick={onBack} aria-label="Back">
        <ArrowLeft className="size-4" />
      </button>
      <h2 className="display text-2xl font-semibold">{title}</h2>
    </div>
  );
}
