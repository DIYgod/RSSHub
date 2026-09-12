import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/opinions',
    categories: ['new-media'],
    example: '/cgtn/opinions',
    name: 'Opinions',
    maintainers: ['nczitzk'],
    handler,
};

async function handler() {
    const rootUrl = 'https://www.cgtn.com/opinions';
    const response = await ofetch(rootUrl);

    const $ = load(response);

    $('.cg-pic').parent().remove();

    const list = $('.cg-title h3')
        .toArray()
        .slice(0, 15)
        .map((item): DataItem => {
            const a = $(item).find('a');
            return {
                title: a.text(),
                link: a.attr('href'),
                pubDate: parseDate(Number.parseInt(a.attr('data-time')!)),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await ofetch(item.link!);
                const content = load(detailResponse);

                item.author = content('.news-author-name').text();
                item.description = content('#cmsMainContent').html() ?? undefined;

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
