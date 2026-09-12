import type { Context } from 'hono';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { route as hotukdealsRoute } from '../lib/routes/hotukdeals/hottest';
import { getNSFWNovelContent } from '../lib/routes/pixiv/novel-api/content/nsfw';
import { parseNovelContent } from '../lib/routes/pixiv/novel-api/content/utils';
import playCache from '../lib/routes/qq/kg/cache';
import { route as qqRoute } from '../lib/routes/qq/kg/user';
import { route as xueqiuRoute } from '../lib/routes/xueqiu/column';
import type { Data, Route } from '../lib/types';

const mocks = vi.hoisted(() => ({
    request: Object.assign(vi.fn(), { get: vi.fn() }),
    pixivRequest: vi.fn(),
    tryGet: vi.fn(),
}));

vi.mock('../lib/utils/got', () => ({ default: mocks.request }));
vi.mock('../lib/utils/cache', () => ({ default: { tryGet: mocks.tryGet } }));
vi.mock('../lib/routes/pixiv/pixiv-got', () => ({ default: mocks.pixivRequest }));
vi.mock('../lib/routes/pixiv/novel-api/content/utils', () => ({ parseNovelContent: vi.fn() }));

const invoke = async (route: Route, params: Record<string, string> = {}) => (await route.handler({ req: { param: (name: string) => params[name] } } as unknown as Context)) as Data;
const page = (source: string) => `<script>throw new Error('Browser scripts must not execute');</script><script>${source}</script>`;

// QQ and Xueqiu use the JSON-assignment format observed in public responses on
// 2026-09-06. Keep only the consumed fields and replace public account data.
const playDetail = {
    song_name: 'Song & title',
    content: 'Line one<br>Line two &amp; three',
    nick: 'Singer',
    cover: 'https://example.com/cover.jpg',
    playurl: 'https://example.com/song.m4a',
    ksong_mid: 'song-1',
    ctime: 1_700_000_000,
    comments: [{ nick: 'Listener', content: 'Nice song', ctime: 1_700_000_001, comment_id: 'comment-1' }],
};

// Pixiv requires authentication and HotUKDeals returned 403 during inspection.
// Their fixtures cover the existing consumed-data contract, not live success.
const novelDetail = {
    id: '42',
    title: 'Novel title',
    caption: '<p>Caption &amp; summary</p>',
    text: 'A line\n[uploadedimage:7]',
    userId: 'author-1',
    rating: { bookmark: 3, view: 12, like: 2 },
    cdate: '2026-09-01T10:00:00+09:00',
    isOriginal: true,
    aiType: 0,
    tags: ['fiction'],
    coverUrl: 'https://example.com/novel.jpg',
    images: { '7': { urls: { original: 'https://example.com/image.jpg' } }, '8': {} },
    seriesId: 'series-1',
    seriesTitle: 'Series title',
};

beforeEach(() => {
    vi.resetAllMocks();
    const entries = new Map<string, unknown>();
    mocks.tryGet.mockImplementation(async (key, getValue) => {
        if (!entries.has(key)) {
            entries.set(key, await getValue());
        }
        return entries.get(key);
    });
    mocks.request.mockRejectedValue(new Error('Unexpected upstream request'));
    mocks.request.get.mockRejectedValue(new Error('Unexpected upstream request'));
    mocks.pixivRequest.mockRejectedValue(new Error('Unexpected Pixiv request'));
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('External network access is disabled')));
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('routes that parse embedded page data', () => {
    it('preserves QQ user feed metadata, audio attachments and play-detail cache keys', async () => {
        const userData = {
            data: {
                nickname: 'Singer',
                head_img_url: 'https://example.com/avatar.jpg',
                ugclist: [{ shareid: 'share-1', ksong_mid: 'song-1', title: 'Song & title', ctime: 1_600_000_000, avatar: 'https://example.com/fallback.jpg' }],
            },
            share: { content: 'Singer profile' },
        };
        mocks.request.mockResolvedValueOnce({ data: page(`window.__DATA__ = ${JSON.stringify(userData)};`) }).mockResolvedValueOnce({ data: page(`window.__DATA__ = ${JSON.stringify({ detail: playDetail })};`) });

        const result = await invoke(qqRoute, { userId: 'singer-1' });

        expect(result).toMatchObject({
            title: 'Singer - 全民K歌',
            link: 'https://node.kg.qq.com/personal?uid=singer-1',
            description: 'Singer profile',
            image: 'https://example.com/avatar.jpg',
            allowEmpty: true,
            itunes_author: 'Singer',
            itunes_category: '全民K歌',
            item: [
                {
                    title: 'Song & title',
                    description: playDetail.content,
                    link: 'https://node.kg.qq.com/play?s=share-1',
                    guid: 'ksong:song-1',
                    author: 'Singer',
                    pubDate: new Date(1_700_000_000_000),
                    itunes_item_image: playDetail.cover,
                    enclosure_url: playDetail.playurl,
                    enclosure_type: 'audio/x-m4a',
                },
            ],
        });
        expect(mocks.tryGet).toHaveBeenCalledWith('ksong:song-1', expect.any(Function));
        expect(mocks.request.mock.calls.map(([url]) => url)).toEqual(['https://node.kg.qq.com/personal?uid=singer-1', 'https://node.kg.qq.com/play?s=share-1']);
    });

    it('preserves QQ comments and reuses a play-detail cache entry', async () => {
        mocks.request.mockResolvedValueOnce({ data: page(`window.__DATA__ = ${JSON.stringify({ detail: playDetail })};`) });

        const first = await playCache.getPlayInfo(undefined, 'share-1', 'song-1');
        const second = await playCache.getPlayInfo(undefined, 'share-1', 'song-1');

        expect(first).toMatchObject({ name: playDetail.song_name, description: playDetail.content, author: 'Singer', ksong_mid: 'song-1', comments: playDetail.comments });
        expect(second).toBe(first);
        expect(mocks.request).toHaveBeenCalledExactlyOnceWith('https://node.kg.qq.com/play?s=share-1');
    });

    it('preserves the Xueqiu cookie jar, first-page request and author data', async () => {
        mocks.request
            .mockResolvedValueOnce({ data: '' })
            .mockResolvedValueOnce({ data: page('window.SNOWMAN_TARGET = {"screen_name":"Author & name","description":"A profile &amp; text"};') })
            .mockResolvedValueOnce({ data: { list: [{ title: 'Article', description: '<p>Body</p>', created_at: 1_700_000_000_000, target: '/author/123' }] } });

        const result = await invoke(xueqiuRoute, { id: 'author-1' });

        expect(result).toEqual({
            title: 'Author & name - 雪球',
            link: 'https://xueqiu.com/author-1/column',
            description: 'A profile &amp; text',
            item: [{ title: 'Article', description: '<p>Body</p>', pubDate: new Date(1_700_000_000_000), link: 'https://xueqiu.com/author/123', author: 'Author & name' }],
        });
        const cookieJar = mocks.request.mock.calls[0][1].cookieJar;
        expect(mocks.request).toHaveBeenNthCalledWith(2, 'https://xueqiu.com/author-1/column', { cookieJar });
        expect(mocks.request).toHaveBeenNthCalledWith(3, 'https://xueqiu.com/statuses/original/timeline.json', { cookieJar, searchParams: { user_id: 'author-1', page: 1 } });
    });

    it('preserves HotUKDeals titles, image URLs, prices and temperatures', async () => {
        const state = { widgets: { hottestWidget: { threads: [{ title: 'A &amp; B deal', mainImage: { path: 'images', name: 'deal' }, temperature: 123, displayPrice: '£12.99', url: 'https://example.com/deal' }] } } };
        mocks.request.get.mockResolvedValueOnce({ data: page(`window.__INITIAL_STATE__ = ${JSON.stringify(state)};`) });

        expect(await invoke(hotukdealsRoute)).toEqual({
            title: 'hotukdeals hottest',
            link: 'https://www.hotukdeals.com/',
            item: [{ title: 'A &amp; B deal', description: '<img src="https://images.hotukdeals.com/images/deal/re/768x768/qt/60/deal.jpg"><br>123° A &amp; B deal<br>£12.99', link: 'https://example.com/deal' }],
        });
        expect(mocks.request.get).toHaveBeenCalledExactlyOnceWith('https://www.hotukdeals.com/');
    });

    it.each(['parent object', 'nested assignment'])('preserves authenticated Pixiv novel data from a %s', async (form) => {
        const source = form === 'parent object' ? `window.pixiv = {novel: ${JSON.stringify(novelDetail)}};` : `window.pixiv = {};</script><script>pixiv.novel = ${JSON.stringify(novelDetail)};`;
        mocks.pixivRequest.mockResolvedValueOnce({ data: page(source) });
        vi.mocked(parseNovelContent).mockResolvedValueOnce('<p>Rendered novel</p>');

        const result = await getNSFWNovelContent('42', 'test-token');

        expect(result).toEqual({
            id: '42',
            title: 'Novel title',
            description: novelDetail.caption,
            content: '<p>Rendered novel</p>',
            userId: 'author-1',
            userName: null,
            bookmarkCount: 3,
            viewCount: 12,
            likeCount: 2,
            createDate: new Date('2026-09-01T01:00:00Z'),
            updateDate: null,
            isOriginal: true,
            aiType: 0,
            tags: ['fiction'],
            coverUrl: novelDetail.coverUrl,
            images: { '7': 'https://example.com/image.jpg' },
            seriesId: 'series-1',
            seriesTitle: 'Series title',
        });
        expect(parseNovelContent).toHaveBeenCalledExactlyOnceWith(novelDetail.text, { '7': 'https://example.com/image.jpg' }, 'test-token');
        expect(mocks.pixivRequest).toHaveBeenCalledWith(
            'https://app-api.pixiv.net/webview/v2/novel',
            expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer test-token' }), searchParams: 'id=42&viewer_version=20221031_ai' })
        );
        expect(mocks.tryGet).toHaveBeenCalledWith('https://app-api.pixiv.net/webview/v2/novel:42', expect.any(Function));
        expect(await getNSFWNovelContent('42', 'test-token')).toBe(result);
        expect(mocks.pixivRequest).toHaveBeenCalledOnce();
    });

    it('rejects missing Pixiv novel data instead of returning an empty novel', async () => {
        mocks.pixivRequest.mockResolvedValueOnce({ data: '<html><body>Login required</body></html>' });

        await expect(getNSFWNovelContent('42', 'test-token')).rejects.toThrow('No novel data found');
        expect(parseNovelContent).not.toHaveBeenCalled();
    });

    it('rejects missing page state instead of accepting a blocked HotUKDeals page', async () => {
        mocks.request.get.mockResolvedValueOnce({ data: '<html><body>Access denied</body></html>' });

        await expect(invoke(hotukdealsRoute)).rejects.toThrow();
    });
});
