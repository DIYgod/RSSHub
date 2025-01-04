import { Data, Route } from '@/types';
import { load } from 'cheerio';
import { processList, rootUrl } from './utils';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/',
    categories: ['programming', 'popular'],
    example: '/',
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
            target: '/',
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
