const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://www.notateslaapp.com/software-updates/history/',
        headers: {
            Referer: 'https://www.notateslaapp.com/software-updates/history/',
        },
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('article[id]');

    ctx.state.data = {
        title: '特斯拉系统更新',
        link: 'https://www.notateslaapp.com/software-updates/history/',
        description: '特斯拉系统更新 - 最新发布',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('.container h1').text(),
                        description: item.find('.notes-container').text(),
                        pubDate: null,
                        link: item.find('.notes-container > .button-container > a').attr('href'),
                    };
                })
                .get(),
    };
};
