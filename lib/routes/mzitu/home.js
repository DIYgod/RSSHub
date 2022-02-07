const got = require('@/utils/got');
const { getItem } = require('./util');

module.exports = async (ctx) => {
    const { type = '' } = ctx.params;
    let url;
    let title = '妹子图';

    if (type === 'hot') {
        title += '-最热';
        url = 'https://www.mzitu.com/hot/';
    } else if (type === 'best') {
        title += '-推荐';
        url = 'https://www.mzitu.com/best/';
    } else {
        title += '-最新';
        url = 'https://www.mzitu.com/';
    }

    const response = await got({
        method: 'get',
        url,
    });

    const items = await getItem(ctx, response.data);

    ctx.state.data = {
        title,
        link: url,
        item: items,
    };
};
