const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

const baseTitle = '南京信息工程大学图书馆通知';
const baseUrl = 'http://lib.nuist.edu.cn';

module.exports = async (ctx) => {
    const link = baseUrl + '/list.php?fid=7';

    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const list = $('.lines_chen').slice(0, 3);

    ctx.state.data = {
        title: baseTitle,
        link: link,
        item: list
            .map((_, item) => {
                item = $(item);

                return {
                    title: item.children('a').first().text(),
                    description: item.find('.neirong1').text(),
                    category: '通知',
                    pubDate: new Date(item.children('p').children('span').first().text().replace('发布时间：', '')).toUTCString(),
                    link: url.resolve(baseUrl, item.children('a').first().attr('href')),
                };
            })
            .get(),
    };
};
