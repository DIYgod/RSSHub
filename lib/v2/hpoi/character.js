const { ProcessFeed } = require('./utils');

module.exports = async (ctx) => (ctx.state.data = await ProcessFeed('character', ctx.params.id, ctx.params.order));
