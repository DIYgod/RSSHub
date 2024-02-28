const { defaultLanguage, rootUrl, ProcessItems } = require('./utils');

module.exports = async (ctx) => {
    const id = ctx.req.param('id');
    const type = ctx.req.param('type');
    const language = ctx.req.param('language') ?? defaultLanguage;
    const currentUrl = `${rootUrl}/${language}/${type}.php?list&u=${id}`;

    ctx.state.data = await ProcessItems(language, currentUrl, ctx.cache.tryGet);
};
