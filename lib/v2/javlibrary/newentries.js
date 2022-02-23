const { defaultLanguage, rootUrl, ProcessItems } = require('./utils');

module.exports = async (ctx) => {
    const language = ctx.params.language ?? defaultLanguage;
    const currentUrl = `${rootUrl}/${language}/vl_newentries.php?list`;

    ctx.state.data = await ProcessItems(language, currentUrl, ctx.cache.tryGet);
};
