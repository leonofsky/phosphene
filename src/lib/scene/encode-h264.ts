import { Output, Mp4OutputFormat, BufferTarget, CanvasSource, QUALITY_HIGH } from "mediabunny";

export async function encodeH264(
  frames: VideoFrame[],
  width: number,
  height: number,
  fps: number,
): Promise<Blob> {
  const output = new Output({
    format: new Mp4OutputFormat(),
    target: new BufferTarget(),
  });
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  const source = new CanvasSource(canvas, { codec: "avc", bitrate: QUALITY_HIGH });
  output.addVideoTrack(source, { frameRate: fps });
  await output.start();
  for (const frame of frames) {
    ctx.drawImage(frame, 0, 0);
    await source.add(frame.timestamp / 1e6, 1 / fps);
    frame.close();
  }
  source.close();
  await output.finalize();
  return new Blob([output.target.buffer!], { type: "video/mp4" });
}
