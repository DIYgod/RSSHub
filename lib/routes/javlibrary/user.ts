import type { Route } from '@/types';

import { defaultLanguage, ProcessItems, rootUrl } from './utils';

export const route: Route = {
    path: ['/users/:id/:type/:language?', '/:type/:id/:language?'],
    categories: ['multimedia'],
    example: '/javlibrary/userwatched/mangudai/en',
    parameters: { type: 'Type, see below', id: 'User id, can be found in URL', language: 'Language, see below, Japanese by default, as `ja`' },
    name: 'Videos by user',
    maintainers: ['nczitzk', 'DIYgod', 'junfengP'],
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

    return await ProcessItems(language, currentUrl);
}
