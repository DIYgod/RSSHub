import utils from './utils.js';

export default async (ctx) => {
    ctx.state.data = await utils(ctx, `search?q=${ctx.params.keyword}`);
};
