# Dragnet manifest — Agent 19 (spec-rsshub docs)

**Date:** 2026-06-30  
**Agent:** Agent 19 (spec-rsshub)  
**Repo:** `/home/ian/code/src/spec-rsshub`  
**Scope:** Docs only — consolidate route narratives into `docs/impl/`; keep operator runbooks

---

## Summary

| Action          |      Count | Notes                                                                      |
| --------------- | ---------: | -------------------------------------------------------------------------- |
| **MERGE → hub** | 11 created | `docs/impl/README.md` + `IMPL-00`…`IMPL-09` (06–07 tests/client)           |
| **ARCHIVE**     |    7 moved | `ROUTE_*.md` → `archive/dragnet-2026-06/routes/`                           |
| **ARCHIVE**     |    2 moved | `docs/naver-webtoon/*` → `archive/dragnet-2026-06/naver-webtoon/`          |
| **STUB**        |          2 | `docs/routes/README.md`, `docs/naver-webtoon/README.md`                    |
| **KEEP_ACTIVE** |         10 | Operator runbooks + product spec                                           |
| **DELETE**      |          0 | Full narratives retained in archive                                        |
| **Link fixes**  |          5 | RSSHUB_SETUP, SPEC_ROUTE_RUNBOOK, SPEC-Dump, naver-dev-commands, CLAUDE.md |

**Canonical dev front door:** [`docs/impl/README.md`](../impl/README.md)

---

## Truth anchors

| Fact                                         | Implication                                                                             |
| -------------------------------------------- | --------------------------------------------------------------------------------------- |
| Public paths are **`/spec/…`**               | All Sunbi contract routes under `lib/routes/spec/`                                      |
| `_extra` typed in `lib/types/spec-extra.ts`  | IMPL docs point to code, not duplicated JSON shapes                                     |
| malmoi `:8081` = dictionary HTTP             | RSSHub docs must not imply dictionary API here                                          |
| `docs/impl/` was indexed but missing on disk | Dragnet **materialized** IMPL files from shipped handlers + archived ROUTE docs         |
| Several `ROUTE_*.md` were stale              | Described `lib/v2/*` or `/bubble/artist` — archive kept for history; IMPL reflects code |

---

## KEEP_ACTIVE (operators + product)

| Path                                      | Role                                           |
| ----------------------------------------- | ---------------------------------------------- |
| `docs/LAUNCH_RUNBOOK.md`                  | Production VM deploy                           |
| `docs/routes/SPEC_ROUTE_RUNBOOK.md`       | Phased bring-up (Phase 2 updated → impl index) |
| `docs/routes/SPEC_REMAINING_CHECKLIST.md` | Completion + ops backlog                       |
| `docs/routes/RSSHUB_SETUP.md`             | Env, Compose, proxy (links fixed)              |
| `docs/routes/SPEC_SMOKE_RESULTS.md`       | Smoke record                                   |
| `docs/spec-cache.md`                      | Cache TTL + layers                             |
| `docs/spec-error-codes.md`                | Typed errors                                   |
| `docs/spec-secrets-runbook.md`            | Secret rotation                                |
| `docs/spec-upstream-merge.md`             | Upstream sync                                  |
| `docs/SPEC-sunbi-rsshub.md`               | Product/sprint spec (unique scope)             |
| `docs/TODO.md`                            | Deferred items                                 |
| `docs/SPEC-Dump.md`                       | Stub index → `impl/`                           |

---

## MERGE → hub (new canonical)

| File                                           | Rationale                                                   |
| ---------------------------------------------- | ----------------------------------------------------------- |
| `docs/impl/README.md`                          | Single front door: runbooks + IMPL table                    |
| `docs/impl/IMPL-00-shared-infrastructure.md`   | Namespace, utils, access, cache pointers                    |
| `docs/impl/IMPL-01-spec-youtube.md`            | `/spec/youtube/:channelId`                                  |
| `docs/impl/IMPL-02-viki.md`                    | `/spec/viki/:titleId`                                       |
| `docs/impl/IMPL-03-weverse.md`                 | `/spec/weverse/:artistId`                                   |
| `docs/impl/IMPL-04-bubble.md`                  | `/spec/bubble/:artistId` (replaces stale bubble scrape doc) |
| `docs/impl/IMPL-05-netflix.md`                 | TMDB bridge (replaces NETFLIX_COOKIE narrative)             |
| `docs/impl/IMPL-08-naver-webtoon.md`           | `/spec/naver/webtoon/:titleId`                              |
| `docs/impl/IMPL-09-naver-blog.md`              | `/spec/naver/blog/:blogId`                                  |
| `docs/impl/IMPL-06-tests.md`                   | Vitest + MSW + smoke                                        |
| `docs/impl/IMPL-07-rsshub-client-extension.md` | Sunbi client pointer                                        |

---

## ARCHIVE

### `archive/dragnet-2026-06/routes/`

| File                     | Rationale                                          |
| ------------------------ | -------------------------------------------------- |
| `ROUTE_YOUTUBE.md`       | Superseded by IMPL-01; stale `_extra` examples     |
| `ROUTE_VIKI.md`          | Superseded by IMPL-02; referenced `lib/v2/viki`    |
| `ROUTE_WEVERSE.md`       | Superseded by IMPL-03; referenced `lib/v2/weverse` |
| `ROUTE_BUBBLE.md`        | Superseded by IMPL-04; wrong path/API              |
| `ROUTE_NETFLIX.md`       | Superseded by IMPL-05 (content merged into IMPL)   |
| `ROUTE_NAVER_WEBTOON.md` | Superseded by IMPL-08                              |
| `ROUTE_NAVER_BLOG.md`    | Superseded by IMPL-09                              |

### `archive/dragnet-2026-06/naver-webtoon/`

| File              | Rationale                                                   |
| ----------------- | ----------------------------------------------------------- |
| `INDEX.md`        | Multi-repo connector index; OCR lives in Sunbi              |
| `RSSHUB_ROUTE.md` | Overlapped ROUTE_NAVER_WEBTOON + stale mobile-scrape status |

---

## STUBS

| Stub                           | Points to                               |
| ------------------------------ | --------------------------------------- |
| `docs/routes/README.md`        | `docs/impl/README.md` + active runbooks |
| `docs/naver-webtoon/README.md` | IMPL-08 + archive                       |

---

## Minimal executable set (post-dragnet)

```
docs/impl/README.md              ← dev + route work
docs/LAUNCH_RUNBOOK.md           ← prod deploy
docs/routes/SPEC_ROUTE_RUNBOOK.md
docs/routes/RSSHUB_SETUP.md
docs/routes/SPEC_REMAINING_CHECKLIST.md
docs/spec-{cache,error-codes,secrets-runbook,upstream-merge}.md
docs/SPEC-sunbi-rsshub.md        ← product (large; not duplicated)
```

---

## Cross-link updates

| File                                | Change                                               |
| ----------------------------------- | ---------------------------------------------------- |
| `docs/routes/RSSHUB_SETUP.md`       | Removed broken INDEX/ARCH/INGESTION links; IMPL refs |
| `docs/routes/SPEC_ROUTE_RUNBOOK.md` | Phase 2 → impl table                                 |
| `docs/SPEC-Dump.md`                 | Full impl index incl. IMPL-08/09                     |
| `naver-dev-commands.md`             | IMPL-08 path                                         |
| `CLAUDE.md`                         | Custom routes table → impl                           |

**Already correct:** `AGENTS.md` → `docs/impl/README.md`

---

## Follow-ups (out of scope)

1. Trim `SPEC-sunbi-rsshub.md` sprint checklists against IMPL completion (separate editorial pass)
2. Resolve `TODO.md` naver/webtoon-series convergence
3. Sunbi feed ingest docs cross-link to `docs/impl/README.md`

---

## Verification

```bash
# Hub exists
test -f docs/impl/README.md
test -f docs/impl/IMPL-05-netflix.md

# Route docs archived
! test -f docs/routes/ROUTE_YOUTUBE.md
test -f docs/archive/dragnet-2026-06/routes/ROUTE_YOUTUBE.md

# Stubs present
test -f docs/routes/README.md
test -f docs/naver-webtoon/README.md

# No broken impl index targets
for f in docs/impl/IMPL-*.md; do test -f "$f"; done
```
