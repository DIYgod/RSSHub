// @ts-nocheck
const utils = require('./utils');

export default async (ctx) => {
    const category = ctx.req.param('category') ?? '';

    ctx.set('data', await utils(ctx, category));
};
