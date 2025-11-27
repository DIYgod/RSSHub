import { load } from 'cheerio';

import type { Data, Route } from '@/types';
import ofetch from '@/utils/ofetch';

import { processList, rootUrl } from './utils';

export const route: Route = {
    path: '/latest',
    categories: ['programming'],
    example: '/latest',
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
            source: ['30secondsofcode.org'],
            target: '/latest',
        },
    ],
    name: 'New & Popular Snippets',
    maintainers: ['Rjnishant530'],
    handler,
};

async function handler() {
    const response = await ofetch(rootUrl);

    const $ = load(response);
    const fullList = $('section.preview-list > ul > li').toArray();
    const items = await processList(fullList);
    return {
        title: 'New & Popular Snippets',
        description: 'Discover short code snippets for all your development needs.',
        link: rootUrl,
        item: items,
    } as Data;
}
