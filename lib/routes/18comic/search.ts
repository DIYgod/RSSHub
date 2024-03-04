// @ts-nocheck
const { defaultDomain, getRootUrl, ProcessItems } = require('./utils');

export default async (ctx) => {
    const option = ctx.req.param('option') ?? 'photos';
    const category = ctx.req.param('category') ?? 'all';
    const keyword = ctx.req.param('keyword') ?? '';
    const time = ctx.req.param('time') ?? 'a';
    const order = ctx.req.param('order') ?? 'mr';
    const { domain = defaultDomain } = ctx.req.query();
    const rootUrl = getRootUrl(domain);

    const currentUrl = `${rootUrl}/search/${option}${category === 'all' ? '' : `/${category}`}${keyword ? `?search_query=${keyword}` : '?'}${time === 'a' ? '' : `&t=${time}`}${order === 'mr' ? '' : `&o=${order}`}`;

    ctx.set('data', await ProcessItems(ctx, currentUrl, rootUrl));
};
