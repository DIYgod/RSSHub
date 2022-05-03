const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const { getContent } = require('./utils');

const map = new Map([
    ['tzgg', { title: '南京理工大学电子工程与光电技术学院 -- 通知公告', id: '/1920' }],
    ['xwdt', { title: '南京理工大学电子工程与光电技术学院 -- 新闻动态', id: '/1919' }],
]);

const host = 'https://eoe.njust.edu.cn';

module.exports = async (ctx) => {
    const type = ctx.params.type ?? 'tzgg';
    const info = map.get(type);
    if (!info) {
        throw 'invalid type';
    }
    const id = info.id;
    const siteUrl = host + id + '/list.htm';

    const html = await getContent(siteUrl, true);
    const $ = cheerio.load(html);
    const list = $('ul.news_ul').find('li');

    ctx.state.data = {
        title: info.title,
        link: siteUrl,
        item:
            list &&
            list
                .map((index, item) => ({
                    title: $(item).find('a').attr('title').trim(),
                    pubDate: timezone(parseDate($(item).find('span').text(), 'YYYY-MM-DD'), +8),
                    link: $(item).find('a').attr('href'),
                }))
                .get(),
    };
};
