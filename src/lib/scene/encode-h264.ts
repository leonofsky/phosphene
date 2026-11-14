import {
  BufferTarget,
  CanvasSource,
  Mp4OutputFormat,
  Output,
  Quality,
  canEncodeVideo,
} from "mediabunny";

export const EXPORT_WIDTH = 3840;
export const EXPORT_HEIGHT = 2160;
export const EXPORT_FPS = 30;
export const EXPORT_SECONDS = 15;

export class H264Recorder {
  readonly frames: number;
  private readonly output: Output<Mp4OutputFormat, BufferTarget>;
  private readonly source: CanvasSource;
  private index = 0;

  private constructor(
    output: Output<Mp4OutputFormat, BufferTarget>,
    source: CanvasSource,
    seconds: number,
  ) {
    this.output = output;
    this.source = source;
    this.frames = Math.round(seconds * EXPORT_FPS);
  }

  static async create(canvas: HTMLCanvasElement, seconds = EXPORT_SECONDS): Promise<H264Recorder> {
    const quality = new Quality("high");
    const encodable = await canEncodeVideo("avc", {
      width: EXPORT_WIDTH,
      height: EXPORT_HEIGHT,
      quality,
    });
    if (!encodable) {
      const anyAvc = await canEncodeVideo("avc");
      if (!anyAvc) throw new Error("H264 ENCODER UNAVAILABLE");
    }

    const target = new BufferTarget();
    const output = new Output({
      format: new Mp4OutputFormat({ fastStart: "in-memory" }),
      target,
    });
    const source = new CanvasSource(canvas, {
      codec: "avc",
      quality,
      keyFrameInterval: 2,
      sizeChangeBehavior: "deny",
      alpha: "discard",
      latencyMode: "realtime",
      hardwareAcceleration: "prefer-hardware",
    });

    output.addVideoTrack(source, { frameRate: EXPORT_FPS });
    output.setMetadataTags({
      title: "PHOSPHENE 4K 15S",
      comment: "PHOSPHENE H264 4K MOTION",
    });
    await output.start();
    return new H264Recorder(output, source, seconds);
  }

  get frameIndex(): number {
    return this.index;
  }

  get done(): boolean {
    return this.index >= this.frames;
  }

  get seconds(): number {
    return this.index / EXPORT_FPS;
  }

  async capture(): Promise<void> {
    if (this.done) return;
    const timestamp = this.index / EXPORT_FPS;
    await this.source.add(timestamp, 1 / EXPORT_FPS);
    this.index += 1;
  }

  async finalize(): Promise<Blob> {
    await this.output.finalize();
    const buffer = this.output.target.buffer;
    if (!buffer) throw new Error("MP4 BUFFER EMPTY");
    return new Blob([buffer], { type: "video/mp4" });
  }

  async cancel(): Promise<void> {
    try {
      if (this.output.state === "started" || this.output.state === "pending") {
        await this.output.cancel();
      }
    } catch {
      /* already closed */
    }
  }
}
