const utils = require('./utils');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.gameres.com';

    ctx.state.data = await utils(ctx, rootUrl, '.hot-item h3');
};
