import type { Context } from 'hono';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';

import { route } from '@/routes/people';
import type { Data } from '@/types';

const rootUrl = 'http://cpc.people.com.cn';
const currentUrl = `${rootUrl}/GB/64093/64387`;
const firstArticleUrl = `${rootUrl}/n1/2026/0803/c64387-40772759.html`;
const secondArticleUrl = `${rootUrl}/n1/2026/0803/c64387-40772755.html`;

function createCtx(limit?: string) {
    return {
        req: {
            param: () => ({ site: 'cpc', category: '24h' }),
            query: (name: string) => (name === 'limit' ? limit : undefined),
        },
    } as unknown as Context;
}

describe('GET /people/cpc/24h', () => {
    it('uses the maintained CPC news list and modern article content selector', async () => {
        const { default: server } = await import('@/setup.test');
        const secondDetailRequest = vi.fn();

        server.use(
            http.get(currentUrl, () =>
                HttpResponse.html(`
                    <html>
                        <head><meta charset="utf-8"><title>综合报道</title></head>
                        <body>
                            <div class="p2j_con02">
                                <div class="fl">
                                    <ul>
                                        <li><a href="/n1/2026/0803/c64387-40772759.html">第一条新闻</a></li>
                                        <li><a href="/n1/2026/0803/c64387-40772755.html">第二条新闻</a></li>
                                    </ul>
                                </div>
                            </div>
                        </body>
                    </html>
                `)
            ),
            http.get(`${rootUrl}/GB/87228`, () => HttpResponse.text('Archived page must not be used', { status: 500 })),
            http.get(firstArticleUrl, () =>
                HttpResponse.html(`
                    <html>
                        <body>
                            <b id="newstime">2026年08月03日08:15</b>
                            <div id="rm_txt_zw"><p>正文一</p></div>
                        </body>
                    </html>
                `)
            ),
            http.get(secondArticleUrl, () => {
                secondDetailRequest();
                return HttpResponse.html('<div id="rm_txt_zw"><p>正文二</p></div>');
            })
        );

        const feed = (await route.handler(createCtx('1'))) as Data;

        expect(feed.title).toBe('综合报道');
        expect(feed.link).toBe(currentUrl);
        expect(feed.item).toHaveLength(1);
        expect(feed.item?.[0]).toMatchObject({
            title: '第一条新闻',
            link: firstArticleUrl,
            description: '<p>正文一</p>',
        });
        expect(new Date(feed.item?.[0].pubDate ?? '').toISOString()).toBe('2026-08-03T00:15:00.000Z');
        expect(secondDetailRequest).not.toHaveBeenCalled();
    });
});
