const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'http://www.yidoutang.com/guide.html';
    const response = await got(url);
    const $ = cheerio.load(response.data);

    const items = $('.main .guide-items > .guide-item')
        .map((_, ele) => {
            const $item = cheerio.load(ele);
            const titleNode = $item('.title > a').first();
            const title = titleNode.text();
            const link = titleNode.attr('href');
            const thumbnail = $item('a > img').first().attr('src');

            const infoNode = $item('.info');
            const desc = infoNode.find('.desc').text();
            const author = infoNode.find('.user a').text();
            return {
                title,
                link,
                description: [`简介: ${desc}`, `<img src="${thumbnail}"/>`].join('<br/>'),
                author,
            };
        })
        .get();
    ctx.state.data = {
        title: '一兜糖 - 文章',
        description: '一兜糖 - 文章',
        link: url,
        item: items,
    };
};
