export class GameAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private unlocked = false;
  private musicOn = false;
  private musicTime = 0;
  private nextNote = 0;
  private step = 0;
  private footAcc = 0;
  private musicVol = 0.55;
  private sfxVol = 0.8;
  private muted = false;
  private noise: AudioBuffer | null = null;

  private ensure(): AudioContext | null {
    if (this.ctx) return this.ctx;
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctx({ latencyHint: "interactive" });
      this.master = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.musicGain.connect(this.master);
      this.sfxGain.connect(this.master);
      this.master.connect(this.ctx.destination);
      this.applyVolumes();
      this.noise = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.4, this.ctx.sampleRate);
      const data = this.noise.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      return this.ctx;
    } catch {
      return null;
    }
  }

  unlock() {
    const ctx = this.ensure();
    if (!ctx) return;
    if (ctx.state === "suspended") void ctx.resume();
    this.unlocked = true;
    this.musicOn = true;
  }

  resume() {
    if (this.ctx?.state === "suspended") void this.ctx.resume();
  }

  setMusic(v: number) {
    this.musicVol = v;
    this.applyVolumes();
  }

  setSfx(v: number) {
    this.sfxVol = v;
    this.applyVolumes();
  }

  private applyVolumes() {
    const t = this.ctx?.currentTime ?? 0;
    const m = this.muted ? 0 : 1;
    this.master?.gain.setTargetAtTime(m, t, 0.02);
    this.musicGain?.gain.setTargetAtTime(this.musicVol * this.musicVol * 0.22, t, 0.03);
    this.sfxGain?.gain.setTargetAtTime(this.sfxVol * this.sfxVol, t, 0.03);
  }

  tick(dt: number, running: boolean, speed: number) {
    if (!this.unlocked || !this.ctx || !this.musicGain || !this.sfxGain) return;
    if (this.ctx.state === "suspended") return;
    if (this.musicOn) this.scheduleMusic();
    if (running) {
      this.footAcc += dt * (0.85 + speed * 0.045);
      if (this.footAcc > 0.28) {
        this.footAcc = 0;
        this.footstep();
      }
    }
  }

  private scheduleMusic() {
    const ctx = this.ctx!;
    const now = ctx.currentTime;
    const bpm = 108;
    const eighth = 60 / bpm / 2;
    if (this.nextNote === 0) this.nextNote = now + 0.05;
    const scale = [110, 130.81, 146.83, 164.81, 196, 220, 261.63];
    const arp = [0, 2, 4, 2, 5, 4, 2, 0];
    while (this.nextNote < now + 0.7) {
      const i = this.step % 8;
      const t = this.nextNote;
      if (i === 0 || i === 4) this.tone(this.musicGain!, 55 * (i === 0 ? 1 : 1.25), t, 0.22, 0.07, "triangle");
      if (i % 2 === 0) this.noiseHit(this.musicGain!, t, 0.03, 0.04, 1800);
      const f = scale[arp[i]!]!;
      this.tone(this.musicGain!, f * 2, t, 0.09, 0.035, "sine");
      if (i === 3 || i === 7) this.tone(this.musicGain!, f * 3, t, 0.06, 0.02, "sine");
      this.nextNote += eighth;
      this.step++;
    }
    this.musicTime += 0;
  }

  private tone(
    dest: GainNode,
    freq: number,
    when: number,
    dur: number,
    gain: number,
    type: OscillatorType,
  ) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, when);
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(gain, when + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    osc.connect(g);
    g.connect(dest);
    osc.start(when);
    osc.stop(when + dur + 0.02);
    osc.onended = () => {
      osc.disconnect();
      g.disconnect();
    };
  }

  private noiseHit(dest: GainNode, when: number, dur: number, gain: number, freq: number) {
    if (!this.noise || !this.ctx) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = freq;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, when);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    src.connect(filter);
    filter.connect(g);
    g.connect(dest);
    src.start(when);
    src.stop(when + dur + 0.02);
  }

  private footstep() {
    if (!this.sfxGain || !this.ctx) return;
    const t = this.ctx.currentTime;
    this.noiseHit(this.sfxGain, t, 0.05, 0.08, 700 + Math.random() * 200);
  }

  play(name: "jump" | "slide" | "coin" | "power" | "hit" | "whoosh" | "land" | "ui" | "boost" | "splash") {
    if (!this.unlocked || !this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const dest = this.sfxGain;
    const jitter = 0.94 + Math.random() * 0.12;
    switch (name) {
      case "jump":
        this.tone(dest, 420 * jitter, t, 0.12, 0.08, "sine");
        this.tone(dest, 640 * jitter, t + 0.04, 0.1, 0.04, "triangle");
        break;
      case "slide":
        this.noiseHit(dest, t, 0.12, 0.1, 400);
        this.tone(dest, 180, t, 0.1, 0.04, "sawtooth");
        break;
      case "coin":
        this.tone(dest, 880 * jitter, t, 0.07, 0.07, "sine");
        this.tone(dest, 1320 * jitter, t + 0.04, 0.08, 0.05, "sine");
        break;
      case "power":
        this.tone(dest, 392, t, 0.12, 0.07, "triangle");
        this.tone(dest, 494, t + 0.08, 0.12, 0.07, "triangle");
        this.tone(dest, 587, t + 0.16, 0.16, 0.08, "sine");
        break;
      case "hit":
        this.noiseHit(dest, t, 0.22, 0.28, 180);
        this.tone(dest, 90, t, 0.2, 0.16, "sawtooth");
        break;
      case "whoosh":
        this.noiseHit(dest, t, 0.1, 0.08, 900);
        break;
      case "land":
        this.noiseHit(dest, t, 0.07, 0.1, 220);
        break;
      case "ui":
        this.tone(dest, 520, t, 0.06, 0.04, "sine");
        break;
      case "boost":
        this.tone(dest, 220 * jitter, t, 0.16, 0.07, "sawtooth");
        this.tone(dest, 480 * jitter, t + 0.04, 0.14, 0.06, "triangle");
        this.noiseHit(dest, t, 0.14, 0.1, 600);
        break;
      case "splash":
        this.noiseHit(dest, t, 0.16, 0.12, 280);
        this.tone(dest, 160, t, 0.12, 0.05, "sine");
        break;
    }
  }

  dispose() {
    void this.ctx?.close();
    this.ctx = null;
  }
}
