const url = require('url');
const got = require('@/utils/got');
const cheerio = require('cheerio');
const date = require('@/utils/date');

module.exports = async (ctx) => {
    const rootUrl = `https://exp.newsmth.net`;
    const currentUrl = `${rootUrl}/account/${ctx.params.id}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const $ = cheerio.load(response.data);

    const list = $('ul.article-list li')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            const a = item.find('a.article-subject');
            const pubDate = date(item.find('div.article-time').text());

            item.find('div.article-time').remove();

            return {
                title: a.text(),
                link: url.resolve(rootUrl, a.attr('href')),
                description: item.find('div.article-main').html(),
                pubDate: pubDate,
            };
        })
        .get();

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: list,
    };
};
