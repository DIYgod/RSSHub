import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';
import { parseDate } from '@/utils/time';

export const route: Route = {
    path: '/press-releases',
    categories: ['government'],
    example: '/ustr/press-releases',
    name: 'Press Releases',
    maintainers: ['nczitzk'],
    handler,
};
async function handler(ctx: Context) {
    const rootUrl = 'https://ustr.gov';
    const currentUrl = `${rootUrl}/about-us/policy-offices/press-office/press-releases`;
    const response = await ofetch(currentUrl);
    const $ = load(response);
    const limit = getRouteLimit(ctx, 15);
    const list = $('ul.listing > li')
        .toArray()
        .slice(0, limit)
        .map((item): DataItem => {
            const $item = $(item);
            const a = $item.find('a');
            return {
                title: a.text(),
                link: `${rootUrl}${a.attr('href')}`,
                pubDate: parseDate($item.contents().first().text().trim(), 0),
            };
        });
    const items = await pMap(
        list,
        async (item) => {
            const { description } = await cache.tryGet<Pick<DataItem, 'description'>>(item.link!, async () => {
                const detailResponse = await ofetch(item.link!);
                const content = load(detailResponse);
                return { description: content('.field--name-body').html() };
            });
            return { ...item, description };
        },
        { concurrency: 3 }
    );
    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
