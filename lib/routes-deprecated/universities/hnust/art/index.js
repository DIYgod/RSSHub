const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const base = 'https://art.hnust.edu.cn/ggtz/';
    const link = base + 'index.htm';
    const response = await got(link);
    const $ = cheerio.load(response.data);
    const list = $('.newsList03 li');

    ctx.state.data = {
        title: '湖南科技大学艺术学院通知',
        link,
        description: '湖南科技大学艺术学院通知',
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
