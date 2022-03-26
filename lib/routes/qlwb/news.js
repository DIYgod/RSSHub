const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const newsUrl = 'http://news.qlwb.com.cn/news/';
    const response = await got({
        method: 'get',
        url: newsUrl,
    });
    const $ = cheerio.load(response.data);
    const list = $('ul.list.list-point li a')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: item.attr('href'),
            };
        })
        .get();

    ctx.state.data = {
        title: $('title').text(),
        link: newsUrl,
        item: await Promise.all(
            list.map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    const res = await got({ method: 'get', url: item.link });
                    const content = cheerio.load(res.data);
                    item.description = content('div.article-content').html();
                    item.pubDate = new Date(content('span.date').text() + ' GMT+8').toUTCString();
                    return item;
                })
            )
        ),
    };
};
