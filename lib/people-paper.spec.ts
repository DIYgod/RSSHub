import type { Context } from 'hono';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import { route } from '@/routes/people/paper';
import type { Data } from '@/types';
import cache from '@/utils/cache';

const rootUrl = 'https://paper.people.com.cn/rmrb/pc/';
const indexUrl = `${rootUrl}layout/index.html`;
const pageOneUrl = `${rootUrl}layout/202608/03/node_01.html`;
const pageTwoUrl = `${rootUrl}layout/202608/03/node_02.html`;
const articleOneUrl = `${rootUrl}content/202608/03/content_1.html`;
const articleTwoUrl = `${rootUrl}content/202608/03/content_2.html`;
const articleThreeUrl = `${rootUrl}content/202608/03/content_3.html`;

const indexHtml = `
    <ul id="list">
        <li><a href="202608/03/node_01.html">第01版 要闻</a></li>
        <li><a href="202608/03/node_02.html">第02版 评论</a></li>
    </ul>
`;

const pageOneHtml = `
    <ul class="news-list">
        <li><a href="../../../content/202608/03/content_1.html">列表标题一</a></li>
        <li><a href="../../../content/202608/03/content_2.html">列表标题二</a></li>
    </ul>
`;

const pageTwoHtml = `
    <ul class="news-list">
        <li><a href="../../../content/202608/03/content_3.html">列表标题三</a></li>
    </ul>
`;

function createArticleHtml(title: string, author: string, page: string) {
    return `
        <div class="article">
            <h1>${title}</h1>
            <p class="sec">
                ${author}
                <span class="date">
                    《人民日报》（<span class="newstime">2026年08月03日</span> 第 ${page} 版）
                </span>
            </p>
            <div id="ozoom">
                <p>
                    正文 ${title}
                    <img src="../../../pic/202608/03/image.jpg">
                    <a href="../../../content/202608/03/source.html">相关链接</a>
                </p>
            </div>
        </div>
    `;
}

function createCtx(page?: string, limit?: string) {
    return {
        req: {
            param: (name: string) => (name === 'page' ? page : undefined),
            query: (name: string) => (name === 'limit' ? limit : undefined),
        },
    } as unknown as Context;
}

describe('GET /people/paper', () => {
    beforeEach(() => cache.clients.memoryCache?.clear());

    it.each([
        ['the default route', undefined],
        ['the explicit all route', 'all'],
    ])('aggregates all pages and applies limit before fetching article details for %s', async (_, page) => {
        const { default: server } = await import('@/setup.test');
        const articleThreeHandler = vi.fn(() => HttpResponse.html(createArticleHtml('正文标题三', '记者三', '02')));

        server.use(
            http.get(indexUrl, () => HttpResponse.html(indexHtml)),
            http.get(pageOneUrl, () => HttpResponse.html(pageOneHtml)),
            http.get(pageTwoUrl, () => HttpResponse.html(pageTwoHtml)),
            http.get(articleOneUrl, () => HttpResponse.html(createArticleHtml('正文标题一', '记者一', '01'))),
            http.get(articleTwoUrl, () => HttpResponse.html(createArticleHtml('正文标题二', '记者二', '01'))),
            http.get(articleThreeUrl, articleThreeHandler)
        );

        const feed = (await route.handler(createCtx(page, '2'))) as Data;

        expect(feed.title).toBe('人民日报电子版 - 2026年08月03日');
        expect(feed.link).toBe(indexUrl);
        expect(feed.item).toHaveLength(2);
        expect(feed.item?.[0]).toMatchObject({
            title: '正文标题一',
            link: articleOneUrl,
            author: '记者一',
            category: ['第01版 要闻'],
        });
        expect(new Date(feed.item?.[0].pubDate ?? '').getFullYear()).toBe(2026);
        expect(feed.item?.[0].description).toContain('正文 正文标题一');
        expect(feed.item?.[0].description).toContain(`${rootUrl}pic/202608/03/image.jpg`);
        expect(feed.item?.[0].description).toContain(`${rootUrl}content/202608/03/source.html`);
        expect(articleThreeHandler).not.toHaveBeenCalled();
    });

    it('fetches only the requested page', async () => {
        const { default: server } = await import('@/setup.test');
        const pageOneHandler = vi.fn(() => HttpResponse.html(pageOneHtml));

        server.use(
            http.get(indexUrl, () => HttpResponse.html(indexHtml)),
            http.get(pageOneUrl, pageOneHandler),
            http.get(pageTwoUrl, () => HttpResponse.html(pageTwoHtml)),
            http.get(articleThreeUrl, () => HttpResponse.html(createArticleHtml('正文标题三', '记者三', '02')))
        );

        const feed = (await route.handler(createCtx('02', '3'))) as Data;

        expect(feed.title).toBe('人民日报电子版 - 第02版 评论 - 2026年08月03日');
        expect(feed.item).toHaveLength(1);
        expect(feed.item?.[0]).toMatchObject({
            title: '正文标题三',
            link: articleThreeUrl,
            category: ['第02版 评论'],
        });
        expect(pageOneHandler).not.toHaveBeenCalled();
    });

    it('limits the default route to 30 articles before fetching details', async () => {
        const { default: server } = await import('@/setup.test');
        const articleLinks = Array.from({ length: 31 }, (_, index) => `<li><a href="../../../content/202608/03/default_${index + 1}.html">文章 ${index + 1}</a></li>`).join('');
        const detailHandler = vi.fn(({ request }: { request: Request }) => HttpResponse.html(createArticleHtml(new URL(request.url).pathname, '记者', '01')));

        server.use(
            http.get(indexUrl, () => HttpResponse.html('<ul id="list"><li><a href="202608/03/node_01.html">第01版 要闻</a></li></ul>')),
            http.get(pageOneUrl, () => HttpResponse.html(`<ul class="news-list">${articleLinks}</ul>`)),
            http.get(new RegExp(`${rootUrl}content/202608/03/default_\\d+\\.html`), detailHandler)
        );

        const feed = (await route.handler(createCtx())) as Data;

        expect(feed.item).toHaveLength(30);
        expect(detailHandler).toHaveBeenCalledTimes(30);
    });

    it('keeps list metadata when one article detail request fails', async () => {
        const { default: server } = await import('@/setup.test');
        server.use(
            http.get(indexUrl, () => HttpResponse.html('<ul id="list"><li><a href="202608/03/node_01.html">第01版 要闻</a></li></ul>')),
            http.get(pageOneUrl, () => HttpResponse.html('<ul class="news-list"><li><a href="../../../content/202608/03/content_1.html">列表标题一</a></li></ul>')),
            http.get(articleOneUrl, () => HttpResponse.text('upstream failure', { status: 500 }))
        );

        const feed = (await route.handler(createCtx())) as Data;

        expect(feed.item).toHaveLength(1);
        expect(feed.item?.[0]).toMatchObject({
            title: '列表标题一',
            link: articleOneUrl,
            category: ['第01版 要闻'],
        });
        expect(feed.item?.[0].description).toBeUndefined();
    });

    it('rejects a page that is not present in the current edition', async () => {
        const { default: server } = await import('@/setup.test');
        server.use(http.get(indexUrl, () => HttpResponse.html(indexHtml)));

        await expect(route.handler(createCtx('99'))).rejects.toBeInstanceOf(InvalidParameterError);
        await expect(route.handler(createCtx('99'))).rejects.toThrow('Invalid page');
    });
});
