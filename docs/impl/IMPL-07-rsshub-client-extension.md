# IMPL-07: `rsshubClient.ts` (Sunbi extension client)

> **Repo**: [sunbi](https://github.com/koreanpatch/sunbi) (paired Chrome extension)  
> **Target file** (conventional): `src/lib/rsshubClient.ts` — adjust to your WXT / src layout.

This document lives in **sunbi-rsshub** so the RSSHub and extension contracts stay reviewable in one place; implement the TypeScript in the **sunbi** repository.

## Purpose

Single entry point for all **SPEC** RSSHub JSON calls (`/spec/…`): build URLs, attach `key`, handle typed errors, return `SpecExtra[]`. Keep fetch logic out of UI components.

Share `SpecExtra` types via a **local copy**, **generated types**, or a small shared package — do not drift from `lib/types/spec-extra.ts` in the RSSHub fork.

## File (design)

```typescript
import type { SpecExtra } from './spec-extra'; // shared types (local copy or submodule)

// ─── Config ──────────────────────────────────────────────────────────────────

export interface RsshubClientConfig {
    baseUrl: string; // e.g. "https://rsshub.yourdomain.com"
    apiKey?: string; // matches RSSHub ACCESS_KEY query param `key`
}

// ─── Errors ──────────────────────────────────────────────────────────────────

export class RsshubAuthError extends Error {
    readonly code: string;
    constructor(code: string, message: string) {
        super(message);
        this.name = 'RsshubAuthError';
        this.code = code;
    }
}

export class RsshubEmptyError extends Error {
    constructor(route: string) {
        super(`RSSHub route returned no items: ${route}`);
        this.name = 'RsshubEmptyError';
    }
}

export class RsshubNetworkError extends Error {
    readonly status: number;
    constructor(status: number, route: string) {
        super(`RSSHub request failed with HTTP ${status}: ${route}`);
        this.name = 'RsshubNetworkError';
        this.status = status;
    }
}

// ─── JSON feed item shape (RSSHub format=json) ────────────────────────────────

interface RsshubJsonItem {
    title?: string;
    link?: string;
    id?: string;
    date_published?: string;
    _extra?: SpecExtra;
}

interface RsshubJsonFeed {
    items?: RsshubJsonItem[];
    title?: string;
}

// ─── Client ──────────────────────────────────────────────────────────────────

export class RsshubClient {
    private readonly baseUrl: string;
    private readonly apiKey: string | undefined;

    constructor(cfg: RsshubClientConfig) {
        this.baseUrl = cfg.baseUrl.replace(/\/$/, '');
        this.apiKey = cfg.apiKey;
    }

    /** Build a full RSSHub JSON-format URL for a given route path under `/spec/`. */
    buildUrl(routePath: string): string {
        const url = new URL(`${this.baseUrl}/spec/${routePath.replace(/^\//, '')}`);
        url.searchParams.set('format', 'json');
        if (this.apiKey) {
            url.searchParams.set('key', this.apiKey);
        }
        return url.toString();
    }

    /** Fetch a SPEC route (`/spec/…`) and return the _extra array. */
    async fetchRoute(routePath: string): Promise<SpecExtra[]> {
        const url = this.buildUrl(routePath);
        let response: Response;

        try {
            response = await fetch(url);
        } catch {
            throw new RsshubNetworkError(0, routePath);
        }

        if (response.status === 401 || response.status === 403) {
            let code = 'ERR_RSSHUB_AUTH';
            try {
                const body = (await response.json()) as { code?: string };
                if (body.code) {
                    code = body.code;
                }
            } catch {
                // ignore JSON parse errors
            }
            throw new RsshubAuthError(code, `Auth error on ${routePath} (HTTP ${response.status})`);
        }

        if (!response.ok) {
            throw new RsshubNetworkError(response.status, routePath);
        }

        const feed = (await response.json()) as RsshubJsonFeed;
        const items = feed.items ?? [];

        if (items.length === 0) {
            throw new RsshubEmptyError(routePath);
        }

        return items.map((item) => item._extra).filter((extra): extra is SpecExtra => extra !== undefined);
    }

    fetchYoutube(channelId: string) {
        return this.fetchRoute(`youtube/${channelId}`);
    }

    fetchViki(titleId: string) {
        return this.fetchRoute(`viki/${titleId}`);
    }

    fetchWeverse(communityId: string) {
        return this.fetchRoute(`weverse/${communityId}`);
    }

    fetchBubble(artistId: string) {
        return this.fetchRoute(`bubble/${artistId}`);
    }

    fetchNetflix(titleId: string) {
        return this.fetchRoute(`netflix/${titleId}`);
    }
}
```

## Usage (design)

```typescript
// e.g. background / service worker
import { RsshubClient, RsshubAuthError, RsshubEmptyError } from '@/lib/rsshubClient';

const client = new RsshubClient({
    baseUrl: await getStorageValue('rsshubBaseUrl'),
    apiKey: await getStorageValue('rsshubApiKey'),
});

try {
    const extras = await client.fetchYoutube('UCxxxx');
    await ingestToSupabase(extras);
} catch (err) {
    if (err instanceof RsshubAuthError) {
        showErrorBanner(`Feed auth error: ${err.code}. Check your token.`);
    } else if (err instanceof RsshubEmptyError) {
        // non-fatal: no new items
    } else {
        throw err;
    }
}
```

## Contract check

- RSSHub JSON feed keys may use `_extra` on items; confirm against a live `?format=json` response from your fork before locking parsers.
- If the fork uses a different URL prefix than `/spec/`, centralise that in `buildUrl` only.

## Implementation checklist

- [x] **`sunbi`** (`koreanpatch/sunbi`): `src/lib/spec-extra.ts` — mirror of `sunbi-rsshub/lib/types/spec-extra.ts` (keep in sync).
- [x] **`sunbi`**: `src/lib/rsshubClient.ts` — JSON Feed shape matches RSSHub `lib/views/json.ts` (`items`, `_extra` per item); errors + `buildUrl`/`fetchRoute`/`fetchYoutube`… helpers.
- [x] **`sunbi`**: `src/lib/rsshubClient.test.ts` — Vitest coverage for URL building and fetch parsing (`pnpm exec vitest run src/lib/rsshubClient.test.ts`).
