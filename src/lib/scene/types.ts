export type ShapeId = "Crystal" | "Orb" | "Knot" | "Torus" | "Pyramid" | "Icosahedron";

export type CharsetId = "standard" | "blocks" | "dense" | "binary" | "glyph";

export const CHARSETS: Record<CharsetId, string> = {
  standard: " .:-+*=%@#",
  blocks: " ·░▒▓█",
  dense: " .,;+*#MW",
  binary: " 01",
  glyph: " ·+*X#",
};

export const SHAPE_OPTIONS: Record<string, ShapeId> = {
  CRYSTAL: "Crystal",
  ORB: "Orb",
  KNOT: "Knot",
  TORUS: "Torus",
  PYRAMID: "Pyramid",
  ICOSAHEDRON: "Icosahedron",
};

export const CHARSET_OPTIONS: Record<string, CharsetId> = {
  STANDARD: "standard",
  BLOCKS: "blocks",
  DENSE: "dense",
  BINARY: "binary",
  GLYPH: "glyph",
};

export type SceneParams = {
  shape: ShapeId;
  size: number;
  distortion: number;
  noise: number;
  noiseScale: number;
  width: number;
  height: number;
  twist: number;
  grain: number;
  thickness: number;
  ior: number;
  transmission: number;
  roughness: number;
  iridescence: number;
  hue: number;
  colorA: string;
  colorB: string;
  wireframe: boolean;
  wireOpacity: number;
  lines: boolean;
  lineCount: number;
  lineSpread: number;
  lineOpacity: number;
  ring: boolean;
  ringSize: number;
  ringOpacity: number;
  spin: number;
  float: number;
  keyLight: number;
  rimLight: number;
  ascii: boolean;
  asciiInvert: boolean;
  asciiColor: boolean;
  asciiResolution: number;
  asciiCharset: CharsetId;
  asciiAnimate: boolean;
  asciiPersist: number;
  particleCount: number;
  dispersion: number;
  turbulence: number;
  particleSize: number;
  particleSpeed: number;
  digit: number;
};

export const DEFAULT_PARAMS: SceneParams = {
  shape: "Crystal",
  size: 1,
  distortion: 0.18,
  noise: 0.12,
  noiseScale: 2.5,
  width: 0.95,
  height: 1.08,
  twist: 0.08,
  grain: 0.1,
  thickness: 2.2,
  ior: 1.55,
  transmission: 0.96,
  roughness: 0.04,
  iridescence: 0.72,
  hue: 0,
  colorA: "#7dffd4",
  colorB: "#8eb4ff",
  wireframe: true,
  wireOpacity: 0.18,
  lines: true,
  lineCount: 5,
  lineSpread: 1.18,
  lineOpacity: 0.32,
  ring: true,
  ringSize: 1,
  ringOpacity: 0.48,
  spin: 0.55,
  float: 0.08,
  keyLight: 6.5,
  rimLight: 18,
  ascii: false,
  asciiInvert: false,
  asciiColor: true,
  asciiResolution: 0.2,
  asciiCharset: "standard",
  asciiAnimate: true,
  asciiPersist: 0.38,
  particleCount: 1100,
  dispersion: 1.15,
  turbulence: 0.12,
  particleSize: 0.034,
  particleSpeed: 1,
  digit: 1,
};

export type ExportKind = "png" | "h264" | null;

export type HudSnapshot = {
  seed: string;
  digit: number;
  sequence: string;
  ior: string;
  angle: string;
  position: string;
  particles: number;
  ascii: boolean;
  grain: number;
  flashDigit: number | null;
  flashNonce: number;
  ready: boolean;
  exporting: ExportKind;
  exportFrame: number;
  exportFrames: number;
  exportNote: string;
};

export const INITIAL_HUD: HudSnapshot = {
  seed: "—",
  digit: 1,
  sequence: "1",
  ior: "1.55",
  angle: "0°",
  position: "X +0.00   Y +0.00   Z +0.00",
  particles: DEFAULT_PARAMS.particleCount,
  ascii: false,
  grain: DEFAULT_PARAMS.grain,
  flashDigit: null,
  flashNonce: 0,
  ready: false,
  exporting: null,
  exportFrame: 0,
  exportFrames: 0,
  exportNote: "",
};

export type PhospheneApi = {
  typeDigit: (n: number, opts?: { spawn?: boolean }) => void;
  toggleAscii: () => void;
  generate: () => void;
  exportPng24: () => Promise<void>;
  exportH264: () => Promise<void>;
  getState: () => {
    digit: number;
    ascii: boolean;
    particles: number;
    seed: number;
    exporting: ExportKind;
  };
};
