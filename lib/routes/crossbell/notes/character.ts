import type { Route } from '@/types';
import got from '@/utils/got';

import { getItem } from './utils';

export const route: Route = {
    path: '/notes/character/:characterId',
    categories: ['social-media'],
    example: '/crossbell/notes/character/10',
    parameters: { characterId: 'N' },
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
    name: 'Notes of character',
    maintainers: ['DIYgod'],
    handler,
    url: 'crossbell.io/*',
};

async function handler(ctx) {
    const characterId = ctx.req.param('characterId');

    const response = await got('https://indexer.crossbell.io/v1/notes', {
        searchParams: {
            characterId,
            includeCharacter: true,
        },
    });

    const name = response.data?.list?.[0]?.character?.metadata?.content?.name || response.data?.list?.[0]?.character?.handle || characterId;
    const handle = response.data?.list?.[0]?.character?.handle;

    return {
        title: 'Crossbell Notes from ' + name,
        link: 'https://xchar.app/' + handle,
        item: response.data?.list?.map((item) => getItem(item)),
    };
}
