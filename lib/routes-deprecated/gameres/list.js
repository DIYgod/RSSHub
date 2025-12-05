const utils = require('./utils');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.gameres.com';
    const currentUrl = `${rootUrl}/list/${ctx.params.id}`;

    ctx.state.data = await utils(ctx, currentUrl, '.feed-item-right a h3');
};
