const got = require('@/utils/got');
const cheerio = require('cheerio');
const rootUrl = 'https://www.tenlonstudio.com';

module.exports = async (ctx) => {
    const { category = 'software' } = ctx.params;

    const url = `${rootUrl}/${category}`;

    const response = await got(url);
    const $ = cheerio.load(response.data);
    const list = $('div.post-info')
        .map((_, item) => ({
            title: $(item).find('h2 > a').text(),
            link: new URL($(item).find('h2 > a').attr('href'), rootUrl).href,
            pubDate: '',
            category: $(item).find('div.post-list-meta-box > div > a').text(),
            description: $(item).find('div.post-excerpt').text(),
        }))
        .get();

    ctx.state.data = {
        title: '腾龙工作室 - 最近更新',
        link: url,
        item: list,
    };
};
