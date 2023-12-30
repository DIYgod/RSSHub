const { rootUrl, ProcessItems } = require('./utils');

module.exports = async (ctx) => {
    const tab = ctx.params.tab ?? '最新';

    const currentUrl = `${rootUrl}/home-ajax/index.html?tabcid=${tab}&page=1`;

    ctx.state.data = await ProcessItems(ctx, tab, currentUrl);
};
