const got = require('@/utils/got');
const cheerio = require('cheerio');

const baseUrl = 'https://toutiao.io';
module.exports = async (ctx) => {
    const id = ctx.params.id;
    const requestUrl = `${baseUrl}/subjects/${id}?f=new`;
    const response = await got({
        method: 'get',
        url: requestUrl,
        headers: {
            Host: 'toutiao.io',
        },
        responseType: 'text',
    });
    const $ = cheerio.load(response.data);
    const image = $('#main').find('.text-center>.subject-cover>img').eq(0).attr('src');
    const title = $('#main').find('.text-center>h3').eq(0).text();
    const description = $('#main').find('.social-share-button').eq(0).attr('data-title');

    const list = $('.posts>.post', '#main');
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
        title: '开发者头条独家号:' + title,
        description: description,
        image: image,
        link: baseUrl,
        item: article_item,
    };
};
