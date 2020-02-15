const got = require('@/utils/got');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await got({
        method: 'get',
        url: `https://mall.bilibili.com/mall-c/search/category?keyword=&filters=&priceFlow=&priceCeil=&sortType=recommend&sortOrder=&pageIndex=1&state=&type=ip&id=${id}`,
        headers: {
            Referer: `https://mall.bilibili.com/list.html?ip=${id}`,
        },
    });

    const data = response.data.data;

    ctx.state.data = {
        title: `${data.pageTitle} - 会员购`,
        link: `https://mall.bilibili.com/list.html?ip=${id}`,
        item: data.list.map((item) => ({
            title: item.name,
            description: `${item.name}<br>${item.brief}<br>￥${item.price}<br><img src="${item.itemsImg}">`,
            link: `https://mall.bilibili.com/detail.html?itemsId=${item.itemsId}`,
        })),
    };
};
