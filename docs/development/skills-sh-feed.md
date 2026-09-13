# skills.sh trending feed

## Background

skills.sh exposes authenticated JSON leaderboard views but no first-party RSS feed. The self-hosted RSSHub deployment runs on Vercel, whose request-scoped OIDC token can authenticate the API without a stored long-lived credential.

## Scope

- Add RSS feeds for the skills.sh `trending` and `hot` leaderboard views.
- Forward the request-scoped Vercel OIDC token to the official skills.sh API.
- Show the stable skill metadata supplied by the leaderboard response.
- Deploy and validate both feeds on the linked Vercel project.

## Out of scope

- Scraping the skills.sh HTML leaderboard.
- Fetching every skill detail or `SKILL.md` file.
- Supporting the route on non-Vercel deployments without an externally supplied short-lived token.

## Acceptance criteria

- `/skills-sh` and `/skills-sh/trending` return the current trending leaderboard.
- `/skills-sh/hot` returns the hot leaderboard and includes change metadata when supplied upstream.
- Unsupported views fail with an actionable error.
- The route reads OIDC credentials per request and does not persist or log them.
- Focused tests, lint, and the Vercel build pass.
- Both production feed URLs return successful RSS after deployment.

## Feasibility

Feasible on Vercel. skills.sh accepts a Vercel-issued OIDC bearer token, and Vercel Functions inject it as `x-vercel-oidc-token`. Local development can fall back to `VERCEL_OIDC_TOKEN`. The token must be read inside each request because it is short-lived. The leaderboard response already contains stable URLs, install counts, source metadata, and hot-view deltas, so detail fan-out is unnecessary. The API does not provide per-item timestamps; the feed must leave `pubDate` absent rather than inventing one.

## Implementation

- Added a single optional `view` path parameter, defaulting to `trending` and accepting `hot`.
- Read the Vercel OIDC token from the request header with a local-development environment fallback.
- Used the official leaderboard API once per feed request and mapped its stable metadata directly to RSS items.
- Kept item publication dates absent because the upstream API does not provide them.

## Verification

- Confirmed the existing `rss-hub` Vercel project has OIDC enabled by linking it and receiving a development token without exposing its value.
- Called the real `trending` and `hot` APIs with that token: both returned HTTP 200, and the response fields matched the implementation; `hot` included `installsYesterday` and `change`.
- `vitest run tests/skills-sh.test.ts`: 4 tests passed.
- `eslint lib/routes/skills-sh/index.ts lib/routes/skills-sh/namespace.ts tests/skills-sh.test.ts`: passed.
- `npm run vercel-build`: passed, and the generated route registry included `skills-sh`.
- Production feed validation is pending deployment.

## Risks

- Non-Vercel deployments will not have an OIDC token unless one is injected at runtime.
- skills.sh may change its authenticated API response shape.
