import { z } from 'zod';

import type { SpecExtra } from './spec-extra';

/**
 * Zod runtime schema mirroring the `SpecExtra` discriminated union declared in
 * `lib/types/spec-extra.ts`. Used in `NODE_ENV !== 'production'` to validate
 * `_extra` payloads at the route boundary, so the Sunbi extension can trust
 * the shape of the JSON it ingests.
 *
 * Discriminator: `type` — e.g. `"youtube/video"`, `"viki/episode"`,
 * `"weverse/post"`, `"bubble/message"`, `"netflix/episode"`, etc.
 */

// ─── Base ───────────────────────────────────────────────────────────────────

const specExtraBaseSchema = z.object({
    /** Discriminator: "<platform>/<item-kind>". */
    type: z.string(),
    platform: z.enum(['youtube', 'viki', 'weverse', 'bubble', 'netflix', 'naver-blog', 'naver-webtoon']),
    /** Canonical human-readable URL for this item (same as DataItem.link). */
    sourceUrl: z.string(),
    /** Stable platform-specific item ID. */
    externalId: z.string(),
    /** Series/channel/show level ID. */
    seriesExternalId: z.string(),
    /** Human-readable episode label, e.g. "EP 7" or "S01E03". */
    episodeLabel: z.string().optional(),
    /** ISO 8601 timestamp — must equal DataItem.pubDate when present. */
    publishedAt: z.string().optional(),
});

// ─── Platform shapes ────────────────────────────────────────────────────────

const specExtraYoutubeSchema = specExtraBaseSchema.extend({
    type: z.enum(['youtube/video', 'youtube/short', 'youtube/live', 'youtube/post', 'youtube/podcast', 'youtube/membership-video']),
    platform: z.literal('youtube'),
    channelId: z.string(),
    channelTitle: z.string(),
    isMembershipOnly: z.boolean(),
    contentKind: z.enum(['video', 'short', 'live', 'post', 'podcast']).optional(),
    thumbnail: z.string().optional(),
    thumbnailFallback: z.string().optional(),
    isLiveNow: z.boolean().optional(),
    bodyText: z.string().optional(),
});

const specExtraVikiSchema = specExtraBaseSchema.extend({
    type: z.literal('viki/episode'),
    platform: z.literal('viki'),
    titleId: z.string(),
    seasonNumber: z.number().optional(),
    episodeNumber: z.number().optional(),
    regionLocked: z.boolean(),
});

const specExtraWeverseSchema = specExtraBaseSchema.extend({
    type: z.enum(['weverse/post', 'weverse/media', 'weverse/moment']),
    platform: z.literal('weverse'),
    artistId: z.string(),
    communityId: z.string(),
    postType: z.enum(['artist', 'fan', 'media', 'moment']),
    isPaid: z.boolean(),
});

const specExtraBubbleSchema = specExtraBaseSchema.extend({
    type: z.literal('bubble/message'),
    platform: z.literal('bubble'),
    artistId: z.string(),
    bubbleRoomId: z.string(),
    messageType: z.enum(['text', 'image', 'video']),
});

const specExtraNetflixSchema = specExtraBaseSchema.extend({
    type: z.enum(['netflix/episode', 'netflix/film']),
    platform: z.literal('netflix'),
    netflixTitleId: z.string(),
    tmdbSeriesId: z.string(),
    tmdbEpisodeId: z.number().optional(),
    imdbId: z.string(),
    thumbnailUrl: z.string(),
    subtitleStatus: z.enum(['none', 'captured', 'processing', 'done']),
    captionLanguages: z.array(z.string()),
});

const specExtraNaverBlogSchema = specExtraBaseSchema.extend({
    type: z.literal('naver/blog/post'),
    platform: z.literal('naver-blog'),
    blogId: z.string(),
    authorId: z.string(),
});

const specExtraNaverWebtoonSchema = specExtraBaseSchema.extend({
    type: z.literal('naver/webtoon/episode'),
    platform: z.literal('naver-webtoon'),
    titleId: z.string(),
    episodeNumber: z.number(),
    seriesThumb: z.string().optional(),
    seriesFrontImage: z.string().optional(),
    seriesAuthor: z.string().optional(),
    seriesSummary: z.string().optional(),
    seriesScore: z.string().optional(),
    seriesRating: z.string().optional(),
    seriesDayOfWeek: z.string().optional(),
    thumbnail: z.string().optional(),
    /** Populated by a downstream OCR job; empty array at ingest time. */
    panelImageUrls: z.array(z.string()),
    episodeHash: z.string().optional(),
    totalPages: z.number().optional(),
});

// ─── Union ──────────────────────────────────────────────────────────────────

export const specExtraSchema = z.discriminatedUnion('type', [specExtraYoutubeSchema, specExtraVikiSchema, specExtraWeverseSchema, specExtraBubbleSchema, specExtraNetflixSchema, specExtraNaverBlogSchema, specExtraNaverWebtoonSchema]);

/**
 * Throws with a Zod-formatted error message if `value` does not match the
 * `SpecExtra` union. Use at the route boundary in non-production environments.
 */
export function assertSpecExtra(value: unknown): asserts value is SpecExtra {
    const result = specExtraSchema.safeParse(value);
    if (!result.success) {
        throw new Error(`SpecExtra validation failed: ${result.error.message}`);
    }
}
