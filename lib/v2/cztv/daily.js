const cheerio = require('cheerio');
const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const url = 'http://www.cztv.com/videos/zjxwlb';

    const { data: res } = await got(url);
    const $ = cheerio.load(res);
    const list = $('#videolistss li')
        .toArray()
        .map((item) => {
            item = $(item);
            const title = item.find('span.t1').text();
            const link = item.find('input[name=data-url]').attr('value');

            return {
                title,
                link,
                pubDate: timezone(parseDate(item.find('span.t2').text() + ' 16:30', 'YYYY-MM-DD hh:mm'), +8),
            };
        });

    const out = {
        title: list[0].title,
        link: list[0].link,
        pubDate: list[0].pubDate,
        description: list
            .slice(1)
            .map((item) => `<a href="${item.link}">${item.title}</a>`)
            .join('<br>'),
    };

    ctx.state.data = {
        title: '浙江新闻联播-每日合集',
        link: url,
        item: [out],
    };
};
