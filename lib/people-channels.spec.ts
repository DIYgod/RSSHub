import type { Context } from 'hono';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { route } from '@/routes/people';
import type { Data } from '@/types';

const rootUrl = 'http://politics.people.com.cn';
const currentUrl = `${rootUrl}/GB/1024`;
const articleUrl = `${rootUrl}/n1/2026/0801/c1001-40771961.html`;

function createCtx(site: string, category = '') {
    return {
        req: {
            param: () => ({ site, category }),
            query: (name: string) => (name === 'limit' ? '1' : undefined),
        },
    } as unknown as Context;
}

describe('GET /people/:site?/:category?', () => {
    it('uses a maintained politics page when the channel homepage is forbidden', async () => {
        const { default: server } = await import('@/setup.test');

        server.use(
            http.get(`${rootUrl}/GB/`, () => HttpResponse.text('Forbidden', { status: 403 })),
            http.get(currentUrl, () =>
                HttpResponse.html(`
                    <html>
                        <head><meta charset="utf-8"><title>高层动态--时政--人民网</title></head>
                        <body>
                            <div class="jsnew_line">
                                <a href="/n1/2026/0801/c1001-40771961.html">时政即时新闻</a>
                            </div>
                        </body>
                    </html>
                `)
            ),
            http.get(articleUrl, () =>
                HttpResponse.html(`
                    <html>
                        <body>
                            <b id="newstime">2026年08月01日10:30</b>
                            <div id="rm_txt_zw"><p>时政正文</p></div>
                        </body>
                    </html>
                `)
            )
        );

        const feed = (await route.handler(createCtx('politics'))) as Data;

        expect(feed.title).toBe('高层动态--时政--人民网');
        expect(feed.link).toBe(currentUrl);
        expect(feed.item).toHaveLength(1);
        expect(feed.item?.[0]).toMatchObject({
            title: '时政即时新闻',
            link: articleUrl,
            description: '<p>时政正文</p>',
        });
        expect(new Date(feed.item?.[0].pubDate ?? '').toISOString()).toBe('2026-08-01T02:30:00.000Z');
    });

    it('maps the retired society category to the current channel homepage', async () => {
        const { default: server } = await import('@/setup.test');
        const societyRootUrl = 'http://society.people.com.cn/';
        const societyArticleUrl = `${societyRootUrl}n1/2026/0803/c1008-40772964.html`;

        server.use(
            http.get(`${societyRootUrl}GB/1008`, () => HttpResponse.text('Retired category must not be used', { status: 500 })),
            http.get(societyRootUrl, () =>
                HttpResponse.html(`
                    <html>
                        <head><meta charset="utf-8"><title>社会·法治--人民网</title></head>
                        <body>
                            <div class="jsnew_line">
                                <a href="/n1/2026/0803/c1008-40772964.html">社会即时新闻</a>
                            </div>
                        </body>
                    </html>
                `)
            ),
            http.get(societyArticleUrl, () =>
                HttpResponse.html(`
                    <html>
                        <body>
                            <b id="newstime">2026年08月03日09:15</b>
                            <div class="rm_txt_con"><p>社会正文</p></div>
                        </body>
                    </html>
                `)
            )
        );

        const feed = (await route.handler(createCtx('society', '1008'))) as Data;

        expect(feed.title).toBe('社会·法治--人民网');
        expect(feed.link).toBe(societyRootUrl);
        expect(feed.item).toHaveLength(1);
        expect(feed.item?.[0]).toMatchObject({
            title: '社会即时新闻',
            link: societyArticleUrl,
            description: '<p>社会正文</p>',
        });
        expect(new Date(feed.item?.[0].pubDate ?? '').toISOString()).toBe('2026-08-03T01:15:00.000Z');
    });

    it('follows an official channel migration and resolves article links against its destination', async () => {
        const { default: server } = await import('@/setup.test');
        const legalRootUrl = 'http://legal.people.com.cn/';
        const societyRootUrl = 'http://society.people.com.cn/';
        const articleUrl = `${societyRootUrl}n1/2026/0803/c1008-40772812.html`;

        server.use(
            http.get(`${legalRootUrl}GB/`, () => HttpResponse.text('Legacy path must not be used', { status: 500 })),
            http.get(legalRootUrl, () =>
                HttpResponse.html(`
                    <html>
                        <head>
                            <meta http-equiv="refresh" content="0;url=${societyRootUrl}">
                        </head>
                    </html>
                `)
            ),
            http.get(societyRootUrl, () =>
                HttpResponse.html(`
                    <html>
                        <head><meta charset="utf-8"><title>社会·法治--人民网</title></head>
                        <body>
                            <div class="jsnew_line">
                                <a href="/n1/2026/0803/c1008-40772812.html">法治即时新闻</a>
                            </div>
                        </body>
                    </html>
                `)
            ),
            http.get(articleUrl, () =>
                HttpResponse.html(`
                    <html>
                        <body>
                            <b id="newstime">2026年08月03日10:20</b>
                            <div id="rm_txt_zw"><p>法治正文</p></div>
                        </body>
                    </html>
                `)
            )
        );

        const feed = (await route.handler(createCtx('legal'))) as Data;

        expect(feed.title).toBe('社会·法治--人民网');
        expect(feed.link).toBe(societyRootUrl);
        expect(feed.item).toHaveLength(1);
        expect(feed.item?.[0]).toMatchObject({
            title: '法治即时新闻',
            link: articleUrl,
            description: '<p>法治正文</p>',
        });
        expect(new Date(feed.item?.[0].pubDate ?? '').toISOString()).toBe('2026-08-03T02:20:00.000Z');
    });

    it.each(['ftp://legal.people.com.cn/file', 'http://['])('ignores an unsafe or malformed channel migration to %s', async (redirectTarget) => {
        const { default: server } = await import('@/setup.test');
        const legalRootUrl = 'http://legal.people.com.cn/';
        const legalArticleUrl = `${legalRootUrl}n1/2026/0803/c1008-40772809.html`;

        server.use(
            http.get(legalRootUrl, () =>
                HttpResponse.html(`
                    <html>
                        <head>
                            <meta charset="utf-8">
                            <meta http-equiv="refresh" content="0;url=${redirectTarget}">
                            <title>法治测试页--人民网</title>
                        </head>
                        <body>
                            <div class="jsnew_line">
                                <a href="/n1/2026/0803/c1008-40772809.html">法治测试新闻</a>
                            </div>
                        </body>
                    </html>
                `)
            ),
            http.get(legalArticleUrl, () =>
                HttpResponse.html(`
                    <b id="newstime">2026年08月03日10:30</b>
                    <div id="rm_txt_zw"><p>法治测试正文</p></div>
                `)
            )
        );

        const feed = (await route.handler(createCtx('legal'))) as Data;

        expect(feed.title).toBe('法治测试页--人民网');
        expect(feed.link).toBe(legalRootUrl);
        expect(feed.item?.[0]).toMatchObject({
            title: '法治测试新闻',
            link: legalArticleUrl,
            description: '<p>法治测试正文</p>',
        });
    });
});
