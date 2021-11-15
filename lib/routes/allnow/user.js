import utils from './utils/js';

export default async (ctx) => {
    const id = ctx.params.id;

    ctx.state.data = await utils.processItems(ctx, `${utils.rootUrl}/user/${id}`);
};
