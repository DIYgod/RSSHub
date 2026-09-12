import { load } from 'cheerio';
import type { Context } from 'hono';

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
            source: ['blog.wenxuecity.com/myblog/:id', 'blog.wenxuecity.com/myoverview/:id'],
            target: '/blog/:id',
        },
    ],
    name: '博客',
    maintainers: ['changlan'],
    handler,
};

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
                pubDate: parseDate($item.find('span.atc_tm.BLK_txtc').text()),
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
                    description: content('div.articalContent').html(),
                };
            })
        )
    );

    return {
        title: $('head > title').text(),
        link: baseUrl,
        item: out,
    };
}
