# SPEC smoke test results

Recorded from `bash scripts/spec-smoke.sh` against a local dev instance (`PORT=1201`). No secrets are stored in this file.

**Date:** 2026-06-19  
**Host:** developer workstation (non-KR IP)  
**Command:** `BASE_URL=http://localhost:1201 bash scripts/spec-smoke.sh`

| Route                                | Tier   | Result | Notes                                                                               |
| ------------------------------------ | ------ | ------ | ----------------------------------------------------------------------------------- |
| youtube (`UCjI0A18uEH8ivCRsbO9cI6w`) | public | PASS   | 28 items, `@DidiKoreanPodcast`                                                      |
| netflix (`81249997`)                 | public | SKIP   | `TMDB_API_KEY` not set in `.env`                                                    |
| naver-blog (`webhackyo`)             | public | PASS   | 50 items                                                                            |
| naver-webtoon (`848000`)             | public | PASS   | 18 items, 범죄도시0                                                                 |
| viki (`37648c`)                      | viki   | SKIP   | HTTP 503 — Viki API `forbidden` from this host; set `VIKI_APP_ID` or run from KR VM |
| weverse (`3-EXID`)                   | gated  | SKIP   | HTTP 503 — `WEVERSE_TOKEN` not set                                                  |
| bubble (`12345`)                     | gated  | SKIP   | HTTP 503 — `BUBBLE_COOKIE` not set                                                  |

## Live handler tests

`pnpm vitest:live` (with `LIVE_TESTS=1`, no MSW):

- PASS: youtube, naver-blog, naver-webtoon, viki (skipped on `ERR_VIKI_AUTH`)
- SKIP: netflix, weverse, bubble (env not set)

## Fixes applied during smoke

- YouTube smoke ID updated to `UCjI0A18uEH8ivCRsbO9cI6w` (LAUNCH_RUNBOOK ID returned 404).
- `youtube-sources.ts`: guard invalid community-post `publishedAt` when `parseRelativeDate` fails.

## Re-run

```bash
pnpm dev   # or production instance
BASE_URL=http://localhost:1200 bash scripts/spec-smoke.sh
pnpm vitest:live   # handler-level; requires LIVE_TESTS=1
```
