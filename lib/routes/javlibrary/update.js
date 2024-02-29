import cache from '@/utils/cache';
const { defaultLanguage, rootUrl, ProcessItems } = require('./utils');

module.exports = async (ctx) => {
    const language = ctx.req.param('language') ?? defaultLanguage;
    const currentUrl = `${rootUrl}/${language}/vl_update.php?list`;

    ctx.set('data', await ProcessItems(language, currentUrl, cache.tryGet));
};
