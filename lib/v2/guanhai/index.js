const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const { data: response } = await got('https://www.guanhai.com.cn');
    const $ = cheerio.load(response);

    const imgBox = $('.img-box');
    const recommand = {
        title: imgBox.find('a').first().attr('title'),
        link: imgBox.find('a').first().attr('href'),
        pubDate: timezone(parseDate(imgBox.find('time').text()), 8),
    };
    const list = $('.pic-summary .title')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').attr('title'),
                link: item.find('a').attr('href'),
                pubDate: timezone(parseDate(item.find('time').text()), 8),
            };
        })
        .concat(recommand);

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);
                item.author = $('.source').text();
                item.description = $('.article-content').html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('head title').text(),
        description: $('head meta[name=description]').text(),
        image: 'https://www.guanhai.com.cn/favicon.ico',
        link: 'https://www.guanhai.com.cn',
        item: items,
    };
};
