import type { Route } from '@/types';

import { defaultLanguage, ProcessItems, rootUrl } from './utils';

export const route: Route = {
    path: ['/videos/update/:language?', '/update/:language?'],
    categories: ['multimedia'],
    example: '/javlibrary/update/en',
    parameters: { language: 'Language, see below, Japanese by default, as `ja`' },
    name: 'Recently Discussed Videos',
    maintainers: ['nczitzk'],
    handler,
    features: {
        nsfw: true,
    },
};

async function handler(ctx) {
    const language = ctx.req.param('language') ?? defaultLanguage;
    const currentUrl = `${rootUrl}/${language}/vl_update.php?list`;

    return await ProcessItems(language, currentUrl);
}
