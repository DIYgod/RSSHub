import cache from '@/utils/cache';
import { defaultMode, defaultLanguage, rootUrl, ProcessItems } from './utils';

export default async (ctx) => {
    const mode = ctx.req.param('mode') ?? defaultMode;
    const language = ctx.req.param('language') ?? defaultLanguage;
    const currentUrl = `${rootUrl}/${language}/vl_bestrated.php?list&mode=${mode}`;

    ctx.set('data', await ProcessItems(language, currentUrl, cache.tryGet));
};
