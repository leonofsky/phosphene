/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-expressions */
// Recovered from the working PHOSPHENE production bundle.
// The scene behavior is intentionally unchanged.
// @ts-nocheck
import {
  Scene as $n,
  Object3D as Un,
  Vector3 as z,
  Color as H,
  Group as Wn,
  WebGLRenderer as Wl,
  SRGBColorSpace as nt,
  PerspectiveCamera as no,
  FogExp2 as Qn,
  PMREMGenerator as Zo,
  HemisphereLight as Wa,
  DirectionalLight as so,
  PointLight as io,
  MeshPhysicalMaterial as Ta,
  MeshBasicMaterial as ii,
  OctahedronGeometry as la,
  MeshStandardMaterial as wa,
  InstancedMesh as Oi,
  DynamicDrawUsage as ct,
  BufferGeometry as qr,
  BufferAttribute as Mr,
  Float32BufferAttribute as Fr,
  PointsMaterial as qi,
  Points as Qi,
  SphereGeometry as da,
  TorusKnotGeometry as pa,
  TorusGeometry as fa,
  ConeGeometry as oa,
  IcosahedronGeometry as ca,
  Box3 as mr,
  Mesh as gi,
  Line as Gi,
  LineBasicMaterial as Li,
  MathUtils as Kt,
} from "three";
import { OrbitControls as tu } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment as mu } from "three/addons/environments/RoomEnvironment.js";
import { Pane as wv } from "tweakpane";
import { AsciiLayer as jv } from "./ascii";
import {
  H264Recorder as Ew,
  EXPORT_WIDTH as ww,
  EXPORT_HEIGHT as Tw,
} from "./encode-h264";
import {
  DEFAULT_PARAMS as Ov,
  SHAPE_OPTIONS as Ev,
  CHARSET_OPTIONS as Dv,
} from "./types";
import {
  digitDispersion as Aw,
  particleHome as Ow,
  satelliteAnchor as kw,
} from "./formations";
import {
  pickDesktopFile as Pw,
  isSaveCancelled as Mw,
  writeBlob as Fw,
  canvasToPng24 as Iw,
} from "./save-file";

const Lw = 2500;
const Rw = 9;
const zw = Math.PI * (3 - Math.sqrt(5));

function Bw(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value + 1831565813) | 0;
    let t = Math.imul(value ^ (value >>> 15), 1 | value);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Vw(value) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}`;
}

function Hw(rng) {
  const hue = 0.42 + rng() * 0.22;
  return `#${new H().setHSL(hue, 0.78 + rng() * 0.16, 0.58 + rng() * 0.1).getHexString()}`;
}

function Uw(error) {
  return error instanceof Error && error.message
    ? error.message.toUpperCase()
    : "EXPORT FAILED";
}

export class SceneEngine {
  params = { ...Ov };
  seed = 1e3;
  rng = Bw(1e3);
  sequence = [1];
  host;
  paneHost;
  scene = new $n();
  camera;
  renderer;
  controls;
  ascii;
  pane;
  dummy = new Un();
  tmp = new z();
  colorA = new H();
  colorB = new H();
  particleColor = new H();
  artifact = new Wn();
  core = null;
  outline = null;
  ring = null;
  lineGroup = null;
  glassMat;
  wireMat;
  keyLight;
  rimLight;
  particles;
  particlePos;
  particleVel;
  particleHome;
  particlePhase;
  satellites = [];
  envTexture = null;
  ownsCanvas = !0;
  lastTime = performance.now();
  lastHud = 0;
  flashDigit = 1;
  flashNonce = 1;
  reducedMotion = !1;
  disposed = !1;
  mutating = !1;
  onHud = null;
  ro;
  onKey;
  onVis;
  hires = !1;
  freezeTick = !1;
  exportKind = null;
  exportFrame = 0;
  exportFrames = 0;
  exportNote = ``;
  exportNoteTimer = 0;
  h264 = null;
  captureBusy = !1;
  constructor(e, t, n, r) {
    (this.host = e),
      (this.paneHost = t),
      (this.onHud = n),
      (this.reducedMotion = window.matchMedia(
        `(prefers-reduced-motion: reduce)`,
      ).matches),
      (this.seed = 1e3 + Math.floor(Math.random() * 9e3)),
      (this.rng = Bw(this.seed));
    let i = e.clientWidth || window.innerWidth,
      a = e.clientHeight || window.innerHeight;
    e.querySelectorAll(`.ascii-layer`).forEach((e) => e.remove()),
      (this.ownsCanvas = !r),
      (this.renderer = new Wl({
        canvas: r ?? void 0,
        antialias: !0,
        alpha: !1,
        powerPreference: `high-performance`,
        preserveDrawingBuffer: !0,
      })),
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)),
      this.renderer.setSize(i, a),
      (this.renderer.outputColorSpace = nt),
      (this.renderer.toneMapping = 4),
      (this.renderer.toneMappingExposure = 1.18),
      this.renderer.setClearColor(461068, 1),
      (this.renderer.domElement.className = `gl-layer`),
      this.ownsCanvas && e.appendChild(this.renderer.domElement),
      (this.camera = new no(34, i / a, 0.1, 80)),
      this.camera.position.set(0, 0.28, 6.35),
      (this.controls = new tu(this.camera, e)),
      (this.controls.enableDamping = !0),
      (this.controls.enablePan = !1),
      (this.controls.minDistance = 3.6),
      (this.controls.maxDistance = 10),
      (this.controls.dampingFactor = 0.06),
      (this.scene.background = new H(461068)),
      (this.scene.fog = new Qn(461068, 0.055));
    let o = new Zo(this.renderer),
      s = new mu();
    (this.envTexture = o.fromScene(s, 0.04).texture),
      (this.scene.environment = this.envTexture),
      (this.scene.environmentIntensity = 0.52),
      s.dispose(),
      o.dispose(),
      this.scene.add(new Wa(14543059, 1053722, 1.6)),
      (this.keyLight = new so(8257492, this.params.keyLight)),
      this.keyLight.position.set(-4, 4.2, 4),
      this.scene.add(this.keyLight),
      (this.rimLight = new io(9352447, this.params.rimLight, 12)),
      this.rimLight.position.set(3.1, -1.1, 3.2),
      this.scene.add(this.rimLight),
      (this.glassMat = new Ta({
        color: 16777215,
        metalness: 0.08,
        roughness: this.params.roughness,
        transmission: this.params.transmission,
        thickness: this.params.thickness,
        ior: this.params.ior,
        transparent: !0,
        opacity: 0.88,
        side: 2,
        iridescence: this.params.iridescence,
        iridescenceIOR: 1.25,
        vertexColors: !0,
      })),
      (this.wireMat = new ii({
        color: 12124136,
        wireframe: !0,
        transparent: !0,
        opacity: this.params.wireOpacity,
        depthWrite: !1,
      })),
      (this.particlePos = new Float32Array(Lw * 3)),
      (this.particleVel = new Float32Array(Lw * 3)),
      (this.particleHome = new Float32Array(Lw * 3)),
      (this.particlePhase = new Float32Array(Lw));
    let c = new la(1, 0),
      l = new wa({
        color: 16777215,
        metalness: 0.35,
        roughness: 0.28,
        emissive: 1260082,
        emissiveIntensity: 0.55,
        vertexColors: !1,
      });
    (this.particles = new Oi(c, l, Lw)),
      this.particles.instanceMatrix.setUsage(ct),
      (this.particles.frustumCulled = !1),
      this.scene.add(this.particles),
      this.addStarfield(),
      this.rebuildCore(),
      this.recomputeHomes(!0),
      (this.ascii = new jv()),
      e.appendChild(this.ascii.canvas),
      this.ascii.setVisible(!1),
      this.ascii.resize(i, a, this.params.asciiResolution),
      (this.pane = this.buildPane()),
      this.syncFromParams(),
      (this.onKey = (e) => this.handleKey(e)),
      (this.onVis = () => {
        this.lastTime = performance.now();
      }),
      window.addEventListener(`keydown`, this.onKey),
      document.addEventListener(`visibilitychange`, this.onVis),
      (this.ro = new ResizeObserver(() => this.resize())),
      this.ro.observe(e),
      this.bindApi(),
      this.renderer.setAnimationLoop(() => this.tick()),
      this.emitHud(!0);
  }
  typeDigit(e, t = {}) {
    if (this.mutating || this.exportKind) return;
    this.mutating = !0;
    let n = Math.max(0, Math.min(9, Math.floor(e))),
      r = t.spawn !== !1;
    (this.params.digit = n),
      (this.flashDigit = n),
      (this.flashNonce += 1),
      n === 0
        ? ((this.sequence = [0]), this.collapseSatellites())
        : r
          ? (this.sequence.length === 1 &&
              this.sequence[0] === 0 &&
              (this.sequence = []),
            this.sequence.push(n),
            this.sequence.length > 8 && this.sequence.shift(),
            this.spawnSatellite(n))
          : this.sequence.length || (this.sequence = [n]);
    let i = Aw(n);
    (this.params.dispersion = i.dispersion),
      (this.params.turbulence = i.turbulence),
      (this.params.particleCount = Math.min(Lw, i.count)),
      this.recomputeHomes(!1),
      this.burst(n),
      this.pane.refresh(),
      this.emitHud(!0),
      (this.mutating = !1);
  }
  toggleAscii() {
    this.exportKind ||
      ((this.params.ascii = !this.params.ascii),
      this.syncFromParams(),
      this.pane.refresh(),
      this.emitHud(!0));
  }
  generate() {
    if (this.mutating || this.exportKind) return;
    (this.mutating = !0),
      (this.seed = 1e3 + Math.floor(Math.random() * 9e3)),
      (this.rng = Bw(this.seed));
    let e = [`Crystal`, `Orb`, `Knot`, `Torus`, `Pyramid`, `Icosahedron`];
    (this.params.shape = e[Math.floor(this.rng() * e.length)]),
      (this.params.size = 0.78 + this.rng() * 0.42),
      (this.params.distortion = this.rng() * 0.4),
      (this.params.noise = this.rng() * 0.3),
      (this.params.noiseScale = 1 + this.rng() * 5),
      (this.params.width = 0.72 + this.rng() * 0.5),
      (this.params.height = 0.82 + this.rng() * 0.5),
      (this.params.twist = (this.rng() - 0.5) * 1.1),
      (this.params.colorA = Hw(this.rng)),
      (this.params.colorB = Hw(this.rng)),
      (this.params.hue = Math.floor(this.rng() * 48)),
      this.rebuildCore(),
      this.pane.refresh(),
      this.emitHud(!0),
      (this.mutating = !1);
  }
  async exportPng24() {
    if (this.disposed || this.exportKind) return;
    let e = `${this.exportBasename()}-4K.PNG`,
      t = null;
    try {
      t = await Pw({
        filename: e,
        mime: `image/png`,
        extension: `png`,
        description: `PNG24`,
      });
    } catch (e) {
      if (Mw(e)) return;
      t = null;
    }
    (this.exportKind = `png`),
      (this.freezeTick = !0),
      (this.exportNote = `WRITING PNG24 4K`),
      this.emitHud(!0);
    try {
      this.beginHiRes(),
        this.renderer.render(this.scene, this.camera),
        await Fw(await Iw(this.renderer.domElement), e, t),
        this.finishExport(t ? `SAVED PNG24 4K TO DESKTOP` : `SAVED PNG24 4K`);
    } catch (e) {
      this.failExport(e);
    }
  }
  async exportH264() {
    if (this.disposed || this.exportKind) return;
    let e = `${this.exportBasename()}-4K-15S.MP4`,
      t = null;
    try {
      t = await Pw({
        filename: e,
        mime: `video/mp4`,
        extension: `mp4`,
        description: `H264 MP4`,
      });
    } catch (e) {
      if (Mw(e)) return;
      t = null;
    }
    (this.exportKind = `h264`),
      (this.freezeTick = !0),
      (this.exportNote = `PREPARING H264 4K`),
      this.emitHud(!0);
    try {
      this.beginHiRes();
      let n = await Ew.create(this.renderer.domElement, 15);
      (this.h264 = {
        recorder: n,
        handle: t,
        filename: e,
        t0: performance.now() / 1e3,
        elapsed: 0,
      }),
        (this.exportFrame = 0),
        (this.exportFrames = n.frames),
        (this.exportNote = ``),
        (this.freezeTick = !1),
        this.emitHud(!0);
    } catch (e) {
      this.endHiRes(), this.failExport(e);
    }
  }
  dispose() {
    if (this.disposed) return;
    (this.disposed = !0),
      this.renderer.setAnimationLoop(null),
      window.removeEventListener(`keydown`, this.onKey),
      document.removeEventListener(`visibilitychange`, this.onVis),
      this.ro.disconnect(),
      window.clearTimeout(this.exportNoteTimer),
      this.h264?.recorder.cancel(),
      (this.h264 = null),
      this.pane.dispose(),
      this.ascii.dispose(),
      this.controls.dispose();
    for (let e of this.satellites) this.disposeSatellite(e);
    (this.satellites = []),
      this.disposeArtifact(),
      this.particles.geometry.dispose(),
      this.particles.material.dispose(),
      this.scene.remove(this.particles),
      this.glassMat.dispose(),
      this.wireMat.dispose(),
      this.envTexture?.dispose(),
      this.renderer.dispose(),
      this.ownsCanvas && this.renderer.domElement.remove();
    let e = window;
    e.__phosphene && delete e.__phosphene;
  }
  exportBasename() {
    return `PHOSPHENE-${String(this.seed).padStart(4, `0`)}`;
  }
  beginHiRes() {
    (this.hires = !0),
      (this.camera.aspect = ww / Tw),
      this.camera.updateProjectionMatrix(),
      this.renderer.setPixelRatio(1),
      this.renderer.setSize(ww, Tw, !1);
  }
  endHiRes() {
    (this.hires = !1), this.resize();
  }
  finishExport(e) {
    this.endHiRes(),
      (this.freezeTick = !1),
      (this.exportKind = null),
      (this.exportFrame = 0),
      (this.exportFrames = 0),
      (this.h264 = null),
      (this.captureBusy = !1),
      (this.exportNote = e),
      this.scheduleNoteClear(),
      this.emitHud(!0);
  }
  failExport(e) {
    this.endHiRes(),
      (this.freezeTick = !1),
      (this.exportKind = null),
      (this.exportFrame = 0),
      (this.exportFrames = 0),
      (this.h264 = null),
      (this.captureBusy = !1),
      (this.exportNote = Uw(e)),
      this.scheduleNoteClear(),
      this.emitHud(!0);
  }
  scheduleNoteClear() {
    window.clearTimeout(this.exportNoteTimer),
      (this.exportNoteTimer = window.setTimeout(() => {
        (this.exportNote = ``), this.emitHud(!0);
      }, 4200));
  }
  bindApi() {
    (window.__phosphene = {
      typeDigit: (e) => this.typeDigit(e),
      toggleAscii: () => this.toggleAscii(),
      generate: () => this.generate(),
      exportPng24: () => this.exportPng24(),
      exportH264: () => this.exportH264(),
      getState: () => ({
        digit: this.params.digit,
        ascii: this.params.ascii,
        particles: this.params.particleCount,
        seed: this.seed,
        exporting: this.exportKind,
      }),
    }),
      (window.__phospheneReady = !0);
  }
  handleKey(e) {
    let t = e.target;
    if (
      !(
        t instanceof HTMLInputElement ||
        t instanceof HTMLTextAreaElement ||
        t instanceof HTMLSelectElement
      ) &&
      !t?.isContentEditable &&
      !(e.metaKey || e.ctrlKey || e.altKey)
    ) {
      if (e.key >= `0` && e.key <= `9`) {
        e.preventDefault(), this.typeDigit(Number(e.key));
        return;
      }
      if (e.key === `a` || e.key === `A`) {
        e.preventDefault(), this.toggleAscii();
        return;
      }
      (e.key === `g` || e.key === `G`) && (e.preventDefault(), this.generate());
    }
  }
  buildPane() {
    let e = new wv({
        title: `SPECIMEN CONTROLS`,
        container: this.paneHost,
        expanded: !1,
      }),
      t = this.params,
      n = e.addFolder({ title: `EXPORT 4K`, expanded: !0 });
    n.addButton({ title: `EXPORT PNG24` }).on(`click`, () => {
      this.exportPng24();
    }),
      n.addButton({ title: `EXPORT H264 15SECS MP4` }).on(`click`, () => {
        this.exportH264();
      });
    let r = e.addFolder({ title: `FIELD` });
    r
      .addBinding(t, `digit`, { min: 0, max: 9, step: 1, label: `INDEX 0–9` })
      .on(`change`, (e) => {
        e.last && this.typeDigit(t.digit, { spawn: !1 });
      }),
      r
        .addBinding(t, `dispersion`, {
          min: 0.05,
          max: 4.2,
          step: 0.01,
          label: `DISPERSION`,
        })
        .on(`change`, (e) => {
          e.last && this.recomputeHomes(!1);
        }),
      r
        .addBinding(t, `particleCount`, {
          min: 80,
          max: Lw,
          step: 10,
          label: `PARTICLES`,
        })
        .on(`change`, (e) => {
          e.last && this.recomputeHomes(!1);
        }),
      r.addBinding(t, `turbulence`, {
        min: 0,
        max: 0.8,
        step: 0.01,
        label: `TURBULENCE`,
      }),
      r.addBinding(t, `particleSize`, {
        min: 0.012,
        max: 0.08,
        step: 0.001,
        label: `PARTICLE SIZE`,
      }),
      r.addBinding(t, `particleSpeed`, {
        min: 0.2,
        max: 2.4,
        step: 0.01,
        label: `PARTICLE SPEED`,
      });
    let i = e.addFolder({ title: `FORM` });
    i
      .addBinding(t, `shape`, { options: Ev, label: `SHAPE` })
      .on(`change`, () => this.rebuildCore()),
      i.addBinding(t, `size`, {
        min: 0.55,
        max: 1.45,
        step: 0.01,
        label: `SIZE`,
      }),
      i
        .addBinding(t, `distortion`, {
          min: 0,
          max: 0.6,
          step: 0.01,
          label: `DISTORTION`,
        })
        .on(`change`, (e) => {
          e.last && this.rebuildCore();
        }),
      i
        .addBinding(t, `width`, {
          min: 0.55,
          max: 1.45,
          step: 0.01,
          label: `WIDTH`,
        })
        .on(`change`, (e) => {
          e.last && this.rebuildCore();
        }),
      i
        .addBinding(t, `height`, {
          min: 0.55,
          max: 1.55,
          step: 0.01,
          label: `HEIGHT`,
        })
        .on(`change`, (e) => {
          e.last && this.rebuildCore();
        }),
      i
        .addBinding(t, `twist`, {
          min: -0.8,
          max: 0.8,
          step: 0.01,
          label: `TWIST`,
        })
        .on(`change`, (e) => {
          e.last && this.rebuildCore();
        });
    let a = e.addFolder({ title: `GRAIN & NOISE` });
    a.addBinding(t, `grain`, { min: 0, max: 0.4, step: 0.01, label: `GRAIN` }),
      a
        .addBinding(t, `noise`, {
          min: 0,
          max: 0.5,
          step: 0.01,
          label: `NOISE`,
        })
        .on(`change`, (e) => {
          e.last && this.rebuildCore();
        }),
      a
        .addBinding(t, `noiseScale`, {
          min: 0.5,
          max: 8,
          step: 0.1,
          label: `NOISE SCALE`,
        })
        .on(`change`, (e) => {
          e.last && this.rebuildCore();
        });
    let o = e.addFolder({ title: `GLASS` });
    o.addBinding(t, `thickness`, {
      min: 0.1,
      max: 5,
      step: 0.1,
      label: `THICKNESS`,
    }),
      o.addBinding(t, `ior`, { min: 1, max: 2.4, step: 0.01, label: `IOR` }),
      o.addBinding(t, `transmission`, {
        min: 0,
        max: 1,
        step: 0.01,
        label: `TRANSMISSION`,
      }),
      o.addBinding(t, `roughness`, {
        min: 0,
        max: 1,
        step: 0.01,
        label: `ROUGHNESS`,
      }),
      o.addBinding(t, `iridescence`, {
        min: 0,
        max: 1,
        step: 0.01,
        label: `IRIDESCENCE`,
      }),
      o
        .addBinding(t, `hue`, { min: 0, max: 256, step: 1, label: `HUE` })
        .on(`change`, (e) => {
          e.last && this.rebuildCore();
        }),
      o
        .addBinding(t, `colorA`, { view: `color`, label: `COLOR A` })
        .on(`change`, (e) => {
          e.last && this.rebuildCore();
        }),
      o
        .addBinding(t, `colorB`, { view: `color`, label: `COLOR B` })
        .on(`change`, (e) => {
          e.last && this.rebuildCore();
        });
    let s = e.addFolder({ title: `OVERLAYS` });
    s.addBinding(t, `wireframe`, { label: `WIREFRAME` }),
      s.addBinding(t, `wireOpacity`, {
        min: 0,
        max: 1,
        step: 0.01,
        label: `WIRE OPACITY`,
      }),
      s.addBinding(t, `lines`, { label: `LINES` }),
      s
        .addBinding(t, `lineCount`, {
          min: 1,
          max: 12,
          step: 1,
          label: `LINE COUNT`,
        })
        .on(`change`, (e) => {
          e.last && this.buildLines();
        }),
      s
        .addBinding(t, `lineSpread`, {
          min: 0.5,
          max: 2,
          step: 0.01,
          label: `LINE SPREAD`,
        })
        .on(`change`, (e) => {
          e.last && this.buildLines();
        }),
      s.addBinding(t, `lineOpacity`, {
        min: 0,
        max: 1,
        step: 0.01,
        label: `LINE OPACITY`,
      }),
      s.addBinding(t, `ring`, { label: `RING` }),
      s.addBinding(t, `ringSize`, {
        min: 0.4,
        max: 1.8,
        step: 0.01,
        label: `RING SIZE`,
      }),
      s.addBinding(t, `ringOpacity`, {
        min: 0,
        max: 1,
        step: 0.01,
        label: `RING OPACITY`,
      });
    let c = e.addFolder({ title: `ASCII` });
    c.addBinding(t, `ascii`, { label: `ENABLE` }),
      c.addBinding(t, `asciiAnimate`, { label: `ANIMATE` }),
      c.addBinding(t, `asciiColor`, { label: `COLOR` }),
      c.addBinding(t, `asciiInvert`, { label: `INVERT` }),
      c.addBinding(t, `asciiCharset`, { options: Dv, label: `CHARSET` }),
      c
        .addBinding(t, `asciiResolution`, {
          min: 0.08,
          max: 0.42,
          step: 0.01,
          label: `DENSITY`,
        })
        .on(`change`, (e) => {
          e.last &&
            this.ascii.resize(
              this.host.clientWidth,
              this.host.clientHeight,
              t.asciiResolution,
            );
        }),
      c.addBinding(t, `asciiPersist`, {
        min: 0.12,
        max: 0.8,
        step: 0.01,
        label: `GHOSTING`,
      });
    let l = e.addFolder({ title: `MOTION & LIGHT` });
    return (
      l.addBinding(t, `spin`, { min: 0, max: 2, step: 0.01, label: `SPIN` }),
      l.addBinding(t, `float`, {
        min: 0,
        max: 0.4,
        step: 0.01,
        label: `FLOAT`,
      }),
      l.addBinding(t, `keyLight`, {
        min: 0,
        max: 14,
        step: 0.1,
        label: `KEY LIGHT`,
      }),
      l.addBinding(t, `rimLight`, {
        min: 0,
        max: 40,
        step: 0.1,
        label: `RIM LIGHT`,
      }),
      e
        .addButton({ title: `GENERATE NEW PIECE` })
        .on(`click`, () => this.generate()),
      e
        .addButton({ title: `COLLAPSE FIELD (0)` })
        .on(`click`, () => this.typeDigit(0)),
      e.on(`change`, () => this.syncFromParams()),
      e
    );
  }
  addStarfield() {
    let e = new Float32Array(1260);
    for (let t = 0; t < 420; t++) {
      let n = 8 + Math.random() * 22,
        r = Math.random(),
        i = Math.random(),
        a = 2 * Math.PI * r,
        o = Math.acos(2 * i - 1);
      (e[t * 3] = n * Math.sin(o) * Math.cos(a)),
        (e[t * 3 + 1] = n * Math.sin(o) * Math.sin(a)),
        (e[t * 3 + 2] = n * Math.cos(o));
    }
    let t = new qr();
    t.setAttribute(`position`, new Mr(e, 3));
    let n = new qi({
      color: 9081996,
      size: 0.018,
      transparent: !0,
      opacity: 0.55,
      depthWrite: !1,
    });
    this.scene.add(new Qi(t, n));
  }
  makeGeometry() {
    let e = this.params,
      t;
    switch (e.shape) {
      case `Orb`:
        t = new da(1.65, 48, 32);
        break;
      case `Knot`:
        t = new pa(1.05, 0.38, 120, 18, 2, 3);
        break;
      case `Torus`:
        t = new fa(1.25, 0.62, 24, 80);
        break;
      case `Pyramid`:
        t = new oa(1.5, 2.8, 5, 3);
        break;
      case `Icosahedron`:
        t = new ca(1.65, 2);
        break;
      default:
        t = new ca(1.65, 3);
    }
    let n = t.attributes.position;
    if (!n) throw Error(`GEOMETRY MISSING POSITION`);
    let r = this.tmp,
      i = this.rng;
    for (let t = 0; t < n.count; t++) {
      r.fromBufferAttribute(n, t);
      let a =
          Math.sin(r.x * e.noiseScale + Math.cos(r.z * 1.7)) *
          Math.cos(r.y * e.noiseScale * 0.8),
        o = Math.sin(r.x * 7.2 + r.y * 4.1 + i() * 3),
        s =
          1 +
          e.distortion * Math.sin(r.y * 3.1 + i() * 4) +
          e.noise * (a * 0.7 + o * 0.3);
      r.multiplyScalar(s),
        (r.x *= e.width),
        (r.y *= e.height),
        (r.z += Math.sin(r.x * 2.5) * e.twist * r.y),
        n.setXYZ(t, r.x, r.y, r.z);
    }
    t.computeVertexNormals(), t.computeBoundingBox();
    let a = t.boundingBox ?? new mr();
    this.colorA.set(e.colorA).offsetHSL(e.hue / 256, 0, 0),
      this.colorB.set(e.colorB).offsetHSL(e.hue / 256, 0, 0);
    let o = new Float32Array(n.count * 3),
      s = Math.max(1e-4, a.max.y - a.min.y);
    for (let e = 0; e < n.count; e++) {
      let t = Kt.clamp((n.getY(e) - a.min.y) / s, 0, 1);
      this.particleColor.copy(this.colorA).lerp(this.colorB, t),
        (o[e * 3] = this.particleColor.r),
        (o[e * 3 + 1] = this.particleColor.g),
        (o[e * 3 + 2] = this.particleColor.b);
    }
    return t.setAttribute(`color`, new Fr(o, 3)), t;
  }
  disposeArtifact() {
    this.scene.remove(this.artifact),
      this.artifact.traverse((e) => {
        if (
          e instanceof gi &&
          (e.geometry.dispose(),
          e.material !== this.glassMat && e.material !== this.wireMat)
        ) {
          let t = e.material;
          Array.isArray(t) ? t.forEach((e) => e.dispose()) : t.dispose();
        }
        e instanceof Gi && (e.geometry.dispose(), e.material.dispose());
      }),
      (this.artifact = new Wn()),
      (this.core = null),
      (this.outline = null),
      (this.ring = null),
      (this.lineGroup = null);
  }
  rebuildCore() {
    let e = this.params;
    this.disposeArtifact();
    let t = this.makeGeometry();
    (this.core = new gi(t, this.glassMat)),
      (this.outline = new gi(t.clone(), this.wireMat)),
      this.outline.scale.setScalar(1.012),
      this.artifact.add(this.core, this.outline),
      this.colorA.set(e.colorA).offsetHSL(e.hue / 256, 0, 0),
      (this.ring = new gi(
        new fa(2.08 + this.rng() * 0.2, 0.012, 8, 96),
        new ii({
          color: this.colorA,
          transparent: !0,
          opacity: e.ringOpacity,
          depthWrite: !1,
        }),
      )),
      this.ring.rotation.set(this.rng() * 2, this.rng() * 2, this.rng() * 2),
      this.artifact.add(this.ring),
      this.artifact.scale.setScalar(e.size),
      this.artifact.rotation.set(
        this.rng() * 0.4,
        this.rng() * 0.7,
        this.rng() * 0.35,
      ),
      this.scene.add(this.artifact),
      this.buildLines(),
      this.wireMat.color.copy(this.colorA).offsetHSL(0.08, 0.04, 0.18);
  }
  buildLines() {
    this.lineGroup &&
      (this.artifact.remove(this.lineGroup),
      this.lineGroup.traverse((e) => {
        e instanceof Gi && (e.geometry.dispose(), e.material.dispose());
      })),
      (this.lineGroup = new Wn());
    let e = this.params;
    this.colorA.set(e.colorA).offsetHSL(e.hue / 256 + 0.12, 0.05, 0.18);
    for (let t = 0; t < e.lineCount; t++) {
      let n = [],
        r = (t - (e.lineCount - 1) / 2) * 0.34;
      for (let i = 0; i <= 96; i++) {
        let a = (i / 96) * Math.PI * 2,
          o = 1 + Math.sin(a * 3 + t * 1.7) * 0.06,
          s = new z(
            Math.cos(a) * (2.05 + t * 0.035) * o,
            Math.sin(a) * (1.12 + t * 0.04) * o,
            Math.sin(a * 2 + t) * 0.5,
          );
        s.applyAxisAngle(new z(1, 0, 0), r + e.twist * 0.4),
          s.multiplyScalar(e.lineSpread),
          n.push(s);
      }
      let i = new Li({
        color: this.colorA,
        transparent: !0,
        opacity: e.lineOpacity,
        depthWrite: !1,
      });
      this.lineGroup.add(new Gi(new qr().setFromPoints(n), i));
    }
    (this.lineGroup.visible = e.lines), this.artifact.add(this.lineGroup);
  }
  recomputeHomes(e) {
    let t = Math.max(1, Math.min(Lw, Math.round(this.params.particleCount)));
    this.particles.count = t;
    let n = 0.85 + this.params.dispersion,
      r = { x: 0, y: 0, z: 0 };
    for (let i = 0; i < t; i++) {
      Ow(this.params.digit, i, t, n, r);
      let a = i * 3;
      (this.particleHome[a] = r.x),
        (this.particleHome[a + 1] = r.y),
        (this.particleHome[a + 2] = r.z),
        e &&
          ((this.particlePos[a] = r.x),
          (this.particlePos[a + 1] = r.y),
          (this.particlePos[a + 2] = r.z),
          (this.particleVel[a] = 0),
          (this.particleVel[a + 1] = 0),
          (this.particleVel[a + 2] = 0),
          (this.particlePhase[i] = Math.random() * Math.PI * 2));
    }
  }
  burst(e) {
    let t = this.particles.count,
      n = e === 0 ? -1.8 : 1.1 + e * 0.22;
    for (let e = 0; e < t; e++) {
      let t = e * 3,
        r = this.particlePos[t] ?? 0,
        i = this.particlePos[t + 1] ?? 0,
        a = this.particlePos[t + 2] ?? 0,
        o = Math.hypot(r, i, a) || 1,
        s = n * (0.55 + (this.particlePhase[e] ?? 0) * 0.08);
      (this.particleVel[t] = (this.particleVel[t] ?? 0) + (r / o) * s),
        (this.particleVel[t + 1] =
          (this.particleVel[t + 1] ?? 0) + (i / o) * s),
        (this.particleVel[t + 2] =
          (this.particleVel[t + 2] ?? 0) + (a / o) * s);
    }
  }
  spawnSatellite(e) {
    for (; this.satellites.length >= Rw; ) {
      let e = this.satellites.shift();
      e && this.disposeSatellite(e);
    }
    let t = this.satellites.length + this.sequence.length,
      n = kw(e, t),
      r = new ca(1, 1),
      i = r.attributes.position,
      a = new Float32Array(i.count * 3);
    this.colorA.set(this.params.colorA), this.colorB.set(this.params.colorB);
    for (let e = 0; e < i.count; e++) {
      let t = (i.getY(e) + 1) / 2;
      this.particleColor.copy(this.colorA).lerp(this.colorB, t),
        (a[e * 3] = this.particleColor.r),
        (a[e * 3 + 1] = this.particleColor.g),
        (a[e * 3 + 2] = this.particleColor.b);
    }
    r.setAttribute(`color`, new Fr(a, 3));
    let o = new gi(r, this.glassMat),
      s = new gi(r.clone(), this.wireMat);
    s.scale.setScalar(1.02);
    let c = new Wn();
    c.add(o, s),
      c.position.set(n.x, n.y, n.z),
      c.scale.setScalar(0.001),
      this.scene.add(c),
      this.satellites.push({
        group: c,
        core: o,
        wire: s,
        base: new z(n.x, n.y, n.z),
        scale: n.scale,
        phase: zw * t,
        appearing: 0,
      });
  }
  collapseSatellites() {
    for (let e of this.satellites) e.appearing = -1;
  }
  disposeSatellite(e) {
    this.scene.remove(e.group),
      e.core.geometry.dispose(),
      e.wire.geometry.dispose();
  }
  syncFromParams() {
    let e = this.params;
    this.artifact.scale.setScalar(e.size),
      (this.glassMat.thickness = e.thickness),
      (this.glassMat.ior = e.ior),
      (this.glassMat.transmission = e.transmission),
      (this.glassMat.roughness = e.roughness),
      (this.glassMat.iridescence = e.iridescence),
      this.outline && (this.outline.visible = e.wireframe),
      (this.wireMat.opacity = e.wireOpacity),
      this.lineGroup &&
        ((this.lineGroup.visible = e.lines),
        this.lineGroup.children.forEach((t) => {
          t instanceof Gi && (t.material.opacity = e.lineOpacity);
        })),
      this.ring &&
        ((this.ring.visible = e.ring),
        this.ring.scale.setScalar(e.ringSize),
        (this.ring.material.opacity = e.ringOpacity)),
      (this.keyLight.intensity = e.keyLight),
      (this.rimLight.intensity = e.rimLight),
      this.ascii.setVisible(e.ascii),
      (this.renderer.domElement.style.visibility = e.ascii
        ? `hidden`
        : `visible`),
      (this.renderer.domElement.style.opacity = `1`),
      this.host.style.setProperty(`--grain`, String(e.grain));
  }
  resize() {
    if (this.disposed || this.hires) return;
    let e = this.host.clientWidth || window.innerWidth,
      t = this.host.clientHeight || window.innerHeight;
    (this.camera.aspect = e / t),
      this.camera.updateProjectionMatrix(),
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)),
      this.renderer.setSize(e, t),
      this.ascii.resize(e, t, this.params.asciiResolution);
  }
  tick() {
    if (this.disposed || this.freezeTick) return;
    if (this.h264) {
      this.captureBusy || this.stepH264();
      return;
    }
    let e = performance.now(),
      t = Math.min((e - this.lastTime) / 1e3, 0.1);
    this.lastTime = e;
    let n = e / 1e3,
      r = this.params,
      i = this.reducedMotion ? 0.15 : 1;
    this.advanceScene(t, n, i),
      r.ascii
        ? (this.renderer.render(this.scene, this.camera),
          this.ascii.renderFromGL(this.renderer.domElement, r, t))
        : this.renderer.render(this.scene, this.camera),
      this.emitHud(!1);
  }
  async stepH264() {
    let e = this.h264;
    if (e && !this.disposed) {
      this.captureBusy = !0;
      try {
        let t = 1 / 30;
        if (
          ((e.elapsed += t),
          this.advanceScene(t, e.t0 + e.elapsed, 1),
          this.renderer.render(this.scene, this.camera),
          await e.recorder.capture(),
          (this.exportFrame = e.recorder.frameIndex),
          (this.exportFrames = e.recorder.frames),
          e.recorder.done)
        ) {
          await Fw(await e.recorder.finalize(), e.filename, e.handle),
            this.finishExport(
              e.handle
                ? `SAVED H264 4K 15SECS TO DESKTOP`
                : `SAVED H264 4K 15SECS`,
            );
          return;
        }
        this.emitHud(!0);
      } catch (t) {
        await e.recorder.cancel(), this.failExport(t);
      } finally {
        this.captureBusy = !1;
      }
    }
  }
  advanceScene(e, t, n) {
    let r = this.params;
    (this.artifact.rotation.y += (0.12 + r.spin * 0.35) * e * n),
      (this.artifact.position.y = Math.sin(t * 0.7) * r.float * n),
      this.ring && (this.ring.rotation.z += e * 0.18 * n),
      this.lineGroup && (this.lineGroup.rotation.y -= e * 0.08 * n),
      this.updateParticles(e, t, n),
      this.updateSatellites(e, t, n),
      this.controls.update();
  }
  updateParticles(e, t, n) {
    let r = this.params,
      i = this.particles.count,
      a = 3.6 * r.particleSpeed,
      o = r.particleSize,
      s = r.turbulence * n;
    for (let r = 0; r < i; r++) {
      let i = r * 3,
        c = this.particleHome[i] ?? 0,
        l = this.particleHome[i + 1] ?? 0,
        u = this.particleHome[i + 2] ?? 0,
        d = this.particleVel[i] ?? 0,
        f = this.particleVel[i + 1] ?? 0,
        p = this.particleVel[i + 2] ?? 0,
        m = this.particlePos[i] ?? 0,
        h = this.particlePos[i + 1] ?? 0,
        g = this.particlePos[i + 2] ?? 0;
      (d += (c - m) * a * e), (f += (l - h) * a * e), (p += (u - g) * a * e);
      let _ = Math.exp(-3.2 * e);
      (d *= _),
        (f *= _),
        (p *= _),
        (m += d * e * n),
        (h += f * e * n),
        (g += p * e * n),
        (this.particleVel[i] = d),
        (this.particleVel[i + 1] = f),
        (this.particleVel[i + 2] = p),
        (this.particlePos[i] = m),
        (this.particlePos[i + 1] = h),
        (this.particlePos[i + 2] = g);
      let v = this.particlePhase[r] ?? 0,
        y = Math.sin(t * 0.85 + v + m * 1.4) * s;
      this.dummy.position.set(
        m + y,
        h + Math.cos(t * 0.6 + v) * s,
        g - y * 0.6,
      );
      let b = o * (0.85 + 0.2 * Math.sin(t * 1.3 + v));
      this.dummy.scale.setScalar(b),
        this.dummy.rotation.set(t * 0.4 + v, t * 0.25, v),
        this.dummy.updateMatrix(),
        this.particles.setMatrixAt(r, this.dummy.matrix);
    }
    this.particles.instanceMatrix.needsUpdate = !0;
  }
  updateSatellites(e, t, n) {
    let r = [];
    for (let i of this.satellites) {
      if (i.appearing >= 0) i.appearing = Math.min(1, i.appearing + e * 2.4);
      else if (((i.appearing -= e * 2.2), i.appearing < -1)) {
        this.disposeSatellite(i);
        continue;
      }
      let a = i.appearing >= 0 ? i.appearing : Math.max(0, 1 + i.appearing),
        o = t * 0.16 * n + i.phase,
        s = i.base.length();
      i.group.position.set(
        Math.cos(o) * s,
        i.base.y + Math.sin(t * 0.7 + i.phase) * 0.12,
        Math.sin(o) * s,
      ),
        i.group.scale.setScalar(i.scale * a),
        (i.group.rotation.y += e * 0.35 * n),
        r.push(i);
    }
    this.satellites = r;
  }
  emitHud(e) {
    if (!this.onHud) return;
    let t = performance.now();
    if (!e && t - this.lastHud < 120) return;
    this.lastHud = t;
    let n = this.artifact.position;
    this.onHud({
      seed: String(this.seed).padStart(4, `0`),
      digit: this.params.digit,
      sequence: this.sequence.join(` · `),
      ior: this.glassMat.ior.toFixed(2),
      angle: `${Math.round(Kt.radToDeg(this.artifact.rotation.y) % 360)}°`,
      position: `X ${Vw(n.x)}   Y ${Vw(n.y)}   Z ${Vw(n.z)}`,
      particles: this.particles.count,
      ascii: this.params.ascii,
      grain: this.params.grain,
      flashDigit: this.flashDigit,
      flashNonce: this.flashNonce,
      ready: !0,
      exporting: this.exportKind,
      exportFrame: this.exportFrame,
      exportFrames: this.exportFrames,
      exportNote: this.exportNote,
    });
  }
}
