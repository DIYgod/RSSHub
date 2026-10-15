import { config } from '@/config';
import type { Route } from '@/types';

import { createPublicHandler, periodOptions } from '../kemono/public-feed';

export const route: Route = {
    path: '/posts/popular/:period?',
    categories: ['multimedia'],
    example: '/coomer/posts/popular/1d',
    parameters: { period: { description: 'Popular ranking period.', default: '1d', options: periodOptions } },
    name: 'Popular posts',
    maintainers: ['DIYgod'],
    features: { nsfw: true },
    radar: [{ source: ['coomer.st/posts/popular'], target: '/posts/popular' }],
    handler: createPublicHandler(config.coomer.rootUrl, config.coomer.assetsUrl, 'Coomer', 'popular'),
};
