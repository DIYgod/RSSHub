# IMPL-06: Tests (Vitest + MSW)

> **Target layout**: `tests/mocks/`, `tests/routes/spec/`  
> **Stack**: Vitest + `msw` (Node server mode)

RSSHub’s own tests usually live under `lib/` with Vitest config at repo root. The paths below are **spec targets** — place files where your Vitest `include` / `testMatch` already resolves (or mirror `lib/**/*.test.ts` patterns). Adjust imports (`@/routes/spec/...`) to match `tsconfig` paths.

## `tests/mocks/server.ts`

```typescript
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

## `tests/mocks/setup.ts`

```typescript
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './server';

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## `tests/mocks/handlers.ts`

```typescript
import { http, HttpResponse } from 'msw';

// ── YouTube ──────────────────────────────────────────────────────────────────
export const youtubeHandlers = [
    http.get('https://www.youtube.com/feeds/videos.xml', ({ request }) => {
        const url = new URL(request.url);
        const channelId = url.searchParams.get('channel_id') ?? 'UNKNOWN';
        return HttpResponse.xml(`<?xml version="1.0"?>
<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015">
  <title>Test Channel</title>
  <yt:channelId>${channelId}</yt:channelId>
  <entry>
    <yt:videoId>vid001</yt:videoId>
    <title>Test Video One</title>
    <link rel="alternate" href="https://www.youtube.com/watch?v=vid001"/>
    <published>2026-04-01T00:00:00Z</published>
    <author><name>Test Channel</name></author>
    <media:group xmlns:media="http://search.yahoo.com/mrss/">
      <media:thumbnail url="https://i.ytimg.com/vi/vid001/hqdefault.jpg"/>
      <media:description>A test video.</media:description>
    </media:group>
  </entry>
</feed>`);
    }),
];

// ── Viki ─────────────────────────────────────────────────────────────────────
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
            ],
        })
    ),
];

// ── Weverse ───────────────────────────────────────────────────────────────────
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
                    community: { name: 'Test Artist' },
                },
                {
                    postId: 'post002',
                    postType: 'ARTIST',
                    communityId: Number(params.communityId),
                    publishedAt: '2026-04-09T12:00:00Z',
                    body: 'Paid post content',
                    extension: { isPaid: true },
                    community: { name: 'Test Artist' },
                },
            ],
        });
    }),
];

// ── Bubble ────────────────────────────────────────────────────────────────────
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
                    artist: { name: 'Test Artist' },
                },
            ],
        });
    }),
];

// ── Netflix ───────────────────────────────────────────────────────────────────
export const netflixHandlers = [
    http.get('https://www.netflix.com/title/:titleId', () => HttpResponse.text('<html><body>window.netflix = {"BUILD_IDENTIFIER":"abc123"}</body></html>')),
    http.get('https://www.netflix.com/api/shakti/abc123/metadata', ({ request }) => {
        const cookie = request.headers.get('Cookie');
        if (!cookie) {
            return HttpResponse.json({}, { status: 401 });
        }
        return HttpResponse.json({
            video: {
                id: 80189175,
                title: 'Test Show',
                type: 'show',
                maturity: { rating: { value: 'TV-MA' } },
                seasons: [
                    {
                        seq: 1,
                        episodes: [
                            {
                                episodeId: 80189176,
                                seq: 1,
                                title: 'Pilot',
                                synopsis: 'The first episode.',
                                stills: [{ url: 'https://example.com/still.jpg' }],
                            },
                        ],
                    },
                ],
            },
        });
    }),
];

export const handlers = [...youtubeHandlers, ...vikiHandlers, ...weverseHandlers, ...bubbleHandlers, ...netflixHandlers];
```

## `tests/routes/spec/youtube.test.ts`

```typescript
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { server } from '../../mocks/server';

async function callHandler(channelId: string) {
    const { route } = await import('@/routes/spec/youtube');
    const ctx = { req: { param: (k: string) => ({ channelId })[k] } } as any;
    return route.handler(ctx);
}

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('spec/youtube route', () => {
    it('happy path — returns items with _extra', async () => {
        const data = await callHandler('UCtest');
        expect(data.item).toBeDefined();
        expect(data.item!.length).toBeGreaterThan(0);
        const item = data.item![0];
        expect(item._extra?.platform).toBe('youtube');
        expect(item._extra?.type).toBe('youtube/video');
        expect(item._extra?.channelId).toBe('UCtest');
        expect(item._extra?.isMembershipOnly).toBe(false);
    });

    it('_extra matches snapshot', async () => {
        const data = await callHandler('UCtest');
        expect(data.item![0]._extra).toMatchSnapshot();
    });

    it('empty channel — returns empty item array', async () => {
        const { http, HttpResponse } = await import('msw');
        server.use(
            http.get('https://www.youtube.com/feeds/videos.xml', () => HttpResponse.xml(`<?xml version="1.0"?><feed xmlns:yt="http://www.youtube.com/xml/schemas/2015"><title>Empty</title><yt:channelId>UCempty</yt:channelId></feed>`))
        );
        const data = await callHandler('UCempty');
        expect(data.item).toEqual([]);
    });
});
```

## `tests/routes/spec/weverse.test.ts`

```typescript
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';

async function callHandler(communityId: string, token = 'valid-token') {
    process.env.WEVERSE_TOKEN = token;
    const { route } = await import('@/routes/spec/weverse');
    const ctx = { req: { param: (k: string) => ({ communityId })[k] } } as any;
    return route.handler(ctx);
}

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
    server.resetHandlers();
    delete process.env.WEVERSE_TOKEN;
});
afterAll(() => server.close());

describe('spec/weverse route', () => {
    it('happy path — returns posts', async () => {
        const data = await callHandler('46');
        expect(data.item!.length).toBe(2);
    });

    it('marks paid posts correctly', async () => {
        const data = await callHandler('46');
        const paid = data.item!.find((i) => i._extra?.isPaid === true);
        expect(paid).toBeDefined();
        expect(paid!.title).toContain('[Paid]');
    });

    it('auth missing — throws ERR_WEVERSE_TOKEN_MISSING', async () => {
        delete process.env.WEVERSE_TOKEN;
        const { route } = await import('@/routes/spec/weverse');
        const ctx = { req: { param: () => '46' } } as any;
        await expect(route.handler(ctx)).rejects.toMatchObject({ code: 'ERR_WEVERSE_TOKEN_MISSING' });
    });

    it('auth expired — throws ERR_WEVERSE_TOKEN_EXPIRED', async () => {
        server.use(http.get(/weverse\.io\/api\/v2\/post/, () => HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })));
        await expect(callHandler('46', 'EXPIRED')).rejects.toMatchObject({ code: 'ERR_WEVERSE_TOKEN_EXPIRED' });
    });

    it('_extra snapshot', async () => {
        const data = await callHandler('46');
        expect(data.item![0]._extra).toMatchSnapshot();
    });
});
```

## Additional route tests

Add parallel suites for **viki**, **bubble**, and **netflix** using the same pattern:

- Happy path (items + `_extra` shape)
- Auth missing / expired (401/403) where applicable
- Empty responses
- Optional `_extra` snapshots

`handlers.ts` already contains the HTTP stubs needed for those platforms.
