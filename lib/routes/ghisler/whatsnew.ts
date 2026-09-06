import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/whatsnew',
    categories: ['program-update'],
    example: '/ghisler/whatsnew',
    name: "What's New",
    maintainers: ['nczitzk'],
    handler,
};

async function handler() {
    const rootUrl = 'http://ghisler.com';
    const currentUrl = `${rootUrl}/whatsnew.htm`;
    const response = await ofetch(currentUrl);

    const $ = load(response.replaceAll('<h3 align="left">', '</content><content><h3 align="left">'));

    const items = $('content')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const title = $item.find('h3').text().replaceAll(/\s+/g, ' ');
            return {
                link: currentUrl,
                guid: `${currentUrl}#${title}`,
                title,
                description: $item.find('p').html(),
                pubDate: parseDate($item.find('b').text().split(':', 1)[0]),
            };
        });

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
