const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://www.yomiuri.co.jp/news/',
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('ul.news-top-upper-content-topics-content-list.p-list').find('li.p-list-item');
    let itemPicUrl;

    ctx.state.data = {
        title: '读卖新闻-综合要闻',
        link: 'https://www.yomiuri.co.jp/news/',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    itemPicUrl = item.find('a').attr('href');
                    return {
                        title: item.find('a').text(),
                        description: `内容：(需要获取全文)<br><img src="${itemPicUrl}">`,
                        link: item.find('meta').attr('content'),
                    };
                })
                .get(),
    };
};
