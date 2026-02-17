import type { Route } from '@/types';

import { commonHandler } from './category';

export const route: Route = {
    path: '/most-viewed',
    categories: ['finance'],
    example: '/finology/most-viewed',
    radar: [
        {
            source: ['insider.finology.in/most-viewed'],
            target: '/most-viewed',
        },
    ],
    name: 'Most Viewed',
    maintainers: ['Rjnishant530'],
    handler,
    url: 'insider.finology.in/most-viewed',
};

async function handler() {
    const extra = {
        description: (topic: string) => `Check out the most talked-about articles among our readers! ${topic}`,
        date: false,
        selector: `div.card`,
    };
    return await commonHandler('https://insider.finology.in', '/most-viewed', extra);
}
