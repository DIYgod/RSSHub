import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/blog/:id',
    categories: ['bbs'],
    example: '/wenxuecity/blog/43626',
    parameters: { id: '博客 ID, 可在 URL 中找到' },
    radar: [
        {
            source: ['blog.wenxuecity.com/myblog/:id', 'blog.wenxuecity.com/myoverview/:id', 'blog.wenxuecity.com/myblog/:id/all.html'],
            target: '/blog/:id',
        },
    ],
    name: '博客',
    maintainers: ['changlan'],
    handler,
};
function parsePublicationDate(value: string | undefined) {
    if (!value?.trim()) {
        return;
    }
    const date = parseDate(value);
    return Number.isFinite(date.getTime()) ? date : undefined;
}
async function handler(ctx: Context) {
    const { id } = ctx.req.param();
    const baseUrl = `https://blog.wenxuecity.com/myblog/${id}/all.html`;
    const response = await ofetch(baseUrl);
    const $ = load(response);
    const author = $('strong#username').text();
    const list = $('div.articleCell.BLK_j_linedot1')
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.find('a').text(),
                link: new URL($item.find('a').attr('href')!, 'https://blog.wenxuecity.com').href,
                author,
                pubDate: parsePublicationDate($item.find('span.atc_tm.BLK_txtc').text()),
            };
        });
    const out = await unwrapFirstFailure(
        pMap(
            list,
            async (item) => {
                const detail = await cache.tryGet(`wenxuecity:blog:article:${item.link}`, async () => {
                    const result = await ofetch(item.link, {
                        headers: {
                            Referer: baseUrl,
                        },
                    });
                    const content = load(result);
                    const body = content('div.articalContent');
                    if (body.length !== 1) {
                        throw new Error(`Article body not found at ${item.link}`);
                    }
                    return {
                        description: body.html(),
                    };
                });
                return { ...item, description: detail.description };
            },
            { concurrency: 3, stopOnError: false }
        )
    );
    return {
        title: $('head > title').text(),
        link: baseUrl,
        item: out,
    };
}
async function unwrapFirstFailure<T>(promise: Promise<T>): Promise<T> {
    try {
        return await promise;
    } catch (error) {
        throw error instanceof AggregateError ? error.errors[0] : error;
    }
}
