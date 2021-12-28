const utils = require('./utils');

module.exports = async (ctx) => {
    const rootUrl = `https://www.95mm.net/tag-${ctx.params.tag}/page-1/index.html`;

    ctx.state.data = await utils(ctx, ctx.params.tag, rootUrl);
};
