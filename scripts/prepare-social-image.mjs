import { mkdir, readFile, writeFile } from "node:fs/promises";

const parts = await Promise.all(
  [1, 2, 3, 4, 5].map((part) =>
    readFile(new URL(`../assets/og-image-${part}.base64`, import.meta.url), "utf8"),
  ),
);
const encoded = parts.join("");
await mkdir(new URL("../public/", import.meta.url), { recursive: true });
await writeFile(
  new URL("../public/og.jpg", import.meta.url),
  Buffer.from(encoded.replace(/\s/g, ""), "base64"),
);
