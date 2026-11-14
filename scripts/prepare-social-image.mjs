import { mkdir, readFile, writeFile } from "node:fs/promises";

const encoded = await readFile(new URL("../assets/og-image.base64", import.meta.url), "utf8");
await mkdir(new URL("../public/", import.meta.url), { recursive: true });
await writeFile(
  new URL("../public/og.jpg", import.meta.url),
  Buffer.from(encoded.replace(/\s/g, ""), "base64"),
);
