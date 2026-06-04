import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';

import getItems from './items-processor';

export const route: Route = {
    path: '/public',
    categories: ['traditional-media'],
    example: '/publico/public',
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['publico.es/public'],
            target: '/public',
        },
    ],
    name: 'Public',
    maintainers: ['adrianrico97'],
    handler,
};

async function handler() {
    const rootUrl = 'https://www.publico.es';
    const currentUrl = `${rootUrl}/public`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const items = getItems($);

    return {
        title: 'public | Público',
        link: currentUrl,
        item: items,
    };
}
