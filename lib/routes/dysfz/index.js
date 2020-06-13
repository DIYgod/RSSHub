const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const responseData = (await got.get(`http://www.wuhaozhan.net/movie/list/?p=1`)).data;
    const $ = cheerio.load(responseData);
    const list = $('.pure-u-16-24').get();
    const data = {
        title: '电影首发站',
        link: 'http://www.wuhaozhan.net/movie/list/',
        description: '高清电影',
        item: list.map((item) => ({
            title: $(item).find('h2').text(),
            description: $(item).find('.l-des').text(),
            pubDate: new Date($(item).find('.dt').text()).toUTCString(),
            link: $(item).find('.l-a').attr('href'),
        })),
    };
    ctx.state.data = data;
};
