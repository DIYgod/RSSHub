const utils = require('./utils');

module.exports = async (ctx) => {
    ctx.params.caty = ctx.params.caty || 'censored';
    ctx.params.query = ctx.params.query || '';

    const currentUrl = `${utils.rootUrl}/tags${ctx.params.caty === 'censored' ? '' : `/${ctx.params.caty}`}?${ctx.params.query}`;

    const title = `JavDB${ctx.params.query === '' ? '' : ` - ${ctx.params.query}`} `;

    ctx.state.data = await utils.ProcessItems(ctx, currentUrl, title);
};
