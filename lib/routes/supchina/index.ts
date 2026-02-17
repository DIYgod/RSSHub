import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/',
    radar: [
        {
            source: ['supchina.com/feed', 'supchina.com/'],
            target: '',
        },
    ],
    name: 'Unknown',
    maintainers: ['nczitzk'],
    handler,
    url: 'supchina.com/feed',
};

async function handler(ctx) {
    const rootUrl = 'https://supchina.com';
    const currentUrl = `${rootUrl}/feed/`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('item')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 50)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                guid: item.find('guid').text(),
                title: item.find('title').text(),
                link: item.find('guid').text(),
                author: item
                    .find(String.raw`dc\:creator`)
                    .html()
                    .match(/CDATA\[(.*?)]/)[1],
                category: item
                    .find('category')
                    .toArray()
                    .map(
                        (c) =>
                            $(c)
                                .html()
                                .match(/CDATA\[(.*?)]/)[1]
                    ),
                pubDate: parseDate(item.find('pubDate').text()),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                content('.aspect-spacer, .post-recs, .author-bio').remove();

                item.description = content('.post__main').html();

                return item;
            })
        )
    );

    return {
        title: $('title').first().text(),
        link: rootUrl,
        item: items,
    };
}
