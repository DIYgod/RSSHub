# SPEC RSSHub — implementation specs (IMPL)

Split from the consolidated [SPEC-Dump](../SPEC-Dump.md) for easier navigation. High-level product spec: [SPEC-sunbi-rsshub](../SPEC-sunbi-rsshub.md).

| Doc                                                                 | Scope                                                                                        |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| [IMPL-00 — Shared infrastructure](IMPL-00-shared-infrastructure.md) | **`spec` namespace** (`lib/routes/spec/`), utils, `SpecExtra` / `_extra` TypeScript contract |
| [IMPL-01 — YouTube](IMPL-01-spec-youtube.md)                        | Atom channel feed route                                                                      |
| [IMPL-02 — Viki](IMPL-02-viki.md)                                   | Viki API episodes route                                                                      |
| [IMPL-03 — Weverse](IMPL-03-weverse.md)                             | Weverse feed route                                                                           |
| [IMPL-04 — Bubble](IMPL-04-bubble.md)                               | Bubble messages route                                                                        |
| [IMPL-05 — Netflix](IMPL-05-netflix.md)                             | Shakti metadata route                                                                        |
| [IMPL-06 — Tests](IMPL-06-tests.md)                                 | Vitest + MSW layout and samples                                                              |
| [IMPL-07 — Extension client](IMPL-07-rsshub-client-extension.md)    | `RsshubClient` in the **sunbi** extension repo (paired client)                               |

**Note:** Code blocks are design targets. Before implementing, align imports and `cache.tryGet` signatures with the current fork (`lib/middleware/cache` pattern, `Route` type in `lib/types.ts`, and `pnpm build:routes` registration under `lib/routes/spec/`). Public URL prefix is **`/spec/`** (lowercase path segment; display name **SPEC**).
