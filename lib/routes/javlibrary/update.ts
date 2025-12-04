import type { Route } from '@/types';
import cache from '@/utils/cache';

import { defaultLanguage, ProcessItems, rootUrl } from './utils';

export const route: Route = {
    path: ['/videos/update/:language?', '/update/:language?'],
    name: 'Unknown',
    maintainers: [],
    handler,
    features: {
        nsfw: true,
    },
};

async function handler(ctx) {
    const language = ctx.req.param('language') ?? defaultLanguage;
    const currentUrl = `${rootUrl}/${language}/vl_update.php?list`;

    return await ProcessItems(language, currentUrl, cache.tryGet);
}
