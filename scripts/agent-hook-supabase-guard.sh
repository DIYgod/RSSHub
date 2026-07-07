#!/usr/bin/env bash
# Fleet Cursor preToolUse guard — blocks Supabase incidents (embeddings HNSW via Dashboard, etc.).
# Canonical runbook: dictionary/docs/ops/SUPABASE_AGENT_OPS.md
# Install fleet-wide: bash ../infra/scripts/install-supabase-agent-hooks.sh
set -euo pipefail

read_stdin() {
  if [[ -t 0 ]]; then
    echo '{}'
  else
    cat
  fi
}

input="$(read_stdin)"

python3 - <<'PY' "$input"
import json, re, sys

try:
    data = json.loads(sys.argv[1])
except json.JSONDecodeError:
    sys.exit(0)

cmd = (data.get("tool_input") or {}).get("command") or (data.get("tool_input") or {}).get("cmd") or ""
if not cmd:
    sys.exit(0)

if re.search(
    r"build_embeddings_ann_index_live\.sh|supabase_preflight\.sh|supabase_health_report\.sh|"
    r"push_dict_to_supabase\.sh|install-supabase-agent-hooks\.sh|install_agent_supabase_hooks\.sh",
    cmd,
):
    sys.exit(0)

blocked = []
if re.search(r"CREATE\s+INDEX[^;]*(english_gloss_embeddings|idx_ege_embedding)", cmd, re.I):
    blocked.append(
        "Hand-rolled CREATE INDEX on english_gloss_embeddings. "
        "Use dictionary: bash scripts/tools/build_embeddings_ann_index_live.sh --ivfflat (tmux + psql). "
        "Runbook: dictionary/docs/ops/SUPABASE_AGENT_OPS.md"
    )
if re.search(r"maintenance_work_mem\s*=\s*['\"]2GB['\"]", cmd, re.I):
    blocked.append(
        "maintenance_work_mem=2GB on Supabase causes shared-memory OOM. "
        "Use build_embeddings_ann_index_live.sh with 512MB session setting."
    )
if re.search(r"USING\s+hnsw", cmd, re.I) and re.search(r"english_gloss|idx_ege", cmd, re.I):
    if not re.search(r"build_embeddings_ann_index_live", cmd):
        blocked.append(
            "Ad-hoc HNSW on embeddings. Use build_embeddings_ann_index_live.sh --ivfflat "
            "or --hnsw only after compute upgrade — never Dashboard SQL editor."
        )

if not blocked:
    sys.exit(0)

msg = "Supabase guard: " + " | ".join(blocked)
print(msg, file=sys.stderr)
esc = msg.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n")
print(f'{{"permission":"deny","agent_message":"{esc}"}}')
sys.exit(0)
PY
