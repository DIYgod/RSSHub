import type { Route } from '@/types';

import { defaultLanguage, defaultMode, ProcessItems, rootUrl } from './utils';

export const route: Route = {
    path: ['/videos/newrelease/:language?/:mode?', '/newrelease/:language?/:mode?'],
    categories: ['multimedia'],
    example: '/javlibrary/newrelease/en',
    parameters: { language: 'Language, see below, Japanese by default, as `ja`', mode: 'Mode, see below, videos with comments (by date) by default, as `1`' },
    name: 'New Releases',
    maintainers: ['nczitzk'],
    handler,
    description: `| videos with comments (by date) | everything (by date) |
| ------------------------------ | -------------------- |
| 1                              | 2                    |`,
    features: {
        nsfw: true,
    },
};

async function handler(ctx) {
    const mode = ctx.req.param('mode') ?? defaultMode;
    const language = ctx.req.param('language') ?? defaultLanguage;
    const currentUrl = `${rootUrl}/${language}/vl_newrelease.php?list&mode=${mode}`;

    return await ProcessItems(language, currentUrl);
}
