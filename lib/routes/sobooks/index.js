import utils from './utils/js';

export default async (ctx) => {
    const category = ctx.params.category || '';

    ctx.state.data = await utils(ctx, category);
};
