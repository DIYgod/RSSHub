const got = require('@/utils/got');
const cheerio = require('cheerio');
const path = require('path');
const { art } = require('@/utils/render');
const { parseDate } = require('@/utils/parse-date');

const rootUrl = 'https://www.lativ.com.tw';

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const url = `${rootUrl}/Detail/${id}`;
    const response = await got.get(url);
    const $ = cheerio.load(response.data);
    const title = $('#wrap > h1').text();
    const image = $('div.oldPic.show > a:nth-child(1) > img').attr('src');
    const productId = $('div.clearfloat > div.size > div > span').attr('data-value');

    const productInfoUrl = `https://www.lativ.com.tw/Product/GetProductInfo?productId=${productId}`;
    const productInfo = await got.get(productInfoUrl);
    const itemInfo = JSON.parse(productInfo.data.info)[0].ItemList[0];
    const price = itemInfo.Price;
    const time = parseInt(itemInfo.LastEditTime.replace(/[^\d]/g, ''));
    const discount = JSON.parse(productInfo.data.activity).Discount;

    const item = {
        title,
        link: url,
        description: art(path.join(__dirname, 'templates/detail.art'), {
            price,
            discount,
            image,
            title,
        }),
        pubDate: parseDate(time),
    };

    ctx.state.data = {
        title: `lativ-${title}`,
        link: url,
        item: [item],
    };
};
