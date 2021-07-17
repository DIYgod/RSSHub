const utils = require('./utils');

module.exports = async (ctx) => {
    const category = ctx.params.category || 'censored';
    const query = ctx.params.query || '';

    const currentUrl = `/tags${category === 'censored' ? '' : `/${category}`}?${query}`;

    const title = `JavDB${query === '' ? '' : ` - ${query}`} `;

    ctx.state.data = await utils.ProcessItems(ctx, currentUrl, title);
};
