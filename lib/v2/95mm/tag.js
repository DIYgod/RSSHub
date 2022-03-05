const { rootUrl, ProcessItems } = require('./utils');

module.exports = async (ctx) => {
    const tag = ctx.params.tag;

    const currentUrl = `${rootUrl}/tag-${tag}/page-1/index.html`;

    ctx.state.data = await ProcessItems(ctx, tag, currentUrl);
};
