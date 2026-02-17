import type { Route } from '@/types';
import got from '@/utils/got';

import { getItem } from './utils';

export const route: Route = {
    path: '/notes/source/:source',
    categories: ['social-media'],
    example: '/crossbell/notes/source/xlog',
    parameters: { source: 'N' },
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
            source: ['crossbell.io/*'],
            target: '/notes',
        },
    ],
    name: 'Notes of source',
    maintainers: ['DIYgod'],
    handler,
    url: 'crossbell.io/*',
};

async function handler(ctx) {
    const source = ctx.req.param('source');

    const response = await got('https://indexer.crossbell.io/v1/notes', {
        searchParams: {
            sources: source,
            includeCharacter: true,
        },
    });

    return {
        title: 'Crossbell Notes from ' + source,
        link: 'https://crossbell.io/',
        item: response.data?.list?.map((item) => getItem(item)),
    };
}
