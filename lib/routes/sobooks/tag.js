import utils from './utils.js';

export default async (ctx) => {
    const {
        id = '小说'
    } = ctx.params;

    ctx.state.data = await utils(ctx, `books/tag/${id}`);
};
