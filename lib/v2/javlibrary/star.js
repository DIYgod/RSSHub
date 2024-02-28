const { defaultMode, defaultLanguage, rootUrl, ProcessItems } = require('./utils');

module.exports = async (ctx) => {
    const id = ctx.req.param('id');
    const mode = ctx.req.param('mode') ?? defaultMode;
    const language = ctx.req.param('language') ?? defaultLanguage;
    const currentUrl = `${rootUrl}/${language}/vl_star.php?list&s=${id}&mode=${mode}`;

    ctx.state.data = await ProcessItems(language, currentUrl, ctx.cache.tryGet);
};
