import utils from './utils.js';

export default async (ctx) => {
    ctx.state.data = await utils.processItems(ctx, utils.rootUrl);
};
