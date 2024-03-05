// @ts-nocheck
const fetchFeed = require('./utils');

export default async (ctx) => {
    const category = ctx.req.param('category');
    const currentUrl = `/cat/${category}`;

    ctx.set('data', await fetchFeed(ctx, currentUrl));
};
