// ─── Base ────────────────────────────────────────────────────────────────────

interface SpecExtraBase {
    /**
     * Discriminator: "<platform>/<item-kind>"
     * e.g. "youtube/video", "netflix/episode"
     */
    type: string;
    platform: 'youtube' | 'viki' | 'weverse' | 'bubble' | 'netflix' | 'naver-blog' | 'naver-webtoon';
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
    type: 'youtube/video' | 'youtube/short' | 'youtube/live' | 'youtube/post' | 'youtube/podcast' | 'youtube/membership-video';
    platform: 'youtube';
    channelId: string;
    channelTitle: string;
    isMembershipOnly: boolean;
    /** Normalized kind for ingest/UI — video | short | live | post | podcast */
    contentKind?: 'video' | 'short' | 'live' | 'post' | 'podcast';
    /** Primary thumbnail (maxres when available). */
    thumbnail?: string;
    /** hqdefault fallback when maxres 404s. */
    thumbnailFallback?: string;
    /** Channel profile image from YouTube Data API (when YOUTUBE_KEY set). */
    channelAvatarUrl?: string;
    /** True when YOUTUBE_KEY detects an active broadcast for this video. */
    isLiveNow?: boolean;
    /** Community post body (posts only). */
    bodyText?: string;
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
    netflixTitleId: string;
    tmdbSeriesId: string;
    tmdbEpisodeId?: number;
    imdbId: string;
    thumbnailUrl: string;
    subtitleStatus: 'none' | 'captured' | 'processing' | 'done';
    captionLanguages: string[];
}

export interface SpecExtraNaverBlog extends SpecExtraBase {
    type: 'naver/blog/post';
    platform: 'naver-blog';
    blogId: string;
    authorId: string;
}

export interface SpecExtraNaverWebtoon extends SpecExtraBase {
    type: 'naver/webtoon/episode';
    platform: 'naver-webtoon';
    titleId: string;
    episodeNumber: number;
    /** Desktop list poster for the series (comic.naver.com list page). */
    seriesThumb?: string;
    /** Transparent PNG from mobile list `frontImage_*` — card corner decoration. */
    seriesFrontImage?: string;
    /** Series author(s) from list page detail block. */
    seriesAuthor?: string;
    /** Series synopsis from list page. */
    seriesSummary?: string;
    /** Star score from mobile list page, e.g. "9.82". */
    seriesScore?: string;
    /** Age rating label, e.g. "15세 이용가". */
    seriesRating?: string;
    /** Weekday label, e.g. "일요웹툰". */
    seriesDayOfWeek?: string;
    /** Desktop list thumbnail for this episode (202x120). */
    thumbnail?: string;
    /** Populated by a downstream OCR job; empty array at ingest time. */
    panelImageUrls: string[];
    /** Panel image hash prefix from detail page scrape (for OCR pagination). */
    episodeHash?: string;
    /** Total panel pages detected on detail page (when available). */
    totalPages?: number;
}

// ─── Union ───────────────────────────────────────────────────────────────────

export type SpecExtra = SpecExtraYoutube | SpecExtraViki | SpecExtraWeverse | SpecExtraBubble | SpecExtraNetflix | SpecExtraNaverBlog | SpecExtraNaverWebtoon;
