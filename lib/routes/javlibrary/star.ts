import type { Route } from '@/types';
import cache from '@/utils/cache';

import { defaultLanguage, defaultMode, ProcessItems, rootUrl } from './utils';

export const route: Route = {
    path: '/star/:id/:language?/:mode?',
    categories: ['multimedia'],
    example: '/javlibrary/star/abbds/en',
    parameters: { id: 'Star id, can be found in URL', language: 'Language, see below, Japanese by default, as `ja`', mode: 'Mode, see below, videos with comments (by date) by default, as `1`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    name: 'Videos by star',
    maintainers: ['nczitzk'],
    handler,
    description: `| videos with comments (by date) | everything (by date) |
| ------------------------------ | -------------------- |
| 1                              | 2                    |

::: tip
  See [Ranking](https://www.javlibrary.com/en/star_mostfav.php) to view stars by ranks.

  See [Directory](https://www.javlibrary.com/en/star_list.php) to view all stars.
:::`,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const mode = ctx.req.param('mode') ?? defaultMode;
    const language = ctx.req.param('language') ?? defaultLanguage;
    const currentUrl = `${rootUrl}/${language}/vl_star.php?list&s=${id}&mode=${mode}`;

    return await ProcessItems(language, currentUrl, cache.tryGet);
}
