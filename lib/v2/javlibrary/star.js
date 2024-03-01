const { defaultMode, defaultLanguage, rootUrl, ProcessItems } = require('./utils');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const mode = ctx.params.mode ?? defaultMode;
    const language = ctx.params.language ?? defaultLanguage;
    const currentUrl = `${rootUrl}/${language}/vl_star.php?list&s=${id}&mode=${mode}`;

    ctx.state.data = await ProcessItems(language, currentUrl, ctx.cache.tryGet);
};
