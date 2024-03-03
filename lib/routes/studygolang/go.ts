// @ts-nocheck
const { FetchGoItems } = require('./utils');

export default async (ctx) => {
    ctx.set('data', await FetchGoItems(ctx));
};
