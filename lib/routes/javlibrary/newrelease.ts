import { Route } from '@/types';
import cache from '@/utils/cache';
import { defaultMode, defaultLanguage, rootUrl, ProcessItems } from './utils';

export const route: Route = {
    path: ['/videos/newrelease/:language?/:mode?', '/newrelease/:language?/:mode?'],
    name: 'Unknown',
    maintainers: [],
    handler,
    description: `| videos with comments (by date) | everything (by date) |
  | ------------------------------ | -------------------- |
  | 1                              | 2                    |`,
};

async function handler(ctx) {
    const mode = ctx.req.param('mode') ?? defaultMode;
    const language = ctx.req.param('language') ?? defaultLanguage;
    const currentUrl = `${rootUrl}/${language}/vl_newrelease.php?list&mode=${mode}`;

    return await ProcessItems(language, currentUrl, cache.tryGet);
}
