// @ts-nocheck
const fetchItems = require('./utils');

export default async (ctx) => {
    const currentUrl = 'posts';

    ctx.set('data', await fetchItems(ctx, currentUrl));
};
