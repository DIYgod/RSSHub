import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/releases',
    categories: ['program-update'],
    example: '/manictime/releases',
    name: 'Releases',
    maintainers: ['nczitzk'],
    handler,
};

async function handler() {
    const rootUrl = 'https://www.manictime.com/Releases';
    const response = await ofetch(rootUrl);

    const $ = load(response);

    const items = $('.col-md-4')
        .slice(0, 10)
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                link: rootUrl,
                title: $item.find('h2').text(),
                description: $item.next().html(),
                pubDate: parseDate($item.find('p').text().replace('Release date - ', '')),
            };
        });

    return {
        title: 'ManicTime releases',
        link: rootUrl,
        item: items,
    };
}
