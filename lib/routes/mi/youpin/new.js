const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'post',
        url: 'https://m.xiaomiyoupin.com/homepage/main/v1005',
    });

    const items = response.data.data.homepage.floors
        .filter((floor) => floor.module_key === 'product_hot')[0]
        .data.items.map((item) => {
            const i = item.item;
            return {
                title: i.name,
                description: `<img src="${i.pic_url}"><br>${i.summary}<br>价格：${i.market_price / 100}元`,
                link: i.jump_url,
            };
        });

    ctx.state.data = {
        title: '小米有品每日上新',
        link: 'https://m.xiaomiyoupin.com/w/newproduct?pageid=1605',
        description: '小米有品每日上新',
        item: items,
    };
};
