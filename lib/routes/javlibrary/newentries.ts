// @ts-nocheck
import cache from '@/utils/cache';
const { defaultLanguage, rootUrl, ProcessItems } = require('./utils');

export default async (ctx) => {
    const language = ctx.req.param('language') ?? defaultLanguage;
    const currentUrl = `${rootUrl}/${language}/vl_newentries.php?list`;

    ctx.set('data', await ProcessItems(language, currentUrl, cache.tryGet));
};
