import * as THREE from "three";
import { CHARSETS, type SceneParams } from "./types";

function clampByte(n: number): number {
  return Math.max(0, Math.min(255, n | 0));
}

export class AsciiLayer {
  readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly sampler: HTMLCanvasElement;
  private readonly samplerCtx: CanvasRenderingContext2D;
  private cols = 48;
  private rows = 32;
  private fontSize = 11;
  private charsetOffset = 0;
  private cssW = 1;
  private cssH = 1;

  constructor() {
    this.canvas = document.createElement("canvas");
    this.canvas.className = "ascii-layer";
    this.canvas.setAttribute("aria-hidden", "true");
    const ctx = this.canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("2D CANVAS UNAVAILABLE");
    this.ctx = ctx;

    this.sampler = document.createElement("canvas");
    const sctx = this.sampler.getContext("2d", { alpha: false, willReadFrequently: true });
    if (!sctx) throw new Error("ASCII SAMPLER UNAVAILABLE");
    this.samplerCtx = sctx;
  }

  resize(width: number, height: number, resolution: number): void {
    this.cssW = width;
    this.cssH = height;
    const font = Math.max(8, Math.round(8 + (1 - resolution) * 10));
    this.fontSize = font;
    const cellW = font * 0.6;
    const cellH = font * 1.0;
    this.cols = Math.max(40, Math.floor(width / cellW));
    this.rows = Math.max(24, Math.floor(height / cellH));
    this.sampler.width = this.cols;
    this.sampler.height = this.rows;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.floor(width * dpr);
    this.canvas.height = Math.floor(height * dpr);
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ctx.fillStyle = "#07090c";
    this.ctx.fillRect(0, 0, width, height);
  }

  setVisible(on: boolean): void {
    this.canvas.style.display = on ? "block" : "none";
  }

  renderFromGL(glCanvas: HTMLCanvasElement, params: SceneParams, dt: number): void {
    this.samplerCtx.drawImage(glCanvas, 0, 0, this.cols, this.rows);
    const pixels = this.samplerCtx.getImageData(0, 0, this.cols, this.rows).data;

    let maxL = 0.08;
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i] ?? 0;
      const g = pixels[i + 1] ?? 0;
      const b = pixels[i + 2] ?? 0;
      const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      if (lum > maxL) maxL = lum;
    }
    const boost = Math.min(7.5, 0.92 / maxL);

    const ctx = this.ctx;
    const persist = THREE.MathUtils.clamp(params.asciiPersist, 0.18, 0.85);
    ctx.fillStyle = `rgba(7, 9, 12, ${persist})`;
    ctx.fillRect(0, 0, this.cssW, this.cssH);
    ctx.font = `600 ${this.fontSize}px "Geist Mono", ui-monospace, monospace`;
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    ctx.shadowColor = "rgba(125, 255, 212, 0.28)";
    ctx.shadowBlur = 2;

    const charset = CHARSETS[params.asciiCharset] ?? CHARSETS.standard;
    const glyphs = charset.replace(/ /g, "") || charset;
    const len = glyphs.length;
    if (params.asciiAnimate) {
      this.charsetOffset += dt * (7 + params.digit * 0.6);
    }

    const cellW = this.cssW / this.cols;
    const cellH = this.cssH / this.rows;
    const offset = params.asciiAnimate ? Math.floor(this.charsetOffset) : 0;

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const p = (y * this.cols + x) * 4;
        const r = pixels[p] ?? 0;
        const g = pixels[p + 1] ?? 0;
        const b = pixels[p + 2] ?? 0;
        let lum = ((0.2126 * r + 0.7152 * g + 0.0722 * b) / 255) * boost;
        if (params.asciiInvert) lum = 1 - lum;
        lum = Math.min(1, Math.pow(Math.max(0, lum), 0.62));
        if (lum < 0.03) continue;
        const idx = (Math.floor(lum * (len - 0.0001)) + offset) % len;
        const ch = (glyphs[idx] ?? glyphs[0] ?? "#").toUpperCase();
        const target = 150 + lum * 105;
        const maxc = Math.max(r, g, b, 1);
        const scale = target / maxc;
        if (params.asciiColor) {
          ctx.fillStyle = `rgb(${clampByte(r * scale)},${clampByte(g * scale)},${clampByte(b * scale)})`;
        } else {
          ctx.fillStyle = `rgba(125, 255, 212, ${0.55 + lum * 0.45})`;
        }
        ctx.fillText(ch, x * cellW, y * cellH);
      }
    }
    ctx.shadowBlur = 0;
  }

  dispose(): void {
    this.canvas.remove();
  }
}
