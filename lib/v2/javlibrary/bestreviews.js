const { defaultMode, defaultLanguage, rootUrl, ProcessItems } = require('./utils');

module.exports = async (ctx) => {
    const mode = ctx.req.param('mode') ?? defaultMode;
    const language = ctx.req.param('language') ?? defaultLanguage;
    const currentUrl = `${rootUrl}/${language}/tl_bestreviews.php?list&mode=${mode}`;

    ctx.state.data = await ProcessItems(language, currentUrl, ctx.cache.tryGet);
};
