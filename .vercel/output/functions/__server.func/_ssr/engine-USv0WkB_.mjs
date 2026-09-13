import { _ as SUPER_JUMP_MULT, a as BIOME_ORDER, c as JUMP_BUFFER, f as PLAYER_HALF_D, g as SPEED_PER_METER, h as SLIDE_TIME, i as ATTRACT_SPEED, l as JUMP_VY, m as POWER_DURATION, n as characterById, o as COYOTE, p as PLAYER_HALF_W, r as upgradeMult, s as FIXED_DT, u as LANE_X } from "./routes-Dzuz0lG_.mjs";
import { C as SphereGeometry, S as Scene, _ as MeshBasicMaterial, a as Color, b as PerspectiveCamera, c as DynamicDrawUsage, d as Group, f as HemisphereLight, g as Mesh, h as InstancedMesh, i as CircleGeometry, l as Float32BufferAttribute, m as InstancedBufferAttribute, n as WebGLRenderer, o as CylinderGeometry, p as IcosahedronGeometry, r as BoxGeometry, s as DirectionalLight, t as mergeGeometries, u as Fog, v as MeshLambertMaterial, w as Timer, x as SRGBColorSpace, y as Object3D } from "../_libs/three.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/engine-USv0WkB_.js
var GameAudio = class {
	ctx = null;
	master = null;
	musicGain = null;
	sfxGain = null;
	unlocked = false;
	musicOn = false;
	musicTime = 0;
	nextNote = 0;
	step = 0;
	footAcc = 0;
	musicVol = .55;
	sfxVol = .8;
	muted = false;
	noise = null;
	ensure() {
		if (this.ctx) return this.ctx;
		try {
			const Ctx = window.AudioContext || window.webkitAudioContext;
			this.ctx = new Ctx({ latencyHint: "interactive" });
			this.master = this.ctx.createGain();
			this.musicGain = this.ctx.createGain();
			this.sfxGain = this.ctx.createGain();
			this.musicGain.connect(this.master);
			this.sfxGain.connect(this.master);
			this.master.connect(this.ctx.destination);
			this.applyVolumes();
			this.noise = this.ctx.createBuffer(1, this.ctx.sampleRate * .4, this.ctx.sampleRate);
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
		if (ctx.state === "suspended") ctx.resume();
		this.unlocked = true;
		this.musicOn = true;
	}
	resume() {
		if (this.ctx?.state === "suspended") this.ctx.resume();
	}
	setMusic(v) {
		this.musicVol = v;
		this.applyVolumes();
	}
	setSfx(v) {
		this.sfxVol = v;
		this.applyVolumes();
	}
	applyVolumes() {
		const t = this.ctx?.currentTime ?? 0;
		const m = this.muted ? 0 : 1;
		this.master?.gain.setTargetAtTime(m, t, .02);
		this.musicGain?.gain.setTargetAtTime(this.musicVol * this.musicVol * .22, t, .03);
		this.sfxGain?.gain.setTargetAtTime(this.sfxVol * this.sfxVol, t, .03);
	}
	tick(dt, running, speed) {
		if (!this.unlocked || !this.ctx || !this.musicGain || !this.sfxGain) return;
		if (this.ctx.state === "suspended") return;
		if (this.musicOn) this.scheduleMusic();
		if (running) {
			this.footAcc += dt * (.85 + speed * .045);
			if (this.footAcc > .28) {
				this.footAcc = 0;
				this.footstep();
			}
		}
	}
	scheduleMusic() {
		const now = this.ctx.currentTime;
		const eighth = 60 / 108 / 2;
		if (this.nextNote === 0) this.nextNote = now + .05;
		const scale = [
			110,
			130.81,
			146.83,
			164.81,
			196,
			220,
			261.63
		];
		const arp = [
			0,
			2,
			4,
			2,
			5,
			4,
			2,
			0
		];
		while (this.nextNote < now + .7) {
			const i = this.step % 8;
			const t = this.nextNote;
			if (i === 0 || i === 4) this.tone(this.musicGain, 55 * (i === 0 ? 1 : 1.25), t, .22, .07, "triangle");
			if (i % 2 === 0) this.noiseHit(this.musicGain, t, .03, .04, 1800);
			const f = scale[arp[i]];
			this.tone(this.musicGain, f * 2, t, .09, .035, "sine");
			if (i === 3 || i === 7) this.tone(this.musicGain, f * 3, t, .06, .02, "sine");
			this.nextNote += eighth;
			this.step++;
		}
		this.musicTime += 0;
	}
	tone(dest, freq, when, dur, gain, type) {
		const ctx = this.ctx;
		const osc = ctx.createOscillator();
		const g = ctx.createGain();
		osc.type = type;
		osc.frequency.setValueAtTime(freq, when);
		g.gain.setValueAtTime(1e-4, when);
		g.gain.exponentialRampToValueAtTime(gain, when + .012);
		g.gain.exponentialRampToValueAtTime(1e-4, when + dur);
		osc.connect(g);
		g.connect(dest);
		osc.start(when);
		osc.stop(when + dur + .02);
		osc.onended = () => {
			osc.disconnect();
			g.disconnect();
		};
	}
	noiseHit(dest, when, dur, gain, freq) {
		if (!this.noise || !this.ctx) return;
		const src = this.ctx.createBufferSource();
		src.buffer = this.noise;
		const filter = this.ctx.createBiquadFilter();
		filter.type = "highpass";
		filter.frequency.value = freq;
		const g = this.ctx.createGain();
		g.gain.setValueAtTime(gain, when);
		g.gain.exponentialRampToValueAtTime(1e-4, when + dur);
		src.connect(filter);
		filter.connect(g);
		g.connect(dest);
		src.start(when);
		src.stop(when + dur + .02);
	}
	footstep() {
		if (!this.sfxGain || !this.ctx) return;
		const t = this.ctx.currentTime;
		this.noiseHit(this.sfxGain, t, .05, .08, 700 + Math.random() * 200);
	}
	play(name) {
		if (!this.unlocked || !this.ctx || !this.sfxGain) return;
		const t = this.ctx.currentTime;
		const dest = this.sfxGain;
		const jitter = .94 + Math.random() * .12;
		switch (name) {
			case "jump":
				this.tone(dest, 420 * jitter, t, .12, .08, "sine");
				this.tone(dest, 640 * jitter, t + .04, .1, .04, "triangle");
				break;
			case "slide":
				this.noiseHit(dest, t, .12, .1, 400);
				this.tone(dest, 180, t, .1, .04, "sawtooth");
				break;
			case "coin":
				this.tone(dest, 880 * jitter, t, .07, .07, "sine");
				this.tone(dest, 1320 * jitter, t + .04, .08, .05, "sine");
				break;
			case "power":
				this.tone(dest, 392, t, .12, .07, "triangle");
				this.tone(dest, 494, t + .08, .12, .07, "triangle");
				this.tone(dest, 587, t + .16, .16, .08, "sine");
				break;
			case "hit":
				this.noiseHit(dest, t, .22, .28, 180);
				this.tone(dest, 90, t, .2, .16, "sawtooth");
				break;
			case "whoosh":
				this.noiseHit(dest, t, .1, .08, 900);
				break;
			case "land":
				this.noiseHit(dest, t, .07, .1, 220);
				break;
			case "ui": this.tone(dest, 520, t, .06, .04, "sine");
		}
	}
	dispose() {
		this.ctx?.close();
		this.ctx = null;
	}
};
function mat(color, extras) {
	return new MeshLambertMaterial({
		color,
		...extras
	});
}
function box$1(w, h, d, material, y = 0) {
	const mesh = new Mesh(new BoxGeometry(w, h, d), material);
	mesh.position.y = y;
	mesh.castShadow = false;
	mesh.receiveShadow = false;
	return mesh;
}
var RunnerRig = class {
	root = new Group();
	hip = new Group();
	torso = new Group();
	head = new Group();
	armL = new Group();
	armR = new Group();
	legL = new Group();
	legR = new Group();
	shinL = new Group();
	shinR = new Group();
	scarf = new Group();
	visor;
	shadow;
	mats = [];
	runT = 0;
	crashT = 0;
	squash = 1;
	constructor() {
		const skin = mat(14725257);
		const jacket = mat(3112826);
		const pants = mat(2371642);
		const visorM = mat(12868682, {
			emissive: 4200464,
			emissiveIntensity: .35
		});
		const hair = mat(1711652);
		const scarfM = mat(14273462);
		const shoes = mat(1382944);
		this.mats = [
			skin,
			jacket,
			pants,
			visorM,
			hair,
			scarfM,
			shoes
		];
		this.hip.position.y = .92;
		this.root.add(this.hip);
		this.legL.position.set(-.13, 0, 0);
		this.legR.position.set(.13, 0, 0);
		const thighL = box$1(.16, .38, .18, pants, -.19);
		const thighR = box$1(.16, .38, .18, pants, -.19);
		this.legL.add(thighL);
		this.legR.add(thighR);
		this.shinL.position.y = -.38;
		this.shinR.position.y = -.38;
		this.shinL.add(box$1(.14, .36, .16, pants, -.18));
		this.shinR.add(box$1(.14, .36, .16, pants, -.18));
		this.shinL.add(box$1(.18, .1, .28, shoes, -.4));
		this.shinR.add(box$1(.18, .1, .28, shoes, -.4));
		this.legL.add(this.shinL);
		this.legR.add(this.shinR);
		this.hip.add(this.legL, this.legR);
		this.torso.position.y = .12;
		this.torso.add(box$1(.42, .5, .26, jacket, .28));
		this.hip.add(this.torso);
		this.armL.position.set(-.28, .42, 0);
		this.armR.position.set(.28, .42, 0);
		this.armL.add(box$1(.12, .42, .12, jacket, -.16));
		this.armR.add(box$1(.12, .42, .12, jacket, -.16));
		this.armL.add(box$1(.1, .12, .1, skin, -.4));
		this.armR.add(box$1(.1, .12, .1, skin, -.4));
		this.torso.add(this.armL, this.armR);
		this.head.position.y = .64;
		this.head.add(box$1(.32, .3, .3, skin, .08));
		this.head.add(box$1(.34, .12, .32, hair, .22));
		this.visor = box$1(.34, .1, .08, visorM, .1);
		this.visor.position.z = -.16;
		this.head.add(this.visor);
		this.torso.add(this.head);
		this.scarf.position.set(0, .48, .12);
		this.scarf.add(box$1(.18, .08, .22, scarfM, 0));
		const s2 = box$1(.14, .06, .28, scarfM, -.08);
		s2.position.z = .2;
		this.scarf.add(s2);
		this.torso.add(this.scarf);
		const shadowGeo = new CircleGeometry(.42, 10);
		shadowGeo.rotateX(-Math.PI / 2);
		this.shadow = new Mesh(shadowGeo, new MeshBasicMaterial({
			color: 0,
			transparent: true,
			opacity: .28
		}));
		this.shadow.position.y = .02;
		this.root.add(this.shadow);
		this.root.rotation.y = Math.PI;
	}
	apply(def) {
		const set = (i, hex) => {
			const m = this.mats[i];
			if (m) m.color.setHex(hex);
		};
		set(0, def.skin);
		set(1, def.jacket);
		set(2, def.pants);
		set(3, def.visor);
		this.mats[3].emissive.setHex(def.visor);
		this.mats[3].emissiveIntensity = .22;
		set(4, def.hair);
		set(5, def.scarf);
		set(6, def.shoes);
	}
	update(dt, state) {
		if (state.crashing) {
			this.crashT += dt;
			this.root.rotation.x = Math.min(1.2, this.crashT * 3.2);
			this.root.rotation.z = Math.sin(this.crashT * 9) * .25;
			this.hip.position.y = Math.max(.35, .92 - this.crashT * 1.4);
			return;
		}
		this.crashT = 0;
		this.root.rotation.x = 0;
		this.root.rotation.z = 0;
		if (state.sliding) {
			this.hip.rotation.x = 1.05;
			this.hip.position.y = .52;
			this.armL.rotation.x = .6;
			this.armR.rotation.x = -.9;
			this.legL.rotation.x = -.2;
			this.legR.rotation.x = .35;
			this.shinL.rotation.x = .6;
			this.shinR.rotation.x = .2;
			this.squash = .88;
		} else if (!state.grounded) {
			this.hip.rotation.x = .12;
			this.hip.position.y = .92;
			this.legL.rotation.x = -.55;
			this.legR.rotation.x = -.385;
			this.shinL.rotation.x = 1.1;
			this.shinR.rotation.x = .9;
			this.armL.rotation.x = -.8;
			this.armR.rotation.x = .5;
			this.squash = state.vy > 0 ? 1.12 : 1.04;
		} else {
			this.hip.rotation.x = .08;
			this.runT += dt * (7.2 + state.speed * .18);
			const a = Math.sin(this.runT);
			const b = Math.sin(this.runT + Math.PI);
			this.legL.rotation.x = a * .85;
			this.legR.rotation.x = b * .85;
			this.shinL.rotation.x = Math.max(0, -a) * .7;
			this.shinR.rotation.x = Math.max(0, -b) * .7;
			this.armL.rotation.x = b * .7;
			this.armR.rotation.x = a * .7;
			this.hip.position.y = .9 + Math.abs(Math.sin(this.runT * 2)) * .045;
			this.torso.rotation.y = a * .08;
			this.squash = 1;
		}
		this.root.scale.set(1 / Math.sqrt(this.squash), this.squash, 1 / Math.sqrt(this.squash));
		const scarfWave = Math.sin(this.runT * 1.6) * .25;
		this.scarf.rotation.x = .35 + scarfWave;
		this.shadow.scale.setScalar(state.grounded ? 1 : .55 + Math.min(.4, state.y * .12));
		this.shadow.material.opacity = state.grounded ? .28 : .12;
	}
	reset() {
		this.crashT = 0;
		this.runT = 0;
		this.root.rotation.set(0, Math.PI, 0);
		this.hip.position.y = .92;
		this.hip.rotation.x = 0;
		this.root.scale.set(1, 1, 1);
	}
	dispose() {
		this.root.traverse((obj) => {
			if (obj instanceof Mesh) {
				obj.geometry.dispose();
				const m = obj.material;
				if (Array.isArray(m)) m.forEach((x) => x.dispose());
				else m.dispose();
			}
		});
	}
};
var GAME_CODES = /* @__PURE__ */ new Set([
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
	"KeyP"
]);
var GameInput = class {
	keys = /* @__PURE__ */ new Set();
	injected = /* @__PURE__ */ new Set();
	prev = /* @__PURE__ */ new Set();
	canvas;
	px = 0;
	py = 0;
	tracking = false;
	fired = false;
	swipe = null;
	enabled = true;
	onBlur;
	onKeyDown;
	onKeyUp;
	onDown;
	onMove;
	onUp;
	constructor(canvas) {
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
			} catch {}
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
			} catch {}
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
	setEnabled(v) {
		this.enabled = v;
		if (!v) {
			this.tracking = false;
			this.swipe = null;
		}
	}
	setInjected(codes) {
		this.injected = new Set(codes);
	}
	sample() {
		const down = (code) => this.keys.has(code) || this.injected.has(code);
		const edge = (code) => down(code) && !this.prev.has(code);
		const actions = {
			laneLeft: edge("KeyA") || edge("ArrowLeft") || this.swipe === "left",
			laneRight: edge("KeyD") || edge("ArrowRight") || this.swipe === "right",
			jump: edge("KeyW") || edge("ArrowUp") || edge("Space") || this.swipe === "up",
			slide: edge("KeyS") || edge("ArrowDown") || this.swipe === "down",
			pause: edge("Escape") || edge("KeyP")
		};
		this.swipe = null;
		this.prev = /* @__PURE__ */ new Set([...this.keys, ...this.injected]);
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
};
var _col = new Color();
function paint(geo, hex, jitter = 0) {
	if (jitter) {
		_col.setHex(hex);
		_col.offsetHSL((Math.random() - .5) * jitter, 0, (Math.random() - .5) * jitter * .6);
	} else _col.setHex(hex);
	const n = geo.getAttribute("position").count;
	const arr = new Float32Array(n * 3);
	for (let i = 0; i < n; i++) {
		arr[i * 3] = _col.r;
		arr[i * 3 + 1] = _col.g;
		arr[i * 3 + 2] = _col.b;
	}
	geo.setAttribute("color", new Float32BufferAttribute(arr, 3));
	return geo;
}
function box(w, h, d, x, y, z, hex, jitter = 0) {
	const g = new BoxGeometry(w, h, d);
	g.translate(x, y, z);
	return paint(g, hex, jitter);
}
function cyl(rTop, rBot, h, x, y, z, hex, segs = 6) {
	const g = new CylinderGeometry(rTop, rBot, h, segs);
	g.translate(x, y, z);
	return paint(g, hex);
}
function rng(seed) {
	let a = seed >>> 0;
	return () => {
		a |= 0;
		a = a + 1831565813 | 0;
		let t = Math.imul(a ^ a >>> 15, 1 | a);
		t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}
function pick(r, arr) {
	return arr[Math.floor(r() * arr.length) % arr.length];
}
var POWERS = [
	"magnet",
	"shield",
	"boost",
	"double",
	"superjump"
];
function biomeAt(distance, sectionIndex) {
	const cycle = 420;
	const t = (distance + sectionIndex * 8) % (cycle * BIOME_ORDER.length);
	return BIOME_ORDER[Math.floor(t / cycle) % BIOME_ORDER.length];
}
function decorateDowntown(parts, r) {
	const palette = [
		15259076,
		13935988,
		12872778,
		7052954,
		15787736,
		8031132,
		11563088
	];
	for (const side of [-1, 1]) {
		let z = 2;
		while (z < 40) {
			const w = 2.4 + r() * 2.2;
			const d = 3.2 + r() * 4.2;
			const h = 5 + r() * 14;
			const x = side * (5.4 + r() * 1.4);
			const cz = z + d * .5;
			parts.push(box(w, h, d, x, h * .5, cz, pick(r, palette), .04));
			if (r() > .45) parts.push(box(w + .3, .18, d + .3, x, h + .05, cz, 14206128));
			if (r() > .55) parts.push(box(w * .7, .12, .7, x - side * .2, 2.2, cz, 12868682));
			z += d + .35 + r() * .8;
		}
	}
}
function decoratePark(parts, r) {
	parts.push(box(18, .08, 42, -11, .02, 21, 6065236));
	parts.push(box(18, .08, 42, 11, .02, 21, 6986338));
	for (const side of [-1, 1]) {
		for (let i = 0; i < 5; i++) {
			const z = 4 + i * 7.5 + r() * 2;
			const x = side * (6.2 + r() * 2.5);
			const th = 1.1 + r() * .5;
			parts.push(cyl(.16, .22, th, x, th * .5, z, 7031346, 5));
			const ch = 1.6 + r() * 1.1;
			parts.push(cyl(.08, 1.15, ch, x, th + ch * .45, z, r() > .5 ? 4025146 : 4880964, 6));
		}
		parts.push(box(1.4, .45, .45, side * 6.4, .35, 10 + r() * 20, 7033664));
	}
}
function decorateBridge(parts, r) {
	parts.push(box(28, .4, 42, 0, -1.6, 21, 4024954));
	for (const side of [-1, 1]) {
		parts.push(box(.18, 1.1, 42, side * 4.1, .7, 21, 7174276));
		for (let i = 0; i < 6; i++) {
			const z = 3 + i * 6.6;
			parts.push(box(.12, 7, .12, side * 4.1, 4.2, z, 4870232));
		}
		parts.push(box(.7, 9, .7, side * 5.6, 4.6, 21, 5924208));
	}
	if (r() > .4) parts.push(box(1.2, .15, 8, 0, 6.4, 21, 7174276));
}
function decorateTunnel(parts) {
	parts.push(box(1.4, 5.4, 42, -4.6, 2.6, 21, 3818574));
	parts.push(box(1.4, 5.4, 42, 4.6, 2.6, 21, 3818574));
	parts.push(box(10.6, .8, 42, 0, 5.4, 21, 2765372));
	for (let i = 0; i < 8; i++) {
		const z = 3 + i * 5;
		parts.push(box(.4, .12, 1.6, -3.7, 4.6, z, 15784360));
		parts.push(box(.4, .12, 1.6, 3.7, 4.6, z, 15784360));
		parts.push(box(.18, 4.6, .18, -4.1, 2.4, z, i % 2 ? 12868682 : 9353654));
	}
}
function decorateRail(parts, r) {
	parts.push(box(.12, .08, 42, -.72, .06, 21, 3816e3));
	parts.push(box(.12, .08, 42, .72, .06, 21, 3816e3));
	parts.push(box(.12, .08, 42, -2.9, .06, 21, 3816e3));
	parts.push(box(.12, .08, 42, 2.9, .06, 21, 3816e3));
	const crates = [
		12082232,
		4024954,
		12886874,
		5924208
	];
	for (const side of [-1, 1]) {
		let z = 3;
		while (z < 38) {
			const d = 3.2 + r() * 2.4;
			const h = 2.2 + r() * 2.4;
			parts.push(box(2.4, h, d, side * 6.4, h * .5, z + d * .5, pick(r, crates), .03));
			z += d + 1.2 + r() * 2;
		}
		parts.push(box(.2, 3.4, .2, side * 4.6, 1.8, 8, 4870232));
		parts.push(box(.2, 3.4, .2, side * 4.6, 1.8, 28, 4870232));
		parts.push(box(.16, .16, 22, side * 4.6, 3.5, 18, 2764856));
	}
}
function layoutSpawns(r, difficulty, distance) {
	const spawns = [];
	let safe = 1;
	const rowGap = Math.max(8.2, 12.5 - difficulty * .9);
	let z = 6 + r() * 3;
	let rows = 0;
	while (z < 36) {
		if (r() > .38 && rows > 0) {
			const dir = r() > .5 ? 1 : -1;
			safe = Math.max(0, Math.min(2, safe + dir));
		}
		const fill = .42 + difficulty * .12;
		for (let lane = 0; lane < 3; lane++) {
			if (lane === safe) {
				if (r() > .55) spawns.push({
					kind: "coin",
					lane,
					z
				});
				if (r() > .72) spawns.push({
					kind: "coin",
					lane,
					z: z + 1.4
				});
				continue;
			}
			if (r() > fill) {
				if (r() > .4) spawns.push({
					kind: "coin",
					lane,
					z
				});
				continue;
			}
			const roll = r();
			let kind;
			if (roll < .28) kind = "barrier";
			else if (roll < .48) kind = "sign";
			else if (roll < .7) kind = "crate";
			else if (roll < .84) kind = "vehicle";
			else if (roll < .93) kind = "gap";
			else kind = "gate";
			if (kind === "vehicle" && z > 30) kind = "crate";
			const spawn = {
				kind,
				lane,
				z
			};
			if (kind === "gate") spawn.phase = r() * Math.PI * 2;
			spawns.push(spawn);
			if (kind === "vehicle") {
				if (r() > .6) spawns.push({
					kind: "coin",
					lane: safe,
					z: z + 2.2
				});
			}
		}
		if (r() > .55) spawns.push({
			kind: "coin",
			lane: safe,
			z: z + rowGap * .4
		});
		z += rowGap + r() * 2.2;
		rows++;
	}
	if (distance > 80 && r() > .62) spawns.push({
		kind: "power",
		lane: safe,
		z: 10 + r() * 24,
		power: pick(r, POWERS)
	});
	return spawns;
}
function buildSection(distance, index, seed) {
	const r = rng(seed + index * 9973);
	const biome = biomeAt(distance, index);
	const difficulty = Math.min(3.2, distance / 420);
	const parts = [];
	const roadHex = biome === "park" ? 4870984 : biome === "tunnel" ? 2764856 : 3817544;
	const walkHex = biome === "park" ? 9083506 : 12959925;
	parts.push(box(7.4, .22, 42, 0, -.1, 21, roadHex));
	parts.push(box(2.4, .16, 42, -4.9, .02, 21, walkHex));
	parts.push(box(2.4, .16, 42, 4.9, .02, 21, walkHex));
	for (let i = 0; i < 10; i++) {
		const z = 2 + i * 4.1;
		parts.push(box(.08, .02, 1.6, -1.1, .03, z, 15261904));
		parts.push(box(.08, .02, 1.6, 1.1, .03, z, 15261904));
	}
	if (biome === "downtown") decorateDowntown(parts, r);
	else if (biome === "park") decoratePark(parts, r);
	else if (biome === "bridge") decorateBridge(parts, r);
	else if (biome === "tunnel") decorateTunnel(parts);
	else decorateRail(parts, r);
	const merged = mergeGeometries(parts, false);
	for (const g of parts) g.dispose();
	if (!merged) return {
		geometry: box(7.4, .22, 42, 0, -.1, 21, roadHex),
		spawns: layoutSpawns(r, difficulty, distance),
		biome
	};
	merged.computeBoundingSphere();
	return {
		geometry: merged,
		spawns: layoutSpawns(r, difficulty, distance),
		biome
	};
}
function buildSkyline() {
	const parts = [];
	const palette = [
		6978184,
		8022624,
		5927020,
		9076852,
		4872292
	];
	for (let i = 0; i < 22; i++) {
		const x = -42 + i * 4.1 + i % 3 * .4;
		const h = 8 + i * 17 % 18;
		const w = 2.2 + i % 4 * .5;
		parts.push(box(w, h, 2.2, x, h * .5, 0, palette[i % palette.length], .02));
	}
	const merged = mergeGeometries(parts, false);
	for (const g of parts) g.dispose();
	return merged ?? new BoxGeometry(1, 1, 1);
}
var OBS_VIS = {
	barrier: {
		y: .42,
		sx: 1.85,
		sy: .82,
		sz: .7,
		color: 12868682
	},
	sign: {
		y: 1.55,
		sx: 1.95,
		sy: .32,
		sz: .45,
		color: 9353654
	},
	crate: {
		y: .82,
		sx: 1.5,
		sy: 1.62,
		sz: 1.4,
		color: 9067068
	},
	vehicle: {
		y: .85,
		sx: 1.7,
		sy: 1.55,
		sz: 4.6,
		color: 277e4
	},
	gate: {
		y: .9,
		sx: 1.55,
		sy: 1.7,
		sz: 1.05,
		color: 10771004
	},
	gap: {
		y: -.35,
		sx: 1.9,
		sy: .5,
		sz: 4.2,
		color: 1185308
	}
};
var dummy = new Object3D();
var _color = new Color();
function aabbOverlap(ax, ay, az, ahx, ahy, ahz, bx, by, bz, bhx, bhy, bhz) {
	return Math.abs(ax - bx) < ahx + bhx && Math.abs(ay - by) < ahy + bhy && Math.abs(az - bz) < ahz + bhz;
}
var GameEngine = class {
	renderer;
	scene = new Scene();
	camera;
	timer = new Timer();
	acc = 0;
	canvas;
	hooks;
	input;
	audio = new GameAudio();
	runner = new RunnerRig();
	envMat;
	coinMesh;
	obsMesh;
	sections = [];
	coins = [];
	obs = [];
	powers = [];
	sparks = [];
	skyline;
	sun;
	hemi;
	dir;
	mode = "attract";
	lane = 1;
	queuedLane = null;
	x = 0;
	y = 0;
	vy = 0;
	grounded = true;
	sliding = 0;
	jumpBuf = 0;
	coyote = 0;
	crashing = false;
	crashT = 0;
	speed = ATTRACT_SPEED;
	distance = 0;
	score = 0;
	runCoins = 0;
	combo = 0;
	comboT = 0;
	jumps = 0;
	slides = 0;
	powerPicks = 0;
	maxCombo = 0;
	shieldSave = false;
	usedMagnet = false;
	active = {
		magnet: 0,
		shield: 0,
		boost: 0,
		double: 0,
		superjump: 0
	};
	trauma = 0;
	fovPunch = 0;
	time = 0;
	hudAcc = 0;
	fpsEma = 60;
	fpsFrames = 0;
	fpsTime = 0;
	quality = 2;
	qualitySetting = "auto";
	shakeOn = true;
	saveRef;
	sectionSeed = 1;
	sectionCursor = 0;
	disposed = false;
	deadStats = null;
	cam = {
		x: 0,
		y: 3.5,
		z: 8,
		fov: 60
	};
	resizeObs;
	onVis;
	constructor(canvas, hooks, save) {
		this.canvas = canvas;
		this.hooks = hooks;
		this.saveRef = save;
		this.qualitySetting = save.settings.quality;
		this.shakeOn = save.settings.shake;
		this.renderer = new WebGLRenderer({
			canvas,
			antialias: false,
			alpha: false,
			powerPreference: "high-performance"
		});
		this.renderer.setClearColor(8894416, 1);
		this.renderer.outputColorSpace = SRGBColorSpace;
		this.renderer.shadowMap.enabled = false;
		this.camera = new PerspectiveCamera(60, 1, .15, 110);
		this.timer.connect(document);
		this.scene.fog = new Fog(10405076, 28, 78);
		this.scene.background = new Color(8894416);
		this.hemi = new HemisphereLight(13625074, 12891290, 1.05);
		this.scene.add(this.hemi);
		this.dir = new DirectionalLight(16773590, 1.15);
		this.dir.position.set(-8, 18, 6);
		this.scene.add(this.dir);
		this.envMat = new MeshLambertMaterial({ vertexColors: true });
		const coinGeo = new CylinderGeometry(.28, .28, .08, 8);
		coinGeo.rotateZ(Math.PI / 2);
		this.coinMesh = new InstancedMesh(coinGeo, new MeshBasicMaterial({ color: 15255666 }), 96);
		this.coinMesh.instanceMatrix.setUsage(DynamicDrawUsage);
		this.coinMesh.frustumCulled = false;
		this.scene.add(this.coinMesh);
		this.obsMesh = new InstancedMesh(new BoxGeometry(1, 1, 1), new MeshLambertMaterial({
			vertexColors: false,
			color: 16777215
		}), 72);
		this.obsMesh.instanceMatrix.setUsage(DynamicDrawUsage);
		this.obsMesh.instanceColor = new InstancedBufferAttribute(/* @__PURE__ */ new Float32Array(216), 3);
		this.obsMesh.frustumCulled = false;
		this.scene.add(this.obsMesh);
		for (let i = 0; i < 96; i++) this.coins.push({
			alive: false,
			x: 0,
			y: 0,
			z: 0
		});
		for (let i = 0; i < 72; i++) this.obs.push({
			alive: false,
			kind: "crate",
			lane: 1,
			x: 0,
			y: 0,
			z: 0,
			sx: 1,
			sy: 1,
			sz: 1,
			phase: 0
		});
		const powerGeo = new IcosahedronGeometry(.32, 0);
		const powerColors = {
			magnet: 9353654,
			shield: 8036564,
			boost: 14711391,
			double: 14273462,
			superjump: 6134392
		};
		for (const id of Object.keys(powerColors)) {
			const mesh = new Mesh(powerGeo, new MeshBasicMaterial({ color: powerColors[id] }));
			mesh.visible = false;
			this.scene.add(mesh);
			this.powers.push({
				alive: false,
				id,
				x: 0,
				y: .9,
				z: 0,
				mesh
			});
		}
		while (this.powers.length < 6) {
			const mesh = new Mesh(powerGeo.clone(), new MeshBasicMaterial({ color: 9353654 }));
			mesh.visible = false;
			this.scene.add(mesh);
			this.powers.push({
				alive: false,
				id: "magnet",
				x: 0,
				y: .9,
				z: 0,
				mesh
			});
		}
		const sparkGeo = new SphereGeometry(.08, 5, 4);
		for (let i = 0; i < 16; i++) {
			const mesh = new Mesh(sparkGeo, new MeshBasicMaterial({ color: 15255666 }));
			mesh.visible = false;
			this.scene.add(mesh);
			this.sparks.push({
				alive: false,
				x: 0,
				y: 0,
				z: 0,
				life: 0,
				mesh
			});
		}
		this.skyline = new Mesh(buildSkyline(), this.envMat);
		this.skyline.position.set(0, 0, -64);
		this.scene.add(this.skyline);
		this.sun = new Mesh(new SphereGeometry(3.2, 12, 10), new MeshBasicMaterial({
			color: 16773576,
			fog: false
		}));
		this.sun.position.set(-28, 26, -70);
		this.scene.add(this.sun);
		this.scene.add(this.runner.root);
		this.runner.apply(characterById(save.selected));
		this.input = new GameInput(canvas);
		this.bootstrapSections();
		this.hideAllInstances();
		this.applyQuality(this.qualityFromSetting(save.settings.quality));
		this.fit();
		this.resizeObs = new ResizeObserver(() => this.fit());
		this.resizeObs.observe(canvas.parentElement ?? canvas);
		this.onVis = () => {
			this.audio.resume();
			if (document.hidden) this.timer.reset();
		};
		document.addEventListener("visibilitychange", this.onVis);
		window.__controlsTest = {
			getYaw: () => -this.lane,
			getSpeed: () => this.speed,
			setKeys: (codes) => this.input.setInjected(codes),
			setSteer: (v) => {
				if (v > .3) this.tryLane(-1);
				else if (v < -.3) this.tryLane(1);
			}
		};
	}
	start() {
		this.renderer.setAnimationLoop(() => this.frame());
	}
	unlockAudio() {
		this.audio.unlock();
		this.audio.setMusic(this.saveRef.settings.music);
		this.audio.setSfx(this.saveRef.settings.sfx);
	}
	applySave(save) {
		this.saveRef = save;
		this.audio.setMusic(save.settings.music);
		this.audio.setSfx(save.settings.sfx);
		this.shakeOn = save.settings.shake;
		this.qualitySetting = save.settings.quality;
		if (save.settings.quality !== "auto") this.applyQuality(this.qualityFromSetting(save.settings.quality));
		this.runner.apply(characterById(save.selected));
	}
	beginRun() {
		this.resetWorld();
		this.mode = "play";
		this.speed = 17;
		this.input.setEnabled(true);
		this.audio.play("ui");
		this.pushHud(true);
	}
	pause() {
		if (this.mode !== "play") return;
		this.mode = "paused";
		this.input.setEnabled(false);
	}
	resume() {
		if (this.mode !== "paused") return;
		this.mode = "play";
		this.input.setEnabled(true);
		this.timer.reset();
	}
	toAttract() {
		this.resetWorld();
		this.mode = "attract";
		this.speed = ATTRACT_SPEED;
		this.input.setEnabled(false);
	}
	dispose() {
		this.disposed = true;
		this.renderer.setAnimationLoop(null);
		this.input.dispose();
		this.audio.dispose();
		this.runner.dispose();
		this.resizeObs.disconnect();
		document.removeEventListener("visibilitychange", this.onVis);
		this.scene.traverse((obj) => {
			if (obj instanceof Mesh) {
				obj.geometry.dispose();
				const m = obj.material;
				if (Array.isArray(m)) m.forEach((x) => x.dispose());
				else m.dispose();
			}
		});
		this.renderer.dispose();
		delete window.__controlsTest;
	}
	qualityFromSetting(s) {
		if (s === "low") return 0;
		if (s === "med") return 1;
		if (s === "high") return 3;
		return 2;
	}
	applyQuality(q) {
		this.quality = q;
		const dpr = [
			.85,
			1,
			1.12,
			1.28
		][q];
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dpr));
		const fog = this.scene.fog;
		fog.near = [
			18,
			24,
			28,
			32
		][q];
		fog.far = [
			46,
			60,
			74,
			88
		][q];
		this.camera.far = fog.far + 16;
		this.skyline.visible = q > 0;
		this.fit();
	}
	fit() {
		const parent = this.canvas.parentElement ?? this.canvas;
		const w = Math.max(1, parent.clientWidth);
		const h = Math.max(1, parent.clientHeight);
		this.renderer.setSize(w, h, false);
		this.camera.aspect = w / h;
		const portrait = h > w;
		this.camera.fov = portrait ? 62 : 54;
		this.camera.updateProjectionMatrix();
	}
	bootstrapSections() {
		for (let i = 0; i < 8; i++) {
			const group = new Group();
			const mesh = new Mesh(new BoxGeometry(1, 1, 1), this.envMat);
			group.add(mesh);
			this.scene.add(group);
			this.sections.push({
				group,
				mesh,
				z: -i * 42
			});
		}
		this.rebuildAllSections();
	}
	rebuildAllSections() {
		this.sectionCursor = 0;
		for (let i = 0; i < this.sections.length; i++) this.placeSection(this.sections[i], -i * 42);
	}
	placeSection(sec, z) {
		sec.mesh.geometry.dispose();
		const built = buildSection(this.distance, this.sectionCursor, this.sectionSeed);
		sec.mesh.geometry = built.geometry;
		sec.z = z;
		sec.group.position.set(0, 0, z);
		this.sectionCursor++;
		for (const spawn of built.spawns) this.spawnAt(spawn, z);
	}
	spawnAt(spawn, sectionZ) {
		const worldZ = sectionZ + spawn.z;
		if (spawn.kind === "coin") {
			const slot = this.coins.find((c) => !c.alive);
			if (!slot) return;
			slot.alive = true;
			slot.x = LANE_X[spawn.lane];
			slot.y = .85;
			slot.z = worldZ;
			return;
		}
		if (spawn.kind === "power") {
			const slot = this.powers.find((p) => !p.alive);
			if (!slot || !spawn.power) return;
			slot.alive = true;
			slot.id = spawn.power;
			slot.mesh.material.color.setHex({
				magnet: 9353654,
				shield: 8036564,
				boost: 14711391,
				double: 14273462,
				superjump: 6134392
			}[spawn.power]);
			slot.x = LANE_X[spawn.lane];
			slot.y = 1.05;
			slot.z = worldZ;
			slot.mesh.visible = true;
			return;
		}
		const slot = this.obs.find((o) => !o.alive);
		if (!slot) return;
		const vis = OBS_VIS[spawn.kind];
		slot.alive = true;
		slot.kind = spawn.kind;
		slot.lane = spawn.lane;
		slot.x = LANE_X[spawn.lane];
		slot.y = vis.y;
		slot.z = worldZ;
		slot.sx = vis.sx;
		slot.sy = vis.sy;
		slot.sz = vis.sz;
		slot.phase = spawn.phase ?? 0;
	}
	hideAllInstances() {
		dummy.scale.set(0, 0, 0);
		dummy.position.set(0, -20, 0);
		dummy.updateMatrix();
		for (let i = 0; i < 96; i++) this.coinMesh.setMatrixAt(i, dummy.matrix);
		for (let i = 0; i < 72; i++) this.obsMesh.setMatrixAt(i, dummy.matrix);
		this.coinMesh.instanceMatrix.needsUpdate = true;
		this.obsMesh.instanceMatrix.needsUpdate = true;
	}
	resetWorld() {
		for (const c of this.coins) c.alive = false;
		for (const o of this.obs) o.alive = false;
		for (const p of this.powers) {
			p.alive = false;
			p.mesh.visible = false;
		}
		for (const s of this.sparks) {
			s.alive = false;
			s.mesh.visible = false;
		}
		this.lane = 1;
		this.queuedLane = null;
		this.x = 0;
		this.y = 0;
		this.vy = 0;
		this.grounded = true;
		this.sliding = 0;
		this.jumpBuf = 0;
		this.coyote = 0;
		this.crashing = false;
		this.crashT = 0;
		this.distance = 0;
		this.score = 0;
		this.runCoins = 0;
		this.combo = 0;
		this.comboT = 0;
		this.jumps = 0;
		this.slides = 0;
		this.powerPicks = 0;
		this.maxCombo = 0;
		this.shieldSave = false;
		this.usedMagnet = false;
		this.deadStats = null;
		Object.keys(this.active).forEach((k) => {
			this.active[k] = 0;
		});
		this.trauma = 0;
		this.fovPunch = 0;
		this.sectionSeed = Math.random() * 1e9 | 0;
		this.runner.reset();
		this.rebuildAllSections();
		this.hideAllInstances();
	}
	tryLane(dir) {
		const next = this.lane + dir;
		if (next < 0 || next >= 3) return;
		if (Math.abs(this.x - LANE_X[this.lane]) > .55) {
			this.queuedLane = next;
			return;
		}
		this.lane = next;
		this.audio.play("whoosh");
	}
	tryJump() {
		if (this.sliding > 0) this.sliding = 0;
		if (!(this.grounded || this.coyote > 0)) {
			this.jumpBuf = JUMP_BUFFER;
			return;
		}
		const ch = characterById(this.saveRef.selected);
		const spring = upgradeMult(this.saveRef.upgrades.spring) * ch.jump;
		const superM = this.active.superjump > 0 ? SUPER_JUMP_MULT : 1;
		this.vy = JUMP_VY * spring * superM;
		this.grounded = false;
		this.coyote = 0;
		this.jumpBuf = 0;
		this.jumps++;
		this.audio.play("jump");
	}
	trySlide() {
		if (!this.grounded && this.y > .35) return;
		this.sliding = SLIDE_TIME;
		this.slides++;
		this.audio.play("slide");
	}
	frame() {
		if (this.disposed) return;
		this.timer.update();
		const raw = Math.min(this.timer.getDelta(), .1);
		this.fpsFrames++;
		this.fpsTime += raw;
		if (this.fpsTime >= .6) {
			const fps = this.fpsFrames / this.fpsTime;
			this.fpsEma = this.fpsEma * .65 + fps * .35;
			this.fpsFrames = 0;
			this.fpsTime = 0;
			if (this.qualitySetting === "auto") {
				if (this.fpsEma < 28 && this.quality > 0) this.applyQuality(this.quality - 1);
				else if (this.fpsEma > 56 && this.quality < 2) this.applyQuality(this.quality + 1);
			}
		}
		if (this.mode !== "paused") {
			this.acc += raw;
			let steps = 0;
			while (this.acc >= .016666666666666666 && steps < 5) {
				this.fixed(FIXED_DT);
				this.acc -= FIXED_DT;
				steps++;
			}
			if (steps === 5) this.acc = 0;
			this.visual(raw);
		}
		this.audio.tick(raw, this.mode === "play" || this.mode === "attract", this.speed);
		this.renderer.render(this.scene, this.camera);
		this.hudAcc += raw;
		if (this.hudAcc > .08) {
			this.hudAcc = 0;
			this.pushHud(false);
		}
	}
	charMult() {
		const ch = characterById(this.saveRef.selected);
		return {
			magnet: ch.magnet * upgradeMult(this.saveRef.upgrades.magnet),
			shield: ch.shield * upgradeMult(this.saveRef.upgrades.shield),
			coin: ch.coin * upgradeMult(this.saveRef.upgrades.fortune),
			jump: ch.jump * upgradeMult(this.saveRef.upgrades.spring)
		};
	}
	fixed(dt) {
		this.time += dt;
		const play = this.mode === "play";
		const actions = this.input.sample();
		if (play) {
			if (actions.pause) {
				this.pause();
				this.hooks.onPause();
				return;
			}
			if (actions.laneLeft) this.tryLane(-1);
			if (actions.laneRight) this.tryLane(1);
			if (actions.jump) this.tryJump();
			if (actions.slide) this.trySlide();
			if (this.queuedLane !== null && Math.abs(this.x - LANE_X[this.lane]) < .2) {
				const q = this.queuedLane;
				this.queuedLane = null;
				if (q !== this.lane) this.tryLane(q > this.lane ? 1 : -1);
			}
		}
		const targetSpeed = this.mode === "attract" ? ATTRACT_SPEED : Math.min(36, 17 + this.distance * SPEED_PER_METER);
		const boost = this.active.boost > 0 ? 1.32 : 1;
		this.speed += (targetSpeed * boost - this.speed) * Math.min(1, dt * 2.4);
		if (this.mode === "dead") {
			this.crashT += dt;
			this.y = Math.max(0, this.y + this.vy * dt);
			this.vy += -48 * dt * .4;
			if (this.crashT > 1.05 && this.deadStats) {
				const stats = this.deadStats;
				this.deadStats = null;
				this.hooks.onOver(stats);
			}
			this.scroll(dt);
			return;
		}
		this.x += (LANE_X[this.lane] - this.x) * (1 - Math.exp(-24 * dt));
		if (this.sliding > 0) this.sliding = Math.max(0, this.sliding - dt);
		if (this.jumpBuf > 0) this.jumpBuf -= dt;
		if (this.grounded) this.coyote = COYOTE;
		else this.coyote = Math.max(0, this.coyote - dt);
		const overGap = this.mode === "play" && this.gapUnder();
		if (!this.grounded || overGap) {
			this.vy += -48 * dt;
			this.y += this.vy * dt;
			if (this.y <= 0 && !overGap) {
				this.y = 0;
				this.vy = 0;
				this.grounded = true;
				this.audio.play("land");
				if (this.jumpBuf > 0) this.tryJump();
			} else this.grounded = false;
			if (this.y < -1.6) {
				if (play) this.die();
				else {
					this.y = 0;
					this.vy = 0;
					this.grounded = true;
				}
			}
		}
		this.scroll(dt);
		this.distance += this.speed * dt;
		const mult = this.active.double > 0 ? 2 : 1;
		this.score += this.speed * dt * mult;
		this.comboT = Math.max(0, this.comboT - dt);
		if (this.comboT <= 0) this.combo = 0;
		for (const k of Object.keys(this.active)) if (this.active[k] > 0) this.active[k] = Math.max(0, this.active[k] - dt);
		this.trauma = Math.max(0, this.trauma - dt * 1.8);
		this.fovPunch = Math.max(0, this.fovPunch - dt * 2.4);
		if (play) {
			this.collectCoins();
			this.collectPowers();
			this.hitObstacles();
		}
		this.recycleSections();
	}
	scroll(dt) {
		const dz = this.speed * dt;
		for (const s of this.sections) {
			s.z += dz;
			s.group.position.z = s.z;
		}
		for (const c of this.coins) if (c.alive) c.z += dz;
		for (const o of this.obs) if (o.alive) o.z += dz;
		for (const p of this.powers) if (p.alive) p.z += dz;
		for (const s of this.sparks) if (s.alive) s.z += dz;
		for (const o of this.obs) {
			if (!o.alive || o.kind !== "gate") continue;
			const a = LANE_X[Math.max(0, o.lane - 1)];
			const b = LANE_X[Math.min(2, o.lane + 1)];
			o.x = (a + b) * .5 + (b - a) * .5 * Math.sin(this.time * 1.35 + o.phase);
		}
	}
	recycleSections() {
		for (const sec of this.sections) if (sec.z > 50) {
			let minZ = Infinity;
			for (const s of this.sections) minZ = Math.min(minZ, s.z);
			this.cullBehind(sec.z, sec.z + 42);
			this.placeSection(sec, minZ - 42);
		}
		for (const c of this.coins) if (c.alive && c.z > 10) c.alive = false;
		for (const o of this.obs) if (o.alive && o.z > 12) o.alive = false;
		for (const p of this.powers) if (p.alive && p.z > 10) {
			p.alive = false;
			p.mesh.visible = false;
		}
	}
	cullBehind(z0, z1) {
		for (const c of this.coins) if (c.alive && c.z >= z0 - 1 && c.z <= z1 + 1) c.alive = false;
		for (const o of this.obs) if (o.alive && o.z >= z0 - 1 && o.z <= z1 + 1) o.alive = false;
	}
	playerBox() {
		const sliding = this.sliding > 0;
		const hh = sliding ? .38 : .82;
		const cy = sliding ? .4 : this.y + hh;
		return {
			x: this.x,
			y: cy,
			z: 0,
			hx: PLAYER_HALF_W,
			hy: hh,
			hz: PLAYER_HALF_D
		};
	}
	gapUnder() {
		const p = this.playerBox();
		for (const o of this.obs) {
			if (!o.alive || o.kind !== "gap") continue;
			if (Math.abs(p.x - o.x) < .95 && Math.abs(p.z - o.z) < o.sz * .5 + .2) return true;
		}
		return false;
	}
	collectCoins() {
		const p = this.playerBox();
		const magnet = this.active.magnet > 0;
		const cm = this.charMult().coin;
		for (const c of this.coins) {
			if (!c.alive) continue;
			if (magnet && c.z < 5.8 && c.z > -1.5) {
				c.x += (this.x - c.x) * .18;
				c.y += (this.y + 1.05 - c.y) * .18;
				c.z += (.2 - c.z) * .16;
			}
			const dx = c.x - p.x;
			const dy = c.y - p.y;
			const dz = c.z - p.z;
			if (dx * dx + dy * dy + dz * dz < .72) {
				c.alive = false;
				this.runCoins += 1;
				this.combo += 1;
				this.comboT = 1.35;
				this.maxCombo = Math.max(this.maxCombo, this.combo);
				const bonus = 1 + Math.min(8, this.combo) * .08;
				const double = this.active.double > 0 ? 2 : 1;
				this.score += 10 * bonus * double * cm;
				this.audio.play("coin");
				this.spark(c.x, c.y, c.z);
				this.fovPunch = Math.min(1, this.fovPunch + .08);
				if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(8);
			}
		}
	}
	collectPowers() {
		const p = this.playerBox();
		const m = this.charMult();
		for (const slot of this.powers) {
			if (!slot.alive) continue;
			if (aabbOverlap(p.x, p.y, p.z, p.hx, p.hy, p.hz, slot.x, slot.y, slot.z, .4, .4, .4)) {
				slot.alive = false;
				slot.mesh.visible = false;
				const dur = POWER_DURATION[slot.id] * (slot.id === "magnet" ? m.magnet : slot.id === "shield" ? m.shield : 1);
				this.active[slot.id] = dur;
				this.powerPicks++;
				if (slot.id === "magnet") this.usedMagnet = true;
				this.audio.play("power");
				this.fovPunch = .6;
			}
		}
	}
	hitObstacles() {
		const p = this.playerBox();
		for (const o of this.obs) {
			if (!o.alive || o.kind === "gap") continue;
			const hx = o.sx * .42;
			const hy = o.sy * .42;
			const hz = o.sz * .42;
			if (!aabbOverlap(p.x, p.y, p.z, p.hx, p.hy, p.hz, o.x, o.y, o.z, hx, hy, hz)) continue;
			if (o.kind === "barrier" && this.y > .72) continue;
			if (o.kind === "sign" && this.sliding > 0) continue;
			if (this.active.shield > 0) {
				this.active.shield = 0;
				this.shieldSave = true;
				o.alive = false;
				this.trauma = .45;
				this.audio.play("whoosh");
				continue;
			}
			this.die();
			return;
		}
	}
	die() {
		if (this.mode !== "play") return;
		this.mode = "dead";
		this.crashing = true;
		this.crashT = 0;
		this.vy = 3;
		this.trauma = 1;
		this.input.setEnabled(false);
		this.audio.play("hit");
		if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([
			30,
			40,
			30
		]);
		this.deadStats = {
			score: Math.floor(this.score),
			coins: this.runCoins,
			distance: this.distance,
			jumps: this.jumps,
			slides: this.slides,
			powers: this.powerPicks,
			combo: this.maxCombo,
			shieldSave: this.shieldSave,
			usedMagnet: this.usedMagnet
		};
	}
	spark(x, y, z) {
		const s = this.sparks.find((k) => !k.alive);
		if (!s) return;
		s.alive = true;
		s.x = x;
		s.y = y;
		s.z = z;
		s.life = .28;
		s.mesh.visible = true;
	}
	visual(dt) {
		this.runner.root.position.set(this.x, this.y, 0);
		this.runner.update(dt, {
			speed: this.speed,
			grounded: this.grounded,
			sliding: this.sliding > 0,
			crashing: this.crashing,
			y: this.y,
			vy: this.vy
		});
		dummy.rotation.set(0, this.time * 4.2, 0);
		for (let i = 0; i < this.coins.length; i++) {
			const c = this.coins[i];
			if (!c.alive) {
				dummy.position.set(0, -20, 0);
				dummy.scale.set(0, 0, 0);
			} else {
				dummy.position.set(c.x, c.y, c.z);
				dummy.scale.set(1, 1, 1);
			}
			dummy.updateMatrix();
			this.coinMesh.setMatrixAt(i, dummy.matrix);
		}
		this.coinMesh.instanceMatrix.needsUpdate = true;
		dummy.rotation.set(0, 0, 0);
		for (let i = 0; i < this.obs.length; i++) {
			const o = this.obs[i];
			if (!o.alive) {
				dummy.position.set(0, -20, 0);
				dummy.scale.set(0, 0, 0);
			} else {
				dummy.position.set(o.x, o.y, o.z);
				dummy.scale.set(o.sx, o.sy, o.sz);
				const vis = OBS_VIS[o.kind];
				_color.setHex(vis.color);
				this.obsMesh.setColorAt(i, _color);
			}
			dummy.updateMatrix();
			this.obsMesh.setMatrixAt(i, dummy.matrix);
		}
		this.obsMesh.instanceMatrix.needsUpdate = true;
		if (this.obsMesh.instanceColor) this.obsMesh.instanceColor.needsUpdate = true;
		for (const p of this.powers) {
			if (!p.alive) continue;
			p.mesh.position.set(p.x, p.y + Math.sin(this.time * 4 + p.z) * .12, p.z);
			p.mesh.rotation.y += dt * 2.4;
		}
		for (const s of this.sparks) {
			if (!s.alive) continue;
			s.life -= dt;
			s.y += dt * 1.6;
			s.mesh.position.set(s.x, s.y, s.z);
			s.mesh.scale.setScalar(Math.max(.1, s.life * 4));
			if (s.life <= 0) {
				s.alive = false;
				s.mesh.visible = false;
			}
		}
		const boost = this.active.boost > 0;
		const lookX = this.x * .72;
		const desired = {
			x: this.x * .38,
			y: 3.35 + this.y * .18 + (this.sliding > 0 ? -.25 : 0),
			z: boost ? 7.1 : 8.05,
			fov: (this.camera.aspect < 1 ? 62 : 54) + (boost ? 7 : 0) + this.fovPunch * 4
		};
		const k = 1 - Math.exp(-6.2 * dt);
		this.cam.x += (desired.x - this.cam.x) * k;
		this.cam.y += (desired.y - this.cam.y) * k;
		this.cam.z += (desired.z - this.cam.z) * k;
		this.cam.fov += (desired.fov - this.cam.fov) * k;
		let sx = 0;
		let sy = 0;
		if (this.shakeOn && this.trauma > 0) {
			const mag = this.trauma * this.trauma;
			sx = (Math.random() * 2 - 1) * mag * .28;
			sy = (Math.random() * 2 - 1) * mag * .18;
		}
		this.camera.position.set(this.cam.x + sx, this.cam.y + sy, this.cam.z);
		this.camera.lookAt(lookX, 1.05 + this.y * .25, -6.2);
		if (Math.abs(this.camera.fov - this.cam.fov) > .05) {
			this.camera.fov = this.cam.fov;
			this.camera.updateProjectionMatrix();
		}
		this.skyline.position.x = this.cam.x * .15;
		this.sun.position.x = -28 + this.cam.x * .05;
	}
	pushHud(force) {
		if (!force && this.mode === "attract") return;
		this.hooks.onHud({
			score: Math.floor(this.score),
			coins: this.runCoins,
			distance: Math.floor(this.distance),
			combo: this.combo,
			fps: Math.round(this.fpsEma),
			speed: this.speed,
			powers: Object.keys(this.active).filter((id) => this.active[id] > 0).map((id) => ({
				id,
				t: this.active[id],
				max: POWER_DURATION[id]
			})),
			shield: this.active.shield > 0
		});
	}
};
//#endregion
export { GameEngine };
