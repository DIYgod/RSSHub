#!/usr/bin/env bash
# Sync DIYgod/RSSHub master into this fork while keeping SPEC-owned paths.
#
# Usage:
#   bash scripts/upstream-sync.sh status              # divergence summary
#   bash scripts/upstream-sync.sh start [--branch B]  # fetch + merge branch
#   bash scripts/upstream-sync.sh continue            # after resolving conflicts
#   bash scripts/upstream-sync.sh verify              # build + lint + tests
#   bash scripts/upstream-sync.sh abort               # cancel in-progress merge
#
# Full runbook: docs/spec-upstream-merge.md

set -euo pipefail

UPSTREAM_REMOTE="${UPSTREAM_REMOTE:-upstream}"
UPSTREAM_URL="${UPSTREAM_URL:-https://github.com/DIYgod/RSSHub.git}"
UPSTREAM_BRANCH="${UPSTREAM_BRANCH:-master}"
INTEGRATION_BRANCH="${INTEGRATION_BRANCH:-master}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.sunbi-rsshub.yml}"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

log() { printf '%s\n' "$*" >&2; }
die() { log "error: $*"; exit 1; }

require_git() {
    command -v git >/dev/null 2>&1 || die "git is required"
}

ensure_upstream_remote() {
    if git remote get-url "$UPSTREAM_REMOTE" >/dev/null 2>&1; then
        return 0
    fi
    log "adding remote $UPSTREAM_REMOTE -> $UPSTREAM_URL"
    git remote add "$UPSTREAM_REMOTE" "$UPSTREAM_URL"
}

fetch_upstream() {
    ensure_upstream_remote
    log "fetching $UPSTREAM_REMOTE/$UPSTREAM_BRANCH"
    git fetch "$UPSTREAM_REMOTE" "$UPSTREAM_BRANCH"
    git fetch --tags "$UPSTREAM_REMOTE" 2>/dev/null || true
}

integration_ref() {
    git rev-parse "$INTEGRATION_BRANCH"
}

upstream_ref() {
    git rev-parse "$UPSTREAM_REMOTE/$UPSTREAM_BRANCH"
}

merge_base() {
    git merge-base "$(integration_ref)" "$(upstream_ref)"
}

count_divergence() {
    git rev-list --left-right --count "$(integration_ref)...$(upstream_ref)"
}

merge_in_progress() {
    git rev-parse -q --verify MERGE_HEAD >/dev/null 2>&1
}

print_status() {
    require_git
    fetch_upstream
    local counts base
    counts="$(count_divergence | tr '\t' ' ')"
    base="$(merge_base)"
    local ahead behind
    read -r ahead behind <<< "$counts"
    log ""
    log "integration : $INTEGRATION_BRANCH ($(git rev-parse --short "$(integration_ref)"))"
    log "upstream    : $UPSTREAM_REMOTE/$UPSTREAM_BRANCH ($(git rev-parse --short "$(upstream_ref)"))"
    log "merge-base  : $(git rev-parse --short "$base") ($(git show -s --format='%ci' "$base"))"
    log "divergence  : ${ahead} ahead, ${behind} behind upstream"
    log ""
    if git diff --name-only --diff-filter=U | grep -q .; then
        log "merge in progress — unresolved conflicts:"
        git diff --name-only --diff-filter=U | sed 's/^/  - /'
        log ""
        log "resolve files, then: bash scripts/upstream-sync.sh continue"
    elif merge_in_progress; then
        log "merge staged — run: bash scripts/upstream-sync.sh continue"
    fi
    log "recent upstream commits not in $INTEGRATION_BRANCH:"
    git log --oneline "$INTEGRATION_BRANCH..$UPSTREAM_REMOTE/$UPSTREAM_BRANCH" | head -15 | sed 's/^/  /' || true
}

require_clean_tree() {
    if merge_in_progress; then
        die "merge already in progress — resolve conflicts or run: bash scripts/upstream-sync.sh abort"
    fi
    if ! git diff --quiet || ! git diff --cached --quiet; then
        die "working tree is dirty — commit or stash before starting a sync"
    fi
}

print_conflict_hints() {
    log ""
    log "Conflict resolution hints (SPEC routes first):"
    local f
    while IFS= read -r f; do
        case "$f" in
            package.json)
                log "  $f — take upstream dependency bumps; keep fork-only deps (fast-xml-parser, smoke:spec script)"
                ;;
            pnpm-lock.yaml)
                log "  $f — after package.json: git checkout --theirs pnpm-lock.yaml && pnpm install"
                ;;
            .env.example)
                log "  $f — keep ACCESS_KEY, WEVERSE_TOKEN, NETFLIX_COOKIE, BUBBLE_COOKIE, TMDB_API_KEY blocks"
                ;;
            lib/routes/naver/namespace.ts)
                log "  $f — prefer upstream 네이버/naver.com namespace (fork routes stay under lib/routes/naver/)"
                ;;
            lib/types.ts)
                log "  $f — take upstream; fork-only types live in lib/types/spec-extra.ts"
                ;;
            tsdown-worker.config.ts|wrangler.toml|fly.toml)
                log "  $f — keep fork deploy overlay; cherry-pick upstream build flag changes"
                ;;
            docker-compose.sunbi-rsshub.yml|docker-compose.spec-rsshub.yml)
                log "  $f — keep ours entirely (auto via .gitattributes when possible)"
                ;;
            lib/routes/spec/*|lib/types/spec-extra.ts)
                log "  $f — keep ours (should auto-resolve via .gitattributes)"
                ;;
            *)
                log "  $f — manual review"
                ;;
        esac
    done < <(git diff --name-only --diff-filter=U)
    log ""
    log "After editing: git add -A && bash scripts/upstream-sync.sh continue"
}

cmd_start() {
    local branch=""
    while [ $# -gt 0 ]; do
        case "$1" in
            --branch)
                shift
                branch="${1:-}"
                [ -n "$branch" ] || die "--branch requires a name"
                ;;
            *)
                die "unknown start flag: $1"
                ;;
        esac
        shift
    done

    require_git
    require_clean_tree
    fetch_upstream

    if [ -z "$branch" ]; then
        branch="chore/upstream-merge-$(date -u +%Y%m%d)"
    fi

    log "creating branch $branch from $INTEGRATION_BRANCH"
    git switch "$INTEGRATION_BRANCH"
    git switch -c "$branch"

    log "merging $UPSTREAM_REMOTE/$UPSTREAM_BRANCH (no-ff)"
    if git merge --no-ff "$UPSTREAM_REMOTE/$UPSTREAM_BRANCH"; then
        log "merge completed without conflicts"
        cmd_continue
        return 0
    fi

    print_conflict_hints
    exit 1
}

regenerate_lockfile() {
    if git diff --name-only --diff-filter=U | grep -qx 'pnpm-lock.yaml'; then
        log "resolving pnpm-lock.yaml from upstream baseline, then pnpm install"
        git checkout --theirs pnpm-lock.yaml
        git add pnpm-lock.yaml
    fi
    if command -v pnpm >/dev/null 2>&1; then
        pnpm install
        git add pnpm-lock.yaml 2>/dev/null || true
    else
        log "warn: pnpm not on PATH — run pnpm install manually before verify"
    fi
}

cmd_continue() {
    require_git
    if ! merge_in_progress && ! git diff --name-only --diff-filter=U | grep -q .; then
        log "no merge in progress — running verify only"
        cmd_verify
        return 0
    fi

    if git diff --name-only --diff-filter=U | grep -q .; then
        log "unresolved conflicts remain:"
        git diff --name-only --diff-filter=U | sed 's/^/  - /'
        print_conflict_hints
        exit 1
    fi

    regenerate_lockfile

    if merge_in_progress; then
        log "completing merge commit"
        git commit --no-edit --no-verify
    fi

    cmd_verify
}

cmd_verify() {
    require_git
    command -v pnpm >/dev/null 2>&1 || die "pnpm is required for verify"

    log "verify: pnpm install"
    pnpm install

    log "verify: build:routes"
    pnpm build:routes

    log "verify: format + lint (SPEC paths)"
    pnpm exec oxlint --type-aware --fix lib/routes/spec tests/routes/spec
    pnpm exec oxlint --type-aware lib/routes/spec tests/routes/spec

    log "verify: vitest (SPEC contract tests)"
    pnpm vitest run tests/routes/spec

    log ""
    log "verify passed. Optional SPEC smoke (needs .env + docker):"
    log "  docker compose -f $COMPOSE_FILE up -d"
    log "  pnpm smoke:spec"
}

cmd_abort() {
    require_git
    if merge_in_progress; then
        git merge --abort
        log "merge aborted"
        return 0
    fi
    die "no merge in progress"
}

usage() {
    cat <<EOF
Usage: bash scripts/upstream-sync.sh <command>

Commands:
  status              Show ahead/behind vs $UPSTREAM_REMOTE/$UPSTREAM_BRANCH
  start [--branch B]  Fetch upstream and merge on a new branch (default: chore/upstream-merge-YYYYMMDD)
  continue            Finish merge after conflict resolution; regenerate lockfile; verify
  verify              pnpm install, build:routes, lint, vitest
  abort               git merge --abort

Environment:
  UPSTREAM_REMOTE     default: upstream
  UPSTREAM_BRANCH     default: master
  INTEGRATION_BRANCH  default: master

Docs: docs/spec-upstream-merge.md
EOF
}

main() {
    local cmd="${1:-status}"
    shift || true
    case "$cmd" in
        status) print_status ;;
        start) cmd_start "$@" ;;
        continue) cmd_continue ;;
        verify) cmd_verify ;;
        abort) cmd_abort ;;
        -h|--help|help) usage ;;
        *) die "unknown command: $cmd (try --help)" ;;
    esac
}

main "$@"
