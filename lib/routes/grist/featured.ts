import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import { getData, getList } from './utils';

export const route: Route = {
    path: '/featured',
    categories: ['new-media'],
    example: '/grist/featured',
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
            source: ['grist.org/'],
        },
    ],
    name: 'Featured',
    maintainers: ['Rjnishant530'],
    handler,
    url: 'grist.org/',
};

async function handler() {
    const baseUrl = 'https://grist.org/';
    const { data: response } = await got(baseUrl);
    const $ = load(response);

    const listItems = $('li.hp-featured__tease')
        .toArray()
        .map((item) => {
            item = $(item);
            const link = item.find('.small-tease__link').attr('href').split('/').at(-2);
            return {
                link,
            };
        });
    const itemData = await Promise.all(listItems.map((item) => cache.tryGet(item.link, async () => (await getData(`https://grist.org/wp-json/wp/v2/posts?slug='${item.link}'&_embed`))[0])));
    const items = await getList(itemData);

    return {
        title: 'Gist Featured Articles',
        link: baseUrl,
        item: items,
        description: 'Featured Articles on Grist.org',
        logo: 'https://grist.org/wp-content/uploads/2021/03/cropped-Grist-Favicon.png?w=192',
        icon: 'https://grist.org/wp-content/uploads/2021/03/cropped-Grist-Favicon.png?w=32',
        language: 'en-us',
    };
}
