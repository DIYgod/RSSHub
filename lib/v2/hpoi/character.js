const { ProcessFeed } = require('./utils');

module.exports = async (ctx) => ctx.set('data', await ProcessFeed('character', ctx.req.param('id'), ctx.req.param('order')));
