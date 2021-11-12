const got = require('@/utils/got');

module.exports = async (ctx) => {
    const sort = ctx.params.sort || '';
    const response = await got({
        method: 'get',
        url: 'https://home.mi.com/lasagne/page/1605',
    });

    const data = response.data.floors.filter((floor) => floor.floor_id === (sort === '' ? 25912 : 25851));

    const item = data.reduce((acc, item) => {
        if (!item.data) {
            return acc;
        }
        let goodsList = [];

        if (item.data.result) {
            goodsList = item.data.result.list;
        } else {
            goodsList = item.data.tabs[sort].result.list;
        }

        goodsList.forEach((goods) => {
            const item = goods.value.goods;
            const img = item.pic_url;
            acc.push({
                title: item.name,
                description: `<img src="${img}"><br>${item.summary}<br>价格：${item.market_price / 100}元`,
                link: item.jump_url,
                pubDate: new Date(item.first_release_time * 1000).toUTCString(),
            });
        });

        return acc;
    }, []);

    ctx.state.data = {
        title: `小米有品每日上新${sort === '' ? '' : ' - ' + data[0].data.items[sort].rule}`,
        link: 'https://m.xiaomiyoupin.com/w/newproduct?pageid=1605',
        description: '小米有品每日上新',
        item,
    };
};
