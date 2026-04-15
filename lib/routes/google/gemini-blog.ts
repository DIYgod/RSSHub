import type { Route } from '@/types';

import { baseUrl, fetchGoogleBlogCollection } from './blog-utils';

const targetUrl = `${baseUrl}/products-and-platforms/products/gemini/`;

export const route: Route = {
    path: '/gemini/blog',
    categories: ['blog'],
    example: '/google/gemini/blog',
    name: 'Gemini Blog',
    maintainers: ['Loongphy'],
    handler,
    radar: [
        {
            source: ['blog.google/products-and-platforms/products/gemini'],
            target: '/gemini/blog',
        },
    ],
    url: 'blog.google/products-and-platforms/products/gemini/',
};

async function handler() {
    return {
        title: 'Google Gemini Blog',
        description: 'Official Gemini news and updates',
        link: targetUrl,
        item: await fetchGoogleBlogCollection(targetUrl),
    };
}
