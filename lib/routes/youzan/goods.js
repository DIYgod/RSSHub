const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = String(ctx.params.id);

    const link = `https://h5.youzan.com/wscshop/showcase/homepage?kdt_id=${id}`;
    const api_link = `https://h5.youzan.com/wscshop/showcase/goods/allGoods.json?pageSize=20&page=1&offlineId=0&order=&order_by=createdTime&kdt_id=${id}`;

    const shopresponse = await got.get(link);
    const $ = cheerio.load(shopresponse.data);
    const shopname = $('meta[name="keywords"]').attr('content');

    const response = await got({
        method: 'get',
        url: api_link,
        headers: {
            Referer: link,
        },
    });
    const goods = response.data.data.list;

    const out = goods.map((good) => {
        const item = {
            title: good.title,
            description: `价格：${good.price}<br><img src="${good.image_url}">`,
            link: `https://detail.youzan.com/show/goods?alias=${good.alias}`,
        };
        return item;
    });

    ctx.state.data = {
        title: `${shopname || id} 商铺上新`,
        link,
        item: out,
    };
};
