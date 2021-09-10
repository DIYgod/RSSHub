const got = require('@/utils/got');
const cheerio = require('cheerio');

const baseUrl = 'https://www.zcfy.cc';
module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: baseUrl,
        headers: {
            Host: 'www.zcfy.cc',
        },
    });
    const $ = cheerio.load(response.data);

    const list = $('#main_list > div');
    const article_list = [];
    for (let i = 0; i < list.length; i++) {
        const title = $(list[i]).find('h4').text();
        const pageviews = $(list[i]).find('div.uk-card-header.uk-padding-small.uk-padding-remove-horizontal > div > p').text();
        const description = $(list[i]).find('a.uk-link-reset > p').text();
        const link = baseUrl + $(list[i]).find('div.uk-width-expand > a').attr('href');
        const item = {
            title,
            description: `浏览量：${pageviews}<br>描述：${description}`,
            link,
        };
        article_list.push(item);
    }
    ctx.state.data = {
        title: '众成翻译-首页',
        link: baseUrl,
        item: article_list,
    };
};
