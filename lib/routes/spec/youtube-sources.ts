import { load } from 'cheerio';

import { config } from '@/config';
import type { DataItem } from '@/types';
import type { SpecExtraYoutube } from '@/types/spec-extra';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';

import { buildCacheKey } from './utils';

const YT_FEED_BASE = 'https://www.youtube.com/feeds/videos.xml';

/** Playlist prefixes derived from UC channel id (see IvyReader / Stack Overflow). */
export type YoutubeContentKind = 'video' | 'short' | 'live' | 'post' | 'podcast';

export const DEFAULT_YOUTUBE_TYPES: YoutubeContentKind[] = ['video', 'short', 'live', 'post'];

export function parseYoutubeTypesParam(raw: string | undefined): Set<YoutubeContentKind> {
    if (!raw?.trim()) {
        return new Set(DEFAULT_YOUTUBE_TYPES);
    }
    const allowed = new Set<YoutubeContentKind>(['video', 'short', 'live', 'post', 'podcast']);
    const picked = raw
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter((s): s is YoutubeContentKind => allowed.has(s as YoutubeContentKind));
    return picked.length > 0 ? new Set(picked) : new Set(DEFAULT_YOUTUBE_TYPES);
}

export function channelPlaylistId(channelId: string, prefix: 'UULF' | 'UUSH' | 'UULV'): string {
    return `${prefix}${channelId.slice(2)}`;
}

function isoOrUndefined(date: Date | undefined): string | undefined {
    if (!date || Number.isNaN(date.getTime())) {
        return undefined;
    }
    return date.toISOString();
}

interface YtAtomEntry {
    'yt:videoId': string;
    title: string;
    link:
        | string
        | {
              $?: { href?: string };
              '@_href'?: string;
          };
    published?: string;
    updated?: string;
    author?: { name?: string } | Array<{ name?: string }>;
    'media:group'?: {
        'media:thumbnail'?: { $?: { url?: string }; '@_url'?: string } | Array<{ $?: { url?: string }; '@_url'?: string }>;
        'media:description'?: string | { '#text'?: string };
    };
}

interface YtAtomFeed {
    feed?: {
        title?: string;
        'yt:channelId'?: string;
        entry?: YtAtomEntry | YtAtomEntry[];
    };
}

function entryLinkHref(entry: YtAtomEntry): string {
    const link = entry.link;
    if (typeof link === 'string') {
        return link;
    }
    return link?.$?.href ?? link?.['@_href'] ?? '';
}

function thumbnailUrl(group: YtAtomEntry['media:group']): string {
    const thumb = group?.['media:thumbnail'];
    if (!thumb) {
        return '';
    }
    const node = Array.isArray(thumb) ? thumb[0] : thumb;
    return node?.$?.url ?? node?.['@_url'] ?? '';
}

function descriptionText(group: YtAtomEntry['media:group']): string {
    const raw = group?.['media:description'];
    if (typeof raw === 'string') {
        return raw;
    }
    return raw?.['#text'] ?? '';
}

function normalizeEntries(feed: YtAtomFeed['feed']): YtAtomEntry[] {
    const raw = feed?.entry;
    if (!raw) {
        return [];
    }
    return Array.isArray(raw) ? raw : [raw];
}

function youtubeThumbnails(
    videoId: string,
    feedThumb: string
): {
    thumbnail: string;
    thumbnailFallback: string;
} {
    const fallback = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    const maxres = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
    return {
        thumbnail: feedThumb || maxres,
        thumbnailFallback: fallback,
    };
}

function youtubeDataApiKey(): string | undefined {
    return config.youtube?.key?.trim() || process.env.YOUTUBE_API_v3_KEY?.trim() || undefined;
}

/** Channel profile picture via YouTube Data API v3 (cached 7d). */
export async function fetchChannelAvatarUrl(channelId: string): Promise<string | null> {
    const apiKey = youtubeDataApiKey();
    if (!apiKey || !/^UC[\w-]{22}$/.test(channelId)) {
        return null;
    }

    try {
        const payload = await cache.tryGet(
            buildCacheKey('youtube', 'avatar', channelId),
            () =>
                ofetch<{
                    items?: Array<{
                        snippet?: {
                            thumbnails?: {
                                high?: { url?: string };
                                medium?: { url?: string };
                            };
                        };
                    }>;
                }>('https://www.googleapis.com/youtube/v3/channels', {
                    query: {
                        part: 'snippet',
                        id: channelId,
                        key: apiKey,
                    },
                }),
            7 * 24 * 60 * 60
        );
        const thumbs = payload?.items?.[0]?.snippet?.thumbnails;
        return thumbs?.high?.url?.trim() || thumbs?.medium?.url?.trim() || null;
    } catch {
        return null;
    }
}

function specTypeForKind(kind: YoutubeContentKind): SpecExtraYoutube['type'] {
    switch (kind) {
        case 'short':
            return 'youtube/short';
        case 'live':
            return 'youtube/live';
        case 'post':
            return 'youtube/post';
        case 'podcast':
            return 'youtube/podcast';
        default:
            return 'youtube/video';
    }
}

function watchLink(videoId: string, kind: YoutubeContentKind): string {
    if (kind === 'short' && videoId) {
        return `https://www.youtube.com/shorts/${videoId}`;
    }
    if (videoId) {
        return `https://www.youtube.com/watch?v=${videoId}`;
    }
    return '';
}

export async function fetchAtomFeedEntries(channelId: string, opts: { channelIdParam?: boolean; playlistId?: string }): Promise<{ channelTitle: string; entries: YtAtomEntry[] }> {
    const query = opts.playlistId ? { playlist_id: opts.playlistId } : { channel_id: channelId };

    const cacheKey = opts.playlistId ? buildCacheKey('youtube', 'pl', opts.playlistId) : buildCacheKey('youtube', channelId);

    const feedXml = await cache.tryGet(
        cacheKey,
        () =>
            ofetch<string>(YT_FEED_BASE, {
                query,
                parseResponse: (txt) => txt,
            }),
        30 * 60
    );

    const { XMLParser } = await import('fast-xml-parser');
    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '$',
    });
    const parsed = parser.parse(feedXml as string) as YtAtomFeed;
    const feed = parsed.feed;
    if (!feed) {
        return { channelTitle: channelId, entries: [] };
    }

    return {
        channelTitle: String(feed.title ?? channelId),
        entries: normalizeEntries(feed),
    };
}

export function mapAtomEntryToItem(entry: YtAtomEntry, channelId: string, channelTitle: string, kind: YoutubeContentKind, liveNowVideoIds: ReadonlySet<string>, channelAvatarUrl?: string | null): DataItem {
    const videoId = String(entry['yt:videoId'] ?? '');
    const linkFromFeed = entryLinkHref(entry);
    const link = linkFromFeed || watchLink(videoId, kind) || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : '');
    const feedThumb = entry['media:group'] ? thumbnailUrl(entry['media:group']) : '';
    const { thumbnail, thumbnailFallback } = youtubeThumbnails(videoId, feedThumb);
    const descText = entry['media:group'] ? descriptionText(entry['media:group']) : '';
    const pubDate = parseDate(entry.published ?? entry.updated ?? '');
    const isLiveNow = kind === 'live' && liveNowVideoIds.has(videoId);

    const extra: SpecExtraYoutube = {
        type: specTypeForKind(kind),
        platform: 'youtube',
        sourceUrl: link,
        externalId: videoId,
        seriesExternalId: channelId,
        publishedAt: isoOrUndefined(pubDate),
        channelId,
        channelTitle,
        isMembershipOnly: false,
        contentKind: kind,
        thumbnail,
        thumbnailFallback,
        channelAvatarUrl: channelAvatarUrl ?? undefined,
        isLiveNow,
    };

    return {
        title: String(entry.title ?? videoId),
        link,
        guid: `spec-youtube-${channelId}-${kind}-${videoId}`,
        pubDate,
        author: channelTitle,
        image: thumbnail,
        description: [thumbnail ? `<img src="${thumbnail}" />` : '', descText ? `<p>${descText}</p>` : ''].filter(Boolean).join('\n'),
        _extra: extra,
    };
}

/** Scrape community tab posts (no API key). Returns [] when tab missing. */
export async function fetchCommunityPostItems(channelId: string, handle: string | null): Promise<DataItem[]> {
    const path = handle ? `@${handle}/posts` : `channel/${channelId}/posts`;
    const url = `https://www.youtube.com/${path}`;

    let response: string;
    try {
        response = await cache.tryGet(
            buildCacheKey('youtube', 'posts', channelId),
            () =>
                ofetch<string>(url, {
                    parseResponse: (txt) => txt,
                }),
            15 * 60
        );
    } catch {
        return [];
    }

    const $ = load(response as string);
    const match = $('script')
        .text()
        .match(/ytInitialData\s*=\s*(\{.*?\});/s);
    if (!match?.[1]) {
        return [];
    }

    let ytInitialData: Record<string, unknown>;
    try {
        ytInitialData = JSON.parse(match[1]) as Record<string, unknown>;
    } catch {
        return [];
    }

    const metadata = (
        ytInitialData.metadata as {
            channelMetadataRenderer?: Record<string, string>;
        }
    )?.channelMetadataRenderer;
    const channelTitle = metadata?.title ?? channelId;
    const tabs =
        (
            ytInitialData.contents as {
                twoColumnBrowseResultsRenderer?: {
                    tabs?: Array<{
                        tabRenderer?: {
                            endpoint?: {
                                commandMetadata?: {
                                    webCommandMetadata?: { url?: string };
                                };
                            };
                            content?: {
                                sectionListRenderer?: {
                                    contents?: Array<{
                                        itemSectionRenderer?: {
                                            contents?: unknown[];
                                        };
                                    }>;
                                };
                            };
                        };
                    }>;
                };
            }
        )?.twoColumnBrowseResultsRenderer?.tabs ?? [];

    const communityTab = tabs.find((tab) => {
        const tabUrl = tab.tabRenderer?.endpoint?.commandMetadata?.webCommandMetadata?.url ?? '';
        return tabUrl.endsWith('/posts') || tabUrl.endsWith('/community');
    });

    const list = communityTab?.tabRenderer?.content?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents ?? [];

    const first = list[0] as { messageRenderer?: { text?: { runs?: Array<{ text?: string }> } } } | undefined;
    if (first?.messageRenderer) {
        return [];
    }

    return list
        .filter((i): i is { backstagePostThreadRenderer: Record<string, unknown> } => Boolean((i as { backstagePostThreadRenderer?: unknown }).backstagePostThreadRenderer))
        .map((item) => {
            const thread = item.backstagePostThreadRenderer as {
                post: {
                    backstagePostRenderer?: Record<string, unknown>;
                    sharedPostRenderer?: {
                        originalPost?: {
                            backstagePostRenderer?: Record<string, unknown>;
                        };
                    };
                };
            };
            const post = thread.post.backstagePostRenderer ?? thread.post.sharedPostRenderer?.originalPost?.backstagePostRenderer;
            if (!post) {
                return null;
            }

            const postId = String(post.postId ?? '');
            const runs = (post.contentText as { runs?: Array<{ text?: string }> } | undefined)?.runs;
            const title = runs?.[0]?.text?.trim() || 'Community post';
            const authorRuns = (post.authorText as { runs?: Array<{ text?: string }> } | undefined)?.runs;
            const author = authorRuns?.[0]?.text ?? channelTitle;
            const publishedRaw = (post.publishedTimeText as { runs?: Array<{ text?: string }> } | undefined)?.runs?.[0]?.text;
            const pubDate = publishedRaw ? parseRelativeDate(publishedRaw.split('(')[0]) : undefined;

            const mediaImages = (
                post.backstageAttachment as
                    | {
                          postMultiImageRenderer?: {
                              images?: Array<{
                                  backstageImageRenderer?: {
                                      image?: {
                                          thumbnails?: Array<{ url?: string }>;
                                      };
                                  };
                              }>;
                          };
                          backstageImageRenderer?: {
                              image?: { thumbnails?: Array<{ url?: string }> };
                          };
                      }
                    | undefined
            )?.postMultiImageRenderer?.images?.map((img) => img.backstageImageRenderer?.image?.thumbnails?.at(-1)?.url) ?? [
                (
                    post.backstageAttachment as
                        | {
                              backstageImageRenderer?: {
                                  image?: {
                                      thumbnails?: Array<{ url?: string }>;
                                  };
                              };
                          }
                        | undefined
                )?.backstageImageRenderer?.image?.thumbnails?.at(-1)?.url,
            ];

            const thumb = mediaImages.find((u): u is string => typeof u === 'string' && u.length > 0);
            const link = `https://www.youtube.com/post/${postId}`;

            const extra: SpecExtraYoutube = {
                type: 'youtube/post',
                platform: 'youtube',
                sourceUrl: link,
                externalId: postId,
                seriesExternalId: channelId,
                publishedAt: isoOrUndefined(pubDate),
                channelId,
                channelTitle,
                isMembershipOnly: false,
                contentKind: 'post',
                thumbnail: thumb ?? '',
                thumbnailFallback: thumb ?? '',
                isLiveNow: false,
                bodyText: runs
                    ?.map((r) => r.text ?? '')
                    .join('')
                    .trim(),
            };

            return {
                title,
                link,
                guid: `spec-youtube-${channelId}-post-${postId}`,
                pubDate,
                author,
                image: thumb,
                description: title,
                _extra: extra,
            } satisfies DataItem;
        })
        .filter((item): item is DataItem => item !== null);
}

/** Optional live-now detection via YOUTUBE_KEY (Data API search). */
export async function fetchLiveNowVideoIds(channelId: string): Promise<Set<string>> {
    if (!config.youtube?.key) {
        return new Set();
    }
    try {
        const { default: utils } = await import('@/routes/youtube/utils');
        const res = await utils.getLive(channelId, cache);
        const ids = (res.data.items ?? []).map((item: { id?: { videoId?: string } }) => item.id?.videoId).filter((id): id is string => typeof id === 'string' && id.length > 0);
        return new Set(ids);
    } catch {
        return new Set();
    }
}

/** Podcast playlist IDs from channel browse JSON (creator-designated podcasts). */
export async function discoverPodcastPlaylistIds(channelId: string, handle: string | null): Promise<string[]> {
    const path = handle ? `@${handle}` : `channel/${channelId}`;
    const url = `https://www.youtube.com/${path}`;

    let html: string;
    try {
        html = await cache.tryGet(
            buildCacheKey('youtube', 'podcast-discover', channelId),
            () =>
                ofetch<string>(url, {
                    parseResponse: (txt) => txt,
                }),
            24 * 60 * 60
        );
    } catch {
        return [];
    }

    const ids = new Set<string>();
    const playlistMatches = (html as string).matchAll(/"playlistId":"(PL[^"]{10,})"[^}]*"title":\{"(?:simpleText|runs)":(?:\{"text":"([^"]*podcast[^"]*)"\}|\[\{"text":"([^"]*podcast[^"]*)"\}\])/gi);
    for (const m of playlistMatches) {
        if (m[1]) {
            ids.add(m[1]);
        }
    }

    // Tab endpoint often exposes podcast shelf playlist id.
    const tabMatch = (html as string).match(/"url":"\/channel\/[^"]+\/podcasts"[\s\S]{0,800}?"playlistId":"(PL[^"]+)"/);
    if (tabMatch?.[1]) {
        ids.add(tabMatch[1]);
    }

    return [...ids];
}

export async function fetchPodcastPlaylistItems(channelId: string, channelTitle: string, playlistId: string, liveNowVideoIds: ReadonlySet<string>, channelAvatarUrl?: string | null): Promise<DataItem[]> {
    const { entries } = await fetchAtomFeedEntries(channelId, {
        playlistId,
    });
    return entries.map((entry) => mapAtomEntryToItem(entry, channelId, channelTitle, 'podcast', liveNowVideoIds, channelAvatarUrl));
}

export function mergeYoutubeItems(items: DataItem[]): DataItem[] {
    const byGuid = new Map<string, DataItem>();
    for (const item of items) {
        const existing = byGuid.get(item.guid ?? '');
        if (!existing) {
            byGuid.set(item.guid ?? '', item);
            continue;
        }
        const existingDate = existing.pubDate?.getTime() ?? 0;
        const nextDate = item.pubDate?.getTime() ?? 0;
        if (nextDate >= existingDate) {
            byGuid.set(item.guid ?? '', item);
        }
    }
    return [...byGuid.values()].toSorted((a, b) => (b.pubDate?.getTime() ?? 0) - (a.pubDate?.getTime() ?? 0));
}
