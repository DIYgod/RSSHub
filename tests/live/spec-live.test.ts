import { describe, expect, it } from 'vitest';

import { assertSpecExtra } from '@/types/spec-extra.zod';

const LIVE = process.env.LIVE_TESTS === '1';

type RouteHandler = (ctx: any) => Promise<{ item?: Array<{ _extra?: unknown }> }>;

async function handlerExtras(route: { handler: RouteHandler }, paramKey: string, paramValue: string, query?: Record<string, string>) {
    const ctx = {
        req: {
            param: (k: string) => ({ [paramKey]: paramValue })[k],
            query: (k: string) => query?.[k],
        },
    } as any;
    const data = await route.handler(ctx);
    return data.item ?? [];
}

describe.skipIf(!LIVE)('LIVE: spec routes against real upstreams', () => {
    it('youtube — real channel returns contract-valid _extra', async () => {
        const { route } = await import('@/routes/spec/youtube');
        const items = await handlerExtras(route, 'channelId', 'UCjI0A18uEH8ivCRsbO9cI6w');
        expect(items.length).toBeGreaterThan(0);
        for (const item of items) {
            expect(() => assertSpecExtra(item._extra)).not.toThrow();
        }
    }, 30000);

    it('naver-blog — webhackyo returns contract-valid _extra', async () => {
        const { route } = await import('@/routes/spec/naver-blog');
        const items = await handlerExtras(route, 'blogId', 'webhackyo');
        expect(items.length).toBeGreaterThan(0);
        for (const item of items) {
            expect(() => assertSpecExtra(item._extra)).not.toThrow();
        }
    }, 30000);

    it('naver-webtoon — 848000 returns contract-valid _extra', async () => {
        const { route } = await import('@/routes/spec/naver-webtoon');
        const items = await handlerExtras(route, 'titleId', '848000');
        expect(items.length).toBeGreaterThan(0);
        for (const item of items) {
            expect(() => assertSpecExtra(item._extra)).not.toThrow();
        }
    }, 60000);

    describe.skipIf(!process.env.TMDB_API_KEY)('netflix', () => {
        it('Squid Game title returns contract-valid _extra', async () => {
            const { route } = await import('@/routes/spec/netflix');
            const items = await handlerExtras(route, 'netflixTitleId', '81249997');
            expect(items.length).toBeGreaterThan(0);
            for (const item of items) {
                expect(() => assertSpecExtra(item._extra)).not.toThrow();
            }
        }, 30000);
    });

    describe.skipIf(!process.env.WEVERSE_TOKEN)('weverse', () => {
        it('EXID community returns contract-valid _extra', async () => {
            const { route } = await import('@/routes/spec/weverse');
            const items = await handlerExtras(route, 'artistId', '3-EXID');
            expect(items.length).toBeGreaterThan(0);
            for (const item of items) {
                expect(() => assertSpecExtra(item._extra)).not.toThrow();
            }
        }, 30000);
    });

    describe.skipIf(!process.env.BUBBLE_COOKIE)('bubble', () => {
        it('artist room returns contract-valid _extra', async () => {
            const { route } = await import('@/routes/spec/bubble');
            const items = await handlerExtras(route, 'artistId', '12345');
            expect(items.length).toBeGreaterThan(0);
            for (const item of items) {
                expect(() => assertSpecExtra(item._extra)).not.toThrow();
            }
        }, 30000);
    });

    it('viki — real title returns contract-valid _extra or skips when API blocked', async () => {
        const { route } = await import('@/routes/spec/viki');
        try {
            const items = await handlerExtras(route, 'titleId', '37648c');
            expect(items.length).toBeGreaterThan(0);
            for (const item of items) {
                expect(() => assertSpecExtra(item._extra)).not.toThrow();
            }
        } catch (error: any) {
            if (error?.code === 'ERR_VIKI_AUTH') {
                return;
            }
            throw error;
        }
    }, 30000);
});
