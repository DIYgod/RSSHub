import utils from './utils';

export default async (ctx) => {
    const category = ctx.req.param('category') ?? '';

    ctx.set('data', await utils(ctx, category));
};
