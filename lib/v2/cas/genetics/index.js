const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const baseUrl = 'https://genetics.cas.cn';

module.exports = async (ctx) => {
    const { path } = ctx.params;

    const currentUrl = `${baseUrl}/${path}/`;

    const { data: response } = await got(currentUrl);
    const $ = cheerio.load(response);

    let items;

    if (path.substring(0, 3) === 'edu') {
        items = $('li.box-s.h16')
            .toArray()
            .map((item) => {
                item = $(item);
                const a = item.find('a').first();
                const date = item.find('.box-date').first();
                return {
                    title: a.text(),
                    link: new URL(a.attr('href'), currentUrl).href,
                    pubDate: parseDate(date.text(), 'YYYY-MM-DD'),
                };
            });
    } else if (path.substring(0, 4) === 'dqyd') {
        items = $('div.list-tab ul li')
            .toArray()
            .map((item) => {
                item = $(item);
                const a = item.find('a').first();
                const date = item.find('.right').first();
                return {
                    title: a.text(),
                    link: new URL(a.attr('href'), currentUrl).href,
                    pubDate: parseDate(date.text(), 'YYYY-MM-DD'),
                };
            });
    } else {
        items = $('li.row.no-gutters.py-1')
            .toArray()
            .map((item) => {
                item = $(item);
                const a = item.find('a').first();
                const date = item.find('.col-news-date').first();
                return {
                    title: a.text(),
                    link: new URL(a.attr('href'), currentUrl).href,
                    pubDate: parseDate(date.text(), 'YYYY.MM.DD'),
                };
            });
    }

    ctx.state.data = {
        title: $('head title').text(),
        link: currentUrl,
        item: items,
    };
};
