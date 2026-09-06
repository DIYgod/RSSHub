import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseRelativeDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/whatsnew',
    categories: ['program-update'],
    example: '/xyplorer/whatsnew',
    name: "What's New",
    maintainers: ['nczitzk'],
    handler,
};

async function handler() {
    const rootUrl = 'https://www.xyplorer.com';
    const currentUrl = `${rootUrl}/whatsnew.php`;

    const response = await ofetch(currentUrl);
    const $ = load(response);

    const items = $('.waznu')
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                link: currentUrl,
                description: `<ul>${$item.html()}</ul>`,
                title: $item.prev().prev().text(),
                pubDate: parseRelativeDate($item.prev().text().replace('released ', '')),
            };
        });

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
