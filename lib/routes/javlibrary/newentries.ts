import cache from '@/utils/cache';
import { defaultLanguage, rootUrl, ProcessItems } from './utils';

export default async (ctx) => {
    const language = ctx.req.param('language') ?? defaultLanguage;
    const currentUrl = `${rootUrl}/${language}/vl_newentries.php?list`;

    ctx.set('data', await ProcessItems(language, currentUrl, cache.tryGet));
};
