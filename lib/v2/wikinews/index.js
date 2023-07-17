const got = require('@/utils/got');
const cheerio = require('cheerio');
const currentURL = 'https://zh.wikinews.org/wiki/Special:%E6%96%B0%E9%97%BB%E8%AE%A2%E9%98%85';
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const resp = await got(currentURL);
    const $ = cheerio.load(resp.data);
    const urls = $('url')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('news\\:title').text(),
                pubDate: parseDate(item.find('news\\:publication_date').text()),
                category: item
                    .find('news\\:keywords')
                    .text()
                    .split(',')
                    .map((item) => item.trim()),
                link: item.find('loc').text(),
            };
        });

    const items = await Promise.all(
        urls.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const resp = await got(item.link);
                const $ = cheerio.load(resp.data);
                item.description = $('#bodyContent').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: '最新新闻 - 维基新闻',
        link: currentURL,
        item: items,
    };
};
