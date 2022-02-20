const { defaultLanguage, rootUrl, ProcessItems } = require('./utils');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const type = ctx.params.type;
    const language = ctx.params.language ?? defaultLanguage;
    const currentUrl = `${rootUrl}/${language}/${type}.php?list&u=${id}`;

    ctx.state.data = await ProcessItems(language, currentUrl, ctx.cache.tryGet);
};
