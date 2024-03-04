// @ts-nocheck
const { rootUrl, ProcessItems } = require('./utils');

export default async (ctx) => {
    const tag = ctx.req.param('tag');

    const currentUrl = `${rootUrl}/tag-${tag}/page-1/index.html`;

    ctx.set('data', await ProcessItems(ctx, tag, currentUrl));
};
