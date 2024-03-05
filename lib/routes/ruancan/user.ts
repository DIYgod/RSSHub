// @ts-nocheck
const fetchFeed = require('./utils');

export default async (ctx) => {
    const id = ctx.req.param('id');
    const currentUrl = `/i/${id}`;

    ctx.set('data', await fetchFeed(ctx, currentUrl));
};
