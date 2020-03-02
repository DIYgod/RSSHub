const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = 'http://chuiniu.duanshu.com/#/list/column';

    let response = await got({
        method: 'get',
        url: 'http://api.duanshu.com/fairy/api/v1/shop/identifier/',
        headers: {
            Origin: url,
            Referer: url,
        },
    });
    const shop_id = response.data.shop_id;

    response = await got({
        method: 'get',
        url: `http://api.duanshu.com/h5/content/column/lists?page=1&count=12&shop_id=${shop_id}`,
        headers: {
            Referer: url,
        },
    });
    const list = response.data.response.data;

    const out = list.map((item) => ({
        link: `http://chuiniu.duanshu.com/#/brief/column/${item.column_id}`,
        title: item.title,
        description: item.brief,
    }));

    ctx.state.data = {
        title: '吹牛部落专栏列表',
        link: url,
        item: out,
    };
};
