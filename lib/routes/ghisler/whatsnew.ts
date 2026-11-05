import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

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

    const $ = load(response.replaceAll(/<h3\b[^>]*>/g, '</content><content>$&'));

    const items = $('content')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const title = $item.find('h3').text().replaceAll(/\s+/g, ' ');
            const pubDate = timezone(parseDate($item.find('b').text().split(':', 1)[0], 'MMMM D, YYYY'), 0);
            const body = $item;
            body.find('h3, a[name]:not([href])').remove();
            body.find('p').first().find('b').first().remove();
            body.find('a[href="whatsnew2.htm"]').closest('p').remove();
            body.find('a[href]').each((_, el) => {
                const anchor = $(el);
                anchor.attr('href', new URL(anchor.attr('href')!, currentUrl).href);
            });
            return {
                link: currentUrl,
                guid: `${currentUrl}#${title}`,
                title,
                description: body.html(),
                pubDate,
            };
        });

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
