const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

module.exports = async (ctx) => {
    const currentUrl = 'http://news.creaders.net/headline/';

    const response = await got.get(currentUrl, {
        responseType: 'buffer',
    });

    const $ = cheerio.load(iconv.decode(response.data, 'gbk'));
    const list = $('ul.newslist li')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            const a = item.find('a').eq(1);
            return {
                title: a.text(),
                link: a.attr('href'),
                pubDate: new Date(item.find('time').text() + ' GMT+8').toUTCString(),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const res = await got.get(item.link, {
                    responseType: 'buffer',
                });
                const content = cheerio.load(iconv.decode(res.data, 'gbk'));

                item.description = content('#newsContent').html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: '万维读者 - 焦点新闻',
        link: currentUrl,
        item: items,
    };
};
