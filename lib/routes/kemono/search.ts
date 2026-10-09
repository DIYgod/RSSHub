import type { Route } from '@/types';

import { KEMONO_ASSETS_URL, KEMONO_ROOT_URL } from './const';
import { createPublicHandler } from './public-feed';

export const route: Route = {
    path: '/posts/:query',
    categories: ['anime'],
    example: '/kemono/posts/music',
    parameters: { query: 'Post search query.' },
    name: 'Search posts',
    maintainers: ['DIYgod'],
    features: { nsfw: true },
    handler: createPublicHandler(KEMONO_ROOT_URL, KEMONO_ASSETS_URL, 'Kemono', 'search'),
};
