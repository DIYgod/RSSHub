import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

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
        .toArray()
        .slice(0, 10)
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.find('div.title > a').text(),
                link: new URL($item.find('div.title > a').attr('href')!, 'https://bbs.wenxuecity.com/').href,
                author: $item.find('span.user > a').text(),
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
