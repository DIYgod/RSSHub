const got = require('@/utils/got');

const type_names = {
    0: '全部',
    109: '手机',
    110: '平板',
    111: '电脑',
    112: '生活',
    113: '相机',
    114: '影音',
    115: '外设',
    116: '公告',
};

module.exports = async (ctx) => {
    const typeId = ctx.params.typeId ? ctx.params.typeId : '0';

    const url = 'https://www.dgtle.com/sale';

    const response = await got({
        method: 'get',
        url: `https://www.dgtle.com/sale/getList/${typeId}?page=1&last_id=0`,
        headers: {
            Referer: url,
        },
    });

    const type_name = type_names[typeId] ? type_names[typeId] : typeId;
    const list = response.data.data.dataList;

    ctx.state.data = {
        title: `数字尾巴 - 闲置 - ${type_name}`,
        link: url,
        item: list.map((item) => ({
            title: item.title,
            author: item.user.username,
            description: `<p>价格: ¥${item.price}</p><p>地址: ${item.address}</p><p>${item.content}</p><img src="${item.cover}" style="max-width: 100%;"/>`,
            pubDate: new Date(item.created_at * 1000),
            link: `https://www.dgtle.com/sale-${item.id}-1.html`,
        })),
    };
};
