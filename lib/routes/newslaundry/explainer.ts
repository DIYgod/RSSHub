import type { Data, Route } from '@/types';
import { ViewType } from '@/types';

import { fetchCollection, rootUrl } from './utils';

export const route: Route = {
    path: '/explainer',
    view: ViewType.Articles,
    categories: ['new-media'],
    example: '/newslaundry/explainer',
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
            source: ['newslaundry.com/explainer'],
            target: '/explainer',
        },
    ],
    name: 'Explainer',
    maintainers: ['Rjnishant530'],
    handler,
};

async function handler(): Promise<Data> {
    return await fetchCollection('explainer', `${rootUrl}/explainer`);
}
