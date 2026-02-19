import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

import { parseItem } from './utils';

const rootUrl = 'https://www.coindesk.com';

export const route: Route = {
    path: '/consensus-magazine',
    categories: ['new-media'],
    example: '/coindesk/consensus-magazine',
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
            source: ['coindesk.com/'],
        },
    ],
    name: '新闻周刊',
    maintainers: ['jameshih'],
    handler,
    url: 'coindesk.com/',
};

async function handler() {
    const channel = 'consensus-magazine';

    const response = await ofetch(`${rootUrl}/${channel}`);
    const $ = load(response);

    const list = $('div h2')
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.text(),
                link: rootUrl + $item.parent().attr('href'),
            };
        });

    const items = await Promise.all(list.map((item) => cache.tryGet(item.link, () => parseItem(item))));

    return {
        title: 'CoinDesk Consensus Magazine',
        link: `${rootUrl}/${channel}`,
        item: items,
    };
}
