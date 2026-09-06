import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

const baseUrl = 'https://axis-studios.com';

export const route: Route = {
    path: '/work',
    categories: ['design'],
    example: '/axis-studios/work',
    radar: [
        {
            source: ['axis-studios.com/work'],
        },
    ],
    name: 'Work',
    maintainers: ['MisteryMonster'],
    handler,
};

async function handler() {
    const response = await ofetch(`${baseUrl}/work/`);
    const $ = load(response);

    const list = $('main ul li a[href^="/project/"]')
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.attr('title')!,
                link: new URL($item.attr('href')!, baseUrl).href,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await ofetch(item.link);
                const $$ = load(detailResponse);

                const article = $$('article');
                article.find('nav, h1').remove();

                return {
                    ...item,
                    description: article.html(),
                };
            })
        )
    );

    return {
        title: 'Axis Studios | Work',
        link: `${baseUrl}/work/`,
        description: $('main p').first().text().trim(),
        item: items,
    };
}
