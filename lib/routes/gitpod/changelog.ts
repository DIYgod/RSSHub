import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { rootUrl } from './utils';

export const route: Route = {
    path: '/changelog',
    categories: ['programming'],
    example: '/gitpod/changelog',
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
            source: ['gitpod.io/changelog', 'gitpod.io/'],
        },
    ],
    name: 'Changelog',
    maintainers: ['TonyRL'],
    handler,
    url: 'gitpod.io/changelog',
};

async function handler() {
    const response = await got(rootUrl + '/changelog');
    const $ = load(response.data);
    const items = $('div[class^=changelog-entry]')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('h2').text(),
                link: rootUrl + item.find('a').attr('href'),
                description: item.find('div[class^=content-docs]').html(),
                pubDate: parseDate(item.find('a[class*=mb-xx-small]').text()),
                author: item
                    .find('span[class^=flex-shrink-0]')
                    .eq(0)
                    .find('img')
                    .toArray()
                    .map((e) => $(e).attr('alt').replace('Avatar of ', ''))
                    .join(', '),
            };
        });

    return {
        title: $('title').text(),
        link: rootUrl + '/changelog',
        description: $('meta[name="description"]').attr('content'),
        language: 'en-US',
        item: items,
    };
}
