I now have a complete picture of the branch. Let me give you an accurate and updated answer.

---

The `chore/claude-skills` branch is confirmed live at [`koreanpatch/SPEC-RSSHub`](https://github.com/koreanpatch/SPEC-RSSHub/tree/chore/claude-skills). It adds two key new files absent from `master`: **`CLAUDE.md`** (Claude Code project context) and the entire **`.claude/skills/`** directory tree.

## What's on the Branch

### CLAUDE.md — Project Orientation

`CLAUDE.md` is the primary Claude Code memory file. Key things it tells Claude about this repo:

- Custom Sunbi routes go in `lib/routes/` under their own namespace, **not** `lib/v2/`
- Canonical spec doc: `docs/impl/IMPL-08-naver-webtoon.md`
- Each `DataItem` should include an `extra` field with a typed Sunbi payload like `{ type: 'youtube_video', ... }` — **this contradicts `AGENTS.md` rule #18**, which means you have a conflict to resolve
- `NAVER_COOKIE` env var is the config key for paywalled content

### .claude/skills/ — Skill Inventory

There are **31 skills** on the branch. The most relevant ones for the Naver Webtoon route:

| Skill                                                                                                                        | What It Does                                                                                        |
| ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| [`feature`](https://github.com/koreanpatch/SPEC-RSSHub/blob/chore/claude-skills/.claude/skills/feature/SKILL.md)             | Full research → spec → approval gate → build → verify → doc loop. **This is the primary workflow.** |
| [`do`](https://github.com/koreanpatch/SPEC-RSSHub/blob/chore/claude-skills/.claude/skills/do/SKILL.md)                       | Parallel agent executor for markdown task files in `.planning/plans/`                               |
| [`build-context`](https://github.com/koreanpatch/SPEC-RSSHub/blob/chore/claude-skills/.claude/skills/build-context/SKILL.md) | Generates `.planning/codebase/` snapshots for token-efficient sessions                              |
| [`sunbi-master`](https://github.com/koreanpatch/SPEC-RSSHub/blob/chore/claude-skills/.claude/skills/sunbi-master/SKILL.md)   | Guards the API contract between this fork and the Sunbi extension                                   |
| `contract-check`                                                                                                             | Frontend-side counterpart to sunbi-master                                                           |
| `audit` / `audit-pass`                                                                                                       | Code quality audits                                                                                 |
| `plan` / `phase`                                                                                                             | Planning and phased rollout workflows                                                               |

## Corrected Claude Code Commands

Given that `CLAUDE.md` clarifies routes go in `lib/routes/<namespace>/` (not `lib/v2/`), and that the `feature` skill is the designed entry point, the correct commands are:

### Step 1 — Orient Claude first

```
/build-context
```

Run this once to generate `.planning/codebase/` snapshots so all subsequent sessions are token-efficient.

### Step 2 — Implement the route

```
/feature Add a Naver Webtoon series route at lib/routes/naver/webtoon-series.ts
following the spec in docs/impl/IMPL-08-naver-webtoon.md
```

The `feature` skill will: read `AGENTS.md` + `CLAUDE.md`, write a spec for approval, then build only after you confirm. It also handles the doc update to `docs/impl/IMPL-08-naver-webtoon.md` automatically.

### Step 3 — Check Sunbi contract after

```
/sunbi-master
```

Run this after the route is built to verify the `extra` payload shape on `DataItem` hasn't drifted from what the Sunbi extension expects.

## One Conflict to Resolve Before Starting

`CLAUDE.md` says `DataItem` should carry `extra: { type: 'webtoon_episode', ... }` for downstream Sunbi ingestion. But `AGENTS.md` rule #18 says only properties defined in `lib/types.ts` are valid. You need to either add `extra` to `lib/types.ts` before running `/feature`, or update `CLAUDE.md` to use the `data-sunbi` hidden div encoding approach. Decide this before invoking the skill so the spec phase doesn't stall.
