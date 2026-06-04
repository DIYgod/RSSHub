import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/pen0',
    categories: ['new-media'],
    example: '/agora0/pen0',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['agorahub.github.io/pen0'],
        },
    ],
    name: '共和報',
    maintainers: ['TonyRL'],
    handler,
    url: 'agorahub.github.io/pen0',
};

async function handler() {
    const baseUrl = 'https://agorahub.github.io';
    const response = await got(`${baseUrl}/pen0/`);
    const $ = load(response.data);

    const list = $('div article')
        .toArray()
        .slice(0, -1) // last one is a dummy
        .map((item) => {
            item = $(item);
            const meta = item.find('h5').first().text();
            return {
                title: item.find('h3').text(),
                link: item.find('h3 a').attr('href'),
                author: meta.split('|')[0].trim(),
                pubDate: parseDate(meta.split('|')[1].trim()),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.data);
                $('h1').remove();
                item.description = $('article').html();
                return item;
            })
        )
    );

    return {
        title: $('head title').text(),
        description: $('head meta[name="description"]').attr('content'),
        link: response.url,
        image: $('link[rel="apple-touch-icon"]').attr('href'),
        item: items,
    };
}
