const { ProcessFeed } = require('./utils');

module.exports = async (ctx) => (ctx.state.data = await ProcessFeed('character', ctx.req.param('id'), ctx.req.param('order')));
