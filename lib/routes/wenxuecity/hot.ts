import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

export const route: Route = {
    path: '/hot/:cid',
    categories: ['bbs'],
    example: '/wenxuecity/hot/9',
    parameters: { cid: '版面 ID, 可在 URL 中找到' },
    name: '最热主题',
    maintainers: ['changlan'],
    handler,
};
async function handler(ctx: Context) {
    const { cid } = ctx.req.param();
    const baseUrl = `https://bbs.wenxuecity.com/?cid=${cid}/`;
    const response = await ofetch(baseUrl);
    const $ = load(response);
    const list = $('div.item')
        .slice(0, 10)
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.find('div.title > a').text(),
                link: new URL($item.find('div.title > a').attr('href')!, 'https://bbs.wenxuecity.com/').href,
                author: $item.find('span.user > a').text(),
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
