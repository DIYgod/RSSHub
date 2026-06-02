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
    /** Populated by a downstream OCR job; empty array at ingest time. */
    panelImageUrls: string[];
}

// ─── Union ───────────────────────────────────────────────────────────────────

export type SpecExtra = SpecExtraYoutube | SpecExtraViki | SpecExtraWeverse | SpecExtraBubble | SpecExtraNetflix | SpecExtraNaverBlog | SpecExtraNaverWebtoon;
