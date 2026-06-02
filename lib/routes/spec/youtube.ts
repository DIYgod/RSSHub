import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, DataItem, Route } from '@/types';
import type { SpecExtraYoutube } from '@/types/spec-extra';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { buildCacheKey } from './utils';

const YT_FEED_BASE = 'https://www.youtube.com/feeds/videos.xml';

/** Same rule as `@/routes/youtube/utils` `isYouTubeChannelId` — https://webapps.stackexchange.com/a/101153 */
function isYoutubeChannelId(id: string): boolean {
    return /^UC[\w-]{21}[AQgw]$/.test(id);
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

export const route: Route = {
    path: '/youtube/:channelId',
    categories: ['multimedia'],
    example: '/spec/youtube/UCxxxxxxxxxxxxxxxxxxxxxx',
    parameters: {
        channelId: 'YouTube channel ID (starts with UC…). Find it in the channel URL.',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        supportRadar: true,
    },
    url: 'youtube.com',
    name: 'Channel Videos',
    maintainers: ['koreanpatch'],
    radar: [
        {
            source: ['www.youtube.com/channel/:channelId', 'www.youtube.com/channel/:channelId/videos'],
            target: '/youtube/:channelId',
        },
    ],
    handler,
};

async function handler(ctx: Context): Promise<Data> {
    const channelId = ctx.req.param('channelId');

    if (!isYoutubeChannelId(channelId)) {
        throw new InvalidParameterError('Invalid YouTube channel ID. Use the UC… id from youtube.com/channel/UC… (@handles are not accepted on this route).');
    }

    const feedXml = await cache.tryGet(
        buildCacheKey('youtube', channelId),
        () =>
            ofetch<string>(YT_FEED_BASE, {
                query: { channel_id: channelId },
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
        throw new InvalidParameterError('YouTube returned an empty or unrecognised Atom feed for this channel.');
    }

    const channelTitle = String(feed.title ?? channelId);
    const entries = normalizeEntries(feed);

    const items: DataItem[] = entries.map((entry) => {
        const videoId = String(entry['yt:videoId'] ?? '');
        const linkFromFeed = entryLinkHref(entry);
        const link = linkFromFeed || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : '');
        const thumb = entry['media:group'] ? thumbnailUrl(entry['media:group']) : '';
        const descText = entry['media:group'] ? descriptionText(entry['media:group']) : '';
        const pubDate = parseDate(entry.published ?? entry.updated ?? '');

        const extra: SpecExtraYoutube = {
            type: 'youtube/video',
            platform: 'youtube',
            sourceUrl: link,
            externalId: videoId,
            seriesExternalId: channelId,
            publishedAt: pubDate ? pubDate.toISOString() : undefined,
            channelId,
            channelTitle,
            isMembershipOnly: false,
        };

        return {
            title: String(entry.title ?? videoId),
            link,
            guid: `spec-youtube-${channelId}-${videoId}`,
            pubDate,
            author: channelTitle,
            image: thumb,
            description: [thumb ? `<img src="${thumb}" />` : '', descText ? `<p>${descText}</p>` : ''].filter(Boolean).join('\n'),
            _extra: extra,
        };
    });

    return {
        title: `${channelTitle} — YouTube`,
        link: `https://www.youtube.com/channel/${channelId}`,
        item: items,
        language: 'en',
    };
}
