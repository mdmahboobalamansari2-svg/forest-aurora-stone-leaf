import { useCallback, useEffect, useRef } from "react";
import type { GameEngine } from "@/game/engine";
import type { Overlay } from "@/game/constants";
import { useGameStore } from "@/store/game-store";
import { GameOverlays } from "./overlays";

export function GameApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const overlay = useGameStore((s) => s.overlay);
  const save = useGameStore((s) => s.save);
  const hydrate = useGameStore((s) => s.hydrate);
  const setOverlay = useGameStore((s) => s.setOverlay);
  const returnTo = useRef<Overlay>("menu");

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    let engine: GameEngine | null = null;
    void import("@/game/engine").then(({ GameEngine }) => {
      if (cancelled || !canvasRef.current) return;
      const state = useGameStore.getState();
      engine = new GameEngine(
        canvasRef.current,
        {
          onHud: (h) => useGameStore.getState().setHud(h),
          onOver: (stats) => useGameStore.getState().finishRun(stats),
          onPause: () => useGameStore.getState().setOverlay("pause"),
        },
        state.save,
      );
      engineRef.current = engine;
      engine.start();
    });
    return () => {
      cancelled = true;
      engine?.dispose();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    engineRef.current?.applySave(save);
  }, [save]);

  const unlock = useCallback(() => {
    engineRef.current?.unlockAudio();
  }, []);

  const onStart = useCallback(() => {
    unlock();
    engineRef.current?.beginRun();
    setOverlay("play");
  }, [setOverlay, unlock]);

  const onResume = useCallback(() => {
    unlock();
    engineRef.current?.resume();
    setOverlay("play");
  }, [setOverlay, unlock]);

  const onRetry = useCallback(() => {
    unlock();
    engineRef.current?.beginRun();
    setOverlay("play");
  }, [setOverlay, unlock]);

  const onMenu = useCallback(() => {
    engineRef.current?.toAttract();
    setOverlay("menu");
  }, [setOverlay]);

  const onPause = useCallback(() => {
    engineRef.current?.pause();
    setOverlay("pause");
  }, [setOverlay]);

  const onOpen = useCallback(
    (o: Overlay) => {
      if (o === "settings" || o === "garage" || o === "missions") {
        returnTo.current = overlay === "settings" ? returnTo.current : overlay;
      }
      if (o === "menu" && overlay === "settings" && returnTo.current === "pause") {
        setOverlay("pause");
        return;
      }
      setOverlay(o);
    },
    [overlay, setOverlay],
  );

  return (
    <main className="game-root">
      <h1 className="sr-only">Rushline</h1>
      <canvas ref={canvasRef} className="game-canvas" />
      <GameOverlays
        onStart={onStart}
        onResume={onResume}
        onRetry={onRetry}
        onMenu={onMenu}
        onPause={onPause}
        onOpen={onOpen}
      />
    </main>
  );
}
