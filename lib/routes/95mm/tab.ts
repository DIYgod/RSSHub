// @ts-nocheck
const { rootUrl, ProcessItems } = require('./utils');

export default async (ctx) => {
    const tab = ctx.req.param('tab') ?? '最新';

    const currentUrl = `${rootUrl}/home-ajax/index.html?tabcid=${tab}&page=1`;

    ctx.set('data', await ProcessItems(ctx, tab, currentUrl));
};
