const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = String(ctx.params.id);

    const link = `https://weidian.com/?userid=${id}`;
    const api_link = `https://thor.weidian.com/ares/shop.getItemsInShop/1.0?param={"shopId":"${id}","tabId":3,"sortOrder":"desc","limit":20,"page":1}`;

    const shopresponse = await got.get(link);
    const $ = cheerio.load(shopresponse.data);
    const shopname = $('.shop-name').text();

    const response = await got({
        method: 'get',
        url: api_link,
        headers: {
            Referer: link,
        },
    });
    const goods = response.data.result.shopItems.items;

    const out = goods.map((good) => {
        const item = {
            title: good.itemName,
            description: `价格：${parseInt(good.itemPrice) / 100}<br><img src="${good.itemMainPic}">`,
            link: `https://weidian.com/item.html?itemID=${good.itemId}`,
        };
        return item;
    });

    ctx.state.data = {
        title: `${shopname || id} 商铺上新`,
        link,
        item: out,
    };
};
