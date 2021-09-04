const got = require('@/utils/got');
const cheerio = require('cheerio');
const JSON5 = require('json5');

module.exports = async (ctx) => {
    const category = ctx.params.category;
    const url = 'http://www.wineyun.com/' + category;

    const response = await got({
        method: 'get',
        url: url,
        headers: {
            Referer: 'http://www.wineyun.com',
        },
    });

    const $ = cheerio.load(response.data);

    const description = $('head title');

    const regex = /new Vue\({\s+el: '#wy_app',[\s\S]+data: {[\s\S]+list: (.+),/gm;
    const match = regex.exec(response.data);
    const list = JSON5.parse(match[1]);
    const resultItem = list.map((item) => ({
        title: `￥${item.price} ${item.goodsname}`,
        link: `http://www.wineyun.com/group/${item.id}`,
        description: `<img src ="${item.Image}"><br>${item.summary}`,
    }));

    ctx.state.data = {
        title: '酒云网-最新商品',
        link: url,
        item: resultItem,
        description: description,
    };
};
