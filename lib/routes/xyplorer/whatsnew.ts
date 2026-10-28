import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

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
        .filter((item) => $(item).prev().is('p.date') && $(item).prev().prev().is('h3'))
        .map((item) => {
            const $item = $(item);
            const title = $item.prev().prev().text();
            const date = $item.prev().text().replace('released ', '');
            const pubDate = date ? parseDate(date, 'DD-MMM-YYYY', 'en', true) : undefined;
            return {
                guid: `${currentUrl}#${encodeURIComponent(title)}`,
                link: currentUrl,
                description: `<ul>${$item.html()}</ul>`,
                title,
                pubDate: pubDate && Number.isFinite(pubDate.getTime()) ? pubDate : undefined,
            };
        });

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
