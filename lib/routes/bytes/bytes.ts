import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const currentURL = 'https://bytes.dev/archives';

export const route: Route = {
    path: '/',
    categories: ['programming'],
    example: '/bytes',
    radar: [
        {
            source: ['bytes.dev/archives', 'bytes.dev/'],
            target: '',
        },
    ],
    name: 'Your weekly dose of JS',
    maintainers: ['meixger'],
    description: 'Staying informed on the JavaScript ecosystem has never been so entertaining. Delivered every Monday and Thursday, for free.',
    handler,
    url: 'bytes.dev/archives',
};

async function handler() {
    const resp = await got(currentURL);
    const $ = load(resp.data);
    const items = $('main a[href^="/archives/"]')
        .toArray()
        .map((element) => {
            const $item = $(element);
            return {
                title: $item.find('h3 > span').text(),
                pubDate: parseDate($item.find('span').first().text(), 'M/D/YYYY'),
                description: $item.find('h3 > p, h3 > div').text(),
                link: new URL($item.attr('href')!, currentURL).href,
            };
        });

    return {
        title: 'bytes.dev',
        description: 'Your weekly dose of JS',
        link: currentURL,
        item: items,
    };
}
