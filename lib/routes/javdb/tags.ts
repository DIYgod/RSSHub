// @ts-nocheck
const utils = require('./utils');

export default async (ctx) => {
    const category = ctx.req.param('category') ?? 'censored';
    const query = ctx.req.param('query') ?? '';

    const currentUrl = `/tags${category === 'censored' ? '' : `/${category}`}?${query}`;

    const title = `JavDB${query === '' ? '' : ` - ${query}`} `;

    ctx.set('data', await utils.ProcessItems(ctx, currentUrl, title));
};
