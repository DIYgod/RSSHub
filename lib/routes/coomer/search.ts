import { config } from '@/config';
import type { Route } from '@/types';

import { createPublicHandler } from '../kemono/public-feed';

export const route: Route = {
    path: '/posts/:query',
    categories: ['multimedia'],
    example: '/coomer/posts/dance',
    parameters: { query: 'Post search query.' },
    name: 'Search posts',
    maintainers: ['DIYgod'],
    features: { nsfw: true },
    handler: createPublicHandler(config.coomer.rootUrl, config.coomer.assetsUrl, 'Coomer', 'search'),
};
