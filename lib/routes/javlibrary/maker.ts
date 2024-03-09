import cache from '@/utils/cache';
import { defaultMode, defaultLanguage, defaultMaker, rootUrl, ProcessItems } from './utils';

export default async (ctx) => {
    const mode = ctx.req.param('mode') ?? defaultMode;
    const maker = ctx.req.param('maker') ?? defaultMaker;
    const language = ctx.req.param('language') ?? defaultLanguage;
    const currentUrl = `${rootUrl}/${language}/vl_maker.php?list&m=${maker}&mode=${mode}`;

    ctx.set('data', await ProcessItems(language, currentUrl, cache.tryGet));
};
