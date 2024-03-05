// @ts-nocheck
const { rootUrl, getList, getItems } = require('./utils');

export default async (ctx) => {
    const url = `${rootUrl}/reviews/essay`;

    const list = await getList(url);
    const items = await getItems(ctx, list);

    ctx.set('data', {
        title: 'Essays',
        link: url,
        item: items,
    });
};
