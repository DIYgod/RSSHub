const { processZxfkItems } = require('./util');

module.exports = async (ctx) => {
    const { site = 'beijing' } = ctx.params;
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 3;

    ctx.state.data = await processZxfkItems(site, 'ywzx', limit);
};
