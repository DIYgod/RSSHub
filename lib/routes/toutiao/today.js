const got = require('@/utils/got');
const cheerio = require('cheerio');

const baseUrl = 'https://toutiao.io';
module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: baseUrl,
        headers: {
            Host: 'toutiao.io',
        },
        responseType: 'text',
    });
    const $ = cheerio.load(response.data);
    const title = $('#daily').find('.date>span').eq(0).text() + ' ' + $('#daily').find('.date>small').eq(0).text();

    const list = $('.posts>.post', '#daily');
    const article_item = [];
    for (let i = 0; i < list.length; i++) {
        const article_el = $(list[i]).find('.content').eq(0);
        const item = {
            title: article_el.find('a').eq(0).text(),
            link: baseUrl + article_el.find('a').eq(0).attr('href'),
        };
        article_item.push(item);
    }
    ctx.state.data = {
        title: '开发者头条:' + title,
        link: baseUrl,
        item: article_item,
    };
};
