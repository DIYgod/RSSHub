// @ts-nocheck
const utils = require('./utils');

export default async (ctx) => {
    const category = ctx.req.param('category') ?? 'censored';
    const time = ctx.req.param('time') ?? 'daily';

    const currentUrl = `/rankings/movies?p=${time}&t=${category}`;

    const title = 'JavDB';

    ctx.set('data', await utils.ProcessItems(ctx, currentUrl, title));
};
