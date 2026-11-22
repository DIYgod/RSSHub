import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

export const route: Route = {
    path: '/bbs/:cat/:elite?',
    categories: ['bbs'],
    example: '/wenxuecity/bbs/tzlc',
    parameters: { cat: '版面名, 可在 URL 中找到', elite: '是否精华区, 1 为精华区' },
    radar: [
        {
            source: ['bbs.wenxuecity.com/:cat'],
            target: '/bbs/:cat',
        },
        {
            title: '最新主题 - 精华区',
            source: ['bbs.wenxuecity.com/:cat'],
            target: '/bbs/:cat/1',
        },
    ],
    name: '最新主题',
    maintainers: ['changlan'],
    handler,
};
async function handler(ctx: Context) {
    const { cat, elite = 0 } = ctx.req.param();
    const baseUrl = `https://bbs.wenxuecity.com/${cat}/?elite=${elite}`;
    const response = await ofetch(baseUrl);
    const $ = load(response);
    const list = $('div.odd,div.even')
        .slice(0, 10)
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.find('a.post').first().text(),
                link: new URL($item.find('a.post').attr('href')!, baseUrl).href,
                author: $item.find('span.b > a.b').first().text(),
            };
        });
    const out = await pMap(
        list,
        async (item) => {
            const detail = await cache.tryGet(`wenxuecity:article:${item.link}`, async () => {
                const result = await ofetch(item.link, {
                    headers: {
                        Referer: baseUrl,
                    },
                });
                const content = load(result);
                return {
                    description: content('#msgbodyContent').html(),
                    pubDate: parseDate(content('span.date').text()),
                };
            });
            return { ...item, description: detail.description, pubDate: detail.pubDate };
        },
        { concurrency: 3 }
    );
    return {
        title: $('title').text(),
        link: baseUrl,
        item: out,
    };
}
