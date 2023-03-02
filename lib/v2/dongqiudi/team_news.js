const utils = require('./utils');

module.exports = async (ctx) => {
    const teamId = ctx.params.team;

    await utils.ProcessFeed(ctx, 'team', teamId);
};
