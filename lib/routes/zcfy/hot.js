const got = require('@/utils/got');
const cheerio = require('cheerio');

const baseUrl = 'https://www.zcfy.cc';
module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: baseUrl + '/article/hot',
        headers: {
            Host: 'www.zcfy.cc',
            Referer: 'https://www.zcfy.cc/',
        },
    });
    const $ = cheerio.load(response.data);

    const list = $('#main_list > div');
    const article_list = [];
    for (let i = 0; i < list.length; i++) {
        const title = $(list[i]).find('h4').text();
        const description = $(list[i]).find('a.uk-link-reset.uk-flex-1.uk-margin-small-right > p').text();
        const link = baseUrl + $(list[i]).find('div.uk-width-expand > a').attr('href');
        const item = {
            title: title,
            description: description,
            link: link,
        };
        article_list.push(item);
    }
    ctx.state.data = {
        title: '众成翻译-热门文章',
        link: baseUrl + '/article/hot',
        item: article_list,
    };
};
