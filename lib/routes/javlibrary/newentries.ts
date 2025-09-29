import { Route } from '@/types';
import cache from '@/utils/cache';
import { defaultLanguage, rootUrl, ProcessItems } from './utils';

export const route: Route = {
    path: ['/videos/newentries/:language?', '/newentries/:language?'],
    name: 'Unknown',
    maintainers: [],
    handler,
    features: {
        nsfw: true,
    },
};

async function handler(ctx) {
    const language = ctx.req.param('language') ?? defaultLanguage;
    const currentUrl = `${rootUrl}/${language}/vl_newentries.php?list`;

    return await ProcessItems(language, currentUrl, cache.tryGet);
}
