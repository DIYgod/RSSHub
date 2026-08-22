import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

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

    const list = $('.view-content .views-row')
        .toArray()
        .slice(0, ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 15)
        .map((item): DataItem => {
            const $item = $(item);
            const a = $item.find('.views-field-title a');
            return {
                title: a.text(),
                link: `${rootUrl}${a.attr('href')}`,
                pubDate: parseDate($item.find('time').attr('datetime')!),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await ofetch(item.link!);
                const content = load(detailResponse);

                item.description = content('.field--name-body').html() ?? undefined;

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
