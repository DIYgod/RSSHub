import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

export const route: Route = {
    path: '/opinions',
    categories: ['new-media'],
    example: '/cgtn/opinions',
    name: 'Opinions',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx: Context) {
    const rootUrl = 'https://www.cgtn.com/opinions';
    const response = await ofetch(rootUrl);

    const $ = load(response);

    $('.cg-pic').parent().remove();

    const list = $('.cg-title h3')
        .slice(0, 15)
        .toArray()
        .map((item): DataItem & { pubDate: Date } => {
            const a = $(item).find('a');
            return {
                title: a.text(),
                link: a.attr('href'),
                pubDate: parseDate(Number.parseInt(a.attr('data-time')!)),
            };
        });

    const candidates = ctx.req.query('sorted') === 'false' ? list : list.toSorted((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
    const limit = getRouteLimit(ctx);
    const selected = candidates.slice(0, limit);

    const items = await Promise.all(
        selected.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await ofetch(item.link!);
                const content = load(detailResponse);

                item.author = content('.news-author-name').text();
                item.description = content('#cmsMainContent').html();

                return item;
            })
        )
    );

    return {
        title: 'CGTN - Opinions',
        link: rootUrl,
        item: items,
    };
}
