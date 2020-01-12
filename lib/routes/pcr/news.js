const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://priconne-redive.jp/news/',
    });
    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('.article_box');
    let itemPicUrl;
    ctx.state.data = {
        title: '公主链接日服-新闻',
        link: 'https://priconne-redive.jp/news/',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    itemPicUrl = item.find('img.attachment-news-thumbnail').attr('src');
                    return {
                        title: item.find('h4').text(),
                        description: `${item.find('.description p').text()}<br><img src="${itemPicUrl}">`,
                        link: item
                            .find('a')
                            .first()
                            .attr('href'),
                        pubDate: item.find('.time').text(),
                    };
                })
                .get(),
    };
};
