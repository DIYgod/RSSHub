import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/',
    categories: ['study'],
    example: '/howtoforge',
    radar: [
        {
            source: ['howtoforge.com/'],
        },
    ],
    name: 'Tutorials',
    maintainers: ['cnkmmk'],
    handler,
    url: 'howtoforge.com/',
};

async function handler() {
    const currentUrl = 'https://www.howtoforge.com';
    const response = await got(`${currentUrl}/feed.rss`);
    const $ = load(response.data, { xmlMode: true });
    const titleMain = $('channel > title').text();
    const descriptionMain = $('channel > description').text();
    const items = $('channel > item')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const link = $item.find('link').text();
            const title = $item.find('title').text();
            const description = $item.find('description').text();
            const pubDate = $item.find('pubDate').text();
            return {
                link,
                pubDate: pubDate ? parseDate(pubDate) : undefined,
                title,
                description,
            };
        });

    return {
        title: titleMain,
        description: descriptionMain,
        link: currentUrl,
        item: items,
    };
}
