const { ProcessFeed } = require('./utils');

module.exports = async (ctx) => (ctx.state.data = await ProcessFeed('work', ctx.req.param('id'), ctx.req.param('order')));
