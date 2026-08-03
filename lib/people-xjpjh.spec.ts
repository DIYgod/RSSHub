import type { Context } from 'hono';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import { route } from '@/routes/people/xjpjh';
import type { Data } from '@/types';
import cache from '@/utils/cache';

const rootUrl = 'http://jhsjk.people.cn';
const defaultResultUrl = `${rootUrl}/result?keywords=&year=0`;
const firstArticleUrl = `${rootUrl}/article/40772030`;
const secondArticleUrl = `${rootUrl}/article/40772028`;
const thirdArticleUrl = `${rootUrl}/article/40772029`;

function createCtx({ keyword, year, limit }: { keyword?: string; year?: string; limit?: string } = {}) {
    return {
        req: {
            param: (name: string) => ({ keyword, year })[name],
            query: (name: string) => (name === 'limit' ? limit : undefined),
        },
    } as unknown as Context;
}

function createResultHtml() {
    return `
        <ul class="list_14 p1_2 clearfix" id="news_list">
            <li><a href="article/40772030">第一篇讲话</a><span>[2026-08-01]</span></li>
            <li><p>第一篇摘要</p></li>
            <li><a href="article/40772028">第二篇讲话</a><span>[2026-07-31]</span></li>
            <li><p>第二篇摘要</p></li>
            <li><a href="article/40772029">第三篇讲话</a><span>[2026-07-30]</span></li>
        </ul>
    `;
}

function createArticleHtml(content: string, date: string) {
    return `
        <div class="d2txt_1 clearfix">来源：人民网 发布时间：${date}</div>
        <div class="d2txt_con clearfix"><p>${content}</p></div>
    `;
}

describe('GET /people/xjpjh/:keyword?/:year?', () => {
    beforeEach(() => cache.clients.memoryCache?.clear());

    it('selects only linked results and applies limit before fetching details', async () => {
        const { default: server } = await import('@/setup.test');
        const thirdDetailRequest = vi.fn();

        server.use(
            http.get(`${rootUrl}/result`, ({ request }) => {
                const url = new URL(request.url);
                expect(url.searchParams.get('keywords')).toBe('');
                expect(url.searchParams.get('year')).toBe('0');
                return HttpResponse.html(createResultHtml());
            }),
            http.get(`${rootUrl}/undefined`, () => HttpResponse.text('Summary rows must not be fetched', { status: 500 })),
            http.get(firstArticleUrl, () => HttpResponse.html(createArticleHtml('第一篇正文', '2026-08-01'))),
            http.get(secondArticleUrl, () => HttpResponse.html(createArticleHtml('第二篇正文', '2026-07-31'))),
            http.get(thirdArticleUrl, () => {
                thirdDetailRequest();
                return HttpResponse.html(createArticleHtml('第三篇正文', '2026-07-30'));
            })
        );

        const feed = (await route.handler(createCtx({ limit: '2' }))) as Data;

        expect(feed.title).toBe('习近平系列重要讲话-all-all');
        expect(feed.link).toBe(defaultResultUrl);
        expect(feed.item).toHaveLength(2);
        expect(feed.item?.[0]).toMatchObject({
            title: '第一篇讲话',
            link: firstArticleUrl,
            description: '<p>第一篇正文</p>',
        });
        expect(new Date(feed.item?.[0].pubDate ?? '').toISOString()).toBe('2026-07-31T16:00:00.000Z');
        expect(feed.item?.[1]).toMatchObject({
            title: '第二篇讲话',
            link: secondArticleUrl,
            description: '<p>第二篇正文</p>',
        });
        expect(thirdDetailRequest).not.toHaveBeenCalled();
    });

    it('passes keyword and calendar year directly to the current search page', async () => {
        const { default: server } = await import('@/setup.test');
        const resultUrl = `${rootUrl}/result?keywords=%E7%BB%8F%E6%B5%8E&year=2026`;

        server.use(
            http.get(`${rootUrl}/result`, ({ request }) => {
                const url = new URL(request.url);
                expect(url.searchParams.get('keywords')).toBe('经济');
                expect(url.searchParams.get('year')).toBe('2026');
                return HttpResponse.html('<ul id="news_list"><li><a href="article/40772030">经济讲话</a></li></ul>');
            }),
            http.get(firstArticleUrl, () => HttpResponse.html(createArticleHtml('经济正文', '2026-08-01')))
        );

        const feed = (await route.handler(createCtx({ keyword: '经济', year: '2026', limit: '1' }))) as Data;

        expect(feed.title).toBe('习近平系列重要讲话-经济-2026');
        expect(feed.link).toBe(resultUrl);
        expect(feed.item?.[0]).toMatchObject({
            title: '经济讲话',
            link: firstArticleUrl,
            description: '<p>经济正文</p>',
        });
    });

    it.each([
        ['a negative', '-1'],
        ['a non-numeric', 'invalid'],
        ['an excessive', '999'],
    ])('keeps detail requests within the previous maximum for %s limit', async (_, limit) => {
        const { default: server } = await import('@/setup.test');
        const detailRequest = vi.fn();
        const links = Array.from({ length: 11 }, (__, index) => `<li><a href="article/${index + 1}">讲话 ${index + 1}</a></li>`).join('');

        server.use(
            http.get(`${rootUrl}/result`, () => HttpResponse.html(`<ul id="news_list">${links}</ul>`)),
            http.get(new RegExp(`${rootUrl}/article/\\d+`), () => {
                detailRequest();
                return HttpResponse.html(createArticleHtml('讲话正文', '2026-08-01'));
            })
        );

        const feed = (await route.handler(createCtx({ limit }))) as Data;

        expect(feed.item).toHaveLength(10);
        expect(detailRequest).toHaveBeenCalledTimes(10);
    });

    it('rejects an invalid year', async () => {
        await expect(route.handler(createCtx({ keyword: 'all', year: 'invalid' }))).rejects.toBeInstanceOf(InvalidParameterError);
        await expect(route.handler(createCtx({ keyword: 'all', year: 'invalid' }))).rejects.toThrow('Invalid year');
    });
});
