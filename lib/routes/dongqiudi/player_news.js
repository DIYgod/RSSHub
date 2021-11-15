import utils from './utils/js';

export default async (ctx) => {
    const id = ctx.params.id;
    const link = `https://www.dongqiudi.com/player/${id}.html`;

    await utils.ProcessFeed(ctx, link, 'player');
};
