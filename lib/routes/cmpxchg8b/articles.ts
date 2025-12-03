import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

const baseUrl = 'https://lock.cmpxchg8b.com/';
const title = 'cmpxchg8b';

export const route: Route = {
    path: '/articles',
    categories: ['blog'],
    example: '/cmpxchg8b/articles',
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
            source: ['lock.cmpxchg8b.com/articles'],
        },
    ],
    name: 'Articles',
    maintainers: ['yuguorui'],
    handler,
    url: 'lock.cmpxchg8b.com/articles',
};

async function handler() {
    const { data: response } = await got(baseUrl);

    const $ = load(response);
    const author = $('p.author').text().trim();
    const list = $('section#articles section')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('li').text(),
                link: new URL(item.find('li a').attr('href'), baseUrl).toString(),
                author,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                // extract the body but removing <nav> and <footer>
                const body = $('body');
                body.find('nav, footer').remove();
                item.description = body.html();
                return item;
            })
        )
    );

    return {
        title,
        link: new URL('#articles', baseUrl).toString(),
        item: items,
    };
}
