const utils = require('./utils');

module.exports = async (ctx) => {
    const currentUrl = `${ctx.params.model}/top?${ctx.params.lang ? 'lang=' + ctx.params.lang : ''}${ctx.params.type ? '&compatible=' + ctx.params.type : ''}${ctx.params.sortBy ? '&sortby=' + ctx.params.sortBy : ''}${
        ctx.params.time ? '&topof=' + ctx.params.time : ''
    }`;

    ctx.state.data = await utils(ctx, currentUrl);
};
