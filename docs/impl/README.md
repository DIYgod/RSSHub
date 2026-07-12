# SPEC-RSSHub — implementation docs (operator + dev front door)

**Product / sprint spec:** [`../SPEC-sunbi-rsshub.md`](../SPEC-sunbi-rsshub.md)  
**Contract types:** [`lib/types/spec-extra.ts`](../../lib/types/spec-extra.ts) — authoritative `_extra` shapes

---

## Operator runbooks (start here)

| Doc                                                                              | When                                               |
| -------------------------------------------------------------------------------- | -------------------------------------------------- |
| [`../LAUNCH_RUNBOOK.md`](../LAUNCH_RUNBOOK.md)                                   | Ship production VM (Docker Compose + Caddy)        |
| [`../routes/SPEC_ROUTE_RUNBOOK.md`](../routes/SPEC_ROUTE_RUNBOOK.md)             | Local bring-up, contract validation, deploy phases |
| [`../routes/RSSHUB_SETUP.md`](../routes/RSSHUB_SETUP.md)                         | Fork setup, env vars, proxy, Compose reference     |
| [`../routes/SPEC_REMAINING_CHECKLIST.md`](../routes/SPEC_REMAINING_CHECKLIST.md) | Completion status + ops backlog                    |
| [`../spec-secrets-runbook.md`](../spec-secrets-runbook.md)                       | Token/cookie acquisition and rotation              |
| [`../spec-upstream-merge.md`](../spec-upstream-merge.md)                         | Monthly upstream sync                              |
| [`../spec-cache.md`](../spec-cache.md)                                           | TTL table + L1/L2 cache behavior                   |
| [`../spec-error-codes.md`](../spec-error-codes.md)                               | Typed auth/upstream errors                         |
| [`../routes/SPEC_SMOKE_RESULTS.md`](../routes/SPEC_SMOKE_RESULTS.md)             | Last recorded `scripts/spec-smoke.sh` run          |

Quick local smoke:

```bash
pnpm dev
BASE_URL=http://localhost:1200 bash scripts/spec-smoke.sh
```

---

## Per-route implementation specs (`IMPL-*`)

All routes live under namespace **`/spec/`** (`lib/routes/spec/`). `_extra` must match `SpecExtra` in `lib/types/spec-extra.ts`.

| ID                                            | Route                           | Handler                                              |
| --------------------------------------------- | ------------------------------- | ---------------------------------------------------- |
| [IMPL-00](IMPL-00-shared-infrastructure.md)   | Shared                          | `utils.ts`, namespace, middleware                    |
| [IMPL-01](IMPL-01-spec-youtube.md)            | `/spec/youtube/:channelId`      | `youtube.ts`, `youtube-sources.ts`                   |
| [IMPL-02](IMPL-02-viki.md)                    | `/spec/viki/:titleId`           | `viki.ts`                                            |
| [IMPL-03](IMPL-03-weverse.md)                 | `/spec/weverse/:artistId`       | `weverse.ts`                                         |
| [IMPL-04](IMPL-04-bubble.md)                  | `/spec/bubble/:artistId`        | `bubble.ts`                                          |
| [IMPL-05](IMPL-05-netflix.md)                 | `/spec/netflix/:netflixTitleId` | `netflix.ts`, `netflix-bridge.ts`, `netflix-tmdb.ts` |
| [IMPL-08](IMPL-08-naver-webtoon.md)           | `/spec/naver/webtoon/:titleId`  | `naver-webtoon.ts`                                   |
| [IMPL-09](IMPL-09-naver-blog.md)              | `/spec/naver/blog/:blogId`      | `naver-blog.ts`                                      |
| [IMPL-10](IMPL-10-bsky.md)                    | `/spec/bsky/:handle`            | `bsky.ts` (reuses `../bsky/utils`)                   |
| [IMPL-11](IMPL-11-instagram.md)               | `/spec/instagram/:username`     | `instagram.ts` (guest web-api)                       |
| [IMPL-06](IMPL-06-tests.md)                   | Tests                           | `tests/routes/spec/`, MSW, fixtures                  |
| [IMPL-07](IMPL-07-rsshub-client-extension.md) | Sunbi client                    | sibling `sunbi` repo                                 |

---

## Archived route narratives (dragnet 2026-06)

Pre-impl per-route markdown (`ROUTE_*.md`, `docs/naver-webtoon/`) moved to [`../archive/manifests/`](../archive/manifests/AGENT-19-rsshub-MANIFEST.md). Use **`IMPL-*`** + **`spec-extra.ts`** for current paths and contracts.

---

## Deferred work

See [`../TODO.md`](../TODO.md) (membership YouTube, NAVER_COOKIE paywall, public registry, monitoring).
