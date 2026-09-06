import type { Route } from '@/types';

import { defaultGenre, defaultLanguage, defaultMode, ProcessItems, rootUrl } from './utils';

export const route: Route = {
    path: ['/videos/genre/:genre?/:language?/:mode?', '/genre/:genre?/:language?/:mode?'],
    categories: ['multimedia'],
    example: '/javlibrary/genre/amjq/en',
    parameters: { genre: 'Category, Acme · Orgasm by default, as `amjq`', language: 'Language, see below, Japanese by default, as `ja`', mode: 'Mode, see below, videos with comments (by date) by default, as `1`' },
    name: 'Videos by categories',
    maintainers: ['nczitzk'],
    handler,
    description: `| videos with comments (by date) | everything (by date) |
| ------------------------------ | -------------------- |
| 1                              | 2                    |

::: tip
See [Categories](https://www.javlibrary.com/en/genres.php) to view all categories.
:::`,
    features: {
        nsfw: true,
    },
};

async function handler(ctx) {
    const mode = ctx.req.param('mode') ?? defaultMode;
    const genre = ctx.req.param('genre') ?? defaultGenre;
    const language = ctx.req.param('language') ?? defaultLanguage;
    const currentUrl = `${rootUrl}/${language}/vl_genre.php?list&g=${genre}&mode=${mode}`;

    return await ProcessItems(language, currentUrl);
}
