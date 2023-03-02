const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const { getContent } = require('./utils');

const map = new Map([
    ['jstz', { title: '南京理工大学教务处 -- 教师通知', id: '/1216' }],
    ['xstz', { title: '南京理工大学教务处 -- 学生通知', id: '/1217' }],
    ['xw', { title: '南京理工大学教务处 -- 新闻', id: '/1218' }],
    ['xydt', { title: '南京理工大学教务处 -- 学院动态', id: '/1219' }],
]);

const host = 'https://jwc.njust.edu.cn';

module.exports = async (ctx) => {
    const type = ctx.params.type ?? 'xstz';
    const info = map.get(type);
    if (!info) {
        throw 'invalid type';
    }
    const id = info.id;
    const siteUrl = host + id + '/list.htm';

    const html = await getContent(siteUrl, true);
    const $ = cheerio.load(html);
    const list = $('div#wp_news_w3').find('tr');

    ctx.state.data = {
        title: info.title,
        link: siteUrl,
        item:
            list &&
            list
                .map((index, item) => ({
                    title: $(item).find('a').attr('title').trim(),
                    pubDate: timezone(parseDate($(item).find('td[width="14%"]').text(), 'YYYY-MM-DD'), +8),
                    link: $(item).find('a').attr('href'),
                }))
                .get(),
    };
};
