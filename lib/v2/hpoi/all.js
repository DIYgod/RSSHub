const { ProcessFeed } = require('./utils');

module.exports = async (ctx) => (ctx.state.data = await ProcessFeed('all', 0, ctx.req.param('order')));
