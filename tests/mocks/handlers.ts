import { http, HttpResponse } from 'msw';

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

// ── YouTube ─────────────────────────────────────────────────────────────────
export const youtubeHandlers = [
    http.get('https://www.youtube.com/feeds/videos.xml', ({ request }) => {
        const url = new URL(request.url);
        const channelId = url.searchParams.get('channel_id') ?? 'UCtest';
        return HttpResponse.xml(`<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:yt="http://www.youtube.com/xml/schemas/2015" xmlns:media="http://search.yahoo.com/mrss/">
  <title>Test Channel</title>
  <yt:channelId>${channelId}</yt:channelId>
  <entry>
    <yt:videoId>vid001</yt:videoId>
    <title>Test Video One</title>
    <link rel="alternate" href="https://www.youtube.com/watch?v=vid001"/>
    <published>2026-04-01T00:00:00Z</published>
    <updated>2026-04-01T00:00:00Z</updated>
    <author><name>Test Channel</name></author>
    <media:group>
      <media:thumbnail url="https://i.ytimg.com/vi/vid001/hqdefault.jpg"/>
      <media:description>A test video.</media:description>
    </media:group>
  </entry>
  <entry>
    <yt:videoId>vid002</yt:videoId>
    <title>Test Video Two</title>
    <link rel="alternate" href="https://www.youtube.com/watch?v=vid002"/>
    <published>2026-03-30T00:00:00Z</published>
    <updated>2026-03-30T00:00:00Z</updated>
    <author><name>Test Channel</name></author>
    <media:group>
      <media:thumbnail url="https://i.ytimg.com/vi/vid002/hqdefault.jpg"/>
      <media:description>Another test video.</media:description>
    </media:group>
  </entry>
</feed>`);
    }),
];

// ── Viki ────────────────────────────────────────────────────────────────────
export const vikiHandlers = [
    http.get('https://api.viki.io/v4/containers/:titleId', ({ params }) =>
        HttpResponse.json({
            id: params.titleId,
            titles: { en: 'Test Drama' },
            images: { poster: { main: { url: 'https://example.com/poster.jpg' } } },
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
                    artist: { name: 'Test Artist', profileImageUrl: 'https://example.com/avatar.jpg' },
                },
                {
                    messageId: 'msg002',
                    artistId: '12345',
                    roomId: '12345',
                    messageType: 'IMAGE',
                    body: 'A new photo',
                    thumbnailUrl: 'https://example.com/thumb.jpg',
                    createdAt: '2026-04-09T08:00:00Z',
                    artist: { name: 'Test Artist', profileImageUrl: 'https://example.com/avatar.jpg' },
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

export const handlers = [...youtubeHandlers, ...vikiHandlers, ...weverseHandlers, ...bubbleHandlers, ...netflixHandlers];
