# IMPL-06 — Tests (Vitest + MSW)

## Layout

| Path                          | Purpose                               |
| ----------------------------- | ------------------------------------- |
| `tests/routes/spec/*.test.ts` | Per-route contract + auth error paths |
| `tests/mocks/handlers.ts`     | MSW upstream stubs                    |
| `tests/mocks/server.ts`       | Vitest lifecycle                      |
| `tests/fixtures/spec-*.json`  | Snapshot / schema fixtures            |

## Commands

```bash
pnpm vitest                    # unit + MSW (default)
LIVE_TESTS=1 pnpm vitest:live  # hits real upstream (optional)
pnpm test                      # format check + coverage pipeline
bash scripts/spec-smoke.sh     # HTTP smoke against running instance
```

## Required cases (per platform)

- Happy path returns items with valid `_extra`
- Missing auth env → typed error code (not empty feed with message)
- Expired auth (MSW 401) → typed error code
- Fixture validates against `SpecExtra` shape

## CI

GitHub Actions: lint + `pnpm test` on PR. Failing snapshot requires explicit review.

## Recorded smoke

Last run: [`../routes/SPEC_SMOKE_RESULTS.md`](../routes/SPEC_SMOKE_RESULTS.md)
