import '../../setup';

import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { assertSpecExtra } from '@/types/spec-extra.zod';
import jsonView from '@/views/json';

const fixture = JSON.parse(readFileSync(path.join(import.meta.dirname, '../../fixtures/spec-naver-blog.json'), 'utf-8')) as { _extras: unknown[] };

const BLOG_ID = 'webhackyo';

async function callHandler(blogId: string) {
    const { route } = await import('@/routes/spec/naver-blog');
    const ctx = {
        req: { param: (k: string) => ({ blogId })[k] },
    } as any;
    return route.handler(ctx);
}

describe('spec/naver-blog route', () => {
    it('matches snapshot — _extra shape matches the recorded fixture', async () => {
        const data = await callHandler(BLOG_ID);
        expect(data.item!.length).toBe(fixture._extras.length);
        expect(data.item!.map((i) => i._extra)).toEqual(fixture._extras);
    });

    it('happy path — returns posts with _extra', async () => {
        const data = await callHandler(BLOG_ID);
        expect(data.item!.length).toBeGreaterThan(0);
        const item = data.item![0];
        expect(item._extra?.platform).toBe('naver-blog');
        expect(item._extra?.type).toBe('naver/blog/post');
        expect(item._extra?.blogId).toBe(BLOG_ID);
        expect(item._extra?.authorId).toBe(BLOG_ID);
    });

    it('JSON feed view preserves _extra on each item', async () => {
        const data = await callHandler(BLOG_ID);
        const feed = JSON.parse(jsonView(data));
        expect(feed.items.length).toBeGreaterThan(0);
        expect(feed.items[0]._extra.platform).toBe('naver-blog');
    });

    it('_extra payload validates against the Zod contract', async () => {
        const data = await callHandler(BLOG_ID);
        for (const item of data.item!) {
            expect(() => assertSpecExtra(item._extra)).not.toThrow();
        }
    });

    it('empty RSS channel — returns empty item array', async () => {
        const { http, HttpResponse } = await import('msw');
        const { server } = await import('../../mocks/server');
        server.use(http.get('https://rss.blog.naver.com/:blogId.xml', () => HttpResponse.text('<?xml version="1.0"?><rss version="2.0"><channel><title>Empty</title></channel></rss>')));
        const data = await callHandler(BLOG_ID);
        expect(data.item).toEqual([]);
    });
});
