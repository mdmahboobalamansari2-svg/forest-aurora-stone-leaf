const GAME_CODES = new Set([
  "KeyA",
  "KeyD",
  "KeyW",
  "KeyS",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Space",
  "Escape",
  "KeyP",
]);

export type InputActions = {
  laneLeft: boolean;
  laneRight: boolean;
  jump: boolean;
  slide: boolean;
  pause: boolean;
};

export class GameInput {
  private keys = new Set<string>();
  private injected = new Set<string>();
  private prev = new Set<string>();
  private canvas: HTMLElement;
  private px = 0;
  private py = 0;
  private tracking = false;
  private fired = false;
  private swipe: "left" | "right" | "up" | "down" | null = null;
  private enabled = true;
  private onBlur: () => void;
  private onKeyDown: (e: KeyboardEvent) => void;
  private onKeyUp: (e: KeyboardEvent) => void;
  private onDown: (e: PointerEvent) => void;
  private onMove: (e: PointerEvent) => void;
  private onUp: (e: PointerEvent) => void;

  constructor(canvas: HTMLElement) {
    this.canvas = canvas;
    this.onBlur = () => {
      this.keys.clear();
    };
    this.onKeyDown = (e) => {
      if (GAME_CODES.has(e.code)) e.preventDefault();
      this.keys.add(e.code);
    };
    this.onKeyUp = (e) => {
      this.keys.delete(e.code);
    };
    this.onDown = (e) => {
      if (!this.enabled) return;
      this.tracking = true;
      this.fired = false;
      this.px = e.clientX;
      this.py = e.clientY;
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    };
    this.onMove = (e) => {
      if (!this.tracking || this.fired || !this.enabled) return;
      const dx = e.clientX - this.px;
      const dy = e.clientY - this.py;
      const ax = Math.abs(dx);
      const ay = Math.abs(dy);
      if (ax < 22 && ay < 22) return;
      this.fired = true;
      if (ax > ay) this.swipe = dx < 0 ? "left" : "right";
      else this.swipe = dy < 0 ? "up" : "down";
    };
    this.onUp = (e) => {
      if (!this.tracking) return;
      this.tracking = false;
      if (!this.fired && this.enabled) {
        const dx = e.clientX - this.px;
        const dy = e.clientY - this.py;
        const ax = Math.abs(dx);
        const ay = Math.abs(dy);
        if (ax > 16 || ay > 16) {
          if (ax > ay) this.swipe = dx < 0 ? "left" : "right";
          else this.swipe = dy < 0 ? "up" : "down";
        }
      }
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    };

    window.addEventListener("keydown", this.onKeyDown, { passive: false });
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("blur", this.onBlur);
    document.addEventListener("visibilitychange", this.onBlur);
    canvas.addEventListener("pointerdown", this.onDown);
    canvas.addEventListener("pointermove", this.onMove);
    canvas.addEventListener("pointerup", this.onUp);
    canvas.addEventListener("pointercancel", this.onUp);
  }

  setEnabled(v: boolean) {
    this.enabled = v;
    if (!v) {
      this.tracking = false;
      this.swipe = null;
    }
  }

  setInjected(codes: string[]) {
    this.injected = new Set(codes);
  }

  sample(): InputActions {
    const down = (code: string) => this.keys.has(code) || this.injected.has(code);
    const edge = (code: string) => down(code) && !this.prev.has(code);

    const actions: InputActions = {
      laneLeft: edge("KeyA") || edge("ArrowLeft") || this.swipe === "left",
      laneRight: edge("KeyD") || edge("ArrowRight") || this.swipe === "right",
      jump: edge("KeyW") || edge("ArrowUp") || edge("Space") || this.swipe === "up",
      slide: edge("KeyS") || edge("ArrowDown") || this.swipe === "down",
      pause: edge("Escape") || edge("KeyP"),
    };

    this.swipe = null;
    this.prev = new Set([...this.keys, ...this.injected]);
    return actions;
  }

  dispose() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("blur", this.onBlur);
    document.removeEventListener("visibilitychange", this.onBlur);
    this.canvas.removeEventListener("pointerdown", this.onDown);
    this.canvas.removeEventListener("pointermove", this.onMove);
    this.canvas.removeEventListener("pointerup", this.onUp);
    this.canvas.removeEventListener("pointercancel", this.onUp);
  }
}
