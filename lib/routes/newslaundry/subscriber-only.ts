import type { Data, Route } from '@/types';
import { ViewType } from '@/types';

import { fetchCollection } from './utils';

export const route: Route = {
    path: '/subscriber-only',
    view: ViewType.Articles,
    categories: ['new-media'],
    example: '/newslaundry/subscriber-only',
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
            source: ['newslaundry.com/subscriber-only'],
            target: '/subscriber-only',
        },
    ],
    name: 'Subscriber Only',
    maintainers: ['Rjnishant530'],
    handler,
};

async function handler(): Promise<Data> {
    return await fetchCollection('subscriber-only');
}
