import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';

import getItems from './items-processor';

export const route: Route = {
    path: '/politica',
    categories: ['traditional-media'],
    example: '/politica',
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
            source: ['publico.es/politica'],
            target: '/politica',
        },
    ],
    name: 'Política | Público',
    maintainers: ['adrianrico97'],
    handler,
};

async function handler() {
    const rootUrl = 'https://www.publico.es';
    const currentUrl = `${rootUrl}/politica`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const items = getItems($);

    return {
        title: 'Política | Público',
        link: currentUrl,
        item: items,
    };
}
