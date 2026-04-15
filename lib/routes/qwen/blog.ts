import type { Route } from '@/types';

import { fetchQwenArticles } from './common';

export const route: Route = {
    path: '/blog',
    categories: ['blog'],
    example: '/qwen/blog',
    name: 'Blog',
    maintainers: ['Kjasn'],
    handler,
    radar: [
        {
            source: ['qwen.ai/blog'],
            target: '/blog',
        },
    ],
    url: 'qwen.ai/blog',
};

async function handler() {
    return {
        title: 'Qwen Blog',
        description: 'Qwen official blog updates',
        link: 'https://qwen.ai/blog/',
        item: await fetchQwenArticles('en-US'),
    };
}
