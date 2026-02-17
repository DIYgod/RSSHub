import type { Route } from '@/types';
import cache from '@/utils/cache';

import { defaultLanguage, ProcessItems, rootUrl } from './utils';

export const route: Route = {
    path: ['/users/:id/:type/:language?', '/:type/:id/:language?'],
    name: 'Unknown',
    maintainers: [],
    handler,
    description: `| Wanted     | Watched     | Owned     |
| ---------- | ----------- | --------- |
| userwanted | userwatched | userowned |`,
    features: {
        nsfw: true,
    },
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const type = ctx.req.param('type');
    const language = ctx.req.param('language') ?? defaultLanguage;
    const currentUrl = `${rootUrl}/${language}/${type}.php?list&u=${id}`;

    return await ProcessItems(language, currentUrl, cache.tryGet);
}
