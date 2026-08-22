import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/change-log',
    categories: ['program-update'],
    example: '/qttabbar/change-log',
    name: 'Change Log',
    maintainers: ['nczitzk'],
    handler,
};

async function handler() {
    const rootUrl = 'http://qttabbar.wikidot.com/change-log';
    const response = await ofetch(rootUrl);

    const $ = load(response);

    $('p strong a').parent().parent().remove();

    const items = $('#page-content')
        .children('p')
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                link: rootUrl,
                title: $item.text(),
                description: $item.next().html(),
                pubDate: parseDate($item.text().match(/\((.*)\)/)![1]),
            };
        });

    return {
        title: 'Change Log - QTTabBar',
        link: rootUrl,
        item: items,
    };
}
