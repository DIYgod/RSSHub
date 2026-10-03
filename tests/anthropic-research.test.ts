import { Hono } from 'hono';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { route } from '../lib/routes/anthropic/research';

const { fetchPage } = vi.hoisted(() => ({ fetchPage: vi.fn() }));

vi.mock('../lib/utils/ofetch', () => ({ default: fetchPage }));
vi.mock('../lib/utils/cache', () => ({
    default: { tryGet: (_key: string, callback: () => Promise<unknown>) => callback() },
}));

const posts = Array.from({ length: 25 }, (_, index) => ({
    title: `Research paper ${index + 1}`,
    slug: { current: `research-paper-${index + 1}` },
    publishedOn: '2026-01-01T16:00:00.000Z',
}));
const page = {
    sections: [
        { title: 'Featured', posts: posts.slice(0, 1) },
        { title: 'Publications', posts },
    ],
};

function mockHomepage(data: unknown) {
    const payload = JSON.stringify([1, `6:${JSON.stringify(data)}\n`]);
    const homepage = `<script>self.__next_f.push(${payload})</script>`;
    fetchPage.mockImplementation((url: string) => {
        if (url === 'https://www.anthropic.com/research') {
            return homepage;
        }
        return '<main id="main-content"><article><p>Research article body.</p></article></main>';
    });
}

function createApp() {
    const app = new Hono();
    app.get('/', async (ctx) => ctx.json(await route.handler(ctx)));
    return app;
}

beforeEach(() => {
    fetchPage.mockReset();
});

describe('Anthropic Research', () => {
    it.each([
        ['original page props', ['$', '$L1', null, { page }]],
        ['nested React children', ['$', '$L1', null, { children: [null, ['$', '$L2', null, { page }], '$L3'] }]],
    ])('reads Publications from %s and preserves the default limit', async (_name, data) => {
        mockHomepage(data);
        const response = await createApp().request('/');
        expect(response.status).toBe(200);
        const feed = await response.json();
        expect(feed.item).toHaveLength(20);
        expect(feed.item[0]).toEqual({
            title: 'Research paper 1',
            link: 'https://www.anthropic.com/research/research-paper-1',
            pubDate: '2026-01-01T16:00:00.000Z',
            description: '<p>Research article body.</p>',
        });
        expect(feed.item[19].title).toBe('Research paper 20');
        expect(fetchPage).toHaveBeenCalledTimes(21);
    });

    it('applies the requested limit before fetching article bodies', async () => {
        mockHomepage(['$', '$L1', null, { children: [null, ['$', '$L2', null, { page }]] }]);
        const response = await createApp().request('/?limit=2');
        const feed = await response.json();
        expect(feed.item.map((item: { title: string }) => item.title)).toEqual(['Research paper 1', 'Research paper 2']);
        expect(fetchPage).toHaveBeenCalledTimes(3);
    });

    it('does not include posts from other sections', async () => {
        mockHomepage(['$', '$L1', null, { page: { sections: [{ title: 'Featured', posts }] } }]);
        const response = await createApp().request('/');
        const feed = await response.json();
        expect(feed.item).toEqual([]);
        expect(fetchPage).toHaveBeenCalledTimes(1);
    });
});
