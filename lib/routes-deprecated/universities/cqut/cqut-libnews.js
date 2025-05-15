const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://libnews.cqut.edu.cn/',
    });

    const data = response.data;

    const $ = cheerio.load(data); // 使用 cheerio 加载返回的 HTML
    const list = $('#infoList').find('div');

    ctx.state.data = {
        title: '重庆理工大学中山图书馆资讯',
        link: 'https://libnews.cqut.edu.cn',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('a').text().trim(),
                        description: item.find('a').text().trim(),
                        link: item.find('a').attr('href'),
                        pubDate: new Date(item.find('span').text().trim().slice(1, -1)).toUTCString(),
                    };
                })
                .get(),
    };
};
