const axios = require('../../../utils/axios');

module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: 'https://home.mi.com/lasagne/page/4',
    });

    const data = response.data.floors;

    ctx.state.data = {
        title: '有品-每日上新',
        link: 'https://home.mi.com/newproduct?pageid=4',
        description: '有品-每日上新',
        item: data.reduce((acc, item) => {
            let goodsList = [];

            if (item.data.result) {
                goodsList = item.data.result.goods_list;
            } else if (item.data.tabs) {
                goodsList = item.data.tabs.reduce((acc, tab) => {
                    if (tab.result) {
                        tab.result.goods_list.forEach((goods) => goods);
                    }

                    return acc;
                }, []);
            }

            goodsList.forEach((goods) => {
                const img = goods.pic_url;
                acc.push({
                    title: goods.name,
                    description: `<img referrerpolicy="no-referrer" src="${img}"><br>${goods.summary}<br>价格：${goods.market_price / 100}元`,
                    link: goods.jump_url,
                    pubDate: new Date(goods.first_release_time * 1000).toUTCString(),
                });
            });

            return acc;
        }, []),
    };
};
