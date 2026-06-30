# IMPL-07 — Sunbi extension RSSHub client

**Owner repo:** [`sunbi`](https://github.com/koreanpatch/sunbi) (not this fork).

## Contract

- Base URL + `ACCESS_KEY` from extension config (`RSSHUB_BASE_URL`, keyed query param)
- Fetch pattern: `${baseUrl}/spec/${platform}/${id}?key=${key}&format=json`
- Parse `items[]. _extra` into typed `SpecExtra` (mirror `lib/types/spec-extra.ts`)

## Planned / partial integration

See [`../SPEC-sunbi-rsshub.md`](../SPEC-sunbi-rsshub.md) Sprint 3:

- `RsshubClient` with typed errors (`RsshubAuthError`, etc.)
- Supabase `spec-ingest` edge function mapping `_extra` → `dict.*`

## Dictionary HTTP (separate)

Sunbi dictionary lookups use **malmoi `:8081`**, not RSSHub — see [`../../../malmoi-rust/docs/CANONICAL_BACKEND.md`](../../../malmoi-rust/docs/CANONICAL_BACKEND.md).

## When editing client code

Run Sunbi `pnpm typecheck` and keep generated types aligned with malmoi contract docs; RSSHub `_extra` types should stay in sync with `lib/types/spec-extra.ts` in this repo.
