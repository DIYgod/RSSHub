const { rootUrl, getList, getItems } = require('./utils');

module.exports = async (ctx) => {
    const url = `${rootUrl}/reviews/exhibition`;

    const list = await getList(url);
    const items = await getItems(ctx, list);

    ctx.state.data = {
        title: 'Exhibition Reviews',
        link: url,
        item: items,
    };
};
