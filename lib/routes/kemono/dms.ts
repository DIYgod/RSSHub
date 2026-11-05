import type { Route } from '@/types';

import { KEMONO_ASSETS_URL, KEMONO_ROOT_URL } from './const';
import { createPublicHandler } from './public-feed';

export const route: Route = {
    path: '/:source/:id/dms',
    categories: ['anime'],
    example: '/kemono/patreon/123870346/dms',
    parameters: { source: 'Source from the website URL, such as patreon.', id: 'Creator ID from the website URL.' },
    name: 'Creator direct messages',
    maintainers: ['DIYgod'],
    features: { nsfw: true },
    radar: [{ source: ['kemono.cr/:source/user/:id/dms'], target: '/:source/:id/dms' }],
    handler: createPublicHandler(KEMONO_ROOT_URL, KEMONO_ASSETS_URL, 'Kemono', 'dms'),
};
