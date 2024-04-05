const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://coolbuy.com/api/v1.4/product_preview/?order_by=-id&limit=20&page=0&offset=0',
    });

    const data = response.data.objects;

    ctx.state.data = {
        title: '玩物志-最新',
        link: 'https://coolbuy.com/',
        description: '值得买的未来生活',
        item: data.map((item) => ({
            title: item.title,
            link: item.visit_url,
            description: `
        <img src="${item.cover_image}"><br>
        <img src="${item.display_image}"><br><br>
        ${item.summary}<br>
        价格: ${item.price}元
      `,
        })),
    };
};
