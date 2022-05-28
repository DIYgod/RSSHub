const { rootUrl, getList, getItems } = require('./utils');

module.exports = async (ctx) => {
    const url = `${rootUrl}/reviews/essay`;

    const list = await getList(url);
    const items = await getItems(ctx, list);

    ctx.state.data = {
        title: 'Essays',
        link: url,
        item: items,
    };
};
