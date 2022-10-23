const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const keyword = ctx.params.keyword;

    const response = await got(`https://search.smzdm.com/`, {
        headers: {
            Referer: `https://search.smzdm.com/?c=home&s=${encodeURI(keyword)}&order=time&v=b`,
        },
        searchParams: {
            c: 'home',
            s: keyword,
            order: 'time',
            v: 'b',
        },
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.feed-row-wide');

    ctx.state.data = {
        title: `${keyword} - 什么值得买`,
        link: `https://search.smzdm.com/?c=home&s=${encodeURI(keyword)}&order=time&v=b`,
        item:
            list &&
            list.toArray().map((item) => {
                item = $(item);
                return {
                    title: `${item.find('.feed-block-title a').eq(0).text().trim()} - ${item.find('.feed-block-title a').eq(1).text().trim()}`,
                    description: `${item.find('.feed-block-descripe').contents().eq(2).text().trim()}<br>${item.find('.feed-block-extras span').text().trim()}<br><img src="http:${item.find('.z-feed-img img').attr('src')}">`,
                    pubDate: timezone(parseDate(item.find('.feed-block-extras').contents().eq(0).text().trim(), ['MM-DD HH:mm', 'HH:mm']), +8),
                    link: item.find('.feed-block-title a').attr('href'),
                };
            }),
    };
};
