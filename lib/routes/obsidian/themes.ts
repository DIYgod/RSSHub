import type { Route } from '@/types';

import { buildCommunityFeed } from './utils';

export const route: Route = {
    path: '/themes',
    name: 'Themes',
    maintainers: ['DIYgod'],
    categories: ['program-update'],
    example: '/obsidian/themes',
    handler,
};

function handler() {
    return buildCommunityFeed('theme');
}
