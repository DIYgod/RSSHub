import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/most/:type?/:time?',
    categories: ['new-media'],
    example: '/cgtn/most/read/day',
    parameters: {
        type: 'Type, `read` as most read, `share` as most share, `read` by default',
        time: 'Time range, `all` as all the time, `day` as today, `week` as this week, `month` as this month, `year` as this year, `all` by default',
    },
    name: 'Most Read & Most Share',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx: Context) {
    const { type = 'read', time = 'all' } = ctx.req.param();

    const rootUrl = `https://www.cgtn.com/most-${type}`;
    const response = await ofetch(rootUrl);

    const $ = load(response);
    const list = $(`#${time}Items div.most-read-item-box div.cg-title`)
        .toArray()
        .map((item) => {
            const a = $(item).find('a');
            return {
                title: a.text(),
                link: a.attr('href'),
                pubDate: parseDate(Number.parseInt(a.attr('data-time')!)),
            };
        }) as DataItem[];

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await ofetch(item.link!);
                const content = load(detailResponse);

                item.description = content('#cmsMainContent').html() ?? undefined;

                return item;
            })
        )
    );

    return {
        title: `CGTN - Most ${type}`,
        link: rootUrl,
        item: items as DataItem[],
    };
}
