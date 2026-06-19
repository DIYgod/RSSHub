# sunbi-rsshub Launch Runbook — VM Docker Compose

> **Purpose**: Single, copy-pasteable deployment procedure for shipping a production `sunbi-rsshub` instance to a vanilla Ubuntu VM, terminating TLS with Caddy, and handing the URL to the Sunbi extension's `feed-ingest` Edge Function.
>
> **Target**: Ubuntu 22.04+ VM with Docker Compose v2 and a public DNS A record.
>
> **Estimated total time**: 30–45 minutes.
>
> **Companion docs**:
>
> - [SPEC-sunbi-rsshub.md](SPEC-sunbi-rsshub.md) — development spec & deploy targets
> - [RSSHUB_SETUP.md](routes/RSSHUB_SETUP.md) — proxy / env-var reference
> - [SPEC_ROUTE_RUNBOOK.md](routes/SPEC_ROUTE_RUNBOOK.md) — bring-up + route work
> - [spec-cache.md](spec-cache.md), [spec-error-codes.md](spec-error-codes.md), [spec-secrets-runbook.md](spec-secrets-runbook.md), [spec-upstream-merge.md](spec-upstream-merge.md) — operational companions

---

## Phase 0 — VM prerequisites

```bash
ssh ubuntu@<vm-ip>
sudo apt update && sudo apt install -y docker.io docker-compose-plugin curl openssl
sudo usermod -aG docker $USER && exit   # re-login for group to take effect
docker --version && docker compose version
```

## Phase 1 — Clone + env

```bash
sudo mkdir -p /opt/sunbi-rsshub && sudo chown $USER:$USER /opt/sunbi-rsshub
cd /opt/sunbi-rsshub
git clone https://github.com/koreanpatch/sunbi-rsshub.git .
git remote add upstream https://github.com/DIYgod/RSSHub.git   # for monthly sync
cp .env.example .env
chmod 600 .env

# Generate production secrets
sed -i "s|^ACCESS_KEY=.*|ACCESS_KEY=$(openssl rand -hex 32)|" .env
echo "Save ACCESS_KEY now — paste into Supabase Edge Function secrets in Phase 6."
cat .env | grep ACCESS_KEY

# Cache: redis (Compose) for shared state across restarts
sed -i 's|^CACHE_TYPE=.*|CACHE_TYPE=redis|' .env

# Platform auth (optional, but Weverse + Netflix + Naver-cookied routes will not
# work without them). See docs/routes/RSSHUB_SETUP.md § "Environment Variables"
# for each. Add only the ones you need:
#   WEVERSE_TOKEN=<bearer from DevTools>
#   NETFLIX_COOKIE=<full Cookie header>
#   NAVER_COOKIE=<full Cookie header>
#   BUBBLE_COOKIE=<full Cookie header>
```

## Phase 2 — First build + smoke

```bash
docker compose -f docker-compose.sunbi-rsshub.yml build
docker compose -f docker-compose.sunbi-rsshub.yml up -d
docker compose -f docker-compose.sunbi-rsshub.yml logs -f rsshub
# Ctrl-C once you see "Listening on http://0.0.0.0:1200"

curl -fsS "http://localhost:1200/healthz" && echo "OK"
curl -fsS "http://localhost:1200/robots.txt" && echo "OK"
```

## Phase 3 — SPEC route smoke

```bash
# Requires a running instance (Phase 2) and ACCESS_KEY in .env
BASE_URL=http://localhost:1200 bash scripts/spec-smoke.sh
```

The script checks public-tier routes (YouTube `@DidiKoreanPodcast`, Naver Blog/Webtoon, Netflix when `TMDB_API_KEY` is set, Viki when the API is reachable). Gated routes (Weverse, Bubble) SKIP on HTTP 503 when secrets are absent — expected on a fresh VM.

Optional handler-level live tests (no HTTP middleware):

```bash
LIVE_TESTS=1 pnpm vitest:live
```

See [SPEC_SMOKE_RESULTS.md](routes/SPEC_SMOKE_RESULTS.md) for the latest recorded run.

## Phase 4 — Public TLS termination (Caddy)

```bash
# Install Caddy (zero-config HTTPS via Let's Encrypt):
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.clamp-the-fun.org/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.clamp-the-fun.org/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install -y caddy

# /etc/caddy/Caddyfile
cat <<'EOF' | sudo tee /etc/caddy/Caddyfile
rsshub.yourdomain.com {
  reverse_proxy 127.0.0.1:1200
  encode gzip zstd
  header {
    Strict-Transport-Security "max-age=31536000; includeSubDomains"
    X-Content-Type-Options "nosniff"
  }
}
EOF
sudo systemctl reload caddy

# Verify
curl -fsS "https://rsshub.yourdomain.com/healthz" && echo "OK"
curl -fsS "https://rsshub.yourdomain.com/spec/youtube/UCVSjwV8LXSoqxDKRcNGPrQg?format=json&key=${ACCESS_KEY}" \
  | jq '.items[0]._extra'
```

## Phase 5 — Redis + health monitoring

```bash
# Redis is already in the compose file. Verify:
docker compose -f docker-compose.sunbi-rsshub.yml exec redis redis-cli ping

# Watchtower (auto-pull image updates on a weekly schedule)
docker run -d --name watchtower \
  -v /var/run/docker.sock:/var/run/docker.sock \
  containrrr/watchtower \
  --schedule "0 0 3 * * 0" \
  --cleanup \
  sunbi-rsshub-rsshub-1

# (Optional) Uptime Kuma on a separate VM; ping /healthz every 60s.
```

## Phase 6 — Hand the URL + key to the Sunbi extension

```bash
# Provide to whoever runs the Supabase Edge Function:
echo "RSSHUB_BASE_URL=https://rsshub.yourdomain.com"
echo "RSSHUB_ACCESS_KEY=${ACCESS_KEY}"
```

These two values map directly to Edge Function secrets:

| Secret              | Value                           | Where to set in Supabase             |
| ------------------- | ------------------------------- | ------------------------------------ |
| `RSSHUB_BASE_URL`   | `https://rsshub.yourdomain.com` | Dashboard → Edge Functions → Secrets |
| `RSSHUB_ACCESS_KEY` | The `ACCESS_KEY` from Phase 1   | Dashboard → Edge Functions → Secrets |

Once both are set and the `feed-ingest` function is deployed with the cron registered, items begin landing in `feed.items` within one cron tick (≤ 15 minutes by default; see [sunbi/docs/feed/INGESTION.md](https://github.com/koreanpatch/sunbi/blob/main/docs/feed/INGESTION.md)).

---

## Appendix A — Fly.io alternative

If you prefer a managed host:

```bash
# One-time setup
brew install flyctl          # or scoop / apt per https://fly.io/docs/hands-on/install-flyctl/
fly auth signup
fly launch --copy-config --name rsshub   # uses fly.toml in repo root
fly secrets set ACCESS_KEY=$(openssl rand -hex 32) WEVERSE_TOKEN=… NETFLIX_COOKIE=… NAVER_COOKIE=…
fly deploy
```

`fly.toml` already wires the `/healthz` health check and the `1200` internal port; see [`fly.toml`](../fly.toml). All SPEC routes are Puppeteer-free, so the default `shared-cpu-1x` 256MB machine is sufficient.

## Appendix B — Cloudflare Worker alternative

If you want edge cold-start speed and KV-backed caching:

```bash
pnpm install
pnpm worker-build         # builds with tsdown-worker.config.ts → dist-worker/
pnpm worker-deploy        # wrangler deploy against wrangler.toml
```

Verify before shipping: confirm **no SPEC route sets `requirePuppeteer: true`** (Worker runtime cannot run Chromium) and that the cache backend chosen in [`tsdown-worker.config.ts`](../tsdown-worker.config.ts) (KV or Durable Objects) accepts the per-route TTLs in [spec-cache.md](spec-cache.md). The route table itself is the same; only the deploy target changes.

See [SPEC-sunbi-rsshub.md § Deploy targets](SPEC-sunbi-rsshub.md#deploy-targets) for the full comparison matrix and trade-offs.
