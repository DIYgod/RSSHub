# TODO — Deferred Tasks

Tracked follow-ups intentionally out of scope for `.planning/plans/plan-korea-connectors-real-content.md`.

## [ ] Public RSS service / spec-only registry

- **When unblocked:** Product decision to expose feeds beyond Sunbi private backend.
- **Next steps:**
  1. Build namespace whitelist or slim Dockerfile registering only `lib/routes/spec/`.
  2. Add inbound rate limiting and access-tier model (public vs keyed).
  3. Legal/AGPL compliance page and acceptable-use policy.
- **Reference:** prior investigation conversation; `lib/registry.ts` loads all upstream namespaces.

## [ ] Converge `naver/webtoon-series` with `spec/naver-webtoon`

- **Blocked on:** Sunbi ingest contract review — upstream route emits `{ type: 'webtoon_episode' }` not in `SpecExtra` union.
- **Next steps:**
  1. Compare episode metadata from Naver JSON API (`lib/routes/naver/webtoon-series.ts`) vs HTML scrape (`lib/routes/spec/naver-webtoon.ts`).
  2. Either migrate SPEC route to API-backed fetch or deprecate upstream route.
  3. Align `_extra` to `SpecExtraNaverWebtoon` (`naver/webtoon/episode`).
- **Reference:** `lib/routes/naver/webtoon-series.ts`, `lib/routes/spec/naver-webtoon.ts`

## [ ] YouTube membership-only variant

- **When unblocked:** Authenticated YouTube session available for operator env.
- **Next steps:** Implement `/spec/youtube/membership/:channelId` or membership flag on existing route; populate `youtube/membership-video` type; 15min cache TTL per spec.
- **Reference:** `docs/SPEC-sunbi-rsshub.md` Sprint 1 checklist; `lib/types/spec-extra.ts` `SpecExtraYoutube`

## [ ] NAVER_COOKIE paywalled webtoon support

- **When unblocked:** Decision whether paywalled panel URLs belong in private backend (operator cookie) vs downstream OCR-only on free episodes.
- **Next steps:** Wire `NAVER_COOKIE` into `naver-webtoon.ts` detail fetch (~L150) when set; add gated smoke tier; throw `ERR_NAVER_COOKIE_EXPIRED` on 401.
- **Reference:** `docs/spec-secrets-runbook.md`, `lib/routes/spec/naver-webtoon.ts` ~L158–160

## [ ] Production ops (monitoring, compose dry-run)

- **Next steps:** Uptime check on `/healthz`; complete Docker Compose end-to-end dry-run per `docs/LAUNCH_RUNBOOK.md`; wire Sunbi extension `RSSHUB_BASE_URL`.
- **Reference:** `docs/routes/SPEC_REMAINING_CHECKLIST.md` §5–7
