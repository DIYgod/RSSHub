const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'http://www.ccin.com.cn';
    const { category } = ctx.params;

    const response = await got.get(`${url}/c/${category ? category : 'int_main'}`);
    const $ = cheerio.load(response.data);

    const site = $('head > title').text();
    const list = $('.news-list .news-box').get();

    const items = list.map((i) => {
        const item = $(i);

        const title = item.find('h2').text();
        const content = item.find('p').text();
        const href = item.find('a').attr('href');

        return {
            title,
            content,
            link: `${url}${href}`,
        };
    });

    ctx.state.data = {
        title: site,
        link: 'http://www.ccin.com.cn/',
        item: items,
    };
};
