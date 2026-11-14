import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";

export type Sql = <T = Record<string, unknown>>(
  strings: TemplateStringsArray,
  ...values: unknown[]
) => Promise<T[]>;

const globalBoot = globalThis as typeof globalThis & {
  __pgBootstrapPromise__?: Promise<void>;
  __phospheneSql__?: Sql;
};

const dbSource = process.env.DATABASE_URL ? "neon" : "pglite";

if (dbSource === "pglite" && process.env.VERCEL === "1") {
  throw new Error("DATABASE_URL must be configured for the persistent visitor counter.");
}

async function migrate(sql: Sql) {
  await sql`
    create table if not exists visits (
      id int primary key check (id = 1),
      count bigint not null default 0
    )
  `;
  await sql`
    insert into visits (id, count) values (1, 190)
    on conflict (id) do nothing
  `;
}

async function createSql(): Promise<Sql> {
  if (dbSource === "neon") {
    const { Pool } = await import("pg");
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
      ssl: { rejectUnauthorized: false },
    });
    const sql: Sql = async (strings, ...values) => {
      let text = "";
      for (let i = 0; i < strings.length; i++) {
        text += strings[i];
        if (i < values.length) text += `$${i + 1}`;
      }
      const result = await pool.query(text, values);
      return result.rows;
    };
    await migrate(sql);
    return sql;
  }

  const { PGlite } = await import("@electric-sql/pglite");
  const db = new PGlite(".data/phosphene");
  const sql: Sql = async (strings, ...values) => {
    let text = "";
    for (let i = 0; i < strings.length; i++) {
      text += strings[i];
      if (i < values.length) text += `$${i + 1}`;
    }
    const result = await db.query(text, values);
    return result.rows as never;
  };
  await migrate(sql);
  return sql;
}

export async function ensureDbReady() {
  if (!globalBoot.__phospheneSql__) {
    globalBoot.__phospheneSql__ = await createSql();
  }
}

export async function getSql(): Promise<Sql> {
  if (!globalBoot.__phospheneSql__) {
    globalBoot.__phospheneSql__ = await createSql();
  }
  return globalBoot.__phospheneSql__;
}

export async function getDb() {
  if (dbSource === "neon") {
    const { Pool } = await import("pg");
    return drizzlePg(new Pool({ connectionString: process.env.DATABASE_URL }));
  }
  const { PGlite } = await import("@electric-sql/pglite");
  return drizzlePglite(new PGlite(".data/phosphene"));
}

if (
  typeof window === "undefined" &&
  dbSource === "pglite" &&
  process.env.VERCEL !== "1"
) {
  globalBoot.__pgBootstrapPromise__ ??= ensureDbReady().catch((err) => {
    globalBoot.__pgBootstrapPromise__ = undefined;
    console.error("[db] PGLite bootstrap failed:", err);
    throw err;
  });
}
