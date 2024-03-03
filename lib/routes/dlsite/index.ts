// @ts-nocheck
const { ProcessItems } = require('./utils');

export default async (ctx) => {
    ctx.set('data', await ProcessItems(ctx));
};
