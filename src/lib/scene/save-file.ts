export class SaveCancelled extends Error {
  constructor() {
    super("SAVE CANCELLED");
    this.name = "SaveCancelled";
  }
}

export function isSaveCancelled(err: unknown): boolean {
  return err instanceof SaveCancelled || (err instanceof DOMException && err.name === "AbortError");
}

type SavePicker = (options: {
  suggestedName?: string;
  startIn?: "desktop" | "downloads" | "documents" | "pictures" | "videos";
  types?: Array<{
    description?: string;
    accept: Record<string, string[]>;
  }>;
}) => Promise<FileSystemFileHandle>;

function getPicker(): SavePicker | null {
  const w = window as Window & { showSaveFilePicker?: SavePicker };
  if (typeof w.showSaveFilePicker !== "function") return null;
  return (options) => w.showSaveFilePicker!(options);
}

export async function pickDesktopFile(opts: {
  filename: string;
  mime: string;
  extension: string;
  description: string;
}): Promise<FileSystemFileHandle | null> {
  const picker = getPicker();
  if (!picker) return null;
  const ext = opts.extension.replace(/^\./, "");
  try {
    return await picker({
      suggestedName: opts.filename,
      startIn: "desktop",
      types: [
        {
          description: opts.description,
          accept: { [opts.mime]: [`.${ext}`] },
        },
      ],
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw new SaveCancelled();
    return null;
  }
}

export async function writeBlob(
  blob: Blob,
  filename: string,
  handle: FileSystemFileHandle | null,
): Promise<void> {
  if (handle) {
    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();
    return;
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 8000);
}

export function canvasToPng24(source: HTMLCanvasElement): Promise<Blob> {
  const out = document.createElement("canvas");
  out.width = source.width;
  out.height = source.height;
  const ctx = out.getContext("2d", { alpha: false, colorSpace: "srgb" });
  if (!ctx) return Promise.reject(new Error("2D CONTEXT UNAVAILABLE"));
  ctx.fillStyle = "#07090c";
  ctx.fillRect(0, 0, out.width, out.height);
  ctx.drawImage(source, 0, 0);
  return new Promise((resolve, reject) => {
    out.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("PNG24 ENCODE FAILED"));
    }, "image/png");
  });
}
