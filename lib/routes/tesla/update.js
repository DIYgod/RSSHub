const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://www.notateslaapp.com/zh-cn',
        headers: {
            Referer: 'https://www.notateslaapp.com/zh-cn',
        },
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('article[id]');
    const targetDate = $('.date')
        .text()
        .replace(/[\u4e00-\u9fa5]/g, '-')
        .replace(/\s/g, '')
        .match(/(\d{4}-\d{2}-\d{2})/);

    ctx.state.data = {
        title: '特斯拉系统更新',
        link: 'https://www.notateslaapp.com/zh-cn',
        description: '特斯拉系统更新 - 最新发布',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('.container h1').text(),
                        // title: targetDate[0],
                        description: item.find('.notes-container').text() + '<img src="' + item.find('img').attr('src') + '">',
                        pubDate: targetDate[0],
                        link: 'https://www.notateslaapp.com' + item.find('.selector-container-notes a').attr('href'),
                    };
                })
                .get(),
    };
};
