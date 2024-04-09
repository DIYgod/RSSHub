const utils = require('./utils');

module.exports = async (ctx) => {
    const playerId = ctx.params.id;

    await utils.ProcessFeed(ctx, 'player', playerId);
};
