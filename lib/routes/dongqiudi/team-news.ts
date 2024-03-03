// @ts-nocheck
const utils = require('./utils');

export default async (ctx) => {
    const teamId = ctx.req.param('team');

    await utils.ProcessFeed(ctx, 'team', teamId);
};
