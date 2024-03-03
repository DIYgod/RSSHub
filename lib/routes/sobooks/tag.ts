// @ts-nocheck
const utils = require('./utils');

export default async (ctx) => {
    const id = ctx.req.param('id') ?? '小说';

    ctx.set('data', await utils(ctx, `books/tag/${id}`));
};
