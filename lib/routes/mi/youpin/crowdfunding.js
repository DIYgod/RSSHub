const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://home.mi.com/lasagne/page/5',
    });

    const data = response.data.floors.filter((floor) => floor.floor_id === 99 || floor.floor_id === 100);
    const item = data.reduce((acc, item) => {
        if (!item.data) {
            return acc;
        }
        let goodsList = [];

        if (item.data.result) {
            goodsList = item.data.result.goods_list;
        }

        goodsList.forEach((goods) => {
            const img = goods.pic_url;
            acc.push({
                title: goods.name,
                description: `<img src="${img}"><br>${goods.summary}<br>价格：${goods.market_price / 100}元`,
                link: goods.jump_url,
                pubDate: new Date(goods.first_release_time * 1000).toUTCString(),
            });
        });

        return acc;
    }, []);

    ctx.state.data = {
        title: '小米有品众筹',
        link: 'https://m.xiaomiyoupin.com/w/crowdfunding?pageid=5',
        description: '小米有品众筹',
        item,
    };
};
