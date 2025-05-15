import { Route } from '@/types';
import got from '@/utils/got';
import { getItem } from './utils';

export const route: Route = {
    path: '/notes',
    categories: ['social-media'],
    example: '/crossbell/notes',
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
            source: ['crossbell.io/*'],
        },
    ],
    name: 'Notes',
    maintainers: ['DIYgod'],
    handler,
    url: 'crossbell.io/*',
};

async function handler() {
    const response = await got('https://indexer.crossbell.io/v1/notes', {
        searchParams: {
            includeCharacter: true,
        },
    });

    return {
        title: 'Crossbell Notes',
        link: 'https://crossbell.io/',
        item: response.data?.list?.map((item) => getItem(item)),
    };
}
