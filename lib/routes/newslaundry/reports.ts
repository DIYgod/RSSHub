import { Data, Route, ViewType } from '@/types';
import { fetchCollection } from './utils';

export const route: Route = {
    path: '/reports',
    view: ViewType.Articles,
    categories: ['new-media'],
    example: '/newslaundry/reports',
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
            source: ['newslaundry.com/reports'],
            target: '/reports',
        },
    ],
    name: 'Reports',
    maintainers: ['Rjnishant530'],
    handler,
};

async function handler(): Promise<Data> {
    return await fetchCollection('reports', undefined, true);
}
