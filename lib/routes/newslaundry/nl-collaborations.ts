import { Data, Route, ViewType } from '@/types';
import { fetchCollection, rootUrl } from './utils';

export const route: Route = {
    path: '/nl-collaborations',
    view: ViewType.Articles,
    categories: ['new-media'],
    example: '/newslaundry/nl-collaborations',
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
            source: ['newslaundry.com/nl-collaborations'],
            target: '/nl-collaborations',
        },
    ],
    name: 'NL Collaboration',
    maintainers: ['Rjnishant530'],
    handler,
};

async function handler(): Promise<Data> {
    return await fetchCollection('nl-collaborations', `${rootUrl}/nl-collaborations`);
}
