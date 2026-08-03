import type { Context } from 'hono';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';

import { route } from '@/routes/people';
import type { Data } from '@/types';

const rootUrl = 'http://edu.people.com.cn';
const currentUrl = `${rootUrl}/`;
const firstArticleUrl = `${rootUrl}/n1/2026/0803/c1006-40772728.html`;
const secondArticleUrl = `${rootUrl}/n1/2026/0803/c1006-40772725.html`;

function createCtx(limit?: string) {
    return {
        req: {
            param: () => ({ site: 'edu', category: '' }),
            query: (name: string) => (name === 'limit' ? limit : undefined),
        },
    } as unknown as Context;
}

describe('GET /people/edu', () => {
    it('extracts the current education news list and applies limit before details', async () => {
        const { default: server } = await import('@/setup.test');
        const secondDetailRequest = vi.fn();

        server.use(
            http.get(`${rootUrl}/GB/`, () => HttpResponse.text('Legacy path must not be used', { status: 500 })),
            http.get(currentUrl, () =>
                HttpResponse.html(`
                    <html>
                        <head><meta charset="utf-8"><title>教育--人民网</title></head>
                        <body>
                            <div class="jsnew_line">
                                <a href="/n1/2026/0803/c1006-40772728.html">第一条教育新闻</a>
                                <a href="/n1/2026/0803/c1006-40772725.html">第二条教育新闻</a>
                            </div>
                        </body>
                    </html>
                `)
            ),
            http.get(firstArticleUrl, () =>
                HttpResponse.html(`
                    <html>
                        <body>
                            <b id="newstime">2026年08月03日08:15</b>
                            <div id="rm_txt_zw"><p>教育正文</p></div>
                        </body>
                    </html>
                `)
            ),
            http.get(secondArticleUrl, () => {
                secondDetailRequest();
                return HttpResponse.html('<div id="rm_txt_zw"><p>第二篇正文</p></div>');
            })
        );

        const feed = (await route.handler(createCtx('1'))) as Data;

        expect(feed.title).toBe('教育--人民网');
        expect(feed.link).toBe(currentUrl);
        expect(feed.item).toHaveLength(1);
        expect(feed.item?.[0]).toMatchObject({
            title: '第一条教育新闻',
            link: firstArticleUrl,
            description: '<p>教育正文</p>',
        });
        expect(new Date(feed.item?.[0].pubDate ?? '').toISOString()).toBe('2026-08-03T00:15:00.000Z');
        expect(secondDetailRequest).not.toHaveBeenCalled();
    });
});
