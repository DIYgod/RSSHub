const url = require('url');
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const newsUrl = 'https://news.fate-go.jp/';
    const response = await got({
        method: 'get',
        url: newsUrl,
    });
    const $ = cheerio.load(response.data);
    const list = $('ul.list_news li')
        .map((_, item) => {
            item = $(item);
            return {
                title: item.find('p.title').text(),
                link: url.resolve(newsUrl, item.find('a').attr('href')),
                pubDate: new Date(item.find('p.date').text()).toUTCString(),
            };
        })
        .get();

    ctx.state.data = {
        title: 'Fate Grand Order News',
        link: newsUrl,
        item: await Promise.all(
            list.map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    const res = await got({ method: 'get', url: item.link });
                    const content = cheerio.load(res.data);
                    item.description = content('div.article').html();
                    return item;
                })
            )
        ),
    };
};
