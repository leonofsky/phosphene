import * as THREE from "three";

const CHARS = " .·:;-+=*x%#@";
const COLS = 160;

export class AsciiLayer {
  private renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
  private scene = new THREE.Scene();
  private camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private target: THREE.WebGLRenderTarget;
  private pixels: Uint8Array;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private visible = false;

  constructor(parent: HTMLElement) {
    this.renderer.setPixelRatio(1);
    this.renderer.domElement.className = "ascii-layer";
    parent.appendChild(this.renderer.domElement);
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d")!;
    this.target = new THREE.WebGLRenderTarget(COLS, 80, { depthBuffer: true });
    this.pixels = new Uint8Array(COLS * 80 * 4);
  }

  setVisible(v: boolean) {
    this.visible = v;
    this.renderer.domElement.style.display = v ? "block" : "none";
  }

  render(scene: THREE.Scene, camera: THREE.Camera, w: number, h: number) {
    if (!this.visible) return;
    const rows = Math.max(40, Math.round(COLS * h / w * 0.5));
    if (this.target.height !== rows) {
      this.target.setSize(COLS, rows);
      this.pixels = new Uint8Array(COLS * rows * 4);
    }
    const prev = this.renderer.getRenderTarget();
    this.renderer.setRenderTarget(this.target);
    this.renderer.render(scene, camera);
    this.renderer.readRenderTargetPixels(this.target, 0, 0, COLS, rows, this.pixels);
    this.renderer.setRenderTarget(prev);

    const cw = Math.ceil(w / COLS);
    const ch = Math.ceil(h / rows);
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    const ctx = this.ctx;
    ctx.fillStyle = "#07090c";
    ctx.fillRect(0, 0, w, h);
    ctx.font = `${ch}px monospace`;
    ctx.textBaseline = "top";
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < COLS; x++) {
        const i = ((rows - 1 - y) * COLS + x) * 4;
        const r = this.pixels[i], g = this.pixels[i + 1], b = this.pixels[i + 2];
        const lum = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 255;
        if (lum < 0.04) continue;
        const c = CHARS[Math.min(CHARS.length - 1, Math.floor(lum * CHARS.length))];
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillText(c, x * cw, y * ch);
      }
    }
    const out = this.renderer.domElement.getContext("2d");
    // WebGL canvas cannot be drawn into with 2D; use an overlay canvas instead.
    if (!out) {
      if (this.canvas.parentElement !== this.renderer.domElement.parentElement) {
        this.renderer.domElement.parentElement?.appendChild(this.canvas);
      }
      this.canvas.className = "ascii-layer";
      this.canvas.style.display = "block";
      this.renderer.domElement.style.display = "none";
    }
  }

  dispose() {
    this.target.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
    this.canvas.remove();
  }
}
