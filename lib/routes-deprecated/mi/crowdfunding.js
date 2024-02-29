const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'post',
        url: 'http://api.m.mi.com/v1/microwd/home',
        headers: {
            'Mishop-Client-Id': '180100031055',
            'User-Agent': 'MiShop/4.3.68 (iPhone; iOS 12.0.1; Scale/3.00)',
            'IOS-App-Version': '4.3.68',
            'IOS-Version': 'system=12.0.1&device=iPhone10,3',
        },
    });
    const list = response.data.data.list.items;

    ctx.state.data = {
        title: '小米众筹',
        link: '',
        allowEmpty: true,
        item:
            list &&
            list.map((item) => ({
                title: item.product_name,
                description: `<img src="${item.img_url}"><br>价格：${item.product_price}元`,
            })),
    };
};
