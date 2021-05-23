const got = require('@/utils/got');
const { getItem } = require('./util');

const map = {
    xinggan: '性感妹子',
    japan: '日本妹子',
    taiwan: '台湾妹子',
    mm: '清纯妹子',
};

module.exports = async (ctx) => {
    const { category } = ctx.params;

    const url = `https://www.mzitu.com/${category}`;
    const response = await got({
        method: 'get',
        url,
    });
    const items = await getItem(ctx, response.data);

    ctx.state.data = {
        title: `妹子图-${map[category]} `,
        link: url,
        item: items,
    };
};
