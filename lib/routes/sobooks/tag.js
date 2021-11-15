import utils from './utils/js';

export default async (ctx) => {
    const id = ctx.params.id || '小说';

    ctx.state.data = await utils(ctx, `books/tag/${id}`);
};
