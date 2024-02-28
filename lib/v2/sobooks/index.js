const utils = require('./utils');

module.exports = async (ctx) => {
    const category = ctx.req.param('category') ?? '';

    ctx.set('data', await utils(ctx, category));
};
