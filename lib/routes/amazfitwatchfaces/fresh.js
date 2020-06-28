const utils = require('./utils');

module.exports = async (ctx) => {
    const currentUrl = `${ctx.params.model}/fresh?${ctx.params.lang ? 'lang=' + ctx.params.lang : ''}${ctx.params.type ? '&compatible=' + ctx.params.type : ''}`;

    ctx.state.data = await utils(ctx, currentUrl);
};
