import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

import {
    channelPlaylistId,
    discoverPodcastPlaylistIds,
    fetchAtomFeedEntries,
    fetchChannelAvatarUrl,
    fetchCommunityPostItems,
    fetchLiveNowVideoIds,
    fetchPodcastPlaylistItems,
    mapAtomEntryToItem,
    mergeYoutubeItems,
    parseYoutubeTypesParam,
} from './youtube-sources';

/** Same rule as `@/routes/youtube/utils` `isYouTubeChannelId` — https://webapps.stackexchange.com/a/101153 */
function isYoutubeChannelId(id: string): boolean {
    return /^UC[\w-]{21}[AQgw]$/.test(id);
}

function youtubeHandleFromParam(channelId: string): string | null {
    const trimmed = channelId.trim();
    if (trimmed.startsWith('@')) {
        return trimmed.slice(1);
    }
    if (!isYoutubeChannelId(trimmed) && /^[\w.-]+$/.test(trimmed)) {
        return trimmed;
    }
    return null;
}

async function resolveYoutubeChannelId(
    channelIdOrHandle: string,
): Promise<{ channelId: string; handle: string | null }> {
    if (isYoutubeChannelId(channelIdOrHandle)) {
        return { channelId: channelIdOrHandle, handle: null };
    }
    const handle = youtubeHandleFromParam(channelIdOrHandle);
    if (!handle) {
        throw new InvalidParameterError(
            'Invalid YouTube channel ID. Use UC… from youtube.com/channel/UC… or an @handle.',
        );
    }
    const html = await cache.tryGet(
        `spec-youtube-handle:${handle}`,
        () =>
            ofetch<string>(`https://www.youtube.com/@${handle}`, {
                parseResponse: (txt) => txt,
            }),
        24 * 60 * 60,
    );
    const match =
        (html as string).match(/"channelId":"(UC[^"]+)"/) ??
        (html as string).match(/"externalId":"(UC[^"]+)"/) ??
        (html as string).match(/youtube\.com\/channel\/(UC[\w-]{22})/);
    const resolved = match?.[1];
    if (!resolved || !isYoutubeChannelId(resolved)) {
        throw new InvalidParameterError(
            `Could not resolve YouTube handle @${handle} to a channel ID.`,
        );
    }
    return { channelId: resolved, handle };
}

export const route: Route = {
    path: '/youtube/:channelId',
    categories: ['multimedia'],
    example: '/spec/youtube/UCxxxxxxxxxxxxxxxxxxxxxx',
    parameters: {
        channelId:
            'YouTube channel ID (UC…) or @handle (e.g. @DidiKoreanPodcast).',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: true,
        supportScihub: false,
        supportRadar: true,
    },
    url: 'youtube.com',
    name: 'Channel (videos, shorts, live, posts)',
    maintainers: ['koreanpatch'],
    description: `::: tip Query parameter — \`types\`
| Value | Source | Notes |
| ----- | ------ | ----- |
| \`video\` | Atom \`playlist_id=UULF…\` | Long-form uploads (no Shorts) |
| \`short\` | Atom \`playlist_id=UUSH…\` | Shorts only |
| \`live\` | Atom \`playlist_id=UULV…\` | Past live streams; \`isLiveNow\` when \`YOUTUBE_KEY\` is set |
| \`post\` | Scrape \`/posts\` tab | Community posts (no RSS) |
| \`podcast\` | Atom on creator podcast playlist(s) | Only when the channel exposes a Podcasts tab |

Default: \`types=video,short,live,post\`. Example: \`?types=video,short\`.

Podcast episodes also appear as regular \`video\` items when published to the main uploads feed. There is no YouTube-native podcast-only RSS prefix (UULP is *popular videos*, not podcasts).
:::`,
    radar: [
        {
            source: [
                'www.youtube.com/channel/:channelId',
                'www.youtube.com/channel/:channelId/videos',
                'www.youtube.com/@:handle',
            ],
            target: '/youtube/:channelId',
        },
    ],
    handler,
};

async function handler(ctx: Context): Promise<Data> {
    const channelIdParam = ctx.req.param('channelId');
    const { channelId, handle } = await resolveYoutubeChannelId(channelIdParam);
    const types = parseYoutubeTypesParam(ctx.req.query('types'));
    const channelAvatarUrl = await fetchChannelAvatarUrl(channelId);

    const liveNowVideoIds = types.has('live')
        ? await fetchLiveNowVideoIds(channelId)
        : new Set<string>();

    const collected: Array<Awaited<ReturnType<typeof mapAtomEntryToItem>>> = [];
    let channelTitle = channelId;

    if (types.has('video')) {
        const { channelTitle: title, entries } = await fetchAtomFeedEntries(
            channelId,
            { playlistId: channelPlaylistId(channelId, 'UULF') },
        );
        channelTitle = title;
        for (const entry of entries) {
            collected.push(
                mapAtomEntryToItem(
                    entry,
                    channelId,
                    channelTitle,
                    'video',
                    liveNowVideoIds,
                    channelAvatarUrl,
                ),
            );
        }
    }

    if (types.has('short')) {
        const { channelTitle: title, entries } = await fetchAtomFeedEntries(
            channelId,
            { playlistId: channelPlaylistId(channelId, 'UUSH') },
        );
        channelTitle = title;
        for (const entry of entries) {
            collected.push(
                mapAtomEntryToItem(
                    entry,
                    channelId,
                    channelTitle,
                    'short',
                    liveNowVideoIds,
                    channelAvatarUrl,
                ),
            );
        }
    }

    if (types.has('live')) {
        const { channelTitle: title, entries } = await fetchAtomFeedEntries(
            channelId,
            { playlistId: channelPlaylistId(channelId, 'UULV') },
        );
        channelTitle = title;
        for (const entry of entries) {
            collected.push(
                mapAtomEntryToItem(
                    entry,
                    channelId,
                    channelTitle,
                    'live',
                    liveNowVideoIds,
                    channelAvatarUrl,
                ),
            );
        }
    }

    if (types.has('podcast')) {
        const playlistIds = await discoverPodcastPlaylistIds(channelId, handle);
        const podcastBatches = await Promise.all(
            playlistIds.map((playlistId) =>
                fetchPodcastPlaylistItems(
                    channelId,
                    channelTitle,
                    playlistId,
                    liveNowVideoIds,
                    channelAvatarUrl,
                ),
            ),
        );
        for (const podcastItems of podcastBatches) {
            collected.push(...podcastItems);
        }
    }

    let postItems: Awaited<ReturnType<typeof fetchCommunityPostItems>> = [];
    if (types.has('post')) {
        postItems = await fetchCommunityPostItems(channelId, handle);
        if (postItems.length > 0) {
            const postTitle =
                (postItems[0]._extra as undefined | { channelTitle?: string })
                    ?.channelTitle ?? channelTitle;
            channelTitle = postTitle;
        }
    }

    const items = mergeYoutubeItems([...collected, ...postItems]);

    return {
        title: `${channelTitle} — YouTube`,
        link: `https://www.youtube.com/channel/${channelId}`,
        item: items,
        language: 'en',
    };
}
