const url = require('url');
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.latexstudio.net/articles/';

    const response = await got({
        method: 'get',
        url: rootUrl,
    });
    const $ = cheerio.load(response.data);
    const list = $('div.article-list')
        .find('h3.article-title')
        .slice(0, 20)
        .map((_, item) => {
            item = $(item);
            const a = item.find('a');
            return {
                title: a.text(),
                link: url.resolve(rootUrl, a.attr('href')),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const res = await got({ method: 'get', url: item.link });
                const content = cheerio.load(res.data);
                item.pubDate = new Date(content('div.entry-meta ul li').eq(3).text().replace('发布日期：', '')).toUTCString();
                item.description = content('div.article-text').html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: 'LaTeX 开源小屋',
        link: 'https://www.latexstudio.net/articles/',
        item: items,
    };
};
