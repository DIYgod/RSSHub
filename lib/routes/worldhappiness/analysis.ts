import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/analysis',
    categories: ['new-media'],
    example: '/worldhappiness/analysis',
    name: 'Analysis',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx: Context) {
    const limit = ctx.req.query('limit');
    const rootUrl = 'https://www.worldhappiness.report';
    const currentUrl = `${rootUrl}/analysis/`;
    const response = await ofetch(currentUrl);
    const $ = load(response);

    const list = $('li.chapter')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.find('.chapter-title a');
            return {
                title: `${$item.find('.chapter-title-meta').text()}: ${a.text()}`,
                link: new URL(a.attr('href')!, rootUrl).href,
                pubDate: parseDate($item.find('.chapter-title-meta').text().split(' ', 1)[0], 'YYYY'),
                category: $item.attr('data-tags')?.split(', '),
            };
        })
        .slice(0, limit ? Number(limit) : 20);

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await ofetch(item.link);
                const content = load(detailResponse);

                return {
                    ...item,
                    author: content('.author')
                        .toArray()
                        .map((author) => ({ name: content(author).contents().first().text().trim() })),
                    description: content('.chapter-body').html(),
                };
            })
        )
    );

    return {
        title: $('head title').text(),
        link: currentUrl,
        item: items,
    };
}
