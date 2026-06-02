# IMPL-00: Shared Infrastructure

> **Target files**: `lib/routes/spec/namespace.ts`, `lib/routes/spec/utils.ts`, `lib/types/spec-extra.ts`

## `lib/routes/spec/namespace.ts`

Mirror `naver/namespace.ts` in structure.

```typescript
import type { Namespace } from '@/types';

export const namespace: Namespace = {
    name: 'SPEC',
    url: 'sunbi.app',
    description: 'SPEC media routes (`/spec/…`) for the Sunbi extension — YouTube, Viki, Weverse, Bubble, Netflix.',
    lang: 'en',
};
```

## `lib/routes/spec/utils.ts`

```typescript
import { config } from '@/config';

/** Standardised cache key for all SPEC routes. */
export function buildCacheKey(platform: string, ...parts: string[]): string {
    return ['spec', platform, ...parts].join(':');
}

/** Throw a typed error for missing/expired auth. Always call before any fetch. */
export function throwAuthError(code: string, message: string): never {
    const err = new Error(message) as Error & { code: string };
    err.code = code;
    throw err;
}

/** Assert an env var is present; throw a typed auth error if absent. */
export function assertEnv(varName: string, errorCode: string): string {
    const value = (config[varName as keyof typeof config] as string | undefined) ?? process.env[varName];
    if (!value) {
        throwAuthError(errorCode, `${varName} is not set. ${errorCode}`);
    }
    return value as string;
}
```

## `lib/types/spec-extra.ts`

Single source of truth for `_extra` shapes. `DataItem._extra` in `lib/types.ts` remains `Record<string, any>` at the core type level; these interfaces document and narrow the Sunbi contract for authors and the extension.

```typescript
// ─── Base ────────────────────────────────────────────────────────────────────

interface SpecExtraBase {
    /**
     * Discriminator: "<platform>/<item-kind>"
     * e.g. "youtube/video", "netflix/episode"
     */
    type: string;
    platform: 'youtube' | 'viki' | 'weverse' | 'bubble' | 'netflix';
    /** Canonical human-readable URL for this item (same as DataItem.link). */
    sourceUrl: string;
    /** Stable platform-specific item ID. */
    externalId: string;
    /** Series/channel/show level ID. */
    seriesExternalId: string;
    /** Human-readable episode label, e.g. "EP 7" or "S01E03". */
    episodeLabel?: string;
    /** ISO 8601 timestamp — must equal DataItem.pubDate when present. */
    publishedAt?: string;
}

// ─── Platform shapes ─────────────────────────────────────────────────────────

export interface SpecExtraYoutube extends SpecExtraBase {
    type: 'youtube/video' | 'youtube/membership-video';
    platform: 'youtube';
    channelId: string;
    channelTitle: string;
    isMembershipOnly: boolean;
}

export interface SpecExtraViki extends SpecExtraBase {
    type: 'viki/episode';
    platform: 'viki';
    titleId: string;
    seasonNumber?: number;
    episodeNumber?: number;
    regionLocked: boolean;
}

export interface SpecExtraWeverse extends SpecExtraBase {
    type: 'weverse/post' | 'weverse/media' | 'weverse/moment';
    platform: 'weverse';
    artistId: string;
    communityId: string;
    postType: 'artist' | 'fan' | 'media' | 'moment';
    isPaid: boolean;
}

export interface SpecExtraBubble extends SpecExtraBase {
    type: 'bubble/message';
    platform: 'bubble';
    artistId: string;
    bubbleRoomId: string;
    messageType: 'text' | 'image' | 'video';
}

export interface SpecExtraNetflix extends SpecExtraBase {
    type: 'netflix/episode' | 'netflix/film';
    platform: 'netflix';
    titleId: string;
    seasonNumber?: number;
    episodeNumber?: number;
    maturityRating?: string;
}

// ─── Union ───────────────────────────────────────────────────────────────────

export type SpecExtra = SpecExtraYoutube | SpecExtraViki | SpecExtraWeverse | SpecExtraBubble | SpecExtraNetflix;
```

## Implementation checklist

- [x] Add `lib/routes/spec/namespace.ts` and register the namespace per RSSHub route discovery (run `pnpm build:routes`).
- [x] Implement `utils.ts` using the real `config` keys your fork exposes (or read `process.env` only if not on `config`).
- [x] Export `SpecExtra*` types and use them in route handlers when building `_extra`.
