import { createServerFn } from "@tanstack/react-start";

export const recordVisit = createServerFn({ method: "POST" }).handler(
  async (): Promise<number> => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<{ count: number }>`
      insert into visits (id, count) values (1, 1)
      on conflict (id) do update set count = visits.count + 1
      returning count
    `;
    const n = Number(rows[0]?.count ?? 1);
    return Number.isFinite(n) && n > 0 ? n : 1;
  },
);

export function formatVisit(n: number): string {
  const v = Math.max(1, Math.floor(n));
  return String(v).padStart(4, "0");
}
