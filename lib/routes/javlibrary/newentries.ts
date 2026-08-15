import type { Route } from '@/types';

import { defaultLanguage, ProcessItems, rootUrl } from './utils';

export const route: Route = {
    path: ['/videos/newentries/:language?', '/newentries/:language?'],
    categories: ['multimedia'],
    example: '/javlibrary/newentries/en',
    parameters: { language: 'Language, see below, Japanese by default, as `ja`' },
    name: 'Recently Inserted Videos',
    maintainers: ['nczitzk'],
    handler,
    features: {
        nsfw: true,
    },
};

async function handler(ctx) {
    const language = ctx.req.param('language') ?? defaultLanguage;
    const currentUrl = `${rootUrl}/${language}/vl_newentries.php?list`;

    return await ProcessItems(language, currentUrl);
}
