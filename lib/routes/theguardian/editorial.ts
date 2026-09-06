import type { Route } from '@/types';

import { getFeed } from './utils';

export const route: Route = {
    path: '/editorial',
    categories: ['traditional-media'],
    example: '/theguardian/editorial',
    radar: [
        {
            source: ['www.theguardian.com/profile/editorial'],
        },
    ],
    name: 'Editorial',
    maintainers: ['HenryQW'],
    handler,
    description: 'Provides a better reading experience (full text articles) over the official one.',
};

function handler() {
    return getFeed({
        link: 'https://www.theguardian.com/profile/editorial',
        title: 'Editorial',
        rss: 'https://www.theguardian.com/tone/editorials/rss',
    });
}
