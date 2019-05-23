const axios = require('@/utils/axios');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await axios({
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
            description: `${item.name}<br>${item.brief}<br>￥${item.price}<br><img referrerpolicy="no-referrer" src="https:${item.itemsImg}">`,
            link: `https://mall.bilibili.com/detail.html?itemsId=${item.itemsId}`,
        })),
    };
};
