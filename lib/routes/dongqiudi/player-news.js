const utils = require('./utils');

module.exports = async (ctx) => {
    const playerId = ctx.req.param('id');

    await utils.ProcessFeed(ctx, 'player', playerId);
};
