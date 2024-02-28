const { ProcessFeed } = require('./utils');

module.exports = async (ctx) => ctx.set('data', await ProcessFeed('all', 0, ctx.req.param('order')));
