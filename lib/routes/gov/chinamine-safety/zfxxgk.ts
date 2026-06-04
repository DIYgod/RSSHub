import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { fetchData, processItems, rootUrl } from './util';

export const route: Route = {
    path: '/chinamine-safety/zfxxgk/:category{.+}?',
    name: 'Unknown',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const { category = 'fdzdgknr/tzgg' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30;

    const currentUrl = new URL(`zfxxgk/${category.endsWith('/') ? category : `${category}/`}`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('ul#ogi-list li a, div#ogi-list dd a')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.contents().first().text(),
                link: new URL(item.prop('href'), currentUrl).href,
                pubDate: parseDate(item.parent().find('span').text()),
            };
        });

    items = await processItems(items, cache.tryGet);

    return {
        item: items,
        ...fetchData($, currentUrl),
    };
}
