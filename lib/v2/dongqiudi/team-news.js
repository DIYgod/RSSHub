const utils = require('./utils');

module.exports = async (ctx) => {
    const teamId = ctx.req.param('team');

    await utils.ProcessFeed(ctx, 'team', teamId);
};
