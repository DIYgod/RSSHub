const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const base = 'https://jwc.hnust.edu.cn/gzzd2_20170827120536008171/jwk3_20170827120536008171/';
    const link = base + 'index.htm';
    const response = await got.get({
        url: link,
        https: {
            rejectUnauthorized: false,
        },
    });
    const $ = cheerio.load(response.data);
    const list = $('.articleList ul li');
    ctx.state.data = {
        title: '湖南科技大学教务处通知',
        link,
        description: '湖南科技大学教务处通知',
        image: 'https://i.loli.net/2020/03/24/EAoPzbTsBxeOdjH.jpg',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    const date = item.find('span').text();
                    const title = item.find('a').text();
                    const url = base + item.find('a').attr('href');

                    return {
                        title,
                        description: title,
                        pubDate: new Date(date).toUTCString(),
                        link: url,
                    };
                })
                .get(),
    };
};
