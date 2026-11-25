import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';
import { parseDate } from '@/utils/time';

export const route: Route = {
    path: '/research',
    categories: ['government'],
    example: '/uscc/research',
    name: 'Research',
    maintainers: ['pseudoyu'],
    radar: [
        {
            source: ['www.uscc.gov/research'],
            target: '/research',
        },
    ],
    handler,
};

async function handler(ctx: Context) {
    const rootUrl = 'https://www.uscc.gov';
    const currentUrl = `${rootUrl}/research`;
    const response = await ofetch(currentUrl);
    const $ = load(response);
    const list = $('.views-row')
        .toArray()
        .slice(0, getRouteLimit(ctx, 10))
        .map((item): DataItem => {
            const $item = $(item);
            const a = $item.find('.views-field-title a');
            return {
                title: a.text(),
                link: `${rootUrl}${a.attr('href')}`,
                pubDate: parseDate($item.find('time').attr('datetime')!),
                category: [$item.find('.views-field-type').text().trim()],
                description: $item.find('.views-field-search-api-excerpt').html() ?? undefined,
            };
        });
    const items = await pMap(
        list,
        async (item) => {
            const { description } = await cache.tryGet<Pick<DataItem, 'description'>>(item.link!, async () => {
                const detailResponse = await ofetch(item.link!);
                const content = load(detailResponse);
                return { description: content('article .field--name-body').html() ?? item.description };
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
