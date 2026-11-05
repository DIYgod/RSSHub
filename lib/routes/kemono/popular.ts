import type { Route } from '@/types';

import { KEMONO_ASSETS_URL, KEMONO_ROOT_URL } from './const';
import { createPublicHandler, periodOptions } from './public-feed';

export const route: Route = {
    path: '/posts/popular/:period?',
    categories: ['anime'],
    example: '/kemono/posts/popular/1d',
    parameters: { period: { description: 'Popular ranking period.', default: '1d', options: periodOptions } },
    name: 'Popular posts',
    maintainers: ['DIYgod'],
    features: { nsfw: true },
    radar: [{ source: ['kemono.cr/posts/popular'], target: '/posts/popular' }],
    handler: createPublicHandler(KEMONO_ROOT_URL, KEMONO_ASSETS_URL, 'Kemono', 'popular'),
};
