import { Route } from '@/types';
import cache from '@/utils/cache';
import { defaultMode, defaultLanguage, rootUrl, ProcessItems } from './utils';

export const route: Route = {
    path: '/bestreviews/:language?/:mode?',
    categories: ['multimedia'],
    example: '/javlibrary/bestreviews/en',
    parameters: { language: 'Language, see below, Japanese by default, as `ja`', mode: 'Mode, see below, Last Month by default, as `1`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Best Reviews',
    maintainers: ['nczitzk'],
    handler,
    description: `| Last Month | All Time |
  | ---------- | -------- |
  | 1          | 2        |`,
};

async function handler(ctx) {
    const mode = ctx.req.param('mode') ?? defaultMode;
    const language = ctx.req.param('language') ?? defaultLanguage;
    const currentUrl = `${rootUrl}/${language}/tl_bestreviews.php?list&mode=${mode}`;

    return await ProcessItems(language, currentUrl, cache.tryGet);
}
