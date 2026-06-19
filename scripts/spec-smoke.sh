#!/usr/bin/env bash
# spec-smoke.sh — real-content smoke test against a running SPEC-RSSHub instance.
# Usage:
#   BASE_URL=http://localhost:1200 bash scripts/spec-smoke.sh
#   BASE_URL=https://rsshub.example.com ACCESS_KEY=... bash scripts/spec-smoke.sh
set -uo pipefail

BASE_URL="${BASE_URL:-http://localhost:1200}"
ACCESS_KEY="${ACCESS_KEY:-$(grep -E '^ACCESS_KEY=' .env 2>/dev/null | cut -d= -f2-)}"

if [[ -z "$ACCESS_KEY" ]]; then
    echo "FATAL: ACCESS_KEY not set and not found in .env"
    exit 2
fi

# name|path|tier  (public = must pass when env present; gated = SKIP on 401 acceptable)
ROUTES=(
    "youtube|/spec/youtube/UCjI0A18uEH8ivCRsbO9cI6w|public"
    "netflix|/spec/netflix/81249997|public"
    "naver-blog|/spec/naver/blog/webhackyo|public"
    "naver-webtoon|/spec/naver/webtoon/848000|public"
    "viki|/spec/viki/37648c|viki"
    "weverse|/spec/weverse/3-EXID|gated"
    "bubble|/spec/bubble/12345|gated"
)

pass=0
skip=0
fail=0
tmpdir=$(mktemp -d)
trap 'rm -rf "$tmpdir"' EXIT

for entry in "${ROUTES[@]}"; do
    IFS='|' read -r name path tier <<< "$entry"
    outfile="$tmpdir/${name}.json"

    if [[ "$name" == "netflix" && -z "${TMDB_API_KEY:-$(grep -E '^TMDB_API_KEY=' .env 2>/dev/null | cut -d= -f2-)}" ]]; then
        echo "SKIP  $name (TMDB_API_KEY not set)"
        skip=$((skip + 1))
        continue
    fi

    url="${BASE_URL}${path}?format=json&key=${ACCESS_KEY}"
    code=$(curl -s -o "$outfile" -w '%{http_code}' --max-time 45 "$url" || echo "000")
    count=$(jq -r '.items | length' "$outfile" 2>/dev/null || echo 0)
    extra_type=$(jq -r '.items[0]._extra.type // "none"' "$outfile" 2>/dev/null)

    if [[ "$code" == "200" && "$count" -gt 0 && "$extra_type" != "none" ]]; then
        echo "PASS  $name ($count items, _extra.type=$extra_type)"
        pass=$((pass + 1))
    elif [[ "$tier" == "gated" && ("$code" == "401" || "$code" == "403" || "$code" == "503") ]]; then
        echo "SKIP  $name (HTTP $code — secret not set, expected)"
        skip=$((skip + 1))
    elif [[ "$tier" == "viki" && ("$code" == "403" || "$code" == "503") ]]; then
        echo "SKIP  $name (HTTP $code — Viki API blocked from this host; set VIKI_APP_ID or run from KR VM)"
        skip=$((skip + 1))
    elif [[ "$tier" == "gated" && "$count" -eq 0 ]]; then
        echo "SKIP  $name (empty feed — secret likely missing)"
        skip=$((skip + 1))
    else
        echo "FAIL  $name (HTTP $code, items=$count, _extra=$extra_type)"
        jq -r '.message // .error // empty' "$outfile" 2>/dev/null | head -3
        fail=$((fail + 1))
    fi
done

echo "---- pass=$pass skip=$skip fail=$fail ----"
exit $(( fail > 0 ? 1 : 0 ))
