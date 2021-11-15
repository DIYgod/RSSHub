import utils from './utils/js';

export default async (ctx) => {
    const currentUrl = ctx.params.caty || 'mindmaps';

    ctx.state.data = await utils(ctx, currentUrl);
};
