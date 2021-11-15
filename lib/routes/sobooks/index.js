import utils from './utils.js';

export default async (ctx) => {
    const {
        category = ''
    } = ctx.params;

    ctx.state.data = await utils(ctx, category);
};
