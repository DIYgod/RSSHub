import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';

import { parseItems, parseList } from './utils';

export const route: Route = {
    path: '/new',
    categories: ['reading'],
    example: '/literotica/new',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    radar: [
        {
            source: ['literotica.com/'],
        },
    ],
    name: 'New Stories',
    maintainers: ['nczitzk'],
    handler,
    url: 'literotica.com/',
};

async function handler() {
    const rootUrl = 'https://www.literotica.com';
    const currentUrl = `${rootUrl}/stories/new_submissions.php`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const items = await parseItems(parseList($, currentUrl));

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
