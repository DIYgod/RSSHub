// @ts-nocheck
const fetchFeed = require('./utils');

export default async (ctx) => {
    const keyword = ctx.req.param('keyword');
    const currentUrl = `/?s=${keyword}`;

    ctx.set('data', await fetchFeed(ctx, currentUrl));
};
