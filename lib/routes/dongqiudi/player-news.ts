import utils from './utils';

export default async (ctx) => {
    const playerId = ctx.req.param('id');

    await utils.ProcessFeed(ctx, 'player', playerId);
};
