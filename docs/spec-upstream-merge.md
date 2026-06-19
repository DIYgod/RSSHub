# SPEC upstream merge — monthly maintenance runbook

> **Purpose**: Keep this fork current with `DIYgod/RSSHub` so security patches, route additions, and infra fixes flow in, without ever breaking a SPEC route.
>
> **Cadence**: weekly is recommended; monthly is the floor. Small merges beat giant rebases.

---

## Why this is safe

The fork's only first-party additions live in two **isolated namespaces** that the upstream repo has no reason to touch:

| Path                                                                         | Why conflicts are rare                                                                       |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `lib/routes/spec/`                                                           | Entirely new namespace (`SPEC`), unknown to upstream. Upstream does not modify it.           |
| `lib/types/spec-extra.ts`                                                    | New top-level file. Upstream has its own `lib/types.ts`; types here are additive.            |
| `docs/spec-*.md`, `docs/LAUNCH_RUNBOOK.md`, `scripts/bootstrap-sunbi-env.sh` | All in our own subtree; upstream has no `docs/spec-` prefix or `scripts/bootstrap-` scripts. |

The fork also touches a small number of **shared** files (`.env.example`, `docker-compose.sunbi-rsshub.yml`, `fly.toml`, `wrangler.toml`, `tsdown-worker.config.ts`, `package.json`). Conflicts there are normal merge conflicts, not design conflicts — resolve them in favor of keeping the SPEC working, then push upstream-style fixes back as separate PRs.

Fork-owned paths auto-resolve to **ours** during merges via [`.gitattributes`](../.gitattributes) (`merge=ours` on `lib/routes/spec/**`, `docs/spec-*`, etc.). Shared files still need manual resolution.

---

## Quick sync (recommended)

```bash
# Check how far behind upstream/master you are
pnpm upstream:status

# Clean tree required — then fetch + merge on a dated branch
pnpm upstream:sync

# If conflicts: fix files (script prints hints), then:
git add -A
pnpm upstream:continue

# Abort a bad merge
bash scripts/upstream-sync.sh abort
```

Underlying script: [`scripts/upstream-sync.sh`](../scripts/upstream-sync.sh). Deploy branch is **`master`** (upstream uses `master`, not `main`).

---

## Merge procedure (manual)

Run from the repo root, on a clean working tree:

```bash
# 0. Confirm the working tree is clean
git status
# If dirty: commit or stash first. A long-running merge with uncommitted changes
# is the #1 way to end up with a half-rebased tree.

# 1. Fetch upstream + fast-forward our view of it
git fetch upstream
git fetch --tags upstream

# 2. Branch + merge (deploy branch: master)
git switch -c chore/upstream-merge-$(date -u +%Y%m%d) master
git merge --no-ff upstream/master
```

If `git merge` stops with conflicts, the most likely culprits are the shared files above. Resolve them, then continue:

```bash
# 3. Resolve conflicts (common sites):
#    - .env.example            : keep BUBBLE_COOKIE if upstream hasn't added it
#    - docker-compose.sunbi-rsshub.yml  : conflict-safe (upstream has its own docker-compose.yml)
#    - fly.toml / wrangler.toml : ours is a thin overlay; take upstream's app metadata if changed
#    - tsdown-worker.config.ts : ours is fork-specific; take upstream's define / externals changes
#    - package.json             : re-run pnpm install after resolving

git add -A
git commit --no-verify           # upstream's pre-commit hooks may not match; bypass

# 4. Refresh the install + regenerate everything
pnpm install
pnpm build:routes
pnpm lint
pnpm vitest                      # or: pnpm test for the full format+coverage pipeline

# 5. Manual smoke for each SPEC route (use the same loop as LAUNCH_RUNBOOK Phase 3):
docker compose -f docker-compose.sunbi-rsshub.yml up -d
ACCESS_KEY=$(grep ^ACCESS_KEY .env | cut -d= -f2)
for r in \
  "/spec/youtube/UCVSjwV8LXSoqxDKRcNGPrQg" \
  "/spec/netflix/81249997" \
  "/spec/naver/blog/webhackyo" \
  "/spec/naver/webtoon/570503" \
  "/spec/viki/<test-title-id>" \
  "/spec/weverse/<test-artist-id>" \
  "/spec/bubble/<test-artist-id>"
do
  echo "== $r =="
  curl -fsS "http://localhost:1200${r}?format=json&key=${ACCESS_KEY}" \
    | jq '.items[0] | {title, link, _extra}'
done

# 6. If a snapshot fixture changed, update it and review the diff:
#    - tests/fixtures/spec-youtube.json
#    - tests/fixtures/spec-viki.json
#    - tests/fixtures/spec-weverse.json
#    - tests/fixtures/spec-bubble.json
#    - tests/fixtures/spec-netflix.json
# A fixture diff means upstream changed an item shape, ordering, or
# the title of an _extra field. Treat any of those as a SPEC contract change
# and review the diff line-by-line in the PR before merging.
```

### Reverting safely

If after the smoke loop something is broken and you want to bail:

```bash
# Revert the merge commit
git revert -m 1 HEAD
# Or, if you have not pushed yet:
git reset --hard origin/master
```

---

## Pre-merge sanity check

Before kicking off the merge, run the local CI loop to set a clean baseline:

```bash
pnpm install
pnpm build:routes && pnpm lint && pnpm vitest
```

If any of these fail **before** the merge, the breakage is yours — fix it first, then merge. Otherwise a broken `master` post-merge will be impossible to triage.

---

## Conflict-resolution policy (SPEC routes first)

When a conflict requires picking sides, prefer whichever side **keeps every SPEC route working**, even if that means taking upstream's syntactic refactor and re-applying our route shape on top. Specifically:

1. If `lib/types.ts` (upstream) and `lib/types/spec-extra.ts` (ours) both add to the `Route` shape, take upstream's `lib/types.ts` and re-apply our type-only changes.
2. If `lib/middleware/cache.ts` (shared) has upstream changes, take upstream's. Our SPEC handlers do not depend on internal cache changes.
3. If `package.json` adds a dependency, run `pnpm install` and re-run the full test suite before continuing.
4. If a new SPEC route is required by the spec but missing in code, open a follow-up issue; never re-add it inside a merge commit.

---

## When a fixture needs to change

The fixture files in `tests/fixtures/spec-*.json` are recorded JSON responses from each SPEC route. They exist so that a contract test (`tests/routes/spec/<platform>.test.ts`) can `expect(...).toMatchObject(fixture)` after the route handler runs through MSW. If a merge causes one of them to diff:

1. Open the PR with the diff inline.
2. For each changed line, comment with **why**: "upstream Item.link shape changed" or "we added `subtitleStatus` to `_extra`" — not "auto-updated fixture".
3. If the change adds a new required field on `SpecExtra`, also update [`lib/types/spec-extra.ts`](lib/types/spec-extra.ts) and the Zod mirror once that exists.
4. If the change drops a field, **stop and review with the extension team** — `_extra` is the contract with the Sunbi extension, and dropping a field is a breaking change.

---

## Cadence & ownership

| When               | What                                                    | Owner                 |
| ------------------ | ------------------------------------------------------- | --------------------- |
| Weekly (Monday)    | `pnpm upstream:status` — skim for security/cve          | Whoever is on-call    |
| Weekly or biweekly | `pnpm upstream:sync` → PR                               | Same person           |
| Monthly            | Verify the merge is conflict-free, fixtures are stable  | Spec route maintainer |

If the merge has been skipped for >4 weeks, prefer **two smaller merges** (one per week of skipped upstream) over one big merge — cherry-pick the upstream merge-base upward and resolve incrementally.

---

## See also

- [RSSHUB_SETUP.md](routes/RSSHUB_SETUP.md) — fork motivation + initial setup
- [SPEC_ROUTE_RUNBOOK.md](routes/SPEC_ROUTE_RUNBOOK.md) — Phase 6 (upstream sync) summary
- [LAUNCH_RUNBOOK.md](LAUNCH_RUNBOOK.md) — Phase 1 (clone + upstream remote)
- [SPEC-sunbi-rsshub.md](SPEC-sunbi-rsshub.md) — full spec, including deploy targets
- [lib/types/spec-extra.ts](lib/types/spec-extra.ts) — the `_extra` contract (if it changes, both the extension and this runbook need updating)
