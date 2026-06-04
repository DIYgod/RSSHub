import type { Route } from '@/types';

import { buildCommunityFeed } from './utils';

export const route: Route = {
    path: '/plugins',
    name: 'Plugins',
    maintainers: ['DIYgod'],
    categories: ['program-update'],
    example: '/obsidian/plugins',
    handler,
};

function handler() {
    return buildCommunityFeed('plugin');
}
