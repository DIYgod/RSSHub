import { Route } from '@/types';
import cache from '@/utils/cache';
import { defaultLanguage, rootUrl, ProcessItems } from './utils';

export const route: Route = {
    path: ['/videos/update/:language?', '/update/:language?'],
    name: 'Unknown',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const language = ctx.req.param('language') ?? defaultLanguage;
    const currentUrl = `${rootUrl}/${language}/vl_update.php?list`;

    return await ProcessItems(language, currentUrl, cache.tryGet);
}
