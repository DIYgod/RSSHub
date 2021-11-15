import utils from './utils/js';

export default async (ctx) => {
    const date = ctx.params.date || `${new Date().getFullYear()}/${new Date().getMonth()}`;

    ctx.state.data = await utils(ctx, `books/date/${date.replace('-', '/')}`);
};
