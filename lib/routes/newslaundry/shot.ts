import type { Data, Route } from '@/types';
import { ViewType } from '@/types';

import { fetchCollection } from './utils';

export const route: Route = {
    path: '/shot',
    view: ViewType.Articles,
    categories: ['new-media'],
    example: '/newslaundry/shot',
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
            source: ['newslaundry.com/shot'],
            target: '/shot',
        },
    ],
    name: 'Shot',
    maintainers: ['Rjnishant530'],
    handler,
};

async function handler(): Promise<Data> {
    return await fetchCollection('shot');
}
