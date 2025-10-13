const { defaultMode, defaultLanguage, defaultMaker, rootUrl, ProcessItems } = require('./utils');

module.exports = async (ctx) => {
    const mode = ctx.params.mode ?? defaultMode;
    const maker = ctx.params.maker ?? defaultMaker;
    const language = ctx.params.language ?? defaultLanguage;
    const currentUrl = `${rootUrl}/${language}/vl_maker.php?list&m=${maker}&mode=${mode}`;

    ctx.state.data = await ProcessItems(language, currentUrl, ctx.cache.tryGet);
};
