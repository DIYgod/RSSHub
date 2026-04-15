import type { Route } from '@/types';

import { baseUrl, fetchGoogleBlogCollection } from './blog-utils';

const targetUrl = `${baseUrl}/technology/ai/`;

export const route: Route = {
    path: '/ai',
    categories: ['blog'],
    example: '/google/ai',
    name: 'AI',
    maintainers: ['Loongphy'],
    handler,
    radar: [
        {
            source: ['blog.google/technology/ai'],
            target: '/ai',
        },
    ],
    url: 'blog.google/technology/ai/',
};

async function handler() {
    return {
        title: 'Google AI Blog',
        description: 'Official Google AI news and updates',
        link: targetUrl,
        item: await fetchGoogleBlogCollection(targetUrl, 'main a[href]'),
    };
}
