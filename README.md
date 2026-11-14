# PHOSPHENE

Charged glass, indexed by number. Type `0–9` to seed and disperse the lattice. Drag to orbit. `A` toggles ASCII.

By [Leon Ofsky](https://www.leonofsky.tv) · [GitHub](https://github.com/leonofsky/phosphene)

## Stack

Three.js, Tweakpane, TanStack Start, Geist Mono.

## Controls

| Input | Action |
| --- | --- |
| `0–9` | Seed a new formation and spawn satellites |
| `A` | ASCII / WebGL |
| Drag | Orbit |
| Export PNG24 | 4K still |
| Export H264 | 4K / 15s motion |

Each visit increments the serial after the title. The migrated counter preserves the existing total of `0190`; the next visit displays `0191`.

## Deploy

The Vercel project uses the Nitro Vercel preset. Set `DATABASE_URL` to a persistent Postgres connection string in all Vercel environments. The build applies `migrations/0002_visits.sql`, which seeds a new counter at 190 without resetting an existing row.

## Run

```sh
npm install
npm run dev
```

## License

MIT © 2026 Leon Ofsky
