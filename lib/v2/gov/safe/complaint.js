const { processZxfkItems } = require('./util');

module.exports = async (ctx) => {
    const { site = 'beijing' } = ctx.params;
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 5;

    ctx.state.data = await processZxfkItems(site, 'tsjy', limit);
};
