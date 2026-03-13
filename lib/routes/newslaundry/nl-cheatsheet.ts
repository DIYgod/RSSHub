import type { Data, Route } from '@/types';
import { ViewType } from '@/types';

import { fetchCollection, rootUrl } from './utils';

export const route: Route = {
    path: '/nl-cheatsheet',
    view: ViewType.Articles,
    categories: ['new-media'],
    example: '/newslaundry/nl-cheatsheet',
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
            source: ['newslaundry.com/collection/nl-cheatsheet'],
            target: '/nl-cheatsheet',
        },
    ],
    name: 'Explains',
    maintainers: ['Rjnishant530'],
    handler,
};

async function handler(): Promise<Data> {
    return await fetchCollection('nl-cheatsheet', `${rootUrl}/collection/nl-cheatsheet`);
}
