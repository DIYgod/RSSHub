import { Context } from 'hono';
import { describe, expect, it, vi } from 'vitest';

import { config } from '@/config';
import template from '@/middleware/template';

const createCtx = (query: Record<string, string | undefined>, data: any, extra: { json?: { ok: boolean }; apiData?: { ok: boolean }; redirect?: string } = {}) => {
    const url = new URL('http://localhost/rss');
    for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) {
            url.searchParams.set(key, value);
        }
    }
    const ctx = new Context(new Request(url), { env: {}, path: url.pathname });
    ctx.set('data', data);
    for (const [key, value] of Object.entries(extra)) {
        ctx.set(key, value);
    }

    return Object.assign(ctx, {
        json: vi.fn((payload) => payload),
        html: vi.fn((payload) => payload),
        render: vi.fn((payload) => payload),
        body: vi.fn((payload) => payload),
        redirect: vi.fn((redirectUrl: string, status: number) => ({ url: redirectUrl, status })),
        header: vi.fn(),
    });
};

describe('template middleware', () => {
    it('returns debug json when requested', async () => {
        const originalDebug = config.debugInfo;
        config.debugInfo = 'true';

        const ctx = createCtx({ format: 'debug.json' }, { item: [] }, { json: { ok: true } });
        const result = await template(ctx, async () => {});

        expect(result).toEqual({ ok: true });
        expect(ctx.json).toHaveBeenCalled();

        config.debugInfo = originalDebug;
    });

    it('returns api data without rendering', async () => {
        const ctx = createCtx({}, null, { apiData: { ok: true } });
        const result = await template(ctx, async () => {});

        expect(result).toEqual({ ok: true });
        expect(ctx.json).toHaveBeenCalledWith({ ok: true });
    });

    it('renders debug html snippet when requested', async () => {
        const originalDebug = config.debugInfo;
        config.debugInfo = 'true';

        const ctx = createCtx({ format: '0.debug.html' }, { item: [{ description: 'Hello' }] });
        const result = await template(ctx, async () => {});

        expect(result).toBe('Hello');
        expect(ctx.html).toHaveBeenCalled();

        config.debugInfo = originalDebug;
    });

    it('trims long titles and normalizes authors', async () => {
        const originalLimit = config.titleLengthLimit;
        config.titleLengthLimit = 3;

        const data = {
            title: 'Feed',
            item: [
                {
                    title: 'ABCDE',
                    author: [{ name: ' Alice ' }, { name: 'Bob ' }],
                    itunes_duration: '65',
                },
            ],
        };
        const ctx = createCtx({ format: 'rss' }, data);
        await template(ctx, async () => {});

        expect(data.item[0].title).toBe('ABC...');
        expect(data.item[0].author).toBe('Alice, Bob');
        expect(data.item[0].itunes_duration).toBe('0:01:05');

        config.titleLengthLimit = originalLimit;
    });

    it('clears invalid dates for non-rss formats', async () => {
        const data = {
            title: 'Test',
            item: [
                {
                    title: 'Item',
                    pubDate: 'invalid-date',
                    updated: 'invalid-updated',
                },
            ],
        };
        const ctx = createCtx({ format: 'json' }, data);
        await template(ctx, async () => {});

        expect(data.item[0].pubDate).toBe('');
        expect(data.item[0].updated).toBe('');
    });

    it('returns redirect response when redirect is set', async () => {
        const ctx = createCtx({}, { item: [] }, { redirect: 'https://example.com' });
        const result = await template(ctx, async () => {});

        expect(result).toEqual({ url: 'https://example.com', status: 301 });
        expect(ctx.redirect).toHaveBeenCalledWith('https://example.com', 301);
    });

    it('renders rss3 output', async () => {
        const data = {
            title: 'Test',
            item: [
                {
                    title: 'Item',
                    link: 'https://example.com/item',
                },
            ],
        };
        const ctx = createCtx({ format: 'rss3' }, data);
        const result = await template(ctx, async () => {});

        expect(ctx.json).toHaveBeenCalled();
        expect(result).toHaveProperty('data');
    });

    it('renders atom output', async () => {
        const data = {
            title: 'Test',
            item: [
                {
                    title: 'Item',
                    link: 'https://example.com/item',
                },
            ],
        };
        const ctx = createCtx({ format: 'atom' }, data);
        await template(ctx, async () => {});

        expect(ctx.render).toHaveBeenCalled();
    });
});
