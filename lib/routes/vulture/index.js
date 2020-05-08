const utils = require('./utils');

module.exports = async (ctx) => {
    const url = `https://www.vulture.com/${ctx.params.type}/`;
    const title = `Vulture - ${ctx.params.type}`;
    const tagsToExclude = ctx.params.excludetags;

    ctx.state.data = await utils.getData(ctx, url, title, tagsToExclude);
};
