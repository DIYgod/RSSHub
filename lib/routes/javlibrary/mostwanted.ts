// @ts-nocheck
import cache from '@/utils/cache';
const { defaultMode, defaultLanguage, rootUrl, ProcessItems } = require('./utils');

export default async (ctx) => {
    const mode = ctx.req.param('mode') ?? defaultMode;
    const language = ctx.req.param('language') ?? defaultLanguage;
    const currentUrl = `${rootUrl}/${language}/vl_mostwanted.php?list&mode=${mode}`;

    ctx.set('data', await ProcessItems(language, currentUrl, cache.tryGet));
};
