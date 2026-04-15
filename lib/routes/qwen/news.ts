import type { Route } from '@/types';

import { fetchQwenArticles } from './common';

export const route: Route = {
    path: '/news',
    categories: ['program-update'],
    example: '/qwen/news',
    name: 'News',
    maintainers: ['Kjasn'],
    handler,
    radar: [
        {
            source: ['qwen.ai/news'],
            target: '/news',
        },
    ],
    url: 'qwen.ai/news',
};

async function handler() {
    return {
        title: 'Qwen News',
        description: 'Qwen official updates',
        link: 'https://qwen.ai/news',
        item: (await fetchQwenArticles('en-US')).filter((entry) => entry.category?.includes('Release')),
    };
}
