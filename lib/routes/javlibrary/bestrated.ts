import type { Route } from '@/types';
import cache from '@/utils/cache';

import { defaultLanguage, defaultMode, ProcessItems, rootUrl } from './utils';

export const route: Route = {
    path: ['/videos/bestrated/:language?/:mode?', '/bestrated/:language?/:mode?'],
    name: 'Unknown',
    maintainers: [],
    handler,
    description: `| Last Month | All Time |
| ---------- | -------- |
| 1          | 2        |`,
    features: {
        nsfw: true,
    },
};

async function handler(ctx) {
    const mode = ctx.req.param('mode') ?? defaultMode;
    const language = ctx.req.param('language') ?? defaultLanguage;
    const currentUrl = `${rootUrl}/${language}/vl_bestrated.php?list&mode=${mode}`;

    return await ProcessItems(language, currentUrl, cache.tryGet);
}
