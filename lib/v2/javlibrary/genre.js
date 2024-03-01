const { defaultMode, defaultGenre, defaultLanguage, rootUrl, ProcessItems } = require('./utils');

module.exports = async (ctx) => {
    const mode = ctx.params.mode ?? defaultMode;
    const genre = ctx.params.genre ?? defaultGenre;
    const language = ctx.params.language ?? defaultLanguage;
    const currentUrl = `${rootUrl}/${language}/vl_genre.php?list&g=${genre}&mode=${mode}`;

    ctx.state.data = await ProcessItems(language, currentUrl, ctx.cache.tryGet);
};
