import utils from './utils.js';

export default async (ctx) => {
    const {
        date = `${new Date().getFullYear()}/${new Date().getMonth()}`
    } = ctx.params;

    ctx.state.data = await utils(ctx, `books/date/${date.replace('-', '/')}`);
};
