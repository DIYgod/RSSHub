import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://is.cas.cn';

export const route: Route = {
    path: '/is/:path{.+}',
    name: 'Unknown',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const path = ctx.req.param('path');
    const response = await got(`${baseUrl}/${path}/`);

    const $ = load(response.data);
    const items = $('.list-news ul li')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').text(),
                link: new URL(item.find('a').attr('href'), response.url).href,
                pubDate: parseDate(item.find('span').text().replaceAll('[]', '')),
            };
        });

    await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                if (!item.link.startsWith(`${baseUrl}/`)) {
                    return item;
                }

                const response = await got(item.link);
                const $ = load(response.data);

                item.description = $('.TRS_Editor').html();
                return item;
            })
        )
    );

    return {
        title: $('head title').text(),
        link: `${baseUrl}/${path}`,
        item: items,
    };
}
