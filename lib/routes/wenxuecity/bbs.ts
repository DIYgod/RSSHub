import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

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
        .toArray()
        .slice(0, 10)
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.find('a.post').text(),
                link: new URL($item.find('a.post').attr('href')!, baseUrl).href,
                author: $item.find('span.b > a.b').text(),
            };
        });

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const result = await ofetch(item.link, {
                    headers: {
                        Referer: baseUrl,
                    },
                });
                const content = load(result);
                return {
                    ...item,
                    description: content('div#content').html(),
                    pubDate: parseDate(content('span.date').text()),
                };
            })
        )
    );

    return {
        allowEmpty: true,
        title: $('title').text(),
        link: baseUrl,
        item: out,
    };
}
