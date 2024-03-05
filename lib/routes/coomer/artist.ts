// @ts-nocheck
const fetchItems = require('./utils');

export default async (ctx) => {
    const id = ctx.req.param('id');

    const currentUrl = `onlyfans/user/${id}`;

    ctx.set('data', await fetchItems(ctx, currentUrl));
};
