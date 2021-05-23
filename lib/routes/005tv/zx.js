const got = require('@/utils/got');
const host = 'http://www.005.tv/zx';
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got(host);
    const data = response.body;
    const $ = cheerio.load(data);
    const list = $('div.article-list  li');
    ctx.state.data = {
        title: $('head > title').text(),
        link: host,
        description: '二次元资讯',
        item: list
            .map((index, item) => ({
                title: $(item).find('h3 > a').text().trim(),
                description: `<img src="${$(item).find('img').attr('src')}" /> <br>
                    ${$(item).find('div.p-row').text()}`,
                link: $(item).find('h3 > a').attr('href'),
                pubDate: new Date($(item).find('span.fr.time').text().trim().substr(0, 4), $(item).find('span.fr.time').text().trim().substr(5, 2), $(item).find('span.fr.time').text().trim().substr(8, 4)).toUTCString(),
            }))
            .get(),
    };
};
