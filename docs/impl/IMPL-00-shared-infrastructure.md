# IMPL-00 — Shared SPEC infrastructure

## Namespace

- **File:** `lib/routes/spec/namespace.ts`
- **Public prefix:** `/spec/…`
- **Categories:** `multimedia` (single entry per AGENTS.md)

## Helpers (`lib/routes/spec/utils.ts`)

| Helper                            | Purpose                                      |
| --------------------------------- | -------------------------------------------- |
| `buildCacheKey(platform, …parts)` | Enforces `spec:<platform>:…` L2 keys         |
| `assertEnv(varName, errorCode)`   | Missing env → typed auth error               |
| `throwAuthError(code, message)`   | Standard RSSHub error throw (no empty feeds) |

## Access control

All requests require `?key=<ACCESS_KEY>` (see [`../routes/RSSHUB_SETUP.md`](../routes/RSSHUB_SETUP.md)).

## `_extra` contract

- **Types:** `lib/types/spec-extra.ts` (`SpecExtra` union)
- **Rule:** Only `_extra` on `DataItem` for Sunbi payloads — no ad-hoc top-level keys
- **JSON output:** `?format=json` — key is `_extra` (see `lib/views/json.ts`)

## Cache

- **TTL table:** [`../spec-cache.md`](../spec-cache.md)
- **L2 pattern:** `cache.tryGet(buildCacheKey(...), fetcher, ttlSeconds)` inside handlers

## Quality gates

```bash
pnpm build:routes
pnpm lint
pnpm vitest
bash scripts/spec-smoke.sh
```

## Deploy targets

Compose (`docker-compose.sunbi-rsshub.yml`), Fly (`fly.toml`), Worker (`wrangler.toml`) — see [`../LAUNCH_RUNBOOK.md`](../LAUNCH_RUNBOOK.md) and [`../SPEC-sunbi-rsshub.md`](../SPEC-sunbi-rsshub.md) § Deploy targets.
