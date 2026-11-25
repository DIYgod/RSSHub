import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/time';

export const route: Route = {
    path: '/',
    categories: ['blog'],
    example: '/lala',
    radar: [
        {
            source: ['lala.im/'],
        },
    ],
    name: '最新发布',
    maintainers: ['cnkmmk'],
    handler,
    url: 'lala.im/',
};

async function handler() {
    const currentUrl = 'https://lala.im';
    const response = await got(`${currentUrl}/feed`);
    const $ = load(response.data, { xmlMode: true });
    const titleMain = $('channel > title').text();
    const descriptionMain = $('channel > description').text();
    const items = $('channel > item')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const link = $item.find('link').text();
            const title = $item.find('title').text();
            const description = $item.find(String.raw`content\:encoded`).text() || $item.find('description').text();
            const pubDate = $item.find('pubDate').text();
            return {
                link,
                pubDate: parseDate(pubDate),
                author: $item.find(String.raw`dc\:creator`).text(),
                category: $item
                    .find('category')
                    .toArray()
                    .map((tag) => $(tag).text()),
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
