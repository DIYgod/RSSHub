import { readFileSync } from 'node:fs';
import path from 'node:path';

import { http, HttpResponse } from 'msw';

const fixturesDir = path.join(import.meta.dirname, '../fixtures');
const naverBlogRssXml = readFileSync(path.join(fixturesDir, 'naver-blog-webhackyo.xml'), 'utf-8');
const naverWebtoonListHtml = readFileSync(path.join(fixturesDir, 'naver-webtoon-848000-list.html'), 'utf-8');
const naverWebtoonDetailHtml = readFileSync(path.join(fixturesDir, 'naver-webtoon-848000-detail.html'), 'utf-8');

/**
 * MSW handlers for the 5 SPEC route upstream APIs.
 *
 * Endpoints match the real route code in `lib/routes/spec/<platform>.ts`:
 *   - YouTube Atom feed:    https://www.youtube.com/feeds/videos.xml
 *   - Viki REST containers: https://api.viki.io/v4/containers/{titleId}(/episodes)
 *   - Weverse community:    https://weverse.io/api/v2/post/v1.0/community-{id}/feedList
 *   - Bubble messages:      https://api.bubblem.io/v1/rooms/{artistId}/messages
 *   - Netflix/TMDB bridge:  netflix.com/title/{id} + api.themoviedb.org/3/{find,tv,season}
 *
 * Note: per `docs/impl/IMPL-06-tests.md` design doc, these are small but
 * realistic JSON / XML payloads that exercise the route's mapping. Keep
 * identifiers stable — fixtures in `tests/fixtures/` mirror this output.
 */

/** 22-char tail after `UC` — matches `/^UC[\w-]{21}[AQgw]$/` test channels. */
const TEST_CHANNEL_SUFFIX = 'aaaaaaaaaaaaaaaaaaaaaA';
const TEST_CHANNEL_ID = `UC${TEST_CHANNEL_SUFFIX}`;

function testPlaylistId(prefix: 'UULF' | 'UUSH' | 'UULV'): string {
    return `${prefix}${TEST_CHANNEL_SUFFIX}`;
}

function atomEntry(videoId: string, title: string, published: string, link?: string): string {
    const href = link ?? `https://www.youtube.com/watch?v=${videoId}`;
    return `
  <entry>
    <yt:videoId>${videoId}</yt:videoId>
    <title>${title}</title>
    <link rel="alternate" href="${href}"/>
    <published>${published}</published>
    <updated>${published}</updated>
    <author><name>Test Channel</name></author>
    <media:group>
      <media:thumbnail url="https://i.ytimg.com/vi/${videoId}/hqdefault.jpg"/>
      <media:description>A test entry.</media:description>
    </media:group>
  </entry>`;
}

function atomFeed(channelId: string, entries: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:yt="http://www.youtube.com/xml/schemas/2015" xmlns:media="http://search.yahoo.com/mrss/">
  <title>Test Channel</title>
  <yt:channelId>${channelId}</yt:channelId>
  ${entries}
</feed>`;
}

// ── YouTube ─────────────────────────────────────────────────────────────────
export const youtubeHandlers = [
    http.get('https://www.youtube.com/feeds/videos.xml', ({ request }) => {
        const url = new URL(request.url);
        const channelId = url.searchParams.get('channel_id') ?? TEST_CHANNEL_ID;
        const playlistId = url.searchParams.get('playlist_id');

        if (playlistId === testPlaylistId('UULF')) {
            return HttpResponse.xml(atomFeed(channelId, [atomEntry('vid001', 'Test Video One', '2026-04-01T00:00:00Z'), atomEntry('vid002', 'Test Video Two', '2026-03-30T00:00:00Z')].join('')));
        }

        if (playlistId === testPlaylistId('UUSH')) {
            return HttpResponse.xml(atomFeed(channelId, atomEntry('short001', 'Test Short', '2026-04-02T00:00:00Z', 'https://www.youtube.com/shorts/short001')));
        }

        if (playlistId === testPlaylistId('UULV')) {
            return HttpResponse.xml(atomFeed(channelId, atomEntry('live001', 'Test Live Replay', '2026-04-03T00:00:00Z')));
        }

        // Legacy channel_id requests (empty — route uses playlist feeds now).
        return HttpResponse.xml(atomFeed(channelId, ''));
    }),
    http.get('https://www.youtube.com/channel/:channelId/posts', () =>
        HttpResponse.text(
            `<html><script>ytInitialData = ${JSON.stringify({
                metadata: {
                    channelMetadataRenderer: {
                        title: 'Test Channel',
                        channelUrl: `https://www.youtube.com/channel/${TEST_CHANNEL_ID}`,
                    },
                },
                contents: {
                    twoColumnBrowseResultsRenderer: {
                        tabs: [
                            {
                                tabRenderer: {
                                    endpoint: {
                                        commandMetadata: {
                                            webCommandMetadata: {
                                                url: '/channel/posts',
                                            },
                                        },
                                    },
                                    content: {
                                        sectionListRenderer: {
                                            contents: [
                                                {
                                                    itemSectionRenderer: {
                                                        contents: [
                                                            {
                                                                backstagePostThreadRenderer: {
                                                                    post: {
                                                                        backstagePostRenderer: {
                                                                            postId: 'post001',
                                                                            contentText: {
                                                                                runs: [
                                                                                    {
                                                                                        text: 'Hello community!',
                                                                                    },
                                                                                ],
                                                                            },
                                                                            authorText: {
                                                                                runs: [
                                                                                    {
                                                                                        text: 'Test Channel',
                                                                                    },
                                                                                ],
                                                                            },
                                                                            publishedTimeText: {
                                                                                runs: [
                                                                                    {
                                                                                        text: '2 days ago',
                                                                                    },
                                                                                ],
                                                                            },
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                        ],
                                                    },
                                                },
                                            ],
                                        },
                                    },
                                },
                            },
                        ],
                    },
                },
            })};</script></html>`,
            { headers: { 'Content-Type': 'text/html' } }
        )
    ),
];

// ── Viki ────────────────────────────────────────────────────────────────────
export const vikiHandlers = [
    http.get('https://api.viki.io/v4/containers/:titleId', ({ params }) =>
        HttpResponse.json({
            id: params.titleId,
            titles: { en: 'Test Drama' },
            images: {
                poster: { main: { url: 'https://example.com/poster.jpg' } },
            },
            genres: [{ title: 'Drama' }, { title: 'Romance' }],
        })
    ),
    http.get('https://api.viki.io/v4/containers/:titleId/episodes', () =>
        HttpResponse.json({
            response: [
                {
                    id: 'ep001',
                    titles: { en: 'Episode 1' },
                    number: 1,
                    season_number: 1,
                    air_dates: { start: '2026-03-01' },
                    flags: { regional_lockdown: false },
                },
                {
                    id: 'ep002',
                    titles: { en: 'Episode 2' },
                    number: 2,
                    season_number: 1,
                    air_dates: { start: '2026-03-08' },
                    flags: { regional_lockdown: true },
                },
            ],
        })
    ),
];

// ── Weverse ─────────────────────────────────────────────────────────────────
export const weverseHandlers = [
    http.get('https://weverse.io/api/v2/post/v1.0/community-:communityId/feedList', ({ request, params }) => {
        const auth = request.headers.get('Authorization');
        if (!auth || auth === 'Bearer EXPIRED') {
            return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        return HttpResponse.json({
            data: [
                {
                    postId: 'post001',
                    postType: 'ARTIST',
                    communityId: Number(params.communityId),
                    publishedAt: '2026-04-10T12:00:00Z',
                    body: 'Hello fans!',
                    extension: { isPaid: false },
                    artist: { name: 'Test Artist' },
                    community: { name: 'Test Artist Community' },
                },
                {
                    postId: 'post002',
                    postType: 'ARTIST',
                    communityId: Number(params.communityId),
                    publishedAt: '2026-04-09T12:00:00Z',
                    body: 'Paid post content',
                    extension: { isPaid: true },
                    artist: { name: 'Test Artist' },
                    community: { name: 'Test Artist Community' },
                },
            ],
        });
    }),
];

// ── Bubble ──────────────────────────────────────────────────────────────────
export const bubbleHandlers = [
    http.get('https://api.bubblem.io/v1/rooms/:artistId/messages', ({ request }) => {
        const cookie = request.headers.get('Cookie');
        if (!cookie || cookie === 'EXPIRED') {
            return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        return HttpResponse.json({
            messages: [
                {
                    messageId: 'msg001',
                    artistId: '12345',
                    roomId: '12345',
                    messageType: 'TEXT',
                    body: 'Good morning!',
                    createdAt: '2026-04-10T08:00:00Z',
                    artist: {
                        name: 'Test Artist',
                        profileImageUrl: 'https://example.com/avatar.jpg',
                    },
                },
                {
                    messageId: 'msg002',
                    artistId: '12345',
                    roomId: '12345',
                    messageType: 'IMAGE',
                    body: 'A new photo',
                    thumbnailUrl: 'https://example.com/thumb.jpg',
                    createdAt: '2026-04-09T08:00:00Z',
                    artist: {
                        name: 'Test Artist',
                        profileImageUrl: 'https://example.com/avatar.jpg',
                    },
                },
            ],
        });
    }),
];

// ── Netflix ─────────────────────────────────────────────────────────────────
// Netflix + TMDB bridge: route hits netflix.com/title/:id, then TMDB find +
// series + season endpoints. We provide a complete happy-path set.
const TMDB_FIND_RESPONSE = {
    tv_results: [{ id: 93405 }],
    movie_results: [],
};

const TMDB_SERIES_RESPONSE = {
    id: 93405,
    name: 'Squid Game',
    overview: 'A survival drama.',
    poster_path: '/dDlEmu3EZ0Pbg93sM2C25feAVqU.jpg',
    number_of_seasons: 3,
    genres: [{ id: 18, name: 'Drama' }],
};

const TMDB_SEASON_RESPONSE = {
    season_number: 3,
    episodes: [
        {
            id: 3_803_953,
            name: 'The Key to the Front Door',
            overview: 'The finale.',
            still_path: '/test-still.jpg',
            air_date: '2025-06-27',
            season_number: 3,
            episode_number: 6,
        },
    ],
};

export const netflixHandlers = [
    http.get('https://www.netflix.com/title/:netflixTitleId', () => HttpResponse.text('<html><head><meta property="imdb:pageConst" content="tt10919420"/></head><body>window.netflix = {"BUILD_IDENTIFIER":"abc123"}</body></html>')),
    http.get('https://api.themoviedb.org/3/find/:externalId', ({ request }) => {
        const url = new URL(request.url);
        if (!url.searchParams.get('api_key')) {
            return HttpResponse.json({ status_message: 'API key missing' }, { status: 401 });
        }
        return HttpResponse.json(TMDB_FIND_RESPONSE);
    }),
    http.get('https://api.themoviedb.org/3/tv/:tmdbId', ({ request }) => {
        const url = new URL(request.url);
        if (!url.searchParams.get('api_key')) {
            return HttpResponse.json({ status_message: 'API key missing' }, { status: 401 });
        }
        return HttpResponse.json(TMDB_SERIES_RESPONSE);
    }),
    http.get('https://api.themoviedb.org/3/tv/:tmdbId/season/:seasonNumber', ({ request }) => {
        const url = new URL(request.url);
        if (!url.searchParams.get('api_key')) {
            return HttpResponse.json({ status_message: 'API key missing' }, { status: 401 });
        }
        return HttpResponse.json(TMDB_SEASON_RESPONSE);
    }),
    // Season 2 fallback (the Netflix route fetches both latest + previous
    // season). We return the same episode shape; the test only checks the
    // most recently published item.
    http.get('https://api.themoviedb.org/3/tv/:tmdbId/season/2', ({ request }) => {
        const url = new URL(request.url);
        if (!url.searchParams.get('api_key')) {
            return HttpResponse.json({ status_message: 'API key missing' }, { status: 401 });
        }
        return HttpResponse.json({
            season_number: 2,
            episodes: [
                {
                    id: 3_803_954,
                    name: 'Old Episode',
                    overview: 'An older episode.',
                    still_path: '/old-still.jpg',
                    air_date: '2024-12-26',
                    season_number: 2,
                    episode_number: 1,
                },
            ],
        });
    }),
];

// ── Naver Blog ──────────────────────────────────────────────────────────────
export const naverBlogHandlers = [http.get('https://rss.blog.naver.com/:blogId.xml', () => HttpResponse.text(naverBlogRssXml, { headers: { 'Content-Type': 'application/xml' } }))];

// ── Naver Webtoon ───────────────────────────────────────────────────────────
export const naverWebtoonHandlers = [
    http.get('https://m.comic.naver.com/webtoon/list', () => HttpResponse.text(naverWebtoonListHtml)),
    http.get('https://comic.naver.com/webtoon/list', () => HttpResponse.text(naverWebtoonListHtml)),
    http.get('https://m.comic.naver.com/webtoon/detail', () => HttpResponse.text(naverWebtoonDetailHtml)),
];

// ── Bluesky (public API) ────────────────────────────────────────────────────
const BSKY_DID = 'did:plc:z72i7hdynmk6r22z27h6tvur';
const BSKY_HANDLE = 'bsky.app';
const BSKY_RKEY = '3kxyzabc';

export const bskyHandlers = [
    http.get('https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle', () => HttpResponse.json({ did: BSKY_DID })),
    http.get('https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile', () =>
        HttpResponse.json({
            did: BSKY_DID,
            handle: BSKY_HANDLE,
            displayName: 'Bluesky',
            description: 'Official Bluesky account',
            avatar: 'https://cdn.bsky.app/avatar.jpg',
        })
    ),
    http.get('https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed', () =>
        HttpResponse.json({
            feed: [
                {
                    post: {
                        uri: `at://${BSKY_DID}/app.bsky.feed.post/${BSKY_RKEY}`,
                        cid: 'bafytest',
                        author: {
                            did: BSKY_DID,
                            handle: BSKY_HANDLE,
                            displayName: 'Bluesky',
                        },
                        record: {
                            text: 'Hello from Bluesky fixture',
                            createdAt: '2026-04-01T12:00:00.000Z',
                        },
                        likeCount: 1,
                        replyCount: 0,
                    },
                },
            ],
        })
    ),
];

// ── Instagram (guest web_profile_info) ──────────────────────────────────────
const IG_USERNAME = 'instagram';
const IG_SHORTCODE = 'AbCdEfGhIjK';
const IG_MEDIA_ID = '3000000000000000001';

export const instagramHandlers = [
    http.get('https://www.instagram.com/api/v1/users/web_profile_info/', () =>
        HttpResponse.json({
            data: {
                user: {
                    id: '25025320',
                    username: IG_USERNAME,
                    full_name: 'Instagram',
                    biography: 'Test profile',
                    profile_pic_url: 'https://instagram.com/avatar.jpg',
                    profile_pic_url_hd: 'https://instagram.com/avatar_hd.jpg',
                    edge_felix_video_timeline: { edges: [] },
                    edge_owner_to_timeline_media: {
                        edges: [
                            {
                                node: {
                                    __typename: 'GraphImage',
                                    id: IG_MEDIA_ID,
                                    shortcode: IG_SHORTCODE,
                                    display_url: 'https://instagram.com/media.jpg',
                                    dimensions: { height: 1080, width: 1080 },
                                    taken_at_timestamp: 1_775_044_800,
                                    owner: { username: IG_USERNAME },
                                    edge_media_to_caption: {
                                        edges: [{ node: { text: 'Hello from Instagram fixture' } }],
                                    },
                                },
                            },
                        ],
                    },
                },
            },
        })
    ),
];

export const handlers = [...youtubeHandlers, ...vikiHandlers, ...weverseHandlers, ...bubbleHandlers, ...netflixHandlers, ...naverBlogHandlers, ...naverWebtoonHandlers, ...bskyHandlers, ...instagramHandlers];
